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

  it('liefert vk2 für /mein-bereich?context=vk2 (Einstieg Galerie → Admin, VK2-Admin-Rundgang)', () => {
    expect(deriveTenantId('/mein-bereich', '?context=vk2')).toBe('vk2')
  })

  it('liefert vk2 für /dev-view?page=vk2-admin (APf Smart Panel ohne ?context= in der URL)', () => {
    expect(deriveTenantId('/dev-view', '?page=vk2-admin')).toBe('vk2')
    expect(deriveTenantId('/dev-view', '?page=vk2-kunden')).toBe('vk2')
  })

  it('liefert oeffentlich für /dev-view?page=galerie-oeffentlich', () => {
    expect(deriveTenantId('/dev-view', '?page=galerie-oeffentlich')).toBe('oeffentlich')
  })
})
