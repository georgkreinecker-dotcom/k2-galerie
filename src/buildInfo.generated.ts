// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '21.02.26 09:02'
export const BUILD_TIMESTAMP = 1771660925496

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
