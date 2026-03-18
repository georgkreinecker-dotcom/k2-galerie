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

/** Produktions-URL für refresh.html (no-cache) – danach Weiterleitung zu / mit Cache-Bust. */
const REFRESH_HTML_PATH = '/refresh.html'

/**
 * Reload mit garantiertem Cache-Bypass: lädt zuerst refresh.html (no-cache),
 * die zur aktuellen Seite mit ?v=... weiterleitet. So bleibt man auf derselben
 * Seite (Galerie, Admin, …) und bekommt trotzdem die neueste Version.
 * Nur auf Produktion (Vercel); lokal bleibt safeReload.
 */
export function safeReloadWithCacheBypass(): void {
  if (typeof window === 'undefined') return
  if (window.self !== window.top) return
  const origin = window.location.origin
  const isLocal = /^https?:\/\/localhost|127\.0\.0\.1/i.test(origin || '')
  if (isLocal) {
    safeReload()
    return
  }
  const t = Date.now()
  const pathname = window.location.pathname || '/'
  const search = window.location.search || ''
  const hash = window.location.hash || ''
  const returnPath = pathname + search + hash
  const params = new URLSearchParams([['t', String(t)], ['r', String(Math.random())], ['return', returnPath]])
  window.location.replace(origin + REFRESH_HTML_PATH + '?' + params.toString())
}

/** URL für refresh.html mit Cache-Bust (z. B. für Anzeige im Fehlerfall). */
export function getRefreshUrl(): string {
  if (typeof window === 'undefined') return ''
  const origin = window.location.origin
  const pathname = window.location.pathname || '/'
  const search = window.location.search || ''
  const hash = window.location.hash || ''
  const returnPath = pathname + search + hash
  const params = new URLSearchParams([['t', String(Date.now())], ['return', returnPath]])
  return origin + REFRESH_HTML_PATH + '?' + params.toString()
}
