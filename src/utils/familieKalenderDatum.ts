/**
 * K2 Familie – Kalender: lokales ISO-Datum (YYYY-MM-DD) und Monatsraster Mo–So.
 */

export function todayIsoLocal(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Leerzellen (null) + Tag 1…n, Woche beginnt Montag. */
export function buildMonthDayCells(year: number, monthIndex0: number): (number | null)[] {
  const first = new Date(year, monthIndex0, 1)
  const dowSun0 = first.getDay()
  const monday0 = (dowSun0 + 6) % 7
  const dim = new Date(year, monthIndex0 + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < monday0; i++) cells.push(null)
  for (let d = 1; d <= dim; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export function isoDateFromParts(year: number, monthIndex0: number, day: number): string {
  const m = String(monthIndex0 + 1).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}-${m}-${dd}`
}

/** MM-DD aus YYYY-MM-DD; ungültig → null */
export function parseGeburtsMonatTag(iso: string | undefined): { m: number; d: number } | null {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso.trim())) return null
  const m = Number(iso.slice(5, 7))
  const d = Number(iso.slice(8, 10))
  if (!m || !d || m > 12 || d > 31) return null
  return { m, d }
}

/** Gleiches Monat/Tag wie bei vollem ISO-Datum (Geburt, Sterben, …). */
export function istJahrestagAmIsoDatum(
  isoDatum: string | undefined,
  monthIndex0: number,
  day: number
): boolean {
  const md = parseGeburtsMonatTag(isoDatum)
  if (!md) return false
  return md.m === monthIndex0 + 1 && md.d === day
}

export function istGeburtstagAmTag(
  geburtsdatumIso: string | undefined,
  monthIndex0: number,
  day: number
): boolean {
  return istJahrestagAmIsoDatum(geburtsdatumIso, monthIndex0, day)
}

export function isoDateFromDateLocal(d: Date): string {
  return isoDateFromParts(d.getFullYear(), d.getMonth(), d.getDate())
}

/** Montag–Sonntag (lokal), Woche die den 1. des Monats enthält. */
export function weekRangeMondaySundayContainingMonthFirst(year: number, monthIndex0: number): { start: string; end: string } {
  const first = new Date(year, monthIndex0, 1)
  const dow = first.getDay()
  const fromMon = (dow + 6) % 7
  const monday = new Date(year, monthIndex0, 1 - fromMon)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return { start: isoDateFromDateLocal(monday), end: isoDateFromDateLocal(sunday) }
}

export function lastDayOfMonth(year: number, monthIndex0: number): number {
  return new Date(year, monthIndex0 + 1, 0).getDate()
}
