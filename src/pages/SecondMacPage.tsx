import React from 'react'
import { Link } from 'react-router-dom'
import { PLATFORM_ROUTES } from '../config/navigation'
import '../App.css'

export default function SecondMacPage() {
  // IP-Adresse dynamisch ermitteln (wird beim Laden aktualisiert)
  const [localIP, setLocalIP] = React.useState('192.168.0.27')
  const serverURL = `http://${localIP}:5177/`
  
  React.useEffect(() => {
    // Versuche IP-Adresse zu ermitteln (funktioniert nur wenn Server läuft)
    fetch('/')
      .then(() => {
        // Wenn Server läuft, verwende window.location.hostname
        const hostname = window.location.hostname
        if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
          setLocalIP(hostname)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="mission-wrapper">
      <div className="viewport">
        <header>
          <div>
            <h1>Zweiter Mac verbinden</h1>
            <div className="meta">Display & Hilfsrechner einbinden</div>
          </div>
          <Link to={PLATFORM_ROUTES.home} className="meta">← Plattform</Link>
        </header>

        <div className="card">
          <h2>📡 Netzwerk-Info</h2>
          <div className="kosten-stats">
            <div className="kosten-row">
              <span>Deine IP-Adresse</span>
              <strong>{localIP}</strong>
            </div>
            <div className="kosten-row highlight">
              <span>K2 Server URL</span>
              <strong>{serverURL}</strong>
            </div>
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigator.clipboard.writeText(serverURL)}
          >
            URL kopieren
          </button>
        </div>

        <div className="grid" style={{ marginTop: '1.5rem' }}>
          <div className="card">
            <h2>1️⃣ AirPlay Display</h2>
            <p>Zweiter Mac als erweiterten Bildschirm nutzen</p>
            <ol className="steps">
              <li>Auf dem zweiten Mac: <strong>Systemeinstellungen → Displays</strong></li>
              <li><strong>"AirPlay Display"</strong> aktivieren</li>
              <li>Auf diesem Mac: <strong>AirPlay-Menü</strong> (oben rechts) öffnen</li>
              <li>Zweiten Mac auswählen → Fertig!</li>
            </ol>
          </div>

          <div className="card">
            <h2>2️⃣ Screen Sharing</h2>
            <p>Remote-Zugriff auf den zweiten Mac</p>
            <ol className="steps">
              <li>Auf dem zweiten Mac: <strong>Systemeinstellungen → Freigaben</strong></li>
              <li><strong>"Bildschirmfreigabe"</strong> aktivieren</li>
              <li>Auf diesem Mac: <strong>Finder → Gehe zu → Mit Server verbinden</strong></li>
              <li>Eingeben: <code>vnc://[IP-des-zweiten-Macs]</code></li>
            </ol>
          </div>

          <div className="card">
            <h2>3️⃣ K2 auf zweitem Mac</h2>
            <p>Plattform direkt im Browser öffnen</p>
            <ol className="steps">
              <li>Browser auf dem zweiten Mac öffnen</li>
              <li>URL eingeben: <strong>{serverURL}</strong></li>
              <li>K2 Plattform öffnet sich automatisch!</li>
            </ol>
            <button
              type="button"
              className="btn"
              onClick={() => window.open(serverURL, '_blank')}
              style={{ marginTop: '1rem' }}
            >
              Auf zweitem Mac öffnen →
            </button>
          </div>

          <div className="card">
            <h2>4️⃣ Mobile-Connect</h2>
            <p>QR-Code für zweiten Mac/iPad/iPhone</p>
            <ol className="steps">
              <li><Link to="/projects/k2-galerie/mobile-connect">Mobile-Connect</Link> öffnen</li>
              <li>URL ändern zu: <strong>{serverURL}</strong></li>
              <li>QR-Code scannen mit zweitem Mac oder iPhone/iPad</li>
            </ol>
            <Link to="/projects/k2-galerie/mobile-connect" className="btn" style={{ marginTop: '1rem' }}>
              Mobile-Connect öffnen →
            </Link>
          </div>
        </div>

        <div className="card" style={{ marginTop: '1.5rem', background: 'rgba(95, 251, 241, 0.08)' }}>
          <h3>💡 Empfohlene Setup</h3>
          <p>
            <strong>AirPlay Display</strong> für zweiten Bildschirm + <strong>K2 Browser</strong> auf dem zweiten Mac = 
            Perfekte Kombination für mehr Übersicht!
          </p>
        </div>
      </div>
    </div>
  )
}
