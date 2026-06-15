// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '15.06.26 16:09'
export const BUILD_TIMESTAMP = 1781532565814

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
