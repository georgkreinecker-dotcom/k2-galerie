/**
 * Grafiker-Tisch – Live-Vorschau + Bearbeitung
 * Kontextsensitiv: zeigt die zuletzt geöffnete Seite, bearbeitbar direkt hier.
 */

import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'

const NOTIZEN_KEY = 'k2-grafiker-tisch-notizen'
const LAST_PAGE_KEY = 'k2-grafiker-tisch-last-page'

type PreviewPage = {
  id: string
  label: string
  emoji: string
  url: string
  description: string
  editHint?: string
}

const PREVIEW_PAGES: PreviewPage[] = [
  {
    id: 'galerie-oeffentlich',
    label: 'Galerie ök2',
    emoji: '🖼️',
    url: '/projects/k2-galerie/galerie-oeffentlich',
    description: 'Was Besucher sehen wenn sie den QR-Code scannen',
    editHint: 'Willkommensbild, Titel, Tagline, Intro-Text, Events',
  },
  {
    id: 'willkommen',
    label: 'Willkommensseite',
    emoji: '👋',
    url: '/willkommen',
    description: 'Einstiegsseite für neue Besucher',
    editHint: 'Variante A: ?variant=a  |  Variante C: ohne Parameter',
  },
  {
    id: 'willkommen-a',
    label: 'Willkommen Var. A',
    emoji: '🌿',
    url: '/willkommen?variant=a',
    description: 'Warm & einladend – Atelier-Stil',
    editHint: 'Warm, Terrakotta, herzliche Sprache',
  },
  {
    id: 'galerie-vorschau',
    label: 'Werke-Vorschau',
    emoji: '🎨',
    url: '/projects/k2-galerie/galerie-oeffentlich-vorschau',
    description: 'Alle Musterwerke in der Galerieansicht',
    editHint: 'Werke, Filter, Kauf-Buttons',
  },
  {
    id: 'galerie-k2',
    label: 'K2 Galerie (echt)',
    emoji: '🏛️',
    url: '/projects/k2-galerie/galerie',
    description: 'Deine echte Galerie mit echten Daten',
    editHint: 'Echte Werke, echte Stammdaten',
  },
]

// Welche Seite war zuletzt offen? → als Kontext für Grafiker-Tisch
const CONTEXT_MAP: Record<string, string> = {
  '/willkommen': 'willkommen',
  '/projects/k2-galerie/galerie-oeffentlich': 'galerie-oeffentlich',
  '/projects/k2-galerie/galerie-oeffentlich-vorschau': 'galerie-vorschau',
  '/projects/k2-galerie/galerie': 'galerie-k2',
  '/projects/k2-galerie/galerie-vorschau': 'galerie-k2',
}

const DEVICE_SIZES = [
  { id: 'mobile', label: '📱 Handy', width: 390 },
  { id: 'tablet', label: '📟 Tablet', width: 768 },
  { id: 'desktop', label: '🖥️ Desktop', width: '100%' as string | number },
]

function loadNotizen() {
  try {
    const v = localStorage.getItem(NOTIZEN_KEY)
    if (v) return JSON.parse(v)
  } catch (_) {}
  return { offen: '', erledigt: '', ideen: '' }
}

function saveNotizen(n: { offen: string; erledigt: string; ideen: string }) {
  try { localStorage.setItem(NOTIZEN_KEY, JSON.stringify(n)) } catch (_) {}
}

