import { describe, it, expect } from 'vitest'
import { normalizeFamilieDatum, istFamilieDatumUngueltig } from '../utils/familieDatumEingabe'

describe('familieDatumEingabe', () => {
  it('normalisiert ISO YYYY-MM-DD', () => {
    expect(normalizeFamilieDatum('1959-04-06')).toBe('1959-04-06')
    expect(normalizeFamilieDatum('1959-4-6')).toBe('1959-04-06')
  })

  it('normalisiert deutsch TT.MM.JJJJ', () => {
    expect(normalizeFamilieDatum('6.4.1959')).toBe('1959-04-06')
    expect(normalizeFamilieDatum('06.04.1959')).toBe('1959-04-06')
  })

  it('leer → undefined', () => {
    expect(normalizeFamilieDatum('')).toBeUndefined()
    expect(normalizeFamilieDatum('  ')).toBeUndefined()
  })

  it('Ungültiges Datum → undefined', () => {
    expect(normalizeFamilieDatum('32.13.2020')).toBeUndefined()
    expect(normalizeFamilieDatum('abc')).toBeUndefined()
  })

  it('istFamilieDatumUngueltig', () => {
    expect(istFamilieDatumUngueltig('')).toBe(false)
    expect(istFamilieDatumUngueltig('1959-04-06')).toBe(false)
    expect(istFamilieDatumUngueltig('6.4.1959')).toBe(false)
    expect(istFamilieDatumUngueltig('Unsinn')).toBe(true)
  })
})
