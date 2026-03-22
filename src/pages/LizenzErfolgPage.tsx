/**
 * Seite nach erfolgreichem Stripe-Checkout (Redirect von Stripe).
 * URL: /lizenz-erfolg?session_id=...
 * Lädt Lizenz/URL per API und zeigt „Deine Galerie“ + „Admin“-Links. Enthält ausdruckbare Lizenzbestätigung.
 */
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import '../App.css'
import { PROJECT_ROUTES, ENTDECKEN_ROUTE } from '../config/navigation'
import { PRODUCT_BRAND_NAME } from '../config/tenantConfig'

type LicenceLinks = { galerie_url: string | null; admin_url: string; name: string; email: string }

export default function LizenzErfolgPage() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [links, setLinks] = useState<LicenceLinks | null>(null)
  const [linksError, setLinksError] = useState<string | null>(null)
  const bestaetigungsDatum = new Date().toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' })

  useEffect(() => {
    if (!sessionId) return
    let cancelled = false
    const delays = [0, 1500, 3000]
    const load = async (attempt = 0) => {
      try {
        const res = await fetch(`/api/get-licence-by-session?session_id=${encodeURIComponent(sessionId)}`)
        const data = await res.json().catch(() => ({}))
        if (cancelled) return
        if (data.error && !data.galerie_url) {
          if (attempt < delays.length - 1) {
            setTimeout(() => load(attempt + 1), delays[attempt + 1])
            return
          }
          setLinksError(data.hint || data.error)
          return
        }
        setLinks({
          galerie_url: data.galerie_url || null,
          admin_url: data.admin_url || '/projects/k2-galerie',
          name: data.name || '',
          email: data.email || '',
        })
        setLinksError(null)
      } catch {
        if (cancelled) return
        if (attempt < delays.length - 1) {
          setTimeout(() => load(attempt + 1), delays[attempt + 1])
          return
        }
        setLinksError('Verbindung fehlgeschlagen.')
      }
    }
    load()
    return () => { cancelled = true }
  }, [sessionId])

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
      <p className="lizenz-erfolg-no-print" style={{ color: 'var(--k2-muted)', marginBottom: '1rem' }}>
        Vielen Dank für deine Zahlung. Deine Lizenz ist aktiv.
      </p>
      {linksError && (
        <p className="lizenz-erfolg-no-print" style={{ fontSize: '0.9rem', color: 'var(--k2-muted)', marginBottom: '1rem' }}>
          {linksError}
        </p>
      )}
      {links && (links.galerie_url || links.admin_url) && (
        <div className="lizenz-erfolg-no-print" style={{ marginBottom: '1.5rem', textAlign: 'left', maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
          <p style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem' }}>Deine Galerie</p>
          {links.galerie_url && (
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem' }}>
              <a href={links.galerie_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--k2-accent)', wordBreak: 'break-all' }}>
                {links.galerie_url}
              </a>
            </p>
          )}
          <p style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem', marginTop: '1rem' }}>Galerie bearbeiten (Admin)</p>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            <a href={links.admin_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--k2-accent)', wordBreak: 'break-all' }}>
              {links.admin_url}
            </a>
          </p>
        </div>
      )}
      {sessionId && !links && !linksError && (
        <p className="lizenz-erfolg-no-print" style={{ fontSize: '0.8rem', color: 'var(--k2-muted)', marginBottom: '1.5rem' }}>
          Deine Galerie-Links werden geladen…
        </p>
      )}

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
          Vielen Dank für deinen Lizenzabschluss. Deine Lizenz ist aktiv.
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
