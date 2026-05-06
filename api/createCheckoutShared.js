/**
 * Gemeinsame Stripe-Checkout-Erstellung für Vercel (create-checkout.js) und Vite-Dev (lokal).
 * Cent-Preise: api/stripePriceCents.js (Tests gegen licencePricing.ts).
 */
import Stripe from 'stripe'
import {
  STRIPE_CHECKOUT_LICENCE_TYPES,
  STRIPE_LICENCE_PRICE_CENTS,
  STRIPE_FAMILIE_CHECKOUT_TYPES,
  STRIPE_FAMILIE_LICENCE_PRICE_CENTS,
} from './stripePriceCents.js'

export const PRICE_CENTS = STRIPE_LICENCE_PRICE_CENTS

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

export function generateFamilieTenantId(email) {
  const slug = (email || '')
    .trim()
    .toLowerCase()
    .split('@')[0]
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'familie'
  const rand = Math.random().toString(36).slice(2, 8)
  return `familie-${slug}-${rand}`
}

/**
 * @param {{ licenceType: string, email: string, name: string, empfehlerId?: string, secretKey: string, baseUrl: string }} opts
 * @returns {Promise<{ url: string }>}
 */
export async function createStripeCheckoutSession(opts) {
  const { licenceType, email, name, empfehlerId, secretKey, baseUrl } = opts
  const lt = typeof licenceType === 'string' ? licenceType.trim() : ''
  const b = baseUrl.replace(/\/$/, '')

  if (!email?.trim() || !name?.trim()) {
    const err = new Error('Fehlende Angaben')
    err.code = 'VALIDATION'
    throw err
  }

  if (STRIPE_FAMILIE_CHECKOUT_TYPES.includes(lt)) {
    const tenantId = generateFamilieTenantId(email)
    const successUrl = `${b}/lizenz-erfolg?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${b}/projects/k2-familie/lizenz-erwerben`
    const stripe = new Stripe(secretKey)
    /** K2 Familie: kein Empfehlungsprogramm – empfehlerId wird nicht in Stripe-Metadaten geschrieben. */
    const metaBase = {
      licenceType: lt,
      customerName: (name || '').trim().substring(0, 200),
      tenantId,
      productLine: 'k2_familie',
    }

    if (lt === 'familie_jahr') {
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: 'K2 Familie – Jahreslizenz',
                description: '100 € pro Jahr (automatische Verlängerung; Wechsel Monat/Jahr im Stripe-Kundenportal, wenn dort eingerichtet)',
              },
              unit_amount: STRIPE_FAMILIE_LICENCE_PRICE_CENTS.familie_jahr,
              recurring: { interval: 'year' },
            },
            quantity: 1,
          },
        ],
        customer_email: email.trim(),
        metadata: metaBase,
        subscription_data: {
          metadata: {
            tenantId,
            licenceType: 'familie_jahr',
            productLine: 'k2_familie',
          },
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
      })
      return { url: session.url }
    }

    if (lt === 'familie_monat') {
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: 'K2 Familie – Monatslizenz',
                description: '10 € pro Monat (Abo)',
              },
              unit_amount: STRIPE_FAMILIE_LICENCE_PRICE_CENTS.familie_monat,
              recurring: { interval: 'month' },
            },
            quantity: 1,
          },
        ],
        customer_email: email.trim(),
        metadata: metaBase,
        subscription_data: {
          metadata: {
            tenantId,
            licenceType: 'familie_monat',
            productLine: 'k2_familie',
            ...empMeta,
          },
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
      })
      return { url: session.url }
    }
  }

  const empMeta =
    empfehlerId && empfehlerId.trim() ? { empfehlerId: empfehlerId.trim().substring(0, 100) } : {}

  const priceCents =
    lt && STRIPE_CHECKOUT_LICENCE_TYPES.includes(lt) ? STRIPE_LICENCE_PRICE_CENTS[lt] : undefined
  if (!priceCents) {
    const err = new Error('Fehlende Angaben')
    err.code = 'VALIDATION'
    throw err
  }

  const tenantId = generateTenantId(email)
  const successUrl = `${b}/lizenz-erfolg?session_id={CHECKOUT_SESSION_ID}`
  const cancelUrl = `${b}/projects/k2-galerie/lizenz-kaufen`

  const stripe = new Stripe(secretKey)
  const productLabel =
    lt === 'basic'
      ? 'Basic'
      : lt === 'pro'
        ? 'Pro'
        : lt === 'proplus'
          ? 'Pro+'
          : 'Pro++'
  const productDesc =
    lt === 'basic'
      ? '15 €/Monat'
      : lt === 'pro'
        ? '35 €/Monat'
        : lt === 'proplus'
          ? '45 €/Monat'
          : '55 €/Monat'
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `K2 Galerie – ${productLabel}`,
            description: productDesc,
          },
          unit_amount: priceCents,
        },
        quantity: 1,
      },
    ],
    customer_email: email.trim(),
    metadata: {
      licenceType: lt,
      customerName: (name || '').trim().substring(0, 200),
      tenantId,
      ...empMeta,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  })

  return { url: session.url }
}
