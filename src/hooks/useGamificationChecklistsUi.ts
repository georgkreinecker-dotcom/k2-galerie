import { useCallback, useEffect, useState } from 'react'
import {
  GAMIFICATION_CHECKLISTS_PREF_EVENT,
  isGamificationChecklistsHiddenByUser,
  isGamificationLayerBEnabled,
  setGamificationChecklistsHidden as persistGamificationChecklistsHidden,
} from '../utils/gamificationLayer'

/**
 * Sichtbarkeit der Gamification-Checklisten + Profi-Schalter (Einstellungen).
 * Reagiert auf Speicher-Event und storage (anderer Tab).
 */
export function useGamificationChecklistsUi(): {
  showChecklists: boolean
  checklistsHiddenByUser: boolean
  setChecklistsHiddenByUser: (hidden: boolean) => void
} {
  const [hidden, setHidden] = useState(isGamificationChecklistsHiddenByUser)

  useEffect(() => {
    const sync = () => setHidden(isGamificationChecklistsHiddenByUser())
    window.addEventListener(GAMIFICATION_CHECKLISTS_PREF_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(GAMIFICATION_CHECKLISTS_PREF_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const setChecklistsHiddenByUser = useCallback((h: boolean) => {
    persistGamificationChecklistsHidden(h)
    setHidden(h)
  }, [])

  return {
    showChecklists: isGamificationLayerBEnabled() && !hidden,
    checklistsHiddenByUser: hidden,
    setChecklistsHiddenByUser,
  }
}
