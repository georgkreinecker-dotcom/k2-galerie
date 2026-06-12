import { describe, expect, it } from 'vitest'
import type { MissionVisitSnapshot } from '../utils/missionVisitSnapshots'
import {
  bucketSeriesForChart,
  buildLicenseeVisitSeries,
  buildMissionVisitSeriesForField,
  computeMissionVisitDailyDeltas,
  computeNextMissionVisitSnapshots,
  filterSeriesByDays,
  normalizeMissionVisitSnapshotRow,
  type MissionVisitSeriesPoint,
} from '../utils/missionVisitSnapshots'

describe('missionVisitSnapshots', () => {
  it('ersetzt den Eintrag am selben Kalendertag', () => {
    const d0 = new Date('2026-04-10T08:00:00')
    const d1 = new Date('2026-04-10T18:00:00')
    const a: MissionVisitSnapshot[] = [
      {
        at: d0.toISOString(),
        k2: 1,
        oeffentlich: 0,
        oeffentlichPilot: 0,
        oeffentlichGesamt: 0,
        vk2Demo: 0,
        vk2Pilot: 0,
        vk2Gesamt: 0,
        k2FamilieMuster: 0,
        kreineckerStammbaum: 0,
      },
    ]
    const next = computeNextMissionVisitSnapshots(a, d1, {
      k2: 5,
      oeffentlich: 1,
      oeffentlichPilot: 2,
      oeffentlichGesamt: 3,
      vk2Demo: 0,
      vk2Pilot: 0,
      vk2Gesamt: 0,
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
        oeffentlichPilot: 0,
        oeffentlichGesamt: 0,
        vk2Demo: 0,
        vk2Pilot: 0,
        vk2Gesamt: 0,
        k2FamilieMuster: 0,
        kreineckerStammbaum: 0,
      },
    ]
    const next = computeNextMissionVisitSnapshots(prev, new Date('2026-04-11T12:00:00'), {
      k2: 2,
      oeffentlich: 0,
      oeffentlichPilot: 0,
      oeffentlichGesamt: 0,
      vk2Demo: 0,
      vk2Pilot: 0,
      vk2Gesamt: 0,
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
        oeffentlichPilot: 1,
        oeffentlichGesamt: 11,
        vk2Demo: 5,
        vk2Pilot: 0,
        vk2Gesamt: 5,
        k2FamilieMuster: 3,
        kreineckerStammbaum: 221,
      },
      {
        at: '2026-04-28T20:00:00.000Z',
        k2: 205,
        oeffentlich: 12,
        oeffentlichPilot: 1,
        oeffentlichGesamt: 13,
        vk2Demo: 5,
        vk2Pilot: 0,
        vk2Gesamt: 5,
        k2FamilieMuster: 7,
        kreineckerStammbaum: 221,
      },
      {
        at: '2026-04-29T10:00:00.000Z',
        k2: 208,
        oeffentlich: 12,
        oeffentlichPilot: 2,
        oeffentlichGesamt: 14,
        vk2Demo: 6,
        vk2Pilot: 1,
        vk2Gesamt: 7,
        k2FamilieMuster: 7,
        kreineckerStammbaum: 223,
      },
    ]
    const d = computeMissionVisitDailyDeltas(timeline)
    expect(d[0]).toEqual({
      k2: 0,
      oeffentlich: 0,
      oeffentlichPilot: 0,
      oeffentlichGesamt: 0,
      vk2Demo: 0,
      vk2Pilot: 0,
      vk2Gesamt: 0,
      k2FamilieMuster: 0,
      kreineckerStammbaum: 0,
    })
    expect(d[1]).toEqual({
      k2: 5,
      oeffentlich: 2,
      oeffentlichPilot: 0,
      oeffentlichGesamt: 2,
      vk2Demo: 0,
      vk2Pilot: 0,
      vk2Gesamt: 0,
      k2FamilieMuster: 4,
      kreineckerStammbaum: 0,
    })
    expect(d[2]).toEqual({
      k2: 3,
      oeffentlich: 0,
      oeffentlichPilot: 1,
      oeffentlichGesamt: 1,
      vk2Demo: 1,
      vk2Pilot: 1,
      vk2Gesamt: 2,
      k2FamilieMuster: 0,
      kreineckerStammbaum: 2,
    })
  })

  it('Tageszuwachs: API-Rückgang wird als 0 gezählt', () => {
    const timeline: MissionVisitSnapshot[] = [
      {
        at: '2026-04-01T12:00:00.000Z',
        k2: 10,
        oeffentlich: 0,
        oeffentlichPilot: 0,
        oeffentlichGesamt: 0,
        vk2Demo: 0,
        vk2Pilot: 0,
        vk2Gesamt: 0,
        k2FamilieMuster: 0,
        kreineckerStammbaum: 0,
      },
      {
        at: '2026-04-02T12:00:00.000Z',
        k2: 8,
        oeffentlich: 0,
        oeffentlichPilot: 0,
        oeffentlichGesamt: 0,
        vk2Demo: 0,
        vk2Pilot: 0,
        vk2Gesamt: 0,
        k2FamilieMuster: 0,
        kreineckerStammbaum: 0,
      },
    ]
    const d = computeMissionVisitDailyDeltas(timeline)
    expect(d[1].k2).toBe(0)
  })

  it('normalisiert fehlende Felder', () => {
    const r = normalizeMissionVisitSnapshotRow({ at: '2026-01-01T00:00:00.000Z', k2: 3 })
    expect(r).not.toBeNull()
    expect(r!.kreineckerStammbaum).toBe(0)
  })

  it('buildMissionVisitSeriesForField: kumuliert + Tageszuwachs', () => {
    const timeline: MissionVisitSnapshot[] = [
      {
        at: '2026-04-27T20:00:00.000Z',
        k2: 10,
        oeffentlich: 0,
        oeffentlichPilot: 0,
        oeffentlichGesamt: 0,
        vk2Demo: 0,
        vk2Pilot: 0,
        vk2Gesamt: 0,
        k2FamilieMuster: 0,
        kreineckerStammbaum: 0,
      },
      {
        at: '2026-04-28T20:00:00.000Z',
        k2: 15,
        oeffentlich: 0,
        oeffentlichPilot: 0,
        oeffentlichGesamt: 0,
        vk2Demo: 0,
        vk2Pilot: 0,
        vk2Gesamt: 0,
        k2FamilieMuster: 0,
        kreineckerStammbaum: 0,
      },
    ]
    const series = buildMissionVisitSeriesForField(timeline, 'k2')
    expect(series).toHaveLength(2)
    expect(series[0].daily).toBe(0)
    expect(series[1].cumulative).toBe(15)
    expect(series[1].daily).toBe(5)
  })

  it('buildLicenseeVisitSeries: ein Mandant', () => {
    const series = buildLicenseeVisitSeries([
      { at: '2026-05-01T12:00:00.000Z', count: 2 },
      { at: '2026-05-02T12:00:00.000Z', count: 5 },
    ])
    expect(series[1].daily).toBe(3)
    expect(series[1].cumulative).toBe(5)
  })

  it('filterSeriesByDays: nur letzte N Tage', () => {
    const today = new Date()
    const mk = (offset: number, daily: number): MissionVisitSeriesPoint => {
      const d = new Date(today)
      d.setDate(d.getDate() - offset)
      return { at: d.toISOString(), label: String(offset), cumulative: 10, daily }
    }
    const all = [mk(10, 1), mk(5, 2), mk(1, 3), mk(0, 4)]
    const last7 = filterSeriesByDays(all, 7)
    expect(last7.length).toBe(3)
    expect(last7[0].daily).toBe(2)
    expect(last7[last7.length - 1].daily).toBe(4)
  })

  it('bucketSeriesForChart: fasst lange Reihen zusammen', () => {
    const points: MissionVisitSeriesPoint[] = Array.from({ length: 40 }, (_, i) => ({
      at: `2026-01-${String(i + 1).padStart(2, '0')}T12:00:00.000Z`,
      label: String(i + 1),
      cumulative: i + 1,
      daily: 1,
    }))
    const bucketed = bucketSeriesForChart(points, 10)
    expect(bucketed.length).toBeLessThanOrEqual(10)
    expect(bucketed[bucketed.length - 1].cumulative).toBe(40)
  })
})
