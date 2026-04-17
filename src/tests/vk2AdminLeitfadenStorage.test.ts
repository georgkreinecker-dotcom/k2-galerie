import { describe, it, expect, beforeEach } from 'vitest'
import {
  LS_VK2_ADMIN_LEITFADEN_DONE,
  SS_VK2_ADMIN_RUNDGANG_SICHTBAR,
  hasVk2AdminLeitfadenCompleted,
  isVk2AdminRundgangSessionVisible,
  setVk2AdminRundgangSessionVisible,
  openVk2AdminRundgangGlobally,
} from '../utils/vk2AdminLeitfadenStorage'

describe('vk2AdminLeitfadenStorage', () => {
  beforeEach(() => {
    try {
      localStorage.removeItem(LS_VK2_ADMIN_LEITFADEN_DONE)
    } catch {
      /* ignore */
    }
    try {
      sessionStorage.removeItem(SS_VK2_ADMIN_RUNDGANG_SICHTBAR)
    } catch {
      /* ignore */
    }
  })

  it('Abgeschlossen: localStorage', () => {
    expect(hasVk2AdminLeitfadenCompleted()).toBe(false)
    localStorage.setItem(LS_VK2_ADMIN_LEITFADEN_DONE, '1')
    expect(hasVk2AdminLeitfadenCompleted()).toBe(true)
  })

  it('Session-Sichtbarkeit toggeln', () => {
    expect(isVk2AdminRundgangSessionVisible()).toBe(false)
    setVk2AdminRundgangSessionVisible(true)
    expect(isVk2AdminRundgangSessionVisible()).toBe(true)
    setVk2AdminRundgangSessionVisible(false)
    expect(isVk2AdminRundgangSessionVisible()).toBe(false)
  })

  it('openVk2AdminRundgangGlobally setzt Session sichtbar', () => {
    openVk2AdminRundgangGlobally()
    expect(isVk2AdminRundgangSessionVisible()).toBe(true)
  })
})
