/**
 * Nächste Pilot-Zettel-Nummer (localStorage). Neue Runden beginnen bei mindestens 10.
 */

export const PILOT_ZETTEL_NR_KEY = 'k2-pilot-zettel-last-nr'

/** Erste vergebene Zettel-Nr., wenn noch kein Stand gespeichert ist bzw. nach Reset. */
export const PILOT_ZETTEL_NR_MIN_NEXT = 10

export function getNextPilotZettelNr(): string {
  try {
    const last = localStorage.getItem(PILOT_ZETTEL_NR_KEY)
    const n = last ? parseInt(last, 10) : PILOT_ZETTEL_NR_MIN_NEXT - 1
    const lastNum = Number.isNaN(n) ? PILOT_ZETTEL_NR_MIN_NEXT - 1 : n
    const rawNext = lastNum + 1
    return String(Math.max(rawNext, PILOT_ZETTEL_NR_MIN_NEXT))
  } catch {
    return String(PILOT_ZETTEL_NR_MIN_NEXT)
  }
}

export function setLastPilotZettelNr(nr: string): void {
  try {
    const n = parseInt(nr, 10)
    if (!Number.isNaN(n) && n > 0) localStorage.setItem(PILOT_ZETTEL_NR_KEY, String(n))
  } catch {
    /* ignore */
  }
}
