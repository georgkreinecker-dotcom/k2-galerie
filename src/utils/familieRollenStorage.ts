/**
 * K2 Familie – gespeicherte Rolle pro Familie (Tenant) in der Session.
 * SessionStorage: pro Gerät/Sitzung; später ersetzbar durch Server-Claims.
 */

import type { K2FamilieRolle } from '../types/k2FamilieRollen'

const PREFIX = 'k2-familie-rolle-'

function isValidRolle(s: string | null): s is K2FamilieRolle {
  return s === 'inhaber' || s === 'bearbeiter' || s === 'leser'
}

export function loadFamilieRolleForTenant(tenantId: string): K2FamilieRolle {
  try {
    const raw = sessionStorage.getItem(PREFIX + tenantId)
    if (raw && isValidRolle(raw)) return raw
  } catch {
    /* ignore */
  }
  return 'inhaber'
}

export function saveFamilieRolleForTenant(tenantId: string, rolle: K2FamilieRolle): void {
  try {
    sessionStorage.setItem(PREFIX + tenantId, rolle)
  } catch (e) {
    console.error('familieRollenStorage: speichern fehlgeschlagen', e)
  }
}
