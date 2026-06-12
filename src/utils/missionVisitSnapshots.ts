/**
 * Lokale Zeitschiene für Mission Control: einmal pro Kalendertag kumulierte GET /api/visit-Zähler
 * auf diesem Mac gemerkt (localStorage). Grafik „Zeitschiene“ = Tageszuwachs (Differenz zum Vortag).
 * Kein Server-Verlauf – nur für Entwicklung / APf.
 */

export const MISSION_VISIT_SNAPSHOTS_KEY = 'k2-mission-visit-snapshots-v1'

export type MissionVisitCounts = {
  k2: number
  oeffentlich: number
  /** Summe aller oeffentlich-pilot-* (Testpilot-Zettel / vorname+entwurf) */
  oeffentlichPilot: number
  /** oeffentlich + oeffentlichPilot – für Abgleich mit Google Ads P1 */
  oeffentlichGesamt: number
  vk2Demo: number
  /** Summe aller vk2-pilot-* */
  vk2Pilot: number
  /** vk2 + vk2Pilot */
  vk2Gesamt: number
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
  const oeffentlich = num(o.oeffentlich)
  const oeffentlichPilot = num(o.oeffentlichPilot)
  const oeffentlichGesamt = num(o.oeffentlichGesamt) || oeffentlich + oeffentlichPilot
  const vk2Demo = num(o.vk2Demo)
  const vk2Pilot = num(o.vk2Pilot)
  const vk2Gesamt = num(o.vk2Gesamt) || vk2Demo + vk2Pilot
  return {
    at: o.at,
    k2: num(o.k2),
    oeffentlich,
    oeffentlichPilot,
    oeffentlichGesamt,
    vk2Demo,
    vk2Pilot,
    vk2Gesamt,
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
  oeffentlich: 'oeffentlichGesamt',
  vk2: 'vk2Gesamt',
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
  'oeffentlichPilot',
  'oeffentlichGesamt',
  'vk2Demo',
  'vk2Pilot',
  'vk2Gesamt',
  'k2FamilieMuster',
  'kreineckerStammbaum',
]

/** Tageszuwachs pro Snapshot-Zeile: Differenz zum Vortag (kein Monotonie-Abfall → 0). Erster Tag ohne Vortrag: überall 0. */
export type MissionVisitSeriesPoint = {
  at: string
  label: string
  cumulative: number
  daily: number
}

/** Ein Produkt/Bereich: kumuliert + Tageszuwachs pro Snapshot-Tag */
export function buildMissionVisitSeriesForField(
  timeline: MissionVisitSnapshot[],
  field: keyof MissionVisitCounts,
): MissionVisitSeriesPoint[] {
  if (timeline.length === 0) return []
  const deltas = computeMissionVisitDailyDeltas(timeline)
  return timeline.map((snap, i) => ({
    at: snap.at,
    label: formatMissionVisitSnapshotColumnLabel(snap.at),
    cumulative: snap[field],
    daily: deltas[i][field],
  }))
}

// —— Lizenz-Mandanten (ein Zähler pro tenantId, eigene Zeitleiste) ——

export const MISSION_LICENSEE_VISIT_SNAPSHOTS_KEY = 'k2-mission-licensee-visit-snapshots-v1'

export type LicenseeVisitSnapshot = { at: string; count: number }

function loadLicenseeSnapshotMap(): Record<string, LicenseeVisitSnapshot[]> {
  try {
    const raw = localStorage.getItem(MISSION_LICENSEE_VISIT_SNAPSHOTS_KEY)
    if (!raw) return {}
    const p = JSON.parse(raw) as unknown
    if (!p || typeof p !== 'object') return {}
    const out: Record<string, LicenseeVisitSnapshot[]> = {}
    for (const [tenantId, rows] of Object.entries(p as Record<string, unknown>)) {
      if (!Array.isArray(rows)) continue
      const list = rows
        .map((r) => {
          if (!r || typeof r !== 'object') return null
          const o = r as Record<string, unknown>
          if (typeof o.at !== 'string') return null
          const count = typeof o.count === 'number' && Number.isFinite(o.count) ? Math.max(0, Math.floor(o.count)) : 0
          return { at: o.at, count }
        })
        .filter((r): r is LicenseeVisitSnapshot => r != null)
      if (list.length > 0) out[tenantId] = list
    }
    return out
  } catch {
    return {}
  }
}

export function loadLicenseeVisitSnapshots(tenantId: string): LicenseeVisitSnapshot[] {
  return loadLicenseeSnapshotMap()[tenantId] ?? []
}

export function upsertLicenseeVisitSnapshot(tenantId: string, count: number): void {
  try {
    const map = loadLicenseeSnapshotMap()
    const prev = map[tenantId] ?? []
    const now = new Date()
    const dayStr = now.toDateString()
    const entry: LicenseeVisitSnapshot = { at: now.toISOString(), count }
    const last = prev[prev.length - 1]
    let next: LicenseeVisitSnapshot[]
    if (last && new Date(last.at).toDateString() === dayStr) {
      next = [...prev.slice(0, -1), entry]
    } else {
      next = [...prev, entry]
    }
    map[tenantId] = next.slice(-MAX_SNAPSHOTS)
    localStorage.setItem(MISSION_LICENSEE_VISIT_SNAPSHOTS_KEY, JSON.stringify(map))
  } catch {
    /* ignore */
  }
}

export function buildLicenseeVisitSeries(snapshots: LicenseeVisitSnapshot[]): MissionVisitSeriesPoint[] {
  if (snapshots.length === 0) return []
  return snapshots.map((snap, i) => {
    const prev = i > 0 ? snapshots[i - 1].count : snap.count
    const daily = i === 0 ? 0 : Math.max(0, snap.count - prev)
    return {
      at: snap.at,
      label: formatMissionVisitSnapshotColumnLabel(snap.at),
      cumulative: snap.count,
      daily,
    }
  })
}

export function computeMissionVisitDailyDeltas(timeline: MissionVisitSnapshot[]): MissionVisitCounts[] {
  if (timeline.length === 0) return []
  return timeline.map((snap, i) => {
    if (i === 0) {
      return {
        k2: 0,
        oeffentlich: 0,
        oeffentlichPilot: 0,
        oeffentlichGesamt: 0,
        vk2Demo: 0,
        vk2Pilot: 0,
        vk2Gesamt: 0,
        k2FamilieMuster: 0,
        kreineckerStammbaum: 0,
      }
    }
    const prev = timeline[i - 1]
    const out: MissionVisitCounts = {
      k2: 0,
      oeffentlich: 0,
      oeffentlichPilot: 0,
      oeffentlichGesamt: 0,
      vk2Demo: 0,
      vk2Pilot: 0,
      vk2Gesamt: 0,
      k2FamilieMuster: 0,
      kreineckerStammbaum: 0,
    }
    for (const k of COUNT_FIELDS) {
      out[k] = Math.max(0, snap[k] - prev[k])
    }
    return out
  })
}
