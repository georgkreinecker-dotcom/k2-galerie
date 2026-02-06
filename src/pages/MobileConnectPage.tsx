import { useMemo, useState, useEffect } from 'react'
import { usePersistentString } from '../hooks/usePersistentState'
import { ProjectNavButton } from '../components/Navigation'
import { Link } from 'react-router-dom'

const MobileConnectPage = () => {
  const [url, setUrl] = usePersistentString('k2-mobile-url')
  const [localIP, setLocalIP] = useState('')
  const [devViewUrl, setDevViewUrl] = useState('')

  // Automatisch lokale IP-Adresse finden
  useEffect(() => {
    const hostname = window.location.hostname
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      setLocalIP(hostname)
      setDevViewUrl(`http://${hostname}:5177/#/dev-view`)
    } else {
      // Fallback: Versuche IP zu ermitteln
      fetch('/')
        .then(() => {
          // Wenn Server läuft, nutze window.location
          const port = window.location.port || '5177'
          const protocol = window.location.protocol
          setDevViewUrl(`${protocol}//${window.location.hostname}:${port}/#/dev-view`)
        })
        .catch(() => {
          // Standard localhost
          setDevViewUrl('http://localhost:5177/#/dev-view')
        })
    }
  }, [])

  const qrUrl = useMemo(() => {
    if (!url) return ''
    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(url)}`
  }, [url])

  const devViewQrUrl = useMemo(() => {
    if (!devViewUrl) return ''
    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(devViewUrl)}`
  }, [devViewUrl])

  return (
    <main className="mission-wrapper">
      <div className="viewport">
        <header>
          <div>
            <h1>Mobile-Connect</h1>
            <div className="meta">QR-Hub für iPhone/iPad – Galerie wie eine App.</div>
          </div>
          <ProjectNavButton projectId="k2-galerie" />
        </header>

        <div className="card mobile-card">
          <label className="field">
            Deine K2-URL (Live-Adresse)
            <input
              type="text"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://deine-galerie.vercel.app"
            />
          </label>
          <div className="qr-area">
            {qrUrl ? <img src={qrUrl} alt="QR Code" /> : <div className="meta">QR-Code erscheint hier</div>}
          </div>
        </div>

        {/* Dev-View für Entwicklung */}
        {devViewUrl && (
          <div className="card mobile-card" style={{ marginTop: '1rem' }}>
            <h2>🔧 Dev-View Tool (für Entwicklung)</h2>
            <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#999' }}>
              Öffne die Dev-View auf deinem iPhone/iPad:
            </div>
            <div style={{ 
              background: '#2a2a2a', 
              padding: '0.75rem', 
              borderRadius: '6px', 
              marginBottom: '1rem',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              wordBreak: 'break-all'
            }}>
              {devViewUrl}
            </div>
            <div className="qr-area">
              {devViewQrUrl ? (
                <>
                  <img src={devViewQrUrl} alt="Dev-View QR Code" />
                  <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#999' }}>
                    QR-Code scannen → Dev-View öffnet sich
                  </div>
                </>
              ) : (
                <div className="meta">QR-Code wird generiert...</div>
              )}
            </div>
            <div style={{ marginTop: '1rem' }}>
              <Link
                to="/dev-view"
                style={{
                  display: 'inline-block',
                  padding: '0.5rem 1rem',
                  background: '#5ffbf1',
                  color: '#000',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}
              >
                → Dev-View am Mac öffnen
              </Link>
            </div>
          </div>
        )}

        <div className="card">
          <h2>So verbindest du iPhone/iPad</h2>
          <ol className="steps">
            <li>Diese Seite am Computer öffnen und die Live-URL eintragen.</li>
            <li>Mit iPhone/iPad Kamera den QR-Code scannen.</li>
            <li>Link öffnen → Galerie erscheint im Browser.</li>
            <li>Teilen → „Zum Home-Bildschirm“ für App-Icon.</li>
          </ol>
        </div>
      </div>
    </main>
  )
}

export default MobileConnectPage
