/**
 * Präsentationsmappe / Screenshot-Modus (`?pm=1`): Impressum-Footer aus, kein Huber-Rundgang-Modal.
 * `pm=1` in der URL setzt sessionStorage – bleibt bei Navigation innerhalb K2 Familie erhalten, bis `?pm=0` oder Tab neu.
 *
 * Deckblatt-Minimal (`?deckblatt=1` oder kurz `?d=1`): Weniger Text-Chrome für Druck-Deckblatt-PNGs; in
 * sessionStorage nur, wenn `pm=1` oder bestehende pm-Sitzung (Playwright/Mappe).
 * `?d=1` ohne `pm` → nur **diese** URL minimal, **kein** dauerhaftes Speichern (alte Falle: Hero wirkte dauerhaft leer).
 * Verwaistes Deckblatt-Flag (ohne pm) wird entfernt, sobald `d` fehlt.
 */
import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

const SESSION_KEY_PM = 'k2-familie-pm'
const SESSION_KEY_DECKBLATT = 'k2-familie-deckblatt-minimal'

export type K2FamiliePresentationModeState = {
  presentationMode: boolean
  deckblattMinimal: boolean
}

type SessionStore = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

/**
 * Wende URL-Query auf session-ähnlichen Store an (mutierend, wie im Browser).
 * Exportiert für Unit-Tests mit In-Memory-Store.
 */
export function applyK2FamiliePresentationFromSearch(
  search: string,
  store: SessionStore,
): K2FamiliePresentationModeState {
  const q = search.startsWith('?') ? search.slice(1) : search
  const params = new URLSearchParams(q)
  const pm = params.get('pm')
  if (pm === '1') {
    store.setItem(SESSION_KEY_PM, '1')
  } else if (pm === '0') {
    store.removeItem(SESSION_KEY_PM)
  }
  const pmSitzungAktiv = store.getItem(SESSION_KEY_PM) === '1'
  const dParam = params.get('deckblatt') ?? params.get('d')
  if (dParam === '1') {
    if (pm === '1' || pmSitzungAktiv) {
      store.setItem(SESSION_KEY_DECKBLATT, '1')
    }
  } else if (dParam === '0') {
    store.removeItem(SESSION_KEY_DECKBLATT)
  } else if (dParam == null) {
    if (store.getItem(SESSION_KEY_DECKBLATT) === '1' && !pmSitzungAktiv) {
      store.removeItem(SESSION_KEY_DECKBLATT)
    }
  }
  const presentationMode =
    pm === '1' ? true : pm === '0' ? false : store.getItem(SESSION_KEY_PM) === '1'
  const deckblattAufDieserUrl = dParam === '1'
  const deckblattMinimal =
    deckblattAufDieserUrl
      ? true
      : dParam === '0'
        ? false
        : store.getItem(SESSION_KEY_DECKBLATT) === '1'
  return { presentationMode, deckblattMinimal }
}

export function useK2FamiliePresentationMode(): K2FamiliePresentationModeState {
  const location = useLocation()
  return useMemo(() => {
    try {
      if (typeof sessionStorage === 'undefined') {
        return { presentationMode: false, deckblattMinimal: false }
      }
      return applyK2FamiliePresentationFromSearch(location.search, sessionStorage)
    } catch {
      return { presentationMode: false, deckblattMinimal: false }
    }
  }, [location.search])
}
