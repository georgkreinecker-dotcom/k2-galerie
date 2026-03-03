// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '03.03.26 09:00'
export const BUILD_TIMESTAMP = 1772524841735

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
