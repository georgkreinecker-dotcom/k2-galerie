import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState, useMemo } from 'react'
import '../App.css'
import { PLATFORM_ROUTES, PROJECT_ROUTES } from '../config/navigation'

const platformFeatures = [
  {
    title: 'Projekte',
    description: 'Alle deine Projekte verwalten und öffnen. Dev-View Tool öffnet sich automatisch.',
    to: PLATFORM_ROUTES.projects,
    cta: 'Zu Projekten →',
    icon: '📁',
  },
  {
    title: 'API-Key',
    description: 'OpenAI API-Key verwalten – für alle Projekte.',
    to: PLATFORM_ROUTES.key,
    cta: 'Verwalten →',
    icon: '🔑',
  },
  {
    title: 'Kosten-Überblick',
    description: 'OpenAI-Nutzung und geschätzte Kosten einsehen.',
    to: PLATFORM_ROUTES.kosten,
    cta: 'Anzeigen →',
    icon: '💰',
  },
]

export default function PlatformStartPage() {
  const navigate = useNavigate()
  const [galerieUrl, setGalerieUrl] = useState('')
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Prüfe ob iOS und ob bereits installiert
  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    const isStandaloneMode = (window.navigator as any).standalone === true || window.matchMedia('(display-mode: standalone)').matches
    const isMobileDevice = window.innerWidth <= 768 || isIOSDevice
    setIsIOS(isIOSDevice)
    setIsStandalone(isStandaloneMode)
    setIsMobile(isMobileDevice)
    
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
  }, [])

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

  const galerieQrUrl = useMemo(() => {
    if (!galerieUrl) return ''
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(galerieUrl)}`
  }, [galerieUrl])

  return (
    <div className="mission-wrapper">
      <div className="viewport">
        <header>
          <div>
            <h1 style={{ background: 'linear-gradient(135deg, #5ffbf1, #33a1ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              K2 Mission Deck
            </h1>
            <div className="meta" style={{ fontSize: '1.05rem', marginTop: '0.5rem' }}>
              Direkter Zugriff auf alle Systeme – Galerie · KI · Mobile
            </div>
          </div>
        </header>

        {/* App-Button für mobile Geräte - IMMER SICHTBAR */}
        {isMobile && (
        <div style={{
          display: 'block',
          marginTop: '1rem',
          width: '100%'
        }}>
          <Link
            to={PROJECT_ROUTES['k2-galerie'].galerie}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              padding: '1.25rem 2rem',
              background: '#22c55e',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '16px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              marginBottom: showInstallPrompt ? '0.5rem' : '1.5rem',
              boxShadow: '0 4px 16px rgba(34, 197, 94, 0.4)',
              transition: 'all 0.2s ease',
              WebkitTapHighlightColor: 'transparent',
              width: '100%',
              maxWidth: '400px',
              margin: '0 auto 1rem'
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>🎨</span>
            <span>K2 Galerie</span>
          </Link>
          
          {/* Install-Hinweis für iOS */}
          {showInstallPrompt && (
            <div style={{
              background: '#2a2a2a',
              padding: '1rem',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              fontSize: '0.9rem',
              color: '#fff',
              textAlign: 'center'
            }}>
              <div style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#5ffbf1' }}>
                📱 Zum Home-Bildschirm hinzufügen
              </div>
              <div style={{ fontSize: '0.85rem', color: '#999', lineHeight: '1.5' }}>
                1. Tippe auf das <strong style={{ color: '#5ffbf1' }}>Teilen</strong> Symbol (⬆️) unten<br/>
                2. Wähle <strong style={{ color: '#5ffbf1' }}>"Zum Home-Bildschirm"</strong><br/>
                3. Tippe auf <strong style={{ color: '#5ffbf1' }}>"Hinzufügen"</strong>
              </div>
            </div>
          )}
        </div>
        )}

        <div className="grid" style={{ marginTop: '1.5rem' }}>
          {platformFeatures.map((feature) => (
            <Link to={feature.to} key={feature.title} style={{ textDecoration: 'none' }}>
              <div className="card platform-card">
                <div className="card-icon">{feature.icon}</div>
                <h2>{feature.title}</h2>
                <p>{feature.description}</p>
                <div className="card-cta">
                  {feature.cta}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* QR-Code für Galerie auf Mobile-Geräten */}
        {galerieUrl && galerieQrUrl && (
          <div className="card" style={{ marginTop: '2rem', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '1rem' }}>📱 Galerie auf iPhone/iPad testen</h2>
            <div style={{ marginBottom: '1rem' }}>
              <img src={galerieQrUrl} alt="Galerie QR Code" style={{ maxWidth: '200px', borderRadius: '8px' }} />
            </div>
            <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '0.5rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {galerieUrl}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>
              QR-Code mit iPhone/iPad scannen → Galerie öffnet sich
            </div>
          </div>
        )}
        
        {!galerieUrl && (
          <div className="card" style={{ marginTop: '2rem', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '1rem' }}>📱 Galerie auf iPhone/iPad testen</h2>
            <div style={{ fontSize: '0.9rem', color: '#999', marginBottom: '1rem' }}>
              Öffne Mission Deck über deine Netzwerk-IP statt localhost:
            </div>
            <div style={{ 
              background: '#2a2a2a', 
              padding: '1rem', 
              borderRadius: '6px',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              marginBottom: '1rem'
            }}>
              http://[DEINE-IP]:5177/#/
            </div>
            <div style={{ fontSize: '0.85rem', color: '#666' }}>
              Dann erscheint der QR-Code automatisch
            </div>
          </div>
        )}

        <div className="quick" style={{ marginTop: '2rem' }}>
          <Link className="chip" to={PLATFORM_ROUTES.projects}>
            Projekte
          </Link>
          <Link className="chip" to={PLATFORM_ROUTES.key}>
            API-Key
          </Link>
          <Link className="chip" to={PLATFORM_ROUTES.kosten}>
            Kosten
          </Link>
        </div>
      </div>
    </div>
  )
}
