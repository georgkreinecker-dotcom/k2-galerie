/**
 * K2 Familie – gespeicherte Rolle pro Familie (Tenant).
 * - localStorage: bleibt auf diesem Browser/Gerät erhalten (Inhaber:in muss nicht nach jedem Besuch neu wählen).
 * - sessionStorage: Spiegel für den Tab; alte reine Session-Werte werden beim Laden nach local migriert.
 * Später ersetzbar durch Server-Claims.
 */

import type { K2FamilieRolle } from '../types/k2FamilieRollen'

const PREFIX = 'k2-familie-rolle-'
const LOCAL_PREFIX = 'k2-familie-rolle-local-'

function isValidRolle(s: string | null): s is K2FamilieRolle {
  return s === 'inhaber' || s === 'bearbeiter' || s === 'leser'
}

export function loadFamilieRolleForTenant(tenantId: string): K2FamilieRolle {
  const sessionKey = PREFIX + tenantId
  const localKey = LOCAL_PREFIX + tenantId
  try {
    const fromLocal = localStorage.getItem(localKey)
    if (fromLocal && isValidRolle(fromLocal)) {
      try {
        sessionStorage.setItem(sessionKey, fromLocal)
      } catch {
        /* ignore */
      }
      return fromLocal
    }
    const fromSession = sessionStorage.getItem(sessionKey)
    if (fromSession && isValidRolle(fromSession)) {
      try {
        localStorage.setItem(localKey, fromSession)
      } catch {
        /* ignore */
      }
      return fromSession
    }
  } catch {
    /* ignore */
  }
  /**
   * Ohne gespeicherte Wahl: **Inhaber:in** – wer die Familie zuerst öffnet, richtet sie typischerweise ein.
   * Leser:in / Bearbeiter:in explizit in Einstellungen wählen (familienintern).
   * Früher Default „leser“ → wirkte wie falsch zugeordnet, obwohl die Arbeit die der Inhaber:in passte.
   */
  return 'inhaber'
}

export function saveFamilieRolleForTenant(tenantId: string, rolle: K2FamilieRolle): void {
  try {
    sessionStorage.setItem(PREFIX + tenantId, rolle)
    localStorage.setItem(LOCAL_PREFIX + tenantId, rolle)
  } catch (e) {
    console.error('familieRollenStorage: speichern fehlgeschlagen', e)
  }
}
