/**
 * K2 Familie – zwei Familien (Tenants) zu einer zusammenführen.
 * Quelle wird in den Ziel-Tenant gemerged; alle Personen-IDs aus der Quelle erhalten neue IDs,
 * Beziehungen werden umgeschrieben. Anschließend wird die Quelle aus der Liste entfernt und der Speicher geleert.
 * Nur nach expliziter Nutzeraktion (Admin / Inhaber:in).
 */

import type { K2FamilieEinstellungen, K2FamiliePerson } from '../types/k2Familie'
import {
  getK2FamilieBeitraegeKey,
  getK2FamilieEinstellungenKey,
  getK2FamilieEventsKey,
  getK2FamilieGabenKey,
  getK2FamilieGeschichtenKey,
  getK2FamilieMomenteKey,
  getK2FamiliePersonenKey,
  getK2FamilieZweigeKey,
} from '../types/k2Familie'
import { clearGerateVertrauen, clearIdentitaetBestaetigt } from './familieIdentitaetStorage'
import {
  loadBeitraege,
  loadEinstellungen,
  loadEvents,
  loadGaben,
  loadGeschichten,
  loadMomente,
  loadPersonen,
  loadZweige,
  saveBeitraege,
  saveEinstellungen,
  saveEvents,
  saveGaben,
  saveGeschichten,
  saveMomente,
  savePersonen,
  saveZweige,
  K2_FAMILIE_SESSION_UPDATED,
  isValidFamilieTenantId,
  K2_FAMILIE_DEFAULT_TENANT,
} from './familieStorage'
import { saveFamilieToSupabase } from './familieSupabaseClient'
import { isSupabaseConfigured } from './supabaseClient'

const STORAGE_LIST = 'k2-familie-tenant-list'
const STORAGE_CURRENT = 'k2-familie-current-tenant'

function newEntityId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  } catch {
    /* ignore */
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

function loadTenantList(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_LIST)
    if (!raw) return [K2_FAMILIE_DEFAULT_TENANT]
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [K2_FAMILIE_DEFAULT_TENANT]
  } catch {
    return [K2_FAMILIE_DEFAULT_TENANT]
  }
}

/** Alle Ziel-Tenant-Keys vor dem Merge (Rollback bei Fehler). */
function snapshotZielTenantKeys(zielTenantId: string): Record<string, string | null> {
  const keys = [
    getK2FamiliePersonenKey(zielTenantId),
    getK2FamilieMomenteKey(zielTenantId),
    getK2FamilieEventsKey(zielTenantId),
    getK2FamilieGabenKey(zielTenantId),
    getK2FamilieBeitraegeKey(zielTenantId),
    getK2FamilieEinstellungenKey(zielTenantId),
    getK2FamilieZweigeKey(zielTenantId),
    getK2FamilieGeschichtenKey(zielTenantId),
    `k2-familie-${zielTenantId}-page-texts`,
    `k2-familie-${zielTenantId}-page-content`,
  ]
  const out: Record<string, string | null> = {}
  keys.forEach((k) => {
    try {
      out[k] = localStorage.getItem(k)
    } catch {
      out[k] = null
    }
  })
  return out
}

function restoreZielTenantSnapshot(snap: Record<string, string | null>) {
  Object.entries(snap).forEach(([k, v]) => {
    try {
      if (v == null) localStorage.removeItem(k)
      else localStorage.setItem(k, v)
    } catch {
      /* ignore */
    }
  })
}

function persistTenantList(list: string[]): boolean {
  try {
    localStorage.setItem(STORAGE_LIST, JSON.stringify(list))
    return true
  } catch (e) {
    console.error('familieMerge: tenant list speichern fehlgeschlagen', e)
    return false
  }
}

function persistCurrentTenant(id: string) {
  try {
    sessionStorage.setItem(STORAGE_CURRENT, id)
  } catch {
    /* ignore */
  }
  try {
    localStorage.setItem(STORAGE_CURRENT, id)
  } catch {
    /* ignore */
  }
}

function loadCurrentTenant(): string | null {
  try {
    const s = sessionStorage.getItem(STORAGE_CURRENT)?.trim()
    if (s) return s
  } catch {
    /* ignore */
  }
  try {
    return localStorage.getItem(STORAGE_CURRENT)?.trim() || null
  } catch {
    return null
  }
}

/** Alle k2-familie-{tenantId}-* Keys für einen Tenant entfernen + Identität. */
export function clearTenantFamilieStorage(tenantId: string): void {
  if (!isValidFamilieTenantId(tenantId)) return
  const keys = [
    getK2FamiliePersonenKey(tenantId),
    getK2FamilieMomenteKey(tenantId),
    getK2FamilieEventsKey(tenantId),
    getK2FamilieGabenKey(tenantId),
    getK2FamilieBeitraegeKey(tenantId),
    getK2FamilieEinstellungenKey(tenantId),
    getK2FamilieZweigeKey(tenantId),
    getK2FamilieGeschichtenKey(tenantId),
    `k2-familie-${tenantId}-page-texts`,
    `k2-familie-${tenantId}-page-content`,
  ]
  keys.forEach((k) => {
    try {
      localStorage.removeItem(k)
    } catch {
      /* ignore */
    }
  })
  clearIdentitaetBestaetigt(tenantId)
  clearGerateVertrauen(tenantId)
}

