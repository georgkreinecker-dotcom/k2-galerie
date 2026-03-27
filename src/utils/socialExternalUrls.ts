/**
 * Externe Social-/Video-URLs für Galerie (YouTube, Instagram) – nur https/http, sicher für href.
 */

export function safeExternalHref(raw: string | undefined): string {
  if (raw == null || typeof raw !== 'string') return ''
  const t = raw.trim()
  if (!t) return ''
  const lower = t.toLowerCase()
  if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) return ''
  const withProto = /^https?:\/\//i.test(t) ? t : t.startsWith('www.') ? `https://${t}` : `https://${t}`
  try {
    const u = new URL(withProto)
    if (u.protocol === 'http:' || u.protocol === 'https:') return u.href
  } catch {
    return ''
  }
  return ''
}
