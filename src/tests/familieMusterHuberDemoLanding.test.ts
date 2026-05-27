import { beforeEach, describe, expect, it } from 'vitest'
import {
  ensureMusterfamilieHuberDemoBereit,
  FAMILIE_HUBER_TENANT_ID,
  isHuberMusterDemoAktiv,
} from '../data/k2FamilieMusterHuberQuelle'
import { FAMILIE_HUBER_INHABER_PERSON_ID } from '../data/familieHuberMuster'
import { loadEinstellungen, loadPersonen } from '../utils/familieStorage'
import { isFamilieNurMusterSession } from '../utils/familieMusterSession'
import { isK2FamilieNurMitgliedEinstiegModus } from '../utils/familieIdentitaet'

describe('Musterfamilie Huber – Ads-Landing (?t=huber)', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('ensureMusterfamilieHuberDemoBereit: Demo-Sitzung, „Du“, Personen – kein Code-Einstieg', () => {
    expect(ensureMusterfamilieHuberDemoBereit()).toBe(true)
    expect(isFamilieNurMusterSession()).toBe(true)

    const einst = loadEinstellungen(FAMILIE_HUBER_TENANT_ID)
    expect(einst.ichBinPersonId).toBe(FAMILIE_HUBER_INHABER_PERSON_ID)

    const personen = loadPersonen(FAMILIE_HUBER_TENANT_ID)
    expect(personen.length).toBeGreaterThan(10)

    const nurMitglied = isK2FamilieNurMitgliedEinstiegModus(
      'inhaber',
      FAMILIE_HUBER_TENANT_ID,
      einst,
      personen,
      false,
    )
    expect(nurMitglied).toBe(false)
  })

  it('isHuberMusterDemoAktiv: true bei ?t=huber auch ohne gesetztes „Du“', () => {
    expect(isHuberMusterDemoAktiv(`?t=${FAMILIE_HUBER_TENANT_ID}&k=p3-linkedin`, 'default')).toBe(
      true,
    )
    expect(isHuberMusterDemoAktiv('', FAMILIE_HUBER_TENANT_ID)).toBe(false)
    ensureMusterfamilieHuberDemoBereit()
    expect(isHuberMusterDemoAktiv('', FAMILIE_HUBER_TENANT_ID)).toBe(true)
  })
})
