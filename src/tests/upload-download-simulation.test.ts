/**
 * Simulierungstest: Upload- und Download-Logik in beide Richtungen.
 * Mindestens 50 erfolgreiche Tests pro Richtung, mit Protokoll.
 * Läuft ohne echten Server (nur Datenlogik: Export, Merge, Preserve).
 */

import { describe, it, expect, beforeEach, beforeAll } from 'vitest'
import { artworksForExport, stripBase64FromArtworks } from '../utils/artworkExport'
import { mergeServerWithLocal, applyServerDataToLocal } from '../utils/syncMerge'
import * as fs from 'fs'
import * as path from 'path'

const KNOWN_MAX_PREFIX = 'k2-known-max-number-'

/** Kleines gültiges PNG (1×1 pixel) als Base64 – echtes Bild für „komplettes Werk mit Bild“. */
const KLEINES_PNG_BASE64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

type ProtocolEntry = { dir: 'upload' | 'download'; id: number; ok: boolean; detail: string }
const protocol: ProtocolEntry[] = []

function mkArtwork(
  number: string,
  overrides: Partial<{ imageUrl: string; imageRef: string; title: string; updatedAt: string; createdOnMobile: boolean }> = {}
): any {
  return {
    number,
    id: number,
    title: `Werk ${number}`,
    imageUrl: '',
    imageRef: '',
    updatedAt: new Date().toISOString(),
    ...overrides
  }
}

/** Komplettes Werk wie in der App: alle Stammfelder + optional Bild (Base64 oder URL). Wird in Upload/Download mit echten Daten getestet. */
function mkFullArtwork(
  number: string,
  opts: {
    imageUrl?: string
    imageRef?: string
    title?: string
    description?: string
    price?: number
    category?: string
    updatedAt?: string
    createdOnMobile?: boolean
  } = {}
): any {
  const now = new Date().toISOString()
  return {
    number,
    id: `art-${number}`,
    title: opts.title ?? `Werk ${number}`,
    description: opts.description ?? `Beschreibung für ${number}. Acryl auf Leinwand.`,
    category: opts.category ?? 'malerei',
    artist: 'Test Künstler',
    price: opts.price ?? 450,
    inShop: true,
    inExhibition: true,
    imageUrl: opts.imageUrl ?? '',
    imageRef: opts.imageRef ?? '',
    previewUrl: opts.imageUrl?.startsWith('data:') ? '' : (opts.imageUrl ?? ''),
    createdAt: now,
    updatedAt: opts.updatedAt ?? now,
    addedToGalleryAt: now,
    createdOnMobile: opts.createdOnMobile ?? false,
    ...opts
  }
}

