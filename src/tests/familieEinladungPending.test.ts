import { describe, it, expect, beforeEach } from 'vitest'
import {
  K2_FAMILIE_EINLADUNG_PENDING_KEY,
  clearFamilieEinladungPending,
  getFamilieEinladungPending,
  isFamilieEinladungPersonalCodeOffen,
  setFamilieEinladungPending,
} from '../utils/familieEinladungPending'

describe('familieEinladungPending', () => {
  beforeEach(() => {
    sessionStorage.removeItem(K2_FAMILIE_EINLADUNG_PENDING_KEY)
  })

  it('speichert und liest m + t', () => {
    setFamilieEinladungPending({ t: 'familie-x', m: 'AB12', z: 'KF-2026-1' })
    const p = getFamilieEinladungPending()
    expect(p?.m).toBe('AB12')
    expect(p?.t).toBe('familie-x')
    expect(p?.z).toBe('KF-2026-1')
    clearFamilieEinladungPending()
    expect(getFamilieEinladungPending()).toBeNull()
  })

  it('tenantInvalid ohne m ist gültig', () => {
    setFamilieEinladungPending({ t: 'bad', tenantInvalid: true })
    const p = getFamilieEinladungPending()
    expect(p?.tenantInvalid).toBe(true)
  })
})

describe('isFamilieEinladungPersonalCodeOffen', () => {
  const TID = 'familie-einladung-test'

  beforeEach(() => {
    sessionStorage.removeItem(K2_FAMILIE_EINLADUNG_PENDING_KEY)
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '/')
    }
  })

  it('true: Pending mit persönlichem Code und passendem Tenant', () => {
    setFamilieEinladungPending({ t: TID, m: 'AB12' })
    expect(isFamilieEinladungPersonalCodeOffen(TID)).toBe(true)
  })

  it('true: tenantInvalid (manuelle Korrektur)', () => {
    setFamilieEinladungPending({ t: 'bad', tenantInvalid: true })
    expect(isFamilieEinladungPersonalCodeOffen(TID)).toBe(true)
  })

  it('false: weder URL noch Pending', () => {
    expect(isFamilieEinladungPersonalCodeOffen(TID)).toBe(false)
  })

  it('true: ?m= und ?t= passen zum aktuellen Tenant', () => {
    window.history.replaceState(null, '', `/?m=CD34&t=${encodeURIComponent(TID)}`)
    expect(isFamilieEinladungPersonalCodeOffen(TID)).toBe(true)
  })
})
