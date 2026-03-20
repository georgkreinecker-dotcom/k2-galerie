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

/** Profi-Modus: Nutzer blendet Checklisten/Fortschritts-Hinweise im Admin aus (pro Gerät, localStorage). */
export const GAMIFICATION_CHECKLISTS_USER_HIDE_KEY = 'k2-admin-hide-gamification-checklists'

export const GAMIFICATION_CHECKLISTS_PREF_EVENT = 'k2-gamification-checklists-pref'

export function isGamificationChecklistsHiddenByUser(): boolean {
  try {
    return localStorage.getItem(GAMIFICATION_CHECKLISTS_USER_HIDE_KEY) === '1'
  } catch {
    return false
  }
}

export function setGamificationChecklistsHidden(hidden: boolean): void {
  try {
    if (hidden) localStorage.setItem(GAMIFICATION_CHECKLISTS_USER_HIDE_KEY, '1')
    else localStorage.removeItem(GAMIFICATION_CHECKLISTS_USER_HIDE_KEY)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(GAMIFICATION_CHECKLISTS_PREF_EVENT))
    }
  } catch {
    /* ignore */
  }
}

/** Schicht B an **und** Nutzer hat Profi-Ausblendung nicht gewählt. */
export function shouldShowGamificationChecklists(): boolean {
  return isGamificationLayerBEnabled() && !isGamificationChecklistsHiddenByUser()
}
