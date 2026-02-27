// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '27.02.26 12:31'
export const BUILD_TIMESTAMP = 1772191889617

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
