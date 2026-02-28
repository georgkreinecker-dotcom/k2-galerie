/**
 * Phase 9.1: Tests für Persistenz-Schicht artworksStorage (Phase 1.2).
 * Kontext-Keys korrekt; „nie mit weniger überschreiben“ (Schutz).
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  readArtworksRawForContext,
  saveArtworksForContext,
  readArtworksRawByKey,
  saveArtworksByKey,
  mergeAndMaybeWrite,
  getArtworksStorageKey
} from '../utils/artworksStorage'

const K2_KEY = 'k2-artworks'
const OEK2_KEY = 'k2-oeffentlich-artworks'

describe('artworksStorage: Kontext-Keys', () => {

  beforeEach(() => {
    localStorage.removeItem(K2_KEY)
    localStorage.removeItem(OEK2_KEY)
  })

  it('getArtworksStorageKey: K2 → k2-artworks, ök2 → k2-oeffentlich-artworks, VK2 → null', () => {
    expect(getArtworksStorageKey('k2')).toBe(K2_KEY)
    expect(getArtworksStorageKey('oeffentlich')).toBe(OEK2_KEY)
    expect(getArtworksStorageKey('vk2')).toBeNull()
  })

  it('readArtworksRawForContext K2 liest k2-artworks', () => {
    localStorage.setItem(K2_KEY, JSON.stringify([{ number: '1', title: 'K2' }]))
    const list = readArtworksRawForContext(false, false)
    expect(list).toHaveLength(1)
    expect(list[0].number).toBe('1')
  })

  it('readArtworksRawForContext ök2 liest k2-oeffentlich-artworks', () => {
    localStorage.setItem(OEK2_KEY, JSON.stringify([{ number: 'M1', title: 'Muster' }]))
    const list = readArtworksRawForContext(true, false)
    expect(list).toHaveLength(1)
    expect(list[0].number).toBe('M1')
  })

  it('readArtworksRawForContext VK2 liefert immer []', () => {
    const list = readArtworksRawForContext(false, true)
    expect(list).toEqual([])
  })

  it('saveArtworksForContext K2 schreibt in k2-artworks', () => {
    const ok = saveArtworksForContext(false, false, [{ number: '1', title: 'A' }])
    expect(ok).toBe(true)
    expect(readArtworksRawByKey(K2_KEY)).toHaveLength(1)
    expect(localStorage.getItem(OEK2_KEY)).toBeNull()
  })

  it('saveArtworksForContext ök2 schreibt in k2-oeffentlich-artworks', () => {
    const ok = saveArtworksForContext(true, false, [{ number: 'M1', title: 'M' }])
    expect(ok).toBe(true)
    expect(readArtworksRawByKey(OEK2_KEY)).toHaveLength(1)
  })

  it('saveArtworksForContext VK2 ist No-Op (false, schreibt nichts)', () => {
    const ok = saveArtworksForContext(false, true, [{ number: 'VK2-1' }])
    expect(ok).toBe(false)
    expect(localStorage.getItem(K2_KEY)).toBeNull()
    expect(localStorage.getItem(OEK2_KEY)).toBeNull()
  })
})

describe('artworksStorage: Nie mit weniger überschreiben', () => {

  beforeEach(() => {
    localStorage.removeItem(K2_KEY)
  })

  it('saveArtworksByKey lehnt ab wenn weniger Werke und allowReduce false', () => {
    localStorage.setItem(K2_KEY, JSON.stringify([
      { number: '1' }, { number: '2' }, { number: '3' }
    ]))
    const ok = saveArtworksByKey(K2_KEY, [{ number: '1' }], { allowReduce: false })
    expect(ok).toBe(false)
    expect(readArtworksRawByKey(K2_KEY)).toHaveLength(3)
  })

  it('saveArtworksByKey erlaubt weniger Werke wenn allowReduce true', () => {
    localStorage.setItem(K2_KEY, JSON.stringify([{ number: '1' }, { number: '2' }]))
    const ok = saveArtworksByKey(K2_KEY, [{ number: '1' }], { allowReduce: true })
    expect(ok).toBe(true)
    expect(readArtworksRawByKey(K2_KEY)).toHaveLength(1)
  })

  it('mergeAndMaybeWrite überschreibt nicht mit weniger: Server 1, Lokal 3 → merged enthält alle 3', () => {
    const local = [
      { number: '1', title: 'A' },
      { number: '2', title: 'B' },
      { number: '3', title: 'C' }
    ]
    localStorage.setItem(K2_KEY, JSON.stringify(local))
    const server = [{ number: '1', title: 'A server' }]
    const { list, written } = mergeAndMaybeWrite(local, server)
    expect(list).toHaveLength(3)
    expect(readArtworksRawByKey(K2_KEY)).toHaveLength(3)
    expect(written).toBe(true)
  })

  it('mergeAndMaybeWrite schreibt wenn merged mindestens so viele wie currentCount', () => {
    const local = [{ number: '1', title: 'A' }]
    localStorage.setItem(K2_KEY, JSON.stringify(local))
    const server = [
      { number: '1', title: 'A server', updatedAt: new Date().toISOString() },
      { number: '2', title: 'B server' }
    ]
    const { list, written } = mergeAndMaybeWrite(local, server)
    expect(written).toBe(true)
    expect(list).toHaveLength(2)
    expect(readArtworksRawByKey(K2_KEY)).toHaveLength(2)
  })
})
