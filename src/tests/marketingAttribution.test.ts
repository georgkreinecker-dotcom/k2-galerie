import { describe, it, expect } from 'vitest'
import { parseCampaignFromSearch, withMarketingCampaignParam } from '../utils/marketingAttribution'

describe('marketingAttribution', () => {
  it('parseCampaignFromSearch: bevorzugt k= vor utm_campaign', () => {
    expect(parseCampaignFromSearch('?k=fruehjahr-1&utm_campaign=other')).toBe('fruehjahr-1')
  })

  it('parseCampaignFromSearch: utm_campaign wenn kein k', () => {
    expect(parseCampaignFromSearch('?utm_campaign=social-may')).toBe('social-may')
  })

  it('parseCampaignFromSearch: leer bei ungültigem Zeichen', () => {
    expect(parseCampaignFromSearch('?k=bad%20space')).toBe(null)
  })

  it('withMarketingCampaignParam: relativer Pfad', () => {
    expect(withMarketingCampaignParam('/galerie-oeffentlich', 'kampagne-fruehjahr-2026-1')).toBe(
      '/galerie-oeffentlich?k=kampagne-fruehjahr-2026-1',
    )
  })

  it('withMarketingCampaignParam: Query anhängen', () => {
    expect(withMarketingCampaignParam('/galerie-oeffentlich?x=1', 'a')).toBe('/galerie-oeffentlich?x=1&k=a')
  })
})
