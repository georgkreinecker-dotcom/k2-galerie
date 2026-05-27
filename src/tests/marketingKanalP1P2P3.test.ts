import { describe, it, expect } from 'vitest'
import {
  buildMarketingCampaignKey,
  buildMarketingKanalUrl,
  listMarketingKanalUrls,
} from '../config/marketingKanalP1P2P3'

describe('marketingKanalP1P2P3', () => {
  it('baut Google-URL für P1 mit campaign_key und UTM', () => {
    const url = buildMarketingKanalUrl('p1', 'google')
    expect(url).toContain('https://k2-galerie.vercel.app/entdecken?')
    expect(url).toContain('utm_source=google')
    expect(url).toContain('utm_medium=cpc')
    expect(url).toContain('utm_campaign=p1-google-2026q2')
    expect(url).toContain('k=p1-google-2026q2')
  })

  it('baut Meta-URL für P2 auf VK2-Galerie', () => {
    const url = buildMarketingKanalUrl('p2', 'meta')
    expect(url).toContain('/projects/vk2/galerie?')
    expect(url).toContain('utm_source=meta')
    expect(url).toContain('utm_campaign=p2-meta-2026q2')
  })

  it('baut LinkedIn-URL für P3', () => {
    const url = buildMarketingKanalUrl('p3', 'linkedin', { absolute: true })
    expect(url).toContain('/projects/k2-familie/praesentationsmappe-kunde?')
    expect(url).toContain('utm_source=linkedin')
  })

  it('listMarketingKanalUrls liefert 9 Einträge', () => {
    const rows = listMarketingKanalUrls()
    expect(rows).toHaveLength(9)
    expect(new Set(rows.map((r) => r.produkt)).size).toBe(3)
    expect(new Set(rows.map((r) => r.kanal)).size).toBe(3)
  })

  it('buildMarketingCampaignKey', () => {
    expect(buildMarketingCampaignKey('p1', 'google')).toBe('p1-google-2026q2')
  })
})
