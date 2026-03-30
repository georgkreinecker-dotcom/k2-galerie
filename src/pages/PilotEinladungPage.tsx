/**
 * Einstieg nach E-Mail-Einladung: Token prüfen → Name setzen → Weiter zu ök2 oder VK2.
 */

import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ENTDECKEN_ROUTE,
  PROJECT_ROUTES,
  WILLKOMMEN_NAME_KEY,
} from '../config/navigation'

const BG = '#f6f4f0'
const TEXT = '#1c1a18'
const MUTED = '#5c5650'
const BTN = '#0d9488'

type ValidateOk = {
  valid: true
  name: string
  email: string
  context: 'oeffentlich' | 'vk2'
  licenceType?: string
}

export default function PilotEinladungPage() {
  const [searchParams] = useSearchParams()
  const params = useParams()
  const navigate = useNavigate()
  const token = params.token || searchParams.get('t') || searchParams.get('token') || ''

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ValidateOk | null>(null)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      setError('Kein Einladungslink – bitte den Link aus der E-Mail vollständig nutzen.')
      return
    }
    let cancelled = false
    const base = window.location.origin
    fetch(`${base}/api/validate-pilot-token?t=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return
        if (j.valid === true && j.name) {
          setData({
            valid: true,
            name: String(j.name),
            email: String(j.email || ''),
            context: j.context === 'vk2' ? 'vk2' : 'oeffentlich',
            licenceType: j.licenceType,
          })
        } else {
          setError(j.error || 'Link ungültig oder abgelaufen.')
        }
      })
      .catch(() => {
        if (!cancelled) setError('Verbindung zum Server fehlgeschlagen.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [token])

  function goOek2() {
    if (!data) return
    try {
      sessionStorage.setItem(WILLKOMMEN_NAME_KEY, data.name)
      sessionStorage.setItem(
        'k2-pilot-einladung',
        JSON.stringify({ name: data.name, email: data.email, context: 'oeffentlich' }),
      )
    } catch {
      /* ignore */
    }
    navigate(ENTDECKEN_ROUTE)
  }

  function goVk2() {
    if (!data) return
    try {
      sessionStorage.setItem(WILLKOMMEN_NAME_KEY, data.name)
      sessionStorage.setItem(
        'k2-pilot-einladung',
        JSON.stringify({ name: data.name, email: data.email, context: 'vk2' }),
      )
    } catch {
      /* ignore */
    }
    navigate(PROJECT_ROUTES.vk2.galerie)
  }

  return (
    <main
      style={{
        padding: '2rem',
        maxWidth: 520,
        margin: '0 auto',
        background: BG,
        minHeight: '100vh',
        color: TEXT,
      }}
    >
      <h1 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>Testpilot-Einladung</h1>

      {loading && <p style={{ color: MUTED }}>Einladung wird geprüft …</p>}

      {!loading && error && (
        <div
          style={{
            padding: '1rem',
            background: '#fff',
            borderRadius: 8,
            border: '1px solid #e7e5e0',
          }}
        >
          <p style={{ margin: 0 }}>{error}</p>
          <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: MUTED }}>
            <Link to={PROJECT_ROUTES['k2-galerie'].licences} style={{ color: BTN, fontWeight: 600 }}>
              Zur Lizenzen-Seite
            </Link>
          </p>
        </div>
      )}

      {!loading && data && (
        <>
          <p style={{ fontSize: '1rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
            Hallo <strong>{data.name}</strong>, willkommen als Testpilot:in. Ein Klick – du bist in der richtigen
            Demo.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.context === 'vk2' ? (
              <button
                type="button"
                onClick={goVk2}
                style={{
                  padding: '0.75rem 1rem',
                  background: BTN,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Weiter zur VK2-Vorschau (Verein)
              </button>
            ) : (
              <button
                type="button"
                onClick={goOek2}
                style={{
                  padding: '0.75rem 1rem',
                  background: BTN,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Weiter zur öffentlichen Demo (ök2)
              </button>
            )}
            {data.context === 'oeffentlich' && (
              <button
                type="button"
                onClick={goVk2}
                style={{
                  padding: '0.65rem 1rem',
                  background: '#fff',
                  color: TEXT,
                  border: '1px solid #ccc',
                  borderRadius: 8,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                }}
              >
                Stattdessen VK2-Vorschau öffnen
              </button>
            )}
            {data.context === 'vk2' && (
              <button
                type="button"
                onClick={goOek2}
                style={{
                  padding: '0.65rem 1rem',
                  background: '#fff',
                  color: TEXT,
                  border: '1px solid #ccc',
                  borderRadius: 8,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                }}
              >
                Stattdessen ök2-Demo öffnen
              </button>
            )}
          </div>
          <p style={{ fontSize: '0.82rem', color: MUTED, marginTop: '1.25rem', lineHeight: 1.5 }}>
            Tipp: Auf der Galerie „Admin“ wählen – in den ersten Wochen oft ohne Passwort. Unter Einstellungen
            Namen und Kontakt eintragen.
          </p>
        </>
      )}
    </main>
  )
}
