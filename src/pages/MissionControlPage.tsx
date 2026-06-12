import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PROJECT_ROUTES, PLATFORM_ROUTES } from '../config/navigation'
import {
  licenseeProductId,
  missionVisitZeitleisteOverviewPath,
  missionVisitZeitleisteProductPath,
} from '../config/missionVisitZeitleiste'
import { useMissionOnlineLicences } from '../hooks/useMissionOnlineLicences'
import {
  formatLicenceTypeLabel,
  missionLicenceDisplayName,
  resolveMissionLicenceGalerieUrl,
  uniqueTenantIdsFromLicences,
} from '../utils/missionOnlineLicences'
import {
  fetchVisitCount,
  fetchVisitCountAggregateByPrefixWithMeta,
  fetchVisitCountWithMeta,
  getVisitCountApiOrigin,
  VISIT_AGGREGATE_PREFIX_OEK2_PILOT,
  VISIT_AGGREGATE_PREFIX_VK2_PILOT,
} from '../utils/visitCountApiOrigin'
import {
  loadMissionVisitSnapshots,
  type MissionVisitCounts,
  type MissionVisitSnapshot,
  upsertLicenseeVisitSnapshot,
  upsertMissionVisitSnapshot,
} from '../utils/missionVisitSnapshots'
import { sumVisitCounts } from '../utils/visitTenantAggregate'

type VisitArea = {
  key: string
  label: string
  value: number
  detail?: string
  color: string
}

