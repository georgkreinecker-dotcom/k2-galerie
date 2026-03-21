import { describe, it, expect } from 'vitest'
import { computeRohertragOek2 } from '../utils/buchhaltungRohertragOek2'

describe('computeRohertragOek2', () => {
  it('ignoriert Positionen ohne Werknummer', () => {
    const r = computeRohertragOek2(
      [{ items: [{ title: 'Spende', price: 50, number: '' }] }],
      []
    )
    expect(r.positionenMitWerknummer).toBe(0)
    expect(r.verkaufserloes).toBe(0)
  })

  it('VK und EK pro Position, Rohertrag', () => {
    const r = computeRohertragOek2(
      [{ items: [{ number: 'W-1', price: 100, quantity: 1 }] }],
      [{ number: 'W-1', purchasePrice: 40 }]
    )
    expect(r.verkaufserloes).toBe(100)
    expect(r.wareneinsatz).toBe(40)
    expect(r.rohertrag).toBe(60)
    expect(r.positionenMitWerknummer).toBe(1)
    expect(r.positionenEigenproduktion).toBe(0)
  })

  it('ohne EK = Eigenproduktion, EK 0', () => {
    const r = computeRohertragOek2(
      [{ items: [{ number: 'W-2', price: 80 }] }],
      [{ number: 'W-2' }]
    )
    expect(r.verkaufserloes).toBe(80)
    expect(r.wareneinsatz).toBe(0)
    expect(r.rohertrag).toBe(80)
    expect(r.positionenEigenproduktion).toBe(1)
  })

  it('Menge > 1', () => {
    const r = computeRohertragOek2(
      [{ items: [{ number: 'W-3', price: 10, quantity: 3 }] }],
      [{ number: 'W-3', purchasePrice: 4 }]
    )
    expect(r.verkaufserloes).toBe(30)
    expect(r.wareneinsatz).toBe(12)
    expect(r.rohertrag).toBe(18)
  })
})
