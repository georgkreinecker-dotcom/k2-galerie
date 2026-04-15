/**
 * K2 Familie – Supabase Sync (Raumschiff).
 * Load: von API, Merge mit lokal (nach id), nur schreiben wenn merged >= local.
 * Save: nach lokalem Speichern hier pushen.
 */

import { isSupabaseConfigured } from './supabaseClient'
import type { K2FamiliePerson, K2FamilieMoment, K2FamilieEvent, K2FamilieEinstellungen } from '../types/k2Familie'
import { loadPersonen, loadMomente, loadEvents, loadEinstellungen, savePersonen, saveMomente, saveEvents, saveEinstellungen } from './familieStorage'

let SUPABASE_URL = ''
try {
  const env = import.meta.env || {}
  SUPABASE_URL = String(env.VITE_SUPABASE_URL || '')
} catch { /* ignore */ }
const FAMILIE_API_URL = SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/familie` : null

function getUpdated(item: { updatedAt?: string; createdAt?: string }): number {
  const u = item?.updatedAt ? new Date(item.updatedAt).getTime() : 0
  const c = item?.createdAt ? new Date(item.createdAt).getTime() : 0
  return Math.max(u, c)
}

/** Merge Server-Liste mit lokaler (nach id). Server = Basis; lokale ohne Server-id dazu; Konflikt = neueres gewinnt. */
function mergeById<T extends { id: string; updatedAt?: string; createdAt?: string }>(
  serverList: T[],
  localList: T[]
): T[] {
  const byId = new Map<string, T>()
  serverList.forEach((s) => {
    if (s?.id) byId.set(s.id, s)
  })
  localList.forEach((local) => {
    if (!local?.id) return
    const server = byId.get(local.id)
    if (!server) {
      byId.set(local.id, local)
      return
    }
    if (getUpdated(local) >= getUpdated(server)) byId.set(local.id, local)
  })
  return Array.from(byId.values())
}

export interface FamilieData {
  personen: K2FamiliePerson[]
  momente: K2FamilieMoment[]
  events: K2FamilieEvent[]
  /** Optional: Familien-Einstellungen (u. a. Inhaber:in) – ein Objekt pro Tenant. */
  einstellungen?: K2FamilieEinstellungen
}

/** Ob und wie der letzte Ladevorgang lief (für sichtbare Hinweise – nicht nur „leere Liste“). */
export type FamilieLoadMeta = {
  ok: boolean
  source: 'server' | 'local_only'
  reason?: 'not_configured' | 'network' | 'http' | 'parse'
  httpStatus?: number
  /** Kurztext aus catch (z. B. Failed to fetch) – nur Konsole/Diagnose, nicht als vollen Dump anzeigen */
  networkDetail?: string
}

export type FamilieLoadResult = FamilieData & { loadMeta: FamilieLoadMeta }

function localSnapshot(tenantId: string): FamilieData {
  return {
    personen: loadPersonen(tenantId),
    momente: loadMomente(tenantId),
    events: loadEvents(tenantId),
  }
}

function withMeta(data: FamilieData, loadMeta: FamilieLoadMeta): FamilieLoadResult {
  return { ...data, loadMeta }
}

/** Kurzer Nutzertext, wenn loadMeta.ok === false (Button „Daten vom Server laden“, Anmeldung, …). */
export function getFamilieLoadHinweisFuerNutzer(loadMeta: FamilieLoadMeta): string {
  if (loadMeta.ok) return ''
  if (loadMeta.reason === 'not_configured') {
    return 'Cloud ist in dieser Umgebung nicht eingebunden (Supabase fehlt). Bitte die veröffentlichte Galerie-App im Browser öffnen – nur dort ist K2 Familie mit dem Server verbunden.'
  }
  if (loadMeta.reason === 'http') {
    return `Der Server hat nicht geantwortet (Fehler ${String(loadMeta.httpStatus ?? '?')}). Kurz warten und „Daten vom Server laden“ erneut tippen.`
  }
  if (loadMeta.reason === 'parse') {
    return 'Die Server-Antwort war unlesbar. Bitte „Daten vom Server laden“ erneut tippen.'
  }
  // reason === 'network': fetch wirft (CORS, Timeout, SSL, Safari „Load failed“ …) – nicht dasselbe wie „WLAN schlecht“.
  return 'Der Familien-Cloud-Speicher ist gerade nicht erreichbar. Das muss nicht an Ihrem Netz liegen – oft Kurzstörung, Browser-Schutz oder der Dienst antwortet nicht. „Daten vom Server laden“ erneut tippen oder kurz warten.'
}

/**
 * Lädt Familie-Daten von Supabase, mergt mit lokal, schreibt nur wenn merged.length >= local.length, gibt merged zurück.
 * **loadMeta:** Bei Fehler oder fehlender Konfiguration bleibt die Anzeige oft leer – dann zeigt die UI den Grund.
 */
export async function loadFamilieFromSupabase(tenantId: string): Promise<FamilieLoadResult> {
  if (!isSupabaseConfigured() || !FAMILIE_API_URL) {
    return withMeta(localSnapshot(tenantId), {
      ok: false,
      source: 'local_only',
      reason: 'not_configured',
    })
  }
  try {
    const res = await fetch(`${FAMILIE_API_URL}?tenantId=${encodeURIComponent(tenantId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env?.VITE_SUPABASE_ANON_KEY ?? ''}`,
      },
    })
    if (!res.ok) {
      console.warn('loadFamilieFromSupabase HTTP', res.status)
      return withMeta(localSnapshot(tenantId), {
        ok: false,
        source: 'local_only',
        reason: 'http',
        httpStatus: res.status,
      })
    }
    let data: unknown
    try {
      data = await res.json()
    } catch {
      return withMeta(localSnapshot(tenantId), {
        ok: false,
        source: 'local_only',
        reason: 'parse',
      })
    }
    const d = data as Record<string, unknown>
    const serverPersonen = Array.isArray(d.personen) ? d.personen : []
    const serverMomente = Array.isArray(d.momente) ? d.momente : []
    const serverEvents = Array.isArray(d.events) ? d.events : []
    const serverEinst =
      d.einstellungen && typeof d.einstellungen === 'object' && !Array.isArray(d.einstellungen)
        ? (d.einstellungen as K2FamilieEinstellungen)
        : null
    const localPersonen = loadPersonen(tenantId)
    const localMomente = loadMomente(tenantId)
    const localEvents = loadEvents(tenantId)
    const mergedPersonen = mergeById(serverPersonen as K2FamiliePerson[], localPersonen)
    const mergedMomente = mergeById(serverMomente as K2FamilieMoment[], localMomente)
    const mergedEvents = mergeById(serverEvents as K2FamilieEvent[], localEvents)
    if (mergedPersonen.length >= localPersonen.length) savePersonen(tenantId, mergedPersonen, { allowReduce: true })
    if (mergedMomente.length >= localMomente.length) saveMomente(tenantId, mergedMomente, { allowReduce: true })
    if (mergedEvents.length >= localEvents.length) saveEvents(tenantId, mergedEvents, { allowReduce: true })
    if (serverEinst) {
      const mergedEinst = { ...loadEinstellungen(tenantId), ...serverEinst }
      saveEinstellungen(tenantId, mergedEinst)
    }
    return withMeta(
      { personen: mergedPersonen, momente: mergedMomente, events: mergedEvents },
      { ok: true, source: 'server' },
    )
  } catch (e) {
    const networkDetail = e instanceof Error ? e.message : String(e)
    console.warn('loadFamilieFromSupabase fehlgeschlagen:', e, networkDetail)
    return withMeta(localSnapshot(tenantId), {
      ok: false,
      source: 'local_only',
      reason: 'network',
      networkDetail,
    })
  }
}

/**
 * Schreibt Familie-Daten nach Supabase (alle drei Listen für den Tenant).
 */
export async function saveFamilieToSupabase(tenantId: string, payload: FamilieData): Promise<boolean> {
  if (!isSupabaseConfigured() || !FAMILIE_API_URL) return false
  try {
    const res = await fetch(FAMILIE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env?.VITE_SUPABASE_ANON_KEY ?? ''}`,
      },
      body: JSON.stringify({
        tenantId,
        personen: payload.personen ?? [],
        momente: payload.momente ?? [],
        events: payload.events ?? [],
        ...(payload.einstellungen && typeof payload.einstellungen === 'object' && !Array.isArray(payload.einstellungen)
          ? { einstellungen: payload.einstellungen }
          : {}),
      }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return true
  } catch (e) {
    console.warn('saveFamilieToSupabase fehlgeschlagen:', e)
    return false
  }
}
