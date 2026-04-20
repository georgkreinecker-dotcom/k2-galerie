import { describe, it, expect } from 'vitest'
import {
  getVerwandtschaftEventKategorie,
  getCousinenCousinsListe,
  groupPersonenNachVerwandtschaftFuerEvent,
} from '../utils/familieEventVerwandtschaftKategorie'
import type { K2FamiliePerson } from '../types/k2Familie'

function person(
  id: string,
  partial: Partial<K2FamiliePerson> & Pick<K2FamiliePerson, 'name'>
): K2FamiliePerson {
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

describe('familieEventVerwandtschaftKategorie', () => {
  it('ordnet Geschwister, Onkel und Cousin korrekt zu', () => {
    const personen = [
      person('opa', { name: 'Opa', childIds: ['v', 'onkel'] }),
      person('du', { name: 'Du', parentIds: ['v', 'm'], childIds: ['kind'] }),
      person('v', { name: 'Vater', parentIds: ['opa'], childIds: ['du', 'geschwister'] }),
      person('m', { name: 'Mutter', childIds: ['du'] }),
      person('onkel', { name: 'Onkel', parentIds: ['opa'], childIds: ['cousin'] }),
      person('cousin', { name: 'Cousin', parentIds: ['onkel'] }),
      person('geschwister', { name: 'Schwester', parentIds: ['v', 'm'] }),
      person('kind', { name: 'Kind', parentIds: ['du'] }),
    ]
    expect(getVerwandtschaftEventKategorie(personen, 'du', 'du')).toBe('self')
    expect(getVerwandtschaftEventKategorie(personen, 'du', 'geschwister')).toBe('geschwister')
    expect(getVerwandtschaftEventKategorie(personen, 'du', 'onkel')).toBe('onkel_tante')
    expect(getVerwandtschaftEventKategorie(personen, 'du', 'cousin')).toBe('cousin')
    expect(getVerwandtschaftEventKategorie(personen, 'du', 'kind')).toBe('kinder')
    expect(getVerwandtschaftEventKategorie(personen, 'du', 'v')).toBe('eltern')
    expect(getCousinenCousinsListe(personen, 'du').map((x) => x.id)).toEqual(['cousin'])
  })

  it('groupPersonenNachVerwandtschaftFuerEvent: Geschwister-Gruppe vor Onkel/Tanten', () => {
    const personen = [
      person('opa', { name: 'Opa', childIds: ['mum', 'uncle'] }),
      person('mum', { name: 'Mutter', parentIds: ['opa'], childIds: ['du', 'sis'] }),
      person('uncle', { name: 'Onkel', parentIds: ['opa'] }),
      person('sis', { name: 'Schwester', parentIds: ['mum'] }),
      person('du', { name: 'Du', parentIds: ['mum'] }),
    ]
    const gruppen = groupPersonenNachVerwandtschaftFuerEvent(personen, 'du')
    const titel = gruppen.map((g) => g.titel)
    expect(titel.indexOf('Geschwister')).toBeLessThan(titel.indexOf('Onkel/Tanten'))
  })
})
