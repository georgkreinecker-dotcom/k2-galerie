// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '26.02.26 10:26'
export const BUILD_TIMESTAMP = 1772097998407

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
