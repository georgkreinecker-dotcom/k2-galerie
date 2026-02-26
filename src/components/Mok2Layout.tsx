/**
 * mök2-Layout – wie APf: Smart Panel (Struktur) links, obere Leiste mit schwarzen Buttons.
 * Wraps MarketingOek2Page und WerbeunterlagenPage.
 */

import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { PROJECT_ROUTES, WILLKOMMEN_ROUTE, AGB_ROUTE } from '../config/navigation'

const PANEL_WIDTH = 380
const TOP_BAR_HEIGHT = 56

const mok2Sections = [
  { id: 'mok2-was-kann-die-app', label: 'Was kann die App? (ök2 | VK2)' },
  { id: 'mok2-1', label: '1. USPs' },
  { id: 'mok2-2', label: '2. Marktchancen – Stärken' },
  { id: 'mok2-3', label: '3. Marktchancen – Herausforderungen' },
  { id: 'mok2-4', label: '4. Fazit & nächste Schritte' },
  { id: 'mok2-kanale-2026', label: 'Kanäle 2026' },
  { id: 'mok2-verbesserungen', label: 'Was wir gemeinsam verbessern' },
  { id: 'mok2-5', label: '5. Weitere Ideen & Konzepte' },
  { id: 'mok2-6', label: '6. Empfehlungs-Programm' },
  { id: 'mok2-so-empfiehlst-du', label: 'So empfiehlst du (Kurz-Anleitung)' },
  { id: 'mok2-7', label: '7. Promotion für alle Medien (inkl. Zielgruppe)' },
  { id: 'mok2-8', label: '8. APf-Struktur' },
  { id: 'mok2-9', label: '9. Werbeunterlagen' },
  { id: 'mok2-lizenz-pakete-aussen', label: 'Lizenzpakete (Außensicht)' },
  { id: 'mok2-10b-vk2-lizenz', label: 'Lizenzstruktur VK2 (Vereinsplattform)' },
  { id: 'mok2-13', label: '13. Werkkatalog & Werkkarte' },
  { id: 'mok2-14', label: '14. 💎 Excellent-Lizenz' },
  { id: 'mok2-15-gruender', label: '15. 🌱 Gründer-Galerie & Leitkünstler' },
  { id: 'mok2-16-leitkuenstler', label: '16. 📋 Leitkünstler:innen – Meine Liste' },
  { id: 'mok2-17-guide-avatar', label: '17. 🎙️ Guide-Avatar Vision (Option A)' },
  { id: 'mok2-18-empfehlung', label: '18. 🤝 Empfehlung – die richtige Sprache' },
] as const

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
  const isWerbeunterlagen = location.pathname === PROJECT_ROUTES['k2-galerie'].werbeunterlagen
  const isLicences = location.pathname === PROJECT_ROUTES['k2-galerie'].licences
  const isEmpfehlungstool = location.pathname === PROJECT_ROUTES['k2-galerie'].empfehlungstool
  const isVerguetung = location.pathname === PROJECT_ROUTES['k2-galerie'].verguetung
  const isWillkommen = location.pathname === WILLKOMMEN_ROUTE
  const isAgb = location.pathname === AGB_ROUTE

  const scrollToSection = (id: string) => {
    if (isMarketingPage) {
      const el = document.getElementById(id)
      el?.scrollIntoView({ behavior: 'smooth' })
    }
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
          to={PROJECT_ROUTES['k2-galerie'].home}
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
          to={WILLKOMMEN_ROUTE}
          style={{
            padding: '0.4rem 0.8rem',
            background: isWillkommen ? 'var(--k2-accent, #5ffbf1)' : '#444',
            color: isWillkommen ? '#000' : '#fff',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '0.9rem',
            fontWeight: isWillkommen ? 600 : 400,
          }}
        >
          Willkommen
        </Link>
        <Link
          to={AGB_ROUTE}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {mok2Sections.map(({ id, label }) => (
              isMarketingPage ? (
                <button
                  key={id}
                  type="button"
                  onClick={() => scrollToSection(id)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: 'rgba(95, 251, 241, 0.08)',
                    border: '1px solid rgba(95, 251, 241, 0.2)',
                    borderRadius: '6px',
                    color: '#5ffbf1',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
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
                  {label}
                </Link>
              )
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
              to={WILLKOMMEN_ROUTE}
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
              🚪 Willkommensseite (Zugangsbereich)
            </Link>
            <Link
              to={AGB_ROUTE}
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
