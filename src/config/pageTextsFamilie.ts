/**
 * K2 Familie – Seitentexte pro Tenant (Fertige Homepage).
 * Keys: k2-familie-{tenantId}-page-texts.
 * Analog zu pageTexts (Galerie), nur für Familie und pro tenantId.
 */

import { loadEinstellungen } from '../utils/familieStorage'

/** Muss mit seedFamilieHuber / familieHuberMuster übereinstimmen (Tenant huber). */
const HUBER_TENANT_ID = 'huber'
const HUBER_SEED_WELCOME_TITLE = 'Familie Huber'
const HUBER_SEED_WELCOME_SUBTITLE = 'Vier Generationen – bunt und verbunden'

export interface PageTextsFamilie {
  welcomeTitle: string
  welcomeSubtitle: string
  introText: string
  buttonStammbaum: string
  buttonEvents: string
  buttonKalender: string
}

const DEFAULT_TEXTS: PageTextsFamilie = {
  welcomeTitle: 'Unsere Familie',
  welcomeSubtitle: 'Zusammenleben sichtbar machen',
  introText: 'Jede Form des Zusammenlebens hat hier Platz – Stammbaum, Momente und gemeinsame Events.',
  buttonStammbaum: 'Stammbaum ansehen',
  buttonEvents: 'Events & Termine',
  buttonKalender: 'Kalender & Übersicht',
}

function getStorageKey(tenantId: string): string {
  return `k2-familie-${tenantId}-page-texts`
}

/** Liest Seitentexte für eine Familie. Fehlende Felder = Default. */
export function getFamilyPageTexts(tenantId: string): PageTextsFamilie {
  try {
    const key = getStorageKey(tenantId)
    const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null
    if (raw && raw.length > 0) {
      const parsed = JSON.parse(raw) as Partial<PageTextsFamilie>
      let welcomeTitle = parsed.welcomeTitle?.trim() || DEFAULT_TEXTS.welcomeTitle
      let welcomeSubtitle = parsed.welcomeSubtitle?.trim() || DEFAULT_TEXTS.welcomeSubtitle
      // Huber-Muster-Überschrift darf nicht unter echter familie-*-ID angezeigt werden (nur Anzeige; Speicher bleibt).
      if (tenantId !== HUBER_TENANT_ID) {
        if (welcomeTitle === HUBER_SEED_WELCOME_TITLE) {
          const name = loadEinstellungen(tenantId).familyDisplayName?.trim()
          welcomeTitle = name || DEFAULT_TEXTS.welcomeTitle
        }
        if (welcomeSubtitle === HUBER_SEED_WELCOME_SUBTITLE) {
          welcomeSubtitle = DEFAULT_TEXTS.welcomeSubtitle
        }
      }
      return {
        welcomeTitle,
        welcomeSubtitle,
        introText: parsed.introText?.trim() || DEFAULT_TEXTS.introText,
        buttonStammbaum: parsed.buttonStammbaum?.trim() || DEFAULT_TEXTS.buttonStammbaum,
        buttonEvents: parsed.buttonEvents?.trim() || DEFAULT_TEXTS.buttonEvents,
        buttonKalender: parsed.buttonKalender?.trim() || DEFAULT_TEXTS.buttonKalender,
      }
    }
  } catch (_) {}
  return { ...DEFAULT_TEXTS }
}

/** Speichert Seitentexte (nur nach expliziter User-Aktion). */
export function setFamilyPageTexts(tenantId: string, data: Partial<PageTextsFamilie>): void {
  try {
    const key = getStorageKey(tenantId)
    const prev = getFamilyPageTexts(tenantId)
    const next = { ...prev, ...data }
    localStorage.setItem(key, JSON.stringify(next))
  } catch (_) {}
}
