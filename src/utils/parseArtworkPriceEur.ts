/**
 * VK-Preis aus Werkstamm / API: Zahl oder deutsche Schreibweise (z. B. „15,00“, „1.234,56“), € optional.
 * (Vorher nur in ShopPage; Mandanten-Galerie brauchte dieselbe Logik statt blindem Number().)
 */
export function parseArtworkPriceEur(raw: unknown): number {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0
  let s = String(raw ?? '')
    .trim()
    .replace(/€/g, '')
    .replace(/\s/g, '')
  if (!s) return 0
  const lastComma = s.lastIndexOf(',')
  const lastDot = s.lastIndexOf('.')
  if (lastComma >= 0 && (lastComma > lastDot || lastDot < 0)) {
    s = s.replace(/\./g, '').replace(',', '.')
  } else {
    s = s.replace(/,/g, '')
  }
  const n = parseFloat(s)
  return Number.isFinite(n) ? n : 0
}

/** VK aus Werk-Objekt (Mandanten-Blobs: teils nur price, ältere Varianten mit Synonymen). */
export function parseArtworkPriceEurFromWork(
  work: { price?: unknown; vk?: unknown; preis?: unknown; verkaufspreis?: unknown } | null | undefined,
): number {
  if (!work) return 0
  for (const v of [work.price, work.vk, work.preis, work.verkaufspreis]) {
    const p = parseArtworkPriceEur(v)
    if (p > 0) return p
  }
  return 0
}
