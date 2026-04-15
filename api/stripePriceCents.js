/**
 * Stripe Checkout: Cent-Beträge pro Lizenzstufe.
 * Galerie: muss mit src/config/licencePricing.ts (priceEur) übereinstimmen – Tests: stripeLicenceContract.test.ts
 * K2 Familie: src/config/licencePricing.ts K2_FAMILIE_LIZENZPREISE
 */
export const STRIPE_CHECKOUT_LICENCE_TYPES = ['basic', 'pro', 'proplus', 'propplus']

export const STRIPE_LICENCE_PRICE_CENTS = {
  basic: 1500,
  pro: 3500,
  proplus: 4500,
  propplus: 5500,
}

/** K2 Familie – Checkout-Typen (gleiche API wie Galerie-Lizenz) */
export const STRIPE_FAMILIE_CHECKOUT_TYPES = ['familie_monat', 'familie_jahr']

export const STRIPE_FAMILIE_LICENCE_PRICE_CENTS = {
  /** Monats-Abo */
  familie_monat: 1000,
  /** Einmalzahlung Jahresgebühr */
  familie_jahr: 10000,
}
