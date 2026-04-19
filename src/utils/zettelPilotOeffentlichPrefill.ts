/**
 * Testpilot-Zettel-Link (?vorname=&entwurf=1): Anzeigename in öffentliche Martina-Stammdaten,
 * wenn noch Muster/leer – eine Quelle für Galerie-Willkommen und Admin „Meine Daten“.
 * Bei Entwurf mit neuem ?vorname= wird die Demo auf Muster zurückgesetzt (geteilter ök2-Speicher).
 */
import { MUSTER_TEXTE } from '../config/tenantConfig'
import { loadStammdaten, saveStammdaten } from './stammdatenStorage'
import {
  resetOeffentlichStammdatenToMusterDemo,
  SESSION_OEK2_ZETTEL_VORNAME_KEY,
} from './oeffentlichStammdatenMuster'

export function applyZettelPilotVornameToOeffentlichMartina(
  pilotName: string,
  opts?: { force?: boolean }
): boolean {
  const trimmed = pilotName.trim()
  if (!trimmed) return false
  try {
    const prev = loadStammdaten('oeffentlich', 'martina') as { name?: string }
    const musterN = (MUSTER_TEXTE.martina.name || '').trim()
    const curN = (prev.name || '').trim()
    const fillN = opts?.force || !curN || curN === musterN
    if (!fillN) return false
    const next = { ...prev, name: trimmed }
    saveStammdaten('oeffentlich', 'martina', next, { merge: true })
    return true
  } catch {
    return false
  }
}

/**
 * Galerie ök2 mit ?vorname=&entwurf=1: Wechsel des Zettels → Demo-Stammdaten auf Muster, dann Anzeigename setzen.
 * Gleicher Browser = ein Speicher; ohne Reset blieben Namen/Angaben eines „alten“ Piloten sichtbar.
 */
export function runOek2ZettelPilotEntwurfPrefill(urlName: string): void {
  const trimmed = urlName.trim()
  if (!trimmed) return
  try {
    const last = sessionStorage.getItem(SESSION_OEK2_ZETTEL_VORNAME_KEY)
    if (last !== trimmed) {
      resetOeffentlichStammdatenToMusterDemo()
      sessionStorage.setItem(SESSION_OEK2_ZETTEL_VORNAME_KEY, trimmed)
    }
  } catch {
    /* ignore */
  }
  applyZettelPilotVornameToOeffentlichMartina(trimmed, { force: true })
}

export function clearOek2ZettelPilotVornameSessionMarker(): void {
  try {
    sessionStorage.removeItem(SESSION_OEK2_ZETTEL_VORNAME_KEY)
  } catch {
    /* ignore */
  }
}
