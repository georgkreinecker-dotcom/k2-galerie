// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '09.05.26 19:18'
export const BUILD_TIMESTAMP = 1778347115490

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
