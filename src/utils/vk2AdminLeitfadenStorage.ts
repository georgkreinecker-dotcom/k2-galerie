/**
 * VK2-Admin-Rundgang (nur Plattform): eine Quelle für Sichtbarkeit über Routen hinweg.
 * Session = Tab; „Abgeschlossen“ = localStorage (dauerhaft bis Reset).
 */

export const LS_VK2_ADMIN_LEITFADEN_DONE = 'vk2-admin-leitfaden-abgeschlossen'
export const SS_VK2_ADMIN_RUNDGANG_SICHTBAR = 'vk2-admin-rundgang-sichtbar'

export const EVENT_VK2_ADMIN_RUNDGANG = 'vk2-admin-rundgang-changed'

export function hasVk2AdminLeitfadenCompleted(): boolean {
  try {
    return localStorage.getItem(LS_VK2_ADMIN_LEITFADEN_DONE) === '1'
  } catch {
    return false
  }
}

export function isVk2AdminRundgangSessionVisible(): boolean {
  try {
    return sessionStorage.getItem(SS_VK2_ADMIN_RUNDGANG_SICHTBAR) === '1'
  } catch {
    return false
  }
}

export function setVk2AdminRundgangSessionVisible(visible: boolean): void {
  try {
    if (visible) sessionStorage.setItem(SS_VK2_ADMIN_RUNDGANG_SICHTBAR, '1')
    else sessionStorage.removeItem(SS_VK2_ADMIN_RUNDGANG_SICHTBAR)
  } catch {
    /* ignore */
  }
  try {
    window.dispatchEvent(new Event(EVENT_VK2_ADMIN_RUNDGANG))
  } catch {
    /* ignore */
  }
}

/** Hub-Button „Admin-Rundgang“: gleiche Quelle wie Auto-Öffnen. */
export function openVk2AdminRundgangGlobally(): void {
  setVk2AdminRundgangSessionVisible(true)
}
