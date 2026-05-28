/**
 * Google Ads Keywords – gemeinsame Typen und Formatierung (eine Quelle, viele Pakete).
 */

export type GoogleKeywordMatchTyp = 'exact' | 'phrase' | 'broad'

export type GoogleKeywordEintrag = {
  prio: number
  suchbegriff: string
  match: GoogleKeywordMatchTyp
  gruppe?: string
  hinweis?: string
}

export const GOOGLE_KEYWORD_MATCH_LABEL: Record<GoogleKeywordMatchTyp, string> = {
  exact: 'Genau passend',
  phrase: 'Wortgruppe',
  broad: 'Weit passend',
}

export function googleKeywordAlsEingabe(suchbegriff: string, match: GoogleKeywordMatchTyp): string {
  const t = suchbegriff.trim()
  if (match === 'exact') return `[${t}]`
  if (match === 'phrase') return `"${t}"`
  return t
}

export function sortKeywordsByPrio<T extends { prio: number }>(list: readonly T[]): T[] {
  return [...list].sort((a, b) => a.prio - b.prio)
}

/** Basis-Negativliste (alle P1/P2/P3-Kampagnen). */
export const GOOGLE_NEGATIV_KEYWORDS_BASIS: readonly string[] = [
  'jobs',
  'stellenangebot',
  'karriere',
  'ausbildung',
  'studium',
  'praktikum',
  'kurs',
  'vorlesung',
  'wikipedia',
  'kostenlos illegal',
  'crack',
  'torrent',
]

export function formatGoogleKeywordsBlock(options: {
  titel: string
  keywords: readonly GoogleKeywordEintrag[]
  negativ: readonly string[]
  fussHinweis?: string
}): string {
  const lines: string[] = [
    `── ${options.titel} ──`,
    'Match: Wortgruppe = "…" · Genau = […] · Weit = ohne Anführungszeichen',
    '',
    'Nr | Priorität | Suchbegriff | Match | In Google eintragen',
    '---',
  ]
  for (const k of sortKeywordsByPrio(options.keywords)) {
    const eingabe = googleKeywordAlsEingabe(k.suchbegriff, k.match)
    const hinweis = k.hinweis ? ` (${k.hinweis})` : ''
    const gruppe = k.gruppe ? ` · ${k.gruppe}` : ''
    lines.push(
      `${String(k.prio).padStart(2, ' ')} | ${k.prio} | ${k.suchbegriff} | ${GOOGLE_KEYWORD_MATCH_LABEL[k.match]} | ${eingabe}${hinweis}${gruppe}`,
    )
  }
  lines.push(
    '',
    '── Negativ-Keywords (Start) ──',
    options.negativ.join(', '),
    '',
    options.fussHinweis ??
      'Nach 7–14 Tagen: Google → Berichte → Suchbegriffe → gute übernehmen, schlechte als Negativ.',
    '── Ende Keywords ──',
  )
  return lines.join('\n')
}
