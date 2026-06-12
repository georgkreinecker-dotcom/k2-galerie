import type { MissionVisitSeriesPoint } from '../../utils/missionVisitSnapshots'

const MAX_BARS = 21

type Props = {
  label: string
  color: string
  points: MissionVisitSeriesPoint[]
}

/** Eine Zeitleiste pro Produkt: Tageszuwachs als Balken + kompakte Tabelle */
export default function MissionVisitProductTimeline({ label, color, points }: Props) {
  const visible = points.length > MAX_BARS ? points.slice(-MAX_BARS) : points
  const maxDaily = Math.max(1, ...visible.map((p) => p.daily))

  if (points.length === 0) {
    return (
      <p style={{ margin: '0.65rem 0 0', fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.45 }}>
        Noch keine Verlaufsdaten – nach dem nächsten Tag (oder erneut „Zähler neu laden“) erscheint hier die Zeitleiste.
      </p>
    )
  }

  const barW = Math.max(8, Math.min(22, Math.floor(520 / Math.max(visible.length, 1))))
  const gap = 4
  const chartH = 100
  const padX = 8
  const svgW = padX * 2 + visible.length * barW + (visible.length - 1) * gap

  return (
    <div
      className="mission-visit-product-timeline"
      style={{
        marginTop: '0.75rem',
        paddingTop: '0.75rem',
        borderTop: `1px solid ${color}33`,
      }}
    >
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
        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Tageszuwachs · lokal gemerkt (1× pro Tag)</span>
      </div>

      <svg
        viewBox={`0 0 ${svgW} ${chartH + 28}`}
        className="mission-visit-timeline-svg"
        role="img"
        aria-label={`Zeitleiste ${label}`}
        style={{ maxHeight: 140 }}
      >
        {visible.map((p, i) => {
          const h = p.daily > 0 ? Math.max(4, (p.daily / maxDaily) * (chartH - 8)) : 2
          const x = padX + i * (barW + gap)
          const y = chartH - h
          return (
            <g key={p.at}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={h}
                rx={3}
                fill={color}
                opacity={p.daily > 0 ? 0.92 : 0.25}
              >
                <title>{`${p.label}: +${p.daily} (gesamt ${p.cumulative})`}</title>
              </rect>
              {(visible.length <= 14 || i % 2 === 0 || i === visible.length - 1) && (
                <text
                  x={x + barW / 2}
                  y={chartH + 16}
                  textAnchor="middle"
                  fontSize="9"
                  className="mission-visit-timeline-xlabel"
                >
                  {p.label}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      <div className="mission-visit-matrix-scroll" style={{ marginTop: '0.35rem' }}>
        <table className="mission-visit-matrix-table" style={{ fontSize: '0.76rem' }}>
          <thead>
            <tr>
              <th scope="col">Datum</th>
              <th scope="col" style={{ textAlign: 'right' }}>
                Gesamt
              </th>
              <th scope="col" style={{ textAlign: 'right' }}>
                + Tag
              </th>
            </tr>
          </thead>
          <tbody>
            {[...visible].reverse().map((p) => (
              <tr key={p.at}>
                <th scope="row">{p.label}</th>
                <td style={{ textAlign: 'right' }}>{p.cumulative}</td>
                <td
                  style={{ textAlign: 'right', fontWeight: 700 }}
                  className={p.daily > 0 ? 'mission-visit-matrix-delta-pos' : ''}
                >
                  {p.daily > 0 ? `+${p.daily}` : '0'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
