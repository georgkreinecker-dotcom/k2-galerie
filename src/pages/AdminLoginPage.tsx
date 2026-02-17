/**
 * Admin-Login (Supabase Auth). Wird angezeigt, wenn Supabase konfiguriert ist und noch keine Session.
 */
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { signIn } from '../utils/supabaseAuth'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const context = searchParams.get('context') || 'k2'
  const returnTo = context === 'oeffentlich' ? '/admin?context=oeffentlich' : '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { error: err } = await signIn(email.trim(), password)
      if (err) {
        setError(err)
        setLoading(false)
        return
      }
      if (context === 'oeffentlich') {
        try { sessionStorage.setItem('k2-admin-context', 'oeffentlich') } catch (_) {}
      } else {
        try { sessionStorage.setItem('k2-admin-context', 'k2') } catch (_) {}
      }
      navigate(returnTo, { replace: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#1a0f0a',
        color: '#fff5f0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        fontFamily: 'system-ui, sans-serif'
      }}
    >
      <h1 style={{ color: 'var(--k2-accent, #ff8c42)', marginBottom: '0.5rem' }}>Admin-Anmeldung</h1>
      <p style={{ color: '#aaa', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        K2 Galerie – sichere Anmeldung
      </p>
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: '320px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <input
          type="email"
          placeholder="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          style={{
            padding: '0.75rem 1rem',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 8,
            color: '#fff',
            fontSize: '1rem'
          }}
        />
        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          style={{
            padding: '0.75rem 1rem',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 8,
            color: '#fff',
            fontSize: '1rem'
          }}
        />
        {error && (
          <p style={{ color: '#ff6b6b', fontSize: '0.9rem', margin: 0 }}>{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--k2-accent, #ff8c42)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: '1rem',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Anmelden …' : 'Anmelden'}
        </button>
      </form>
      <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: '#888' }}>
        Nutzer in Supabase Dashboard anlegen (Authentication → Users).
      </p>
    </div>
  )
}
