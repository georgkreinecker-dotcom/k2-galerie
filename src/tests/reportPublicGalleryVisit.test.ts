import { describe, it, expect } from 'vitest'
import { isValidVisitTenantId, VISIT_TENANT_ID_RE } from '../utils/reportPublicGalleryVisit'

describe('reportPublicGalleryVisit / Mandanten-Slug', () => {
  it('akzeptiert K2, ök2, VK2 und Lizenz-Slugs', () => {
    expect(isValidVisitTenantId('k2')).toBe(true)
    expect(isValidVisitTenantId('oeffentlich')).toBe(true)
    expect(isValidVisitTenantId('vk2-members')).toBe(true)
    expect(isValidVisitTenantId('vk2-external')).toBe(true)
    expect(isValidVisitTenantId('meine-galerie-2026')).toBe(true)
  })
  it('lehnt ungültige Zeichen oder Länge ab', () => {
    expect(isValidVisitTenantId('')).toBe(false)
    expect(isValidVisitTenantId('Gross')).toBe(false)
    expect(isValidVisitTenantId('a'.repeat(65))).toBe(false)
    expect(isValidVisitTenantId('gal_erie')).toBe(false)
  })
  it('VISIT_TENANT_ID_RE ist stabil (Sync mit api/visit-and-build.js)', () => {
    expect(VISIT_TENANT_ID_RE.source).toBe('^[a-z0-9-]{1,64}$')
  })
})
