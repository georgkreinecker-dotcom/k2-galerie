import { describe, it, expect } from 'vitest'
import {
  GOOGLE_CALLOUTS_P3,
  GOOGLE_SITELINKS_P3,
  GOOGLE_SITELINK_LIMITS,
  GOOGLE_SITELINKS_P3_CSV_CAMPAIGN_NAME,
  buildP3GoogleSitelinkUrl,
  exportGoogleSitelinksP3BulkCsvDe,
  exportGoogleSitelinksP3EditorCsv,
  getGoogleSitelinksP3WithUrls,
} from '../config/k2AgenturGoogleSitelinksP3'

describe('k2AgenturGoogleSitelinksP3', () => {
  it('baut Sitelink-URLs mit P3-Google-Kampagne', () => {
    const url = buildP3GoogleSitelinkUrl('/projects/k2-familie/lizenz-erwerben')
    expect(url).toContain('/projects/k2-familie/lizenz-erwerben?')
    expect(url).toContain('k=p3-google-2026q2')
    expect(url).toContain('utm_source=google')
    expect(url).toContain('utm_campaign=p3-google-2026q2')
  })

  it('behält t=huber bei Musterfamilie-URLs', () => {
    const url = buildP3GoogleSitelinkUrl('/projects/k2-familie/meine-familie?t=huber')
    expect(url).toContain('t=huber')
    expect(url).toContain('k=p3-google-2026q2')
  })

  it('liefert 6 Sitelinks mit URLs', () => {
    const rows = getGoogleSitelinksP3WithUrls()
    expect(rows).toHaveLength(6)
    expect(rows.every((r) => r.url.includes('k=p3-google-2026q2'))).toBe(true)
  })

  it('CSV für Google Editor: 6 Zeilen Add + URLs', () => {
    const csv = exportGoogleSitelinksP3EditorCsv('Test-P3')
    expect(csv.startsWith('\uFEFFAction,Campaign,')).toBe(true)
    expect(csv.split('\r\n').length).toBe(7)
    expect(csv).toContain('"Add","Test-P3","Musterfamilie ansehen"')
    expect(csv).toContain('k=p3-google-2026q2')
  })

  it('deutsche Bulk-CSV für Empfehlungs-Upload (ohne Action-Spalte)', () => {
    const csv = exportGoogleSitelinksP3BulkCsvDe()
    expect(csv.startsWith('\uFEFFKampagne,Linktext,Finale URL,')).toBe(true)
    expect(csv).not.toContain('Action,')
    expect(csv).toContain(`"${GOOGLE_SITELINKS_P3_CSV_CAMPAIGN_NAME}","Musterfamilie ansehen"`)
    expect(csv.split('\r\n').length).toBe(7)
  })

  it('Texte halten Google-Zeichenlimits ein', () => {
    for (const row of GOOGLE_SITELINKS_P3) {
      expect(row.titel.length).toBeLessThanOrEqual(GOOGLE_SITELINK_LIMITS.titel)
      expect(row.beschreibung1.length).toBeLessThanOrEqual(GOOGLE_SITELINK_LIMITS.beschreibung)
      expect(row.beschreibung2.length).toBeLessThanOrEqual(GOOGLE_SITELINK_LIMITS.beschreibung)
    }
    for (const c of GOOGLE_CALLOUTS_P3) {
      expect(c.text.length).toBeLessThanOrEqual(GOOGLE_SITELINK_LIMITS.callout)
    }
  })
})
