/**
 * Entdecken Schritt q1 (Prospekt A4/A1): globale #print-footer nicht ins DOM –
 * sonst gewinnt in manchen Browsern das `display:flex !important` aus index.css.
 */
let suppress = false
const listeners = new Set<() => void>()

export function setEntdeckenQ1PrintFooterSuppress(on: boolean): void {
  if (suppress === on) return
  suppress = on
  for (const l of listeners) l()
}

export function subscribeEntdeckenQ1PrintFooterSuppress(cb: () => void): () => void {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export function getEntdeckenQ1PrintFooterSuppress(): boolean {
  return suppress
}
