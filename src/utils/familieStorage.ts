/**
 * K2 Familie – eine Schicht für Personen pro Tenant (Phase 1.2, 1.3).
 * Lese-/Schreibzugriffe laufen über diese Schicht. Gleiche Schutzregeln wie artworksStorage:
 * keine automatischen Löschungen, nicht mit weniger überschreiben außer allowReduce nach User-Aktion.
 * Bei Supabase konfiguriert: nach jedem Save Push zu Supabase (dynamischer Import, kein Zyklus).
 * Siehe docs/K2-FAMILIE-DATENMODELL.md, Regel niemals-kundendaten-loeschen.
 */

import type { K2FamiliePerson, K2FamilieMoment, K2FamilieEvent, K2FamilieGabe, K2FamilieBeitrag, K2FamilieEinstellungen, K2FamilieZweig, K2FamilieGeschichte } from '../types/k2Familie'
import { getK2FamiliePersonenKey, getK2FamilieMomenteKey, getK2FamilieEventsKey, getK2FamilieGabenKey, getK2FamilieBeitraegeKey, getK2FamilieEinstellungenKey, getK2FamilieZweigeKey, getK2FamilieGeschichtenKey } from '../types/k2Familie'
import { clearIdentitaetBestaetigt, clearGerateVertrauen } from './familieIdentitaetStorage'
import { isFamilieMusterHuberDemoReadOnly } from './familieMusterWriteGuard'
import { isSupabaseConfigured } from './supabaseClient'

/** Erster Tenant (eine Familie) für den Start. Später: mehrere TenantIds pro Lizenz. */
export const K2_FAMILIE_DEFAULT_TENANT = 'default'

/** CustomEvent-Name: Einstellungen oder Personen haben sich geändert (Layout/Rollen neu berechnen). */
export const K2_FAMILIE_SESSION_UPDATED = 'k2-familie-einstellungen-updated'

/** Platzhalter aus fehlerhaften QR/Links — nie als echte Familie anlegen. */
export const K2_FAMILIE_NIL_TENANT_PLACEHOLDER = '00000000-0000-0000-0000-000000000000'

/**
 * Erlaubte Tenant-IDs für Einladungs-Links (?t=) und localStorage-Keys.
 * Kleinschreibung, Ziffern, Bindestrich; keine Leerzeichen/sonstigen Zeichen.
 */
