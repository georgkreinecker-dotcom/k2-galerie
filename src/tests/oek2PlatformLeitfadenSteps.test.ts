import { describe, expect, it } from 'vitest'
import {
  buildOek2PlatformLeitfadenSchritte,
  oek2PlatformGalerieSchrittCount,
} from '../components/guidedLeitfaden/oek2PlatformLeitfadenSteps'

describe('ök2 Plattform-Leitfaden', () => {
  it('verbindet Galerie ohne doppeltes fertig mit Admin ohne doppelte Begrüßung', () => {
    const steps = buildOek2PlatformLeitfadenSchritte('Test')
    const ids = steps.map((s) => s.id)
    expect(ids.filter((id) => id === 'fertig')).toHaveLength(0)
    /** Eine Begrüßung in der Galerie-Phase; zweite aus Admin entfernt */
    expect(ids.filter((id) => id === 'begruessung')).toHaveLength(1)
    expect(ids).toContain('wechsel-admin')
    const wechselIdx = ids.indexOf('wechsel-admin')
    expect(wechselIdx).toBeGreaterThan(0)
    expect(steps[wechselIdx]?.phase).toBe('galerie')
    expect(steps[wechselIdx + 1]?.phase).toBe('admin')
  })

  it('Anzahl Galerie-Schritte ohne fertig ist stabil', () => {
    expect(oek2PlatformGalerieSchrittCount()).toBeGreaterThan(3)
  })
})
