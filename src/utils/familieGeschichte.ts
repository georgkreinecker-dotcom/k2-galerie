/**
 * K2 Familie – Vorschlag für zusammenfassende Geschichte aus Events + Momente ab Zeitpunkt.
 * Ein Standard: eine Funktion, viele Aufrufer (Sportwagenmodus).
 */

import type { K2FamilieEvent, K2FamilieMoment, K2FamiliePerson } from '../types/k2Familie'

type Eintrag = { date: string; type: 'event' | 'moment'; title: string; detail?: string; personName?: string }

/**
 * Baut einen Fließtext-Vorschlag aus Events und Momenten ab dem angegebenen Datum.
 * Sortiert nach Datum; Format: "YYYY-MM-DD: Titel. Detail."
 */
export function buildGeschichteVorschlag(
  events: K2FamilieEvent[],
  momente: K2FamilieMoment[],
  personen: K2FamiliePerson[],
  abDatum: string
): string {
  const personById = new Map(personen.map((p) => [p.id, p]))
  const list: Eintrag[] = []

  events.forEach((e) => {
    if (e.date >= abDatum) {
      list.push({
        date: e.date,
        type: 'event',
        title: e.title,
        detail: e.note?.trim() || undefined,
      })
    }
  })

  momente.forEach((m) => {
    if (m.date && m.date >= abDatum) {
      const personName = personById.get(m.personId)?.name
      list.push({
        date: m.date,
        type: 'moment',
        title: m.title,
        detail: m.text?.trim() || undefined,
        personName: personName || undefined,
      })
    }
  })

  list.sort((a, b) => a.date.localeCompare(b.date))

  const lines: string[] = []
  let lastYear = ''
  for (const e of list) {
    const year = e.date.slice(0, 4)
    if (year !== lastYear) {
      if (lastYear) lines.push('')
      lines.push(`${year}:`)
      lastYear = year
    }
    const sub = e.type === 'moment' && e.personName ? ` (${e.personName})` : ''
    const detail = e.detail ? ` – ${e.detail}` : ''
    lines.push(`  ${e.date}: ${e.title}${sub}${detail}`)
  }

  return lines.join('\n').trim() || 'Noch keine Einträge ab diesem Datum. Events und Momente (mit Datum) erscheinen hier.'
}
