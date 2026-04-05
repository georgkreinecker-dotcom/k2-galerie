// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '05.04.26 20:05'
export const BUILD_TIMESTAMP = 1775412305676

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
