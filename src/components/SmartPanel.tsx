import { Link } from 'react-router-dom'
import { PLATFORM_ROUTES, PROJECT_ROUTES, MOK2_ROUTE } from '../config/navigation'

// Smart Panel (SP) – K2-Balken & Schnellzugriff (schlank, mök2-Links nur in mök2)

interface SmartPanelProps {
  currentPage?: string
}

export default function SmartPanel({ currentPage }: SmartPanelProps) {
  const quickActions = [
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
      label: '🌐 ök2',
      action: () => {
        window.location.href = PROJECT_ROUTES['k2-galerie'].galerieOeffentlich
      },
      hint: 'Öffentliche K2 Galerie (nur Muster)'
    },
    {
      label: '📋 mök2 – Vertrieb & Promotion',
      action: () => {
        window.location.href = MOK2_ROUTE
      },
      hint: 'Eigener Bereich – nur indirekt mit App-Entwicklung verbunden'
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

      {/* K2-Balken – echte Galerie (Martina & Georg) */}
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
        🎨 K2 Galerie
      </Link>

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
