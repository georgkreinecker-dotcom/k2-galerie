/**
 * Leitstruktur-Panel (linkes „Smart Panel“): nur auf der **APf** für Inhaber:in (Entwicklung).
 * In der **Lizenzversion** (Produktion, PWA, QR) sehen es weder Mitglieder noch Inhaber:innen.
 */
import type { FamilieRollenCapabilities } from '../types/k2FamilieRollen'
import { isK2FamilieApfArbeitsplattform } from '../config/k2FamilieApfDefaults'
import { isFamilieEinladungNurZugangAnsicht } from './familieEinladungPending'

const K2_FAMILIE_MITGLIEDER_APP_UI_KEY = 'k2-familie-mitglieder-app-ui'

const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000

type MitgliederAppUiSession = { t: string; createdAt: number }

export function setFamilieMitgliederAppUiSession(tenantId: string): void {
  if (typeof window === 'undefined') return
  const t = tenantId.trim().toLowerCase()
  if (!t) return
  try {
    const payload: MitgliederAppUiSession = { t, createdAt: Date.now() }
    sessionStorage.setItem(K2_FAMILIE_MITGLIEDER_APP_UI_KEY, JSON.stringify(payload))
  } catch {
    /* ignore */
  }
}

export function clearFamilieMitgliederAppUiSession(): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(K2_FAMILIE_MITGLIEDER_APP_UI_KEY)
  } catch {
    /* ignore */
  }
}

export function isFamilieMitgliederAppUiSession(tenantId: string): boolean {
  if (typeof window === 'undefined') return false
  const tid = tenantId.trim().toLowerCase()
  if (!tid) return false
  try {
    const raw = sessionStorage.getItem(K2_FAMILIE_MITGLIEDER_APP_UI_KEY)
    if (!raw) return false
    const p = JSON.parse(raw) as MitgliederAppUiSession
    if (!p.t || p.t !== tid) return false
    if (!p.createdAt || Date.now() - p.createdAt > MAX_AGE_MS) {
      sessionStorage.removeItem(K2_FAMILIE_MITGLIEDER_APP_UI_KEY)
      return false
    }
    return true
  } catch {
    return false
  }
}

export function shouldShowFamilieLeitstrukturPanel(opts: {
  capabilities: FamilieRollenCapabilities
  tenantId: string
  nurMitgliedEinstieg: boolean
  huberNurMusterBesuch: boolean
}): boolean {
  if (!isK2FamilieApfArbeitsplattform()) return false
  if (opts.nurMitgliedEinstieg || opts.huberNurMusterBesuch) return false
  if (!opts.capabilities.canManageFamilienInstanz) return false
  if (isFamilieMitgliederAppUiSession(opts.tenantId)) return false
  if (isFamilieEinladungNurZugangAnsicht(opts.tenantId)) return false
  return true
}
