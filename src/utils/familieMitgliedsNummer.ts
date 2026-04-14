/**
 * Persönliche Codes (Produktentscheidung B): Abgleich Eingabe → Person; **Schlüssel** + **erste Plattform-Identifikation**;
 * danach nutzt das Mitglied gespeicherten QR/Link. Automatische Vergabe: **2 Buchstaben (A–Z) + 2 Ziffern**, zufällig,
 * eindeutig in der Familie. Nur k2-familie-*; keine Vermischung mit K2/ök2/VK2.
 */
import type { K2FamiliePerson } from '../types/k2Familie'
import { buildStammbaumKartenState } from './familieStammbaumKarten'

/** Für Hilfetexte in der UI (Einladungslink-Parameter m = dieser Code). */
export const MITGLIEDS_NUMMER_AUTO_BEISPIEL = 'QA07'

/** Muster systemvergebener Codes (Großbuchstaben + Ziffern). */
export const RE_AUTO_MITGLIEDS_NUMMER = /^[A-Z]{2}\d{2}$/

/**
 * Eingabe für Abgleich mit persönlichem Code normalisieren (Mobil: iOS-Tastatur, Vollbreite-Zeichen,
 * unsichtbare Zeichen, Leerstellen mitten im Code).
 */
export function normalizeMitgliedsNummerInput(s: string | undefined | null): string {
  if (s == null || s === '') return ''
  let t = String(s)
  try {
    t = t.normalize('NFKC')
  } catch {
    /* ältere Umgebungen */
  }
  t = t.replace(/[\u200B-\u200D\uFEFF\u2060]/g, '')
  const out: string[] = []
  for (let i = 0; i < t.length; i++) {
    const c = t.charCodeAt(i)!
    if (c >= 0xff10 && c <= 0xff19) out.push(String.fromCharCode(c - 0xff10 + 0x30))
    else if (c >= 0xff21 && c <= 0xff3a) out.push(String.fromCharCode(c - 0xff21 + 0x41))
    else if (c >= 0xff41 && c <= 0xff5a) out.push(String.fromCharCode(c - 0xff41 + 0x61))
    else out.push(t[i]!)
  }
  t = out.join('')
  t = t.trim().replace(/\s+/g, '')
  /** Mobil: AB-12 / AB–12 (Bindestrich, Gedankenstrich) → AB12; nur dieses 2+2-Format, KF-… & Co. bleiben. */
  const vier = t.match(/^([A-Za-z]{2})[\u002D\u2010-\u2015\u2212\uFE63\uFF0D]?(\d{2})$/)
  if (vier) return `${vier[1]}${vier[2]}`
  return t
}

export function trimMitgliedsNummerEingabe(s: string | undefined | null): string {
  return normalizeMitgliedsNummerInput(s)
}

function normKey(m: string): string {
  return trimMitgliedsNummerEingabe(m).toLowerCase()
}

/** Alle bereits vergebenen Mitgliedsnummern (normalisiert klein) — für Eindeutigkeit neuer Zufallscodes. */
export function mitgliedsNummernImGebrauch(personen: K2FamiliePerson[]): Set<string> {
  const s = new Set<string>()
  for (const p of personen) {
    const m = trimMitgliedsNummerEingabe(p.mitgliedsNummer)
    if (m) s.add(normKey(m))
  }
  return s
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

/**
 * Eingabe gegen den auf der Karte gespeicherten persönlichen Code (ohne zweite Liste zu durchsuchen).
 * Gleiche Normalisierung wie findPersonIdByMitgliedsNummer.
 */
export function persoenlicherCodePasstZuKarte(
  eingegeben: string,
  mitgliedsNummerAufKarte: string | undefined | null
): boolean {
  const a = trimMitgliedsNummerEingabe(eingegeben)
  const b = trimMitgliedsNummerEingabe(mitgliedsNummerAufKarte)
  if (!a || !b) return false
  return a.toLowerCase() === b.toLowerCase()
}

function randomCodeLettersDigits(): string {
  const letter = () => String.fromCharCode(65 + Math.floor(Math.random() * 26))
  const digit = () => String(Math.floor(Math.random() * 10))
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const u = new Uint8Array(4)
    crypto.getRandomValues(u)
    const l1 = String.fromCharCode(65 + (u[0]! % 26))
    const l2 = String.fromCharCode(65 + (u[1]! % 26))
    return `${l1}${l2}${u[2]! % 10}${u[3]! % 10}`
  }
  return `${letter()}${letter()}${digit()}${digit()}`
}

/**
 * Erzeugt einen neuen Code, der noch nicht in `used` vorkommt (wird eingetragen).
 * Format: zwei Großbuchstaben + zwei Ziffern (z. B. KX42).
 */
export function zieheEindeutigenMitgliedsCode(used: Set<string>): string {
  for (let i = 0; i < 8000; i++) {
    const c = randomCodeLettersDigits()
    const k = normKey(c)
    if (!used.has(k)) {
      used.add(k)
      return c
    }
  }
  // Extrem selten: deterministisch nachlegen
  for (let a = 0; a < 26; a++) {
    for (let b = 0; b < 26; b++) {
      for (let d1 = 0; d1 < 10; d1++) {
        for (let d2 = 0; d2 < 10; d2++) {
          const c = `${String.fromCharCode(65 + a)}${String.fromCharCode(65 + b)}${d1}${d2}`
          const k = normKey(c)
          if (!used.has(k)) {
            used.add(k)
            return c
          }
        }
      }
    }
  }
  throw new Error('zieheEindeutigenMitgliedsCode: kein freier Code mehr')
}

/**
 * Vergibt fehlende Mitgliedsnummern als zufällige eindeutige Kombinationen (XX12).
 * Reihenfolge der Personen = Stammbaum-Zweig-Reihenfolge; die Codes selbst sind nicht fortlaufend.
 * Bereits eingetragene Nummern (manuell oder früheres Format) bleiben unverändert.
 */
export function assignMissingMitgliedsNummern(
  personen: K2FamiliePerson[],
  ichBinPersonId: string | undefined
): K2FamiliePerson[] {
  if (personen.length === 0) return personen
  const sorted = buildStammbaumKartenState(personen, ichBinPersonId).sortedPersonen
  const used = mitgliedsNummernImGebrauch(personen)
  const byId = new Map(personen.map((p) => [p.id, p]))
  const now = new Date().toISOString()
  let changed = false
  for (const p of sorted) {
    const cur = byId.get(p.id)
    if (!cur) continue
    if (cur.verstorben) continue
    if (trimMitgliedsNummerEingabe(cur.mitgliedsNummer)) continue
    changed = true
    const code = zieheEindeutigenMitgliedsCode(used)
    const updated = { ...cur, mitgliedsNummer: code, updatedAt: now }
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
