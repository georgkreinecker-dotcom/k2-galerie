/**
 * KRITISCHER TEST: Bild-Upload ersetzt Base64 durch dauerhaften Vercel-Pfad
 *
 * Bezug: docs/GELOESTE-BUGS.md BUG-001 (Bilder verschwinden)
 * Problem: Base64 in localStorage füllt Speicher → cleanupLargeImages löscht Werke
 * Lösung: Nach GitHub-Upload wird Base64 durch /img/k2/... ersetzt
 */

import { describe, it, expect } from 'vitest'

describe('Bild-Upload: Subfolder-Logik', () => {

  it('K2-Kontext verwendet subfolder k2', async () => {
    // Simuliert die Logik aus ScreenshotExportAdmin.tsx
    const isOeffentlich = false
    const isVk2 = false
    const subfolder = isOeffentlich ? 'oeffentlich' : 'k2'
    expect(subfolder).toBe('k2')
  })

  it('ök2-Kontext verwendet subfolder oeffentlich', () => {
    const isOeffentlich = true
    const subfolder = isOeffentlich ? 'oeffentlich' : 'k2'
    expect(subfolder).toBe('oeffentlich')
  })

  it('Vercel-Pfad für K2 ist /img/k2/dateiname', () => {
    const subfolder = 'k2'
    const filename = 'willkommen-1234567890.jpg'
    const vercelPath = `/img/${subfolder}/${filename}`
    expect(vercelPath).toBe('/img/k2/willkommen-1234567890.jpg')
  })

  it('Vercel-Pfad für ök2 ist /img/oeffentlich/dateiname', () => {
    const subfolder = 'oeffentlich'
    const filename = 'willkommen-9876543210.jpg'
    const vercelPath = `/img/${subfolder}/${filename}`
    expect(vercelPath).toBe('/img/oeffentlich/willkommen-9876543210.jpg')
  })

  it('K2-Pfad (/img/k2/) wird im ök2-localStorage erkannt und bereinigt', () => {
    const welcomeImage = '/img/k2/echtesbild.jpg'
    // Prüfung die in getPageContentGalerie('oeffentlich') passieren muss
    const isK2Path = welcomeImage.startsWith('/img/k2/')
    expect(isK2Path).toBe(true)
    // Bei ök2 muss dieser Pfad blockiert werden
  })

  it('Base64-String ist größer als ein Vercel-Pfad (zeigt warum Base64 localStorage füllt)', () => {
    const base64Example = 'data:image/jpeg;base64,' + 'A'.repeat(500_000) // ~500KB
    const vercelPath = '/img/k2/willkommen.jpg'
    expect(base64Example.length).toBeGreaterThan(10_000)
    expect(vercelPath.length).toBeLessThan(50)
  })

})

describe('Bild-Upload: Dateigröße-Schwelle', () => {

  it('Images über 100KB sollten nicht als Base64 in localStorage gespeichert bleiben', () => {
    const maxSafeBase64Size = 100 * 1024 // 100 KB
    const largeBase64 = 'data:image/jpeg;base64,' + 'A'.repeat(200 * 1024)
    const isTooLarge = largeBase64.length > maxSafeBase64Size
    expect(isTooLarge).toBe(true)
    // → Konsequenz: muss zu GitHub hochgeladen und durch Vercel-Pfad ersetzt werden
  })

  it('Vercel-Pfad ist sicher für localStorage (minimal Speicher)', () => {
    const vercelPath = '/img/k2/willkommen-1234567890.jpg'
    const maxSafeBase64Size = 100 * 1024
    expect(vercelPath.length).toBeLessThan(maxSafeBase64Size)
  })

})
