/**
 * Eine Quelle für PR: Vita (Kunst) oder Produktstory (andere Sparten).
 * Doku: docs/IDEEN-PRODUKTSTORY-PR-BASIS.md
 */

export interface TenantForPr {
  isOeffentlich?: boolean
}

export interface GalleryDataForPr {
  focusDirections?: string[]
  story?: string
}

export interface PersonDataForPr {
  vita?: string
  bio?: string
}

/**
 * Liefert den einen Story-Text für Presse, Flyer, Einladung, Social.
 * - Kunst (Meine Richtung = kunst oder kein focusDirections): Vita/Bio von Person 1 (Martina).
 * - Andere Sparten (food, handwerk, design, mode, dienstleister): gallery.story (Produktstory).
 */
export function getStoryForPr(
  tenant: TenantForPr,
  galleryData: GalleryDataForPr | null | undefined,
  martinaData?: PersonDataForPr | null,
  georgData?: PersonDataForPr | null
): string {
  const dir = galleryData?.focusDirections?.[0]
  const isKunst = !dir || dir === 'kunst'

  if (tenant.isOeffentlich && !isKunst && galleryData?.story != null) {
    const s = String(galleryData.story).trim()
    if (s) return s
  }

  const m = martinaData?.vita?.trim() || martinaData?.bio?.trim() || ''
  const g = georgData?.vita?.trim() || georgData?.bio?.trim() || ''
  if (m && g) return m + '\n\n' + g
  return m || g || ''
}
