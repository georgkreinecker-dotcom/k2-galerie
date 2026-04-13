import { describe, expect, it } from 'vitest'
import { isValidFamilieTenantId } from '../utils/familieStorage'

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
})
