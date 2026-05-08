import { describe, expect, it, vi, beforeEach } from 'vitest'

const getMock = vi.fn()
const putMock = vi.fn()

vi.mock('@vercel/blob', () => ({
  get: (...args: unknown[]) => getMock(...args),
  put: (...args: unknown[]) => putMock(...args),
}))

describe('licenceBlobSeedShared', () => {
  beforeEach(() => {
    getMock.mockReset()
    putMock.mockReset()
  })

  it('legt Payload mit Name, E-Mail, focusDirections und pageTexts.galerie an', async () => {
    getMock.mockResolvedValue({ statusCode: 404 })
    putMock.mockResolvedValue({})

    const { seedGalerieLicenceBlobIfMissing } = await import('../../api/licenceBlobSeedShared.js')

    const out = await seedGalerieLicenceBlobIfMissing({
      tenantId: 'galerie-test-abc123',
      customerName: 'Yoga Studio',
      customerEmail: 'y@example.com',
      focusDirection: 'dienstleister',
    })

    expect(out.seeded).toBe(true)
    expect(putMock).toHaveBeenCalledTimes(1)
    const raw = putMock.mock.calls[0][1] as string
    const json = JSON.parse(raw)
    expect(json.tenantId).toBe('galerie-test-abc123')
    expect(json.martina.name).toBe('Yoga Studio')
    expect(json.martina.email).toBe('y@example.com')
    expect(json.gallery.name).toBe('Yoga Studio')
    expect(json.gallery.focusDirections).toEqual(['dienstleister'])
    expect(json.pageTexts.galerie.heroTitle).toBe('Yoga Studio')
    expect(json.pageTexts.galerie.welcomeSubtext).toBe('Dienstleister & Portfolio')
    expect(json.pageTexts.galerie.welcomeIntroText).toContain('Portfolio')
    expect(json.artworks).toEqual([])
  })

  it('überspringt wenn Blob schon existiert', async () => {
    async function* emptyStream() {
      yield Buffer.from('{}')
    }
    getMock.mockResolvedValue({ statusCode: 200, stream: emptyStream() })

    const { seedGalerieLicenceBlobIfMissing } = await import('../../api/licenceBlobSeedShared.js')

    const out = await seedGalerieLicenceBlobIfMissing({
      tenantId: 'galerie-test-xyz',
      customerName: 'A',
      customerEmail: 'a@b.c',
      focusDirection: 'kunst',
    })
    expect(out.skipped).toBe(true)
    expect(out.reason).toBe('blob-exists')
    expect(putMock).not.toHaveBeenCalled()
  })
})
