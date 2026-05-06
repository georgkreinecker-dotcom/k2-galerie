import { afterEach, describe, expect, it } from 'vitest'
import {
  buildVk2PlatformLeitfadenSchritte,
  vk2PlatformGalerieSchrittCount,
} from '../components/guidedLeitfaden/vk2PlatformLeitfadenSteps'
import {
  isVk2MitgliedPinSessionActive,
  isVk2PlatformLeitfadenContext,
  isVk2PublicGaleriePath,
} from '../utils/vk2PlatformLeitfadenStorage'

const VK2_MITGLIED_SESSION_KEY = 'k2-vk2-mitglied-eingeloggt'

afterEach(() => {
  try {
    sessionStorage.removeItem(VK2_MITGLIED_SESSION_KEY)
  } catch {
    /* ignore */
  }
})

describe('VK2 Plattform-Leitfaden', () => {
  it('verbindet Galerie ohne doppeltes fertig mit Admin ohne doppelte Begrüßung', () => {
    const steps = buildVk2PlatformLeitfadenSchritte('Test')
    const ids = steps.map((s) => s.id)
    expect(ids.filter((id) => id === 'fertig')).toHaveLength(0)
    expect(ids.filter((id) => id === 'begruessung')).toHaveLength(1)
    expect(ids).toContain('wechsel-admin')
    const wechselIdx = ids.indexOf('wechsel-admin')
    expect(wechselIdx).toBeGreaterThan(0)
    expect(steps[wechselIdx]?.phase).toBe('galerie')
    expect(steps[wechselIdx + 1]?.phase).toBe('admin')
  })

  it('Anzahl Galerie-Schritte ohne fertig ist stabil', () => {
    expect(vk2PlatformGalerieSchrittCount()).toBeGreaterThan(3)
  })

  it('VK2 Galerie-Pfade und Kontext für Plattform-Rundgang', () => {
    expect(isVk2PublicGaleriePath('/projects/vk2/galerie')).toBe(true)
    expect(isVk2PublicGaleriePath('/projects/vk2/galerie-vorschau')).toBe(true)
    expect(isVk2PublicGaleriePath('/admin')).toBe(false)
    expect(isVk2PlatformLeitfadenContext('/projects/vk2/galerie', true)).toBe(true)
    expect(isVk2PlatformLeitfadenContext('/admin', true)).toBe(true)
    expect(isVk2PlatformLeitfadenContext('/admin', false)).toBe(false)
    expect(isVk2PlatformLeitfadenContext('/mok2', true)).toBe(false)
  })

  it('Mitglied-PIN-Session: isVk2MitgliedPinSessionActive liest sessionStorage', () => {
    expect(isVk2MitgliedPinSessionActive()).toBe(false)
    sessionStorage.setItem(VK2_MITGLIED_SESSION_KEY, '1')
    expect(isVk2MitgliedPinSessionActive()).toBe(true)
    sessionStorage.removeItem(VK2_MITGLIED_SESSION_KEY)
    expect(isVk2MitgliedPinSessionActive()).toBe(false)
  })
})
