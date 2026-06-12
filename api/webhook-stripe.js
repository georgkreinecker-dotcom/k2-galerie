/**
 * Vercel Serverless: Stripe Webhook – Zahlung erfolgreich.
 * Stripe ruft diese URL auf (im Dashboard konfigurieren). Raw-Body für Signaturprüfung nötig.
 * **Exakte Production-URL:** `getStripeWebhookUrlProduction()` in `api/stripeLicenceChainConstants.js`.
 *
 * Umgebungsvariablen: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * Idempotent: gleiche checkout.session mehrfach oder halbfertiger erster Lauf → keine Doppel-Lizenz,
 * fehlende Zahlungszeile wird bei Retry nachgetragen.
 */
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { rowsFromCheckoutSession } from './stripeWebhookLicenceShared.js'
import { persistLicenceFromCheckoutSession } from './persistLicenceFromCheckoutSession.js'
import {
  buildRenewalGutschriftInsert,
  buildRenewalPaymentRow,
  isSubscriptionRenewalInvoice,
} from './stripeInvoiceRenewalShared.js'

/** Raw-Body aus Request-Stream lesen (für Stripe-Signaturprüfung erforderlich). */
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function resolveBaseUrl() {
  return process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.VITE_APP_URL || 'https://k2-galerie.vercel.app'
}

