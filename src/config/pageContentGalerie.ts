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
      // blob:-URLs sind geräte-spezifisch (z.B. vom Handy) – am Mac/anderen Gerät ungültig.
      // Automatisch durch die Vercel-URL ersetzen und im Storage korrigieren.
      if (parsed.virtualTourVideo?.startsWith('blob:')) {
        const fixed = '/img/k2/virtual-tour.mp4'
        parsed.virtualTourVideo = fixed
        try { localStorage.setItem(key, JSON.stringify({ ...parsed })) } catch (_) {}
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

/** Liefert die anzuzeigenden Bilder: zuerst aus Seitengestaltung, Fallback Stammdaten (für Abwärtskompatibilität). */
export function getGalerieImages(stammdatenGallery?: { welcomeImage?: string; galerieCardImage?: string; virtualTourImage?: string }): {
  welcomeImage: string
  galerieCardImage: string
  virtualTourImage: string
  virtualTourVideo: string
} {
  const page = getPageContentGalerie()
  // Wenn kein Video im localStorage → Vercel-Pfad als Fallback (z.B. am Mac nach Handy-Upload)
  const videoFallback = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')
    ? '/img/k2/virtual-tour.mp4'
    : ''
  return {
    welcomeImage: page.welcomeImage || stammdatenGallery?.welcomeImage || '',
    galerieCardImage: page.galerieCardImage || stammdatenGallery?.galerieCardImage || '',
    virtualTourImage: page.virtualTourImage || stammdatenGallery?.virtualTourImage || '',
    virtualTourVideo: page.virtualTourVideo || videoFallback
  }
}
