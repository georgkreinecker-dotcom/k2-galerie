/**
 * Persönliche Mitgliedsnummern (Produktentscheidung B): Abgleich Eingabe → Person in dieser Familie.
 * Nur k2-familie-* / Personenliste; keine Vermischung mit K2/ök2/VK2.
 */
import type { K2FamiliePerson } from '../types/k2Familie'

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
