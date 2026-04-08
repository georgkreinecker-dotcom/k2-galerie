// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '08.04.26 11:30'
export const BUILD_TIMESTAMP = 1775640643450

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
