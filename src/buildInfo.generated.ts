// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '01.05.26 22:58'
export const BUILD_TIMESTAMP = 1777669132338

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
