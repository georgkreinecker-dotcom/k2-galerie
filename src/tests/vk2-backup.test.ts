/**
 * VK2 createVk2Backup: Payload darf keine K2-Bild-URLs enthalten (Eisernes Gesetz).
 * Bezug: docs/K2-OEK2-DATENTRENNUNG.md, QS-VERGLEICH-PROFIS.md
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createVk2Backup } from '../utils/autoSave'

const VK2_PC_KEY = 'k2-vk2-page-content-galerie'
const VK2_KARTEN_KEY = 'k2-vk2-eingangskarten'

describe('createVk2Backup – Keine K2-Daten im Payload', () => {
  beforeEach(() => {
    localStorage.removeItem(VK2_PC_KEY)
    localStorage.removeItem(VK2_KARTEN_KEY)
  })

  afterEach(() => {
    localStorage.removeItem(VK2_PC_KEY)
    localStorage.removeItem(VK2_KARTEN_KEY)
  })

  it('Seitengestaltung mit K2-URL wird im Payload bereinigt', () => {
    localStorage.setItem(VK2_PC_KEY, JSON.stringify({
      welcomeImage: '/img/k2/willkommen.jpg',
      galerieCardImage: '/img/vk2/card.jpg',
    }))
    const { data } = createVk2Backup()
    const pc = data[VK2_PC_KEY]
    expect(pc).toBeDefined()
    expect(pc.welcomeImage).toBe('')
    expect(pc.galerieCardImage).toBe('/img/vk2/card.jpg')
  })

  it('Seitengestaltung als JSON-String mit K2-URL wird bereinigt', () => {
    localStorage.setItem(VK2_PC_KEY, JSON.stringify({
      welcomeImage: '/img/k2/als-string-gespeichert.jpg',
    }))
    const { data } = createVk2Backup()
    const pc = data[VK2_PC_KEY]
    expect(pc).toBeDefined()
    expect(pc.welcomeImage).toBe('')
  })

  it('Eingangskarten mit K2-URL in imageUrl werden im Payload bereinigt', () => {
    localStorage.setItem(VK2_KARTEN_KEY, JSON.stringify([
      { titel: 'Karte 1', imageUrl: '/img/k2/karte1.jpg' },
      { titel: 'Karte 2', imageUrl: '/img/vk2/karte2.jpg' },
    ]))
    const { data } = createVk2Backup()
    const karten = data[VK2_KARTEN_KEY]
    expect(Array.isArray(karten)).toBe(true)
    expect(karten[0].imageUrl).toBe('')
    expect(karten[1].imageUrl).toBe('/img/vk2/karte2.jpg')
  })

  it('Payload enthält kontext vk2 und alle erwarteten Keys', () => {
    const { data } = createVk2Backup()
    expect(data.kontext).toBe('vk2')
    expect(data.exportedAt).toBeDefined()
    expect(data.version).toBe('1.0')
  })
})
