import { describe, it, expect } from 'vitest'
import {
  getK2AgenturE2EPhaseStatus,
  getSuggestedK2AgenturE2EPhase,
  K2_AGENTUR_E2E_PHASEN,
} from '../config/k2AgenturEndToEndFlow'
import { globalStepIds } from '../config/k2AgenturLaunchCheckliste'
import { K2_AGENTUR_KANAL_PRIORITY } from '../config/k2AgenturKanalPrioritaet'
import {
  createDefaultK2AgenturPlattformState,
  kanalStorageKey,
  toggleGlobalSchritt,
} from '../utils/k2AgenturPlattformStorage'

describe('k2AgenturEndToEndFlow', () => {
  it('drei Phasen in fester Reihenfolge', () => {
    expect(K2_AGENTUR_E2E_PHASEN.map((p) => p.id)).toEqual(['vorbereiten', 'schalten', 'auswerten'])
  })

  it('frischer Stand: Phase 1 vorbereiten vorgeschlagen', () => {
    const s = createDefaultK2AgenturPlattformState()
    expect(getSuggestedK2AgenturE2EPhase(s)).toBe('vorbereiten')
    const status = getK2AgenturE2EPhaseStatus(s)
    expect(status.vorbereiten.complete).toBe(false)
  })

  it('alle globalen Konten abgehakt → schalten vorgeschlagen', () => {
    let s = createDefaultK2AgenturPlattformState()
    for (const id of globalStepIds()) {
      s = toggleGlobalSchritt(s, id, true)
    }
    expect(getSuggestedK2AgenturE2EPhase(s)).toBe('schalten')
    expect(getK2AgenturE2EPhaseStatus(s).vorbereiten.complete).toBe(true)
  })

  it('alle Kanäle live + Auswertung geplant → auswerten vorgeschlagen', () => {
    let s = createDefaultK2AgenturPlattformState()
    for (const id of globalStepIds()) {
      s = toggleGlobalSchritt(s, id, true)
    }
    for (const slot of K2_AGENTUR_KANAL_PRIORITY) {
      const k = kanalStorageKey(slot.produkt, slot.kanal)
      s = {
        ...s,
        kanaele: { ...s.kanaele, [k]: { ...s.kanaele[k], status: 'live' } },
        kanalSchritte: {
          ...s.kanalSchritte,
          [k]: { ...s.kanalSchritte[k], 'auswertung-geplant': true },
        },
      }
    }
    expect(getSuggestedK2AgenturE2EPhase(s)).toBe('auswerten')
  })
})
