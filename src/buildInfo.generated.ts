// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '08.05.26 19:03'
export const BUILD_TIMESTAMP = 1778259815804

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
