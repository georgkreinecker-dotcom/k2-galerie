/**
 * Eine Quelle: Webhook-URL und API-Pfade für die Kette
 * Checkout → Stripe → Webhook → Supabase → licence-data / get-licence-by-session.
 *
 * Doku-Einstieg: docs/STRIPE-LIZENZEN-GO-LIVE.md (verbindliche Kette)
 * Detail: docs/STRIPE-ANBINDUNG-SCHRITT-FUER-SCHRITT.md
 *
 * Bei Änderung des Webhook-Pfads oder der Production-Host-URL: diese Datei + Doku + Tests anpassen.
 */
export const STRIPE_LICENCE_PRODUCTION_HOST = 'https://k2-galerie.vercel.app'

export const STRIPE_WEBHOOK_PATH = '/api/webhook-stripe'

/** Relative Doku-Pfade (Repo), für API-JSON und UI-Hinweise */
export const STRIPE_LICENCE_DOC_GO_LIVE = 'docs/STRIPE-LIZENZEN-GO-LIVE.md'
export const STRIPE_LICENCE_DOC_BINDING = 'docs/STRIPE-ANBINDUNG-SCHRITT-FUER-SCHRITT.md'
export const STRIPE_LICENCE_DOC_TEST_LOCAL = 'docs/STRIPE-TEST-LOKAL.md'

export const STRIPE_API_PATHS = {
  createCheckout: '/api/create-checkout',
  webhook: STRIPE_WEBHOOK_PATH,
  licenceData: '/api/licence-data',
  getLicenceBySession: '/api/get-licence-by-session',
}

export function getStripeWebhookUrlProduction() {
  return `${STRIPE_LICENCE_PRODUCTION_HOST}${STRIPE_WEBHOOK_PATH}`
}
