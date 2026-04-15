/**
 * APf (localhost): „Meine Familie“ soll die echte Stammfamilie (z. B. Kreinecker) wählen,
 * nicht die Musterfamilie Huber. Optional: VITE_K2_FAMILIE_APF_MEINE_FAMILIE_TENANT_ID setzen;
 * sonst wird anhand des Anzeigenamens in den Einstellungen gesucht (kreinecker + stamm|alkoven).
 */

import { loadEinstellungen, K2_FAMILIE_DEFAULT_TENANT, isValidFamilieTenantId } from '../utils/familieStorage'

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
 * 1) VITE_K2_FAMILIE_APF_MEINE_FAMILIE_TENANT_ID (z. B. familie-1738…)
 * 2) Erster Eintrag, dessen familyDisplayName „Kreinecker“ und „Stamm“ oder „Alkoven“ enthält
 */
export function resolveApfMeineFamilieTenantId(): string | null {
  try {
    const env = import.meta.env?.VITE_K2_FAMILIE_APF_MEINE_FAMILIE_TENANT_ID?.trim()
    if (env && isValidFamilieTenantId(env)) {
      return env.toLowerCase()
    }
  } catch {
    /* ignore */
  }
  const ids = loadTenantIdsFromStorage()
  for (const id of ids) {
    if (id === 'huber' || id === K2_FAMILIE_DEFAULT_TENANT) continue
    const name = loadEinstellungen(id).familyDisplayName?.toLowerCase() ?? ''
    if (name.includes('kreinecker') && (name.includes('stamm') || name.includes('alkoven'))) {
      return id
    }
  }
  return null
}
