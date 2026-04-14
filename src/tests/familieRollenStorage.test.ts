import { describe, it, expect, beforeEach } from 'vitest'
import { loadFamilieRolleForTenant, saveFamilieRolleForTenant } from '../utils/familieRollenStorage'

const TID = 'test-fam-rollen-storage'

describe('familieRollenStorage', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
  })

  it('ohne Eintrag: Inhaber (Erst-Einrichtung)', () => {
    expect(loadFamilieRolleForTenant(TID)).toBe('inhaber')
  })

  it('localStorage hat Vorrang und spiegelt in sessionStorage', () => {
    localStorage.setItem(`k2-familie-rolle-local-${TID}`, 'inhaber')
    expect(loadFamilieRolleForTenant(TID)).toBe('inhaber')
    expect(sessionStorage.getItem(`k2-familie-rolle-${TID}`)).toBe('inhaber')
  })

  it('nur sessionStorage: migriert nach localStorage', () => {
    sessionStorage.setItem(`k2-familie-rolle-${TID}`, 'bearbeiter')
    expect(loadFamilieRolleForTenant(TID)).toBe('bearbeiter')
    expect(localStorage.getItem(`k2-familie-rolle-local-${TID}`)).toBe('bearbeiter')
  })

  it('save schreibt Session und localStorage', () => {
    saveFamilieRolleForTenant(TID, 'inhaber')
    expect(sessionStorage.getItem(`k2-familie-rolle-${TID}`)).toBe('inhaber')
    expect(localStorage.getItem(`k2-familie-rolle-local-${TID}`)).toBe('inhaber')
  })
})
