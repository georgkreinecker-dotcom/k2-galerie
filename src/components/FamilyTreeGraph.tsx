/**
 * K2 Familie – Stammbaum-Grafik (echter Baum mit Generationen und Linien).
 * SVG-basiert: Wurzeln oben, Kinder darunter, Partner verbunden.
 * Verbindliches Muster (Kleinfamilie, N Zweige): docs/K2-FAMILIE-STAMMBAUM-KLEINFAMILIEN-MUSTER.md
 */

import { Link } from 'react-router-dom'
import { useMemo, useState, useRef, useCallback, useEffect } from 'react'
import type { K2FamiliePerson } from '../types/k2Familie'
import { normalizeFamilieDatum } from '../utils/familieDatumEingabe'
import { getAktuellesPersonenFoto, isHttpUrlForExternalOpen } from '../utils/familiePersonFotos'
const NODE_W = 72
const NODE_H = 56
const ROW_H = 176
const COL_GAP = 24
/** Zusätzlicher Abstand zwischen zwei „Blöcken“ (Geschwister + deren Partner), damit keine Partner-Kette entsteht. */
const BLOCK_GAP = 40
/** Höhe einer Unterzeile, wenn eine Generation in mehrere Zeilen umgebrochen wird (nur bei sehr vielen Personen). */
const SUB_ROW_H = 100
/** Max. Personen pro waagrechter Zeile einer Generation – danach Umbruch (weitere Zeile darunter), nicht „Familienblöcke“ untereinander. */
const MAX_PERSONEN_PRO_GENERATIONSZEILE = 14
const PERSON_LINK_PATH = '/projects/k2-familie/personen'

/** Gültige http(s)-Links zur Person – für Mini-Symbole im Stammbaum (Fotoalbum, Web, YouTube, Instagram). */
function personStammbaumExternalLinks(p: K2FamiliePerson): { url: string; label: string; emoji: string }[] {
  const out: { url: string; label: string; emoji: string }[] = []
  const t = (s?: string) => String(s ?? '').trim()
  if (isHttpUrlForExternalOpen(t(p.linkFotoalbum))) out.push({ url: t(p.linkFotoalbum), label: 'Fotoalbum', emoji: '📷' })
  if (isHttpUrlForExternalOpen(t(p.linkWeb))) out.push({ url: t(p.linkWeb), label: 'Web / Homepage', emoji: '🌐' })
  if (isHttpUrlForExternalOpen(t(p.linkYoutube))) out.push({ url: t(p.linkYoutube), label: 'YouTube', emoji: '▶️' })
  if (isHttpUrlForExternalOpen(t(p.linkInstagram))) out.push({ url: t(p.linkInstagram), label: 'Instagram', emoji: '📸' })
  return out
}

type Point = { x: number; y: number }

/** Eltern → Kind: mehrere Kanten zum selben Kind erzeugen dieselbe waagrechte Linie doppelt (Doppelstrich). */
type ParentChildConnector = { from: Point; to: Point; viaY?: number; mergedParents?: Point[]; childId?: string }

function mergeConnectorsAvoidDoubleHorizontal(
  connectors: { from: Point; to: Point; viaY?: number; childId?: string }[]
): ParentChildConnector[] {
  const noVia = connectors.filter((c) => c.viaY == null)
  const withVia = connectors.filter((c) => c.viaY != null) as { from: Point; to: Point; viaY: number; childId?: string }[]
  const groups = new Map<string, { from: Point; to: Point; viaY: number; childId?: string }[]>()
  for (const c of withVia) {
    /** Eine Gruppe pro Kind: zuverlässiger als to.x/y/viaY (Rundung / minimale Abweichungen). */
    const k = c.childId != null ? `child:${c.childId}` : `${c.to.x.toFixed(3)},${c.to.y.toFixed(3)},${c.viaY.toFixed(3)}`
    if (!groups.has(k)) groups.set(k, [])
    groups.get(k)!.push(c)
  }
  const merged: ParentChildConnector[] = []
  for (const group of groups.values()) {
    if (group.length <= 1) {
      merged.push(group[0])
      continue
    }
    const seen = new Map<string, Point>()
    for (const g of group) {
      const pk = `${g.from.x.toFixed(3)},${g.from.y.toFixed(3)}`
      if (!seen.has(pk)) seen.set(pk, g.from)
    }
    const parents = [...seen.values()].sort((a, b) => a.x - b.x)
    const viaY = group.reduce((s, g) => s + g.viaY, 0) / group.length
    merged.push({
      from: parents[0],
      to: group[0].to,
      viaY,
      mergedParents: parents,
      childId: group[0].childId,
    })
  }
  return [...merged, ...noVia]
}

function buildMergedVerticalPath(parents: Point[], to: Point, viaY: number): string {
  const xs = [...parents.map((p) => p.x), to.x]
  const xMin = Math.min(...xs)
  const xMax = Math.max(...xs)
  let d = ''
  for (const p of parents) {
    d += `M ${p.x} ${p.y} L ${p.x} ${viaY} `
  }
  d += `M ${xMin} ${viaY} L ${xMax} ${viaY} M ${to.x} ${viaY} L ${to.x} ${to.y}`
  return d.trim()
}

function buildMergedHorizontalPathFromVertical(parents: Point[], to: Point, viaY: number): string {
  const flip = (p: Point) => ({ x: p.y, y: p.x })
  const xs = [...parents.map((p) => p.x), to.x]
  const xMin = Math.min(...xs)
  const xMax = Math.max(...xs)
  let d = ''
  for (const p of parents) {
    const a = flip(p)
    const b = flip({ x: p.x, y: viaY })
    d += `M ${a.x} ${a.y} L ${b.x} ${b.y} `
  }
  const barA = flip({ x: xMin, y: viaY })
  const barB = flip({ x: xMax, y: viaY })
  d += `M ${barA.x} ${barA.y} L ${barB.x} ${barB.y} `
  const cStart = flip({ x: to.x, y: viaY })
  const cEnd = flip(to)
  d += `M ${cStart.x} ${cStart.y} L ${cEnd.x} ${cEnd.y}`
  return d.trim()
}

/** Person-IDs, die nur als Partner vorkommen (in jemandes partners-Liste). */
function getPartnerOnlyIds(personen: K2FamiliePerson[]): Set<string> {
  const asPartner = new Set<string>()
  personen.forEach((p) => p.partners.forEach((pr) => asPartner.add(pr.personId)))
  return asPartner
}

/** Hat diese Person Kinder (jemand hat sie in parentIds)? */
export function getChildIds(personen: K2FamiliePerson[]): Map<string, string[]> {
  const childIds = new Map<string, string[]>()
  personen.forEach((p) => {
    p.parentIds.forEach((pid) => {
      if (!childIds.has(pid)) childIds.set(pid, [])
      childIds.get(pid)!.push(p.id)
    })
  })
  return childIds
}

/** Für Druck-Listen: gleiche Generationen wie in der Grafik. */
export function getGenerations(personen: K2FamiliePerson[]): Map<string, number> {
  const byId = new Map(personen.map((p) => [p.id, p]))
  const childIds = getChildIds(personen)
  const level = new Map<string, number>()
  const partnerOnlyIds = getPartnerOnlyIds(personen)
  const computing = new Set<string>()

  function getLevel(id: string): number {
    const cached = level.get(id)
    if (cached !== undefined) return cached
    if (computing.has(id)) return 0
    const p = byId.get(id)
    if (!p) {
      level.set(id, 0)
      return 0
    }
    computing.add(id)
    try {
      // Ohne eigene Eltern: Ebene vom Partner übernehmen, damit Paar in derselben Zeile steht (Familienzweig)
      if (p.parentIds.length === 0) {
        const hasChildren = (childIds.get(id)?.length ?? 0) > 0
        if (p.partners.length > 0) {
          const partnerId = p.partners[0].personId
          const partnerLevel = getLevel(partnerId)
          const levelToUse = partnerLevel === 0 && !hasChildren ? 1 : partnerLevel
          level.set(id, levelToUse)
          return levelToUse
        }
        level.set(id, 0)
        return 0
      }
      const parentLevels = p.parentIds.map((pid) => getLevel(pid))
      const L = 1 + Math.max(...parentLevels)
      level.set(id, L)
      return L
    } finally {
      computing.delete(id)
    }
  }

  personen.forEach((p) => getLevel(p.id))
  return level
}

/**
 * Generationen für einen **auf Du + Partner + Nachkommen** reduzierten Personensatz (ohne Eltern in der Liste):
 * Wurzel = Ebene 0 (Du und eingetragene Partner in dieser Liste), Kinder = 1, …
 * Verhindert, dass fehlende Eltern in der Liste zu falschen Ebenen führen (Klassiker: Partner Zeile 0, Du Zeile 1).
 */
export function getGenerationsFamilienzweigAbwaertsWurzel(
  personen: K2FamiliePerson[],
  wurzelPersonId: string
): Map<string, number> {
  const byId = new Map(personen.map((p) => [p.id, p]))
  const level = new Map<string, number>()
  const root = byId.get(wurzelPersonId)
  if (!root) return level

  const roots = new Set<string>([wurzelPersonId])
  for (const pr of root.partners ?? []) {
    if (byId.has(pr.personId)) roots.add(pr.personId)
  }
  roots.forEach((id) => level.set(id, 0))

  let changed = true
  let guard = 0
  while (changed && guard++ < personen.length + 12) {
    changed = false
    for (const p of personen) {
      if (level.has(p.id)) continue
      const parentsInGraph = (p.parentIds ?? []).filter((pid) => byId.has(pid))
      if (parentsInGraph.length === 0) {
        const sp = p.partners?.find((pr) => byId.has(pr.personId) && level.has(pr.personId))
        if (sp) {
          level.set(p.id, level.get(sp.personId)!)
          changed = true
        }
        continue
      }
      if (!parentsInGraph.every((pid) => level.has(pid))) continue
      const pl = Math.max(...parentsInGraph.map((pid) => level.get(pid)!))
      level.set(p.id, pl + 1)
      changed = true
    }
    for (const p of personen) {
      if (level.has(p.id)) continue
      for (const pr of p.partners ?? []) {
        if (!byId.has(pr.personId) || !level.has(pr.personId)) continue
        level.set(p.id, level.get(pr.personId)!)
        changed = true
        break
      }
    }
  }
  for (const p of personen) {
    if (!level.has(p.id)) level.set(p.id, 0)
  }
  return level
}

