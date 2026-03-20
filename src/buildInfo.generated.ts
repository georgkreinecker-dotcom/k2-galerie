// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '20.03.26 05:50'
export const BUILD_TIMESTAMP = 1773982236190

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
