import crypto from 'crypto'
import { describe, it, expect, vi } from 'vitest'
import {
  buildPilotEinladungUrl,
  buildPilotEinladungUrlQuery,
  buildPilotInviteEmailPlainText,
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

  it('sign/verify mit kompaktem Token (v3: Vorname, Nachname, E-Mail)', () => {
    const token = signPilotInviteToken(
      { firstName: 'Georg', lastName: 'Kreinecker', email: 'g@example.com', context: 'oeffentlich' },
      'sekret',
    )
    const verified = verifyPilotInviteToken(token, 'sekret')
    expect(verified?.name).toBe('Georg Kreinecker')
    expect(verified?.firstName).toBe('Georg')
    expect(verified?.lastName).toBe('Kreinecker')
    expect(verified?.email).toBe('g@example.com')
    expect(verified?.context).toBe('oeffentlich')
  })

  it('verify: altes v2-Token (nur n, ohne vn/nn/e) noch lesbar', () => {
    const secret = 'sekret'
    const data = {
      v: 2,
      n: 'Nur Ein Name',
      c: 'oeffentlich',
      x: Math.floor(Date.now() / 1000) + 86400 * 30,
    }
    const payloadStr = Buffer.from(JSON.stringify(data), 'utf8').toString('base64url')
    const sig = crypto.createHmac('sha256', secret).update(payloadStr).digest('base64url')
    const legacyToken = `${payloadStr}.${sig}`
    const verified = verifyPilotInviteToken(legacyToken, secret)
    expect(verified?.name).toBe('Nur Ein Name')
    expect(verified?.firstName).toBe('')
    expect(verified?.lastName).toBe('')
    expect(verified?.email).toBe('')
  })

  it('buildPilotInviteEmailPlainText: kein Konto, Schritte, öffentliche Demo', () => {
    const t = buildPilotInviteEmailPlainText({
      name: 'Alex Beispiel',
      greetingName: 'Alex',
      inviteUrl: 'https://x.example/p?t=abc',
      contextLabel: 'öffentliche Demo (ök2)',
      inviteContext: 'oeffentlich',
    })
    expect(t).toContain('kein Passwort')
    expect(t).toContain('Weiter zur öffentlichen Demo (ök2)')
    expect(t).toContain('Stammdaten')
    expect(t).toContain('Hallo Alex')
    expect(t).toContain('<https://x.example/p?t=abc>')
  })

  it('buildPilotInviteEmailPlainText: VK2-Button-Text', () => {
    const t = buildPilotInviteEmailPlainText({
      name: 'Alex Beispiel',
      greetingName: 'Alex',
      inviteUrl: 'https://x.example/p?t=abc',
      contextLabel: 'VK2 Vereins-Demo',
      inviteContext: 'vk2',
    })
    expect(t).toContain('Weiter zur VK2-Vorschau (Verein)')
    expect(t).toContain('Vereins-Vorschau')
  })
})
