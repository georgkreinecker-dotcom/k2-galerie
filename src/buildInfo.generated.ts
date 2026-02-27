// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '27.02.26 14:15'
export const BUILD_TIMESTAMP = 1772198139128

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
