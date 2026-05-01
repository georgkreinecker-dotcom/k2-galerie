/**
 * mök2-Layout – wie APf: Smart Panel (Struktur) links, obere Leiste mit schwarzen Buttons.
 * Wraps MarketingOek2Page und WerbeunterlagenPage.
 */

import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  PROJECT_ROUTES,
  WILLKOMMEN_ROUTE,
  OEK2_NEUER_BESUCHER_EINSTIEG_ROUTE,
  AGB_ROUTE,
  K2_GALERIE_APF_EINSTIEG,
} from '../config/navigation'
import { mok2Groups } from '../config/mok2Structure'

const PANEL_WIDTH = 380
const TOP_BAR_HEIGHT = 56

const printStyles = `
  @media print {
    .mok2-no-print { display: none !important; }
    main { margin-left: 0 !important; margin-top: 0 !important; padding: 0 !important; }
  }
  .mok2-nav-more-summary { list-style: none; }
  .mok2-nav-more-summary::-webkit-details-marker { display: none; }
`

export default function Mok2Layout({ children }: { children: React.ReactNode }) {
  const [panelMinimized, setPanelMinimized] = useState(false)
  /** Eine Mappe aufgeklappt; null = alle zu (ruhige Übersicht). */
  const [openGroupIdx, setOpenGroupIdx] = useState<number | null>(0)
  const location = useLocation()
  const isMarketingPage = location.pathname === PROJECT_ROUTES['k2-galerie'].marketingOek2
  const isUebersicht = location.pathname === PROJECT_ROUTES['k2-galerie'].uebersicht
  const isWerbeunterlagen = location.pathname === PROJECT_ROUTES['k2-galerie'].werbeunterlagen
  const isWerbefahrplan = location.pathname === PROJECT_ROUTES['k2-galerie'].werbefahrplan
  const isLicences = location.pathname === PROJECT_ROUTES['k2-galerie'].licences
  const isSoftwareentwicklung = location.pathname === PROJECT_ROUTES['k2-galerie'].softwareentwicklung
  const isEmpfehlungstool = location.pathname === PROJECT_ROUTES['k2-galerie'].empfehlungstool
  const isVerguetung = location.pathname === PROJECT_ROUTES['k2-galerie'].verguetung
  const isEingangstor = location.pathname === OEK2_NEUER_BESUCHER_EINSTIEG_ROUTE || location.pathname === WILLKOMMEN_ROUTE
  const isAgb = location.pathname === AGB_ROUTE
  const isLizenzKaufen = location.pathname === PROJECT_ROUTES['k2-galerie'].lizenzKaufen
  const isMoreMenuRoute =
    isSoftwareentwicklung ||
    isWerbeunterlagen ||
    isWerbefahrplan ||
    isLicences ||
    isEmpfehlungstool ||
    isVerguetung ||
    isEingangstor ||
    isAgb ||
    isLizenzKaufen

  const scrollToSection = (id: string) => {
    if (!isMarketingPage) return
    const run = () => {
      const el = document.getElementById(id)
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    requestAnimationFrame(() => requestAnimationFrame(run))
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--k2-bg-1, #1a0f0a)', color: 'var(--k2-text, #fff5f0)', display: 'flex', flexDirection: 'column' }}>
      <style>{printStyles}</style>
      {/* Obere Leiste (schwarze Buttons) – wie APf */}
      <header
        className="mok2-no-print"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: TOP_BAR_HEIGHT,
          background: '#2a2a2a',
          borderBottom: '1px solid #444',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '0 1rem',
          zIndex: 1000,
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}
      >
        <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', marginRight: '0.5rem' }}>mök2</span>
        <Link
          to={K2_GALERIE_APF_EINSTIEG}
          style={{
            padding: '0.4rem 0.8rem',
            background: '#444',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '0.9rem',
          }}
        >
          ← Projekt-Start
        </Link>
        <Link
          to={PROJECT_ROUTES['k2-galerie'].uebersicht}
          style={{
            padding: '0.4rem 0.8rem',
            background: isUebersicht ? 'var(--k2-accent, #5ffbf1)' : '#444',
            color: isUebersicht ? '#000' : '#fff',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '0.9rem',
            fontWeight: isUebersicht ? 600 : 400,
          }}
        >
          Übersicht (Board)
        </Link>
        <Link
          to={PROJECT_ROUTES['k2-galerie'].marketingOek2}
          style={{
            padding: '0.4rem 0.8rem',
            background: isMarketingPage ? 'var(--k2-accent, #5ffbf1)' : '#444',
            color: isMarketingPage ? '#000' : '#fff',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '0.9rem',
            fontWeight: isMarketingPage ? 600 : 400,
          }}
        >
          Marketing ök2
        </Link>
        <details style={{ position: 'relative' }}>
          <summary
            className="mok2-nav-more-summary"
            style={{
              padding: '0.4rem 0.85rem',
              background: isMoreMenuRoute ? 'var(--k2-accent, #5ffbf1)' : '#444',
              color: isMoreMenuRoute ? '#000' : '#fff',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: isMoreMenuRoute ? 600 : 500,
              cursor: 'pointer',
              border: '1px solid #555',
            }}
          >
            Weitere Seiten
          </summary>
          <nav
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              zIndex: 1002,
              minWidth: 280,
              padding: '0.5rem',
              background: '#1e1e1e',
              border: '1px solid #555',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.2rem',
            }}
          >
            <Link
              to={PROJECT_ROUTES['k2-galerie'].softwareentwicklung}
              style={{
                padding: '0.45rem 0.65rem',
                background: isSoftwareentwicklung ? 'rgba(95,251,241,0.25)' : 'transparent',
                color: '#e8f4ff',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '0.88rem',
              }}
            >
              K2 Softwareentwicklung
            </Link>
            <Link
              to={PROJECT_ROUTES['k2-galerie'].werbeunterlagen}
              style={{
                padding: '0.45rem 0.65rem',
                background: isWerbeunterlagen ? 'rgba(95,251,241,0.25)' : 'transparent',
                color: '#e8f4ff',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '0.88rem',
              }}
            >
              Werbeunterlagen
            </Link>
            <Link
              to={PROJECT_ROUTES['k2-galerie'].werbefahrplan}
              style={{
                padding: '0.45rem 0.65rem',
                background: isWerbefahrplan ? 'rgba(95,251,241,0.25)' : 'transparent',
                color: '#e8f4ff',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '0.88rem',
              }}
            >
              Werbefahrplan
            </Link>
            <Link
              to={PROJECT_ROUTES['k2-galerie'].licences}
              style={{
                padding: '0.45rem 0.65rem',
                background: isLicences ? 'rgba(95,251,241,0.25)' : 'transparent',
                color: '#e8f4ff',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '0.88rem',
              }}
            >
              Lizenzen (Konditionen)
            </Link>
            <Link
              to={PROJECT_ROUTES['k2-galerie'].lizenzKaufen}
              style={{
                padding: '0.45rem 0.65rem',
                background: isLizenzKaufen ? 'rgba(95,251,241,0.25)' : 'transparent',
                color: '#e8f4ff',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '0.88rem',
              }}
            >
              Lizenz online abschließen
            </Link>
            <Link
              to={PROJECT_ROUTES['k2-galerie'].empfehlungstool}
              style={{
                padding: '0.45rem 0.65rem',
                background: isEmpfehlungstool ? 'rgba(95,251,241,0.25)' : 'transparent',
                color: '#e8f4ff',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '0.88rem',
              }}
            >
              Empfehlungstool
            </Link>
            <Link
              to={PROJECT_ROUTES['k2-galerie'].verguetung}
              style={{
                padding: '0.45rem 0.65rem',
                background: isVerguetung ? 'rgba(95,251,241,0.25)' : 'transparent',
                color: '#e8f4ff',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '0.88rem',
              }}
            >
              Vergütung
            </Link>
            <Link
              to={OEK2_NEUER_BESUCHER_EINSTIEG_ROUTE}
              style={{
                padding: '0.45rem 0.65rem',
                background: isEingangstor ? 'rgba(95,251,241,0.25)' : 'transparent',
                color: '#e8f4ff',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '0.88rem',
              }}
            >
              Eingangstor
            </Link>
            <Link
              to={AGB_ROUTE}
              state={{ returnTo: location.pathname }}
              style={{
                padding: '0.45rem 0.65rem',
                background: isAgb ? 'rgba(95,251,241,0.25)' : 'transparent',
                color: '#e8f4ff',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '0.88rem',
              }}
            >
              AGB
            </Link>
          </nav>
        </details>
        <div style={{ flex: 1 }} />
        <button
          type="button"
          onClick={() => window.print()}
          style={{
            padding: '0.4rem 0.9rem',
            background: '#444',
            color: '#fff',
            border: '1px solid #666',
            borderRadius: '6px',
            fontSize: '0.9rem',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          📄 Als PDF drucken
        </button>
      </header>

      {/* Smart Panel links (Struktur) */}
      <div
        className="mok2-no-print"
        style={{
          position: 'fixed',
          top: TOP_BAR_HEIGHT,
          left: 0,
          width: panelMinimized ? 0 : PANEL_WIDTH,
          height: `calc(100vh - ${TOP_BAR_HEIGHT}px)`,
          background: 'linear-gradient(180deg, rgba(26, 31, 50, 0.98), rgba(12, 16, 28, 0.98))',
          borderRight: '1px solid rgba(95, 251, 241, 0.2)',
          overflow: 'hidden',
          transition: 'width 0.25s ease',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: '1rem', overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#5ffbf1' }}>📋 Struktur mök2</h3>
            <button
              type="button"
              onClick={() => setPanelMinimized(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#8fa0c9',
                cursor: 'pointer',
                padding: '0.25rem',
                fontSize: '1.1rem',
              }}
              title="Panel einklappen"
            >
              ←
            </button>
          </div>
          <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: '#8fa0c9', lineHeight: 1.45 }}>
            Arbeitsplattform für den Vertrieb von ök2. <strong style={{ color: 'rgba(255,255,255,0.82)' }}>Mappe</strong> antippen: Kapitelanfang im Text; Themen in der Mappe ein- oder ausklappen. Übersicht:{' '}
            <strong style={{ color: 'rgba(255,255,255,0.82)' }}>oben in der Leiste</strong>. Weitere APf-Seiten: <strong style={{ color: 'rgba(255,255,255,0.82)' }}>Weitere Seiten</strong>.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {mok2Groups.map((group, groupIdx) => {
              const open = openGroupIdx === groupIdx
              return (
                <div
                  key={group.chapterTitle}
                  style={{
                    border: '1px solid rgba(95, 251, 241, 0.22)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: 'rgba(0,0,0,0.2)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      const wasOpen = openGroupIdx === groupIdx
                      setOpenGroupIdx((prev) => (prev === groupIdx ? null : groupIdx))
                      if (!wasOpen && isMarketingPage) {
                        const firstId = group.sections.find((s) => !s.linkTo)?.id
                        if (firstId) scrollToSection(firstId)
                      }
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                      padding: '0.5rem 0.65rem',
                      background: open ? 'rgba(95, 251, 241, 0.12)' : 'rgba(95, 251, 241, 0.05)',
                      border: 'none',
                      borderBottom: open ? '1px solid rgba(95, 251, 241, 0.2)' : 'none',
                      color: '#f0f6ff',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ lineHeight: 1.35 }}>📂 {group.chapterTitle}</span>
                    <span style={{ flexShrink: 0, color: '#5ffbf1', fontSize: '0.75rem' }} aria-hidden>
                      {open ? '▼' : '▶'}
                    </span>
                  </button>
                  {open && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', padding: '0.35rem 0.45rem 0.5rem' }}>
                      {group.sections.map(({ id, label, linkTo }) => {
                        if (linkTo) {
                          const active = location.pathname === linkTo || location.pathname.startsWith(`${linkTo}/`)
                          return (
                            <Link
                              key={id}
                              to={linkTo}
                              state={{ returnTo: PROJECT_ROUTES['k2-galerie'].marketingOek2 }}
                              style={{
                                padding: '0.4rem 0.55rem',
                                background: active ? 'rgba(95, 251, 241, 0.22)' : 'rgba(95, 251, 241, 0.06)',
                                border: `1px solid ${active ? 'rgba(95, 251, 241, 0.45)' : 'rgba(95, 251, 241, 0.15)'}`,
                                borderRadius: '6px',
                                color: active ? '#0f172a' : '#5ffbf1',
                                textDecoration: 'none',
                                fontSize: '0.8rem',
                                display: 'block',
                                fontWeight: active ? 600 : 400,
                              }}
                            >
                              {label}
                            </Link>
                          )
                        }
                        return isMarketingPage ? (
                          <button
                            key={id}
                            type="button"
                            onClick={() => scrollToSection(id)}
                            style={{
                              padding: '0.4rem 0.55rem',
                              background: 'rgba(95, 251, 241, 0.06)',
                              border: '1px solid rgba(95, 251, 241, 0.15)',
                              borderRadius: '6px',
                              color: '#5ffbf1',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              textAlign: 'left',
                            }}
                          >
                            {label}
                          </button>
                        ) : (
                          <Link
                            key={id}
                            to={`${PROJECT_ROUTES['k2-galerie'].marketingOek2}#${id}`}
                            style={{
                              padding: '0.4rem 0.55rem',
                              background: 'rgba(95, 251, 241, 0.06)',
                              border: '1px solid rgba(95, 251, 241, 0.15)',
                              borderRadius: '6px',
                              color: '#5ffbf1',
                              textDecoration: 'none',
                              fontSize: '0.8rem',
                              display: 'block',
                            }}
                          >
                            {label}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Minimiert: Button zum Aufklappen */}
      {panelMinimized && (
        <button
          type="button"
          className="mok2-no-print"
          onClick={() => setPanelMinimized(false)}
          style={{
            position: 'fixed',
            top: TOP_BAR_HEIGHT + 12,
            left: 12,
            zIndex: 1000,
            width: 40,
            height: 40,
            background: 'rgba(95, 251, 241, 0.2)',
            border: '2px solid rgba(95, 251, 241, 0.4)',
            borderRadius: '8px',
            color: '#5ffbf1',
            cursor: 'pointer',
            fontSize: '1.2rem',
          }}
          title="Struktur öffnen"
        >
          →
        </button>
      )}

      {/* Hauptinhalt */}
      <main
        className="print-compact"
        style={{
          marginTop: TOP_BAR_HEIGHT,
          marginLeft: panelMinimized ? 0 : PANEL_WIDTH,
          padding: '1.5rem',
          minHeight: `calc(100vh - ${TOP_BAR_HEIGHT}px)`,
          transition: 'margin-left 0.25s ease',
        }}
      >
        {children}
      </main>
    </div>
  )
}
