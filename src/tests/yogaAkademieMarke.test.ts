import { describe, expect, it } from 'vitest'
import { YOGA_AKADEMIE_LOGO, YOGA_GOLD, YOGA_MARKE, YOGA_VIOLETT } from '../config/yogaAkademieMarke'

describe('Yoga-Akademie-Marke – Wiedererkennbarkeit', () => {
  it('hat Gold und Violett wie die Homepage', () => {
    expect(YOGA_GOLD).toBe('#806000')
    expect(YOGA_VIOLETT).toBe('#351777')
    expect(YOGA_MARKE.slogan).toMatch(/tiefer/i)
  })

  it('Logo liegt lokal unter public/k2-yoga', () => {
    expect(YOGA_AKADEMIE_LOGO).toBe('/k2-yoga/yoga-akademie-austria-logo.png')
  })
})
