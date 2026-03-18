/**
 * K2 Familie – Grundstruktur: aus Wizard-Daten Platzhalter-Personen und Beziehungen erzeugen.
 * Siehe docs/K2-FAMILIE-GRUNDSTRUKTUR-VORSCHLAG.md
 */

import type { K2FamiliePerson } from '../types/k2Familie'

const now = (): string => new Date().toISOString()

function genId(prefix: string, i?: number): string {
  const base = 'gs-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6)
  return i !== undefined ? `${base}-${i}` : base
}

function person(
  id: string,
  name: string,
  parentIds: string[],
  childIds: string[],
  partners: { personId: string; from: string | null; to: string | null }[],
  siblingIds: string[]
): K2FamiliePerson {
  return {
    id,
    name,
    parentIds,
    childIds,
    partners,
    siblingIds,
    wahlfamilieIds: [],
    createdAt: now(),
    updatedAt: now(),
  }
}

export interface GrundstrukturInput {
  numKinder: number
  numGeschwister: number
  welcherBistDu: number
  numMuetter: number
  /** Wie viele der Geschwister sind von der ersten Mutter (z. B. Anna)? Rest von zweiter Mutter. */
  numGeschwisterVonErsterMutter: number
}

/**
 * Erzeugt die vollständige Personenliste inkl. Du, Partner, Kinder, Geschwister, Vater, Mütter.
 * Du = einer der Geschwister an Position welcherBistDu (1-basiert). Reihenfolge 1…N mit Du in der Mitte.
 * Erste numGeschwisterVonErsterMutter von Mutter1 (z. B. Anna), Rest von Mutter2.
 */
export function buildGrundstrukturPersonen(input: GrundstrukturInput): { personen: K2FamiliePerson[]; ichBinPersonId: string; ichBinPositionAmongSiblings: number } {
  const { numKinder, numGeschwister, welcherBistDu, numMuetter, numGeschwisterVonErsterMutter } = input
  const ids = {
    du: genId('du'),
    partner: genId('partner'),
    kinder: Array.from({ length: numKinder }, (_, i) => genId('kind', i)),
    vater: genId('vater'),
    muetter: Array.from({ length: Math.max(1, numMuetter) }, (_, i) => genId('mutter', i)),
  }
  // Geschwister in Reihenfolge 1..N: an Position welcherBistDu steht Du, sonst "Geschwister 1" … "Geschwister N"
  const geschwisterIds: string[] = []
  for (let pos = 1; pos <= numGeschwister; pos++) {
    if (pos === welcherBistDu) geschwisterIds.push(ids.du)
    else geschwisterIds.push(genId('geschw', pos))
  }

  const personen: K2FamiliePerson[] = []
  const allSiblingIds = geschwisterIds.slice()

  // Partner/in
  personen.push(
    person(ids.partner, 'Partner/in', [], ids.kinder, [{ personId: ids.du, from: null, to: null }], [])
  )

  // Kinder (parentIds = Du, Partner)
  ids.kinder.forEach((id, i) => {
    personen.push(
      person(id, `Kind ${i + 1}`, [ids.du, ids.partner], [], [], ids.kinder.filter((k) => k !== id))
    )
  })

  // Geschwister in Reihenfolge 1..N: erste numGeschwisterVonErsterMutter von Mutter1, Rest von Mutter2; Position für Sortierung speichern
  const nFirst = Math.min(numGeschwisterVonErsterMutter, numGeschwister)
  geschwisterIds.forEach((id, index) => {
    const position = index + 1
    const name = id === ids.du ? 'Du' : `Geschwister ${position}`
    const vonErsterMutter = position <= nFirst
    const parentIds = vonErsterMutter ? [ids.vater, ids.muetter[0]] : [ids.vater, ids.muetter[1] ?? ids.muetter[0]]
    const childIds = id === ids.du ? ids.kinder : []
    const partners = id === ids.du ? [{ personId: ids.partner, from: null as string | null, to: null as string | null }] : []
    const p = person(id, name, parentIds, childIds, partners, allSiblingIds.filter((x) => x !== id))
    personen.push({ ...p, positionAmongSiblings: position })
  })

  // Vater: Partner beider Mütter, alle N Kinder
  const vaterPartners = ids.muetter.map((mId) => ({ personId: mId, from: null as string | null, to: null as string | null }))
  personen.push(
    person(ids.vater, 'Vater', [], allSiblingIds, vaterPartners, [])
  )

  // Mütter: erste hat erste N Kinder, zweite hat Rest
  const ersteKinder = allSiblingIds.slice(0, nFirst)
  const restKinder = allSiblingIds.slice(nFirst)
  ids.muetter.forEach((mId, i) => {
    const childIds = i === 0 ? ersteKinder : (i === 1 ? restKinder : [])
    const partners = [{ personId: ids.vater, from: null as string | null, to: null as string | null }]
    personen.push(person(mId, i === 0 ? 'Mutter' : `Mutter ${i + 1}`, [], childIds, partners, []))
  })

  return { personen, ichBinPersonId: ids.du, ichBinPositionAmongSiblings: welcherBistDu }
}
