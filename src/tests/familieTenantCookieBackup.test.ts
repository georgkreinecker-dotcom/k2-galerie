import { describe, it, expect, beforeEach } from 'vitest'
import {
  readFamilieTenantCookieBackup,
  setFamilieTenantCookieBackup,
} from '../utils/familieTenantCookieBackup'

describe('familieTenantCookieBackup', () => {
  beforeEach(() => {
    document.cookie = 'k2fam_t=; Path=/; Max-Age=0'
  })

  it('schreibt und liest gültige Tenant-ID', () => {
    setFamilieTenantCookieBackup('familie-1738123456789')
    expect(readFamilieTenantCookieBackup()).toBe('familie-1738123456789')
  })

  it('setzt default nicht und liest null', () => {
    setFamilieTenantCookieBackup('default')
    expect(readFamilieTenantCookieBackup()).toBe(null)
  })
})
