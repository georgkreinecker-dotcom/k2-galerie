import {
  canonicalKeramikK2Numbers,
  mergeMissingCanonicalKeramikK2FromServerArtworks,
  mergeAllMissingKeramikK2KFromServerArtworks,
} from '../utils/mergeMissingK2KeramikFromGalleryData'

describe('mergeMissingK2KeramikFromGalleryData', () => {
  it('canonicalKeramikK2Numbers liefert K2-K-0001 bis K2-K-0021', () => {
    const n = canonicalKeramikK2Numbers()
    expect(n).toHaveLength(21)
    expect(n[0]).toBe('K2-K-0001')
    expect(n[20]).toBe('K2-K-0021')
  })

  it('fügt nur fehlende Keramik-K2-K-0001.. aus Server an', () => {
    const server = [
      { number: 'K2-K-0001', id: 'K2-K-0001', category: 'keramik', title: 'A' },
      { number: 'K2-K-0002', id: 'K2-K-0002', category: 'keramik', title: 'B' },
      { number: 'K2-M-0001', id: 'K2-M-0001', category: 'malerei', title: 'M' },
    ]
    const local = [{ number: 'K2-K-0001', id: 'K2-K-0001', category: 'keramik', title: 'Local' }]
    const { merged, added } = mergeMissingCanonicalKeramikK2FromServerArtworks(local, server)
    expect(added).toEqual(['K2-K-0002'])
    expect(merged).toHaveLength(2)
    expect(merged[0].title).toBe('Local')
    expect(merged[1].title).toBe('B')
  })

  it('ignoriert Server-Eintrag wenn Kategorie nicht keramik', () => {
    const server = [{ number: 'K2-K-0001', id: 'K2-K-0001', category: 'malerei', title: 'X' }]
    const { merged, added } = mergeMissingCanonicalKeramikK2FromServerArtworks([], server)
    expect(added).toEqual([])
    expect(merged).toEqual([])
  })

  it('mergeAllMissingKeramikK2KFromServerArtworks: alle fehlenden K2-K-Keramik', () => {
    const server = [
      { number: 'K2-K-0019', category: 'keramik', title: '19' },
      { number: 'K2-K-0050', category: 'keramik', title: '50' },
      { number: 'K2-M-0001', category: 'malerei', title: 'M' },
      { number: 'K2-K-0099', category: 'malerei', title: 'falsch' },
    ]
    const local = [{ number: 'K2-K-0050', category: 'keramik', title: 'lokal' }]
    const { merged, added } = mergeAllMissingKeramikK2KFromServerArtworks(local, server)
    expect(added).toEqual(['K2-K-0019'])
    expect(merged.map((x) => x.number)).toEqual(['K2-K-0050', 'K2-K-0019'])
  })
})
