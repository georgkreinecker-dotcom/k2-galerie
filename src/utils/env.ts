/**
 * Zentrale Umgebungs-Checks und sichere Aktionen.
 * Eine Quelle für Reload-Logik – verhindert Duplikation und Cursor-Preview-Crashes.
 */

/**
 * Führt einen sicheren Reload mit Cache-Bust durch.
 * Im iframe (z. B. Cursor Preview) wird kein Reload ausgeführt – verhindert Loop/Crash.
 * Erhält bestehende URL-Parameter und hängt nur v=Date.now() an.
 */
export function safeReload(): void {
  if (typeof window === 'undefined') return
  if (window.self !== window.top) return
  const params = new URLSearchParams(window.location.search || '')
  params.set('v', String(Date.now()))
  const url = window.location.origin + window.location.pathname + '?' + params.toString()
  window.location.replace(url)
}
