import { LICENSEE_DOMAIN_REGISTRY } from './licenseeDomainRegistry'
import { PLATFORM_ROUTES } from './navigation'
import type { MissionVisitCounts } from '../utils/missionVisitSnapshots'
import {
  buildLicenseeVisitSeries,
  buildMissionVisitSeriesForField,
  loadLicenseeVisitSnapshots,
  loadMissionVisitSnapshots,
  type MissionVisitSeriesPoint,
} from '../utils/missionVisitSnapshots'

/** 0 = alle gespeicherten Tage (max. 90) */
export type MissionVisitZeitfensterTage = 7 | 14 | 30 | 60 | 90 | 0

export const MISSION_VISIT_ZEITFENSTER_OPTIONS: { value: MissionVisitZeitfensterTage; label: string }[] = [
  { value: 7, label: '7 Tage' },
  { value: 14, label: '14 Tage' },
  { value: 30, label: '30 Tage' },
  { value: 60, label: '60 Tage' },
  { value: 90, label: '90 Tage' },
  { value: 0, label: 'Alles' },
]

export type MissionVisitProductKind = 'platform' | 'licensee'

export type MissionVisitProductDef = {
  id: string
  label: string
  color: string
  kind: MissionVisitProductKind
  field?: keyof MissionVisitCounts
  tenantId?: string
}

const PLATFORM_PRODUCTS: MissionVisitProductDef[] = [
  { id: 'k2', label: 'K2 Galerie', color: '#5ffbf1', kind: 'platform', field: 'k2' },
  { id: 'oeffentlich', label: 'ök2 gesamt', color: '#fcd34d', kind: 'platform', field: 'oeffentlichGesamt' },
  { id: 'vk2', label: 'VK2 gesamt', color: '#a78bfa', kind: 'platform', field: 'vk2Gesamt' },
  { id: 'fam-muster', label: 'K2 Familie Muster', color: '#34d399', kind: 'platform', field: 'k2FamilieMuster' },
  { id: 'krein', label: 'Kreinecker-Stammbaum', color: '#fb923c', kind: 'platform', field: 'kreineckerStammbaum' },
]

export function getMissionVisitPlatformProducts(): MissionVisitProductDef[] {
  return PLATFORM_PRODUCTS
}

export function getMissionVisitLicenseeProducts(): MissionVisitProductDef[] {
  return LICENSEE_DOMAIN_REGISTRY.map((row) => ({
    id: licenseeProductId(row.tenantId),
    label: row.label,
    color: '#fcd34d',
    kind: 'licensee' as const,
    tenantId: row.tenantId,
  }))
}

export function getAllMissionVisitProducts(): MissionVisitProductDef[] {
  return [...getMissionVisitPlatformProducts(), ...getMissionVisitLicenseeProducts()]
}

export function licenseeProductId(tenantId: string): string {
  return `lizenz-${tenantId}`
}

export function parseLicenseeProductId(productId: string): string | null {
  if (!productId.startsWith('lizenz-')) return null
  return productId.slice('lizenz-'.length) || null
}

export function findMissionVisitProduct(productId: string): MissionVisitProductDef | undefined {
  return getAllMissionVisitProducts().find((p) => p.id === productId)
}

export function missionVisitZeitleisteOverviewPath(tage?: MissionVisitZeitfensterTage): string {
  const base = PLATFORM_ROUTES.missionControlBesucherZeitleiste
  if (tage == null || tage === 30) return base
  return `${base}?tage=${tage}`
}

export function missionVisitZeitleisteProductPath(
  productId: string,
  tage?: MissionVisitZeitfensterTage,
): string {
  const base = `${PLATFORM_ROUTES.missionControlBesucherZeitleiste}/${encodeURIComponent(productId)}`
  if (tage == null || tage === 30) return base
  return `${base}?tage=${tage}`
}

export function parseZeitfensterFromSearch(search: string): MissionVisitZeitfensterTage {
  const raw = new URLSearchParams(search).get('tage')
  if (raw == null || raw === '') return 30
  const n = Number(raw)
  if (n === 0) return 0
  if ([7, 14, 30, 60, 90].includes(n)) return n as MissionVisitZeitfensterTage
  return 30
}

export function loadSeriesForProduct(product: MissionVisitProductDef): MissionVisitSeriesPoint[] {
  if (product.kind === 'licensee' && product.tenantId) {
    return buildLicenseeVisitSeries(loadLicenseeVisitSnapshots(product.tenantId))
  }
  if (product.kind === 'platform' && product.field) {
    return buildMissionVisitSeriesForField(loadMissionVisitSnapshots(), product.field)
  }
  return []
}
