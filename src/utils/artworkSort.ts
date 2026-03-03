/**
 * Sortiert Werke: Neueste zuerst (nach addedToGalleryAt/createdAt absteigend).
 * Nutzung in allen Anzeigen: Galerie, Galerie-Vorschau, Admin, Shop, Export.
 */
export function sortArtworksNewestFirst<T extends { addedToGalleryAt?: string; createdAt?: string }>(artworks: T[]): T[] {
  return [...artworks].sort((a, b) => {
    const aTime = (a.addedToGalleryAt || a.createdAt) ? new Date(a.addedToGalleryAt || a.createdAt!).getTime() : 0
    const bTime = (b.addedToGalleryAt || b.createdAt) ? new Date(b.addedToGalleryAt || b.createdAt!).getTime() : 0
    return bTime - aTime
  })
}

/** Typ für Werke mit optionalem Favoriten-Flag (imVereinskatalog = Favorit für Vorreihung + Vereinskatalog). */
type WithFavorite = { imVereinskatalog?: boolean; addedToGalleryAt?: string; createdAt?: string }

/**
 * Sortiert Werke: Favoriten (imVereinskatalog) zuerst, dann neueste zuerst.
 * Für K2/ök2-Galerie und -Vorschau: Priorisierung der 5 Top-Favoriten.
 */
export function sortArtworksFavoritesFirstThenNewest<T extends WithFavorite>(artworks: T[]): T[] {
  return [...artworks].sort((a, b) => {
    const aFav = !!a.imVereinskatalog
    const bFav = !!b.imVereinskatalog
    if (aFav && !bFav) return -1
    if (!aFav && bFav) return 1
    const aTime = (a.addedToGalleryAt || a.createdAt) ? new Date(a.addedToGalleryAt || a.createdAt!).getTime() : 0
    const bTime = (b.addedToGalleryAt || b.createdAt) ? new Date(b.addedToGalleryAt || b.createdAt!).getTime() : 0
    return bTime - aTime
  })
}

/** Kategorie-Feld für Interleave (Werke haben category als string). */
type WithCategory = { category?: string }

/**
 * Stellt Werke so um, dass Kategorien abwechselnd vorkommen (nicht alle Malerei, dann alle Keramik).
 * Round-Robin: Ein Malerei, ein Keramik, ein Grafik, … – so wirkt die Galerie-Vorschau abwechslungsreich.
 */
export function interleaveArtworksByCategory<T extends WithCategory>(artworks: T[]): T[] {
  if (!Array.isArray(artworks) || artworks.length <= 1) return artworks
  const byCategory = new Map<string, T[]>()
  for (const a of artworks) {
    const cat = (a.category && String(a.category).trim()) || 'sonstiges'
    if (!byCategory.has(cat)) byCategory.set(cat, [])
    byCategory.get(cat)!.push(a)
  }
  const categories = Array.from(byCategory.keys())
  if (categories.length <= 1) return artworks
  const result: T[] = []
  const queues = categories.map((c) => [...(byCategory.get(c) || [])])
  let maxLen = Math.max(...queues.map((q) => q.length))
  while (maxLen > 0) {
    for (let i = 0; i < queues.length; i++) {
      if (queues[i].length > 0) {
        result.push(queues[i].shift()!)
      }
    }
    maxLen = Math.max(...queues.map((q) => q.length))
  }
  return result
}
