import { describe, expect, it } from 'vitest'
import {
  kannAlsPdfExportieren,
  resolveStaticPagePdfProfile,
  safeStaticPagePdfFileName,
} from '../utils/staticPagePdfExport'

describe('staticPagePdfExport', () => {
  it('kannAlsPdfExportieren erkennt html und pdf', () => {
    expect(kannAlsPdfExportieren('/foo/bar.html')).toBe(true)
    expect(kannAlsPdfExportieren('/texte-schreibtisch/vita.pdf')).toBe(true)
    expect(kannAlsPdfExportieren('/projects/k2-galerie/admin')).toBe(false)
  })

  it('safeStaticPagePdfFileName bereinigt Titel', () => {
    expect(safeStaticPagePdfFileName('Plakatständer A1 · Heute offen')).toBe(
      'Plakatständer-A1-·-Heute-offen.pdf',
    )
    expect(safeStaticPagePdfFileName('  ')).toBe('K2-Dokument.pdf')
  })

  it('resolveStaticPagePdfProfile: Plakatständer = A4', () => {
    const p = resolveStaticPagePdfProfile('/plakate-druckformate-k2/plakatstaender-a1-heute-offen-k2.html')
    expect(p.isPlakatstaender).toBe(true)
    expect(p.jsFormat).toBe('a4')
  })

  it('resolveStaticPagePdfProfile: Öffnungszeiten-Flyer = A5', () => {
    const p = resolveStaticPagePdfProfile('/plakate-druckformate-k2/oeffnungszeiten-flyer-a5-k2.html')
    expect(p.isOeffnungszeitenFlyerA5).toBe(true)
    expect(p.jsFormat).toBe('a5')
  })
})
