import { parseSafeHttpHttpsUrl } from './safeExternalUrl'

/**
 * Lizenz-Checkout: Ziel ist Stripe oder /lizenz-erfolg.
 * Im iframe (Cursor-Vorschau, manche APf-Einbettungen) würde location.href nur den Rahmen wechseln –
 * main.tsx lädt die App dort absichtlich nicht → Platzhalter statt Zahlung/Erfolg.
 * Lösung: gleiche Origin oder Stripe → neuer Tab; sonst normale Navigation.
 * Nur http/https – keine javascript:/data:/… (Phishing-Schutz).
 */
export type OpenCheckoutOrPaymentResult = 'same_tab' | 'new_tab' | 'popup_blocked' | 'blocked'

export function openCheckoutOrPaymentUrl(url: string): OpenCheckoutOrPaymentResult {
  if (typeof window === 'undefined') {
    return 'same_tab'
  }
  const u = parseSafeHttpHttpsUrl(url)
  if (!u) {
    console.warn('[checkout] Navigation blockiert: keine http(s)-URL')
    return 'blocked'
  }

  const inIframe = window.self !== window.top
  const sameOrigin = u.origin === window.location.origin
  const stripeHost = u.hostname === 'checkout.stripe.com' || u.hostname.endsWith('.stripe.com')

  if (!inIframe) {
    window.location.href = u.href
    return 'same_tab'
  }
  if (sameOrigin || stripeHost) {
    const w = window.open(u.href, '_blank', 'noopener,noreferrer')
    if (w) return 'new_tab'
    return 'popup_blocked'
  }
  window.location.href = u.href
  return 'same_tab'
}
