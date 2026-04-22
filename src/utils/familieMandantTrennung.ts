/**
 * K2 Familie – verbindliche Mandanten-Trennung (Muster vs. Stamm/Einladung).
 * Eine Stelle: keine zweite Bedeutung von IDs über verschiedene Ketten (Links, Env, ?t=).
 * Siehe docs/K2-FAMILIE-MANDANT-CODE-ORIENTIERUNG.md
 */

import { FAMILIE_HUBER_TENANT_ID } from '../data/k2FamilieMusterHuberQuelle'
import { isValidFamilieTenantId, K2_FAMILIE_DEFAULT_TENANT } from './familieStorage'

/** Muster-Demo: feste technische ID (nur Huber, eine Quelle: k2FamilieMusterHuberQuelle). */
export function isMusterfamilieHuberTenantId(id: string | null | undefined): boolean {
  return (id?.trim().toLowerCase() ?? '') === FAMILIE_HUBER_TENANT_ID
}

/**
 * Stamm/Präsentation/Einladung: diese Mandanten-ID darf in VITE + öffentlichen Stammbaum-Links vorkommen.
 * Die Muster-ID „huber“ ist ausgeschlossen (sonst Tausch Muster ↔ echte Familie im Build).
 */
export function tenantIdErlaubtFuerKreineckerStammKette(raw: string | undefined | null):
  | { ok: true; id: string }
  | { ok: false; grund: 'leer' | 'ungueltig' | 'muster_nur_demo' } {
  const t = String(raw ?? '')
    .trim()
    .toLowerCase()
  if (!t) return { ok: false, grund: 'leer' }
  if (!isValidFamilieTenantId(t)) return { ok: false, grund: 'ungueltig' }
  if (isMusterfamilieHuberTenantId(t)) return { ok: false, grund: 'muster_nur_demo' }
  return { ok: true, id: t }
}

/** Plattform-„default“-Tenant: kein Stamm-Mandant für Präsentation. */
export function isPlattformDefaultFamilieTenantId(id: string | null | undefined): boolean {
  return (id?.trim().toLowerCase() ?? '') === K2_FAMILIE_DEFAULT_TENANT
}
