import { describe, it, expect, vi } from 'vitest'
import {
  buildPilotEinladungUrl,
  buildPilotEinladungUrlQuery,
  getPilotInviteLinkBaseUrl,
  getPilotInviteRequestOrigin,
  isPilotInviteAllowedOrigin,
  signPilotInviteToken,
  verifyPilotInviteToken,
} from '../../api/pilotInviteShared.js'

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

  it('buildPilotEinladungUrl: kurzer Pfad /p/… ohne Query', () => {
    const url = buildPilotEinladungUrl('https://k2-galerie.vercel.app', 'abc123')
    expect(url).toContain('/p/abc123')
    expect(url.includes('token=')).toBe(false)
    expect(url.includes('?t=')).toBe(false)
  })

  it('buildPilotEinladungUrlQuery: E-Mail-Links mit ?t= (robuster gegen Zeilenumbruch)', () => {
    const url = buildPilotEinladungUrlQuery('https://k2-galerie.vercel.app', 'abc.def')
    expect(url).toContain('/p?t=')
    expect(url).toContain(encodeURIComponent('abc.def'))
  })

  it('getPilotInviteLinkBaseUrl: Dev localhost → feste Production-URL für E-Mails', () => {
    const req = { headers: { host: 'localhost:5177' } }
    expect(getPilotInviteLinkBaseUrl(req as any)).toBe('https://k2-galerie.vercel.app')
  })

  it('getPilotInviteLinkBaseUrl: PILOT_INVITE_PUBLIC_BASE_URL überschreibt', () => {
    vi.stubEnv('PILOT_INVITE_PUBLIC_BASE_URL', 'http://localhost:7777')
    try {
      const req = { headers: { host: 'localhost:5177' } }
      expect(getPilotInviteLinkBaseUrl(req as any)).toBe('http://localhost:7777')
    } finally {
      vi.unstubAllEnvs()
    }
  })

  it('sign/verify mit kompaktem Token (v2)', () => {
    const token = signPilotInviteToken({ name: 'Georg', context: 'oeffentlich' }, 'sekret')
    const verified = verifyPilotInviteToken(token, 'sekret')
    expect(verified?.name).toBe('Georg')
    expect(verified?.context).toBe('oeffentlich')
  })
})
