import { Link, useNavigate } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'
import {
  getCurrentTenantId,
  setCurrentTenantId,
  getTenantConfig,
  type TenantId,
} from '../config/tenantConfig'

/**
 * Produkt-Vorschau: Parallele Ansicht der Lizenzversion
 * Hier kannst du jederzeit die vermarktbare Version (Demo-Mandant) ansehen.
 */
export default function ProduktVorschauPage() {
  const navigate = useNavigate()
  const tenantId = getCurrentTenantId()
  const config = getTenantConfig()

  const switchTo = (id: TenantId) => {
    setCurrentTenantId(id)
    if (id === 'demo') {
      navigate(PROJECT_ROUTES['k2-galerie'].galerie)
    } else {
      navigate(PROJECT_ROUTES['k2-galerie'].produktVorschau)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, var(--k2-bg-1) 0%, var(--k2-bg-2) 50%, var(--k2-bg-3) 100%)',
        color: '#fff',
        padding: '2rem',
        maxWidth: '900px',
        margin: '0 auto',
      }}
    >
      <div style={{ marginBottom: '2rem' }}>
        <Link
          to={PROJECT_ROUTES['k2-galerie'].home}
          style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.95rem' }}
        >
          ← Projekt-Start
        </Link>
      </div>

      <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', marginBottom: '0.5rem' }}>
        Produkt-Vorschau
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem', fontSize: '1rem' }}>
        Basis: deine K2 Galerie. Hier siehst du die parallele Lizenzversion (Demo-Mandant) und kannst jederzeit vergleichen.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* K2 – deine Galerie */}
        <div
          style={{
            background: tenantId === 'k2' ? 'rgba(95, 251, 241, 0.12)' : 'rgba(255,255,255,0.06)',
            border: `2px solid ${tenantId === 'k2' ? '#5ffbf1' : 'rgba(255,255,255,0.15)'}`,
            borderRadius: '12px',
            padding: '1.5rem',
          }}
        >
          <div style={{ fontSize: '0.85rem', color: '#5ffbf1', marginBottom: '0.5rem' }}>
            Deine Galerie
          </div>
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.35rem' }}>K2 Galerie</h2>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
            Martina & Georg Kreinecker · Kunst & Keramik
          </p>
          <button
            type="button"
            onClick={() => switchTo('k2')}
            style={{
              marginTop: '1rem',
              padding: '0.6rem 1.2rem',
              background: tenantId === 'k2' ? '#5ffbf1' : 'rgba(255,255,255,0.1)',
              color: tenantId === 'k2' ? '#0a0e27' : '#fff',
              border: `1px solid ${tenantId === 'k2' ? '#5ffbf1' : 'rgba(255,255,255,0.3)'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem',
            }}
          >
            {tenantId === 'k2' ? '✓ Aktiv' : 'Zu K2 wechseln'}
          </button>
        </div>

        {/* Demo – Lizenzversion */}
        <div
          style={{
            background: tenantId === 'demo' ? 'rgba(234, 179, 8, 0.12)' : 'rgba(255,255,255,0.06)',
            border: `2px solid ${tenantId === 'demo' ? '#eab308' : 'rgba(255,255,255,0.15)'}`,
            borderRadius: '12px',
            padding: '1.5rem',
          }}
        >
          <div style={{ fontSize: '0.85rem', color: '#eab308', marginBottom: '0.5rem' }}>
            Lizenzversion (Demo)
          </div>
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.35rem' }}>
            {config.galleryName}
          </h2>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
            {config.artist1Name} & {config.artist2Name} · {config.tagline}
          </p>
          <button
            type="button"
            onClick={() => switchTo('demo')}
            style={{
              marginTop: '1rem',
              padding: '0.6rem 1.2rem',
              background: tenantId === 'demo' ? '#eab308' : 'rgba(255,255,255,0.1)',
              color: tenantId === 'demo' ? '#0a0e27' : '#fff',
              border: `1px solid ${tenantId === 'demo' ? '#eab308' : 'rgba(255,255,255,0.3)'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem',
            }}
          >
            {tenantId === 'demo' ? '✓ Aktiv' : 'Lizenzversion ansehen'}
          </button>
        </div>
      </div>

      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '1rem' }}>
        „Lizenzversion ansehen“ öffnet die Galerie mit Demo-Branding (Atelier Muster, Lisa & Max Muster). 
        Daten (Werke, Events) bleiben deine; nur Anzeige-Namen wechseln für die Vorschau.
      </p>

      <Link
        to={PROJECT_ROUTES['k2-galerie'].galerie}
        style={{
          display: 'inline-block',
          padding: '0.75rem 1.5rem',
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.25)',
          color: '#fff',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: '500',
        }}
      >
        → Zur Galerie ({tenantId === 'demo' ? 'mit Demo-Branding' : 'K2'})
      </Link>
    </div>
  )
}
