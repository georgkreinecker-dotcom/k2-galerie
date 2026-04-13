import { describe, expect, it } from 'vitest'
import type { K2FamiliePerson } from '../types/k2Familie'
import {
  assignMissingMitgliedsNummern,
  buildMitgliederCodesZweigGruppen,
  findPersonIdByMitgliedsNummer,
  maxAutoMitgliedsNummerSuffix,
  trimMitgliedsNummerEingabe,
} from '../utils/familieMitgliedsNummer'

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

  it('maxAutoMitgliedsNummerSuffix: nur KF-nnnn', () => {
    expect(maxAutoMitgliedsNummerSuffix([p('a', 'KF-0003'), p('b', 'x')])).toBe(3)
    expect(maxAutoMitgliedsNummerSuffix([p('a', 'kf-0010')])).toBe(10)
  })

  it('assignMissingMitgliedsNummern: vergibt KF-… in Stammbaum-Reihenfolge', () => {
    const personen = [
      { ...p('root'), name: 'Oma', parentIds: [], childIds: ['c'] },
      { ...p('c'), name: 'Kind', parentIds: ['root'], childIds: [] },
    ]
    const out = assignMissingMitgliedsNummern(personen, 'c')
    expect(out.find((x) => x.id === 'root')?.mitgliedsNummer).toMatch(/^KF-000[12]$/)
    expect(out.find((x) => x.id === 'c')?.mitgliedsNummer).toMatch(/^KF-000[12]$/)
    expect(new Set(out.map((x) => x.mitgliedsNummer)).size).toBe(2)
  })

  it('assignMissingMitgliedsNummern: überschreibt keine manuelle Nummer', () => {
    const personen = [p('a', 'MANUAL-1'), p('b')]
    const out = assignMissingMitgliedsNummern(personen, undefined)
    expect(out[0].mitgliedsNummer).toBe('MANUAL-1')
    expect(out[1].mitgliedsNummer).toMatch(/^KF-/)
  })

  it('assignMissingMitgliedsNummern: verstorbene ohne Nummer bleiben ohne KF-Nummer', () => {
    const personen = [{ ...p('tot'), verstorben: true }, p('leb')]
    const out = assignMissingMitgliedsNummern(personen, 'leb')
    expect(out.find((x) => x.id === 'tot')?.mitgliedsNummer).toBeUndefined()
    expect(out.find((x) => x.id === 'leb')?.mitgliedsNummer).toMatch(/^KF-/)
  })

  it('buildMitgliederCodesZweigGruppen: keine verstorbenen in den Zeilen', () => {
    const personen = [
      { ...p('a'), name: 'Lebt' },
      { ...p('b'), name: 'Tot', verstorben: true },
    ]
    const gruppen = buildMitgliederCodesZweigGruppen(personen, 'a')
    const ids = gruppen.flatMap((g) => g.rows.map((r) => r.id))
    expect(ids).toContain('a')
    expect(ids).not.toContain('b')
  })
})
