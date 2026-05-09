import { describe, expect, it } from 'vitest'
import { LICENSEE_DOMAIN_REGISTRY } from '../config/licenseeDomainRegistry'
import { VISIT_TENANT_ID_RE } from '../utils/reportPublicGalleryVisit'

describe('licenseeDomainRegistry', () => {
  it('jeder tenantId ist gültig für /api/visit', () => {
    for (const row of LICENSEE_DOMAIN_REGISTRY) {
      expect(VISIT_TENANT_ID_RE.test(row.tenantId), row.tenantId).toBe(true)
    }
  })

  it('tenantIds sind eindeutig', () => {
    const ids = LICENSEE_DOMAIN_REGISTRY.map((r) => r.tenantId)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
