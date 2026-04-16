/**
 * K2 Familie – Supabase Sync (Raumschiff).
 * Load: von API, Merge mit lokal (nach id), nur schreiben wenn merged >= local.
 * Save: nach lokalem Speichern hier pushen.
 */

import { isSupabaseConfigured } from './supabaseClient'
import type { K2FamiliePerson, K2FamilieMoment, K2FamilieEvent, K2FamilieEinstellungen } from '../types/k2Familie'
import { loadPersonen, loadMomente, loadEvents, loadEinstellungen, savePersonen, saveMomente, saveEvents, saveEinstellungen } from './familieStorage'

let SUPABASE_URL = ''
let SUPABASE_ANON = ''
try {
  const env = import.meta.env || {}
  SUPABASE_URL = String(env.VITE_SUPABASE_URL || '')
  SUPABASE_ANON = String(env.VITE_SUPABASE_ANON_KEY || '')
} catch { /* ignore */ }
const FAMILIE_API_URL = SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/familie` : null

function familieApiHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${SUPABASE_ANON}`,
    apikey: SUPABASE_ANON,
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

/** Mobil/WLAN: fetch ohne Timeout kann Minuten hängen – UI wirkt „endlos“. */
const FAMILIE_FETCH_TIMEOUT_MS = 20000

async function fetchFamilieWithTimeout(url: string, init: Omit<RequestInit, 'signal'>): Promise<Response> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), FAMILIE_FETCH_TIMEOUT_MS)
  try {
    return await fetch(url, { ...init, signal: ctrl.signal })
  } finally {
    clearTimeout(t)
  }
}

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
  /** Nur bei ok: Personen aus der Server-Antwort vor Merge (für klare Nutzerhinweise). */
  serverPersonenCount?: number
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
    return 'Cloud ist in dieser Umgebung nicht eingebunden (Supabase fehlt). Bitte K2 Familie in der veröffentlichten Website im Browser öffnen – nur dort ist die Familien-Cloud mit dem Server verbunden.'
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
  const url = `${FAMILIE_API_URL}?tenantId=${encodeURIComponent(tenantId)}`
  const maxAttempts = 3
  try {
    let res: Response | null = null
    let lastNetworkErr: unknown
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (attempt > 0) await sleep(350 * attempt)
      try {
        res = await fetchFamilieWithTimeout(url, {
          method: 'GET',
          headers: familieApiHeaders(),
        })
        break
      } catch (e) {
        lastNetworkErr = e
        if (attempt === maxAttempts - 1) throw e
      }
    }
    if (!res) throw lastNetworkErr ?? new Error('fetch leer')
    if (!res.ok) {
      let errBody = ''
      try {
        errBody = await res.clone().text()
      } catch {
        /* ignore */
      }
      console.warn('loadFamilieFromSupabase HTTP', res.status, errBody.slice(0, 800))
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
    const serverPersonenCount = serverPersonen.length
    const mergedPersonen = mergeById(serverPersonen as K2FamiliePerson[], localPersonen)
    const mergedMomente = mergeById(serverMomente as K2FamilieMoment[], localMomente)
    const mergedEvents = mergeById(serverEvents as K2FamilieEvent[], localEvents)
    if (mergedPersonen.length >= localPersonen.length) {
      const okSave = savePersonen(tenantId, mergedPersonen, { allowReduce: true })
      if (!okSave && mergedPersonen.length > 0) {
        console.warn(
          'loadFamilieFromSupabase: Personen nach Merge nicht im lokalen Speicher (z. B. Speicher voll) – UI nutzt trotzdem die geladene Liste.',
        )
      }
    }
    if (mergedMomente.length >= localMomente.length) saveMomente(tenantId, mergedMomente, { allowReduce: true })
    if (mergedEvents.length >= localEvents.length) saveEvents(tenantId, mergedEvents, { allowReduce: true })
    if (serverEinst) {
      const mergedEinst = { ...loadEinstellungen(tenantId), ...serverEinst }
      saveEinstellungen(tenantId, mergedEinst)
    }
    return withMeta(
      { personen: mergedPersonen, momente: mergedMomente, events: mergedEvents },
      { ok: true, source: 'server', serverPersonenCount },
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
    const res = await fetchFamilieWithTimeout(FAMILIE_API_URL, {
      method: 'POST',
      headers: familieApiHeaders(),
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
    if (!res.ok) {
      let errBody = ''
      try {
        errBody = await res.clone().text()
      } catch {
        /* ignore */
      }
      console.warn('saveFamilieToSupabase HTTP', res.status, errBody.slice(0, 800))
      throw new Error(`HTTP ${res.status}`)
    }
    return true
  } catch (e) {
    console.warn('saveFamilieToSupabase fehlgeschlagen:', e)
    return false
  }
}
