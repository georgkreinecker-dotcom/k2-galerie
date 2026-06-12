import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getFamilieRollenCapabilities } from '../types/k2FamilieRollen'
import {
  clearFamilieMitgliederAppUiSession,
  isFamilieMitgliederAppUiSession,
  isK2FamilieOeffentlicherEinstiegPath,
  setFamilieMitgliederAppUiSession,
  shouldShowFamilieLeitstrukturPanel,
} from '../utils/familieMitgliederAppUi'

vi.mock('../config/k2FamilieApfDefaults', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../config/k2FamilieApfDefaults')>()
  return {
    ...actual,
    isK2FamilieApfArbeitsplattform: vi.fn(() => false),
  }
})

import { isK2FamilieApfArbeitsplattform } from '../config/k2FamilieApfDefaults'
import { FAMILIE_HUBER_TENANT_ID } from '../data/familieHuberMuster'

const TID = 'familie-mitglieder-ui-test'
const APF_DEV_TID = FAMILIE_HUBER_TENANT_ID

const panelOpts = (capabilities: ReturnType<typeof getFamilieRollenCapabilities>) => ({
  capabilities,
  tenantId: TID,
  nurMitgliedEinstieg: false,
  huberNurMusterBesuch: false,
})

describe('familieMitgliederAppUi', () => {
  beforeEach(() => {
    sessionStorage.clear()
    clearFamilieMitgliederAppUiSession()
    vi.mocked(isK2FamilieApfArbeitsplattform).mockReturnValue(false)
  })

  it('Mitglieder-Session nach QR setzen und prüfen', () => {
    expect(isFamilieMitgliederAppUiSession(TID)).toBe(false)
    setFamilieMitgliederAppUiSession(TID)
    expect(isFamilieMitgliederAppUiSession(TID)).toBe(true)
    expect(isFamilieMitgliederAppUiSession('andere')).toBe(false)
  })

  it('Lizenzversion: Leitstruktur für niemanden (auch Inhaber:in)', () => {
    const inhaber = getFamilieRollenCapabilities('inhaber')
    const bearbeiter = getFamilieRollenCapabilities('bearbeiter')
    expect(shouldShowFamilieLeitstrukturPanel(panelOpts(bearbeiter))).toBe(false)
    expect(shouldShowFamilieLeitstrukturPanel(panelOpts(inhaber))).toBe(false)
  })

  it('öffentliche Lizenz-/Willkommen-/Kundenmappe-Pfade: kein Leitstruktur-Panel (auch auf APf)', () => {
    vi.mocked(isK2FamilieApfArbeitsplattform).mockReturnValue(true)
    const inhaber = getFamilieRollenCapabilities('inhaber')
    const opts = { ...panelOpts(inhaber), pathname: '/projects/k2-familie/lizenz-erwerben' }
    expect(isK2FamilieOeffentlicherEinstiegPath('/projects/k2-familie/lizenz-erwerben')).toBe(true)
    expect(isK2FamilieOeffentlicherEinstiegPath('/projects/k2-familie/praesentationsmappe-kunde')).toBe(true)
    expect(shouldShowFamilieLeitstrukturPanel(opts)).toBe(false)
    expect(
      shouldShowFamilieLeitstrukturPanel({
        ...panelOpts(inhaber),
        pathname: '/projects/k2-familie/praesentationsmappe-kunde',
      }),
    ).toBe(false)
  })

  it('APf: Lizenz-Mandant ohne Leitstruktur; Entwicklungs-Mandant nur Inhaber:in', () => {
    vi.mocked(isK2FamilieApfArbeitsplattform).mockReturnValue(true)
    const inhaber = getFamilieRollenCapabilities('inhaber')
    const bearbeiter = getFamilieRollenCapabilities('bearbeiter')
    expect(shouldShowFamilieLeitstrukturPanel(panelOpts(bearbeiter))).toBe(false)
    expect(shouldShowFamilieLeitstrukturPanel(panelOpts(inhaber))).toBe(false)
    const devInhaber = { ...panelOpts(inhaber), tenantId: APF_DEV_TID }
    expect(shouldShowFamilieLeitstrukturPanel(devInhaber)).toBe(true)
    setFamilieMitgliederAppUiSession(APF_DEV_TID)
    expect(shouldShowFamilieLeitstrukturPanel(devInhaber)).toBe(false)
  })
})
