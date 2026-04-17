/**
 * Vereinsmuster: /projects/vk2/* muss Mandant vk2 liefern (Rundgang, Keys), auch ohne vorherigen /admin?context=vk2.
 */
import { describe, it, expect, vi } from 'vitest'

vi.mock('../config/tenantConfig', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../config/tenantConfig')>()
  return { ...mod, isPlatformInstance: () => true }
})

import { deriveTenantId } from '../context/TenantContext'

describe('deriveTenantId – VK2-Projektpfad', () => {
  it('liefert vk2 für /projects/vk2/... auf der Plattform', () => {
    expect(deriveTenantId('/projects/vk2/galerie', '')).toBe('vk2')
    expect(deriveTenantId('/projects/vk2/einstieg', '?x=1')).toBe('vk2')
  })
})
