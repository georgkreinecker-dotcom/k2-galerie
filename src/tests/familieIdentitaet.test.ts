import { describe, it, expect, beforeEach } from 'vitest'
import { getFamilieEffectiveCapabilities } from '../utils/familieIdentitaet'
import { clearIdentitaetBestaetigt, setIdentitaetBestaetigt } from '../utils/familieIdentitaetStorage'
import type { K2FamiliePerson } from '../types/k2Familie'

const TID = 'default'

function person(id: string, mitgliedsNummer?: string): K2FamiliePerson {
  return {
    id,
    name: 'Test',
    parentIds: [],
    childIds: [],
    siblingIds: [],
    partners: [],
    wahlfamilieIds: [],
    mitgliedsNummer,
  }
}

describe('getFamilieEffectiveCapabilities', () => {
  beforeEach(() => {
    clearIdentitaetBestaetigt(TID)
  })

  it('Inhaber ohne Du: volle Basis-Rechte', () => {
    const caps = getFamilieEffectiveCapabilities('inhaber', TID, {}, [])
    expect(caps.canManageFamilienInstanz).toBe(true)
    expect(caps.canEditStrukturUndStammdaten).toBe(true)
  })

  it('Leser ohne Du: keine Schreib-Rechte', () => {
    const caps = getFamilieEffectiveCapabilities('leser', TID, {}, [])
    expect(caps.canView).toBe(true)
    expect(caps.canEditFamiliendaten).toBe(false)
    expect(caps.canManageFamilienInstanz).toBe(false)
  })

  it('Bearbeiter mit Du ohne Code auf Karte: Rolle gilt', () => {
    const p = person('p1')
    const caps = getFamilieEffectiveCapabilities('bearbeiter', TID, { ichBinPersonId: 'p1' }, [p])
    expect(caps.canEditFamiliendaten).toBe(true)
    expect(caps.canEditStrukturUndStammdaten).toBe(false)
  })

  it('Inhaber mit Du und Code: ohne Session-Bestätigung nur Lesen', () => {
    const p = person('p1', 'AB12')
    const caps = getFamilieEffectiveCapabilities('inhaber', TID, { ichBinPersonId: 'p1' }, [p])
    expect(caps.canManageFamilienInstanz).toBe(false)
    expect(caps.canEditStrukturUndStammdaten).toBe(false)
  })

  it('Inhaber mit Du und Code: nach Session-Bestätigung volle Rechte', () => {
    setIdentitaetBestaetigt(TID, 'p1')
    const p = person('p1', 'AB12')
    const caps = getFamilieEffectiveCapabilities('inhaber', TID, { ichBinPersonId: 'p1' }, [p])
    expect(caps.canManageFamilienInstanz).toBe(true)
    expect(caps.canEditStrukturUndStammdaten).toBe(true)
  })

  it('falsche Session-Person: keine Schreib-Rechte trotz Inhaber-Rolle', () => {
    setIdentitaetBestaetigt(TID, 'anderer')
    const p = person('p1', 'AB12')
    const caps = getFamilieEffectiveCapabilities('inhaber', TID, { ichBinPersonId: 'p1' }, [p])
    expect(caps.canManageFamilienInstanz).toBe(false)
  })
})
