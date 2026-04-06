/**
 * K2: Bekannte Demo-/Platzhalter-Webadressen aus Stammdaten entfernen (kein Auto-Fill mit Muster-Domains).
 * Nur K2; ök2 nutzt MUSTER_TEXTE unverändert.
 */

export const K2_BLOCKED_WEBSITE_HOST_KEYS = new Set([
  'k2-galerie.at',
  'kuenstlerin-muster.example',
  'kuenstler-muster.example',
  'galerie-muster.example',
])

function hostKeyFromWebValue(raw: string): string | null {
  const s = raw.trim()
  if (!s) return null
  let u = s
  if (!/^https?:\/\//i.test(u) && !u.includes('://')) {
    u = `https://${u}`
  }
  try {
    const url = new URL(u)
    if (url.protocol === 'mailto:') return null
    let h = url.hostname.toLowerCase()
    if (h.startsWith('www.')) h = h.slice(4)
    return h || null
  } catch {
    return null
  }
}

/** Leer wenn Wert eine blockierte Demo-Domain ist; sonst unverändert (getrimmt). */
export function sanitizeK2WebsiteField(value: unknown): string {
  const raw = value != null && String(value).trim() ? String(value).trim() : ''
  if (!raw) return ''
  const key = hostKeyFromWebValue(raw)
  if (key && K2_BLOCKED_WEBSITE_HOST_KEYS.has(key)) return ''
  return raw
}

export function sanitizeK2ParsedStammdatenRecord(
  type: 'martina' | 'georg' | 'gallery',
  parsed: Record<string, unknown>,
): { data: Record<string, unknown>; changed: boolean } {
  if (type === 'martina' || type === 'georg') {
    const w = sanitizeK2WebsiteField(parsed.website)
    const prev = parsed.website != null && String(parsed.website).trim() ? String(parsed.website).trim() : ''
    if (w !== prev) {
      return { data: { ...parsed, website: w }, changed: true }
    }
    return { data: parsed, changed: false }
  }
  const w = sanitizeK2WebsiteField(parsed.website)
  const i = sanitizeK2WebsiteField(parsed.internetadresse)
  const pw = parsed.website != null && String(parsed.website).trim() ? String(parsed.website).trim() : ''
  const pi =
    parsed.internetadresse != null && String(parsed.internetadresse).trim()
      ? String(parsed.internetadresse).trim()
      : ''
  if (w !== pw || i !== pi) {
    return { data: { ...parsed, website: w, internetadresse: i }, changed: true }
  }
  return { data: parsed, changed: false }
}
