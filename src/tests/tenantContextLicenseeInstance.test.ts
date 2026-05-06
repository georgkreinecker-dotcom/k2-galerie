/**
 * Lizenznehmer-Clone (keine Plattform): ök2/VK2 per URL darf nicht aktiv werden.
 * Eiserne Regel: eiserne-regel-lizenznehmer-kein-oek2-vk2.mdc, TenantContext-Kommentar.
 */
import { describe, it, expect, vi } from 'vitest'

vi.mock('../config/tenantConfig', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../config/tenantConfig')>()
  return { ...mod, isPlatformInstance: () => false }
})

import { deriveTenantId } from '../context/TenantContext'

describe('deriveTenantId – Lizenznehmer-Instanz (nicht Plattform)', () => {
  it('ignoriert ?context=oeffentlich und ?context=vk2 auf /admin → immer k2', () => {
    expect(deriveTenantId('/admin', '?context=oeffentlich')).toBe('k2')
    expect(deriveTenantId('/admin', '?context=VK2')).toBe('k2')
    expect(deriveTenantId('/admin', '')).toBe('k2')
  })

  it('ignoriert ?context=oeffentlich auf APf-Projektpfad k2-galerie → k2', () => {
    expect(
      deriveTenantId('/projects/k2-galerie/marketing-oek2', '?context=oeffentlich'),
    ).toBe('k2')
  })

  it('/projects/vk2/* liefert k2 (VK2-Routen auf Clone nicht „vk2“-Mandant)', () => {
    expect(deriveTenantId('/projects/vk2/galerie', '')).toBe('k2')
    expect(deriveTenantId('/projects/vk2/einstieg', '?x=1')).toBe('k2')
  })

  it('/dev-view ök2/VK2-Seitenparams liefern k2 (kein Demo-Mandant auf Clone)', () => {
    expect(deriveTenantId('/dev-view', '?page=galerie-oeffentlich')).toBe('k2')
    expect(deriveTenantId('/dev-view', '?page=vk2-admin')).toBe('k2')
  })
})
