/** Fokus für den interaktiven Muster-Leitfaden: Highlight + scrollIntoView. */

export const LEITFADEN_FOCUS_DATA_ATTR = 'data-leitfaden-focus'
export const HTML_LEITFADEN_FOCUS_ATTR = 'data-k2-familie-leitfaden-focus'
/** ök2 Demo-Galerie: gleiche `data-leitfaden-focus`-Ziele, eigenes html-Attribut für Outline-CSS. */
export const HTML_OEK2_LEITFADEN_FOCUS_ATTR = 'data-oek2-leitfaden-focus'
/** ök2 Admin-Rundgang (Plattform): Fokus auf Hub-Kacheln und Werke-Bereich – wie VK2, eigenes html-Attribut. */
export const HTML_OEK2_ADMIN_LEITFADEN_FOCUS_ATTR = 'data-oek2-admin-leitfaden-focus'
/** VK2 Vereinsgalerie-Rundgang (Plattform): gleiche Ziele, eigenes html-Attribut für Outline-CSS. */
export const HTML_VK2_LEITFADEN_FOCUS_ATTR = 'data-vk2-leitfaden-focus'
/** VK2 Admin-Rundgang (Plattform): Fokus auf Hub-Kacheln und Werke-Bereich. */
export const HTML_VK2_ADMIN_LEITFADEN_FOCUS_ATTR = 'data-vk2-admin-leitfaden-focus'

export function setLeitfadenFocusOnDocument(
  focusKey: string | null | undefined,
  htmlAttr: string = HTML_LEITFADEN_FOCUS_ATTR,
): void {
  if (typeof document === 'undefined') return
  const el = document.documentElement
  el.removeAttribute(HTML_LEITFADEN_FOCUS_ATTR)
  el.removeAttribute(HTML_OEK2_LEITFADEN_FOCUS_ATTR)
  el.removeAttribute(HTML_OEK2_ADMIN_LEITFADEN_FOCUS_ATTR)
  el.removeAttribute(HTML_VK2_LEITFADEN_FOCUS_ATTR)
  el.removeAttribute(HTML_VK2_ADMIN_LEITFADEN_FOCUS_ATTR)
  if (!focusKey) {
    return
  }
  el.setAttribute(htmlAttr, focusKey)
}

export function scrollLeitfadenFocusIntoView(
  focusKey: string | null | undefined,
  options?: ScrollIntoViewOptions,
): void {
  if (typeof document === 'undefined' || !focusKey) return
  const base: ScrollIntoViewOptions = { behavior: 'smooth', block: 'nearest', inline: 'nearest' }
  const opts: ScrollIntoViewOptions = { ...base, ...options }
  requestAnimationFrame(() => {
    const safe = /^[a-z0-9-]+$/i.test(focusKey) ? focusKey : ''
    if (!safe) return
    const node = document.querySelector(`[${LEITFADEN_FOCUS_DATA_ATTR}="${safe}"]`)
    node?.scrollIntoView(opts)
  })
}
