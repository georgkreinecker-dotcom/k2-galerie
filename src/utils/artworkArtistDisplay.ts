/**
 * Anzeige-Künstler für Statistik & Reports: gleiche Logik wie Admin (Neues Werk) –
 * malerei/grafik/sonstiges → Künstler:in 1, keramik/skulptur → Künstler:in 2;
 * wenn `artist` leer ist, aus Kategorie bzw. K2-Werknummer (K2-M-, K2-K-, …) ableiten.
 */

export type KuenstlerFallbackNamen = { martina: string; georg: string }

function norm(s: unknown): string {
  return String(s ?? '').trim()
}

/**
 * @param artwork – Werk-Objekt (artist, category, number, id, entryType)
 * @param fallback – Stammdaten-Namen (Martina / Georg bzw. ök2-Muster); wenn fehlt, nur `artist`
 */
export function resolveArtistLabelForGalerieStatistik(
  artwork: {
    artist?: string
    category?: string
    number?: string
    id?: string
    entryType?: string
  } | null | undefined,
  fallback?: KuenstlerFallbackNamen | null
): string {
  const direct = norm(artwork?.artist)
  if (direct) return direct

  if (!fallback || !norm(fallback.martina) || !norm(fallback.georg)) {
    return direct || 'Ohne Künstler'
  }

  const { martina, georg } = fallback
  const cat = artwork?.category

  if (cat === 'malerei' || cat === 'grafik' || cat === 'sonstiges') return martina
  if (cat === 'keramik' || cat === 'skulptur') return georg
  if (cat === 'konzept' || cat === 'fotografie' || cat === 'textil') return martina

  const et = artwork?.entryType
  if (et === 'product') return georg
  if (et === 'idea') return martina

  const num = norm(artwork?.number || artwork?.id).toUpperCase()
  const lettered = num.match(/^K2-([MKGSPOI])-/i)
  if (lettered) {
    const L = lettered[1].toUpperCase()
    if (L === 'K' || L === 'S') return georg
    return martina
  }

  if (/^K2-\d/.test(num) && !/^K2-[A-Z]-/i.test(num)) return martina

  return 'Ohne Künstler'
}
