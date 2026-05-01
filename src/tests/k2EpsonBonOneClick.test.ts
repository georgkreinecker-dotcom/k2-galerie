import { describe, it, expect, vi, afterEach } from 'vitest'
import { normalizeK2PrintServerBaseUrl, canPostToK2PrintServer } from '../utils/k2EpsonBonOneClick'

describe('k2EpsonBonOneClick', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('normalizeK2PrintServerBaseUrl trimmt und ergänzt http', () => {
    expect(normalizeK2PrintServerBaseUrl(' 192.168.1.5:3847/ ')).toBe('http://192.168.1.5:3847')
    expect(normalizeK2PrintServerBaseUrl('http://localhost:3847')).toBe('http://localhost:3847')
  })

  it('canPostToK2PrintServer: leere URL', () => {
    vi.stubGlobal('window', { location: { href: 'https://example.com/' } })
    const r = canPostToK2PrintServer('   ')
    expect(r.ok).toBe(false)
    expect(r.reason).toMatch(/fehlt|leer/i)
  })

  it('canPostToK2PrintServer: https-Seite blockiert http-Print-Server', () => {
    vi.stubGlobal('window', { location: { href: 'https://k2-galerie.vercel.app/galerie' } })
    const r = canPostToK2PrintServer('http://192.168.1.2:3847')
    expect(r.ok).toBe(false)
    expect(r.reason).toMatch(/https|http|Browser|Sicherheit/i)
  })

  it('canPostToK2PrintServer: http-Seite erlaubt http-Print-Server', () => {
    vi.stubGlobal('window', { location: { href: 'http://192.168.1.10:5175/admin' } })
    const r = canPostToK2PrintServer('http://192.168.1.2:3847')
    expect(r.ok).toBe(true)
  })
})
