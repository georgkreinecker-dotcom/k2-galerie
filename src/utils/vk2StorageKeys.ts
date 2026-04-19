/**
 * VK2 Testpilot / Mandant pro Zettel-Nr.: gleiche Host-App, getrennte localStorage-Instanzen
 * (wie K2 Familie mit Tenant-ID). ?vk2Pilot=123 → Session k2-vk2-active-pilot-id → Keys k2-vk2-pilot-123-*.
 */

export const VK2_PILOT_URL_PARAM = 'vk2Pilot'
export const VK2_PILOT_SESSION_KEY = 'k2-vk2-active-pilot-id'

/** Nur Ziffern, 1–8 Stellen – aus Zettel-QR / Formular */
export function sanitizeVk2PilotIdFromParam(raw: string | null | undefined): string | null {
  if (raw == null) return null
  const d = String(raw).replace(/\D/g, '')
  if (!d || d.length > 8) return null
  return d
}

export function getActiveVk2PilotId(): string | null {
  if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') return null
  try {
    return sessionStorage.getItem(VK2_PILOT_SESSION_KEY)
  } catch {
    return null
  }
}

/**
 * Unscoped k2-vk2-* → bei aktivem Pilot k2-vk2-pilot-{id}-*.
 * Bereits gescopte Keys oder fremde Präfixe unverändert.
 */
export function pilotScopeVk2Key(unscopedKey: string): string {
  if (typeof unscopedKey !== 'string' || !unscopedKey.startsWith('k2-vk2-')) return unscopedKey
  if (unscopedKey.includes('-pilot-')) return unscopedKey
  const pid = getActiveVk2PilotId()
  if (!pid) return unscopedKey
  const rest = unscopedKey.slice('k2-vk2-'.length)
  return `k2-vk2-pilot-${pid}-${rest}`
}

/**
 * Aufruf bei VK2-Routen (TenantProvider): ?vk2Pilot= aus URL → Session.
 * Optional: k2-pilot-einladung (Zettel/E-Mail) mit zettelNr / vk2PilotId.
 */
export function syncVk2PilotScopeFromSearch(search: string): void {
  if (typeof sessionStorage === 'undefined') return
  try {
    const params = new URLSearchParams(search || '')
    const fromUrl = sanitizeVk2PilotIdFromParam(params.get(VK2_PILOT_URL_PARAM))
    if (fromUrl) {
      sessionStorage.setItem(VK2_PILOT_SESSION_KEY, fromUrl)
      return
    }
    const invRaw = sessionStorage.getItem('k2-pilot-einladung')
    if (!invRaw) return
    const inv = JSON.parse(invRaw) as { context?: string; vk2PilotId?: string; zettelNr?: string }
    if (inv?.context !== 'vk2') return
    const fromInv = sanitizeVk2PilotIdFromParam(inv.vk2PilotId ?? inv.zettelNr ?? null)
    if (fromInv) sessionStorage.setItem(VK2_PILOT_SESSION_KEY, fromInv)
  } catch {
    /* ignore */
  }
}

const VK2_PROJECT_PREFIX = '/projects/vk2'
const K2_GALERIE_PROJECT_PREFIX = '/projects/k2-galerie'

/**
 * Wo `syncVk2PilotScopeFromSearch` laufen muss – nicht nur unter /projects/vk2/*,
 * sonst bleibt k2-vk2-active-pilot-id bei direktem /admin?context=vk2 leer (Regression mehrfach).
 */
export function shouldSyncVk2PilotScopeFromUrl(pathname: string, search: string): boolean {
  if (pathname.startsWith(VK2_PROJECT_PREFIX)) return true
  try {
    const params = new URLSearchParams(search || '')
    const ctx = params.get('context')?.toLowerCase().trim()
    if (ctx !== 'vk2') return false
    if (pathname === '/admin' || pathname === '/mein-bereich') return true
    if (pathname.startsWith(K2_GALERIE_PROJECT_PREFIX)) return true
  } catch (_) {}
  return false
}
