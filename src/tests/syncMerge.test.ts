/**
 * Phase 9.1: Tests für mergeServerWithLocal (Phase 2.1).
 * Regel: Server = Quelle; lokale ohne Server-Eintrag übernommen; Konflikt: Mobile gewinnt, sonst neueres updatedAt.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mergeServerWithLocal, preserveLocalImageData, preserveStorageImageRefs, applyServerDataToLocal, updateKnownServerMaxNumbers, getKnownServerMaxForPrefix, renumberCollidingLocalArtworks } from '../utils/syncMerge'

const KNOWN_MAX_PREFIX = 'k2-known-max-number-'
function clearKnownMaxKeys() {
  try {
    ;['M', 'K', 'G', 'S', 'O'].forEach((letter) => localStorage.removeItem(`${KNOWN_MAX_PREFIX}${letter}`))
  } catch (_) {}
}

describe('mergeServerWithLocal', () => {

  it('merged startet mit Server-Liste', () => {
    const server = [{ number: '1', title: 'A', updatedAt: '2026-01-01T12:00:00Z' }]
    const local: any[] = []
    const { merged } = mergeServerWithLocal(server, local)
    expect(merged).toHaveLength(1)
    expect(merged[0].number).toBe('1')
  })

  it('lokale Werke ohne Server-Eintrag werden hinzugefügt', () => {
    const server = [{ number: '1', title: 'A' }]
    const local = [
      { number: '1', title: 'A' },
      { number: '2', title: 'Nur lokal' }
    ]
    const { merged } = mergeServerWithLocal(server, local)
    expect(merged).toHaveLength(2)
    expect(merged.map((a: any) => a.number).sort()).toEqual(['1', '2'])
    expect(merged.find((a: any) => a.number === '2')?.title).toBe('Nur lokal')
  })

  it('bei Konflikt gewinnt Mobile-Werk', () => {
    const server = [{ number: '1', title: 'Server', updatedAt: '2026-01-02T12:00:00Z' }]
    const local = [{ number: '1', title: 'Lokal Mobile', updatedAt: '2026-01-01T10:00:00Z', createdOnMobile: true }]
    const { merged } = mergeServerWithLocal(server, local)
    expect(merged).toHaveLength(1)
    expect(merged[0].title).toBe('Lokal Mobile')
  })

  it('bei Konflikt ohne Mobile gewinnt neueres updatedAt', () => {
    const server = [{ number: '1', title: 'Server', updatedAt: '2026-01-01T12:00:00Z' }]
    const local = [{ number: '1', title: 'Lokal neuer', updatedAt: '2026-01-02T12:00:00Z' }]
    const { merged } = mergeServerWithLocal(server, local)
    expect(merged).toHaveLength(1)
    expect(merged[0].title).toBe('Lokal neuer')
  })

  it('bei Konflikt ohne Mobile behält Server wenn Server neuer', () => {
    const server = [{ number: '1', title: 'Server neuer', updatedAt: '2026-01-02T12:00:00Z' }]
    const local = [{ number: '1', title: 'Lokal', updatedAt: '2026-01-01T12:00:00Z' }]
    const { merged } = mergeServerWithLocal(server, local)
    expect(merged).toHaveLength(1)
    expect(merged[0].title).toBe('Server neuer')
  })

  it('toHistory enthält lokale ohne Server die nicht (mobile und sehr neu) sind', () => {
    const server: any[] = []
    const oldDate = new Date(Date.now() - 20 * 60 * 1000).toISOString() // 20 Min
    const local = [
      { number: '1', title: 'Alt', createdAt: oldDate },
      { number: '2', title: 'Mobile sehr neu', createdAt: new Date().toISOString(), createdOnMobile: true }
    ]
    const { toHistory } = mergeServerWithLocal(server, local)
    expect(toHistory.some((a: any) => a.number === '1')).toBe(true)
    expect(toHistory.some((a: any) => a.number === '2')).toBe(false)
  })

  it('onlyAddLocalIfMobileAndVeryNew: alte lokale ohne Server werden nicht übernommen (Musterwerke weg)', () => {
    const server = [{ number: '1', title: 'Echtes Werk' }]
    const oldDate = new Date(Date.now() - 20 * 60 * 1000).toISOString()
    const local = [
      { number: '1', title: 'Echtes Werk' },
      { number: 'M-1', title: 'Altes Muster', createdAt: oldDate },
      { number: 'M-2', title: 'Noch Muster', createdAt: oldDate }
    ]
    const { merged } = mergeServerWithLocal(server, local, { onlyAddLocalIfMobileAndVeryNew: true })
    expect(merged).toHaveLength(1)
    expect(merged[0].number).toBe('1')
  })

  it('onlyAddLocalIfMobileAndVeryNew: sehr neues Mobile-Werk ohne Server wird übernommen', () => {
    const server = [{ number: '1', title: 'A' }]
    const local = [
      { number: '1', title: 'A' },
      { number: '2', title: 'Gerade am Handy', createdAt: new Date().toISOString(), createdOnMobile: true }
    ]
    const { merged } = mergeServerWithLocal(server, local, { onlyAddLocalIfMobileAndVeryNew: true })
    expect(merged).toHaveLength(2)
    expect(merged.find((a: any) => a.number === '2')?.title).toBe('Gerade am Handy')
  })

  it('onlyAddLocalIfMobileAndVeryNew: älteres Mobile-Werk ohne Server wird ebenfalls übernommen (iPad-Werke bleiben)', () => {
    const server: any[] = []
    const oldDate = new Date(Date.now() - 20 * 60 * 1000).toISOString()
    const local = [
      { number: '1', title: 'Am iPad angelegt', createdAt: oldDate, createdOnMobile: true },
      { number: '2', title: 'Auch iPad', createdAt: oldDate, createdOnMobile: true }
    ]
    const { merged } = mergeServerWithLocal(server, local, { onlyAddLocalIfMobileAndVeryNew: true })
    expect(merged).toHaveLength(2)
    expect(merged.map((a: any) => a.number).sort()).toEqual(['1', '2'])
  })
})

describe('Fortlaufende Nummern', () => {
  beforeEach(clearKnownMaxKeys)
  afterEach(clearKnownMaxKeys)

  it('updateKnownServerMaxNumbers speichert Max pro Kategorie, getKnownServerMaxForPrefix liest ihn', () => {
    const artworks = [
      { number: 'K2-M-0001' },
      { number: 'K2-M-0050' },
      { number: 'K2-K-0003' }
    ]
    updateKnownServerMaxNumbers(artworks)
    expect(getKnownServerMaxForPrefix('M')).toBe(50)
    expect(getKnownServerMaxForPrefix('K')).toBe(3)
    expect(getKnownServerMaxForPrefix('G')).toBe(0)
  })

  it('renumberCollidingLocalArtworks: Mobile-Werk mit gleicher Nummer wie Server (anderes id) wird umnummeriert', () => {
    const server = [
      { id: 'server-1', number: 'K2-M-0001', title: 'Vom Mac' }
    ]
    const local = [
      { id: 'ipad-1', number: 'K2-M-0001', title: 'Vom iPad', createdOnMobile: true }
    ]
    const result = renumberCollidingLocalArtworks(server, local)
    expect(result).toHaveLength(1)
    expect(result[0].number).not.toBe('K2-M-0001')
    expect(result[0].number).toMatch(/^K2-M-\d{4}$/)
    expect(parseInt(result[0].number.replace(/\D/g, ''), 10)).toBeGreaterThanOrEqual(2)
  })
})

describe('Flow: Vom Server laden (merge + preserveLocalImageData)', () => {
  it('Nach Merge behalten Werke ihren lokalen imageRef wenn Server kein Bild hat', () => {
    const server = [
      { number: '0030', title: 'A', updatedAt: '2026-01-02T12:00:00Z' },
      { number: '0031', title: 'B', updatedAt: '2026-01-02T12:00:00Z' }
    ]
    const local = [
      { number: '0030', title: 'A', imageRef: 'k2-img-0030', updatedAt: '2026-01-01T12:00:00Z' },
      { number: '0031', title: 'B', imageRef: 'k2-img-0031', updatedAt: '2026-01-01T12:00:00Z' }
    ]
    const { merged } = mergeServerWithLocal(server, local)
    const withImages = preserveLocalImageData(merged, local)
    expect(withImages).toHaveLength(2)
    expect(withImages[0].imageRef).toBe('k2-img-0030')
    expect(withImages[1].imageRef).toBe('k2-img-0031')
  })

  it('applyServerDataToLocal: Ergebnis hat lokale imageRefs erhalten', () => {
    const server = [
      { number: '0030', title: 'Server A' },
      { number: '0031', title: 'Server B' }
    ]
    const local = [
      { number: '0030', title: 'Lokal A', imageRef: 'k2-img-0030' },
      { number: '0031', title: 'Lokal B', imageRef: 'k2-img-0031' }
    ]
    const { merged } = applyServerDataToLocal(server, local)
    expect(merged).toHaveLength(2)
    expect(merged[0].imageRef).toBe('k2-img-0030')
    expect(merged[1].imageRef).toBe('k2-img-0031')
  })
})

describe('Flow: Vom Server laden – Anzeige nicht leer (BUG-026)', () => {
  it('Wenn Server Werke liefert und lokal leer ist, ist die Anzeige-Liste (Merge-Ergebnis) nicht leer', () => {
    const server = [
      { number: '0030', title: 'Werk 30', imageUrl: 'https://server.com/30.jpg', updatedAt: '2026-01-02T12:00:00Z' },
      { number: '0031', title: 'Werk 31', imageUrl: 'https://server.com/31.jpg', updatedAt: '2026-01-02T12:00:00Z' }
    ]
    const local: any[] = []
    const { merged } = applyServerDataToLocal(server, local)
    expect(merged).toHaveLength(2)
    expect(merged.length).toBeGreaterThan(0)
    expect(merged[0].title).toBe('Werk 30')
    expect(merged[1].title).toBe('Werk 31')
  })

  it('Wenn Server ein Werk liefert, hat die Anzeige-Liste genau ein Werk (kein Race/leer)', () => {
    const server = [{ number: '1', title: 'Einzeln', updatedAt: new Date().toISOString() }]
    const { merged } = applyServerDataToLocal(server, [])
    expect(merged).toHaveLength(1)
    expect(merged[0].number).toBe('1')
  })
})

describe('Flow: AutoSave (preserveStorageImageRefs)', () => {
  it('State ohne imageRef für 0031 bekommt Ref aus Speicher zurück', () => {
    const incoming = [
      { number: '0030', imageRef: 'k2-img-0030' },
      { number: '0031', imageRef: '' },
      { number: '0032', imageRef: 'k2-img-0032' }
    ]
    const fromStorage = [
      { number: '0030', imageRef: 'k2-img-0030' },
      { number: '0031', imageRef: 'k2-img-0031' },
      { number: '0032', imageRef: 'k2-img-0032' }
    ]
    const result = preserveStorageImageRefs(incoming, fromStorage)
    expect(result[0].imageRef).toBe('k2-img-0030')
    expect(result[1].imageRef).toBe('k2-img-0031')
    expect(result[2].imageRef).toBe('k2-img-0032')
  })
})
