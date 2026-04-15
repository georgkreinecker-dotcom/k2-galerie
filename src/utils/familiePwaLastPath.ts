/**
 * PWA-Icon startet immer mit manifest `start_url` = `/familie` – das OS merkt sich keine SPA-Unterroute.
 * Wir speichern die letzte K2-Familie-Route und stellen sie beim Kaltstart auf `/familie` wieder her
 * (useLayoutEffect im Layout, bevor „letzter Pfad“ überschrieben wird).
 */

import { getFamilieEinladungPending } from './familieEinladungPending'
import { isK2FamilieMeineFamilieHomePath, K2_FAMILIE_APP_SHORT_PATH } from './k2FamiliePwaBranding'

export const K2_FAMILIE_PWA_LAST_PATH_KEY = 'k2-familie-pwa-last-path'

export function shouldSkipFamiliePwaResumeFromHome(search: string): boolean {
  if (getFamilieEinladungPending() != null) return true
  const sp = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  if (sp.get('t') || sp.get('z') || sp.get('m') || sp.get('fn')) return true
  return false
}

export function isAllowedFamilieStoredPath(pathname: string): boolean {
  if (!pathname || pathname.includes('..')) return false
  const p = pathname.replace(/\/$/, '') || '/'
  if (p === K2_FAMILIE_APP_SHORT_PATH) return true
  if (!p.startsWith('/projects/k2-familie')) return false
  return true
}

/** Reiner „Meine Familie“-Start ohne Query – dann kein Resume (bleibt Home). */
export function isFamiliePwaHomeOnlyPath(pathname: string, search: string): boolean {
  if (!isK2FamilieMeineFamilieHomePath(pathname)) return false
  const q = search.startsWith('?') ? search.slice(1) : search
  return q.trim() === ''
}

export function readFamiliePwaLastPath(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(K2_FAMILIE_PWA_LAST_PATH_KEY)
    if (!raw || typeof raw !== 'string') return null
    const url = new URL(raw, window.location.origin)
    if (!isAllowedFamilieStoredPath(url.pathname)) return null
    return url.pathname + (url.search || '')
  } catch {
    return null
  }
}

export function writeFamiliePwaLastPath(pathname: string, search: string): void {
  if (typeof window === 'undefined') return
  try {
    const p = pathname || '/'
    if (!isAllowedFamilieStoredPath(p)) return
    const norm = p.replace(/\/$/, '') || '/'
    if (norm === '/projects/k2-familie') return
    const full = p + (search || '')
    const url = new URL(full, window.location.origin)
    localStorage.setItem(K2_FAMILIE_PWA_LAST_PATH_KEY, url.pathname + (url.search || ''))
  } catch {
    /* ignore */
  }
}

/**
 * Wenn der Nutzer die App über `/familie` öffnet: Zielroute oder null (dann normale Startseite).
 */
export function resolveFamiliePwaResumeTarget(homeSearch: string): string | null {
  if (shouldSkipFamiliePwaResumeFromHome(homeSearch)) return null
  const last = readFamiliePwaLastPath()
  if (!last) return null
  try {
    const url = new URL(last, typeof window !== 'undefined' ? window.location.origin : 'https://k2-galerie.vercel.app')
    if (!isAllowedFamilieStoredPath(url.pathname)) return null
    if (isFamiliePwaHomeOnlyPath(url.pathname, url.search)) return null
    return url.pathname + (url.search || '')
  } catch {
    return null
  }
}
