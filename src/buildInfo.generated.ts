// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '13.03.26 08:56'
export const BUILD_TIMESTAMP = 1773388591237

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
