/**
 * Stammbaum-Karten: Zweige pro Geschwisterfamilie (Farbe), Reihenfolge nach Geschwisterstellung.
 * Wenn „Ich bin“ gesetzt ist: gemeinsame Eltern → Geschwisterkreis; jeder Geschwister + Partner + Linie = ein Ast;
 * Sortierung nach positionAmongSiblings der Geschwister (1 = zuerst, z. B. Rupert vor den anderen).
 *
 * Organisationsprinzip (Doku: K2-FAMILIE-STAMMBAUM-KLEINFAMILIEN-MUSTER.md): organisches Wachstum –
 * dasselbe Muster auf jeder Ebene, Daten eine Quelle, UI kann schichtenweise erweitern.
 */

import type { K2FamiliePerson } from '../types/k2Familie'
import { getBeziehungenFromKarten, getFamilienzweigPersonen } from './familieBeziehungen'

function byIdMap(personen: K2FamiliePerson[]): Map<string, K2FamiliePerson> {
  const m = new Map<string, K2FamiliePerson>()
  for (const p of personen) m.set(p.id, p)
  return m
}

/** Legacy: gleiche parentIds (sortiert) = ein Zweig (wenn kein Geschwister-Kontext). */
export function getFamilieBranchKeyLegacy(p: K2FamiliePerson): string {
  if (!p.parentIds.length) return `root:${p.id}`
  return [...p.parentIds].sort().join('|')
}

/** Eltern-Paar von „Ich bin“ als sortierter Schlüssel (nur wenn zwei Eltern). */
function getElternKeyVonIchBin(personen: K2FamiliePerson[], ichBinPersonId: string | undefined): string | null {
  if (!ichBinPersonId) return null
  const ich = personen.find((x) => x.id === ichBinPersonId)
  if (!ich || ich.parentIds.length < 2) return null
  return [...ich.parentIds].sort().join('|')
}

/** Direkte Kinder genau dieses Eltern-Paares = Geschwisterkreis. */
function geschwisterIdsMitGleichenEltern(personen: K2FamiliePerson[], elternKey: string): Set<string> {
  const s = new Set<string>()
  for (const p of personen) {
    if (p.parentIds.length < 2) continue
    if ([...p.parentIds].sort().join('|') === elternKey) s.add(p.id)
  }
  return s
}

/**
 * Elternteil von „ich“, der mit mehr als einem anderen Elternteil Kinder hat (z. B. zwei Ehen).
 * Dann zählen alle Kinder mit diesem Elternteil als Geschwister-/Großfamilie-Kreis (inkl. Halbgeschwister).
 */
function getElternteilMitMehrerenEhen(ich: K2FamiliePerson, personen: K2FamiliePerson[]): string | null {
  for (const pid of ich.parentIds) {
    const andereEltern = new Set<string>()
    for (const p of personen) {
      if (p.parentIds.length < 2 || !p.parentIds.includes(pid)) continue
      const anderer = p.parentIds.find((x) => x !== pid)
      if (anderer) andereEltern.add(anderer)
    }
    if (andereEltern.size >= 2) return pid
  }
  return null
}

/** Geschwister: gleiches Elternpaar ODER gleicher Elternteil bei mehreren Ehen (Halbgeschwister). */
function buildGeschwisterSetFuerIch(
  personen: K2FamiliePerson[],
  ichBinPersonId: string | undefined
): Set<string> {
  if (!ichBinPersonId) return new Set()
  const ich = personen.find((x) => x.id === ichBinPersonId)
  if (!ich || ich.parentIds.length < 2) return new Set()

  const multi = getElternteilMitMehrerenEhen(ich, personen)
  if (multi) {
    const s = new Set<string>()
    for (const p of personen) {
      if (p.parentIds.length >= 2 && p.parentIds.includes(multi)) s.add(p.id)
    }
    return s
  }

  const elternKey = [...ich.parentIds].sort().join('|')
  return geschwisterIdsMitGleichenEltern(personen, elternKey)
}

/**
 * Eltern-Zeile: Reihenfolge aus ich.parentIds, direkt danach Partner der jeweiligen Karte (z. B. erste Ehefrau),
 * ohne alphabetische Sortierung.
 */
