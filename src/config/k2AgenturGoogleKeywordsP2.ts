/**
 * P2 · Google Ads – Keyword-Liste VK2 (eine Quelle).
 */

import {
  formatGoogleKeywordsBlock,
  GOOGLE_NEGATIV_KEYWORDS_BASIS,
  type GoogleKeywordEintrag,
} from './k2AgenturGoogleKeywordsShared'

export const K2_AGENTUR_KEYWORDS_P2_GOOGLE_DRUCK_URL =
  '/texte-schreibtisch/k2-agentur-keywords-p2-google.html'

export const GOOGLE_NEGATIV_KEYWORDS_P2_START: readonly string[] = [
  ...GOOGLE_NEGATIV_KEYWORDS_BASIS,
  'sportverein',
  'fußballverein',
  'fussballverein',
  'turnverein',
  'fitnessverein',
  'musikschule',
  'schwimmverein',
  'ticket',
  'wm 2026',
]

export const GOOGLE_KEYWORDS_P2: readonly GoogleKeywordEintrag[] = [
  { prio: 1, suchbegriff: 'kunstverein website', match: 'phrase', gruppe: 'verein' },
  { prio: 2, suchbegriff: 'vereinsgalerie online', match: 'phrase', gruppe: 'galerie' },
  { prio: 3, suchbegriff: 'mitglieder galerie verein', match: 'phrase', gruppe: 'mitglieder' },
  { prio: 4, suchbegriff: 'kunstverein mitgliederliste', match: 'phrase', gruppe: 'mitglieder' },
  { prio: 5, suchbegriff: 'verein werke online präsentieren', match: 'phrase', gruppe: 'galerie' },
  { prio: 6, suchbegriff: 'kulturverein galerie', match: 'phrase', gruppe: 'verein' },
  { prio: 7, suchbegriff: 'malerverein website', match: 'phrase', gruppe: 'verein' },
  { prio: 8, suchbegriff: 'vereinsplattform kunst', match: 'phrase', gruppe: 'plattform' },
  { prio: 9, suchbegriff: 'verein events digital', match: 'phrase', gruppe: 'events' },
  { prio: 10, suchbegriff: 'kunstkreis online', match: 'phrase', gruppe: 'verein' },
  { prio: 11, suchbegriff: 'vereinskatalog online', match: 'phrase', gruppe: 'katalog' },
  { prio: 12, suchbegriff: 'verein öffentlichkeitsarbeit digital', match: 'broad', gruppe: 'pr', hinweis: 'Budget beobachten' },
] as const

export function formatGoogleKeywordsP2Block(): string {
  return formatGoogleKeywordsBlock({
    titel: 'Keywords P2 · Google Ads (VK2)',
    keywords: GOOGLE_KEYWORDS_P2,
    negativ: GOOGLE_NEGATIV_KEYWORDS_P2_START,
  })
}
