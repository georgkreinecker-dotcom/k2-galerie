import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import { PROJECT_ROUTES } from '../config/navigation'
import { initVk2DemoStammdatenIfEmpty, type Vk2Stammdaten } from '../config/tenantConfig'
import { getPageTexts } from '../config/pageTexts'
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

// Lädt VK2-Events – NUR eigener Key
function loadVk2Events(): any[] {
  try {
    const raw = localStorage.getItem('k2-vk2-events')
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
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
  const [stammdaten, setStammdaten] = useState<Vk2Stammdaten | null>(() => loadVk2Stammdaten())
  const [pageTexts, setPageTexts] = useState(() => loadVk2PageTexts())
  const [pageContent, setPageContent] = useState(() => loadVk2PageContent())
  const [events, setEvents] = useState<any[]>(() => loadVk2Events())
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const qrVersionTs = useQrVersionTimestamp()

  // Neu laden wenn localStorage sich ändert (z.B. nach Admin-Speicherung)
  useEffect(() => {
    const reload = () => {
      setStammdaten(loadVk2Stammdaten())
      setPageTexts(loadVk2PageTexts())
      setPageContent(loadVk2PageContent())
      setEvents(loadVk2Events())
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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a0f0a 0%, #2d1a14 50%, #3d2419 100%)',
      color: '#fff5f0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      position: 'relative',
      overflowX: 'hidden',
      overflowY: 'visible'
    }}>
      {/* Obere Leiste: APf-Button + VK2-Badge + Admin */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.5rem 1rem',
        background: 'rgba(26,15,10,0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(255,140,66,0.2)'
      }}>
        <button
          onClick={() => navigate('/')}
          style={{ background: '#ff8c42', color: '#fff', border: 'none', borderRadius: 8, padding: '0.3rem 0.7rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
        >
          APf
        </button>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,140,66,0.8)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {heroTitle} – {pageTexts.kunstschaffendeHeading?.trim() || 'Unsere Mitglieder'}
        </span>
        <button
          onClick={() => navigate('/admin?context=vk2')}
          style={{ background: 'transparent', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6, padding: '0.25rem 0.6rem', fontSize: '0.78rem', cursor: 'pointer' }}
        >
          Admin
        </button>
      </div>

      {/* Vorschau-Banner (nur wenn ?vorschau=1) */}
      {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('vorschau') === '1' && (
        <div style={{ background: '#b54a1e', color: '#fff', padding: '0.5rem 1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between' }}>
          <button onClick={() => navigate('/admin?context=vk2')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 6, padding: '0.3rem 0.8rem', color: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}>
            ← Zurück zu Einstellungen
          </button>
          <span>Vorschau – hier siehst du deine gespeicherten Änderungen</span>
          <span style={{ opacity: 0 }}>–</span>
        </div>
      )}

      {/* Hauptinhalt */}
      <header style={{ padding: 'clamp(2rem, 6vw, 3.5rem) clamp(1.5rem, 4vw, 3rem)', maxWidth: '1200px', margin: '0 auto' }}>

        {/* Foto – vollständig anzeigen, nicht abschneiden */}
        {welcomeImage && (
          <div style={{ width: '100%', marginBottom: 'clamp(1.5rem, 4vw, 2.5rem)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
            <img src={welcomeImage} alt={heroTitle} style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
        )}

        {/* Titel + Subtext */}
        <h1 style={{ margin: 0, fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
          {heroTitle}
        </h1>
        <p style={{ margin: '0.5rem 0 0', color: 'rgba(255,255,255,0.75)', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', fontWeight: 400 }}>
          {subtext}
        </p>

        {/* Grid: Intro + Events */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: 'clamp(1.5rem, 4vw, 2.5rem)',
          alignItems: 'start',
          marginTop: 'clamp(1.5rem, 4vw, 2.5rem)'
        }}>
          {/* Intro + Button */}
          <div>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.88)', fontSize: 'clamp(1rem, 2.5vw, 1.15rem)', lineHeight: 1.6, fontWeight: 300 }}>
              {introText}
            </p>
            <Link
              to={PROJECT_ROUTES.vk2.galerieVorschau}
              style={{
                display: 'inline-block',
                marginTop: 'clamp(1.25rem, 3vw, 1.75rem)',
                padding: 'clamp(0.85rem, 2vw, 1rem) clamp(1.75rem, 4vw, 2.25rem)',
                background: 'linear-gradient(135deg, #ff8c42 0%, #e67a2a 100%)',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: 12,
                fontSize: 'clamp(1rem, 2.5vw, 1.1rem)',
                fontWeight: 600,
                boxShadow: '0 8px 24px rgba(255,140,66,0.4)'
              }}
            >
              {pageTexts.kunstschaffendeHeading?.trim() || 'Unsere Mitglieder'} ansehen →
            </Link>
          </div>

          {/* Events */}
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '1rem 1.25rem', borderLeft: '4px solid rgba(255,140,66,0.5)' }}>
            <p style={{ margin: '0 0 0.75rem', fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>
              {eventHeading}
            </p>
            {upcomingEvents.length === 0 ? (
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: 'clamp(0.95rem, 2vw, 1.05rem)' }}>
                Derzeit keine anstehenden Termine.
              </p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#fff', fontSize: 'clamp(0.95rem, 2vw, 1.05rem)', lineHeight: 1.6 }}>
                {upcomingEvents.map((ev: any) => (
                  <li key={ev.id || ev.date} style={{ marginBottom: '0.5rem' }}>
                    <strong>{ev.title}</strong>
                    {ev.date && <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 400 }}> — {formatDate(ev.date)}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </header>

      {/* Impressum */}
      <footer style={{ marginTop: 'clamp(3rem, 8vw, 5rem)', padding: 'clamp(1.5rem, 4vw, 2.5rem)', borderTop: '1px solid rgba(255,255,255,0.1)', maxWidth: '1200px', marginLeft: 'auto', marginRight: 'auto' }}>
        <h4 style={{ margin: '0 0 0.75rem', fontSize: 'clamp(0.9rem, 2vw, 1rem)', fontWeight: 600, color: '#fff5f0' }}>Impressum</h4>
        <p style={{ margin: '0 0 0.25rem', fontWeight: 600, color: '#fff5f0', fontSize: '0.95rem' }}>
          {stammdaten?.verein?.name || 'Verein (Name in Admin-Einstellungen eintragen)'}
        </p>
        {stammdaten?.verein?.vereinsnummer && (
          <p style={{ margin: '0 0 0.15rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem' }}>ZVR-Zahl: {stammdaten.verein.vereinsnummer}</p>
        )}
        {(stammdaten?.verein?.address || stammdaten?.verein?.city) && (
          <p style={{ margin: '0 0 0.15rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem' }}>
            {[stammdaten.verein.address, stammdaten.verein.city, stammdaten.verein.country].filter(Boolean).join(', ')}
          </p>
        )}
        {stammdaten?.verein?.email && (
          <p style={{ margin: '0 0 0.15rem', fontSize: '0.88rem' }}>
            <a href={`mailto:${stammdaten.verein.email}`} style={{ color: '#ff8c42', textDecoration: 'none' }}>{stammdaten.verein.email}</a>
          </p>
        )}
        {stammdaten?.vorstand?.name && (
          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <p style={{ margin: '0 0 0.5rem', fontWeight: 600, color: '#fff5f0', fontSize: '0.9rem' }}>Vorstand</p>
            <p style={{ margin: '0 0 0.2rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>Obfrau/Obmann: <span style={{ color: '#fff5f0' }}>{stammdaten.vorstand.name}</span></p>
            {stammdaten.vize?.name && <p style={{ margin: '0 0 0.2rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>Stellvertreter:in: <span style={{ color: '#fff5f0' }}>{stammdaten.vize.name}</span></p>}
            {stammdaten.kassier?.name && <p style={{ margin: '0 0 0.2rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>Kassier:in: <span style={{ color: '#fff5f0' }}>{stammdaten.kassier.name}</span></p>}
          </div>
        )}

        {/* QR-Code → Mitglieder-Seite */}
        {qrDataUrl && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <img src={qrDataUrl} alt="QR-Code Mitglieder" style={{ width: 100, height: 100, borderRadius: 8, background: '#fff', padding: 4 }} />
            <div>
              <p style={{ margin: '0 0 0.2rem', fontWeight: 600, color: '#fff5f0', fontSize: '0.9rem' }}>
                {pageTexts.kunstschaffendeHeading?.trim() || 'Unsere Mitglieder'} direkt aufrufen
              </p>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>
                QR-Code scannen
              </p>
            </div>
          </div>
        )}
      </footer>

      {/* Copyright + K2 Brand */}
      <div style={{ textAlign: 'center', padding: '1.5rem 1rem 2rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem' }}>
        <div style={{ marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.05em' }}>
          K2 Galerie
        </div>
        <div>© {new Date().getFullYear()} {stammdaten?.verein?.name || 'Vereinsplattform'} · Powered by K2 Galerie</div>
      </div>

      {/* Stand-Badge unten links */}
      <div
        style={{ position: 'fixed', bottom: 8, left: 8, fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', zIndex: 50 }}
        onClick={() => { window.location.href = window.location.href.split('?')[0] + '?v=' + Date.now() }}
        title="Tippen für Cache-Bypass"
      >
        Stand: {BUILD_LABEL}
      </div>
    </div>
  )
}

export default Vk2GaleriePage
