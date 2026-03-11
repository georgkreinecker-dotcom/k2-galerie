// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '11.03.26 18:06'
export const BUILD_TIMESTAMP = 1773248810460

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
