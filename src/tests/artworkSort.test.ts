import { describe, it, expect } from 'vitest'
import { sortArtworksCategoryBlocksThenNumberAsc, GALERIE_CATEGORY_ORDER } from '../utils/artworkSort'

describe('sortArtworksCategoryBlocksThenNumberAsc', () => {
  it('ordnet Kategorieblöcke: zuerst komplette malerei, dann keramik, Nummern aufsteigend', () => {
    const mixed = [
      { number: 'K2-K-0003', category: 'keramik', id: '1' },
      { number: 'K2-M-0002', category: 'malerei', id: '2' },
      { number: 'K2-K-0001', category: 'keramik', id: '3' },
      { number: 'K2-M-0001', category: 'malerei', id: '4' },
    ]
    const out = sortArtworksCategoryBlocksThenNumberAsc(mixed)
    expect(out.map((a) => a.number)).toEqual(['K2-M-0001', 'K2-M-0002', 'K2-K-0001', 'K2-K-0003'])
  })

  it('setzt unbekannte Kategorien nach den Standard-Kategorien alphabetisch', () => {
    const w = [
      { number: 'B1', category: 'serie', id: 'a' },
      { number: 'K2-M-0001', category: 'malerei', id: 'b' },
      { number: 'A1', category: 'druck', id: 'c' },
    ]
    const out = sortArtworksCategoryBlocksThenNumberAsc(w)
    expect(out[0].category).toBe('malerei')
    expect(out.slice(1).map((x) => x.category)).toEqual(['druck', 'serie'])
  })

  it('export GALERIE_CATEGORY_ORDER enthält die fünf K2-Kunst-Kategorien', () => {
    expect(GALERIE_CATEGORY_ORDER).toEqual(['malerei', 'keramik', 'grafik', 'skulptur', 'sonstiges'])
  })
})
