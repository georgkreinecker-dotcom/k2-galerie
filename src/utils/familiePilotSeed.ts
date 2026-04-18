/**
 * Testpilot K2 Familie: eigene Tenant-ID + Familien-Zugangsnummer (kein Huber).
 * QR/Willkommen mit ?t=familie-pilot-…&z=KF-TP-…&fn=… → einmalig minimale Familie anlegen.
 */

import type { K2FamiliePerson } from '../types/k2Familie'
import {
  loadEinstellungen,
  loadPersonen,
  saveEinstellungen,
  savePersonen,
} from './familieStorage'
import { assignMissingMitgliedsNummern } from './familieMitgliedsNummer'
import { setIdentitaetBestaetigt } from './familieIdentitaetStorage'

export const FAMILIE_PILOT_TENANT_PREFIX = 'familie-pilot-'

export function isFamiliePilotTenantId(id: string): boolean {
  const t = id?.trim().toLowerCase()
  return Boolean(t && t.startsWith(FAMILIE_PILOT_TENANT_PREFIX))
}

/** Nur Ziffern aus Zettel-Nr.; Fallback 1. Ergebnis: gültige familie-tenant-id-Komponente. */
export function sanitizePilotZettelNr(nr: string): string {
  const d = (nr || '').replace(/\D/g, '')
  return d.length > 0 ? d : '1'
}

export function buildFamiliePilotTenantIdFromZettelNr(zettelNr: string): string {
  return `${FAMILIE_PILOT_TENANT_PREFIX}${sanitizePilotZettelNr(zettelNr)}`
}

/** Familien-Zugangsnummer für den Zettel (einheitlich zum QR-Parameter z). */
export function buildFamiliePilotFamilienZugang(zettelNr: string): string {
  const y = new Date().getFullYear()
  const n = sanitizePilotZettelNr(zettelNr)
  return `KF-TP-${y}-${n.padStart(4, '0')}`
}

/**
 * Vollständige Willkommen-URL inkl. Einladungs-Parameter (BASE_APP_URL + K2_FAMILIE_WILLKOMMEN_ROUTE).
 */
export function buildFamiliePilotWillkommenUrl(baseWillkommenUrl: string, pilotName: string, zettelNr: string): string {
  const tenantId = buildFamiliePilotTenantIdFromZettelNr(zettelNr)
  const z = buildFamiliePilotFamilienZugang(zettelNr)
  const fn = (pilotName || '').trim().slice(0, 240)
  const params = new URLSearchParams()
  params.set('t', tenantId)
  params.set('z', z)
  if (fn) params.set('fn', fn)
  const sep = baseWillkommenUrl.includes('?') ? '&' : '?'
  return `${baseWillkommenUrl}${sep}${params.toString()}`
}

const PILOT_INHABER_PERSON_ID = 'pilot-inhaber'

/**
 * Legt eine minimale Test-Familie an (eine Person = Inhaber:in + Du), wenn noch keine Personen existieren.
 * @returns true wenn gespeichert oder bereits vorhanden
 */
export function seedFamiliePilotIfNeeded(
  tenantId: string,
  opts: { familienZugang: string; familyDisplayName: string },
): boolean {
  if (!isFamiliePilotTenantId(tenantId)) return false
  const z = opts.familienZugang?.trim()
  const fn = opts.familyDisplayName?.trim()
  if (!z || !fn) return false

  if (loadPersonen(tenantId).length > 0) return true

  const now = new Date().toISOString()
  const vorname = fn.split(/\s+/)[0] || fn.slice(0, 40)
  const person: K2FamiliePerson = {
    id: PILOT_INHABER_PERSON_ID,
    name: vorname || 'Pilot',
    shortText: 'Testpilot:in – eigene Familie. Stammbaum und weitere Personen kannst du als Inhaber:in anlegen.',
    parentIds: [],
    childIds: [],
    partners: [],
    siblingIds: [],
    wahlfamilieIds: [],
    createdAt: now,
    updatedAt: now,
  }
  const personen = assignMissingMitgliedsNummern([person], PILOT_INHABER_PERSON_ID)
  if (!savePersonen(tenantId, personen, { allowReduce: true })) return false

  const einst = loadEinstellungen(tenantId)
  if (
    !saveEinstellungen(tenantId, {
      ...einst,
      familyDisplayName: fn.slice(0, 240),
      mitgliedsNummerAdmin: z,
      ichBinPersonId: PILOT_INHABER_PERSON_ID,
      inhaberPersonId: PILOT_INHABER_PERSON_ID,
      startpunktTyp: 'ich',
    })
  ) {
    return false
  }
  setIdentitaetBestaetigt(tenantId, PILOT_INHABER_PERSON_ID)
  return true
}
