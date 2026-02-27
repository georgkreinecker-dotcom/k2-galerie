import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import '../App.css'
import { PLATFORM_ROUTES, PROJECT_ROUTES, MOK2_ROUTE } from '../config/navigation'
import { buildQrUrlWithBust, useQrVersionTimestamp } from '../hooks/useServerBuildTimestamp'

// Haupt-Features (wichtigste Funktionen)
const mainFeatures = [
  {
    title: 'K2 Galerie',
    description: 'Öffentliche Galerie öffnen – Kunst & Keramik',
    to: PROJECT_ROUTES['k2-galerie'].galerie,
    cta: 'Galerie öffnen →',
    icon: '🎨',
    color: 'linear-gradient(135deg, var(--k2-accent), #e67a2a)',
    priority: 'high'
  },
  {
    title: 'Projekte',
    description: 'Alle Projekte verwalten',
    to: PLATFORM_ROUTES.projects,
    cta: 'Zu Projekten →',
    icon: '📁',
    color: 'linear-gradient(135deg, #d4a574, var(--k2-accent))',
    priority: 'high'
  },
]

// Sekundäre Features (wichtige Tools)
const secondaryFeatures = [
  {
    title: 'KI-Verbindung',
    description: 'Zugang für den AI-Assistenten einrichten',
    to: PLATFORM_ROUTES.key,
    cta: 'Einrichten →',
    icon: '🔑',
  },
  {
    title: 'Nutzungskosten',
    description: 'Was kostet der AI-Assistent bisher?',
    to: PLATFORM_ROUTES.kosten,
    cta: 'Anzeigen →',
    icon: '💰',
  },
  {
    title: 'mök2 – Vertrieb & Promotion',
    description: 'Lizenzen, Empfehlungen, Vergütung, Werbeunterlagen',
    to: MOK2_ROUTE,
    cta: 'Öffnen →',
    icon: '📢',
  },
  {
    title: 'Lizenzen',
    description: 'Wer nutzt die App? Lizenzen verwalten',
    to: PROJECT_ROUTES['k2-galerie'].licences,
    cta: 'Öffnen →',
    icon: '💼',
  },
  {
    title: 'Code-Verbindung',
    description: 'Für automatisches Speichern des Codes auf GitHub',
    to: PLATFORM_ROUTES.githubToken,
    cta: 'Einrichten →',
    icon: '🔐',
  },
  {
    title: 'Projekt-Übersicht',
    description: 'Alle Projekte auf einen Blick',
    to: PLATFORM_ROUTES.missionControl,
    cta: 'Öffnen →',
    icon: '🚀',
  },
]

