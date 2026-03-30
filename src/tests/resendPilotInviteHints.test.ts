import { describe, it, expect } from 'vitest'
import { isResendTestingRecipientsOnlyError } from '../utils/resendPilotInviteHints'

describe('resendPilotInviteHints', () => {
  it('erkennt Resend-Testmodus / Domain-Hinweis', () => {
    expect(
      isResendTestingRecipientsOnlyError(
        '[403] You can only send testing emails to your own email address (georg.kreinecker@kgm.at). To send emails to other recipients, please verify a domain',
      ),
    ).toBe(true)
  })
  it('leer oder anderer Fehler → false', () => {
    expect(isResendTestingRecipientsOnlyError(undefined)).toBe(false)
    expect(isResendTestingRecipientsOnlyError('Invalid API key')).toBe(false)
  })
})
