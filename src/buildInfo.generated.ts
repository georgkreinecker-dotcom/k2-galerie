// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '16.03.26 13:27'
export const BUILD_TIMESTAMP = 1773664029403

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
