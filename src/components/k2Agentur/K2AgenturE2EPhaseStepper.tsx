/**
 * K2 Agentur – Phasen-Leiste (End-to-End).
 */

import type { CSSProperties } from 'react'
import {
  K2_AGENTUR_E2E_PHASEN,
  type K2AgenturE2EPhaseId,
} from '../../config/k2AgenturEndToEndFlow'

type PhaseStatus = { done: number; total: number; complete: boolean }

type Props = {
  activePhase: K2AgenturE2EPhaseId
  suggestedPhase: K2AgenturE2EPhaseId
  phaseStatus: Record<K2AgenturE2EPhaseId, PhaseStatus>
  onSelectPhase: (id: K2AgenturE2EPhaseId) => void
}

export default function K2AgenturE2EPhaseStepper({
  activePhase,
  suggestedPhase,
  phaseStatus,
  onSelectPhase,
}: Props) {
  return (
    <nav
      aria-label="End-to-End Phasen"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: '0.35rem',
        marginBottom: '1rem',
      }}
    >
      {K2_AGENTUR_E2E_PHASEN.map((phase) => {
        const st = phaseStatus[phase.id]
        const active = activePhase === phase.id
        const suggested = suggestedPhase === phase.id && !st.complete
        return (
          <button
            key={phase.id}
            type="button"
            onClick={() => onSelectPhase(phase.id)}
            style={phaseBtn(active, st.complete, suggested)}
          >
            <span style={{ fontSize: '0.72rem', fontWeight: 800, opacity: 0.9 }}>
              {st.complete ? '✓' : phase.nummer}
            </span>
            <span style={{ display: 'block', fontWeight: 800, fontSize: '0.88rem', marginTop: '0.15rem' }}>
              {phase.titel}
            </span>
            <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, marginTop: '0.2rem', opacity: 0.95 }}>
              {st.done}/{st.total}
            </span>
            {suggested && !active && (
              <span
                style={{
                  display: 'block',
                  marginTop: '0.25rem',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: '#b54a1e',
                }}
              >
                → hier
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}

function phaseBtn(active: boolean, complete: boolean, suggested: boolean): CSSProperties {
  if (active) {
    return {
      padding: '0.65rem 0.5rem',
      borderRadius: 10,
      border: '2px solid #b54a1e',
      background: '#b54a1e',
      color: '#fff',
      cursor: 'pointer',
      textAlign: 'center',
      fontFamily: 'inherit',
    }
  }
  if (complete) {
    return {
      padding: '0.65rem 0.5rem',
      borderRadius: 10,
      border: '2px solid #16a34a',
      background: '#ecfdf5',
      color: '#166534',
      cursor: 'pointer',
      textAlign: 'center',
      fontFamily: 'inherit',
    }
  }
  return {
    padding: '0.65rem 0.5rem',
    borderRadius: 10,
    border: suggested ? '2px dashed #b54a1e' : '1px solid #c4b8a8',
    background: '#fffefb',
    color: '#1c1a18',
    cursor: 'pointer',
    textAlign: 'center',
    fontFamily: 'inherit',
  }
}
