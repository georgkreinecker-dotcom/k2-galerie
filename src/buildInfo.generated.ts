// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '25.02.26 10:37'
export const BUILD_TIMESTAMP = 1772012220288

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
