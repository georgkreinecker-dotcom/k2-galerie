/**
 * Besucherzähler: öffentliche / geteilte Sitzungen im Kreinecker-Stammbaum (K2 Familie).
 * Eigener visits.tenant_id – getrennt von Musterfamilie Huber (`k2-familie-muster`).
 *
 * Zählt nur auf Nav-Bereich Stammbaum (inkl. Personen-Seiten), nur wenn der Mandant
 * die Kreinecker-Stammkette ist (VITE-Mandant oder Anzeigename wie in k2FamilieApfDefaults).
 */
import { PROJECT_ROUTES } from '../config/navigation'
import { isFamilieNavSectionActive } from '../config/k2FamilieStructure'
import { resolveKreineckerPresentationTenantIdFromEnv } from '../data/k2FamilieKreineckerStammbaumQuelle'
import { getFamilieTenantDisplayName } from '../data/familieHuberMuster'
import { tenantIdErlaubtFuerKreineckerStammKette } from './familieMandantTrennung'
import { reportPublicGalleryVisit } from './reportPublicGalleryVisit'

export const VISIT_TENANT_K2_FAMILIE_KREINECKER_STAMMBAUM = 'k2-familie-kreinecker-stammbaum'

const SESSION_KEY = 'k2-visit-sent-k2-familie-kreinecker-stammbaum'

const R = PROJECT_ROUTES['k2-familie']

export function isKreineckerStammbaumSessionTenant(tenantId: string): boolean {
  const gate = tenantIdErlaubtFuerKreineckerStammKette(tenantId)
  if (!gate.ok) return false
  const envId = resolveKreineckerPresentationTenantIdFromEnv()
  if (envId && gate.id === envId) return true
  const label = getFamilieTenantDisplayName(gate.id, '').toLowerCase()
  return label.includes('kreinecker') && (label.includes('stamm') || label.includes('alkoven'))
}

export function isKreineckerStammbaumBesuchPath(pathname: string, search: string): boolean {
  return isFamilieNavSectionActive(pathname, R.stammbaum, search)
}

/** Einmal pro Session, wenn Kreinecker-Stammbaum sichtbar (nicht Huber-Demo). */
export function reportK2FamilieKreineckerStammbaumVisit(tenantId: string, pathname: string, search: string): void {
  if (!isKreineckerStammbaumSessionTenant(tenantId)) return
  if (!isKreineckerStammbaumBesuchPath(pathname, search)) return
  reportPublicGalleryVisit({
    tenant: VISIT_TENANT_K2_FAMILIE_KREINECKER_STAMMBAUM,
    sessionKey: SESSION_KEY,
  })
}
