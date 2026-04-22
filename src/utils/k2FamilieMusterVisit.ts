/**
 * Besucherzähler Musterfamilie Huber: ein eigener visits.tenant_id (intern, nicht in der Oberfläche der Demo).
 * Sync: Regex wie reportPublicGalleryVisit / api/visit-and-build.js
 */
import { reportPublicGalleryVisit } from './reportPublicGalleryVisit'

/** Supabase visits.tenant_id – nur Huber-Demo-Sitzung, keine echten Familien-Mandanten. */
export const VISIT_TENANT_K2_FAMILIE_MUSTER = 'k2-familie-muster'

const SESSION_KEY = 'k2-visit-sent-k2-familie-muster'

export function reportK2FamilieMusterHuberVisit(): void {
  reportPublicGalleryVisit({
    tenant: VISIT_TENANT_K2_FAMILIE_MUSTER,
    sessionKey: SESSION_KEY,
  })
}
