/**
 * Mehrsprachigkeit – Grundstein
 * Eine aktivierte Sprache, erweiterbar auf weitere (en, fr, …).
 * UI-Texte schrittweise in src/i18n/strings.*.ts auslagern und über t(key) nutzen.
 */

export type LocaleId = 'de' | 'en' | 'fr'

/** Unterstützte Sprachen (Sprachcode → Anzeigename) */
export const SUPPORTED_LOCALES: Record<LocaleId, string> = {
  de: 'Deutsch',
  en: 'English',
  fr: 'Français',
}

/** Standard-Sprache der App (aktuell einzige aktiv genutzte) */
export const DEFAULT_LOCALE: LocaleId = 'de'

/** localStorage-Key für Nutzer-Präferenz (später: Sprachumschaltung) */
export const LOCALE_STORAGE_KEY = 'k2-locale'

/**
 * Aktuelle Locale lesen (später: aus Context/Storage; jetzt immer DEFAULT_LOCALE)
 */
export function getLocale(): LocaleId {
  if (typeof window === 'undefined') return DEFAULT_LOCALE
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as LocaleId | null
    if (stored && stored in SUPPORTED_LOCALES) return stored
  } catch (_) {}
  return DEFAULT_LOCALE
}

/**
 * Locale setzen (für spätere Sprachumschaltung; speichert in localStorage)
 */
export function setLocale(locale: LocaleId): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('locale-change'))
  } catch (_) {}
}
