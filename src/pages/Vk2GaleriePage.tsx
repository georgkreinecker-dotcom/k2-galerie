import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import QRCode from 'qrcode'
import { PROJECT_ROUTES } from '../config/navigation'
import { initVk2DemoStammdatenIfEmpty, type Vk2Stammdaten } from '../config/tenantConfig'
import { getPageTexts } from '../config/pageTexts'
import { loadEvents } from '../utils/eventsStorage'
import { loadDocuments } from '../utils/documentsStorage'
import { getPageContentGalerie } from '../config/pageContentGalerie'
import { BUILD_LABEL } from '../buildInfo.generated'
import { buildQrUrlWithBust, useQrVersionTimestamp } from '../hooks/useServerBuildTimestamp'
import '../App.css'

// Lädt VK2-Stammdaten aus localStorage – NUR eigener Key, keine K2/ök2-Daten
function loadVk2Stammdaten(): Vk2Stammdaten | null {
  try {
    initVk2DemoStammdatenIfEmpty()
    const raw = localStorage.getItem('k2-vk2-stammdaten')
    if (!raw) return null
    return JSON.parse(raw) as Vk2Stammdaten
  } catch {
    return null
  }
}

// Lädt VK2-Seitentexte – NUR eigener Key
function loadVk2PageTexts() {
  return getPageTexts('vk2').galerie
}

// Lädt VK2-Seiteninhalt (Foto) – NUR eigener Key
function loadVk2PageContent() {
  return getPageContentGalerie('vk2')
}

// Lädt VK2-Events – NUR eigener Key (Phase 1.4: über Schicht)
function loadVk2Events(): any[] {
  return loadEvents('vk2')
}

// Lädt VK2-Dokumente – NUR eigener Key (für Flyer pro Event) (Phase 1.4: über Schicht)
function loadVk2Documents(): any[] {
  return loadDocuments('vk2')
}

/** Flyer-Dokument für ein Event finden (werbematerialTyp flyer oder Name enthält Flyer/Einladung) */
function getFlyerDocForEvent(docs: any[], eventId: string): any | null {
  const flyer = docs.find((d: any) => d.category === 'pr-dokumente' && d.eventId === eventId && (d.werbematerialTyp === 'flyer' || (d.name && (String(d.name).toLowerCase().includes('flyer') || String(d.name).toLowerCase().includes('einladung')))))
  return flyer || null
}

/** HTML aus gespeichertem fileData (data:text/html;base64,...) decodieren */
function decodeDocHtml(doc: any): string | null {
  const fd = doc?.fileData || doc?.data
  if (!fd || typeof fd !== 'string' || !fd.startsWith('data:')) return null
  const base64 = fd.replace(/^data:[^;]+;base64,/, '')
  if (base64 === fd) return null
  try {
    return decodeURIComponent(escape(atob(base64)))
  } catch {
    try {
      return new TextDecoder('utf-8').decode(Uint8Array.from(atob(base64), c => c.charCodeAt(0)))
    } catch {
      return null
    }
  }
}

/** Minimaler VK2-Flyer-HTML wenn kein gespeichertes Dokument (z. B. Demo) */
function buildMinimalVk2FlyerHtml(ev: any, stammdaten: Vk2Stammdaten | null): string {
  const title = ev?.title || 'Vernissage'
  const dateStr = ev?.date ? formatDate(ev.date) : ''
  const location = ev?.location || stammdaten?.verein?.address || ''
  const vName = stammdaten?.verein?.name || 'Kunstverein'
  const esc = (s: string) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Flyer – ${esc(title)}</title><style>body{font-family:system-ui,sans-serif;max-width:600px;margin:2rem auto;padding:1.5rem;color:#1c1a18;line-height:1.6}.title{font-size:1.5rem;text-align:center;margin-bottom:0.5rem}.sub{text-align:center;color:#5c5650;margin-bottom:1rem}.meta{text-align:center;font-size:0.9rem;color:#5c5650}</style></head><body><p class="title">${esc(title)}</p><p class="sub">${esc(vName)}</p><p class="meta">${esc(dateStr)}${location ? ' · ' + esc(location) : ''}</p><p style="margin-top:1.5rem;">Wir freuen uns auf Ihren Besuch.</p><p class="meta" style="margin-top:2rem;">${stammdaten?.verein?.email ? esc(stammdaten.verein.email) : ''}</p></body></html>`
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return dateStr
  }
}