/** Reihenfolge in der Reihe: 1 = erster, 2 = zweiter, … Quelle: positionAmongSiblings, Du-Position oder Name „Geschwister N“. */
function getPositionInRow(
  person: K2FamiliePerson,
  ichBinPersonId: string | undefined,
  ichBinPositionAmongSiblings: number | undefined
): number {
  if (person.positionAmongSiblings != null) return person.positionAmongSiblings
  if (person.id === ichBinPersonId && ichBinPositionAmongSiblings != null) return ichBinPositionAmongSiblings
  const m = person.name.match(/^(?:Geschwister|Kind)\s+(\d+)$/i)
  if (m) return parseInt(m[1], 10)
  return 999
}

/**
 * Dieselbe Logik wie in `orderInGeneration`: Partner ohne eigene Kinder übernehmen die
 * Geschwister-Position vom Partner in derselben Zeile (nicht 999 vs 3 vergleichen).
 */
function getEffectivePositionInRowForSort(
  id: string,
  idsInRow: string[],
  byId: Map<string, K2FamiliePerson>,
  childIds: Map<string, string[]>,
  ichBinPersonId: string | undefined,
  ichBinPositionAmongSiblings: number | undefined
): number {
  const person = byId.get(id)
  if (!person) return 999
  let pos = getPositionInRow(person, ichBinPersonId, ichBinPositionAmongSiblings)
  if (pos >= 999 && ichBinPersonId !== id) {
    const partnerInRow = person.partners.find((pr) => idsInRow.includes(pr.personId))?.personId
    if (partnerInRow) {
      const hasCh = (pid: string) => (childIds.get(pid)?.length ?? 0) > 0
      if (hasCh(partnerInRow) && !hasCh(id)) {
        const partner = byId.get(partnerInRow)!
        pos = getPositionInRow(partner, ichBinPersonId, ichBinPositionAmongSiblings)
      }
    }
  }
  return pos
}

/** ISO YYYY-MM-DD für Sortierung (älter zuerst); null wenn nicht gesetzt/nicht parsbar. */
function sortKeyGeburtsdatum(raw?: string): string | null {
  if (!raw?.trim()) return null
  return normalizeFamilieDatum(raw.trim()) ?? null
}

/**
 * Geschwister mit gleicher effektiver Position / 999: Reihenfolge wie auf der **Elternkarte** (`childIds`),
 * wenn beide in derselben Liste vorkommen. Eine Quelle mit der Großfamilien-Logik (siehe familieStammbaumKarten).
 */
function compareSiblingOrderFromParentChildIds(
  a: K2FamiliePerson,
  b: K2FamiliePerson,
  byId: Map<string, K2FamiliePerson>
): number | null {
  const parentsA = new Set(a.parentIds ?? [])
  const common = (b.parentIds ?? []).filter((pid) => parentsA.has(pid))
  for (const pid of common) {
    const parent = byId.get(pid)
    if (!parent) continue
    const order = parent.childIds ?? []
    if (order.length === 0) continue
    const ia = order.indexOf(a.id)
    const ib = order.indexOf(b.id)
    if (ia >= 0 && ib >= 0 && ia !== ib) return ia - ib
  }
  return null
}

/** Gleiche Generation: zuerst Geschwister-Reihenfolge (positionAmongSiblings / „Geschwister N“ / Du-Position), dann Geburtsdatum, sonst Name. */
function compareNachGeschwisterlinieOderGeburt(
  a: K2FamiliePerson,
  b: K2FamiliePerson,
  ichBinPersonId?: string,
  ichBinPositionAmongSiblings?: number,
  idsInRow?: string[],
  byId?: Map<string, K2FamiliePerson>,
  childIds?: Map<string, string[]>
): number {
  const posA =
    idsInRow && byId && childIds
      ? getEffectivePositionInRowForSort(a.id, idsInRow, byId, childIds, ichBinPersonId, ichBinPositionAmongSiblings)
      : getPositionInRow(a, ichBinPersonId, ichBinPositionAmongSiblings)
  const posB =
    idsInRow && byId && childIds
      ? getEffectivePositionInRowForSort(b.id, idsInRow, byId, childIds, ichBinPersonId, ichBinPositionAmongSiblings)
      : getPositionInRow(b, ichBinPersonId, ichBinPositionAmongSiblings)
  if (posA < 999 && posB < 999 && posA !== posB) return posA - posB
  if (posA < 999 && posB >= 999) return -1
  if (posA >= 999 && posB < 999) return 1
  /** Nur wenn auf der Karte keine Geschwisternummer steht (999): Eltern-childIds wie Großfamilie; sonst bei gleicher Nummer → Geburtsdatum. */
  const rawA = getPositionInRow(a, ichBinPersonId, ichBinPositionAmongSiblings)
  const rawB = getPositionInRow(b, ichBinPersonId, ichBinPositionAmongSiblings)
  if (byId && rawA >= 999 && rawB >= 999) {
    const fromParents = compareSiblingOrderFromParentChildIds(a, b, byId)
    if (fromParents !== null) return fromParents
  }
  const da = sortKeyGeburtsdatum(a.geburtsdatum)
  const db = sortKeyGeburtsdatum(b.geburtsdatum)
  if (da && db && da !== db) return da.localeCompare(db)
  return a.name.localeCompare(b.name, 'de')
}

/** Gleiche Geschwister-Position: in einem Partnerpaar zuerst die Person mit Kindern in der Grafik (Kernfamilie), dann der Partner. */
function comparePartnerGeschwisterVorPartnerOhneKinder(
  aId: string,
  bId: string,
  byId: Map<string, K2FamiliePerson>,
  childIds: Map<string, string[]>
): number {
  const a = byId.get(aId)
  const b = byId.get(bId)
  if (!a || !b) return 0
  const hasChildren = (id: string) => (childIds.get(id)?.length ?? 0) > 0
  const aPartnerB = a.partners.some((pr) => pr.personId === bId)
  const bPartnerA = b.partners.some((pr) => pr.personId === aId)
  if (!aPartnerB || !bPartnerA) return 0
  const ac = hasChildren(aId)
  const bc = hasChildren(bId)
  if (ac && !bc) return -1
  if (!ac && bc) return 1
  return 0
}

export function orderInGeneration(
  personen: K2FamiliePerson[],
  ids: string[],
  levelMap: Map<string, number>,
  childIds: Map<string, string[]>,
  ichBinPersonId?: string,
  ichBinPositionAmongSiblings?: number
): string[] {
  if (ids.length <= 1) return ids
  const byId = new Map(personen.map((p) => [p.id, p]))
  const withPos = ids.map((id) => ({
    id,
    pos: getEffectivePositionInRowForSort(id, ids, byId, childIds, ichBinPersonId, ichBinPositionAmongSiblings),
  }))
  const hasAnyPosition = withPos.some((x) => x.pos < 999)
  if (hasAnyPosition) {
    withPos.sort((a, b) => {
      if (a.pos !== b.pos) return a.pos - b.pos
      const pp = comparePartnerGeschwisterVorPartnerOhneKinder(a.id, b.id, byId, childIds)
      if (pp !== 0) return pp
      const pa = byId.get(a.id)!
      const pb = byId.get(b.id)!
      return compareNachGeschwisterlinieOderGeburt(
        pa,
        pb,
        ichBinPersonId,
        ichBinPositionAmongSiblings,
        ids,
        byId,
        childIds
      )
    })
    return withPos.map((x) => x.id)
  }
  const withParentOrder = ids.map((id) => {
    const p = byId.get(id)!
    const firstParent = p.parentIds[0]
    const parentIndex = firstParent ? ids.indexOf(firstParent) : -1
    return { id, parentIndex }
  })
  withParentOrder.sort((a, b) => {
    if (a.parentIndex !== b.parentIndex) return a.parentIndex - b.parentIndex
    const pa = byId.get(a.id)!
    const pb = byId.get(b.id)!
    return (
      compareNachGeschwisterlinieOderGeburt(
        pa,
        pb,
        ichBinPersonId,
        ichBinPositionAmongSiblings,
        ids,
        byId,
        childIds
      ) || a.id.localeCompare(b.id)
    )
  })
  return withParentOrder.map((x) => x.id)
}

/**
 * Oberere Generationen: links nach rechts mit Mindestabstand (wie unterste Zeile).
 * Wunsch-X aus Kinder-Mitte: nur nach rechts schieben (Math.max), nie zusammenquetschen.
 */
function placeRowUnderChildrenNoOverlap(
  rowIds: string[],
  cxPartial: Map<string, number | undefined>,
  needsBlockGapBetween: (i: number, rowIds: string[]) => boolean,
  y: number
): Map<string, Point> {
  const out = new Map<string, Point>()
  let x = 40 + NODE_W / 2
  rowIds.forEach((id, i) => {
    if (i > 0 && needsBlockGapBetween(i, rowIds)) x += BLOCK_GAP
    const t = cxPartial.get(id)
    const cx = t != null && !Number.isNaN(t) ? Math.max(x, t) : x
    out.set(id, { x: cx, y })
    x = cx + NODE_W + COL_GAP
  })
  return out
}

