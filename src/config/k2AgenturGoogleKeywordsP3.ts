/**
 * P3 · Google Ads – Keyword-Liste K2 Familie (eine Quelle).
 */

import {
  formatGoogleKeywordsBlock,
  GOOGLE_NEGATIV_KEYWORDS_BASIS,
  type GoogleKeywordEintrag,
} from './k2AgenturGoogleKeywordsShared'

export const K2_AGENTUR_KEYWORDS_P3_GOOGLE_DRUCK_URL =
  '/texte-schreibtisch/k2-agentur-keywords-p3-google.html'

export const GOOGLE_NEGATIV_KEYWORDS_P3_START: readonly string[] = [
  ...GOOGLE_NEGATIV_KEYWORDS_BASIS,
  'dating',
  'partnersuche',
  'adoption',
  'dna test billig',
  'ancestry',
  'wallpaper',
  'stockfoto',
]

export const GOOGLE_KEYWORDS_P3: readonly GoogleKeywordEintrag[] = [
  { prio: 1, suchbegriff: 'familienbuch digital', match: 'phrase', gruppe: 'chronik' },
  { prio: 2, suchbegriff: 'stammbaum online speichern', match: 'phrase', gruppe: 'stammbaum' },
  { prio: 3, suchbegriff: 'familienchronik digital', match: 'phrase', gruppe: 'chronik' },
  { prio: 4, suchbegriff: 'familien fotos privat sammeln', match: 'phrase', gruppe: 'fotos' },
  { prio: 5, suchbegriff: 'familiengeschichte dokumentieren', match: 'phrase', gruppe: 'chronik' },
  { prio: 6, suchbegriff: 'private familienwebsite', match: 'phrase', gruppe: 'auftritt' },
  { prio: 7, suchbegriff: 'familienarchiv digital', match: 'phrase', gruppe: 'archiv' },
  { prio: 8, suchbegriff: 'stammbaum app deutsch', match: 'phrase', gruppe: 'stammbaum' },
  { prio: 9, suchbegriff: 'genealogie software', match: 'phrase', gruppe: 'genealogie' },
  { prio: 10, suchbegriff: 'familienportal privat', match: 'phrase', gruppe: 'portal' },
  { prio: 11, suchbegriff: 'k2 familie', match: 'exact', gruppe: 'marke', hinweis: 'Marke' },
  { prio: 12, suchbegriff: 'familien erinnerungen online', match: 'broad', gruppe: 'fotos', hinweis: 'optional' },
] as const

export function formatGoogleKeywordsP3Block(): string {
  return formatGoogleKeywordsBlock({
    titel: 'Keywords P3 · Google Ads (K2 Familie)',
    keywords: GOOGLE_KEYWORDS_P3,
    negativ: GOOGLE_NEGATIV_KEYWORDS_P3_START,
  })
}
