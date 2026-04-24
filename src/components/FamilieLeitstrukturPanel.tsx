/**
 * K2 Familie – linkes Leitstruktur-Panel (analog mök2 Mok2Layout-Sidebar).
 */

import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { PLATFORM_ROUTES } from '../config/navigation'
import { getK2FamilieLeitGroups, isFamilieNavSectionActive } from '../config/k2FamilieStructure'

const LS_KEY = 'k2-familie-leitstruktur-minimized'
const MAPPEN_OPEN_KEY = 'k2-familie-leitstruktur-mappen-open'
const PANEL_WIDTH = 304

const ACCENT = 'rgba(45, 212, 191, 0.95)'
const MUTED = 'rgba(148, 163, 184, 0.95)'

/** Stabile IDs für einklappbare Mappen (wie Smart Panel `MAPPEN`) */
const CHAPTER_TO_GROUP_ID: Record<string, string> = {
  'Start & Orientierung': 'fam-start',
  'Stammbaum & Struktur': 'fam-stammbaum',
  'Momente & Zeit': 'fam-momente',
  'Lesen & Außenauftritt': 'fam-lesen',
  'Prospekte & Präsentationsmappen': 'fam-prospekte',
  'K2 Familien Marketing': 'fam-marketing',
  'Entwicklung & Sicherheit': 'fam-entwicklung',
}

function groupIdForChapter(title: string, index: number): string {
  return CHAPTER_TO_GROUP_ID[title] ?? `fam-gruppe-${index}`
}

function loadMappenOpen(): Record<string, boolean> {
  try {
    const v = localStorage.getItem(MAPPEN_OPEN_KEY)
    if (v) return JSON.parse(v) as Record<string, boolean>
  } catch {
    /* ignore */
  }
  return {}
}

function saveMappenOpen(open: Record<string, boolean>) {
  try {
    localStorage.setItem(MAPPEN_OPEN_KEY, JSON.stringify(open))
  } catch {
    /* ignore */
  }
}

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

  const groups = getK2FamilieLeitGroups()
  const [mappenOpen, setMappenOpen] = useState<Record<string, boolean>>(loadMappenOpen)

  const toggleMappe = (id: string) => {
    setMappenOpen((prev) => {
      const wasOpen = prev[id] !== false
      const next = { ...prev, [id]: !wasOpen }
      saveMappenOpen(next)
      return next
    })
  }

  /** Mappe mit aktivem Link automatisch aufklappen (Navigation in eingeklappter Mappe) */
  useEffect(() => {
    const gruppen = getK2FamilieLeitGroups()
    const toOpen: Record<string, boolean> = {}
    gruppen.forEach((g, i) => {
      const gid = groupIdForChapter(g.chapterTitle, i)
      const hasActive = g.sections.some((s) =>
        isFamilieNavSectionActive(location.pathname, s.to, location.search),
      )
      if (hasActive) toOpen[gid] = true
    })
    if (Object.keys(toOpen).length === 0) return
    setMappenOpen((prev) => {
      let changed = false
      const next = { ...prev }
      for (const [k, v] of Object.entries(toOpen)) {
        if (next[k] === false && v) {
          next[k] = true
          changed = true
        }
      }
      if (changed) saveMappenOpen(next)
      return changed ? next : prev
    })
  }, [location.pathname, location.search])

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
          Wie im Smart Panel: Mappen einklappbar, ein Klick zur Überschrift klappt um.
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {groups.map((group, groupIndex) => {
            const mapId = groupIdForChapter(group.chapterTitle, groupIndex)
            const isOpen = mappenOpen[mapId] !== false
            const groupHasActive = group.sections.some((s) =>
              isFamilieNavSectionActive(location.pathname, s.to, location.search),
            )
            return (
              <div
                key={group.chapterTitle}
                style={{
                  borderBottom: '1px solid rgba(45, 212, 191, 0.12)',
                  paddingBottom: '0.5rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleMappe(mapId)}
                  aria-expanded={isOpen}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.5rem 0.55rem',
                    background: groupHasActive ? 'rgba(45, 212, 191, 0.12)' : 'rgba(45, 212, 191, 0.05)',
                    border: `1px solid ${groupHasActive ? 'rgba(45, 212, 191, 0.35)' : 'rgba(45, 212, 191, 0.18)'}`,
                    borderRadius: 8,
                    color: ACCENT,
                    fontWeight: 600,
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  <span style={{ fontSize: '0.95rem', lineHeight: 1 }} aria-hidden>
                    📁
                  </span>
                  <span style={{ flex: 1, lineHeight: 1.35 }}>{group.chapterTitle}</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.85 }} aria-hidden>
                    {isOpen ? '▼' : '▶'}
                  </span>
                </button>
                {isOpen && (
                  <div
                    style={{
                      marginTop: '0.4rem',
                      paddingLeft: '0.15rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.28rem',
                    }}
                  >
                    {group.sections.map(({ id, label, to }) => {
                      const active = isFamilieNavSectionActive(location.pathname, to, location.search)
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
                )}
              </div>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
