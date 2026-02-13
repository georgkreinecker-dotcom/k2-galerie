// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '13.02.26 16:51'
export const BUILD_TIMESTAMP = 1770997880739

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
