/**
 * APf (localhost): „Meine Familie“ soll die echte Stammfamilie (z. B. Kreinecker) wählen,
 * nicht die Musterfamilie Huber.
 * **Gleiche Mandanten-Priorität wie Präsentation/Stammbaum-Links:** zuerst Build-Env
 * (`k2FamilieKreineckerStammbaumQuelle`), sonst Suche per Anzeigename (kreinecker + stamm|alkoven).
 */

import { resolveKreineckerPresentationTenantIdFromEnv } from '../data/k2FamilieKreineckerStammbaumQuelle'
import { FAMILIE_HUBER_TENANT_ID } from '../data/k2FamilieMusterHuberQuelle'
import { loadEinstellungen, K2_FAMILIE_DEFAULT_TENANT } from '../utils/familieStorage'

const STORAGE_LIST = 'k2-familie-tenant-list'

function loadTenantIdsFromStorage(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_LIST)
    if (!raw) return [K2_FAMILIE_DEFAULT_TENANT]
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [K2_FAMILIE_DEFAULT_TENANT]
  } catch {
    return [K2_FAMILIE_DEFAULT_TENANT]
  }
}

export function isK2FamilieApfLocalhost(): boolean {
  if (typeof window === 'undefined') return false
  const h = window.location.hostname
  return h === 'localhost' || h === '127.0.0.1'
}

/**
 * Mandanten-ID für Georgs Stammfamilie auf der APf.
 * 1) Dasselbe wie Präsentation: `resolveKreineckerPresentationTenantIdFromEnv` (KREINECKER_STAMMBAUM, dann APF_MEINE_FAMILIE)
 * 2) Erster Eintrag, dessen familyDisplayName „Kreinecker“ und „Stamm“ oder „Alkoven“ enthält
 */
export function resolveApfMeineFamilieTenantId(): string | null {
  const fromEnv = resolveKreineckerPresentationTenantIdFromEnv()
  if (fromEnv) return fromEnv
  const ids = loadTenantIdsFromStorage()
  for (const id of ids) {
    if (id === FAMILIE_HUBER_TENANT_ID || id === K2_FAMILIE_DEFAULT_TENANT) continue
    const name = loadEinstellungen(id).familyDisplayName?.toLowerCase() ?? ''
    if (name.includes('kreinecker') && (name.includes('stamm') || name.includes('alkoven'))) {
      return id
    }
  }
  return null
}
