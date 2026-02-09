import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PLATFORM_ROUTES } from '../config/navigation'

const STORAGE_KEY = 'k2-github-token'

function maskToken(token: string) {
  if (!token || token.length < 12) return token ? '••••••••' : ''
  return token.slice(0, 7) + '••••••••' + token.slice(-4)
}

export default function GitHubTokenPage() {
  const [token, setToken] = useState('')
  const [visible, setVisible] = useState(false)
  const [saved, setSaved] = useState(false)

  // Lade gespeicherten Token beim Start
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) setToken(stored)
  }, [])

  const save = () => {
    const v = token.trim()
    if (v) {
      localStorage.setItem(STORAGE_KEY, v)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const openGitHubTokens = () => {
    window.open('https://github.com/settings/tokens', '_blank')
  }

  const openNewToken = () => {
    window.open('https://github.com/settings/tokens/new', '_blank')
  }

  return (
    <div className="mission-wrapper">
      <div className="viewport">
        <header>
          <h1>🔑 GitHub Token</h1>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to={PLATFORM_ROUTES.home} className="meta">← Plattform</Link>
            <Link to={PLATFORM_ROUTES.key} className="meta">OpenAI Key</Link>
          </div>
        </header>

        <div className="card" style={{ maxWidth: '600px' }}>
          <h2>Token generieren & speichern</h2>

          {!token && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ marginTop: 0 }}>📝 Schritt für Schritt:</h3>
              <ol style={{ margin: '0.5rem 0', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
                <li>Klicke auf <strong>"Token generieren"</strong> (öffnet GitHub)</li>
                <li>Name: <code>k2-galerie-push</code></li>
                <li>Expiration: Wähle eine Dauer (z.B. "90 days")</li>
                <li>Scopes: Aktiviere <code>repo</code> (alle Unterpunkte)</li>
                <li>Klicke auf <strong>"Generate token"</strong></li>
                <li>Kopiere den Token (beginnt mit <code>ghp_...</code>)</li>
                <li>Füge ihn unten ein und klicke <strong>"Speichern"</strong></li>
              </ol>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={openNewToken}
              style={{ flex: '1', minWidth: '200px' }}
            >
              🚀 Token generieren
            </button>
            <button
              type="button"
              className="ghost-btn"
              onClick={openGitHubTokens}
            >
              📋 Meine Tokens anzeigen
            </button>
          </div>

          <label className="field">
            <span>{token ? 'Token eintragen oder ändern' : '👉 Hier Token einfügen (ghp_...)'}</span>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_..."
              autoComplete="off"
              className="key-input"
            />
          </label>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '1rem' }}>
            <button type="button" className="btn-primary" onClick={save}>
              💾 Speichern
            </button>
            {saved && <span className="meta" style={{ color: '#10b981' }}>✅ Gespeichert!</span>}
          </div>

          {token && (
            <div style={{ marginTop: '1.5rem' }}>
              <label className="field">
                <span>Gespeicherter Token</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <code className="key-display">
                    {visible ? token : maskToken(token)}
                  </code>
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={() => setVisible(!visible)}
                  >
                    {visible ? '👁️ Verbergen' : '👁️ Anzeigen'}
                  </button>
                </div>
              </label>
            </div>
          )}

          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '2rem 0' }} />

          <h3 className="muted">💡 Verwendung:</h3>
          <p className="meta" style={{ marginBottom: '0.5rem' }}>
            Beim <code>git push</code> im Terminal:
          </p>
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '1rem',
            borderRadius: '6px',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            lineHeight: '1.6'
          }}>
            <div>Username: <code style={{ color: '#10b981' }}>georgkreinecker-dotcom</code></div>
            <div>Password: <code style={{ color: '#10b981' }}>Dein Token (ghp_...)</code></div>
          </div>

          <p className="meta" style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
            ⚠️ <strong>Wichtig:</strong> Verwende den Token als Password, nicht dein GitHub-Passwort!
          </p>
        </div>
      </div>
    </div>
  )
}
