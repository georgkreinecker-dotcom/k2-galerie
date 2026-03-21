import { describe, it, expect } from 'vitest'
import { formatEkAnzeige, parseEkFromForm } from '../utils/artworkEkVk'
import { artworksForExport } from '../utils/artworkExport'

describe('artworkEkVk', () => {
  it('formatEkAnzeige: leer / 0 / ungültig → Eigenproduktion', () => {
    expect(formatEkAnzeige(undefined)).toBe('Eigenproduktion')
    expect(formatEkAnzeige('')).toBe('Eigenproduktion')
    expect(formatEkAnzeige(0)).toBe('Eigenproduktion')
    expect(formatEkAnzeige(-1)).toBe('Eigenproduktion')
    expect(formatEkAnzeige('abc')).toBe('Eigenproduktion')
  })

  it('formatEkAnzeige: positiver Betrag', () => {
    expect(formatEkAnzeige(12.5)).toMatch(/€\s*12,50/)
    expect(formatEkAnzeige('10,25')).toMatch(/10,25/)
  })

  it('parseEkFromForm', () => {
    expect(parseEkFromForm('')).toBeUndefined()
    expect(parseEkFromForm('0')).toBeUndefined()
    expect(parseEkFromForm('12,5')).toBe(12.5)
    expect(parseEkFromForm('100')).toBe(100)
  })
})

describe('artworksForExport strips purchasePrice', () => {
  it('entfernt purchasePrice aus jedem Werk', () => {
    const out = artworksForExport([
      { id: '1', price: 50, purchasePrice: 30, imageUrl: '/x.jpg' },
    ] as any[])
    expect(out[0].purchasePrice).toBeUndefined()
    expect(out[0].price).toBe(50)
  })
})
