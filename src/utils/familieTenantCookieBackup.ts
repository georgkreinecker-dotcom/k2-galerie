/**
 * Letzte aktive K2-Familie-Tenant-ID als First-Party-Cookie sichern.
 * Hilft, wenn die PWA (z. B. iOS Home-Bildschirm) ein leeres localStorage hat,
 * der normale Browser dieselbe Origin aber schon eine Familien-ID gespeichert hat –
 * Cookies sind oft zwischen diesen Kontexten zuverlässiger als nur localStorage.
 */

import { FAMILIE_HUBER_TENANT_ID } from '../data/familieHuberMuster'
import { K2_FAMILIE_DEFAULT_TENANT, isValidFamilieTenantId } from './familieStorage'

const COOKIE_NAME = 'k2fam_t'
const MAX_AGE_SEC = 60 * 60 * 24 * 400

function parseCookieTenant(): string | null {
  if (typeof document === 'undefined') return null
  const parts = document.cookie.split(';')
  for (const p of parts) {
    const [k, ...rest] = p.trim().split('=')
    if (k === COOKIE_NAME && rest.length) {
      try {
        const v = decodeURIComponent(rest.join('=').trim())
        return v || null
      } catch {
        return rest.join('=').trim() || null
      }
    }
  }
  return null
}

/** Zuletzt aktive Familie (nur echte IDs, nicht „default“). */
export function readFamilieTenantCookieBackup(): string | null {
  const raw = parseCookieTenant()?.trim()
  if (!raw || raw === K2_FAMILIE_DEFAULT_TENANT) return null
  if (!isValidFamilieTenantId(raw)) return null
  return raw.toLowerCase()
}

/**
 * Wenn weder Session noch localStorage „aktueller Mandant“ haben: Cookie und Listen-Fallback.
 * Huber (Demo) nicht vor echter familie-…-ID wählen (PWA/Cookie oft noch huber nach Umschau).
 */
export function pickFallbackFamilieTenantId(list: string[], fromCookie: string | null): string {
  if (fromCookie && list.includes(fromCookie)) {
    if (fromCookie === FAMILIE_HUBER_TENANT_ID) {
      const real = list.find((x) => x !== K2_FAMILIE_DEFAULT_TENANT && x !== FAMILIE_HUBER_TENANT_ID)
      if (real) return real
    }
    return fromCookie
  }
  const realFirst = list.find((x) => x !== K2_FAMILIE_DEFAULT_TENANT && x !== FAMILIE_HUBER_TENANT_ID)
  if (realFirst) return realFirst
  const anyNonDefault = list.find((x) => x !== K2_FAMILIE_DEFAULT_TENANT)
  if (anyNonDefault) return anyNonDefault
  return list[0] ?? K2_FAMILIE_DEFAULT_TENANT
}

export function setFamilieTenantCookieBackup(tenantId: string): void {
  if (typeof document === 'undefined') return
  const t = tenantId?.trim().toLowerCase()
  if (!t || t === K2_FAMILIE_DEFAULT_TENANT) return
  if (!isValidFamilieTenantId(t)) return
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(t)}; Path=/; Max-Age=${MAX_AGE_SEC}; SameSite=Lax${secure}`
}
