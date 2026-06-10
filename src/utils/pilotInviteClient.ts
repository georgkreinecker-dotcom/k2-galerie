/**
 * Testpilot-Einladung: Auf der **Plattform** (APf localhost) → POST an Live-API,
 * damit Signatur = Vercel-Production (kein Mac-.env vs. Vercel-Mix).
 * Lizenznehmer-Clone auf eigenem Host: weiter same-origin.
 */
import { isPlatformHostname } from '../config/tenantConfig'
import { BASE_APP_URL } from '../config/navigation'

function trimBase(url: string): string {
  return url.replace(/\/$/, '')
}

/** true wenn Browser-Host typischer Dev-Rechner (localhost / Loopback) */
export function isPilotInviteLocalDevHostname(hostname: string): boolean {
  const h = hostname.toLowerCase()
  return h === 'localhost' || h === '127.0.0.1' || h === '[::1]' || h === '::1'
}

/**
 * POST-Ziel für send-pilot-invite.
 * Plattform + localhost → k2-galerie.vercel.app (ein Ablauf wie „Lizenzen in Live öffnen“).
 */
export function getSendPilotInviteApiUrl(): string {
  if (typeof window === 'undefined') return `${trimBase(BASE_APP_URL)}/api/send-pilot-invite`
  const host = window.location.hostname
  if (isPilotInviteLocalDevHostname(host) && isPlatformHostname(host)) {
    return `${trimBase(BASE_APP_URL)}/api/send-pilot-invite`
  }
  return `${trimBase(window.location.origin)}/api/send-pilot-invite`
}

/** GET-URL: gleiche Basis wie send-pilot-invite (localhost → Production), siehe pilot-invite-mail-status.js */
export function getPilotInviteMailStatusUrl(): string {
  return getSendPilotInviteApiUrl().replace(/\/send-pilot-invite\/?$/, '/pilot-invite-mail-status')
}

/**
 * Basis für Links an externe Empfänger (Testuser-Zettel, mailto, Kopieren).
 * APf auf localhost → immer Production-URL, damit Empfänger nicht localhost im Link haben.
 */
export function getPilotShareLinkBaseUrl(): string {
  if (typeof window === 'undefined') return trimBase(BASE_APP_URL)
  const host = window.location.hostname
  if (isPilotInviteLocalDevHostname(host) && isPlatformHostname(host)) {
    return trimBase(BASE_APP_URL)
  }
  return trimBase(window.location.origin)
}

/** Relativer Pfad oder absolute URL → absolute URL für externe Empfänger (localhost in gespeicherten Links → Vercel). */
export function toAbsolutePilotShareUrl(relativeOrAbsolute: string): string {
  const u = relativeOrAbsolute.trim()
  if (!u) return ''
  if (u.startsWith('http://') || u.startsWith('https://')) {
    try {
      const parsed = new URL(u)
      if (
        isPilotInviteLocalDevHostname(parsed.hostname) &&
        typeof window !== 'undefined' &&
        isPlatformHostname(window.location.hostname)
      ) {
        return `${trimBase(BASE_APP_URL)}${parsed.pathname}${parsed.search}${parsed.hash}`
      }
    } catch {
      /* unverändert */
    }
    return u
  }
  const path = u.startsWith('/') ? u : `/${u}`
  return `${getPilotShareLinkBaseUrl()}${path}`
}
