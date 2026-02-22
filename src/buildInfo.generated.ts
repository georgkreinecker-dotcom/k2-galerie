// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '22.02.26 20:10'
export const BUILD_TIMESTAMP = 1771787442208

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
