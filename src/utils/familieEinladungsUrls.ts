/**
 * EINZIGE Quelle: Einladungs-URLs für K2 Familie (Mitglieder-QR, Briefe, Einstellungen-Texte).
 * Parameter müssen exakt zu FamilieEinladungQuerySync passen: ?t= &z= &m= (persönlich), optional &fn= (Anzeigename).
 * t in URLs immer kleingeschrieben (wie im Sync); m immer trimMitgliedsNummerEingabe.
 * @see src/components/FamilieEinladungQuerySync.tsx
 */
import { APP_BASE_URL_SHAREABLE } from '../config/externalUrls'
import { PROJECT_ROUTES } from '../config/navigation'
import { buildQrUrlWithVersionOnly } from '../hooks/useServerBuildTimestamp'
import { trimMitgliedsNummerEingabe } from './familieMitgliedsNummer'

const R = PROJECT_ROUTES['k2-familie']

function meineFamilieAbsUrl(): string {
  return `${APP_BASE_URL_SHAREABLE}${R.meineFamilie}`
}

export function normalizeTenantIdForEinladungUrl(tenantId: string): string {
  return tenantId.trim().toLowerCase()
}

/**
 * Familien-Einstieg (t + z, optional Anzeigename) – kein persönliches m.
 * Für: allgemeine Links, Muster, „Einstieg für alle“ in Mustertexten.
 */
export function buildFamilieEinladungsUrlKurz(
  tenantId: string,
  familienZ: string,
  familyDisplayName?: string,
): string {
  const z = familienZ.trim()
  if (!z) return ''
  const t = normalizeTenantIdForEinladungUrl(tenantId)
  const base = new URL(meineFamilieAbsUrl())
  base.searchParams.set('t', t)
  base.searchParams.set('z', z)
  const fn = (familyDisplayName ?? '').trim()
  if (fn) base.searchParams.set('fn', fn)
  return base.toString()
}

/**
 * Persönlicher Einladungslink (t + z + m, optional fn wie bei Familien-Link) – Druck, Liste, URL ohne v=.
 * Kurz = weniger Zeichen auf Papier; gleicher Inhalt wie Scan ohne v=.
 */
export function buildPersoenlicheEinladungsUrlKurz(
  tenantId: string,
  familienZ: string,
  mitgliedsNummer: string,
  familyDisplayName?: string,
): string {
  const z = familienZ.trim()
  const m = trimMitgliedsNummerEingabe(mitgliedsNummer)
  if (!z || !m) return ''
  const t = normalizeTenantIdForEinladungUrl(tenantId)
  const base = new URL(meineFamilieAbsUrl())
  base.searchParams.set('t', t)
  base.searchParams.set('z', z)
  base.searchParams.set('m', m)
  const fn = (familyDisplayName ?? '').trim()
  if (fn) base.searchParams.set('fn', fn)
  return base.toString()
}

/**
 * Persönliche Einladung für QR-Scan: Server-Stand v=, kurze URL (eine Regel mit useServerBuildTimestamp).
 */
export function buildPersoenlicheEinladungsUrlScan(
  tenantId: string,
  familienZ: string,
  mitgliedsNummer: string,
  versionTimestamp: number,
  familyDisplayName?: string,
): string {
  const canonical = buildPersoenlicheEinladungsUrlKurz(tenantId, familienZ, mitgliedsNummer, familyDisplayName)
  if (!canonical) return ''
  return buildQrUrlWithVersionOnly(canonical, versionTimestamp)
}

/**
 * Familien-QR (nur t+z+optional fn) mit Server-Stand – für Scans, nicht persönliches m.
 */
export function buildFamilieEinladungsUrlScan(
  tenantId: string,
  familienZ: string,
  familyDisplayName: string | undefined,
  versionTimestamp: number,
): string {
  const canonical = buildFamilieEinladungsUrlKurz(tenantId, familienZ, familyDisplayName)
  if (!canonical) return ''
  return buildQrUrlWithVersionOnly(canonical, versionTimestamp)
}