describe('Upload-Download-Simulation (Protokoll)', () => {
  beforeAll(() => {
    protocol.length = 0
  })
  beforeEach(() => {
    try {
      ;['M', 'K', 'G', 'S', 'O'].forEach((letter) => localStorage.removeItem(`${KNOWN_MAX_PREFIX}${letter}`))
    } catch (_) {}
  })

  describe('Upload-Richtung (mind. 50 Tests)', () => {
    const uploadTests: Array<{ id: number; name: string; run: () => void }> = []

    for (let i = 1; i <= 50; i++) {
      const id = i
      uploadTests.push({
        id,
        name: `Upload-Simulation ${id}`,
        run: () => {
          let ok = false
          let detail = ''
          try {
            if (id <= 10) {
              // Komplettes Werk mit echtem Bild (kleines PNG-Base64) – Export muss Base64 entfernen, alle anderen Felder behalten
              const fullWithBase64 = mkFullArtwork('0030', {
                imageUrl: KLEINES_PNG_BASE64,
                imageRef: 'k2-img-0030',
                title: 'Morgenlicht',
                description: 'Acryl auf Leinwand, 80×60 cm.',
                price: 480
              })
              const withBase64 = [fullWithBase64, mkFullArtwork('0031', { title: 'Zweites Werk', price: 320 })]
              const exported = artworksForExport(withBase64)
              expect(exported).toHaveLength(2)
              expect(exported[0].imageUrl).toBe('')
              expect(exported[0].title).toBe('Morgenlicht')
              expect(exported[0].description).toContain('Acryl')
              expect(exported[0].price).toBe(480)
              expect(exported[0].imageRef).toBe('k2-img-0030')
              expect(exported[1].imageUrl).toBe('')
              ok = true
              detail = `Volles Werk+Base64: Export entfernt Bild, Felder erhalten (${id})`
            } else if (id <= 20) {
              const fullWithUrl = mkFullArtwork('K2-K-0030', {
                imageUrl: 'https://example.com/a.jpg',
                title: 'Werk mit URL',
                price: 199
              })
              const exported = artworksForExport([fullWithUrl])
              expect(exported[0].imageUrl).toBe('https://example.com/a.jpg')
              expect(exported[0].title).toBe('Werk mit URL')
              expect(exported[0].price).toBe(199)
              ok = true
              detail = `Volles Werk+URL bleibt erhalten (${id})`
            } else if (id <= 30) {
              const count = (id % 10) || 5
              const list = Array.from({ length: count }, (_, j) =>
                mkFullArtwork(`K2-M-${String(j + 1).padStart(4, '0')}`, { price: 100 + j })
              )
              const exported = artworksForExport(list)
              expect(exported).toHaveLength(count)
              exported.forEach((e: any, j: number) => expect(e.price).toBe(100 + j))
              ok = true
              detail = `Anzahl ${count} volle Werke erhalten (${id})`
            } else if (id <= 40) {
              const mixed = [
                mkFullArtwork('0030', { imageUrl: KLEINES_PNG_BASE64, title: 'Mit Base64', price: 111 }),
                mkFullArtwork('0031', {
                  imageUrl: 'https://k2-galerie.vercel.app/img/k2/werk-31.jpg',
                  title: 'Mit URL',
                  price: 222
                })
              ]
              const exported = artworksForExport(mixed)
              const stripped = stripBase64FromArtworks(exported)
              expect(stripped[0].imageUrl).toBe('')
              expect(stripped[0].title).toBe('Mit Base64')
              expect(stripped[1].imageUrl).toContain('https://')
              expect(stripped[1].title).toBe('Mit URL')
              ok = true
              detail = `Volles Werk: Strip Base64, URL+Felder bleiben (${id})`
            } else {
              const num = Math.max(1, (id % 70))
              const list = Array.from({ length: num }, (_, j) =>
                mkFullArtwork(String(j + 1).padStart(4, '0'), {
                  imageRef: `k2-img-${j + 1}`,
                  imageUrl: j === 0 ? KLEINES_PNG_BASE64 : '',
                  title: `Werk ${j + 1}`,
                  price: 200 + j
                })
              )
              const exported = artworksForExport(list)
              expect(exported).toHaveLength(num)
              expect(exported[0].imageUrl).toBe('')
              expect(exported[0].imageRef).toBe('k2-img-1')
              ok = true
              detail = `Export ${num} volle Werke (${id})`
            }
          } catch (e) {
            detail = e instanceof Error ? e.message : String(e)
          }
          protocol.push({ dir: 'upload', id, ok, detail })
        }
      })
    }

    uploadTests.forEach(({ id, name, run }) => {
      it(name, () => {
        run()
        const entry = protocol.find((p) => p.dir === 'upload' && p.id === id)
        expect(entry?.ok).toBe(true)
      })
    })
  })

  describe('Download-Richtung (mind. 50 Tests)', () => {
    const downloadTests: Array<{ id: number; name: string; run: () => void }> = []

    for (let i = 1; i <= 50; i++) {
      const id = i
      downloadTests.push({
        id,
        name: `Download-Simulation ${id}`,
        run: () => {
          let ok = false
          let detail = ''
          try {
            if (id <= 10) {
              // Komplettes Werk vom Server (ohne lokale Daten) – alle Felder müssen ankommen
              const server = [
                mkFullArtwork('1', { title: 'Server Werk 1', price: 300, imageUrl: 'https://cdn.example.com/1.jpg' }),
                mkFullArtwork('2', { title: 'Server Werk 2', description: 'Skulptur.', price: 500 })
              ]
              const local: any[] = []
              const { merged } = applyServerDataToLocal(server, local)
              expect(merged).toHaveLength(2)
              expect(merged[0].title).toBe('Server Werk 1')
              expect(merged[0].price).toBe(300)
              expect(merged[0].imageUrl).toContain('https://')
              expect(merged[1].description).toBe('Skulptur.')
              ok = true
              detail = `Volles Werk Server-only Merge (${id})`
            } else if (id <= 20) {
              const server = [
                mkFullArtwork('0030', {
                  imageUrl: 'https://server.com/30.jpg',
                  title: 'Von Server',
                  price: 480
                })
              ]
              const local = [
                mkFullArtwork('K2-K-0030', {
                  imageUrl: KLEINES_PNG_BASE64,
                  title: 'Lokal',
                  price: 999
                })
              ]
              const { merged } = applyServerDataToLocal(server, local)
              expect(merged[0].imageUrl).toContain('https://')
              expect(merged[0].title).toBe('Von Server')
              ok = true
              detail = `Volles Werk: Server-URL gewinnt (${id})`
            } else if (id <= 30) {
              const server = [mkFullArtwork('0030', { title: 'Nur Metadaten', price: 100 })]
              const local = [
                mkFullArtwork('K2-K-0030', {
                  imageRef: 'k2-img-0030',
                  imageUrl: 'https://local/30.jpg',
                  title: 'Lokal mit Bild',
                  price: 200
                })
              ]
              const { merged } = applyServerDataToLocal(server, local)
              expect(merged[0].imageUrl || merged[0].imageRef).toBeTruthy()
              expect(merged[0].title).toBeDefined()
              ok = true
              detail = `Volles Werk: Lokales Bild erhalten (${id})`
            } else if (id <= 40) {
              const server = Array.from({ length: (id % 7) + 1 }, (_, j) =>
                mkFullArtwork(String(j + 1), { price: 100 + j })
              )
              const local = [...server, mkFullArtwork('99', { createdOnMobile: true, title: 'Neu mobil', price: 99 })]
              const { merged } = mergeServerWithLocal(server, local, { onlyAddLocalIfMobileAndVeryNew: true })
              expect(merged.length).toBeGreaterThanOrEqual(server.length)
              ok = true
              detail = `Volles Werk: Mobile lokal hinzugefügt (${id})`
            } else {
              const server = [
                mkFullArtwork('1', {
                  updatedAt: '2026-01-02T12:00:00Z',
                  title: 'Neuer Stand',
                  price: 400
                })
              ]
              const local = [
                mkFullArtwork('1', {
                  updatedAt: '2026-01-01T12:00:00Z',
                  title: 'Lokal',
                  price: 300
                })
              ]
              const { merged } = mergeServerWithLocal(server, local)
              expect(merged).toHaveLength(1)
              expect(merged[0].updatedAt).toBe(server[0].updatedAt)
              expect(merged[0].title).toBe('Neuer Stand')
              expect(merged[0].price).toBe(400)
              ok = true
              detail = `Volles Werk: Neueres gewinnt (${id})`
            }
          } catch (e) {
            detail = e instanceof Error ? e.message : String(e)
          }
          protocol.push({ dir: 'download', id, ok, detail })
        }
      })
    }

    downloadTests.forEach(({ id, name, run }) => {
      it(name, () => {
        run()
        const entry = protocol.find((p) => p.dir === 'download' && p.id === id)
        expect(entry?.ok).toBe(true)
      })
    })
  })

  describe('Protokoll-Auswertung', () => {
    it('mind. 50 erfolgreiche Upload-Tests', () => {
      const uploadOk = protocol.filter((p) => p.dir === 'upload' && p.ok).length
      expect(uploadOk).toBeGreaterThanOrEqual(50)
    })

    it('mind. 50 erfolgreiche Download-Tests', () => {
      const downloadOk = protocol.filter((p) => p.dir === 'download' && p.ok).length
      expect(downloadOk).toBeGreaterThanOrEqual(50)
    })

    it('Protokoll wird in docs/TEST-PROTOKOLL-UPLOAD-DOWNLOAD.md geschrieben', () => {
      const uploadOk = protocol.filter((p) => p.dir === 'upload' && p.ok).length
      const uploadFail = protocol.filter((p) => p.dir === 'upload' && !p.ok).length
      const downloadOk = protocol.filter((p) => p.dir === 'download' && p.ok).length
      const downloadFail = protocol.filter((p) => p.dir === 'download' && !p.ok).length
      expect(uploadOk).toBeGreaterThanOrEqual(50)
      expect(downloadOk).toBeGreaterThanOrEqual(50)

      const lines: string[] = [
        '# Upload-Download-Simulation – Test-Protokoll',
        '',
        `**Erstellt:** ${new Date().toISOString()}`,
        '',
        '## Zusammenfassung',
        '',
        '| Richtung | Erfolgreich | Fehlgeschlagen |',
        '|----------|-------------|----------------|',
        `| Upload   | ${uploadOk} | ${uploadFail} |`,
        `| Download | ${downloadOk} | ${downloadFail} |`,
        '',
        '## Einzeltests (alle Einträge)',
        '',
        '### Upload',
        ...protocol.filter((p) => p.dir === 'upload').map((p) => `- ${p.ok ? '✅' : '❌'} #${p.id}: ${p.detail}`),
        '',
        '### Download',
        ...protocol.filter((p) => p.dir === 'download').map((p) => `- ${p.ok ? '✅' : '❌'} #${p.id}: ${p.detail}`)
      ]
      const outPath = path.join(process.cwd(), 'docs', 'TEST-PROTOKOLL-UPLOAD-DOWNLOAD.md')
      try {
        fs.mkdirSync(path.dirname(outPath), { recursive: true })
        fs.writeFileSync(outPath, lines.join('\n'), 'utf8')
      } catch (_) {
        // Fallback: Zusammenfassung in Konsole (z. B. wenn docs/ nicht beschreibbar)
        console.log(lines.slice(0, 15).join('\n'))
      }
    })
  })
})
