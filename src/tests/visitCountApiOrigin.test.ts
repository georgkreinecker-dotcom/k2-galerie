import { describe, it, expect, vi, afterEach } from 'vitest'
import { fetchVisitCount } from '../utils/visitCountApiOrigin'
import { BASE_APP_URL } from '../config/navigation'

describe('fetchVisitCount', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('GET nutzt BASE_APP_URL und liefert count', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ count: 7 }),
    })
    vi.stubGlobal('fetch', fetchMock)
    const n = await fetchVisitCount('oeffentlich')
    expect(n).toBe(7)
    const base = BASE_APP_URL.replace(/\/$/, '')
    expect(fetchMock).toHaveBeenCalledWith(
      `${base}/api/visit?tenant=oeffentlich`,
      expect.objectContaining({ cache: 'no-store' }),
    )
  })

  it('bei Fehler 0', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')))
    const n = await fetchVisitCount('k2')
    expect(n).toBe(0)
  })
})
