import { describe, it, expect, beforeEach } from 'vitest'
import {
  K2_FAMILIE_EINLADUNG_PENDING_KEY,
  clearFamilieEinladungPending,
  clearFamilieFamilienQrKompaktSession,
  getFamilieEinladungPending,
  isFamilieEinladungNurZugangAnsicht,
  isFamilieEinladungPersonalCodeOffen,
  setFamilieEinladungPending,
  setFamilieFamilienQrKompaktSession,
} from '../utils/familieEinladungPending'

const FAM_QR_KOMPAKT = 'k2-familie-familien-qr-kompakt'

describe('familieEinladungPending', () => {
  beforeEach(() => {
    sessionStorage.removeItem(K2_FAMILIE_EINLADUNG_PENDING_KEY)
    sessionStorage.removeItem(FAM_QR_KOMPAKT)
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
    sessionStorage.removeItem(FAM_QR_KOMPAKT)
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '/')
    }
  })

  it('true: Pending mit persönlichem Code und passendem Tenant', () => {
    setFamilieEinladungPending({ t: TID, m: 'AB12' })
    expect(isFamilieEinladungPersonalCodeOffen(TID)).toBe(true)
  })

  it('true: Pending m gesetzt, t weicht noch vom Context ab', () => {
    setFamilieEinladungPending({ t: TID, m: 'AB12' })
    expect(isFamilieEinladungPersonalCodeOffen('familie-andere')).toBe(true)
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

  it('true: ?m= und ?t= noch nicht Context-Mandant (Erst-Render nach QR-Scan)', () => {
    const andererTenant = 'familie-andere'
    window.history.replaceState(null, '', `/?m=CD34&t=${encodeURIComponent(TID)}`)
    expect(isFamilieEinladungPersonalCodeOffen(andererTenant)).toBe(true)
  })
})

describe('isFamilieEinladungNurZugangAnsicht', () => {
  const TID = 'familie-nur-zugang-test'

  beforeEach(() => {
    sessionStorage.removeItem(K2_FAMILIE_EINLADUNG_PENDING_KEY)
    sessionStorage.removeItem(FAM_QR_KOMPAKT)
    window.history.replaceState(null, '', '/')
  })

  it('delegiert zu isFamilieEinladungPersonalCodeOffen', () => {
    setFamilieEinladungPending({ t: TID, m: 'AB12' })
    expect(isFamilieEinladungNurZugangAnsicht(TID)).toBe(true)
  })

  it('true: ?z= in URL', () => {
    window.history.replaceState(null, '', `/?z=KF-1&t=${encodeURIComponent(TID)}`)
    expect(isFamilieEinladungNurZugangAnsicht(TID)).toBe(true)
  })

  it('true: Familien-QR-Kompakt-Session passend', () => {
    setFamilieFamilienQrKompaktSession(TID)
    expect(isFamilieEinladungNurZugangAnsicht(TID)).toBe(true)
    clearFamilieFamilienQrKompaktSession()
    expect(isFamilieEinladungNurZugangAnsicht(TID)).toBe(false)
  })

  it('false: anderer Tenant in Session', () => {
    setFamilieFamilienQrKompaktSession('familie-andere')
    expect(isFamilieEinladungNurZugangAnsicht(TID)).toBe(false)
  })
})
