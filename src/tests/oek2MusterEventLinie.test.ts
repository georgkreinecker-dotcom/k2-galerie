import { describe, it, expect } from 'vitest'
import { pickOpeningEventForWerbemittel } from '../utils/oek2MusterEventLinie'

describe('oek2MusterEventLinie', () => {
  it('pickOpeningEventForWerbemittel bevorzugt Vernissage-Typ', () => {
    const events = [
      { id: 'a', type: 'sonstiges', date: '2026-04-01', title: 'X' },
      { id: 'b', type: 'vernissage', date: '2026-03-15', title: 'Vernissage – Neue Arbeiten' },
    ]
    expect(pickOpeningEventForWerbemittel(events)?.id).toBe('b')
  })

  it('pickOpeningEventForWerbemittel: erstes mit Datum wenn kein Öffnungs-Typ', () => {
    const events = [{ id: 'x', type: 'workshop', date: '2026-05-01', title: 'Kurs' }]
    expect(pickOpeningEventForWerbemittel(events)?.id).toBe('x')
  })

  it('pickOpeningEventForWerbemittel: leer → null', () => {
    expect(pickOpeningEventForWerbemittel([])).toBeNull()
    expect(pickOpeningEventForWerbemittel(null as unknown as any[])).toBeNull()
  })
})
