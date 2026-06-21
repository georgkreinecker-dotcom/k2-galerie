import { describe, expect, it } from 'vitest'
import {
  isK2SommerpauseActive,
  localDateIso,
  getK2SommerpauseBannerBody,
  getK2SommerpauseOpeningHoursLine,
} from '../config/k2GalerieSommerpause'

describe('k2GalerieSommerpause', () => {
  it('isK2SommerpauseActive bis 1.10.2026 inklusive', () => {
    expect(isK2SommerpauseActive(new Date('2026-06-18T12:00:00'))).toBe(true)
    expect(isK2SommerpauseActive(new Date('2026-10-01T23:59:59'))).toBe(true)
    expect(isK2SommerpauseActive(new Date('2026-10-02T00:00:01'))).toBe(false)
  })

  it('localDateIso liefert lokales Datum', () => {
    expect(localDateIso(new Date('2026-10-01T15:00:00'))).toBe('2026-10-01')
  })

  it('Banner-Text nennt Enddatum', () => {
    expect(getK2SommerpauseBannerBody()).toContain('1. Oktober 2026')
  })

  it('Öffnungszeiten-Hinweis nennt Enddatum und telefonische Anfrage', () => {
    expect(getK2SommerpauseOpeningHoursLine()).toContain('1. Oktober 2026')
    expect(getK2SommerpauseOpeningHoursLine()).toContain('telefonische Anfrage')
  })
})
