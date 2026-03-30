import { describe, it, expect } from 'vitest'
import { getPilotInviteRequestOrigin, isPilotInviteAllowedOrigin } from '../../api/pilotInviteShared.js'

describe('pilotInviteShared – Testpilot-API Origin', () => {
  it('getPilotInviteRequestOrigin nutzt Origin-Header', () => {
    const req = { headers: { origin: 'https://k2-galerie.vercel.app' } }
    expect(getPilotInviteRequestOrigin(req as any)).toBe('https://k2-galerie.vercel.app')
  })

  it('getPilotInviteRequestOrigin: Referer wenn Origin fehlt', () => {
    const req = {
      headers: { referer: 'https://k2-galerie.vercel.app/projects/k2-galerie/licences' },
    }
    expect(getPilotInviteRequestOrigin(req as any)).toBe('https://k2-galerie.vercel.app')
  })

  it('getPilotInviteRequestOrigin: Host-Fallback (localhost)', () => {
    const req = { headers: { host: 'localhost:5177' } }
    expect(getPilotInviteRequestOrigin(req as any)).toBe('http://localhost:5177')
  })

  it('isPilotInviteAllowedOrigin: gleicher Host wie Origin (eigene Domain)', () => {
    const origin = 'https://www.beispiel-galerie.at'
    const req = { headers: { host: 'www.beispiel-galerie.at' } }
    expect(isPilotInviteAllowedOrigin(origin, '', req as any)).toBe(true)
  })

  it('isPilotInviteAllowedOrigin: fremde Origin + Vercel-Host lehnt ab', () => {
    const origin = 'https://boese.example'
    const req = { headers: { host: 'k2-galerie.vercel.app' } }
    expect(isPilotInviteAllowedOrigin(origin, '', req as any)).toBe(false)
  })
})
