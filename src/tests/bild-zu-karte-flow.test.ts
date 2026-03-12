/**
 * Flow-Test: Bild zu Karte – Ablauf „ein Werk speichern, andere Werke behalten ihren imageRef“.
 * Simuliert die Datenlogik wie im Admin (fresh aus Liste, ein Werk ersetzen, toSave bauen).
 * Unit-Tests prüfen Einzelfunktionen; dieser Test prüft den Ablauf.
 */

import { describe, it, expect } from 'vitest'

const keyFor = (a: any) => String(a?.number ?? a?.id ?? '').trim()

function findIdx(list: any[], dataKey: string): number {
  let i = list.findIndex((a: any) => keyFor(a) === dataKey)
  if (i >= 0) return i
  const aNum = (a: any) => String(a?.number ?? a?.id ?? '').trim()
  return list.findIndex((a: any) => {
    const an = aNum(a)
    const dn = dataKey
    if (an === dn) return true
    const aSuffix = an.replace(/^.*[-_]/, '') || an
    const dSuffix = dn.replace(/^.*[-_]/, '') || dn
    return !!(aSuffix && dSuffix && (aSuffix === dSuffix || aSuffix.endsWith(dSuffix) || dSuffix.endsWith(aSuffix)))
  })
}

describe('Bild zu Karte: Flow „ein Werk speichern“', () => {

  it('Beim Ersetzen eines Werks in der Liste behalten die anderen Werke ihren imageRef', () => {
    const fresh = [
      { number: '0030', title: 'Werk 30', imageRef: 'k2-img-0030' },
      { number: '0031', title: 'Werk 31', imageRef: 'k2-img-0031' },
      { number: '0032', title: 'Werk 32', imageRef: 'k2-img-0032' },
    ]
    const artworkData = { number: '0031', title: 'Werk 31 geändert', imageRef: '', imageUrl: 'data:image/jpeg;base64,abc' }
    const dataKey = keyFor(artworkData)
    const idx = findIdx(fresh, dataKey)
    expect(idx).toBe(1)
    const toSave = idx >= 0
      ? [...fresh.slice(0, idx), artworkData, ...fresh.slice(idx + 1)]
      : [...fresh, artworkData]
    expect(toSave).toHaveLength(3)
    expect(toSave[0].imageRef).toBe('k2-img-0030')
    expect(toSave[2].imageRef).toBe('k2-img-0032')
    expect(toSave[1].number).toBe('0031')
    expect(toSave[1].title).toBe('Werk 31 geändert')
  })

  it('Nummer-Varianten (0031 vs K2-K-0031) werden beim Finden getroffen', () => {
    const fresh = [
      { number: 'K2-K-0030', imageRef: 'k2-img-K2-K-0030' },
      { number: 'K2-K-0031', imageRef: 'k2-img-K2-K-0031' },
    ]
    const artworkData = { number: '0031', title: 'Neu' }
    const dataKey = keyFor(artworkData)
    const idx = findIdx(fresh, dataKey)
    expect(idx).toBe(1)
    const toSave = idx >= 0 ? [...fresh.slice(0, idx), artworkData, ...fresh.slice(idx + 1)] : [...fresh, artworkData]
    expect(toSave[0].imageRef).toBe('k2-img-K2-K-0030')
  })

  /** Simuliert setAllArtworksSafe (iframe): Wenn nur ein Werk („last“) imageUrl bekommt, müssen andere ihr imageUrl aus dem bisherigen State behalten – sonst verschwindet das erste Bild, sobald ein zweites geladen wird. */
  it('Zweites Bild laden: erstes Werk behält imageUrl aus bisherigem State (nur Bilder)', () => {
    const key = (a: any) => String(a?.number ?? a?.id ?? '').trim()
    const blobA = 'blob:http://localhost/aaa-' + 'x'.repeat(40)
    const blobB = 'blob:http://localhost/bbb-' + 'y'.repeat(40)
    const prevList = [
      { number: '0030', title: 'A', imageRef: 'k2-img-0030', imageUrl: blobA },
      { number: '0031', title: 'B', imageRef: 'k2-img-0031', imageUrl: blobB },
    ]
    const blobNeu = 'blob:http://localhost/neu-' + 'z'.repeat(40)
    const newListStripped = [
      { number: '0030', title: 'A', imageRef: 'k2-img-0030', imageUrl: '' },
      { number: '0031', title: 'B', imageRef: 'k2-img-0031', imageUrl: blobNeu },
    ]
    const last = { number: '0031', imageUrl: blobNeu }
    const withSaved = newListStripped.map((a: any) => {
      if (!a) return a
      const id = key(a)
      const url = id === last.number ? last.imageUrl : null
      if (url) return { ...a, imageUrl: url }
      const prev = prevList.find((x: any) => key(x) === id)
      if (prev?.imageUrl && typeof prev.imageUrl === 'string' && prev.imageUrl.length > 50 && !prev.imageUrl.startsWith('data:'))
        return { ...a, imageUrl: prev.imageUrl }
      return a
    })
    expect(withSaved[0].imageUrl).toBe(blobA)
    expect(withSaved[1].imageUrl).toBe(blobNeu)
    expect(withSaved[0].imageRef).toBe('k2-img-0030')
    expect(withSaved[1].imageRef).toBe('k2-img-0031')
  })
})