/**
 * Eltern-Zeile: zuerst Partner-Paare (nicht-Geschwister) als feste Blöcke, damit z. B. Eva nie
 * zwischen Lukas und Stefan aufgetrennt wird. Reihenfolge der Blöcke = Durchlauf von rowIds
 * (Geschwister 1,2,3… bleiben); keine Sortierung nach Kinder-Mitte — die würde die Reihenfolge zerstören.
 * Ausrichtung unter den Kindern: placeRowUnderChildrenNoOverlap (Math.max mit cxPartial).
 */
function sortRowIdsByDesiredCx(
  rowIds: string[],
  _cxPartial: Map<string, number | undefined>,
  byId: Map<string, K2FamiliePerson>
): string[] {
  const assigned = new Set<string>()
  const blocks: string[][] = []
  const rank = (id: string) => {
    const i = rowIds.indexOf(id)
    return i >= 0 ? i : 9999
  }
  const pairOrder = (a: string, b: string): [string, string] => (rank(a) <= rank(b) ? [a, b] : [b, a])

  for (const id of rowIds) {
    if (assigned.has(id)) continue
    const p = byId.get(id)
    if (!p) {
      blocks.push([id])
      assigned.add(id)
      continue
    }
    let partnerId: string | undefined
    for (const pr of p.partners ?? []) {
      if (!rowIds.includes(pr.personId) || assigned.has(pr.personId)) continue
      const q = byId.get(pr.personId)
      if (!q) continue
      if (sindGeschwisterLautKarten(p, q)) continue
      partnerId = pr.personId
      break
    }
    if (partnerId) {
      const [a, b] = pairOrder(id, partnerId)
      blocks.push([a, b])
      assigned.add(a)
      assigned.add(b)
    } else {
      blocks.push([id])
      assigned.add(id)
    }
  }

  return blocks.flat()
}

/** Nach Partner-Spread: sicherstellen, dass die Zeile nirgends überlappt (gleiche Regel wie unterste Zeile). */
function enforceNonOverlappingRow(
  rowIds: string[],
  nodePos: Map<string, Point>,
  y: number,
  needsBlockGapBetween: (i: number, rowIds: string[]) => boolean
): void {
  for (let i = 0; i < rowIds.length; i++) {
    const id = rowIds[i]
    const p = nodePos.get(id)
    if (!p) continue
    let x = p.x
    if (i === 0) {
      const minCx = 40 + NODE_W / 2
      if (x < minCx) x = minCx
    } else {
      const prev = nodePos.get(rowIds[i - 1])
      if (!prev) continue
      const prevRight = prev.x + NODE_W / 2
      const gap = needsBlockGapBetween(i, rowIds) ? BLOCK_GAP : COL_GAP
      const minCx = prevRight + gap + NODE_W / 2
      if (x < minCx) x = minCx
    }
    nodePos.set(id, { x, y })
  }
}

function yForGenerationLevel(L: number): number {
  return 24 + ROW_H / 2 + L * ROW_H
}

/** Gleiche Eltern in der Grafik = ein Geschwister-/Familienblock (wie Großfamilien-Karten). */
function familyClusterKeyChild(p: K2FamiliePerson, byId: Map<string, K2FamiliePerson>): string {
  const parents = (p.parentIds ?? []).filter((pid) => byId.has(pid))
  if (parents.length === 0) return `solo:${p.id}`
  return [...parents].sort().join('|')
}

/**
 * Unterste Generation: dieselbe Kernfamilie wie `familyClusterKeyChild`, aber wenn in den Karten nur
 * ein Elternteil eingetragen ist, ein Geschwister aber beide – oder ein Kind nur Vater, eines nur Mutter –
 * trotzdem einen gemeinsamen Schlüssel (sonst getrennte Blöcke → waagrechte Linien kreuzen andere Zweige).
 */
export function familyClusterKeyChildForBottomRow(
  p: K2FamiliePerson,
  byId: Map<string, K2FamiliePerson>,
  levelMap: Map<string, number>,
  maxLevel: number,
  allIdsAtLevel: string[]
): string {
  const parentsInRow = (p.parentIds ?? []).filter(
    (pid) => byId.has(pid) && (levelMap.get(pid) ?? -1) === maxLevel - 1
  )
  if (parentsInRow.length === 0) return `solo:${p.id}`
  if (parentsInRow.length >= 2) return [...parentsInRow].sort().join('|')

  const singlePid = parentsInRow[0]!

  for (const oid of allIdsAtLevel) {
    if (oid === p.id) continue
    const o = byId.get(oid)
    if (!o) continue
    const ops = (o.parentIds ?? []).filter(
      (pid) => byId.has(pid) && (levelMap.get(pid) ?? -1) === maxLevel - 1
    )
    if (ops.length >= 2 && ops.includes(singlePid)) return [...ops].sort().join('|')
  }

  for (const oid of allIdsAtLevel) {
    if (oid === p.id) continue
    const o = byId.get(oid)
    if (!o) continue
    const ops = (o.parentIds ?? []).filter(
      (pid) => byId.has(pid) && (levelMap.get(pid) ?? -1) === maxLevel - 1
    )
    if (ops.length !== 1) continue
    const oPid = ops[0]!
    if (oPid === singlePid) continue
    const par = byId.get(singlePid)
    if (par && par.partners.some((pr) => pr.personId === oPid)) {
      return [singlePid, oPid].sort().join('|')
    }
  }

  return singlePid
}

/** Mind. ein gemeinsames Elternteil in den Karten → Geschwister; keine Partner-Linie dazwischen. */
function sindGeschwisterLautKarten(a: K2FamiliePerson, b: K2FamiliePerson): boolean {
  if (a.id === b.id) return false
  const pa = a.parentIds ?? []
  const pb = b.parentIds ?? []
  if (pa.length === 0 || pb.length === 0) return false
  const sa = new Set(pa)
  return pb.some((pid) => sa.has(pid))
}

/**
 * Waagrechte Reihenfolge in der Grafik: **nur** aus Personenkarten-Feldern (`K2FamiliePerson`),
 * dieselbe Logik wie `orderInGeneration` — `positionAmongSiblings`, Du-Position, „Geschwister N“,
 * Geburtsdatum, Name. Keine zweite Quelle (z. B. Großfamilien-Karten-Sortierung).
 * @see docs/K2-FAMILIE-DATENMODELL.md
 */
function orderIdsByPersonenkarte(
  personen: K2FamiliePerson[],
  ids: string[],
  levelMap: Map<string, number>,
  childIds: Map<string, string[]>,
  ichBinPersonId: string | undefined,
  ichBinPositionAmongSiblings: number | undefined
): string[] {
  if (ids.length === 0) return []
  return orderInGeneration(personen, [...ids], levelMap, childIds, ichBinPersonId, ichBinPositionAmongSiblings)
}

/**
 * Unterste Generation: pro Kernfamilie (gleiche parentIds in der Grafik) Kinder fest unter Eltern-Mitte setzen,
 * dann nur bei Kollisionen mit der linken Nachbarfamilie die ganze Gruppe nach rechts schieben.
 * Nicht: globale Zeile verschieben + enforceNonOverlappingRow (schiebt nur rechts → Zentrierung zerstört).
 * @see docs/K2-FAMILIE-STAMMBAUM-KLEINFAMILIEN-MUSTER.md — Referenz „Kleinfamilie“, Skalierung vieler Zweige
 */
function placeBottomRowFromParentCenters(
  levelMap: Map<string, number>,
  maxLevel: number,
  personen: K2FamiliePerson[],
  byId: Map<string, K2FamiliePerson>,
  nodePos: Map<string, Point>,
  bottomIds: string[],
  childIdsMap: Map<string, string[]>,
  ichBinPersonId: string | undefined,
  ichBinPositionAmongSiblings: number | undefined
): void {
  const yBottom = yForGenerationLevel(maxLevel)
  const marginCenter = 40 + NODE_W / 2
  const step = NODE_W + COL_GAP

  const groups = new Map<string, string[]>()
  for (const id of bottomIds) {
    const p = byId.get(id)
    if (!p) continue
    const k = familyClusterKeyChildForBottomRow(p, byId, levelMap, maxLevel, bottomIds)
    if (!groups.has(k)) groups.set(k, [])
    groups.get(k)!.push(id)
  }

  type GEntry = { childIds: string[]; parentMidX: number }
  const groupEntries: GEntry[] = []
  for (const rawIds of groups.values()) {
    const sorted = orderIdsByPersonenkarte(
      personen,
      rawIds,
      levelMap,
      childIdsMap,
      ichBinPersonId,
      ichBinPositionAmongSiblings
    )
    if (sorted.length === 0) continue
    const unionParents = new Set<string>()
    for (const cid of sorted) {
      const ch = byId.get(cid)
      if (!ch) continue
      for (const pid of ch.parentIds ?? []) {
        if (byId.has(pid) && (levelMap.get(pid) ?? -1) === maxLevel - 1) unionParents.add(pid)
      }
    }
    if (unionParents.size === 0) continue
    const xs = [...unionParents]
      .map((pid) => nodePos.get(pid)?.x)
      .filter((x): x is number => x != null && !Number.isNaN(x))
    if (xs.length === 0) continue
    const parentMidX = xs.reduce((a, b) => a + b, 0) / xs.length
    groupEntries.push({ childIds: sorted, parentMidX })
  }

  groupEntries.sort((a, b) => a.parentMidX - b.parentMidX)

  let prevRight = -Infinity
  for (const { childIds, parentMidX } of groupEntries) {
    const n = childIds.length
    const centers = childIds.map((_, i) => parentMidX + (i - (n - 1) / 2) * step)
    let delta = 0
    if (prevRight === -Infinity) {
      if (centers[0] < marginCenter) delta = marginCenter - centers[0]
    } else {
      const minCenter = prevRight + BLOCK_GAP + NODE_W / 2
      if (centers[0] < minCenter) delta = minCenter - centers[0]
    }
    for (let i = 0; i < n; i++) {
      nodePos.set(childIds[i], { x: centers[i] + delta, y: yBottom })
    }
    const lastCenter = centers[n - 1] + delta
    prevRight = lastCenter + NODE_W / 2
  }
}

