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

/** Kategorie + Werknummer für Block-Sortierung in Galerie/Werkkatalog. */
type WithCategoryNumber = { category?: string; number?: string; id?: string }

/** Feste Reihenfolge für „alle Kategorien“: eine Kategorie komplett, dann die nächste (fortlaufende Nummern pro Block). */
export const GALERIE_CATEGORY_ORDER: readonly string[] = ['malerei', 'keramik', 'grafik', 'skulptur', 'sonstiges']

function artworkNumberSortKey(a: WithCategoryNumber): string {
  return String(a.number ?? a.id ?? '').trim()
}

function orderedCategoryKeys(categoriesPresent: Set<string>): string[] {
  const keys = [...categoriesPresent]
  const known = GALERIE_CATEGORY_ORDER.filter((k) => keys.includes(k))
  const unknown = keys.filter((k) => !GALERIE_CATEGORY_ORDER.includes(k)).sort((a, b) => a.localeCompare(b, 'de'))
  return [...known, ...unknown]
}

/**
 * Sortiert für die Anzeige „alle Kategorien“: zuerst Kategorie-Block 1 (alle Werke), dann Block 2, …
 * Innerhalb jedes Blocks aufsteigend nach Werknummer (natürliche Sortierung).
 * So wirken Nummern fortlaufend (K2-M-… zusammen, K2-K-… zusammen), nicht durcheinander wie beim früheren Round-Robin.
 */
export function sortArtworksCategoryBlocksThenNumberAsc<T extends WithCategoryNumber>(artworks: T[]): T[] {
  if (!Array.isArray(artworks) || artworks.length <= 1) return [...artworks]
  const byCategory = new Map<string, T[]>()
  for (const a of artworks) {
    const cat = (a.category && String(a.category).trim()) || 'sonstiges'
    if (!byCategory.has(cat)) byCategory.set(cat, [])
    byCategory.get(cat)!.push(a)
  }
  const categories = orderedCategoryKeys(new Set(byCategory.keys()))
  const result: T[] = []
  for (const c of categories) {
    const group = [...(byCategory.get(c) || [])]
    group.sort((a, b) => artworkNumberSortKey(a).localeCompare(artworkNumberSortKey(b), 'de', { numeric: true }))
    result.push(...group)
  }
  return result
}
