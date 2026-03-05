/**
 * Künstler-Einstieg (Variante B): Eigener Einstieg für Admin – auf der Galerie sieht niemand einen Admin-Button.
 * Nur wer diese URL/QR nutzt, kommt hierher. Passwort optional (leer = sofort rein).
 * Wir halten uns aus der Passwort-Konfiguration raus: kein Reset, Nutzer verantwortlich.
 */
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { loadVk2Stammdaten } from '../utils/stammdatenStorage'

const KEY_OEF_ADMIN_PASSWORD = 'k2-oeffentlich-admin-password'

type Context = 'k2' | 'oeffentlich' | 'vk2'

function getPassword(context: Context): string {
  if (context === 'oeffentlich') {
    try {
      return (typeof localStorage !== 'undefined' ? localStorage.getItem(KEY_OEF_ADMIN_PASSWORD) : null) || ''
    } catch { return '' }
  }
  if (context === 'vk2') {
    try {
      const s = loadVk2Stammdaten()
      const pw = (s?.vorstand as { adminPassword?: string } | undefined)?.adminPassword
      return (pw && String(pw).trim()) || ''
    } catch { return '' }
  }
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('k2-stammdaten-galerie') : null
    if (!raw) return ''
    const data = JSON.parse(raw)
    return (data.adminPassword && String(data.adminPassword).trim()) || ''
  } catch { return '' }
}

export default function MeinBereichPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const contextParam = searchParams.get('context') as Context | null
  const context: Context = contextParam === 'oeffentlich' || contextParam === 'vk2' ? contextParam : 'k2'

  const [passwordInput, setPasswordInput] = useState('')
  const [error, setError] = useState('')
  const hasPassword = !!getPassword(context).trim()

  const goToAdmin = () => {
    try {
      const tab = searchParams.get('tab')
      const from = searchParams.get('from')
      const assistent = searchParams.get('assistent')
      const vorname = searchParams.get('vorname')
      const pfad = searchParams.get('pfad')
      const guidetab = searchParams.get('guidetab')
      const guidesubtab = searchParams.get('guidesubtab')
      const assistentPart = assistent ? `&assistent=${encodeURIComponent(assistent)}` : ''
      const vornamePart = vorname ? `&vorname=${encodeURIComponent(vorname)}` : ''
      const pfadPart = pfad ? `&pfad=${encodeURIComponent(pfad)}` : ''
      const tabPart = tab ? `&tab=${encodeURIComponent(tab)}` : ''
      const fromPart = from ? `&from=${encodeURIComponent(from)}` : ''
      const guidetabPart = guidetab ? `&guidetab=${encodeURIComponent(guidetab)}` : ''
      const guidesubtabPart = guidesubtab ? `&guidesubtab=${encodeURIComponent(guidesubtab)}` : ''
      const extra = `${tabPart}${fromPart}${assistentPart}${vornamePart}${pfadPart}${guidetabPart}${guidesubtabPart}`

      if (context === 'oeffentlich') {
        sessionStorage.setItem('k2-admin-context', 'oeffentlich')
        navigate('/admin?context=oeffentlich' + extra)
        return
      }
      if (context === 'vk2') {
        sessionStorage.setItem('k2-admin-context', 'vk2')
        navigate('/admin?context=vk2' + extra)
        return
      }
      sessionStorage.setItem('k2-admin-context', 'k2')
      navigate('/admin' + (extra ? '?' + extra.replace(/^&/, '') : ''))
    } catch (_) {
      setError('Navigation fehlgeschlagen.')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const current = getPassword(context)
    if (!current.trim()) {
      goToAdmin()
      return
    }
    if (passwordInput === current) {
      goToAdmin()
      return
    }
    setError('Falsches Passwort.')
    setPasswordInput('')
  }

  const title = context === 'vk2' ? 'Vereins-Admin' : context === 'oeffentlich' ? 'Demo-Admin' : 'Künstler-Bereich'
  const subTitle = context === 'vk2' ? 'Zugang für Vorstand/Verein' : context === 'oeffentlich' ? 'Zugang zur Demo-Galerie' : 'Dein Einstieg in den Admin'

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #1a0f0a 0%, #2d1a12 100%)',
      color: '#fff5f0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      boxSizing: 'border-box',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)', marginBottom: '0.5rem', textAlign: 'center' }}>
        {title}
      </h1>
      <p style={{ fontSize: '0.95rem', color: 'rgba(255,245,240,0.8)', marginBottom: '2rem', textAlign: 'center' }}>
        {subTitle}
      </p>

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '320px' }}>
        {hasPassword && (
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'rgba(255,245,240,0.9)' }}>
              Passwort (nur auf diesem Gerät – wir können es nicht zurücksetzen)
            </label>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Passwort eingeben"
              autoFocus
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>
        )}

        {error && (
          <p style={{ color: '#ff6b6b', fontSize: '0.9rem', marginBottom: '1rem' }}>{error}</p>
        )}

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '0.9rem 1.5rem',
            background: 'var(--k2-accent, #e67a2a)',
            border: 'none',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {hasPassword ? 'In den Admin' : 'In den Admin (ohne Passwort)'}
        </button>
      </form>

      {!hasPassword && (
        <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'rgba(255,245,240,0.6)', textAlign: 'center', maxWidth: '320px' }}>
          Optional kannst du in Admin → Einstellungen ein Passwort setzen. Vergessen = wir können nicht zurücksetzen.
        </p>
      )}
    </div>
  )
}
