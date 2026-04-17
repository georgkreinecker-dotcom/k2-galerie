/**
 * Gemeinsame Erkennung für größere Touch-Ziele und „Handy-typische“ Bedienung
 * (Leitfaden-Sheets, Rundgänge ök2/VK2/K2 Familie).
 */

/** Schmale Viewports oder Touch-first: größere Buttons, Tap auf dunklen Bereich zum Schließen. */
export function prefersTouchFriendlyChrome(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(max-width: 768px), (pointer: coarse)').matches
}

/** Nur Maus mit Hover: pointerover-Schritt-Sync sinnvoll; auf Touch stört es beim Scrollen/Tippen. */
export function isCoarsePointer(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(pointer: coarse)').matches
}
