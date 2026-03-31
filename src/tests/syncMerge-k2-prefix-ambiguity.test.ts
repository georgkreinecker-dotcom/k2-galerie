import { describe, expect, it } from 'vitest'

import { mergeServerWithLocal, preserveLocalImageData } from '../utils/syncMerge'

describe('syncMerge – K2 Präfix-Ambiguität (M vs K)', () => {
  it('matched nicht mehr über reine Ziffern wenn M und K dieselben Ziffern haben', () => {
    const server = [
      { number: 'K2-K-0019', id: 'K2-K-0019', category: 'keramik', imageUrl: 'https://example.com/k19.jpg', updatedAt: '2026-03-01T10:00:00.000Z' },
    ]
    const local = [
      { number: 'K2-M-0019', id: 'K2-M-0019', category: 'malerei', imageUrl: 'https://example.com/m19.jpg', updatedAt: '2026-03-02T10:00:00.000Z' },
    ]

    const { merged } = mergeServerWithLocal(server, local, { onlyAddLocalIfMobileAndVeryNew: false, serverAsSoleTruth: true })
    const numbers = merged.map((a: any) => a.number).sort()
    expect(numbers).toEqual(['K2-K-0019', 'K2-M-0019'])
  })

  it('preserveLocalImageData überschreibt nicht mehr K2-M Bilddaten mit K2-K (gleiche Ziffern)', () => {
    const merged = [
      { number: 'K2-K-0019', id: 'K2-K-0019', category: 'keramik', imageUrl: 'https://example.com/k19.jpg' },
      { number: 'K2-M-0019', id: 'K2-M-0019', category: 'malerei', imageUrl: '' },
    ]
    const local = [
      { number: 'K2-M-0019', id: 'K2-M-0019', category: 'malerei', imageUrl: 'https://example.com/m19-local.jpg' },
    ]

    const out = preserveLocalImageData(merged, local)
    const m = out.find((a: any) => a.number === 'K2-M-0019')
    const k = out.find((a: any) => a.number === 'K2-K-0019')
    expect(m?.imageUrl).toBe('https://example.com/m19-local.jpg')
    expect(k?.imageUrl).toBe('https://example.com/k19.jpg')
  })

  it('preserveLocalImageData findet Bilddaten trotz Nummern-Variante (K2-M-0030 vs K2-M-30)', () => {
    const merged = [
      { number: 'K2-M-30', id: 'K2-M-30', category: 'malerei', imageUrl: '' },
      { number: 'K2-K-0030', id: 'K2-K-0030', category: 'keramik', imageUrl: 'https://example.com/k30.jpg' },
    ]
    const local = [
      { number: 'K2-M-0030', id: 'K2-M-0030', category: 'malerei', imageUrl: 'https://example.com/m30-local.jpg' },
    ]

    const out = preserveLocalImageData(merged, local)
    const m = out.find((a: any) => a.category === 'malerei')
    const k = out.find((a: any) => a.category === 'keramik')
    expect(m?.imageUrl).toBe('https://example.com/m30-local.jpg')
    expect(k?.imageUrl).toBe('https://example.com/k30.jpg')
  })
})

