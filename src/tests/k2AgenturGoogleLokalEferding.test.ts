import { describe, it, expect } from 'vitest'
import { GOOGLE_RSA_LOKAL_EFERDING } from '../config/k2AgenturGoogleAnzeigenLokalEferding'
import {
  EFERDING_GOOGLE_CAMPAIGN_KEY,
  getLokalEferdingGoogleLandingUrl,
  GOOGLE_LOKAL_EFERDING_CSV_CAMPAIGN_NAME,
  GOOGLE_LOKAL_EFERDING_DAILY_BUDGET_EUR,
} from '../config/k2AgenturGoogleLokalEferding'
import {
  GOOGLE_KEYWORDS_LOKAL_EFERDING_GRUPPEN,
  GOOGLE_KEYWORDS_LOKAL_EFERDING_SAMSTAG,
} from '../config/k2AgenturGoogleKeywordsLokalEferding'
import {
  GOOGLE_CALLOUTS_LOKAL_EFERDING,
  GOOGLE_SITELINKS_LOKAL_EFERDING,
  GOOGLE_SITELINK_LIMITS,
  exportGoogleSitelinksLokalEferdingBulkCsvDe,
  exportGoogleSitelinksLokalEferdingEditorCsv,
  getGoogleSitelinksLokalEferdingWithUrls,
} from '../config/k2AgenturGoogleSitelinksLokalEferding'

describe('k2AgenturGoogleLokalEferding', () => {
  it('Landing-URL zeigt auf echte Galerie mit eferding-Kampagne', () => {
    const url = getLokalEferdingGoogleLandingUrl()
    expect(url).toContain('/galerie?')
    expect(url).toContain(`k=${EFERDING_GOOGLE_CAMPAIGN_KEY}`)
    expect(url).toContain('utm_campaign=eferding-google-2026q2')
  })

  it('Tagesbudget ist 5 EUR', () => {
    expect(GOOGLE_LOKAL_EFERDING_DAILY_BUDGET_EUR).toBe(5)
  })

  it('Keywords für beide Anzeigengruppen vorhanden', () => {
    expect(GOOGLE_KEYWORDS_LOKAL_EFERDING_SAMSTAG.length).toBeGreaterThanOrEqual(6)
    expect(GOOGLE_KEYWORDS_LOKAL_EFERDING_GRUPPEN.length).toBeGreaterThanOrEqual(6)
  })

  it('Sitelink-URLs nutzen eferding-google-2026q2', () => {
    const rows = getGoogleSitelinksLokalEferdingWithUrls()
    expect(rows).toHaveLength(6)
    expect(rows.every((r) => r.url.includes('k=eferding-google-2026q2'))).toBe(true)
  })

  it('deutsche Bulk-CSV für Empfehlungs-Upload', () => {
    const csv = exportGoogleSitelinksLokalEferdingBulkCsvDe()
    expect(csv.startsWith('\uFEFFKampagne,Linktext,Finale URL,')).toBe(true)
    expect(csv).toContain(`"${GOOGLE_LOKAL_EFERDING_CSV_CAMPAIGN_NAME}","Samstag geöffnet"`)
    expect(csv.split('\r\n').length).toBe(7)
  })

  it('Google Editor CSV mit 6 Add-Zeilen', () => {
    const csv = exportGoogleSitelinksLokalEferdingEditorCsv('Test-Eferding')
    expect(csv.startsWith('\uFEFFAction,Campaign,')).toBe(true)
    expect(csv).toContain('"Add","Test-Eferding","Gruppenbesuch"')
    expect(csv.split('\r\n').length).toBe(7)
  })

  it('Sitelinks und Callouts halten Zeichenlimits', () => {
    for (const row of GOOGLE_SITELINKS_LOKAL_EFERDING) {
      expect(row.titel.length).toBeLessThanOrEqual(GOOGLE_SITELINK_LIMITS.titel)
      expect(row.beschreibung1.length).toBeLessThanOrEqual(GOOGLE_SITELINK_LIMITS.beschreibung)
      expect(row.beschreibung2.length).toBeLessThanOrEqual(GOOGLE_SITELINK_LIMITS.beschreibung)
    }
    for (const c of GOOGLE_CALLOUTS_LOKAL_EFERDING) {
      expect(c.text.length).toBeLessThanOrEqual(GOOGLE_SITELINK_LIMITS.callout)
    }
  })

  it('RSA-Headlines max 30 Zeichen, Beschreibungen max 90', () => {
    for (const rsa of GOOGLE_RSA_LOKAL_EFERDING) {
      for (const h of rsa.headlines) {
        expect(h.length).toBeLessThanOrEqual(30)
      }
      for (const d of rsa.descriptions) {
        expect(d.length).toBeLessThanOrEqual(90)
      }
    }
  })
})
