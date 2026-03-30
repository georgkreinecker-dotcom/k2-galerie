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
