/**
 * Seitengestaltung – Live-Vorschau Tool in der APf
 * Georg sieht seine Galerie-Seite live und kann Änderungen direkt besprechen.
 */

import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'

const NOTIZEN_KEY = 'k2-grafiker-tisch-notizen'

function loadNotizen(): { offen: string; erledigt: string; ideen: string } {
  try {
    const v = localStorage.getItem(NOTIZEN_KEY)
    if (v) return JSON.parse(v)
  } catch (_) {}
  return { offen: '', erledigt: '', ideen: '' }
}

function saveNotizen(n: { offen: string; erledigt: string; ideen: string }) {
  try { localStorage.setItem(NOTIZEN_KEY, JSON.stringify(n)) } catch (_) {}
}

type PreviewPage = {
  id: string
  label: string
  emoji: string
  url: string
  description: string
}

const PREVIEW_PAGES: PreviewPage[] = [
  {
    id: 'galerie-oeffentlich',
    label: 'Galerie ök2 (öffentlich)',
    emoji: '🖼️',
    url: '/projects/k2-galerie/galerie-oeffentlich',
    description: 'Die Seite die Besucher sehen wenn sie den QR-Code scannen',
  },
  {
    id: 'galerie-vorschau',
    label: 'Werke-Vorschau ök2',
    emoji: '🎨',
    url: '/projects/k2-galerie/galerie-oeffentlich-vorschau',
    description: 'Alle Werke in der Galerieansicht',
  },
  {
    id: 'galerie-k2',
    label: 'K2 Galerie (echt)',
    emoji: '🏛️',
    url: '/projects/k2-galerie/galerie',
    description: 'Deine echte Galerie-Seite mit echten Daten',
  },
  {
    id: 'willkommen',
    label: 'Willkommensseite',
    emoji: '👋',
    url: '/willkommen',
    description: 'Einstiegsseite für neue Besucher (Variante wählbar)',
  },
  {
    id: 'willkommen-a',
    label: 'Willkommen Variante A',
    emoji: '🌿',
    url: '/willkommen?variant=a',
    description: 'Warm & einladend – Atelier-Stil',
  },
]

const DEVICE_SIZES = [
  { id: 'mobile', label: '📱 Handy', width: 390 },
  { id: 'tablet', label: '📟 Tablet', width: 768 },
  { id: 'desktop', label: '🖥️ Desktop', width: '100%' as string | number },
]

