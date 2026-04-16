import { describe, it, expect, beforeEach } from 'vitest'
import {
  getEffectiveRolleForFamilieDaten,
  getFamilieEffectiveCapabilities,
  isK2FamilieNurMitgliedEinstiegModus,
} from '../utils/familieIdentitaet'
import { clearIdentitaetBestaetigt, setIdentitaetBestaetigt } from '../utils/familieIdentitaetStorage'
import {
  clearFamilieFamilienQrKompaktSession,
  setFamilieFamilienQrKompaktSession,
} from '../utils/familieEinladungPending'
import type { K2FamiliePerson } from '../types/k2Familie'
import { FAMILIE_HUBER_TENANT_ID } from '../data/familieHuberMuster'
import { K2_FAMILIE_NUR_MUSTER_SESSION_KEY } from '../utils/familieMusterSession'

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
    expect(caps.canDeleteFertigeGeschichte).toBe(false)
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
    expect(caps.canDeleteFertigeGeschichte).toBe(true)
  })

  it('falsche Session-Person: keine Schreib-Rechte trotz Inhaber-Rolle', () => {
    setIdentitaetBestaetigt(TID, 'anderer')
    const p = person('p1', 'AB12')
    const caps = getFamilieEffectiveCapabilities('inhaber', TID, { ichBinPersonId: 'p1' }, [p])
    expect(caps.canManageFamilienInstanz).toBe(false)
  })

  it('getEffectiveRolleForFamilieDaten: andere Person ist Inhaber:in → lokales Inhaber wird zu Bearbeiter', () => {
    const p1 = person('p1')
    const p2 = person('p2')
    expect(getEffectiveRolleForFamilieDaten('inhaber', { inhaberPersonId: 'p2', ichBinPersonId: 'p1' }, [p1, p2], 'p1')).toBe(
      'bearbeiter',
    )
    expect(getEffectiveRolleForFamilieDaten('inhaber', { inhaberPersonId: 'p1', ichBinPersonId: 'p1' }, [p1, p2], 'p1')).toBe(
      'inhaber',
    )
  })

  it('festgelegte Inhaber:in ≠ Du: keine Instanz-Verwaltung trotz Rolle Inhaber im Speicher', () => {
    setIdentitaetBestaetigt(TID, 'p1')
    const p1 = person('p1', 'AB12')
    const p2 = person('p2')
    const caps = getFamilieEffectiveCapabilities('inhaber', TID, { ichBinPersonId: 'p1', inhaberPersonId: 'p2' }, [p1, p2])
    expect(caps.canManageFamilienInstanz).toBe(false)
    expect(caps.canEditStrukturUndStammdaten).toBe(false)
    expect(caps.rolle).toBe('bearbeiter')
    expect(caps.canDeleteFertigeGeschichte).toBe(false)
  })

  it('Inhaber mit Du, Arbeitsansicht Leser (ohne Code): Rechte wie Leser:in', () => {
    const p = person('p1')
    const caps = getFamilieEffectiveCapabilities('inhaber', TID, { ichBinPersonId: 'p1' }, [p], 'leser')
    expect(caps.rolle).toBe('leser')
    expect(caps.canEditStrukturUndStammdaten).toBe(false)
    expect(caps.canManageFamilienInstanz).toBe(false)
    expect(caps.canDeleteFertigeGeschichte).toBe(true)
    expect(caps.rolleGewaehlt).toBe('inhaber')
    expect(caps.inhaberArbeitsansicht).toBe('leser')
  })

  it('Inhaber ohne „Du“, Arbeitsansicht Leser: weiterhin volle Inhaber-Rechte (Ansicht erst mit Du wirksam)', () => {
    const caps = getFamilieEffectiveCapabilities('inhaber', TID, {}, [], 'leser')
    expect(caps.canManageFamilienInstanz).toBe(true)
    expect(caps.canEditStrukturUndStammdaten).toBe(true)
    expect(caps.rolle).toBe('inhaber')
  })
})

