import { describe, expect, it } from 'vitest'
import { PROMO_RUNWAY_COMBINED_AUTO_PROMPT_EN, PROMO_RUNWAY_SHOTS } from '../config/promoRunwayPack2min'

describe('promoRunwayPack2min', () => {
  it('hat acht Szenen mit Spruch und englischem Prompt', () => {
    expect(PROMO_RUNWAY_SHOTS.length).toBe(8)
    for (const s of PROMO_RUNWAY_SHOTS) {
      expect(s.deVoiceover.trim().length).toBeGreaterThan(20)
      expect(s.enRunwayPrompt.trim().length).toBeGreaterThan(40)
    }
  })

  it('Auto-Prompt ist nicht leer', () => {
    expect(PROMO_RUNWAY_COMBINED_AUTO_PROMPT_EN.length).toBeGreaterThan(200)
  })
})
