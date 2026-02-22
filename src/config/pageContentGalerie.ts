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
    if (raw && raw.length < 6 * 1024 * 1024) {
      const parsed = JSON.parse(raw) as Partial<PageContentGalerie>
      // blob:-URLs und Base64 sind geräte-spezifisch → NUR für K2 durch Vercel-Pfade ersetzen
      // ök2 bekommt keine K2-Bilder als Fallback!
      if (tenantId !== 'oeffentlich') {
        let changed = false
        if (parsed.virtualTourVideo?.startsWith('blob:')) {
          parsed.virtualTourVideo = '/img/k2/virtual-tour.mp4'; changed = true
        }
        if (parsed.welcomeImage?.startsWith('data:')) {
          parsed.welcomeImage = '/img/k2/willkommen.jpg'; changed = true
        }
        if (parsed.galerieCardImage?.startsWith('data:')) {
          parsed.galerieCardImage = '/img/k2/galerie-card.jpg'; changed = true
        }
        if (parsed.virtualTourImage?.startsWith('data:')) {
          parsed.virtualTourImage = '/img/k2/virtual-tour.jpg'; changed = true
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
