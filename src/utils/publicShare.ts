import { APP_BASE_URL_SHAREABLE } from '../config/externalUrls'

const SHAREABLE_ORIGIN = APP_BASE_URL_SHAREABLE.replace(/\/$/, '')

/** Hostname, den Empfänger (WhatsApp, Mail, anderes Netz) nicht erreichen. */
export function isPrivateHostname(hostname: string): boolean {
  const h = String(hostname || '').toLowerCase()
  if (!h) return false
  if (h === 'localhost' || h === '127.0.0.1' || h === '[::1]') return true
  if (h.startsWith('192.168.') || h.startsWith('10.')) return true
  return /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(h)
}

/** Gemeinsam für Teilen/QR: lokaler Dev-Server liefert nie erreichbare Links fürs Handy. */
export function isLocalOrPrivateOrigin(): boolean {
  if (typeof window === 'undefined') return false
  return isPrivateHostname(window.location.hostname)
}

function splitPathSearchHash(raw: string): { pathname: string; search: string; hash: string } {
  const trimmed = String(raw || '').trim()
  if (!trimmed) {
    if (typeof window === 'undefined') return { pathname: '/', search: '', hash: '' }
    return {
      pathname: window.location.pathname || '/',
      search: window.location.search || '',
      hash: window.location.hash || '',
    }
  }
  try {
    const u = /^https?:\/\//i.test(trimmed)
      ? new URL(trimmed)
      : new URL(trimmed.startsWith('/') ? trimmed : `/${trimmed}`, 'https://k2-galerie.vercel.app')
    return { pathname: u.pathname || '/', search: u.search || '', hash: u.hash || '' }
  } catch {
    const p = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
    return { pathname: p, search: '', hash: '' }
  }
}

/**
 * Absolute URL zum Versenden (WhatsApp, Mail, QR, Link kopieren) – immer öffentlich erreichbar.
 * Lokal arbeiten (localhost) + öffentlich versenden = eine Funktion, überall.
 * API/iframe/Druck auf demselben Gerät: nicht hier – dort bleibt die aktuelle Origin.
 */
export function getShareableAppUrl(pathOrUrl: string): string {
  const raw = (pathOrUrl || '').trim()
  if (/^https?:\/\//i.test(raw)) {
    try {
      const u = new URL(raw)
      if (!isPrivateHostname(u.hostname)) return raw
    } catch {
      /* unten als Pfad behandeln */
    }
  }
  const { pathname, search, hash } = splitPathSearchHash(raw)
  const origin =
    typeof window !== 'undefined' && !isLocalOrPrivateOrigin()
      ? window.location.origin
      : SHAREABLE_ORIGIN
  return `${origin}${pathname}${search}${hash}`
}

/**
 * Text für PDF-/Datei-Versand (Share-Sheet, Mail-Body): Titel + öffentlicher Link.
 * Druck/Speichern auf dem Gerät braucht das nicht – nur Versenden.
 */
export function buildShareTextWithPublicLink(title: string, pathOrUrl: string): string {
  const t = String(title || '').trim() || 'Dokument'
  const link = getShareableAppUrl(pathOrUrl)
  return `${t}\n${link}`
}
