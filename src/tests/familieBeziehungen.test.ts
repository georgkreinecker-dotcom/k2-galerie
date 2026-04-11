import { describe, it, expect } from 'vitest'
import type { K2FamiliePerson } from '../types/k2Familie'
import {
  getFamilienzweigPersonen,
  reconcileParentChildRelations,
} from '../utils/familieBeziehungen'

function p(
  id: string,
  name: string,
  parentIds: string[],
  opts?: Partial<Pick<K2FamiliePerson, 'childIds' | 'partners'>>
): K2FamiliePerson {
  return {
    id,
    name,
    parentIds,
    childIds: opts?.childIds ?? [],
    partners: opts?.partners ?? [],
    siblingIds: [],
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
