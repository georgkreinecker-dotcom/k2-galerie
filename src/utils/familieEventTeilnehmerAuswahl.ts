/**
 * K2 Familie – Events: Teilnehmerliste filtern (Familienseiten) und sortieren.
 * Mütterlich/väterlich: Reihenfolge in parentIds von „Du“ – 1. Elternteil = mütterliche Seite, 2. = väterliche (wie Stammbaum-Reihenfolge, keine biologische Annahme).
 */

import type { K2FamiliePerson } from '../types/k2Familie'
import { getGraphDistanceFromIch } from './familieGraphDistance'
import {
  getVerwandtschaftEventKategorie,
  getVerwandtschaftEventKategorieIndex,
} from './familieEventVerwandtschaftKategorie'

export type FamilieTeilnehmerGruppe = 'alle' | 'muetterlich' | 'vaterlich'
export type FamilieTeilnehmerSortierung = 'name' | 'verwandtschaft'

/**
 * Alle Personen im Beziehungsnetz ab einem Elternteil, ohne vom Knoten „Du“ zum anderen Elternteil zu springen
 * (sonst würde die ganze Familie in beiden Seiten landen).
 */
export function expandFamilienSeiteVonElternteil(
  personen: K2FamiliePerson[],
  rootParentId: string,
  otherParentId: string | undefined,
  duId: string
): Set<string> {
  const byId = new Map(personen.map((p) => [p.id, p]))
  const visited = new Set<string>()
  const q: string[] = [rootParentId]
  while (q.length > 0) {
    const id = q.shift()!
    if (visited.has(id)) continue
    visited.add(id)
    const p = byId.get(id)
    if (!p) continue
    const push = (x: string) => {
      if (x && !visited.has(x)) q.push(x)
    }
    for (const pid of p.parentIds ?? []) {
      if (id === duId && otherParentId && pid === otherParentId) continue
      push(pid)
    }
    for (const cid of p.childIds ?? []) push(cid)
    for (const pr of p.partners ?? []) push(pr.personId)
    for (const sid of p.siblingIds ?? []) push(sid)
  }
  return visited
}

export function filterPersonenFuerFamilienEventTeilnehmer(
  personen: K2FamiliePerson[],
  ichBinPersonId: string | undefined,
  gruppe: FamilieTeilnehmerGruppe
): K2FamiliePerson[] {
  if (gruppe === 'alle') return personen
  const duId = ichBinPersonId?.trim()
  if (!duId) return personen
  const ich = personen.find((p) => p.id === duId)
  if (!ich) return personen
  const pids = (ich.parentIds ?? []).map((x) => String(x).trim()).filter(Boolean)
  if (gruppe === 'muetterlich') {
    if (pids.length < 1) return personen
    const other = pids.length >= 2 ? pids[1] : undefined
    const ids = expandFamilienSeiteVonElternteil(personen, pids[0]!, other, duId)
    return personen.filter((p) => ids.has(p.id))
  }
  if (gruppe === 'vaterlich') {
    if (pids.length < 2) return personen
    const ids = expandFamilienSeiteVonElternteil(personen, pids[1]!, pids[0], duId)
    return personen.filter((p) => ids.has(p.id))
  }
  return personen
}

export function sortPersonenFuerFamilienEventTeilnehmer(
  personen: K2FamiliePerson[],
  ichBinPersonId: string | undefined,
  sortierung: FamilieTeilnehmerSortierung
): K2FamiliePerson[] {
  const list = [...personen]
  if (sortierung === 'name') {
    return list.sort((a, b) => a.name.localeCompare(b.name, 'de', { sensitivity: 'base' }))
  }
  return list.sort((a, b) => {
    const ka = getVerwandtschaftEventKategorie(personen, ichBinPersonId, a.id)
    const kb = getVerwandtschaftEventKategorie(personen, ichBinPersonId, b.id)
    const ia = getVerwandtschaftEventKategorieIndex(ka)
    const ib = getVerwandtschaftEventKategorieIndex(kb)
    if (ia !== ib) return ia - ib
    const da = getGraphDistanceFromIch(personen, ichBinPersonId, a.id)
    const db = getGraphDistanceFromIch(personen, ichBinPersonId, b.id)
    if (da != null && db != null && da !== db) return da - db
    return a.name.localeCompare(b.name, 'de', { sensitivity: 'base' })
  })
}
