import { describe, it, expect } from 'vitest'
import {
  normalizeFamilieDatum,
  istFamilieDatumUngueltig,
  splitIsoDateToParts,
  tryBuildIsoFromParts,
  daysInMonth,
} from '../utils/familieDatumEingabe'

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

  it('splitIsoDateToParts: ISO oder leer', () => {
    expect(splitIsoDateToParts('')).toEqual({ d: '', m: '', y: '' })
    expect(splitIsoDateToParts('1959-04-06')).toEqual({ y: '1959', m: '04', d: '06' })
    expect(splitIsoDateToParts('6.4.1959')).toEqual({ y: '1959', m: '04', d: '06' })
  })

  it('tryBuildIsoFromParts', () => {
    expect(tryBuildIsoFromParts('', '', '')).toBe('')
    expect(tryBuildIsoFromParts('06', '04', '1959')).toBe('1959-04-06')
    expect(tryBuildIsoFromParts('29', '02', '2024')).toBe('2024-02-29')
    expect(tryBuildIsoFromParts('29', '02', '2023')).toBe('')
  })

  it('daysInMonth', () => {
    expect(daysInMonth(2024, 2)).toBe(29)
    expect(daysInMonth(2023, 2)).toBe(28)
    expect(daysInMonth(2023, 4)).toBe(30)
  })
})
