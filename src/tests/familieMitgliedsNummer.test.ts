import { describe, expect, it } from 'vitest'
import type { K2FamiliePerson } from '../types/k2Familie'
import { findPersonIdByMitgliedsNummer, trimMitgliedsNummerEingabe } from '../utils/familieMitgliedsNummer'

function p(id: string, mitgliedsNummer?: string): K2FamiliePerson {
  return {
    id,
    name: id,
    parentIds: [],
    childIds: [],
    partners: [],
    siblingIds: [],
    wahlfamilieIds: [],
    mitgliedsNummer,
  }
}

describe('familieMitgliedsNummer', () => {
  it('trimMitgliedsNummerEingabe', () => {
    expect(trimMitgliedsNummerEingabe('  ab12  ')).toBe('ab12')
    expect(trimMitgliedsNummerEingabe('')).toBe('')
  })

  it('findPersonIdByMitgliedsNummer: Treffer, case-insensitive', () => {
    const personen = [p('a', 'KF-M-1001'), p('b', 'x')]
    expect(findPersonIdByMitgliedsNummer(personen, 'kf-m-1001')).toBe('a')
  })

  it('findPersonIdByMitgliedsNummer: leer oder kein Treffer', () => {
    const personen = [p('a', '1')]
    expect(findPersonIdByMitgliedsNummer(personen, '')).toBe(null)
    expect(findPersonIdByMitgliedsNummer(personen, '2')).toBe(null)
  })
})
