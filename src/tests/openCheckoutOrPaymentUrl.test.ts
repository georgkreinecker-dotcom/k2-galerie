import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('openCheckoutOrPaymentUrl', () => {
  const originalTop = window.top
  const originalOpen = window.open

  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    window.open = originalOpen
    Object.defineProperty(window, 'top', { value: originalTop, configurable: true })
  })

  it('öffnet gleiche Origin im iframe in neuem Tab wenn Pop-up klappt', async () => {
    Object.defineProperty(window, 'top', { value: {}, configurable: true })
    const opened = { closed: false }
    window.open = vi.fn(() => opened as unknown as Window)
    const { openCheckoutOrPaymentUrl } = await import('../utils/openCheckoutOrPaymentUrl')
    const url = `${window.location.origin}/lizenz-erfolg?muster=1`
    const r = openCheckoutOrPaymentUrl(url)
    expect(r).toBe('new_tab')
    expect(window.open).toHaveBeenCalledWith(url, '_blank', 'noopener,noreferrer')
  })

  it('liefert popup_blocked wenn window.open null', async () => {
    Object.defineProperty(window, 'top', { value: {}, configurable: true })
    window.open = vi.fn(() => null)
    const { openCheckoutOrPaymentUrl } = await import('../utils/openCheckoutOrPaymentUrl')
    const r = openCheckoutOrPaymentUrl('https://checkout.stripe.com/c/pay/cs_test_xxx')
    expect(r).toBe('popup_blocked')
  })

  it('blockiert javascript:-URLs', async () => {
    Object.defineProperty(window, 'top', { value: window, configurable: true })
    const { openCheckoutOrPaymentUrl } = await import('../utils/openCheckoutOrPaymentUrl')
    expect(openCheckoutOrPaymentUrl('javascript:void(0)')).toBe('blocked')
  })

  it('blockiert data:-URLs im iframe ohne window.open', async () => {
    Object.defineProperty(window, 'top', { value: {}, configurable: true })
    window.open = vi.fn(() => ({}) as Window)
    const { openCheckoutOrPaymentUrl } = await import('../utils/openCheckoutOrPaymentUrl')
    expect(openCheckoutOrPaymentUrl('data:text/html,x')).toBe('blocked')
    expect(window.open).not.toHaveBeenCalled()
  })
})
