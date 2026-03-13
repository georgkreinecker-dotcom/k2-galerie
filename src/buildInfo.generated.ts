// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '13.03.26 20:11'
export const BUILD_TIMESTAMP = 1773429102863

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
