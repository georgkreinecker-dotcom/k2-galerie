/**
 * Personen-Listen aus Speicher/Import: IDs trimmen, doppelte id zusammenführen (Union der Beziehungsfelder).
 * Ohne Einträge zu löschen – verhindert, dass Stammbaum „parentIds.includes(g.id)“ verfehlt, wenn zwei Karten
 * dieselbe Person mit leicht abweichenden Referenzen (Whitespace, Duplikat-Zeilen) hatten.
 */
import type { K2FamiliePartnerRef, K2FamiliePerson } from '../types/k2Familie'

function trimId(s: string | undefined | null): string {
  return String(s ?? '').trim()
}

function uniqIds(ids: string[]): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  for (const id of ids) {
    const t = trimId(id)
    if (!t || seen.has(t)) continue
    seen.add(t)
    out.push(t)
  }
  return out
}

function mergePartners(a: K2FamiliePartnerRef[] | undefined, b: K2FamiliePartnerRef[] | undefined): K2FamiliePartnerRef[] {
  const byPid = new Map<string, K2FamiliePartnerRef>()
  for (const pr of [...(a ?? []), ...(b ?? [])]) {
    const pid = trimId(pr.personId)
    if (!pid) continue
    if (!byPid.has(pid)) byPid.set(pid, { ...pr, personId: pid })
  }
  return [...byPid.values()]
}

/**
 * Trimmt alle ID-Felder; bei mehreren Objekten mit derselben `id` werden parentIds/childIds/siblingIds/wahlfamilieIds
 * und partners vereinigt (neuere Felder überschreiben nur, wo sinnvoll – Beziehungen als Union).
 */
export function normalizeAndDedupePersonen(personen: K2FamiliePerson[]): K2FamiliePerson[] {
  const m = new Map<string, K2FamiliePerson>()
  for (const p of personen) {
    const id = trimId(p.id)
    if (!id) continue
    const next: K2FamiliePerson = {
      ...p,
      id,
      parentIds: uniqIds(p.parentIds ?? []),
      childIds: uniqIds(p.childIds ?? []),
      siblingIds: uniqIds(p.siblingIds ?? []),
      wahlfamilieIds: uniqIds(p.wahlfamilieIds ?? []),
      partners: (p.partners ?? []).map((pr) => ({ ...pr, personId: trimId(pr.personId) })).filter((pr) => pr.personId),
    }
    const cur = m.get(id)
    if (!cur) {
      m.set(id, next)
      continue
    }
    m.set(id, {
      ...cur,
      ...next,
      parentIds: uniqIds([...cur.parentIds, ...next.parentIds]),
      childIds: uniqIds([...cur.childIds, ...next.childIds]),
      siblingIds: uniqIds([...cur.siblingIds, ...next.siblingIds]),
      wahlfamilieIds: uniqIds([...cur.wahlfamilieIds, ...next.wahlfamilieIds]),
      partners: mergePartners(cur.partners, next.partners),
    })
  }
  return [...m.values()]
}
