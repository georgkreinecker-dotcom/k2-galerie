import { Link } from 'react-router-dom'
import { PLATFORM_ROUTES, PROJECT_ROUTES, MOK2_ROUTE } from '../config/navigation'

/** VK2 immer per Voll-Navigation öffnen – verhindert, dass K2/Router-Zustand bleibt */
const VK2_GALERIE_URL = '/projects/vk2/galerie'

/** Deine To-dos – Vermarktung & Strategie (zum Abarbeiten). Links führen direkt zur Stelle. */
const MEINE_TODOS = [
  { text: 'Kooperation in mök2 „Kanäle 2026“ eintragen (Name/Ziel)', href: `${PROJECT_ROUTES['k2-galerie'].marketingOek2}#mok2-kanale-2026` },
  { text: 'Lizenz-Pakete (Basic/Pro/VK2) für Außen sichtbar prüfen', href: `${PROJECT_ROUTES['k2-galerie'].marketingOek2}#mok2-lizenz-pakete-aussen` },
  { text: 'Trust: AGB-Link, Datenschutz, Support prüfen', href: PROJECT_ROUTES['k2-galerie'].marketingOek2 },
  { text: 'Quartal: Kanäle 2026 in mök2 prüfen und anpassen', href: `${PROJECT_ROUTES['k2-galerie'].marketingOek2}#mok2-kanale-2026` },
  { text: 'Optional: Eine Kooperation anvisieren (Erstgespräch/Pilot)', href: `${PROJECT_ROUTES['k2-galerie'].marketingOek2}#mok2-kanale-2026` },
  { text: 'Optional: Kurz-Anleitung „So empfiehlst du“ nutzen', href: `${PROJECT_ROUTES['k2-galerie'].marketingOek2}#mok2-6` },
]

// Smart Panel (SP) – K2-Balken & Schnellzugriff (schlank, mök2-Links nur in mök2)

interface SmartPanelProps {
  currentPage?: string
}

