/**
 * Schutz vor Tab-Nabbing und gefährlichen URL-Schemata (Phishing / XSS via javascript:, data:, …).
 * Ein Standard für externe Navigation aus UI, Markdown und Panel-Links.
 */

/** Nur http/https für unsichere Quellen (API-Antworten, Nutzertext, eingetragene URLs). */
export function parseSafeHttpHttpsUrl(raw: string, baseHref?: string): URL | null {
  const s = String(raw ?? '').trim()
  if (!s || s.startsWith('//')) {
    return null
  }
  const base = baseHref ?? (typeof window !== 'undefined' ? window.location.href : 'https://localhost/')
  try {
    const u = new URL(s, base)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
    return u
  } catch {
    return null
  }
}

export function safeHttpHttpsHref(raw: string): string | undefined {
  return parseSafeHttpHttpsUrl(raw)?.href
}

/**
 * Öffnet nur http(s)-URLs oder gleiche-Origin-Pfade im neuen Tab mit noopener/noreferrer.
 */
export function openAppOrHttpUrlInNewTab(raw: string): Window | null {
  if (typeof window === 'undefined') return null
  const t = String(raw ?? '').trim()
  if (!t) return null

  const http = parseSafeHttpHttpsUrl(t)
  if (http) {
    return window.open(http.href, '_blank', 'noopener,noreferrer')
  }

  // Nicht als relativen Pfad missbrauchen: javascript:, data:, //phishing.example/ …
  if (/^[a-z][a-z0-9+.-]*:/i.test(t)) {
    return null
  }

  try {
    const path = t.startsWith('/') ? t : `/${t}`
    if (path.startsWith('//')) {
      return null
    }
    const u = new URL(path, window.location.origin)
    if (u.origin !== window.location.origin) return null
    const dest = `${u.pathname}${u.search}${u.hash}`
    return window.open(dest, '_blank', 'noopener,noreferrer')
  } catch {
    return null
  }
}
