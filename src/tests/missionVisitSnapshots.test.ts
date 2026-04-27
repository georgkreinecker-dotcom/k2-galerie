import { describe, expect, it } from 'vitest'
import type { MissionVisitSnapshot } from '../utils/missionVisitSnapshots'
import { computeNextMissionVisitSnapshots, normalizeMissionVisitSnapshotRow } from '../utils/missionVisitSnapshots'

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

  it('normalisiert fehlende Felder', () => {
    const r = normalizeMissionVisitSnapshotRow({ at: '2026-01-01T00:00:00.000Z', k2: 3 })
    expect(r).not.toBeNull()
    expect(r!.kreineckerStammbaum).toBe(0)
  })
})
