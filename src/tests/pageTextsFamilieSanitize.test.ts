import { describe, it, expect, beforeEach } from 'vitest'
import { getFamilyPageTexts } from '../config/pageTextsFamilie'

const TID = 'familie-sanitize-test'

describe('getFamilyPageTexts – Huber-Muster nicht unter fremder tenantId', () => {
  beforeEach(() => {
    localStorage.removeItem(`k2-familie-${TID}-page-texts`)
    localStorage.removeItem(`k2-familie-${TID}-einstellungen`)
    localStorage.removeItem('k2-familie-huber-page-texts')
  })

  it('ersetzt Huber-Demo-Titel durch familyDisplayName', () => {
    localStorage.setItem(
      `k2-familie-${TID}-page-texts`,
      JSON.stringify({
        welcomeTitle: 'Familie Huber',
        welcomeSubtitle: 'Vier Generationen – bunt und verbunden',
      }),
    )
    localStorage.setItem(
      `k2-familie-${TID}-einstellungen`,
      JSON.stringify({ familyDisplayName: 'Familie Kreinecker' }),
    )
    const t = getFamilyPageTexts(TID)
    expect(t.welcomeTitle).toBe('Familie Kreinecker')
    expect(t.welcomeSubtitle).toBe('Zusammenleben sichtbar machen')
  })

  it('ersetzt „familie Huber“/Groß-klein-Variante durch familyDisplayName (BUG Vermischung)', () => {
    localStorage.setItem(
      `k2-familie-${TID}-page-texts`,
      JSON.stringify({ welcomeTitle: 'familie Huber' }),
    )
    localStorage.setItem(
      `k2-familie-${TID}-einstellungen`,
      JSON.stringify({ familyDisplayName: 'Familie Kreinecker' }),
    )
    expect(getFamilyPageTexts(TID).welcomeTitle).toBe('Familie Kreinecker')
  })

  it('ersetzt MUSTERFAMILIE HUBER (nur case) durch familyDisplayName', () => {
    localStorage.setItem(
      `k2-familie-${TID}-page-texts`,
      JSON.stringify({ welcomeTitle: 'MUSTERFAMILIE HUBER' }),
    )
    localStorage.setItem(
      `k2-familie-${TID}-einstellungen`,
      JSON.stringify({ familyDisplayName: 'Familie Kreinecker' }),
    )
    expect(getFamilyPageTexts(TID).welcomeTitle).toBe('Familie Kreinecker')
  })

  it('Tenant huber behält gespeicherten Familie-Huber-Titel', () => {
    localStorage.setItem(
      'k2-familie-huber-page-texts',
      JSON.stringify({ welcomeTitle: 'Familie Huber' }),
    )
    expect(getFamilyPageTexts('huber').welcomeTitle).toBe('Musterfamilie Huber')
  })
})
