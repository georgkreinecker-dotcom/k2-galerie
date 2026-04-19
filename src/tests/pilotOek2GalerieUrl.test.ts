import { describe, it, expect } from 'vitest'
import { buildOek2PilotGalerieUrl, isOek2PilotEntwurfQuery } from '../utils/pilotOek2GalerieUrl'

describe('pilotOek2GalerieUrl', () => {
  it('isOek2PilotEntwurfQuery erkennt vorname + entwurf=1', () => {
    expect(isOek2PilotEntwurfQuery('?context=oeffentlich&vorname=kunstmaler&entwurf=1')).toBe(true)
    expect(isOek2PilotEntwurfQuery('vorname=a&entwurf=1')).toBe(true)
    expect(isOek2PilotEntwurfQuery('?vorname=x&entwurf=2')).toBe(false)
    expect(isOek2PilotEntwurfQuery('?entwurf=1')).toBe(false)
    expect(isOek2PilotEntwurfQuery('')).toBe(false)
  })

  it('buildOek2PilotGalerieUrl enthält Pfad und Parameter', () => {
    const u = buildOek2PilotGalerieUrl('kunstmaler')
    expect(u).toContain('/projects/k2-galerie/galerie-oeffentlich')
    expect(u).toContain('context=oeffentlich')
    expect(u).toContain('vorname=kunstmaler')
    expect(u).toContain('entwurf=1')
  })
})
