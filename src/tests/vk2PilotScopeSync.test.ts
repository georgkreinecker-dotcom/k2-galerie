/**
 * Regression: Pilot-Scope muss auch bei /admin?context=vk2 synchronisiert werden –
 * sonst Musterverein statt Sandbox (mehrfach aufgetreten).
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  getActiveVk2PilotId,
  shouldSyncVk2PilotScopeFromUrl,
  syncVk2PilotScopeFromSearch,
  VK2_PILOT_SESSION_KEY,
} from '../utils/vk2StorageKeys'

describe('shouldSyncVk2PilotScopeFromUrl', () => {
  it('true: VK2-Projektrouten', () => {
    expect(shouldSyncVk2PilotScopeFromUrl('/projects/vk2/galerie', '')).toBe(true)
    expect(shouldSyncVk2PilotScopeFromUrl('/projects/vk2/einstieg', '?vk2Pilot=14')).toBe(true)
  })

  it('true: /admin und /mein-bereich mit context=vk2', () => {
    expect(shouldSyncVk2PilotScopeFromUrl('/admin', '?context=vk2')).toBe(true)
    expect(shouldSyncVk2PilotScopeFromUrl('/admin', '?context=vk2&tab=einstellungen')).toBe(true)
    expect(shouldSyncVk2PilotScopeFromUrl('/mein-bereich', '?context=vk2')).toBe(true)
  })

  it('true: APf-Projekt K2 Galerie mit context=vk2', () => {
    expect(shouldSyncVk2PilotScopeFromUrl('/projects/k2-galerie', '?context=vk2')).toBe(true)
  })

  it('false: /admin ohne vk2 oder ohne context=vk2', () => {
    expect(shouldSyncVk2PilotScopeFromUrl('/admin', '')).toBe(false)
    expect(shouldSyncVk2PilotScopeFromUrl('/admin', '?context=k2')).toBe(false)
    expect(shouldSyncVk2PilotScopeFromUrl('/admin', '?context=oeffentlich')).toBe(false)
  })

  it('false: andere Routen mit context=vk2 in anderem Pfad', () => {
    expect(shouldSyncVk2PilotScopeFromUrl('/galerie', '?context=vk2')).toBe(false)
  })
})

describe('syncVk2PilotScopeFromSearch + Einladung', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('setzt Pilot-ID aus URL-Parameter vk2Pilot', () => {
    syncVk2PilotScopeFromSearch('?vk2Pilot=14')
    expect(getActiveVk2PilotId()).toBe('14')
  })

  it('setzt Pilot-ID aus k2-pilot-einladung wenn context=vk2 (Zettel)', () => {
    sessionStorage.setItem(
      'k2-pilot-einladung',
      JSON.stringify({ context: 'vk2', vk2PilotId: '14', zettelNr: '14' }),
    )
    syncVk2PilotScopeFromSearch('')
    expect(sessionStorage.getItem(VK2_PILOT_SESSION_KEY)).toBe('14')
  })
})
