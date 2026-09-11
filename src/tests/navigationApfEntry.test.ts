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

describe('K2_APF_HANDY_QR', () => {
  it('Handy-QR zeigt auf /dev-view (APf-SPA, kein 404 bei fehlender Boot-Datei)', async () => {
    const { K2_APF_HANDY_QR_PATH, K2_APF_HANDY_QR_URL } = await import('../config/navigation')
    expect(K2_APF_HANDY_QR_PATH).toBe('/dev-view')
    expect(K2_APF_HANDY_QR_URL).toBe('https://k2-galerie.vercel.app/dev-view')
  })
})
