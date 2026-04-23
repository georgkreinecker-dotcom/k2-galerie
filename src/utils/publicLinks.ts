import { APP_BASE_URL, APP_BASE_URL_SHAREABLE } from '../config/externalUrls'
import { K2_FAMILIE_WILLKOMMEN_ROUTE, PROJECT_ROUTES } from '../config/navigation'
import { buildQrUrlWithBust } from '../hooks/useServerBuildTimestamp'

export type PublicTenant = 'k2' | 'oeffentlich' | 'vk2'
export type PublicViewMode = 'galerie' | 'vorschau'

export function getPublicGaleriePath(tenant: PublicTenant, mode: PublicViewMode): string {
  if (tenant === 'vk2') {
    return mode === 'vorschau' ? '/projects/vk2/galerie-vorschau' : '/projects/vk2/galerie'
  }
  if (tenant === 'oeffentlich') {
    return mode === 'vorschau' ? '/galerie-oeffentlich-vorschau' : '/galerie-oeffentlich'
  }
  return mode === 'vorschau' ? '/galerie-vorschau' : '/galerie'
}

/** Absolute Produktions-URL (für Teilen/QR) – nie localhost. */
export function getPublicGalerieUrl(tenant: PublicTenant, mode: PublicViewMode): string {
  return `${APP_BASE_URL}${getPublicGaleriePath(tenant, mode)}`
}

/**
 * Standard für QR/Teilen-Links:
 * - Version = Server-Stand (useQrVersionTimestamp)
 * - Bust pro Erzeugung (Date.now) gegen CDN/Browser-Cache
 */
export function getPublicGalerieUrlWithBust(tenant: PublicTenant, mode: PublicViewMode, versionTimestamp: number): string {
  return buildQrUrlWithBust(getPublicGalerieUrl(tenant, mode), versionTimestamp)
}

/** Öffentlicher Einstieg K2 Familie (Flyer/QR) – für Teilen nie localhost. */
export function getPublicK2FamilieMusterEntryUrl(): string {
  return `${APP_BASE_URL}${K2_FAMILIE_WILLKOMMEN_ROUTE}`
}

/** Meine-Familie-Start (kanonisch, für canonicalPublicUrl bei Teilen) – Handy-tauglich, kein reiner Localhost. */
export function getPublicK2FamilieMeineFamilieUrl(): string {
  return `${APP_BASE_URL_SHAREABLE}${PROJECT_ROUTES['k2-familie'].meineFamilie}`
}

/**
 * Admin-Einstieg für Lizenz-QR: kanonische URL, Query z. B. tenantId bleibt erhalten.
 * Relatives `input` wird gegen `baseOrigin` aufgelöst (Browser oder Fallback-Host).
 */
export function normalizeLicenseeAdminUrl(input: string, baseOrigin?: string): string {
  const raw = (input || '').trim()
  if (!raw) return ''
  const fallbackOrigin =
    baseOrigin ||
    (typeof window !== 'undefined' ? window.location.origin : 'https://k2-galerie.vercel.app')
  try {
    const u = new URL(raw, fallbackOrigin)
    const path = (u.pathname || '/').replace(/\/+$/, '') || '/'
    if (path.toLowerCase().endsWith('/admin')) {
      return `${u.origin}${path}${u.search}`
    }
    return `${u.origin}/admin${u.search}`
  } catch {
    return raw
  }
}

export function getLicenseeAdminQrTargetUrl(adminUrl: string, versionTimestamp: number, baseOrigin?: string): string {
  return buildQrUrlWithBust(normalizeLicenseeAdminUrl(adminUrl, baseOrigin), versionTimestamp)
}

