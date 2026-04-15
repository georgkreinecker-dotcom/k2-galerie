/**
 * Vercel Serverless: Stripe Checkout Session für Lizenzkauf erstellen.
 * POST Body: { licenceType: 'basic'|'pro'|'proplus'|'propplus', email: string, name: string, empfehlerId?: string }
 * Antwort: { url: string } (Redirect zu Stripe Checkout)
 *
 * Umgebungsvariablen (Vercel): STRIPE_SECRET_KEY, VERCEL_URL (oder NEXT_PUBLIC_APP_URL) für Success/Cancel-URLs
 */
import { createStripeCheckoutSession } from './createCheckoutShared.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Nur POST erlaubt' })

  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) {
    console.error('create-checkout: STRIPE_SECRET_KEY fehlt')
    return res.status(500).json({
      error: 'Zahlungssystem nicht konfiguriert',
      hint:
        'Funktionstest Stripe: STRIPE_SECRET_KEY in Vercel hinterlegen. Ohne echte Stripe-Checkout-Session lässt sich nicht verifizieren, ob Zahlung und Webhook funktionieren.',
    })
  }

  let body
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
  } catch {
    return res.status(400).json({ error: 'Ungültiger JSON-Body' })
  }

  const { licenceType, email, name, empfehlerId } = body

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : (process.env.VITE_APP_URL || 'https://k2-galerie.vercel.app')

  try {
    const { url } = await createStripeCheckoutSession({
      licenceType,
      email,
      name,
      empfehlerId,
      secretKey: secret,
      baseUrl,
    })
    return res.status(200).json({ url })
  } catch (err) {
    if (err?.code === 'VALIDATION') {
      return res.status(400).json({
        error: 'Fehlende Angaben',
        hint:
          'licenceType (basic|pro|proplus|propplus|familie_monat|familie_jahr), email und name sind Pflicht.',
      })
    }
    console.error('create-checkout:', err)
    return res.status(500).json({
      error: 'Checkout konnte nicht erstellt werden',
      hint: err?.message?.substring(0, 150) || '',
    })
  }
}
