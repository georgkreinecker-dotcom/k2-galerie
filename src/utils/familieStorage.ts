/**
 * K2 Familie – eine Schicht für Personen pro Tenant (Phase 1.2, 1.3).
 * Lese-/Schreibzugriffe laufen über diese Schicht. Gleiche Schutzregeln wie artworksStorage:
 * keine automatischen Löschungen, nicht mit weniger überschreiben außer allowReduce nach User-Aktion.
 * Bei Supabase konfiguriert: nach jedem Save Push zu Supabase (dynamischer Import, kein Zyklus).
 * Siehe docs/K2-FAMILIE-DATENMODELL.md, Regel niemals-kundendaten-loeschen.
 */

import type { K2FamiliePerson, K2FamilieMoment, K2FamilieEvent, K2FamilieGabe, K2FamilieBeitrag, K2FamilieEinstellungen, K2FamilieZweig } from '../types/k2Familie'
import { getK2FamiliePersonenKey, getK2FamilieMomenteKey, getK2FamilieEventsKey, getK2FamilieGabenKey, getK2FamilieBeitraegeKey, getK2FamilieEinstellungenKey, getK2FamilieZweigeKey } from '../types/k2Familie'
import { isSupabaseConfigured } from './supabaseClient'

/** Erster Tenant (eine Familie) für den Start. Später: mehrere TenantIds pro Lizenz. */
export const K2_FAMILIE_DEFAULT_TENANT = 'default'

/** Max. 10 MB pro Key (localStorage). Großfamilien: Fotos komprimieren oder extern; siehe docs/K2-FAMILIE-SKALIERUNG-GROSSFAMILIEN.md */
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
    if (isSupabaseConfigured()) {
      import('./familieSupabaseClient').then((m) =>
        m.saveFamilieToSupabase(tenantId, {
          personen: arr,
          momente: loadMomente(tenantId),
          events: loadEvents(tenantId),
        })
      ).catch((e) => console.warn('Supabase Push (Personen) fehlgeschlagen:', e))
    }
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
    if (isSupabaseConfigured()) {
      import('./familieSupabaseClient').then((m) =>
        m.saveFamilieToSupabase(tenantId, {
          personen: loadPersonen(tenantId),
          momente: arr,
          events: loadEvents(tenantId),
        })
      ).catch((e) => console.warn('Supabase Push (Momente) fehlgeschlagen:', e))
    }
    return true
  } catch (e) {
    console.error('❌ familieStorage: Fehler beim Schreiben (Momente)', e)
    return false
  }
}

/**
 * Lädt Events für einen Tenant. Keine Filterung, keine automatische Änderung.
 */
