/**
 * Vercel Serverless: Stripe Checkout Session für Lizenzkauf erstellen.
 * POST Body: { licenceType: 'basic'|'pro'|'proplus', email: string, name: string, empfehlerId?: string }
 * Antwort: { url: string } (Redirect zu Stripe Checkout)
 *
 * Umgebungsvariablen (Vercel): STRIPE_SECRET_KEY, VERCEL_URL (oder NEXT_PUBLIC_APP_URL) für Success/Cancel-URLs
 */
import Stripe from 'stripe'

const PRICE_CENTS = {
  basic: 1500,   // 15 €
  pro: 3500,     // 35 €
  proplus: 4500, // 45 €
}

/** Sichere tenantId: a-z0-9-, max 64 Zeichen. Eindeutig durch Zufallssuffix. */
function generateTenantId(email) {
  const slug = (email || '')
    .trim()
    .toLowerCase()
    .split('@')[0]
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'galerie'
  const rand = Math.random().toString(36).slice(2, 8)
  return `galerie-${slug}-${rand}`
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Nur POST erlaubt' })

  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) {
    console.error('create-checkout: STRIPE_SECRET_KEY fehlt')
    return res.status(500).json({ error: 'Zahlungssystem nicht konfiguriert' })
  }

  let body
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
  } catch {
    return res.status(400).json({ error: 'Ungültiger JSON-Body' })
  }

  const { licenceType, email, name, empfehlerId } = body
  const priceCents = PRICE_CENTS[licenceType]
  if (!priceCents || !email || !name) {
    return res.status(400).json({
      error: 'Fehlende Angaben',
      hint: 'licenceType (basic|pro|proplus), email und name sind Pflicht.',
    })
  }

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : (process.env.VITE_APP_URL || 'https://k2-galerie.vercel.app')

  const tenantId = generateTenantId(email)
  const successUrl = `${baseUrl}/lizenz-erfolg?session_id={CHECKOUT_SESSION_ID}`
  const cancelUrl = `${baseUrl}/projects/k2-galerie/licences`

  try {
    const stripe = new Stripe(secret)
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `K2 Galerie – ${licenceType === 'basic' ? 'Basic' : licenceType === 'pro' ? 'Pro' : 'Pro+'}`,
              description: licenceType === 'basic' ? '15 €/Monat' : licenceType === 'pro' ? '35 €/Monat' : '45 €/Monat',
            },
            unit_amount: priceCents,
          },
          quantity: 1,
        },
      ],
      customer_email: email.trim(),
      metadata: {
        licenceType,
        customerName: (name || '').trim().substring(0, 200),
        tenantId,
        ...(empfehlerId && empfehlerId.trim() ? { empfehlerId: empfehlerId.trim().substring(0, 100) } : {}),
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('create-checkout:', err)
    return res.status(500).json({
      error: 'Checkout konnte nicht erstellt werden',
      hint: err?.message?.substring(0, 150) || '',
    })
  }
}
