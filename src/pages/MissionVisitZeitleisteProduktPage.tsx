import { useMemo } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useMissionOnlineLicences } from '../hooks/useMissionOnlineLicences'
import MissionVisitProductTimeline from '../components/mission/MissionVisitProductTimeline'
import MissionVisitZeitfensterPicker from '../components/mission/MissionVisitZeitfensterPicker'
import {
  findMissionVisitProduct,
  loadSeriesForProduct,
  missionVisitZeitleisteOverviewPath,
  missionVisitZeitleisteProductPath,
  parseZeitfensterFromSearch,
  type MissionVisitZeitfensterTage,
} from '../config/missionVisitZeitleiste'
import { PLATFORM_ROUTES } from '../config/navigation'
import { filterSeriesByDays, sumSeriesDailyInWindow } from '../utils/missionVisitSnapshots'
import { printMissionVisitZeitleiste } from '../utils/missionVisitPrint'

export default function MissionVisitZeitleisteProduktPage() {
  const { productId = '' } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { licences: onlineLicences } = useMissionOnlineLicences()
  const tage = parseZeitfensterFromSearch(`?${searchParams.toString()}`)
  const product = findMissionVisitProduct(decodeURIComponent(productId), onlineLicences)

  const setTage = (next: MissionVisitZeitfensterTage) => {
    if (!product) return
    navigate(missionVisitZeitleisteProductPath(product.id, next), { replace: true })
  }

  const { points, sumDaily, current } = useMemo(() => {
    if (!product) return { points: [], sumDaily: 0, current: 0 }
    const full = loadSeriesForProduct(product)
    const filtered = filterSeriesByDays(full, tage)
    const last = filtered[filtered.length - 1]
    return {
      points: filtered,
      sumDaily: sumSeriesDailyInWindow(filtered),
      current: last?.cumulative ?? 0,
    }
  }, [product, tage])

  const windowLabel = tage === 0 ? 'Gesamter gespeicherter Verlauf' : `Letzte ${tage} Tage`

  if (!product) {
    return (
      <main className="mission-wrapper">
        <div className="viewport" style={{ padding: '1.5rem' }}>
          <p style={{ color: '#fecaca' }}>Produkt nicht gefunden.</p>
          <Link to={missionVisitZeitleisteOverviewPath()} style={{ color: '#5ffbf1' }}>
            ← Gesamtüberblick
          </Link>
        </div>
      </main>
    )
  }

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
          <span style={{ color: 'rgba(148,163,184,0.5)' }} aria-hidden>
            ·
          </span>
          <Link to={missionVisitZeitleisteOverviewPath(tage)} style={{ color: '#a5b4fc', textDecoration: 'none', fontWeight: 600 }}>
            Gesamtüberblick
          </Link>
        </nav>

        <section className="panel mission-visit-zeitleiste-panel mission-visit-report-panel">
          <header style={{ marginBottom: '1rem' }}>
            <h1 style={{ margin: 0, fontSize: '1.35rem', color: product.color, fontWeight: 800 }}>📈 {product.label}</h1>
            <p style={{ margin: '0.4rem 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>Zeitleiste · Tageszuwachs · druckbar</p>
            <p className="mission-visit-print-zeitfenster" style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Ausdruck: {windowLabel}
            </p>
          </header>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1.25rem',
              alignItems: 'flex-end',
              marginBottom: '1rem',
            }}
          >
            <div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: product.color, lineHeight: 1 }}>{current}</div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem' }}>Aktuell gesamt</div>
            </div>
            <div>
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: sumDaily > 0 ? '#86efac' : '#94a3b8',
                  lineHeight: 1,
                }}
              >
                {sumDaily > 0 ? `+${sumDaily}` : '0'}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem' }}>+ im Zeitfenster</div>
            </div>
          </div>

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
              🖨️ Zeitleiste drucken
            </button>
          </div>

          <MissionVisitProductTimeline label={product.label} color={product.color} points={points} maxChartBars={31} />

          <p className="mission-visit-print-stand" style={{ margin: '1.1rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>
            Stand: {new Date().toLocaleString('de-AT', { dateStyle: 'short', timeStyle: 'short' })} · lokal am Mac gemerkt
          </p>
          <div className="mission-visit-report-seitenfuss seitenfuss" aria-hidden />
        </section>
      </div>
    </main>
  )
}
