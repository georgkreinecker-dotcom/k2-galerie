// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '10.04.26 20:51'
export const BUILD_TIMESTAMP = 1775847085320

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
