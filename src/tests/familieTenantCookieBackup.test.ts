import { describe, it, expect, beforeEach } from 'vitest'
import { FAMILIE_HUBER_TENANT_ID } from '../data/familieHuberMuster'
import {
  ensureFamilieHuberInTenantListForPicker,
  loadFamilieTenantList,
  readFamilieTenantCookieBackup,
  setFamilieTenantCookieBackup,
} from '../utils/familieTenantCookieBackup'

describe('familieTenantCookieBackup', () => {
  beforeEach(() => {
    document.cookie = 'k2fam_t=; Path=/; Max-Age=0'
    localStorage.removeItem('k2-familie-tenant-list')
  })

  it('schreibt und liest gültige Tenant-ID', () => {
    setFamilieTenantCookieBackup('familie-1738123456789')
    expect(readFamilieTenantCookieBackup()).toBe('familie-1738123456789')
  })

  it('setzt default nicht und liest null', () => {
    setFamilieTenantCookieBackup('default')
    expect(readFamilieTenantCookieBackup()).toBe(null)
  })

  it('ensureFamilieHuberInTenantListForPicker ergänzt huber', () => {
    localStorage.setItem('k2-familie-tenant-list', JSON.stringify(['default']))
    ensureFamilieHuberInTenantListForPicker()
    expect(loadFamilieTenantList()).toContain(FAMILIE_HUBER_TENANT_ID)
  })

  it('ensureFamilieHuberInTenantListForPicker ist idempotent', () => {
    localStorage.setItem(
      'k2-familie-tenant-list',
      JSON.stringify(['default', FAMILIE_HUBER_TENANT_ID]),
    )
    ensureFamilieHuberInTenantListForPicker()
    const raw = JSON.parse(localStorage.getItem('k2-familie-tenant-list') || '[]')
    expect(raw.filter((x: string) => x === FAMILIE_HUBER_TENANT_ID)).toHaveLength(1)
  })
})
