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
