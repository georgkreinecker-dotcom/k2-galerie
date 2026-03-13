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
})
