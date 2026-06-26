import { describe, expect, it } from 'vitest'
import {
  buildGalerieSoldDisplayContext,
  filterArtworksForGalerieView,
  shouldHideSoldArtworkFromGalerie,
} from '../utils/galerieSoldDisplay'

describe('galerieSoldDisplay', () => {
  const artwork = { number: 'K2-M-0031', quantity: 0, category: 'malerei' }
  const soldList = [{ number: 'K2-M-31', soldAt: '2020-01-01T12:00:00.000Z', soldQuantity: 1 }]

  it('erkennt verkauft bei Nummernvariante K2-M-0031 / K2-M-31', () => {
    const ctx = buildGalerieSoldDisplayContext([artwork], soldList, [], 30)
    const status = ctx.soldStatusByArtworkKey.get('K2-M-0031')
    expect(status?.isSoldOut).toBe(true)
  })

  it('blendet nach Frist aus (soldDisplayDays)', () => {
    const ctx = buildGalerieSoldDisplayContext([artwork], soldList, [], 30)
    const visible = filterArtworksForGalerieView([artwork], ctx, 'alle', false)
    expect(visible).toHaveLength(0)
  })

  it('soldDisplayDays 0 = sofort ausblenden auch ohne soldAt', () => {
    const soldOutNoDate = { number: 'K2-K-0005', quantity: 0, category: 'keramik' }
    const ctx = buildGalerieSoldDisplayContext([soldOutNoDate], [], [], 0)
    expect(shouldHideSoldArtworkFromGalerie(ctx.soldStatusByArtworkKey.get('K2-K-0005'), null, 0)).toBe(true)
    const visible = filterArtworksForGalerieView([soldOutNoDate], ctx, 'alle', false)
    expect(visible).toHaveLength(0)
  })

  it('ohne Verkaufsdatum bleibt verkauftes Werk sichtbar bis Frist (nicht sofort weg)', () => {
    const soldOutNoDate = { number: 'K2-K-0009', quantity: 0, category: 'keramik' }
    const ctx = buildGalerieSoldDisplayContext([soldOutNoDate], [], [], 30)
    expect(shouldHideSoldArtworkFromGalerie(ctx.soldStatusByArtworkKey.get('K2-K-0009'), null, 30)).toBe(false)
  })
})
