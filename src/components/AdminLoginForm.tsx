/**
 * Admin-Login (Supabase): E-Mail + Passwort.
 * Wird nur angezeigt, wenn Supabase konfiguriert ist und keine Session besteht.
 * Siehe docs/ADMIN-AUTH-SETUP.md, docs/SICHERHEIT-VOR-GO-LIVE.md
 */
import React, { useState } from 'react'
import { signIn } from '../utils/supabaseAuth'

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    minHeight: '100vh',
    background: '#f6f4f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    fontFamily: "'Source Sans 3', -apple-system, sans-serif"
  },
  card: {
    background: '#fffefb',
    borderRadius: 14,
    padding: 32,
    maxWidth: 380,
    width: '100%',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid rgba(0,0,0,0.06)'
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: 22,
    fontWeight: 600,
    color: '#1c1a18'
  },
  sub: {
    margin: '0 0 24px 0',
    fontSize: 14,
    color: '#5c5650'
  },
  label: {
    display: 'block',
    marginBottom: 6,
    fontSize: 14,
    fontWeight: 500,
    color: '#1c1a18'
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '10px 12px',
    marginBottom: 16,
    fontSize: 16,
    border: '1px solid rgba(0,0,0,0.12)',
    borderRadius: 8,
    color: '#1c1a18'
  },
  btn: {
    width: '100%',
    padding: '12px 16px',
    fontSize: 16,
    fontWeight: 600,
    color: '#fff',
    background: '#b54a1e',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    marginTop: 8
  },
  error: {
    marginTop: 12,
    padding: 10,
    fontSize: 14,
    color: '#b54a1e',
    background: 'rgba(181,74,30,0.08)',
    borderRadius: 8
  }
}

export default function AdminLoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) {
      setError('E-Mail und Passwort eingeben.')
      return
    }
    setLoading(true)
    try {
      const { error: err } = await signIn(email.trim(), password)
      if (err) setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h1 style={styles.title}>Admin-Anmeldung</h1>
        <p style={styles.sub}>K2 Galerie – nur mit gültigem Zugang.</p>
        <form onSubmit={handleSubmit}>
          <label style={styles.label} htmlFor="admin-email">E-Mail</label>
          <input
            id="admin-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            disabled={loading}
          />
          <label style={styles.label} htmlFor="admin-password">Passwort</label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            disabled={loading}
          />
          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'Wird angemeldet…' : 'Anmelden'}
          </button>
        </form>
        {error && <div style={styles.error}>{error}</div>}
      </div>
    </div>
  )
}
