import { describe, it, expect } from 'vitest'
import { computeLagerstandOek2Vorschau } from '../utils/buchhaltungLagerstandOek2'

describe('computeLagerstandOek2Vorschau', () => {
  it('filtert quantity 0', () => {
    const r = computeLagerstandOek2Vorschau([{ number: 'A-1', title: 'X', quantity: 0, price: 10 }])
    expect(r.rows.length).toBe(0)
    expect(r.gesamtStueck).toBe(0)
  })

  it('ohne quantity = 1 Stück', () => {
    const r = computeLagerstandOek2Vorschau([{ number: 'B-1', title: 'Y', price: 50 }])
    expect(r.rows.length).toBe(1)
    expect(r.rows[0].menge).toBe(1)
    expect(r.wertVk).toBe(50)
  })

  it('Menge und VK/EK-Werte', () => {
    const r = computeLagerstandOek2Vorschau([
      { number: 'C-1', title: 'Z', quantity: 2, price: 10, purchasePrice: 3 },
    ])
    expect(r.gesamtStueck).toBe(2)
    expect(r.wertVk).toBe(20)
    expect(r.wertEk).toBe(6)
    expect(r.rows[0].eigenproduktion).toBe(false)
  })

  it('ohne EK = Eigenproduktion', () => {
    const r = computeLagerstandOek2Vorschau([{ number: 'D-1', title: 'E', quantity: 1, price: 100 }])
    expect(r.rows[0].eigenproduktion).toBe(true)
    expect(r.wertEk).toBe(0)
  })
})
