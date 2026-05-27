import { describe, it, expect } from 'vitest'
import { formatAnzeigenPaketText, getAnzeigenPaket } from '../config/k2AgenturAnzeigenTexte'
import { formatAuswertungPaketText } from '../config/k2AgenturAuswertungPaket'
import { formatCreativeSpecText } from '../config/k2AgenturCreativeSpec'
import { K2_AGENTUR_MOK2_LESEHINWEIS } from '../config/k2AgenturMok2Lesehinweise'
import { getNextRecommendedKanal, K2_AGENTUR_KANAL_PRIORITY } from '../config/k2AgenturKanalPrioritaet'
import { kanalStepIdAutoOnAnzeigenKopiert } from '../config/k2AgenturLaunchCheckliste'
import {
  appendKanalNotizBlock,
  createDefaultK2AgenturPlattformState,
  kanalStorageKey,
  markAnzeigenPaketKopiert,
  markAuswertungPaketKopiert,
  sumBudgetEurMonat,
  toggleGlobalSchritt,
} from '../utils/k2AgenturPlattformStorage'

describe('k2AgenturWerkzeuge', () => {
  it('Anzeigen-Paket: kurze Ads-Texte, nicht mök2-Slogan', () => {
    const p = getAnzeigenPaket('p1', 'google')
    expect(p).not.toBeNull()
    const text = formatAnzeigenPaketText(p!)
    expect(text).toContain('Nicht der mök2-Strategietext')
    expect(text).toContain(p!.schalt.landingUrl)
    expect(p!.headlines[0]).toBe('Online-Galerie starten')
    expect(p!.headlines[0].length).toBeLessThanOrEqual(30)
    expect(p!.headlines[0]).not.toContain('für Menschen mit Ideen')
  })

  it('markAnzeigenPaketKopiert hakt anzeige-creative ab', () => {
    const autoId = kanalStepIdAutoOnAnzeigenKopiert()
    expect(autoId).toBe('anzeige-creative')
    const key = kanalStorageKey('p2', 'meta')
    let s = createDefaultK2AgenturPlattformState()
    s = markAnzeigenPaketKopiert(s, key)
    expect(s.kanalSchritte[key][autoId!]).toBe(true)
  })

  it('Auswertungs-Paket enthält Kampagne und Entscheidungsfelder', () => {
    const text = formatAuswertungPaketText('p3', 'linkedin')
    expect(text).toContain('Auswertung')
    expect(text).toContain('p3-linkedin')
    expect(text).toContain('Weiterlaufen')
  })

  it('markAuswertungPaketKopiert setzt auswertung-geplant', () => {
    const key = kanalStorageKey('p1', 'google')
    let s = createDefaultK2AgenturPlattformState()
    s = markAuswertungPaketKopiert(s, key)
    expect(s.kanalSchritte[key]['auswertung-geplant']).toBe(true)
  })

  it('appendKanalNotizBlock hängt Text an', () => {
    const key = kanalStorageKey('p1', 'meta')
    let s = createDefaultK2AgenturPlattformState()
    s = appendKanalNotizBlock(s, key, 'Test-Notiz')
    expect(s.kanaele[key].notizen).toContain('Test-Notiz')
  })

  it('sumBudgetEurMonat summiert Budget-Felder', () => {
    let s = createDefaultK2AgenturPlattformState()
    const k1 = kanalStorageKey('p1', 'google')
    const k2 = kanalStorageKey('p1', 'meta')
    s = {
      ...s,
      kanaele: {
        ...s.kanaele,
        [k1]: { ...s.kanaele[k1], budgetEurMonat: '100' },
        [k2]: { ...s.kanaele[k2], budgetEurMonat: '50,5' },
      },
    }
    expect(sumBudgetEurMonat(s)).toBeCloseTo(150.5)
  })

  it('mök2-Lesehinweise pro Produkt nicht leer', () => {
    expect(K2_AGENTUR_MOK2_LESEHINWEIS.p1.length).toBeGreaterThan(2)
    expect(K2_AGENTUR_MOK2_LESEHINWEIS.p2.some((l) => l.href.includes('mok2'))).toBe(true)
  })

  it('Creative-Spez enthält Maße und Werbeunterlagen', () => {
    expect(formatCreativeSpecText()).toContain('1080')
    expect(formatCreativeSpecText()).toContain('werbeunterlagen')
  })

  it('getNextRecommendedKanal nach Konto-Einrichtung', () => {
    let s = createDefaultK2AgenturPlattformState()
    s = toggleGlobalSchritt(s, 'global-google-konto', true)
    const next = getNextRecommendedKanal(s)
    expect(next).not.toBeNull()
    expect(next!.key).toBe(kanalStorageKey('p1', 'google'))
  })

  it('Kanal-Priorität hat 9 Einträge', () => {
    expect(K2_AGENTUR_KANAL_PRIORITY).toHaveLength(9)
  })
})
