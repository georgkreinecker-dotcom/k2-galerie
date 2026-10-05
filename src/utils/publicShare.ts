import { APP_BASE_URL_SHAREABLE } from '../config/externalUrls'

/** Gemeinsam für Teilen/QR: lokaler Dev-Server liefert nie erreichbare Links fürs Handy. */
export function isLocalOrPrivateOrigin(): boolean {
  if (typeof window === 'undefined') return false
  const h = window.location.hostname
  return h === 'localhost' || h === '127.0.0.1' || h.startsWith('192.168.') || h.startsWith('10.')
}

/**
 * Absolute URL zum Versenden (WhatsApp, Mail, QR) – immer öffentlich erreichbar.
 * Niemals localhost / privates WLAN (Empfänger käme nicht rein).
 */
export function getShareableAppUrl(path: string): string {
  const base = APP_BASE_URL_SHAREABLE.replace(/\/$/, '')
  const p = (path || '').trim()
  if (!p) return base
  return `${base}${p.startsWith('/') ? p : `/${p}`}`
}
