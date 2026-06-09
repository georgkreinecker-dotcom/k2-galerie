import { BASE_APP_URL } from '../config/navigation'
import {
  isValidVisitAggregatePrefix,
  VISIT_AGGREGATE_PREFIX_OEK2_PILOT,
  VISIT_AGGREGATE_PREFIX_VK2_PILOT,
} from './visitTenantAggregate'

export { VISIT_AGGREGATE_PREFIX_OEK2_PILOT, VISIT_AGGREGATE_PREFIX_VK2_PILOT }

/**
 * Basis-URL für **GET** /api/visit?tenant=… (Zähler nur lesen, Admin / Übersicht / Mission Control).
 * Unter Vite (`npm run dev`) gibt es lokal keine Serverless-Route → sonst schlägt fetch fehl und die Anzeige bleibt „–“.
 * **POST** /api/visit (reportPublicGalleryVisit) bleibt absichtlich auf `window.location.origin`, damit lokales Öffnen
 * der Galerie die Produktions-Zähler nicht erhöht.
 */
export function getVisitCountApiOrigin(): string {
  const base = BASE_APP_URL.replace(/\/$/, '')
  if (typeof window === 'undefined') return base
  if (import.meta.env.DEV) return base
  return window.location.origin.replace(/\/$/, '')
}

/** GET Zähler für einen Tenant; bei Netz-/Parse-Fehler 0 (kein „–“-Zustand durch kaputtes fetch). */
export function fetchVisitCount(tenant: string): Promise<number> {
  const base = getVisitCountApiOrigin()
  return fetch(`${base}/api/visit?tenant=${encodeURIComponent(tenant)}`, { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error('visit GET'))))
    .then((d: { count?: unknown }) => (typeof d.count === 'number' ? d.count : 0))
    .catch(() => 0)
}

/** Summe aller Zähler mit tenant_id-Präfix (z. B. oeffentlich-pilot-15). */
export function fetchVisitCountAggregateByPrefix(prefix: string): Promise<number> {
  if (!isValidVisitAggregatePrefix(prefix)) return Promise.resolve(0)
  const base = getVisitCountApiOrigin()
  return fetch(`${base}/api/visit?aggregatePrefix=${encodeURIComponent(prefix)}`, { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error('visit aggregate GET'))))
    .then((d: { count?: unknown }) => (typeof d.count === 'number' ? d.count : 0))
    .catch(() => 0)
}