// Hinweis: Für Stripe-Signaturprüfung muss der Request-Body unparsed sein.
// Unter Vercel (api/*.js) wird der Body oft als Stream übergeben; getRawBody liest ihn.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const secret = process.env.STRIPE_SECRET_KEY
  if (!webhookSecret || !secret) {
    console.error('webhook-stripe: STRIPE_WEBHOOK_SECRET oder STRIPE_SECRET_KEY fehlt')
    return res.status(500).end()
  }

  let rawBody
  try {
    rawBody = await getRawBody(req)
  } catch (err) {
    console.error('webhook-stripe: Raw-Body lesen fehlgeschlagen', err)
    return res.status(400).end()
  }

  let event
  try {
    event = Stripe.webhooks.constructEvent(rawBody, req.headers['stripe-signature'], webhookSecret)
  } catch (err) {
    console.error('webhook-stripe: Signatur ungültig', err?.message)
    return res.status(400).send(`Webhook-Signatur fehlgeschlagen: ${err?.message}`)
  }

  // Kündigung: Abo gelöscht → Mandanten-Daten löschen (Blob)
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object
    const tenantId = (subscription?.metadata?.tenantId || '').trim().toLowerCase()
    if (tenantId && tenantId !== 'k2') {
      const delSecret = process.env.TENANT_DELETE_SECRET
      const baseUrl = resolveBaseUrl()
      if (delSecret && baseUrl) {
        try {
          const delRes = await fetch(`${baseUrl}/api/delete-tenant-data`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tenantId, secret: delSecret }),
          })
          if (delRes.ok) {
            console.log('webhook-stripe: Mandanten-Daten gelöscht nach subscription.deleted', tenantId)
          } else {
            const data = await delRes.json().catch(() => ({}))
            console.warn('webhook-stripe: delete-tenant-data Fehler', delRes.status, data)
          }
        } catch (err) {
          console.error('webhook-stripe: delete-tenant-data Aufruf fehlgeschlagen', err?.message || err)
        }
      }
    }
    return res.status(200).json({ received: true })
  }

  // Abo-Verlängerung (Monat/Jahr): Zahlung in payments + ggf. Empfehler-Gutschrift
  if (event.type === 'invoice.paid') {
    const invoice = event.data.object
    if (!isSubscriptionRenewalInvoice(invoice)) {
      return res.status(200).json({ received: true })
    }

    const subRaw = invoice.subscription
    let subscriptionId = ''
    if (typeof subRaw === 'string') subscriptionId = subRaw.trim()
    else if (subRaw && typeof subRaw === 'object' && typeof subRaw.id === 'string') {
      subscriptionId = subRaw.id.trim()
    }
    if (!subscriptionId) {
      console.warn('webhook-stripe: invoice.paid renewal ohne subscription', invoice?.id)
      return res.status(200).json({ received: true })
    }

    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('webhook-stripe: invoice.paid SUPABASE_URL oder SUPABASE_SERVICE_ROLE_KEY fehlt')
      return res.status(500).end()
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const invoiceId = invoice.id

    try {
      const { data: existingPay } = await supabase
        .from('payments')
        .select('id')
        .eq('stripe_session_id', invoiceId)
        .maybeSingle()

      if (existingPay?.id) {
        console.log('webhook-stripe: renewal invoice already recorded', invoiceId)
        return res.status(200).json({ received: true, duplicate: true })
      }

      const { data: licence, error: errLic } = await supabase
        .from('licences')
        .select('id, empfehler_id')
        .eq('stripe_subscription_id', subscriptionId)
        .maybeSingle()

      if (errLic) {
        console.error('webhook-stripe: licence lookup renewal', errLic)
        return res.status(500).end()
      }
      if (!licence?.id) {
        console.warn('webhook-stripe: keine Lizenz für subscription', subscriptionId)
        return res.status(200).json({ received: true, noLicence: true })
      }

      const payRow = buildRenewalPaymentRow(invoice, licence)
      const { data: payment, error: errPayment } = await supabase
        .from('payments')
        .insert(payRow)
        .select('id')
        .single()

      if (errPayment) {
        if (errPayment.code === '23505') {
          console.log('webhook-stripe: renewal payment race', invoiceId)
          return res.status(200).json({ received: true, duplicate: true })
        }
        console.error('webhook-stripe: payments renewal insert failed', errPayment)
        return res.status(500).end()
      }

      const gut = buildRenewalGutschriftInsert(invoice, licence, payment.id)
      if (gut) {
        const { error: errG } = await supabase.from('empfehler_gutschriften').insert(gut)
        if (errG) console.error('webhook-stripe: empfehler_gutschriften renewal failed', errG)
      }

      console.log('webhook-stripe: invoice.paid renewal', {
        invoiceId,
        subscriptionId,
        licenceId: licence.id,
        paymentId: payment.id,
      })
    } catch (err) {
      console.error('webhook-stripe: invoice.paid', err)
      return res.status(500).end()
    }

    return res.status(200).json({ received: true })
  }

  if (event.type !== 'checkout.session.completed') {
    return res.status(200).json({ received: true })
  }

  const sessionFromEvent = event.data.object
  const baseUrl = resolveBaseUrl()

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('webhook-stripe: SUPABASE_URL oder SUPABASE_SERVICE_ROLE_KEY fehlt')
    return res.status(500).end()
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const sessionId = sessionFromEvent.id

  /** Event-Payload oft ohne expandierten payment_intent – einmal laden für Metadaten (tenantId auf PI). */
  let session = sessionFromEvent
  try {
    const stripe = new Stripe(secret)
    const expanded = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'line_items', 'payment_intent'],
    })
    if (expanded?.id) session = expanded
  } catch (e) {
    console.warn('webhook-stripe: Session-Retrieve expand – nutze Event-Payload', e?.message || e)
  }

  const rowPack = rowsFromCheckoutSession(session, baseUrl)

  const persist = await persistLicenceFromCheckoutSession(supabase, session, baseUrl)
  if (!persist.ok) {
    console.error('webhook-stripe: persist failed', persist.error, sessionId)
    return res.status(500).end()
  }

  if (persist.duplicate) {
    console.log('webhook-stripe: session already processed', sessionId)
    return res.status(200).json({ received: true, duplicate: true })
  }
  if (persist.catchUp) {
    console.log('webhook-stripe: payment catch-up', { sessionId, licenceId: persist.licenceId })
    return res.status(200).json({ received: true, catchUp: true })
  }

  console.log('Stripe webhook: checkout.session.completed', {
    sessionId,
    licenceId: persist.licenceId,
    licenceType: rowPack.licenceType,
    customerEmail: rowPack.customerEmail,
    gutschriftCents: rowPack.gutschriftCents,
  })

  return res.status(200).json({ received: true })
}
