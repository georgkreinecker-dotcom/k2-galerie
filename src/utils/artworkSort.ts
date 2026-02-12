/**
 * Sortiert Werke: Neueste zuerst (nach createdAt absteigend).
 * Nutzung in allen Anzeigen: Galerie, Galerie-Vorschau, Admin, Shop, Export.
 */
export function sortArtworksNewestFirst<T extends { createdAt?: string }>(artworks: T[]): T[] {
  return [...artworks].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return bTime - aTime
  })
}