export default function SeitengestaltungPage() {
  const [activePage, setActivePage] = useState(PREVIEW_PAGES[0])
  const [deviceSize, setDeviceSize] = useState(DEVICE_SIZES[0])
  const [reloadKey, setReloadKey] = useState(0)
  const [showNotizen, setShowNotizen] = useState(false)
  const [notizen, setNotizenState] = useState(loadNotizen)
  const [notizenTab, setNotizenTab] = useState<'offen' | 'erledigt' | 'ideen'>('offen')
  const [saved, setSaved] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

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

  // Beim Laden: Notizen aus localStorage holen
  useEffect(() => {
    setNotizenState(loadNotizen())
  }, [])

  const frameWidth = deviceSize.width === '100%' ? '100%' : `${deviceSize.width}px`
  const frameStyle: React.CSSProperties = {
    width: frameWidth,
    height: '100%',
    border: 'none',
    borderRadius: deviceSize.id !== 'desktop' ? '24px' : '8px',
    background: '#fff',
    boxShadow: deviceSize.id !== 'desktop'
      ? '0 8px 40px rgba(0,0,0,0.45), inset 0 0 0 2px rgba(255,255,255,0.08)'
      : '0 4px 24px rgba(0,0,0,0.3)',
    transition: 'width 0.35s ease',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1a1410',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        background: '#231a14',
        borderBottom: '1px solid rgba(255,140,66,0.2)',
        padding: '0.75rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
        flexShrink: 0,
      }}>
        <Link to="/projects/k2-galerie" style={{
          color: 'rgba(255,255,255,0.5)',
          textDecoration: 'none',
          fontSize: '0.85rem',
          flexShrink: 0,
        }}>← APf</Link>

        <span style={{
          fontWeight: 700,
          fontSize: '1rem',
          color: '#ff8c42',
          letterSpacing: '0.04em',
          flexShrink: 0,
        }}>🎨 Seitengestaltung</span>

        {/* Seiten-Auswahl */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', flex: 1 }}>
          {PREVIEW_PAGES.map(page => (
            <button
              key={page.id}
              onClick={() => { setActivePage(page); reload() }}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                border: activePage.id === page.id
                  ? '1px solid #ff8c42'
                  : '1px solid rgba(255,255,255,0.15)',
                background: activePage.id === page.id
                  ? 'rgba(255,140,66,0.18)'
                  : 'rgba(255,255,255,0.05)',
                color: activePage.id === page.id ? '#ff8c42' : 'rgba(255,255,255,0.75)',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontWeight: activePage.id === page.id ? 600 : 400,
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
            >
              {page.emoji} {page.label}
            </button>
          ))}
        </div>

        {/* Gerät-Auswahl */}
        <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
          {DEVICE_SIZES.map(d => (
            <button
              key={d.id}
              onClick={() => setDeviceSize(d)}
              style={{
                padding: '0.35rem 0.6rem',
                borderRadius: '6px',
                border: deviceSize.id === d.id
                  ? '1px solid rgba(95,251,241,0.6)'
                  : '1px solid rgba(255,255,255,0.12)',
                background: deviceSize.id === d.id
                  ? 'rgba(95,251,241,0.1)'
                  : 'rgba(255,255,255,0.04)',
                color: deviceSize.id === d.id ? '#5ffbf1' : 'rgba(255,255,255,0.6)',
                cursor: 'pointer',
                fontSize: '0.82rem',
                transition: 'all 0.15s',
              }}
            >
              {d.label}
            </button>
          ))}
          <button
            onClick={reload}
            title="Neu laden"
            style={{
              padding: '0.35rem 0.6rem',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.04)',
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              fontSize: '0.82rem',
            }}
          >🔄</button>
          <a
            href={activePage.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '0.35rem 0.6rem',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.04)',
              color: 'rgba(255,255,255,0.6)',
              textDecoration: 'none',
              fontSize: '0.82rem',
            }}
            title="In eigenem Tab öffnen"
          >↗️</a>

          {/* Notiz-Button */}
          <button
            onClick={() => setShowNotizen(s => !s)}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              border: showNotizen ? '1px solid #5ffbf1' : '1px solid rgba(95,251,241,0.35)',
              background: showNotizen ? 'rgba(95,251,241,0.15)' : 'rgba(95,251,241,0.05)',
              color: showNotizen ? '#5ffbf1' : 'rgba(95,251,241,0.7)',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: showNotizen ? 700 : 400,
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            📝 {showNotizen ? 'Notizen schließen' : 'Notizen'}
            {notizen.offen.trim() && (
              <span style={{
                marginLeft: '0.4rem',
                background: '#ff8c42',
                color: '#fff',
                borderRadius: '999px',
                padding: '0 0.35rem',
                fontSize: '0.7rem',
                fontWeight: 700,
              }}>!</span>
            )}
          </button>
        </div>
      </div>

      {/* Beschreibung der aktiven Seite */}
      <div style={{
        background: 'rgba(255,140,66,0.06)',
        borderBottom: '1px solid rgba(255,140,66,0.12)',
        padding: '0.4rem 1.25rem',
        fontSize: '0.8rem',
        color: 'rgba(255,255,255,0.5)',
        flexShrink: 0,
      }}>
        <strong style={{ color: 'rgba(255,255,255,0.8)' }}>{activePage.emoji} {activePage.label}</strong>
        {' – '}{activePage.description}
      </div>

      {/* Haupt-Layout: Vorschau + optional Notiz-Panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        minHeight: 0,
        overflow: 'hidden',
      }}>
        {/* Vorschau-Bereich */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: deviceSize.id !== 'desktop' ? '1.5rem 1rem' : '0.75rem',
          background: deviceSize.id !== 'desktop' ? '#111' : '#1a1410',
          overflow: 'hidden',
          minHeight: 0,
          transition: 'all 0.3s ease',
        }}>
          <div style={{
            width: frameWidth,
            maxWidth: '100%',
            height: 'calc(100vh - 120px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            {deviceSize.id !== 'desktop' && (
              <div style={{
                width: frameWidth,
                background: '#2a2a2a',
                borderRadius: '28px 28px 0 0',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div style={{ width: 60, height: 5, background: '#444', borderRadius: 3 }} />
              </div>
            )}
            <iframe
              key={reloadKey}
              ref={iframeRef}
              src={activePage.url}
              style={{
                ...frameStyle,
                flex: 1,
                borderRadius: deviceSize.id !== 'desktop' ? '0 0 24px 24px' : '8px',
              }}
              title={activePage.label}
            />
          </div>
        </div>

        {/* Notiz-Panel – rechts einblendbar */}
        {showNotizen && (
          <div style={{
            width: '320px',
            flexShrink: 0,
            background: '#1c1510',
            borderLeft: '1px solid rgba(95,251,241,0.2)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Panel-Header */}
            <div style={{
              padding: '0.85rem 1rem 0.6rem',
              borderBottom: '1px solid rgba(95,251,241,0.15)',
              flexShrink: 0,
            }}>
              <p style={{ margin: 0, fontWeight: 700, color: '#5ffbf1', fontSize: '0.95rem' }}>
                📝 Notizen für die KI
              </p>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>
                Schreib hier deine Wünsche – sie bleiben gespeichert und gehen nicht verloren.
              </p>
            </div>

            {/* Tabs */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid rgba(95,251,241,0.12)',
              flexShrink: 0,
            }}>
              {([
                { id: 'offen', label: '🔧 Offen', color: '#ff8c42' },
                { id: 'erledigt', label: '✅ Erledigt', color: '#5ffbf1' },
                { id: 'ideen', label: '💡 Ideen', color: '#b8b8ff' },
              ] as const).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setNotizenTab(tab.id)}
                  style={{
                    flex: 1,
                    padding: '0.5rem 0.25rem',
                    border: 'none',
                    background: notizenTab === tab.id ? 'rgba(255,255,255,0.06)' : 'transparent',
                    color: notizenTab === tab.id ? tab.color : 'rgba(255,255,255,0.4)',
                    fontSize: '0.78rem',
                    fontWeight: notizenTab === tab.id ? 700 : 400,
                    cursor: 'pointer',
                    borderBottom: notizenTab === tab.id ? `2px solid ${tab.color}` : '2px solid transparent',
                    transition: 'all 0.15s',
                    fontFamily: 'inherit',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Textarea */}
            <textarea
              value={notizen[notizenTab]}
              onChange={e => updateNotiz(notizenTab, e.target.value)}
              placeholder={
                notizenTab === 'offen'
                  ? 'Was soll die KI ändern?\nz.B. „Titel größer", „Bild volle Breite", „Farbe ändern auf Orange"'
                  : notizenTab === 'erledigt'
                  ? 'Was wurde bereits umgesetzt?'
                  : 'Ideen für später, Skizzen, Gedanken...'
              }
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.88)',
                fontSize: '0.88rem',
                lineHeight: 1.65,
                padding: '0.85rem 1rem',
                resize: 'none',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />

            {/* Footer */}
            <div style={{
              padding: '0.6rem 1rem',
              borderTop: '1px solid rgba(95,251,241,0.12)',
              flexShrink: 0,
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
            }}>
              <button
                onClick={handleSave}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(95,251,241,0.4)',
                  background: saved ? 'rgba(95,251,241,0.2)' : 'rgba(95,251,241,0.08)',
                  color: saved ? '#5ffbf1' : 'rgba(95,251,241,0.8)',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  transition: 'all 0.2s',
                }}
              >
                {saved ? '✅ Gespeichert' : '💾 Speichern'}
              </button>
              <p style={{
                margin: 0,
                fontSize: '0.7rem',
                color: 'rgba(255,255,255,0.3)',
                lineHeight: 1.3,
              }}>
                Auto-gespeichert beim Tippen
              </p>
            </div>

            {/* Hinweis für KI */}
            <div style={{
              padding: '0.6rem 1rem 0.85rem',
              background: 'rgba(95,251,241,0.04)',
              borderTop: '1px solid rgba(95,251,241,0.08)',
              flexShrink: 0,
            }}>
              <p style={{ margin: 0, fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
                💡 Die KI liest diese Notizen beim nächsten Chat automatisch aus{' '}
                <code style={{ color: 'rgba(95,251,241,0.5)', fontSize: '0.68rem' }}>
                  docs/GRAFIKER-TISCH-NOTIZEN.md
                </code>{' '}
                – alle Regeln (UX, Kontrast, Datentrennung) bleiben dabei aktiv.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
