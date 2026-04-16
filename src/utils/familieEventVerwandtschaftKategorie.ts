/**
 * K2 Familie – Events: Verwandtschafts-Gruppen für Teilnehmerliste (nur aus Karten-Feldern).
 * Reihenfolge der Prüfung ist fest – spezifischere Verhältnisse zuerst.
 */

import type { K2FamiliePerson } from '../types/k2Familie'
import { getBeziehungenFromKarten, getGeschwisterAnzeigeListe } from './familieBeziehungen'

export type VerwandtschaftEventKategorieId =
  | 'self'
  | 'partner'
  | 'kinder'
  | 'eltern'
  | 'geschwister'
  | 'grosseltern'
  | 'enkel'
  | 'neffen_nichten'
  | 'onkel_tante'
  | 'cousin'
  | 'schwiegereltern'
  | 'weitere'

/** Anzeige-Reihenfolge der Gruppen (Index = Sortierung). */
export const VERWANDTSCHAFT_EVENT_GRUPPEN_TITEL: { id: VerwandtschaftEventKategorieId; titel: string }[] = [
  { id: 'self', titel: 'Du' },
  { id: 'partner', titel: 'Partner' },
  { id: 'kinder', titel: 'Kinder' },
  { id: 'eltern', titel: 'Eltern' },
  { id: 'geschwister', titel: 'Geschwister' },
  { id: 'grosseltern', titel: 'Großeltern' },
  { id: 'enkel', titel: 'Enkel' },
  { id: 'neffen_nichten', titel: 'Neffen/Nichten' },
  { id: 'onkel_tante', titel: 'Onkel/Tanten' },
  { id: 'cousin', titel: 'Cousinen/Cousins' },
  { id: 'schwiegereltern', titel: 'Schwiegereltern' },
  { id: 'weitere', titel: 'Weitere Verwandtschaft' },
]

const KAT_INDEX = new Map<VerwandtschaftEventKategorieId, number>(
  VERWANDTSCHAFT_EVENT_GRUPPEN_TITEL.map((g, i) => [g.id, i])
)

export function getVerwandtschaftEventKategorieIndex(kategorie: VerwandtschaftEventKategorieId): number {
  return KAT_INDEX.get(kategorie) ?? KAT_INDEX.get('weitere')!
}

/**
 * Ordnet eine Person relativ zu „Du“ einer Gruppe zu (nur gespeicherte Beziehungen).
 */
export function getVerwandtschaftEventKategorie(
  personen: K2FamiliePerson[],
  ichBinPersonId: string | undefined,
  targetPersonId: string
): VerwandtschaftEventKategorieId {
  const ichId = ichBinPersonId?.trim()
  if (!ichId) return 'weitere'
  if (targetPersonId === ichId) return 'self'

  const ich = personen.find((p) => p.id === ichId)
  const target = personen.find((p) => p.id === targetPersonId)
  if (!ich || !target) return 'weitere'

  const bIch = getBeziehungenFromKarten(personen, ichId)

  if (bIch.partner.some((x) => x.id === targetPersonId)) return 'partner'
  if (bIch.kinder.some((x) => x.id === targetPersonId)) return 'kinder'
  if (bIch.eltern.some((x) => x.id === targetPersonId)) return 'eltern'

  const geschwisterIch = getGeschwisterAnzeigeListe(personen, ichId)
  if (geschwisterIch.some((x) => x.id === targetPersonId)) return 'geschwister'

  for (const el of bIch.eltern) {
    const bEl = getBeziehungenFromKarten(personen, el.id)
    if (bEl.eltern.some((x) => x.id === targetPersonId)) return 'grosseltern'
  }

  for (const kind of bIch.kinder) {
    const bK = getBeziehungenFromKarten(personen, kind.id)
    if (bK.kinder.some((x) => x.id === targetPersonId)) return 'enkel'
  }

  for (const pr of bIch.partner) {
    const bPr = getBeziehungenFromKarten(personen, pr.id)
    if (bPr.eltern.some((x) => x.id === targetPersonId)) return 'schwiegereltern'
  }

  for (const sib of geschwisterIch) {
    const bS = getBeziehungenFromKarten(personen, sib.id)
    if (bS.kinder.some((x) => x.id === targetPersonId)) return 'neffen_nichten'
  }

  for (const el of bIch.eltern) {
    const onkelTanten = getGeschwisterAnzeigeListe(personen, el.id)
    if (onkelTanten.some((x) => x.id === targetPersonId)) return 'onkel_tante'
  }

  for (const el of bIch.eltern) {
    const geschwisterEl = getGeschwisterAnzeigeListe(personen, el.id)
    for (const u of geschwisterEl) {
      const bU = getBeziehungenFromKarten(personen, u.id)
      if (bU.kinder.some((k) => k.id === targetPersonId)) return 'cousin'
      const tParents = new Set((target.parentIds ?? []).map((x) => String(x).trim()).filter(Boolean))
      if (tParents.has(u.id)) return 'cousin'
    }
  }

  return 'weitere'
}

export interface VerwandtschaftEventGruppe {
  id: VerwandtschaftEventKategorieId
  titel: string
  personen: K2FamiliePerson[]
}

/**
 * Teilnehmer nach Verwandtschafts-Gruppen; innerhalb jeder Gruppe alphabetisch.
 * Leere Gruppen werden weggelassen.
 */
export function groupPersonenNachVerwandtschaftFuerEvent(
  personen: K2FamiliePerson[],
  ichBinPersonId: string | undefined
): VerwandtschaftEventGruppe[] {
  const buckets = new Map<VerwandtschaftEventKategorieId, K2FamiliePerson[]>()
  for (const g of VERWANDTSCHAFT_EVENT_GRUPPEN_TITEL) {
    buckets.set(g.id, [])
  }

  for (const person of personen) {
    const kat = getVerwandtschaftEventKategorie(personen, ichBinPersonId, person.id)
    buckets.get(kat)!.push(person)
  }

  const nameSort = (a: K2FamiliePerson, b: K2FamiliePerson) =>
    a.name.localeCompare(b.name, 'de', { sensitivity: 'base' })

  const out: VerwandtschaftEventGruppe[] = []
  for (const { id, titel } of VERWANDTSCHAFT_EVENT_GRUPPEN_TITEL) {
    const list = (buckets.get(id) ?? []).sort(nameSort)
    if (list.length === 0) continue
    out.push({ id, titel, personen: list })
  }
  return out
}
