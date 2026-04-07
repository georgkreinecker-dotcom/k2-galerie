// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '07.04.26 14:26'
export const BUILD_TIMESTAMP = 1775564798094

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
