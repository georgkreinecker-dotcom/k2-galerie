/**
 * K2 Familie – einmalig Partner für Geschwister ergänzen (außer Maria).
 * Rupert: erste Frau verstorben, zweite Frau. Gisela: Mann verstorben.
 * Siehe Anweisung: alle Geschwister außer Maria einen Partner; Rupert 2 Partner (1. verstorben), Gisela Partner verstorben.
 */

import type { K2FamiliePerson } from '../types/k2Familie'

function genId(): string {
  return 'person-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8)
}

function nameContains(name: string, search: string): boolean {
  const n = name.trim().toLowerCase()
  const s = search.toLowerCase()
  return n === s || n.includes(' ' + s + ' ') || n.startsWith(s + ' ') || n.endsWith(' ' + s)
}

/**
 * Fügt bei allen Geschwistern außer Maria einen Partner ein.
 * Rupert: erste Frau verstorben, zweite Frau. Gisela: Partner (Mann) verstorben.
 * Gibt neue Personenliste zurück (inkl. neuer Partner-Personen und aktualisierter Geschwister).
 */
export function addPartnersForSiblingsExceptMaria(
  personen: K2FamiliePerson[],
  ichBinPersonId: string
): K2FamiliePerson[] {
  const byId = new Map(personen.map((p) => [p.id, p]))
  const du = byId.get(ichBinPersonId)
  if (!du || !du.siblingIds.length) return personen

  const now = new Date().toISOString()
  const result = personen.map((p) => ({ ...p }))
  const resultById = new Map(result.map((p) => [p.id, p]))

  du.siblingIds.forEach((sibId) => {
    const sib = resultById.get(sibId)
    if (!sib) return
    // Maria bekommt keinen Partner
    if (nameContains(sib.name, 'Maria')) return
    // Bereits Partner vorhanden → nur Rupert prüfen (evtl. zweite Frau ergänzen)
    const hasPartners = sib.partners.length > 0

    if (nameContains(sib.name, 'Rupert')) {
      if (!hasPartners) {
        const id1 = genId()
        const id2 = genId()
        const ref1 = { personId: sibId, from: null as string | null, to: null as string | null }
        const ref2 = { personId: sibId, from: null as string | null, to: null as string | null }
        result.push(
          {
            id: id1,
            name: 'Erste Frau Rupert',
            parentIds: [],
            childIds: [],
            partners: [ref1],
            siblingIds: [],
            wahlfamilieIds: [],
            verstorben: true,
            createdAt: now,
            updatedAt: now,
          },
          {
            id: id2,
            name: 'Zweite Frau Rupert',
            parentIds: [],
            childIds: [],
            partners: [ref2],
            siblingIds: [],
            wahlfamilieIds: [],
            createdAt: now,
            updatedAt: now,
          }
        )
        const sibCopy = resultById.get(sibId)!
        sibCopy.partners = [
          { personId: id1, from: null, to: null },
          { personId: id2, from: null, to: null },
        ]
        sibCopy.updatedAt = now
      }
      return
    }

    if (nameContains(sib.name, 'Gisela')) {
      if (!hasPartners) {
        const idP = genId()
        result.push({
          id: idP,
          name: 'Mann von Gisela',
          parentIds: [],
          childIds: [],
          partners: [{ personId: sibId, from: null, to: null }],
          siblingIds: [],
          wahlfamilieIds: [],
          verstorben: true,
          createdAt: now,
          updatedAt: now,
        })
        const sibCopy = resultById.get(sibId)!
        sibCopy.partners = [{ personId: idP, from: null, to: null }]
        sibCopy.updatedAt = now
      }
      return
    }

    // Alle übrigen Geschwister (außer Maria): ein Partner
    if (!hasPartners) {
      const idP = genId()
      const label = `Partner/in von ${sib.name.trim() || 'Geschwister'}`
      result.push({
        id: idP,
        name: label,
        parentIds: [],
        childIds: [],
        partners: [{ personId: sibId, from: null, to: null }],
        siblingIds: [],
        wahlfamilieIds: [],
        createdAt: now,
        updatedAt: now,
      })
      const sibCopy = resultById.get(sibId)!
      sibCopy.partners = [{ personId: idP, from: null, to: null }]
      sibCopy.updatedAt = now
    }
  })

  // Result enthält jetzt neue Personen; Geschwister-Referenzen sind aktualisiert, aber resultById zeigt auf die alten Objekte in result. Wir haben result durch result.push erweitert; die Einträge in result, die Geschwister sind, wurden per resultById.get(sibId) geändert – das sind Referenzen auf Objekte in result. Also result ist konsistent.
  return result
}
