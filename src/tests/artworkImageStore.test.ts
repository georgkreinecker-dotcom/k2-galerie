/**
 * Tests für artworkImageStore – Ref-Varianten für Bild-Lookup (Export, Anzeige).
 * BUG-031: K2-K-0030 → Zifferngruppe 0030/30 muss in Varianten sein, NICHT digits aus ganzem String (20030).
 */

import { describe, it, expect } from 'vitest'
import {
  getArtworkImageRefVariants,
  getArtworkImageRef,
  resolveArtworkImages,
  prepareArtworksForStorage,
} from '../utils/artworkImageStore'

describe('artworkImageStore: getArtworkImageRefVariants', () => {

  it('K2-K-0030 enthält k2-img-0030 und k2-img-30 (Zifferngruppe aus K2-Match, nicht "20030" aus ganzem String)', () => {
    const variants = getArtworkImageRefVariants({ number: 'K2-K-0030' })
    expect(variants).toContain('k2-img-0030')
    expect(variants).toContain('k2-img-30')
    expect(variants).toContain('k2-img-K2-K-0030')
    // Würde jemand wieder "digits" aus ganzem String nutzen: 20030 → k2-img-20030 (falsch)
    expect(variants).not.toContain('k2-img-20030')
  })

  it('K2-K-0031, K2-M-0038: Zifferngruppe 0031/31 bzw. 0038/38 in Varianten', () => {
    expect(getArtworkImageRefVariants({ number: 'K2-K-0031' })).toContain('k2-img-0031')
    expect(getArtworkImageRefVariants({ number: 'K2-K-0031' })).toContain('k2-img-31')
    expect(getArtworkImageRefVariants({ number: 'K2-M-0038' })).toContain('k2-img-0038')
    expect(getArtworkImageRefVariants({ number: 'K2-M-0038' })).toContain('k2-img-38')
  })

  it('number 0030 (nur Ziffern): enthält k2-img-0030, k2-img-30, k2-img-K2-K-0030', () => {
    const variants = getArtworkImageRefVariants({ number: '0030' })
    expect(variants).toContain('k2-img-0030')
    expect(variants).toContain('k2-img-30')
    expect(variants).toContain('k2-img-K2-K-0030')
  })

  it('getArtworkImageRef: number/id wird zu k2-img-{id}', () => {
    expect(getArtworkImageRef({ number: 'K2-K-0030' })).toBe('k2-img-K2-K-0030')
    expect(getArtworkImageRef({ number: '0030' })).toBe('k2-img-0030')
  })
})

describe('prepareArtworksForStorage', () => {
  it('bei kanonischem imageRef und leerer imageUrl: kein unnötiger IDB-Pfad (schneller Save bei vielen Werken)', async () => {
    const a = { number: 'K2-K-0999', imageUrl: '', imageRef: 'k2-img-K2-K-0999' }
    const out = await prepareArtworksForStorage([a])
    expect(out).toHaveLength(1)
    expect(out[0].imageRef).toBe('k2-img-K2-K-0999')
    expect(out[0].imageUrl).toBe('')
  })
})

describe('resolveArtworkImages: ök2 Musterwerk mit imageRef', () => {
  it('setzt imageUrl auf Kategorie-Default (Werkkatalog), imageRef bleibt erhalten', async () => {
    const list = await resolveArtworkImages([
      { number: 'M1', category: 'malerei', imageRef: 'k2-img-M1', imageUrl: '' },
      { number: 'G1', category: 'grafik', imageRef: 'k2-img-G1', imageUrl: '' },
    ])
    expect(list[0].imageUrl).toBe('/img/muster/malerei.svg')
    expect(list[1].imageUrl).toBe('/img/muster/grafik.svg')
    expect(list[0].imageRef).toBe('k2-img-M1')
    expect(list[1].imageRef).toBe('k2-img-G1')
  })
})
