// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '12.03.26 17:52'
export const BUILD_TIMESTAMP = 1773334354478

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
