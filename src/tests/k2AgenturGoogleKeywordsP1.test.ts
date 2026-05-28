import { describe, expect, it } from 'vitest'
import {
  formatGoogleKeywordsP1Block,
  getGoogleKeywordsP1Sorted,
  googleKeywordAlsEingabe,
} from '../config/k2AgenturGoogleKeywordsP1'
import { formatSchaltPaketText, getSchaltPaket } from '../config/k2AgenturLaunchCheckliste'

describe('k2AgenturGoogleKeywordsP1', () => {
  it('sortiert nach Priorität aufsteigend', () => {
    const sorted = getGoogleKeywordsP1Sorted()
    expect(sorted[0]?.prio).toBe(1)
    expect(sorted[sorted.length - 1]?.prio).toBeGreaterThanOrEqual(12)
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i]!.prio).toBeGreaterThanOrEqual(sorted[i - 1]!.prio)
    }
  })

  it('Match-Typ → Google-Eingabeformat', () => {
    expect(googleKeywordAlsEingabe('k2 galerie', 'exact')).toBe('[k2 galerie]')
    expect(googleKeywordAlsEingabe('kunst verkaufen online', 'phrase')).toBe('"kunst verkaufen online"')
    expect(googleKeywordAlsEingabe('künstler galerie', 'broad')).toBe('künstler galerie')
  })

  it('Schalt-Paket P1 Google enthält Keyword-Block', () => {
    const p = getSchaltPaket('p1', 'google')
    expect(p).not.toBeNull()
    const text = formatSchaltPaketText(p!)
    expect(text).toContain('Keywords P1 · Google Ads')
    expect(text).toContain('"online galerie künstler"')
    expect(text).toContain('Negativ-Keywords')
  })
})
