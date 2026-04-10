/**
 * Erste Ehe (Anna Stöbich): vier Geschwister Rupert, Notburga, Anna, Maria
 * mit denselben Eltern wie „Du“ – damit im Stammbaum vier Familienzweig-Sektionen entstehen.
 * Beziehungen nur über Karten-Felder (eine Quelle der Wahrheit).
 */

import type { K2FamiliePerson } from '../types/k2Familie'

const VIER: readonly { vorname: string; positionAmongSiblings: number }[] = [
  { vorname: 'Rupert', positionAmongSiblings: 1 },
  { vorname: 'Notburga', positionAmongSiblings: 2 },
  { vorname: 'Anna', positionAmongSiblings: 3 },
  { vorname: 'Maria', positionAmongSiblings: 4 },
]

function nowIso(): string {
  return new Date().toISOString()
}

function genId(): string {
  return 'person-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8)
}

/** Ob bereits eine Person für dieses Geschwister-Kind existiert (gleiche Eltern wie „Du“). Mutter Anna Stöbich ist kein Kind dieses Paares und erscheint hier nicht. */
function findBestehend(
  personen: K2FamiliePerson[],
  elternKey: string,
  vorname: string
): K2FamiliePerson | undefined {
  const gleicheEltern = personen.filter(
    (p) => p.parentIds.length >= 2 && [...p.parentIds].sort().join('|') === elternKey
  )
  const v = vorname.toLowerCase()
  for (const p of gleicheEltern) {
    const n = p.name.trim().toLowerCase()
    if (v === 'anna') {
      if (n.includes('stöbich') || n.includes('stoebich')) continue
      if (n === 'anna' || n.startsWith('anna ')) return p
      continue
    }
    if (v === 'maria') {
      if (n === 'maria' || n.startsWith('maria ')) return p
      continue
    }
    if (n === v || n.startsWith(v + ' ')) return p
  }
  return undefined
}

function displayNameFuerVorname(vorname: string): string {
  if (vorname === 'Notburga') return 'Notburga'
  return vorname
}

/**
 * Ergänzt fehlende Geschwister der ersten Ehe (Rupert, Notburga, Anna, Maria),
 * wenn „Du“ zwei Eltern hast. Verknüpft parentIds, childIds der Eltern, siblingIds im Kreis.
 * Setzt Georg (ich) auf Position 5, falls noch keine Position gesetzt.
 */
export function ensureErsteEheVierGeschwister(
  personen: K2FamiliePerson[],
  ichBinPersonId: string
): {
  personen: K2FamiliePerson[]
  angelegt: number
  meldung: string
} {
  const byId = new Map(personen.map((p) => [p.id, { ...p }]))
  const ich = byId.get(ichBinPersonId)
  if (!ich || ich.parentIds.length < 2) {
    return { personen, angelegt: 0, meldung: 'Zuerst „Das bin ich“ wählen und zwei Eltern in der Karte haben.' }
  }

  const elternPair = [...ich.parentIds]
  const elternKey = [...elternPair].sort().join('|')

  const neu: K2FamiliePerson[] = []

  for (const { vorname, positionAmongSiblings } of VIER) {
    const existing = findBestehend(personen, elternKey, vorname)
    if (existing) continue

    const id = genId()
    neu.push({
      id,
      name: displayNameFuerVorname(vorname),
      parentIds: elternPair,
      childIds: [],
      partners: [],
      siblingIds: [],
      wahlfamilieIds: [],
      positionAmongSiblings,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    })
    byId.set(id, neu[neu.length - 1]!)
  }

  if (neu.length === 0) {
    return {
      personen,
      angelegt: 0,
      meldung: 'Rupert, Notburga, Anna und Maria sind bereits mit denselben Eltern wie du eingetragen.',
    }
  }

  // Alle Geschwister derselben Eltern (inkl. neu, ich, bestehend)
  const merged = [...personen.map((p) => byId.get(p.id) ?? { ...p }), ...neu]
  const mergedById = new Map(merged.map((p) => [p.id, p]))
  const gleicherKreis = merged.filter(
    (p) => p.parentIds.length >= 2 && [...p.parentIds].sort().join('|') === elternKey
  )
  const kreisIds = gleicherKreis.map((p) => p.id)

  for (const p of gleicherKreis) {
    const other = kreisIds.filter((id) => id !== p.id)
    const cur = mergedById.get(p.id)!
    cur.siblingIds = [...new Set(other)]
    if (p.id === ichBinPersonId) {
      cur.positionAmongSiblings = 5
    }
    cur.updatedAt = nowIso()
  }

  // Eltern: childIds ergänzen
  for (const pid of elternPair) {
    const el = mergedById.get(pid)
    if (!el) continue
    const set = new Set([...(el.childIds ?? []), ...kreisIds])
    el.childIds = [...set]
    el.updatedAt = nowIso()
  }

  const out = [...mergedById.values()]
  return {
    personen: out,
    angelegt: neu.length,
    meldung: `${neu.length} Person(en) ergänzt: erste Ehe (Anna Stöbich) – Geschwister Rupert, Notburga, Anna, Maria; du als 5. Kind sortiert.`,
  }
}
