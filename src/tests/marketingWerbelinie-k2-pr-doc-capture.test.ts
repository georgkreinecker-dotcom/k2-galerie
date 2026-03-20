import { describe, expect, it } from 'vitest'
import {
  getK2PrDocHtml2canvasCaptureCss,
  getPlakatPosterPrintCss,
  getWerbemittelHtml2canvasCaptureCss,
  PLAKAT_PDF_ACCENT_FALLBACK,
} from '../config/marketingWerbelinie'

describe('getK2PrDocHtml2canvasCaptureCss', () => {
  it('enthält body.k2-pr-doc und Druck-Kontrast (#1a1f3a) für html2canvas', () => {
    const css = getK2PrDocHtml2canvasCaptureCss()
    expect(css).toContain('body.k2-pr-doc')
    expect(css).toContain('#1a1f3a')
    expect(css).toContain('-webkit-text-fill-color')
    expect(css).toContain('.newsletter-subject-line')
    expect(css).toContain('.presse-body')
  })
})

describe('Sportwagenmodus Werbemittel-Capture (eine Quelle)', () => {
  it('getWerbemittelHtml2canvasCaptureCss: A4 + k2-pr-doc bündelt K2-Capture-CSS', () => {
    const css = getWerbemittelHtml2canvasCaptureCss('<body class="k2-pr-doc">', 'a4')
    expect(css).toContain('body.k2-pr-doc')
    expect(css).toContain('.no-print')
  })
  it('getWerbemittelHtml2canvasCaptureCss: A3 + Plakat nutzt Akzent-Variable', () => {
    const css = getWerbemittelHtml2canvasCaptureCss('<div class="plakat">', 'a3')
    expect(css).toContain('.plakat h1')
    expect(css).toContain(PLAKAT_PDF_ACCENT_FALLBACK)
  })
  it('getPlakatPosterPrintCss: gleiche Druck-Kontrast-Logik wie PR-Dok (.plakat)', () => {
    const css = getPlakatPosterPrintCss()
    expect(css).toContain('@media print')
    expect(css).toContain('.plakat h1')
    expect(css).toContain('#1a1f3a')
  })
})
