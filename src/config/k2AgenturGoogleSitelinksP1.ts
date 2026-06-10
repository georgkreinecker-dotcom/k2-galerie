/**
 * P1 · Google Ads – Sitelinks + Zusatzinfos (eine Quelle, Copy-Paste).
 * Schreibtisch: public/texte-schreibtisch/k2-agentur-sitelinks-p1-google.html
 */
import { BASE_APP_URL, BENUTZER_HANDBUCH_ROUTE, PROJECT_ROUTES } from './navigation'
import { buildMarketingCampaignKey } from './marketingKanalP1P2P3'

/** Google Ads Limits (Responsive Search – Sitelinks). */
export const GOOGLE_SITELINK_LIMITS = {
  titel: 25,
  beschreibung: 35,
  callout: 25,
} as const

export type GoogleSitelinkP1Eintrag = {
  prio: number
  titel: string
  /** Pfad auf k2-galerie.vercel.app (ohne Domain). */
  path: string
  beschreibung1: string
  beschreibung2: string
}

export type GoogleCalloutP1Eintrag = {
  prio: number
  text: string
}

export const K2_AGENTUR_SITELINKS_P1_GOOGLE_DRUCK_URL =
  '/texte-schreibtisch/k2-agentur-sitelinks-p1-google.html'

export const K2_AGENTUR_SITELINKS_P1_GOOGLE_CSV_URL =
  '/texte-schreibtisch/k2-agentur-sitelinks-p1-google.csv'

/** Exakter Kampagnenname in Google Ads (Performance Max P1) – Stand Juni 2026. */
export const GOOGLE_SITELINKS_P1_CSV_CAMPAIGN_NAME = 'Campaign #1'

/** Nur falls Kampagne umbenannt wurde – sonst nicht anfassen. */
export const GOOGLE_SITELINKS_P1_CSV_CAMPAIGN_PLACEHOLDER = 'P1-KAMPAGNE-HIER-EINTRAGEN'

/** Finale URL inkl. k= / utm_* für P1 Google (Attribution bleibt erhalten). */
export function buildP1GoogleSitelinkUrl(path: string): string {
  const campaign = buildMarketingCampaignKey('p1', 'google')
  const params = new URLSearchParams()
  params.set('k', campaign)
  params.set('utm_source', 'google')
  params.set('utm_medium', 'cpc')
  params.set('utm_campaign', campaign)
  const u = new URL(path, BASE_APP_URL)
  params.forEach((value, key) => u.searchParams.set(key, value))
  return `${BASE_APP_URL.replace(/\/$/, '')}${u.pathname}${u.search}${u.hash}`
}

export const GOOGLE_SITELINKS_P1: readonly GoogleSitelinkP1Eintrag[] = [
  {
    prio: 1,
    titel: 'Demo-Galerie ansehen',
    path: PROJECT_ROUTES['k2-galerie'].galerieOeffentlich,
    beschreibung1: 'Musterwerke live im Browser',
    beschreibung2: 'Ohne Anmeldung sofort',
  },
  {
    prio: 2,
    titel: '4 Wochen gratis testen',
    path: PROJECT_ROUTES['k2-galerie'].lizenzKaufen,
    beschreibung1: 'K2 Galerie ausprobieren',
    beschreibung2: 'Danach Basic oder Pro',
  },
  {
    prio: 3,
    titel: 'Preise & Lizenzen',
    path: PROJECT_ROUTES['k2-galerie'].licences,
    beschreibung1: 'Ab 10 Euro pro Monat',
    beschreibung2: 'Pro mit Kassa & Marketing',
  },
  {
    prio: 4,
    titel: 'Benutzerhandbuch',
    path: BENUTZER_HANDBUCH_ROUTE,
    beschreibung1: 'Schritt für Schritt erklärt',
    beschreibung2: 'Für Künstler:innen & Galerien',
  },
  {
    prio: 5,
    titel: 'Galerie-Vorschau',
    path: PROJECT_ROUTES['k2-galerie'].galerieOeffentlichVorschau,
    beschreibung1: 'So sieht Besucher:innen aus',
    beschreibung2: 'Design & Werke im Überblick',
  },
  {
    prio: 6,
    titel: 'AGB & Rechtliches',
    path: '/agb',
    beschreibung1: 'Transparent und fair',
    beschreibung2: 'kgm solution - K2 Galerie',
  },
] as const

