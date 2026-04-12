import { describe, it, expect } from 'vitest'
import { getFamilieRollenCapabilities } from '../types/k2FamilieRollen'

describe('K2 Familie Rollen', () => {
  it('Inhaber:in: alle Rechte', () => {
    const c = getFamilieRollenCapabilities('inhaber')
    expect(c.canEditFamiliendaten).toBe(true)
    expect(c.canExportSicherung).toBe(true)
    expect(c.canRestoreSicherung).toBe(true)
    expect(c.canManageFamilienInstanz).toBe(true)
  })
  it('Bearbeiter:in: kein Restore/Merge, keine Instanz-Verwaltung', () => {
    const c = getFamilieRollenCapabilities('bearbeiter')
    expect(c.canEditFamiliendaten).toBe(true)
    expect(c.canExportSicherung).toBe(true)
    expect(c.canRestoreSicherung).toBe(false)
    expect(c.canManageFamilienInstanz).toBe(false)
  })
  it('Leser:in: nur Ansehen', () => {
    const c = getFamilieRollenCapabilities('leser')
    expect(c.canEditFamiliendaten).toBe(false)
    expect(c.canExportSicherung).toBe(false)
    expect(c.canRestoreSicherung).toBe(false)
    expect(c.canManageFamilienInstanz).toBe(false)
  })
})
