// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '15.04.26 13:10'
export const BUILD_TIMESTAMP = 1776251456117

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
