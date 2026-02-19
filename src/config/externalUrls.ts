/**
 * Zentrale Konfiguration aller externen URLs (eigene Plattform + Drittanbieter).
 * Keine neuen hardcoded externen URLs im Rest des Codes – hier oder Env.
 * Siehe: docs/EXTERNE-VERBINDUNGEN.md
 */

const env: Record<string, unknown> =
  typeof import.meta !== 'undefined' && import.meta.env ? (import.meta.env as Record<string, unknown>) : {}

/** Basis-URL der App (Produktion / Self-Host). Env: VITE_APP_BASE_URL */
export const APP_BASE_URL =
  typeof env.VITE_APP_BASE_URL === 'string' && (env.VITE_APP_BASE_URL as string).trim()
    ? (env.VITE_APP_BASE_URL as string).replace(/\/$/, '')
    : 'https://k2-galerie.vercel.app'

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
