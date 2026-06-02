import { describe, expect, it } from 'vitest'
import {
  P1_GOOGLE_SPARTE_KEYWORD_TOP,
  buildP1SparteGoogleCampaignKey,
  formatGoogleKeywordsP1SparteAnzeigengruppePaket,
  formatGoogleKeywordsP1SpartenPhaseBPlan,
  getP1SparteKeywordsTopForGoogle,
  listP1SparteGoogleAdGroupPlans,
} from '../config/k2AgenturGoogleKeywordsP1Sparten'

describe('k2AgenturP1SpartenGoogle Phase B', () => {
  it('liefert Top 8 Keywords pro Sparte', () => {
    const handwerk = getP1SparteKeywordsTopForGoogle('handwerk')
    expect(handwerk).toHaveLength(P1_GOOGLE_SPARTE_KEYWORD_TOP)
    expect(handwerk[0]!.suchbegriff).toBe('handwerk online verkaufen')
    expect(handwerk[7]!.prio).toBe(8)
  })

  it('Kampagnen-Key je Sparte', () => {
    expect(buildP1SparteGoogleCampaignKey('mode')).toBe('p1-google-mode-2026q2')
  })

  it('fünf Anzeigengruppen-Pläne', () => {
    const plans = listP1SparteGoogleAdGroupPlans()
    expect(plans).toHaveLength(5)
    expect(plans.map((p) => p.keywordCount).every((n) => n === 8)).toBe(true)
  })

  it('Anzeigengruppe-Paket enthält Eingabezeilen und URL', () => {
    const block = formatGoogleKeywordsP1SparteAnzeigengruppePaket('food', 'https://test.example/demo')
    expect(block).toContain('Phase B')
    expect(block).toContain('p1-google-food-2026q2')
    expect(block).toContain('https://test.example/demo')
    expect(block).toContain('"hofladen online shop"')
    expect(block).not.toContain('kleine manufaktur food shop')
  })

  it('Gesamtplan listet alle Sparten', () => {
    const plan = formatGoogleKeywordsP1SpartenPhaseBPlan()
    expect(plan).toContain('Handwerk & Manufaktur')
    expect(plan).toContain('Dienstleister & Portfolio')
    expect(plan).toContain('Phase B')
  })
})
