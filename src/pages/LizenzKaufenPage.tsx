/**
 * Lizenz online kaufen – Startet Stripe Checkout.
 * Lizenztyp, E-Mail, Name; optional Empfehler-ID (aus URL ?empfehler= oder Eingabe).
 */
import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import '../App.css'
import { LIZENZPREISE } from '../config/licencePricing'
import { PROJECT_ROUTES } from '../config/navigation'
import { isValidEmpfehlerIdFormat } from '../utils/empfehlerId'

const LICENCE_OPTIONS = [
  { id: 'basic' as const, ...LIZENZPREISE.basic },
  { id: 'pro' as const, ...LIZENZPREISE.pro },
  { id: 'proplus' as const, ...LIZENZPREISE.proplus },
]

export default function LizenzKaufenPage() {
  const [searchParams] = useSearchParams()
  const empfehlerFromUrl = searchParams.get('empfehler')?.trim() || ''

  const [licenceType, setLicenceType] = useState<'basic' | 'pro' | 'proplus'>('pro')
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

  return (
    <main style={{ maxWidth: 480, margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Lizenz online kaufen</h1>
      <p style={{ color: 'var(--k2-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        Kreditkarte (Stripe) – sichere Zahlung. Nach dem Kauf wird deine Lizenz aktiv.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--k2-muted)' }}>Lizenz</label>
          <select
            value={licenceType}
            onChange={(e) => setLicenceType(e.target.value as 'basic' | 'pro' | 'proplus')}
            className="input"
            style={{ width: '100%' }}
          >
            {LICENCE_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.name} – {opt.price}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--k2-muted)' }}>Name *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Dein Name" required style={{ width: '100%' }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--k2-muted)' }}>E-Mail *</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="E-Mail" required style={{ width: '100%' }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--k2-muted)' }}>Empfehler-ID (optional) – 10 % Rabatt</label>
          <input
            type="text"
            value={empfehlerId}
            onChange={(e) => setEmpfehlerId(e.target.value)}
            className="input"
            placeholder="z. B. K2-E-XXXXXX"
            style={{ width: '100%' }}
          />
          {empfehlerId && !isValidEmpfehlerIdFormat(empfehlerId) && (
            <p style={{ fontSize: '0.8rem', color: 'var(--k2-muted)', marginTop: '0.25rem' }}>Format: K2-E- und 6 Zeichen</p>
          )}
        </div>

        {error && <p style={{ color: '#f87171', fontSize: '0.9rem', margin: 0 }}>{error}</p>}

        <button type="submit" className="btn primary-btn" disabled={loading} style={{ marginTop: '0.5rem' }}>
          {loading ? 'Wird weitergeleitet …' : 'Zur Kartenzahlung (Stripe) →'}
        </button>
      </form>

      <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--k2-muted)' }}>
        <Link to={PROJECT_ROUTES['k2-galerie'].licences} style={{ color: 'var(--k2-accent)' }}>← Zurück zu Lizenzen</Link>
      </p>
    </main>
  )
}
