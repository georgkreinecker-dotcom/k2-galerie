/**
 * K2 Agentur E2E – Phase 1: Konten (einmal für alle Kanäle).
 */

import type { CSSProperties } from 'react'
import {
  K2_AGENTUR_GLOBAL_LAUNCH_STEPS,
  K2_AGENTUR_PLATTFORM_CONSOLE_URL,
} from '../../config/k2AgenturLaunchCheckliste'
import { formatCreativeSpecText } from '../../config/k2AgenturCreativeSpec'
import {
  getGlobalChecklistProgress,
  toggleGlobalSchritt,
  type K2AgenturPlattformState,
} from '../../utils/k2AgenturPlattformStorage'

type Props = {
  state: K2AgenturPlattformState
  onPersist: (next: K2AgenturPlattformState) => void
  onCopyFeedback: (msg: string) => void
  copyText: (text: string) => Promise<boolean>
  onWeiterSchalten: () => void
  vorbereitenComplete: boolean
}

const KONTO_LINKS: Record<string, { url: string; label: string }> = {
  'global-google-konto': { url: K2_AGENTUR_PLATTFORM_CONSOLE_URL.google, label: 'Google Ads öffnen' },
  'global-meta-konto': { url: K2_AGENTUR_PLATTFORM_CONSOLE_URL.meta, label: 'Meta Business öffnen' },
  'global-linkedin-konto': { url: K2_AGENTUR_PLATTFORM_CONSOLE_URL.linkedin, label: 'LinkedIn Ads öffnen' },
}

export default function K2AgenturVorbereitenPhasePanel({
  state,
  onPersist,
  onCopyFeedback,
  copyText,
  onWeiterSchalten,
  vorbereitenComplete,
}: Props) {
  const prog = getGlobalChecklistProgress(state)

  const handleCreative = async () => {
    const ok = await copyText(formatCreativeSpecText())
    onCopyFeedback(ok ? '✅ Creative-Spez kopiert' : '⚠️ Kopieren fehlgeschlagen')
  }

  return (
    <section
      style={{
        padding: '1rem 1.1rem',
        borderRadius: 12,
        border: '2px solid #0d9488',
        background: '#fffefb',
      }}
    >
      <p style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: '#5c5650', lineHeight: 1.5 }}>
        <strong>End-to-End Schritt 1:</strong> Drei Werbekonten einmal einrichten. Danach arbeitest du nur noch in
        Phase 2 (Kanal für Kanal).
      </p>

      <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {K2_AGENTUR_GLOBAL_LAUNCH_STEPS.map((step, index) => {
          const checked = state.globalSchritte[step.id] === true
          const link = KONTO_LINKS[step.id]
          return (
            <li
              key={step.id}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                alignItems: 'center',
                padding: '0.65rem 0.75rem',
                borderRadius: 10,
                border: checked ? '1px solid #6ee7b7' : '1px solid #d4c8b8',
                background: checked ? '#ecfdf5' : '#faf8f5',
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: checked ? '#16a34a' : '#b54a1e',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {checked ? '✓' : index + 1}
              </span>
              <label style={{ flex: 1, minWidth: 180, cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => onPersist(toggleGlobalSchritt(state, step.id, e.target.checked))}
                  style={{ width: 18, height: 18 }}
                />
                <span style={{ fontWeight: 700, color: '#1c1a18', fontSize: '0.9rem' }}>{step.label}</span>
              </label>
              {link && (
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: 8,
                    border: '1px solid #c4b8a8',
                    background: '#fffefb',
                    color: '#1c1a18',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    textDecoration: 'none',
                  }}
                >
                  ↗ {link.label}
                </a>
              )}
            </li>
          )
        })}
      </ol>

      <div style={{ marginTop: '0.85rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
        <button type="button" onClick={handleCreative} style={secondaryBtn}>
          🎨 Creative-Maße kopieren
        </button>
        <span style={{ fontSize: '0.82rem', color: '#5c5650', fontWeight: 600 }}>
          Fortschritt: {prog.done}/{prog.total}
        </span>
      </div>

      {vorbereitenComplete && (
        <button type="button" onClick={onWeiterSchalten} style={{ ...primaryBtn, width: '100%', marginTop: '1rem' }}>
          → Weiter zu Phase 2: Kanal schalten
        </button>
      )}
    </section>
  )
}

const primaryBtn: CSSProperties = {
  padding: '0.7rem 1rem',
  borderRadius: 10,
  border: 'none',
  background: '#b54a1e',
  color: '#fff',
  fontWeight: 800,
  fontSize: '0.95rem',
  cursor: 'pointer',
}

const secondaryBtn: CSSProperties = {
  padding: '0.45rem 0.85rem',
  borderRadius: 8,
  border: '1px solid #c4b8a8',
  background: '#fffefb',
  color: '#1c1a18',
  fontWeight: 700,
  fontSize: '0.85rem',
  cursor: 'pointer',
}
