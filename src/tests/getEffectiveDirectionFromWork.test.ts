import { describe, expect, it } from 'vitest'
import { getEffectiveDirectionFromWork } from '../config/tenantConfig'

describe('getEffectiveDirectionFromWork', () => {
  it('liefert bei Produkt „moebel“ ohne Hinweis die erste Sparte in FOCUS_DIRECTIONS-Reihenfolge (Handwerk vor Design)', () => {
    expect(getEffectiveDirectionFromWork({ entryType: 'product', category: 'moebel' })).toBe('handwerk')
  })

  it('nutzt tenantPrimaryFocus bei mehrdeutiger Kategorie (Design-Mandant, Kategorie moebel)', () => {
    expect(getEffectiveDirectionFromWork({ entryType: 'product', category: 'moebel' }, 'design')).toBe('design')
  })

  it('Kunstwerk bleibt kunst unabhängig vom Hinweis', () => {
    expect(getEffectiveDirectionFromWork({ entryType: 'artwork', category: 'malerei' }, 'design')).toBe('kunst')
  })

  it('accessoires: Mode vs Design – Hinweis design gewinnt', () => {
    expect(getEffectiveDirectionFromWork({ entryType: 'product', category: 'accessoires' }, 'design')).toBe('design')
  })
})
