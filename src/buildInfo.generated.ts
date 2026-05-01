// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '01.05.26 09:55'
export const BUILD_TIMESTAMP = 1777622152238

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