const VK2_VERCEL_BASE = 'https://k2-galerie.vercel.app'

const Vk2GaleriePage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [stammdaten, setStammdaten] = useState<Vk2Stammdaten | null>(() => loadVk2Stammdaten())
  const [pageTexts, setPageTexts] = useState(() => loadVk2PageTexts())
  const [pageContent, setPageContent] = useState(() => loadVk2PageContent())
  const [events, setEvents] = useState<any[]>(() => loadVk2Events())
  const [documents, setDocuments] = useState<any[]>(() => loadVk2Documents())
  const [flyerViewer, setFlyerViewer] = useState<{ html: string; title: string } | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const { versionTimestamp: qrVersionTs } = useQrVersionTimestamp()

  // Neu laden wenn localStorage sich ändert (z.B. nach Admin-Speicherung)
  useEffect(() => {
    const reload = () => {
      setStammdaten(loadVk2Stammdaten())
      setPageTexts(loadVk2PageTexts())
      setPageContent(loadVk2PageContent())
      setEvents(loadVk2Events())
      setDocuments(loadVk2Documents())
    }
    window.addEventListener('storage', reload)
    window.addEventListener('vk2-stammdaten-updated', reload)
    window.addEventListener('page-texts-updated', reload)
    return () => {
      window.removeEventListener('storage', reload)
      window.removeEventListener('vk2-stammdaten-updated', reload)
      window.removeEventListener('page-texts-updated', reload)
    }
  }, [])

  // QR-Code auf Mitglieder-Seite (Vercel, mit Cache-Bust)
  useEffect(() => {
    let cancelled = false
    const mitgliederUrl = VK2_VERCEL_BASE + PROJECT_ROUTES.vk2.galerieVorschau
    const qrUrl = buildQrUrlWithBust(mitgliederUrl, qrVersionTs)
    QRCode.toDataURL(qrUrl, { width: 120, margin: 1 })
      .then((url) => { if (!cancelled) setQrDataUrl(url) })
      .catch(() => { if (!cancelled) setQrDataUrl('') })
    return () => { cancelled = true }
  }, [qrVersionTs])

  // Titel: aus Seitentexten → Vereinsname → Fallback
  const vereinsName = stammdaten?.verein?.name || 'Vereinsplattform'
  const heroTitle = pageTexts.heroTitle?.trim() || vereinsName
  const subtext = pageTexts.welcomeSubtext?.trim() || stammdaten?.verein?.name || 'Kunstverein'
  const introText = pageTexts.welcomeIntroText?.trim() || 'Die Mitglieder unseres Vereins – Künstler:innen mit Leidenschaft und Können.'
  const eventHeading = pageTexts.eventSectionHeading?.trim() || 'Vereinstermine & Events'
  const welcomeImage = pageContent.welcomeImage || ''

  // Events: nur zukünftige
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const upcomingEvents = events.filter(ev => {
    if (!ev.date) return false
    try { return new Date(ev.date) >= today } catch { return false }
  }).slice(0, 3)

  // Flyer eines Events anzeigen (gespeichertes HTML oder minimal generiert)
  const openEventFlyer = (ev: any) => {
    const flyerDoc = getFlyerDocForEvent(documents, ev.id)
    const decoded = flyerDoc ? decodeDocHtml(flyerDoc) : null
    const html = decoded || buildMinimalVk2FlyerHtml(ev, stammdaten)
    const title = flyerDoc?.name || `Flyer – ${ev?.title || 'Event'}`
    setFlyerViewer({ html, title })
  }

  // Farben – warmes helles Design
  const C = {
    bg: '#faf8f5',
    bgCard: '#ffffff',
    text: '#1c1a18',
    textMid: '#5c5650',
    textLight: '#9a928a',
    accent: '#c0562a',
    accentHover: '#a04520',
    accentSoft: '#f0e8e2',
    gold: '#a07828',
    goldBg: '#fdf6e8',
    border: '#e8e2da',
    heroOverlay: 'linear-gradient(to bottom, rgba(0,0,0,0.0) 0%, rgba(20,12,8,0.65) 70%, rgba(20,12,8,0.95) 100%)',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      color: C.text,
      fontFamily: '"Georgia", "Times New Roman", serif',
      position: 'relative',
      overflowX: 'hidden',
    }}>

      {/* ── NAV-LEISTE ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.6rem 1.5rem',
        background: 'rgba(250,248,245,0.97)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${C.border}`,
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
      }}>
        <button
          onClick={() => navigate('/')}
          style={{ background: C.accent, color: '#fff', border: 'none', borderRadius: 8, padding: '0.3rem 0.75rem', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', letterSpacing: '0.04em' }}
        >
          APf
        </button>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: C.textMid, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: 'system-ui, sans-serif' }}>
          {vereinsName}
        </span>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={() => navigate(PROJECT_ROUTES.vk2.mitgliedLogin)}
            style={{ background: '#f0f4ff', color: '#3b5bdb', border: '1px solid #c5d0fa', borderRadius: 8, padding: '0.28rem 0.7rem', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600, fontFamily: 'system-ui, sans-serif' }}
            title="Mitglied-Login"
          >
            🔑 Mitglied
          </button>
          <button
            onClick={() => navigate('/admin?context=vk2')}
            style={{ background: 'transparent', color: C.textLight, border: `1px solid ${C.border}`, borderRadius: 8, padding: '0.28rem 0.7rem', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'system-ui, sans-serif' }}
          >
            Admin
          </button>
        </div>
      </nav>

      {/* ── VORSCHAU-BANNER ── */}
      {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('vorschau') === '1' && (
        <div style={{ background: C.accent, color: '#fff', padding: '0.5rem 1.5rem', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between', fontFamily: 'system-ui, sans-serif' }}>
          <button
            onClick={() => {
              const s = location.state as { fromAdminTab?: string } | null
              const backUrl = '/admin?context=vk2' + (s?.fromAdminTab ? '&tab=' + s.fromAdminTab : '')
              navigate(backUrl)
            }}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 6, padding: '0.28rem 0.8rem', color: '#fff', cursor: 'pointer', fontSize: '0.84rem' }}
          >
            ← Zurück zu Einstellungen
          </button>
          <span>Vorschau – hier siehst du deine gespeicherten Änderungen</span>
          <span style={{ opacity: 0 }}>–</span>
        </div>
      )}

      {/* ── HERO: Foto mit Titel-Overlay ── */}
      <div style={{ position: 'relative', width: '100%', height: 'clamp(320px, 52vh, 540px)', overflow: 'hidden' }}>
        {welcomeImage ? (
          <img src={welcomeImage} alt={heroTitle} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #c8b89a 0%, #a89278 50%, #887258 100%)' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: C.heroOverlay }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 'clamp(1.5rem, 4vw, 2.5rem) clamp(1.5rem, 5vw, 3rem)' }}>
          <p style={{ margin: '0 0 0.35rem', fontSize: '0.78rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,230,180,0.85)', fontWeight: 600, fontFamily: 'system-ui, sans-serif' }}>
            {subtext}
          </p>
          <h1 style={{ margin: 0, fontSize: 'clamp(2rem, 6vw, 3.8rem)', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.08, textShadow: '0 2px 16px rgba(0,0,0,0.4)' }}>
            {heroTitle}
          </h1>
        </div>
      </div>

      {/* ── EINGANGSKARTEN ── */}
      <div style={{ padding: '1.75rem clamp(1.25rem, 5vw, 3rem)', background: C.bg }}>
        <Vk2Eingangskarten />
      </div>

      {/* ── TRENNLINIE ── */}
      <div style={{ height: 1, background: C.border, margin: '0 clamp(1.25rem, 5vw, 3rem)' }} />

      {/* ── INTRO + BUTTONS ── */}
      <div style={{ padding: '2rem clamp(1.25rem, 5vw, 3rem)', maxWidth: 720 }}>
        <p style={{ margin: '0 0 1.75rem', color: C.textMid, fontSize: '1.05rem', lineHeight: 1.75, fontWeight: 400 }}>
          {introText}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link
            to={PROJECT_ROUTES.vk2.galerieVorschau}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
              padding: '0.85rem 1.9rem',
              background: C.accent,
              color: '#fff', textDecoration: 'none', borderRadius: 10,
              fontSize: '0.95rem', fontWeight: 700, fontFamily: 'system-ui, sans-serif',
              boxShadow: '0 3px 14px rgba(192,86,42,0.28)',
              letterSpacing: '0.01em',
            }}
          >
            👥 {pageTexts.kunstschaffendeHeading?.trim() || 'Unsere Mitglieder'} ansehen →
          </Link>
          <Link
            to={PROJECT_ROUTES.vk2.katalog}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
              padding: '0.85rem 1.9rem',
              background: C.goldBg,
              border: `1.5px solid ${C.gold}`,
              color: C.gold, textDecoration: 'none', borderRadius: 10,
              fontSize: '0.95rem', fontWeight: 700, fontFamily: 'system-ui, sans-serif',
              letterSpacing: '0.01em',
            }}
          >
            🏆 Vereinskatalog →
          </Link>
        </div>
      </div>

      {/* ── EVENTS ── */}
      {upcomingEvents.length > 0 && (
        <div style={{ padding: '0 clamp(1.25rem, 5vw, 3rem) 2rem', maxWidth: 720 }}>
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: '1.25rem 1.5rem', borderLeft: `4px solid ${C.accent}`, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: C.textLight, fontWeight: 700, fontFamily: 'system-ui, sans-serif' }}>
              {eventHeading}
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', color: C.text, fontSize: '0.95rem', lineHeight: 1.7, fontFamily: 'system-ui, sans-serif' }}>
              {upcomingEvents.map((ev: any) => (
                <li key={ev.id || ev.date} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <strong>{ev.title}</strong>
                  {ev.date && <span style={{ color: C.textMid, fontWeight: 400 }}> – {formatDate(ev.date)}</span>}
                  <button
                    type="button"
                    onClick={() => openEventFlyer(ev)}
                    title="Flyer anzeigen"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 28,
                      height: 28,
                      padding: 0,
                      border: `1px solid ${C.border}`,
                      borderRadius: 6,
                      background: C.bgCard,
                      color: C.accent,
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                    }}
                  >
                    📄
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer style={{ marginTop: '3rem', padding: '2rem clamp(1.25rem, 5vw, 3rem) 2.5rem', borderTop: `1px solid ${C.border}`, background: '#f2ede6', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', maxWidth: 860 }}>

          {/* Verein */}
          <div style={{ minWidth: 200 }}>
            <p style={{ margin: '0 0 0.15rem', fontWeight: 700, color: C.text, fontSize: '0.92rem' }}>
              {stammdaten?.verein?.name || 'Verein'}
            </p>
            {stammdaten?.verein?.vereinsnummer && (
              <p style={{ margin: '0 0 0.1rem', color: C.textMid, fontSize: '0.82rem' }}>ZVR: {stammdaten.verein.vereinsnummer}</p>
            )}
            {(stammdaten?.verein?.address || stammdaten?.verein?.city) && (
              <p style={{ margin: '0 0 0.1rem', color: C.textMid, fontSize: '0.82rem' }}>
                {[stammdaten.verein.address, stammdaten.verein.city].filter(Boolean).join(', ')}
              </p>
            )}
            {stammdaten?.verein?.email && (
              <p style={{ margin: '0 0 0.1rem', fontSize: '0.82rem' }}>
                <a href={`mailto:${stammdaten.verein.email}`} style={{ color: C.accent, textDecoration: 'none' }}>{stammdaten.verein.email}</a>
              </p>
            )}
          </div>

          {/* Vorstand */}
          {stammdaten?.vorstand?.name && (
            <div style={{ minWidth: 160 }}>
              <p style={{ margin: '0 0 0.35rem', fontWeight: 700, color: C.text, fontSize: '0.82rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Vorstand</p>
              <p style={{ margin: '0 0 0.1rem', color: C.textMid, fontSize: '0.82rem' }}>{stammdaten.vorstand.name}</p>
              {stammdaten.vize?.name && <p style={{ margin: '0 0 0.1rem', color: C.textMid, fontSize: '0.82rem' }}>{stammdaten.vize.name}</p>}
            </div>
          )}

          {/* Kommunikation */}
          {(stammdaten?.kommunikation?.whatsappGruppeLink || stammdaten?.kommunikation?.vorstandTelefon) && (
            <div>
              <p style={{ margin: '0 0 0.5rem', fontWeight: 700, color: C.text, fontSize: '0.82rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Kontakt</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {stammdaten?.kommunikation?.whatsappGruppeLink && (
                  <a href={stammdaten.kommunikation.whatsappGruppeLink} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.9rem', background: '#25d366', borderRadius: 20, color: '#fff', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>
                    💬 WhatsApp-Gruppe
                  </a>
                )}
                {stammdaten?.kommunikation?.vorstandTelefon && (
                  <a href={`https://wa.me/${stammdaten.kommunikation.vorstandTelefon}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.9rem', background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.35)', borderRadius: 20, color: '#1a7a3c', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}>
                    📩 Vorstand schreiben
                  </a>
                )}
              </div>
            </div>
          )}

          {/* QR-Code */}
          {qrDataUrl && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <img src={qrDataUrl} alt="QR" style={{ width: 72, height: 72, borderRadius: 6, background: '#fff', padding: 3, boxShadow: '0 1px 6px rgba(0,0,0,0.1)' }} />
              <p style={{ margin: 0, color: C.textLight, fontSize: '0.78rem', maxWidth: 100, lineHeight: 1.4 }}>Mitglieder direkt aufrufen</p>
            </div>
          )}
        </div>

        {/* Umfragen */}
        {(stammdaten?.kommunikation?.umfragen || []).filter(u => u.aktiv && u.frage.trim()).length > 0 && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: 600 }}>
            {(stammdaten?.kommunikation?.umfragen || []).filter(u => u.aktiv && u.frage.trim()).map(umfrage => {
              const waText = `📊 *${umfrage.frage}*\n\n${umfrage.antworten.map((a, i) => `${['1️⃣','2️⃣','3️⃣','4️⃣'][i] || (i+1)+'.'}  ${a}`).join('\n')}\n\nBitte abstimmen!`
              return (
                <div key={umfrage.id} style={{ padding: '0.6rem 0.9rem', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: C.text, marginBottom: '0.15rem' }}>📊 {umfrage.frage}</div>
                    <div style={{ fontSize: '0.75rem', color: C.textLight }}>{umfrage.antworten.join(' · ')}</div>
                  </div>
                  <a href={`https://wa.me/?text=${encodeURIComponent(waText)}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.8rem', background: '#25d366', borderRadius: 18, color: '#fff', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', flexShrink: 0 }}>
                    Abstimmen ↗
                  </a>
                </div>
              )
            })}
          </div>
        )}

        {/* Copyright */}
        <p style={{ margin: '1.5rem 0 0', color: C.textLight, fontSize: '0.75rem' }}>
          © {new Date().getFullYear()} {stammdaten?.verein?.name || 'Vereinsplattform'} · Powered by K2 Galerie
        </p>
      </footer>

      {/* Flyer-Modal: Event-Flyer anzeigen */}
      {flyerViewer && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            justifyContent: 'stretch',
          }}
          onClick={() => setFlyerViewer(null)}
        >
          <div style={{ position: 'sticky', top: 0, left: 0, right: 0, padding: '0.5rem 1rem', background: C.bgCard, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: C.text }}>{flyerViewer.title}</span>
            <button type="button" onClick={() => setFlyerViewer(null)} style={{ padding: '0.35rem 0.8rem', background: C.accent, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Schließen</button>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '1rem', display: 'flex', justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
            <iframe title={flyerViewer.title} srcDoc={flyerViewer.html} style={{ width: '100%', maxWidth: 640, minHeight: 480, border: 'none', background: '#fff', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }} />
          </div>
        </div>
      )}

      {/* Stand-Badge – im iframe (Cursor Preview) kein Reload */}
      <div
        style={{ position: 'fixed', bottom: 8, left: 8, fontSize: '0.65rem', color: 'rgba(0,0,0,0.25)', cursor: 'pointer', zIndex: 50, fontFamily: 'system-ui, sans-serif' }}
        onClick={() => { if (typeof window !== 'undefined' && window.self !== window.top) return; window.location.href = window.location.href.split('?')[0] + '?v=' + Date.now() }}
        title="Tippen für Cache-Bypass"
      >
        Stand: {BUILD_LABEL}
      </div>
    </div>
  )
}

// ─── Eingangskarten ─────────────────────────────────────────────────────────

const VK2_KARTEN_KEY = 'k2-vk2-eingangskarten'

interface EingangskarteData {
  titel: string
  untertitel: string
  imageUrl: string
}

const DEFAULT_KARTEN: EingangskarteData[] = [
  {
    titel: 'Unsere Galerie',
    untertitel: 'Werke, Ausstellungen & Events – entdecke unseren Verein',
    imageUrl: '',
  },
  {
    titel: 'Mitglieder & Künstler:innen',
    untertitel: 'Leidenschaft, Können und Kreativität – lerne uns kennen',
    imageUrl: '',
  },
]

function loadEingangskarten(): EingangskarteData[] {
  try {
    const raw = localStorage.getItem(VK2_KARTEN_KEY)
    if (!raw) return DEFAULT_KARTEN
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length >= 2) return parsed
  } catch { /* ignore */ }
  return DEFAULT_KARTEN
}

