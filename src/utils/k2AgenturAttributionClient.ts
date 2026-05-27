/**
 * K2 Agentur – Attribution-Summary vom Server (read-only).
 */
import type { MarketingProduktId } from '../config/marketingKanalP1P2P3'
import { listMarketingKanalUrls } from '../config/marketingKanalP1P2P3'
import type { KanalAttributionZahlen } from '../config/k2AgenturSteuerRegeln'

export type AttributionSummaryRow = {
  campaign_key: string | null
  surface: string
  event_kind: string
  count: number
}

export type AttributionSummaryResponse = {
  configured: boolean
  summary: AttributionSummaryRow[]
  days?: number
  error?: string
}

const SURFACE_BY_PRODUKT: Record<MarketingProduktId, string> = {
  p1: 'oeffentlich',
  p2: 'vk2',
  p3: 'k2_familie',
}

export async function fetchMarketingAttributionSummary(
  days = 7,
): Promise<AttributionSummaryResponse> {
  if (typeof window === 'undefined') {
    return { configured: false, summary: [], error: 'Kein Browser' }
  }
  try {
    const origin = window.location.origin
    const r = await fetch(`${origin}/api/marketing-attribution?mode=summary&days=${days}`)
    const data = (await r.json()) as AttributionSummaryResponse
    return {
      configured: Boolean(data?.configured),
      summary: Array.isArray(data?.summary) ? data.summary : [],
      days: typeof data?.days === 'number' ? data.days : days,
      error: typeof data?.error === 'string' ? data.error : undefined,
    }
  } catch {
    return { configured: false, summary: [], error: 'Netzwerk' }
  }
}

/** Landings + Lizenzen für eine Kampagne (campaign_key aus Schalt-Paket). */
export function aggregateAttributionForCampaign(
  summary: AttributionSummaryRow[],
  campaignKey: string,
  produkt: MarketingProduktId,
): KanalAttributionZahlen {
  const surface = SURFACE_BY_PRODUKT[produkt]
  let landings = 0
  let conversions = 0
  for (const row of summary) {
    if (row.campaign_key !== campaignKey) continue
    if (row.surface !== surface) continue
    if (row.event_kind === 'landing') landings += row.count
    if (row.event_kind === 'conversion_licence') conversions += row.count
  }
  return { landings, conversions, configured: true }
}

/** Alle 9 Kanäle: campaignKey → Zahlen (für Übersicht). */
export function buildAttributionMapForKanaele(
  summary: AttributionSummaryRow[],
  configured: boolean,
): Record<string, KanalAttributionZahlen> {
  const out: Record<string, KanalAttributionZahlen> = {}
  if (!configured) return out
  for (const row of listMarketingKanalUrls()) {
    const key = `${row.produkt}_${row.kanal}`
    out[key] = aggregateAttributionForCampaign(summary, row.campaignKey, row.produkt)
  }
  return out
}
