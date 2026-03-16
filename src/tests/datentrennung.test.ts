/**
 * KRITISCHER TEST: Datentrennung K2 / ök2 / VK2
 *
 * Diese Tests stellen sicher dass K2-, ök2- und VK2-Daten NIEMALS vermischt werden.
 * Wenn ein Test hier fehlschlägt → KEIN Deployment erlaubt.
 *
 * Bezug: docs/GELOESTE-BUGS.md BUG-002, BUG-004
 * VK2-Absicherungen: docs/K2-OEK2-DATENTRENNUNG.md, QS-VERGLEICH-PROFIS.md
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  getPageContentGalerie,
  setPageContentGalerie,
  getVk2SafeDisplayImageUrl,
  sanitizePageContentForVk2Publish,
  mergePageContentGalerieFromServer,
} from '../config/pageContentGalerie'
import { loadEvents, saveEvents } from '../utils/eventsStorage'
import { loadDocuments, saveDocuments } from '../utils/documentsStorage'
import { getShopOrdersKey, getShopSoldArtworksKey, getShopStorageKeys } from '../utils/shopContextKeys'

const K2_KEY = 'k2-page-content-galerie'
const OEK2_KEY = 'k2-oeffentlich-page-content-galerie'
const VK2_KEY = 'k2-vk2-page-content-galerie'

describe('Datentrennung: pageContentGalerie', () => {

  it('K2-Bild landet NUR im K2-Key', () => {
    setPageContentGalerie({ welcomeImage: '/img/k2/test.jpg' }, undefined)
    expect(localStorage.getItem(K2_KEY)).toContain('test.jpg')
    expect(localStorage.getItem(OEK2_KEY)).toBeNull()
    expect(localStorage.getItem(VK2_KEY)).toBeNull()
  })

  it('ök2-Bild landet NUR im ök2-Key', () => {
    setPageContentGalerie({ welcomeImage: '/img/oeffentlich/test.jpg' }, 'oeffentlich')
    expect(localStorage.getItem(OEK2_KEY)).toContain('test.jpg')
    expect(localStorage.getItem(K2_KEY)).toBeNull()
    expect(localStorage.getItem(VK2_KEY)).toBeNull()
  })

  it('VK2-Bild landet NUR im VK2-Key', () => {
    setPageContentGalerie({ welcomeImage: '/img/vk2/test.jpg' }, 'vk2')
    expect(localStorage.getItem(VK2_KEY)).toContain('test.jpg')
    expect(localStorage.getItem(K2_KEY)).toBeNull()
    expect(localStorage.getItem(OEK2_KEY)).toBeNull()
  })

  it('getPageContentGalerie(undefined) liest NUR K2-Key', () => {
    localStorage.setItem(K2_KEY, JSON.stringify({ welcomeImage: '/img/k2/k2bild.jpg' }))
    localStorage.setItem(OEK2_KEY, JSON.stringify({ welcomeImage: '/img/oeffentlich/oek2bild.jpg' }))
    const result = getPageContentGalerie(undefined)
    expect(result.welcomeImage).toBe('/img/k2/k2bild.jpg')
  })

  it('getPageContentGalerie(oeffentlich) liest NUR ök2-Key', () => {
    localStorage.setItem(K2_KEY, JSON.stringify({ welcomeImage: '/img/k2/k2bild.jpg' }))
    localStorage.setItem(OEK2_KEY, JSON.stringify({ welcomeImage: '/img/oeffentlich/oek2bild.jpg' }))
    const result = getPageContentGalerie('oeffentlich')
    expect(result.welcomeImage).toBe('/img/oeffentlich/oek2bild.jpg')
  })

  it('ök2 bereinigt K2-Serverpfade (/img/k2/) automatisch – BUG-004', () => {
    // Simuliert: K2-Pfad ist versehentlich im ök2-Key gelandet
    localStorage.setItem(OEK2_KEY, JSON.stringify({ welcomeImage: '/img/k2/echtesbild.jpg' }))
    const result = getPageContentGalerie('oeffentlich')
    // Muss leer sein – K2-Pfad darf nicht auf ök2-Seite erscheinen
    expect(result.welcomeImage).toBeFalsy()
    // Muss auch aus localStorage entfernt worden sein
    const stored = JSON.parse(localStorage.getItem(OEK2_KEY) || '{}')
    expect(stored.welcomeImage).toBeFalsy()
  })

  it('K2-Daten werden durch ök2-Schreibvorgang nicht überschrieben', () => {
    localStorage.setItem(K2_KEY, JSON.stringify({ welcomeImage: '/img/k2/original.jpg' }))
    // ök2 schreibt etwas
    setPageContentGalerie({ welcomeImage: '/img/oeffentlich/neu.jpg' }, 'oeffentlich')
    // K2 darf sich nicht verändert haben
    const k2 = JSON.parse(localStorage.getItem(K2_KEY) || '{}')
    expect(k2.welcomeImage).toBe('/img/k2/original.jpg')
  })

})

describe('Datentrennung: VK2-Stammdaten', () => {

  it('VK2-Stammdaten-Key ist isoliert von K2-Artworks', () => {
    localStorage.setItem('k2-artworks', JSON.stringify([{ id: '1', title: 'Echtes Werk' }]))
    localStorage.setItem('k2-vk2-stammdaten', JSON.stringify({ verein: { name: 'Testverein' }, mitglieder: [] }))

    // K2-Artworks dürfen nie in VK2-Stammdaten auftauchen
    const vk2raw = localStorage.getItem('k2-vk2-stammdaten')
    expect(vk2raw).not.toContain('Echtes Werk')

    // VK2-Stammdaten dürfen nie in K2-Artworks auftauchen
    const k2raw = localStorage.getItem('k2-artworks')
    expect(k2raw).not.toContain('Testverein')
  })

  it('VK2 hat keinen Artwork-Key (k2-vk2-artworks darf nie existieren) – BUG aus 23.02.26', () => {
    // Dieser Key darf niemals angelegt werden (war Ursache des Supergaus)
    expect(localStorage.getItem('k2-vk2-artworks')).toBeNull()
    // Auch nach VK2-Stammdaten-Init nicht
    localStorage.setItem('k2-vk2-stammdaten', JSON.stringify({ verein: { name: 'Test' }, mitglieder: [] }))
    expect(localStorage.getItem('k2-vk2-artworks')).toBeNull()
  })

})

describe('VK2 – Keine K2-Daten (Eisernes Gesetz Seitengestaltung)', () => {
  beforeEach(() => {
    localStorage.removeItem(K2_KEY)
    localStorage.removeItem(OEK2_KEY)
    localStorage.removeItem(VK2_KEY)
  })

  it('getVk2SafeDisplayImageUrl: K2-URL liefert leer, andere URL bleibt', () => {
    expect(getVk2SafeDisplayImageUrl('/img/k2/willkommen.jpg')).toBe('')
    expect(getVk2SafeDisplayImageUrl('/img/vk2/willkommen.jpg')).toBe('/img/vk2/willkommen.jpg')
    expect(getVk2SafeDisplayImageUrl('')).toBe('')
    expect(getVk2SafeDisplayImageUrl(undefined)).toBe('')
  })

  it('sanitizePageContentForVk2Publish: K2-URLs werden entfernt', () => {
    const input = {
      welcomeImage: '/img/k2/w.jpg',
      galerieCardImage: '/img/vk2/card.jpg',
      virtualTourImage: '/img/k2/tour.jpg',
      virtualTourVideo: '',
    }
    const out = sanitizePageContentForVk2Publish(input)
    expect(out).not.toBeNull()
    expect(out!.welcomeImage).toBe('')
    expect(out!.galerieCardImage).toBe('/img/vk2/card.jpg')
    expect(out!.virtualTourImage).toBe('')
    expect(out!.virtualTourVideo).toBe('')
  })

  it('sanitizePageContentForVk2Publish: null/undefined/leeres Objekt unverändert', () => {
    expect(sanitizePageContentForVk2Publish(null)).toBeNull()
    expect(sanitizePageContentForVk2Publish(undefined)).toBeNull()
    expect(sanitizePageContentForVk2Publish({})).toEqual({})
  })

  it('getPageContentGalerie(vk2) bereinigt K2-URLs und schreibt Key zurück', () => {
    localStorage.setItem(VK2_KEY, JSON.stringify({ welcomeImage: '/img/k2/echtesbild.jpg' }))
    const result = getPageContentGalerie('vk2')
    expect(result.welcomeImage).toBeFalsy()
    const stored = JSON.parse(localStorage.getItem(VK2_KEY) || '{}')
    expect(stored.welcomeImage).toBeFalsy()
  })

  it('setPageContentGalerie(..., vk2) speichert keine K2-URL (ersetzt durch bestehenden Wert)', () => {
    localStorage.setItem(VK2_KEY, JSON.stringify({ welcomeImage: '/img/vk2/ok.jpg' }))
    setPageContentGalerie({ welcomeImage: '/img/k2/darf-nicht-landen.jpg' }, 'vk2')
    const stored = JSON.parse(localStorage.getItem(VK2_KEY) || '{}')
    expect(stored.welcomeImage).not.toContain('/img/k2/')
    expect(stored.welcomeImage).toBe('/img/vk2/ok.jpg')
  })

  it('setPageContentGalerie(..., vk2) bei leerem bestehendem Wert: K2-URL wird zu leer', () => {
    localStorage.setItem(VK2_KEY, JSON.stringify({}))
    setPageContentGalerie({ welcomeImage: '/img/k2/darf-nicht-landen.jpg' }, 'vk2')
    const stored = JSON.parse(localStorage.getItem(VK2_KEY) || '{}')
    expect(stored.welcomeImage).not.toContain('/img/k2/')
    expect(stored.welcomeImage).toBe('')
  })

  it('mergePageContentGalerieFromServer(..., vk2) übernimmt keine K2-URL vom Server', () => {
    localStorage.setItem(VK2_KEY, JSON.stringify({ welcomeImage: '' }))
    mergePageContentGalerieFromServer(JSON.stringify({ welcomeImage: '/img/k2/vom-server.jpg' }), 'vk2')
    const result = getPageContentGalerie('vk2')
    expect(result.welcomeImage).not.toContain('/img/k2/')
    expect(result.welcomeImage).toBeFalsy()
  })
})

/**
 * K2-Events / K2-Dokumente – NIEMALS VK2 reinschreiben (16.03.26)
 * Absicherung gegen Auto-Save beim Tab-Wechsel VK2→K2.
 * Siehe: .cursor/rules/k2-events-documents-niemals-vk2-schreiben.mdc, KRITISCHE-ABLAEUFE.md Abschnitt 13.
 */
