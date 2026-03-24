import { Link } from 'react-router-dom'
import { TexteSchreibtischBoard } from '../components/TexteSchreibtischBoard'
import { K2_GALERIE_APF_EINSTIEG, PROJECT_ROUTES } from '../config/navigation'
import { PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_URHEBER_ANWENDUNG } from '../config/tenantConfig'

const R = PROJECT_ROUTES['k2-galerie']

/**
 * Minimale Seite nur für das Schreibtisch-Board (eigenes Browserfenster, z. B. zweiter Monitor).
 * Gleiche Daten wie auf dem Texte-Schreibtisch (localStorage).
 */
export default function TexteSchreibtischBoardPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(165deg, #e8dcc8 0%, #f0e6d4 35%, #ebe0cf 70%, #e2d3bc 100%)',
        color: '#1c1a18',
        padding: '0.75rem 0.75rem 1.5rem',
        fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.65rem', marginBottom: '0.6rem' }}>
          <Link
            to={K2_GALERIE_APF_EINSTIEG}
            style={{
              color: '#5c5650',
              fontSize: '0.86rem',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            ← Zur APf
          </Link>
          <Link
            to={R.texteSchreibtisch}
            style={{
              color: '#5c5650',
              fontSize: '0.86rem',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            🪑 Vollständiger Schreibtisch
          </Link>
        </div>
        <TexteSchreibtischBoard variant="standalone" />
        <footer style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(28,26,24,0.12)', fontSize: '0.72rem', color: '#5c5650', lineHeight: 1.55 }}>
          <div>{PRODUCT_COPYRIGHT_BRAND_ONLY}</div>
          <div>{PRODUCT_URHEBER_ANWENDUNG}</div>
        </footer>
      </div>
    </div>
  )
}
