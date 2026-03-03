/**
 * i18n – Mehrsprachigkeit (Grundstein)
 * Aktuell: nur Deutsch. Weitere Sprachen = neue strings.{locale}.ts + Eintrag in messages.
 * Nutzung: import { t } from '../i18n'; <span>{t('medienspiegel.title')}</span>
 */

import { getLocale } from '../config/localeConfig'
import { stringsDe } from './strings.de'

type LocaleId = 'de' | 'en' | 'fr'

const messages: Record<LocaleId, Record<string, string>> = {
  de: stringsDe,
  en: {}, // später: import { stringsEn } from './strings.en'
  fr: {}, // später: import { stringsFr } from './strings.fr'
}

/** Fallback-Sprache, wenn Key in aktueller Sprache fehlt */
const FALLBACK_LOCALE: LocaleId = 'de'

/**
 * Übersetzung für Key abrufen.
 * Wenn Key in aktueller Sprache fehlt: Fallback (de), sonst Key selbst.
 */
export function t(key: string): string {
  const locale = getLocale()
  const map = messages[locale]
  if (map && key in map && map[key]) return map[key]
  const fallback = messages[FALLBACK_LOCALE]
  if (fallback && key in fallback && fallback[key]) return fallback[key]
  return key
}

