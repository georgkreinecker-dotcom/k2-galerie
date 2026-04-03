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

  if (event.type !== 'checkout.session.completed') {
    return res.status(200).json({ received: true })
  }

  const session = event.data.object
  const baseUrl = resolveBaseUrl()

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('webhook-stripe: SUPABASE_URL oder SUPABASE_SERVICE_ROLE_KEY fehlt')
    return res.status(500).end()
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const sessionId = session.id

  const rowPack = rowsFromCheckoutSession(session, baseUrl)

  try {
    const { data: existingLicence } = await supabase
      .from('licences')
      .select('id')
      .eq('stripe_session_id', sessionId)
      .maybeSingle()

    if (existingLicence?.id) {
      const { data: existingPay } = await supabase
        .from('payments')
        .select('id')
        .eq('stripe_session_id', sessionId)
        .maybeSingle()

      if (existingPay?.id) {
        console.log('webhook-stripe: session already processed', sessionId)
        return res.status(200).json({ received: true, duplicate: true })
      }

      const payRow = rowPack.buildPaymentInsert(existingLicence.id)
      const { data: payment, error: errPayment } = await supabase
        .from('payments')
        .insert(payRow)
        .select('id')
        .single()

      if (errPayment) {
        console.error('webhook-stripe: payments catch-up failed', errPayment)
        return res.status(500).end()
      }

      const gut = rowPack.buildGutschriftInsert(payment.id, existingLicence.id)
      if (gut) {
        const { error: errG } = await supabase.from('empfehler_gutschriften').insert(gut)
        if (errG) console.error('webhook-stripe: empfehler_gutschriften catch-up failed', errG)
      }

      console.log('webhook-stripe: payment catch-up', { sessionId, paymentId: payment.id })
      return res.status(200).json({ received: true, catchUp: true })
    }

    const { data: licence, error: errLicence } = await supabase
      .from('licences')
      .insert(rowPack.licenceInsert)
      .select('id')
      .single()

    if (errLicence) {
      if (errLicence.code === '23505') {
        const { data: raced } = await supabase
          .from('licences')
          .select('id')
          .eq('stripe_session_id', sessionId)
          .maybeSingle()
        if (raced?.id) {
          const { data: racedPay } = await supabase
            .from('payments')
            .select('id')
            .eq('stripe_session_id', sessionId)
            .maybeSingle()
          if (racedPay?.id) {
            console.log('webhook-stripe: race → already complete', sessionId)
            return res.status(200).json({ received: true, duplicate: true })
          }
          const payRow = rowPack.buildPaymentInsert(raced.id)
          const { data: payment, error: errPay2 } = await supabase
            .from('payments')
            .insert(payRow)
            .select('id')
            .single()
          if (errPay2) {
            console.error('webhook-stripe: payments after race failed', errPay2)
            return res.status(500).end()
          }
          const gut = rowPack.buildGutschriftInsert(payment.id, raced.id)
          if (gut) {
            const { error: errG } = await supabase.from('empfehler_gutschriften').insert(gut)
            if (errG) console.error('webhook-stripe: gutschriften after race failed', errG)
          }
          console.log('webhook-stripe: payment after licence race', sessionId)
          return res.status(200).json({ received: true, catchUp: true })
        }
      }
      console.error('webhook-stripe: licences insert failed', errLicence)
      return res.status(500).end()
    }

    const { data: payment, error: errPayment } = await supabase
      .from('payments')
      .insert(rowPack.buildPaymentInsert(licence.id))
      .select('id')
      .single()

    if (errPayment) {
      console.error('webhook-stripe: payments insert failed', errPayment)
      return res.status(500).end()
    }

    const gut = rowPack.buildGutschriftInsert(payment.id, licence.id)
    if (gut) {
      const { error: errGutschrift } = await supabase.from('empfehler_gutschriften').insert(gut)
      if (errGutschrift) {
        console.error('webhook-stripe: empfehler_gutschriften insert failed', errGutschrift)
      }
    }

    console.log('Stripe webhook: checkout.session.completed', {
      sessionId,
      licenceId: licence.id,
      paymentId: payment.id,
      licenceType: rowPack.licenceType,
      customerEmail: rowPack.customerEmail,
      gutschriftCents: rowPack.gutschriftCents,
    })
  } catch (err) {
    console.error('webhook-stripe:', err)
    return res.status(500).end()
  }

  return res.status(200).json({ received: true })
}
