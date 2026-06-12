import {
  bucketSeriesForChart,
  type MissionVisitSeriesPoint,
} from '../../utils/missionVisitSnapshots'

const DEFAULT_MAX_CHART_BARS = 28
const DEFAULT_MAX_TABLE_ROWS = 0

type Props = {
  label: string
  color: string
  points: MissionVisitSeriesPoint[]
  /** Max. Balken in der Grafik (längere Fenster werden gebündelt) */
  maxChartBars?: number
  /** 0 = alle Zeilen in der Tabelle */
  maxTableRows?: number
  compact?: boolean
}

function labelStep(count: number): number {
  if (count <= 10) return 1
  if (count <= 20) return 2
  if (count <= 35) return 3
  return Math.ceil(count / 10)
}

/** Zeitleiste: Tageszuwachs als Balken + Tabelle */
export default function MissionVisitProductTimeline({
  label,
  color,
  points,
  maxChartBars = DEFAULT_MAX_CHART_BARS,
  maxTableRows = DEFAULT_MAX_TABLE_ROWS,
  compact = false,
}: Props) {
  const chartPoints = bucketSeriesForChart(points, maxChartBars)
  const tablePoints =
    maxTableRows > 0 && points.length > maxTableRows ? points.slice(-maxTableRows) : points
  const maxDaily = Math.max(1, ...chartPoints.map((p) => p.daily))
  const step = labelStep(chartPoints.length)

  if (points.length === 0) {
    return (
      <p style={{ margin: compact ? '0.5rem 0 0' : '0.65rem 0 0', fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.45 }}>
        Noch keine Verlaufsdaten – nach dem nächsten Tag (oder erneut „Zähler neu laden“) erscheint hier die Zeitleiste.
      </p>
    )
  }

  const barW = Math.max(6, Math.min(20, Math.floor(640 / Math.max(chartPoints.length, 1))))
  const gap = 3
  const chartH = compact ? 72 : 110
  const padX = 8
  const svgW = padX * 2 + chartPoints.length * barW + (chartPoints.length - 1) * gap

  return (
    <div
      className="mission-visit-product-timeline"
      style={{
        marginTop: compact ? '0.5rem' : '0.75rem',
        paddingTop: compact ? '0.5rem' : '0.75rem',
        borderTop: compact ? undefined : `1px solid ${color}33`,
      }}
    >
      {!compact ? (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: '0.35rem',
            marginBottom: '0.45rem',
          }}
        >
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e2e8f0' }}>📈 {label}</span>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
            Tageszuwachs · lokal gemerkt (1× pro Tag)
            {chartPoints.length < points.length ? ' · Balken gebündelt' : ''}
          </span>
        </div>
      ) : null}

      <svg
        viewBox={`0 0 ${svgW} ${chartH + 32}`}
        className="mission-visit-timeline-svg"
        role="img"
        aria-label={`Zeitleiste ${label}`}
        style={{ maxHeight: compact ? 100 : 160 }}
      >
        {chartPoints.map((p, i) => {
          const h = p.daily > 0 ? Math.max(4, (p.daily / maxDaily) * (chartH - 8)) : 2
          const x = padX + i * (barW + gap)
          const y = chartH - h
          const showLabel = i % step === 0 || i === chartPoints.length - 1
          return (
            <g key={`${p.at}-${i}`}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={h}
                rx={2}
                fill={color}
                opacity={p.daily > 0 ? 0.92 : 0.25}
              >
                <title>{`${p.label}: +${p.daily} (gesamt ${p.cumulative})`}</title>
              </rect>
              {showLabel ? (
                <text
                  x={x + barW / 2}
                  y={chartH + 14}
                  textAnchor="middle"
                  fontSize="8"
                  className="mission-visit-timeline-xlabel"
                >
                  {p.label}
                </text>
              ) : null}
            </g>
          )
        })}
      </svg>

      {!compact ? (
        <div className="mission-visit-matrix-scroll" style={{ marginTop: '0.35rem' }}>
          <table className="mission-visit-matrix-table" style={{ fontSize: '0.76rem' }}>
            <thead>
              <tr>
                <th scope="col" style={{ textAlign: 'left' }}>
                  Datum
                </th>
                <th scope="col">Gesamt</th>
                <th scope="col">+ Tag</th>
              </tr>
            </thead>
            <tbody>
              {[...tablePoints].reverse().map((p) => (
                <tr key={p.at}>
                  <th scope="row" style={{ textAlign: 'left' }}>
                    {p.label}
                  </th>
                  <td>{p.cumulative}</td>
                  <td className={p.daily > 0 ? 'mission-visit-matrix-delta-pos' : ''} style={{ fontWeight: 700 }}>
                    {p.daily > 0 ? `+${p.daily}` : '0'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
