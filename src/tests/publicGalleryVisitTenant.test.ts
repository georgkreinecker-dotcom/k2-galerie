import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as vk2Keys from '../utils/vk2StorageKeys'
import {
  getOek2PilotDigitsFromSession,
  resolveOek2PublicGalleryVisitTenantId,
  resolveVk2PublicGalleryVisitTenantId,
} from '../utils/publicGalleryVisitTenant'

describe('publicGalleryVisitTenant', () => {
  beforeEach(() => {
    try {
      sessionStorage.clear()
    } catch {
      /* ignore */
    }
    vi.restoreAllMocks()
  })

  it('ök2: ohne Einladung → oeffentlich', () => {
    expect(resolveOek2PublicGalleryVisitTenantId()).toBe('oeffentlich')
  })

  it('ök2: Zettel-Ziffern in k2-pilot-einladung → oeffentlich-pilot-{digits}', () => {
    sessionStorage.setItem(
      'k2-pilot-einladung',
      JSON.stringify({ context: 'oeffentlich', oek2PilotId: '42' }),
    )
    expect(getOek2PilotDigitsFromSession()).toBe('42')
    expect(resolveOek2PublicGalleryVisitTenantId()).toBe('oeffentlich-pilot-42')
  })

  it('VK2: kein Pilot → vk2', () => {
    vi.spyOn(vk2Keys, 'getActiveVk2PilotId').mockReturnValue(null)
    expect(resolveVk2PublicGalleryVisitTenantId()).toBe('vk2')
  })

  it('VK2: aktiver Pilot → vk2-pilot-{id}', () => {
    vi.spyOn(vk2Keys, 'getActiveVk2PilotId').mockReturnValue('7')
    expect(resolveVk2PublicGalleryVisitTenantId()).toBe('vk2-pilot-7')
  })
})
