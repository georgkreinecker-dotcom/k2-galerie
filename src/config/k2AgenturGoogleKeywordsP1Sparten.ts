/**
 * P1 · Google Ads – Keywords je Mein-Weg-Sparte (ohne Kunst – die liegt in k2AgenturGoogleKeywordsP1.ts).
 */

import type { FocusDirectionId } from './tenantConfig'
import { buildMarketingKanalUrl } from './marketingKanalP1P2P3'
import {
  formatGoogleKeywordsBlock,
  GOOGLE_NEGATIV_KEYWORDS_BASIS,
  googleKeywordAlsEingabe,
  sortKeywordsByPrio,
  type GoogleKeywordEintrag,
} from './k2AgenturGoogleKeywordsShared'

export const K2_AGENTUR_KEYWORDS_P1_SPARTEN_DRUCK_URL =
  '/texte-schreibtisch/k2-agentur-keywords-p1-sparten.html'

const NEGATIV_SPARTEN: readonly string[] = [
  ...GOOGLE_NEGATIV_KEYWORDS_BASIS,
  'museum',
  'kunstmesse',
  'stockfoto',
  'poster druck',
  'wallpaper',
]

export const GOOGLE_KEYWORDS_P1_HANDWERK: readonly GoogleKeywordEintrag[] = [
  { prio: 1, suchbegriff: 'handwerk online verkaufen', match: 'phrase', gruppe: 'verkauf' },
  { prio: 2, suchbegriff: 'manufaktur online shop', match: 'phrase', gruppe: 'shop' },
  { prio: 3, suchbegriff: 'werkstatt katalog online', match: 'phrase', gruppe: 'katalog' },
  { prio: 4, suchbegriff: 'handwerksprodukte verkaufen', match: 'phrase', gruppe: 'verkauf' },
  { prio: 5, suchbegriff: 'kleine manufaktur website', match: 'phrase', gruppe: 'auftritt' },
  { prio: 6, suchbegriff: 'handwerk produktkatalog', match: 'phrase', gruppe: 'katalog' },
  { prio: 7, suchbegriff: 'manufaktur etiketten', match: 'phrase', gruppe: 'etikett' },
  { prio: 8, suchbegriff: 'handwerk kassa online', match: 'phrase', gruppe: 'kassa' },
  { prio: 9, suchbegriff: 'handmade shop erstellen', match: 'phrase', gruppe: 'shop' },
  { prio: 10, suchbegriff: 'handwerk messe online katalog', match: 'broad', gruppe: 'katalog', hinweis: 'optional' },
] as const

export const GOOGLE_KEYWORDS_P1_DESIGN: readonly GoogleKeywordEintrag[] = [
  { prio: 1, suchbegriff: 'design kollektion online', match: 'phrase', gruppe: 'kollektion' },
  { prio: 2, suchbegriff: 'möbel showroom online', match: 'phrase', gruppe: 'showroom' },
  { prio: 3, suchbegriff: 'design studio website', match: 'phrase', gruppe: 'auftritt' },
  { prio: 4, suchbegriff: 'leuchten design verkauf online', match: 'phrase', gruppe: 'verkauf' },
  { prio: 5, suchbegriff: 'accessoires online präsentieren', match: 'phrase', gruppe: 'katalog' },
  { prio: 6, suchbegriff: 'möbel kollektion präsentieren', match: 'phrase', gruppe: 'kollektion' },
  { prio: 7, suchbegriff: 'design produkte katalog', match: 'phrase', gruppe: 'katalog' },
  { prio: 8, suchbegriff: 'einrichtungsdesign online shop', match: 'phrase', gruppe: 'shop' },
  { prio: 9, suchbegriff: 'design label website', match: 'phrase', gruppe: 'auftritt' },
  { prio: 10, suchbegriff: 'möbel design online verkaufen', match: 'broad', gruppe: 'verkauf', hinweis: 'optional' },
] as const

export const GOOGLE_KEYWORDS_P1_MODE: readonly GoogleKeywordEintrag[] = [
  { prio: 1, suchbegriff: 'mode kollektion online', match: 'phrase', gruppe: 'kollektion' },
  { prio: 2, suchbegriff: 'kleinserie mode verkaufen', match: 'phrase', gruppe: 'verkauf' },
  { prio: 3, suchbegriff: 'fashion label website', match: 'phrase', gruppe: 'auftritt' },
  { prio: 4, suchbegriff: 'mode pop up katalog', match: 'phrase', gruppe: 'katalog' },
  { prio: 5, suchbegriff: 'kleidung kollektion präsentieren', match: 'phrase', gruppe: 'kollektion' },
  { prio: 6, suchbegriff: 'mode etiketten drucken', match: 'phrase', gruppe: 'etikett' },
  { prio: 7, suchbegriff: 'designer mode online shop', match: 'phrase', gruppe: 'shop' },
  { prio: 8, suchbegriff: 'mode lookbook online', match: 'phrase', gruppe: 'katalog' },
  { prio: 9, suchbegriff: 'nachhaltige mode kleinserie', match: 'phrase', gruppe: 'verkauf' },
  { prio: 10, suchbegriff: 'mode marke online verkaufen', match: 'broad', gruppe: 'verkauf', hinweis: 'optional' },
] as const

