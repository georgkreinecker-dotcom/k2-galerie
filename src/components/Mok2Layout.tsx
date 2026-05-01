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
`

export default function Mok2Layout({ children }: { children: React.ReactNode }) {
  const [panelMinimized, setPanelMinimized] = useState(false)
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
        <Link
          to={PROJECT_ROUTES['k2-galerie'].softwareentwicklung}
          style={{
            padding: '0.4rem 0.8rem',
            background: isSoftwareentwicklung ? 'var(--k2-accent, #5ffbf1)' : '#444',
            color: isSoftwareentwicklung ? '#000' : '#fff',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '0.9rem',
            fontWeight: isSoftwareentwicklung ? 600 : 400,
          }}
        >
          K2 Softwareentwicklung
        </Link>
        <Link
          to={PROJECT_ROUTES['k2-galerie'].werbeunterlagen}
          style={{
            padding: '0.4rem 0.8rem',
            background: isWerbeunterlagen ? 'var(--k2-accent, #5ffbf1)' : '#444',
            color: isWerbeunterlagen ? '#000' : '#fff',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '0.9rem',
            fontWeight: isWerbeunterlagen ? 600 : 400,
          }}
        >
          Werbeunterlagen
        </Link>
        <Link
          to={PROJECT_ROUTES['k2-galerie'].werbefahrplan}
          style={{
            padding: '0.4rem 0.8rem',
            background: isWerbefahrplan ? 'var(--k2-accent, #5ffbf1)' : '#444',
            color: isWerbefahrplan ? '#000' : '#fff',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '0.9rem',
            fontWeight: isWerbefahrplan ? 600 : 400,
          }}
        >
          Werbefahrplan
        </Link>
        <Link
          to={PROJECT_ROUTES['k2-galerie'].licences}
          style={{
            padding: '0.4rem 0.8rem',
            background: isLicences ? 'var(--k2-accent, #5ffbf1)' : '#444',
            color: isLicences ? '#000' : '#fff',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '0.9rem',
            fontWeight: isLicences ? 600 : 400,
          }}
        >
          Lizenzen
        </Link>
        <Link
          to={PROJECT_ROUTES['k2-galerie'].empfehlungstool}
          style={{
            padding: '0.4rem 0.8rem',
            background: isEmpfehlungstool ? 'var(--k2-accent, #5ffbf1)' : '#444',
            color: isEmpfehlungstool ? '#000' : '#fff',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '0.9rem',
            fontWeight: isEmpfehlungstool ? 600 : 400,
          }}
        >
          Empfehlungstool
        </Link>
        <Link
          to={PROJECT_ROUTES['k2-galerie'].verguetung}
          style={{
            padding: '0.4rem 0.8rem',
            background: isVerguetung ? 'var(--k2-accent, #5ffbf1)' : '#444',
            color: isVerguetung ? '#000' : '#fff',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '0.9rem',
            fontWeight: isVerguetung ? 600 : 400,
          }}
        >
          Vergütung
        </Link>
        <Link
          to={OEK2_NEUER_BESUCHER_EINSTIEG_ROUTE}
          style={{
            padding: '0.4rem 0.8rem',
            background: isEingangstor ? 'var(--k2-accent, #5ffbf1)' : '#444',
            color: isEingangstor ? '#000' : '#fff',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '0.9rem',
            fontWeight: isEingangstor ? 600 : 400,
          }}
        >
          Eingangstor
        </Link>
        <Link
          to={AGB_ROUTE}
          state={{ returnTo: location.pathname }}
          style={{
            padding: '0.4rem 0.8rem',
            background: isAgb ? 'var(--k2-accent, #5ffbf1)' : '#444',
            color: isAgb ? '#000' : '#fff',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '0.9rem',
            fontWeight: isAgb ? 600 : 400,
          }}
        >
          AGB
        </Link>
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
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.8rem', color: '#8fa0c9' }}>
            Arbeitsplattform für den Vertrieb von ök2
          </p>
          <Link
            to={PROJECT_ROUTES['k2-galerie'].uebersicht}
            style={{
              marginBottom: '0.75rem',
              padding: '0.5rem 0.75rem',
              background: isUebersicht ? 'rgba(95, 251, 241, 0.2)' : 'rgba(95, 251, 241, 0.08)',
              border: '1px solid rgba(95, 251, 241, 0.2)',
              borderRadius: '6px',
              color: '#5ffbf1',
              textDecoration: 'none',
              fontSize: '0.85rem',
              display: 'block',
              fontWeight: isUebersicht ? 600 : 400,
            }}
          >
            📊 Übersicht (Board)
          </Link>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {mok2Groups.map((group) => (
              <div key={group.chapterTitle}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8fa0c9', marginBottom: '0.25rem', paddingLeft: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                  {group.chapterTitle}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {group.sections.map(({ id, label, linkTo }) => {
                    if (linkTo) {
                      const active = location.pathname === linkTo || location.pathname.startsWith(`${linkTo}/`)
                      return (
                        <Link
                          key={id}
                          to={linkTo}
                          state={{ returnTo: PROJECT_ROUTES['k2-galerie'].marketingOek2 }}
                          style={{
                            padding: '0.4rem 0.6rem',
                            background: active ? 'rgba(95, 251, 241, 0.22)' : 'rgba(95, 251, 241, 0.08)',
                            border: `1px solid ${active ? 'rgba(95, 251, 241, 0.45)' : 'rgba(95, 251, 241, 0.2)'}`,
                            borderRadius: '6px',
                            color: active ? '#0f172a' : '#5ffbf1',
                            textDecoration: 'none',
                            fontSize: '0.82rem',
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
                          padding: '0.4rem 0.6rem',
                          background: 'rgba(95, 251, 241, 0.08)',
                          border: '1px solid rgba(95, 251, 241, 0.2)',
                          borderRadius: '6px',
                          color: '#5ffbf1',
                          cursor: 'pointer',
                          fontSize: '0.82rem',
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
                          padding: '0.4rem 0.6rem',
                          background: 'rgba(95, 251, 241, 0.08)',
                          border: '1px solid rgba(95, 251, 241, 0.2)',
                          borderRadius: '6px',
                          color: '#5ffbf1',
                          textDecoration: 'none',
                          fontSize: '0.82rem',
                          display: 'block',
                        }}
                      >
                        {label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
            <Link
              to={PROJECT_ROUTES['k2-galerie'].werbeunterlagen}
              style={{
                marginTop: '0.5rem',
                padding: '0.5rem 0.75rem',
                background: isWerbeunterlagen ? 'rgba(95, 251, 241, 0.2)' : 'rgba(95, 251, 241, 0.08)',
                border: '1px solid rgba(95, 251, 241, 0.2)',
                borderRadius: '6px',
                color: '#5ffbf1',
                textDecoration: 'none',
                fontSize: '0.85rem',
                display: 'block',
              }}
            >
              📁 Werbeunterlagen (bearbeitbar)
            </Link>
            <Link
              to={PROJECT_ROUTES['k2-galerie'].licences}
              style={{
                marginTop: '0.4rem',
                padding: '0.5rem 0.75rem',
                background: isLicences ? 'rgba(95, 251, 241, 0.2)' : 'rgba(95, 251, 241, 0.08)',
                border: '1px solid rgba(95, 251, 241, 0.2)',
                borderRadius: '6px',
                color: '#5ffbf1',
                textDecoration: 'none',
                fontSize: '0.85rem',
                display: 'block',
              }}
            >
              💼 Lizenzen (Konditionen & Vergebung)
            </Link>
            <Link
              to={PROJECT_ROUTES['k2-galerie'].lizenzKaufen}
              style={{
                marginTop: '0.4rem',
                padding: '0.5rem 0.75rem',
                background: 'rgba(181, 74, 30, 0.25)',
                border: '1px solid rgba(255, 140, 66, 0.45)',
                borderRadius: '6px',
                color: '#ffccaa',
                textDecoration: 'none',
                fontSize: '0.85rem',
                display: 'block',
                fontWeight: 600,
              }}
            >
              🛒 Lizenz online abschließen (Stripe)
            </Link>
            <Link
              to={OEK2_NEUER_BESUCHER_EINSTIEG_ROUTE}
              style={{
                marginTop: '0.4rem',
                padding: '0.5rem 0.75rem',
                background: 'rgba(95, 251, 241, 0.08)',
                border: '1px solid rgba(95, 251, 241, 0.2)',
                borderRadius: '6px',
                color: '#5ffbf1',
                textDecoration: 'none',
                fontSize: '0.85rem',
                display: 'block',
              }}
            >
              🚪 Eingangstor (Zugangsbereich)
            </Link>
            <Link
              to={AGB_ROUTE}
              state={{ returnTo: location.pathname }}
              style={{
                marginTop: '0.4rem',
                padding: '0.5rem 0.75rem',
                background: 'rgba(95, 251, 241, 0.08)',
                border: '1px solid rgba(95, 251, 241, 0.2)',
                borderRadius: '6px',
                color: '#5ffbf1',
                textDecoration: 'none',
                fontSize: '0.85rem',
                display: 'block',
              }}
            >
              📜 AGB (Geschäftsbedingungen)
            </Link>
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
