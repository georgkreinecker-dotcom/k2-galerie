import { describe, it, expect } from 'vitest'
import { fuelleGeschichteGeruest, GESCHICHTE_LEITPLANKEN } from '../config/k2FamilieGeschichteStruktur'

describe('k2FamilieGeschichteStruktur', () => {
  it('fuelleGeschichteGeruest ersetzt Datum und Titel', () => {
    const s = fuelleGeschichteGeruest('1990-06-15', 'Unsere Zeit')
    expect(s).toContain('1990-06-15')
    expect(s).toContain('Unsere Zeit')
    expect(s).toContain('## Titel & Anker')
    expect(s).toContain('## Verlauf')
  })

  it('Leitplanken sind kurz und vorhanden', () => {
    expect(GESCHICHTE_LEITPLANKEN.length).toBeGreaterThanOrEqual(3)
    expect(GESCHICHTE_LEITPLANKEN.some((l) => /Ton/i.test(l.titel))).toBe(true)
  })
})
