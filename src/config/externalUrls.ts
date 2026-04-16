/**
 * Zentrale Konfiguration aller externen URLs (eigene Plattform + Drittanbieter).
 * Keine neuen hardcoded externen URLs im Rest des Codes – hier oder Env.
 * Siehe: docs/EXTERNE-VERBINDUNGEN.md
 */

const env: Record<string, unknown> =
  typeof import.meta !== 'undefined' && import.meta.env ? (import.meta.env as Record<string, unknown>) : {}

/** Fallback für öffentlich teilbare Links (QR, Einladung), wenn Dev-URL nicht vom Handy erreichbar ist. */
const DEFAULT_PUBLIC_APP_URL = 'https://k2-galerie.vercel.app'

function isLocalhostAppBase(url: string): boolean {
  try {
    const h = new URL(url).hostname
    return h === 'localhost' || h === '127.0.0.1' || h === '[::1]'
  } catch {
    return false
  }
}

/** Basis-URL der App (Produktion / Self-Host). Env: VITE_APP_BASE_URL */
export const APP_BASE_URL =
  typeof env.VITE_APP_BASE_URL === 'string' && (env.VITE_APP_BASE_URL as string).trim()
    ? (env.VITE_APP_BASE_URL as string).replace(/\/$/, '')
    : DEFAULT_PUBLIC_APP_URL

/**
 * Für QR und Einladungslinks (K2 Familie, getrennt von lokalem Browser).
 * Wenn VITE_APP_BASE_URL auf localhost zeigt, würde ein zweites Handy den Link nicht erreichen –
 * dann fällt die URL auf die öffentliche Vercel-App zurück.
 */
export const APP_BASE_URL_SHAREABLE = isLocalhostAppBase(APP_BASE_URL) ? DEFAULT_PUBLIC_APP_URL : APP_BASE_URL

/** URL für Build-Info (Stand-Check, QR). Gleicher Host wie App. */
export const BUILD_INFO_URL = `${APP_BASE_URL}/build-info.json`

/** Basis für gallery-data / Veröffentlichung (gleicher Host). */
export const GALLERY_DATA_BASE_URL = APP_BASE_URL

/** Externe QR-Code-API (Bilder). Bei Skalierung: durch eigene Generierung ersetzen. */
export const QR_SERVER_API_BASE = 'https://api.qrserver.com/v1/create-qr-code'

/** Google Fonts (Marketing/Werbelinie). Optional selbst hosten. */
export const FONTS_GOOGLE_APIS = 'https://fonts.googleapis.com'

/** Unsplash (nur Seed/Muster – echte Mandanten nutzen eigene Bilder). */
export const UNSPLASH_IMAGES_BASE = 'https://images.unsplash.com'
