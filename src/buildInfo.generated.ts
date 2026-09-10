// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '10.09.26 18:43'
export const BUILD_TIMESTAMP = 1789058607303

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
