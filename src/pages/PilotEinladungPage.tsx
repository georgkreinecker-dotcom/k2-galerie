/**
 * Einstieg nach E-Mail-Einladung: Token prüfen → Name setzen → Weiter zu ök2 oder VK2.
 */

import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ENTDECKEN_ROUTE, WILLKOMMEN_NAME_KEY } from '../config/navigation'

const BG = '#f6f4f0'
const TEXT = '#1c1a18'
const MUTED = '#5c5650'
const BTN = '#0d9488'

/** Gleiche Logik wie api/pilotInviteShared (kein Import: Node/crypto). Mail-Clients: Zeilenumbrüche im Token. */
function normalizePilotTokenClient(raw: string): string {
  if (!raw) return ''
  return String(raw).trim().replace(/\s+/g, '')
}

type ValidateOk = {
  valid: true
  name: string
  firstName?: string
  lastName?: string
  email: string
  context: 'oeffentlich' | 'vk2'
  licenceType?: string
}

export default function PilotEinladungPage() {
  const [searchParams] = useSearchParams()
  const params = useParams()
  const navigate = useNavigate()
  /** `/p/*` = gesamter Token; alternativ Query `t` / `token` (Legacy pilot-einladung) */
  const splat = typeof params['*'] === 'string' ? params['*'] : ''
  const token = normalizePilotTokenClient(
    splat ||
      (typeof params.token === 'string' ? params.token : '') ||
      searchParams.get('t') ||
      searchParams.get('token') ||
      '',
  )

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errorHint, setErrorHint] = useState<string | null>(null)
  const [data, setData] = useState<ValidateOk | null>(null)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      setErrorHint(null)
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
          setErrorHint(null)
          setData({
            valid: true,
            name: String(j.name),
            firstName: typeof j.firstName === 'string' ? j.firstName : undefined,
            lastName: typeof j.lastName === 'string' ? j.lastName : undefined,
            email: String(j.email || ''),
            context: j.context === 'vk2' ? 'vk2' : 'oeffentlich',
            licenceType: j.licenceType,
          })
        } else {
          setErrorHint(typeof j.hint === 'string' ? j.hint : null)
          setError(j.error || 'Link ungültig oder abgelaufen.')
        }
      })
      .catch(() => {
        if (!cancelled) {
          setErrorHint(null)
          setError('Verbindung zum Server fehlgeschlagen.')
        }
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
        JSON.stringify({
          name: data.name,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          context: 'oeffentlich',
          licenceType: data.licenceType || 'propplus',
          pilotProPlusUnlimited: true,
        }),
      )
    } catch {
      /* ignore */
    }
    navigate('/admin?context=oeffentlich&tab=einstellungen&settings=stammdaten&pilot=1')
  }

  function goVk2() {
    if (!data) return
    try {
      sessionStorage.setItem(WILLKOMMEN_NAME_KEY, data.name)
      sessionStorage.setItem(
        'k2-pilot-einladung',
        JSON.stringify({
          name: data.name,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          context: 'vk2',
          licenceType: data.licenceType || 'propplus',
          pilotProPlusUnlimited: true,
        }),
      )
    } catch {
      /* ignore */
    }
    navigate('/admin?context=vk2&tab=einstellungen&settings=stammdaten&pilot=1')
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
          {errorHint ? (
            <p style={{ marginTop: '0.75rem', fontSize: '0.88rem', color: TEXT, lineHeight: 1.55 }}>
              {errorHint}
            </p>
          ) : null}
          {error === 'Server nicht konfiguriert.' ? (
            <div style={{ marginTop: '0.85rem', fontSize: '0.88rem', color: MUTED, lineHeight: 1.55 }}>
              <p style={{ margin: '0 0 0.65rem' }}>
                Es fehlt die Umgebungsvariable <code style={{ fontSize: '0.82em' }}>PILOT_INVITE_SECRET</code> auf dem Server, der diese Seite ausliefert – ohne sie kann kein Einladungslink geprüft werden.
              </p>
              <p style={{ margin: '0 0 0.65rem' }}>
                <strong>Vercel (k2-galerie.vercel.app):</strong> Dashboard → Projekt → Settings → Environment Variables → dieselbe Variable wie beim Erzeugen der Einladung (mind. 32 Zeichen), für Production und ggf. Preview. Danach einmal <strong>Redeploy</strong>.
              </p>
              <p style={{ margin: 0 }}>
                <strong>Lokal (localhost):</strong> In der Projekt-<code>.env</code> z. B.{' '}
                <code style={{ fontSize: '0.78em' }}>PILOT_INVITE_SECRET=…</code> setzen (siehe{' '}
                <code style={{ fontSize: '0.78em' }}>.env.example</code>), dann Dev-Server neu starten.
              </p>
            </div>
          ) : !errorHint ? (
            <div style={{ marginTop: '0.85rem', fontSize: '0.88rem', color: MUTED, lineHeight: 1.55 }}>
              <p style={{ margin: '0 0 0.65rem' }}>
                Typisch: Link abgelaufen, oder das Geheimnis passt nicht: Einladung und Prüfung müssen dasselbe{' '}
                <code style={{ fontSize: '0.82em' }}>PILOT_INVITE_SECRET</code> nutzen (lokal in{' '}
                <code style={{ fontSize: '0.82em' }}>.env.local</code> und auf Vercel <strong>identisch</strong>).
              </p>
              <p style={{ margin: 0 }}>
                <strong>Neuen Link erzeugen:</strong> APf → <strong>Lizenzen</strong> → Testpilot-Formular – am zuverlässigsten die Seite direkt auf{' '}
                <strong>k2-galerie.vercel.app</strong> öffnen, Einladung senden, dann den angezeigten Link oder „Persönlichen Link öffnen“ nutzen
                (nicht einen alten Tab mit localhost mischen).
              </p>
            </div>
          ) : null}
          <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: MUTED }}>
            <Link to={ENTDECKEN_ROUTE} style={{ color: BTN, fontWeight: 600 }}>
              Zur öffentlichen Einstiegsseite (Entdecken)
            </Link>
            {' · '}
            <Link to="/k2team-handbuch?doc=26-TESTPILOT-EINLADUNG-EINRICHTUNG.md" style={{ color: BTN, fontWeight: 600 }}>
              Einrichtung im Team-Handbuch
            </Link>
          </p>
        </div>
      )}

      {!loading && data && (
        <>
          <p style={{ fontSize: '1rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
            Hallo <strong>{data.firstName || data.name.split(/\s+/)[0] || data.name}</strong>, willkommen als Testpilot:in. Ein Klick – du bist in der richtigen
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
            Als Testpilot:in nutzt du die Stufe <strong>Pro++</strong> kostenlos und ohne Ablaufdatum. Tipp: In der
            Galerie „Admin“ wählen – oft ohne Passwort. Unter Einstellungen Namen und Kontakt eintragen.
          </p>
        </>
      )}
    </main>
  )
}
