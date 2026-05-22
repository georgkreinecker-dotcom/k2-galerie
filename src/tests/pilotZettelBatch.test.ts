import { describe, it, expect } from 'vitest'
import { buildZettelPilotRelPath } from '../utils/pilotZettelBatch'

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
  })
})
