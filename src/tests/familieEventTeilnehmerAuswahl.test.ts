import { describe, it, expect } from 'vitest'
import {
  expandFamilienSeiteVonElternteil,
  filterPersonenFuerFamilienEventTeilnehmer,
  sortPersonenFuerFamilienEventTeilnehmer,
} from '../utils/familieEventTeilnehmerAuswahl'
import type { K2FamiliePerson } from '../types/k2Familie'

function p(id: string, partial: Partial<K2FamiliePerson> & Pick<K2FamiliePerson, 'name'>): K2FamiliePerson {
  return {
    id,
    name: partial.name,
    parentIds: partial.parentIds ?? [],
    childIds: partial.childIds ?? [],
    partners: partial.partners ?? [],
    siblingIds: partial.siblingIds ?? [],
    wahlfamilieIds: [],
  }
}

describe('familieEventTeilnehmerAuswahl', () => {
  it('expandFamilienSeiteVonElternteil: von Mutter aus ohne Sprung Du→Vater', () => {
    const mutter = p('m', { name: 'Mutter', childIds: ['du'] })
    const vater = p('v', { name: 'Vater', childIds: ['du'] })
    const du = p('du', { name: 'Du', parentIds: ['m', 'v'], childIds: ['kind'] })
    const kind = p('kind', { name: 'Kind', parentIds: ['du'] })
    const personen = [mutter, vater, du, kind]
    const set = expandFamilienSeiteVonElternteil(personen, 'm', 'v', 'du')
    expect(set.has('m')).toBe(true)
    expect(set.has('du')).toBe(true)
    expect(set.has('kind')).toBe(true)
    expect(set.has('v')).toBe(false)
  })

  it('filterPersonenFuerFamilienEventTeilnehmer: väterlich nur mit zwei Eltern', () => {
    const personen = [
      p('m', { name: 'M' }),
      p('du', { name: 'Du', parentIds: ['m'] }),
    ]
    expect(filterPersonenFuerFamilienEventTeilnehmer(personen, 'du', 'vaterlich').length).toBe(2)
  })

  it('sortPersonenFuerFamilienEventTeilnehmer: nach Namen', () => {
    const personen = [p('b', { name: 'Berta' }), p('a', { name: 'Anna' })]
    const s = sortPersonenFuerFamilienEventTeilnehmer(personen, undefined, 'name')
    expect(s.map((x) => x.id)).toEqual(['a', 'b'])
  })

  it('sortPersonenFuerFamilienEventTeilnehmer: Verwandtschaft – näher zu Du zuerst', () => {
    const personen = [
      p('du', { name: 'Du', childIds: ['nah'] }),
      p('nah', { name: 'Nah', parentIds: ['du'], childIds: ['fern'] }),
      p('fern', { name: 'Fern', parentIds: ['nah'] }),
    ]
    const s = sortPersonenFuerFamilienEventTeilnehmer(personen, 'du', 'verwandtschaft')
    expect(s[0]!.id).toBe('du')
    expect(s[1]!.id).toBe('nah')
    expect(s[2]!.id).toBe('fern')
  })
})
