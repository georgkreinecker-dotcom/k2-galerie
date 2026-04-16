import { describe, it, expect } from 'vitest'
import { isGeschichteInArbeit } from '../utils/familieGeschichte'
import type { K2FamilieGeschichte } from '../types/k2Familie'

const base: K2FamilieGeschichte = {
  id: 'g1',
  abDatum: '2020-01-01',
  content: 'x',
}

describe('isGeschichteInArbeit', () => {
  it('true nur bei status entwurf', () => {
    expect(isGeschichteInArbeit({ ...base, status: 'entwurf' })).toBe(true)
    expect(isGeschichteInArbeit({ ...base, status: 'fertig' })).toBe(false)
    expect(isGeschichteInArbeit({ ...base })).toBe(false)
  })
})
