import { describe, expect, it } from 'vitest'
import { isK2FamilieMeineFamilieHomePath, isK2FamiliePublicPath } from '../utils/k2FamiliePwaBranding'

describe('k2FamiliePwaBranding', () => {
  it('erkennt K2-Familie-Routen', () => {
    expect(isK2FamiliePublicPath('/projects/k2-familie/meine-familie')).toBe(true)
    expect(isK2FamiliePublicPath('/k2-familie-handbuch')).toBe(true)
    expect(isK2FamiliePublicPath('/k2-familie-handbuch/00-INDEX.md')).toBe(true)
  })
  it('schließt Galerie und andere Routen aus', () => {
    expect(isK2FamiliePublicPath('/projects/k2-galerie/galerie')).toBe(false)
    expect(isK2FamiliePublicPath('/')).toBe(false)
    expect(isK2FamiliePublicPath('/familie')).toBe(true)
    expect(isK2FamiliePublicPath('/familie/')).toBe(true)
  })
  it('Meine-Familie-Start: kurz und lang gleichbedeutend', () => {
    expect(isK2FamilieMeineFamilieHomePath('/familie')).toBe(true)
    expect(isK2FamilieMeineFamilieHomePath('/familie/')).toBe(true)
    expect(isK2FamilieMeineFamilieHomePath('/projects/k2-familie/meine-familie')).toBe(true)
    expect(isK2FamilieMeineFamilieHomePath('/projects/k2-familie/stammbaum')).toBe(false)
  })
})
