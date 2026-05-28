import { describe, expect, it } from 'vitest'
import {
  formatGoogleKeywordsForKanal,
  K2_AGENTUR_KEYWORDS_DRUCK,
  K2_AGENTUR_MASTER_STRATEGIEN,
} from '../config/k2AgenturStrategieKeywordsRegistry'
import { formatSchaltPaketText, getSchaltPaket } from '../config/k2AgenturLaunchCheckliste'
import { GOOGLE_KEYWORDS_P2 } from '../config/k2AgenturGoogleKeywordsP2'
import { GOOGLE_KEYWORDS_P3 } from '../config/k2AgenturGoogleKeywordsP3'
import { formatGoogleKeywordsP1SparteBlock } from '../config/k2AgenturGoogleKeywordsP1Sparten'

describe('k2AgenturStrategieKeywordsRegistry', () => {
  it('listet alle Master-Strategien und Keyword-Drucke', () => {
    expect(K2_AGENTUR_MASTER_STRATEGIEN.length).toBe(4)
    expect(K2_AGENTUR_KEYWORDS_DRUCK.length).toBe(4)
    const ids = K2_AGENTUR_KEYWORDS_DRUCK.map((e) => e.id)
    expect(ids).toContain('p1-kunst')
    expect(ids).toContain('p1-sparten')
    expect(ids).toContain('p2')
    expect(ids).toContain('p3')
  })

  it('formatGoogleKeywordsForKanal: P2/P3 Google', () => {
    const p2 = formatGoogleKeywordsForKanal('p2', 'google')
    expect(p2).toContain('Keywords P2 · Google Ads (VK2)')
    expect(p2).toContain('"kunstverein website"')

    const p3 = formatGoogleKeywordsForKanal('p3', 'google')
    expect(p3).toContain('Keywords P3 · Google Ads (K2 Familie)')
    expect(p3).toContain('[k2 familie]')
  })

  it('formatGoogleKeywordsForKanal: P1 Sparte und alle Sparten', () => {
    const handwerk = formatGoogleKeywordsForKanal('p1', 'google', { p1Sparte: 'handwerk' })
    expect(handwerk).toContain('Handwerk & Manufaktur')
    expect(handwerk).toContain('"handwerk online verkaufen"')

    const alle = formatGoogleKeywordsForKanal('p1', 'google', { p1AlleSparten: true })
    expect(alle).toContain('5 Sparten')
    expect(alle).toContain('Food & Genuss')
    expect(alle).toContain(formatGoogleKeywordsP1SparteBlock('dienstleister').slice(0, 30))
  })

  it('Schalt-Paket P2/P3 Google enthält Keyword-Blöcke', () => {
    const p2 = getSchaltPaket('p2', 'google')
    const p3 = getSchaltPaket('p3', 'google')
    expect(p2).not.toBeNull()
    expect(p3).not.toBeNull()
    expect(formatSchaltPaketText(p2!)).toContain(GOOGLE_KEYWORDS_P2[0]!.suchbegriff)
    expect(formatSchaltPaketText(p3!)).toContain('familienbuch digital')
  })

  it('Meta-Kanal liefert keinen Keyword-Block', () => {
    expect(formatGoogleKeywordsForKanal('p1', 'meta')).toBeNull()
  })
})
