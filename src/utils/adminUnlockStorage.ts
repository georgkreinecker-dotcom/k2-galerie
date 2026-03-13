/**
 * Admin-Unlock (Galerie-Passwort „merken“): eine Quelle für setzen, löschen, Ablauf prüfen.
 * Nutzung: GaleriePage (Anmeldung), ScreenshotExportAdmin (Abmelden), App (Session wiederherstellen).
 */

export const K2_ADMIN_UNLOCKED_KEY = 'k2-admin-unlocked'
export const K2_ADMIN_UNLOCKED_EXPIRY_KEY = 'k2-admin-unlocked-expiry'

const DEFAULT_REMEMBER_DAYS = 30

/** Dauerhaft eingeloggt: Unlock + Ablauf setzen (nur K2, nicht ök2). */
export function setAdminUnlock(expiryDurationMs: number = DEFAULT_REMEMBER_DAYS * 24 * 60 * 60 * 1000): void {
  try {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(K2_ADMIN_UNLOCKED_KEY, 'k2')
    localStorage.setItem(K2_ADMIN_UNLOCKED_EXPIRY_KEY, String(Date.now() + expiryDurationMs))
  } catch (_) {}
}

/** Abmelden: Unlock und Ablauf entfernen. */
export function clearAdminUnlock(): void {
  try {
    if (typeof localStorage === 'undefined') return
    localStorage.removeItem(K2_ADMIN_UNLOCKED_KEY)
    localStorage.removeItem(K2_ADMIN_UNLOCKED_EXPIRY_KEY)
  } catch (_) {}
}

/** Wenn Ablauf überschritten: Unlock entfernen. Gibt true zurück, wenn tatsächlich gelöscht wurde. */
export function clearAdminUnlockIfExpired(): boolean {
  try {
    if (typeof localStorage === 'undefined') return false
    const unlocked = localStorage.getItem(K2_ADMIN_UNLOCKED_KEY)
    if (unlocked !== 'k2') return false
    const expiry = localStorage.getItem(K2_ADMIN_UNLOCKED_EXPIRY_KEY)
    if (!expiry) return false
    const expiryMs = parseInt(expiry, 10)
    if (Number.isNaN(expiryMs) || Date.now() <= expiryMs) return false
    localStorage.removeItem(K2_ADMIN_UNLOCKED_KEY)
    localStorage.removeItem(K2_ADMIN_UNLOCKED_EXPIRY_KEY)
    return true
  } catch (_) {
    return false
  }
}

/** Ist aktuell dauerhaft eingeloggt (Unlock gesetzt und noch nicht abgelaufen)? */
export function isAdminUnlocked(): boolean {
  try {
    if (typeof localStorage === 'undefined') return false
    if (localStorage.getItem(K2_ADMIN_UNLOCKED_KEY) !== 'k2') return false
    const expiry = localStorage.getItem(K2_ADMIN_UNLOCKED_EXPIRY_KEY)
    if (!expiry) return true
    const expiryMs = parseInt(expiry, 10)
    if (Number.isNaN(expiryMs)) return true
    return Date.now() <= expiryMs
  } catch (_) {
    return false
  }
}