export default function MissionControlPage() {
  const [visits, setVisits] = useState<MissionVisitCounts | null>(null)
  const [, setVisitTimeline] = useState<MissionVisitSnapshot[]>(() => loadMissionVisitSnapshots())
  const [licenseeVisitCounts, setLicenseeVisitCounts] = useState<Record<string, number> | null>(null)
  const {
    licences: onlineLicences,
    loading: onlineLicencesLoading,
    error: onlineLicencesError,
    emptyOnlineHint,
    count: stripeLicenceCount,
  } = useMissionOnlineLicences()
  const [visitLoadIssue, setVisitLoadIssue] = useState<string | null>(null)
  const [visitReloadTick, setVisitReloadTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetchVisitCountWithMeta('k2'),
      fetchVisitCountWithMeta('oeffentlich'),
      fetchVisitCountAggregateByPrefixWithMeta(VISIT_AGGREGATE_PREFIX_OEK2_PILOT),
      fetchVisitCountWithMeta('vk2'),
      fetchVisitCountAggregateByPrefixWithMeta(VISIT_AGGREGATE_PREFIX_VK2_PILOT),
      fetchVisitCountWithMeta('k2-familie-muster'),
      fetchVisitCountWithMeta('k2-familie-kreinecker-stammbaum'),
    ]).then(([k2R, oefR, oefPilotR, vk2DemoR, vk2PilotR, k2FamilieMusterR, kreineckerStammbaumR]) => {
      if (cancelled) return
      const next: MissionVisitCounts = {
        k2: k2R.count,
        oeffentlich: oefR.count,
        oeffentlichPilot: oefPilotR.count,
        oeffentlichGesamt: sumVisitCounts(oefR.count, oefPilotR.count),
        vk2Demo: vk2DemoR.count,
        vk2Pilot: vk2PilotR.count,
        vk2Gesamt: sumVisitCounts(vk2DemoR.count, vk2PilotR.count),
        k2FamilieMuster: k2FamilieMusterR.count,
        kreineckerStammbaum: kreineckerStammbaumR.count,
      }
      const results = [k2R, oefR, oefPilotR, vk2DemoR, vk2PilotR, k2FamilieMusterR, kreineckerStammbaumR]
      const failed = results.filter((r) => !r.loaded)
      const sum =
        next.k2 +
        next.oeffentlichGesamt +
        next.vk2Gesamt +
        next.k2FamilieMuster +
        next.kreineckerStammbaum
      if (failed.length > 0 && sum === 0) {
        const firstErr = failed.find((r) => r.error)?.error ?? 'Unbekannt'
        setVisitLoadIssue(
          `Zähler nicht geladen (${firstErr}). Quelle: ${getVisitCountApiOrigin()}/api/visit – „Zähler neu laden“ oder im Browser öffnen (nicht Cursor-Vorschau).`,
        )
      } else {
        setVisitLoadIssue(null)
      }
      setVisits(next)
      if (sum > 0) {
        upsertMissionVisitSnapshot(next)
        setVisitTimeline(loadMissionVisitSnapshots())
      }
    })
    return () => {
      cancelled = true
    }
  }, [visitReloadTick])

  const licenceTenantIds = useMemo(
    () => uniqueTenantIdsFromLicences(onlineLicences),
    [onlineLicences],
  )

  useEffect(() => {
    if (onlineLicencesLoading) return
    const ids = licenceTenantIds
    if (ids.length === 0) {
      setLicenseeVisitCounts({})
      return
    }
    let cancelled = false
    Promise.all(ids.map((id) => fetchVisitCount(id))).then((counts) => {
      if (cancelled) return
      const next: Record<string, number> = {}
      ids.forEach((id, i) => {
        next[id] = counts[i]
        upsertLicenseeVisitSnapshot(id, counts[i])
      })
      setLicenseeVisitCounts(next)
    })
    return () => {
      cancelled = true
    }
  }, [visitReloadTick, onlineLicencesLoading, licenceTenantIds])

  const visitAreas = useMemo((): VisitArea[] | null => {
    if (!visits) return null
    return [
      { key: 'k2', label: 'K2 Galerie', value: visits.k2, color: '#5ffbf1' },
      {
        key: 'oeffentlich',
        label: 'ök2 gesamt',
        value: visits.oeffentlichGesamt,
        detail: `Demo ${visits.oeffentlich} · Pilot ${visits.oeffentlichPilot}`,
        color: '#fcd34d',
      },
      {
        key: 'vk2',
        label: 'VK2 gesamt',
        value: visits.vk2Gesamt,
        detail: `Demo ${visits.vk2Demo} · Pilot ${visits.vk2Pilot}`,
        color: '#a78bfa',
      },
      { key: 'fam-muster', label: 'K2 Familie Muster', value: visits.k2FamilieMuster, color: '#34d399' },
      { key: 'krein', label: 'Kreinecker-Stammbaum', value: visits.kreineckerStammbaum, color: '#fb923c' },
    ]
  }, [visits])

  const visitSum = useMemo(() => {
    if (!visitAreas) return null
    return visitAreas.reduce((a, r) => a + r.value, 0)
  }, [visitAreas])

  const visitMax = useMemo(() => {
    if (!visitAreas?.length) return 1
    return Math.max(1, ...visitAreas.map((r) => r.value))
  }, [visitAreas])

  const licenseeVisitSum = useMemo(() => {
    if (!licenseeVisitCounts) return null
    return Object.values(licenseeVisitCounts).reduce((a, n) => a + n, 0)
  }, [licenseeVisitCounts])

  const reloadCounts = () => {
    setVisits(null)
    setLicenseeVisitCounts(null)
    setVisitReloadTick((t) => t + 1)
  }

  const printStats = () => {
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
          <span style={{ color: 'rgba(148,163,184,0.5)' }} aria-hidden>
            ·
          </span>
          <Link to={PROJECT_ROUTES['k2-galerie'].uebersicht} style={{ color: '#5eead4', textDecoration: 'none', fontWeight: 600 }}>
            Übersicht-Board
          </Link>
          <span style={{ color: 'rgba(148,163,184,0.5)' }} aria-hidden>
            ·
          </span>
          <Link to={PROJECT_ROUTES['k2-galerie'].licences} style={{ color: '#6ee7b7', textDecoration: 'none' }}>
            Lizenzen
          </Link>
          <span style={{ color: 'rgba(148,163,184,0.5)' }} aria-hidden>
            ·
          </span>
          <Link to={PLATFORM_ROUTES.missionControlSystem} style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.8rem' }}>
            Mehr (System)
          </Link>
        </nav>

        <section
          className="panel mission-visit-report-panel"
          style={{
            background: 'linear-gradient(135deg, rgba(15,23,42,0.92), rgba(30,41,59,0.88))',
            border: '1px solid rgba(129,140,248,0.35)',
            padding: '1.25rem 1.35rem',
          }}
        >
          <header style={{ marginBottom: '1.1rem' }}>
            <h1 style={{ margin: 0, fontSize: '1.35rem', color: '#f0f6ff', fontWeight: 800 }}>📊 Besucher & Lizenzen</h1>
            <p style={{ margin: '0.4rem 0 0', fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.45 }}>
              Aktuelle Zahlen hier · Zeitleisten mit Zeitfenster und Druck auf eigener Seite.
            </p>
          </header>

          {visitLoadIssue ? (
            <div
              className="mission-visit-no-print"
              style={{
                margin: '0 0 1rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                background: 'rgba(127,29,29,0.35)',
                border: '1px solid rgba(248,113,113,0.55)',
                fontSize: '0.82rem',
                color: '#fecaca',
                lineHeight: 1.5,
              }}
            >
              ⚠️ {visitLoadIssue}
            </div>
          ) : null}

          <div
            className="mission-visit-no-print"
            style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', marginBottom: '1.15rem' }}
          >
            <button
              type="button"
              className="btn small-btn"
              onClick={reloadCounts}
              style={{
                background: 'linear-gradient(120deg, #4f46e5, #6366f1)',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                border: '1px solid rgba(165,180,252,0.4)',
              }}
            >
              ↻ Zähler neu laden
            </button>
            <button
              type="button"
              className="btn small-btn"
              onClick={printStats}
              style={{
                background: 'linear-gradient(120deg, #475569, #334155)',
                color: '#f8fafc',
                border: '1px solid rgba(148,163,184,0.5)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🖨️ Übersicht drucken
            </button>
            <Link
              to={missionVisitZeitleisteOverviewPath()}
              className="btn small-btn"
              style={{
                background: 'linear-gradient(120deg, #7c3aed, #6366f1)',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 700,
              }}
            >
              📈 Zeitleisten & Zeitfenster
            </Link>
          </div>

          <h2 style={{ margin: '0 0 0.75rem', fontSize: '1rem', color: '#a5b4fc', fontWeight: 700 }}>👁 Besucher</h2>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1.25rem',
              alignItems: 'flex-end',
              marginBottom: '1.1rem',
            }}
          >
            <div>
              <div style={{ fontSize: '2.75rem', fontWeight: 800, color: '#e0e7ff', lineHeight: 1 }}>
                {visitSum == null ? '…' : visitSum}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>Summe Sichten</div>
            </div>
            {!onlineLicencesLoading ? (
              <div
                style={{
                  padding: '0.55rem 0.85rem',
                  borderRadius: '10px',
                  background: 'rgba(16,185,129,0.12)',
                  border: '1px solid rgba(52,211,153,0.35)',
                }}
              >
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#6ee7b7', lineHeight: 1 }}>
                  {stripeLicenceCount}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Lizenzkäufe online</div>
              </div>
            ) : null}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '0.75rem',
              marginBottom: '1.5rem',
            }}
          >
            {visitAreas?.map((row) => {
              const pct = visitMax > 0 ? Math.round((row.value / visitMax) * 100) : 0
              const share = visitSum && visitSum > 0 ? Math.round((row.value / visitSum) * 100) : 0
              return (
                <div
                  key={row.key}
                  style={{
                    borderRadius: '12px',
                    background: 'rgba(15,23,42,0.55)',
                    border: `1px solid ${row.color}44`,
                    padding: '0.85rem 1rem',
                  }}
                >
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>{row.label}</div>
                  <div style={{ fontSize: '1.65rem', fontWeight: 800, color: row.color, lineHeight: 1.1, marginTop: '0.25rem' }}>
                    {row.value}
                  </div>
                  {row.detail ? (
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem' }}>{row.detail}</div>
                  ) : null}
                  <div className="mission-visit-bar-track" style={{ marginTop: '0.55rem' }}>
                    <div
                      className="mission-visit-bar-fill"
                      style={{ width: `${pct}%`, background: row.color }}
                      title={`${share}% der Summe`}
                    />
                  </div>
                  <Link
                    to={missionVisitZeitleisteProductPath(row.key)}
                    className="mission-visit-no-print"
                    style={{
                      display: 'inline-block',
                      marginTop: '0.55rem',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      color: row.color,
                      textDecoration: 'none',
                    }}
                  >
                    📈 Zeitleiste →
                  </Link>
                </div>
              )
            })}
          </div>

          <h2 style={{ margin: '0 0 0.65rem', fontSize: '1rem', color: '#fcd34d', fontWeight: 700 }}>
            💼 Lizenzkäufe (Stripe)
          </h2>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.8rem', color: '#94a3b8' }}>
            Online gekauft:{' '}
            <strong style={{ color: '#fde68a' }}>
              {onlineLicencesLoading ? '…' : stripeLicenceCount}
            </strong>
            {' · '}
            Summe Besucher Kundengalerien:{' '}
            <strong style={{ color: '#fde68a' }}>{licenseeVisitSum == null ? '…' : licenseeVisitSum}</strong>
          </p>
          {onlineLicencesError ? (
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.8rem', color: '#fecaca' }}>{onlineLicencesError}</p>
          ) : null}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', color: '#e2e8f0' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(251,191,36,0.35)', textAlign: 'left' }}>
                  <th style={{ padding: '0.45rem 0.6rem 0.55rem 0' }}>Kunde</th>
                  <th style={{ padding: '0.45rem 0.6rem' }}>Lizenz</th>
                  <th style={{ padding: '0.45rem 0.6rem' }}>Kaufdatum</th>
                  <th style={{ padding: '0.45rem 0.6rem', textAlign: 'right' }}>Besucher</th>
                  <th className="mission-visit-no-print" style={{ padding: '0.45rem 0 0.55rem 0.6rem' }}>
                    Zeitleiste
                  </th>
                  <th className="mission-visit-no-print" style={{ padding: '0.45rem 0 0.55rem 0.6rem' }}>
                    Galerie
                  </th>
                </tr>
              </thead>
              <tbody>
                {onlineLicencesLoading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '0.75rem 0', color: '#94a3b8' }}>
                      Lizenzkäufe werden geladen …
                    </td>
                  </tr>
                ) : onlineLicences.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '0.75rem 0', color: '#94a3b8', lineHeight: 1.5 }}>
                      Noch keine Online-Lizenzkäufe in Supabase.
                      {emptyOnlineHint ? ` ${emptyOnlineHint}` : ''}
                      <br />
                      <Link to={PROJECT_ROUTES['k2-galerie'].licences} style={{ color: '#7dd3fc', fontWeight: 600 }}>
                        → Lizenzen verwalten
                      </Link>
                    </td>
                  </tr>
                ) : (
                  onlineLicences.map((licence) => {
                    const tenantId = licence.tenant_id?.trim() || ''
                    const count =
                      tenantId && licenseeVisitCounts != null ? licenseeVisitCounts[tenantId] ?? 0 : null
                    const galerieUrl = resolveMissionLicenceGalerieUrl(licence)
                    return (
                      <tr key={licence.id} style={{ borderBottom: '1px solid rgba(148,163,184,0.12)' }}>
                        <td style={{ padding: '0.5rem 0.6rem 0.5rem 0', color: '#fef3c7', fontWeight: 600 }}>
                          {missionLicenceDisplayName(licence)}
                        </td>
                        <td style={{ padding: '0.5rem 0.6rem', color: '#cbd5e1' }}>
                          {formatLicenceTypeLabel(licence.licence_type)}
                        </td>
                        <td style={{ padding: '0.5rem 0.6rem', color: '#94a3b8', fontSize: '0.82rem' }}>
                          {licence.created_at?.slice(0, 10) || '–'}
                        </td>
                        <td style={{ padding: '0.5rem 0.6rem', textAlign: 'right', fontWeight: 800, fontSize: '1.05rem' }}>
                          {!tenantId ? '–' : count == null ? '…' : count}
                        </td>
                        <td className="mission-visit-no-print" style={{ padding: '0.5rem 0.6rem' }}>
                          {tenantId ? (
                            <Link
                              to={missionVisitZeitleisteProductPath(licenseeProductId(tenantId))}
                              style={{ color: '#fcd34d', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none' }}
                            >
                              📈 öffnen
                            </Link>
                          ) : (
                            <span style={{ color: '#64748b', fontSize: '0.8rem' }}>–</span>
                          )}
                        </td>
                        <td className="mission-visit-no-print" style={{ padding: '0.5rem 0 0.5rem 0.6rem' }}>
                          {galerieUrl ? (
                            <a
                              href={galerieUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: '#7dd3fc', fontWeight: 600, textDecoration: 'none', fontSize: '0.82rem' }}
                            >
                              Öffnen →
                            </a>
                          ) : (
                            <span style={{ color: '#64748b', fontSize: '0.8rem' }}>–</span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          <div
            className="mission-visit-no-print"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.65rem',
              marginTop: '1.15rem',
            }}
          >
            <Link
              to={PROJECT_ROUTES['k2-galerie'].uebersicht}
              className="btn small-btn"
              style={{
                background: 'linear-gradient(120deg, #0d9488, #14b8a6)',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 700,
              }}
            >
              Übersicht-Board → Abrechnung & Details
            </Link>
            <Link
              to={PROJECT_ROUTES['k2-galerie'].licences}
              className="btn small-btn"
              style={{
                background: 'linear-gradient(120deg, #047857, #059669)',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Lizenzen verwalten
            </Link>
          </div>

          <p className="mission-visit-print-stand" style={{ margin: '1.1rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>
            Stand: {new Date().toLocaleString('de-AT', { dateStyle: 'short', timeStyle: 'short' })} · Quelle GET /api/visit
          </p>
          <div className="mission-visit-report-seitenfuss seitenfuss" aria-hidden />
        </section>
      </div>
    </main>
  )
}
