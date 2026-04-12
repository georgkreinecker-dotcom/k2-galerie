import { describe, it, expect } from 'vitest'
import type { K2FamiliePerson } from '../types/k2Familie'
import { getGraphDistanceFromIch, portraitSizeFromGraphDistance } from '../utils/familieGraphDistance'

function p(
  id: string,
  partial: Partial<K2FamiliePerson> & Pick<K2FamiliePerson, 'name'>
): K2FamiliePerson {
  return {
    id,
    name: partial.name,
    parentIds: partial.parentIds ?? [],
    childIds: partial.childIds ?? [],
    siblingIds: partial.siblingIds ?? [],
    partners: partial.partners ?? [],
    wahlfamilieIds: partial.wahlfamilieIds ?? [],
    ...partial,
  }
}

describe('familieGraphDistance', () => {
  it('liefert 0 für gleiche Person', () => {
    const personen = [p('a', { name: 'A' })]
    expect(getGraphDistanceFromIch(personen, 'a', 'a')).toBe(0)
  })

  it('liefert null ohne ich', () => {
    const personen = [p('a', { name: 'A' }), p('b', { name: 'B', parentIds: ['a'] })]
    expect(getGraphDistanceFromIch(personen, undefined, 'b')).toBe(null)
  })

  it('Eltern-Kind: Abstand 1 (Kanten über parentIds/childIds)', () => {
    const personen = [
      p('eltern', { name: 'E', childIds: ['kind'] }),
      p('kind', { name: 'K', parentIds: ['eltern'] }),
    ]
    expect(getGraphDistanceFromIch(personen, 'kind', 'eltern')).toBe(1)
    expect(getGraphDistanceFromIch(personen, 'eltern', 'kind')).toBe(1)
  })

  it('portraitSizeFromGraphDistance wächst mit Distanz', () => {
    expect(portraitSizeFromGraphDistance(0)).toBe(140)
    expect(portraitSizeFromGraphDistance(1)).toBeGreaterThan(140)
    expect(portraitSizeFromGraphDistance(10)).toBe(portraitSizeFromGraphDistance(100))
  })
})
