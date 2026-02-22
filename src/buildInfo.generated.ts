// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '22.02.26 19:39'
export const BUILD_TIMESTAMP = 1771785571682

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
