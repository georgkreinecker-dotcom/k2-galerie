/**
 * Vercel Serverless: Stripe Webhook – Zahlung erfolgreich.
 * Stripe ruft diese URL auf (im Dashboard konfigurieren). Raw-Body für Signaturprüfung nötig.
 *
 * Umgebungsvariablen: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * Nach erfolgreicher Zahlung: Lizenz + Zahlung + ggf. Gutschrift in Supabase speichern.
 */
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

/** Raw-Body aus Request-Stream lesen (für Stripe-Signaturprüfung erforderlich). */
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
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
      const secret = process.env.TENANT_DELETE_SECRET
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : (process.env.VITE_APP_URL || 'https://k2-galerie.vercel.app')
      if (secret && baseUrl) {
        try {
          const delRes = await fetch(`${baseUrl}/api/delete-tenant-data`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tenantId, secret }),
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
  const { metadata } = session
  const licenceType = metadata?.licenceType || 'basic'
  const empfehlerId = (metadata?.empfehlerId || '').trim() || null
  const customerName = (metadata?.customerName || '').trim() || 'Kunde'
  const amountTotal = session.amount_total ?? 0
  const customerEmail = session.customer_email || session.customer_details?.email || ''

  const amountEur = (amountTotal / 100).toFixed(2)
  const gutschriftCents = empfehlerId && amountTotal > 0 ? Math.round(amountTotal * 0.1) : 0
  const gutschriftEur = (gutschriftCents / 100).toFixed(2)

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('webhook-stripe: SUPABASE_URL oder SUPABASE_SERVICE_ROLE_KEY fehlt')
    return res.status(500).end()
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    const { data: licence, error: errLicence } = await supabase
      .from('licences')
      .insert({
        email: customerEmail,
        name: customerName,
        licence_type: licenceType,
        status: 'active',
        empfehler_id: empfehlerId,
        stripe_session_id: session.id,
      })
      .select('id')
      .single()

    if (errLicence) {
      console.error('webhook-stripe: licences insert failed', errLicence)
      return res.status(500).end()
    }

    const { data: payment, error: errPayment } = await supabase
      .from('payments')
      .insert({
        licence_id: licence.id,
        amount_cents: amountTotal,
        amount_eur: amountEur,
        currency: 'eur',
        stripe_session_id: session.id,
        empfehler_id: empfehlerId,
      })
      .select('id')
      .single()

    if (errPayment) {
      console.error('webhook-stripe: payments insert failed', errPayment)
      return res.status(500).end()
    }

    if (empfehlerId && gutschriftCents > 0) {
      const { error: errGutschrift } = await supabase.from('empfehler_gutschriften').insert({
        empfehler_id: empfehlerId,
        amount_eur: gutschriftEur,
        payment_id: payment.id,
        licence_id: licence.id,
      })
      if (errGutschrift) {
        console.error('webhook-stripe: empfehler_gutschriften insert failed', errGutschrift)
      }
    }

    console.log('Stripe webhook: checkout.session.completed', {
      sessionId: session.id,
      licenceId: licence.id,
      paymentId: payment.id,
      licenceType,
      customerEmail,
      gutschriftCents,
    })
  } catch (err) {
    console.error('webhook-stripe:', err)
    return res.status(500).end()
  }

  return res.status(200).json({ received: true })
}
