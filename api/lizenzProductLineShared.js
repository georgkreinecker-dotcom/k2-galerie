/**
 * Eine Quelle: Produktlinie aus licence_type (Webhook, Checkout-Metadata, DB).
 * Galerie-Lizenzen vs. K2 Familie – für Erfolgsseite und API-Antwort.
 */
import { checkoutSessionEffectiveMetadata } from './stripeWebhookLicenceShared.js'

export function productLineFromLicenceType(licenceType) {
  const t = String(licenceType || '')
  if (t === 'familie_monat' || t === 'familie_jahr') return 'k2_familie'
  return 'k2_galerie'
}

/**
 * Stripe-Fallback für get-licence-by-session: Metadaten können productLine=k2_galerie fälschlich setzen,
 * obwohl licence_type / tenantId bereits K2 Familie sind – dann UI „Galerie“ trotz meine-familie-URL.
 */
export function productLineFromStripeSession(session, licenceType, tenantId) {
  const tid = String(tenantId || '').trim().toLowerCase()
  if (tid.startsWith('familie-')) return 'k2_familie'
  if (productLineFromLicenceType(licenceType) === 'k2_familie') return 'k2_familie'
  const meta = checkoutSessionEffectiveMetadata(session)
  const raw = String(meta.productLine || '').trim()
  if (raw === 'k2_familie' || raw === 'k2_galerie') return raw
  return productLineFromLicenceType(licenceType)
}
