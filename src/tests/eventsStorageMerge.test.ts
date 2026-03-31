import { describe, it, expect } from 'vitest'
import { mergeEventTimesFromLocal } from '../utils/eventsStorage'

describe('mergeEventTimesFromLocal', () => {
  it('ergänzt endTime vom lokalen Event wenn Server nur startTime hat', () => {
    const server = [
      { id: 'e1', title: 'X', date: '2026-04-24', startTime: '18:00', endTime: '', dailyTimes: {} },
    ]
    const local = [
      { id: 'e1', title: 'X', date: '2026-04-24', startTime: '18:00', endTime: '21:00', dailyTimes: {} },
    ]
    const out = mergeEventTimesFromLocal(server, local)
    expect(out[0].endTime).toBe('21:00')
    expect(out[0].startTime).toBe('18:00')
  })

  it('übernimmt dailyTimes vom lokalen Stand wenn Server leer ist', () => {
    const dt = { '2026-04-24': { start: '14:00', end: '19:00' } }
    const server = [{ id: 'e1', date: '2026-04-24', dailyTimes: {} }]
    const local = [{ id: 'e1', date: '2026-04-24', dailyTimes: dt }]
    const out = mergeEventTimesFromLocal(server, local)
    expect(out[0].dailyTimes).toEqual(dt)
  })

  it('merged pro Tag: fehlendes end im Server aus Local', () => {
    const server = [
      {
        id: 'e1',
        date: '2026-04-24',
        endDate: '2026-04-26',
        dailyTimes: {
          '2026-04-24': { start: '18:00', end: '' },
        },
      },
    ]
    const local = [
      {
        id: 'e1',
        date: '2026-04-24',
        endDate: '2026-04-26',
        dailyTimes: {
          '2026-04-24': { start: '18:00', end: '21:00' },
        },
      },
    ]
    const out = mergeEventTimesFromLocal(server, local)
    expect(out[0].dailyTimes['2026-04-24']).toEqual({ start: '18:00', end: '21:00' })
  })

  it('Server-Zeiten bleiben wenn lokal leer', () => {
    const server = [{ id: 'e1', startTime: '19:00', endTime: '22:00' }]
    const local = [{ id: 'e1', startTime: '', endTime: '' }]
    const out = mergeEventTimesFromLocal(server, local)
    expect(out[0].startTime).toBe('19:00')
    expect(out[0].endTime).toBe('22:00')
  })

  it('behält lokales Medienfeld wenn Server nur Platzhalter liefert', () => {
    const server = [{ id: 'e1', title: 'X', bannerUrl: '/img/muster/malerei.svg', startTime: '18:00', endTime: '' }]
    const local = [{ id: 'e1', title: 'X', bannerUrl: '/img/k2/event-eroeffnung.jpg', startTime: '18:00', endTime: '21:00' }]
    const out = mergeEventTimesFromLocal(server, local)
    expect(out[0].bannerUrl).toBe('/img/k2/event-eroeffnung.jpg')
    expect(out[0].endTime).toBe('21:00')
  })
})
