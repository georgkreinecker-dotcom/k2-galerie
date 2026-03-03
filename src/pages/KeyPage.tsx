import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { PLATFORM_ROUTES } from '../config/navigation'

const STORAGE_KEY = 'k2-control-openai-key'

function maskKey(key: string) {
  if (!key || key.length < 12) return key ? '••••••••' : ''
  return key.slice(0, 7) + '••••••••' + key.slice(-4)
}

export default function KeyPage() {
  const [key, setKey] = useState('')
  const [visible, setVisible] = useState(false)
  const [saved, setSaved] = useState(false)
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setKey(localStorage.getItem(STORAGE_KEY) || '')
  }, [])

  useEffect(() => {
    return () => {
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current)
    }
  }, [])

  const save = () => {
    const v = key.trim()
    if (v) {
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current)
      localStorage.setItem(STORAGE_KEY, v)
      setSaved(true)
      savedTimeoutRef.current = setTimeout(() => setSaved(false), 2000)
    }
  }

  const downloadForDesktop = () => {
    const v = key.trim()
    if (!v) return
    const blob = new Blob([v], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'openai-key.txt'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="mission-wrapper">
      <div className="viewport">
        <header>
          <h1>OpenAI API-Key</h1>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to={PLATFORM_ROUTES.home} className="meta">← Plattform</Link>
            <Link to={PLATFORM_ROUTES.kosten} className="meta">Kosten-Überblick</Link>
          </div>
        </header>

        <div className="card" style={{ maxWidth: '520px' }}>
          <h2>Key anzeigen & eintragen</h2>

          {!key && (
            <p className="key-prominent-hint">
              Noch keiner gespeichert. Key von <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">platform.openai.com</a> kopieren und unten einfügen → Speichern.
            </p>
          )}

          <label className="field">
            <span>{key ? 'Key eintragen oder ändern' : '👉 Hier Key einfügen (sk-...)'}</span>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk-..."
              autoComplete="off"
              className="key-input"
            />
          </label>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button type="button" className="btn-primary" onClick={save}>
              Speichern
            </button>
            {saved && <span className="meta">Gespeichert.</span>}
          </div>

          {key && (
            <label className="field" style={{ marginTop: '1rem' }}>
              <span>Gespeicherter Key</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <code className="key-display">
                  {visible ? key : maskKey(key)}
                </code>
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => setVisible(!visible)}
                >
                  {visible ? 'Verbergen' : 'Anzeigen'}
                </button>
              </div>
            </label>
          )}

          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '1.5rem 0' }} />

          <h3 className="muted">Für K2 Dialog (Desktop-App)</h3>
          <p className="meta">Key herunterladen, dann im Terminal ausführen:</p>
          <code className="key-code">/Users/georgkreinecker/k2Galerie/scripts/key-nach-desktop-app.sh</code>
          <button
            type="button"
            className="ghost-btn"
            style={{ marginTop: '0.5rem' }}
            onClick={downloadForDesktop}
          >
            Key-Datei für Desktop herunterladen
          </button>
        </div>
      </div>
    </div>
  )
}
