/**
 * Admin-Anmeldung und Abmeldung (Galerie-Passwort „merken“ / Abmelden).
 * Testet die Datenebene: setAdminUnlock, clearAdminUnlock, clearAdminUnlockIfExpired, isAdminUnlocked.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  setAdminUnlock,
  clearAdminUnlock,
  clearAdminUnlockIfExpired,
  isAdminUnlocked,
  K2_ADMIN_UNLOCKED_KEY,
  K2_ADMIN_UNLOCKED_EXPIRY_KEY
} from '../utils/adminUnlockStorage'

describe('Admin Anmeldung & Abmeldung', () => {
  beforeEach(() => {
    clearAdminUnlock()
  })

  afterEach(() => {
    clearAdminUnlock()
  })

  describe('Anmeldung (Passwort korrekt, „Merken“)', () => {
    it('setzt k2-admin-unlocked und Ablauf in der Zukunft', () => {
      const durationMs = 30 * 24 * 60 * 60 * 1000
      setAdminUnlock(durationMs)

      expect(localStorage.getItem(K2_ADMIN_UNLOCKED_KEY)).toBe('k2')
      const expiry = localStorage.getItem(K2_ADMIN_UNLOCKED_EXPIRY_KEY)
      expect(expiry).toBeTruthy()
      const expiryMs = parseInt(expiry!, 10)
      expect(Number.isNaN(expiryMs)).toBe(false)
      expect(expiryMs).toBeGreaterThan(Date.now())
    })

    it('isAdminUnlocked() ist true nach setAdminUnlock', () => {
      setAdminUnlock(7 * 24 * 60 * 60 * 1000)
      expect(isAdminUnlocked()).toBe(true)
    })
  })

  describe('Abmeldung (Abmelde-Szenario)', () => {
    it('entfernt Unlock und Ablauf', () => {
      setAdminUnlock(30 * 24 * 60 * 60 * 1000)
      expect(localStorage.getItem(K2_ADMIN_UNLOCKED_KEY)).toBe('k2')

      clearAdminUnlock()

      expect(localStorage.getItem(K2_ADMIN_UNLOCKED_KEY)).toBeNull()
      expect(localStorage.getItem(K2_ADMIN_UNLOCKED_EXPIRY_KEY)).toBeNull()
    })

    it('isAdminUnlocked() ist false nach clearAdminUnlock', () => {
      setAdminUnlock(30 * 24 * 60 * 60 * 1000)
      clearAdminUnlock()
      expect(isAdminUnlocked()).toBe(false)
    })
  })

  describe('Abgelaufen', () => {
    it('clearAdminUnlockIfExpired entfernt Unlock wenn Ablauf in der Vergangenheit', () => {
      setAdminUnlock(30 * 24 * 60 * 60 * 1000)
      // Ablauf auf gestern setzen
      const past = Date.now() - 24 * 60 * 60 * 1000
      localStorage.setItem(K2_ADMIN_UNLOCKED_EXPIRY_KEY, String(past))

      const cleared = clearAdminUnlockIfExpired()

      expect(cleared).toBe(true)
      expect(localStorage.getItem(K2_ADMIN_UNLOCKED_KEY)).toBeNull()
      expect(localStorage.getItem(K2_ADMIN_UNLOCKED_EXPIRY_KEY)).toBeNull()
    })

    it('clearAdminUnlockIfExpired ändert nichts wenn Ablauf in der Zukunft', () => {
      setAdminUnlock(30 * 24 * 60 * 60 * 1000)

      const cleared = clearAdminUnlockIfExpired()

      expect(cleared).toBe(false)
      expect(localStorage.getItem(K2_ADMIN_UNLOCKED_KEY)).toBe('k2')
      expect(localStorage.getItem(K2_ADMIN_UNLOCKED_EXPIRY_KEY)).toBeTruthy()
    })

    it('isAdminUnlocked() ist false wenn Ablauf abgelaufen', () => {
      setAdminUnlock(1)
      const past = Date.now() - 1000
      localStorage.setItem(K2_ADMIN_UNLOCKED_EXPIRY_KEY, String(past))
      expect(isAdminUnlocked()).toBe(false)
    })
  })

  describe('Kompletter Ablauf: Anmeldung → Abmeldung', () => {
    it('nach Anmeldung (setAdminUnlock) und Abmeldung (clearAdminUnlock) ist kein Unlock mehr gesetzt', () => {
      setAdminUnlock(30 * 24 * 60 * 60 * 1000)
      expect(isAdminUnlocked()).toBe(true)

      clearAdminUnlock()

      expect(isAdminUnlocked()).toBe(false)
      expect(localStorage.getItem(K2_ADMIN_UNLOCKED_KEY)).toBeNull()
    })
  })
})
