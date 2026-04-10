/**
 * K2 Familie – Beziehungen ausschließlich aus den Karten ableiten.
 * Eiserne Regel: Eine Quelle der Wahrheit. Keine Annahme, keine Namenssuche.
 * Siehe docs/K2-FAMILIE-BEZIEHUNGEN-QUELLE-WAHRHEIT.md, .cursor/rules/k2-familie-beziehungen-nur-aus-karten.mdc
 */

import type { K2FamiliePerson } from '../types/k2Familie'

export interface BeziehungenFromKarten {
  eltern: K2FamiliePerson[]
  kinder: K2FamiliePerson[]
  geschwister: K2FamiliePerson[]
  partner: K2FamiliePerson[]
}

function byId(personen: K2FamiliePerson[]): Map<string, K2FamiliePerson> {
  const map = new Map<string, K2FamiliePerson>()
  for (const p of personen) map.set(p.id, p)
  return map
}

/**
 * Liefert für eine Person ihre Beziehungen – ausschließlich aus den gespeicherten Feldern
 * parentIds, childIds, siblingIds, partners. Keine andere Logik.
 */
export function getBeziehungenFromKarten(
  personen: K2FamiliePerson[],
  personId: string
): BeziehungenFromKarten {
  const byIdMap = byId(personen)
  const person = byIdMap.get(personId)
  if (!person) {
    return { eltern: [], kinder: [], geschwister: [], partner: [] }
  }

  const eltern = (person.parentIds ?? [])
    .map((id) => byIdMap.get(id))
    .filter((p): p is K2FamiliePerson => p != null)

  const kinder = (person.childIds ?? [])
    .map((id) => byIdMap.get(id))
    .filter((p): p is K2FamiliePerson => p != null)

  const geschwister = (person.siblingIds ?? [])
    .map((id) => byIdMap.get(id))
    .filter((p): p is K2FamiliePerson => p != null)

  const partnerIds = (person.partners ?? []).map((pr) => pr.personId)
  const partner = partnerIds
    .map((id) => byIdMap.get(id))
    .filter((p): p is K2FamiliePerson => p != null)

  return { eltern, kinder, geschwister, partner }
}

/**
 * Personen eines **Familienzweigs** aus Sicht einer Person: sie selbst, Partner, Kinder, Partner der Kinder.
 * Keine Enkel – nur aus den Karten. Ein Familienzweig kann wieder Paare und Kinder enthalten; im Stammbaum
 * erscheint er als **eigener Block** (Farbe), innerhalb desselben Musters wie im Gesamtbaum.
 */
export function getFamilienzweigPersonen(
  personen: K2FamiliePerson[],
  personId: string | undefined
): K2FamiliePerson[] {
  if (!personId) return []
  const byIdMap = byId(personen)
  const ids = new Set<string>()
  const root = byIdMap.get(personId)
  if (!root) return []
  ids.add(personId)
  ;(root.partners ?? []).forEach((pr) => ids.add(pr.personId))
  const kinder = getBeziehungenFromKarten(personen, personId).kinder
  kinder.forEach((k) => {
    ids.add(k.id)
    ;(k.partners ?? []).forEach((pr) => ids.add(pr.personId))
  })
  return personen.filter((p) => ids.has(p.id))
}

/** @deprecated Umbenannt in getFamilienzweigPersonen (gleiche Logik). */
export const getKleinfamiliePersonen = getFamilienzweigPersonen
