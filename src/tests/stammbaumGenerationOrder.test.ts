import { describe, it, expect } from 'vitest'
import {
  orderInGeneration,
  getChildIds,
  getGenerations,
  getGenerationsFamilienzweigAbwaertsWurzel,
} from '../components/FamilyTreeGraph'
import type { K2FamiliePerson } from '../types/k2Familie'

function emptyRel(): Pick<K2FamiliePerson, 'parentIds' | 'childIds' | 'partners' | 'siblingIds' | 'wahlfamilieIds'> {
  return { parentIds: [], childIds: [], partners: [], siblingIds: [], wahlfamilieIds: [] }
}

describe('Stammbaum Generation – Reihenfolge Geschwisterlinie & Geburtsdatum', () => {
  it('bei gleicher Geschwisterposition: nach Geburtsdatum (älter zuerst)', () => {
    const personen: K2FamiliePerson[] = [
      {
        id: 'zoe',
        name: 'Zoe',
        ...emptyRel(),
        parentIds: ['p'],
        childIds: [],
        positionAmongSiblings: 2,
        geburtsdatum: '2010-01-01',
      },
      {
        id: 'amy',
        name: 'Amy',
        ...emptyRel(),
        parentIds: ['p'],
        childIds: [],
        positionAmongSiblings: 2,
        geburtsdatum: '2008-06-01',
      },
      { id: 'p', name: 'Parent', ...emptyRel(), childIds: ['zoe', 'amy'] },
    ]
    const levelMap = getGenerations(personen)
    const childIds = getChildIds(personen)
    const ids = personen.filter((x) => levelMap.get(x.id) === 1).map((x) => x.id)
    const ordered = orderInGeneration(personen, ids, levelMap, childIds, undefined, undefined)
    expect(ordered).toEqual(['amy', 'zoe'])
  })

  it('bei unterschiedlicher Geschwisterposition: Position vor Geburtsdatum', () => {
    const personen: K2FamiliePerson[] = [
      {
        id: 'j',
        name: 'Jung',
        ...emptyRel(),
        parentIds: ['p'],
        childIds: [],
        positionAmongSiblings: 1,
        geburtsdatum: '2015-01-01',
      },
      {
        id: 'a',
        name: 'Alt',
        ...emptyRel(),
        parentIds: ['p'],
        childIds: [],
        positionAmongSiblings: 2,
        geburtsdatum: '1990-01-01',
      },
      { id: 'p', name: 'Parent', ...emptyRel(), childIds: ['j', 'a'] },
    ]
    const levelMap = getGenerations(personen)
    const childIds = getChildIds(personen)
    const ids = personen.filter((x) => levelMap.get(x.id) === 1).map((x) => x.id)
    const ordered = orderInGeneration(personen, ids, levelMap, childIds, undefined, undefined)
    expect(ordered).toEqual(['j', 'a'])
  })
})

describe('Familienzweig Wurzel (ohne Eltern in der Liste)', () => {
  it('Du und Partner Ebene 0, gemeinsames Kind Ebene 1', () => {
    const personen: K2FamiliePerson[] = [
      {
        id: 'g',
        name: 'Georg',
        ...emptyRel(),
        parentIds: ['gp1', 'gp2'],
        partners: [{ personId: 'martina' }],
        childIds: ['kind'],
      },
      {
        id: 'martina',
        name: 'Martina',
        ...emptyRel(),
        parentIds: [],
        partners: [{ personId: 'g' }],
        childIds: ['kind'],
      },
      {
        id: 'kind',
        name: 'Kind',
        ...emptyRel(),
        parentIds: ['g', 'martina'],
        childIds: [],
      },
    ]
    const lm = getGenerationsFamilienzweigAbwaertsWurzel(personen, 'g')
    expect(lm.get('g')).toBe(0)
    expect(lm.get('martina')).toBe(0)
    expect(lm.get('kind')).toBe(1)
  })
})
