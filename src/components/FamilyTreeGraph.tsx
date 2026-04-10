/**
 * K2 Familie – Stammbaum-Grafik (echter Baum mit Generationen und Linien).
 * SVG-basiert: Wurzeln oben, Kinder darunter, Partner verbunden.
 */

import { Link } from 'react-router-dom'
import { useMemo, useState, useRef, useCallback, useEffect } from 'react'
import type { K2FamiliePerson } from '../types/k2Familie'
import { normalizeFamilieDatum } from '../utils/familieDatumEingabe'

const NODE_W = 72
const NODE_H = 56
const ROW_H = 176
const COL_GAP = 24
/** Zusätzlicher Abstand zwischen zwei „Blöcken“ (Geschwister + deren Partner), damit keine Partner-Kette entsteht. */
const BLOCK_GAP = 40
/** Höhe einer Unterzeile, wenn eine Generation in mehrere kurze Zeilen aufgeteilt wird (übersichtlicher). */
const SUB_ROW_H = 100
const PERSON_LINK_PATH = '/projects/k2-familie/personen'

type Point = { x: number; y: number }

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

/** ISO YYYY-MM-DD für Sortierung (älter zuerst); null wenn nicht gesetzt/nicht parsbar. */
function sortKeyGeburtsdatum(raw?: string): string | null {
  if (!raw?.trim()) return null
  return normalizeFamilieDatum(raw.trim()) ?? null
}

