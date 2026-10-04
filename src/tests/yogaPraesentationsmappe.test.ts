import { describe, expect, it } from 'vitest'
import {
  YOGA_MAPPE_ABSchnitte,
  YOGA_MAPPE_AUFWAND,
  YOGA_MAPPE_COVER_SLOGAN,
  YOGA_MAPPE_COVER_TAGLINE,
  YOGA_MAPPE_COVER_TITLE,
  YOGA_MAPPE_LEAD,
} from '../config/yogaPraesentationsmappe'

describe('Yoga-Präsentationsmappe – Kundentext ohne K2', () => {
  it('enthält kein K2 und keine Galerie-Marke', () => {
    const blob = [
      YOGA_MAPPE_COVER_TITLE,
      YOGA_MAPPE_COVER_SLOGAN,
      YOGA_MAPPE_COVER_TAGLINE,
      YOGA_MAPPE_LEAD,
      ...YOGA_MAPPE_ABSchnitte.flatMap((a) => [a.titel, a.text]),
      ...YOGA_MAPPE_AUFWAND.flatMap((r) => [r.wer, r.was, r.aufwand]),
    ].join(' ')
    expect(blob).not.toMatch(/k2/i)
    expect(blob).not.toMatch(/galerie/i)
  })
})
