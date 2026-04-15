import { describe, it, expect } from 'vitest'
import { getFamilieLoadHinweisFuerNutzer } from '../utils/familieSupabaseClient'

describe('getFamilieLoadHinweisFuerNutzer', () => {
  it('network: kein pauschales WLAN – Cloud/Dienst-Formulierung', () => {
    const t = getFamilieLoadHinweisFuerNutzer({
      ok: false,
      source: 'local_only',
      reason: 'network',
    })
    expect(t).toContain('Familien-Cloud')
    expect(t.toLowerCase()).not.toMatch(/wlan.*prüfen/i)
  })

  it('not_configured: eigener Hinweis, kein Galerie-Produktname', () => {
    const t = getFamilieLoadHinweisFuerNutzer({
      ok: false,
      source: 'local_only',
      reason: 'not_configured',
    })
    expect(t).toContain('Cloud')
    expect(t).toContain('K2 Familie')
    expect(t.toLowerCase()).not.toContain('galerie-app')
  })
})