describe('K2-Events / K2-Dokumente – niemals VK2 reinschreiben', () => {
  it('saveEvents(k2, nur VK2-Events) überschreibt K2 nicht – K2 bleibt unverändert', () => {
    const k2Event = { id: 'k2-eröffnung', title: 'Eröffnung K2', date: '2024-04-24' }
    const vk2Event = { id: 'vk2-versammlung', title: 'VK2 Versammlung', date: '2024-05-01' }
    localStorage.setItem('k2-events', JSON.stringify([k2Event]))
    localStorage.setItem('k2-vk2-events', JSON.stringify([vk2Event]))
    saveEvents('k2', [vk2Event])
    const k2After = loadEvents('k2')
    expect(k2After).toHaveLength(1)
    expect(k2After[0].id).toBe('k2-eröffnung')
  })

  it('saveEvents(k2, gemischt K2+VK2) speichert nur K2-Events', () => {
    const k2Event = { id: 'k2-1', title: 'K2 Event' }
    const vk2Event = { id: 'vk2-1', title: 'VK2 Event' }
    localStorage.setItem('k2-vk2-events', JSON.stringify([vk2Event]))
    saveEvents('k2', [k2Event, vk2Event])
    const k2After = loadEvents('k2')
    expect(k2After).toHaveLength(1)
    expect(k2After[0].id).toBe('k2-1')
  })

  it('saveDocuments(k2, exakt VK2-Inhalt) überschreibt K2 nicht', () => {
    const k2Doc = { id: 'k2-flyer', title: 'K2 Flyer' }
    const vk2Doc = { id: 'vk2-flyer', title: 'VK2 Flyer' }
    localStorage.setItem('k2-documents', JSON.stringify([k2Doc]))
    localStorage.setItem('k2-vk2-documents', JSON.stringify([vk2Doc]))
    saveDocuments('k2', [vk2Doc])
    const k2After = loadDocuments('k2')
    expect(k2After).toHaveLength(1)
    expect(k2After[0].id).toBe('k2-flyer')
  })

  it('saveEvents(k2, []) überschreibt K2 nicht wenn 2+ Events vorhanden (Schutz vor Löschung von außen)', () => {
    const k2Events = [
      { id: 'k2-1', title: 'Eröffnung', date: '2026-04-24' },
      { id: 'k2-2', title: 'Vernissage', date: '2026-05-01' }
    ]
    localStorage.setItem('k2-events', JSON.stringify(k2Events))
    saveEvents('k2', [])
    const k2After = loadEvents('k2')
    expect(k2After).toHaveLength(2)
    expect(k2After[0].id).toBe('k2-1')
  })

  it('saveDocuments(k2, []) überschreibt K2 nicht wenn 2+ Dokumente vorhanden (Schutz vor Löschung von außen)', () => {
    const k2Docs = [
      { id: 'k2-doc-1', name: 'Flyer' },
      { id: 'k2-doc-2', name: 'Presse' }
    ]
    localStorage.setItem('k2-documents', JSON.stringify(k2Docs))
    saveDocuments('k2', [])
    const k2After = loadDocuments('k2')
    expect(k2After).toHaveLength(2)
    expect(k2After[0].id).toBe('k2-doc-1')
  })
})