/**
 * Partner mit derselben Kindergruppe (z. B. zwei Eltern von C1+C2) = ein Block in der Eltern-Zeile.
 * Kinder von Partner in derselben Zeile mitzählen, damit das Paar nicht auseinanderfällt.
 * Ohne gemeinsame Kinder: Fallback über eigene Eltern-IDs in der Grafik.
 */
function familyClusterKeyParent(
  id: string,
  L: number,
  personen: K2FamiliePerson[],
  levelMap: Map<string, number>,
  byId: Map<string, K2FamiliePerson>,
  idsInRow: Set<string>
): string {
  const p = byId.get(id)
  const partnerIdsInRow = (p?.partners ?? []).filter((pr) => idsInRow.has(pr.personId)).map((pr) => pr.personId)
  const elternIds = new Set<string>([id, ...partnerIdsInRow])
  const kids = personen
    .filter(
      (c) =>
        (levelMap.get(c.id) ?? -1) === L + 1 &&
        byId.has(c.id) &&
        (c.parentIds ?? []).some((pid) => elternIds.has(pid))
    )
    .map((c) => c.id)
    .sort()
    .join('|')
  if (kids.length > 0) return `kids:${kids}`
  if (!p) return `solo:${id}`
  const par = (p.parentIds ?? []).filter((pid) => byId.has(pid))
  if (par.length === 0) return `solo:${id}`
  return `parents:${par.sort().join('|')}`
}

/** Eltern-IDs dieser Generation, die in Zeile L-1 liegen (für „gleiche Kernfamilie“). */
function parentKeyAtLevel(
  id: string,
  L: number,
  levelMap: Map<string, number>,
  byId: Map<string, K2FamiliePerson>
): string {
  const p = byId.get(id)
  if (!p) return ''
  return (p.parentIds ?? []).filter((pid) => (levelMap.get(pid) ?? -1) === L - 1).sort().join('|')
}

/** Ein Block (Geschwister ± Partner): genau ein Eltern-Schlüssel → z. B. Georg|Martina. */
function clusterRepresentativeParentKey(
  members: string[],
  L: number,
  levelMap: Map<string, number>,
  byId: Map<string, K2FamiliePerson>
): string | null {
  const keys = new Set<string>()
  for (const id of members) {
    const k = parentKeyAtLevel(id, L, levelMap, byId)
    if (k.length > 0) keys.add(k)
  }
  if (keys.size !== 1) return null
  return [...keys][0]
}

/** Kleinste effektive Geschwister-Position im Block (wie `orderInGeneration` / Partner-Übernahme). */
function siblingOrderRankForCluster(
  members: string[],
  idsInRow: string[],
  byId: Map<string, K2FamiliePerson>,
  childIds: Map<string, string[]>,
  ichBinPersonId: string | undefined,
  ichBinPositionAmongSiblings: number | undefined
): number {
  let min = 9999
  for (const id of members) {
    const pos = getEffectivePositionInRowForSort(id, idsInRow, byId, childIds, ichBinPersonId, ichBinPositionAmongSiblings)
    min = Math.min(min, pos)
  }
  return min
}

/** Eine Person pro Cluster zum Vergleich (niedrigste effektive Position; bei Gleichstand wie orderInGeneration). */
function representativeSiblingForCluster(
  members: string[],
  idsInRow: string[],
  byId: Map<string, K2FamiliePerson>,
  childIds: Map<string, string[]>,
  ichBinPersonId: string | undefined,
  ichBinPositionAmongSiblings: number | undefined
): K2FamiliePerson | undefined {
  const candidates: K2FamiliePerson[] = []
  let minPos = 9999
  for (const id of members) {
    const p = byId.get(id)
    if (!p) continue
    const pos = getEffectivePositionInRowForSort(id, idsInRow, byId, childIds, ichBinPersonId, ichBinPositionAmongSiblings)
    if (pos < minPos) {
      minPos = pos
      candidates.length = 0
      candidates.push(p)
    } else if (pos === minPos) {
      candidates.push(p)
    }
  }
  if (candidates.length === 0) return undefined
  if (candidates.length === 1) return candidates[0]
  candidates.sort((a, b) => {
    const pp = comparePartnerGeschwisterVorPartnerOhneKinder(a.id, b.id, byId, childIds)
    if (pp !== 0) return pp
    return compareNachGeschwisterlinieOderGeburt(
      a,
      b,
      ichBinPersonId,
      ichBinPositionAmongSiblings,
      idsInRow,
      byId,
      childIds
    )
  })
  return candidates[0]
}

/** Reihenfolge in einer Zeile: Familien-Cluster gruppieren, Reihenfolge aus Personenkarten (siehe `orderIdsByPersonenkarte`). */
function orderIdsByFamilieClusterInRow(
  personen: K2FamiliePerson[],
  ids: string[],
  levelMap: Map<string, number>,
  childIds: Map<string, string[]>,
  ichBinPersonId: string | undefined,
  ichBinPositionAmongSiblings: number | undefined,
  byId: Map<string, K2FamiliePerson>,
  maxLevel: number,
  L: number
): string[] {
  const baseOrder = orderIdsByPersonenkarte(
    personen,
    ids,
    levelMap,
    childIds,
    ichBinPersonId,
    ichBinPositionAmongSiblings
  )
  const idsInRow = new Set(ids)
  const keyOf = (id: string) => {
    const p = byId.get(id)
    if (!p) return `solo:${id}`
    return L === maxLevel
      ? familyClusterKeyChildForBottomRow(p, byId, levelMap, maxLevel, ids)
      : familyClusterKeyParent(id, L, personen, levelMap, byId, idsInRow)
  }
  const clusterKeys: string[] = []
  const seenK = new Set<string>()
  for (const id of baseOrder) {
    const k = keyOf(id)
    if (!seenK.has(k)) {
      seenK.add(k)
      clusterKeys.push(k)
    }
  }
  const byCluster = new Map<string, string[]>()
  for (const id of ids) {
    const k = keyOf(id)
    if (!byCluster.has(k)) byCluster.set(k, [])
    byCluster.get(k)!.push(id)
  }

  /** Mehrere Kernfamilien-Cluster (je anderes kids:…), aber dieselben Eltern in L-1: Reihenfolge 1…n nach positionAmongSiblings, nicht nur nach Stammbaum-Karten-Reihenfolge. */
  if (L < maxLevel && clusterKeys.length > 1) {
    const rpks = clusterKeys.map((k) =>
      clusterRepresentativeParentKey(byCluster.get(k) ?? [], L, levelMap, byId)
    )
    if (rpks.every((x) => x != null) && new Set(rpks).size === 1) {
      clusterKeys.sort((a, b) => {
        const ra = siblingOrderRankForCluster(
          byCluster.get(a) ?? [],
          ids,
          byId,
          childIds,
          ichBinPersonId,
          ichBinPositionAmongSiblings
        )
        const rb = siblingOrderRankForCluster(
          byCluster.get(b) ?? [],
          ids,
          byId,
          childIds,
          ichBinPersonId,
          ichBinPositionAmongSiblings
        )
        if (ra !== rb) return ra - rb
        const pa = representativeSiblingForCluster(
          byCluster.get(a) ?? [],
          ids,
          byId,
          childIds,
          ichBinPersonId,
          ichBinPositionAmongSiblings
        )
        const pb = representativeSiblingForCluster(
          byCluster.get(b) ?? [],
          ids,
          byId,
          childIds,
          ichBinPersonId,
          ichBinPositionAmongSiblings
        )
        if (pa && pb) {
          const c = compareNachGeschwisterlinieOderGeburt(
            pa,
            pb,
            ichBinPersonId,
            ichBinPositionAmongSiblings,
            ids,
            byId,
            childIds
          )
          if (c !== 0) return c
        }
        return a.localeCompare(b)
      })
    }
  }

  const out: string[] = []
  for (const k of clusterKeys) {
    const members = byCluster.get(k) ?? []
    /** Geschwisterblock: Reihenfolge 1…n = links nach rechts (`positionAmongSiblings` / Du-Position / „Geschwister N“). */
    /** Innerhalb eines Clusters: immer Personenkarten-Reihenfolge (Geschwister-Cluster und gemischte Blöcke gleiche Regel). */
    const sortedMembers = orderIdsByPersonenkarte(
      personen,
      members,
      levelMap,
      childIds,
      ichBinPersonId,
      ichBinPositionAmongSiblings
    )
    out.push(...sortedMembers)
  }
  return out
}

/**
 * Kinder unter den Eltern: unterste Generation zuerst waagrecht, darüber Eltern zentriert über ihren Kindern.
 * Kein gemeinsamer „Sammelbalken“ über alle Familien.
 */
