/**
 * Lizenz online kaufen – User wählt Produkt per Klick, dann Zahlung (Stripe).
 * Design wie ök2/Willkommensseite: klare Kartenauswahl, danach Formular → Stripe Checkout.
 */
import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import '../App.css'
import { LIZENZPREISE } from '../config/licencePricing'
import { PROJECT_ROUTES, WILLKOMMEN_ROUTE } from '../config/navigation'
import { isValidEmpfehlerIdFormat } from '../utils/empfehlerId'
import { WERBEUNTERLAGEN_STIL, PROMO_FONTS_URL } from '../config/marketingWerbelinie'

const LICENCE_OPTIONS = [
  { id: 'basic' as const, ...LIZENZPREISE.basic },
  { id: 'pro' as const, ...LIZENZPREISE.pro },
  { id: 'proplus' as const, ...LIZENZPREISE.proplus },
  { id: 'propplus' as const, ...LIZENZPREISE.propplus },
]

export default function LizenzKaufenPage() {
  const [searchParams] = useSearchParams()
  const empfehlerFromUrl = searchParams.get('empfehler')?.trim() || ''

  const [licenceType, setLicenceType] = useState<'basic' | 'pro' | 'proplus' | 'propplus'>('pro')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [empfehlerId, setEmpfehlerId] = useState(empfehlerFromUrl)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (empfehlerFromUrl && isValidEmpfehlerIdFormat(empfehlerFromUrl)) setEmpfehlerId(empfehlerFromUrl)
  }, [empfehlerFromUrl])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email.trim() || !name.trim()) {
      setError('Bitte E-Mail und Name angeben.')
      return
    }
    setLoading(true)
    try {
      const base = typeof window !== 'undefined' ? window.location.origin : ''
      const res = await fetch(`${base}/api/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          licenceType,
          email: email.trim(),
          name: name.trim(),
          ...(empfehlerId.trim() && isValidEmpfehlerIdFormat(empfehlerId) ? { empfehlerId: empfehlerId.trim() } : {}),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error || data?.hint || 'Checkout konnte nicht gestartet werden.')
        setLoading(false)
        return
      }
      if (data?.url) {
        window.location.href = data.url
        return
      }
      setError('Keine Zahlungs-URL erhalten.')
    } catch (err) {
      setError('Verbindungsfehler. Bitte später erneut versuchen.')
    }
    setLoading(false)
  }

  const accent = '#ff8c42'
  const accentDeep = '#b54a1e'
  const bgLight = '#f6f0e8'
  const bgCard = '#fffefb'
  const text = '#2a1f14'
  const muted = '#7a6a58'
  const fontHeading = WERBEUNTERLAGEN_STIL.fontHeading
  const fontBody = WERBEUNTERLAGEN_STIL.fontBody

  return (
    <div style={{ background: bgLight, minHeight: '100vh', fontFamily: fontBody, color: text }}>
      <link rel="stylesheet" href={PROMO_FONTS_URL} />
      <main style={{ maxWidth: 560, margin: '0 auto', padding: 'clamp(2rem, 5vw, 3rem) 1rem' }}>
        <h1 style={{ fontFamily: fontHeading, fontSize: 'clamp(1.5rem, 4vw, 1.85rem)', fontWeight: 700, color: text, marginBottom: '0.35rem' }}>
          Lizenz auswählen & bezahlen
        </h1>
        <p style={{ color: muted, fontSize: '0.9rem', marginBottom: '1.75rem' }}>
          Produkt anklicken – Name und E-Mail eintragen – Zahlung per Karte (Stripe). Nach dem Kauf ist deine Lizenz aktiv.
        </p>
        <div style={{
          background: 'rgba(251,191,36,0.14)',
          border: '1px solid rgba(251,191,36,0.45)',
          borderRadius: '12px',
          padding: '0.8rem 1rem',
          marginBottom: '1.25rem',
          color: text
        }}>
          <div style={{ fontWeight: 700, color: accentDeep, marginBottom: '0.2rem' }}>📅 Hinweis</div>
          <div style={{ fontSize: '0.88rem', lineHeight: 1.45 }}>
            <strong>Öffentlicher regulärer Lizenzstart ab 01. Mai.</strong> Die Seite kann technisch schon genutzt werden; vor diesem Datum richtet sich der Ablauf an <strong>Testpilot:innen nach Einladung</strong> – nicht an den allgemeinen Produktstart für alle.
          </div>
        </div>

        {/* 1. Produkt per Klick auswählen */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: text, marginBottom: '0.6rem' }}>Lizenz wählen</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {LICENCE_OPTIONS.map((opt) => {
              const selected = licenceType === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setLicenceType(opt.id)}
                  style={{
                    padding: '1rem 0.75rem',
                    background: selected ? `${accent}14` : bgCard,
                    border: selected ? `2px solid ${accent}` : '1px solid rgba(181,74,30,0.25)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontFamily: fontBody,
                    textAlign: 'center',
                    transition: 'all 0.2s',
                    color: text,
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem' }}>{opt.name}</div>
                  <div style={{ fontSize: '0.9rem', color: accent, fontWeight: 600 }}>{opt.price}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* 2. Kontaktdaten + optional Empfehler */}
        <form onSubmit={handleSubmit} style={{ background: bgCard, border: `1px solid ${accent}44`, borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: muted }}>Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dein Name"
              required
              style={{ width: '100%', padding: '0.75rem 1rem', border: `1px solid ${accent}44`, borderRadius: '10px', fontFamily: fontBody, fontSize: '1rem', background: bgLight, color: text, boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: muted }}>E-Mail *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-Mail"
              required
              style={{ width: '100%', padding: '0.75rem 1rem', border: `1px solid ${accent}44`, borderRadius: '10px', fontFamily: fontBody, fontSize: '1rem', background: bgLight, color: text, boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: muted }}>Empfehler-ID (optional) – 10 % Rabatt</label>
            <input
              type="text"
              value={empfehlerId}
              onChange={(e) => setEmpfehlerId(e.target.value)}
              placeholder="z. B. K2-E-XXXXXX"
              style={{ width: '100%', padding: '0.75rem 1rem', border: `1px solid ${accent}44`, borderRadius: '10px', fontFamily: fontBody, fontSize: '1rem', background: bgLight, color: text, boxSizing: 'border-box' }}
            />
            {empfehlerId && !isValidEmpfehlerIdFormat(empfehlerId) && (
              <p style={{ fontSize: '0.8rem', color: muted, marginTop: '0.25rem' }}>Format: K2-E- und 6 Zeichen</p>
            )}
          </div>

          {error && <p style={{ color: '#c53030', fontSize: '0.9rem', margin: '0 0 1rem' }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem 1rem',
              background: loading ? muted : `linear-gradient(135deg, ${accent} 0%, ${accentDeep} 100%)`,
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: fontBody,
              fontSize: '1.05rem',
            }}
          >
            {loading ? 'Wird weitergeleitet …' : 'Jetzt bezahlen (Karte/Stripe) →'}
          </button>
        </form>

        <p style={{ fontSize: '0.85rem', color: muted, margin: 0 }}>
          <Link to={PROJECT_ROUTES['k2-galerie'].galerieOeffentlich} style={{ color: accent, textDecoration: 'underline' }}>← Zur Galerie</Link>
          {' · '}
          <Link to={WILLKOMMEN_ROUTE} style={{ color: accent, textDecoration: 'underline' }}>Willkommen</Link>
        </p>
      </main>
    </div>
  )
}