/**
 * Schutzmechanismen vice versa – ök2 und VK2 (100 % symmetrisch zu K2).
 * Leere Liste überschreibt nicht bei 2+ Einträgen; fremde Kontext-Daten überschreiben nicht.
 */
describe('Schutzmechanismen vice versa – ök2 und VK2', () => {
  beforeEach(() => {
    localStorage.removeItem('k2-events')
    localStorage.removeItem('k2-oeffentlich-events')
    localStorage.removeItem('k2-vk2-events')
    localStorage.removeItem('k2-documents')
    localStorage.removeItem('k2-oeffentlich-documents')
    localStorage.removeItem('k2-vk2-documents')
  })

  it('saveEvents(oeffentlich, []) überschreibt ök2 nicht wenn 2+ Events vorhanden', () => {
    const oek2Events = [
      { id: 'oek2-1', title: 'Demo Event 1' },
      { id: 'oek2-2', title: 'Demo Event 2' }
    ]
    localStorage.setItem('k2-oeffentlich-events', JSON.stringify(oek2Events))
    saveEvents('oeffentlich', [])
    const after = loadEvents('oeffentlich')
    expect(after).toHaveLength(2)
    expect(after[0].id).toBe('oek2-1')
  })

  it('saveEvents(vk2, []) überschreibt VK2 nicht wenn 2+ Events vorhanden', () => {
    const vk2Events = [
      { id: 'vk2-e1', title: 'Verein 1' },
      { id: 'vk2-e2', title: 'Verein 2' }
    ]
    localStorage.setItem('k2-vk2-events', JSON.stringify(vk2Events))
    saveEvents('vk2', [])
    const after = loadEvents('vk2')
    expect(after).toHaveLength(2)
    expect(after[0].id).toBe('vk2-e1')
  })

  it('saveDocuments(oeffentlich, []) überschreibt ök2 nicht wenn 2+ Dokumente vorhanden', () => {
    const oek2Docs = [
      { id: 'oek2-d1', name: 'Flyer' },
      { id: 'oek2-d2', name: 'Presse' }
    ]
    localStorage.setItem('k2-oeffentlich-documents', JSON.stringify(oek2Docs))
    saveDocuments('oeffentlich', [])
    const after = loadDocuments('oeffentlich')
    expect(after).toHaveLength(2)
    expect(after[0].id).toBe('oek2-d1')
  })

  it('saveDocuments(vk2, []) überschreibt VK2 nicht wenn 2+ Dokumente vorhanden', () => {
    const vk2Docs = [
      { id: 'vk2-d1', name: 'Flyer' },
      { id: 'vk2-d2', name: 'Presse' }
    ]
    localStorage.setItem('k2-vk2-documents', JSON.stringify(vk2Docs))
    saveDocuments('vk2', [])
    const after = loadDocuments('vk2')
    expect(after).toHaveLength(2)
    expect(after[0].id).toBe('vk2-d1')
  })

  it('saveEvents(oeffentlich, nur K2-IDs) überschreibt ök2 nicht – K2-Events werden gefiltert', () => {
    const oek2Event = { id: 'oek2-only', title: 'ök2 Event' }
    const k2Event = { id: 'k2-only', title: 'K2 Event' }
    localStorage.setItem('k2-oeffentlich-events', JSON.stringify([oek2Event]))
    localStorage.setItem('k2-events', JSON.stringify([k2Event]))
    saveEvents('oeffentlich', [k2Event])
    const after = loadEvents('oeffentlich')
    expect(after).toHaveLength(1)
    expect(after[0].id).toBe('oek2-only')
  })

  it('saveEvents(vk2, nur K2-IDs) überschreibt VK2 nicht – K2-Events werden gefiltert', () => {
    const vk2Event = { id: 'vk2-only', title: 'VK2 Event' }
    const k2Event = { id: 'k2-only', title: 'K2 Event' }
    localStorage.setItem('k2-vk2-events', JSON.stringify([vk2Event]))
    localStorage.setItem('k2-events', JSON.stringify([k2Event]))
    saveEvents('vk2', [k2Event])
    const after = loadEvents('vk2')
    expect(after).toHaveLength(1)
    expect(after[0].id).toBe('vk2-only')
  })

  it('saveDocuments(oeffentlich, exakt K2-Inhalt) überschreibt ök2 nicht', () => {
    const oek2Doc = { id: 'oek2-doc', name: 'ök2 Flyer' }
    const k2Doc = { id: 'k2-doc', name: 'K2 Flyer' }
    localStorage.setItem('k2-oeffentlich-documents', JSON.stringify([oek2Doc]))
    localStorage.setItem('k2-documents', JSON.stringify([k2Doc]))
    saveDocuments('oeffentlich', [k2Doc])
    const after = loadDocuments('oeffentlich')
    expect(after).toHaveLength(1)
    expect(after[0].id).toBe('oek2-doc')
  })

  it('saveDocuments(vk2, exakt K2-Inhalt) überschreibt VK2 nicht', () => {
    const vk2Doc = { id: 'vk2-doc', name: 'VK2 Flyer' }
    const k2Doc = { id: 'k2-doc', name: 'K2 Flyer' }
    localStorage.setItem('k2-vk2-documents', JSON.stringify([vk2Doc]))
    localStorage.setItem('k2-documents', JSON.stringify([k2Doc]))
    saveDocuments('vk2', [k2Doc])
    const after = loadDocuments('vk2')
    expect(after).toHaveLength(1)
    expect(after[0].id).toBe('vk2-doc')
  })
})

