/**
 * K2 Familie – linkes Leitstruktur-Panel (analog mök2 Mok2Layout-Sidebar).
 */

import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { PLATFORM_ROUTES } from '../config/navigation'
import { k2FamilieLeitGroups, isFamilieNavSectionActive } from '../config/k2FamilieStructure'

const LS_KEY = 'k2-familie-leitstruktur-minimized'
const PANEL_WIDTH = 304

const ACCENT = '#5eead4'
const MUTED = 'rgba(148, 163, 184, 0.95)'

export default function FamilieLeitstrukturPanel() {
  const location = useLocation()
  const [minimized, setMinimized] = useState(() => {
    try {
      return localStorage.getItem(LS_KEY) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, minimized ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [minimized])

  if (minimized) {
    return (
      <div
        className="k2-familie-leitstruktur k2-familie-leitstruktur--minimized k2-familie-no-print"
        style={{ width: 44, flexShrink: 0 }}
      >
        <button
          type="button"
          onClick={() => setMinimized(false)}
          title="Struktur anzeigen"
          aria-label="Struktur anzeigen"
          style={{
            width: '100%',
            minHeight: 120,
            padding: '0.5rem',
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.98), rgba(15, 23, 42, 0.92))',
            border: 'none',
            borderRight: `1px solid rgba(45, 212, 191, 0.25)`,
            color: ACCENT,
            cursor: 'pointer',
            fontSize: '1.1rem',
          }}
        >
          →
        </button>
      </div>
    )
  }

  return (
    <aside
      className="k2-familie-leitstruktur k2-familie-no-print"
      aria-label="K2 Familie – Leitstruktur"
      style={{
        width: PANEL_WIDTH,
        flexShrink: 0,
        minHeight: '100%',
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.98), rgba(15, 23, 42, 0.94))',
        borderRight: '1px solid rgba(45, 212, 191, 0.22)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '1rem', overflowY: 'auto', flex: 1 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
            gap: '0.5rem',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: ACCENT }}>Struktur K2 Familie</h2>
          <button
            type="button"
            onClick={() => setMinimized(true)}
            title="Panel einklappen"
            aria-label="Panel einklappen"
            style={{
              background: 'transparent',
              border: 'none',
              color: MUTED,
              cursor: 'pointer',
              padding: '0.25rem',
              fontSize: '1.1rem',
              flexShrink: 0,
            }}
          >
            ←
          </button>
        </div>
        <p style={{ margin: '0 0 0.85rem', fontSize: '0.78rem', color: MUTED, lineHeight: 1.45 }}>
          Orientierung wie bei Marketing ök2: Bereiche gruppiert, ein Klick zum Ziel.
        </p>
        <Link
          to={PLATFORM_ROUTES.projects}
          style={{
            display: 'block',
            marginBottom: '0.85rem',
            padding: '0.45rem 0.65rem',
            background: 'rgba(45, 212, 191, 0.1)',
            border: '1px solid rgba(45, 212, 191, 0.28)',
            borderRadius: 8,
            color: ACCENT,
            textDecoration: 'none',
            fontSize: '0.82rem',
            fontWeight: 600,
          }}
        >
          ← Projekte
        </Link>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {k2FamilieLeitGroups.map((group) => (
            <div key={group.chapterTitle}>
              <div
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: MUTED,
                  marginBottom: '0.3rem',
                  paddingLeft: '0.2rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {group.chapterTitle}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.28rem' }}>
                {group.sections.map(({ id, label, to }) => {
                  const active = isFamilieNavSectionActive(location.pathname, to)
                  return (
                    <Link
                      key={id}
                      to={to}
                      style={{
                        padding: '0.42rem 0.55rem',
                        borderRadius: 6,
                        fontSize: '0.84rem',
                        textDecoration: 'none',
                        fontWeight: active ? 700 : 500,
                        color: active ? '#0f172a' : 'rgba(240, 253, 250, 0.92)',
                        background: active ? 'rgba(45, 212, 191, 0.45)' : 'rgba(45, 212, 191, 0.07)',
                        border: `1px solid ${active ? 'rgba(45, 212, 191, 0.55)' : 'rgba(45, 212, 191, 0.15)'}`,
                      }}
                    >
                      {label}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
