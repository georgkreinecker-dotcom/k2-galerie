/**
 * Lokal Eferding · Google Ads – Keywords (2 Anzeigengruppen).
 */
import {
  formatGoogleKeywordsBlock,
  GOOGLE_NEGATIV_KEYWORDS_BASIS,
  type GoogleKeywordEintrag,
} from './k2AgenturGoogleKeywordsShared'

export type GoogleKeywordLokalEferdingGruppe = 'samstag' | 'gruppen'

export const GOOGLE_NEGATIV_KEYWORDS_LOKAL_EFERDING: readonly string[] = [
  ...GOOGLE_NEGATIV_KEYWORDS_BASIS,
  'software',
  'online galerie erstellen',
  'website erstellen',
  'lizenz',
  'app',
  'kostenlos',
  'stockfoto',
  'museum wien',
  'kunstmesse',
  'ticket',
  'wallpaper',
  'poster druck',
  'jobs',
  'stellenangebot',
]

/** Anzeigengruppe 1 · Samstag & Galeriebesuch */
export const GOOGLE_KEYWORDS_LOKAL_EFERDING_SAMSTAG: readonly GoogleKeywordEintrag[] = [
  { prio: 1, suchbegriff: 'galerie eferding', match: 'phrase', gruppe: 'samstag', hinweis: 'Kern' },
  { prio: 2, suchbegriff: 'kunst eferding', match: 'phrase', gruppe: 'samstag' },
  { prio: 3, suchbegriff: 'keramik eferding', match: 'phrase', gruppe: 'samstag' },
  { prio: 4, suchbegriff: 'k2 galerie', match: 'exact', gruppe: 'samstag', hinweis: 'Marke' },
  { prio: 5, suchbegriff: 'k2 galerie eferding', match: 'phrase', gruppe: 'samstag' },
  { prio: 6, suchbegriff: 'ausstellung eferding', match: 'phrase', gruppe: 'samstag' },
  { prio: 7, suchbegriff: 'galerie oberösterreich', match: 'phrase', gruppe: 'samstag', hinweis: 'Budget beobachten' },
  { prio: 8, suchbegriff: 'keramik oberösterreich', match: 'phrase', gruppe: 'samstag', hinweis: 'optional' },
] as const

/** Anzeigengruppe 2 · Gruppen & Termin */
export const GOOGLE_KEYWORDS_LOKAL_EFERDING_GRUPPEN: readonly GoogleKeywordEintrag[] = [
  { prio: 1, suchbegriff: 'gruppenausflug oberösterreich', match: 'phrase', gruppe: 'gruppen', hinweis: 'Kern' },
  { prio: 2, suchbegriff: 'verein ausflug oberösterreich', match: 'phrase', gruppe: 'gruppen' },
  { prio: 3, suchbegriff: 'senioren ausflug oberösterreich', match: 'phrase', gruppe: 'gruppen' },
  { prio: 4, suchbegriff: 'programmpunkt verein', match: 'phrase', gruppe: 'gruppen' },
  { prio: 5, suchbegriff: 'kunstführung gruppe', match: 'phrase', gruppe: 'gruppen' },
  { prio: 6, suchbegriff: 'galerie besuch gruppe', match: 'phrase', gruppe: 'gruppen' },
  { prio: 7, suchbegriff: 'club programm kunst', match: 'phrase', gruppe: 'gruppen', hinweis: 'optional' },
  { prio: 8, suchbegriff: 'pensionistenverein ausflug', match: 'phrase', gruppe: 'gruppen', hinweis: 'optional' },
] as const

export const GOOGLE_KEYWORDS_LOKAL_EFERDING: readonly GoogleKeywordEintrag[] = [
  ...GOOGLE_KEYWORDS_LOKAL_EFERDING_SAMSTAG,
  ...GOOGLE_KEYWORDS_LOKAL_EFERDING_GRUPPEN,
] as const

export function formatGoogleKeywordsLokalEferdingBlock(): string {
  return formatGoogleKeywordsBlock({
    titel: 'Keywords Lokal Eferding · Google Ads (2 Anzeigengruppen)',
    keywords: GOOGLE_KEYWORDS_LOKAL_EFERDING,
    negativ: GOOGLE_NEGATIV_KEYWORDS_LOKAL_EFERDING,
    fussHinweis:
      'Anzeigengruppe „Samstag & Galerie“ = gruppe samstag · „Gruppen & Termin“ = gruppe gruppen. Kein Lizenz-Conversion-Ziel – Besuch /galerie zählt.',
  })
}
