import { describe, it, expect } from 'vitest'
import { safeExternalHref } from '../utils/socialExternalUrls'

describe('safeExternalHref', () => {
  it('leer bei undefined/leer', () => {
    expect(safeExternalHref(undefined)).toBe('')
    expect(safeExternalHref('')).toBe('')
    expect(safeExternalHref('   ')).toBe('')
  })

  it('ergänzt https bei fehlendem Schema', () => {
    expect(safeExternalHref('www.youtube.com/channel/abc')).toMatch(/^https:\/\/www\.youtube\.com\//)
    expect(safeExternalHref('instagram.com/foo')).toMatch(/^https:\/\//)
  })

  it('behält gültige https-URLs', () => {
    expect(safeExternalHref('https://www.youtube.com/watch?v=1')).toBe('https://www.youtube.com/watch?v=1')
  })

  it('lehnt javascript: ab', () => {
    expect(safeExternalHref('javascript:alert(1)')).toBe('')
  })
})
