// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '02.03.26 05:15'
export const BUILD_TIMESTAMP = 1772424916385

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