export const GOOGLE_CALLOUTS_P1: readonly GoogleCalloutP1Eintrag[] = [
  { prio: 1, text: '4 Wochen gratis testen' },
  { prio: 2, text: 'Ab 10 € pro Monat' },
  { prio: 3, text: 'Demo ohne Anmeldung' },
  { prio: 4, text: 'Galerie, Shop & Tour' },
  { prio: 5, text: 'Für Künstler:innen' },
  { prio: 6, text: 'Kassa & Rechnung (Pro)' },
  { prio: 7, text: 'Etiketten & Druck' },
  { prio: 8, text: 'Events & Marketing' },
  { prio: 9, text: 'Kunstvereine VK2' },
  { prio: 10, text: 'kgm solution' },
] as const

export function getGoogleSitelinksP1WithUrls(): Array<GoogleSitelinkP1Eintrag & { url: string }> {
  return GOOGLE_SITELINKS_P1.map((row) => ({
    ...row,
    url: buildP1GoogleSitelinkUrl(row.path),
  })).sort((a, b) => a.prio - b.prio)
}

export function getGoogleCalloutsP1Sorted(): GoogleCalloutP1Eintrag[] {
  return [...GOOGLE_CALLOUTS_P1].sort((a, b) => a.prio - b.prio)
}

/** Copy-Block für Zwischenablage (Sitelink + URL + Beschreibungen). */
export function formatGoogleSitelinkP1Block(row: GoogleSitelinkP1Eintrag & { url: string }): string {
  return [
    `Sitelink: ${row.titel}`,
    `URL: ${row.url}`,
    `Zeile 1: ${row.beschreibung1}`,
    `Zeile 2: ${row.beschreibung2}`,
  ].join('\n')
}

/** Alle Zusatzinfos als Zeilen (eine pro Feld in Google). */
export function formatGoogleCalloutsP1Block(): string {
  return getGoogleCalloutsP1Sorted()
    .map((c) => c.text)
    .join('\n')
}

function csvEscape(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

/** Spalten wie in Googles Empfehlungs-Vorlage (deutsche Oberfläche). */
export const GOOGLE_SITELINKS_P1_BULK_HEADERS_DE = [
  'Kampagne',
  'Linktext',
  'Finale URL',
  'Textzeile 1',
  'Textzeile 2',
] as const

/**
 * Google Ads Web-Oberfläche / Empfehlung „Sitelinks hinzufügen“ – deutsche Vorlage.
 * Keine Action-Spalte, keine englischen Kopfzeilen (sonst Upload-Fehler Zeile 2/3).
 */
export function exportGoogleSitelinksP1BulkCsvDe(
  campaignName = GOOGLE_SITELINKS_P1_CSV_CAMPAIGN_NAME,
): string {
  const header = GOOGLE_SITELINKS_P1_BULK_HEADERS_DE.join(',')
  const lines = getGoogleSitelinksP1WithUrls().map((row) =>
    [campaignName, row.titel, row.url, row.beschreibung1, row.beschreibung2]
      .map(csvEscape)
      .join(','),
  )
  return `\uFEFF${[header, ...lines].join('\r\n')}`
}

/** Google Ads Editor – englische Kopfzeilen inkl. Action „Add“. */
export function exportGoogleSitelinksP1EditorCsv(
  campaignName = GOOGLE_SITELINKS_P1_CSV_CAMPAIGN_NAME,
): string {
  const header =
    'Action,Campaign,Link text,Final URL,Description line 1,Description line 2'
  const lines = getGoogleSitelinksP1WithUrls().map((row) =>
    [
      'Add',
      campaignName,
      row.titel,
      row.url,
      row.beschreibung1,
      row.beschreibung2,
    ]
      .map(csvEscape)
      .join(','),
  )
  return `\uFEFF${[header, ...lines].join('\r\n')}`
}
