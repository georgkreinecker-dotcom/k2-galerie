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
  /** Größe des Virtual-Tour-Videos in Bytes (für Anzeige „X MB“ im Admin). */
  virtualTourVideoSizeBytes?: number
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
        // blob: URLs sind session-gebunden → nach Reload ungültig; NICHT löschen, damit „Speichern“ in derselben Session sichtbar bleibt
        if (parsed.welcomeImage?.startsWith('blob:')) { delete parsed.welcomeImage; changed = true }
        if (parsed.galerieCardImage?.startsWith('blob:')) { delete parsed.galerieCardImage; changed = true }
        if (parsed.virtualTourImage?.startsWith('blob:')) { delete parsed.virtualTourImage; changed = true }
        // virtualTourVideo blob nicht löschen → sonst wirkt Speichern nie (wird beim nächsten Lesen sofort wieder entfernt)
        if (changed) {
          try { localStorage.setItem(key, JSON.stringify({ ...parsed })) } catch (_) {}
        }
      } else if (tenantId === 'vk2') {
        // VK2: K2-Bild-URLs nie anzeigen/weitergeben – Key bereinigen falls korrupt
        let changed = false
        if (isK2OriginImageUrl(parsed.welcomeImage)) { delete parsed.welcomeImage; changed = true }
        if (isK2OriginImageUrl(parsed.galerieCardImage)) { delete parsed.galerieCardImage; changed = true }
        if (isK2OriginImageUrl(parsed.virtualTourImage)) { delete parsed.virtualTourImage; changed = true }
        if (isK2OriginImageUrl(parsed.virtualTourVideo)) { delete parsed.virtualTourVideo; changed = true }
        if (changed) {
          try { localStorage.setItem(key, JSON.stringify({ ...parsed })) } catch (_) {}
        }
      } else {
        // K2: VK2-Verunreinigung entfernen (Datenvermischung No-Go – BUG-038)
        let changed = false
        if (parsed.welcomeIntroText && (parsed.welcomeIntroText.includes('Mitglieder unseres Vereins') || parsed.welcomeIntroText.includes('Verein'))) {
          delete parsed.welcomeIntroText
          changed = true
        }
        try {
          const vk2Raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_VK2) : null
          if (vk2Raw && vk2Raw.length > 0) {
            const vk2Content = JSON.parse(vk2Raw) as Partial<PageContentGalerie>
            const imgFields: (keyof PageContentGalerie)[] = ['welcomeImage', 'galerieCardImage', 'virtualTourImage', 'virtualTourVideo']
            for (const k of imgFields) {
              const pv = parsed[k]
              const vv = vk2Content[k]
              if (typeof pv === 'string' && pv.trim() !== '' && pv === vv) {
                delete parsed[k]
                changed = true
              }
            }
          }
        } catch (_) {}
        // K2-Reparatur: Leere Bildfelder aus Stammdaten auffüllen (Willkommensbild etc.)
        try {
          const gallery = loadStammdaten('k2', 'gallery') as Record<string, unknown> | null
          if (gallery && typeof gallery === 'object') {
            if (!(parsed.welcomeImage && String(parsed.welcomeImage).trim()) && gallery.welcomeImage) {
              parsed.welcomeImage = gallery.welcomeImage as string
              changed = true
            }
            if (!(parsed.galerieCardImage && String(parsed.galerieCardImage).trim()) && gallery.galerieCardImage) {
              parsed.galerieCardImage = gallery.galerieCardImage as string
              changed = true
            }
            if (!(parsed.virtualTourImage && String(parsed.virtualTourImage).trim()) && gallery.virtualTourImage) {
              parsed.virtualTourImage = gallery.virtualTourImage as string
              changed = true
            }
          }
        } catch (_) {}
        if (changed) {
          try { localStorage.setItem(key, JSON.stringify({ ...parsed })) } catch (_) {}
        }
      }
      return { ...defaults, ...parsed }
    }
  } catch (_) {}
  return { ...defaults }
}

/**
 * Merge Server-Seitengestaltung mit lokal.
 * Eine Regel: Lokal befüllt = behalten. Server ersetzt nur, wo lokal leer ist.
 * Virtueller Rundgang: Video/Bild einmal wählen → speichern → Galerie zeigt es. Kein Überschreiben.
 */
