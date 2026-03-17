/**
 * K2 Familie – minimaler GEDCOM 5.5.1 Export (Personen + Beziehungen).
 * Siehe docs/K2-FAMILIE-GEDCOM-PLAN.md
 */

import { loadPersonen } from './familieStorage'
import type { K2FamiliePerson } from '../types/k2Familie'

function escapeGedcom(s: string): string {
  return s.replace(/@/g, '@@')
}

/**
 * Exportiert die Familie eines Tenants als GEDCOM-Text (Personen + Familien).
 */
export function exportK2FamilieToGedcom(tenantId: string): string {
  const personen = loadPersonen(tenantId)
  const lines: string[] = []

  lines.push('0 HEAD')
  lines.push('1 GEDC')
  lines.push('2 VERS 5.5.1')
  lines.push('1 CHAR UTF-8')

  const idToRef = new Map<string, string>()
  personen.forEach((p, i) => {
    idToRef.set(p.id, `@I${i + 1}@`)
  })

  personen.forEach((p, i) => {
    const ref = idToRef.get(p.id) ?? `@I${i + 1}@`
    lines.push(`0 ${ref} INDI`)
    lines.push(`1 NAME ${escapeGedcom(p.name.trim() || 'Unbekannt')}`)
    if (p.verstorben && p.verstorbenAm) {
      const date = p.verstorbenAm.slice(0, 10).replace(/-/g, '')
      lines.push('1 DEAT')
      lines.push(`2 DATE ${date}`)
    }
  })

  const familyKeys = new Map<string, string[]>()
  for (const p of personen) {
    for (const childId of p.childIds) {
      const child = personen.find((x) => x.id === childId)
      if (!child) continue
      const otherParentIds = child.parentIds.filter((id) => id !== p.id)
      for (const otherId of otherParentIds.length ? otherParentIds : [p.id]) {
        const key = [p.id, otherId].sort().join('|')
        if (!familyKeys.has(key)) familyKeys.set(key, [])
        const arr = familyKeys.get(key)!
        if (!arr.includes(childId)) arr.push(childId)
      }
    }
  }

  let famIndex = 0
  familyKeys.forEach((childIds, key) => {
    const [id1, id2] = key.split('|')
    const ref1 = idToRef.get(id1)
    const ref2 = idToRef.get(id2)
    if (!ref1) return
    famIndex++
    const famRef = `@F${famIndex}@`
    lines.push(`0 ${famRef} FAM`)
    if (id1 === id2) {
      lines.push(`1 HUSB ${ref1}`)
    } else {
      lines.push(`1 HUSB ${ref1}`)
      if (ref2) lines.push(`1 WIFE ${ref2}`)
    }
    for (const cid of childIds) {
      const cref = idToRef.get(cid)
      if (cref) lines.push(`1 CHIL ${cref}`)
    }
  })

  lines.push('0 TRLR')

  return lines.join('\r\n')
}
