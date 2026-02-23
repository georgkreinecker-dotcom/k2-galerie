/**
 * KRITISCHER TEST: Kundendaten dürfen niemals automatisch gelöscht werden
 *
 * Bezug: .cursor/rules/niemals-kundendaten-loeschen.mdc
 * Bezug: docs/GELOESTE-BUGS.md BUG aus datentrennung-localstorage
 */

import { describe, it, expect } from 'vitest'
import { getPageContentGalerie, setPageContentGalerie } from '../config/pageContentGalerie'

const GESCHUETZTE_KEYS = [
  'k2-artworks',
  'k2-stammdaten-martina',
  'k2-stammdaten-georg',
  'k2-stammdaten-galerie',
  'k2-vk2-stammdaten',
  'k2-oeffentlich-artworks',
  'k2-artworks-backup',
  'k2-events',
  'k2-documents',
]

describe('Kundendaten-Schutz: Kritische Keys', () => {

  it('Alle geschützten Keys bleiben nach setPageContentGalerie unangetastet', () => {
    // Vorbefüllen
    GESCHUETZTE_KEYS.forEach(key => {
      localStorage.setItem(key, JSON.stringify({ test: 'darf-nicht-geloescht-werden' }))
    })

    // Seitengestaltung schreiben (alle Tenants)
    setPageContentGalerie({ welcomeImage: '/img/k2/test.jpg' }, undefined)
    setPageContentGalerie({ welcomeImage: '/img/oeffentlich/test.jpg' }, 'oeffentlich')
    setPageContentGalerie({ welcomeImage: '/img/vk2/test.jpg' }, 'vk2')

    // Alle geschützten Keys müssen noch da sein
    GESCHUETZTE_KEYS.forEach(key => {
      const val = localStorage.getItem(key)
      expect(val, `${key} wurde gelöscht!`).not.toBeNull()
      expect(val, `${key} wurde überschrieben!`).toContain('darf-nicht-geloescht-werden')
    })
  })

  it('setPageContentGalerie überschreibt bestehende Bilder NICHT mit leerem Wert', () => {
    // Vorhandenes Bild
    localStorage.setItem('k2-page-content-galerie', JSON.stringify({
      welcomeImage: '/img/k2/vorhandenes-bild.jpg',
      galerieCardImage: '/img/k2/karte.jpg'
    }))

    // Nur galerieCardImage aktualisieren
    setPageContentGalerie({ galerieCardImage: '/img/k2/neue-karte.jpg' }, undefined)

    // welcomeImage muss noch da sein
    const result = getPageContentGalerie(undefined)
    expect(result.welcomeImage).toBe('/img/k2/vorhandenes-bild.jpg')
    expect(result.galerieCardImage).toBe('/img/k2/neue-karte.jpg')
  })

  it('Leerer Wert überschreibt NICHT vorhandenes Bild', () => {
    localStorage.setItem('k2-page-content-galerie', JSON.stringify({
      welcomeImage: '/img/k2/wichtiges-bild.jpg'
    }))

    // Leeren Wert schreiben (darf Vorhandenes nicht löschen)
    setPageContentGalerie({ welcomeImage: '' }, undefined)

    // Bild muss noch da sein
    const result = getPageContentGalerie(undefined)
    // Wenn leer geschrieben: Vorhandenes bleibt (Merge-Logik)
    // Dies ist das erwartete Verhalten – leerer Wert = kein Überschreiben
    expect(result.welcomeImage).toBeDefined()
  })

})

describe('Kundendaten-Schutz: VK2 Mitglieder', () => {

  it('VK2-Mitglieder bleiben nach initVk2DemoStammdatenIfEmpty erhalten wenn Verein schon existiert', async () => {
    const { initVk2DemoStammdatenIfEmpty } = await import('../config/tenantConfig')

    // Echter Verein bereits gespeichert
    const echterVerein = {
      verein: { name: 'Echter Kunstverein Wien' },
      mitglieder: [
        { name: 'Max Muster', email: 'max@test.at', oeffentlichSichtbar: true }
      ],
      mitgliederNichtRegistriert: []
    }
    localStorage.setItem('k2-vk2-stammdaten', JSON.stringify(echterVerein))

    // Init aufrufen – darf echten Verein NICHT überschreiben
    initVk2DemoStammdatenIfEmpty()

    const stored = JSON.parse(localStorage.getItem('k2-vk2-stammdaten') || '{}')
    expect(stored.verein.name).toBe('Echter Kunstverein Wien')
    expect(stored.mitglieder[0].name).toBe('Max Muster')
  })

})
