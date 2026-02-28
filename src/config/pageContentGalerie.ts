/**
 * Seitengestaltung: Willkommensseite & Galerie-Vorschau
 * Texte und Bilder für diese Seiten – getrennt von Stammdaten (hochsensibel, streng geschützt).
 * K2: k2-page-content-galerie. ök2: k2-oeffentlich-page-content-galerie. VK2: k2-vk2-page-content-galerie.
 */

import { loadStammdaten } from '../utils/stammdatenStorage'

const STORAGE_KEY_K2 = 'k2-page-content-galerie'
const STORAGE_KEY_OEFFENTLICH = 'k2-oeffentlich-page-content-galerie'
const STORAGE_KEY_VK2 = 'k2-vk2-page-content-galerie'

function getStorageKey(tenantId?: 'oeffentlich' | 'vk2'): string {
  if (tenantId === 'oeffentlich') return STORAGE_KEY_OEFFENTLICH
  if (tenantId === 'vk2') return STORAGE_KEY_VK2
  return STORAGE_KEY_K2
}

export interface PageContentGalerie {
  welcomeImage?: string
  galerieCardImage?: string
  virtualTourImage?: string
  virtualTourVideo?: string
  welcomeIntroText?: string
}

const defaults: PageContentGalerie = {}

/** Einmal-Migration (nur K2): Bilder aus Stammdaten in Seitengestaltung übernehmen, falls leer. Phase 1.3: über Schicht. */
function migrateFromStammdatenIfNeeded(): void {
  try {
    const key = getStorageKey(undefined)
    const existing = localStorage.getItem(key)
    if (existing && existing.length > 10) return
    const gallery = loadStammdaten('k2', 'gallery') as Record<string, unknown>
    if (!gallery || typeof gallery !== 'object') return
    const out: PageContentGalerie = {}
    if (gallery.welcomeImage && typeof gallery.welcomeImage === 'string') out.welcomeImage = gallery.welcomeImage
    if (gallery.galerieCardImage && typeof gallery.galerieCardImage === 'string') out.galerieCardImage = gallery.galerieCardImage
    if (gallery.virtualTourImage && typeof gallery.virtualTourImage === 'string') out.virtualTourImage = gallery.virtualTourImage
    if (Object.keys(out).length > 0) localStorage.setItem(key, JSON.stringify(out))
  } catch (_) {}
}

/** Liest Seitengestaltung (Bilder + optionale Texte). tenantId 'oeffentlich' = ök2, 'vk2' = VK2. */
export function getPageContentGalerie(tenantId?: 'oeffentlich' | 'vk2'): PageContentGalerie {
  if (tenantId !== 'oeffentlich' && tenantId !== 'vk2') migrateFromStammdatenIfNeeded()
  try {
    const key = getStorageKey(tenantId)
    const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null
    if (raw && raw.length > 0) {
      const parsed = JSON.parse(raw) as Partial<PageContentGalerie>

      if (tenantId === 'oeffentlich') {
        // ök2: Nur echte K2-Medienpfade entfernen (wurden durch Kontext-Bug hereingekommen)
        // data: (Base64) und blob: gehören zum User-Upload → NICHT löschen!
        let changed = false
        const isK2ServerMedia = (v?: string) => !!(v && (
          v.startsWith('/img/k2/') ||
          (v.startsWith('/img/') && !v.startsWith('/img/oeffentlich/'))
        ))
        if (isK2ServerMedia(parsed.welcomeImage)) { delete parsed.welcomeImage; changed = true }
        if (isK2ServerMedia(parsed.galerieCardImage)) { delete parsed.galerieCardImage; changed = true }
        if (isK2ServerMedia(parsed.virtualTourImage)) { delete parsed.virtualTourImage; changed = true }
        if (isK2ServerMedia(parsed.virtualTourVideo)) { delete parsed.virtualTourVideo; changed = true }
        // blob: URLs sind session-gebunden → nach Reload ungültig → löschen
        if (parsed.welcomeImage?.startsWith('blob:')) { delete parsed.welcomeImage; changed = true }
        if (parsed.galerieCardImage?.startsWith('blob:')) { delete parsed.galerieCardImage; changed = true }
        if (parsed.virtualTourImage?.startsWith('blob:')) { delete parsed.virtualTourImage; changed = true }
        if (parsed.virtualTourVideo?.startsWith('blob:')) { delete parsed.virtualTourVideo; changed = true }
        if (changed) {
          try { localStorage.setItem(key, JSON.stringify({ ...parsed })) } catch (_) {}
        }
      } else if (tenantId === 'vk2') {
        // VK2: blob:-URLs entfernen (session-gebunden)
        let changed = false
        if (parsed.virtualTourVideo?.startsWith('blob:')) { parsed.virtualTourVideo = undefined; changed = true }
        if (changed) {
          try { localStorage.setItem(key, JSON.stringify({ ...parsed })) } catch (_) {}
        }
      } else {
        // K2: nur blob:-URLs ersetzen (session-gebunden, nach Reload ungültig)
        // Base64-Bilder NICHT ersetzen – sie sind im selben Browser sichtbar (Vorschau!)
        let changed = false
        if (parsed.virtualTourVideo?.startsWith('blob:')) {
          parsed.virtualTourVideo = '/img/k2/virtual-tour.mp4'; changed = true
        }
        if (changed) {
          try { localStorage.setItem(key, JSON.stringify({ ...parsed })) } catch (_) {}
        }
      }
      return { ...defaults, ...parsed }
    }
  } catch (_) {}
  return { ...defaults }
}

