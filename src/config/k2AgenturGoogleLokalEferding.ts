/**
 * Lokal · Google Ads – K2 Galerie Eferding (echte Galerie, nicht Lizenz-P1).
 * Samstagsöffnung, Gruppenbesuch, Homepage /galerie.
 */
import { BASE_APP_URL } from './navigation'

export const EFERDING_GOOGLE_CAMPAIGN_KEY = 'eferding-google-2026q2'

export const GOOGLE_LOKAL_EFERDING_CSV_CAMPAIGN_NAME = 'Lokal K2 Galerie Eferding'

/** Tagesbudget in Google Ads (EUR). */
export const GOOGLE_LOKAL_EFERDING_DAILY_BUDGET_EUR = 5

/** Öffentliche Galerie K2 (Martina & Georg) – nicht ök2-Demo. */
export const GOOGLE_LOKAL_EFERDING_LANDING_PATH = '/galerie'

export const K2_AGENTUR_LOKAL_EFERDING_GOOGLE_DRUCK_URL =
  '/texte-schreibtisch/k2-agentur-lokal-eferding-google.html'

export const K2_AGENTUR_KEYWORDS_LOKAL_EFERDING_GOOGLE_DRUCK_URL =
  '/texte-schreibtisch/k2-agentur-keywords-lokal-eferding-google.html'

export const K2_AGENTUR_SITELINKS_LOKAL_EFERDING_GOOGLE_DRUCK_URL =
  '/texte-schreibtisch/k2-agentur-sitelinks-lokal-eferding-google.html'

export const K2_AGENTUR_SITELINKS_LOKAL_EFERDING_GOOGLE_CSV_URL =
  '/texte-schreibtisch/k2-agentur-sitelinks-lokal-eferding-google.csv'

/** Geo in Google: Radius um Eferding (4070). */
export const GOOGLE_LOKAL_EFERDING_GEO_RADIUS_KM = 35

/** Anruf-Erweiterungen (Flyer Öffnungszeiten A5). */
export const GOOGLE_LOKAL_EFERDING_CALL_MARTINA = '+436767519162'
export const GOOGLE_LOKAL_EFERDING_CALL_GEORG = '+436641046337'

/** Finale URL inkl. k= / utm_* für Lokal Eferding Google. */
export function buildLokalEferdingGoogleUrl(path: string): string {
  const campaign = EFERDING_GOOGLE_CAMPAIGN_KEY
  const params = new URLSearchParams()
  params.set('k', campaign)
  params.set('utm_source', 'google')
  params.set('utm_medium', 'cpc')
  params.set('utm_campaign', campaign)
  const u = new URL(path, BASE_APP_URL)
  params.forEach((value, key) => u.searchParams.set(key, value))
  return `${BASE_APP_URL.replace(/\/$/, '')}${u.pathname}${u.search}${u.hash}`
}

export function getLokalEferdingGoogleLandingUrl(): string {
  return buildLokalEferdingGoogleUrl(GOOGLE_LOKAL_EFERDING_LANDING_PATH)
}
