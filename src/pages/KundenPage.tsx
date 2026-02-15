import { Link } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'
import { KundenTab } from '../components/KundenTab'
import '../App.css'

/** Direkte Kundendaten – ohne Control Studio (ein Klick = Kundendaten) */
export default function KundenPage() {
  return (
    <main className="mission-wrapper">
      <div className="viewport">
        <header style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              to="/admin"
              style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', textDecoration: 'none', fontSize: '0.9rem' }}
            >
              ← Zurück zur Admin-Verwaltung
            </Link>
          </div>
          <h1 style={{ margin: '1rem 0 0.5rem', fontSize: '1.75rem' }}>👥 Kundendaten</h1>
          <p className="meta">Kunden für Verkauf, Einladungen und Ausstellungsbetrieb.</p>
        </header>
        <KundenTab />
      </div>
    </main>
  )
}
