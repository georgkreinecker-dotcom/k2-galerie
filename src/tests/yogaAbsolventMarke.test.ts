import { describe, expect, it } from 'vitest'
import {
  YOGA_ABSOLVENT_MARKE,
  YOGA_ABSOLVENT_TEAL,
  YOGA_ABSOLVENT_INK,
} from '../config/yogaAbsolventMarke'
import { YOGA_GOLD, YOGA_VIOLETT } from '../config/yogaAkademieMarke'

describe('Yoga Absolvent-Farblinie', () => {
  it('ist Petrol/Teal und klar anders als Akademie Gold/Violett', () => {
    expect(YOGA_ABSOLVENT_TEAL).toBe('#0D6E6E')
    expect(YOGA_ABSOLVENT_INK).toBe('#14353A')
    expect(YOGA_ABSOLVENT_TEAL).not.toBe(YOGA_GOLD)
    expect(YOGA_ABSOLVENT_INK).not.toBe(YOGA_VIOLETT)
    expect(YOGA_ABSOLVENT_MARKE.linieName).toMatch(/Absolvent/)
  })
})
