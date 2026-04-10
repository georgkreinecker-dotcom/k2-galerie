import { describe, it, expect } from 'vitest'
import type { K2FamiliePerson } from '../types/k2Familie'
import { ensureErsteEheVierGeschwister } from '../utils/familieErsteEheGeschwister'

function minimal(
  id: string,
  name: string,
  parentIds: string[],
  opts?: Partial<K2FamiliePerson>
): K2FamiliePerson {
  return {
    id,
    name,
    parentIds,
    childIds: opts?.childIds ?? [],
    partners: opts?.partners ?? [],
    siblingIds: opts?.siblingIds ?? [],
    wahlfamilieIds: [],
    positionAmongSiblings: opts?.positionAmongSiblings,
    createdAt: 't',
    updatedAt: 't',
  }
}

describe('ensureErsteEheVierGeschwister', () => {
  it('legt vier Geschwister mit denselben Eltern an und setzt Georg auf Position 5', () => {
    const vater = minimal('v', 'Vater', [])
    const anna = minimal('a', 'Anna Stöbich', [])
    const georg = minimal('g', 'Georg Kreinecker', ['v', 'a'], { positionAmongSiblings: 3 })
    const personen = [vater, anna, georg]

    const r = ensureErsteEheVierGeschwister(personen, 'g')
    expect(r.angelegt).toBe(4)
    expect(r.personen.length).toBe(7)

    const elternKey = ['a', 'v'].join('|')
    const kinder = r.personen.filter(
      (p) => p.parentIds.length >= 2 && [...p.parentIds].sort().join('|') === elternKey
    )
    expect(kinder.length).toBe(5)

    const g = r.personen.find((p) => p.id === 'g')
    expect(g?.positionAmongSiblings).toBe(5)

    const v = r.personen.find((p) => p.id === 'v')
    expect(v?.childIds?.length).toBe(5)
  })

  it('ändert nichts, wenn alle vier schon existieren', () => {
    const vater = minimal('v', 'Vater', [])
    const anna = minimal('a', 'Anna Stöbich', [])
    const rupert = minimal('r', 'Rupert', ['v', 'a'], { positionAmongSiblings: 1 })
    const notburga = minimal('n', 'Notburga', ['v', 'a'], { positionAmongSiblings: 2 })
    const annaS = minimal('as', 'Anna', ['v', 'a'], { positionAmongSiblings: 3 })
    const maria = minimal('m', 'Maria', ['v', 'a'], { positionAmongSiblings: 4 })
    const georg = minimal('g', 'Georg', ['v', 'a'], { positionAmongSiblings: 5 })
    const personen = [vater, anna, rupert, notburga, annaS, maria, georg]

    const r = ensureErsteEheVierGeschwister(personen, 'g')
    expect(r.angelegt).toBe(0)
    expect(r.personen.length).toBe(personen.length)
  })
})
