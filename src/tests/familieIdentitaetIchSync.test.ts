import { describe, it, expect, beforeEach } from 'vitest'
import { loadEinstellungen, loadPersonen, saveEinstellungen, savePersonen } from '../utils/familieStorage'
import { clearIdentitaetBestaetigt, loadIdentitaetBestaetigt, setIdentitaetBestaetigt } from '../utils/familieIdentitaetStorage'
import { syncFamilieIdentitaetMitIchBinPerson } from '../utils/familieIdentitaetIchSync'
import type { K2FamiliePerson } from '../types/k2Familie'

const TID = 'familie-sync-test'
const P_DU = 'p-du'
const P_ANDERE = 'p-andere'

function zweiPersonen(): K2FamiliePerson[] {
  return [
    { id: P_DU, name: 'Du' },
    { id: P_ANDERE, name: 'Andere' },
  ]
}

describe('syncFamilieIdentitaetMitIchBinPerson', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
    clearIdentitaetBestaetigt(TID)
    savePersonen(TID, [], { allowReduce: true })
    saveEinstellungen(TID, {})
  })

  it('setzt die Sitzung auf „Du“, wenn Du gesetzt ist und die Sitzung fehlt oder abweicht', () => {
    savePersonen(TID, zweiPersonen())
    saveEinstellungen(TID, { ichBinPersonId: P_DU })
    expect(loadIdentitaetBestaetigt(TID)).toBeNull()

    const ok = syncFamilieIdentitaetMitIchBinPerson(TID)
    expect(ok).toBe(true)
    expect(loadIdentitaetBestaetigt(TID)).toBe(P_DU)

    setIdentitaetBestaetigt(TID, P_ANDERE)
    expect(loadIdentitaetBestaetigt(TID)).toBe(P_ANDERE)

    syncFamilieIdentitaetMitIchBinPerson(TID)
    expect(loadIdentitaetBestaetigt(TID)).toBe(P_DU)
  })

  it('übernimmt „Du“ aus der Sitzung, wenn Du noch leer ist und die Person existiert', () => {
    savePersonen(TID, zweiPersonen())
    setIdentitaetBestaetigt(TID, P_DU)
    expect(loadEinstellungen(TID).ichBinPersonId).toBeUndefined()

    const ok = syncFamilieIdentitaetMitIchBinPerson(TID)
    expect(ok).toBe(true)
    expect(loadEinstellungen(TID).ichBinPersonId).toBe(P_DU)
    expect(loadPersonen(TID).length).toBe(2)
  })

  it('ändert nichts, wenn beide leer oder IDs unbekannt', () => {
    savePersonen(TID, zweiPersonen())
    expect(syncFamilieIdentitaetMitIchBinPerson(TID)).toBe(false)

    saveEinstellungen(TID, { ichBinPersonId: 'unbekannt' })
    setIdentitaetBestaetigt(TID, 'auch-unbekannt')
    expect(syncFamilieIdentitaetMitIchBinPerson(TID)).toBe(false)
  })
})