function buildElternPersonenListe(ich: K2FamiliePerson, byId: Map<string, K2FamiliePerson>): K2FamiliePerson[] {
  const seen = new Set<string>()
  const out: K2FamiliePerson[] = []
  for (const pid of ich.parentIds) {
    const p = byId.get(pid)
    if (!p || seen.has(p.id)) continue
    out.push(p)
    seen.add(p.id)
    for (const pr of p.partners ?? []) {
      const q = byId.get(pr.personId)
      if (q && !seen.has(q.id)) {
        out.push(q)
        seen.add(q.id)
      }
    }
  }
  return out
}

function findSiblingFamilyAnchor(
  p: K2FamiliePerson,
  byId: Map<string, K2FamiliePerson>,
  geschwisterSet: Set<string>,
  visiting: Set<string>
): string | null {
  if (visiting.has(p.id)) return null
  visiting.add(p.id)
  try {
    if (geschwisterSet.has(p.id)) return p.id
    for (const pid of p.parentIds) {
      if (geschwisterSet.has(pid)) return pid
      const parent = byId.get(pid)
      if (parent) {
        const a = findSiblingFamilyAnchor(parent, byId, geschwisterSet, visiting)
        if (a) return a
      }
    }
    return null
  } finally {
    visiting.delete(p.id)
  }
}

/** Partner: gleicher Ast wie die verknüpfte Person (mehrfach bis stabil). */
function verknuepfePartnerAst(
  personen: K2FamiliePerson[],
  anchorByPersonId: Map<string, string | null>
): void {
  for (let pass = 0; pass < personen.length + 2; pass++) {
    let changed = false
    for (const p of personen) {
      const a = anchorByPersonId.get(p.id)
      for (const pr of p.partners ?? []) {
        const o = anchorByPersonId.get(pr.personId)
        if (a && !o) {
          anchorByPersonId.set(pr.personId, a)
          changed = true
        } else if (o && !a) {
          anchorByPersonId.set(p.id, o)
          changed = true
        }
      }
    }
    if (!changed) break
  }
}

function withinGeschwisterFamilieVergleich(
  a: K2FamiliePerson,
  b: K2FamiliePerson,
  anchorId: string,
  anchorPerson: K2FamiliePerson
): number {
  if (a.id === anchorId) return -1
  if (b.id === anchorId) return 1
  const idxA = (anchorPerson.partners ?? []).findIndex((pr) => pr.personId === a.id)
  const idxB = (anchorPerson.partners ?? []).findIndex((pr) => pr.personId === b.id)
  if (idxA >= 0 && idxB >= 0) return idxA - idxB
  if (idxA >= 0) return -1
  if (idxB >= 0) return 1
  const pa = a.positionAmongSiblings ?? 9999
  const pb = b.positionAmongSiblings ?? 9999
  if (pa !== pb) return pa - pb
  const ga = a.geburtsdatum ?? ''
  const gb = b.geburtsdatum ?? ''
  if (ga !== gb) return ga.localeCompare(gb)
  return a.name.localeCompare(b.name, 'de')
}

function legacySortVergleich(a: K2FamiliePerson, b: K2FamiliePerson): number {
  const ba = getFamilieBranchKeyLegacy(a)
  const bb = getFamilieBranchKeyLegacy(b)
  const c = ba.localeCompare(bb, 'de')
  if (c !== 0) return c
  const pa = a.positionAmongSiblings ?? 9999
  const pb = b.positionAmongSiblings ?? 9999
  if (pa !== pb) return pa - pb
  const ga = a.geburtsdatum ?? ''
  const gb = b.geburtsdatum ?? ''
  if (ga !== gb) return ga.localeCompare(gb)
  return a.name.localeCompare(b.name, 'de')
}

export interface StammbaumKartenState {
  sortedPersonen: K2FamiliePerson[]
  /** Farb-/Gruppenschlüssel pro Person (für Palette). */
  getBranchKey: (p: K2FamiliePerson) => string
  branchIndexByKey: Map<string, number>
}

