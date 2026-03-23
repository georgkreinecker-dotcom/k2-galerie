/**
 * Eine Quelle für „interne Herkunft“ per document.referrer (gleiche Origin).
 * Alle Stellen, die Admin-Banner vs. Fremden-Banner vs. Referrer steuern, müssen dieselbe Logik nutzen –
 * sonst driftet eine Kopie auf eine alte Regel (z. B. „unter /projects/k2-galerie aber nicht /galerie“).
 */

/** Pfad der letzten Seite (ohne Query/Hash), nur wenn Referrer dieselbe Origin hat; sonst null. */
export function getSameOriginReferrerPath(): string | null {
  if (typeof document === 'undefined' || typeof window === 'undefined') return null
  const ref = document.referrer || ''
  const origin = window.location.origin
  if (!ref.startsWith(origin)) return null
  let path = ref.slice(origin.length) || '/'
  const qi = path.indexOf('?')
  if (qi !== -1) path = path.slice(0, qi)
  const hi = path.indexOf('#')
  if (hi !== -1) path = path.slice(0, hi)
  return path || '/'
}

/** Mission Control, Mein-Bereich, Admin – klar intern. */
export function isReferrerApfInternalToolPath(path: string): boolean {
  return (
    path.includes('mission-control') ||
    path.includes('mein-bereich') ||
    path.includes('/admin')
  )
}

/**
 * Nur der nackte Projekte-Hub für K2-Galerie – keine Unterrouten (galerie-oeffentlich, seitengestaltung, …).
 * Dorther = „von der APf-Kachel“, nicht „Besucher springt von einer anderen App-Seite“.
 */
export function isReferrerK2GalerieApfProjectHubOnly(path: string): boolean {
  return path === '/projects/k2-galerie' || path === '/projects/k2-galerie/'
}

/** Referrer deutet auf Session von Arbeitsplatz / intern – für Admin-Button ja, Fremden-Banner nein. */
export function isReferrerIndicatingApfStyleSession(path: string): boolean {
  return isReferrerApfInternalToolPath(path) || isReferrerK2GalerieApfProjectHubOnly(path)
}
