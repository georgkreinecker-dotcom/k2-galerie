import { describe, expect, it } from 'vitest'
import {
  isValidVisitAggregatePrefix,
  sumVisitCounts,
  VISIT_AGGREGATE_PREFIX_OEK2_PILOT,
  VISIT_AGGREGATE_PREFIX_VK2_PILOT,
} from '../utils/visitTenantAggregate'

describe('visitTenantAggregate', () => {
  it('erlaubt nur oeffentlich-pilot und vk2-pilot', () => {
    expect(isValidVisitAggregatePrefix(VISIT_AGGREGATE_PREFIX_OEK2_PILOT)).toBe(true)
    expect(isValidVisitAggregatePrefix(VISIT_AGGREGATE_PREFIX_VK2_PILOT)).toBe(true)
    expect(isValidVisitAggregatePrefix('oeffentlich')).toBe(false)
    expect(isValidVisitAggregatePrefix('k2')).toBe(false)
  })

  it('summiert Basis + Pilot', () => {
    expect(sumVisitCounts(760, 42)).toBe(802)
    expect(sumVisitCounts(-1, 5)).toBe(5)
  })
})