/**
 * Baut sortierte Liste + Zweig-Schlüssel.
 * Mit ichBinPersonId: Geschwisterfamilien nach positionAmongSiblings des Geschwisters (Ast 1 zuerst),
 * innerhalb Ast: Geschwisterperson → Partner → übrige nach Geschwisterstellung/Datum.
 */
export function buildStammbaumKartenState(
  personen: K2FamiliePerson[],
  ichBinPersonId?: string
): StammbaumKartenState {
  const byId = byIdMap(personen)
  const elternKey = getElternKeyVonIchBin(personen, ichBinPersonId)
  const geschwisterSet = buildGeschwisterSetFuerIch(personen, ichBinPersonId)

  const anchorByPersonId = new Map<string, string | null>()
  for (const p of personen) {
    if (!elternKey || geschwisterSet.size === 0) {
      anchorByPersonId.set(p.id, null)
    } else {
      const a = findSiblingFamilyAnchor(p, byId, geschwisterSet, new Set())
      anchorByPersonId.set(p.id, a)
    }
  }
  if (elternKey && geschwisterSet.size > 0) {
    verknuepfePartnerAst(personen, anchorByPersonId)
  }

  const getBranchKey = (p: K2FamiliePerson): string => {
    const anchor = anchorByPersonId.get(p.id)
    if (anchor) return `geschwister-ast:${anchor}`
    return getFamilieBranchKeyLegacy(p)
  }

  const sortedPersonen = [...personen].sort((a, b) => {
    const anchorA = anchorByPersonId.get(a.id)
    const anchorB = anchorByPersonId.get(b.id)

    if (anchorA && anchorB) {
      const sa = byId.get(anchorA)
      const sb = byId.get(anchorB)
      const rankA = sa?.positionAmongSiblings ?? 9999
      const rankB = sb?.positionAmongSiblings ?? 9999
      if (rankA !== rankB) return rankA - rankB
      if (anchorA !== anchorB) return anchorA.localeCompare(anchorB)
      const ap = sa!
      return withinGeschwisterFamilieVergleich(a, b, anchorA, ap)
    }

    if (anchorA && !anchorB) return -1
    if (!anchorA && anchorB) return 1

    return legacySortVergleich(a, b)
  })

  const keys = [...new Set(sortedPersonen.map(getBranchKey))]
  keys.sort((x, y) => x.localeCompare(y, 'de'))
  const branchIndexByKey = new Map<string, number>()
  keys.forEach((k, i) => branchIndexByKey.set(k, i))

  return { sortedPersonen, getBranchKey, branchIndexByKey }
}

/** @deprecated Nutze buildStammbaumKartenState; nur für Tests / alte Aufrufer */
export function sortPersonenStammbaumKarten(personen: K2FamiliePerson[]): K2FamiliePerson[] {
  return buildStammbaumKartenState(personen, undefined).sortedPersonen
}

/** @deprecated Nutze buildStammbaumKartenState */
export function buildBranchIndexByKey(personen: K2FamiliePerson[]): Map<string, number> {
  return buildStammbaumKartenState(personen, undefined).branchIndexByKey
}

/** Rahmen + leichter Hintergrund; auf dunklem Stammbaum-Hintergrund gut lesbar. */
export const STAMMBAUM_BRANCH_CARD_STYLES: { border: string; bg: string }[] = [
  { border: 'rgba(45, 212, 191, 0.85)', bg: 'rgba(13, 148, 136, 0.18)' },
  { border: 'rgba(96, 165, 250, 0.9)', bg: 'rgba(37, 99, 235, 0.15)' },
  { border: 'rgba(192, 132, 252, 0.9)', bg: 'rgba(107, 33, 168, 0.14)' },
  { border: 'rgba(251, 191, 36, 0.9)', bg: 'rgba(180, 83, 9, 0.12)' },
  { border: 'rgba(52, 211, 153, 0.85)', bg: 'rgba(5, 150, 105, 0.12)' },
  { border: 'rgba(244, 114, 182, 0.9)', bg: 'rgba(190, 24, 93, 0.12)' },
  { border: 'rgba(147, 197, 253, 0.95)', bg: 'rgba(29, 78, 216, 0.12)' },
  { border: 'rgba(253, 224, 71, 0.9)', bg: 'rgba(161, 98, 7, 0.1)' },
  { border: 'rgba(167, 139, 250, 0.9)', bg: 'rgba(91, 33, 182, 0.12)' },
  { border: 'rgba(56, 189, 248, 0.9)', bg: 'rgba(3, 105, 161, 0.14)' },
  { border: 'rgba(251, 146, 60, 0.9)', bg: 'rgba(194, 65, 12, 0.12)' },
  { border: 'rgba(74, 222, 128, 0.85)', bg: 'rgba(21, 128, 61, 0.1)' },
]

