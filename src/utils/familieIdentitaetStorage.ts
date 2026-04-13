/**
 * K2 Familie – Identität für diese Browser-Sitzung bestätigt (persönlicher Code korrekt eingegeben
 * oder „Du“ von Inhaber:in gesetzt). Pro Tenant in sessionStorage; ersetzbar durch Server-Claims.
 */

const PREFIX = 'k2-familie-identitaet-'

export function loadIdentitaetBestaetigt(tenantId: string): string | null {
  try {
    const raw = sessionStorage.getItem(PREFIX + tenantId)?.trim()
    return raw || null
  } catch {
    return null
  }
}

export function setIdentitaetBestaetigt(tenantId: string, personId: string): void {
  const id = personId?.trim()
  if (!id) return
  try {
    sessionStorage.setItem(PREFIX + tenantId, id)
  } catch {
    /* ignore */
  }
}

export function clearIdentitaetBestaetigt(tenantId: string): void {
  try {
    sessionStorage.removeItem(PREFIX + tenantId)
  } catch {
    /* ignore */
  }
}
