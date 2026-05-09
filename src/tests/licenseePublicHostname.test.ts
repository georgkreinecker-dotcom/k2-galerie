/**
 * Lizenz-Domains per VITE_LICENSEE_PUBLIC_HOSTNAMES – nie Plattform (ök2/VK2).
 */
import { describe, expect, it, vi } from 'vitest'

describe('isLicenseePublicHostname / isPlatformHostname mit VITE_LICENSEE_PUBLIC_HOSTNAMES', () => {
  it('konfigurierte Hosts sind keine Plattform; k2-galerie bleibt Plattform', async () => {
    vi.stubEnv('VITE_LICENSEE_PUBLIC_HOSTNAMES', 'meine-lizenz.example.com, ANDERE.DE')
    vi.resetModules()
    const { isPlatformHostname, isLicenseePublicHostname } = await import('../config/tenantConfig')
    expect(isLicenseePublicHostname('meine-lizenz.example.com')).toBe(true)
    expect(isLicenseePublicHostname('andere.de')).toBe(true)
    expect(isPlatformHostname('meine-lizenz.example.com')).toBe(false)
    expect(isPlatformHostname('andere.de')).toBe(false)
    expect(isPlatformHostname('k2-galerie.vercel.app')).toBe(true)
    expect(isPlatformHostname('localhost')).toBe(true)
    vi.unstubAllEnvs()
  })

  it('ohne Env: keine Lizenz-Hosts, Vercel-Preview-Regel unverändert', async () => {
    vi.unstubAllEnvs()
    vi.resetModules()
    const { isLicenseePublicHostname, isPlatformHostname } = await import('../config/tenantConfig')
    expect(isLicenseePublicHostname('irgendwas.example.com')).toBe(false)
    expect(isPlatformHostname('k2-galerie-git-main-xyz.vercel.app')).toBe(true)
  })
})
