/**
 * APf als eigene PWA („Zum Home-Bildschirm“) – getrennt von Galerie und K2 Familie.
 * Manifest: `public/manifest-apf.json` (id: k2-apf-pwa, start_url /dev-view).
 */

import { K2_APF_HANDY_QR_PATH } from '../config/navigation'

export const K2_APF_PWA_START_PATH = K2_APF_HANDY_QR_PATH

/** Routen, auf denen das APf-Manifest aktiv ist (Install nur von hier). */
export function isApfPwaPath(pathname: string): boolean {
  const p = (pathname || '/').replace(/\/$/, '') || '/'
  return p === '/dev-view' || p === '/apf' || p === '/mobile-connect'
}
