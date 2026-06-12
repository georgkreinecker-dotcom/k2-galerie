import { useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import MissionVisitOverviewMatrix from '../components/mission/MissionVisitOverviewMatrix'
import MissionVisitZeitfensterPicker from '../components/mission/MissionVisitZeitfensterPicker'
import {
  getAllMissionVisitProducts,
  loadSeriesForProduct,
  missionVisitZeitleisteOverviewPath,
  parseZeitfensterFromSearch,
  type MissionVisitZeitfensterTage,
} from '../config/missionVisitZeitleiste'
import { PLATFORM_ROUTES } from '../config/navigation'
import { filterSeriesByDays } from '../utils/missionVisitSnapshots'
import { printMissionVisitZeitleiste } from '../utils/missionVisitPrint'

export default function MissionVisitZeitleistePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const tage = parseZeitfensterFromSearch(`?${searchParams.toString()}`)

  const setTage = (next: MissionVisitZeitfensterTage) => {
    navigate(missionVisitZeitleisteOverviewPath(next), { replace: true })
  }

  const { rows, columnPoints } = useMemo(() => {
    const products = getAllMissionVisitProducts()
    const rows = products.map((product) => {
      const full = loadSeriesForProduct(product)
      const points = filterSeriesByDays(full, tage)
      return { product, points }
    })
    const ref = rows.find((r) => r.product.id === 'k2')?.points ?? rows[0]?.points ?? []
    return { rows, columnPoints: ref }
  }, [tage])

  const windowLabel = tage === 0 ? 'Gesamter gespeicherter Verlauf' : `Letzte ${tage} Tage`

  return (
    <main className="mission-wrapper mission-visit-zeitleiste-page">
      <div className="viewport">
        <nav
          className="mission-visit-no-print"
          aria-label="Navigation"
          style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 0.85rem', marginBottom: '1rem', fontSize: '0.82rem' }}
        >
          <Link to={PLATFORM_ROUTES.missionControl} style={{ color: '#5ffbf1', textDecoration: 'none', fontWeight: 600 }}>
            ← Mission Control
          </Link>
        </nav>

        <section className="panel mission-visit-zeitleiste-panel mission-visit-report-panel">
          <header style={{ marginBottom: '1rem' }}>
            <h1 style={{ margin: 0, fontSize: '1.35rem', color: '#f0f6ff', fontWeight: 800 }}>📈 Besucher – Gesamtüberblick</h1>
            <p style={{ margin: '0.4rem 0 0', fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.45 }}>
              Alle Produkte in einer Matrix · Zeitfenster wählen · druckbar als PDF
            </p>
            <p className="mission-visit-print-zeitfenster" style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Ausdruck: {windowLabel}
            </p>
          </header>

          <div
            className="mission-visit-no-print"
            style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}
          >
            <MissionVisitZeitfensterPicker value={tage} onChange={setTage} />
            <button
              type="button"
              className="btn small-btn"
              onClick={printMissionVisitZeitleiste}
              style={{
                background: 'linear-gradient(120deg, #475569, #334155)',
                color: '#f8fafc',
                border: '1px solid rgba(148,163,184,0.5)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🖨️ Gesamtüberblick drucken
            </button>
          </div>

          <MissionVisitOverviewMatrix rows={rows} columnPoints={columnPoints} tage={tage} />

          <p className="mission-visit-print-stand" style={{ margin: '1.1rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>
            Stand: {new Date().toLocaleString('de-AT', { dateStyle: 'short', timeStyle: 'short' })} · lokal am Mac gemerkt
          </p>
          <div className="mission-visit-report-seitenfuss seitenfuss" aria-hidden />
        </section>
      </div>
    </main>
  )
}
