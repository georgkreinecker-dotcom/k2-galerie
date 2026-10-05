import { describe, expect, it } from 'vitest'
import {
  YOGA_DETAIL_ABSchnitte,
  YOGA_DETAIL_AUFWAND,
  YOGA_DETAIL_COVER_SLOGAN,
  YOGA_DETAIL_COVER_TAGLINE,
  YOGA_DETAIL_COVER_TITLE,
  YOGA_DETAIL_LEAD,
  YOGA_DETAIL_MITBRINGEN,
  YOGA_DETAIL_NAECHSTE,
  YOGA_DETAIL_NICHT,
  YOGA_DETAIL_PILOT,
} from '../config/yogaDetailplan'

describe('Yoga-Detailplan – Kundentext ohne K2', () => {
  it('enthält kein K2 und keine Galerie-Marke', () => {
    const blob = [
      YOGA_DETAIL_COVER_TITLE,
      YOGA_DETAIL_COVER_SLOGAN,
      YOGA_DETAIL_COVER_TAGLINE,
      YOGA_DETAIL_LEAD,
      ...YOGA_DETAIL_ABSchnitte.flatMap((a) => [a.titel, a.absatz, ...(a.punkte ?? [])]),
      ...YOGA_DETAIL_PILOT.flatMap((r) => [r.phase, r.ziel, r.ergebnis]),
      ...YOGA_DETAIL_AUFWAND.flatMap((r) => [r.wer, r.was, r.aufwand]),
      ...YOGA_DETAIL_NICHT,
      ...YOGA_DETAIL_MITBRINGEN,
      ...YOGA_DETAIL_NAECHSTE,
    ].join(' ')
    expect(blob).not.toMatch(/k2/i)
    expect(blob).not.toMatch(/galerie/i)
  })

  it('hat Pilot und nächste Schritte', () => {
    expect(YOGA_DETAIL_PILOT.length).toBeGreaterThanOrEqual(3)
    expect(YOGA_DETAIL_NAECHSTE.length).toBeGreaterThanOrEqual(3)
  })
})
