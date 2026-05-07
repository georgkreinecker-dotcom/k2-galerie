import { describe, expect, it } from 'vitest'
import { getK2FamilieEinstellungenKey } from '../types/k2Familie'
import { isValidFamilieTenantId, loadEinstellungen, mergeEinstellungenFromServer, saveEinstellungen } from '../utils/familieStorage'

describe('isValidFamilieTenantId', () => {
  it('akzeptiert default, huber und familie-Zeitstempel', () => {
    expect(isValidFamilieTenantId('default')).toBe(true)
    expect(isValidFamilieTenantId('huber')).toBe(true)
    expect(isValidFamilieTenantId('familie-1713000000000')).toBe(true)
  })

  it('lehnt leer, zu lang und gefährliche Zeichen ab', () => {
    expect(isValidFamilieTenantId('')).toBe(false)
    expect(isValidFamilieTenantId('a'.repeat(65))).toBe(false)
    expect(isValidFamilieTenantId('foo bar')).toBe(false)
    expect(isValidFamilieTenantId('x/../y')).toBe(false)
  })

  it('lehnt Null-UUID ab (fehlerhafter Platzhalter in Links/QR)', () => {
    expect(isValidFamilieTenantId('00000000-0000-0000-0000-000000000000')).toBe(false)
  })

  it('speichert Familie-Einstellungen nie in ungültige Mandanten-Keys', () => {
    expect(saveEinstellungen('x/../y', { familyDisplayName: 'Darf nicht schreiben' })).toBe(false)
    expect(localStorage.getItem(getK2FamilieEinstellungenKey('x/../y'))).toBeNull()
  })

  it('schützt geänderte Familien-Stammdaten vor leerem Rückfall', () => {
    const tenantId = 'familie-rueckfall-test'
    expect(saveEinstellungen(tenantId, {
      familyDisplayName: 'Familie Echt',
      mitgliedsNummerAdmin: 'FAM-123',
    })).toBe(true)

    expect(saveEinstellungen(tenantId, {
      familyDisplayName: '',
      mitgliedsNummerAdmin: '',
    })).toBe(true)

    const stored = loadEinstellungen(tenantId)
    expect(stored.familyDisplayName).toBe('Familie Echt')
    expect(stored.mitgliedsNummerAdmin).toBe('FAM-123')
  })

  it('Cloud-Merge lässt leere Server-Stammdaten nicht über lokale Familie fallen', () => {
    const merged = mergeEinstellungenFromServer(
      { familyDisplayName: 'Familie Lokal', mitgliedsNummerAdmin: 'Z-77' },
      { familyDisplayName: '', mitgliedsNummerAdmin: '' },
    )
    expect(merged.familyDisplayName).toBe('Familie Lokal')
    expect(merged.mitgliedsNummerAdmin).toBe('Z-77')
  })
})
