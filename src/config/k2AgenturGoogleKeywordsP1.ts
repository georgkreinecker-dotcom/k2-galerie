/**
 * P1 · Google Ads – Keyword-Liste Kunst & Galerie (Pilot, eine Quelle).
 * Weitere Mein-Weg-Sparten: k2AgenturGoogleKeywordsP1Sparten.ts
 */

import {
  formatGoogleKeywordsBlock,
  GOOGLE_NEGATIV_KEYWORDS_BASIS,
  type GoogleKeywordEintrag,
  type GoogleKeywordMatchTyp,
} from './k2AgenturGoogleKeywordsShared'

export type { GoogleKeywordMatchTyp }
export type GoogleKeywordP1Eintrag = GoogleKeywordEintrag & {
  gruppe: 'galerie' | 'verkauf' | 'auftritt'
}

export { GOOGLE_KEYWORD_MATCH_LABEL, googleKeywordAlsEingabe } from './k2AgenturGoogleKeywordsShared'

export const GOOGLE_KEYWORDS_P1: readonly GoogleKeywordP1Eintrag[] = [
  { prio: 1, suchbegriff: 'online galerie künstler', match: 'phrase', gruppe: 'galerie', hinweis: 'Kern-Intent' },
  { prio: 2, suchbegriff: 'eigene galerie online', match: 'phrase', gruppe: 'galerie' },
  { prio: 3, suchbegriff: 'kunst verkaufen online', match: 'phrase', gruppe: 'verkauf' },
  { prio: 4, suchbegriff: 'künstler website', match: 'phrase', gruppe: 'auftritt' },
  { prio: 5, suchbegriff: 'galerie für künstler', match: 'phrase', gruppe: 'galerie' },
  { prio: 6, suchbegriff: 'werke online präsentieren', match: 'phrase', gruppe: 'auftritt' },
  { prio: 7, suchbegriff: 'atelier website', match: 'phrase', gruppe: 'auftritt' },
  { prio: 8, suchbegriff: 'kunst galerie online', match: 'phrase', gruppe: 'galerie' },
  { prio: 9, suchbegriff: 'online ausstellung kunst', match: 'phrase', gruppe: 'galerie' },
  { prio: 10, suchbegriff: 'galerie software künstler', match: 'phrase', gruppe: 'galerie', hinweis: 'Software-Suche' },
  { prio: 11, suchbegriff: 'k2 galerie', match: 'exact', gruppe: 'galerie', hinweis: 'Marken-Suche' },
  { prio: 12, suchbegriff: 'künstler galerie online', match: 'broad', gruppe: 'galerie', hinweis: 'Nur 1× „weit“ testen' },
  { prio: 13, suchbegriff: 'kunst online verkaufen', match: 'broad', gruppe: 'verkauf', hinweis: 'Optional, Budget beobachten' },
] as const

export const GOOGLE_NEGATIV_KEYWORDS_P1_START: readonly string[] = [
  ...GOOGLE_NEGATIV_KEYWORDS_BASIS,
  'stockfoto',
  'stock foto',
  'foto drucken',
  'poster druck',
  'museum',
  'kunstmesse',
  'ticket',
  'wallpaper',
  'hintergrundbild',
]

export const K2_AGENTUR_KEYWORDS_P1_GOOGLE_DRUCK_URL =
  '/texte-schreibtisch/k2-agentur-keywords-p1-google.html'

export function getGoogleKeywordsP1Sorted(): GoogleKeywordP1Eintrag[] {
  return [...GOOGLE_KEYWORDS_P1].sort((a, b) => a.prio - b.prio)
}

export function formatGoogleKeywordsP1Block(): string {
  return formatGoogleKeywordsBlock({
    titel: 'Keywords P1 · Google Ads · Kunst & Galerie (Pilot)',
    keywords: GOOGLE_KEYWORDS_P1,
    negativ: GOOGLE_NEGATIV_KEYWORDS_P1_START,
  })
}
