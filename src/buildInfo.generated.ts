// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '26.03.26 15:32'
export const BUILD_TIMESTAMP = 1774535526830

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
