// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '11.10.26 17:32'
export const BUILD_TIMESTAMP = 1791732721804

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
