/**
 * Google Analytics 4 – nur wenn VITE_GA4_MEASUREMENT_ID gesetzt (Vercel / .env).
 * Kein Tracking ohne ID; DSGVO: Cookie-Banner separat klären wenn Remarketing kommt.
 */

let ga4Initialized = false

export function getGa4MeasurementId(): string | null {
  const raw = import.meta.env.VITE_GA4_MEASUREMENT_ID
  const id = typeof raw === 'string' ? raw.trim() : ''
  if (!id.startsWith('G-')) return null
  return id
}

export function initGa4IfConfigured(): void {
  if (ga4Initialized || typeof window === 'undefined') return
  if (window.self !== window.top) return
  const id = getGa4MeasurementId()
  if (!id) return
  ga4Initialized = true
  try {
    const w = window as Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void }
    w.dataLayer = w.dataLayer || []
    w.gtag = function gtag(...args: unknown[]) {
      w.dataLayer?.push(args)
    }
    w.gtag('js', new Date())
    w.gtag('config', id, { send_page_view: true })
    const s = document.createElement('script')
    s.async = true
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`
    document.head.appendChild(s)
  } catch {
    ga4Initialized = false
  }
}
