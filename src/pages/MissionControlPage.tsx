import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PROJECT_ROUTES, PLATFORM_ROUTES, getAllProjectIds, MOK2_ROUTE } from '../config/navigation'
import { fetchVisitCount } from '../utils/visitCountApiOrigin'
import {
  computeMissionVisitDailyDeltas,
  formatMissionVisitSnapshotColumnLabel,
  loadMissionVisitSnapshots,
  MISSION_VISIT_CHART_KEY_TO_FIELD,
  upsertMissionVisitSnapshot,
} from '../utils/missionVisitSnapshots'

const SHOW_VISIT_CHART_KEY = 'k2-mission-control-show-visit-chart'

type MarketingAttrSummaryRow = {
  campaign_key: string | null
  surface: string
  event_kind: string
  count: number
}

function marketingAttrSurfaceLabel(surface: string): string {
  if (surface === 'oeffentlich') return 'ök2'
  if (surface === 'vk2') return 'VK2'
  if (surface === 'k2_familie') return 'K2 Familie'
  return surface
}

function getPersistentBoolean(key: string): boolean {
  try {
    return localStorage.getItem(key) === 'true'
  } catch {
    return false
  }
}

type VisitChartRow = { key: string; label: string; value: number; barColor: string }

const PROJECT_ENTRY_COLOR: Record<string, string> = {
  'k2-galerie': '#5ffbf1',
  'k2-markt': '#a78bfa',
  vk2: '#8b5cf6',
  'k2-familie': '#34d399',
}

