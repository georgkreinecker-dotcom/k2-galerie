// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '21.03.26 21:07'
export const BUILD_TIMESTAMP = 1774123638176

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
