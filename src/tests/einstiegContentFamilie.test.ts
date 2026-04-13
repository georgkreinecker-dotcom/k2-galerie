import { describe, it, expect, beforeEach } from 'vitest'
import { getFamilieEinstiegTexts, getFamilieEinstiegContent } from '../config/einstiegContentFamilie'

describe('Familie Einstieg B – eigene Keys, nicht Homepage-Texte', () => {
  beforeEach(() => {
    try {
      localStorage.clear()
    } catch {
      /* ignore */
    }
  })

  it('liefert Defaults für unbekannte tenantId', () => {
    const t = getFamilieEinstiegTexts('x-tenant-1')
    expect(t.title.length).toBeGreaterThan(0)
    expect(t.ctaLabel.length).toBeGreaterThan(0)
    const c = getFamilieEinstiegContent('x-tenant-1')
    expect(c.heroImage).toBeUndefined()
  })
})
