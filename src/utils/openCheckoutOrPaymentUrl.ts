/**
 * Lizenz-Checkout: Ziel ist Stripe oder /lizenz-erfolg.
 * Im iframe (Cursor-Vorschau, manche APf-Einbettungen) würde location.href nur den Rahmen wechseln –
 * main.tsx lädt die App dort absichtlich nicht → Platzhalter statt Zahlung/Erfolg.
 * Lösung: gleiche Origin oder Stripe → neuer Tab; sonst normale Navigation.
 */
export type OpenCheckoutOrPaymentResult = 'same_tab' | 'new_tab' | 'popup_blocked'

export function openCheckoutOrPaymentUrl(url: string): OpenCheckoutOrPaymentResult {
  if (typeof window === 'undefined') {
    return 'same_tab'
  }
  const inIframe = window.self !== window.top
  if (!inIframe) {
    window.location.href = url
    return 'same_tab'
  }
  let sameOrigin = false
  let stripeHost = false
  try {
    const u = new URL(url, window.location.href)
    sameOrigin = u.origin === window.location.origin
    stripeHost = u.hostname === 'checkout.stripe.com' || u.hostname.endsWith('.stripe.com')
  } catch {
    window.location.href = url
    return 'same_tab'
  }
  if (sameOrigin || stripeHost) {
    const w = window.open(url, '_blank', 'noopener,noreferrer')
    if (w) return 'new_tab'
    return 'popup_blocked'
  }
  window.location.href = url
  return 'same_tab'
}
