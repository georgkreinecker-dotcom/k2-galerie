import { describe, it, expect } from 'vitest'
import {
  getPublicGaleriePath,
  getPublicGalerieUrl,
  getPublicK2FamilieMusterEntryUrl,
  normalizeLicenseeAdminUrl,
  getLicenseeAdminQrTargetUrl,
  rewriteLicenceUrlForCustomerDisplay,
} from '../utils/publicLinks'

describe('publicLinks', () => {
  it('getPublicGaleriePath liefert Besucher-Routen für K2/ök2 und VK2-Routen', () => {
    expect(getPublicGaleriePath('k2', 'galerie')).toBe('/galerie')
    expect(getPublicGaleriePath('k2', 'vorschau')).toBe('/galerie-vorschau')
    expect(getPublicGaleriePath('oeffentlich', 'galerie')).toBe('/galerie-oeffentlich')
    expect(getPublicGaleriePath('oeffentlich', 'vorschau')).toBe('/galerie-oeffentlich-vorschau')
    expect(getPublicGaleriePath('vk2', 'galerie')).toBe('/projects/vk2/galerie')
    expect(getPublicGaleriePath('vk2', 'vorschau')).toBe('/projects/vk2/galerie-vorschau')
  })

  it('getPublicGalerieUrl ist absolut und enthält den Pfad', () => {
    const u = getPublicGalerieUrl('k2', 'galerie')
    expect(u.includes('/galerie')).toBe(true)
    expect(u.startsWith('http')).toBe(true)
  })

  it('getPublicK2FamilieMusterEntryUrl zeigt auf Willkommen-Route', () => {
    const u = getPublicK2FamilieMusterEntryUrl()
    expect(u).toContain('/projects/k2-familie/willkommen')
    expect(u.startsWith('http')).toBe(true)
  })

  const origin = 'https://beispiel-galerie.at'

  it('normalizeLicenseeAdminUrl lässt /admin und Query unverändert', () => {
    expect(normalizeLicenseeAdminUrl(`${origin}/admin?tenantId=xyz`, origin)).toBe(`${origin}/admin?tenantId=xyz`)
    expect(normalizeLicenseeAdminUrl(`${origin}/admin/`, origin)).toBe(`${origin}/admin`)
    expect(normalizeLicenseeAdminUrl(`${origin}/admin?context=oeffentlich`, origin)).toBe(
      `${origin}/admin?context=oeffentlich`
    )
  })

  it('normalizeLicenseeAdminUrl ergänzt /admin ohne doppelten Pfad', () => {
    expect(normalizeLicenseeAdminUrl(origin, origin)).toBe(`${origin}/admin`)
  })

  it('getLicenseeAdminQrTargetUrl hängt v und Cache-Bust an', () => {
    const u = getLicenseeAdminQrTargetUrl(`${origin}/admin`, 12345, origin)
    expect(u.startsWith(`${origin}/admin?`)).toBe(true)
    expect(u).toContain('v=12345')
    expect(u).toContain('_=')
  })

  it('rewriteLicenceUrlForCustomerDisplay: Vercel-Vorschau → teilbare Origin, Production unverändert', () => {
    const preview =
      'https://k2-galerie-5xpfubp4x-georgs-projects-77ea633e.vercel.app/admin?t=familie-x'
    const out = rewriteLicenceUrlForCustomerDisplay(preview)
    expect(out).toContain('k2-galerie.vercel.app')
    expect(out).not.toContain('5xpfubp4x')
    expect(out).toContain('/admin?t=familie-x')
    expect(rewriteLicenceUrlForCustomerDisplay('https://k2-galerie.vercel.app/g/test')).toBe(
      'https://k2-galerie.vercel.app/g/test',
    )
  })
})

