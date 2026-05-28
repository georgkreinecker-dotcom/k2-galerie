import { describe, it, expect } from 'vitest'
import {
  formatSchaltPaketText,
  getSchaltPaket,
  kanalStepIdAutoOnPaketKopiert,
} from '../config/k2AgenturLaunchCheckliste'
import {
  createDefaultK2AgenturPlattformState,
  kanalStorageKey,
  markPaketKopiert,
  suggestKanalStatusFromChecklist,
  toggleGlobalSchritt,
  toggleKanalSchritt,
} from '../utils/k2AgenturPlattformStorage'

describe('k2AgenturLaunchCheckliste', () => {
  it('Schalt-Paket enthält Kampagne und URL', () => {
    const p = getSchaltPaket('p1', 'google')
    expect(p).not.toBeNull()
    const text = formatSchaltPaketText(p!)
    expect(text).toContain('p1-google-2026q2')
    expect(text).toContain('utm_campaign=p1-google-2026q2')
    expect(text).toContain('/projects/k2-galerie/galerie-oeffentlich')
    expect(text).toContain('Keywords P1 · Google Ads')
  })

  it('Schalt-Paket P2/P3 Google enthält produktspezifische Keywords', () => {
    const p2Text = formatSchaltPaketText(getSchaltPaket('p2', 'google')!)
    expect(p2Text).toContain('Keywords P2 · Google Ads (VK2)')
    expect(p2Text).toContain('"vereinsgalerie online"')

    const p3Text = formatSchaltPaketText(getSchaltPaket('p3', 'google')!)
    expect(p3Text).toContain('Keywords P3 · Google Ads (K2 Familie)')
    expect(p3Text).toContain('"stammbaum online speichern"')
  })

  it('markPaketKopiert hakt Ziel-URL-Schritt ab', () => {
    const autoId = kanalStepIdAutoOnPaketKopiert()
    expect(autoId).toBe('ziel-url-eingetragen')
    const key = kanalStorageKey('p1', 'meta')
    let s = createDefaultK2AgenturPlattformState()
    expect(s.kanalSchritte[key][autoId!]).toBe(false)
    s = markPaketKopiert(s, key)
    expect(s.kanalSchritte[key][autoId!]).toBe(true)
  })

  it('global Google Konto setzt kontoEingerichtet für alle Google-Kanäle', () => {
    let s = createDefaultK2AgenturPlattformState()
    s = toggleGlobalSchritt(s, 'global-google-konto', true)
    expect(s.kanaele[kanalStorageKey('p1', 'google')].kontoEingerichtet).toBe(true)
    expect(s.kanaele[kanalStorageKey('p2', 'google')].kontoEingerichtet).toBe(true)
    expect(s.kanaele[kanalStorageKey('p1', 'meta')].kontoEingerichtet).toBe(false)
  })

  it('suggestKanalStatus: live wenn alle Schritte + aktiv', () => {
    let s = createDefaultK2AgenturPlattformState()
    const key = kanalStorageKey('p3', 'linkedin')
    s = toggleGlobalSchritt(s, 'global-linkedin-konto', true)
    for (const stepId of Object.keys(s.kanalSchritte[key])) {
      s = toggleKanalSchritt(s, key, stepId, true)
    }
    expect(suggestKanalStatusFromChecklist(s, key)).toBe('live')
  })
})
