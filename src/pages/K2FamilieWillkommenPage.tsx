/**
 * K2 Familie – Marketing-Einstieg (Flyer/QR).
 * Analog zur Galerie-Willkommensseite, aber eigene URL und Inhalt: Familie ≠ Galerie.
 * Kein Bearbeiten hier – nur Lesen und klare Wege zur Familien-App.
 * Einladungs-QR mit ?t=/ ?z= landet hier ohne Layout – sofort zur App mit gleicher Query (Tenant-Sync im Layout).
 */

import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useLayoutEffect } from 'react'
import { PROJECT_ROUTES } from '../config/navigation'
import { PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_URHEBER_ANWENDUNG } from '../config/tenantConfig'
import { setFamilieNurMusterSession } from '../utils/familieMusterSession'

const BG = 'linear-gradient(160deg, #042f2e 0%, #0f172a 48%, #134e4a 100%)'
const CARD = 'rgba(15, 23, 42, 0.55)'
const TEXT = '#f0f9ff'
const MUTED = 'rgba(240,249,255,0.78)'
const ACCENT = '#2dd4bf'

export default function K2FamilieWillkommenPage() {
  const R = PROJECT_ROUTES['k2-familie']
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useLayoutEffect(() => {
    const t = searchParams.get('t')?.trim()
    const z = searchParams.get('z')?.trim()
    const m = searchParams.get('m')?.trim()
    /** Wie Meine Familie / Einladungs-QR: Anzeigename für Geräte ohne gemeinsamen Speicher — nicht verwerfen. */
    const fnRaw = searchParams.get('fn')?.trim()
    const fn = fnRaw ? fnRaw.slice(0, 240) : ''
    /** Auch nur ?m= (ältere Links) oder nur ?fn= weiterreichen – sonst bleibt der Scan auf der Marketing-Seite ohne Layout-Sync. */
    if (!t && !z && !m && !fn) {
      setFamilieNurMusterSession(true)
      return
    }
    const next = new URLSearchParams()
    if (t) next.set('t', t)
    if (z) next.set('z', z)
    if (m) next.set('m', m)
    if (fn) next.set('fn', fn)
    navigate(`${R.meineFamilie}?${next.toString()}`, { replace: true })
  }, [searchParams, navigate, R.meineFamilie])

  return (
    <div
      style={{
        minHeight: '100vh',
        background: BG,
        color: TEXT,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <main style={{ flex: 1, maxWidth: 720, margin: '0 auto', padding: 'clamp(1.5rem, 5vw, 2.75rem)', width: '100%' }}>
        <p style={{ fontSize: '0.85rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: MUTED, marginBottom: '0.75rem' }}>
          K2 Familie
        </p>
        <h1 style={{ fontSize: 'clamp(1.65rem, 4.5vw, 2.25rem)', fontWeight: 800, lineHeight: 1.2, margin: '0 0 1rem' }}>
          Eure gemeinsame Geschichte – sichtbar und vernetzt
        </h1>
        <p style={{ fontSize: '1.05rem', lineHeight: 1.65, color: MUTED, marginBottom: '1.5rem' }}>
          Stammbaum, Kalender, Events und Gedenkort an einem Ort: eine Homepage für die Familie, die ihr selbst gestaltet.
          Bearbeiten und Sicherung findet ihr in der Familien-App – wie der Admin-Bereich bei der Galerie, nur für Familien.
        </p>

        <div
          style={{
            background: CARD,
            border: '1px solid rgba(45,212,191,0.25)',
            borderRadius: 16,
            padding: '1.35rem 1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          <p style={{ fontWeight: 700, marginBottom: '0.85rem', color: ACCENT }}>Ein Klick weiter</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <Link
              to={`${R.meineFamilie}?t=huber`}
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '0.95rem 1.15rem',
                borderRadius: 12,
                background: `linear-gradient(135deg, #0d9488 0%, ${ACCENT} 100%)`,
                color: '#042f2e',
                fontWeight: 800,
                textDecoration: 'none',
                fontSize: '1.05rem',
              }}
            >
              Weiter zum Familien-Einstieg
            </Link>
          </div>
        </div>
      </main>

      <footer
        style={{
          padding: '1.25rem clamp(1rem, 4vw, 2rem) 2rem',
          fontSize: '0.78rem',
          color: 'rgba(240,249,255,0.6)',
          lineHeight: 1.5,
          textAlign: 'center',
          borderTop: '1px solid rgba(45,212,191,0.12)',
        }}
      >
        <div>{PRODUCT_COPYRIGHT_BRAND_ONLY}</div>
        <div style={{ marginTop: '0.35rem' }}>{PRODUCT_URHEBER_ANWENDUNG}</div>
      </footer>
    </div>
  )
}
