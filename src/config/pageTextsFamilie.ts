/**
 * K2 Familie – Seitentexte pro Tenant (Fertige Homepage).
 * Keys: k2-familie-{tenantId}-page-texts.
 * Analog zu pageTexts (Galerie), nur für Familie und pro tenantId.
 */

import { FAMILIE_HUBER_TENANT_ID } from '../data/k2FamilieMusterHuberQuelle'
import { loadEinstellungen } from '../utils/familieStorage'
import { isFamilieMusterHuberDemoReadOnly } from '../utils/familieMusterWriteGuard'
/** Früher „Familie Huber“ – in Sanitize und Migration noch erkannt. */
const HUBER_LEGACY_WELCOME_TITLE = 'Familie Huber'
const HUBER_SEED_WELCOME_TITLE = 'Musterfamilie Huber'
const HUBER_SEED_WELCOME_SUBTITLE = 'Vier Generationen – bunt und verbunden'

function normalizePageText(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

/** Muster-Huber-Titel-Varianten (Tippfehler, Groß/klein) – niemals unter echter mandanten-ID anzeigen. */
function isHuberDemoWelcomeTitleLooksLike(welcomeTitle: string): boolean {
  const k = normalizePageText(welcomeTitle)
  return k === 'musterfamilie huber' || k === 'familie huber'
}

function isHuberDemoWelcomeSubtitleLooksLike(welcomeSubtitle: string): boolean {
  if (welcomeSubtitle === HUBER_SEED_WELCOME_SUBTITLE) return true
  const norm = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[\u2013\u2014-]/g, '-')
  return norm(welcomeSubtitle) === norm(HUBER_SEED_WELCOME_SUBTITLE)
}

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
      if (tenantId === FAMILIE_HUBER_TENANT_ID && welcomeTitle === HUBER_LEGACY_WELCOME_TITLE) {
        welcomeTitle = HUBER_SEED_WELCOME_TITLE
      }
      // Huber-Muster-Überschrift darf nicht unter echter familie-*-ID angezeigt werden (nur Anzeige; Speicher bleibt).
      if (tenantId !== FAMILIE_HUBER_TENANT_ID) {
        if (
          welcomeTitle === HUBER_SEED_WELCOME_TITLE ||
          welcomeTitle === HUBER_LEGACY_WELCOME_TITLE ||
          isHuberDemoWelcomeTitleLooksLike(welcomeTitle)
        ) {
          const name = loadEinstellungen(tenantId).familyDisplayName?.trim()
          welcomeTitle = name || DEFAULT_TEXTS.welcomeTitle
        }
        if (isHuberDemoWelcomeSubtitleLooksLike(welcomeSubtitle)) {
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

/** Nach Cloud-Laden: nur gesetzte Server-Felder anwenden (Partials). */
export function mergeFamilyPageTextsFromServer(
  local: PageTextsFamilie,
  server: Partial<PageTextsFamilie> | null | undefined
): PageTextsFamilie {
  if (!server || typeof server !== 'object') return local
  return { ...local, ...server }
}

/** Speichert Seitentexte (nur nach expliziter User-Aktion). */
export function setFamilyPageTexts(
  tenantId: string,
  data: Partial<PageTextsFamilie>,
  opts?: { skipMusterDemoGuard?: boolean }
): void {
  try {
    if (!opts?.skipMusterDemoGuard && isFamilieMusterHuberDemoReadOnly(tenantId)) {
      console.warn('⚠️ pageTextsFamilie: Musterfamilie (Demo-Sitzung) ist nur lesend')
      return
    }
    const key = getStorageKey(tenantId)
    const prev = getFamilyPageTexts(tenantId)
    const next = { ...prev, ...data }
    localStorage.setItem(key, JSON.stringify(next))
  } catch (_) {}
}
