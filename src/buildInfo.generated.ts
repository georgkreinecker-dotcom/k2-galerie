// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '06.10.26 02:42'
export const BUILD_TIMESTAMP = 1791247350411

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
