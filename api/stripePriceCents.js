/**
 * Stripe Checkout: Cent-Beträge pro Lizenzstufe.
 * Muss mit src/config/licencePricing.ts (priceEur) übereinstimmen – Absicherung: src/tests/stripeLicenceContract.test.ts
 */
export const STRIPE_CHECKOUT_LICENCE_TYPES = ['basic', 'pro', 'proplus', 'propplus']

export const STRIPE_LICENCE_PRICE_CENTS = {
  basic: 1500,
  pro: 3500,
  proplus: 4500,
  propplus: 5500,
}
