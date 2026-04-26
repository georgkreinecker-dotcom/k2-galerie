/**
 * Kassa-Daten: ein Snapshot auf dem Server (Vercel Blob), damit iPad und Mac
 * denselben Stand abgleichen können. Kein Ersatz für Vollbackup.
 */
import { GALLERY_DATA_BASE_URL } from '../config/externalUrls'
import { getShopStorageKeys } from './shopContextKeys'
import { getKassabuchKey, type KassabuchTenant } from './kassabuchStorage'
import { getActiveVk2PilotId, pilotScopeVk2Key } from './vk2StorageKeys'
import { CUSTOMERS_STORAGE_KEY, VK2_CUSTOMERS_STORAGE_KEY } from './customers'

export type KassaSyncTenant = 'k2' | 'oeffentlich' | 'vk2'

function readJsonArray(key: string): any[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const p = JSON.parse(raw)
    return Array.isArray(p) ? p : []
  } catch {
    return []
  }
}

function kassabuchTenantFromFlags(fromOeffentlich: boolean, fromVk2: boolean): KassabuchTenant {
  if (fromVk2) return 'vk2'
  if (fromOeffentlich) return 'oeffentlich'
  return 'k2'
}

/** Snapshot aus localStorage für aktuellen Shop-Kontext */
export function buildKassaSnapshot(fromOeffentlich: boolean, fromVk2: boolean): {
  tenantId: KassaSyncTenant
  vk2PilotId: string | undefined
  exportedAt: string
  orders: any[]
  soldArtworks: any[]
  kassabuch: any[]
  customers: any[]
} {
  const { ordersKey, soldArtworksKey } = getShopStorageKeys(fromOeffentlich, fromVk2)
  const kbTenant = kassabuchTenantFromFlags(fromOeffentlich, fromVk2)
  const kassabuchKey = getKassabuchKey(kbTenant)
  let customersKey = CUSTOMERS_STORAGE_KEY
  if (fromVk2) {
    customersKey = pilotScopeVk2Key(VK2_CUSTOMERS_STORAGE_KEY)
  }
  const vk2PilotId = fromVk2 ? (getActiveVk2PilotId() || undefined) : undefined
  return {
    tenantId: fromVk2 ? 'vk2' : fromOeffentlich ? 'oeffentlich' : 'k2',
    vk2PilotId: vk2PilotId || undefined,
    exportedAt: new Date().toISOString(),
    orders: readJsonArray(ordersKey),
    soldArtworks: readJsonArray(soldArtworksKey),
    kassabuch: readJsonArray(kassabuchKey),
    customers: readJsonArray(customersKey),
  }
}

function mergeById<T extends { id?: string }>(local: T[], remote: T[]): T[] {
  const byId = new Map<string, T>()
  for (const x of local) {
    const id = String(x?.id || '').trim()
    if (id) byId.set(id, x)
  }
  for (const x of remote) {
    const id = String(x?.id || '').trim()
    if (id && !byId.has(id)) byId.set(id, x)
  }
  return Array.from(byId.values())
}

function soldKey(a: any): string {
  return [String(a?.orderId || ''), String(a?.number || ''), String(a?.soldAt || '')].join('|')
}

function mergeSold(local: any[], remote: any[]): any[] {
  const seen = new Set<string>()
  const out: any[] = []
  for (const a of local) {
    const k = soldKey(a)
    if (seen.has(k)) continue
    seen.add(k)
    out.push(a)
  }
  for (const a of remote) {
    const k = soldKey(a)
    if (seen.has(k)) continue
    seen.add(k)
    out.push(a)
  }
  return out
}

function mergeCustomerLists(local: any[], remote: any[]): any[] {
  return mergeById(local, remote) as any[]
}

/**
 * Kassa-Snapshot an Vercel senden (nur Vercel-URL, damit iPad & Mac dieselbe Quelle nutzen).
 */
