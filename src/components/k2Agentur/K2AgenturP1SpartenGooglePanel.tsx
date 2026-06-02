/**
 * P1 · Google · Phase B – Sparten-Keywords (eigene Anzeigengruppen, Top 8).
 */

import { useState, type CSSProperties } from 'react'
import { buildMarketingKanalUrl } from '../../config/marketingKanalP1P2P3'
import {
  formatGoogleKeywordsP1SparteAnzeigengruppePaket,
  formatGoogleKeywordsP1SpartenPhaseBPlan,
  listP1SparteGoogleAdGroupPlans,
  P1_GOOGLE_SPARTE_KEYWORD_TOP,
} from '../../config/k2AgenturGoogleKeywordsP1Sparten'
import { K2_AGENTUR_KEYWORDS_P1_SPARTEN_DRUCK_URL } from '../../config/k2AgenturStrategieKeywordsRegistry'

type Props = {
  copyText: (text: string) => Promise<boolean>
  onCopyFeedback?: (msg: string) => void
}

export default function K2AgenturP1SpartenGooglePanel({ copyText, onCopyFeedback }: Props) {
  const [hint, setHint] = useState<string | null>(null)
  const landingUrl = buildMarketingKanalUrl('p1', 'google')
  const plans = listP1SparteGoogleAdGroupPlans()

  const feedback = (msg: string) => {
    setHint(msg)
    onCopyFeedback?.(msg)
    setTimeout(() => setHint(null), 2800)
  }

  const handleCopy = async (text: string, okMsg: string) => {
    const ok = await copyText(text)
    feedback(ok ? `✅ ${okMsg}` : '⚠️ Kopieren fehlgeschlagen')
  }

  return (
    <section
      style={{
        padding: '0.85rem 1rem',
        borderRadius: 10,
        border: '2px solid #0d9488',
        background: 'linear-gradient(145deg, #f0fdfa 0%, #ecfdf5 100%)',
      }}
    >
      <h3 style={{ margin: '0 0 0.35rem', fontSize: '0.95rem', color: '#1c1a18' }}>
        🌿 Phase B · P1 Google · 5 Sparten
      </h3>
      <p style={{ margin: '0 0 0.65rem', fontSize: '0.84rem', color: '#5c5650', lineHeight: 1.5 }}>
        Nach dem <strong>Kunst-Pilot</strong> (13 Begriffe): je Sparte eine{' '}
        <strong>eigene Anzeigengruppe</strong> mit <strong>Top {P1_GOOGLE_SPARTE_KEYWORD_TOP} Keywords</strong> – nicht
        alles in eine Liste bis 50.
      </p>

      {hint && (
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.82rem', fontWeight: 700, color: '#0f766e' }}>{hint}</p>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.65rem' }}>
        <button
          type="button"
          style={primaryBtn}
          onClick={() =>
            handleCopy(formatGoogleKeywordsP1SpartenPhaseBPlan(landingUrl), 'Phase-B-Plan kopiert')
          }
        >
          📋 Gesamtplan (5 Sparten)
        </button>
        <a href={K2_AGENTUR_KEYWORDS_P1_SPARTEN_DRUCK_URL} target="_blank" rel="noopener noreferrer" style={linkBtn}>
          Druck · alle Sparten
        </a>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
        {plans.map((plan) => (
          <SparteRow
            key={plan.sparte}
            plan={plan}
            onCopy={() =>
              handleCopy(
                formatGoogleKeywordsP1SparteAnzeigengruppePaket(plan.sparte, landingUrl),
                `${plan.label} · Keywords kopiert`,
              )
            }
          />
        ))}
      </div>
    </section>
  )
}

function SparteRow({
  plan,
  onCopy,
}: {
  plan: ReturnType<typeof listP1SparteGoogleAdGroupPlans>[number]
  onCopy: () => void
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.45rem 0.55rem',
        borderRadius: 8,
        border: '1px solid #99f6e4',
        background: '#fffefb',
      }}
    >
      <span style={{ flex: 1, minWidth: 140, fontSize: '0.85rem', fontWeight: 700, color: '#1c1a18' }}>
        {plan.label}
      </span>
      <span style={{ fontSize: '0.72rem', color: '#5c5650' }}>
        {plan.keywordCount} Keywords · <code style={{ fontSize: '0.7rem' }}>{plan.campaignKey}</code>
      </span>
      <button type="button" onClick={onCopy} style={secondaryBtn}>
        Keywords kopieren
      </button>
    </div>
  )
}

const primaryBtn: CSSProperties = {
  padding: '0.45rem 0.75rem',
  borderRadius: 8,
  border: 'none',
  background: '#0f766e',
  color: '#fff',
  fontWeight: 700,
  fontSize: '0.82rem',
  cursor: 'pointer',
}

const secondaryBtn: CSSProperties = {
  padding: '0.35rem 0.6rem',
  borderRadius: 8,
  border: '1px solid #0f766e',
  background: '#f0fdfa',
  color: '#0f766e',
  fontWeight: 700,
  fontSize: '0.78rem',
  cursor: 'pointer',
}

const linkBtn: CSSProperties = {
  ...secondaryBtn,
  textDecoration: 'none',
  display: 'inline-block',
}
