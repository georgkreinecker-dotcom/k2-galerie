import { describe, expect, it } from 'vitest'
import {
  K2_AGENTUR_PHASE_A_PILOT,
  K2_AGENTUR_STEUER_SCHWELLEN,
  evaluateKanalSteuerung,
} from '../config/k2AgenturSteuerRegeln'
import {
  aggregateAttributionForCampaign,
  buildAttributionMapForKanaele,
} from '../utils/k2AgenturAttributionClient'

describe('k2AgenturSteuerRegeln', () => {
  it('Pilot ist P1 Google', () => {
    expect(K2_AGENTUR_PHASE_A_PILOT.produkt).toBe('p1')
    expect(K2_AGENTUR_PHASE_A_PILOT.kanal).toBe('google')
  })

  it('empfiehlt Pause bei Kosten ohne Conversion', () => {
    const r = evaluateKanalSteuerung({
      status: 'live',
      budgetEurMonat: '150',
      kostenEur7Tage: String(K2_AGENTUR_STEUER_SCHWELLEN.kostenOhneConversionPauseEur),
      attribution: { landings: 5, conversions: 0, configured: true },
    })
    expect(r.ampel).toBe('rot')
    expect(r.empfehlung).toBe('pause_empfohlen')
  })

  it('grün bei Lizenz', () => {
    const r = evaluateKanalSteuerung({
      status: 'live',
      budgetEurMonat: '100',
      kostenEur7Tage: '10',
      attribution: { landings: 8, conversions: 1, configured: true },
    })
    expect(r.ampel).toBe('gruen')
    expect(r.empfehlung).toBe('weiter')
  })

  it('gelb wenn Kosten fehlen', () => {
    const r = evaluateKanalSteuerung({
      status: 'live',
      budgetEurMonat: '',
      kostenEur7Tage: '',
      attribution: { landings: 2, conversions: 0, configured: true },
    })
    expect(r.empfehlung).toBe('daten_eintragen')
  })
})

describe('k2AgenturAttributionClient', () => {
  it('aggregiert Landings und Lizenzen pro Kampagne', () => {
    const summary = [
      {
        campaign_key: 'p1-google-2026q2',
        surface: 'oeffentlich',
        event_kind: 'landing',
        count: 3,
      },
      {
        campaign_key: 'p1-google-2026q2',
        surface: 'oeffentlich',
        event_kind: 'conversion_licence',
        count: 1,
      },
      {
        campaign_key: 'p1-google-2026q2',
        surface: 'vk2',
        event_kind: 'landing',
        count: 99,
      },
    ]
    const z = aggregateAttributionForCampaign(summary, 'p1-google-2026q2', 'p1')
    expect(z.landings).toBe(3)
    expect(z.conversions).toBe(1)
    const map = buildAttributionMapForKanaele(summary, true)
    expect(map.p1_google?.landings).toBe(3)
  })
})
