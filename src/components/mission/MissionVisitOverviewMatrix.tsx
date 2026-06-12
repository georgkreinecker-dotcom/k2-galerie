import { Link } from 'react-router-dom'
import type { MissionVisitProductDef, MissionVisitZeitfensterTage } from '../../config/missionVisitZeitleiste'
import { missionVisitZeitleisteProductPath } from '../../config/missionVisitZeitleiste'
import type { MissionVisitSeriesPoint } from '../../utils/missionVisitSnapshots'
import { sumSeriesDailyInWindow } from '../../utils/missionVisitSnapshots'

type Row = {
  product: MissionVisitProductDef
  points: MissionVisitSeriesPoint[]
}

type Props = {
  rows: Row[]
  /** Spalten = Tagespunkte im gewählten Fenster */
  columnPoints: MissionVisitSeriesPoint[]
  tage: MissionVisitZeitfensterTage
}

export default function MissionVisitOverviewMatrix({ rows, columnPoints, tage }: Props) {
  const windowLabel = tage === 0 ? 'gesamter Verlauf' : `letzte ${tage} Tage`

  return (
    <div className="mission-visit-overview-matrix">
      <p className="mission-visit-print-zeitfenster" style={{ margin: '0 0 0.65rem', fontSize: '0.82rem', color: '#94a3b8' }}>
        Matrix · {windowLabel} · Werte = <strong style={{ color: '#e2e8f0' }}>+ Tag</strong> (Tageszuwachs)
      </p>
      <div className="mission-visit-matrix-scroll">
        <table className="mission-visit-matrix-table mission-visit-overview-table">
          <thead>
            <tr>
              <th scope="col" style={{ textAlign: 'left', position: 'sticky', left: 0, zIndex: 1 }}>
                Produkt
              </th>
              {columnPoints.map((col) => (
                <th key={col.at} scope="col">
                  {col.label}
                </th>
              ))}
              <th scope="col">Σ Fenster</th>
              <th scope="col" style={{ textAlign: 'left' }}>
                Aktuell
              </th>
              <th className="mission-visit-no-print" scope="col" style={{ textAlign: 'left' }}>
                Detail
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ product, points }) => {
              const byDate = new Map(points.map((p) => [p.at, p]))
              const sumWindow = sumSeriesDailyInWindow(points)
              const last = points[points.length - 1]
              return (
                <tr key={product.id}>
                  <th scope="row" style={{ textAlign: 'left', position: 'sticky', left: 0, zIndex: 1 }}>
                    {product.label}
                  </th>
                  {columnPoints.map((col) => {
                    const p = byDate.get(col.at)
                    const daily = p?.daily ?? 0
                    return (
                      <td key={col.at} className={daily > 0 ? 'mission-visit-matrix-delta-pos' : ''}>
                        {daily > 0 ? `+${daily}` : '·'}
                      </td>
                    )
                  })}
                  <td style={{ fontWeight: 800 }} className={sumWindow > 0 ? 'mission-visit-matrix-delta-pos' : ''}>
                    {sumWindow > 0 ? `+${sumWindow}` : '0'}
                  </td>
                  <td style={{ fontWeight: 700 }}>{last?.cumulative ?? '–'}</td>
                  <td className="mission-visit-no-print" style={{ textAlign: 'left' }}>
                    <Link
                      to={missionVisitZeitleisteProductPath(product.id, tage)}
                      style={{ color: '#7dd3fc', fontWeight: 600, textDecoration: 'none', fontSize: '0.78rem' }}
                    >
                      Zeitleiste →
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
