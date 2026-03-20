import { useSearchParams } from 'react-router-dom'

/**
 * K2 vs. ök2 für Druck/Werbemittel (Prospekt, Präsentationsmappe): URL ?context=oeffentlich oder Admin-Session.
 */
export function useWerbemittelPrintContext(): 'k2' | 'oeffentlich' {
  const [searchParams] = useSearchParams()
  const fromUrl = searchParams.get('context') === 'oeffentlich'
  const fromStorage =
    typeof sessionStorage !== 'undefined' && sessionStorage.getItem('k2-admin-context') === 'oeffentlich'
  return fromUrl || fromStorage ? 'oeffentlich' : 'k2'
}