export default function MissionControlPage() {
  const [showVisitChart, setShowVisitChart] = useState(() => getPersistentBoolean(SHOW_VISIT_CHART_KEY))
  const [visits, setVisits] = useState<{
    k2: number
    oeffentlich: number
    vk2Demo: number
    k2FamilieMuster: number
    kreineckerStammbaum: number
  } | null>(null)
  const [visitTimeline, setVisitTimeline] = useState(loadMissionVisitSnapshots)
  const [attrSummary, setAttrSummary] = useState<{
    configured: boolean
    summary: MarketingAttrSummaryRow[]
    days?: number
    error?: string
  } | null>(null)

  useEffect(() => {
    Promise.all([
      fetchVisitCount('k2'),
      fetchVisitCount('oeffentlich'),
      fetchVisitCount('vk2'),
      fetchVisitCount('k2-familie-muster'),
      fetchVisitCount('k2-familie-kreinecker-stammbaum'),
    ]).then(([k2, oef, vk2Demo, k2FamilieMuster, kreineckerStammbaum]) => {
      const next = { k2, oeffentlich: oef, vk2Demo, k2FamilieMuster, kreineckerStammbaum }
      setVisits(next)
      upsertMissionVisitSnapshot(next)
      setVisitTimeline(loadMissionVisitSnapshots())
    })
  }, [])

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    fetch(`${origin}/api/marketing-attribution?mode=summary&days=90`)
      .then((r) => r.json())
      .then((data) => {
        setAttrSummary({
          configured: Boolean(data?.configured),
          summary: Array.isArray(data?.summary) ? data.summary : [],
          days: typeof data?.days === 'number' ? data.days : 90,
          error: typeof data?.error === 'string' ? data.error : undefined,
        })
      })
      .catch(() => {
        setAttrSummary({ configured: false, summary: [], error: 'Netzwerk' })
      })
  }, [])

  const projectQuickEntries = useMemo(
    () =>
      getAllProjectIds().map((id) => ({
        id,
        name: PROJECT_ROUTES[id].name,
        home: PROJECT_ROUTES[id].home,
        color: PROJECT_ENTRY_COLOR[id] ?? '#94a3b8',
      })),
    [],
  )

  const visitSum =
    visits != null
      ? visits.k2 +
        visits.oeffentlich +
        visits.vk2Demo +
        visits.k2FamilieMuster +
        visits.kreineckerStammbaum
      : null

  const visitChartRows = useMemo((): VisitChartRow[] | null => {
    if (!visits) return null
    return [
      { key: 'k2', label: 'K2 Galerie', value: visits.k2, barColor: '#5ffbf1' },
      { key: 'oeffentlich', label: 'ök2 Demo', value: visits.oeffentlich, barColor: '#fcd34d' },
      { key: 'vk2', label: 'VK2-Demo', value: visits.vk2Demo, barColor: '#a78bfa' },
      { key: 'fam-muster', label: 'K2 Familie Muster', value: visits.k2FamilieMuster, barColor: '#34d399' },
      { key: 'krein', label: 'Kreinecker-Stammbaum', value: visits.kreineckerStammbaum, barColor: '#fb923c' },
    ]
  }, [visits])

  const visitChartMax = useMemo(() => {
    if (!visitChartRows?.length) return 1
    return Math.max(1, ...visitChartRows.map((r) => r.value))
  }, [visitChartRows])

  const visitMatrixPrevLast = useMemo(() => {
    if (visitTimeline.length < 2) return null
    const prev = visitTimeline[visitTimeline.length - 2]
    const last = visitTimeline[visitTimeline.length - 1]
    return { prev, last }
  }, [visitTimeline])

  const visitTimelineGraphic = useMemo(() => {
    if (visitTimeline.length < 1 || !visitChartRows?.length) return null
    const daily = computeMissionVisitDailyDeltas(visitTimeline)
    const viewW = 720
    const viewH = 248
    const padL = 52
    const padR = 14
    const padT = 20
    const padB = 56
    const iw = viewW - padL - padR
    const ih = viewH - padT - padB
    let maxY = 1
    for (const d of daily) {
      for (const row of visitChartRows) {
        const f = MISSION_VISIT_CHART_KEY_TO_FIELD[row.key]
        if (f) maxY = Math.max(maxY, d[f])
      }
    }
    const n = visitTimeline.length
    const denom = n <= 1 ? 1 : n - 1
    const xAt = (i: number) => padL + (i / denom) * iw
    const yAt = (v: number) => padT + ih - (v / maxY) * ih
    type Pl = { rowKey: string; label: string; color: string; points: string; dots: { cx: number; cy: number }[] }
    const polylines: Pl[] = []
    for (const row of visitChartRows) {
      const f = MISSION_VISIT_CHART_KEY_TO_FIELD[row.key]
      if (!f) continue
      const dots = daily.map((dRow, i) => ({ cx: xAt(i), cy: yAt(dRow[f]) }))
      const points = dots.map((d) => `${d.cx},${d.cy}`).join(' ')
      polylines.push({ rowKey: row.key, label: row.label, color: row.barColor, points, dots })
    }
    const xLabelEvery = n <= 9 ? 1 : Math.ceil(n / 9)
    const xLabels = visitTimeline.map((s, i) => ({
      x: xAt(i),
      text: formatMissionVisitSnapshotColumnLabel(s.at),
      show: i % xLabelEvery === 0 || i === n - 1,
    }))
    const gridYs = [0, 0.25, 0.5, 0.75, 1].map((t) => padT + ih * (1 - t))
    return { viewW, viewH, padL, iw, ih, maxY, polylines, xLabels, gridYs }
  }, [visitTimeline, visitChartRows])

  const setVisitChartVisible = (next: boolean) => {
    setShowVisitChart(next)
    try {
      localStorage.setItem(SHOW_VISIT_CHART_KEY, next ? 'true' : 'false')
    } catch {
      /* ignore */
    }
  }

  const printVisitReport = () => {
    document.body.setAttribute('data-mission-print-visits-only', '1')
    let cleaned = false
    const cleanup = () => {
      if (cleaned) return
      cleaned = true
      document.body.removeAttribute('data-mission-print-visits-only')
      window.removeEventListener('afterprint', cleanup)
    }
    window.addEventListener('afterprint', cleanup)
    window.print()
    window.setTimeout(cleanup, 2000)
  }

  return (
    <main className="mission-wrapper">
      <div className="viewport">
        {/* Kein großes viewport-header (Smart Panel = Kontext). Schnellzugriff eine Zeile – vgl. schlanke APf-Einstiege. */}
        <nav
          className="mission-visit-no-print"
          aria-label="Schnellzugriff"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '0.5rem 0.85rem',
            marginBottom: '1.15rem',
            fontSize: '0.82rem',
          }}
        >
          <Link to={PLATFORM_ROUTES.home} style={{ color: '#5ffbf1', textDecoration: 'none', fontWeight: 600 }}>
            ← Plattform
          </Link>
          <span style={{ color: 'rgba(148,163,184,0.5)', userSelect: 'none' }} aria-hidden>
            ·
          </span>
          <Link to="/k2team-handbuch" style={{ color: '#a5b4fc', textDecoration: 'none' }}>
            Handbuch
          </Link>
          <span style={{ color: 'rgba(148,163,184,0.5)', userSelect: 'none' }} aria-hidden>
            ·
          </span>
          <Link to="/zettel-pilot-form" style={{ color: '#fcd34d', textDecoration: 'none' }}>
            Pilot-Zettel
          </Link>
          <span style={{ color: 'rgba(148,163,184,0.5)', userSelect: 'none' }} aria-hidden>
            ·
          </span>
          <Link to={PROJECT_ROUTES['k2-galerie'].testuserMappe} style={{ color: '#5eead4', textDecoration: 'none' }}>
            Testuser-Mappe
          </Link>
          <span style={{ color: 'rgba(148,163,184,0.5)', userSelect: 'none' }} aria-hidden>
            ·
          </span>
          <Link to={PLATFORM_ROUTES.missionControlSystem} style={{ color: '#c4b5fd', textDecoration: 'none', fontSize: '0.8rem' }}>
            System & Kontext
          </Link>
        </nav>

        {/* Besucher – wie Übersicht-Board, ohne Doppel-Lizenz-API (nur APf / Entwicklung) */}
        <section
          className="panel mission-visit-report-panel"
          style={{
            marginTop: '1.25rem',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.14), rgba(129,140,248,0.08))',
            border: '1px solid rgba(129,140,248,0.45)',
          }}
        >
          <h2 style={{ margin: '0 0 0.75rem', fontSize: '1.15rem', color: '#a5b4fc' }}>👁 Besucher (Zähler)</h2>
          <p style={{ margin: '0 0 0.35rem', fontSize: '0.85rem', color: '#8fa0c9' }}>
            Pro Browser-Sitzung einmal gezählt – Galerie, ök2, VK2-Demo, Musterfamilie Huber, Kreinecker-Stammbaum.
          </p>
          <p
            style={{
              margin: '0 0 1rem',
              fontSize: '0.78rem',
              color: 'rgba(167,192,255,0.95)',
              padding: '0.45rem 0.65rem',
              background: 'rgba(15,23,42,0.35)',
              borderRadius: '8px',
              border: '1px solid rgba(129,140,248,0.35)',
            }}
          >
            🔧 <strong>Nur für dich / Entwicklung:</strong> diese Ansicht und Grafik erscheinen in der APf (Mission Control),{' '}
            <strong>nicht</strong> in der K2-Familie-Nutzer-Oberfläche.
          </p>
          <div
            className="mission-visit-no-print"
            style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}
          >
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.82rem',
                color: '#e0e7ff',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={showVisitChart}
                onChange={() => setVisitChartVisible(!showVisitChart)}
              />
              Balken anzeigen
            </label>
            <button
              type="button"
              className="btn small-btn"
              onClick={printVisitReport}
              style={{
                background: 'linear-gradient(120deg, #475569, #334155)',
                color: '#f8fafc',
                border: '1px solid rgba(148,163,184,0.5)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              title="Druckdialog: Als PDF speichern wählen"
            >
              🖨️ PDF / Drucken (nur dieser Block)
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'baseline' }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#a5b4fc', lineHeight: 1.1 }}>
                {visitSum == null ? '…' : visitSum}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#8fa0c9' }}>Summe Sichten</div>
            </div>
            <div style={{ fontSize: '0.88rem', color: 'rgba(240,247,255,0.88)', lineHeight: 1.6 }}>
              <div>
                <strong style={{ color: '#f0f6ff' }}>K2:</strong> {visits?.k2 ?? '–'}
              </div>
              <div>
                <strong style={{ color: '#f0f6ff' }}>ök2:</strong> {visits?.oeffentlich ?? '–'}
              </div>
              <div>
                <strong style={{ color: '#f0f6ff' }}>VK2-Demo:</strong> {visits?.vk2Demo ?? '–'}
              </div>
              <div>
                <strong style={{ color: '#f0f6ff' }}>K2 Familie Muster:</strong> {visits?.k2FamilieMuster ?? '–'}
              </div>
              <div>
                <strong style={{ color: '#f0f6ff' }}>Kreinecker-Stammbaum:</strong> {visits?.kreineckerStammbaum ?? '–'}
              </div>
            </div>
            <Link
              to={PROJECT_ROUTES['k2-galerie'].uebersicht}
              className="btn small-btn mission-visit-no-print"
              style={{
                alignSelf: 'center',
                background: 'linear-gradient(120deg, #6366f1, #4f46e5)',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Übersicht-Board → Lizenzen, Zahlen, Export
            </Link>
          </div>
          {showVisitChart && visitChartRows && (
            <div className="mission-visit-chart" style={{ marginTop: '1.25rem' }}>
              <h3
                className="mission-visit-chart-subtitle"
                style={{ margin: '0 0 0.65rem', fontSize: '0.95rem', color: '#c7d2fe' }}
              >
                Verteilung (relativ zum höchsten Einzelwert)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {visitChartRows.map((row) => {
                  const pct = visitChartMax > 0 ? Math.round((row.value / visitChartMax) * 100) : 0
                  const share = visitSum && visitSum > 0 ? Math.round((row.value / visitSum) * 100) : 0
                  return (
                    <div key={row.key} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div
                        className="mission-visit-chart-row-head"
                        style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#e0e7ff' }}
                      >
                        <span>{row.label}</span>
                        <span>
                          {row.value}{' '}
                          <span className="mission-visit-chart-pct" style={{ color: '#8fa0c9' }}>
                            ({share}% der Summe)
                          </span>
                        </span>
                      </div>
                      <div className="mission-visit-bar-track">
                        <div
                          className="mission-visit-bar-fill"
                          style={{ width: `${pct}%`, background: row.barColor }}
                          title={`${row.value} Sichten`}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {visitChartRows && (
            <div
              className="mission-visit-matrix"
              style={{ marginTop: showVisitChart ? '1.35rem' : '1.25rem' }}
            >
                <h3
                  className="mission-visit-chart-subtitle mission-visit-matrix-title"
                  style={{ margin: '0 0 0.5rem', fontSize: '0.95rem', color: '#c7d2fe' }}
                >
                  Matrix: Bereich × Zeitschiene
                </h3>
                <p style={{ margin: '0 0 0.65rem', fontSize: '0.72rem', color: '#8fa0c9', lineHeight: 1.45 }}>
            Zeitschiene: <strong style={{ color: '#c7d2fe' }}>Tabelle</strong> = kumulierte Zähler pro Tag (API-Stand);{' '}
            <strong style={{ color: '#c7d2fe' }}>Grafik</strong> = <strong>Tageszuwachs</strong> (Differenz zum Vortag). PDF/Druck
            enthält beides.
                </p>
                {visitTimeline.length > 0 && visitTimelineGraphic ? (
                  <div className="mission-visit-timeline-graphic" style={{ marginBottom: '1.1rem' }}>
                    <h4
                      className="mission-visit-chart-subtitle"
                      style={{ margin: '0 0 0.35rem', fontSize: '0.88rem', color: '#c7d2fe', fontWeight: 700 }}
                    >
                      Zeitschiene (Grafik)
                    </h4>
                    <p style={{ margin: '0 0 0.45rem', fontSize: '0.7rem', color: '#8fa0c9' }}>
                      Neue Sichten pro Kalendertag: je Punkt <strong>Zuwachs</strong> zur Spalte davor in der Matrix (erster Tag: 0).
                      Nicht die kumulierten Zahlen aus der Tabellenzeile.
                    </p>
                    <svg
                      viewBox={`0 0 ${visitTimelineGraphic.viewW} ${visitTimelineGraphic.viewH}`}
                      className="mission-visit-timeline-svg"
                      role="img"
                      aria-label="Besucher-Zeitschiene als Liniendiagramm"
                    >
                      {visitTimelineGraphic.gridYs.map((y, idx) => (
                        <line
                          key={idx}
                          x1={visitTimelineGraphic.padL}
                          y1={y}
                          x2={visitTimelineGraphic.padL + visitTimelineGraphic.iw}
                          y2={y}
                          className="mission-visit-timeline-grid"
                        />
                      ))}
                      <text
                        x={8}
                        y={visitTimelineGraphic.gridYs[0] + 4}
                        fontSize="11"
                        className="mission-visit-timeline-axis-label"
                      >
                        {visitTimelineGraphic.maxY}
                      </text>
                      <text
                        x={8}
                        y={visitTimelineGraphic.gridYs[4] + 4}
                        fontSize="11"
                        className="mission-visit-timeline-axis-label"
                      >
                        0
                      </text>
                      {visitTimelineGraphic.polylines.map((pl) => (
                        <g key={pl.rowKey}>
                          <polyline
                            fill="none"
                            stroke={pl.color}
                            strokeWidth="2.5"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                            points={pl.points}
                            className="mission-visit-timeline-line"
                          />
                          {pl.dots.map((d, i) => (
                            <circle
                              key={i}
                              cx={d.cx}
                              cy={d.cy}
                              r="4"
                              fill={pl.color}
                              className="mission-visit-timeline-dot"
                            />
                          ))}
                        </g>
                      ))}
                      {visitTimelineGraphic.xLabels
                        .filter((l) => l.show)
                        .map((l, i) => (
                          <text
                            key={i}
                            x={l.x}
                            y={visitTimelineGraphic.viewH - 14}
                            fontSize="10"
                            textAnchor="middle"
                            className="mission-visit-timeline-xlabel"
                          >
                            {l.text}
                          </text>
                        ))}
                    </svg>
                    <div
                      className="mission-visit-timeline-legend"
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.65rem',
                        marginTop: '0.45rem',
                        fontSize: '0.72rem',
                        color: '#e0e7ff',
                      }}
                    >
                      {visitTimelineGraphic.polylines.map((pl) => (
                        <span
                          key={pl.rowKey}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                          <span
                            style={{
                              width: 14,
                              height: 3,
                              background: pl.color,
                              borderRadius: 2,
                              flexShrink: 0,
                            }}
                            aria-hidden
                          />
                          {pl.label}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
                {visitTimeline.length === 0 ? (
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>
                    Nach dem ersten Laden erscheint die erste Spalte; über mehrere Tage füllt sich die Zeitschiene.
                  </p>
                ) : (
                  <div className="mission-visit-matrix-scroll">
                    <table className="mission-visit-matrix-table">
                      <thead>
                        <tr>
                          <th scope="col">Bereich</th>
                          {visitTimeline.map((s) => (
                            <th key={s.at} scope="col">
                              {formatMissionVisitSnapshotColumnLabel(s.at)}
                            </th>
                          ))}
                          {visitMatrixPrevLast ? (
                            <th scope="col" title="Letzte Spalte minus vorherige Spalte">
                              Δ
                            </th>
                          ) : null}
                        </tr>
                      </thead>
                      <tbody>
                        {visitChartRows.map((row) => {
                          const field = MISSION_VISIT_CHART_KEY_TO_FIELD[row.key]
                          const delta =
                            visitMatrixPrevLast && field
                              ? visitMatrixPrevLast.last[field] - visitMatrixPrevLast.prev[field]
                              : null
                          return (
                            <tr key={row.key}>
                              <th scope="row">{row.label}</th>
                              {visitTimeline.map((s) => (
                                <td key={`${row.key}-${s.at}`}>{field ? s[field] : '–'}</td>
                              ))}
                              {visitMatrixPrevLast && field ? (
                                <td
                                  className={
                                    delta != null && delta > 0
                                      ? 'mission-visit-matrix-delta-pos'
                                      : delta != null && delta < 0
                                        ? 'mission-visit-matrix-delta-neg'
                                        : ''
                                  }
                                >
                                  {delta == null ? '–' : delta > 0 ? `+${delta}` : String(delta)}
                                </td>
                              ) : null}
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
          )}
          <p className="mission-visit-print-stand" style={{ margin: '1rem 0 0', fontSize: '0.75rem', color: '#8fa0c9' }}>
            Stand Anzeige / Druck: {new Date().toLocaleString('de-AT', { dateStyle: 'short', timeStyle: 'short' })} · Quelle
            Vercel GET /api/visit
          </p>
          <div className="mission-visit-report-seitenfuss seitenfuss" aria-hidden />
        </section>

        {/* Werbe-Korrelation: Landings × Kampagne (?k= / First-Touch) */}
        <section
          className="panel mission-visit-no-print"
          style={{
            marginTop: '1.35rem',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(45,212,191,0.06))',
            border: '1px solid rgba(45,212,191,0.4)',
            padding: '1rem 1.1rem',
          }}
        >
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.05rem', color: '#5eead4' }}>
            📣 Werbe-Korrelation (ök2 · VK2 · K2 Familie)
          </h2>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.8rem', color: '#8fa0c9', lineHeight: 1.5 }}>
            Messbare Landings pro <strong style={{ color: '#99f6e4' }}>Kampagne</strong> und{' '}
            <strong style={{ color: '#99f6e4' }}>Oberfläche</strong>. Links mit{' '}
            <code style={{ color: '#ccfbf1', fontSize: '0.78rem' }}>?k=</code> derselben ID wie im mök2-Werbefahrplan
            (z. B. <code style={{ color: '#ccfbf1', fontSize: '0.78rem' }}>kampagne-fruehjahr-2026-1</code>
            ). Ohne Parameter: First-Touch der letzten 90 Tage im Browser. Pseudonyme Sitzungs-ID, keine Namen.
          </p>
          {attrSummary == null ? (
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Lade Auswertung…</p>
          ) : !attrSummary.configured ? (
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#fbbf24' }}>
              {attrSummary.error ?? 'Supabase nicht konfiguriert – nach Migration 016 SQL ausführen.'}
            </p>
          ) : attrSummary.summary.length === 0 ? (
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
              Noch keine Events (letzte {attrSummary.days ?? 90} Tage). Test: Demo-URL mit{' '}
              <code style={{ color: '#ccfbf1' }}>?k=…</code> öffnen.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', color: '#e2e8f0' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(45,212,191,0.35)', textAlign: 'left' }}>
                    <th style={{ padding: '0.4rem 0.5rem 0.5rem 0' }}>Kampagne</th>
                    <th style={{ padding: '0.4rem 0.5rem' }}>Oberfläche</th>
                    <th style={{ padding: '0.4rem 0.5rem' }}>Ereignis</th>
                    <th style={{ padding: '0.4rem 0', textAlign: 'right' }}>Anzahl</th>
                  </tr>
                </thead>
                <tbody>
                  {attrSummary.summary.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(148,163,184,0.15)' }}>
                      <td style={{ padding: '0.35rem 0.5rem 0.35rem 0', color: '#f0fdfa' }}>
                        {row.campaign_key ?? '— ohne Kampagne —'}
                      </td>
                      <td style={{ padding: '0.35rem 0.5rem' }}>{marketingAttrSurfaceLabel(row.surface)}</td>
                      <td style={{ padding: '0.35rem 0.5rem', color: '#94a3b8' }}>{row.event_kind}</td>
                      <td style={{ padding: '0.35rem 0', textAlign: 'right', fontWeight: 700 }}>{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ margin: '0.65rem 0 0', fontSize: '0.72rem', color: '#64748b' }}>
                Quelle: POST /api/marketing-attribution · Fenster {attrSummary.days ?? 90} Tage
              </p>
            </div>
          )}
        </section>

        {/* Nutzer & Vertrieb */}
        <section style={{ marginTop: '1.5rem' }}>
          <h2 style={{ fontSize: '1.05rem', color: '#f0f6ff', margin: '0 0 0.75rem' }}>Nutzer & Vertrieb</h2>
          <div
            className="grid"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '0.75rem',
            }}
          >
            <Link
              to={PROJECT_ROUTES['k2-galerie'].uebersicht}
              className="panel"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                border: '1px solid rgba(20,184,166,0.35)',
                padding: '1rem',
              }}
            >
              <div style={{ fontSize: '1.25rem', marginBottom: '0.35rem' }}>📊</div>
              <strong style={{ color: '#5eead4' }}>Übersicht-Board</strong>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.82rem', color: '#8fa0c9' }}>
                Besucher, Lizenzen, Abrechnung – ein Screen
              </p>
            </Link>
            <Link
              to={PROJECT_ROUTES['k2-galerie'].licences}
              className="panel"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                border: '1px solid rgba(16,185,129,0.35)',
                padding: '1rem',
              }}
            >
              <div style={{ fontSize: '1.25rem', marginBottom: '0.35rem' }}>💼</div>
              <strong style={{ color: '#6ee7b7' }}>Lizenzen</strong>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.82rem', color: '#8fa0c9' }}>Wer ist Kunde, Verwaltung</p>
            </Link>
            <Link
              to={MOK2_ROUTE}
              className="panel"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                border: '1px solid rgba(251,191,36,0.35)',
                padding: '1rem',
              }}
            >
              <div style={{ fontSize: '1.25rem', marginBottom: '0.35rem' }}>📋</div>
              <strong style={{ color: '#fcd34d' }}>mök2</strong>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.82rem', color: '#8fa0c9' }}>Vertrieb & Werbetexte</p>
            </Link>
            <Link
              to={PROJECT_ROUTES['k2-galerie'].empfehlungstool}
              className="panel"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                border: '1px solid rgba(251,146,60,0.35)',
                padding: '1rem',
              }}
            >
              <div style={{ fontSize: '1.25rem', marginBottom: '0.35rem' }}>🤝</div>
              <strong style={{ color: '#fdba74' }}>Empfehlungstool</strong>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.82rem', color: '#8fa0c9' }}>IDs & Links teilen</p>
            </Link>
          </div>
        </section>

        {/* Projekte: nur operative Einstiege; Beschreibungen/Roadmap/JSON auf System-Seite */}
        <section className="mission-visit-no-print" style={{ marginTop: '1.5rem' }}>
          <h2 style={{ fontSize: '1.05rem', color: '#f0f6ff', margin: '0 0 0.75rem' }}>Projekte – direkt</h2>
          <div
            className="grid"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.75rem',
            }}
          >
            {projectQuickEntries.map((p) => (
              <Link
                key={p.id}
                to={p.home}
                className="panel"
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  border: `1px solid ${p.color}55`,
                  padding: '0.85rem 1rem',
                  background: `linear-gradient(135deg, ${p.color}14, rgba(18, 22, 35, 0.92))`,
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, marginBottom: '0.45rem' }} />
                <strong style={{ color: p.color, fontSize: '0.95rem' }}>{p.name}</strong>
                <p style={{ margin: '0.35rem 0 0', fontSize: '0.78rem', color: '#8fa0c9' }}>Projekt-Start</p>
              </Link>
            ))}
          </div>
          <p style={{ margin: '0.85rem 0 0', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5 }}>
            <Link to={PLATFORM_ROUTES.missionControlSystem} style={{ color: '#a5b4fc', fontWeight: 600 }}>
              System & Kontext →
            </Link>{' '}
            Übersichtskarten, frühere Roadmap-Hinweise, Chat-Kontext-Datei – für den Betrieb meist nicht nötig.
          </p>
        </section>
      </div>
    </main>
  )
}
