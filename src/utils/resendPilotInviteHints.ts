/**
 * Resend liefert englische Fehlertexte; für Lizenzen/Testpilot zeigen wir eine klare deutsche Einordnung.
 */
export function isResendTestingRecipientsOnlyError(detail: string | undefined): boolean {
  if (!detail) return false
  const d = detail.toLowerCase()
  return (
    d.includes('only send testing emails') ||
    d.includes('verify a domain') ||
    d.includes('resend.com/domains')
  )
}
