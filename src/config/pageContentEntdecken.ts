/**
 * Eingangsseite (Entdecken) – öffentliche Seite; Inhalt bearbeiten nur im K2-Admin (Design → Eingangsseite / Eingangstor).
 * Speicher: k2-page-content-entdecken. Farben: aus k2-design-settings (K2-Design).
 */

import { saveEntdeckenHeroOverlay } from '../utils/entdeckenHeroOverlayStorage'
import { ENTDECKEN_HERO_DEFAULT_PATH } from './entdeckenHeroMedia'

const STORAGE_KEY = 'k2-page-content-entdecken'
const KEY_K2_DESIGN = 'k2-design-settings'

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
  /** Einladung zum Rundgang – sichtbar unter der Überschrift, einladender Ton */
  heroRundgangInvite?: string
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
  heroRundgangInvite:
    'Komm mit auf einen kurzen Rundgang – wir zeigen dir, wie deine Galerie wirkt.',
  heroSub: 'Wähle deinen Weg – dann siehst du sofort, was dich erwartet.',
  heroDeviceHint: 'Am besten auf Tablet oder PC – dann siehst du alles auf einen Blick.',
  cta: 'Rundgang starten →',
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

/** Gespeicherter Pfad / Standard-JPG (ohne IndexedDB-Overlay – das lädt die Seite asynchron). */
export function getEntdeckenHeroPathUrl(mergedOverrides?: Partial<PageContentEntdecken>): string {
  const base = getPageContentEntdecken()
  const merged = mergedOverrides ? { ...base, ...mergedOverrides } : base
  return (merged.heroImageUrl || '').trim() || ENTDECKEN_HERO_DEFAULT_PATH
}

/**
 * Nach Upload: Overlay in IndexedDB (Mac: zuverlässig; localStorage oft zu klein für data-URLs).
 */
export async function persistEntdeckenHeroOverlay(
  dataUrl: string,
  heroImageUrlOverride?: string
): Promise<void> {
  if (typeof window === 'undefined') return
  if (!dataUrl.startsWith('data:image/')) return
  await saveEntdeckenHeroOverlay(dataUrl, heroImageUrlOverride)
  window.dispatchEvent(new CustomEvent('k2-page-content-entdecken-updated'))
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