export function mergePageContentGalerieFromServer(serverJson: string, tenantId?: 'oeffentlich' | 'vk2'): void {
  try {
    if (typeof window === 'undefined' || !serverJson || serverJson.length > 6 * 1024 * 1024) return
    const local = getPageContentGalerie(tenantId)
    let server: Partial<PageContentGalerie>
    try {
      server = JSON.parse(serverJson) as Partial<PageContentGalerie>
    } catch {
      return
    }
    const keys: (keyof PageContentGalerie)[] = ['welcomeImage', 'galerieCardImage', 'virtualTourImage', 'virtualTourVideo', 'virtualTourVideoSizeBytes', 'welcomeIntroText']
    const merged: Partial<PageContentGalerie> = {}
    for (const k of keys) {
      let l = local[k]
      let s = server[k]
      // Eisernes Gesetz: Keine K2-Daten in VK2. Vom Server nie K2-Bild-URLs übernehmen.
      if (tenantId === 'vk2' && isK2OriginImageUrl(s as string)) s = undefined
      const hasLocal = l != null && String(l).trim() !== ''
      const hasServer = s != null && String(s).trim() !== ''
      if (hasLocal || hasServer) (merged as Record<string, unknown>)[k] = hasLocal ? l : s
    }
    setPageContentGalerie(merged, tenantId)
  } catch (e) {
    console.warn('Seitengestaltung Merge fehlgeschlagen:', e)
  }
}

/** K2-Bild-URL (z. B. /img/k2/…) – darf nie in VK2/ök2 gespeichert oder angezeigt werden. */
function isK2OriginImageUrl(url: string | undefined): boolean {
  return typeof url === 'string' && url.includes('/img/k2/')
}

/** Für VK2-Anzeige: K2-URLs nie rendern – liefert '' wenn url K2-Origin ist, sonst url. */
export function getVk2SafeDisplayImageUrl(url: string | undefined): string {
  if (url == null || url === '') return ''
  return isK2OriginImageUrl(url) ? '' : url
}

/** VK2-Payload vor Veröffentlichen: K2-Bild-URLs aus Seitengestaltung entfernen, damit nie K2-Bilder veröffentlicht werden. */
export function sanitizePageContentForVk2Publish(obj: Partial<PageContentGalerie> | null | undefined): Partial<PageContentGalerie> | null {
  if (obj == null || typeof obj !== 'object') return obj ?? null
  const imgFields: (keyof PageContentGalerie)[] = ['welcomeImage', 'galerieCardImage', 'virtualTourImage', 'virtualTourVideo']
  const out = { ...obj }
  for (const k of imgFields) {
    const v = (out as Record<string, unknown>)[k]
    if (typeof v === 'string' && isK2OriginImageUrl(v)) (out as Record<string, unknown>)[k] = ''
  }
  return out
}

/** Speichert Seitengestaltung. tenantId 'oeffentlich' = ök2, 'vk2' = VK2. Gibt true zurück bei Erfolg, false bei Fehler (z. B. Quota) – Caller kann Meldung anzeigen. */
export function setPageContentGalerie(data: Partial<PageContentGalerie>, tenantId?: 'oeffentlich' | 'vk2'): boolean {
  try {
    if (typeof window !== 'undefined') {
      const current = getPageContentGalerie(tenantId)
      let next = { ...current, ...data }
      // Eisernes Gesetz: Keine K2-Daten in VK2. Beim Schreiben für VK2 K2-Bild-URLs durch bestehenden VK2-Wert ersetzen.
      if (tenantId === 'vk2') {
        const imgFields: (keyof PageContentGalerie)[] = ['welcomeImage', 'galerieCardImage', 'virtualTourImage', 'virtualTourVideo']
        for (const k of imgFields) {
          const val = next[k]
          if (typeof val === 'string' && isK2OriginImageUrl(val)) (next as Record<string, string | undefined>)[k] = (current[k] as string) ?? ''
        }
      }
      localStorage.setItem(getStorageKey(tenantId), JSON.stringify(next))
      // Events feuern damit GaleriePage (gleicher Tab) sofort aktualisiert – beide Events für K2 und ök2
      window.dispatchEvent(new CustomEvent('k2-oeffentlich-images-updated'))
      window.dispatchEvent(new CustomEvent('k2-design-saved-publish'))
      window.dispatchEvent(new CustomEvent('k2-page-content-updated'))
      return true
    }
    return true
  } catch (e) {
    console.warn('Seitengestaltung speichern fehlgeschlagen:', e)
    return false
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
