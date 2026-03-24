/**
 * Eingangsseite (Entdecken) – Design für alle, die zum ersten Mal kommen (ök2 + VK2).
 * Bild + Texte: Admin → Design → Eingangsseite. Farben: automatisch aus K2-Design (k2-design-settings).
 */

const STORAGE_KEY = 'k2-page-content-entdecken'
const KEY_K2_DESIGN = 'k2-design-settings'
/** Bis der nächste Vercel-Deploy die neue `entdecken-hero.jpg` ausliefert, zeigen wir dasselbe komprimierte Bild aus localStorage (neuer Tab / Entdecken prüfen). */
const HERO_OVERLAY_KEY = 'k2-entdecken-hero-dataurl-overlay'
const HERO_OVERLAY_TS_KEY = 'k2-entdecken-hero-overlay-ts'
const HERO_OVERLAY_MAX_MS = 48 * 3600 * 1000

export interface PageContentEntdecken {
  heroImageUrl?: string
  accent?: string
  accentGlow?: string
  accentLight?: string
  bgDark?: string
  bgMid?: string
  textLight?: string
  heroTag?: string
  heroTitle?: string
  heroSub?: string
  heroDeviceHint?: string
  cta?: string
  ctaSub?: string
}

const DEFAULTS: PageContentEntdecken = {
  accent: '#b54a1e',
  accentLight: '#d4622a',
  accentGlow: '#ff8c42',
  bgDark: '#120a06',
  bgMid: '#1e1008',
  textLight: '#fff8f0',
  heroSub: 'Wähle deinen Weg – dann siehst du sofort, was dich erwartet.',
  heroDeviceHint: 'Am besten auf Tablet oder PC – dann siehst du alles auf einen Blick.',
  cta: 'Jetzt entdecken →',
  ctaSub: 'Kostenlos · Keine Anmeldung · 1 Minute',
}

export function getPageContentEntdecken(): PageContentEntdecken {
  try {
    if (typeof window === 'undefined') return DEFAULTS
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw && raw.length > 0) {
      const parsed = JSON.parse(raw) as Partial<PageContentEntdecken>
      return { ...DEFAULTS, ...parsed }
    }
  } catch (_) {}
  return { ...DEFAULTS }
}

export function setPageContentEntdecken(data: Partial<PageContentEntdecken>): boolean {
  try {
    if (typeof window !== 'undefined') {
      const next = { ...getPageContentEntdecken(), ...data }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      window.dispatchEvent(new CustomEvent('k2-page-content-entdecken-updated'))
      return true
    }
    return true
  } catch (e) {
    console.warn('Eingangsseite speichern fehlgeschlagen:', e)
    return false
  }
}

/**
 * Hero-Bild-URL für die Entdecken-Seite: zuerst frisches Upload-Overlay (nach „Bild wählen“),
 * sonst gespeicherter Pfad. Ohne Overlay liefert Vercel bis zum Deploy noch die alte JPG – deshalb Overlay.
 */
export function getEntdeckenHeroDisplayUrl(mergedOverrides?: Partial<PageContentEntdecken>): string {
  try {
    if (typeof window !== 'undefined') {
      const ts = parseInt(localStorage.getItem(HERO_OVERLAY_TS_KEY) || '0', 10)
      const overlay = localStorage.getItem(HERO_OVERLAY_KEY)
      if (overlay && overlay.startsWith('data:image/') && ts > 0 && Date.now() - ts < HERO_OVERLAY_MAX_MS) {
        return overlay
      }
      if (overlay && ts > 0 && Date.now() - ts >= HERO_OVERLAY_MAX_MS) {
        localStorage.removeItem(HERO_OVERLAY_KEY)
        localStorage.removeItem(HERO_OVERLAY_TS_KEY)
      }
    }
  } catch (_) {
    /* ignore */
  }
  const base = getPageContentEntdecken()
  const merged = mergedOverrides ? { ...base, ...mergedOverrides } : base
  return (merged.heroImageUrl || '').trim() || '/img/oeffentlich/entdecken-hero.jpg'
}

/** Nach erfolgreichem Upload: gleiches Bild wie in der Admin-Vorschau auch unter /entdecken (alle Tabs dieses Geräts). */
export function setEntdeckenHeroOverlayDataUrl(dataUrl: string): void {
  try {
    if (typeof window === 'undefined') return
    if (!dataUrl.startsWith('data:image/')) return
    localStorage.setItem(HERO_OVERLAY_KEY, dataUrl)
    localStorage.setItem(HERO_OVERLAY_TS_KEY, String(Date.now()))
    window.dispatchEvent(new CustomEvent('k2-page-content-entdecken-updated'))
  } catch (e) {
    console.warn('Entdecken-Heldbild Sofort-Anzeige (Overlay) fehlgeschlagen:', e)
  }
}

/** Farben für die Eingangsseite: immer aus K2-Design (k2-design-settings). Keine eigenen Farben mehr. */
export function getEntdeckenColorsFromK2Design(): {
  accent: string
  accentLight: string
  accentGlow: string
  bgDark: string
  bgMid: string
  textLight: string
} {
  const fallback = {
    accent: DEFAULTS.accent!,
    accentLight: DEFAULTS.accentLight!,
    accentGlow: DEFAULTS.accentGlow!,
    bgDark: DEFAULTS.bgDark!,
    bgMid: DEFAULTS.bgMid!,
    textLight: DEFAULTS.textLight!,
  }
  try {
    if (typeof window === 'undefined') return fallback
    const raw = localStorage.getItem(KEY_K2_DESIGN)
    if (!raw || raw.length > 50000) return fallback
    const d = JSON.parse(raw) as Record<string, string>
    if (!d || typeof d !== 'object') return fallback
    const accent = (d.accentColor || '').trim() || fallback.accent
    const bgDark = (d.backgroundColor1 || '').trim() || fallback.bgDark
    const bgMid = (d.backgroundColor2 || '').trim() || fallback.bgMid
    const textLight = (d.textColor || '').trim() || fallback.textLight
    return {
      accent,
      accentLight: accent,
      accentGlow: accent,
      bgDark,
      bgMid,
      textLight,
    }
  } catch (_) {
    return fallback
  }
}
