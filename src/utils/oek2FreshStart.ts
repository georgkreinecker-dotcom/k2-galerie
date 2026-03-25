const OEK2_ENTRY_KEY = 'k2-from-entdecken'
const OEK2_ENTRY_TS_KEY = 'k2-from-entdecken-ts'
const OEK2_ENTRY_MAX_AGE_MS = 20 * 60 * 1000

const OEK2_RESET_KEYS = [
  'k2-agb-accepted',
  'k2-willkommen-name',
  'k2-willkommen-entwurf',
  'k2-admin-context',
  'k2-shop-from-oeffentlich',
  'k2-entdecken-q1',
  'k2-entdecken-q2',
  'k2-entdecken-guide-antworten',
  'k2-empfehlung-offen',
  'k2-galerie-from-admin',
  'k2-oek2-from-apf',
  OEK2_ENTRY_KEY,
  OEK2_ENTRY_TS_KEY,
]

export function prepareFreshOek2VisitorSession(): void {
  if (typeof window === 'undefined') return
  for (const key of OEK2_RESET_KEYS) {
    try { sessionStorage.removeItem(key) } catch (_) {}
    try { localStorage.removeItem(key) } catch (_) {}
  }
  const now = Date.now()
  try { sessionStorage.setItem(OEK2_ENTRY_KEY, '1') } catch (_) {}
  try { sessionStorage.setItem(OEK2_ENTRY_TS_KEY, String(now)) } catch (_) {}
}

export function hasFreshOek2EntrySession(): boolean {
  if (typeof window === 'undefined') return false
  try {
    if (sessionStorage.getItem(OEK2_ENTRY_KEY) !== '1') return false
    const raw = sessionStorage.getItem(OEK2_ENTRY_TS_KEY)
    const ts = raw ? Number(raw) : 0
    if (!Number.isFinite(ts) || ts <= 0) return false
    return (Date.now() - ts) <= OEK2_ENTRY_MAX_AGE_MS
  } catch {
    return false
  }
}

