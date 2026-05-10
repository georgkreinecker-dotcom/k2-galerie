import { describe, expect, it } from 'vitest'
import { buildLk2GalerieLizenzAdminUrlOhneTenant, isBareK2GalerieApfHubSearch } from '../config/navigation'

describe('isBareK2GalerieApfHubSearch', () => {
  it('apf=1 ohne page → true', () => {
    expect(isBareK2GalerieApfHubSearch('?apf=1')).toBe(true)
    expect(isBareK2GalerieApfHubSearch('?apf=1&foo=bar')).toBe(true)
  })
  it('mit page= → false (Deep-Link, Resume erlaubt)', () => {
    expect(isBareK2GalerieApfHubSearch('?apf=1&page=handbuch')).toBe(false)
  })
  it('ohne apf=1 → false', () => {
    expect(isBareK2GalerieApfHubSearch('?page=galerie')).toBe(false)
    expect(isBareK2GalerieApfHubSearch('')).toBe(false)
  })
})

describe('buildLk2GalerieLizenzAdminUrlOhneTenant', () => {
  it('LK2-Fallback = ök2-Admin mit focusDirection', () => {
    expect(buildLk2GalerieLizenzAdminUrlOhneTenant('keramik')).toBe(
      '/admin?context=oeffentlich&focusDirection=keramik',
    )
    expect(buildLk2GalerieLizenzAdminUrlOhneTenant(null)).toBe(
      '/admin?context=oeffentlich&focusDirection=kunst',
    )
  })
})
