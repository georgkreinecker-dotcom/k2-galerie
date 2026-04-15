import { describe, it, expect, beforeEach } from 'vitest'
import {
  K2_FAMILIE_EINLADUNG_PENDING_KEY,
  clearFamilieEinladungPending,
  getFamilieEinladungPending,
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
