/**
 * K2 Familie – Identität für diese Browser-Sitzung bestätigt (persönlicher Code korrekt eingegeben
 * oder „Du“ von Inhaber:in gesetzt). Pro Tenant in sessionStorage; ersetzbar durch Server-Claims.
 *
 * Optional: **Geräte-Vertrauen** (localStorage) – derselbe Browser merkt sich nach einmaliger
 * Code-Bestätigung einen Fingerabdruck (SHA-256, kein Klartext), damit nach neuem Tab/Sitzung
 * nicht jedes Mal neu eingegeben werden muss. Wechsel des persönlichen Codes auf der Karte
 * oder von „Du“ invalidiert das Vertrauen.
 */

const PREFIX = 'k2-familie-identitaet-'
const DEVICE_ID_KEY = 'k2-familie-geraet-id'
/** Pro Tenant: { v, deviceId, personId, fp } – fp = SHA-256(tenant|person|device|codeNorm) */
const GERAT_TRUST_PREFIX = 'k2-familie-identitaet-geraet-v1-'

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

/** Stabile ID pro Browser-Profil (localStorage). */
export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return 'ssr'
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY)?.trim()
    if (!id) {
      id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : 'd-' + Date.now() + '-' + Math.random().toString(36).slice(2, 12)
      localStorage.setItem(DEVICE_ID_KEY, id)
    }
    return id
  } catch {
    return 'unknown'
  }
}

function normCodeFingerprint(raw: string): string {
  return String(raw ?? '').trim().toLowerCase()
}

async function sha256Hex(text: string): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throw new Error('crypto.subtle nicht verfügbar')
  }
  const enc = new TextEncoder().encode(text)
  const buf = await crypto.subtle.digest('SHA-256', enc)
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/** Für Tests / intern: gleicher String wie bei save/verify. */
export async function buildIdentitaetFingerprint(
  tenantId: string,
  personId: string,
  deviceId: string,
  normalizedCode: string
): Promise<string> {
  const payload = `${tenantId}|${personId}|${deviceId}|${normalizedCode}`
  return sha256Hex(payload)
}

/** Nach erfolgreicher Code-Eingabe: Vertrauen für dieses Gerät speichern. */
export async function saveGerateVertrauen(
  tenantId: string,
  personId: string,
  codeEingegeben: string
): Promise<void> {
  if (typeof window === 'undefined') return
  const id = personId?.trim()
  const norm = normCodeFingerprint(codeEingegeben)
  if (!id || !norm) return
  const deviceId = getOrCreateDeviceId()
  if (deviceId === 'unknown' || deviceId === 'ssr') return
  try {
    const fp = await buildIdentitaetFingerprint(tenantId, id, deviceId, norm)
    localStorage.setItem(GERAT_TRUST_PREFIX + tenantId, JSON.stringify({ v: 1, deviceId, personId: id, fp }))
  } catch {
    /* ignore */
  }
}

export function clearGerateVertrauen(tenantId: string): void {
  try {
    localStorage.removeItem(GERAT_TRUST_PREFIX + tenantId)
  } catch {
    /* ignore */
  }
}

/**
 * Wenn session leer, aber Gerät + gespeicherter Fingerabdruck zum aktuellen Code auf der Karte passen:
 * setzt session-Identität und gibt true zurück.
 */
export async function tryRestoreIdentitaetFromGerat(
  tenantId: string,
  ichPersonId: string,
  codeAufDuKarte: string
): Promise<boolean> {
  if (typeof window === 'undefined') return false
  const ich = ichPersonId?.trim()
  const normKarte = normCodeFingerprint(codeAufDuKarte)
  if (!ich || !normKarte) return false
  if (loadIdentitaetBestaetigt(tenantId) === ich) return true

  let raw: string | null = null
  try {
    raw = localStorage.getItem(GERAT_TRUST_PREFIX + tenantId)
  } catch {
    return false
  }
  if (!raw) return false

  let parsed: { v?: number; deviceId?: string; personId?: string; fp?: string }
  try {
    parsed = JSON.parse(raw)
  } catch {
    return false
  }
  if (parsed.v !== 1 || !parsed.fp || !parsed.personId) return false

  const deviceId = getOrCreateDeviceId()
  if (parsed.deviceId !== deviceId || parsed.personId !== ich) return false

  try {
    const expect = await buildIdentitaetFingerprint(tenantId, ich, deviceId, normKarte)
    if (expect !== parsed.fp) return false
  } catch {
    return false
  }

  setIdentitaetBestaetigt(tenantId, ich)
  return true
}
