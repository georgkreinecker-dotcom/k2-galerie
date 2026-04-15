/**
 * K2 Familie – Lizenz erwerben (Stripe Checkout).
 * Route: /projects/k2-familie/lizenz-erwerben
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../App.css'
import { K2_FAMILIE_LIZENZPREISE } from '../config/licencePricing'
import { AGB_ROUTE, PROJECT_ROUTES } from '../config/navigation'
import { PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_URHEBER_ANWENDUNG } from '../config/tenantConfig'
import { WERBEUNTERLAGEN_STIL, PROMO_FONTS_URL } from '../config/marketingWerbelinie'
import { isValidEmpfehlerIdFormat } from '../utils/empfehlerId'
import { openCheckoutOrPaymentUrl } from '../utils/openCheckoutOrPaymentUrl'
import { adminTheme } from '../config/theme'

type FamiliePlan = 'familie_monat' | 'familie_jahr'

const R = PROJECT_ROUTES['k2-familie']

const OPTIONS: { id: FamiliePlan; title: string; subtitle: string; preis: string }[] = [
  {
    id: 'familie_monat',
    title: K2_FAMILIE_LIZENZPREISE.familie_monat.name,
    subtitle: 'Abo – monatlich kündbar über Stripe',
    preis: K2_FAMILIE_LIZENZPREISE.familie_monat.price,
  },
  {
    id: 'familie_jahr',
    title: K2_FAMILIE_LIZENZPREISE.familie_jahr.name,
    subtitle: 'Einmalzahlung für ein Jahr',
    preis: K2_FAMILIE_LIZENZPREISE.familie_jahr.price,
  },
]

export default function K2FamilieLizenzErwerbenPage() {
  const [plan, setPlan] = useState<FamiliePlan>('familie_jahr')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [empfehlerId, setEmpfehlerId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkoutNewTab, setCheckoutNewTab] = useState(false)
  const [agbAccepted, setAgbAccepted] = useState(false)

  const a = adminTheme
  const accent = '#b54a1e'
  const accentSoft = '#d4622a'
  const bgPage = '#f6f4f0'
  const bgCard = '#fffefb'
  const text = '#1c1a18'
  const muted = '#5c5650'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setCheckoutNewTab(false)
    if (!email.trim() || !name.trim()) {
      setError('Bitte E-Mail und Name angeben.')
      return
    }
    if (!agbAccepted) {
      setError('Bitte die AGB lesen und bestätigen.')
      return
    }
    setLoading(true)
    try {
      const base = typeof window !== 'undefined' ? window.location.origin : ''
      const res = await fetch(`${base}/api/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          licenceType: plan,
          email: email.trim(),
          name: name.trim(),
          ...(empfehlerId.trim() && isValidEmpfehlerIdFormat(empfehlerId)
            ? { empfehlerId: empfehlerId.trim() }
            : {}),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const parts = [data?.error, data?.hint].filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
        setError(parts.length > 0 ? parts.join('\n\n') : 'Checkout konnte nicht gestartet werden.')
        setLoading(false)
        return
      }
      if (data?.url) {
        const how = openCheckoutOrPaymentUrl(data.url)
        if (how === 'new_tab') {
          setLoading(false)
          setCheckoutNewTab(true)
          return
        }
        if (how === 'popup_blocked') {
          setLoading(false)
          setError(
            `Der Browser hat das neue Fenster blockiert. Bitte Pop-ups erlauben oder diese Adresse öffnen:\n\n${data.url}`,
          )
          return
        }
        return
      }
      setError('Keine Zahlungs-URL erhalten.')
    } catch {
      setError('Verbindungsfehler. Bitte später erneut versuchen.')
    }
    setLoading(false)
  }

  return (
    <div style={{ background: bgPage, minHeight: '100vh', fontFamily: a.fontBody, color: text }}>
      <link rel="stylesheet" href={PROMO_FONTS_URL} />
      <main style={{ maxWidth: 560, margin: '0 auto', padding: 'clamp(1.5rem, 4vw, 2.5rem) 1rem' }}>
        <h1
          style={{
            fontFamily: WERBEUNTERLAGEN_STIL.fontHeading,
            fontSize: 'clamp(1.35rem, 3.5vw, 1.75rem)',
            fontWeight: 700,
            color: text,
            marginBottom: '0.35rem',
          }}
        >
          K2 Familie – Lizenz erwerben
        </h1>
        <p style={{ color: muted, fontSize: '0.92rem', marginBottom: '1.25rem', lineHeight: 1.55 }}>
          Zahlung über <strong>Stripe</strong> (wie bei der K2-Galerie-Lizenz) – monatlich oder jährlich. Nach erfolgreicher Zahlung
          siehst du die Bestätigung unter <strong>Lizenz erfolgreich</strong> (gleiche Erfolgsseite wie die Galerie).
        </p>

        <div
          style={{
            marginBottom: '1.25rem',
            padding: '0.75rem 1rem',
            background: 'rgba(181, 74, 30, 0.08)',
            border: '1px solid rgba(181, 74, 30, 0.22)',
            borderRadius: 12,
            fontSize: '0.88rem',
            lineHeight: 1.5,
          }}
        >
          <strong style={{ color: accent }}>Kurz</strong>
          <ul style={{ margin: '0.45rem 0 0', paddingLeft: '1.2rem' }}>
            <li>
              <strong>Familie Monatslizenz:</strong> {K2_FAMILIE_LIZENZPREISE.familie_monat.price}
            </li>
            <li>
              <strong>Familie Jahreslizenz:</strong> {K2_FAMILIE_LIZENZPREISE.familie_jahr.price}
            </li>
          </ul>
        </div>

        <div
          style={{
            marginBottom: '1.1rem',
            padding: '0.75rem 1rem',
            background: 'rgba(30, 41, 59, 0.06)',
            border: '1px solid rgba(30, 41, 59, 0.12)',
            borderRadius: 12,
            fontSize: '0.86rem',
            lineHeight: 1.55,
            color: text,
          }}
        >
          <strong style={{ color: accent }}>Wer ist Lizenznehmer:in?</strong>
          <p style={{ margin: '0.4rem 0 0' }}>
            Die <strong>Inhaber:in</strong> der Familien-Instanz ist die <strong>Lizenznehmer:in</strong> (dieser Kauf). <strong>Bearbeiter:innen</strong> und{' '}
            <strong>Leser:innen</strong> sind das nicht automatisch – sie werden eingeladen.
          </p>
        </div>

        <div
          style={{
            marginBottom: '1.25rem',
            padding: '0.75rem 1rem',
            background: 'rgba(30, 41, 59, 0.06)',
            border: '1px solid rgba(30, 41, 59, 0.12)',
            borderRadius: 12,
            fontSize: '0.86rem',
            lineHeight: 1.55,
            color: text,
          }}
        >
          <strong style={{ color: accent }}>Kündigung</strong>
          <p style={{ margin: '0.4rem 0 0' }}>
            Keine Bindung – <strong>jederzeit</strong> Ausstieg möglich (siehe AGB). Monatslizenz: Abo über{' '}
            <strong>Stripe</strong> kündigen. Jahreslizenz: Einmalzahlung, keine automatische App-Verlängerung.{' '}
            <strong>Vor</strong> dem Ende: <strong>Sicherung</strong> unter Einstellungen.
          </p>
          <Link
            to={R.lizenzKuendigen}
            style={{
              display: 'inline-block',
              marginTop: '0.65rem',
              padding: '0.55rem 0.9rem',
              background: `linear-gradient(135deg, ${accentSoft} 0%, ${accent} 100%)`,
              color: '#fff',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: '0.88rem',
              textDecoration: 'none',
            }}
          >
            → Lizenz kündigen (Stripe)
          </Link>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: text, marginBottom: '0.55rem' }}>Tarif wählen</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {OPTIONS.map((opt) => {
              const selected = plan === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPlan(opt.id)}
                  style={{
                    padding: '1rem 0.75rem',
                    background: selected ? 'rgba(181, 74, 30, 0.1)' : bgCard,
                    border: selected ? `2px solid ${accent}` : '1px solid rgba(181,74,30,0.25)',
                    borderRadius: 12,
                    cursor: 'pointer',
                    fontFamily: a.fontBody,
                    textAlign: 'center',
                    color: text,
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{opt.title}</div>
                  <div style={{ fontSize: '0.9rem', color: accent, fontWeight: 700 }}>{opt.preis}</div>
                  <div style={{ fontSize: '0.78rem', color: muted, marginTop: '0.35rem', lineHeight: 1.35 }}>{opt.subtitle}</div>
                </button>
              )
            })}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ background: bgCard, border: `1px solid rgba(181,74,30,0.2)`, borderRadius: 16, padding: '1.35rem' }}
        >
          <div style={{ marginBottom: '0.9rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', color: muted }}>Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              style={{
                width: '100%',
                padding: '0.7rem 0.9rem',
                border: `1px solid rgba(181,74,30,0.3)`,
                borderRadius: 10,
                fontFamily: a.fontBody,
                fontSize: '1rem',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ marginBottom: '0.9rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', color: muted }}>E-Mail *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{
                width: '100%',
                padding: '0.7rem 0.9rem',
                border: `1px solid rgba(181,74,30,0.3)`,
                borderRadius: 10,
                fontFamily: a.fontBody,
                fontSize: '1rem',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ marginBottom: '0.9rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', color: muted }}>
              Empfehler-ID (optional)
            </label>
            <input
              type="text"
              value={empfehlerId}
              onChange={(e) => setEmpfehlerId(e.target.value)}
              placeholder="z. B. K2-E-XXXXXX"
              style={{
                width: '100%',
                padding: '0.7rem 0.9rem',
                border: `1px solid rgba(181,74,30,0.3)`,
                borderRadius: 10,
                fontFamily: a.fontBody,
                fontSize: '1rem',
                boxSizing: 'border-box',
              }}
            />
            {empfehlerId && !isValidEmpfehlerIdFormat(empfehlerId) && (
              <p style={{ fontSize: '0.78rem', color: muted, marginTop: '0.25rem' }}>Format: K2-E- und 6 Zeichen</p>
            )}
          </div>

          <div style={{ marginBottom: '0.9rem' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.55rem',
                fontSize: '0.88rem',
                lineHeight: 1.45,
                cursor: 'pointer',
                color: text,
              }}
            >
              <input
                type="checkbox"
                checked={agbAccepted}
                onChange={(e) => setAgbAccepted(e.target.checked)}
                style={{ marginTop: '0.2rem', width: '1.05rem', height: '1.05rem', flexShrink: 0 }}
              />
              <span>
                Ich habe die{' '}
                <Link to={AGB_ROUTE} style={{ color: accent, fontWeight: 700 }}>
                  Allgemeinen Geschäftsbedingungen
                </Link>{' '}
                gelesen und akzeptiere sie. *
              </span>
            </label>
          </div>

          {checkoutNewTab && (
            <p
              style={{
                color: '#166534',
                fontSize: '0.88rem',
                margin: '0 0 0.85rem',
                padding: '0.6rem 0.8rem',
                background: 'rgba(34,197,94,0.12)',
                border: '1px solid rgba(22,101,52,0.35)',
                borderRadius: 10,
              }}
            >
              <strong>Stripe</strong> wurde in einem neuen Tab geöffnet – dort mit Karte zahlen.
            </p>
          )}
          {error && (
            <p style={{ color: '#b91c1c', fontSize: '0.9rem', margin: '0 0 0.85rem', whiteSpace: 'pre-line', lineHeight: 1.45 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !agbAccepted}
            style={{
              width: '100%',
              padding: '0.95rem 1rem',
              background: loading || !agbAccepted ? muted : `linear-gradient(135deg, ${accentSoft} 0%, ${accent} 100%)`,
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontWeight: 700,
              cursor: loading || !agbAccepted ? 'not-allowed' : 'pointer',
              fontFamily: a.fontBody,
              fontSize: '1.02rem',
            }}
          >
            {loading ? 'Wird weitergeleitet …' : 'Weiter zur Zahlung (Stripe) →'}
          </button>
        </form>

        <p style={{ fontSize: '0.85rem', color: muted, marginTop: '1.25rem', lineHeight: 1.55 }}>
          <Link to={R.meineFamilie} style={{ color: accent, fontWeight: 600 }}>
            ← Zurück zu Meine Familie
          </Link>
          {' · '}
          <Link to={R.einstellungen} style={{ color: accent, fontWeight: 600 }}>
            Einstellungen
          </Link>
        </p>

        <footer
          style={{
            marginTop: '2rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(181,74,30,0.2)',
            fontSize: '0.72rem',
            color: muted,
            lineHeight: 1.5,
          }}
        >
          <div>{PRODUCT_COPYRIGHT_BRAND_ONLY}</div>
          <div style={{ marginTop: '0.35rem' }}>{PRODUCT_URHEBER_ANWENDUNG}</div>
        </footer>
      </main>
    </div>
  )
}
