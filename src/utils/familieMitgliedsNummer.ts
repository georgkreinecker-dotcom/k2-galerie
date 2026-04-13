/**
 * Persönliche Mitgliedsnummern (Produktentscheidung B): Abgleich Eingabe → Person in dieser Familie.
 * Automatische Vergabe: einheitliches Präfix + laufende Nummer (Stammbaum-Zweig-Reihenfolge).
 * Nur k2-familie-* / Personenliste; keine Vermischung mit K2/ök2/VK2.
 */
import type { K2FamiliePerson } from '../types/k2Familie'
import { buildStammbaumKartenState } from './familieStammbaumKarten'

/** Festes Präfix für systemvergebene Nummern (Einladungslink-Parameter m). */
export const MITGLIEDS_NUMMER_AUTO_PREFIX = 'KF-'

export function trimMitgliedsNummerEingabe(s: string | undefined | null): string {
  return String(s ?? '').trim()
}

/**
 * Findet die Personen-ID zur eingegebenen Mitgliedsnummer (Vergleich ohne Groß-/Kleinschreibung).
 * Bei mehreren Treffern: erste in der Liste (soll durch Pflege vermieden werden).
 */
export function findPersonIdByMitgliedsNummer(
  personen: K2FamiliePerson[],
  eingegeben: string
): string | null {
  const t = trimMitgliedsNummerEingabe(eingegeben)
  if (!t) return null
  const want = t.toLowerCase()
  for (const p of personen) {
    const m = trimMitgliedsNummerEingabe(p.mitgliedsNummer)
    if (m && m.toLowerCase() === want) return p.id
  }
  return null
}

const RE_KF_SUFFIX = /^KF-(\d+)$/i

/** Höchster numerischer Suffix bei bereits vergebenen KF-nnnn-Nummern. */
export function maxAutoMitgliedsNummerSuffix(personen: K2FamiliePerson[]): number {
  let max = 0
  for (const p of personen) {
    const m = trimMitgliedsNummerEingabe(p.mitgliedsNummer)
    const x = m.match(RE_KF_SUFFIX)
    if (x) max = Math.max(max, parseInt(x[1], 10))
  }
  return max
}

function formatNextKf(n: number): string {
  return `${MITGLIEDS_NUMMER_AUTO_PREFIX}${String(n).padStart(4, '0')}`
}

/**
 * Vergibt fehlende Mitgliedsnummern im Format KF-0001, KF-0002, …
 * Reihenfolge = sortierte Stammbaum-Karten-Reihenfolge (Zweigstruktur wie im Stammbaum).
 * Bereits eingetragene Nummern (manuell oder früher automatisch) bleiben unverändert.
 */
export function assignMissingMitgliedsNummern(
  personen: K2FamiliePerson[],
  ichBinPersonId: string | undefined
): K2FamiliePerson[] {
  if (personen.length === 0) return personen
  const sorted = buildStammbaumKartenState(personen, ichBinPersonId).sortedPersonen
  let next = maxAutoMitgliedsNummerSuffix(personen) + 1
  const byId = new Map(personen.map((p) => [p.id, p]))
  const now = new Date().toISOString()
  let changed = false
  for (const p of sorted) {
    const cur = byId.get(p.id)
    if (!cur) continue
    if (cur.verstorben) continue
    if (trimMitgliedsNummerEingabe(cur.mitgliedsNummer)) continue
    changed = true
    const updated = { ...cur, mitgliedsNummer: formatNextKf(next++), updatedAt: now }
    byId.set(p.id, updated)
  }
  if (!changed) return personen
  return personen.map((p) => byId.get(p.id)!)
}

function shortKartenId(id: string): string {
  if (id.length <= 14) return id
  return `…${id.slice(-12)}`
}

/** Gleiche Logik wie Stammbaum-Druck: lesbares Zweig-Label zum branchKey. */
export function branchLabelFuerStammbaumBranchKey(
  key: string,
  map: Map<string, K2FamiliePerson>
): string {
  if (key.startsWith('geschwister-ast:')) {
    const id = key.slice('geschwister-ast:'.length)
    const n = map.get(id)?.name?.trim()
    return n ? `Familienzweig · ${n}` : `Familienzweig · ${shortKartenId(id)}`
  }
  if (key.startsWith('root:')) {
    const id = key.slice('root:'.length)
    const n = map.get(id)?.name?.trim()
    return n ? `Stamm · ${n}` : `Stamm · ${shortKartenId(id)}`
  }
  const ids = key.split('|').filter(Boolean)
  if (ids.length >= 2) {
    const n1 = map.get(ids[0]!)?.name ?? '…'
    const n2 = map.get(ids[1]!)?.name ?? '…'
    return `Zweig · Kinder von ${n1} & ${n2}`
  }
  if (ids.length === 1) {
    const n1 = map.get(ids[0]!)?.name ?? '…'
    return `Zweig · ${n1}`
  }
  return `Zweig · ${key}`
}

export type MitgliederCodesZweigGruppe = {
  branchKey: string
  branchLabel: string
  rows: { id: string; name: string; mitgliedsNummer: string }[]
}

/**
 * Gruppiert alle **lebenden** Personen wie die Stammbaum-Karten (aufeinanderfolgende gleiche Zweig-Schlüssel),
 * für die Inhaber-Liste „Mitglieder & Codes“. Verstorbene werden nicht aufgeführt.
 */
export function buildMitgliederCodesZweigGruppen(
  personen: K2FamiliePerson[],
  ichBinPersonId: string | undefined
): MitgliederCodesZweigGruppe[] {
  if (personen.length === 0) return []
  const state = buildStammbaumKartenState(personen, ichBinPersonId)
  const map = new Map(personen.map((p) => [p.id, p]))
  const chunks: { key: string; personen: K2FamiliePerson[] }[] = []
  const lebend = state.sortedPersonen.filter((p) => !p.verstorben)
  for (const p of lebend) {
    const k = state.getBranchKey(p)
    const last = chunks[chunks.length - 1]
    if (last && last.key === k) last.personen.push(p)
    else chunks.push({ key: k, personen: [p] })
  }
  return chunks.map((c) => ({
    branchKey: c.key,
    branchLabel: branchLabelFuerStammbaumBranchKey(c.key, map),
    rows: c.personen.map((p) => ({
      id: p.id,
      name: p.name?.trim() || '—',
      mitgliedsNummer: (p.mitgliedsNummer ?? '').trim(),
    })),
  }))
}
