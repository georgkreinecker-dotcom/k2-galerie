/**
 * Marketing-Attribution: Kampagne aus URL (?k= oder utm_campaign) + First-Touch in localStorage.
 * Pseudonyme Besucher-ID pro Browser-Tab (sessionStorage). Korreliert mit mök2-Werbefahrplan-Kampagnen-IDs.
 *
 * Kein K2-echte-Galerie-Landing – nur ök2, VK2, K2 Familie (Aufrufer entscheidet).
 */
import { isValidVisitTenantId } from './reportPublicGalleryVisit'

export type MarketingAttributionSurface = 'oeffentlich' | 'vk2' | 'k2_familie'

const SESSION_VISITOR_KEY = 'k2-mattr-vid'
const FIRST_TOUCH_KEY = 'k2-mattr-ft'
const FIRST_TOUCH_MAX_AGE_MS = 90 * 86400000
const LANDING_SENT_PREFIX = 'k2-mattr-land-'

type FirstTouchPayload = { campaign: string; at: string }

function randomUuidV4(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  const bytes = new Uint8Array(16)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256)
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const h = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}

export function getOrCreateMarketingAnonVisitorId(): string {
  if (typeof sessionStorage === 'undefined') return randomUuidV4()
  try {
    let id = sessionStorage.getItem(SESSION_VISITOR_KEY)
    if (id && /^[0-9a-f-]{36}$/i.test(id)) return id
    id = randomUuidV4()
    sessionStorage.setItem(SESSION_VISITOR_KEY, id)
    return id
  } catch {
    return randomUuidV4()
  }
}

function readFirstTouchCampaign(): string | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(FIRST_TOUCH_KEY)
    if (!raw?.trim()) return null
    const o = JSON.parse(raw) as FirstTouchPayload
    if (!o?.campaign || typeof o.campaign !== 'string') return null
    if (o.at) {
      const t = new Date(o.at).getTime()
      if (!Number.isFinite(t) || Date.now() - t > FIRST_TOUCH_MAX_AGE_MS) {
        localStorage.removeItem(FIRST_TOUCH_KEY)
        return null
      }
    }
    return o.campaign.slice(0, 128)
  } catch {
    return null
  }
}

function writeFirstTouchIfEmpty(campaign: string): void {
  if (typeof localStorage === 'undefined') return
  if (readFirstTouchCampaign()) return
  try {
    const payload: FirstTouchPayload = { campaign: campaign.slice(0, 128), at: new Date().toISOString() }
    localStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify(payload))
  } catch {
    /* ignore */
  }
}

/** Kampagne aus aktueller URL: zuerst ?k=, sonst utm_campaign (kurz, URL-sicher). */
export function parseCampaignFromSearch(search: string): string | null {
  try {
    const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
    const k = params.get('k')?.trim()
    if (k && /^[a-zA-Z0-9_-]{1,128}$/.test(k)) return k
    const utm = params.get('utm_campaign')?.trim()
    if (utm && /^[a-zA-Z0-9_-]{1,128}$/.test(utm)) return utm
    return null
  } catch {
    return null
  }
}

export function getEffectiveMarketingCampaignKey(search: string): string | null {
  const fromUrl = parseCampaignFromSearch(search)
  if (fromUrl) {
    writeFirstTouchIfEmpty(fromUrl)
    return fromUrl
  }
  return readFirstTouchCampaign()
}

function safeReferrerHost(): string | null {
  if (typeof document === 'undefined') return null
  try {
    const r = document.referrer
    if (!r) return null
    const u = new URL(r)
    return u.hostname ? u.hostname.slice(0, 200) : null
  } catch {
    return null
  }
}

export type ReportMarketingAttributionLandingOptions = {
  surface: MarketingAttributionSurface
  tenantVisitKey: string
  /** Eindeutig pro Oberfläche/Mandant, z. B. oeffentlich-oeffentlich oder vk2-pilot-x */
  sessionDedupeKey: string
  search?: string
  skip?: () => boolean
}

/**
 * Einmal pro Browser-Sitzung und sessionDedupeKey: Landing-Event mit effektiver Kampagne.
 */
export function reportMarketingAttributionLanding(options: ReportMarketingAttributionLandingOptions): void {
  if (typeof window === 'undefined' || window.self !== window.top) return
  if (!isValidVisitTenantId(options.tenantVisitKey)) return
  try {
    if (options.skip?.()) return
    const dedupe = LANDING_SENT_PREFIX + options.sessionDedupeKey.replace(/[^a-z0-9_-]/gi, '-').slice(0, 120)
    if (sessionStorage.getItem(dedupe)) return
    const search = options.search ?? window.location.search ?? ''
    const campaign_key = getEffectiveMarketingCampaignKey(search)
    const body = {
      visitor_anon_id: getOrCreateMarketingAnonVisitorId(),
      surface: options.surface,
      tenant_visit_key: options.tenantVisitKey,
      event_kind: 'landing',
      campaign_key,
      referrer_host: safeReferrerHost(),
      path: window.location.pathname?.slice(0, 512) ?? null,
    }
    const origin = window.location.origin
    fetch(`${origin}/api/marketing-attribution`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (res.ok) sessionStorage.setItem(dedupe, '1')
      })
      .catch(() => {})
  } catch {
    /* ignore */
  }
}

/** Link mit Kampagnen-ID für Werbemittel (gleiche IDs wie im mök2-Werbefahrplan). Relativ = nur Pfad+Query. */
export function withMarketingCampaignParam(url: string, campaignId: string): string {
  const id = String(campaignId || '').trim()
  if (!id || !/^[a-zA-Z0-9_-]{1,128}$/.test(id)) return url
  const hasProtocol = /^[a-z][a-z0-9+.-]*:/i.test(url)
  const base = typeof window !== 'undefined' ? window.location.origin : 'https://k2-galerie.vercel.app'
  try {
    const u = hasProtocol ? new URL(url) : new URL(url, base)
    u.searchParams.set('k', id)
    return hasProtocol ? u.href : u.pathname + u.search + u.hash
  } catch {
    const sep = url.includes('?') ? '&' : '?'
    return `${url}${sep}k=${encodeURIComponent(id)}`
  }
}
