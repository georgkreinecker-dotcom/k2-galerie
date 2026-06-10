import { BASE_APP_URL } from '../config/navigation'
import {
  isValidVisitAggregatePrefix,
  VISIT_AGGREGATE_PREFIX_OEK2_PILOT,
  VISIT_AGGREGATE_PREFIX_VK2_PILOT,
} from './visitTenantAggregate'

export { VISIT_AGGREGATE_PREFIX_OEK2_PILOT, VISIT_AGGREGATE_PREFIX_VK2_PILOT }

/**
 * Basis-URL für **GET** /api/visit?tenant=… (Zähler nur lesen, Admin / Übersicht / Mission Control).
 * Immer **Production** (BASE_APP_URL): lokal gibt es keine Serverless-Route; `vite preview` / falscher Host
 * liefert sonst HTML statt JSON → stille 0 in der Anzeige.
 * **POST** /api/visit (reportPublicGalleryVisit) bleibt absichtlich auf `window.location.origin`, damit lokales Öffnen
 * der Galerie die Produktions-Zähler nicht erhöht.
 */
export function getVisitCountApiOrigin(): string {
  return BASE_APP_URL.replace(/\/$/, '')
}

export type VisitCountFetchResult = {
  count: number
  /** false = Netzwerk/HTTP/Parse oder API-Fehlerfeld */
  loaded: boolean
  error?: string
}

function parseVisitCountResponse(d: unknown): VisitCountFetchResult {
  const o = d && typeof d === 'object' ? (d as Record<string, unknown>) : {}
  const count = typeof o.count === 'number' ? o.count : 0
  const err = typeof o.error === 'string' ? o.error : undefined
  return { count, loaded: !err, error: err }
}

async function fetchVisitCountRaw(url: string): Promise<VisitCountFetchResult> {
  try {
    const r = await fetch(url, { cache: 'no-store' })
    if (!r.ok) return { count: 0, loaded: false, error: `HTTP ${r.status}` }
    const d: unknown = await r.json()
    return parseVisitCountResponse(d)
  } catch {
    return { count: 0, loaded: false, error: 'Netzwerk' }
  }
}

/** GET Zähler für einen Tenant; bei Fehler count 0 + loaded false. */
export function fetchVisitCountWithMeta(tenant: string): Promise<VisitCountFetchResult> {
  const base = getVisitCountApiOrigin()
  const bust = Date.now()
  return fetchVisitCountRaw(`${base}/api/visit?tenant=${encodeURIComponent(tenant)}&_=${bust}`)
}

export function fetchVisitCount(tenant: string): Promise<number> {
  return fetchVisitCountWithMeta(tenant).then((r) => r.count)
}

/** Summe aller Zähler mit tenant_id-Präfix (z. B. oeffentlich-pilot-15). */
export function fetchVisitCountAggregateByPrefixWithMeta(prefix: string): Promise<VisitCountFetchResult> {
  if (!isValidVisitAggregatePrefix(prefix)) {
    return Promise.resolve({ count: 0, loaded: false, error: 'aggregatePrefix ungültig' })
  }
  const base = getVisitCountApiOrigin()
  const bust = Date.now()
  return fetchVisitCountRaw(`${base}/api/visit?aggregatePrefix=${encodeURIComponent(prefix)}&_=${bust}`)
}

export function fetchVisitCountAggregateByPrefix(prefix: string): Promise<number> {
  return fetchVisitCountAggregateByPrefixWithMeta(prefix).then((r) => r.count)
}
