/**
 * Phase 5.3: Eine zentrale Quelle für „Anzeige als ök2/Demo“ (Kontakt, Zur Galerie, Vita).
 * Alle Stellen die fromOeffentlich / isOeffentlich für Anzeige brauchen, nutzen diese Funktion.
 * Doku: k2-oek2-trennung.mdc (Shop: „Zur Galerie“ und Kontakt aus fromOeffentlich).
 */

import { getCurrentTenantId } from '../config/tenantConfig'

/**
 * Gibt true, wenn die aktuelle Ansicht als „öffentliche Demo“ (ök2) angezeigt werden soll.
 * Quellen: location.state, sessionStorage (Shop/Admin), Referrer, gespeicherter Tenant.
 */
export function isOeffentlichDisplayContext(locationState?: unknown): boolean {
  const state = locationState as { fromOeffentlich?: boolean } | null | undefined
  if (state?.fromOeffentlich === true) return true
  if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('k2-shop-from-oeffentlich') === '1') return true
  if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('k2-admin-context') === 'oeffentlich') return true
  if (typeof document !== 'undefined' && document.referrer.includes('galerie-oeffentlich')) return true
  return getCurrentTenantId() === 'oeffentlich'
}
