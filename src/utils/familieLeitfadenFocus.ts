/** Fokus für den interaktiven Muster-Leitfaden: Highlight + scrollIntoView. */

export const LEITFADEN_FOCUS_DATA_ATTR = 'data-leitfaden-focus'
export const HTML_LEITFADEN_FOCUS_ATTR = 'data-k2-familie-leitfaden-focus'

export function setLeitfadenFocusOnDocument(focusKey: string | null | undefined): void {
  if (typeof document === 'undefined') return
  const el = document.documentElement
  if (!focusKey) {
    el.removeAttribute(HTML_LEITFADEN_FOCUS_ATTR)
    return
  }
  el.setAttribute(HTML_LEITFADEN_FOCUS_ATTR, focusKey)
}

export function scrollLeitfadenFocusIntoView(focusKey: string | null | undefined): void {
  if (typeof document === 'undefined' || !focusKey) return
  requestAnimationFrame(() => {
    const safe = /^[a-z0-9-]+$/i.test(focusKey) ? focusKey : ''
    if (!safe) return
    const node = document.querySelector(`[${LEITFADEN_FOCUS_DATA_ATTR}="${safe}"]`)
    node?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
  })
}
