import { describe, it, expect, vi } from 'vitest'
import { parseSafeHttpHttpsUrl, safeHttpHttpsHref, openAppOrHttpUrlInNewTab } from '../utils/safeExternalUrl'

describe('safeExternalUrl', () => {
  it('akzeptiert https', () => {
    expect(parseSafeHttpHttpsUrl('https://example.com/x')?.href).toBe('https://example.com/x')
  })

  it('lehnt javascript: ab', () => {
    expect(parseSafeHttpHttpsUrl('javascript:alert(1)')).toBeNull()
    expect(safeHttpHttpsHref('javascript:void(0)')).toBeUndefined()
  })

  it('lehnt data: ab', () => {
    expect(safeHttpHttpsHref('data:text/html,<p>x</p>')).toBeUndefined()
  })

  it('openAppOrHttpUrlInNewTab öffnet nur validierte http(s)-URLs', () => {
    const spy = vi.spyOn(window, 'open').mockReturnValue(null)
    expect(openAppOrHttpUrlInNewTab('javascript:evil')).toBeNull()
    expect(spy).not.toHaveBeenCalled()
    expect(openAppOrHttpUrlInNewTab('//evil.example/phish')).toBeNull()
    expect(spy).not.toHaveBeenCalled()
    openAppOrHttpUrlInNewTab('https://stripe.com/')
    expect(spy).toHaveBeenCalledWith('https://stripe.com/', '_blank', 'noopener,noreferrer')
    spy.mockRestore()
  })
})
