/**
 * Gemeinsame Stripe-Checkout-Erstellung für Vercel (create-checkout.js) und Vite-Dev (lokal).
 * Preise müssen mit src/config/licencePricing.ts übereinstimmen.
 */
import Stripe from 'stripe'

export const PRICE_CENTS = {
  basic: 1500,
  pro: 3500,
  proplus: 4500,
  propplus: 5500,
}

export function generateTenantId(email) {
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

/**
 * @param {{ licenceType: string, email: string, name: string, empfehlerId?: string, secretKey: string, baseUrl: string }} opts
 * @returns {Promise<{ url: string }>}
 */
export async function createStripeCheckoutSession(opts) {
  const { licenceType, email, name, empfehlerId, secretKey, baseUrl } = opts
  const priceCents = PRICE_CENTS[licenceType]
  if (!priceCents || !email || !name) {
    const err = new Error('Fehlende Angaben')
    err.code = 'VALIDATION'
    throw err
  }

  const tenantId = generateTenantId(email)
  const successUrl = `${baseUrl.replace(/\/$/, '')}/lizenz-erfolg?session_id={CHECKOUT_SESSION_ID}`
  const cancelUrl = `${baseUrl.replace(/\/$/, '')}/projects/k2-galerie/lizenz-kaufen`

  const stripe = new Stripe(secretKey)
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `K2 Galerie – ${licenceType === 'basic' ? 'Basic' : licenceType === 'pro' ? 'Pro' : licenceType === 'proplus' ? 'Pro+' : 'Pro++'}`,
            description:
              licenceType === 'basic'
                ? '15 €/Monat'
                : licenceType === 'pro'
                  ? '35 €/Monat'
                  : licenceType === 'proplus'
                    ? '45 €/Monat'
                    : '55 €/Monat',
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

  return { url: session.url }
}
