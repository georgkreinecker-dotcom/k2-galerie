import { describe, it, expect, beforeEach } from 'vitest'
import {
  buildFamiliePilotFamilienZugang,
  buildFamiliePilotTenantIdFromZettelNr,
  buildFamiliePilotWillkommenUrl,
  isFamiliePilotTenantId,
  seedFamiliePilotIfNeeded,
} from '../utils/familiePilotSeed'
import { loadPersonen, loadEinstellungen } from '../utils/familieStorage'

describe('familiePilotSeed', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('Tenant-ID und Zugangsnummer sind stabil zur Zettel-Nr.', () => {
    expect(buildFamiliePilotTenantIdFromZettelNr('7')).toBe('familie-pilot-7')
    expect(buildFamiliePilotFamilienZugang('7')).toMatch(/^KF-TP-\d{4}-0007$/)
  })

  it('isFamiliePilotTenantId', () => {
    expect(isFamiliePilotTenantId('familie-pilot-12')).toBe(true)
    expect(isFamiliePilotTenantId('huber')).toBe(false)
  })

  it('Willkommen-URL enthält t, z, fn', () => {
    const u = buildFamiliePilotWillkommenUrl('https://example.app/willkommen', 'Muna Test', '3')
    expect(u).toContain('t=familie-pilot-3')
    expect(u).toContain('z=KF-TP-')
    expect(u).toContain('fn=')
  })

  it('seedFamiliePilotIfNeeded legt eine Person und Inhaber an', () => {
    const tid = 'familie-pilot-99'
    expect(seedFamiliePilotIfNeeded(tid, { familienZugang: 'KF-TP-2026-0099', familyDisplayName: 'Muna' })).toBe(true)
    expect(loadPersonen(tid).length).toBe(1)
    const e = loadEinstellungen(tid)
    expect(e.ichBinPersonId).toBe('pilot-inhaber')
    expect(e.inhaberPersonId).toBe('pilot-inhaber')
    expect(e.mitgliedsNummerAdmin).toBe('KF-TP-2026-0099')
    expect(seedFamiliePilotIfNeeded(tid, { familienZugang: 'x', familyDisplayName: 'y' })).toBe(true)
    expect(loadPersonen(tid).length).toBe(1)
  })
})