function computeLayoutBaumUnterEltern(
  personen: K2FamiliePerson[],
  byId: Map<string, K2FamiliePerson>,
  levelMap: Map<string, number>,
  childIds: Map<string, string[]>,
  reorderedRows: string[][],
  ichBinPersonId: string | undefined,
  ichBinPositionAmongSiblings: number | undefined
): {
  levelMap: Map<string, number>
  rows: string[][]
  width: number
  height: number
  nodePos: Map<string, Point>
  connectors: ParentChildConnector[]
  partnerLinks: { a: Point; b: Point }[]
  initialPan: { x: number; y: number }
  contentCx: number
  contentCy: number
} {
  const maxLevel = Math.max(...Array.from(levelMap.values()))

  const arePartnersInRow = (rowIds: string[], i: number, j: number): boolean => {
    if (i < 0 || j < 0 || i >= rowIds.length || j >= rowIds.length) return false
    const a = byId.get(rowIds[i])
    const b = byId.get(rowIds[j])
    if (!a || !b) return false
    if (sindGeschwisterLautKarten(a, b)) return false
    return Boolean(a.partners.some((pr) => pr.personId === rowIds[j]) || b.partners.some((pr) => pr.personId === rowIds[i]))
  }

  const shareSameParent = (idA: string, idB: string): boolean => {
    const a = byId.get(idA)
    const b = byId.get(idB)
    if (!a || !b) return false
    if (a.parentIds.length === 0 || b.parentIds.length === 0) return false
    const sa = new Set(a.parentIds)
    return b.parentIds.some((pid) => sa.has(pid))
  }

  const needsBlockGapBetween = (i: number, rowIds: string[]): boolean => {
    if (i <= 0) return false
    if (arePartnersInRow(rowIds, i - 1, i)) return false
    if (shareSameParent(rowIds[i - 1], rowIds[i])) return false
    return true
  }

  const nodePos = new Map<string, Point>()
  const rawBottom = reorderedRows[maxLevel] ?? []
  const bottomIds = orderIdsByFamilieClusterInRow(
    personen,
    rawBottom,
    levelMap,
    childIds,
    ichBinPersonId,
    ichBinPositionAmongSiblings,
    byId,
    maxLevel,
    maxLevel
  )

  let currentX = 40 + NODE_W / 2
  bottomIds.forEach((id, i) => {
    if (needsBlockGapBetween(i, bottomIds)) currentX += BLOCK_GAP
    nodePos.set(id, { x: currentX, y: yForGenerationLevel(maxLevel) })
    currentX += NODE_W + COL_GAP
  })

  const partnerDoneSpread = new Set<string>()
  const spreadPartnersAtLevel = (L: number) => {
    const minGap = NODE_W + COL_GAP
    personen.forEach((p) => {
      if (levelMap.get(p.id) !== L) return
      p.partners.forEach((pr) => {
        const pid = pr.personId
        if (levelMap.get(pid) !== L) return
        const q = byId.get(pid)
        if (!q || sindGeschwisterLautKarten(p, q)) return
        const key = [p.id, pid].sort().join('-')
        if (partnerDoneSpread.has(key)) return
        partnerDoneSpread.add(key)
        const posA = nodePos.get(p.id)
        const posB = nodePos.get(pid)
        if (!posA || !posB) return
        if (Math.abs(posA.x - posB.x) >= minGap - 0.5) return
        const cx = (posA.x + posB.x) / 2
        const yPair = (posA.y + posB.y) / 2
        nodePos.set(p.id, { x: cx - minGap / 2, y: yPair })
        nodePos.set(pid, { x: cx + minGap / 2, y: yPair })
      })
    })
  }

  spreadPartnersAtLevel(maxLevel)
  enforceNonOverlappingRow(bottomIds, nodePos, yForGenerationLevel(maxLevel), needsBlockGapBetween)

  const layoutParentLevel = (L: number) => {
    const rawRow = reorderedRows[L] ?? []
    const rowIds = orderIdsByFamilieClusterInRow(
      personen,
      rawRow,
      levelMap,
      childIds,
      ichBinPersonId,
      ichBinPositionAmongSiblings,
      byId,
      maxLevel,
      L
    )
    const yL = yForGenerationLevel(L)
    const idsInRow = new Set(rowIds)
    const cxPartial = new Map<string, number | undefined>()
    for (const id of rowIds) {
      const eltern = byId.get(id)
      const partnerIdsInRow = (eltern?.partners ?? []).filter((pr) => idsInRow.has(pr.personId)).map((pr) => pr.personId)
      const elternIds = new Set<string>([id, ...partnerIdsInRow])
      const kids = personen.filter(
        (c) =>
          (levelMap.get(c.id) ?? -1) === L + 1 &&
          byId.has(c.id) &&
          (c.parentIds ?? []).some((pid) => elternIds.has(pid))
      )
      if (kids.length === 0) {
        cxPartial.set(id, undefined)
        continue
      }
      let sum = 0
      let n = 0
      for (const c of kids) {
        const pos = nodePos.get(c.id)
        if (pos) {
          sum += pos.x
          n++
        }
      }
      cxPartial.set(id, n > 0 ? sum / n : undefined)
    }
    const sortedRowIds = sortRowIdsByDesiredCx(rowIds, cxPartial, byId)
    const placed = placeRowUnderChildrenNoOverlap(sortedRowIds, cxPartial, needsBlockGapBetween, yL)
    placed.forEach((pt, id) => {
      nodePos.set(id, pt)
    })
    spreadPartnersAtLevel(L)
    enforceNonOverlappingRow(sortedRowIds, nodePos, yL, needsBlockGapBetween)
  }

  for (let L = maxLevel - 1; L >= 0; L--) {
    layoutParentLevel(L)
  }

  partnerDoneSpread.clear()
  for (let L = maxLevel - 1; L >= 0; L--) {
    layoutParentLevel(L)
  }

  placeBottomRowFromParentCenters(
    levelMap,
    maxLevel,
    personen,
    byId,
    nodePos,
    bottomIds,
    childIds,
    ichBinPersonId,
    ichBinPositionAmongSiblings
  )

  partnerDoneSpread.clear()
  for (let L = maxLevel - 1; L >= 0; L--) {
    layoutParentLevel(L)
  }

  let minEdge = Infinity
  let maxEdge = -Infinity
  nodePos.forEach((pos) => {
    minEdge = Math.min(minEdge, pos.x - NODE_W / 2)
    maxEdge = Math.max(maxEdge, pos.x + NODE_W / 2)
  })
  if (!Number.isFinite(minEdge)) {
    minEdge = 0
    maxEdge = 320
  }
  const width = Math.max(320, maxEdge - minEdge + 80)
  const shiftX = width / 2 - (minEdge + maxEdge) / 2
  nodePos.forEach((pos, id) => {
    nodePos.set(id, { x: pos.x + shiftX, y: pos.y })
  })

  const connectors: ParentChildConnector[] = []
  const userParentIds = ichBinPersonId ? (byId.get(ichBinPersonId)?.parentIds ?? []) : []
  const userSiblingIds = new Set(
    ichBinPersonId
      ? personen.filter((p) => p.id !== ichBinPersonId && p.parentIds.some((pid) => userParentIds.includes(pid))).map((p) => p.id)
      : []
  )
  const userChildrenIds = new Set(
    ichBinPersonId ? [...(byId.get(ichBinPersonId)?.childIds ?? []), ...(childIds.get(ichBinPersonId) ?? [])] : []
  )

  /** Wie Zeilen-Layout: je Kernfamilie (Eltern-Key am Kind) eigene Brücken-Y – sonst alle waagrechten Segmente auf einer Linie = ein Sammelbalken. */
  const STRIPE_GAP = 5
  const familyKeysSorted = Array.from(
    new Set(
      personen
        .filter((p) => p.parentIds.length > 0)
        .map((p) => [...p.parentIds].filter((pid) => byId.has(pid)).sort().join('|'))
        .filter((k) => k.length > 0)
    )
  ).sort()
  const nFamilyStripes = familyKeysSorted.length
  const familyStripeIndex = new Map<string, number>()
  familyKeysSorted.forEach((k, i) => familyStripeIndex.set(k, i))
  const bridgeYOffsetForChild = (childId: string): number => {
    if (nFamilyStripes <= 1) return 0
    const child = byId.get(childId)
    if (!child || child.parentIds.length === 0) return 0
    const k = [...child.parentIds].filter((pid) => byId.has(pid)).sort().join('|')
    const stripe = familyStripeIndex.get(k)
    if (stripe === undefined) return 0
    return (stripe - (nFamilyStripes - 1) / 2) * STRIPE_GAP
  }

  personen.forEach((p) => {
    const parentPos = nodePos.get(p.id)
    if (!parentPos) return
    const fromCard = p.childIds ?? []
    const fromChildren = childIds.get(p.id) ?? []
    const kids = Array.from(new Set([...fromCard, ...fromChildren]))
    kids.forEach((childId) => {
      if (userSiblingIds.has(p.id) && userChildrenIds.has(childId)) return
      if (userChildrenIds.has(p.id) && userSiblingIds.has(childId)) return
      const childPos = nodePos.get(childId)
      if (!childPos) return
      const child = byId.get(childId)
      if (!child) return
      if (!child.parentIds.includes(p.id)) return
      const parentLevel = levelMap.get(p.id) ?? 0
      const childLevel = levelMap.get(childId) ?? 0
      if (parentLevel >= childLevel) return
      const viaY = (parentPos.y + childPos.y) / 2 + bridgeYOffsetForChild(childId)
      connectors.push({ from: parentPos, to: childPos, viaY, childId })
    })
  })

  const partnerLinks: { a: Point; b: Point }[] = []
  const partnerDone = new Set<string>()
  personen.forEach((p) => {
    p.partners.forEach((pr) => {
      const key = [p.id, pr.personId].sort().join('-')
      if (partnerDone.has(key)) return
      partnerDone.add(key)
      const q = byId.get(pr.personId)
      if (q && sindGeschwisterLautKarten(p, q)) return
      const posA = nodePos.get(p.id)
      const posB = nodePos.get(pr.personId)
      if (posA && posB) partnerLinks.push({ a: posA, b: posB })
    })
  })

  const EXTRA_BELOW = 14
  const height = yForGenerationLevel(maxLevel) + NODE_H / 2 + 40
  let minX = width
  let maxX = 0
  let minY = Infinity
  let maxY = 0
  nodePos.forEach((pos) => {
    minX = Math.min(minX, pos.x - NODE_W / 2)
    maxX = Math.max(maxX, pos.x + NODE_W / 2)
    minY = Math.min(minY, pos.y - NODE_H / 2)
    maxY = Math.max(maxY, pos.y + NODE_H / 2 + EXTRA_BELOW)
  })
  const contentCx = nodePos.size > 0 ? (minX + maxX) / 2 : width / 2
  const contentCy = nodePos.size > 0 ? (minY + maxY) / 2 : height / 2
  const initialPan = { x: width / 2 - contentCx, y: height / 2 - contentCy }

  return {
    levelMap,
    rows: reorderedRows,
    width,
    height,
    nodePos,
    connectors: mergeConnectorsAvoidDoubleHorizontal(connectors),
    partnerLinks,
    initialPan,
    contentCx,
    contentCy,
  }
}

