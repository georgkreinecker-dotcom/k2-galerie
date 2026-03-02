/**
 * Seite nach erfolgreichem Stripe-Checkout (Redirect von Stripe).
 * URL: /lizenz-erfolg?session_id=...
 * Enthält eine ausdruckbare Lizenzbestätigung („Bestätigung drucken“).
 */
import { Link, useSearchParams } from 'react-router-dom'
import '../App.css'
import { PROJECT_ROUTES, ENTDECKEN_ROUTE } from '../config/navigation'
import { PRODUCT_BRAND_NAME } from '../config/tenantConfig'

export default function LizenzErfolgPage() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const bestaetigungsDatum = new Date().toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <main style={{ maxWidth: 480, margin: '3rem auto', padding: '0 1rem', textAlign: 'center' }}>
      <style>{`
        @media print {
          .lizenz-erfolg-no-print { display: none !important; }
          .lizenz-bestaetigung-print { max-width: 100% !important; margin: 0 !important; box-shadow: none !important; border: 1px solid #ccc !important; }
        }
      `}</style>
      <div className="lizenz-erfolg-no-print" style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
      <h1 className="lizenz-erfolg-no-print" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Lizenz erworben</h1>
      <p className="lizenz-erfolg-no-print" style={{ color: 'var(--k2-muted)', marginBottom: '1.5rem' }}>
        Vielen Dank für deine Zahlung. Deine Lizenz ist aktiv.
        {sessionId && (
          <span style={{ display: 'block', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            (Referenz: {sessionId.slice(0, 20)}…)
          </span>
        )}
      </p>

      {/* Bestätigung zum Ausdrucken – Kunde kann sich das Schreiben von uns drucken */}
      <div
        className="lizenz-bestaetigung-print"
        style={{
          maxWidth: 420,
          margin: '0 auto 1.5rem',
          padding: '1.25rem',
          background: '#fff',
          border: '1px solid var(--k2-accent, #5ffbf1)',
          borderRadius: 12,
          textAlign: 'left',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <p style={{ margin: '0 0 0.25rem', fontSize: '0.85rem', color: 'var(--k2-muted)' }}>{PRODUCT_BRAND_NAME}</p>
        <h2 style={{ margin: '0 0 1rem', fontSize: '1.15rem', fontWeight: 700, color: '#1a1a1a' }}>Lizenzbestätigung</h2>
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.95rem', color: '#333', lineHeight: 1.5 }}>
          Vielen Dank für Ihren Lizenzabschluss. Ihre Lizenz ist aktiv.
        </p>
        <p style={{ margin: '0 0 0.25rem', fontSize: '0.9rem', color: '#555' }}>Datum: {bestaetigungsDatum}</p>
        {sessionId && (
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#666', wordBreak: 'break-all' }}>Referenz: {sessionId}</p>
        )}
      </div>
      <p className="lizenz-erfolg-no-print" style={{ marginBottom: '1rem' }}>
        <button
          type="button"
          onClick={() => window.print()}
          className="btn primary-btn"
          style={{ cursor: 'pointer' }}
        >
          Bestätigung drucken
        </button>
      </p>

      <p className="lizenz-erfolg-no-print">
        <Link to={PROJECT_ROUTES['k2-galerie'].licences} className="btn primary-btn">
          Zu den Lizenzen
        </Link>
      </p>
      <p className="lizenz-erfolg-no-print" style={{ marginTop: '1rem' }}>
        <Link to={ENTDECKEN_ROUTE} style={{ color: 'var(--k2-accent)', fontSize: '0.9rem' }}>
          Zur Galerie-Entdeckung →
        </Link>
      </p>
    </main>
  )
}
