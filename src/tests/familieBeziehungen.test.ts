import { describe, it, expect } from 'vitest'
import type { K2FamiliePerson } from '../types/k2Familie'
import {
  getFamilienzweigPersonen,
  reconcileParentChildRelations,
  getGeschwisterAusGemeinsamenEltern,
  getGeschwisterAnzeigeListe,
} from '../utils/familieBeziehungen'

function p(
  id: string,
  name: string,
  parentIds: string[],
  opts?: Partial<Pick<K2FamiliePerson, 'childIds' | 'partners' | 'siblingIds'>>
): K2FamiliePerson {
  return {
    id,
    name,
    parentIds,
    childIds: opts?.childIds ?? [],
    partners: opts?.partners ?? [],
    siblingIds: opts?.siblingIds ?? [],
    wahlfamilieIds: [],
  }
}

describe('reconcileParentChildRelations', () => {
  it('ergänzt childIds auf Eltern wenn nur parentIds auf Kind stehen', () => {
    const eltern = p('e', 'E', [])
    const kind = p('k', 'K', ['e'], { childIds: [] })
    const out = reconcileParentChildRelations([eltern, kind])
    const e = out.find((x) => x.id === 'e')
    expect(e?.childIds).toContain('k')
    expect(kind.parentIds).toContain('e')
  })

  it('ergänzt parentIds auf Kind wenn nur childIds auf Eltern stehen', () => {
    const eltern = p('e', 'E', [], { childIds: ['k'] })
    const kind = p('k', 'K', [])
    const out = reconcileParentChildRelations([eltern, kind])
    const k = out.find((x) => x.id === 'k')
    expect(k?.parentIds).toContain('e')
  })

  it('ergänzt keinen dritten Elternteil, wenn die Kinderkarte schon zwei Eltern hat (Großeltern-Enkel-Falle)', () => {
    const georg = p('georg', 'Georg', [], { childIds: ['joshua'] })
    const joshua = p('joshua', 'Joshua', ['elisabeth', 'michael'])
    const out = reconcileParentChildRelations([georg, joshua])
    const j = out.find((x) => x.id === 'joshua')
    expect(j?.parentIds).toEqual(['elisabeth', 'michael'])
    expect(j?.parentIds?.includes('georg')).toBe(false)
  })
})

