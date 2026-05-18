/**
 * K2 Familie – Graph-Abstand zwischen „Du“ (ichBinPersonId) und einer Person.
 * Nur Kanten aus den Karten: Eltern, Kinder, Geschwister, Partner.
 */

import type { K2FamiliePerson } from '../types/k2Familie'
import { getBeziehungenFromKarten } from './familieBeziehungen'

/**
 * Kürzester Pfad (Kanten) von ich zu target im Beziehungsgraphen.
 * Liefert 0 wenn gleiche Person oder kein ich; null wenn nicht erreichbar.
 */
export function getGraphDistanceFromIch(
  personen: K2FamiliePerson[],
  ichBinPersonId: string | undefined,
  targetPersonId: string
): number | null {
  if (!ichBinPersonId?.trim()) return null
  if (ichBinPersonId === targetPersonId) return 0

  const ids = new Set(personen.map((p) => p.id))
  if (!ids.has(ichBinPersonId) || !ids.has(targetPersonId)) return null

  const queue: { id: string; d: number }[] = [{ id: ichBinPersonId, d: 0 }]
  const visited = new Set<string>([ichBinPersonId])

  while (queue.length > 0) {
    const { id: cur, d } = queue.shift()!
    if (cur === targetPersonId) return d

    const b = getBeziehungenFromKarten(personen, cur)
    const neighbors = [...b.eltern, ...b.kinder, ...b.geschwister, ...b.partner]
    for (const n of neighbors) {
      if (visited.has(n.id)) continue
      visited.add(n.id)
      queue.push({ id: n.id, d: d + 1 })
    }
  }

  return null
}

/** Liegt ancestorId auf einem reinen Eltern-Pfad über descendantId? */
export function isStrictAncestorOf(
  personen: K2FamiliePerson[],
  ancestorId: string,
  descendantId: string,
): boolean {
  if (ancestorId === descendantId) return false
  const byId = new Map(personen.map((x) => [x.id, x]))
  const visited = new Set<string>()
  const queue = [descendantId]
  while (queue.length > 0) {
    const cur = queue.shift()!
    const person = byId.get(cur)
    if (!person) continue
    for (const pid of person.parentIds) {
      if (pid === ancestorId) return true
      if (visited.has(pid)) continue
      visited.add(pid)
      queue.push(pid)
    }
  }
  return false
}

/**
 * Bearbeiter:in: Beziehungen pflegen auf eigener Karte und im erreichbaren Netz
 * nach unten/seitwärts – nicht auf Vorfahren von „Du“ (die bleiben Inhaber:in).
 */
export function canBearbeiterPflegeBeziehungenOnCard(
  personen: K2FamiliePerson[],
  opts: {
    ichBinPersonId?: string
    cardPersonId: string
    kannStruktur: boolean
    kannPersonenAnlegen: boolean
  },
): boolean {
  if (opts.kannStruktur) return true
  if (!opts.kannPersonenAnlegen) return false
  const ich = opts.ichBinPersonId?.trim()
  if (!ich) return false
  if (opts.cardPersonId === ich) return true
  if (isStrictAncestorOf(personen, opts.cardPersonId, ich)) return false
  return getGraphDistanceFromIch(personen, ich, opts.cardPersonId) != null
}

/** Portrait-Breite/Höhe (px): Basis 140, wächst mit Abstand von „Du“ (gedeckelt). */
export function portraitSizeFromGraphDistance(distance: number | null): number {
  const d = distance == null ? 0 : Math.max(0, distance)
  const factor = 1 + 0.065 * Math.min(d, 10)
  return Math.round(140 * factor)
}
