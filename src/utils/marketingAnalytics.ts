/**
 * Google Analytics 4 + Google Ads (gtag.js) – nur wenn IDs gesetzt (Env oder Pilot-Default für Ads).
 * Kein Tracking im iframe (Cursor Preview). DSGVO: Einwilligungsmodus in Google Ads separat klären (EEA).
 */
import { GOOGLE_ADS_CONVERSION_SEND_TO_PILOT, GOOGLE_ADS_ID_PILOT } from '../config/googleAdsConfig'

let gtagBootstrapped = false
let gtagScriptLoaded = false
let marketingTagsInitialized = false

type GtagWindow = Window & {
  dataLayer?: unknown[]
  gtag?: (...args: unknown[]) => void
}

export function getGa4MeasurementId(): string | null {
  const raw = import.meta.env.VITE_GA4_MEASUREMENT_ID
  const id = typeof raw === 'string' ? raw.trim() : ''
  if (!id.startsWith('G-')) return null
  return id
}

/** Google Ads Conversion-ID (AW-…). Env oder Pilot-Default. */
export function getGoogleAdsId(): string | null {
  const raw = import.meta.env.VITE_GOOGLE_ADS_ID
  const fromEnv = typeof raw === 'string' ? raw.trim() : ''
  if (fromEnv.startsWith('AW-')) return fromEnv
  if (GOOGLE_ADS_ID_PILOT.startsWith('AW-')) return GOOGLE_ADS_ID_PILOT
  return null
}

/**
 * Optional: voller send_to aus Google Ads → Ziele → Conversion-Aktion (z. B. AW-…/AbCd…).
 * Ohne Label zählt oft eine URL-Conversion auf /lizenz-erfolg in Google Ads.
 */
export function getGoogleAdsConversionSendTo(): string | null {
  const raw = import.meta.env.VITE_GOOGLE_ADS_CONVERSION_SEND_TO
  const fromEnv = typeof raw === 'string' ? raw.trim() : ''
  if (fromEnv.includes('/') && fromEnv.startsWith('AW-')) return fromEnv
  const pilot = GOOGLE_ADS_CONVERSION_SEND_TO_PILOT.trim()
  if (pilot.includes('/') && pilot.startsWith('AW-')) return pilot
  return null
}

function ensureGtagBootstrap(): GtagWindow['gtag'] | null {
  if (typeof window === 'undefined') return null
  const w = window as GtagWindow
  if (!gtagBootstrapped) {
    w.dataLayer = w.dataLayer || []
    w.gtag = function gtag(...args: unknown[]) {
      w.dataLayer?.push(args)
    }
    w.gtag('js', new Date())
    gtagBootstrapped = true
  }
  return w.gtag ?? null
}

function loadGtagScript(loaderId: string): void {
  if (gtagScriptLoaded || typeof document === 'undefined') return
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(loaderId)}`
  document.head.appendChild(s)
  gtagScriptLoaded = true
}

/** GA4 + Google Ads – ein dataLayer, ein Script-Load. */
export function initMarketingTagsIfConfigured(): void {
  if (marketingTagsInitialized || typeof window === 'undefined') return
  if (window.self !== window.top) return

  const ga4 = getGa4MeasurementId()
  const ads = getGoogleAdsId()
  if (!ga4 && !ads) return

  const gtag = ensureGtagBootstrap()
  if (!gtag) return

  try {
    const loaderId = ga4 ?? ads!
    loadGtagScript(loaderId)
    if (ga4) gtag('config', ga4, { send_page_view: true })
    if (ads) gtag('config', ads)
    marketingTagsInitialized = true
  } catch {
    marketingTagsInitialized = false
    gtagBootstrapped = false
    gtagScriptLoaded = false
  }
}

/** @deprecated Alias – nutze initMarketingTagsIfConfigured */
export function initGa4IfConfigured(): void {
  initMarketingTagsIfConfigured()
}

/** Nach erfolgreichem Stripe-Checkout (/lizenz-erfolg, echte Session). */
export function trackGoogleAdsLicenceConversion(): void {
  if (typeof window === 'undefined' || window.self !== window.top) return
  initMarketingTagsIfConfigured()
  const w = window as GtagWindow
  const gtag = w.gtag
  if (!gtag) return

  const sendTo = getGoogleAdsConversionSendTo()
  if (sendTo) {
    gtag('event', 'conversion', { send_to: sendTo })
    return
  }

  const adsId = getGoogleAdsId()
  if (adsId) {
    gtag('event', 'conversion', { send_to: adsId })
  }
}
