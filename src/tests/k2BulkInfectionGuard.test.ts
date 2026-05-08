import { describe, expect, it } from 'vitest'
import { isLikelyK2ProductionBulkInfection, stripK2ProductionStyleArtworks } from '../utils/k2BulkInfectionGuard'

function k2Works(n: number) {
  return Array.from({ length: n }, (_, i) => ({ number: `K2-M-${String(i + 1).padStart(4, '0')}` }))
}

describe('k2BulkInfectionGuard', () => {
  it('leere / kurze Listen: nicht infiziert', () => {
    expect(isLikelyK2ProductionBulkInfection([])).toBe(false)
    expect(isLikelyK2ProductionBulkInfection(k2Works(14))).toBe(false)
  })

  it('15+ K2-Stil mit ausreichendem Anteil: infiziert', () => {
    expect(isLikelyK2ProductionBulkInfection(k2Works(15))).toBe(true)
    const mixed = [...k2Works(15), { number: 'M-0001' }, { number: 'P1' }]
    expect(isLikelyK2ProductionBulkInfection(mixed)).toBe(true)
  })

  it('K2-W- zählt nicht zur K2-Produktionsheuristik', () => {
    const w = Array.from({ length: 20 }, (_, i) => ({ number: `K2-W-${i + 1}` }))
    expect(isLikelyK2ProductionBulkInfection(w)).toBe(false)
  })
})

describe('stripK2ProductionStyleArtworks', () => {
  it('entfernt nur K2-M/G/K/S/O- Produktionsnummern', () => {
    const mixed = [
      { number: 'K2-M-0001' },
      { number: 'M-0001' },
      { id: 'K2-K-0099' },
      { number: 'K2-W-01' },
    ]
    const out = stripK2ProductionStyleArtworks(mixed)
    expect(out).toHaveLength(2)
    expect((out[0] as { number: string }).number).toBe('M-0001')
    expect((out[1] as { number: string }).number).toBe('K2-W-01')
  })
})
