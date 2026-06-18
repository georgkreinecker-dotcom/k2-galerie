import { describe, it, expect } from 'vitest'
import {
  GOOGLE_CALLOUTS_P1,
  GOOGLE_SITELINKS_P1,
  GOOGLE_SITELINK_LIMITS,
  GOOGLE_SITELINKS_P1_CSV_CAMPAIGN_NAME,
  buildP1GoogleSitelinkUrl,
  exportGoogleSitelinksP1BulkCsvDe,
  exportGoogleSitelinksP1EditorCsv,
  getGoogleSitelinksP1WithUrls,
} from '../config/k2AgenturGoogleSitelinksP1'

describe('k2AgenturGoogleSitelinksP1', () => {
  it('baut Sitelink-URLs mit P1-Google-Kampagne', () => {
    const url = buildP1GoogleSitelinkUrl('/projects/k2-galerie/lizenz-kaufen')
    expect(url).toContain('/projects/k2-galerie/lizenz-kaufen?')
    expect(url).toContain('k=p1-google-2026q2')
    expect(url).toContain('utm_source=google')
    expect(url).toContain('utm_campaign=p1-google-2026q2')
  })

  it('liefert 6 Sitelinks mit URLs', () => {
    const rows = getGoogleSitelinksP1WithUrls()
    expect(rows).toHaveLength(6)
    expect(rows.every((r) => r.url.includes('k=p1-google-2026q2'))).toBe(true)
  })

  it('CSV für Google Editor: 6 Zeilen Add + URLs', () => {
    const csv = exportGoogleSitelinksP1EditorCsv('Test-P1')
    expect(csv.startsWith('\uFEFFAction,Campaign,')).toBe(true)
    expect(csv.split('\r\n').length).toBe(7)
    expect(csv).toContain('"Add","Test-P1","Demo-Galerie ansehen"')
    expect(csv).toContain('k=p1-google-2026q2')
  })

  it('CSV-Standard nutzt Kampagnennamen aus Google Ads', () => {
    const csv = exportGoogleSitelinksP1EditorCsv()
    expect(csv).toContain(`"Add","${GOOGLE_SITELINKS_P1_CSV_CAMPAIGN_NAME}"`)
    expect(GOOGLE_SITELINKS_P1_CSV_CAMPAIGN_NAME).toBe('Campaign #1')
  })

  it('deutsche Bulk-CSV für Empfehlungs-Upload (ohne Action-Spalte)', () => {
    const csv = exportGoogleSitelinksP1BulkCsvDe()
    expect(csv.startsWith('\uFEFFKampagne,Linktext,Finale URL,')).toBe(true)
    expect(csv).not.toContain('Action,')
    expect(csv).toContain(`"Campaign #1","Demo-Galerie ansehen"`)
    expect(csv.split('\r\n').length).toBe(7)
  })

  it('Texte halten Google-Zeichenlimits ein', () => {
    for (const row of GOOGLE_SITELINKS_P1) {
      expect(row.titel.length).toBeLessThanOrEqual(GOOGLE_SITELINK_LIMITS.titel)
      expect(row.beschreibung1.length).toBeLessThanOrEqual(GOOGLE_SITELINK_LIMITS.beschreibung)
      expect(row.beschreibung2.length).toBeLessThanOrEqual(GOOGLE_SITELINK_LIMITS.beschreibung)
      expect(row.titel.toLowerCase()).not.toContain('gratis testen')
    }
    for (const c of GOOGLE_CALLOUTS_P1) {
      expect(c.text.length).toBeLessThanOrEqual(GOOGLE_SITELINK_LIMITS.callout)
      expect(c.text.toLowerCase()).not.toContain('gratis testen')
    }
  })
})