export function isValidFamilieTenantId(id: string): boolean {
  const t = id?.trim()
  if (!t || t.length > 64) return false
  const lower = t.toLowerCase()
  if (lower === K2_FAMILIE_NIL_TENANT_PLACEHOLDER) return false
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(lower)
}

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
  options: { allowReduce?: boolean; skipMusterDemoGuard?: boolean } = {}
): boolean {
  if (!options.skipMusterDemoGuard && isFamilieMusterHuberDemoReadOnly(tenantId)) {
    console.warn('⚠️ familieStorage: Musterfamilie (Demo-Sitzung) ist nur lesend – Speichern abgelehnt')
    return false
  }
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
          einstellungen: loadEinstellungen(tenantId),
        })
      ).catch((e) => console.warn('Supabase Push (Personen) fehlgeschlagen:', e))
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(K2_FAMILIE_SESSION_UPDATED, { detail: { tenantId } }))
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
  options: { allowReduce?: boolean; skipMusterDemoGuard?: boolean } = {}
): boolean {
  if (!options.skipMusterDemoGuard && isFamilieMusterHuberDemoReadOnly(tenantId)) {
    console.warn('⚠️ familieStorage: Musterfamilie (Demo-Sitzung) ist nur lesend – Momente speichern abgelehnt')
    return false
  }
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
          einstellungen: loadEinstellungen(tenantId),
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
  options: { allowReduce?: boolean; skipMusterDemoGuard?: boolean } = {}
): boolean {
  if (!options.skipMusterDemoGuard && isFamilieMusterHuberDemoReadOnly(tenantId)) {
    console.warn('⚠️ familieStorage: Musterfamilie (Demo-Sitzung) ist nur lesend – Events speichern abgelehnt')
    return false
  }
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
          einstellungen: loadEinstellungen(tenantId),
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
export function saveGaben(
  tenantId: string,
  list: K2FamilieGabe[],
  options: { skipMusterDemoGuard?: boolean } = {}
): boolean {
  if (!options.skipMusterDemoGuard && isFamilieMusterHuberDemoReadOnly(tenantId)) {
    console.warn('⚠️ familieStorage: Musterfamilie (Demo-Sitzung) ist nur lesend – Gaben speichern abgelehnt')
    return false
  }
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
export function saveBeitraege(
  tenantId: string,
  list: K2FamilieBeitrag[],
  options: { skipMusterDemoGuard?: boolean } = {}
): boolean {
  if (!options.skipMusterDemoGuard && isFamilieMusterHuberDemoReadOnly(tenantId)) {
    console.warn('⚠️ familieStorage: Musterfamilie (Demo-Sitzung) ist nur lesend – Beiträge speichern abgelehnt')
    return false
  }
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
 * Nach Cloud-Laden: Server-Einstellungen mit lokalem Stand zusammenführen.
 * **Wer bin Du** (`ichBinPersonId` / Geschwisterposition) wird nicht vom Server überschrieben,
 * wenn lokal bereits eine Person gewählt ist – sonst verdrängt ein verzögerter oder alter
 * Cloud-Stand die gerade gespeicherte Wahl (Race: Speichern + „Daten vom Server laden“).
 */
export function mergeEinstellungenFromServer(
  local: K2FamilieEinstellungen,
  server: K2FamilieEinstellungen
): K2FamilieEinstellungen {
  const merged: K2FamilieEinstellungen = { ...local, ...server }
  const ichLocal = local.ichBinPersonId?.trim()
  if (ichLocal) {
    merged.ichBinPersonId = local.ichBinPersonId
    if (local.ichBinPositionAmongSiblings !== undefined) {
      merged.ichBinPositionAmongSiblings = local.ichBinPositionAmongSiblings
    }
  }
  return merged
}

/**
 * Speichert Einstellungen für einen Tenant.
 */
export function saveEinstellungen(
  tenantId: string,
  data: K2FamilieEinstellungen,
  options: { skipMusterDemoGuard?: boolean } = {}
): boolean {
  if (!options.skipMusterDemoGuard && isFamilieMusterHuberDemoReadOnly(tenantId)) {
    console.warn('⚠️ familieStorage: Musterfamilie (Demo-Sitzung) ist nur lesend – Einstellungen speichern abgelehnt')
    return false
  }
  const key = getK2FamilieEinstellungenKey(tenantId)
  const patch = data && typeof data === 'object' ? data : {}
  const prev = loadEinstellungen(tenantId)
  let merged: K2FamilieEinstellungen = { ...prev, ...patch }

  const ich = merged.ichBinPersonId?.trim()
  const hadDesignated = prev.inhaberPersonId?.trim()
  const designatedNow = merged.inhaberPersonId?.trim()
  /**
   * Erste technische Festlegung: nur wenn noch nie eine Inhaber:in gespeichert war und genau eine
   * Person in der Familie existiert — dann ist diese Person die Inhaber:in (Ein-Personen-Fall).
   */
  if (ich && !designatedNow && !hadDesignated) {
    const personen = loadPersonen(tenantId)
    const countWithId = personen.filter((p) => p?.id?.trim()).length
    if (countWithId === 1) {
      merged = { ...merged, inhaberPersonId: ich }
    }
  }

  try {
    const json = JSON.stringify(merged)
    if (json.length > MAX_JSON_SIZE) {
      console.error('❌ familieStorage: Einstellungen zu groß')
      return false
    }
    localStorage.setItem(key, json)
    const prevIch = prev.ichBinPersonId?.trim() || ''
    const nextIch = merged.ichBinPersonId?.trim() || ''
    /** Nur bei echtem Wechsel des „Du“ (nicht Erst-Registrierung leer → Person): sonst unnötiges Leeren + Event vor setIdentitaet – auf Mobilgeräten problematisch. */
    if (prevIch && prevIch !== nextIch) {
      clearIdentitaetBestaetigt(tenantId)
      clearGerateVertrauen(tenantId)
    }
    if (isSupabaseConfigured()) {
      import('./familieSupabaseClient').then((m) =>
        m.saveFamilieToSupabase(tenantId, {
          personen: loadPersonen(tenantId),
          momente: loadMomente(tenantId),
          events: loadEvents(tenantId),
          einstellungen: merged,
        })
      ).catch((e) => console.warn('Supabase Push (Einstellungen) fehlgeschlagen:', e))
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(K2_FAMILIE_SESSION_UPDATED, { detail: { tenantId } }))
    }
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
export function saveZweige(
  tenantId: string,
  list: K2FamilieZweig[],
  options: { skipMusterDemoGuard?: boolean } = {}
): boolean {
  if (!options.skipMusterDemoGuard && isFamilieMusterHuberDemoReadOnly(tenantId)) {
    console.warn('⚠️ familieStorage: Musterfamilie (Demo-Sitzung) ist nur lesend – Zweige speichern abgelehnt')
    return false
  }
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

/**
 * Lädt Geschichten (zusammenfassende Geschichte ab Zeitpunkt) für einen Tenant.
 */
export function loadGeschichten(tenantId: string): K2FamilieGeschichte[] {
  const key = getK2FamilieGeschichtenKey(tenantId)
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
 * Speichert Geschichten für einen Tenant.
 */
export function saveGeschichten(
  tenantId: string,
  list: K2FamilieGeschichte[],
  options: { skipMusterDemoGuard?: boolean } = {}
): boolean {
  if (!options.skipMusterDemoGuard && isFamilieMusterHuberDemoReadOnly(tenantId)) {
    console.warn('⚠️ familieStorage: Musterfamilie (Demo-Sitzung) ist nur lesend – Geschichten speichern abgelehnt')
    return false
  }
  const key = getK2FamilieGeschichtenKey(tenantId)
  const arr = Array.isArray(list) ? list : []
  try {
    const json = JSON.stringify(arr)
    if (json.length > MAX_JSON_SIZE) {
      console.error('❌ familieStorage: Geschichten-Daten zu groß')
      return false
    }
    localStorage.setItem(key, json)
    return true
  } catch (e) {
    console.error('❌ familieStorage: Fehler beim Schreiben (Geschichten)', e)
    return false
  }
}

/**
 * Person endgültig löschen (nur nach expliziter User-Aktion).
 * Entfernt die Person und alle Referenzen in anderen Personen, Momenten, Beiträgen, Events;
 * setzt Einstellungen zurück, wenn sie auf diese Person zeigten.
 * Returns true wenn alles gespeichert wurde.
 */
export function deletePersonWithCleanup(tenantId: string, personId: string): boolean {
  if (isFamilieMusterHuberDemoReadOnly(tenantId)) {
    console.warn('⚠️ familieStorage: Musterfamilie (Demo-Sitzung) ist nur lesend – Löschen abgelehnt')
    return false
  }
  const einstGuard = loadEinstellungen(tenantId)
  if (einstGuard.stammbaumPersonenLoeschenGesperrt) {
    console.warn('⚠️ familieStorage: Personen löschen ist gesperrt (Inhaber:in unter Einstellungen)')
    return false
  }
  const personen = loadPersonen(tenantId).filter((p) => p.id !== personId)
  if (personen.length === loadPersonen(tenantId).length) return false // Person war nicht vorhanden

  const cleaned = personen.map((p) => ({
    ...p,
    parentIds: p.parentIds.filter((id) => id !== personId),
    childIds: p.childIds.filter((id) => id !== personId),
    partners: p.partners.filter((pr) => pr.personId !== personId),
    siblingIds: p.siblingIds.filter((id) => id !== personId),
    wahlfamilieIds: p.wahlfamilieIds.filter((id) => id !== personId),
  }))

  if (!savePersonen(tenantId, cleaned, { allowReduce: true })) return false

  const momente = loadMomente(tenantId).filter((m) => m.personId !== personId)
  if (!saveMomente(tenantId, momente, { allowReduce: true })) return false

  const beitraege = loadBeitraege(tenantId).filter((b) => b.personId !== personId)
  if (!saveBeitraege(tenantId, beitraege)) return false

  const events = loadEvents(tenantId).map((ev) => ({
    ...ev,
    participantIds: ev.participantIds.filter((id) => id !== personId),
  }))
  if (!saveEvents(tenantId, events, { allowReduce: true })) return false

  const einst = loadEinstellungen(tenantId)
  const needEinst =
    einst.ichBinPersonId === personId ||
    einst.partnerHerkunftPersonId === personId ||
    einst.startpunktPersonId === personId
  if (needEinst) {
    saveEinstellungen(tenantId, {
      ...einst,
      ...(einst.ichBinPersonId === personId ? { ichBinPersonId: undefined, ichBinPositionAmongSiblings: undefined } : {}),
      ...(einst.partnerHerkunftPersonId === personId ? { partnerHerkunftPersonId: undefined } : {}),
      ...(einst.startpunktPersonId === personId ? { startpunktPersonId: undefined } : {}),
    })
  }

  return true
}
