import { describe, expect, it } from 'vitest'
import {
  getK2PrDocHtml2canvasCaptureCss,
  getVk2PrDocHtml2canvasCaptureCss,
  getPlakatPosterPrintCss,
  getWerbemittelHtml2canvasCaptureCss,
  PLAKAT_PDF_ACCENT_FALLBACK,
} from '../config/marketingWerbelinie'

describe('getK2PrDocHtml2canvasCaptureCss', () => {
  it('PDF-Capture = CD wie Vorschau: Fließtext + Akzent aus Design-Tab (kein Ersatz-Grau)', () => {
    const css = getK2PrDocHtml2canvasCaptureCss()
    expect(css).toContain('body.k2-pr-doc')
    expect(css).toContain('#fdf6f2')
    expect(css).toContain('#d97a50')
    expect(css).toContain('#c49a88')
    expect(css).toContain('145deg')
    expect(css).toContain('-webkit-text-fill-color')
    expect(css).toContain('.newsletter-subject-line')
    expect(css).toContain('.presse-body')
  })
  it('nutzt übergebenes Design für Überschriften-Akzent', () => {
    const css = getK2PrDocHtml2canvasCaptureCss({ accentColor: '#336699', textColor: '#111111', mutedColor: '#444444' })
    expect(css).toContain('#336699')
    expect(css).toContain('#111111')
  })
})

describe('getVk2PrDocHtml2canvasCaptureCss', () => {
  it('enthält body.vk2-pr-doc und VK2-Lesefarben', () => {
    const css = getVk2PrDocHtml2canvasCaptureCss()
    expect(css).toContain('body.vk2-pr-doc')
    expect(css).toContain('#1c1a18')
    expect(css).toContain('#b54a1e')
  })
})

describe('Sportwagenmodus Werbemittel-Capture (eine Quelle)', () => {
  it('getWerbemittelHtml2canvasCaptureCss: A4 + k2-pr-doc bündelt K2-Capture-CSS', () => {
    const css = getWerbemittelHtml2canvasCaptureCss('<body class="k2-pr-doc">', 'a4')
    expect(css).toContain('body.k2-pr-doc')
    expect(css).toContain('.no-print')
  })
  it('getWerbemittelHtml2canvasCaptureCss: A4 + vk2-pr-doc bündelt VK2-Capture-CSS', () => {
    const css = getWerbemittelHtml2canvasCaptureCss('<body class="vk2-pr-doc">', 'a4')
    expect(css).toContain('body.vk2-pr-doc')
    expect(css).toContain('.no-print')
  })
  it('getWerbemittelHtml2canvasCaptureCss: A3 + Plakat nutzt Akzent-Variable', () => {
    const css = getWerbemittelHtml2canvasCaptureCss('<div class="plakat">', 'a3')
    expect(css).toContain('.plakat h1')
    expect(css).toContain(PLAKAT_PDF_ACCENT_FALLBACK)
  })
  it('getWerbemittelHtml2canvasCaptureCss: social + Entdecken-Plakat-Klassen', () => {
    const css = getWerbemittelHtml2canvasCaptureCss('<div class="entdecken-plakat-social-capture">', 'social')
    expect(css).toContain('.entdecken-plakat-social-capture')
    expect(css).toContain('.entdecken-plakat-social-inner')
    expect(css).toContain('.no-print')
  })
  it('getPlakatPosterPrintCss: gleiche Druck-Kontrast-Logik wie PR-Dok (.plakat)', () => {
    const css = getPlakatPosterPrintCss()
    expect(css).toContain('@media print')
    expect(css).toContain('.plakat h1')
    expect(css).toContain('#1a1f3a')
  })
})
