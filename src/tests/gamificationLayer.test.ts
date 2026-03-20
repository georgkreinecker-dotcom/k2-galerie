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
