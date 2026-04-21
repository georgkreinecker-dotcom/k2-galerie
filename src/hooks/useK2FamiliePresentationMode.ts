/**
 * Präsentationsmappe / Screenshot-Modus (`?pm=1`): Impressum-Footer aus, kein Huber-Rundgang-Modal.
 * `pm=1` in der URL setzt sessionStorage – bleibt bei Navigation innerhalb K2 Familie erhalten, bis `?pm=0` oder Tab neu.
 */
import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

const SESSION_KEY = 'k2-familie-pm'

export function useK2FamiliePresentationMode(): boolean {
  const location = useLocation()
  return useMemo(() => {
    try {
      const q = new URLSearchParams(location.search).get('pm')
      if (q === '1') {
        sessionStorage.setItem(SESSION_KEY, '1')
        return true
      }
      if (q === '0') {
        sessionStorage.removeItem(SESSION_KEY)
        return false
      }
      return sessionStorage.getItem(SESSION_KEY) === '1'
    } catch {
      return false
    }
  }, [location.search])
}
