import { describe, it, expect } from 'vitest'
import {
  isReferrerApfInternalToolPath,
  isReferrerK2GalerieApfProjectHubOnly,
  isReferrerIndicatingApfStyleSession,
} from '../utils/galerieOek2Referrer'

describe('galerieOek2Referrer', () => {
  it('Hub nur exakt, nicht Galerie-Unterseiten', () => {
    expect(isReferrerK2GalerieApfProjectHubOnly('/projects/k2-galerie')).toBe(true)
    expect(isReferrerK2GalerieApfProjectHubOnly('/projects/k2-galerie/')).toBe(true)
    expect(isReferrerK2GalerieApfProjectHubOnly('/projects/k2-galerie/galerie-oeffentlich')).toBe(false)
    expect(isReferrerK2GalerieApfProjectHubOnly('/projects/k2-galerie/galerie')).toBe(false)
  })

  it('intern = Tool-Pfade oder nackter Hub', () => {
    expect(isReferrerIndicatingApfStyleSession('/projects/k2-galerie/galerie-oeffentlich')).toBe(false)
    expect(isReferrerIndicatingApfStyleSession('/projects/k2-galerie')).toBe(true)
    expect(isReferrerIndicatingApfStyleSession('/admin')).toBe(true)
    expect(isReferrerApfInternalToolPath('/x/mission-control/y')).toBe(true)
  })
})
