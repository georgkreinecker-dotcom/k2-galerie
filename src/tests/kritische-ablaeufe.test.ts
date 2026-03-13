/**
 * Kritische Abläufe: Warteschlange (zwei Speichervorgänge nacheinander).
 * BUG-033: Beim Speichern von Werk B darf Werk A nicht überschrieben werden.
 * Test auf Datenebene: Zwei sequentielle Lese-Ersetze-Schreibe-Zyklen → beide Updates bleiben erhalten.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { readArtworksRawByKey, saveArtworksByKey } from '../utils/artworksStorage'

const TEST_KEY = 'k2-test-artworks-queue'

function mkArtwork(number: string, title: string, imageRef: string): any {
  return {
    number,
    id: number,
    title,
    imageRef,
    imageUrl: '',
    updatedAt: new Date().toISOString()
  }
}

describe('Kritische Abläufe: Zwei Speichervorgänge nacheinander (Warteschlange)', () => {
  beforeEach(() => {
    try {
      localStorage.removeItem(TEST_KEY)
    } catch (_) {}
  })

  afterEach(() => {
    try {
      localStorage.removeItem(TEST_KEY)
    } catch (_) {}
  })

  it('Zwei sequentielle Speichervorgänge (erst Werk 0, dann Werk 1) – beide Updates bleiben erhalten', () => {
    const a0 = mkArtwork('0030', 'Werk 30 alt', 'k2-img-0030')
    const a1 = mkArtwork('0031', 'Werk 31 alt', 'k2-img-0031')
    saveArtworksByKey(TEST_KEY, [a0, a1], { filterK2Only: false, allowReduce: false })

    // Simuliert Admin: erst Werk 0 speichern (load → ersetze [0] → save)
    const load1 = readArtworksRawByKey(TEST_KEY)
    const a0New = { ...load1[0], title: 'Werk 30 neu', imageRef: 'k2-img-0030' }
    const toSave1 = [a0New, load1[1]]
    saveArtworksByKey(TEST_KEY, toSave1, { filterK2Only: false, allowReduce: false })

    // Simuliert Admin: danach Werk 1 speichern (load → ersetze [1] → save)
    const load2 = readArtworksRawByKey(TEST_KEY)
    const a1New = { ...load2[1], title: 'Werk 31 neu', imageRef: 'k2-img-0031' }
    const toSave2 = [load2[0], a1New]
    saveArtworksByKey(TEST_KEY, toSave2, { filterK2Only: false, allowReduce: false })

    const final = readArtworksRawByKey(TEST_KEY)
    expect(final).toHaveLength(2)
    expect(final[0].title).toBe('Werk 30 neu')
    expect(final[0].imageRef).toBe('k2-img-0030')
    expect(final[1].title).toBe('Werk 31 neu')
    expect(final[1].imageRef).toBe('k2-img-0031')
  })

  it('Zwei sequentielle Speichervorgänge mit Bild-Referenz – kein Verlust von Werk 0 beim Speichern von Werk 1', () => {
    const a0 = mkArtwork('0030', 'Mit Bild', 'k2-img-0030')
    const a1 = mkArtwork('0031', 'Ohne Bild', '')
    saveArtworksByKey(TEST_KEY, [a0, a1], { filterK2Only: false, allowReduce: false })

    // Erster Save: nur Werk 1 ändern
    const load1 = readArtworksRawByKey(TEST_KEY)
    const a1Updated = { ...load1[1], title: 'Werk 31 geändert' }
    saveArtworksByKey(TEST_KEY, [load1[0], a1Updated], { filterK2Only: false, allowReduce: false })

    const afterFirst = readArtworksRawByKey(TEST_KEY)
    expect(afterFirst[0].imageRef).toBe('k2-img-0030')
    expect(afterFirst[0].title).toBe('Mit Bild')
    expect(afterFirst[1].title).toBe('Werk 31 geändert')

    // Zweiter Save: wieder nur Werk 1 ändern (simuliert zweiten Klick)
    const load2 = readArtworksRawByKey(TEST_KEY)
    const a1Again = { ...load2[1], title: 'Werk 31 final' }
    saveArtworksByKey(TEST_KEY, [load2[0], a1Again], { filterK2Only: false, allowReduce: false })

    const final = readArtworksRawByKey(TEST_KEY)
    expect(final[0].imageRef).toBe('k2-img-0030')
    expect(final[0].title).toBe('Mit Bild')
    expect(final[1].title).toBe('Werk 31 final')
  })
})
