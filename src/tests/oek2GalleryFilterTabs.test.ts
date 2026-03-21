import { describe, it, expect } from 'vitest'
import { getOek2GalleryFilterTabsForWorks, MUSTER_ARTWORKS } from '../config/tenantConfig'

describe('getOek2GalleryFilterTabsForWorks', () => {
  it('Sparte Kunst: nur Kunst-Kategorien aus Werken, kein serie/konzept/moebel aus MUSTER_ARTWORKS', () => {
    const tabs = getOek2GalleryFilterTabsForWorks('kunst', MUSTER_ARTWORKS)
    const ids = tabs.map((t) => t.id).sort()
    expect(ids).toEqual(['grafik', 'malerei', 'skulptur'])
    expect(ids).not.toContain('serie')
    expect(ids).not.toContain('konzept')
    expect(ids).not.toContain('moebel')
  })

  it('Sparte handwerk: nur Handwerk-Kategorien, die in Werken vorkommen', () => {
    const works = [{ category: 'moebel' }, { category: 'serie' }]
    const tabs = getOek2GalleryFilterTabsForWorks('handwerk', works)
    expect(tabs.map((t) => t.id)).toEqual(['moebel'])
  })
})
