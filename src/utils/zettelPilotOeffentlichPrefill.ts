/**
 * Testpilot-Zettel-Link (?vorname=&entwurf=1): Anzeigename in öffentliche Martina-Stammdaten,
 * wenn noch Muster/leer – eine Quelle für Galerie-Willkommen und Admin „Meine Daten“.
 * Überschreibt keine manuell geänderten Namen.
 */
import { MUSTER_TEXTE } from '../config/tenantConfig'
import { loadStammdaten, saveStammdaten } from './stammdatenStorage'

export function applyZettelPilotVornameToOeffentlichMartina(pilotName: string): boolean {
  const trimmed = pilotName.trim()
  if (!trimmed) return false
  try {
    const prev = loadStammdaten('oeffentlich', 'martina') as { name?: string }
    const musterN = (MUSTER_TEXTE.martina.name || '').trim()
    const curN = (prev.name || '').trim()
    const fillN = !curN || curN === musterN
    if (!fillN) return false
    const next = { ...prev, name: trimmed }
    saveStammdaten('oeffentlich', 'martina', next, { merge: true })
    return true
  } catch {
    return false
  }
}
