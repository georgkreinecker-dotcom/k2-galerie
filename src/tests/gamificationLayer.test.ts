import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('isGamificationLayerBEnabled', () => {
  beforeEach(() => {
    vi.resetModules()
  })
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('Standard: leer/unset → true', async () => {
    vi.stubEnv('VITE_OEK2_GAMIFICATION_LAYER_B', '')
    const { isGamificationLayerBEnabled } = await import('../utils/gamificationLayer')
    expect(isGamificationLayerBEnabled()).toBe(true)
  })

  it('0 / false / off / no → false', async () => {
    for (const v of ['0', 'false', 'off', 'no', 'FALSE', ' Off ']) {
      vi.resetModules()
      vi.stubEnv('VITE_OEK2_GAMIFICATION_LAYER_B', v)
      const { isGamificationLayerBEnabled } = await import('../utils/gamificationLayer')
      expect(isGamificationLayerBEnabled()).toBe(false)
      vi.unstubAllEnvs()
    }
  })

  it('anderer Wert → true', async () => {
    vi.stubEnv('VITE_OEK2_GAMIFICATION_LAYER_B', '1')
    const { isGamificationLayerBEnabled } = await import('../utils/gamificationLayer')
    expect(isGamificationLayerBEnabled()).toBe(true)
  })
})

describe('shouldShowGamificationChecklists / Profi localStorage', () => {
  const store: Record<string, string> = {}
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
    Object.keys(store).forEach((k) => delete store[k])
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => (k in store ? store[k] : null),
      setItem: (k: string, v: string) => { store[k] = v },
      removeItem: (k: string) => { delete store[k] },
      clear: () => { Object.keys(store).forEach((k) => delete store[k]) },
      key: () => null,
      length: 0,
    })
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('Schicht B an, kein Profi-Flag → sichtbar', async () => {
    vi.stubEnv('VITE_OEK2_GAMIFICATION_LAYER_B', '')
    const { shouldShowGamificationChecklists } = await import('../utils/gamificationLayer')
    expect(shouldShowGamificationChecklists()).toBe(true)
  })

  it('Schicht B an, Profi-Flag in localStorage → unsichtbar', async () => {
    vi.stubEnv('VITE_OEK2_GAMIFICATION_LAYER_B', '')
    const { GAMIFICATION_CHECKLISTS_USER_HIDE_KEY } = await import('../utils/gamificationLayer')
    store[GAMIFICATION_CHECKLISTS_USER_HIDE_KEY] = '1'
    const { shouldShowGamificationChecklists } = await import('../utils/gamificationLayer')
    expect(shouldShowGamificationChecklists()).toBe(false)
  })

  it('Schicht B aus → immer unsichtbar (auch ohne Profi)', async () => {
    vi.stubEnv('VITE_OEK2_GAMIFICATION_LAYER_B', '0')
    const { shouldShowGamificationChecklists } = await import('../utils/gamificationLayer')
    expect(shouldShowGamificationChecklists()).toBe(false)
  })
})
