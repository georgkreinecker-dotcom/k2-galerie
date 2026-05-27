/**
 * K2 Agentur – APf-Basisplattform (nur localhost / ?apf=1 / ?dev=1).
 */

import { Link, Navigate } from 'react-router-dom'
import { ENTDECKEN_ROUTE, K2_GALERIE_APF_EINSTIEG, shouldShowK2GalerieApfProjectHub } from '../config/navigation'
import { PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_URHEBER_ANWENDUNG } from '../config/tenantConfig'
import K2AgenturPlattformWorkplace from '../components/k2Agentur/K2AgenturPlattformWorkplace'

export default function K2AgenturPlattformPage() {
  if (!shouldShowK2GalerieApfProjectHub()) {
    return <Navigate to={ENTDECKEN_ROUTE} replace />
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#ebe8e2',
        padding: '1.25rem 1rem 2rem',
      }}
    >
      <K2AgenturPlattformWorkplace />
      <footer
        style={{
          maxWidth: 1180,
          margin: '2rem auto 0',
          paddingTop: '1rem',
          borderTop: '1px solid #c4b8a8',
          fontSize: '0.78rem',
          color: '#5c5650',
          lineHeight: 1.5,
        }}
      >
        <p style={{ margin: '0 0 0.2rem' }}>{PRODUCT_COPYRIGHT_BRAND_ONLY}</p>
        <p style={{ margin: 0 }}>{PRODUCT_URHEBER_ANWENDUNG}</p>
        <p style={{ margin: '0.65rem 0 0' }}>
          <Link to={K2_GALERIE_APF_EINSTIEG} style={{ color: '#b54a1e' }}>
            ← Zurück zur APf
          </Link>
        </p>
      </footer>
    </div>
  )
}
