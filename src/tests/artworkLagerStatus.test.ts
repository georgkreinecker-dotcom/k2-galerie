import { describe, expect, it } from 'vitest'
import {
  getArtworkLagerInfo,
  revertOneSoldUnitInList,
  sumSoldFromListForArtwork,
  sumSoldFromOrdersForArtwork,
} from '../utils/artworkLagerStatus'

describe('artworkLagerStatus', () => {
  it('remaining 0 = ausverkauft', () => {
    const info = getArtworkLagerInfo({ number: 'K2-M-0001', quantity: 0 }, [])
    expect(info.isAusverkauft).toBe(true)
    expect(info.cardVariant).toBe('ausverkauft')
  })

  it('Einzelstück: Werkstamm quantity 1 + Kasse 1 verkauft → 0 Lager, ausverkauft (Widerspruch bereinigt)', () => {
    const sold = [{ number: 'K2-M-0001', soldAt: '2026-04-27', soldQuantity: 1 }]
    const info = getArtworkLagerInfo({ number: 'K2-M-0001', quantity: 1 }, sold)
    expect(info.remaining).toBe(0)
    expect(info.isAusverkauft).toBe(true)
    expect(info.isTeilverkauft).toBe(false)
    expect(info.cardVariant).toBe('ausverkauft')
  })

  it('partial: remaining > 0 and sold list has entries', () => {
    const sold = [{ number: 'K2-M-0001', soldAt: '2020-01-01', soldQuantity: 2 }]
    const info = getArtworkLagerInfo({ number: 'K2-M-0001', quantity: 3 }, sold)
    expect(info.isTeilverkauft).toBe(true)
    expect(info.cardVariant).toBe('teilweise')
    expect(info.soldSumFromList).toBe(2)
  })

  it('Bestellungen ohne Verkaufsliste: verkaufte Stück aus Orders (Wochenend-Fall)', () => {
    const orders = [
      {
        id: 'ORDER-1',
        items: [{ number: 'K2-M-0005', quantity: 2, title: 'X', price: 10, category: 'malerei' }],
      },
      {
        id: 'ORDER-2',
        items: [{ number: 'K2-M-0005', quantity: 1, title: 'X', price: 10, category: 'malerei' }],
      },
    ]
    const info = getArtworkLagerInfo({ number: 'K2-M-0005', quantity: 2 }, [], orders)
    expect(info.soldSumFromList).toBe(3)
    expect(info.isTeilverkauft).toBe(true)
  })

  it('sumSoldFromOrdersForArtwork zählt Stück pro Orderzeile', () => {
    const n = sumSoldFromOrdersForArtwork(
      { number: 'A-1' },
      [{ items: [{ number: 'A-1', quantity: 3, title: '', price: 0, category: 'x' }] }]
    )
    expect(n).toBe(3)
  })

  it('sumSoldFromList: soldQuantity optional counts as 1', () => {
    const s = sumSoldFromListForArtwork({ number: 'A' }, [{ number: 'A', soldAt: 'x' }])
    expect(s).toBe(1)
  })

  it('revertOneSoldUnitInList entfernt Zeile mit soldQuantity 1', () => {
    const list = [{ number: 'N1', soldAt: '2025-01-02T00:00:00Z' }]
    const { newList, didChange } = revertOneSoldUnitInList(list, 'N1', undefined)
    expect(didChange).toBe(true)
    expect(newList).toHaveLength(0)
  })

  it('revertOneSoldUnitInList verringert soldQuantity', () => {
    const list = [{ number: 'N1', soldAt: '2025-01-02T00:00:00Z', soldQuantity: 3 }]
    const { newList, didChange } = revertOneSoldUnitInList(list, 'N1', undefined)
    expect(didChange).toBe(true)
    expect(newList[0].soldQuantity).toBe(2)
  })
})
