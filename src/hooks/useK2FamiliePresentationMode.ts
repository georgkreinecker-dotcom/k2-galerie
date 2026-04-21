/**
 * Präsentationsmappe / Screenshot-Modus (`?pm=1`): Impressum-Footer aus, kein Huber-Rundgang-Modal.
 * `pm=1` in der URL setzt sessionStorage – bleibt bei Navigation innerhalb K2 Familie erhalten, bis `?pm=0` oder Tab neu.
 *
 * Deckblatt-Minimal (`?deckblatt=1` oder kurz `?d=1`): Weniger Text-Chrome für Druck-Deckblatt-PNGs; ebenfalls in
 * sessionStorage gespiegelt (`k2-familie-deckblatt-minimal`), damit Playwright nach `goto` ohne erneuten Query-String
 * dieselbe Ansicht hat wie bei Navigation in der App.
 */
import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

const SESSION_KEY_PM = 'k2-familie-pm'
/** Bleibt über Navigation erhalten wie pm – für Screenshots nach page.goto mit nur &pm=1&deckblatt=1 in der ersten URL. */
const SESSION_KEY_DECKBLATT = 'k2-familie-deckblatt-minimal'

export type K2FamiliePresentationModeState = {
  /** Entspricht bisherigem `?pm=1`-Verhalten (Footer aus, Rundgang aus). */
  presentationMode: boolean
  /** Deckblatt/Screenshot: Hero-Texte und Musterfamilie-Labels reduzieren. */
  deckblattMinimal: boolean
}

export function useK2FamiliePresentationMode(): K2FamiliePresentationModeState {
  const location = useLocation()
  return useMemo(() => {
    try {
      const params = new URLSearchParams(location.search)
      const pm = params.get('pm')
      if (pm === '1') {
        sessionStorage.setItem(SESSION_KEY_PM, '1')
      } else if (pm === '0') {
        sessionStorage.removeItem(SESSION_KEY_PM)
      }
      const dParam = params.get('deckblatt') ?? params.get('d')
      if (dParam === '1') {
        sessionStorage.setItem(SESSION_KEY_DECKBLATT, '1')
      } else if (dParam === '0') {
        sessionStorage.removeItem(SESSION_KEY_DECKBLATT)
      }
      const presentationMode =
        pm === '1' ? true : pm === '0' ? false : sessionStorage.getItem(SESSION_KEY_PM) === '1'
      const deckblattMinimal =
        dParam === '1'
          ? true
          : dParam === '0'
            ? false
            : sessionStorage.getItem(SESSION_KEY_DECKBLATT) === '1'
      return { presentationMode, deckblattMinimal }
    } catch {
      return { presentationMode: false, deckblattMinimal: false }
    }
  }, [location.search])
}
