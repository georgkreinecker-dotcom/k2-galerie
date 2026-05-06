/**
 * VK2-Plattform-Rundgang: eine Quelle (Galerie + Admin), Session-Schritt, Migration von alten Keys.
 */

import { EVENT_VK2_ADMIN_RUNDGANG } from './vk2AdminLeitfadenStorage'

export const LS_VK2_PLATFORM_LEITFADEN_DONE = 'vk2-platform-leitfaden-abgeschlossen'
export const SS_VK2_PLATFORM_SCHRITT = 'vk2-platform-leitfaden-schritt'
export const SS_VK2_PLATFORM_SICHTBAR = 'vk2-platform-rundgang-sichtbar'
/** Gleicher Key wie Vk2GalerieLeitfadenModal – Host kann beim Einstieg in VK2 löschen (Willkommen ausgeklappt). */
export const SS_VK2_GALERIE_LEITFADEN_MINIMIZED = 'vk2-galerie-leitfaden-minimized'

export const EVENT_VK2_PLATFORM_RUNDGANG = 'vk2-platform-rundgang-changed'

const LEGACY_GALERIE = 'vk2-galerie-leitfaden-abgeschlossen'
const LEGACY_ADMIN = 'vk2-admin-leitfaden-abgeschlossen'

export function migrateVk2PlatformLeitfadenFromLegacy(): void {
  try {
    if (localStorage.getItem(LS_VK2_PLATFORM_LEITFADEN_DONE) === '1') return
    const g = localStorage.getItem(LEGACY_GALERIE) === '1'
    const a = localStorage.getItem(LEGACY_ADMIN) === '1'
    if (g && a) localStorage.setItem(LS_VK2_PLATFORM_LEITFADEN_DONE, '1')
  } catch {
    /* ignore */
  }
}

export function hasVk2PlatformLeitfadenCompleted(): boolean {
  migrateVk2PlatformLeitfadenFromLegacy()
  try {
    return localStorage.getItem(LS_VK2_PLATFORM_LEITFADEN_DONE) === '1'
  } catch {
    return false
  }
}

export function setVk2PlatformLeitfadenCompleted(done: boolean): void {
  try {
    if (done) localStorage.setItem(LS_VK2_PLATFORM_LEITFADEN_DONE, '1')
    else localStorage.removeItem(LS_VK2_PLATFORM_LEITFADEN_DONE)
  } catch {
    /* ignore */
  }
  dispatchVk2PlatformRundgangEvent()
}

export function readVk2PlatformLeitfadenSchritt(): number {
  try {
    const raw = sessionStorage.getItem(SS_VK2_PLATFORM_SCHRITT)
    const n = raw != null ? parseInt(raw, 10) : 0
    return Number.isFinite(n) && n >= 0 ? n : 0
  } catch {
    return 0
  }
}

export function writeVk2PlatformLeitfadenSchritt(index: number): void {
  try {
    sessionStorage.setItem(SS_VK2_PLATFORM_SCHRITT, String(Math.max(0, index)))
  } catch {
    /* ignore */
  }
  dispatchVk2PlatformSchrittChanged()
}

function dispatchVk2PlatformSchrittChanged(): void {
  try {
    window.dispatchEvent(new Event(EVENT_VK2_PLATFORM_RUNDGANG))
  } catch {
    /* ignore */
  }
}

export function isVk2PlatformRundgangSessionVisible(): boolean {
  try {
    return sessionStorage.getItem(SS_VK2_PLATFORM_SICHTBAR) === '1'
  } catch {
    return false
  }
}

export function setVk2PlatformRundgangSessionVisible(visible: boolean): void {
  try {
    if (visible) sessionStorage.setItem(SS_VK2_PLATFORM_SICHTBAR, '1')
    else sessionStorage.removeItem(SS_VK2_PLATFORM_SICHTBAR)
  } catch {
    /* ignore */
  }
  dispatchVk2PlatformRundgangEvent()
}

function dispatchVk2PlatformRundgangEvent(): void {
  try {
    window.dispatchEvent(new Event(EVENT_VK2_PLATFORM_RUNDGANG))
    window.dispatchEvent(new Event(EVENT_VK2_ADMIN_RUNDGANG))
  } catch {
    /* ignore */
  }
}

/** Hub / erneut starten – gleiche Quelle wie früher Admin-Rundgang-Button */
export function openVk2PlatformRundgangGlobally(): void {
  setVk2PlatformRundgangSessionVisible(true)
}

/** Session: VK2-Mitglied nach PIN-Login (Vk2MitgliedLoginPage / Admin). */
const VK2_MITGLIED_EINGELOGGT_KEY = 'k2-vk2-mitglied-eingeloggt'

/** True, wenn ein Vereinsmitglied per PIN eingeloggt ist – Rundgang darf dann nicht vom Admin zur öffentlichen Galerie zwingen. */
export function isVk2MitgliedPinSessionActive(): boolean {
  try {
    if (typeof window === 'undefined') return false
    return !!sessionStorage.getItem(VK2_MITGLIED_EINGELOGGT_KEY)
  } catch {
    return false
  }
}

/** Öffentliche VK2-Galerie-Routen (Plattform) – parallel zu ök2 `isOek2PublicGaleriePath`. */
export function isVk2PublicGaleriePath(pathname: string): boolean {
  if (pathname === '/projects/vk2/galerie' || pathname === '/projects/vk2/galerie-vorschau') return true
  if (pathname.endsWith('/vk2/galerie') || pathname.endsWith('/vk2/galerie-vorschau')) return true
  return false
}

/** Rundgang nur dort anzeigen, wo Galerie oder Demo-Admin Sinn ergibt (nicht auf beliebigen Seiten bei vk2-Mandant). */
export function isVk2PlatformLeitfadenContext(pathname: string, tenantIsVk2: boolean): boolean {
  if (isVk2PublicGaleriePath(pathname)) return true
  if (pathname.startsWith('/admin') && tenantIsVk2) return true
  return false
}
