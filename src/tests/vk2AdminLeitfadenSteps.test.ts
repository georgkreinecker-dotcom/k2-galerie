import { describe, expect, it } from 'vitest'
import { buildVk2AdminLeitfadenSchritte } from '../components/guidedLeitfaden/vk2AdminLeitfadenSteps'

describe('VK2 Admin Leitfaden (nur Texte)', () => {
  it('liefert feste Schritte mit gültigen focusKey', () => {
    const steps = buildVk2AdminLeitfadenSchritte('Test')
    expect(steps.length).toBeGreaterThanOrEqual(7)
    const keys = steps.map((s) => s.focusKey).filter(Boolean) as string[]
    for (const k of keys) {
      expect(/^[a-z0-9-]+$/i.test(k)).toBe(true)
    }
    expect(keys).toContain('hub-intro')
    expect(keys).toContain('hub-werke')
    expect(keys).toContain('werke-bereich')
  })
})