/** Baum = Kinder unter den Eltern (klar). Zeilen = Blöcke/Umbruch wie bisher. */
export type FamilyTreeLayout = 'baum' | 'zeilen'

export type TreeOrientation = 'vertical' | 'horizontal'

function swapPoint(p: Point): Point {
  return { x: p.y, y: p.x }
}

export default function FamilyTreeGraph({
  personen,
  personPathPrefix = PERSON_LINK_PATH,
  noPhotos = false,
  printMode = false,
  scale = 1,
  layout = 'baum',
  orientation = 'vertical',
  partnerHerkunftPersonId,
  ichBinPersonId,
  onSetIchBin,
  ichBinPositionAmongSiblings,
  /** Wenn gesetzt und Person in `personen`: Generationen abwärts von Du+Partner (Ebene 0), z. B. „Nur mein Familienzweig“ ohne Eltern in der Liste. */
  familienzweigWurzelPersonId,
}: {
  personen: K2FamiliePerson[]
  personPathPrefix?: string
  /** Für Druck: nur Namen, keine Fotos (spart Tinte, schlank) */
  noPhotos?: boolean
  /** Druckansicht: keine Klick-Links, druckfreundliche Farben */
  printMode?: boolean
  /** Skalierung (z. B. 1.2 für Poster) */
  scale?: number
  /** Baum = Kinder unter den Eltern (Standard). Zeilen = Blöcke/Umbruch wie früher. */
  layout?: FamilyTreeLayout
  /** Vertikal = Wurzeln oben, horizontal = Wurzeln links */
  orientation?: TreeOrientation
  /** Optional: Person, deren Herkunft als zweiter Zweig gleichrangig gilt (Anzeige/Logik später erweiterbar) */
  partnerHerkunftPersonId?: string
  /** Optional: „Ich bin diese Person“ – im Stammbaum als „Du“ hervorgehoben */
  ichBinPersonId?: string
  /** Optional: Klick auf „Das bin ich“ setzt diese Person als Du (nur wenn nicht printMode) */
  onSetIchBin?: (personId: string) => void
  /** Optional: Position von Du unter den Geschwister (1…N) für Sortierung der Reihe */
  ichBinPositionAmongSiblings?: number
  familienzweigWurzelPersonId?: string
}) {
  const { levelMap, rows, width, height, nodePos, connectors, partnerLinks, initialPan, contentCx, contentCy } = useMemo(() => {
    if (personen.length === 0) {
      return { levelMap: new Map<string, number>(), rows: [] as string[][], width: 400, height: 120, nodePos: new Map<string, Point>(), connectors: [] as ParentChildConnector[], partnerLinks: [] as { a: Point; b: Point }[], initialPan: { x: 0, y: 0 }, contentCx: 200, contentCy: 60 }
    }

    const byId = new Map(personen.map((p) => [p.id, p]))
    const levelMap =
      familienzweigWurzelPersonId && byId.has(familienzweigWurzelPersonId)
        ? getGenerationsFamilienzweigAbwaertsWurzel(personen, familienzweigWurzelPersonId)
        : getGenerations(personen)
    const childIds = getChildIds(personen)

    const rowsPerLevel: string[][] = []
    const maxLevel = Math.max(...Array.from(levelMap.values()))
    for (let L = 0; L <= maxLevel; L++) {
      const ids = personen.filter((p) => levelMap.get(p.id) === L).map((p) => p.id)
      const rowOrdered =
        layout === 'baum'
          ? orderIdsByFamilieClusterInRow(
              personen,
              ids,
              levelMap,
              childIds,
              ichBinPersonId,
              ichBinPositionAmongSiblings,
              byId,
              maxLevel,
              L
            )
          : orderInGeneration(personen, ids, levelMap, childIds, ichBinPersonId, ichBinPositionAmongSiblings)
      rowsPerLevel.push(rowOrdered)
    }

    // Baum: Reihenfolge = wie Großfamilie (Zweige); kein Pivot/Partner-Umbau (der hat Zeilen zerschossen).
    // Zeilen-Layout: Pivot (2+ Partner in einer Zeile) und Du-zuerst wie bisher.
    const reorderedRows =
      layout === 'baum'
        ? rowsPerLevel
        : rowsPerLevel.map((rowIds) => {
      const seen = new Set<string>()
      const out: string[] = []
      const hasChildren = (id: string) => (childIds.get(id)?.length ?? 0) > 0
      // Pivot: wer in dieser Zeile 2+ Partner hat (z. B. Vater zwischen zwei Frauen), kommt zuerst → oben, Frauen versetzt
      let pivot: string | null = null
      for (const id of rowIds) {
        const p = byId.get(id)
        const partnersInRow = p?.partners.filter((pr) => rowIds.includes(pr.personId)).length ?? 0
        if (partnersInRow >= 2) {
          pivot = id
          break
        }
      }
      if (pivot != null) {
        const pivotPerson = byId.get(pivot)
        // Anna links, Mathilde rechts (von dir aus gesehen): Partner nach Kinderzahl aufsteigend (weniger Kinder = links)
        const pivotPartnersInOrder = (pivotPerson?.partners.filter((pr) => rowIds.includes(pr.personId)).map((pr) => pr.personId) ?? [])
          .sort((a, b) => (childIds.get(a)?.length ?? 0) - (childIds.get(b)?.length ?? 0))
        if (pivotPartnersInOrder.length >= 1) {
          out.push(pivotPartnersInOrder[0])
          seen.add(pivotPartnersInOrder[0])
        }
        out.push(pivot)
        seen.add(pivot)
        pivotPartnersInOrder.slice(1).forEach((id) => {
          if (!seen.has(id)) {
            out.push(id)
            seen.add(id)
          }
        })
        rowIds.forEach((id) => {
          if (!seen.has(id)) {
            out.push(id)
            seen.add(id)
          }
        })
        return out
      }
      // Kein Pivot: Du zuerst, dann Partner; Fallback: Person mit Kindern vor Partner ohne Kinder
      for (const id of rowIds) {
        if (seen.has(id)) continue
        const p = byId.get(id)
        const partnerOfDu = ichBinPersonId && p?.partners.some((pr) => pr.personId === ichBinPersonId)
        const partnerQ = p?.partners.find((pr) => rowIds.includes(pr.personId))?.personId
        const qHasChildren = partnerQ != null && hasChildren(partnerQ)
        const idHasChildren = hasChildren(id)
        const putQFirst = partnerQ != null && !seen.has(partnerQ) && (partnerOfDu || (qHasChildren && !idHasChildren))
        if (putQFirst) {
          const q = partnerOfDu ? ichBinPersonId! : partnerQ!
          out.push(q)
          seen.add(q)
          const qPerson = byId.get(q)
          if (qPerson?.partners.length) {
            for (const pr of qPerson.partners) {
              if (rowIds.includes(pr.personId) && !seen.has(pr.personId)) {
                out.push(pr.personId)
                seen.add(pr.personId)
              }
            }
          }
          continue
        }
        out.push(id)
        seen.add(id)
        if (p?.partners.length) {
          for (const pr of p.partners) {
            if (rowIds.includes(pr.personId) && !seen.has(pr.personId)) {
              out.push(pr.personId)
              seen.add(pr.personId)
            }
          }
        }
      }
      return out
    })

    if (layout === 'baum') {
      return computeLayoutBaumUnterEltern(
        personen,
        byId,
        levelMap,
        childIds,
        reorderedRows,
        ichBinPersonId,
        ichBinPositionAmongSiblings
      )
    }

    /** Zwei Personen in der Zeile sind Partner (nur aus Karten: partners-Array), nicht Geschwister. */
    const arePartnersInRow = (rowIds: string[], i: number, j: number): boolean => {
      if (i < 0 || j < 0 || i >= rowIds.length || j >= rowIds.length) return false
      const a = byId.get(rowIds[i])
      const b = byId.get(rowIds[j])
      if (!a || !b) return false
      if (sindGeschwisterLautKarten(a, b)) return false
      return Boolean(a.partners.some((pr) => pr.personId === rowIds[j]) || b.partners.some((pr) => pr.personId === rowIds[i]))
    }

    /** Mindestens ein gemeinsames Elternteil (echte Geschwister in derselben Generation). */
    const shareSameParent = (idA: string, idB: string): boolean => {
      const a = byId.get(idA)
      const b = byId.get(idB)
      if (!a || !b) return false
      if (a.parentIds.length === 0 || b.parentIds.length === 0) return false
      const sa = new Set(a.parentIds)
      return b.parentIds.some((pid) => sa.has(pid))
    }

    /** Zwischen zwei nebeneinander stehenden Karten: großer Block-Abstand nur zwischen **getrennten** Familien, nicht zwischen Geschwistern. */
    const needsBlockGapBetween = (i: number, rowIds: string[]): boolean => {
      if (i <= 0) return false
      if (arePartnersInRow(rowIds, i - 1, i)) return false
      if (shareSameParent(rowIds[i - 1], rowIds[i])) return false
      return true
    }

    /**
     * Eine Generationszeile nur **umbrechen**, wenn sie sehr lang ist (Lesbarkeit).
     * Früher: nach „fremden“ Nachbarn (Cousins) getrennt → viele **einzelne** Unterzeilen,
     * alle zentriert → optisch **eine vertikale Säule** statt waagrechter Äste.
     * Eine Generation = ein durchgehendes waagrechtes Band (ggf. 2+ Zeilen bei > MAX).
     */
    const splitIntoChunks = (rowIds: string[]): string[][] => {
      if (rowIds.length <= MAX_PERSONEN_PRO_GENERATIONSZEILE) return [rowIds]
      const chunks: string[][] = []
      for (let i = 0; i < rowIds.length; i += MAX_PERSONEN_PRO_GENERATIONSZEILE) {
        chunks.push(rowIds.slice(i, i + MAX_PERSONEN_PRO_GENERATIONSZEILE))
      }
      return chunks
    }

    const rows: string[][] = []
    const rowLevels: number[] = []
    reorderedRows.forEach((r, levelIndex) => {
      const chunks = splitIntoChunks(r)
      chunks.forEach(() => rowLevels.push(levelIndex))
      chunks.forEach((chunk) => rows.push(chunk))
    })

    const nodePos = new Map<string, Point>()
    let totalW = 0
    rows.forEach((rowIds) => {
      let rowW = 0
      for (let i = 0; i < rowIds.length; i++) {
        if (needsBlockGapBetween(i, rowIds)) rowW += BLOCK_GAP
        rowW += NODE_W + COL_GAP
      }
      rowW -= COL_GAP
      if (rowW > totalW) totalW = rowW
    })
    const width = Math.max(320, totalW + 80)

    let currentY = 24
    const rowHeights: number[] = []
    for (let i = 0; i < rows.length; i++) {
      rowHeights.push(i > 0 && rowLevels[i] === rowLevels[i - 1] ? SUB_ROW_H : ROW_H)
      currentY += rowHeights[i]
    }
    const height = currentY + 40

    // Eine waagrechte Generationslinie wie bei klassischen Stammtafeln: alle Karten einer Zeile gleiche Y,
    // Partner nebeneinander (gestrichelte Verbindung) – kein Versatz „Zweiter unter dem Ersten“ (sonst Säulen-Look).
    currentY = 24
    rows.forEach((rowIds, rowIndex) => {
      const rowH = rowHeights[rowIndex]
      const baseY = currentY + rowH / 2
      currentY += rowH
      let rowW = 0
      for (let i = 0; i < rowIds.length; i++) {
        if (needsBlockGapBetween(i, rowIds)) rowW += BLOCK_GAP
        rowW += NODE_W + COL_GAP
      }
      rowW -= COL_GAP
      let currentX = (width - rowW) / 2 + (NODE_W + COL_GAP) / 2
      rowIds.forEach((id, i) => {
        if (needsBlockGapBetween(i, rowIds)) currentX += BLOCK_GAP
        nodePos.set(id, { x: currentX, y: baseY })
        currentX += NODE_W + COL_GAP
      })
    })

    const connectors: ParentChildConnector[] = []
    const partnerLinks: { a: Point; b: Point }[] = []

    /** Pro Kernfamilie (gleiche Eltern-IDs am Kind) eine eigene Brücken-Höhe – sonst liegen alle
     *  waagrechten Segmente exakt auf derselben Y (gleiche Elternzeile + gleiche Kinderzeile) und
     *  wirken wie ein Sammelbalken über alle Geschwisterfamilien hinweg. */
    const STRIPE_GAP = 5
    const familyKeysSorted = Array.from(
      new Set(
        personen
          .filter((p) => p.parentIds.length > 0)
          .map((p) => [...p.parentIds].filter((pid) => byId.has(pid)).sort().join('|'))
          .filter((k) => k.length > 0)
      )
    ).sort()
    const nFamilyStripes = familyKeysSorted.length
    const familyStripeIndex = new Map<string, number>()
    familyKeysSorted.forEach((k, i) => familyStripeIndex.set(k, i))
    const bridgeYOffsetForChild = (childId: string): number => {
      if (nFamilyStripes <= 1) return 0
      const child = byId.get(childId)
      if (!child || child.parentIds.length === 0) return 0
      const k = [...child.parentIds].filter((pid) => byId.has(pid)).sort().join('|')
      const stripe = familyStripeIndex.get(k)
      if (stripe === undefined) return 0
      return (stripe - (nFamilyStripes - 1) / 2) * STRIPE_GAP
    }

    // Nur verbieten: Linien zwischen „meine Kinder“ und „meine Geschwister“ (von unten zu Geschwistern)
    const userParentIds = ichBinPersonId ? (byId.get(ichBinPersonId)?.parentIds ?? []) : []
    const userSiblingIds = new Set(
      ichBinPersonId ? personen.filter((p) => p.id !== ichBinPersonId && p.parentIds.some((pid) => userParentIds.includes(pid))).map((p) => p.id) : []
    )
    const userChildrenIds = new Set(
      ichBinPersonId ? [...(byId.get(ichBinPersonId)?.childIds ?? []), ...(childIds.get(ichBinPersonId) ?? [])] : []
    )

    // Von jedem Elternteil zu jedem seiner Kindern (viaY je Kante, kein gemeinsamer Balken pro Elternzeile)
    personen.forEach((p) => {
      const parentPos = nodePos.get(p.id)
      if (!parentPos) return
      const fromCard = p.childIds ?? []
      const fromChildren = childIds.get(p.id) ?? []
      const kids = Array.from(new Set([...fromCard, ...fromChildren]))
      kids.forEach((childId) => {
        if (userSiblingIds.has(p.id) && userChildrenIds.has(childId)) return
        if (userChildrenIds.has(p.id) && userSiblingIds.has(childId)) return
        const childPos = nodePos.get(childId)
        if (!childPos) return
        const child = byId.get(childId)
        if (!child) return
        if (!child.parentIds.includes(p.id)) return
        const parentLevel = levelMap.get(p.id) ?? 0
        const childLevel = levelMap.get(childId) ?? 0
        if (parentLevel >= childLevel) return
        const viaY = (parentPos.y + childPos.y) / 2 + bridgeYOffsetForChild(childId)
        connectors.push({ from: parentPos, to: childPos, viaY, childId })
      })
    })

    const partnerDone = new Set<string>()
    personen.forEach((p) => {
      p.partners.forEach((pr) => {
        const key = [p.id, pr.personId].sort().join('-')
        if (partnerDone.has(key)) return
        partnerDone.add(key)
        const q = byId.get(pr.personId)
        if (q && sindGeschwisterLautKarten(p, q)) return
        const posA = nodePos.get(p.id)
        const posB = nodePos.get(pr.personId)
        // Linie zeichnen wenn beide Position haben (Partner von Du wurden ggf. in Du-Reihe verschoben)
        if (posA && posB) partnerLinks.push({ a: posA, b: posB })
      })
    })

    // Mittelpunkt des Inhalts (alle Knoten inkl. Platz für „Du“-Text) für Start-Zentrierung
    const EXTRA_BELOW = 14
    let minX = width
    let maxX = 0
    let minY = height
    let maxY = 0
    nodePos.forEach((pos) => {
      minX = Math.min(minX, pos.x - NODE_W / 2)
      maxX = Math.max(maxX, pos.x + NODE_W / 2)
      minY = Math.min(minY, pos.y - NODE_H / 2)
      maxY = Math.max(maxY, pos.y + NODE_H / 2 + EXTRA_BELOW)
    })
    const contentCx = nodePos.size > 0 ? (minX + maxX) / 2 : width / 2
    const contentCy = nodePos.size > 0 ? (minY + maxY) / 2 : height / 2
    const initialPan = { x: width / 2 - contentCx, y: height / 2 - contentCy }

    return {
      levelMap,
      rows,
      width,
      height,
      nodePos,
      connectors: mergeConnectorsAvoidDoubleHorizontal(connectors),
      partnerLinks,
      initialPan,
      contentCx,
      contentCy,
    }
  }, [personen, ichBinPersonId, ichBinPositionAmongSiblings, familienzweigWurzelPersonId, layout])

  const isHorizontal = orientation === 'horizontal'
  const displayWidth = isHorizontal ? height : width
  const displayHeight = isHorizontal ? width : height
  const displayNodePos = useMemo(() => {
    if (!isHorizontal) return nodePos
    const m = new Map<string, Point>()
    nodePos.forEach((p, id) => m.set(id, swapPoint(p)))
    return m
  }, [nodePos, isHorizontal])
  const displayConnectors = useMemo(() => {
    if (!isHorizontal) {
      return connectors.map((c) => ({
        from: c.from,
        to: c.to,
        viaY: c.viaY,
        viaX: undefined as number | undefined,
      }))
    }
    return connectors.map((c) => ({
      from: swapPoint(c.from),
      to: swapPoint(c.to),
      viaY: undefined as number | undefined,
      viaX: c.viaY,
    }))
  }, [connectors, isHorizontal])
  const displayPartnerLinks = useMemo(() => {
    if (!isHorizontal) return partnerLinks
    return partnerLinks.map(({ a, b }) => ({ a: swapPoint(a), b: swapPoint(b) }))
  }, [partnerLinks, isHorizontal])
  const displayInitialPan = isHorizontal ? { x: height / 2 - contentCy, y: width / 2 - contentCx } : initialPan

  const [pan, setPan] = useState(displayInitialPan)
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef({ startX: 0, startY: 0, startPanX: 0, startPanY: 0 })
  const svgRef = useRef<SVGSVGElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Bei Layout-/Datenänderung: Grafik wieder zentrieren und Scroll auf 0 (sichtbarer Ausschnitt = Zentrum)
  useEffect(() => {
    setPan(displayInitialPan)
    const wrapper = wrapperRef.current
    if (wrapper) {
      wrapper.scrollTop = 0
      wrapper.scrollLeft = 0
    }
  }, [displayInitialPan.x, displayInitialPan.y])

  const handlePanMove = useCallback(
    (e: MouseEvent) => {
      const svg = svgRef.current
      if (!svg || !dragRef.current) return
      const rect = svg.getBoundingClientRect()
      const scaleX = rect.width / displayWidth
      const scaleY = rect.height / displayHeight
      setPan({
        x: dragRef.current.startPanX + (e.clientX - dragRef.current.startX) / scaleX,
        y: dragRef.current.startPanY + (e.clientY - dragRef.current.startY) / scaleY,
      })
    },
    [displayWidth, displayHeight]
  )
  const handlePanEnd = useCallback(() => {
    setIsDragging(false)
    window.removeEventListener('mousemove', handlePanMove)
    window.removeEventListener('mouseup', handlePanEnd)
  }, [handlePanMove])

  const onWrapperMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (printMode || personen.length === 0) return
      if ((e.target as Element).closest('a') || (e.target as Element).closest('button')) return
      e.preventDefault()
      dragRef.current = { startX: e.clientX, startY: e.clientY, startPanX: pan.x, startPanY: pan.y }
      setIsDragging(true)
      window.addEventListener('mousemove', handlePanMove)
      window.addEventListener('mouseup', handlePanEnd)
    },
    [printMode, personen.length, pan, handlePanMove, handlePanEnd]
  )

  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handlePanMove)
      window.removeEventListener('mouseup', handlePanEnd)
    }
  }, [handlePanMove, handlePanEnd])

  if (personen.length === 0) return null

  const stroke = printMode ? '#0d9488' : 'rgba(20, 184, 166, 0.5)'
  const strokePartner = printMode ? '#0d9488' : 'rgba(20, 184, 166, 0.7)'
  const nodeFill = printMode ? '#f8fafc' : 'rgba(15, 20, 25, 0.9)'
  const nodeStroke = printMode ? '#0d9488' : 'rgba(20, 184, 166, 0.5)'
  const textFill = printMode ? '#1e293b' : 'rgba(255,255,255,0.95)'

  const panTransform = !printMode ? `translate(${pan.x}, ${pan.y})` : undefined

  return (
    <div
      ref={wrapperRef}
      className={`family-tree-graph-wrapper ${printMode ? 'family-tree-graph-print' : ''}`}
      style={{
        width: '100%',
        overflow: 'auto',
        marginBottom: printMode ? 0 : '1.5rem',
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top center',
        cursor: !printMode && personen.length > 0 ? (isDragging ? 'grabbing' : 'grab') : undefined,
      }}
      onMouseDown={onWrapperMouseDown}
    >
      <svg
        ref={svgRef}
        className="family-tree-graph"
        viewBox={`0 0 ${displayWidth} ${displayHeight}`}
        preserveAspectRatio="xMidYMid meet"
        style={{
          width: '100%',
          minHeight: printMode ? 400 : 280,
          maxHeight: printMode ? 'none' : 520,
          ...(isHorizontal ? { minWidth: 320 } : {}),
        }}
      >
        <defs>
          <filter id="tree-node-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.25" />
          </filter>
          <clipPath id="tree-node-clip">
            <ellipse cx={NODE_W / 2} cy={NODE_H / 2 - 4} rx={NODE_W / 2 - 2} ry={NODE_H / 2 - 8} />
          </clipPath>
        </defs>

        <g transform={panTransform}>
        {/* Linien: Partner */}
        <g stroke={strokePartner} strokeWidth="2" fill="none">
          {displayPartnerLinks.map(({ a, b }, i) => (
            <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} strokeDasharray="4 4" />
          ))}
        </g>

        {/* Linien: Eltern → Kinder (zwei Eltern → ein Kind: eine gemeinsame T-Form, kein Doppelstrich) */}
        <g stroke={stroke} strokeWidth="1.5" fill="none">
          {connectors.map((c, i) => {
            const dc = displayConnectors[i]
            const { from, to } = dc
            let d: string
            if (c.mergedParents && c.mergedParents.length > 1 && c.viaY != null) {
              d = isHorizontal
                ? buildMergedHorizontalPathFromVertical(c.mergedParents, c.to, c.viaY)
                : buildMergedVerticalPath(c.mergedParents, c.to, c.viaY)
            } else if (dc.viaY != null) {
              d = `M ${from.x} ${from.y} L ${from.x} ${dc.viaY} L ${to.x} ${dc.viaY} L ${to.x} ${to.y}`
            } else if (dc.viaX != null) {
              d = `M ${from.x} ${from.y} L ${dc.viaX} ${from.y} L ${dc.viaX} ${to.y} L ${to.x} ${to.y}`
            } else {
              d = `M ${from.x} ${from.y} L ${from.x} ${(from.y + to.y) / 2} L ${to.x} ${(from.y + to.y) / 2} L ${to.x} ${to.y}`
            }
            return <path key={i} d={d} />
          })}
        </g>

        {/* Knoten (Personen) */}
        {personen.map((p) => {
          const pos = displayNodePos.get(p.id)
          if (!pos) return null
          const to = `${personPathPrefix}/${p.id}`
          const fotoAktuell = getAktuellesPersonenFoto(p)
          const showPhoto = !noPhotos && fotoAktuell
          const initial = p.name.trim().charAt(0).toUpperCase() || '?'
          const isIch = ichBinPersonId === p.id
          const stammbaumLinks = personStammbaumExternalLinks(p)
          const stammbaumLinkBarW = Math.min(62, stammbaumLinks.length * 15 + 2)
          const nodeContent = (
            <>
              <g filter={printMode ? undefined : 'url(#tree-node-shadow)'}>
                <ellipse
                  cx={NODE_W / 2}
                  cy={NODE_H / 2 - 4}
                  rx={NODE_W / 2 - 2}
                  ry={NODE_H / 2 - 8}
                  fill={isIch && !printMode ? 'rgba(20,184,166,0.25)' : nodeFill}
                  stroke={isIch && !printMode ? '#14b8a6' : nodeStroke}
                  strokeWidth={isIch && !printMode ? 3 : 2}
                />
                {showPhoto && (
                  <image
                    href={fotoAktuell}
                    x={2}
                    y={2}
                    width={NODE_W - 4}
                    height={NODE_H - 16}
                    preserveAspectRatio="xMidYMid slice"
                    clipPath="url(#tree-node-clip)"
                  />
                )}
                {!showPhoto && (
                  <text
                    x={NODE_W / 2}
                    y={NODE_H / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={printMode ? '#64748b' : 'rgba(255,255,255,0.9)'}
                    fontSize="18"
                  >
                    {printMode ? initial : '👤'}
                  </text>
                )}
              </g>
              <text
                x={NODE_W / 2}
                y={NODE_H - 2}
                textAnchor="middle"
                fill={textFill}
                fontSize="10"
                fontWeight="600"
              >
                {p.name.length <= 14 ? p.name : p.name.slice(0, 11) + '…'}
              </text>
            </>
          )
          return (
            <g key={p.id} transform={`translate(${pos.x - NODE_W / 2}, ${pos.y - NODE_H / 2})`}>
              {printMode ? (
                <g>
                  {nodeContent}
                  {stammbaumLinks.length > 0 && (
                    <text x={NODE_W - 4} y={11} textAnchor="end" fill="#0d9488" fontSize="9" fontWeight="700">
                      🔗
                    </text>
                  )}
                  {isIch && (
                    <text x={NODE_W / 2} y={NODE_H + 10} textAnchor="middle" fill="#0d9488" fontSize="9" fontWeight="700">Du</text>
                  )}
                </g>
              ) : (
                <>
                  {/* Link nur um Knoten-Inhalt (nicht block), damit „Das bin ich“ darunter klickbar bleibt */}
                  <Link to={to} style={{ cursor: 'pointer' }}>{nodeContent}</Link>
                  {stammbaumLinks.length > 0 && (
                    <g style={{ pointerEvents: 'all' }}>
                      <foreignObject
                        x={NODE_W - 4 - stammbaumLinkBarW}
                        y={2}
                        width={stammbaumLinkBarW}
                        height={16}
                        style={{ overflow: 'visible' }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            gap: 2,
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            height: '100%',
                            padding: 0,
                            margin: 0,
                          }}
                        >
                          {stammbaumLinks.map((item) => (
                            <button
                              key={item.label}
                              type="button"
                              title={`${item.label} öffnen`}
                              aria-label={item.label}
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                window.open(item.url, '_blank', 'noopener,noreferrer')
                              }}
                              style={{
                                fontSize: 10,
                                lineHeight: 1,
                                padding: 0,
                                margin: 0,
                                border: 'none',
                                background: 'rgba(15,20,25,0.82)',
                                borderRadius: 3,
                                cursor: 'pointer',
                                width: 14,
                                height: 14,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.35)',
                              }}
                            >
                              <span style={{ transform: 'scale(0.85)', display: 'inline-block' }}>{item.emoji}</span>
                            </button>
                          ))}
                        </div>
                      </foreignObject>
                    </g>
                  )}
                  {isIch && (
                    <text x={NODE_W / 2} y={NODE_H + 10} textAnchor="middle" fill="#14b8a6" fontSize="9" fontWeight="700">Du</text>
                  )}
                  {onSetIchBin && !isIch && !ichBinPersonId && (
                    <g style={{ pointerEvents: 'all' }}>
                      <title>Das bin ich (Nummerierung korrigieren)</title>
                      <foreignObject x={0} y={NODE_H} width={NODE_W} height={22} style={{ overflow: 'visible' }}>
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              onSetIchBin(p.id)
                            }}
                            style={{
                              fontSize: 10,
                              padding: '2px 6px',
                              cursor: 'pointer',
                              color: 'rgba(20,184,166,0.95)',
                              background: 'transparent',
                              border: '1px solid rgba(20,184,166,0.6)',
                              borderRadius: 4,
                            }}
                          >
                            Das bin ich
                          </button>
                        </div>
                      </foreignObject>
                    </g>
                  )}
                </>
              )}
            </g>
          )
        })}
        </g>
      </svg>
    </div>
  )
}
