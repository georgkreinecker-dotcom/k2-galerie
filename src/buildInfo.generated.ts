// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '25.02.26 09:38'
export const BUILD_TIMESTAMP = 1772008680032

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${BUILD_TIMESTAMP}`
}
