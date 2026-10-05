import { describe, expect, it } from 'vitest'
import { YOGA_AKADEMIE_LEHRGAENGE } from '../config/yogaAkademieStruktur'
import { getYogaKurs, yogaKursPath, YOGA_KURSE } from '../config/yogaKursStruktur'

describe('yogaKursStruktur', () => {
  it('hat Kurse mit denselben Ids wie Akademie-Lehrgänge', () => {
    const kursIds = YOGA_KURSE.map((k) => k.id).sort()
    const lehrIds = YOGA_AKADEMIE_LEHRGAENGE.map((l) => l.id).slice().sort()
    expect(kursIds).toEqual(lehrIds)
  })

  it('liefert Kursdetails und Pfad', () => {
    const k = getYogaKurs('lg-wels-2026')
    expect(k?.title).toMatch(/Wels/)
    expect(k?.module.length).toBeGreaterThan(0)
    expect(k?.teilnehmer.length).toBeGreaterThan(0)
    expect(yogaKursPath('lg-wels-2026')).toBe('/projects/k2-yoga/kurs/lg-wels-2026')
  })

  it('Kundentext ohne K2/Galerie-Marke in Kursdaten', () => {
    const blob = JSON.stringify(YOGA_KURSE)
    expect(blob.toLowerCase()).not.toMatch(/\bk2\b/)
    expect(blob.toLowerCase()).not.toMatch(/galerie/)
  })
})
