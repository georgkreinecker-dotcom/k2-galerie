import { describe, expect, it } from 'vitest'
import {
  YOGA_GESPRAECH_AKADEMIE,
  YOGA_GESPRAECH_AUFWAND,
  YOGA_GESPRAECH_COVER_TITLE,
  YOGA_GESPRAECH_LEAD,
  YOGA_GESPRAECH_SYSTEM,
} from '../config/yogaGespraechsmappe'
import { PROJECT_ROUTES } from '../config/navigation'

describe('Yoga-Gesprächsmappe – Versand nach Telefonat', () => {
  it('stellt K2 als System vor und nennt die Akademie', () => {
    const blob = [
      YOGA_GESPRAECH_COVER_TITLE,
      YOGA_GESPRAECH_LEAD,
      ...YOGA_GESPRAECH_SYSTEM.flatMap((a) => [a.titel, a.absatz, ...(a.punkte ?? [])]),
      ...YOGA_GESPRAECH_AKADEMIE.flatMap((a) => [a.titel, a.absatz, ...(a.punkte ?? [])]),
      ...YOGA_GESPRAECH_AUFWAND.flatMap((r) => [r.wer, r.was, r.aufwand]),
    ].join(' ')
    expect(blob).toMatch(/K2/)
    expect(blob).toMatch(/kgm solution/)
    expect(blob).toMatch(/Yoga-Akademie Austria/)
    expect(blob).toMatch(/Fläche Akademie/)
  })

  it('hat eine klare Versand-URL unter k2-yoga', () => {
    expect(PROJECT_ROUTES['k2-yoga'].gespraechsmappe).toBe('/projects/k2-yoga/gespraechsmappe')
  })
})
