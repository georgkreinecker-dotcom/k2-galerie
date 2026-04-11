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
 * Ergänzt fehlende Gegen-Einträge: wenn A in `childIds` von B steht, bekommt B `parentIds` mit A;
 * wenn B `parentIds` mit A hat, bekommt A `childIds` mit B. Nur **hinzufügen**, nie entfernen.
 * Damit Stammbaum und Filter dieselbe „eine Wahrheit“ aus zwei Richtungen lesen können.
 */
export function reconcileParentChildRelations(personen: K2FamiliePerson[]): K2FamiliePerson[] {
  if (personen.length === 0) return personen
  const byId = new Map<string, K2FamiliePerson>()
  for (const p of personen) {
    byId.set(p.id, {
      ...p,
      parentIds: [...(p.parentIds ?? [])],
      childIds: [...(p.childIds ?? [])],
    })
  }

  let changed = true
  let guard = 0
  while (changed && guard++ < 20) {
    changed = false
    for (const p of personen) {
      const cur = byId.get(p.id)
      if (!cur) continue
      for (const cid of cur.childIds) {
        const child = byId.get(cid)
        if (!child) continue
        if (child.parentIds.includes(p.id)) continue
        /** Kind hat bereits zwei Eltern auf der Karte – nicht auto-ergänzen (z. B. Enkel fälschlich in childIds der Großeltern). */
        if (child.parentIds.length >= 2) continue
        byId.set(cid, { ...child, parentIds: [...child.parentIds, p.id] })
        changed = true
      }
      for (const pid of cur.parentIds) {
        const par = byId.get(pid)
        if (!par) continue
        if (!par.childIds.includes(p.id)) {
          byId.set(pid, { ...par, childIds: [...par.childIds, p.id] })
          changed = true
        }
      }
    }
  }

  return personen.map((p) => byId.get(p.id) ?? p)
}

/** Sortierter Schlüssel aus genau zwei Eltern-IDs (volle Geschwister). */
function elternPaarKey(p: K2FamiliePerson): string | null {
  if (p.parentIds.length < 2) return null
  return [...p.parentIds].sort().join('|')
}

/**
 * Elternteil, der mit mehr als einem anderen Elternteil Kinder hat (z. B. zwei Ehen).
 * Gleiche Logik wie im Stammbaum – Halbgeschwister gehören in denselben Familienzweig.
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

/**
 * Direktes Kind der Wurzel laut Karten: Wenn auf der Kinderkarte **mindestens zwei andere** Eltern
 * eingetragen sind (ohne die Wurzel), ist das kein Kind dieser Wurzel – auch wenn die Wurzel fälschlich
 * in `childIds` steht oder reconcile ein Elternteil ergänzt hat (z. B. Enkel unter Großeltern).
 */
export function istDirektesKindDerWurzelLautKarten(k: K2FamiliePerson, rootId: string): boolean {
  const r = rootId.trim()
  const pars = (k.parentIds ?? []).map((x) => String(x).trim()).filter(Boolean)
  const ohneWurzel = pars.filter((x) => x !== r)
  return ohneWurzel.length < 2
}

/**
 * Personen eines **Familienzweigs** aus Sicht einer Person: sie selbst, Partner, Kinder, Partner der Kinder,
 * **weitere Generationen** (Nachkommen über parentIds, ohne feste Tiefe), Partner der jeweiligen Personen,
 * plus **eine Ebene Eltern** für all diese Kernpersonen (parentIds aus den Karten), damit z. B. die Eltern
 * eines Kindes im Stammbaum gezeichnet werden, wenn „Nur mein Familienzweig“ aktiv ist.
 *
 * **Geschwister** mit dem **gleichen Elternpaar** wie die Wurzel (z. B. Familie mit zwei Kindern) sind
 * Teil desselben Familienzweigs – sonst erscheinen Geschwister weder in der Grafik noch in „Nur mein Familienzweig“.
 *
 * Kinder kommen aus **childIds** der Wurzel **und** aus allen Personen, die die Wurzel in **parentIds** haben
 * (symmetrisch – oft sind nur die Kinderkarten mit Eltern gepflegt).
 *
 * @param options.includeSiblingCircle Standard **true** (Grafik / „Nur mein Familienzweig“): volle Geschwister
 * mit gleichem Elternpaar bzw. Halbgeschwister-Kreis. **false** nur für **Großfamilie je Geschwister-Ast** –
 * sonst liegen alle Geschwister und deren Ehepartner in jedem Ast unter „Weitere“.
 * @param options.includeParentsOfCore Standard **true**: Eltern der Kernpersonen (baseIds) mit aufnehmen.
 * **false** für die Stammbaum-Grafik bei „Nur mein Familienzweig“ – dann stehen Du und Partner oben, darunter nur eure Nachkommen (keine Eltern-/Großeltern-Ebene in der Grafik).
 */
