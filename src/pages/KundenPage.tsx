import { Link } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'
import { KundenTab } from '../components/KundenTab'
import { WERBEUNTERLAGEN_STIL } from '../config/marketingWerbelinie'
import '../App.css'

const s = WERBEUNTERLAGEN_STIL

/** Direkte Kundendaten – ohne Control Studio (ein Klick = Kundendaten) */
export default function KundenPage() {
  return (
    <main style={{ minHeight: '100vh', background: s.bgDark, padding: '2rem clamp(1.5rem, 5vw, 4rem)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <header style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              to="/admin"
              style={{ padding: '0.5rem 1rem', background: s.bgElevated, border: `1px solid ${s.accent}40`, borderRadius: s.radius, color: s.text, textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' }}
            >
              ← Zurück zur Admin-Verwaltung
            </Link>
          </div>
          <h1 style={{ margin: '1rem 0 0.5rem', fontSize: '1.75rem', color: s.text }}>👥 Kundendaten</h1>
          <p style={{ margin: 0, color: s.muted, fontSize: '0.95rem' }}>Kunden für Verkauf, Einladungen und Ausstellungsbetrieb.</p>
        </header>
        <KundenTab />
      </div>
    </main>
  )
}