function mapRef(id: string, idMap: Map<string, string>): string {
  return idMap.get(id) ?? id
}

function remapPerson(p: K2FamiliePerson, idMap: Map<string, string>): K2FamiliePerson {
  const newId = idMap.get(p.id)
  if (!newId) return p
  return {
    ...p,
    id: newId,
    parentIds: p.parentIds.map((x) => mapRef(x, idMap)),
    childIds: p.childIds.map((x) => mapRef(x, idMap)),
    siblingIds: p.siblingIds.map((x) => mapRef(x, idMap)),
    wahlfamilieIds: p.wahlfamilieIds.map((x) => mapRef(x, idMap)),
    partners: p.partners.map((pr) => ({
      ...pr,
      personId: mapRef(pr.personId, idMap),
    })),
  }
}

function remapEinstPersonIds(e: K2FamilieEinstellungen, idMap: Map<string, string>): K2FamilieEinstellungen {
  const m = (id?: string) => (id && idMap.has(id) ? idMap.get(id)! : id)
  return {
    ...e,
    ichBinPersonId: m(e.ichBinPersonId),
    inhaberPersonId: m(e.inhaberPersonId),
    partnerHerkunftPersonId: m(e.partnerHerkunftPersonId),
    startpunktPersonId: m(e.startpunktPersonId),
  }
}

function mergeEinstellungenNachMerge(
  target: K2FamilieEinstellungen,
  sourceMapped: K2FamilieEinstellungen,
  finalDisplayName?: string
): K2FamilieEinstellungen {
  const name = finalDisplayName?.trim()
  let next: K2FamilieEinstellungen = {
    ...target,
    ...(name ? { familyDisplayName: name } : {}),
  }
  if (!next.inhaberPersonId?.trim() && sourceMapped.inhaberPersonId?.trim()) {
    next = { ...next, inhaberPersonId: sourceMapped.inhaberPersonId }
  }
  return next
}

function uniqueIds<T extends { id: string }>(items: T[], used: Set<string>): T[] {
  return items.map((item) => {
    let id = item.id
    if (!used.has(id)) {
      used.add(id)
      return item
    }
    let nid = newEntityId()
    while (used.has(nid)) nid = newEntityId()
    used.add(nid)
    return { ...item, id: nid }
  })
}

export type FamilieMergeResult = { ok: true; zielTenantId: string } | { ok: false; reason: string }

/**
 * Führt die Quell-Familie in die Ziel-Familie zusammen; die Quelle wird entfernt.
 * Ziel-Einstellungen (u. a. „Du“, Sicherheit) bleiben maßgeblich; fehlende Inhaber:in aus Quelle kann übernommen werden.
 */