export default function SmartPanel({ currentPage }: SmartPanelProps) {
  const quickActions = [
    {
      label: '📌 Zentrale Themen',
      action: () => {
        window.location.href = '/k2team-handbuch?doc=16-ZENTRALE-THEMEN-FUER-NUTZER.md'
      },
      hint: 'Was Nutzer wissen sollten – Übersicht (Handbuch-Kapitel 16)',
      highlight: true
    },
    {
      label: '📊 Mission Control',
      action: () => {
        window.location.href = PLATFORM_ROUTES.missionControl
      },
      hint: 'Projekt-Übersicht'
    },
    {
      label: '📁 Projekte',
      action: () => {
        window.location.href = PLATFORM_ROUTES.projects
      },
      hint: 'Alle Projekte'
    },
    {
      label: '🌐 Öffentliche Galerie K2',
      action: () => {
        window.location.href = PROJECT_ROUTES['k2-galerie'].galerieOeffentlich
      },
      hint: 'Öffentliche Ansicht der K2 Galerie'
    },
    {
      label: '📋 mök2 – Vertrieb & Promotion',
      action: () => {
        window.location.href = MOK2_ROUTE
      },
      hint: 'Eigener Bereich – nur indirekt mit App-Entwicklung verbunden'
    },
    {
      label: '🧠 Handbuch',
      action: () => {
        window.location.href = '/k2team-handbuch'
      },
      hint: 'K2Team Handbuch – Zusammenarbeit, Backup, Sicherheit'
    }
  ]

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '1rem',
      gap: '1rem',
      overflowY: 'auto',
      overflowX: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid rgba(95, 251, 241, 0.2)',
        paddingBottom: '1rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.5rem'
        }}>
          <span style={{ fontSize: '1.5rem' }}>⚡</span>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#5ffbf1' }}>
            Smart Panel
          </h3>
        </div>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#8fa0c9' }}>
          Schnellzugriff
        </p>
      </div>

      {/* K2-Balken – echte Galerie (K2 Galerie Kunst&Keramik) */}
      <Link
        to={PROJECT_ROUTES['k2-galerie'].galerie}
        style={{
          display: 'block',
          padding: '0.85rem 1rem',
          background: 'linear-gradient(135deg, rgba(255, 140, 66, 0.2), rgba(230, 122, 42, 0.15))',
          border: '1px solid rgba(255, 140, 66, 0.4)',
          borderRadius: '8px',
          color: '#ff8c42',
          fontWeight: 600,
          fontSize: '1rem',
          textAlign: 'center',
          textDecoration: 'none',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 140, 66, 0.3), rgba(230, 122, 42, 0.25))'
          e.currentTarget.style.borderColor = 'rgba(255, 140, 66, 0.6)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 140, 66, 0.2), rgba(230, 122, 42, 0.15))'
          e.currentTarget.style.borderColor = 'rgba(255, 140, 66, 0.4)'
        }}
      >
        🎨 K2 Galerie Kunst&Keramik
      </Link>

      {/* VK2 Vereinsplattform – K2-Familie (Hausherr): gleiche Designsprache wie K2 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button
          type="button"
          onClick={() => { window.location.href = VK2_GALERIE_URL }}
          style={{
            display: 'block',
            width: '100%',
            padding: '0.85rem 1rem',
            background: 'linear-gradient(135deg, rgba(230, 122, 42, 0.2), rgba(255, 140, 66, 0.15))',
            border: '1px solid rgba(255, 140, 66, 0.4)',
            borderRadius: '8px',
            color: '#ff8c42',
            fontWeight: 600,
            fontSize: '1rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: 'inherit'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(230, 122, 42, 0.3), rgba(255, 140, 66, 0.25))'
            e.currentTarget.style.borderColor = 'rgba(255, 140, 66, 0.6)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(230, 122, 42, 0.2), rgba(255, 140, 66, 0.15))'
            e.currentTarget.style.borderColor = 'rgba(255, 140, 66, 0.4)'
          }}
        >
          🎨 VK2 Vereinsplattform
        </button>
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          <Link to={PROJECT_ROUTES.vk2.kunden} style={{ flex: 1, minWidth: '80px', padding: '0.5rem 0.6rem', fontSize: '0.85rem', background: 'rgba(255, 140, 66, 0.15)', border: '1px solid rgba(255, 140, 66, 0.3)', borderRadius: 6, color: '#ff8c42', textDecoration: 'none', textAlign: 'center' }}>Mitglieder</Link>
          <Link to={PROJECT_ROUTES.vk2.galerieVorschau} style={{ flex: 1, minWidth: '80px', padding: '0.5rem 0.6rem', fontSize: '0.85rem', background: 'rgba(255, 140, 66, 0.15)', border: '1px solid rgba(255, 140, 66, 0.3)', borderRadius: 6, color: '#ff8c42', textDecoration: 'none', textAlign: 'center' }}>Künstler</Link>
          <Link to={PROJECT_ROUTES.vk2.vollversion} style={{ flex: 1, minWidth: '80px', padding: '0.5rem 0.6rem', fontSize: '0.85rem', background: 'rgba(255, 140, 66, 0.25)', border: '1px solid rgba(255, 140, 66, 0.4)', borderRadius: 6, color: '#ff8c42', textDecoration: 'none', textAlign: 'center', fontWeight: 600 }}>Admin</Link>
        </div>
      </div>

      {/* Admin-Bereich – Überblick über User/Mandanten */}
      <div>
        <h4 style={{
          margin: '0 0 0.5rem 0',
          fontSize: '0.9rem',
          color: '#5ffbf1',
          fontWeight: 600
        }}>
          👤 Admin-Bereich
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link
            to="/admin"
            style={{
              padding: '0.75rem',
              background: 'rgba(95, 251, 241, 0.1)',
              border: '1px solid rgba(95, 251, 241, 0.2)',
              borderRadius: '6px',
              color: '#5ffbf1',
              cursor: 'pointer',
              fontSize: '0.85rem',
              textAlign: 'left',
              textDecoration: 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(95, 251, 241, 0.15)'
              e.currentTarget.style.borderColor = 'rgba(95, 251, 241, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(95, 251, 241, 0.1)'
              e.currentTarget.style.borderColor = 'rgba(95, 251, 241, 0.2)'
            }}
            title="Übersicht deiner User und Mandanten"
          >
            <span>👥 Meine User</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>→</span>
          </Link>
        </div>
      </div>

      {/* Deine To-dos – Vermarktung & Strategie */}
      <div>
        <h4 style={{
          margin: '0 0 0.5rem 0',
          fontSize: '0.9rem',
          color: '#fbbf24',
          fontWeight: 600
        }}>
          📋 Deine To-dos
        </h4>
        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: '#8fa0c9' }}>
          Vermarktung & Strategie – Klick führt zur Stelle
        </p>
        <ul style={{ margin: 0, paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {MEINE_TODOS.map((todo, i) => (
            <li key={i} style={{ fontSize: '0.8rem', lineHeight: 1.35 }}>
              <a
                href={todo.href}
                style={{ color: '#fbbf24', textDecoration: 'none' }}
                onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline' }}
                onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none' }}
              >
                {todo.text}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Schnellzugriff */}
      <div>
        <h4 style={{
          margin: '0 0 0.5rem 0',
          fontSize: '0.9rem',
          color: '#5ffbf1',
          fontWeight: 600
        }}>
          ⚡ Schnellzugriff
        </h4>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `}</style>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          {quickActions.map((action, i) => {
            const isHighlighted = (action as any).highlight
            return (
              <button
                key={i}
                onClick={action.action}
                style={{
                  padding: '0.75rem',
                  background: isHighlighted 
                    ? 'rgba(34, 197, 94, 0.15)' 
                    : 'rgba(95, 251, 241, 0.1)',
                  border: `1px solid ${isHighlighted 
                    ? 'rgba(34, 197, 94, 0.4)' 
                    : 'rgba(95, 251, 241, 0.2)'}`,
                  borderRadius: '6px',
                  color: isHighlighted ? '#86efac' : '#5ffbf1',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  animation: isHighlighted ? 'pulse 2s infinite' : 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isHighlighted 
                    ? 'rgba(34, 197, 94, 0.2)' 
                    : 'rgba(95, 251, 241, 0.15)'
                  e.currentTarget.style.borderColor = isHighlighted 
                    ? 'rgba(34, 197, 94, 0.5)' 
                    : 'rgba(95, 251, 241, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isHighlighted 
                    ? 'rgba(34, 197, 94, 0.15)' 
                    : 'rgba(95, 251, 241, 0.1)'
                  e.currentTarget.style.borderColor = isHighlighted 
                    ? 'rgba(34, 197, 94, 0.4)' 
                    : 'rgba(95, 251, 241, 0.2)'
                }}
                title={action.hint}
              >
                <span>{action.label}</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>→</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
