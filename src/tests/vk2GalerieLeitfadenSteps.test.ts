import { describe, expect, it } from 'vitest'
import { buildVk2GalerieLeitfadenSchritte } from '../components/guidedLeitfaden/vk2GalerieLeitfadenSteps'

describe('VK2 Galerie Leitfaden (nur Texte)', () => {
  it('liefert feste Schritte mit gültigen focusKey', () => {
    const steps = buildVk2GalerieLeitfadenSchritte('Test')
    expect(steps.length).toBeGreaterThanOrEqual(6)
    const keys = steps.map((s) => s.focusKey).filter(Boolean) as string[]
    for (const k of keys) {
      expect(/^[a-z0-9-]+$/i.test(k)).toBe(true)
    }
    expect(keys).toContain('willkommen')
    expect(keys).toContain('admin-hinweis')
  })
})
