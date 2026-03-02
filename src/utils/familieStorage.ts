/**
 * K2 Familie – eine Schicht für Personen pro Tenant (Phase 1.2, 1.3).
 * Lese-/Schreibzugriffe laufen über diese Schicht. Gleiche Schutzregeln wie artworksStorage:
 * keine automatischen Löschungen, nicht mit weniger überschreiben außer allowReduce nach User-Aktion.
 * Siehe docs/K2-FAMILIE-DATENMODELL.md, Regel niemals-kundendaten-loeschen.
 */

import type { K2FamiliePerson, K2FamilieMoment } from '../types/k2Familie'
import { getK2FamiliePersonenKey, getK2FamilieMomenteKey } from '../types/k2Familie'

/** Erster Tenant (eine Familie) für den Start. Später: mehrere TenantIds pro Lizenz. */
export const K2_FAMILIE_DEFAULT_TENANT = 'default'

const MAX_JSON_SIZE = 10_000_000

/**
 * Lädt Personen für einen Tenant. Keine Filterung, keine automatische Änderung der Daten.
 */
export function loadPersonen(tenantId: string): K2FamiliePerson[] {
  const key = getK2FamiliePersonenKey(tenantId)
  try {
    const stored = localStorage.getItem(key)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * Speichert Personen für einen Tenant. Schutz: nicht mit 0 oder weniger Einträgen überschreiben,
 * außer allowReduce (z. B. nach explizitem Löschen durch User).
 */
export function savePersonen(
  tenantId: string,
  list: K2FamiliePerson[],
  options: { allowReduce?: boolean } = {}
): boolean {
  const key = getK2FamiliePersonenKey(tenantId)
  const current = loadPersonen(tenantId)
  const currentCount = current.length
  const arr = Array.isArray(list) ? list : []

  if (arr.length === 0 && currentCount > 0 && !options.allowReduce) {
    console.warn('⚠️ familieStorage: Speichern mit 0 Personen abgelehnt (Schutz)')
    return false
  }
  if (arr.length < currentCount && !options.allowReduce) {
    console.warn(`⚠️ familieStorage: Speichern würde ${currentCount} → ${arr.length} reduzieren, abgelehnt`)
    return false
  }
  try {
    const json = JSON.stringify(arr)
    if (json.length > MAX_JSON_SIZE) {
      console.error('❌ familieStorage: Daten zu groß')
      return false
    }
    localStorage.setItem(key, json)
    return true
  } catch (e) {
    console.error('❌ familieStorage: Fehler beim Schreiben', e)
    return false
  }
}

/**
 * Lädt Momente für einen Tenant. Keine Filterung, keine automatische Änderung.
 */
export function loadMomente(tenantId: string): K2FamilieMoment[] {
  const key = getK2FamilieMomenteKey(tenantId)
  try {
    const stored = localStorage.getItem(key)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * Speichert Momente für einen Tenant. Schutz: nicht mit weniger überschreiben,
 * außer allowReduce (z. B. nach explizitem Löschen durch User).
 */
export function saveMomente(
  tenantId: string,
  list: K2FamilieMoment[],
  options: { allowReduce?: boolean } = {}
): boolean {
  const key = getK2FamilieMomenteKey(tenantId)
  const current = loadMomente(tenantId)
  const currentCount = current.length
  const arr = Array.isArray(list) ? list : []

  if (arr.length < currentCount && !options.allowReduce) {
    console.warn(`⚠️ familieStorage: Momente speichern würde ${currentCount} → ${arr.length} reduzieren, abgelehnt`)
    return false
  }
  try {
    const json = JSON.stringify(arr)
    if (json.length > MAX_JSON_SIZE) {
      console.error('❌ familieStorage: Momente-Daten zu groß')
      return false
    }
    localStorage.setItem(key, json)
    return true
  } catch (e) {
    console.error('❌ familieStorage: Fehler beim Schreiben (Momente)', e)
    return false
  }
}
