/**
 * Seitentexte – bearbeitbare Texte pro Seite (Basis: "Textversion" der App).
 * Werte aus Einstellungen → Seitentexte; Fallback = diese Defaults.
 */

export type StartCard = { title: string; description: string; cta: string }
export type QuickLink = { label: string; anchor: string }

export interface StartPageTexts {
  headerTitle: string
  headerSubtitle: string
  headerHint: string
  cards: StartCard[]
  quickLinks: QuickLink[]
}

export interface ProjectStartPageTexts {
  headerTitle: string
  headerSubtitle: string
  cards: StartCard[]
}

export interface GaleriePageTexts {
  pageTitle: string
  welcomeHeading: string
  welcomeSubtext: string
}

export interface PageTextsConfig {
  start: StartPageTexts
  projectStart: ProjectStartPageTexts
  galerie: GaleriePageTexts
}

const STORAGE_KEY = 'k2-page-texts'

const defaults: PageTextsConfig = {
  start: {
    headerTitle: 'K2 Mission Deck',
    headerSubtitle: 'Direkter Zugriff auf alle Systeme – Galerie · KI · Mobile',
    headerHint: 'Desktop-Button „K2 Start“ öffnet genau diese Seite.',
    cards: [
      { title: 'Galerie', description: 'ök2 – Öffentliche K2 Galerie, Kunst & Keramik, Eröffnung, Werke.', cta: 'Öffnen →' },
      { title: 'Control-Studio', description: 'Komplettes Kommandozentrum inkl. KI-Agent, Launch-Plan und Aufgabenfeldern.', cta: 'Starten →' },
      { title: 'Mission Control', description: 'Übergeordnete Übersicht aller Projekte mit Status & Fortschritt.', cta: 'Öffnen →' },
      { title: 'Mobile-Connect', description: 'QR-Hub für iPhone/iPad, damit die Galerie wie eine App läuft.', cta: 'Zu Mobile →' },
    ],
    quickLinks: [
      { label: 'Mission Control', anchor: '/mission-control' },
      { label: 'Projekte', anchor: '/projects' },
      { label: 'KI-Agent', anchor: '/control-studio' },
      { label: 'API-Key', anchor: '/key' },
      { label: 'Kosten', anchor: '/kosten' },
    ],
  },
  projectStart: {
    headerTitle: 'Mission Deck',
    headerSubtitle: 'Direkter Zugriff auf alle Projekt-Systeme',
    cards: [
      { title: 'Galerie', description: 'ök2 – Öffentliche K2 Galerie, Kunst & Keramik, Eröffnung, Werke.', cta: 'Öffnen →' },
      { title: 'Control-Studio', description: 'Komplettes Kommandozentrum inkl. KI-Agent, Launch-Plan und Aufgabenfeldern.', cta: 'Starten →' },
      { title: 'Projektplan', description: 'Projekt-spezifische Planung mit Phasen, Aufgaben & Timeline.', cta: 'Öffnen →' },
      { title: 'Mobile-Connect', description: 'QR-Hub für iPhone/iPad, damit die Galerie wie eine App läuft.', cta: 'Zu Mobile →' },
    ],
  },
  galerie: {
    pageTitle: 'K2 Galerie',
    welcomeHeading: 'Willkommen',
    welcomeSubtext: 'Kunst & Keramik – Martina und Georg Kreinecker',
  },
}

function deepMerge<T>(target: T, source: Partial<T>): T {
  if (source === null || typeof source !== 'object') return target
  const out = { ...target }
  for (const key of Object.keys(source) as (keyof T)[]) {
    const s = (source as any)[key]
    if (s != null && typeof s === 'object' && !Array.isArray(s) && typeof (target as any)[key] === 'object') {
      (out as any)[key] = deepMerge((target as any)[key], s)
    } else if (s !== undefined) {
      (out as any)[key] = s
    }
  }
  return out
}

/** Sichere Default-Kopie (für Mobile/localStorage-Fehler immer gültige Struktur). */
function getSafeDefaults(): PageTextsConfig {
  return JSON.parse(JSON.stringify(defaults))
}

/** Liest gespeicherte Seitentexte aus localStorage und merged mit Defaults. Auf Mobile robust (localStorage kann fehlschlagen). */
export function getPageTexts(): PageTextsConfig {
  let result: PageTextsConfig
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    if (raw && raw.length < 100000) {
      const saved = JSON.parse(raw) as Partial<PageTextsConfig>
      result = deepMerge(getSafeDefaults(), saved) as PageTextsConfig
    } else {
      result = getSafeDefaults()
    }
  } catch (_) {
    result = getSafeDefaults()
  }
  // Garantiere gültige Struktur (z. B. nach korruptem Save oder Mobile-Einschränkungen)
  const d = getSafeDefaults()
  if (!result.start || typeof result.start !== 'object') result.start = d.start
  if (!Array.isArray(result.start.cards)) result.start = { ...d.start, ...result.start, cards: d.start.cards }
  if (!Array.isArray(result.start.quickLinks)) result.start = { ...d.start, ...result.start, quickLinks: d.start.quickLinks }
  if (!result.projectStart || typeof result.projectStart !== 'object') result.projectStart = d.projectStart
  if (!Array.isArray(result.projectStart.cards)) result.projectStart = { ...d.projectStart, ...result.projectStart, cards: d.projectStart.cards }
  if (!result.galerie || typeof result.galerie !== 'object') result.galerie = d.galerie
  return result
}

/** Speichert Seitentexte in localStorage (wird normalerweise aus den Einstellungen aufgerufen). */
export function setPageTexts(config: PageTextsConfig) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    }
  } catch (e) {
    console.warn('Seitentexte speichern fehlgeschlagen:', e)
  }
}

export { defaults as defaultPageTexts }