export function getStammbaumBranchCardStyle(branchIndex: number): { border: string; bg: string } {
  const i = branchIndex % STAMMBAUM_BRANCH_CARD_STYLES.length
  return STAMMBAUM_BRANCH_CARD_STYLES[i]!
}

/** Unter-Block innerhalb eines Familienzweigs: Kern (Wurzel + Partner) oder Kind inkl. Partner. */
export interface StammbaumKartenUnterSektion {
  key: string
  titel: string
  untertitel?: string
  personen: K2FamiliePerson[]
}

/**
 * Teilt einen Familienzweig (Liste aus getFamilienzweigPersonen) in erkennbare Partner-Zweige:
 * zuerst Kern = Wurzelperson + deren Partner (laut Karte), dann pro Kind ein Block mit Kind + Partnern.
 * Nur Personen aus personenImZweig; eine Quelle: Kartenfelder partners / childIds.
 */
export function buildStammbaumPartnerUnterSektionen(
  personen: K2FamiliePerson[],
  anchorId: string,
  personenImZweig: K2FamiliePerson[]
): StammbaumKartenUnterSektion[] {
  const byId = byIdMap(personen)
  const g = byId.get(anchorId)
  if (!g || personenImZweig.length === 0) return []

  const kleinIds = new Set(personenImZweig.map((p) => p.id))
  const assigned = new Set<string>()
  const out: StammbaumKartenUnterSektion[] = []

  const kern: K2FamiliePerson[] = []
  if (kleinIds.has(g.id)) {
    kern.push(g)
    assigned.add(g.id)
  }
  for (const pr of g.partners ?? []) {
    const q = byId.get(pr.personId)
    if (q && kleinIds.has(q.id) && !assigned.has(q.id)) {
      kern.push(q)
      assigned.add(q.id)
    }
  }
  if (kern.length > 0) {
    const partnerNamen = kern
      .filter((p) => p.id !== g.id)
      .map((p) => p.name)
      .join(', ')
    out.push({
      key: `kern-${g.id}`,
      titel: partnerNamen ? `Kern: ${g.name} & ${partnerNamen}` : `Kern: ${g.name}`,
      untertitel: `${kern.length} Person${kern.length === 1 ? '' : 'en'}`,
      personen: kern,
    })
  }

  const kinder = [...getBeziehungenFromKarten(personen, g.id).kinder]
    .filter((k) => kleinIds.has(k.id))
    .sort((a, b) => {
      const pa = a.positionAmongSiblings ?? 9999
      const pb = b.positionAmongSiblings ?? 9999
      if (pa !== pb) return pa - pb
      return a.name.localeCompare(b.name, 'de')
    })

  for (const k of kinder) {
    const block: K2FamiliePerson[] = []
    if (!assigned.has(k.id)) {
      block.push(k)
      assigned.add(k.id)
    }
    for (const pr of k.partners ?? []) {
      const q = byId.get(pr.personId)
      if (q && kleinIds.has(q.id) && !assigned.has(q.id)) {
        block.push(q)
        assigned.add(q.id)
      }
    }
    if (block.length === 0) continue

    const partnerDerKind = block.filter((p) => p.id !== k.id)
    const partnerLabel =
      partnerDerKind.length > 0 ? partnerDerKind.map((p) => p.name).join(', ') : ''
    out.push({
      key: `kind-${k.id}`,
      titel: partnerLabel ? `Zweig: ${k.name} & ${partnerLabel}` : `Zweig: ${k.name}`,
      untertitel: `${block.length} Person${block.length === 1 ? '' : 'en'}`,
      personen: block,
    })
  }

  const rest = personenImZweig.filter((p) => !assigned.has(p.id))
  if (rest.length > 0) {
    const sorted = [...rest].sort((a, b) => a.name.localeCompare(b.name, 'de'))
    out.push({
      key: `rest-${g.id}`,
      titel: 'Weitere im Familienzweig',
      untertitel: `${sorted.length} Person${sorted.length === 1 ? '' : 'en'}`,
      personen: sorted,
    })
  }

  return out.length > 0 ? out : []
}

