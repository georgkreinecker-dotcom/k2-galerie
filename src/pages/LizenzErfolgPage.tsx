/**
 * Seite nach erfolgreichem Stripe-Checkout (Redirect von Stripe).
 * URL: /lizenz-erfolg?session_id=...
 */
import { Link, useSearchParams } from 'react-router-dom'
import '../App.css'
import { PROJECT_ROUTES, ENTDECKEN_ROUTE } from '../config/navigation'

export default function LizenzErfolgPage() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')

  return (
    <main style={{ maxWidth: 480, margin: '3rem auto', padding: '0 1rem', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Lizenz erworben</h1>
      <p style={{ color: 'var(--k2-muted)', marginBottom: '1.5rem' }}>
        Vielen Dank für deine Zahlung. Deine Lizenz ist aktiv.
        {sessionId && (
          <span style={{ display: 'block', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            (Referenz: {sessionId.slice(0, 20)}…)
          </span>
        )}
      </p>
      <p>
        <Link to={PROJECT_ROUTES['k2-galerie'].licences} className="btn primary-btn">
          Zu den Lizenzen
        </Link>
      </p>
      <p style={{ marginTop: '1rem' }}>
        <Link to={ENTDECKEN_ROUTE} style={{ color: 'var(--k2-accent)', fontSize: '0.9rem' }}>
          Zur Galerie-Entdeckung →
        </Link>
      </p>
    </main>
  )
}
