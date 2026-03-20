import { describe, expect, it } from 'vitest'
import { getK2PrDocHtml2canvasCaptureCss } from '../config/marketingWerbelinie'

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