export const GOOGLE_KEYWORDS_P1_FOOD: readonly GoogleKeywordEintrag[] = [
  { prio: 1, suchbegriff: 'direktvermarktung online shop', match: 'phrase', gruppe: 'verkauf' },
  { prio: 2, suchbegriff: 'manufaktur lebensmittel verkaufen', match: 'phrase', gruppe: 'verkauf' },
  { prio: 3, suchbegriff: 'hofladen online shop', match: 'phrase', gruppe: 'shop' },
  { prio: 4, suchbegriff: 'spezialitäten online verkaufen', match: 'phrase', gruppe: 'verkauf' },
  { prio: 5, suchbegriff: 'food produkte katalog', match: 'phrase', gruppe: 'katalog' },
  { prio: 6, suchbegriff: 'regionale produkte online shop', match: 'phrase', gruppe: 'shop' },
  { prio: 7, suchbegriff: 'manufaktur etiketten lebensmittel', match: 'phrase', gruppe: 'etikett' },
  { prio: 8, suchbegriff: 'direktvermarkter website', match: 'phrase', gruppe: 'auftritt' },
  { prio: 9, suchbegriff: 'genuss produkte online präsentieren', match: 'phrase', gruppe: 'katalog' },
  { prio: 10, suchbegriff: 'kleine manufaktur food shop', match: 'broad', gruppe: 'shop', hinweis: 'optional' },
] as const

export const GOOGLE_KEYWORDS_P1_DIENSTLEISTER: readonly GoogleKeywordEintrag[] = [
  { prio: 1, suchbegriff: 'portfolio website dienstleister', match: 'phrase', gruppe: 'portfolio' },
  { prio: 2, suchbegriff: 'referenzprojekte online zeigen', match: 'phrase', gruppe: 'portfolio' },
  { prio: 3, suchbegriff: 'agentur portfolio online', match: 'phrase', gruppe: 'portfolio' },
  { prio: 4, suchbegriff: 'projektgalerie website', match: 'phrase', gruppe: 'galerie' },
  { prio: 5, suchbegriff: 'dienstleister galerie online', match: 'phrase', gruppe: 'galerie' },
  { prio: 6, suchbegriff: 'arbeiten online präsentieren', match: 'phrase', gruppe: 'portfolio' },
  { prio: 7, suchbegriff: 'kreativ portfolio website', match: 'phrase', gruppe: 'portfolio' },
  { prio: 8, suchbegriff: 'case studies online galerie', match: 'phrase', gruppe: 'referenzen' },
  { prio: 9, suchbegriff: 'freelancer portfolio shop', match: 'phrase', gruppe: 'shop' },
  { prio: 10, suchbegriff: 'dienstleister referenzen online', match: 'broad', gruppe: 'referenzen', hinweis: 'optional' },
] as const

export type P1SparteKeywordId = Exclude<FocusDirectionId, 'kunst'>

const SPARTE_KEYWORDS: Record<P1SparteKeywordId, readonly GoogleKeywordEintrag[]> = {
  handwerk: GOOGLE_KEYWORDS_P1_HANDWERK,
  design: GOOGLE_KEYWORDS_P1_DESIGN,
  mode: GOOGLE_KEYWORDS_P1_MODE,
  food: GOOGLE_KEYWORDS_P1_FOOD,
  dienstleister: GOOGLE_KEYWORDS_P1_DIENSTLEISTER,
}

const SPARTE_LABEL: Record<P1SparteKeywordId, string> = {
  handwerk: 'Handwerk & Manufaktur',
  design: 'Design & Möbel',
  mode: 'Mode & Kleinserien',
  food: 'Food & Genuss',
  dienstleister: 'Dienstleister & Portfolio',
}

export function getP1SparteKeywords(sparte: P1SparteKeywordId): readonly GoogleKeywordEintrag[] {
  return SPARTE_KEYWORDS[sparte]
}

export function formatGoogleKeywordsP1SparteBlock(sparte: P1SparteKeywordId): string {
  return formatGoogleKeywordsBlock({
    titel: `Keywords P1 · Google · ${SPARTE_LABEL[sparte]}`,
    keywords: SPARTE_KEYWORDS[sparte],
    negativ: NEGATIV_SPARTEN,
  })
}

