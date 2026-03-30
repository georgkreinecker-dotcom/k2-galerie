import { describe, expect, it } from 'vitest'
import { isPlatformHostname } from '../config/tenantConfig'

describe('isPlatformHostname', () => {
  it('kennt feste Plattform-Hosts', () => {
    expect(isPlatformHostname('localhost')).toBe(true)
    expect(isPlatformHostname('k2-galerie.vercel.app')).toBe(true)
    expect(isPlatformHostname('kgm.at')).toBe(true)
  })

  it('Vercel Preview/Team dieses Projekts', () => {
    expect(isPlatformHostname('k2-galerie-git-main-foo.vercel.app')).toBe(true)
    expect(isPlatformHostname('k2-galerie-abc123.vercel.app')).toBe(true)
  })

  it('fremde Vercel-App = keine Plattform', () => {
    expect(isPlatformHostname('meine-galerie.vercel.app')).toBe(false)
    expect(isPlatformHostname('evil.example.vercel.app')).toBe(false)
  })
})
