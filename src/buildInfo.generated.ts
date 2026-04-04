// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '04.04.26 21:48'
export const BUILD_TIMESTAMP = 1775332082967

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
