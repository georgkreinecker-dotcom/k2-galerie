import { APP_BASE_URL } from '../config/externalUrls'
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

