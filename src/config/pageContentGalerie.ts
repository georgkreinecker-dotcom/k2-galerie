/**
 * Seitengestaltung: Willkommensseite & Galerie-Vorschau
 * Texte und Bilder für diese Seiten – getrennt von Stammdaten (hochsensibel, streng geschützt).
 * K2: k2-page-content-galerie. ök2: k2-oeffentlich-page-content-galerie.
 */

const STORAGE_KEY_K2 = 'k2-page-content-galerie'
const STORAGE_KEY_OEFFENTLICH = 'k2-oeffentlich-page-content-galerie'

function getStorageKey(tenantId?: 'oeffentlich'): string {
  return tenantId === 'oeffentlich' ? STORAGE_KEY_OEFFENTLICH : STORAGE_KEY_K2
}

export interface PageContentGalerie {
  welcomeImage?: string
  galerieCardImage?: string
  virtualTourImage?: string
  virtualTourVideo?: string
  welcomeIntroText?: string
}

const defaults: PageContentGalerie = {}

/** Einmal-Migration (nur K2): Bilder aus Stammdaten in Seitengestaltung übernehmen, falls leer. */
function migrateFromStammdatenIfNeeded(): void {
  try {
    const key = getStorageKey(undefined)
    const existing = localStorage.getItem(key)
    if (existing && existing.length > 10) return
    const raw = localStorage.getItem('k2-stammdaten-galerie')
    if (!raw) return
    const gallery = JSON.parse(raw) as Record<string, unknown>
    const out: PageContentGalerie = {}
    if (gallery.welcomeImage && typeof gallery.welcomeImage === 'string') out.welcomeImage = gallery.welcomeImage
    if (gallery.galerieCardImage && typeof gallery.galerieCardImage === 'string') out.galerieCardImage = gallery.galerieCardImage
    if (gallery.virtualTourImage && typeof gallery.virtualTourImage === 'string') out.virtualTourImage = gallery.virtualTourImage
    if (Object.keys(out).length > 0) localStorage.setItem(key, JSON.stringify(out))
  } catch (_) {}
}

/** Liest Seitengestaltung (Bilder + optionale Texte). tenantId 'oeffentlich' = ök2. */
export function getPageContentGalerie(tenantId?: 'oeffentlich'): PageContentGalerie {
  if (tenantId !== 'oeffentlich') migrateFromStammdatenIfNeeded()
  try {
    const key = getStorageKey(tenantId)
    const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null
    if (raw && raw.length > 0) {
      const parsed = JSON.parse(raw) as Partial<PageContentGalerie>

      if (tenantId === 'oeffentlich') {
        // ök2: K2-Pfade die durch alten Bug hereingekommen sind → bereinigen
        let changed = false
        const k2Paths = ['/img/k2/', 'blob:', 'data:']
        if (k2Paths.some(p => parsed.welcomeImage?.startsWith(p))) {
          delete parsed.welcomeImage; changed = true
        }
        if (k2Paths.some(p => parsed.galerieCardImage?.startsWith(p))) {
          delete parsed.galerieCardImage; changed = true
        }
        if (k2Paths.some(p => parsed.virtualTourImage?.startsWith(p))) {
          delete parsed.virtualTourImage; changed = true
        }
        if (k2Paths.some(p => parsed.virtualTourVideo?.startsWith(p))) {
          delete parsed.virtualTourVideo; changed = true
        }
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

/** Speichert Seitengestaltung. tenantId 'oeffentlich' = ök2. */
export function setPageContentGalerie(data: Partial<PageContentGalerie>, tenantId?: 'oeffentlich'): void {
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
