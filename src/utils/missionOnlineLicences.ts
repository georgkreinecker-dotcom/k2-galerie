import { findLicenseeDomainByTenantId } from '../config/licenseeDomainRegistry'
import { K2_FAMILIE_LIZENZPREISE, LIZENZPREISE } from '../config/licencePricing'

/** Online gekaufte Lizenz – Supabase `licences` via GET /api/licence-data */
export type MissionOnlineLicence = {
  id: string
  email: string
  name: string
  licence_type: string
  status: string
  empfehler_id?: string | null
  stripe_session_id?: string | null
  tenant_id?: string | null
  galerie_url?: string | null
  created_at: string
}

export type MissionLicenceDataPayload = {
  licences: MissionOnlineLicence[]
  emptyOnlineHint?: string
  error?: string
}

export function parseMissionLicenceDataPayload(data: unknown): MissionLicenceDataPayload {
  const raw = data && typeof data === 'object' ? (data as Record<string, unknown>) : {}
  const licences = Array.isArray(raw.licences)
    ? raw.licences
        .filter((row): row is Record<string, unknown> => row != null && typeof row === 'object')
        .map(normalizeMissionOnlineLicence)
        .filter((l): l is MissionOnlineLicence => l != null)
    : []
  const sc = raw.stripe_chain
  const emptyOnlineHint =
    sc && typeof sc === 'object' && typeof (sc as { empty_online_hint?: unknown }).empty_online_hint === 'string'
      ? (sc as { empty_online_hint: string }).empty_online_hint
      : undefined
  const error = typeof raw.error === 'string' ? raw.error : undefined
  return { licences, emptyOnlineHint, error }
}

function normalizeMissionOnlineLicence(row: Record<string, unknown>): MissionOnlineLicence | null {
  const id = typeof row.id === 'string' ? row.id : ''
  if (!id) return null
  return {
    id,
    email: typeof row.email === 'string' ? row.email : '',
    name: typeof row.name === 'string' ? row.name : '',
    licence_type: typeof row.licence_type === 'string' ? row.licence_type : '',
    status: typeof row.status === 'string' ? row.status : '',
    empfehler_id: typeof row.empfehler_id === 'string' ? row.empfehler_id : null,
    stripe_session_id: typeof row.stripe_session_id === 'string' ? row.stripe_session_id : null,
    tenant_id: typeof row.tenant_id === 'string' ? row.tenant_id : null,
    galerie_url: typeof row.galerie_url === 'string' ? row.galerie_url : null,
    created_at: typeof row.created_at === 'string' ? row.created_at : '',
  }
}

export function missionLicenceDisplayName(licence: MissionOnlineLicence): string {
  const name = licence.name?.trim()
  if (name) return name
  const email = licence.email?.trim()
  if (email) return email
  return 'Lizenzkunde'
}

export function formatLicenceTypeLabel(licenceType: string): string {
  const lt = (licenceType || '').trim()
  if (!lt) return '–'
  if (lt in LIZENZPREISE) {
    return LIZENZPREISE[lt as keyof typeof LIZENZPREISE].name
  }
  if (lt in K2_FAMILIE_LIZENZPREISE) {
    return K2_FAMILIE_LIZENZPREISE[lt as keyof typeof K2_FAMILIE_LIZENZPREISE].name
  }
  if (lt === 'proplus' || lt === 'propplus' || lt === 'excellent') return LIZENZPREISE.pro.name
  return lt
}

export function resolveMissionLicenceGalerieUrl(licence: MissionOnlineLicence): string | null {
  const fromApi = licence.galerie_url?.trim()
  if (fromApi) return fromApi
  const tenantId = licence.tenant_id?.trim()
  if (!tenantId) return null
  return findLicenseeDomainByTenantId(tenantId)?.canonicalGalerieUrl ?? null
}

export function uniqueTenantIdsFromLicences(licences: MissionOnlineLicence[]): string[] {
  const ids = new Set<string>()
  for (const l of licences) {
    const tid = l.tenant_id?.trim()
    if (tid) ids.add(tid)
  }
  return [...ids]
}

/** Neueste Lizenz pro Mandant (für Zeitleiste-Anzeigename) */
export function latestLicencePerTenant(
  licences: MissionOnlineLicence[],
): Map<string, MissionOnlineLicence> {
  const byTenant = new Map<string, { licence: MissionOnlineLicence; createdAt: string }>()
  for (const licence of licences) {
    const tenantId = licence.tenant_id?.trim()
    if (!tenantId) continue
    const prev = byTenant.get(tenantId)
    const createdAt = licence.created_at || ''
    if (!prev || createdAt >= prev.createdAt) {
      byTenant.set(tenantId, { licence, createdAt })
    }
  }
  const out = new Map<string, MissionOnlineLicence>()
  for (const [tenantId, { licence }] of byTenant) {
    out.set(tenantId, licence)
  }
  return out
}
