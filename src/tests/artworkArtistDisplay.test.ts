import { describe, it, expect } from 'vitest'
import { resolveArtistLabelForGalerieStatistik } from '../utils/artworkArtistDisplay'

const fb = { martina: 'Martina K.', georg: 'Georg K.' }

describe('resolveArtistLabelForGalerieStatistik', () => {
  it('nutzt gespeicherten artist', () => {
    expect(resolveArtistLabelForGalerieStatistik({ artist: '  X  ', category: 'keramik' }, fb)).toBe('X')
  })

  it('ohne Fallback nur Ohne Künstler wenn artist leer', () => {
    expect(resolveArtistLabelForGalerieStatistik({ category: 'malerei' }, null)).toBe('Ohne Künstler')
  })

  it('Kategorie wie Admin: malerei/grafik/sonstiges → Martina', () => {
    expect(resolveArtistLabelForGalerieStatistik({ category: 'malerei' }, fb)).toBe('Martina K.')
    expect(resolveArtistLabelForGalerieStatistik({ category: 'grafik' }, fb)).toBe('Martina K.')
    expect(resolveArtistLabelForGalerieStatistik({ category: 'sonstiges' }, fb)).toBe('Martina K.')
  })

  it('Kategorie: keramik/skulptur → Georg', () => {
    expect(resolveArtistLabelForGalerieStatistik({ category: 'keramik' }, fb)).toBe('Georg K.')
    expect(resolveArtistLabelForGalerieStatistik({ category: 'skulptur' }, fb)).toBe('Georg K.')
  })

  it('K2-K-/Keramik: fälschlich Martina im Künstlerfeld → Georg (Echtheitszertifikat / Statistik)', () => {
    const fbFull = { martina: 'Martina Kreinecker', georg: 'Georg Kreinecker' }
    expect(
      resolveArtistLabelForGalerieStatistik(
        { number: 'K2-K-0041', artist: 'Martina Kreinecker', category: 'malerei' },
        fbFull,
      ),
    ).toBe('Georg Kreinecker')
    expect(
      resolveArtistLabelForGalerieStatistik({ number: 'K2-K-0041', artist: 'Martina K.', category: 'keramik' }, fb),
    ).toBe('Georg K.')
    expect(
      resolveArtistLabelForGalerieStatistik({ number: 'K2-K-0041', artist: 'Martina', category: 'grafik' }, fb),
    ).toBe('Georg K.')
  })

  it('K2-Werknummer ohne artist', () => {
    expect(resolveArtistLabelForGalerieStatistik({ number: 'K2-M-0042' }, fb)).toBe('Martina K.')
    expect(resolveArtistLabelForGalerieStatistik({ number: 'K2-K-0012' }, fb)).toBe('Georg K.')
    expect(resolveArtistLabelForGalerieStatistik({ number: 'k2-s-0003' }, fb)).toBe('Georg K.')
    expect(resolveArtistLabelForGalerieStatistik({ id: 'K2-G-0099' }, fb)).toBe('Martina K.')
    expect(resolveArtistLabelForGalerieStatistik({ number: 'K2-P-0001' }, fb)).toBe('Georg K.')
  })

  it('Legacy K2-1234 → Martina', () => {
    expect(resolveArtistLabelForGalerieStatistik({ number: 'K2-1234' }, fb)).toBe('Martina K.')
  })

  it('entryType product / idea', () => {
    expect(resolveArtistLabelForGalerieStatistik({ entryType: 'product' }, fb)).toBe('Georg K.')
    expect(resolveArtistLabelForGalerieStatistik({ entryType: 'idea' }, fb)).toBe('Martina K.')
  })

  it('Produkt-/Idee-Kategorie ohne artist (auch ohne entryType) wie auf Werkkarten', () => {
    expect(resolveArtistLabelForGalerieStatistik({ category: 'serie', entryType: 'artwork' }, fb)).toBe('Georg K.')
    expect(resolveArtistLabelForGalerieStatistik({ category: 'druck' }, fb)).toBe('Georg K.')
    expect(resolveArtistLabelForGalerieStatistik({ category: 'projekt', entryType: 'artwork' }, fb)).toBe('Martina K.')
    expect(resolveArtistLabelForGalerieStatistik({ category: 'sonstiges_idee' }, fb)).toBe('Martina K.')
  })
})