describe('isK2FamilieNurMitgliedEinstiegModus', () => {
  beforeEach(() => {
    clearIdentitaetBestaetigt(TID)
  })

  const p1 = person('p1', 'LI36')

  it('Inhaber ohne Du: volle Oberfläche (nicht Nur-Mitglied-Modus)', () => {
    expect(isK2FamilieNurMitgliedEinstiegModus('inhaber', TID, {}, [])).toBe(false)
  })

  it('Inhaber ohne Du, Einladungs-QR offen: kompakt (Mobil-Scan, nicht ganze Homepage)', () => {
    expect(isK2FamilieNurMitgliedEinstiegModus('inhaber', TID, {}, [], true)).toBe(true)
  })

  it('Inhaber mit Du, ohne Code auf Karte: volle Oberfläche', () => {
    expect(isK2FamilieNurMitgliedEinstiegModus('inhaber', TID, { ichBinPersonId: 'p1' }, [person('p1')])).toBe(false)
  })

  it('Inhaber mit Du und Code, Sitzung offen: kompakte Nur-Zugang-Oberfläche', () => {
    expect(isK2FamilieNurMitgliedEinstiegModus('inhaber', TID, { ichBinPersonId: 'p1' }, [p1])).toBe(true)
  })

  it('Inhaber mit Du und Code, Sitzung bestätigt: volle Oberfläche', () => {
    setIdentitaetBestaetigt(TID, 'p1')
    expect(isK2FamilieNurMitgliedEinstiegModus('inhaber', TID, { ichBinPersonId: 'p1' }, [p1])).toBe(false)
  })

  it('Inhaber mit altem Du und Code, Sitzung bestätigt, Familien-QR-Kompakt aktiv: kompakt (Session schlägt Speicher)', () => {
    setIdentitaetBestaetigt(TID, 'p1')
    setFamilieFamilienQrKompaktSession(TID)
    expect(isK2FamilieNurMitgliedEinstiegModus('inhaber', TID, { ichBinPersonId: 'p1' }, [p1])).toBe(true)
  })

  it('Leser mit Du und Code, Sitzung offen: kompakt', () => {
    expect(isK2FamilieNurMitgliedEinstiegModus('leser', TID, { ichBinPersonId: 'p1' }, [p1])).toBe(true)
  })
})

describe('Huber-Demo (Nur-Muster-Sitzung): kein erneuter Code, volle Oberfläche', () => {
  beforeEach(() => {
    clearIdentitaetBestaetigt(FAMILIE_HUBER_TENANT_ID)
    sessionStorage.setItem(K2_FAMILIE_NUR_MUSTER_SESSION_KEY, '1')
  })

  afterEach(() => {
    sessionStorage.removeItem(K2_FAMILIE_NUR_MUSTER_SESSION_KEY)
  })

  const pCode = person('p1', 'AB12')

  it('Inhaber mit Du und Code: ohne Session-Bestätigung volle Rechte', () => {
    const caps = getFamilieEffectiveCapabilities(
      'inhaber',
      FAMILIE_HUBER_TENANT_ID,
      { ichBinPersonId: 'p1' },
      [pCode],
    )
    expect(caps.canManageFamilienInstanz).toBe(true)
    expect(caps.canEditStrukturUndStammdaten).toBe(true)
  })

  it('Inhaber mit Du und Code: nicht kompakt', () => {
    expect(
      isK2FamilieNurMitgliedEinstiegModus('inhaber', FAMILIE_HUBER_TENANT_ID, { ichBinPersonId: 'p1' }, [pCode]),
    ).toBe(false)
  })

  it('Leser mit Du und Code: nicht kompakt', () => {
    expect(
      isK2FamilieNurMitgliedEinstiegModus('leser', FAMILIE_HUBER_TENANT_ID, { ichBinPersonId: 'p1' }, [pCode]),
    ).toBe(false)
  })
})
