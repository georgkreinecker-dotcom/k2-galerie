import { describe, it, expect } from 'vitest'
import type { K2FamiliePerson } from '../types/k2Familie'
import { getFamilienzweigPersonen } from '../utils/familieBeziehungen'
import {
  getFamilieBranchKeyLegacy,
  buildStammbaumKartenState,
  sortPersonenStammbaumKarten,
  buildGrossfamilieStammbaumSektionen,
  buildStammbaumPartnerUnterSektionen,
} from '../utils/familieStammbaumKarten'

function p(
  id: string,
  name: string,
  parentIds: string[],
  opts?: {
    pos?: number
    partners?: { personId: string; from: string | null; to: string | null }[]
    childIds?: string[]
  }
): K2FamiliePerson {
  return {
    id,
    name,
    parentIds,
    childIds: opts?.childIds ?? [],
    siblingIds: [],
    partners: opts?.partners ?? [],
    wahlfamilieIds: [],
    positionAmongSiblings: opts?.pos,
  }
}

describe('familieStammbaumKarten', () => {
  it('Legacy: gleiche parentIds → gleicher Branch-Key', () => {
    const a = p('a', 'A', ['m', 'f'], { pos: 1 })
    const b = p('b', 'B', ['f', 'm'], { pos: 2 })
    expect(getFamilieBranchKeyLegacy(a)).toBe(getFamilieBranchKeyLegacy(b))
  })

  it('ohne ichBin: Sort wie früher (lexikografisch nach Eltern-Key)', () => {
    const liste = [
      p('c3', 'Drittes Kind', ['p1', 'p2'], { pos: 3 }),
      p('c1', 'Erstes Kind', ['p1', 'p2'], { pos: 1 }),
      p('solo', 'Solo', [], { pos: 1 }),
      p('c2', 'Zweites Kind', ['p1', 'p2'], { pos: 2 }),
    ]
    const s = sortPersonenStammbaumKarten(liste).map((x) => x.id)
    expect(s).toEqual(['c1', 'c2', 'c3', 'solo'])
  })

  it('mit ichBin: Geschwisterfamilien nach positionAmongSiblings; Ast 1 zuerst', () => {
    const mutter = p('mutter', 'Mutter', ['gm', 'gv'])
    const vater = p('vater', 'Vater', ['gm', 'gv'])
    const elternKey = ['mutter', 'vater'].sort().join('|')
    const rupert = p('rupert', 'Rupert', ['mutter', 'vater'], {
      pos: 1,
      partners: [{ personId: 'rfrau', from: null, to: null }],
    })
    const martina = p('martina', 'Martina', ['mutter', 'vater'], { pos: 2 })
    const georg = p('georg', 'Georg', ['mutter', 'vater'], { pos: 3 })
    const rupertFrau = p('rfrau', 'Rupert Partnerin', [], {
      pos: 1,
      partners: [{ personId: 'rupert', from: null, to: null }],
    })
    const rupertKind = p('rkind', 'Kind R', ['rupert', 'rfrau'], { pos: 1 })
    const martinaKind = p('mkind', 'Kind M', ['martina', 'x'], { pos: 1 })
    const personen = [mutter, vater, rupert, martina, georg, rupertFrau, rupertKind, martinaKind]
    expect(elternKey).toBe([...georg.parentIds].sort().join('|'))

    const { sortedPersonen, getBranchKey } = buildStammbaumKartenState(personen, 'georg')
    const ids = sortedPersonen.map((x) => x.id)
    expect(ids.indexOf('rupert')).toBeLessThan(ids.indexOf('martina'))
    expect(ids.indexOf('martina')).toBeLessThan(ids.indexOf('georg'))
    expect(getBranchKey(rupert)).toBe(getBranchKey(rupertKind))
    expect(getBranchKey(rupert)).toBe(getBranchKey(rupertFrau))
    expect(getBranchKey(martina)).toBe(getBranchKey(martinaKind))
    expect(getBranchKey(rupert)).not.toBe(getBranchKey(martina))
  })

  it('Partner-Propagation: Partner ohne gemeinsame Eltern am gleichen Ast', () => {
    const a = p('a', 'A', ['p1', 'p2'], { pos: 1 })
    const b = p('b', 'B', [], { partners: [{ personId: 'a', from: null, to: null }] })
    const pList = [a, b]
    const { getBranchKey } = buildStammbaumKartenState(pList, 'a')
    expect(getBranchKey(b)).toBe(getBranchKey(a))
  })

  it('Großfamilie-Sektionen: Eltern zuerst, dann Familienzweige nach Geschwisterstellung', () => {
    const mutter = p('mutter', 'Mutter', ['gm', 'gv'])
    const vater = p('vater', 'Vater', ['gm', 'gv'])
    const rupert = p('rupert', 'Rupert', ['mutter', 'vater'], {
      pos: 1,
      partners: [{ personId: 'rfrau', from: null, to: null }],
    })
    const martina = p('martina', 'Martina', ['mutter', 'vater'], { pos: 2 })
    const georg = p('georg', 'Georg', ['mutter', 'vater'], { pos: 3 })
    const rfrau = p('rfrau', 'R Frau', [], { partners: [{ personId: 'rupert', from: null, to: null }] })
    const gross = p('gross', 'Großmutter', [])
    const personen = [mutter, vater, rupert, martina, georg, rfrau, gross]

    const sek = buildGrossfamilieStammbaumSektionen(personen, 'georg')
    expect(sek).not.toBeNull()
    const keys = sek!.map((s) => s.key)
    expect(keys[0]).toBe('eltern')
    expect(keys[1]).toContain('rupert')
    expect(keys[2]).toContain('martina')
    expect(keys[3]).toContain('georg')
    expect(keys[keys.length - 1]).toBe('weitere')
    expect(sek!.find((s) => s.key === 'weitere')?.personen.map((x) => x.id)).toContain('gross')
  })

  it('Halbgeschwister: gleicher Vater, zwei Mütter – Eltern zeigen Partner; alle Familienzweige', () => {
    const sen = p('sen', 'Georg Sen.', ['gv', 'gm'], {
      partners: [
        { personId: 'anna', from: null, to: null },
        { personId: 'mathilde', from: null, to: null },
      ],
    })
    const anna = p('anna', 'Anna Stöbich', [])
    const mathilde = p('mathilde', 'Mathilde Kreinecker', [])
    const rupert = p('rupert', 'Rupert', ['sen', 'anna'], { pos: 1 })
    const georg = p('georg', 'Georg', ['sen', 'mathilde'], { pos: 5 })
    const gv = p('gv', 'Großvater', [])
    const gm = p('gm', 'Großmutter', [])
    const personen: K2FamiliePerson[] = [sen, anna, mathilde, rupert, georg, gv, gm]

    const sek = buildGrossfamilieStammbaumSektionen(personen, 'georg')
    expect(sek).not.toBeNull()
    const eltern = sek!.find((s) => s.key === 'eltern')?.personen.map((x) => x.id) ?? []
    expect(eltern).toContain('anna')
    expect(eltern).toContain('mathilde')
    expect(eltern).toContain('sen')

    const kleinKeys = sek!.filter((s) => s.key.startsWith('kleinfamilie-')).map((s) => s.key)
    expect(kleinKeys.some((k) => k.includes('rupert'))).toBe(true)
    expect(kleinKeys.some((k) => k.includes('georg'))).toBe(true)

    const { getBranchKey } = buildStammbaumKartenState(personen, 'georg')
    expect(getBranchKey(rupert)).toMatch(/^geschwister-ast:/)
    expect(getBranchKey(georg)).toMatch(/^geschwister-ast:/)
  })

  it('Partner-Unter-Zweige: Kern (Wurzel & Partner) + pro Kind ein Block mit Partnern', () => {
    const m = p('m', 'Mutter', ['gm', 'gv'])
    const f = p('f', 'Vater', ['gm', 'gv'])
    const georg = p('georg', 'Georg', ['m', 'f'], {
      pos: 7,
      partners: [{ personId: 'martina', from: null, to: null }],
      childIds: ['eva', 'lukas'],
    })
    const martina = p('martina', 'Martina', [], { partners: [{ personId: 'georg', from: null, to: null }] })
    const eva = p('eva', 'Eva', ['georg', 'martina'], {
      pos: 1,
      partners: [{ personId: 'michael', from: null, to: null }],
    })
    const michael = p('michael', 'Michael', [], { partners: [{ personId: 'eva', from: null, to: null }] })
    const lukas = p('lukas', 'Lukas', ['georg', 'martina'], {
      pos: 2,
      partners: [{ personId: 'nora', from: null, to: null }],
    })
    const nora = p('nora', 'Nora', [], { partners: [{ personId: 'lukas', from: null, to: null }] })
    const personen = [m, f, georg, martina, eva, michael, lukas, nora]

    const roh = getFamilienzweigPersonen(personen, 'georg')
    const klein = buildStammbaumKartenState(roh, 'georg').sortedPersonen
    const unter = buildStammbaumPartnerUnterSektionen(personen, 'georg', klein)

    const kern = unter.find((u) => u.key.startsWith('kern-'))
    expect(kern?.personen.map((x) => x.id).sort()).toEqual(['georg', 'martina'].sort())

    const evaZweig = unter.find((u) => u.key === 'kind-eva')
    expect(evaZweig?.personen.map((x) => x.id).sort()).toEqual(['eva', 'michael'].sort())

    const lukasZweig = unter.find((u) => u.key === 'kind-lukas')
    expect(lukasZweig?.personen.map((x) => x.id).sort()).toEqual(['lukas', 'nora'].sort())
  })
})
