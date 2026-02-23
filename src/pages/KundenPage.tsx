import { Link } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'
import { KundenTab } from '../components/KundenTab'
import { WERBEUNTERLAGEN_STIL } from '../config/marketingWerbelinie'
import '../App.css'

const s = WERBEUNTERLAGEN_STIL

/** Direkte Kundendaten (K2) bzw. Mitglieder (VK2) – ohne Control Studio */
export default function KundenPage(props: { vk2?: boolean }) {
  const vk2 = !!props.vk2
  const scope = vk2 ? 'vk2' : 'k2'
  const title = vk2 ? 'Kontakte & Gäste' : 'Kundendaten'
  const backTo = vk2 ? '/admin?context=vk2' : '/admin'
  const subtitle = vk2 ? 'Vernissage-Gäste, Interessenten, Kontakte des Vereins. Vereinsmitglieder verwaltest du unter Einstellungen → Stammdaten.' : 'Kunden für Verkauf, Einladungen und Ausstellungsbetrieb.'
  return (
    <main style={{ minHeight: '100vh', background: s.bgDark, padding: '2rem clamp(1.5rem, 5vw, 4rem)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <header style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              to={backTo}
              style={{ padding: '0.5rem 1rem', background: s.bgElevated, border: `1px solid ${s.accent}40`, borderRadius: s.radius, color: s.text, textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' }}
            >
              ← Zurück zur Admin-Verwaltung
            </Link>
          </div>
          <h1 style={{ margin: '1rem 0 0.5rem', fontSize: '1.75rem', color: s.text }}>👥 {title}</h1>
          <p style={{ margin: 0, color: s.muted, fontSize: '0.95rem' }}>{subtitle}</p>
        </header>
        <KundenTab scope={scope} />
      </div>
    </main>
  )
}
