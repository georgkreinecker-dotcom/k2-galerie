/**
 * Agentur-Kanäle P1 / P2 / P3 – eine Quelle für Landing-URLs (Google, Meta, LinkedIn).
 * Georg kopiert die Links in Ads-Konten; Joe pflegt Kampagnen-IDs hier.
 */
import { BASE_APP_URL, ENTDECKEN_ROUTE, PROJECT_ROUTES } from './navigation'

export type MarketingProduktId = 'p1' | 'p2' | 'p3'

/** Bezahlte Agentur-Kanäle (Plan B / Teil E.1). */
export type MarketingPaidKanalId = 'google' | 'meta' | 'linkedin'

export type BuildMarketingKanalUrlOptions = {
  /** z. B. test1, q2-2026 – Default je Kanal */
  variant?: string
  /** Agentur-ID für CPA-Abrechnung (optional) */
  ag?: string
  /** Absolute URL (Ads-Konten); sonst Pfad + Query für QR/Print */
  absolute?: boolean
}

/** Wohin bezahlte Anzeigen pro Produkt zeigen (Landing). */
export const MARKETING_PRODUKT_LANDING_PATH: Record<MarketingProduktId, string> = {
  p1: ENTDECKEN_ROUTE,
  p2: PROJECT_ROUTES.vk2.galerie,
  p3: PROJECT_ROUTES['k2-familie'].familiePraesentationsmappeKunde,
}

/** Checkout / Lizenz (für Doku – nicht als Ads-Landing). */
export const MARKETING_PRODUKT_CHECKOUT_PATH: Record<MarketingProduktId, string> = {
  p1: PROJECT_ROUTES['k2-galerie'].lizenzKaufen,
  p2: PROJECT_ROUTES['k2-galerie'].lizenzKaufen,
  p3: PROJECT_ROUTES['k2-familie'].lizenzErwerben,
}

const DEFAULT_VARIANT: Record<MarketingPaidKanalId, string> = {
  google: '2026q2',
  meta: '2026q2',
  linkedin: '2026q2',
}

const UTM_SOURCE: Record<MarketingPaidKanalId, string> = {
  google: 'google',
  meta: 'meta',
  linkedin: 'linkedin',
}

/** Kurz-ID für k= / utm_campaign (URL-sicher). */
export function buildMarketingCampaignKey(
  produkt: MarketingProduktId,
  kanal: MarketingPaidKanalId,
  variant?: string,
): string {
  const v = (variant || DEFAULT_VARIANT[kanal]).trim()
  const safe = v.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 64)
  return `${produkt}-${kanal}-${safe}`
}

/** Agentur-Landing-URL inkl. k= und utm_* (eine Quelle). */
export function buildMarketingKanalUrl(
  produkt: MarketingProduktId,
  kanal: MarketingPaidKanalId,
  options: BuildMarketingKanalUrlOptions = {},
): string {
  const path = MARKETING_PRODUKT_LANDING_PATH[produkt]
  const campaign = buildMarketingCampaignKey(produkt, kanal, options.variant)
  const params = new URLSearchParams()
  params.set('k', campaign)
  params.set('utm_source', UTM_SOURCE[kanal])
  params.set('utm_medium', 'cpc')
  params.set('utm_campaign', campaign)
  const ag = options.ag?.trim()
  if (ag && /^[a-zA-Z0-9_-]{1,64}$/.test(ag)) params.set('ag', ag)
  const base = options.absolute !== false ? BASE_APP_URL : ''
  try {
    const u = new URL(path, BASE_APP_URL)
    params.forEach((value, key) => u.searchParams.set(key, value))
    const href = u.pathname + u.search + u.hash
    return options.absolute === false ? href : `${base.replace(/\/$/, '')}${href}`
  } catch {
    const sep = path.includes('?') ? '&' : '?'
    const q = params.toString()
    const rel = `${path}${sep}${q}`
    return options.absolute === false ? rel : `${BASE_APP_URL}${rel}`
  }
}

/** Alle Standard-Links für Schreibtisch / Ads-Einrichtung. */
export function listMarketingKanalUrls(ag?: string): Array<{
  produkt: MarketingProduktId
  produktLabel: string
  kanal: MarketingPaidKanalId
  kanalLabel: string
  campaignKey: string
  landingUrl: string
  checkoutPath: string
}> {
  const labels: Record<MarketingProduktId, string> = {
    p1: 'P1 – K2 Galerie (Lizenz Künstler:innen)',
    p2: 'P2 – VK2 (Vereine)',
    p3: 'P3 – K2 Familie',
  }
  const kanalLabels: Record<MarketingPaidKanalId, string> = {
    google: 'Google Ads (Suche)',
    meta: 'Meta (Facebook/Instagram)',
    linkedin: 'LinkedIn Ads',
  }
  const produkte: MarketingProduktId[] = ['p1', 'p2', 'p3']
  const kanaele: MarketingPaidKanalId[] = ['google', 'meta', 'linkedin']
  const out: Array<{
    produkt: MarketingProduktId
    produktLabel: string
    kanal: MarketingPaidKanalId
    kanalLabel: string
    campaignKey: string
    landingUrl: string
    checkoutPath: string
  }> = []
  for (const produkt of produkte) {
    for (const kanal of kanaele) {
      const campaignKey = buildMarketingCampaignKey(produkt, kanal)
      out.push({
        produkt,
        produktLabel: labels[produkt],
        kanal,
        kanalLabel: kanalLabels[kanal],
        campaignKey,
        landingUrl: buildMarketingKanalUrl(produkt, kanal, { ag, absolute: true }),
        checkoutPath: MARKETING_PRODUKT_CHECKOUT_PATH[produkt],
      })
    }
  }
  return out
}
