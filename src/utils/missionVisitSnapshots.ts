/**
 * Lokale Zeitschiene für Mission Control: einmal pro Kalendertag kumulierte GET /api/visit-Zähler
 * auf diesem Mac gemerkt (localStorage). Grafik „Zeitschiene“ = Tageszuwachs (Differenz zum Vortag).
 * Kein Server-Verlauf – nur für Entwicklung / APf.
 */

export const MISSION_VISIT_SNAPSHOTS_KEY = 'k2-mission-visit-snapshots-v1'

export type MissionVisitCounts = {
  k2: number
  oeffentlich: number
  vk2Demo: number
  k2FamilieMuster: number
  kreineckerStammbaum: number
}

export type MissionVisitSnapshot = MissionVisitCounts & { at: string }

const MAX_SNAPSHOTS = 90

function num(v: unknown): number {
  return typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.floor(v)) : 0
}

export function normalizeMissionVisitSnapshotRow(x: unknown): MissionVisitSnapshot | null {
  if (!x || typeof x !== 'object') return null
  const o = x as Record<string, unknown>
  if (typeof o.at !== 'string') return null
  return {
    at: o.at,
    k2: num(o.k2),
    oeffentlich: num(o.oeffentlich),
    vk2Demo: num(o.vk2Demo),
    k2FamilieMuster: num(o.k2FamilieMuster),
    kreineckerStammbaum: num(o.kreineckerStammbaum),
  }
}

export function computeNextMissionVisitSnapshots(
  prev: MissionVisitSnapshot[],
  now: Date,
  counts: MissionVisitCounts,
  max: number = MAX_SNAPSHOTS,
): MissionVisitSnapshot[] {
  const dayStr = now.toDateString()
  const entry: MissionVisitSnapshot = { at: now.toISOString(), ...counts }
  const last = prev[prev.length - 1]
  let next: MissionVisitSnapshot[]
  if (last && new Date(last.at).toDateString() === dayStr) {
    next = [...prev.slice(0, -1), entry]
  } else {
    next = [...prev, entry]
  }
  return next.slice(-max)
}

export function loadMissionVisitSnapshots(): MissionVisitSnapshot[] {
  try {
    const raw = localStorage.getItem(MISSION_VISIT_SNAPSHOTS_KEY)
    if (!raw) return []
    const p = JSON.parse(raw) as unknown
    if (!Array.isArray(p)) return []
    return p.map(normalizeMissionVisitSnapshotRow).filter((r): r is MissionVisitSnapshot => r != null)
  } catch {
    return []
  }
}

export function upsertMissionVisitSnapshot(counts: MissionVisitCounts): void {
  try {
    const prev = loadMissionVisitSnapshots()
    const next = computeNextMissionVisitSnapshots(prev, new Date(), counts)
    localStorage.setItem(MISSION_VISIT_SNAPSHOTS_KEY, JSON.stringify(next))
  } catch {
    /* ignore */
  }
}

/** Matrix: Welcher Wert aus dem Snapshot zur_chart-Zeile (key) gehört */
export const MISSION_VISIT_CHART_KEY_TO_FIELD: Record<string, keyof MissionVisitCounts> = {
  k2: 'k2',
  oeffentlich: 'oeffentlich',
  vk2: 'vk2Demo',
  'fam-muster': 'k2FamilieMuster',
  krein: 'kreineckerStammbaum',
}

export function formatMissionVisitSnapshotColumnLabel(isoAt: string): string {
  const d = new Date(isoAt)
  if (Number.isNaN(d.getTime())) return '–'
  return d.toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

const COUNT_FIELDS: (keyof MissionVisitCounts)[] = [
  'k2',
  'oeffentlich',
  'vk2Demo',
  'k2FamilieMuster',
  'kreineckerStammbaum',
]

/** Tageszuwachs pro Snapshot-Zeile: Differenz zum Vortag (kein Monotonie-Abfall → 0). Erster Tag ohne Vortrag: überall 0. */
export function computeMissionVisitDailyDeltas(timeline: MissionVisitSnapshot[]): MissionVisitCounts[] {
  if (timeline.length === 0) return []
  return timeline.map((snap, i) => {
    if (i === 0) {
      return { k2: 0, oeffentlich: 0, vk2Demo: 0, k2FamilieMuster: 0, kreineckerStammbaum: 0 }
    }
    const prev = timeline[i - 1]
    const out: MissionVisitCounts = {
      k2: 0,
      oeffentlich: 0,
      vk2Demo: 0,
      k2FamilieMuster: 0,
      kreineckerStammbaum: 0,
    }
    for (const k of COUNT_FIELDS) {
      out[k] = Math.max(0, snap[k] - prev[k])
    }
    return out
  })
}
