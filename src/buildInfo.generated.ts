// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '24.02.26 06:17'
export const BUILD_TIMESTAMP = 1771910273255

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
