/**
 * Wenn der Einladungs-QR (?t=&z=&m=) den persönlichen Code nicht sofort zuordnen kann
 * (langsames Netz, leeres Gerät, Supabase verzögert), bleibt der Kontext in sessionStorage –
 * „Meine Familie“ kann erneut versuchen und den Code vorbefüllen.
 */

import { trimMitgliedsNummerEingabe } from './familieMitgliedsNummer'

export const K2_FAMILIE_EINLADUNG_PENDING_KEY = 'k2-familie-einladung-pending'
export const K2_FAMILIE_EINLADUNG_PENDING_EVENT = 'k2-familie-einladung-pending'

const MAX_AGE_MS = 15 * 60 * 1000

export type FamilieEinladungPending = {
  t?: string
  z?: string
  /** Persönlicher Code; optional nur bei reinem Tenant-Fehler ohne m in der URL */
  m?: string
  fn?: string
  /** z. B. wenn ?t= ungültig war */
  tenantInvalid?: boolean
  createdAt: number
}

export function getFamilieEinladungPending(): FamilieEinladungPending | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(K2_FAMILIE_EINLADUNG_PENDING_KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as FamilieEinladungPending
    const hasM = typeof p.m === 'string' && p.m.trim().length > 0
    // Ohne persönlichen Code nur behalten, wenn z. B. ?t= ungültig war (manuelle Korrektur möglich)
    if (!p.tenantInvalid && !hasM) {
      sessionStorage.removeItem(K2_FAMILIE_EINLADUNG_PENDING_KEY)
      return null
    }
    if (!p.createdAt || Date.now() - p.createdAt > MAX_AGE_MS) {
      sessionStorage.removeItem(K2_FAMILIE_EINLADUNG_PENDING_KEY)
      return null
    }
    return p
  } catch {
    try {
      sessionStorage.removeItem(K2_FAMILIE_EINLADUNG_PENDING_KEY)
    } catch {
      /* ignore */
    }
    return null
  }
}

export function setFamilieEinladungPending(
  partial: Omit<FamilieEinladungPending, 'createdAt'> & { createdAt?: number },
): void {
  if (typeof window === 'undefined') return
  try {
    const mTrim = typeof partial.m === 'string' ? partial.m.trim() : ''
    const p: FamilieEinladungPending = {
      ...partial,
      ...(mTrim ? { m: mTrim } : {}),
      createdAt: partial.createdAt ?? Date.now(),
    }
    sessionStorage.setItem(K2_FAMILIE_EINLADUNG_PENDING_KEY, JSON.stringify(p))
    window.dispatchEvent(new CustomEvent(K2_FAMILIE_EINLADUNG_PENDING_EVENT, { detail: p }))
  } catch {
    /* Session blockiert o. Ä. */
  }
}

export function clearFamilieEinladungPending(): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(K2_FAMILIE_EINLADUNG_PENDING_KEY)
  } catch {
    /* ignore */
  }
}

const K2_FAMILIE_FAMILIE_QR_KOMPAKT_KEY = 'k2-familie-familien-qr-kompakt'

type FamilieFamilienQrKompakt = { t: string; createdAt: number }

/** Nach Scan der allgemeinen Familien-QR (nur ?t=&z=): kompakte Ansicht bis „Du“ – Session überlebt URL-Strip. */
export function setFamilieFamilienQrKompaktSession(tenantId: string): void {
  if (typeof window === 'undefined') return
  const t = tenantId.trim().toLowerCase()
  if (!t) return
  try {
    const payload: FamilieFamilienQrKompakt = { t, createdAt: Date.now() }
    sessionStorage.setItem(K2_FAMILIE_FAMILIE_QR_KOMPAKT_KEY, JSON.stringify(payload))
    window.dispatchEvent(new CustomEvent(K2_FAMILIE_EINLADUNG_PENDING_EVENT, { detail: { familienQrKompakt: true } }))
  } catch {
    /* ignore */
  }
}

export function clearFamilieFamilienQrKompaktSession(): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(K2_FAMILIE_FAMILIE_QR_KOMPAKT_KEY)
  } catch {
    /* ignore */
  }
}

export function isFamilieFamilienQrKompaktSession(tenantId: string): boolean {
  if (typeof window === 'undefined') return false
  const tid = tenantId.trim().toLowerCase()
  if (!tid) return false
  try {
    const raw = sessionStorage.getItem(K2_FAMILIE_FAMILIE_QR_KOMPAKT_KEY)
    if (!raw) return false
    const p = JSON.parse(raw) as FamilieFamilienQrKompakt
    if (!p.t || p.t !== tid) return false
    if (!p.createdAt || Date.now() - p.createdAt > MAX_AGE_MS) {
      sessionStorage.removeItem(K2_FAMILIE_FAMILIE_QR_KOMPAKT_KEY)
      return false
    }
    return true
  } catch {
    return false
  }
}

/**
 * Einladungs-QR mit persönlichem Code (m=) oder Pending – noch nicht die volle Inhaber-„Erst-Einrichtung“
 * zeigen (Default-Rolle ist inhaber; ohne „Du“ wäre sonst die ganze Homepage sichtbar).
 */
export function isFamilieEinladungPersonalCodeOffen(_tenantId: string): boolean {
  if (typeof window === 'undefined') return false
  const p = getFamilieEinladungPending()
  if (p?.tenantInvalid) return true
  // Persönlicher Code in Pending: auch wenn p.t noch nicht zum aktuellen Context passt (Mandant wird gerade umgestellt).
  if (p?.m?.trim()) return true
  try {
    const sp = new URLSearchParams(window.location.search)
    const m = trimMitgliedsNummerEingabe(sp.get('m') ?? '')
    if (!m) return false
    // Nach Scan: ?m=…&t=… – Erst-Render oft noch alter Mandant im Context (t ≠ Context) → trotzdem nur Einladungs-Ansicht.
    return true
  } catch {
    /* ignore */
  }
  return false
}

/**
 * Kompakte Nur-Zugangs-Ansicht: persönlicher Einladungs-QR **oder** allgemeine Familien-QR (?z=),
 * solange die URL noch Parameter hat bzw. die Familien-QR-Session gesetzt ist (nach Strip).
 */
export function isFamilieEinladungNurZugangAnsicht(tenantId: string): boolean {
  if (isFamilieEinladungPersonalCodeOffen(tenantId)) return true
  if (typeof window === 'undefined') return false
  try {
    const sp = new URLSearchParams(window.location.search)
    if (sp.get('z')?.trim()) return true
  } catch {
    /* ignore */
  }
  return isFamilieFamilienQrKompaktSession(tenantId)
}
