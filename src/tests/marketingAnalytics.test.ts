import { describe, expect, it, vi } from 'vitest'
import { GOOGLE_ADS_CONVERSION_SEND_TO_PILOT, GOOGLE_ADS_ID_PILOT } from '../config/googleAdsConfig'
import {
  getGoogleAdsConversionSendTo,
  getGoogleAdsId,
  getGa4MeasurementId,
} from '../utils/marketingAnalytics'

describe('marketingAnalytics', () => {
  it('GA4 nur mit G- Präfix', () => {
    vi.stubEnv('VITE_GA4_MEASUREMENT_ID', 'G-ABC123')
    expect(getGa4MeasurementId()).toBe('G-ABC123')
    vi.stubEnv('VITE_GA4_MEASUREMENT_ID', 'AW-123')
    expect(getGa4MeasurementId()).toBeNull()
  })

  it('Google Ads: Env oder Pilot-Default AW-18195006153', () => {
    vi.stubEnv('VITE_GOOGLE_ADS_ID', '')
    expect(getGoogleAdsId()).toBe(GOOGLE_ADS_ID_PILOT)
    vi.stubEnv('VITE_GOOGLE_ADS_ID', 'AW-TEST999')
    expect(getGoogleAdsId()).toBe('AW-TEST999')
  })

  it('Conversion send_to nur mit AW-…/Label', () => {
    vi.stubEnv('VITE_GOOGLE_ADS_CONVERSION_SEND_TO', 'AW-1/abc')
    expect(getGoogleAdsConversionSendTo()).toBe('AW-1/abc')
    vi.stubEnv('VITE_GOOGLE_ADS_CONVERSION_SEND_TO', 'nur-aw')
    expect(getGoogleAdsConversionSendTo()).toBeNull()
  })

  it('Conversion send_to: Env vor Pilot-Constant', () => {
    vi.stubEnv('VITE_GOOGLE_ADS_CONVERSION_SEND_TO', '')
    expect(GOOGLE_ADS_CONVERSION_SEND_TO_PILOT).toBe('')
    expect(getGoogleAdsConversionSendTo()).toBeNull()
  })
})
