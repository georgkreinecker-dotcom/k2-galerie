// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '18.03.26 08:16'
export const BUILD_TIMESTAMP = 1773818206669

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