export default function PlatformStartPage() {
  const navigate = useNavigate()
  const [galerieUrl, setGalerieUrl] = useState('')
  const [galerieQrUrl, setGalerieQrUrl] = useState('')
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [apiKeySet, setApiKeySet] = useState(false)
  const [githubTokenSet, setGithubTokenSet] = useState(false)

  useEffect(() => {
    setApiKeySet(!!(localStorage.getItem('k2-openai-api-key') || localStorage.getItem('openai-api-key') || localStorage.getItem('k2-api-key')))
    setGithubTokenSet(!!localStorage.getItem('k2-github-token'))
  }, [])

  // Prüfe ob iOS und ob bereits installiert
  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    const isStandaloneMode = (window.navigator as any).standalone === true || window.matchMedia('(display-mode: standalone)').matches
    const isMobileDevice = window.innerWidth <= 768 || isIOSDevice
    setIsIOS(isIOSDevice)
    setIsStandalone(isStandaloneMode)
    setIsMobile(isMobileDevice)
    
    // KRITISCH: Auf Mobile automatisch zur Galerie weiterleiten!
    // Arbeitsplattform wird nur auf Mac benötigt
    if (isMobileDevice) {
      console.log('📱 Mobile erkannt - leite zur Galerie weiter...')
      navigate(PROJECT_ROUTES['k2-galerie'].galerie)
      return
    }
    
    // Zeige Install-Prompt nur wenn nicht bereits installiert
    if (isIOSDevice && !isStandaloneMode) {
      setShowInstallPrompt(true)
    }

    // Update bei Resize
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [navigate])

  // Automatisch zur Admin-Seite weiterleiten wenn ?admin=true
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('admin') === 'true' || params.get('admin') === 'auto') {
      navigate('/admin')
    }
  }, [navigate])

  // Automatisch Galerie-URL für QR-Code finden
  useEffect(() => {
    const hostname = window.location.hostname
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      // Über Netzwerk-IP verbunden - perfekt für mobile Geräte!
      setGalerieUrl(`http://${hostname}:5177${PROJECT_ROUTES['k2-galerie'].galerie}`)
    } else {
      // Fallback: Versuche IP zu ermitteln
      fetch('/')
        .then(() => {
          const port = window.location.port || '5177'
          const protocol = window.location.protocol
          const url = `${protocol}//${window.location.hostname}:${port}${PROJECT_ROUTES['k2-galerie'].galerie}`
          // Nur setzen wenn nicht localhost
          if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            setGalerieUrl(url)
          }
        })
        .catch(() => {
          // Keine URL setzen - zeige Hinweis
        })
    }
  }, [])

  const { versionTimestamp: qrVersionTs, serverLabel, refetch: refetchQr } = useQrVersionTimestamp()
  // QR-Code mit Server-Stand + Cache-Bust – Scan lädt immer aktuelle Version
  useEffect(() => {
    if (!galerieUrl) { setGalerieQrUrl(''); return }
    QRCode.toDataURL(buildQrUrlWithBust(galerieUrl, qrVersionTs), { width: 200, margin: 1 }).then(setGalerieQrUrl).catch(() => setGalerieQrUrl(''))
  }, [galerieUrl, qrVersionTs])

  return (
    <div className="mission-wrapper">
      <div className="viewport">
        <header>
          <div>
            <h1 style={{ 
              background: 'linear-gradient(135deg, var(--k2-accent), #e67a2a)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent', 
              backgroundClip: 'text',
              fontSize: '2.5rem',
              marginBottom: '0.5rem'
            }}>
              K2 Galerie – Arbeitsplattform
            </h1>
            <div className="meta" style={{ fontSize: '1rem', marginTop: '0.25rem', opacity: 0.8 }}>
              Dein Einstieg – Galerie, Projekte & alle Werkzeuge
            </div>
          </div>
        </header>

        {/* Haupt-Features - Prominent und groß */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', 
          gap: '1.5rem',
          marginTop: '2rem'
        }}>
          {mainFeatures.map((feature) => (
            <Link 
              to={feature.to} 
              key={feature.title} 
              style={{ 
                textDecoration: 'none',
                display: 'block'
              }}
            >
              <div style={{
                background: feature.color,
                borderRadius: '20px',
                padding: '2rem',
                color: '#fff',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                border: 'none',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)'
              }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                  {feature.icon}
                </div>
                <h2 style={{ 
                  margin: '0 0 0.5rem 0', 
                  fontSize: '1.75rem',
                  fontWeight: '700',
                  color: '#fff'
                }}>
                  {feature.title}
                </h2>
                <p style={{ 
                  margin: '0 0 1rem 0', 
                  fontSize: '1rem',
                  opacity: 0.95,
                  lineHeight: '1.5'
                }}>
                  {feature.description}
                </p>
                <div style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  opacity: 0.9
                }}>
                  {feature.cta}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Sekundäre Features - Kompakt */}
        <div style={{ marginTop: '2rem' }}>
          <div style={{ 
            fontSize: '0.9rem', 
            color: '#8fa0c9', 
            marginBottom: '1rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Werkzeuge & Einstellungen
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', 
            gap: '1rem'
          }}>
            {secondaryFeatures.map((feature) => {
              const isApiKey = feature.title === 'API-Key'
              const isGithub = feature.title === 'GitHub Token'
              const isSet = isApiKey ? apiKeySet : isGithub ? githubTokenSet : null
              const needsAction = isSet === false
              return (
              <Link 
                to={feature.to} 
                key={feature.title} 
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  background: needsAction ? 'rgba(245,158,11,0.08)' : 'rgba(255, 255, 255, 0.05)',
                  border: needsAction ? '1px solid rgba(245,158,11,0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                  e.currentTarget.style.borderColor = 'rgba(95, 251, 241, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = needsAction ? 'rgba(245,158,11,0.08)' : 'rgba(255, 255, 255, 0.05)'
                  e.currentTarget.style.borderColor = needsAction ? 'rgba(245,158,11,0.4)' : 'rgba(255, 255, 255, 0.1)'
                }}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ fontSize: '1.5rem' }}>{feature.icon}</span>
                    <h3 style={{ 
                      margin: 0, 
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: '#fff',
                      flex: 1
                    }}>
                      {feature.title}
                    </h3>
                    {isSet === true && (
                      <span style={{ fontSize: '0.75rem', background: 'rgba(16,185,129,0.2)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.4)', borderRadius: '20px', padding: '0.15rem 0.5rem', fontWeight: '700', whiteSpace: 'nowrap' }}>✅ Gesetzt</span>
                    )}
                    {isSet === false && (
                      <span style={{ fontSize: '0.75rem', background: 'rgba(245,158,11,0.2)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.4)', borderRadius: '20px', padding: '0.15rem 0.5rem', fontWeight: '700', whiteSpace: 'nowrap' }}>⚠️ Fehlt</span>
                    )}
                  </div>
                  <p style={{ 
                    margin: '0 0 0.5rem 0', 
                    fontSize: '0.85rem',
                    color: '#8fa0c9',
                    lineHeight: '1.4'
                  }}>
                    {needsAction ? <span style={{ color: '#fcd34d' }}>Bitte eintragen – wird für den Betrieb benötigt</span> : feature.description}
                  </p>
                  <div style={{
                    fontSize: '0.85rem',
                    color: needsAction ? '#fcd34d' : 'var(--k2-accent)',
                    fontWeight: '600'
                  }}>
                    {needsAction ? '→ Jetzt eintragen' : feature.cta}
                  </div>
                </div>
              </Link>
              )
            })}
          </div>
        </div>

        {/* QR-Code für Mobile - Nur wenn URL vorhanden */}
        {galerieUrl && galerieQrUrl && !isMobile && (
          <div style={{ 
            marginTop: '2rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '1.1rem', 
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: '#fff'
            }}>
              📱 Galerie auf Mobile testen
            </div>
            {serverLabel && (
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', marginBottom: '0.5rem' }}>
                Vercel liefert gerade: <strong>{serverLabel}</strong> – Scan zeigt diesen Stand. Steht hier noch 13.26 → im Vercel-Dashboard prüfen (Deployment Ready?).
              </div>
            )}
            <div style={{ marginBottom: '1rem' }}>
              <button type="button" onClick={() => refetchQr()} title="QR mit aktuellem Stand von Vercel neu laden" style={{ marginBottom: 8, padding: '6px 12px', fontSize: 12, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, color: '#fff', cursor: 'pointer' }}>QR mit aktuellem Stand</button>
              <img 
                src={galerieQrUrl} 
                alt="Galerie QR Code" 
                style={{ 
                  maxWidth: '180px', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
                }} 
              />
            </div>
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#8fa0c9', 
              fontFamily: 'monospace', 
              wordBreak: 'break-all',
              opacity: 0.7
            }}>
              {galerieUrl}
            </div>
          </div>
        )}

        {/* Quick Links - Schnellzugriff */}
        <div style={{ 
          marginTop: '2rem',
          paddingTop: '2rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ 
            fontSize: '0.9rem', 
            color: '#8fa0c9', 
            marginBottom: '1rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Schnellzugriff
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <Link 
              to={PLATFORM_ROUTES.projects}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                color: '#fff',
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.borderColor = 'rgba(95, 251, 241, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
              }}
            >
              📁 Projekte
            </Link>
            <Link 
              to={PLATFORM_ROUTES.key}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                color: '#fff',
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.borderColor = 'rgba(95, 251, 241, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
              }}
            >
              🔑 API-Key
            </Link>
            <Link 
              to={PLATFORM_ROUTES.kosten}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                color: '#fff',
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.borderColor = 'rgba(95, 251, 241, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
              }}
            >
              💰 Kosten
            </Link>
            <Link 
              to={MOK2_ROUTE}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                color: '#fff',
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.borderColor = 'rgba(95, 251, 241, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
              }}
            >
              📢 mök2
            </Link>
            <Link 
              to={PROJECT_ROUTES['k2-galerie'].licences}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                color: '#fff',
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.borderColor = 'rgba(95, 251, 241, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
              }}
            >
              💼 Lizenzen
            </Link>
            <Link 
              to={PLATFORM_ROUTES.missionControl}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                color: '#fff',
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.borderColor = 'rgba(95, 251, 241, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
              }}
            >
              🚀 Mission Control
            </Link>
          </div>
        </div>

        {/* Mobile: App-Button prominent */}
        {isMobile && (
          <div style={{ marginTop: '2rem' }}>
            <Link
              to={PROJECT_ROUTES['k2-galerie'].galerie}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                padding: '1.5rem 2rem',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '16px',
                fontSize: '1.3rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 20px rgba(34, 197, 94, 0.4)',
                transition: 'all 0.2s ease',
                width: '100%'
              }}
            >
              <span style={{ fontSize: '1.8rem' }}>🎨</span>
              <span>K2 Galerie Kunst&Keramik öffnen</span>
            </Link>
            
            {showInstallPrompt && (
              <div style={{
                background: 'rgba(95, 251, 241, 0.1)',
                border: '1px solid rgba(95, 251, 241, 0.3)',
                padding: '1rem',
                borderRadius: '12px',
                marginTop: '1rem',
                fontSize: '0.85rem',
                color: '#fff',
                textAlign: 'center'
              }}>
                <div style={{ marginBottom: '0.5rem', fontWeight: '600', color: 'var(--k2-accent)' }}>
                  📱 Zum Home-Bildschirm hinzufügen
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--k2-muted)', lineHeight: '1.5' }}>
                  Teilen → "Zum Home-Bildschirm" → Hinzufügen
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
