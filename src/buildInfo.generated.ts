// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '24.02.26 16:46'
export const BUILD_TIMESTAMP = 1771947978102

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
