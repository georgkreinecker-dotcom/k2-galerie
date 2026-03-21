import { describe, expect, it } from 'vitest'
import {
  applyK2MalereiMartinaKtoMBatch,
  artistIndicatesMartinaForK2MalereiFix,
  computeK2MalereiMartinaCorrectedNumber,
  isK2MalereiMartinaWrongKPrefix,
  nameMatchesArtistField,
} from '../utils/k2MalereiMartinaKtoMPrefixFix'

const M = 'Martina Kreinecker'
const G = 'Georg Kreinecker'

describe('k2MalereiMartinaKtoMPrefixFix', () => {
  it('nameMatchesArtistField: Vornamen / voller Name', () => {
    expect(nameMatchesArtistField('Martina Kreinecker', M)).toBe(true)
    expect(nameMatchesArtistField('martina', M)).toBe(true)
    expect(nameMatchesArtistField('Kreinecker', M)).toBe(true)
  })

  it('artistIndicatesMartinaForK2MalereiFix: Georg aus, Martina zu, Nachname allein = Martina', () => {
    expect(artistIndicatesMartinaForK2MalereiFix('Georg Kreinecker', M, G)).toBe(false)
    expect(artistIndicatesMartinaForK2MalereiFix('Martina Kreinecker', M, G)).toBe(true)
    expect(artistIndicatesMartinaForK2MalereiFix('', M, G)).toBe(true)
    expect(artistIndicatesMartinaForK2MalereiFix('Kreinecker', M, G)).toBe(true)
    expect(artistIndicatesMartinaForK2MalereiFix('Unbekannt XY', M, G)).toBe(false)
  })

  it('isK2MalereiMartinaWrongKPrefix: malerei + K2-K- + Martina ja, Keramik/Georg nein', () => {
    expect(
      isK2MalereiMartinaWrongKPrefix(
        { category: 'malerei', number: 'K2-K-0031', artist: M },
        M,
        G
      )
    ).toBe(true)
    expect(
      isK2MalereiMartinaWrongKPrefix(
        { category: 'malerei', number: 'K2-K-0031', artist: '' },
        M,
        G
      )
    ).toBe(true)
    expect(
      isK2MalereiMartinaWrongKPrefix(
        { category: 'malerei', number: 'K2-K-0031', artist: G },
        M,
        G
      )
    ).toBe(false)
    expect(
      isK2MalereiMartinaWrongKPrefix(
        { category: 'keramik', number: 'K2-K-0031', artist: M },
        M,
        G
      )
    ).toBe(false)
    expect(
      isK2MalereiMartinaWrongKPrefix(
        { category: 'grafik', number: 'K2-K-0099', artist: '' },
        M,
        G
      )
    ).toBe(true)
    expect(
      isK2MalereiMartinaWrongKPrefix(
        { category: 'malerei', number: 'K2-M-0031', artist: M },
        M,
        G
      )
    ).toBe(false)
    expect(
      isK2MalereiMartinaWrongKPrefix(
        { category: 'malerei', entryType: 'product', number: 'K2-K-0031', artist: M },
        M,
        G
      )
    ).toBe(false)
  })

  it('computeK2MalereiMartinaCorrectedNumber: K2-K-0031 → K2-M-0031', () => {
    const list = [{ number: 'K2-K-0031', id: 'K2-K-0031', category: 'malerei', artist: M }]
    expect(computeK2MalereiMartinaCorrectedNumber(list[0], list, M, G)).toBe('K2-M-0031')
  })

  it('compute: wenn K2-M-0031 schon belegt → nächste freie M-Nummer', () => {
    const list = [
      { number: 'K2-M-0031', id: 'K2-M-0031', category: 'malerei', artist: M },
      { number: 'K2-K-0031', id: 'K2-K-0031', category: 'malerei', artist: M },
    ]
    const to = computeK2MalereiMartinaCorrectedNumber(list[1], list, M, G)
    expect(to).toBeTruthy()
    expect(to).not.toBe('K2-K-0031')
    expect(to).toMatch(/^K2-M-\d+$/)
    expect(to).not.toBe('K2-M-0031')
  })

  it('applyK2MalereiMartinaKtoMBatch benennt alle passenden Werke', () => {
    const raw = [
      { number: 'K2-K-0040', id: 'K2-K-0040', category: 'malerei', artist: M },
      { number: 'K2-K-0041', id: 'K2-K-0041', category: 'malerei', artist: G },
    ]
    const { list, renames } = applyK2MalereiMartinaKtoMBatch(raw, M, G)
    expect(list[0].number).toBe('K2-M-0040')
    expect(list[1].number).toBe('K2-K-0041')
    expect(renames).toEqual([{ from: 'K2-K-0040', to: 'K2-M-0040' }])
  })
})