function Vk2Eingangskarten() {
  const [karten, setKarten] = React.useState<EingangskarteData[]>(loadEingangskarten)

  React.useEffect(() => {
    const reload = () => setKarten(loadEingangskarten())
    window.addEventListener('storage', reload)
    window.addEventListener('vk2-karten-updated', reload)
    return () => {
      window.removeEventListener('storage', reload)
      window.removeEventListener('vk2-karten-updated', reload)
    }
  }, [])

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1rem',
    }}>
      {karten.map((k, i) => (
        <EingangsKarte key={i} data={k} index={i} />
      ))}
    </div>
  )
}

function EingangsKarte({ data, index }: { data: EingangskarteData; index: number }) {
  const dummyGradients = [
    'linear-gradient(135deg, #e8d5c4 0%, #c8a888 100%)',
    'linear-gradient(135deg, #d8e4d0 0%, #a8c498 100%)',
  ]
  const dummyIcons = ['🖼️', '👥']
  const hasBild = !!data.imageUrl

  return (
    <div style={{
      position: 'relative',
      borderRadius: 14,
      overflow: 'hidden',
      aspectRatio: '4/3',
      minHeight: 160,
      background: hasBild ? '#e8e2da' : dummyGradients[index % 2],
      border: '1px solid #e0d8cf',
      boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
      cursor: 'pointer',
    }}>
      {/* Bild */}
      {hasBild && (
        <img
          src={data.imageUrl}
          alt={data.titel}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}

      {/* Platzhalter wenn kein Bild */}
      {!hasBild && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 'clamp(2.5rem, 7vw, 4rem)', opacity: 0.35 }}>{dummyIcons[index % 2]}</span>
        </div>
      )}

      {/* Gradient-Overlay von unten */}
      <div style={{
        position: 'absolute', inset: 0,
        background: hasBild
          ? 'linear-gradient(to top, rgba(20,12,8,0.82) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)'
          : 'linear-gradient(to top, rgba(20,12,8,0.65) 0%, transparent 70%)',
      }} />

      {/* Text unten */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0.85rem 1rem' }}>
        <div style={{ fontWeight: 700, fontSize: 'clamp(0.88rem, 2.5vw, 1rem)', color: '#fff', lineHeight: 1.2, marginBottom: '0.18rem', fontFamily: 'system-ui, sans-serif', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
          {data.titel}
        </div>
        <div style={{ fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)', color: 'rgba(255,255,255,0.78)', lineHeight: 1.4, fontFamily: 'system-ui, sans-serif' }}>
          {data.untertitel}
        </div>
      </div>

      {/* Bearbeiten-Hinweis (nur im Admin) */}
      {typeof window !== 'undefined' && (window.location.search.includes('vorschau=1') || window.location.pathname.includes('admin')) && (
        <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(192,86,42,0.85)', borderRadius: 6, padding: '0.15rem 0.45rem', fontSize: '0.68rem', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
          ✏️ editierbar
        </div>
      )}
    </div>
  )
}

export default Vk2GaleriePage
