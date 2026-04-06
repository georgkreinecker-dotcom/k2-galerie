/**
 * Eingangstor / Entdecken-Hero: ein Default-Asset und Erkennung Video vs. Bild.
 */

/** Standard-Medium rechts auf /entdecken (Video statt statischem JPG). */
export const ENTDECKEN_HERO_DEFAULT_PATH = '/video/entdecken-eingangstor.mp4'

/** JPG-Fallback für Poster/Vorschau wenn Hero ein Video ist. */
export const ENTDECKEN_HERO_IMAGE_FALLBACK_PATH = '/img/oeffentlich/entdecken-hero.jpg'

export function isEntdeckenHeroVideoUrl(url: string): boolean {
  const t = (url || '').trim()
  if (!t || t.startsWith('data:image/')) return false
  if (t.startsWith('data:video/')) return true
  const base = t.split('?')[0].split('#')[0].toLowerCase()
  return /\.(mp4|webm|mov|m4v|ogg)$/.test(base)
}