export function getFamilienzweigPersonen(
  personen: K2FamiliePerson[],
  personId: string | undefined,
  options?: { includeSiblingCircle?: boolean; includeParentsOfCore?: boolean }
): K2FamiliePerson[] {
  if (!personId) return []
  const includeSiblingCircle = options?.includeSiblingCircle !== false
  const includeParentsOfCore = options?.includeParentsOfCore !== false
  const byIdMap = byId(personen)
  const root = byIdMap.get(personId)
  if (!root) return []
  const baseSeen = new Set<string>()
  const baseIds: string[] = []
  const pushBase = (id: string) => {
    if (baseSeen.has(id)) return
    baseSeen.add(id)
    baseIds.push(id)
  }
  pushBase(personId)
  ;(root.partners ?? []).forEach((pr) => pushBase(pr.personId))
  if (includeSiblingCircle) {
    const multi = getElternteilMitMehrerenEhen(root, personen)
    if (multi) {
      for (const p of personen) {
        if (p.parentIds.length < 2 || !p.parentIds.includes(multi)) continue
        pushBase(p.id)
        ;(p.partners ?? []).forEach((pr) => pushBase(pr.personId))
      }
    } else {
      const ekRoot = elternPaarKey(root)
      if (ekRoot) {
        for (const p of personen) {
          if (elternPaarKey(p) !== ekRoot) continue
          pushBase(p.id)
          ;(p.partners ?? []).forEach((pr) => pushBase(pr.personId))
        }
      }
    }
  }
  const kinder = getBeziehungenFromKarten(personen, personId).kinder
  kinder.forEach((k) => {
    if (!istDirektesKindDerWurzelLautKarten(k, personId)) return
    pushBase(k.id)
    ;(k.partners ?? []).forEach((pr) => pushBase(pr.personId))
  })
  for (const p of personen) {
    if (!p.parentIds.includes(personId)) continue
    if (!istDirektesKindDerWurzelLautKarten(p, personId)) continue
    pushBase(p.id)
    ;(p.partners ?? []).forEach((pr) => pushBase(pr.personId))
  }
  const ids = new Set<string>(baseIds)
  if (includeParentsOfCore) {
    for (const id of baseIds) {
      const p = byIdMap.get(id)
      for (const pid of p?.parentIds ?? []) {
        if (byIdMap.has(pid)) ids.add(pid)
      }
    }
  }
  /**
   * Nachkommen ohne feste Tiefe (Doku: organisches Wachstum): nur unterhalb von baseIds
   * (Wurzel, Partner, direkte Kinder …), nicht „Geschwister über gemeinsame Großeltern“ (m/v in ids).
   */
  const nachkommen = new Set<string>(baseIds)
  let grew = true
  while (grew) {
    grew = false
    for (const p of personen) {
      if (nachkommen.has(p.id)) continue
      if (!(p.parentIds ?? []).map((x) => String(x).trim()).some((pid) => nachkommen.has(pid))) continue
      nachkommen.add(p.id)
      grew = true
      for (const pr of p.partners ?? []) {
        const q = byIdMap.get(pr.personId)
        if (q) nachkommen.add(q.id)
      }
    }
  }
  for (const id of nachkommen) ids.add(id)
  return personen.filter((p) => ids.has(p.id))
}

/** @deprecated Umbenannt in getFamilienzweigPersonen (gleiche Logik). */
export const getKleinfamiliePersonen = getFamilienzweigPersonen
