/**
 * Seitentexte – bearbeitbare Texte pro Seite (Basis: "Textversion" der App).
 * K2: k2-page-texts. ök2 (Admin Design): k2-oeffentlich-page-texts.
 */
import { MUSTER_TEXTE, TENANT_CONFIGS } from './tenantConfig'

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
  /** Großer Titel unter dem Brand (editierbar aus Vorschau), z. B. Galeriename für diese Seite */
  heroTitle: string
  welcomeHeading: string
  welcomeSubtext: string
  /** Willkommenstext (Intro unter „Willkommen bei …“), editierbar aus Vorschau */
  welcomeIntroText: string
  /** Überschrift über den Events (z. B. „Aktuelles aus den Eventplanungen“) */
  eventSectionHeading: string
  /** Überschrift der Sektion Kunstschaffende */
  kunstschaffendeHeading: string
  /** Kurzbio Künstler:in 1 (z. B. Martina) */
  martinaBio: string
  /** Kurzbio Künstler:in 2 (z. B. Georg) */
  georgBio: string
  /** Absatz unter den Kunstschaffenden (z. B. „Gemeinsam eröffnen …“). Leer = wird aus Namen + Galeriename erzeugt. */
  gemeinsamText: string
  /** Button-Text Eingangshalle links (Standard: In die Galerie) */
  galerieButtonText: string
  /** Button-Text Eingangshalle rechts (Standard: Virtueller Rundgang) */
  virtualTourButtonText: string
}

export interface PageTextsConfig {
  start: StartPageTexts
  projectStart: ProjectStartPageTexts
  galerie: GaleriePageTexts
}

const STORAGE_KEY = 'k2-page-texts'
const STORAGE_KEY_OEFFENTLICH = 'k2-oeffentlich-page-texts'
const STORAGE_KEY_VK2 = 'k2-vk2-page-texts'

export type PageTextsTenantId = 'oeffentlich' | 'vk2' | undefined

function getStorageKey(tenantId?: PageTextsTenantId): string {
  if (tenantId === 'oeffentlich') return STORAGE_KEY_OEFFENTLICH
  if (tenantId === 'vk2') return STORAGE_KEY_VK2
  return STORAGE_KEY
}

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
    heroTitle: 'K2 Galerie',
    welcomeHeading: 'Willkommen bei',
    welcomeSubtext: 'Kunst & Keramik – Martina und Georg Kreinecker',
    welcomeIntroText: 'Ein Neuanfang mit Leidenschaft. Entdecke die Verbindung von Malerei und Keramik in einem Raum, wo Kunst zum Leben erwacht.',
    eventSectionHeading: 'Aktuelles aus den Eventplanungen',
    kunstschaffendeHeading: 'Die Kunstschaffenden',
    martinaBio: 'Martina bringt mit ihren Gemälden eine lebendige Vielfalt an Farben und Ausdruckskraft auf die Leinwand. ihre Werke spiegeln Jahre des Lernens, Experimentierens und der Leidenschaft für die Malerei wider.',
    georgBio: 'Georg verbindet in seiner Keramikarbeit technisches Können mit kreativer Gestaltung. Seine Arbeiten sind geprägt von Präzision und einer Liebe zum Detail, das Ergebnis von langjähriger Erfahrung.',
    gemeinsamText: '',
    galerieButtonText: 'In die Galerie',
    virtualTourButtonText: 'Virtueller Rundgang',
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

/** Defaults für ök2 (Galerie Muster). */
function getOeffentlichGalerieDefaults(): GaleriePageTexts {
  const tc = TENANT_CONFIGS.oeffentlich
  return {
    pageTitle: tc.galleryName,
    heroTitle: tc.galleryName,
    welcomeHeading: 'Willkommen bei',
    welcomeSubtext: tc.tagline,
    welcomeIntroText: MUSTER_TEXTE.welcomeText || defaults.galerie.welcomeIntroText,
    eventSectionHeading: defaults.galerie.eventSectionHeading,
    kunstschaffendeHeading: defaults.galerie.kunstschaffendeHeading,
    martinaBio: MUSTER_TEXTE.artist1Bio,
    georgBio: MUSTER_TEXTE.artist2Bio,
    gemeinsamText: MUSTER_TEXTE.gemeinsamText || '',
    galerieButtonText: 'In die Galerie',
    virtualTourButtonText: 'Virtueller Rundgang',
  }
}

