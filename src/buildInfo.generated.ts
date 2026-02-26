// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '26.02.26 20:06'
export const BUILD_TIMESTAMP = 1772132776010

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
