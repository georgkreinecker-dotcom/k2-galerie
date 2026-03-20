/**
 * Schicht B (Gamification / Lesepfade) – nur Darstellung, kein Kern.
 * VITE_OEK2_GAMIFICATION_LAYER_B=0 | false | off → Fortschritts-Heroes & zugehörige Hinweise aus.
 * Standard: eingeschaltet (Variable leer oder anderer Wert).
 * @see docs/GAMIFICATION-OEK2.md §3 · docs/GAMIFICATION-PLAN-OEK2-PHASEN.md Phase 4
 */
export function isGamificationLayerBEnabled(): boolean {
  try {
    const v = import.meta.env.VITE_OEK2_GAMIFICATION_LAYER_B
    if (v === undefined || v === null || v === '') return true
    const s = String(v).trim().toLowerCase()
    if (s === '0' || s === 'false' || s === 'off' || s === 'no') return false
  } catch {
    /* ignore */
  }
  return true
}
