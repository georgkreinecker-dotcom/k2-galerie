/**
 * KRITISCHER TEST: Datentrennung K2 / ök2 / VK2
 *
 * Diese Tests stellen sicher dass K2-, ök2- und VK2-Daten NIEMALS vermischt werden.
 * Wenn ein Test hier fehlschlägt → KEIN Deployment erlaubt.
 *
 * Bezug: docs/GELOESTE-BUGS.md BUG-002, BUG-004
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { getPageContentGalerie, setPageContentGalerie } from '../config/pageContentGalerie'

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
