/**
 * Mandanten-Riegel (write-gallery-data): Lizenz-Blobs dürfen keine K2-Produktionsnummerierung tragen.
 * Ausgelagert für klare Unit-Tests und eine einzige Regex-Quelle neben dem Handler.
 */
export const LEGACY_TENANTS = ['k2', 'oeffentlich', 'vk2']

/** K2-Produktionsnummerierung (nicht K2-W-), abgestimmt mit src/utils/k2BulkInfectionGuard.ts */
export const K2_PRODUCTION_WERK_NUM = /^K2-[MGKSO]-\d+/i

/** Unicode-/NBSP-Bindestriche und Leerzeichen in Nummern vereinheitlichen (sonst Filter/Heuristik daneben). */
export function normalizeK2WerkNummerForGuard(raw) {
  return String(raw ?? '')
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212\uFE58\uFF0D]/g, '-')
    .replace(/\s+/g, '')
}

/**
 * @param {string} tenantId
 * @param {unknown[]|undefined} artworks
 * @returns {unknown[]|undefined}
 */
export function sanitizeArtworksForNonLegacyTenant(tenantId, artworks) {
  if (LEGACY_TENANTS.includes(tenantId) || !Array.isArray(artworks)) return artworks
  return artworks.filter((a) => !K2_PRODUCTION_WERK_NUM.test(normalizeK2WerkNummerForGuard(a?.number ?? a?.id ?? '')))
}
