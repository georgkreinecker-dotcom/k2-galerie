/**
 * Eine Quelle: Produktlinie aus licence_type (Webhook, Checkout-Metadata, DB).
 * Galerie-Lizenzen vs. K2 Familie – für Erfolgsseite und API-Antwort.
 */
export function productLineFromLicenceType(licenceType) {
  const t = String(licenceType || '')
  if (t === 'familie_monat' || t === 'familie_jahr') return 'k2_familie'
  return 'k2_galerie'
}