export async function uploadKassaSnapshotToServer(fromOeffentlich: boolean, fromVk2: boolean): Promise<{
  success: boolean
  error?: string
  result?: { ordersCount?: number; soldCount?: number; path?: string }
}> {
  const snap = buildKassaSnapshot(fromOeffentlich, fromVk2)
  const body: Record<string, unknown> = {
    tenantId: snap.tenantId,
    exportedAt: snap.exportedAt,
    orders: snap.orders,
    soldArtworks: snap.soldArtworks,
    kassabuch: snap.kassabuch,
    customers: snap.customers,
  }
  if (snap.vk2PilotId) body.vk2PilotId = snap.vk2PilotId

  const writeUrl = `${GALLERY_DATA_BASE_URL}/api/write-kassa-data`
  const apiKey = typeof import.meta.env.VITE_WRITE_GALLERY_API_KEY === 'string' ? String(import.meta.env.VITE_WRITE_GALLERY_API_KEY).trim() : ''
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (apiKey) headers['X-API-Key'] = apiKey

  try {
    const res = await fetch(writeUrl, { method: 'POST', headers, body: JSON.stringify(body) })
    const j = await res.json().catch(() => ({}))
    if (!res.ok || j?.success !== true) {
      const err = j?.error || `Server ${res.status}`
      const hint = j?.hint && String(j.hint).trim()
      return { success: false, error: hint ? `${err}\n${hint}` : err }
    }
    return {
      success: true,
      result: {
        ordersCount: j.ordersCount,
        soldCount: j.soldCount,
        path: j.path,
      },
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { success: false, error: /failed to fetch|network/i.test(msg) ? 'Netzwerkfehler. WLAN prüfen und erneut versuchen.' : msg }
  }
}

/**
 * Kassa-Stand vom Server holen und mit lokalem Speicher zusammenführen (kein leeres überschreiben).
 */
export async function fetchKassaSnapshotAndMergeLocal(fromOeffentlich: boolean, fromVk2: boolean): Promise<{
  success: boolean
  error?: string
  merged?: { orders: number; sold: number; kassabuch: number; customers: number }
}> {
  const { ordersKey, soldArtworksKey } = getShopStorageKeys(fromOeffentlich, fromVk2)
  const kbTenant = kassabuchTenantFromFlags(fromOeffentlich, fromVk2)
  const kassabuchKey = getKassabuchKey(kbTenant)
  let customersKey = CUSTOMERS_STORAGE_KEY
  if (fromVk2) {
    customersKey = pilotScopeVk2Key(VK2_CUSTOMERS_STORAGE_KEY)
  }
  const tenantId = fromVk2 ? 'vk2' : fromOeffentlich ? 'oeffentlich' : 'k2'
  const pilot = fromVk2 ? getActiveVk2PilotId() : null
  const q = new URLSearchParams({ tenantId })
  if (pilot) q.set('vk2PilotId', pilot)

  const getUrl = `${GALLERY_DATA_BASE_URL}/api/kassa-data?${q.toString()}&_=${Date.now()}`
  try {
    const res = await fetch(getUrl, { cache: 'no-store' })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      return { success: false, error: j?.error || j?.hint || `Server ${res.status}` }
    }
    const remote = await res.json()
    const locOrders = readJsonArray(ordersKey)
    const locSold = readJsonArray(soldArtworksKey)
    const locKb = readJsonArray(kassabuchKey)
    const locCust = readJsonArray(customersKey)

    const mOrders = mergeById(locOrders, Array.isArray(remote.orders) ? remote.orders : [])
    const mSold = mergeSold(locSold, Array.isArray(remote.soldArtworks) ? remote.soldArtworks : [])
    const mKb = mergeById(locKb, Array.isArray(remote.kassabuch) ? remote.kassabuch : [])
    const mCust = mergeCustomerLists(locCust, Array.isArray(remote.customers) ? remote.customers : [])

    localStorage.setItem(ordersKey, JSON.stringify(mOrders))
    localStorage.setItem(soldArtworksKey, JSON.stringify(mSold))
    localStorage.setItem(kassabuchKey, JSON.stringify(mKb))
    localStorage.setItem(customersKey, JSON.stringify(mCust))

    return {
      success: true,
      merged: {
        orders: mOrders.length,
        sold: mSold.length,
        kassabuch: mKb.length,
        customers: mCust.length,
      },
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { success: false, error: /failed to fetch|network/i.test(msg) ? 'Netzwerkfehler.' : msg }
  }
}