/** Sichere Default-Kopie. tenantId 'oeffentlich' = Galerie-Defaults für ök2; 'vk2' = VK2. */
function getSafeDefaults(tenantId?: PageTextsTenantId): PageTextsConfig {
  const base = JSON.parse(JSON.stringify(defaults)) as PageTextsConfig
  if (tenantId === 'oeffentlich') base.galerie = { ...base.galerie, ...getOeffentlichGalerieDefaults() }
  return base
}

/** Liest Seitentexte. tenantId 'oeffentlich' = ök2 (k2-oeffentlich-page-texts); 'vk2' = VK2. */
export function getPageTexts(tenantId?: PageTextsTenantId): PageTextsConfig {
  const key = getStorageKey(tenantId)
  const d = getSafeDefaults(tenantId)
  let result: PageTextsConfig
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null
    if (raw && raw.length < 100000) {
      const saved = JSON.parse(raw) as Partial<PageTextsConfig>
      // ök2: K2-Echtnamen die durch alten Kontext-Bug hereingekommen sind → bereinigen
      if (tenantId === 'oeffentlich' && saved.galerie) {
        const oefDefaults = getOeffentlichGalerieDefaults()
        const k2Names = ['K2 Galerie', 'Martina Kreinecker', 'Georg Kreinecker', 'Kunst & Keramik – Martina und Georg Kreinecker']
        if (saved.galerie.heroTitle && k2Names.includes(saved.galerie.heroTitle)) {
          saved.galerie.heroTitle = oefDefaults.heroTitle
          saved.galerie.pageTitle = oefDefaults.pageTitle
          try { localStorage.setItem(key, JSON.stringify(saved)) } catch (_) {}
        }
        if (saved.galerie.welcomeSubtext && k2Names.includes(saved.galerie.welcomeSubtext)) {
          saved.galerie.welcomeSubtext = oefDefaults.welcomeSubtext
          try { localStorage.setItem(key, JSON.stringify(saved)) } catch (_) {}
        }
      }
      result = deepMerge(getSafeDefaults(tenantId), saved) as PageTextsConfig
    } else {
      result = getSafeDefaults(tenantId)
    }
  } catch (_) {
    result = getSafeDefaults(tenantId)
  }
  if (!result.start || typeof result.start !== 'object') result.start = d.start
  if (!Array.isArray(result.start.cards)) result.start = { ...d.start, ...result.start, cards: d.start.cards }
  if (!Array.isArray(result.start.quickLinks)) result.start = { ...d.start, ...result.start, quickLinks: d.start.quickLinks }
  if (!result.projectStart || typeof result.projectStart !== 'object') result.projectStart = d.projectStart
  if (!Array.isArray(result.projectStart.cards)) result.projectStart = { ...d.projectStart, ...result.projectStart, cards: d.projectStart.cards }
  if (!result.galerie || typeof result.galerie !== 'object') result.galerie = d.galerie
  else {
    result.galerie = { ...d.galerie, ...result.galerie } as GaleriePageTexts
    for (const k of Object.keys(d.galerie) as (keyof GaleriePageTexts)[]) {
      if (result.galerie[k] === undefined || result.galerie[k] === null) (result.galerie as unknown as Record<string, string>)[k] = d.galerie[k]
    }
  }
  return result
}

/** Speichert Seitentexte. tenantId 'oeffentlich' = ök2; 'vk2' = VK2. */
export function setPageTexts(config: PageTextsConfig, tenantId?: PageTextsTenantId) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(getStorageKey(tenantId), JSON.stringify(config))
    }
  } catch (e) {
    console.warn('Seitentexte speichern fehlgeschlagen:', e)
  }
}

export { defaults as defaultPageTexts }
