// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '22.04.26 18:41'
export const BUILD_TIMESTAMP = 1776876074691

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
