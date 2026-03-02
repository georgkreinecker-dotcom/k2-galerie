/**
 * Vercel Serverless: Stripe Webhook – Zahlung erfolgreich.
 * Stripe ruft diese URL auf (im Dashboard konfigurieren). Raw-Body für Signaturprüfung nötig.
 *
 * Umgebungsvariablen: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
 *
 * Nach erfolgreicher Zahlung: Metadaten (licenceType, empfehlerId) aus Session auslesen,
 * Zahlung/Gutschrift protokollieren. Ohne DB vorerst: Log + 200 OK (später Supabase-Tabellen anbinden).
 */
import Stripe from 'stripe'

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

  if (event.type !== 'checkout.session.completed') {
    return res.status(200).json({ received: true })
  }

  const session = event.data.object
  const { metadata } = session
  const licenceType = metadata?.licenceType || 'basic'
  const empfehlerId = metadata?.empfehlerId || null
  const amountTotal = session.amount_total ?? 0
  const customerEmail = session.customer_email || session.customer_details?.email || ''

  // 10 % Gutschrift für Empfehler (in Cent, dann für Anzeige / DB in Euro umrechnen)
  const gutschriftCents = empfehlerId && amountTotal > 0 ? Math.round(amountTotal * 0.1) : 0

  // TODO: In Supabase-Tabellen schreiben (payments, licences, empfehler_gutschriften)
  // Vorerst nur Log für Nachvollziehbarkeit
  console.log('Stripe webhook: checkout.session.completed', {
    sessionId: session.id,
    licenceType,
    customerEmail,
    amountTotalCents: amountTotal,
    empfehlerId: empfehlerId || null,
    gutschriftCents,
  })

  return res.status(200).json({ received: true })
}