/** Alle fünf Sparten in einem Kopierblock (für Planung / Agentur). */
export function formatGoogleKeywordsP1AlleSpartenBlock(): string {
  const parts: string[] = ['── Keywords P1 · Mein Weg (5 Sparten, ohne Kunst-Pilot) ──', '']
  const sparten: P1SparteKeywordId[] = ['handwerk', 'design', 'mode', 'food', 'dienstleister']
  for (const s of sparten) {
    parts.push(formatGoogleKeywordsP1SparteBlock(s), '')
  }
  parts.push('Kunst-Pilot: siehe Keywords P1 · Kunst (k2-agentur-keywords-p1-google.html)', '── Ende alle Sparten ──')
  return parts.join('\n')
}

/** Phase B: je Sparte Top-N Keywords (Priorität 1–N), nicht alle 50 in eine Gruppe. */
export const P1_GOOGLE_SPARTE_KEYWORD_TOP = 8

const P1_SPARTEN_ORDER: readonly P1SparteKeywordId[] = [
  'handwerk',
  'design',
  'mode',
  'food',
  'dienstleister',
]

export function getP1SparteKeywordsTopForGoogle(
  sparte: P1SparteKeywordId,
  top = P1_GOOGLE_SPARTE_KEYWORD_TOP,
): GoogleKeywordEintrag[] {
  return sortKeywordsByPrio(SPARTE_KEYWORDS[sparte]).slice(0, top)
}

export function buildP1SparteGoogleCampaignKey(sparte: P1SparteKeywordId): string {
  return `p1-google-${sparte}-2026q2`
}

export type P1SparteGoogleAdGroupPlan = {
  sparte: P1SparteKeywordId
  label: string
  anzeigengruppeName: string
  campaignKey: string
  keywordCount: number
}

export function listP1SparteGoogleAdGroupPlans(): readonly P1SparteGoogleAdGroupPlan[] {
  return P1_SPARTEN_ORDER.map((sparte) => ({
    sparte,
    label: SPARTE_LABEL[sparte],
    anzeigengruppeName: `P1 · ${SPARTE_LABEL[sparte]}`,
    campaignKey: buildP1SparteGoogleCampaignKey(sparte),
    keywordCount: getP1SparteKeywordsTopForGoogle(sparte).length,
  }))
}

/** Ein Kopierblock pro Sparte → neue Anzeigengruppe in Google Ads. */
export function formatGoogleKeywordsP1SparteAnzeigengruppePaket(
  sparte: P1SparteKeywordId,
  landingUrl?: string,
): string {
  const landing = landingUrl ?? buildMarketingKanalUrl('p1', 'google')
  const keywords = getP1SparteKeywordsTopForGoogle(sparte)
  const lines: string[] = [
    `── P1 · Google Ads · Anzeigengruppe: ${SPARTE_LABEL[sparte]} (Phase B) ──`,
    '',
    'Phase B: Erst wenn Kunst-Pilot (13 Keywords) 7–14 Tage lief.',
    'Eigene Anzeigengruppe – nicht in die Kunst-Liste mischen.',
    '',
    `Anzeigengruppe (Vorschlag): P1 · ${SPARTE_LABEL[sparte]}`,
    `Kampagnen-Key (k= / utm_campaign): ${buildP1SparteGoogleCampaignKey(sparte)}`,
    `Final URL: ${landing}`,
    '',
    `Keywords (Top ${P1_GOOGLE_SPARTE_KEYWORD_TOP} · eine Zeile = ein Eintrag):`,
    ...keywords.map((k) => googleKeywordAlsEingabe(k.suchbegriff, k.match)),
    '',
    '── Negativ-Keywords (Start) ──',
    NEGATIV_SPARTEN.join(', '),
    '',
    'Anzeigentext: „Fertige Anzeige“ P1 · Google aus der Checkliste.',
    '── Ende Anzeigengruppe ──',
  ]
  return lines.join('\n')
}

/** Übersicht aller 5 Sparten-Anzeigengruppen (Planung). */
export function formatGoogleKeywordsP1SpartenPhaseBPlan(landingUrl?: string): string {
  const landing = landingUrl ?? buildMarketingKanalUrl('p1', 'google')
  const parts: string[] = [
    '── P1 · Google · Phase B · 5 Sparten (Mein Weg) ──',
    '',
    'Jede Sparte = eigene Anzeigengruppe (8 Keywords, Prio 1–8).',
    'Nicht alle ~50 Begriffe in die Kunst-Anzeigengruppe.',
    `Landing ök2-Demo: ${landing}`,
    '',
    'Übersicht:',
  ]
  for (const plan of listP1SparteGoogleAdGroupPlans()) {
    parts.push(
      `• ${plan.label} → Anzeigengruppe „${plan.anzeigengruppeName}“ · ${plan.campaignKey} · ${plan.keywordCount} Keywords`,
    )
  }
  parts.push(
    '',
    'Einzeln kopieren: K2 Agentur → Strategie & Keywords → Phase B je Sparte.',
    '── Ende Phase B Plan ──',
  )
  return parts.join('\n')
}
