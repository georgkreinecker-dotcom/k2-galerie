/**
 * Ein Mandant = ein tenant_id für /api/visit (Supabase visits).
 * K2 → k2 · ök2-Demo ohne Pilot → oeffentlich · ök2-Pilot → oeffentlich-pilot-{Ziffern} oder oeffentlich-pilot-v-{slug}
 * VK2 ohne Pilot → vk2 · VK2-Pilot → vk2-pilot-{Ziffern}
 */
import { WILLKOMMEN_NAME_KEY, WILLKOMMEN_ENTWURF_KEY } from '../config/navigation'
import { getActiveVk2PilotId, sanitizeVk2PilotIdFromParam } from './vk2StorageKeys'

function slugifyPilotNameForVisit(name: string): string {
  const s = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
  return s || 'pilot'
}

/** Ziffern aus k2-pilot-einladung (ök2: Zettel wie VK2). */
export function getOek2PilotDigitsFromSession(): string | null {
  if (typeof sessionStorage === 'undefined') return null
  try {
    const raw = sessionStorage.getItem('k2-pilot-einladung')
    if (!raw) return null
    const inv = JSON.parse(raw) as {
      context?: string
      zettelNr?: string
      oek2PilotId?: string
    }
    if (inv?.context !== 'oeffentlich') return null
    const z = String(inv.oek2PilotId ?? inv.zettelNr ?? '')
      .replace(/\D/g, '')
      .slice(0, 8)
    return z || null
  } catch {
    return null
  }
}

/** Vorname/Entwurf-Flow (ohne Zettelnummer in Session): stabiler Slug. */
function getOek2VornameSlugFromSession(): string | null {
  if (typeof sessionStorage === 'undefined') return null
  try {
    const e = sessionStorage.getItem(WILLKOMMEN_ENTWURF_KEY)
    if (e !== '1') return null
    const n = sessionStorage.getItem(WILLKOMMEN_NAME_KEY)
    if (!n || !n.trim()) return null
    return slugifyPilotNameForVisit(n)
  } catch {
    return null
  }
}

/**
 * öffentliche ök2-Galerie (GaleriePage musterOnly): genau ein Visit-Tenant pro Mandant.
 */
export function resolveOek2PublicGalleryVisitTenantId(): string {
  const digits = getOek2PilotDigitsFromSession()
  if (digits) return `oeffentlich-pilot-${digits}`
  const slug = getOek2VornameSlugFromSession()
  if (slug) return `oeffentlich-pilot-v-${slug}`
  return 'oeffentlich'
}

/**
 * VK2 öffentliche Galerie (Vk2GaleriePage / GaleriePage vk2): Pilot = eigener Zähler.
 */
export function resolveVk2PublicGalleryVisitTenantId(): string {
  const raw = typeof window !== 'undefined' ? getActiveVk2PilotId() : null
  const sanitized = sanitizeVk2PilotIdFromParam(raw)
  if (sanitized) return `vk2-pilot-${sanitized}`
  return 'vk2'
}
