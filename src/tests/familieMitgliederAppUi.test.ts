import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getFamilieRollenCapabilities } from '../types/k2FamilieRollen'
import {
  clearFamilieMitgliederAppUiSession,
  isFamilieMitgliederAppUiSession,
  isK2FamilieOeffentlicherEinstiegPath,
  setFamilieMitgliederAppUiSession,
  shouldShowFamilieLeitstrukturPanel,
} from '../utils/familieMitgliederAppUi'

vi.mock('../config/k2FamilieApfDefaults', () => ({
  isK2FamilieApfArbeitsplattform: vi.fn(() => false),
}))

import { isK2FamilieApfArbeitsplattform } from '../config/k2FamilieApfDefaults'

const TID = 'familie-mitglieder-ui-test'

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

  it('APf: nur Inhaber:in; nicht nach QR-Mitglieder-Session', () => {
    vi.mocked(isK2FamilieApfArbeitsplattform).mockReturnValue(true)
    const inhaber = getFamilieRollenCapabilities('inhaber')
    const bearbeiter = getFamilieRollenCapabilities('bearbeiter')
    expect(shouldShowFamilieLeitstrukturPanel(panelOpts(bearbeiter))).toBe(false)
    expect(shouldShowFamilieLeitstrukturPanel(panelOpts(inhaber))).toBe(true)
    setFamilieMitgliederAppUiSession(TID)
    expect(shouldShowFamilieLeitstrukturPanel(panelOpts(inhaber))).toBe(false)
  })
})
