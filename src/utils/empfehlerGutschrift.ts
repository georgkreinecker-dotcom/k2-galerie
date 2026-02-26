/**
 * Gutschriften für das Empfehlungs-Programm (10 % pro geworbenem Kunden).
 * Pro Lizenz mit Empfehler-ID wird eine Gutschrift für den Empfehler verbucht.
 */

const STORAGE_KEY = 'k2-empfehler-gutschriften'

export interface GutschriftEintrag {
  empfehlerId: string
  betrag: number
  licenceId: string
  datum: string
}

function loadGutschriften(): GutschriftEintrag[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (e): e is GutschriftEintrag =>
        e && typeof e.empfehlerId === 'string' && typeof e.betrag === 'number' && typeof e.licenceId === 'string' && typeof e.datum === 'string'
    )
  } catch {
    return []
  }
}

function saveGutschriften(entries: GutschriftEintrag[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch (_) {}
}

/** Fügt eine Gutschrift für den Empfehler hinzu (10 % der Lizenzgebühr). */
export function addGutschrift(empfehlerId: string, betrag: number, licenceId: string): void {
  if (betrag <= 0) return
  const entries = loadGutschriften()
  entries.push({
    empfehlerId: empfehlerId.trim(),
    betrag,
    licenceId,
    datum: new Date().toISOString(),
  })
  saveGutschriften(entries)
}

/** Summe der Gutschriften für eine Empfehler-ID (noch nicht verbraucht). */
export function getGutschriftSumme(empfehlerId: string): number {
  const entries = loadGutschriften()
  return entries
    .filter((e) => e.empfehlerId === empfehlerId.trim())
    .reduce((sum, e) => sum + e.betrag, 0)
}