export function loadEvents(tenantId: string): K2FamilieEvent[] {
  const key = getK2FamilieEventsKey(tenantId)
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
 * Speichert Events für einen Tenant. Schutz: nicht mit weniger überschreiben,
 * außer allowReduce (z. B. nach explizitem Löschen durch User).
 */
export function saveEvents(
  tenantId: string,
  list: K2FamilieEvent[],
  options: { allowReduce?: boolean } = {}
): boolean {
  const key = getK2FamilieEventsKey(tenantId)
  const current = loadEvents(tenantId)
  const currentCount = current.length
  const arr = Array.isArray(list) ? list : []

  if (arr.length < currentCount && !options.allowReduce) {
    console.warn(`⚠️ familieStorage: Events speichern würde ${currentCount} → ${arr.length} reduzieren, abgelehnt`)
    return false
  }
  try {
    const json = JSON.stringify(arr)
    if (json.length > MAX_JSON_SIZE) {
      console.error('❌ familieStorage: Events-Daten zu groß')
      return false
    }
    localStorage.setItem(key, json)
    if (isSupabaseConfigured()) {
      import('./familieSupabaseClient').then((m) =>
        m.saveFamilieToSupabase(tenantId, {
          personen: loadPersonen(tenantId),
          momente: loadMomente(tenantId),
          events: arr,
        })
      ).catch((e) => console.warn('Supabase Push (Events) fehlgeschlagen:', e))
    }
    return true
  } catch (e) {
    console.error('❌ familieStorage: Fehler beim Schreiben (Events)', e)
    return false
  }
}

/**
 * Lädt Gaben (Gedenkort) für einen Tenant. Phase 5.
 */
export function loadGaben(tenantId: string): K2FamilieGabe[] {
  const key = getK2FamilieGabenKey(tenantId)
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
 * Speichert Gaben für einen Tenant. Phase 5. Kein Supabase-Push (lokal nur).
 */
export function saveGaben(tenantId: string, list: K2FamilieGabe[]): boolean {
  const key = getK2FamilieGabenKey(tenantId)
  const arr = Array.isArray(list) ? list : []
  try {
    const json = JSON.stringify(arr)
    if (json.length > MAX_JSON_SIZE) {
      console.error('❌ familieStorage: Gaben-Daten zu groß')
      return false
    }
    localStorage.setItem(key, json)
    return true
  } catch (e) {
    console.error('❌ familieStorage: Fehler beim Schreiben (Gaben)', e)
    return false
  }
}

/**
 * Lädt Beiträge („Was unsere Familie dazu weiß“) für einen Tenant.
 */
export function loadBeitraege(tenantId: string): K2FamilieBeitrag[] {
  const key = getK2FamilieBeitraegeKey(tenantId)
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
 * Speichert Beiträge für einen Tenant.
 */
export function saveBeitraege(tenantId: string, list: K2FamilieBeitrag[]): boolean {
  const key = getK2FamilieBeitraegeKey(tenantId)
  const arr = Array.isArray(list) ? list : []
  try {
    const json = JSON.stringify(arr)
    if (json.length > MAX_JSON_SIZE) {
      console.error('❌ familieStorage: Beiträge-Daten zu groß')
      return false
    }
    localStorage.setItem(key, json)
    return true
  } catch (e) {
    console.error('❌ familieStorage: Fehler beim Schreiben (Beiträge)', e)
    return false
  }
}

/**
 * Lädt Einstellungen (Startpunkt etc.) für einen Tenant.
 */
export function loadEinstellungen(tenantId: string): K2FamilieEinstellungen {
  const key = getK2FamilieEinstellungenKey(tenantId)
  try {
    const stored = localStorage.getItem(key)
    if (!stored) return {}
    const parsed = JSON.parse(stored)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

/**
 * Speichert Einstellungen für einen Tenant.
 */
export function saveEinstellungen(tenantId: string, data: K2FamilieEinstellungen): boolean {
  const key = getK2FamilieEinstellungenKey(tenantId)
  const obj = data && typeof data === 'object' ? data : {}
  try {
    const json = JSON.stringify(obj)
    if (json.length > MAX_JSON_SIZE) {
      console.error('❌ familieStorage: Einstellungen zu groß')
      return false
    }
    localStorage.setItem(key, json)
    return true
  } catch (e) {
    console.error('❌ familieStorage: Fehler beim Schreiben (Einstellungen)', e)
    return false
  }
}

/**
 * Lädt Zweige (Option C: ein Tenant, Zweig = Personenliste + Verwalter) für einen Tenant.
 */
export function loadZweige(tenantId: string): K2FamilieZweig[] {
  const key = getK2FamilieZweigeKey(tenantId)
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
 * Speichert Zweige für einen Tenant.
 */
export function saveZweige(tenantId: string, list: K2FamilieZweig[]): boolean {
  const key = getK2FamilieZweigeKey(tenantId)
  const arr = Array.isArray(list) ? list : []
  try {
    const json = JSON.stringify(arr)
    if (json.length > MAX_JSON_SIZE) {
      console.error('❌ familieStorage: Zweige-Daten zu groß')
      return false
    }
    localStorage.setItem(key, json)
    return true
  } catch (e) {
    console.error('❌ familieStorage: Fehler beim Schreiben (Zweige)', e)
    return false
  }
}
