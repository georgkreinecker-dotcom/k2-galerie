import { describe, it, expect } from 'vitest'
import { familyClusterKeyChildForBottomRow } from '../components/FamilyTreeGraph'
import type { K2FamiliePerson } from '../types/k2Familie'

function p(
  id: string,
  name: string,
  opts: Partial<K2FamiliePerson> & Pick<K2FamiliePerson, 'parentIds'>
): K2FamiliePerson {
  return {
    id,
    name,
    parentIds: opts.parentIds,
    childIds: opts.childIds ?? [],
    partners: opts.partners ?? [],
    siblingIds: opts.siblingIds ?? [],
    wahlfamilieIds: opts.wahlfamilieIds ?? [],
  }
}

describe('familyClusterKeyChildForBottomRow', () => {
  it('vereinheitlicht Kind mit nur einem Elternteil mit Geschwister mit beiden IDs', () => {
    const E = 'e'
    const M = 'm'
    const eltern: K2FamiliePerson[] = [
      p(E, 'E', { parentIds: [], childIds: [] }),
      p(M, 'M', { parentIds: [], childIds: [], partners: [{ personId: E, from: null, to: null }] }),
    ]
    eltern[0].partners = [{ personId: M, from: null, to: null }] // E partner M

    const kinder: K2FamiliePerson[] = [
      p('olivia', 'Olivia', { parentIds: [E, M] }),
      p('joshua', 'Joshua', { parentIds: [E] }),
    ]
    const personen = [...eltern, ...kinder]
    const byId = new Map(personen.map((x) => [x.id, x]))
    const levelMap = new Map<string, number>([
      [E, 2],
      [M, 2],
      ['olivia', 3],
      ['joshua', 3],
    ])
    const maxLevel = 3
    const bottomIds = ['olivia', 'joshua']

    const kO = familyClusterKeyChildForBottomRow(kinder[0], byId, levelMap, maxLevel, bottomIds)
    const kJ = familyClusterKeyChildForBottomRow(kinder[1], byId, levelMap, maxLevel, bottomIds)
    expect(kO).toBe([E, M].sort().join('|'))
    expect(kJ).toBe([E, M].sort().join('|'))
    expect(kO).toBe(kJ)
  })

  it('vereinheitlicht ein Kind nur Vater und ein Kind nur Mutter wenn Partner in Karten', () => {
    const E = 'e'
    const M = 'm'
    const eltern: K2FamiliePerson[] = [
      p(E, 'E', { parentIds: [], childIds: [] }),
      p(M, 'M', { parentIds: [], childIds: [], partners: [{ personId: E, from: null, to: null }] }),
    ]
    eltern[0].partners = [{ personId: M, from: null, to: null }]

    const kinder: K2FamiliePerson[] = [
      p('a', 'A', { parentIds: [E] }),
      p('b', 'B', { parentIds: [M] }),
    ]
    const personen = [...eltern, ...kinder]
    const byId = new Map(personen.map((x) => [x.id, x]))
    const levelMap = new Map<string, number>([
      [E, 1],
      [M, 1],
      ['a', 2],
      ['b', 2],
    ])
    const maxLevel = 2
    const bottomIds = ['a', 'b']

    const kA = familyClusterKeyChildForBottomRow(kinder[0], byId, levelMap, maxLevel, bottomIds)
    const kB = familyClusterKeyChildForBottomRow(kinder[1], byId, levelMap, maxLevel, bottomIds)
    expect(kA).toBe([E, M].sort().join('|'))
    expect(kB).toBe([E, M].sort().join('|'))
  })
})
