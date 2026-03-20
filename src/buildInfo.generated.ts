// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '20.03.26 06:26'
export const BUILD_TIMESTAMP = 1773984390055

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
