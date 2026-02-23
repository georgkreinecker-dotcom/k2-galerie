// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '23.02.26 08:08'
export const BUILD_TIMESTAMP = 1771830499827

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