describe('Shop/Kassa – kontexteigene Keys (Datensicherheit)', () => {
  it('K2-Kontext nutzt k2-orders und k2-sold-artworks', () => {
    expect(getShopOrdersKey(false, false)).toBe('k2-orders')
    expect(getShopSoldArtworksKey(false, false)).toBe('k2-sold-artworks')
    const keys = getShopStorageKeys(false, false)
    expect(keys.ordersKey).toBe('k2-orders')
    expect(keys.soldArtworksKey).toBe('k2-sold-artworks')
  })

  it('ök2-Kontext nutzt k2-oeffentlich-orders und k2-oeffentlich-sold-artworks', () => {
    expect(getShopOrdersKey(true, false)).toBe('k2-oeffentlich-orders')
    expect(getShopSoldArtworksKey(true, false)).toBe('k2-oeffentlich-sold-artworks')
    const keys = getShopStorageKeys(true, false)
    expect(keys.ordersKey).toBe('k2-oeffentlich-orders')
    expect(keys.soldArtworksKey).toBe('k2-oeffentlich-sold-artworks')
  })

  it('VK2-Kontext nutzt k2-vk2-orders und k2-vk2-sold-artworks', () => {
    expect(getShopOrdersKey(false, true)).toBe('k2-vk2-orders')
    expect(getShopSoldArtworksKey(false, true)).toBe('k2-vk2-sold-artworks')
    const keys = getShopStorageKeys(false, true)
    expect(keys.ordersKey).toBe('k2-vk2-orders')
    expect(keys.soldArtworksKey).toBe('k2-vk2-sold-artworks')
  })

  it('VK2 hat Vorrang vor ök2 (fromVk2=true → VK2-Keys)', () => {
    const keys = getShopStorageKeys(true, true)
    expect(keys.ordersKey).toBe('k2-vk2-orders')
    expect(keys.soldArtworksKey).toBe('k2-vk2-sold-artworks')
  })

  it('Keys sind pro Kontext getrennt – keine Überschneidung', () => {
    const k2 = getShopStorageKeys(false, false)
    const oek2 = getShopStorageKeys(true, false)
    const vk2 = getShopStorageKeys(false, true)
    expect(k2.ordersKey).not.toBe(oek2.ordersKey)
    expect(k2.ordersKey).not.toBe(vk2.ordersKey)
    expect(oek2.ordersKey).not.toBe(vk2.ordersKey)
    expect(k2.soldArtworksKey).not.toBe(oek2.soldArtworksKey)
    expect(k2.soldArtworksKey).not.toBe(vk2.soldArtworksKey)
    expect(oek2.soldArtworksKey).not.toBe(vk2.soldArtworksKey)
  })
})
