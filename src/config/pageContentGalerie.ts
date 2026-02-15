/**
 * Seitengestaltung: Willkommensseite & Galerie-Vorschau
 * Texte und Bilder für diese Seiten – getrennt von Stammdaten (hochsensibel, streng geschützt).
 * Gespeichert in k2-page-content-galerie, nicht in k2-stammdaten-galerie.
 */

const STORAGE_KEY = 'k2-page-content-galerie'

export interface PageContentGalerie {
  welcomeImage?: string
  galerieCardImage?: string
  virtualTourImage?: string
  welcomeIntroText?: string
}

const defaults: PageContentGalerie = {}

/** Einmal-Migration: Bilder aus Stammdaten in Seitengestaltung übernehmen, falls Seitengestaltung leer ist. */
function migrateFromStammdatenIfNeeded(): void {
  try {
    const existing = localStorage.getItem(STORAGE_KEY)
    if (existing && existing.length > 10) return // bereits befüllt
    const raw = localStorage.getItem('k2-stammdaten-galerie')
    if (!raw) return
    const gallery = JSON.parse(raw) as Record<string, unknown>
    const out: PageContentGalerie = {}
    if (gallery.welcomeImage && typeof gallery.welcomeImage === 'string') out.welcomeImage = gallery.welcomeImage
    if (gallery.galerieCardImage && typeof gallery.galerieCardImage === 'string') out.galerieCardImage = gallery.galerieCardImage
    if (gallery.virtualTourImage && typeof gallery.virtualTourImage === 'string') out.virtualTourImage = gallery.virtualTourImage
    if (Object.keys(out).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(out))
    }
  } catch (_) {}
}

/** Liest Seitengestaltung (Bilder + optionale Texte). Führt einmal Migration aus Stammdaten durch, falls leer. */
export function getPageContentGalerie(): PageContentGalerie {
  migrateFromStammdatenIfNeeded()
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    if (raw && raw.length < 6 * 1024 * 1024) {
      const parsed = JSON.parse(raw) as Partial<PageContentGalerie>
      return { ...defaults, ...parsed }
    }
  } catch (_) {}
  return { ...defaults }
}

/** Speichert Seitengestaltung (nur dieser Key, Stammdaten werden nicht angetastet). */
export function setPageContentGalerie(data: Partial<PageContentGalerie>): void {
  try {
    if (typeof window !== 'undefined') {
      const current = getPageContentGalerie()
      const next = { ...current, ...data }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    }
  } catch (e) {
    console.warn('Seitengestaltung speichern fehlgeschlagen:', e)
  }
}

/** Liefert die anzuzeigenden Bilder: zuerst aus Seitengestaltung, Fallback Stammdaten (für Abwärtskompatibilität). */
export function getGalerieImages(stammdatenGallery?: { welcomeImage?: string; galerieCardImage?: string; virtualTourImage?: string }): {
  welcomeImage: string
  galerieCardImage: string
  virtualTourImage: string
} {
  const page = getPageContentGalerie()
  return {
    welcomeImage: page.welcomeImage ?? stammdatenGallery?.welcomeImage ?? '',
    galerieCardImage: page.galerieCardImage ?? stammdatenGallery?.galerieCardImage ?? '',
    virtualTourImage: page.virtualTourImage ?? stammdatenGallery?.virtualTourImage ?? ''
  }
}
