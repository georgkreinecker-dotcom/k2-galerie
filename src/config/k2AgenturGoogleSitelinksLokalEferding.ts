/**
 * Lokal Eferding · Google Ads – Sitelinks + Zusatzinfos.
 */
import { PROJECT_ROUTES } from './navigation'
import {
  buildLokalEferdingGoogleUrl,
  GOOGLE_LOKAL_EFERDING_CSV_CAMPAIGN_NAME,
  GOOGLE_LOKAL_EFERDING_LANDING_PATH,
} from './k2AgenturGoogleLokalEferding'
import { GOOGLE_SITELINK_LIMITS } from './k2AgenturGoogleSitelinksP1'

export { GOOGLE_SITELINK_LIMITS }

export type GoogleSitelinkLokalEferdingEintrag = {
  prio: number
  titel: string
  path: string
  beschreibung1: string
  beschreibung2: string
}

export type GoogleCalloutLokalEferdingEintrag = {
  prio: number
  text: string
}

export const K2_AGENTUR_SITELINKS_LOKAL_EFERDING_GOOGLE_DRUCK_URL =
  '/texte-schreibtisch/k2-agentur-sitelinks-lokal-eferding-google.html'

export const K2_AGENTUR_SITELINKS_LOKAL_EFERDING_GOOGLE_CSV_URL =
  '/texte-schreibtisch/k2-agentur-sitelinks-lokal-eferding-google.csv'

const R = PROJECT_ROUTES['k2-galerie']

export const GOOGLE_SITELINKS_LOKAL_EFERDING: readonly GoogleSitelinkLokalEferdingEintrag[] = [
  {
    prio: 1,
    titel: 'Samstag geöffnet',
    path: GOOGLE_LOKAL_EFERDING_LANDING_PATH,
    beschreibung1: 'Jeden Samstag vor Ort',
    beschreibung2: 'Malerei & Keramik',
  },
  {
    prio: 2,
    titel: 'Werke online',
    path: GOOGLE_LOKAL_EFERDING_LANDING_PATH,
    beschreibung1: 'Homepage Galerie K2',
    beschreibung2: 'Bilder vor dem Besuch',
  },
  {
    prio: 3,
    titel: 'Gruppenbesuch',
    path: '/texte-schreibtisch/einladung-gruppen-serviceclubs-k2-galerie.html',
    beschreibung1: 'Für Verein & Club',
    beschreibung2: 'Termin nach Vereinbarung',
  },
  {
    prio: 4,
    titel: 'Termin anfragen',
    path: GOOGLE_LOKAL_EFERDING_LANDING_PATH,
    beschreibung1: 'Telefonisch vereinbaren',
    beschreibung2: 'Auch außerhalb Samstag',
  },
  {
    prio: 5,
    titel: 'Virtueller Rundgang',
    path: R.virtuellerRundgang,
    beschreibung1: 'Rundgang in der Galerie',
    beschreibung2: 'Vorab online ansehen',
  },
  {
    prio: 6,
    titel: 'Kontakt & Anfahrt',
    path: GOOGLE_LOKAL_EFERDING_LANDING_PATH,
    beschreibung1: '4070 Eferding',
    beschreibung2: 'Schlossergasse 4',
  },
] as const

export const GOOGLE_CALLOUTS_LOKAL_EFERDING: readonly GoogleCalloutLokalEferdingEintrag[] = [
  { prio: 1, text: 'Jeden Samstag geöffnet' },
  { prio: 2, text: 'Malerei & Keramik' },
  { prio: 3, text: 'Schlossergasse 4' },
  { prio: 4, text: 'Gruppen nach Termin' },
  { prio: 5, text: 'Werke online ansehen' },
  { prio: 6, text: 'Persönlich & klein' },
  { prio: 7, text: 'Martina & Georg' },
  { prio: 8, text: 'Eferding Innenstadt' },
  { prio: 9, text: 'Termin telefonisch' },
  { prio: 10, text: 'kgm solution' },
] as const

export function getGoogleSitelinksLokalEferdingWithUrls(): Array<
  GoogleSitelinkLokalEferdingEintrag & { url: string }
> {
  return GOOGLE_SITELINKS_LOKAL_EFERDING.map((row) => ({
    ...row,
    url: buildLokalEferdingGoogleUrl(row.path),
  })).sort((a, b) => a.prio - b.prio)
}

export function getGoogleCalloutsLokalEferdingSorted(): GoogleCalloutLokalEferdingEintrag[] {
  return [...GOOGLE_CALLOUTS_LOKAL_EFERDING].sort((a, b) => a.prio - b.prio)
}

function csvEscape(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

export const GOOGLE_SITELINKS_LOKAL_EFERDING_BULK_HEADERS_DE = [
  'Kampagne',
  'Linktext',
  'Finale URL',
  'Textzeile 1',
  'Textzeile 2',
] as const

export function exportGoogleSitelinksLokalEferdingBulkCsvDe(
  campaignName = GOOGLE_LOKAL_EFERDING_CSV_CAMPAIGN_NAME,
): string {
  const header = GOOGLE_SITELINKS_LOKAL_EFERDING_BULK_HEADERS_DE.join(',')
  const lines = getGoogleSitelinksLokalEferdingWithUrls().map((row) =>
    [campaignName, row.titel, row.url, row.beschreibung1, row.beschreibung2]
      .map(csvEscape)
      .join(','),
  )
  return `\uFEFF${[header, ...lines].join('\r\n')}`
}

export function exportGoogleSitelinksLokalEferdingEditorCsv(
  campaignName = GOOGLE_LOKAL_EFERDING_CSV_CAMPAIGN_NAME,
): string {
  const header =
    'Action,Campaign,Link text,Final URL,Description line 1,Description line 2'
  const lines = getGoogleSitelinksLokalEferdingWithUrls().map((row) =>
    ['Add', campaignName, row.titel, row.url, row.beschreibung1, row.beschreibung2]
      .map(csvEscape)
      .join(','),
  )
  return `\uFEFF${[header, ...lines].join('\r\n')}`
}
