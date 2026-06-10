import { describe, it, expect } from 'vitest'
import { buildZettelPilotRelPath, absoluteZugangsblattUrl } from '../utils/pilotZettelBatch'
import { toAbsolutePilotShareUrl } from '../utils/pilotInviteClient'

describe('pilotZettelBatch', () => {
  it('buildZettelPilotRelPath enthält name, type und pilotUrl', () => {
    const rel = buildZettelPilotRelPath({
      name: 'Wolfgang Kraus',
      appName: 'Woifal',
      linie: 'familie',
      zettelNr: '12',
    })
    expect(rel.startsWith('/zettel-pilot?')).toBe(true)
    const q = new URLSearchParams(rel.split('?')[1])
    expect(q.get('name')).toBe('Wolfgang Kraus')
    expect(q.get('appName')).toBe('Woifal')
    expect(q.get('type')).toBe('familie')
    expect(q.get('nr')).toBe('12')
    expect(q.get('pilotUrl')).toBeTruthy()
    expect(q.get('pilotUrl')).toContain('k2-galerie.vercel.app')
  })

  it('absoluteZugangsblattUrl: localhost-Origin → Vercel (Simuliert APf am Mac)', () => {
    const prev = globalThis.window
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        location: { hostname: 'localhost', origin: 'http://localhost:5177', pathname: '/zettel-pilot', search: '?nr=15' },
      },
    })
    try {
      const abs = absoluteZugangsblattUrl('/zettel-pilot?name=Woifal&nr=15')
      expect(abs.startsWith('https://k2-galerie.vercel.app/zettel-pilot?')).toBe(true)
      expect(abs).not.toContain('localhost')
      const fixed = toAbsolutePilotShareUrl('http://localhost:5177/zettel-pilot?nr=15')
      expect(fixed).toBe('https://k2-galerie.vercel.app/zettel-pilot?nr=15')
    } finally {
      Object.defineProperty(globalThis, 'window', { configurable: true, value: prev })
    }
  })
})
