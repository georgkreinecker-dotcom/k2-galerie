import { useNavigate, useLocation } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'

const s = {
  bg: '#f8f7f5',
  card: '#ffffff',
  accent: '#7a3b1e',
  text: '#1c1a17',
  muted: '#7a6f66',
  radius: '14px',
  shadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
}

/**
 * Kassa-Einstieg: Hinweis ob Erhalten (Eingang) oder Auszahlen (Ausgabe).
 * Ein Klick → Verkauf erfassen (Shop) oder Kassabuch (Ausgabe).
 */
export default function KassaEinstiegPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const fromOeffentlich =
    (location.state as { fromOeffentlich?: boolean } | null)?.fromOeffentlich === true ||
    (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('k2-admin-context') === 'oeffentlich')

  const toShop = () => {
    navigate(PROJECT_ROUTES['k2-galerie'].shop, {
      state: { openAsKasse: true, fromOeffentlich: fromOeffentlich || undefined },
    })
  }

  const toKassabuch = () => {
    navigate(PROJECT_ROUTES['k2-galerie'].kassabuch, { state: { fromOeffentlich: fromOeffentlich || undefined } })
  }

  return (
    <div style={{ minHeight: '100vh', background: s.bg, padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ fontSize: '1.5rem', color: s.text, marginBottom: '0.5rem' }}>💰 Kassa</h1>
      <p style={{ color: s.muted, marginBottom: '1.5rem', textAlign: 'center' }}>
        Was möchtest du erfassen?
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '320px', width: '100%' }}>
        <button
          type="button"
          onClick={toShop}
          style={{
            padding: '1.25rem 1.5rem',
            background: 'linear-gradient(135deg, #2d7a3a 0%, #3d9e4e 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: s.radius,
            fontSize: '1.1rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: s.shadow,
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <span style={{ fontSize: '1.75rem' }}>📥</span>
          <div>
            <div>Erhalten (Eingang)</div>
            <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Verkauf erfassen – Beleg drucken</div>
          </div>
        </button>
        <button
          type="button"
          onClick={toKassabuch}
          style={{
            padding: '1.25rem 1.5rem',
            background: s.card,
            color: s.text,
            border: `2px solid ${s.accent}`,
            borderRadius: s.radius,
            fontSize: '1.1rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: s.shadow,
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <span style={{ fontSize: '1.75rem' }}>📤</span>
          <div>
            <div>Auszahlen (Ausgabe)</div>
            <div style={{ fontSize: '0.85rem', color: s.muted }}>Kassabuch – Bar privat, Kassa an Bank, Beleg</div>
          </div>
        </button>
      </div>
      <Link
        to="/admin"
        style={{ marginTop: '2rem', fontSize: '0.9rem', color: s.muted, textDecoration: 'none' }}
      >
        ← Zurück zum Admin
      </Link>
    </div>
  )
}

function Link({ to, children, style }: { to: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <a href={to} style={style}>
      {children}
    </a>
  )
}
