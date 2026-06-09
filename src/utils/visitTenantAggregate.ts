/**
 * Summe aller /api/visit-Zähler mit tenant_id-Präfix (z. B. oeffentlich-pilot-12).
 * Eine Quelle für Mission Control und GET aggregatePrefix in api/visit-and-build.js
 */
export const VISIT_AGGREGATE_PREFIX_OEK2_PILOT = 'oeffentlich-pilot'
export const VISIT_AGGREGATE_PREFIX_VK2_PILOT = 'vk2-pilot'

const ALLOWED = new Set<string>([
  VISIT_AGGREGATE_PREFIX_OEK2_PILOT,
  VISIT_AGGREGATE_PREFIX_VK2_PILOT,
])

export function isValidVisitAggregatePrefix(prefix: string): boolean {
  return ALLOWED.has(prefix)
}

export function sumVisitCounts(base: number, pilotSum: number): number {
  return Math.max(0, Math.floor(base)) + Math.max(0, Math.floor(pilotSum))
}
