import { describe, expect, it } from 'vitest'
import { getYogaDemoAnschauBeispiele, getYogaDemoBeispiele } from '../config/yogaDemoBeispiele'
import { PROJECT_ROUTES } from '../config/navigation'

describe('yogaDemoBeispiele', () => {
  it('eine Quelle für Leiste und Mappe – fünf Einstiege', () => {
    expect(getYogaDemoBeispiele().map((b) => b.id)).toEqual([
      'gespraechsmappe',
      'auftritt',
      'akademie',
      'kurs',
      'absolvent',
    ])
  })

  it('Anschauen enthält Absolvent-Fläche', () => {
    const abs = getYogaDemoAnschauBeispiele().find((b) => b.id === 'absolvent')
    expect(abs?.path).toBe(PROJECT_ROUTES['k2-yoga'].admin)
    expect(abs?.titel).toMatch(/Absolvent/)
  })
})
