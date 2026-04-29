// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '29.04.26 18:18'
export const BUILD_TIMESTAMP = 1777479518137

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