/** Gleiche Generation: zuerst Geschwister-Reihenfolge (positionAmongSiblings / „Geschwister N“), bei gleicher Position Geburtsdatum, sonst Name. */
function compareNachGeschwisterlinieOderGeburt(
  a: K2FamiliePerson,
  b: K2FamiliePerson
): number {
  const da = sortKeyGeburtsdatum(a.geburtsdatum)
  const db = sortKeyGeburtsdatum(b.geburtsdatum)
  if (da && db && da !== db) return da.localeCompare(db)
  return a.name.localeCompare(b.name, 'de')
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
  const hasChildren = (id: string) => (childIds.get(id)?.length ?? 0) > 0
  const withPos = ids.map((id) => {
    let pos = getPositionInRow(byId.get(id)!, ichBinPersonId, ichBinPositionAmongSiblings)
    if (pos >= 999 && ichBinPersonId !== id) {
      const p = byId.get(id)!
      const partnerInRow = p.partners.find((pr) => ids.includes(pr.personId))?.personId
      if (partnerInRow && hasChildren(partnerInRow) && !hasChildren(id)) pos = 0
    }
    return { id, pos }
  })
  const hasAnyPosition = withPos.some((x) => x.pos < 999)
  if (hasAnyPosition) {
    withPos.sort((a, b) => {
      if (a.pos !== b.pos) return a.pos - b.pos
      const pa = byId.get(a.id)!
      const pb = byId.get(b.id)!
      return compareNachGeschwisterlinieOderGeburt(pa, pb)
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
    return compareNachGeschwisterlinieOderGeburt(pa, pb) || a.id.localeCompare(b.id)
  })
  return withParentOrder.map((x) => x.id)
}

/** Baum = eine Zeile pro Generation (ursprüngliche Darstellung). Zeilen = Blöcke/Unterzeilen bei vielen Geschwistern. */
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
  layout = 'zeilen',
  orientation = 'vertical',
  partnerHerkunftPersonId,
  ichBinPersonId,
  onSetIchBin,
  ichBinPositionAmongSiblings,
}: {
  personen: K2FamiliePerson[]
  personPathPrefix?: string
  /** Für Druck: nur Namen, keine Fotos (spart Tinte, schlank) */
  noPhotos?: boolean
  /** Druckansicht: keine Klick-Links, druckfreundliche Farben */
  printMode?: boolean
  /** Skalierung (z. B. 1.2 für Poster) */
  scale?: number
  /** Baum = eine Zeile pro Generation (unsere ursprüngliche Darstellung). Zeilen = mit Blöcken/Unterzeilen. */
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
}) {
  const { levelMap, rows, width, height, nodePos, connectors, partnerLinks, initialPan, contentCx, contentCy } = useMemo(() => {
    if (personen.length === 0) {
      return { levelMap: new Map<string, number>(), rows: [] as string[][], width: 400, height: 120, nodePos: new Map<string, Point>(), connectors: [] as { from: Point; to: Point; viaY?: number }[], partnerLinks: [] as { a: Point; b: Point }[], initialPan: { x: 0, y: 0 }, contentCx: 200, contentCy: 60 }
    }

    const levelMap = getGenerations(personen)
    const byId = new Map(personen.map((p) => [p.id, p]))
    const childIds = getChildIds(personen)

    const rows: string[][] = []
    const maxLevel = Math.max(...Array.from(levelMap.values()))
    for (let L = 0; L <= maxLevel; L++) {
      const ids = personen.filter((p) => levelMap.get(p.id) === L).map((p) => p.id)
      rows.push(orderInGeneration(personen, ids, levelMap, childIds, ichBinPersonId, ichBinPositionAmongSiblings))
    }

    // Familienzweig-Muster: Pivot (Person mit 2+ Partnern in der Zeile, z. B. Vater) zuerst → steht oben; dann Partner versetzt. Sonst: Du zuerst, dann Partner.
    const reorderedRows = rows.map((rowIds) => {
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
    /** Zwei Personen in der Zeile sind Partner (nur aus Karten: partners-Array). */
    const arePartnersInRow = (rowIds: string[], i: number, j: number): boolean => {
      if (i < 0 || j < 0 || i >= rowIds.length || j >= rowIds.length) return false
      const a = byId.get(rowIds[i])
      const b = byId.get(rowIds[j])
      return Boolean(a?.partners.some((pr) => pr.personId === rowIds[j]) || b?.partners.some((pr) => pr.personId === rowIds[i]))
    }

    /** Eine lange Zeile in Blöcke (Geschwister + Partner) zerlegen. */
    const splitIntoChunks = (rowIds: string[]): string[][] => {
      if (rowIds.length <= 4) return [rowIds]
      const chunks: string[][] = []
      let current: string[] = []
      for (let i = 0; i < rowIds.length; i++) {
        if (i > 0 && !arePartnersInRow(rowIds, i - 1, i)) {
          chunks.push(current)
          current = []
        }
        current.push(rowIds[i])
      }
      if (current.length > 0) chunks.push(current)
      return chunks.length >= 3 ? chunks : [rowIds]
    }

    rows.length = 0
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
        if (i > 0 && !arePartnersInRow(rowIds, i - 1, i)) rowW += BLOCK_GAP
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

    // Partner-Versatz: Pivot-Zeile = nur Pivot oben, Partner darunter. Sonst: Zweiter im Paar darunter.
    const partnerOffsetY = NODE_H / 2
    currentY = 24
    rows.forEach((rowIds, rowIndex) => {
      const rowH = rowHeights[rowIndex]
      const baseY = currentY + rowH / 2
      currentY += rowH
      let rowW = 0
      for (let i = 0; i < rowIds.length; i++) {
        if (i > 0 && !arePartnersInRow(rowIds, i - 1, i)) rowW += BLOCK_GAP
        rowW += NODE_W + COL_GAP
      }
      rowW -= COL_GAP
      let currentX = (width - rowW) / 2 + (NODE_W + COL_GAP) / 2
      const pivotInRow = rowIds.find((id) => (byId.get(id)?.partners.filter((pr) => rowIds.includes(pr.personId)).length ?? 0) >= 2) ?? null
      rowIds.forEach((id, i) => {
        if (i > 0 && !arePartnersInRow(rowIds, i - 1, i)) currentX += BLOCK_GAP
        let y: number
        if (pivotInRow != null) {
          y = id === pivotInRow ? baseY : baseY + partnerOffsetY
        } else {
          const isPartnerOfPrevious = i > 0 && byId.get(rowIds[i - 1])?.partners.some((pr) => pr.personId === id)
          y = isPartnerOfPrevious ? baseY + partnerOffsetY : baseY
        }
        nodePos.set(id, { x: currentX, y })
        currentX += NODE_W + COL_GAP
      })
    })

    const connectors: { from: Point; to: Point; viaY?: number }[] = []
    const partnerLinks: { a: Point; b: Point }[] = []

    const rowForParent = new Map<string, string[]>()
    rows.forEach((rowIds) => rowIds.forEach((id) => rowForParent.set(id, rowIds)))

    // Eltern mit Kindern: Muttern eine eigene Zwischenebene (Stamm); Vaterzeile fließt in die Mutterzeile ein (Mutter = Quelle)
    const parentsWithKids = personen
      .filter((p) => {
        const pos = nodePos.get(p.id)
        if (!pos) return false
        const fromCard = p.childIds ?? []
        const fromChildren = childIds.get(p.id) ?? []
        const kids = Array.from(new Set([...fromCard, ...fromChildren]))
        return kids.some((childId) => nodePos.has(childId))
      })
      .map((p) => ({ id: p.id, pos: nodePos.get(p.id)! }))
      .sort((a, b) => a.pos.x - b.pos.x)
    const TRUNK_STEP = 18
    const parentViaY = new Map<string, number>()
    let stepIndex = 0
    parentsWithKids.forEach(({ id, pos }) => {
      const rowIds = rowForParent.get(id)
      const isPivot = rowIds != null && (byId.get(id)?.partners.filter((pr) => rowIds.includes(pr.personId)).length ?? 0) >= 2
      if (!isPivot) {
        parentViaY.set(id, pos.y + TRUNK_STEP + stepIndex * TRUNK_STEP)
        stepIndex++
      }
    })
    // Pivot (Vater) bekommt keine eigene Ebene – fließt in Mutterzeile ein

    // Nur verbieten: Linien zwischen „meine Kinder“ und „meine Geschwister“ (von unten zu Geschwistern)
    const userParentIds = ichBinPersonId ? (byId.get(ichBinPersonId)?.parentIds ?? []) : []
    const userSiblingIds = new Set(
      ichBinPersonId ? personen.filter((p) => p.id !== ichBinPersonId && p.parentIds.some((pid) => userParentIds.includes(pid))).map((p) => p.id) : []
    )
    const userChildrenIds = new Set(
      ichBinPersonId ? [...(byId.get(ichBinPersonId)?.childIds ?? []), ...(childIds.get(ichBinPersonId) ?? [])] : []
    )

    // Von jedem Elternteil zu jedem seiner Kinder; Vater nutzt die viaY der Mutter des Kindes
    personen.forEach((p) => {
      const parentPos = nodePos.get(p.id)
      if (!parentPos) return
      const fromCard = p.childIds ?? []
      const fromChildren = childIds.get(p.id) ?? []
      const kids = Array.from(new Set([...fromCard, ...fromChildren]))
      const rowIds = rowForParent.get(p.id)
      const isPivot = rowIds != null && (byId.get(p.id)?.partners.filter((pr) => rowIds.includes(pr.personId)).length ?? 0) >= 2
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
        const asChildOfPartner = child.parentIds.some((pid) => byId.get(pid)?.partners.some((pr) => pr.personId === childId))
        if (asChildOfPartner) return
        let viaY = parentViaY.get(p.id) ?? undefined
        if (isPivot && rowIds) {
          const motherId = p.partners.find(
            (pr) => rowIds.includes(pr.personId) && (child.parentIds.includes(pr.personId) || byId.get(pr.personId)?.childIds.includes(childId))
          )?.personId
          if (motherId) viaY = parentViaY.get(motherId)
        }
        connectors.push(viaY != null ? { from: parentPos, to: childPos, viaY } : { from: parentPos, to: childPos })
      })
    })

    const partnerDone = new Set<string>()
    personen.forEach((p) => {
      p.partners.forEach((pr) => {
        const key = [p.id, pr.personId].sort().join('-')
        if (partnerDone.has(key)) return
        partnerDone.add(key)
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

    return { levelMap, rows, width, height, nodePos, connectors, partnerLinks, initialPan, contentCx, contentCy }
  }, [personen, ichBinPersonId, ichBinPositionAmongSiblings])

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
    if (!isHorizontal) return connectors.map((c) => ({ from: c.from, to: c.to, viaY: c.viaY, viaX: undefined as number | undefined }))
    return connectors.map((c) => ({ from: swapPoint(c.from), to: swapPoint(c.to), viaY: undefined as number | undefined, viaX: c.viaY }))
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

        {/* Linien: Eltern → Kinder */}
        <g stroke={stroke} strokeWidth="1.5" fill="none">
          {displayConnectors.map(({ from, to, viaY, viaX }, i) => (
            <path
              key={i}
              d={
                viaY != null
                  ? `M ${from.x} ${from.y} L ${from.x} ${viaY} L ${to.x} ${viaY} L ${to.x} ${to.y}`
                  : viaX != null
                    ? `M ${from.x} ${from.y} L ${viaX} ${from.y} L ${viaX} ${to.y} L ${to.x} ${to.y}`
                    : `M ${from.x} ${from.y} L ${from.x} ${(from.y + to.y) / 2} L ${to.x} ${(from.y + to.y) / 2} L ${to.x} ${to.y}`
              }
            />
          ))}
        </g>

        {/* Knoten (Personen) */}
        {personen.map((p) => {
          const pos = displayNodePos.get(p.id)
          if (!pos) return null
          const to = `${personPathPrefix}/${p.id}`
          const showPhoto = !noPhotos && p.photo
          const initial = p.name.trim().charAt(0).toUpperCase() || '?'
          const isIch = ichBinPersonId === p.id
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
                    href={p.photo}
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
                  {isIch && (
                    <text x={NODE_W / 2} y={NODE_H + 10} textAnchor="middle" fill="#0d9488" fontSize="9" fontWeight="700">Du</text>
                  )}
                </g>
              ) : (
                <>
                  {/* Link nur um Knoten-Inhalt (nicht block), damit „Das bin ich“ darunter klickbar bleibt */}
                  <Link to={to} style={{ cursor: 'pointer' }}>{nodeContent}</Link>
                  {isIch && (
                    <text x={NODE_W / 2} y={NODE_H + 10} textAnchor="middle" fill="#14b8a6" fontSize="9" fontWeight="700">Du</text>
                  )}
                  {onSetIchBin && !isIch && (
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
