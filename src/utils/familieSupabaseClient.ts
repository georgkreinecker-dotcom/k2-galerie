/**
 * K2 Familie – Supabase Sync (Raumschiff).
 * Load: von API, Merge mit lokal (nach id), nur schreiben wenn merged >= local.
 * Save: nach lokalem Speichern hier pushen.
 */

import { isSupabaseConfigured } from './supabaseClient'
import type { K2FamiliePerson, K2FamilieMoment, K2FamilieEvent } from '../types/k2Familie'
import { loadPersonen, loadMomente, loadEvents, savePersonen, saveMomente, saveEvents } from './familieStorage'

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
}

/**
 * Lädt Familie-Daten von Supabase, mergt mit lokal, schreibt nur wenn merged.length >= local.length, gibt merged zurück.
 */
export async function loadFamilieFromSupabase(tenantId: string): Promise<FamilieData> {
  if (!isSupabaseConfigured() || !FAMILIE_API_URL) {
    return {
      personen: loadPersonen(tenantId),
      momente: loadMomente(tenantId),
      events: loadEvents(tenantId),
    }
  }
  try {
    const res = await fetch(`${FAMILIE_API_URL}?tenantId=${encodeURIComponent(tenantId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env?.VITE_SUPABASE_ANON_KEY ?? ''}`,
      },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const serverPersonen = Array.isArray(data.personen) ? data.personen : []
    const serverMomente = Array.isArray(data.momente) ? data.momente : []
    const serverEvents = Array.isArray(data.events) ? data.events : []
    const localPersonen = loadPersonen(tenantId)
    const localMomente = loadMomente(tenantId)
    const localEvents = loadEvents(tenantId)
    const mergedPersonen = mergeById(serverPersonen, localPersonen)
    const mergedMomente = mergeById(serverMomente, localMomente)
    const mergedEvents = mergeById(serverEvents, localEvents)
    if (mergedPersonen.length >= localPersonen.length) savePersonen(tenantId, mergedPersonen, { allowReduce: true })
    if (mergedMomente.length >= localMomente.length) saveMomente(tenantId, mergedMomente, { allowReduce: true })
    if (mergedEvents.length >= localEvents.length) saveEvents(tenantId, mergedEvents, { allowReduce: true })
    return { personen: mergedPersonen, momente: mergedMomente, events: mergedEvents }
  } catch (e) {
    console.warn('loadFamilieFromSupabase fehlgeschlagen:', e)
    return {
      personen: loadPersonen(tenantId),
      momente: loadMomente(tenantId),
      events: loadEvents(tenantId),
    }
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
      }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return true
  } catch (e) {
    console.warn('saveFamilieToSupabase fehlgeschlagen:', e)
    return false
  }
}
