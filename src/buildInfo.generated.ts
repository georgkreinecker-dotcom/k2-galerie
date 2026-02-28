// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '28.02.26 17:22'
export const BUILD_TIMESTAMP = 1772295735501

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