/** Speichert Seitengestaltung. tenantId 'oeffentlich' = ök2, 'vk2' = VK2. */
export function setPageContentGalerie(data: Partial<PageContentGalerie>, tenantId?: 'oeffentlich' | 'vk2'): void {
  try {
    if (typeof window !== 'undefined') {
      const current = getPageContentGalerie(tenantId)
      const next = { ...current, ...data }
      localStorage.setItem(getStorageKey(tenantId), JSON.stringify(next))
      // Events feuern damit GaleriePage (gleicher Tab) sofort aktualisiert – beide Events für K2 und ök2
      window.dispatchEvent(new CustomEvent('k2-oeffentlich-images-updated'))
      window.dispatchEvent(new CustomEvent('k2-design-saved-publish'))
      window.dispatchEvent(new CustomEvent('k2-page-content-updated'))
    }
  } catch (e) {
    console.warn('Seitengestaltung speichern fehlgeschlagen:', e)
  }
}

/** Liefert die anzuzeigenden Bilder: zuerst aus Seitengestaltung, Fallback Stammdaten, dann Vercel-Pfade.
 *  Vercel-Pfade greifen auf jedem Gerät (Mac, Handy, iPad) – localStorage ist geräte-spezifisch.
 *  tenantId 'oeffentlich' = ök2 → NUR ök2-eigene Bilder, KEINE K2-Vercel-Fallbacks! */
export function getGalerieImages(
  stammdatenGallery?: { welcomeImage?: string; galerieCardImage?: string; virtualTourImage?: string },
  tenantId?: 'oeffentlich'
): {
  welcomeImage: string
  galerieCardImage: string
  virtualTourImage: string
  virtualTourVideo: string
} {
  const page = getPageContentGalerie(tenantId)
  if (tenantId === 'oeffentlich') {
    // ök2: nur eigene Bilder – kein Fallback auf K2-Vercel-Pfade
    return {
      welcomeImage: page.welcomeImage || stammdatenGallery?.welcomeImage || '',
      galerieCardImage: page.galerieCardImage || stammdatenGallery?.galerieCardImage || '',
      virtualTourImage: page.virtualTourImage || stammdatenGallery?.virtualTourImage || '',
      virtualTourVideo: page.virtualTourVideo || ''
    }
  }
  // K2: Vercel-Pfade als letzter Fallback – funktionieren auf allen Geräten nach GitHub-Upload
  return {
    welcomeImage: page.welcomeImage || stammdatenGallery?.welcomeImage || '/img/k2/willkommen.jpg',
    galerieCardImage: page.galerieCardImage || stammdatenGallery?.galerieCardImage || '/img/k2/galerie-card.jpg',
    virtualTourImage: page.virtualTourImage || stammdatenGallery?.virtualTourImage || '/img/k2/virtual-tour.jpg',
    virtualTourVideo: page.virtualTourVideo || '/img/k2/virtual-tour.mp4'
  }
}
