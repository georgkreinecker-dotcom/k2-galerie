import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getUsage, resetUsage, estimateCostUsd } from '../utils/openaiUsage'
import { PLATFORM_ROUTES } from '../config/navigation'

export default function KostenPage() {
  const [usage, setUsage] = useState(getUsage())

  useEffect(() => {
    const u = getUsage()
    setUsage(u)
  }, [])

  const cost = estimateCostUsd(usage)
  const totalTokens = usage.promptTokens + usage.completionTokens

  const handleReset = () => {
    resetUsage()
    setUsage(getUsage())
  }

  return (
    <div className="mission-wrapper">
      <div className="viewport">
        <header>
          <h1>Kosten-Überblick</h1>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to={PLATFORM_ROUTES.home} className="meta">← Plattform</Link>
            <Link to={PLATFORM_ROUTES.key} className="meta">API-Key</Link>
          </div>
        </header>

        <div className="card" style={{ maxWidth: '520px' }}>
          <h2>OpenAI-Nutzung in K2</h2>
          <p className="meta">Geschätzte Kosten basierend auf deiner Nutzung von KI-Dialog und Control-Studio (gpt-4o-mini).</p>

          {totalTokens === 0 ? (
            <p className="key-prominent-hint">
              Noch keine Nutzung erfasst. Die Zählung startet ab jetzt – jede KI-Antwort in K2 wird mitgezählt.
            </p>
          ) : (
            <div className="kosten-stats">
              <div className="kosten-row">
                <span>Anfragen (Eingabe)</span>
                <strong>{usage.promptTokens.toLocaleString('de-DE')} Tokens</strong>
              </div>
              <div className="kosten-row">
                <span>Antworten (Ausgabe)</span>
                <strong>{usage.completionTokens.toLocaleString('de-DE')} Tokens</strong>
              </div>
              <div className="kosten-row">
                <span>Gesamt</span>
                <strong>{totalTokens.toLocaleString('de-DE')} Tokens</strong>
              </div>
              <div className="kosten-row highlight">
                <span>Geschätzte Kosten</span>
                <strong>ca. {cost < 0.01 && cost > 0 ? '< 0,01' : cost.toFixed(2)} USD</strong>
              </div>
            </div>
          )}

          <button type="button" className="ghost-btn" onClick={handleReset}>
            Zähler zurücksetzen
          </button>
          <p className="meta" style={{ marginTop: '0.5rem' }}>Setzt nur die Anzeige hier zurück. Die echten Kosten siehst du bei OpenAI.</p>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '1.5rem 0' }} />

          <h3 className="muted">Echte Abrechnung bei OpenAI</h3>
          <p className="meta">Hier siehst du den genauen Verbrauch und kannst Limits setzen:</p>
          <a
            href="https://platform.openai.com/usage"
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
          >
            OpenAI Nutzung & Billing öffnen →
          </a>
        </div>
      </div>
    </div>
  )
}
