/**
 * ök2-Plattform-Rundgang: eine Quelle (Galerie + Admin), Session-Schritt, Migration von alten Keys.
 */

import type { AdminTenantId } from '../context/TenantContext'

export const LS_OEK2_PLATFORM_LEITFADEN_DONE = 'oek2-platform-leitfaden-abgeschlossen'
export const SS_OEK2_PLATFORM_SCHRITT = 'oek2-platform-leitfaden-schritt'
export const SS_OEK2_PLATFORM_SICHTBAR = 'oek2-platform-rundgang-sichtbar'
/** Gleicher Key wie Oek2GalerieLeitfadenModal – Host kann beim Einstieg in ök2 löschen (Willkommen ausgeklappt). */
export const SS_OEK2_GALERIE_LEITFADEN_MINIMIZED = 'oek2-galerie-leitfaden-minimized'

export const EVENT_OEK2_PLATFORM_RUNDGANG = 'oek2-platform-rundgang-changed'

const LEGACY_GALERIE = 'oek2-galerie-leitfaden-abgeschlossen'

export function migrateOek2PlatformLeitfadenFromLegacy(): void {
  try {
    if (localStorage.getItem(LS_OEK2_PLATFORM_LEITFADEN_DONE) === '1') return
    if (localStorage.getItem(LEGACY_GALERIE) === '1') {
      localStorage.setItem(LS_OEK2_PLATFORM_LEITFADEN_DONE, '1')
    }
  } catch {
    /* ignore */
  }
}

export function hasOek2PlatformLeitfadenCompleted(): boolean {
  migrateOek2PlatformLeitfadenFromLegacy()
  try {
    return localStorage.getItem(LS_OEK2_PLATFORM_LEITFADEN_DONE) === '1'
  } catch {
    return false
  }
}

export function setOek2PlatformLeitfadenCompleted(done: boolean): void {
  try {
    if (done) localStorage.setItem(LS_OEK2_PLATFORM_LEITFADEN_DONE, '1')
    else localStorage.removeItem(LS_OEK2_PLATFORM_LEITFADEN_DONE)
  } catch {
    /* ignore */
  }
  dispatchOek2PlatformRundgangEvent()
}

export function readOek2PlatformLeitfadenSchritt(): number {
  try {
    const raw = sessionStorage.getItem(SS_OEK2_PLATFORM_SCHRITT)
    const n = raw != null ? parseInt(raw, 10) : 0
    return Number.isFinite(n) && n >= 0 ? n : 0
  } catch {
    return 0
  }
}

export function writeOek2PlatformLeitfadenSchritt(index: number): void {
  try {
    sessionStorage.setItem(SS_OEK2_PLATFORM_SCHRITT, String(Math.max(0, index)))
  } catch {
    /* ignore */
  }
  dispatchOek2PlatformSchrittChanged()
}

function dispatchOek2PlatformSchrittChanged(): void {
  try {
    window.dispatchEvent(new Event(EVENT_OEK2_PLATFORM_RUNDGANG))
  } catch {
    /* ignore */
  }
}

export function isOek2PlatformRundgangSessionVisible(): boolean {
  try {
    return sessionStorage.getItem(SS_OEK2_PLATFORM_SICHTBAR) === '1'
  } catch {
    return false
  }
}

export function setOek2PlatformRundgangSessionVisible(visible: boolean): void {
  try {
    if (visible) sessionStorage.setItem(SS_OEK2_PLATFORM_SICHTBAR, '1')
    else sessionStorage.removeItem(SS_OEK2_PLATFORM_SICHTBAR)
  } catch {
    /* ignore */
  }
  dispatchOek2PlatformRundgangEvent()
}

function dispatchOek2PlatformRundgangEvent(): void {
  try {
    window.dispatchEvent(new Event(EVENT_OEK2_PLATFORM_RUNDGANG))
  } catch {
    /* ignore */
  }
}

export function openOek2PlatformRundgangGlobally(): void {
  setOek2PlatformRundgangSessionVisible(true)
}

/** Öffentliche Demo-Galerie-Routen (Plattform) – unabhängig von sessionStorage-Mandant. */
export function isOek2PublicGaleriePath(pathname: string): boolean {
  if (pathname === '/galerie-oeffentlich' || pathname === '/galerie-oeffentlich-vorschau') return true
  if (pathname.endsWith('/galerie-oeffentlich') || pathname.endsWith('/galerie-oeffentlich-vorschau')) return true
  return false
}

export function isOek2PlatformLeitfadenContext(pathname: string, tenantId: AdminTenantId): boolean {
  if (isOek2PublicGaleriePath(pathname)) return true
  if (pathname.startsWith('/admin') && tenantId === 'oeffentlich') return true
  return false
}
