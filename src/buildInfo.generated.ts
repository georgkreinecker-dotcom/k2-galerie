// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '13.04.26 09:15'
export const BUILD_TIMESTAMP = 1776064513194

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