export function mergeQuelleFamilieInZielFamilie(
  quelleTenantId: string,
  zielTenantId: string,
  options: { finalDisplayName?: string } = {}
): FamilieMergeResult {
  const q = quelleTenantId.trim()
  const z = zielTenantId.trim()
  if (!q || !z || q === z) return { ok: false, reason: 'Quelle und Ziel müssen unterschiedlich sein.' }
  if (!isValidFamilieTenantId(q) || !isValidFamilieTenantId(z)) return { ok: false, reason: 'Ungültige Familien-ID.' }

  const list = loadTenantList()
  if (!list.includes(q) || !list.includes(z)) return { ok: false, reason: 'Beide Familien müssen in der Liste der Geräte-Auswahl stehen.' }

  const snapZ = snapshotZielTenantKeys(z)
  const abort = (reason: string): FamilieMergeResult => {
    restoreZielTenantSnapshot(snapZ)
    return { ok: false, reason }
  }

  const personenZ = loadPersonen(z)
  const personenQ = loadPersonen(q)
  const idMap = new Map<string, string>()
  for (const p of personenQ) {
    idMap.set(p.id, newEntityId())
  }

  const remappedQ = personenQ.map((p) => remapPerson(p, idMap))
  const mergedPersonen = [...personenZ, ...remappedQ]
  if (!savePersonen(z, mergedPersonen, { allowReduce: false })) {
    return abort('Ziel-Personen konnten nicht gespeichert werden.')
  }

  const usedMomentIds = new Set(loadMomente(z).map((m) => m.id))
  const momZ = loadMomente(z)
  const momQ = loadMomente(q)
    .map((m) => ({
      ...m,
      personId: mapRef(m.personId, idMap),
    }))
  const mergedMomente = uniqueIds([...momZ, ...momQ], usedMomentIds)
  if (!saveMomente(z, mergedMomente, { allowReduce: true })) {
    return abort('Momente konnten nicht gespeichert werden.')
  }

  const usedEventIds = new Set(loadEvents(z).map((e) => e.id))
  const evZ = loadEvents(z)
  const evQ = loadEvents(q).map((e) => ({
    ...e,
    participantIds: e.participantIds.map((id) => mapRef(id, idMap)),
  }))
  const mergedEvents = uniqueIds([...evZ, ...evQ], usedEventIds)
  if (!saveEvents(z, mergedEvents, { allowReduce: true })) {
    return abort('Events konnten nicht gespeichert werden.')
  }

  const usedGabenIds = new Set(loadGaben(z).map((g) => g.id))
  const gaZ = loadGaben(z)
  const gaQ = loadGaben(q).map((g) => ({
    ...g,
    personId: mapRef(g.personId, idMap),
  }))
  const mergedGaben = uniqueIds([...gaZ, ...gaQ], usedGabenIds)
  if (!saveGaben(z, mergedGaben)) {
    return abort('Gaben konnten nicht gespeichert werden.')
  }

  const usedBeitragIds = new Set(loadBeitraege(z).map((b) => b.id))
  const beZ = loadBeitraege(z)
  const beQ = loadBeitraege(q).map((b) => ({
    ...b,
    personId: mapRef(b.personId, idMap),
  }))
  const mergedBeitraege = uniqueIds([...beZ, ...beQ], usedBeitragIds)
  if (!saveBeitraege(z, mergedBeitraege)) {
    return abort('Beiträge konnten nicht gespeichert werden.')
  }

  const usedZweigIds = new Set(loadZweige(z).map((x) => x.id))
  const zwZ = loadZweige(z)
  const zwQ = loadZweige(q).map((row) => ({
    ...row,
    personIds: row.personIds.map((id) => mapRef(id, idMap)),
    verwalterIds: row.verwalterIds?.map((id) => mapRef(id, idMap)),
  }))
  const mergedZweige = uniqueIds([...zwZ, ...zwQ], usedZweigIds)
  if (!saveZweige(z, mergedZweige)) {
    return abort('Zweige konnten nicht gespeichert werden.')
  }

  const usedGeschIds = new Set(loadGeschichten(z).map((g) => g.id))
  const geZ = loadGeschichten(z)
  const geQ = loadGeschichten(q)
  const mergedGeschichten = uniqueIds([...geZ, ...geQ], usedGeschIds)
  if (!saveGeschichten(z, mergedGeschichten)) {
    return abort('Geschichten konnten nicht gespeichert werden.')
  }

  const einstZ = loadEinstellungen(z)
  const einstQ = remapEinstPersonIds(loadEinstellungen(q), idMap)
  const mergedEinst = mergeEinstellungenNachMerge(einstZ, einstQ, options.finalDisplayName)
  if (!saveEinstellungen(z, mergedEinst)) {
    return abort('Einstellungen konnten nicht gespeichert werden.')
  }

  copyOptionalPageKeysFromQuelleZuZiel(q, z)

  const nextList = list.filter((id) => id !== q)
  if (!persistTenantList(nextList)) {
    return abort('Geräte-Auswahl konnte nicht aktualisiert werden – Zusammenführung wurde rückgängig gemacht.')
  }

  const cur = loadCurrentTenant()
  if (cur === q) persistCurrentTenant(z)

  clearTenantFamilieStorage(q)

  if (isSupabaseConfigured()) {
    saveFamilieToSupabase(z, {
      personen: loadPersonen(z),
      momente: loadMomente(z),
      events: loadEvents(z),
      einstellungen: loadEinstellungen(z),
    }).catch(() => {
      /* ignore */
    })
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(K2_FAMILIE_SESSION_UPDATED, { detail: { tenantId: z } }))
  }

  return { ok: true, zielTenantId: z }
}

/** Nur wenn Ziel noch keinen eigenen Eintrag hat: Rohdaten von der Quelle kopieren (vor Löschen der Quelle). */
function copyOptionalPageKeysFromQuelleZuZiel(q: string, z: string): void {
  const ptQ = `k2-familie-${q}-page-texts`
  const ptZ = `k2-familie-${z}-page-texts`
  const pcQ = `k2-familie-${q}-page-content`
  const pcZ = `k2-familie-${z}-page-content`
  try {
    if (localStorage.getItem(ptZ) == null && localStorage.getItem(ptQ) != null) {
      localStorage.setItem(ptZ, localStorage.getItem(ptQ)!)
    }
    if (localStorage.getItem(pcZ) == null && localStorage.getItem(pcQ) != null) {
      localStorage.setItem(pcZ, localStorage.getItem(pcQ)!)
    }
  } catch {
    /* ignore */
  }
}
