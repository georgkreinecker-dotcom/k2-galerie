import { describe, expect, it } from 'vitest'
import type { MissionVisitSnapshot } from '../utils/missionVisitSnapshots'
import { computeMissionVisitDailyDeltas, computeNextMissionVisitSnapshots, normalizeMissionVisitSnapshotRow } from '../utils/missionVisitSnapshots'

describe('missionVisitSnapshots', () => {
  it('ersetzt den Eintrag am selben Kalendertag', () => {
    const d0 = new Date('2026-04-10T08:00:00')
    const d1 = new Date('2026-04-10T18:00:00')
    const a: MissionVisitSnapshot[] = [
      { at: d0.toISOString(), k2: 1, oeffentlich: 0, vk2Demo: 0, k2FamilieMuster: 0, kreineckerStammbaum: 0 },
    ]
    const next = computeNextMissionVisitSnapshots(a, d1, {
      k2: 5,
      oeffentlich: 1,
      vk2Demo: 0,
      k2FamilieMuster: 0,
      kreineckerStammbaum: 0,
    })
    expect(next).toHaveLength(1)
    expect(next[0].k2).toBe(5)
    expect(next[0].oeffentlich).toBe(1)
  })

  it('hängt einen neuen Tag an', () => {
    const prev: MissionVisitSnapshot[] = [
      {
        at: new Date('2026-04-10T12:00:00').toISOString(),
        k2: 1,
        oeffentlich: 0,
        vk2Demo: 0,
        k2FamilieMuster: 0,
        kreineckerStammbaum: 0,
      },
    ]
    const next = computeNextMissionVisitSnapshots(prev, new Date('2026-04-11T12:00:00'), {
      k2: 2,
      oeffentlich: 0,
      vk2Demo: 0,
      k2FamilieMuster: 0,
      kreineckerStammbaum: 0,
    })
    expect(next).toHaveLength(2)
    expect(next[1].k2).toBe(2)
  })

  it('Tageszuwachs: Differenz zum Vortag, erster Tag 0', () => {
    const timeline: MissionVisitSnapshot[] = [
      {
        at: '2026-04-27T20:00:00.000Z',
        k2: 200,
        oeffentlich: 10,
        vk2Demo: 5,
        k2FamilieMuster: 3,
        kreineckerStammbaum: 221,
      },
      {
        at: '2026-04-28T20:00:00.000Z',
        k2: 205,
        oeffentlich: 12,
        vk2Demo: 5,
        k2FamilieMuster: 7,
        kreineckerStammbaum: 221,
      },
      {
        at: '2026-04-29T10:00:00.000Z',
        k2: 208,
        oeffentlich: 12,
        vk2Demo: 6,
        k2FamilieMuster: 7,
        kreineckerStammbaum: 223,
      },
    ]
    const d = computeMissionVisitDailyDeltas(timeline)
    expect(d[0]).toEqual({ k2: 0, oeffentlich: 0, vk2Demo: 0, k2FamilieMuster: 0, kreineckerStammbaum: 0 })
    expect(d[1]).toEqual({ k2: 5, oeffentlich: 2, vk2Demo: 0, k2FamilieMuster: 4, kreineckerStammbaum: 0 })
    expect(d[2]).toEqual({ k2: 3, oeffentlich: 0, vk2Demo: 1, k2FamilieMuster: 0, kreineckerStammbaum: 2 })
  })

  it('Tageszuwachs: API-Rückgang wird als 0 gezählt', () => {
    const timeline: MissionVisitSnapshot[] = [
      { at: '2026-04-01T12:00:00.000Z', k2: 10, oeffentlich: 0, vk2Demo: 0, k2FamilieMuster: 0, kreineckerStammbaum: 0 },
      { at: '2026-04-02T12:00:00.000Z', k2: 8, oeffentlich: 0, vk2Demo: 0, k2FamilieMuster: 0, kreineckerStammbaum: 0 },
    ]
    const d = computeMissionVisitDailyDeltas(timeline)
    expect(d[1].k2).toBe(0)
  })

  it('normalisiert fehlende Felder', () => {
    const r = normalizeMissionVisitSnapshotRow({ at: '2026-01-01T00:00:00.000Z', k2: 3 })
    expect(r).not.toBeNull()
    expect(r!.kreineckerStammbaum).toBe(0)
  })
})