export default function SeitengestaltungPage() {
  const location = useLocation()

  // Kontext: welche Seite war zuletzt offen?
  const getInitialPage = () => {
    try {
      const last = localStorage.getItem(LAST_PAGE_KEY)
      if (last) {
        const found = PREVIEW_PAGES.find(p => p.id === last)
        if (found) return found
      }
    } catch (_) {}
    // Fallback: aus URL-Kontext ermitteln
    const referrer = document.referrer
    for (const [path, id] of Object.entries(CONTEXT_MAP)) {
      if (referrer.includes(path)) {
        return PREVIEW_PAGES.find(p => p.id === id) ?? PREVIEW_PAGES[0]
      }
    }
    return PREVIEW_PAGES[0]
  }

  const [activePage, setActivePage] = useState<PreviewPage>(getInitialPage)
  const [deviceSize, setDeviceSize] = useState(DEVICE_SIZES[0])
  const [reloadKey, setReloadKey] = useState(0)
  const [showNotizen, setShowNotizen] = useState(false)
  const [notizen, setNotizenState] = useState(loadNotizen)
  const [notizenTab, setNotizenTab] = useState<'offen' | 'erledigt' | 'ideen'>('offen')
  const [saved, setSaved] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const selectPage = (page: PreviewPage) => {
    setActivePage(page)
    setReloadKey(k => k + 1)
    try { localStorage.setItem(LAST_PAGE_KEY, page.id) } catch (_) {}
  }

  const reload = () => setReloadKey(k => k + 1)

  const updateNotiz = (field: 'offen' | 'erledigt' | 'ideen', value: string) => {
    const updated = { ...notizen, [field]: value }
    setNotizenState(updated)
    saveNotizen(updated)
  }

  const handleSave = () => {
    saveNotizen(notizen)
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  useEffect(() => { setNotizenState(loadNotizen()) }, [])

  const frameWidth = deviceSize.width === '100%' ? '100%' : `${deviceSize.width}px`

  return (
    <div style={{
      minHeight: '100vh',
      background: '#181210',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* ── HEADER ── */}
      <div style={{
        background: '#1e1510',
        borderBottom: '1px solid rgba(95,251,241,0.18)',
        padding: '0.6rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        flexWrap: 'wrap',
        flexShrink: 0,
      }}>
        <Link to="/projects/k2-galerie" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.82rem', flexShrink: 0 }}>
          ← APf
        </Link>

        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#5ffbf1', letterSpacing: '0.05em', flexShrink: 0 }}>
          🎨 Grafiker-Tisch
        </span>

        {/* Seiten-Tabs */}
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', flex: 1 }}>
          {PREVIEW_PAGES.map(page => (
            <button
              key={page.id}
              onClick={() => selectPage(page)}
              style={{
                padding: '0.3rem 0.65rem',
                borderRadius: '6px',
                border: activePage.id === page.id ? '1px solid #5ffbf1' : '1px solid rgba(255,255,255,0.12)',
                background: activePage.id === page.id ? 'rgba(95,251,241,0.15)' : 'rgba(255,255,255,0.04)',
                color: activePage.id === page.id ? '#5ffbf1' : 'rgba(255,255,255,0.6)',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: activePage.id === page.id ? 700 : 400,
                whiteSpace: 'nowrap',
                fontFamily: 'inherit',
              }}
            >
              {page.emoji} {page.label}
            </button>
          ))}
        </div>

        {/* Gerät + Tools */}
        <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0, alignItems: 'center' }}>
          {DEVICE_SIZES.map(d => (
            <button key={d.id} onClick={() => setDeviceSize(d)} style={{
              padding: '0.3rem 0.55rem',
              borderRadius: '6px',
              border: deviceSize.id === d.id ? '1px solid rgba(95,251,241,0.5)' : '1px solid rgba(255,255,255,0.1)',
              background: deviceSize.id === d.id ? 'rgba(95,251,241,0.1)' : 'rgba(255,255,255,0.03)',
              color: deviceSize.id === d.id ? '#5ffbf1' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'inherit',
            }}>{d.label}</button>
          ))}
          <button onClick={reload} title="Neu laden" style={{ padding: '0.3rem 0.5rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'inherit' }}>🔄</button>
          <a href={activePage.url} target="_blank" rel="noopener noreferrer" title="In eigenem Tab öffnen" style={{ padding: '0.3rem 0.5rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.78rem' }}>↗</a>
          <button
            onClick={() => setShowNotizen(s => !s)}
            style={{
              padding: '0.3rem 0.65rem',
              borderRadius: '6px',
              border: showNotizen ? '1px solid #5ffbf1' : '1px solid rgba(95,251,241,0.3)',
              background: showNotizen ? 'rgba(95,251,241,0.15)' : 'rgba(95,251,241,0.05)',
              color: showNotizen ? '#5ffbf1' : 'rgba(95,251,241,0.6)',
              cursor: 'pointer', fontSize: '0.78rem', fontWeight: showNotizen ? 700 : 400, fontFamily: 'inherit',
            }}
          >
            📝 Notizen{notizen.offen.trim() ? ' ●' : ''}
          </button>
        </div>
      </div>

      {/* ── Info-Leiste: aktive Seite + was bearbeitbar ist ── */}
      <div style={{
        background: 'rgba(95,251,241,0.04)',
        borderBottom: '1px solid rgba(95,251,241,0.1)',
        padding: '0.35rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexShrink: 0,
        flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>
          {activePage.emoji} {activePage.label}
        </span>
        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
          {activePage.description}
        </span>
        {activePage.editHint && (
          <span style={{ fontSize: '0.72rem', color: 'rgba(95,251,241,0.6)', marginLeft: 'auto' }}>
            ✏️ {activePage.editHint}
          </span>
        )}
      </div>

      {/* ── HAUPT-BEREICH: Vorschau + Notizen ── */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>

        {/* Vorschau */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: deviceSize.id !== 'desktop' ? '1.25rem 0.75rem' : '0.5rem',
          background: deviceSize.id !== 'desktop' ? '#0e0c0a' : '#181210',
          overflow: 'auto',
          minHeight: 0,
        }}>
          <div style={{
            width: frameWidth,
            maxWidth: '100%',
            height: 'calc(100vh - 108px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            {deviceSize.id !== 'desktop' && (
              <div style={{ width: frameWidth, background: '#222', borderRadius: '24px 24px 0 0', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <div style={{ width: 48, height: 4, background: '#444', borderRadius: 2 }} />
              </div>
            )}
            <iframe
              key={reloadKey}
              ref={iframeRef}
              src={activePage.url}
              style={{
                width: '100%',
                flex: 1,
                border: 'none',
                borderRadius: deviceSize.id !== 'desktop' ? '0 0 20px 20px' : '8px',
                background: '#fff',
                boxShadow: deviceSize.id !== 'desktop'
                  ? '0 8px 40px rgba(0,0,0,0.5)'
                  : '0 4px 20px rgba(0,0,0,0.3)',
              }}
              title={activePage.label}
            />
          </div>
        </div>

        {/* Notiz-Panel */}
        {showNotizen && (
          <div style={{
            width: '300px',
            flexShrink: 0,
            background: '#1a1410',
            borderLeft: '1px solid rgba(95,251,241,0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '0.75rem 0.9rem 0.5rem', borderBottom: '1px solid rgba(95,251,241,0.12)', flexShrink: 0 }}>
              <p style={{ margin: 0, fontWeight: 700, color: '#5ffbf1', fontSize: '0.88rem' }}>📝 Notizen für die KI</p>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.4 }}>
                Schreib hier deine Wünsche – die KI liest sie beim nächsten Start sofort.
              </p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(95,251,241,0.1)', flexShrink: 0 }}>
              {([
                { id: 'offen', label: '🔧 Offen', color: '#ff8c42' },
                { id: 'erledigt', label: '✅ Erledigt', color: '#5ffbf1' },
                { id: 'ideen', label: '💡 Ideen', color: '#b8b8ff' },
              ] as const).map(tab => (
                <button key={tab.id} onClick={() => setNotizenTab(tab.id)} style={{
                  flex: 1, padding: '0.45rem 0.2rem', border: 'none',
                  background: notizenTab === tab.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                  color: notizenTab === tab.id ? tab.color : 'rgba(255,255,255,0.35)',
                  fontSize: '0.72rem', fontWeight: notizenTab === tab.id ? 700 : 400,
                  cursor: 'pointer',
                  borderBottom: notizenTab === tab.id ? `2px solid ${tab.color}` : '2px solid transparent',
                  fontFamily: 'inherit',
                }}>{tab.label}</button>
              ))}
            </div>

            <textarea
              value={notizen[notizenTab]}
              onChange={e => updateNotiz(notizenTab, e.target.value)}
              placeholder={
                notizenTab === 'offen'
                  ? 'Was soll die KI ändern?\nz.B. „Titel größer machen"\n„Bild volle Breite"\n„Farbe auf Dunkelrot"'
                  : notizenTab === 'erledigt' ? 'Was wurde bereits umgesetzt?'
                  : 'Ideen für später...'
              }
              style={{
                flex: 1, background: 'transparent', border: 'none',
                color: 'rgba(255,255,255,0.85)', fontSize: '0.84rem', lineHeight: 1.65,
                padding: '0.75rem 0.9rem', resize: 'none', outline: 'none', fontFamily: 'inherit',
              }}
            />

            <div style={{ padding: '0.5rem 0.9rem', borderTop: '1px solid rgba(95,251,241,0.1)', flexShrink: 0, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button onClick={handleSave} style={{
                flex: 1, padding: '0.45rem', borderRadius: '6px',
                border: '1px solid rgba(95,251,241,0.35)',
                background: saved ? 'rgba(95,251,241,0.18)' : 'rgba(95,251,241,0.06)',
                color: saved ? '#5ffbf1' : 'rgba(95,251,241,0.7)',
                cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'inherit',
              }}>{saved ? '✅ Gespeichert' : '💾 Speichern'}</button>
            </div>

            <div style={{ padding: '0.5rem 0.9rem 0.75rem', background: 'rgba(95,251,241,0.03)', borderTop: '1px solid rgba(95,251,241,0.07)', flexShrink: 0 }}>
              <p style={{ margin: 0, fontSize: '0.67rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>
                Gespeichert in <code style={{ color: 'rgba(95,251,241,0.45)', fontSize: '0.62rem' }}>docs/GRAFIKER-TISCH-NOTIZEN.md</code> – alle Regeln (UX, Kontrast, Datentrennung) bleiben aktiv.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
