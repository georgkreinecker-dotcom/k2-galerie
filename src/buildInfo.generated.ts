// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '28.02.26 07:04'
export const BUILD_TIMESTAMP = 1772258661081

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
