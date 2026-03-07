// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '07.03.26 09:09'
export const BUILD_TIMESTAMP = 1772870962125

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
