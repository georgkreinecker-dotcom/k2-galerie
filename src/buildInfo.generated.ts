// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '23.02.26 15:09'
export const BUILD_TIMESTAMP = 1771855749761

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
