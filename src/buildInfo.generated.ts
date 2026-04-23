// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '23.04.26 14:55'
export const BUILD_TIMESTAMP = 1776948919002

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
