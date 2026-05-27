// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '27.05.26 09:36'
export const BUILD_TIMESTAMP = 1779867376547

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
