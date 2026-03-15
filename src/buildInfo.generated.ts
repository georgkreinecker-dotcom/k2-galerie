// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '15.03.26 09:35'
export const BUILD_TIMESTAMP = 1773563706865

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
