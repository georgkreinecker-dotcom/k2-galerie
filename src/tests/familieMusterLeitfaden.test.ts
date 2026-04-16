import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import {
  clampFamilieLeitfadenBounds,
  FamilieMusterHuberLeitfadenModal,
  FAMILIE_MUSTER_LEITFADEN_SCHRITTE,
} from '../components/FamilieMusterHuberLeitfaden'

describe('FamilieMusterHuberLeitfaden', () => {
  it('hat feste Schritte: Begrüßung, Versprechen, dann Huber-Einordnung', () => {
    expect(FAMILIE_MUSTER_LEITFADEN_SCHRITTE.length).toBeGreaterThanOrEqual(7)
    expect(FAMILIE_MUSTER_LEITFADEN_SCHRITTE[0]?.id).toBe('begruessung')
    expect(FAMILIE_MUSTER_LEITFADEN_SCHRITTE[1]?.id).toBe('verkaufsversprechen')
    expect(FAMILIE_MUSTER_LEITFADEN_SCHRITTE[2]?.id).toBe('einordnung')
    expect(FAMILIE_MUSTER_LEITFADEN_SCHRITTE.some((s) => s.id === 'gedenkort')).toBe(true)
    expect(FAMILIE_MUSTER_LEITFADEN_SCHRITTE[FAMILIE_MUSTER_LEITFADEN_SCHRITTE.length - 1]?.id).toBe('entscheid')
  })

  it('Anzeige und Vorlesen: text und sprecherDrehbuch sind dieselbe Quelle', () => {
    for (const s of FAMILIE_MUSTER_LEITFADEN_SCHRITTE) {
      expect(s.text).toBe(s.sprecherDrehbuch)
    }
  })

  it('clampFamilieLeitfadenBounds: Mindestbreite und Rand', () => {
    const c = clampFamilieLeitfadenBounds({ left: 4, top: 4, width: 100, height: 100 })
    expect(c.width).toBeGreaterThanOrEqual(280)
    expect(c.height).toBeGreaterThanOrEqual(220)
  })

  it('FamilieMusterHuberLeitfadenModal: offen rendert ohne ReferenceError', () => {
    const container = document.createElement('div')
    const root = createRoot(container)
    root.render(
      createElement(
        MemoryRouter,
        { initialEntries: ['/projects/k2-familie'] },
        createElement(FamilieMusterHuberLeitfadenModal, {
          open: true,
          onOpenChange: () => {},
          onAbgeschlossen: () => {},
        }),
      ),
    )
    root.unmount()
  })

  it('FamilieMusterHuberLeitfadenModal: minimiert (Session) rendert ohne ReferenceError', () => {
    sessionStorage.setItem('k2-familie-leitfaden-minimized', '1')
    const container = document.createElement('div')
    const root = createRoot(container)
    root.render(
      createElement(
        MemoryRouter,
        { initialEntries: ['/projects/k2-familie'] },
        createElement(FamilieMusterHuberLeitfadenModal, {
          open: true,
          onOpenChange: () => {},
          onAbgeschlossen: () => {},
        }),
      ),
    )
    root.unmount()
  })
})