describe('getFamilienzweigPersonen', () => {
  it('Familie mit zwei Kindern: Geschwister gleichen Elternpaars liegen im selben Familienzweig (z. B. Lef)', () => {
    const m = p('m', 'Mutter Lef', ['gm', 'gv'])
    const v = p('v', 'Vater Lef', ['gm', 'gv'])
    const kind1 = p('k1', 'Kind 1 Lef', ['m', 'v'], { pos: 1 })
    const kind2 = p('k2', 'Kind 2 Lef', ['m', 'v'], { pos: 2 })
    const personen = [m, v, kind1, kind2]
    const z1 = getFamilienzweigPersonen(personen, 'k1')
    expect(z1.map((x) => x.id).sort()).toEqual(['k1', 'k2', 'm', 'v'].sort())
    const z2 = getFamilienzweigPersonen(personen, 'k2')
    expect(z2.map((x) => x.id).sort()).toEqual(['k1', 'k2', 'm', 'v'].sort())
  })

  it('nimmt Kinder auf, die die Wurzel nur in parentIds haben (ohne childIds auf Eltern)', () => {
    const e = p('elisabeth', 'Elisabeth', [])
    const m = p('michael', 'Michael', [])
    const j = p('joshua', 'Joshua', ['elisabeth', 'michael'])
    const personen = [e, m, j]
    const zweig = getFamilienzweigPersonen(personen, 'elisabeth')
    expect(zweig.map((x) => x.id).sort()).toEqual(['elisabeth', 'joshua', 'michael'].sort())
  })

  it('includeParentsOfCore: false – keine Eltern im Satz (Stammbaum „nur mein Familienzweig“)', () => {
    const m = p('m', 'Mutter Lef', ['gm', 'gv'])
    const v = p('v', 'Vater Lef', ['gm', 'gv'])
    const kind1 = p('k1', 'Kind 1 Lef', ['m', 'v'], { pos: 1 })
    const personen = [m, v, kind1]
    const ohneEltern = getFamilienzweigPersonen(personen, 'k1', {
      includeSiblingCircle: false,
      includeParentsOfCore: false,
    })
    expect(ohneEltern.map((x) => x.id).sort()).toEqual(['k1'])
  })

  it('includeSiblingCircle: false – nur eigener Ast, keine Geschwister (Großfamilie je Geschwister)', () => {
    const m = p('m', 'Mutter Lef', ['gm', 'gv'])
    const v = p('v', 'Vater Lef', ['gm', 'gv'])
    const kind1 = p('k1', 'Kind 1 Lef', ['m', 'v'], { pos: 1 })
    const kind2 = p('k2', 'Kind 2 Lef', ['m', 'v'], { pos: 2 })
    const personen = [m, v, kind1, kind2]
    const eng = getFamilienzweigPersonen(personen, 'k1', { includeSiblingCircle: false })
    expect(eng.map((x) => x.id).sort()).toEqual(['k1', 'm', 'v'].sort())
    expect(eng.some((x) => x.id === 'k2')).toBe(false)
  })

  it('Enkel fälschlich in childIds der Großeltern: nicht im Familienzweig der Großeltern (Kinderkarte hat anderes Elternpaar)', () => {
    const georg = p('georg', 'Georg', [], { childIds: ['joshua', 'olivia'] })
    const elisabeth = p('elisabeth', 'Elisabeth', [])
    const michael = p('michael', 'Michael', [])
    const joshua = p('joshua', 'Joshua', ['elisabeth', 'michael'])
    const olivia = p('olivia', 'Olivia', ['elisabeth', 'michael'])
    const personen = reconcileParentChildRelations([georg, elisabeth, michael, joshua, olivia])
    const zweigGeorg = getFamilienzweigPersonen(personen, 'georg')
    expect(zweigGeorg.some((x) => x.id === 'joshua')).toBe(false)
    expect(zweigGeorg.some((x) => x.id === 'olivia')).toBe(false)
    const zweigEli = getFamilienzweigPersonen(personen, 'elisabeth')
    expect(zweigEli.map((x) => x.id).sort()).toEqual(['elisabeth', 'joshua', 'michael', 'olivia'].sort())
  })
})

describe('getGeschwisterAusGemeinsamenEltern', () => {
  it('drei Kinder gleicher Eltern – jeder sieht die anderen zwei', () => {
    const m = p('m', 'Mutter', [])
    const v = p('v', 'Vater', [])
    const k1 = p('k1', 'Kind 1', ['m', 'v'])
    const k2 = p('k2', 'Kind 2', ['m', 'v'])
    const k3 = p('k3', 'Kind 3', ['m', 'v'])
    const personen = [m, v, k1, k2, k3]
    expect(getGeschwisterAusGemeinsamenEltern(personen, 'k1').map((x) => x.id).sort()).toEqual(['k2', 'k3'])
    expect(getGeschwisterAusGemeinsamenEltern(personen, 'k2').map((x) => x.id).sort()).toEqual(['k1', 'k3'])
  })

  it('Halbgeschwister: ein gemeinsamer Elternteil', () => {
    const p1 = p('p1', 'M1', [])
    const p2 = p('p2', 'V1', [])
    const p3 = p('p3', 'V2', [])
    const a = p('a', 'A', ['p1', 'p2'])
    const b = p('b', 'B', ['p1', 'p3'])
    const personen = [p1, p2, p3, a, b]
    expect(getGeschwisterAusGemeinsamenEltern(personen, 'a').map((x) => x.id)).toEqual(['b'])
  })

  it('ohne gemeinsame Eltern – leer', () => {
    const a = p('a', 'A', ['e1'])
    const b = p('b', 'B', ['e2'])
    expect(getGeschwisterAusGemeinsamenEltern([a, b], 'a')).toEqual([])
  })
})

describe('getGeschwisterAnzeigeListe', () => {
  it('Union mit Legacy siblingIds', () => {
    const e = p('e', 'E', [])
    const k1 = p('k1', 'K1', ['e'], { siblingIds: ['x'] })
    const k2 = p('k2', 'K2', ['e'])
    const x = p('x', 'X', [])
    const personen = [e, k1, k2, x]
    expect(getGeschwisterAnzeigeListe(personen, 'k1').map((p) => p.id).sort()).toEqual(['k2', 'x'].sort())
  })
})
