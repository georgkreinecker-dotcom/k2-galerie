/**
 * P3 · Google Ads – Sitelinks + Zusatzinfos (eine Quelle, Copy-Paste).
 * Schreibtisch: public/texte-schreibtisch/k2-agentur-sitelinks-p3-google.html
 */
import { getMusterfamilieHuberMeineFamiliePathWithQuery } from '../data/k2FamilieMusterHuberQuelle'
import { BASE_APP_URL, PROJECT_ROUTES } from './navigation'
import { buildMarketingCampaignKey } from './marketingKanalP1P2P3'
import { GOOGLE_SITELINK_LIMITS } from './k2AgenturGoogleSitelinksP1'

export { GOOGLE_SITELINK_LIMITS }

export type GoogleSitelinkP3Eintrag = {
  prio: number
  titel: string
  /** Pfad auf k2-galerie.vercel.app (ohne Domain). */
  path: string
  beschreibung1: string
  beschreibung2: string
}

export type GoogleCalloutP3Eintrag = {
  prio: number
  text: string
}

export const K2_AGENTUR_SITELINKS_P3_GOOGLE_DRUCK_URL =
  '/texte-schreibtisch/k2-agentur-sitelinks-p3-google.html'

export const K2_AGENTUR_SITELINKS_P3_GOOGLE_CSV_URL =
  '/texte-schreibtisch/k2-agentur-sitelinks-p3-google.csv'

/**
 * Exakter Kampagnenname in Google Ads (P3) – mit Google-Oberfläche abgleichen.
 * Bei Abweichung: Konstante anpassen und CSV neu erzeugen (write-google-sitelinks-p3-csv.mjs).
 */
export const GOOGLE_SITELINKS_P3_CSV_CAMPAIGN_NAME = 'P3 K2 Familie'

/** Nur falls Kampagne umbenannt wurde – sonst nicht anfassen. */
export const GOOGLE_SITELINKS_P3_CSV_CAMPAIGN_PLACEHOLDER = 'P3-KAMPAGNE-HIER-EINTRAGEN'

/** Finale URL inkl. k= / utm_* für P3 Google (Attribution bleibt erhalten). */
export function buildP3GoogleSitelinkUrl(path: string): string {
  const campaign = buildMarketingCampaignKey('p3', 'google')
  const params = new URLSearchParams()
  params.set('k', campaign)
  params.set('utm_source', 'google')
  params.set('utm_medium', 'cpc')
  params.set('utm_campaign', campaign)
  const u = new URL(path, BASE_APP_URL)
  params.forEach((value, key) => u.searchParams.set(key, value))
  return `${BASE_APP_URL.replace(/\/$/, '')}${u.pathname}${u.search}${u.hash}`
}

const R = PROJECT_ROUTES['k2-familie']

export const GOOGLE_SITELINKS_P3: readonly GoogleSitelinkP3Eintrag[] = [
  {
    prio: 1,
    titel: 'Musterfamilie ansehen',
    path: getMusterfamilieHuberMeineFamiliePathWithQuery(),
    beschreibung1: 'Demo Huber ohne Anmeldung',
    beschreibung2: 'Fotos, Chronik, Stammbaum',
  },
  {
    prio: 2,
    titel: 'Familien-Lizenz',
    path: R.lizenzErwerben,
    beschreibung1: 'Eigene Familie starten',
    beschreibung2: 'Transparente Konditionen',
  },
  {
    prio: 3,
    titel: 'Stammbaum Demo',
    path: `${R.stammbaum}?t=huber`,
    beschreibung1: 'Beziehungen aus Karten',
    beschreibung2: 'Musterfamilie Huber live',
  },
  {
    prio: 4,
    titel: 'K2 Familie Handbuch',
    path: R.benutzerHandbuch,
    beschreibung1: 'Schritt für Schritt erklärt',
    beschreibung2: 'Für Familien in DACH',
  },
  {
    prio: 5,
    titel: 'Präsentation ansehen',
    path: R.familiePraesentationsmappeKunde,
    beschreibung1: 'So funktioniert K2 Familie',
    beschreibung2: 'Überblick zum Zeigen',
  },
  {
    prio: 6,
    titel: 'AGB & Rechtliches',
    path: '/agb',
    beschreibung1: 'Transparent und fair',
    beschreibung2: 'kgm solution · K2 Familie',
  },
] as const

export const GOOGLE_CALLOUTS_P3: readonly GoogleCalloutP3Eintrag[] = [
  { prio: 1, text: 'Demo ohne Anmeldung' },
  { prio: 2, text: 'Stammbaum & Chronik' },
  { prio: 3, text: 'Fotos & Geschichten' },
  { prio: 4, text: 'Privat für die Familie' },
  { prio: 5, text: 'Kein Datenverkauf' },
  { prio: 6, text: 'Geschwister einladen' },
  { prio: 7, text: 'Familientreffen planen' },
  { prio: 8, text: 'Gedenkort & Erinnerung' },
  { prio: 9, text: 'Daten bleiben privat' },
  { prio: 10, text: 'kgm solution' },
] as const

export function getGoogleSitelinksP3WithUrls(): Array<GoogleSitelinkP3Eintrag & { url: string }> {
  return GOOGLE_SITELINKS_P3.map((row) => ({
    ...row,
    url: buildP3GoogleSitelinkUrl(row.path),
  })).sort((a, b) => a.prio - b.prio)
}

export function getGoogleCalloutsP3Sorted(): GoogleCalloutP3Eintrag[] {
  return [...GOOGLE_CALLOUTS_P3].sort((a, b) => a.prio - b.prio)
}

export function formatGoogleSitelinkP3Block(row: GoogleSitelinkP3Eintrag & { url: string }): string {
  return [
    `Sitelink: ${row.titel}`,
    `URL: ${row.url}`,
    `Zeile 1: ${row.beschreibung1}`,
    `Zeile 2: ${row.beschreibung2}`,
  ].join('\n')
}

export function formatGoogleCalloutsP3Block(): string {
  return getGoogleCalloutsP3Sorted()
    .map((c) => c.text)
    .join('\n')
}

function csvEscape(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

export const GOOGLE_SITELINKS_P3_BULK_HEADERS_DE = [
  'Kampagne',
  'Linktext',
  'Finale URL',
  'Textzeile 1',
  'Textzeile 2',
] as const

export function exportGoogleSitelinksP3BulkCsvDe(
  campaignName = GOOGLE_SITELINKS_P3_CSV_CAMPAIGN_NAME,
): string {
  const header = GOOGLE_SITELINKS_P3_BULK_HEADERS_DE.join(',')
  const lines = getGoogleSitelinksP3WithUrls().map((row) =>
    [campaignName, row.titel, row.url, row.beschreibung1, row.beschreibung2]
      .map(csvEscape)
      .join(','),
  )
  return `\uFEFF${[header, ...lines].join('\r\n')}`
}

export function exportGoogleSitelinksP3EditorCsv(
  campaignName = GOOGLE_SITELINKS_P3_CSV_CAMPAIGN_NAME,
): string {
  const header =
    'Action,Campaign,Link text,Final URL,Description line 1,Description line 2'
  const lines = getGoogleSitelinksP3WithUrls().map((row) =>
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
