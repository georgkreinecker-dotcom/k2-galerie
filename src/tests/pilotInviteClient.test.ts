import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getSendPilotInviteApiUrl, getPilotInviteMailStatusUrl, isPilotInviteLocalDevHostname } from '../utils/pilotInviteClient'

describe('pilotInviteClient', () => {
  beforeEach(() => {
    vi.stubGlobal('window', { location: { hostname: 'localhost', origin: 'http://localhost:5177' } })
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('isPilotInviteLocalDevHostname erkennt localhost', () => {
    expect(isPilotInviteLocalDevHostname('localhost')).toBe(true)
    expect(isPilotInviteLocalDevHostname('127.0.0.1')).toBe(true)
    expect(isPilotInviteLocalDevHostname('k2-galerie.vercel.app')).toBe(false)
  })

  it('getSendPilotInviteApiUrl: localhost → Production-API', () => {
    expect(getSendPilotInviteApiUrl()).toBe('https://k2-galerie.vercel.app/api/send-pilot-invite')
  })

  it('getSendPilotInviteApiUrl: Live-Host → same-origin', () => {
    vi.stubGlobal('window', {
      location: { hostname: 'k2-galerie.vercel.app', origin: 'https://k2-galerie.vercel.app' },
    })
    expect(getSendPilotInviteApiUrl()).toBe('https://k2-galerie.vercel.app/api/send-pilot-invite')
  })

  it('getPilotInviteMailStatusUrl: gleiche Basis wie Send-URL', () => {
    expect(getPilotInviteMailStatusUrl()).toBe('https://k2-galerie.vercel.app/api/pilot-invite-mail-status')
    vi.stubGlobal('window', {
      location: { hostname: 'k2-galerie.vercel.app', origin: 'https://k2-galerie.vercel.app' },
    })
    expect(getPilotInviteMailStatusUrl()).toBe('https://k2-galerie.vercel.app/api/pilot-invite-mail-status')
  })
})
