import { describe, expect, it } from 'vitest'
import { getYogaDemoAnschauBeispiele, getYogaDemoBeispiele } from '../config/yogaDemoBeispiele'
import {
  getYogaGespraechAnschau,
  YOGA_GESPRAECH_AKADEMIE,
  YOGA_GESPRAECH_COVER_TITLE,
  YOGA_GESPRAECH_LEAD,
  YOGA_GESPRAECH_SYSTEM,
} from '../config/yogaGespraechsmappe'
import { PROJECT_ROUTES } from '../config/navigation'
import { getShareableAppUrl } from '../utils/publicShare'

describe('Yoga-Gesprächsmappe – Versand nach Telefonat', () => {
  it('stellt K2 als System vor und nennt die Akademie', () => {
    const blob = [
      YOGA_GESPRAECH_COVER_TITLE,
      YOGA_GESPRAECH_LEAD,
      ...YOGA_GESPRAECH_SYSTEM.flatMap((a) => [a.titel, a.absatz, ...(a.punkte ?? [])]),
      ...YOGA_GESPRAECH_AKADEMIE.flatMap((a) => [a.titel, a.absatz, ...(a.punkte ?? [])]),
    ].join(' ')
    expect(blob).toMatch(/K2/)
    expect(blob).toMatch(/kgm solution/)
    expect(blob).toMatch(/Yoga-Akademie Austria/)
    expect(blob).toMatch(/Fläche Akademie/)
  })

  it('hat eine klare Versand-URL unter k2-yoga', () => {
    expect(PROJECT_ROUTES['k2-yoga'].gespraechsmappe).toBe('/projects/k2-yoga/gespraechsmappe')
  })

  it('Versand-Link ist öffentlich (Vercel), nie localhost', () => {
    const url = getShareableAppUrl(PROJECT_ROUTES['k2-yoga'].gespraechsmappe)
    expect(url).toBe('https://k2-galerie.vercel.app/projects/k2-yoga/gespraechsmappe')
    expect(url).not.toMatch(/localhost/)
  })
})

describe('yogaDemoBeispiele – Leiste bleibt sichtbar', () => {
  it('enthält Mappe, Auftritt, Akademie, Kurs und Absolvent:in', () => {
    const ids = getYogaDemoBeispiele().map((b) => b.id)
    expect(ids).toEqual(['gespraechsmappe', 'auftritt', 'akademie', 'kurs', 'absolvent'])
  })

  it('Anschau-Liste ohne Mappe, inkl. Absolvent-Fläche', () => {
    const a = getYogaDemoAnschauBeispiele()
    expect(a.map((b) => b.id)).toEqual(['auftritt', 'akademie', 'kurs', 'absolvent'])
    expect(getYogaGespraechAnschau()).toEqual(a)
    expect(a.find((b) => b.id === 'absolvent')?.path).toBe(PROJECT_ROUTES['k2-yoga'].admin)
  })
})