/** Eine Sektion = ein Block (Eltern oder ein Geschwister-Familienzweig), eigene Farbe. */
export interface StammbaumKartenSektion {
  key: string
  titel: string
  untertitel?: string
  personen: K2FamiliePerson[]
  /** Index in die Farbpalette (pro Sektion eine Farbe). */
  branchIndex: number
  /** Optional: Partner-Zweige innerhalb des Familienzweigs (Kern, Kind & Partner, …). */
  unterSektionen?: StammbaumKartenUnterSektion[]
}

/**
 * Großfamilie: nacheinander Eltern, dann jeder Geschwister-Familienzweig in Geschwisterreihenfolge (1, 2, …),
 * zuletzt Personen ohne Zuordnung. Voraussetzung: „Ich bin“ mit zwei Eltern in den Karten.
 */
export function buildGrossfamilieStammbaumSektionen(
  personen: K2FamiliePerson[],
  ichBinPersonId: string | undefined
): StammbaumKartenSektion[] | null {
  if (!ichBinPersonId) return null
  const ich = personen.find((x) => x.id === ichBinPersonId)
  if (!ich || ich.parentIds.length < 2) return null

  const byId = byIdMap(personen)
  const elternKeyStrict = [...ich.parentIds].sort().join('|')
  const multiElternteil = getElternteilMitMehrerenEhen(ich, personen)

  const geschwister = personen
    .filter((p) => {
      if (p.parentIds.length < 2) return false
      if (multiElternteil) return p.parentIds.includes(multiElternteil)
      return [...p.parentIds].sort().join('|') === elternKeyStrict
    })
    .sort((a, b) => {
      const pa = a.positionAmongSiblings ?? 9999
      const pb = b.positionAmongSiblings ?? 9999
      if (pa !== pb) return pa - pb
      return a.name.localeCompare(b.name, 'de')
    })

  const sections: StammbaumKartenSektion[] = []
  let bi = 0

  const elternPersonen = buildElternPersonenListe(ich, byId)

  const erfasst = new Set<string>()

  if (elternPersonen.length > 0) {
    sections.push({
      key: 'eltern',
      titel: 'Eltern',
      personen: elternPersonen,
      branchIndex: bi++,
    })
    elternPersonen.forEach((p) => erfasst.add(p.id))
  }

  for (const g of geschwister) {
    const roh = getFamilienzweigPersonen(personen, g.id)
    const klein = buildStammbaumKartenState(roh, g.id).sortedPersonen
    const unterSektionen = buildStammbaumPartnerUnterSektionen(personen, g.id, klein)
    const pos = g.positionAmongSiblings
    const posLabel = pos != null && pos >= 1 ? String(pos) : '–'
    const zweigTeile =
      unterSektionen.length > 1
        ? ` · ${unterSektionen.length} Teil-Zweige (Kern & Partner je Kind)`
        : ''
    sections.push({
      key: `kleinfamilie-${g.id}`,
      titel: `Familienzweig ${posLabel} – ${g.name}`,
      untertitel: `${klein.length} Person${klein.length === 1 ? '' : 'en'}${zweigTeile}`,
      personen: klein,
      branchIndex: bi++,
      unterSektionen: unterSektionen.length > 0 ? unterSektionen : undefined,
    })
    klein.forEach((p) => erfasst.add(p.id))
  }

  const weitere = personen.filter((p) => !erfasst.has(p.id))
  if (weitere.length > 0) {
    const sorted = [...weitere].sort((a, b) => a.name.localeCompare(b.name, 'de'))
    sections.push({
      key: 'weitere',
      titel: 'Weitere Personen',
      untertitel: 'z. B. Großeltern – keinem Familienzweig zugeordnet',
      personen: sorted,
      branchIndex: bi++,
    })
  }

  return sections
}
