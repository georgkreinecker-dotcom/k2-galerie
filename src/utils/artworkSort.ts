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
