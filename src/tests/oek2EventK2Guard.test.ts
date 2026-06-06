import { describe, it, expect, beforeEach } from 'vitest'
import {
  filterK2ContaminationFromOek2Events,
  isKnownK2GalerieEroeffnungEvent,
  matchesK2EventsFingerprint,
} from '../utils/oek2EventK2Guard'
import { loadEvents, saveEvents } from '../utils/eventsStorage'

describe('oek2EventK2Guard', () => {
  beforeEach(() => {
    localStorage.removeItem('k2-events')
    localStorage.removeItem('k2-oeffentlich-events')
  })

  it('erkennt K2-Eröffnung an Titel und Typ', () => {
    expect(
      isKnownK2GalerieEroeffnungEvent({
        id: 'event-123',
        title: 'Eröffnung der K2 Galerie',
        type: 'galerieeröffnung',
        date: '2026-04-24',
        endDate: '2026-04-26',
      })
    ).toBe(true)
  })

  it('Fingerprint-Match auch bei neuer ID', () => {
    const k2 = [{ id: 'k2-old', title: 'Workshop X', type: 'workshop', date: '2026-05-01' }]
    const leak = { id: 'event-new-id', title: 'Workshop X', type: 'workshop', date: '2026-05-01' }
    expect(matchesK2EventsFingerprint(leak, k2)).toBe(true)
    expect(filterK2ContaminationFromOek2Events([leak, { id: 'oek2-ok', title: 'Demo', date: '2026-06-01' }], k2)).toHaveLength(1)
  })

  it('loadEvents(oeffentlich) entfernt K2-Eröffnung mit neuer ID und repariert Speicher', () => {
    const k2Eroeffnung = {
      id: `event-${Date.now()}`,
      title: 'Eröffnung der K2 Galerie',
      type: 'galerieeröffnung',
      date: '2026-04-24',
      endDate: '2026-04-26',
    }
    const demoPast = {
      id: 'event-atelier-paul-weber-1',
      title: 'Ateliersbesichtigung bei Paul Weber',
      type: 'vernissage',
      date: '2026-05-20',
    }
    localStorage.setItem('k2-oeffentlich-events', JSON.stringify([k2Eroeffnung, demoPast]))
    const after = loadEvents('oeffentlich')
    expect(after.some((e) => e.title === 'Eröffnung der K2 Galerie')).toBe(false)
    expect(after.some((e) => e.id === demoPast.id)).toBe(true)
    const stored = JSON.parse(localStorage.getItem('k2-oeffentlich-events') || '[]')
    expect(stored.some((e: { title?: string }) => e.title === 'Eröffnung der K2 Galerie')).toBe(false)
  })

  it('saveEvents(oeffentlich) lässt K2-Eröffnung nicht durch', () => {
    localStorage.setItem('k2-oeffentlich-events', JSON.stringify([{ id: 'oek2-only', title: 'Demo Vernissage', date: '2026-03-15' }]))
    saveEvents('oeffentlich', [
      { id: 'oek2-only', title: 'Demo Vernissage', date: '2026-03-15' },
      {
        id: 'event-leak',
        title: 'Eröffnung der K2 Galerie',
        type: 'galerieeröffnung',
        date: '2026-04-24',
        endDate: '2026-04-26',
      },
    ])
    const after = loadEvents('oeffentlich')
    expect(after).toHaveLength(1)
    expect(after[0].id).toBe('oek2-only')
  })
})
