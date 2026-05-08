/**
 * Gleiche Nummern-Normalisierung wie api/sanitizeNonLegacyTenantArtworks.js.
 * Server filtert K2-Produktionsnummern beim Schreiben; beim Laden kann die Heuristik die Liste leeren.
 */
export const K2_BULK_LEAK_MIN_ARTWORKS = 15
export const K2_BULK_LEAK_MIN_RATIO = 0.35

const K2_STYLE_NUM = /^K2-[MGKSO]-\d+/i

function normalizeK2WerkNummerForGuard(raw: unknown): string {
  return String(raw ?? '')
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212\uFE58\uFF0D]/g, '-')
    .replace(/\s+/g, '')
}

/**
 * Lizenz-Mandanten: K2-Produktionsnummerierung (K2-M-/K2-K-/…) darf nie in den Mandanten-Blob.
 * Hard-Filter auf dem Weg zum Server – unabhängig davon, wie die Liste vergiftet wurde.
 */
export function stripK2ProductionStyleArtworks<T>(artworks: readonly T[] | unknown): T[] {
  if (!Array.isArray(artworks)) return []
  return (artworks as T[]).filter((a) => {
    const n = normalizeK2WerkNummerForGuard((a as { number?: unknown; id?: unknown })?.number ?? (a as { id?: unknown })?.id ?? '')
    return !K2_STYLE_NUM.test(n)
  })
}

export function isLikelyK2ProductionBulkInfection(artworks: unknown): boolean {
  if (!Array.isArray(artworks) || artworks.length < K2_BULK_LEAK_MIN_ARTWORKS) return false
  let k2Style = 0
  for (const a of artworks) {
    const n = normalizeK2WerkNummerForGuard((a as { number?: unknown; id?: unknown })?.number ?? (a as { id?: unknown })?.id ?? '')
    if (K2_STYLE_NUM.test(n)) k2Style++
  }
  const ratio = k2Style / artworks.length
  return k2Style >= K2_BULK_LEAK_MIN_ARTWORKS && ratio >= K2_BULK_LEAK_MIN_RATIO
}
