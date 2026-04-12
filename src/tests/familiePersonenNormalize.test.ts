import { describe, it, expect } from 'vitest'
import type { K2FamiliePerson } from '../types/k2Familie'
import { normalizeAndDedupePersonen } from '../utils/familiePersonenNormalize'

function minimal(id: string, name: string, parentIds: string[]): K2FamiliePerson {
  return {
    id,
    name,
    parentIds,
    childIds: [],
    siblingIds: [],
    partners: [],
    wahlfamilieIds: [],
  }
}

describe('familiePersonenNormalize', () => {
  it('trimmt IDs in parentIds und entfernt Duplikate in einer Liste', () => {
    const a = minimal('p1', 'A', [' x ', 'x', 'y'])
    const out = normalizeAndDedupePersonen([a])
    expect(out[0]!.parentIds).toEqual(['x', 'y'])
  })

  it('vereinigt zwei Karten mit derselben id (Union der Beziehungen)', () => {
    const erste = minimal('e', 'Elisabeth', ['m', 'f'])
    const zweite: K2FamiliePerson = {
      ...minimal('e', 'Elisabeth', []),
      childIds: ['joshua'],
    }
    const out = normalizeAndDedupePersonen([erste, zweite])
    expect(out).toHaveLength(1)
    expect(out[0]!.parentIds.sort()).toEqual(['f', 'm'])
    expect(out[0]!.childIds).toContain('joshua')
  })
})
