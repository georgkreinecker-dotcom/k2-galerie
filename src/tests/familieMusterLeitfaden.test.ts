import { describe, expect, it } from 'vitest'
import { FAMILIE_MUSTER_LEITFADEN_SCHRITTE } from '../components/FamilieMusterHuberLeitfaden'

describe('FamilieMusterHuberLeitfaden', () => {
  it('hat feste Schritte mit Einordnung zuerst', () => {
    expect(FAMILIE_MUSTER_LEITFADEN_SCHRITTE.length).toBeGreaterThanOrEqual(5)
    expect(FAMILIE_MUSTER_LEITFADEN_SCHRITTE[0]?.id).toBe('einordnung')
    expect(FAMILIE_MUSTER_LEITFADEN_SCHRITTE[FAMILIE_MUSTER_LEITFADEN_SCHRITTE.length - 1]?.id).toBe('entscheid')
  })
})
