/**
 * Veröffentlichen (POST): Mit gemocktem fetch prüfen, dass Payload keine Base64 enthält und Erfolg gemeldet wird.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { publishGalleryDataToServer } from '../utils/publishGalleryData'

vi.mock('../utils/supabaseClient', () => ({
  resolveArtworkImageUrlsForExport: (artworks: any[]) => Promise.resolve(artworks)
}))

let fetchCalls: Array<{ url: string; options: RequestInit }> = []

beforeEach(() => {
  fetchCalls = []
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string, options?: RequestInit) => {
      fetchCalls.push({ url, options: options ?? {} })
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      } as Response)
    })
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Veröffentlichen (POST) mit Mock', () => {
  it('Payload enthält keine Base64 in artworks und POST wird mit JSON-Body aufgerufen', async () => {
    const artworks = [
      {
        number: '0030',
        id: '0030',
        title: 'Werk 30',
        imageUrl: 'https://example.com/30.jpg',
        imageRef: 'k2-img-0030',
        updatedAt: new Date().toISOString()
      },
      {
        number: '0031',
        id: '0031',
        title: 'Werk 31',
        imageUrl: 'https://example.com/31.jpg',
        imageRef: '',
        updatedAt: new Date().toISOString()
      }
    ]

    const result = await publishGalleryDataToServer(artworks)

    expect(result.success).toBe(true)
    expect(result.artworksCount).toBe(2)
    expect(fetchCalls.length).toBeGreaterThanOrEqual(1)
    const postCall = fetchCalls.find((c) => c.options.method === 'POST')
    expect(postCall).toBeDefined()
    const body = postCall?.options.body as string
    expect(body).toBeDefined()
    const data = JSON.parse(body)
    expect(Array.isArray(data.artworks)).toBe(true)
    const hasBase64 = data.artworks.some(
      (a: any) => a?.imageUrl && String(a.imageUrl).startsWith('data:image')
    )
    expect(hasBase64).toBe(false)
  })

  it('Payload enthält pageContentGalerie mit virtualTourVideo (eiserne Schranke für Mobil-Sync)', async () => {
    localStorage.setItem(
      'k2-page-content-galerie',
      JSON.stringify({
        virtualTourVideo: 'https://blob.example.com/k2/site-virtual-tour.mp4',
        virtualTourImage: '/img/k2/virtual-tour.jpg'
      })
    )

    const artworks = [
      {
        number: '0100',
        id: '0100',
        title: 'Werk 100',
        imageUrl: 'https://example.com/100.jpg',
        updatedAt: new Date().toISOString()
      }
    ]

    const result = await publishGalleryDataToServer(artworks)
    expect(result.success).toBe(true)

    const postCall = fetchCalls.find((c) => c.options.method === 'POST')
    expect(postCall).toBeDefined()
    const body = postCall?.options.body as string
    const payload = JSON.parse(body)

    expect(typeof payload.pageContentGalerie).toBe('string')
    const pageContent = JSON.parse(payload.pageContentGalerie)
    expect(pageContent.virtualTourVideo).toBe('https://blob.example.com/k2/site-virtual-tour.mp4')
  })
})
