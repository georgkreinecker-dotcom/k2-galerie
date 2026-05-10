/**
 * Plattform /admin: Lizenz-Mandant (?tenantId=galerie-*) darf nicht hinter ?context=oeffentlich zur ök2-Demo rutschen.
 */
import { describe, it, expect, vi } from 'vitest'

vi.mock('../config/tenantConfig', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../config/tenantConfig')>()
  return { ...mod, isPlatformInstance: () => true }
})

import { deriveTenantId, resolveDynamicTenantIdFromLocation } from '../context/TenantContext'

describe('deriveTenantId – Plattform /admin mit Lizenz-tenantId', () => {
  it('?tenantId=galerie-* + context=oeffentlich → k2 (Mandant, nicht ök2)', () => {
    expect(
      deriveTenantId(
        '/admin',
        '?tenantId=galerie-demo-1&context=oeffentlich&focusDirection=kunst',
      ),
    ).toBe('k2')
  })

  it('resolveDynamicTenantIdFromLocation liefert weiterhin den Mandanten', () => {
    expect(
      resolveDynamicTenantIdFromLocation(
        '/admin',
        '?tenantId=galerie-demo-1&context=oeffentlich&focusDirection=kunst',
      ),
    ).toBe('galerie-demo-1')
  })

  it('ohne tenantId bleibt context=oeffentlich → ök2 (LK2-Fallback)', () => {
    expect(deriveTenantId('/admin', '?context=oeffentlich&focusDirection=kunst')).toBe('oeffentlich')
  })
})
