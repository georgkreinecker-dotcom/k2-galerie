/**
 * Testuser-Anmeldung: POST an dieselbe Basis wie send-pilot-invite
 * (localhost + Plattform → Production-API).
 */
import { isPlatformHostname } from '../config/tenantConfig'
import { BASE_APP_URL } from '../config/navigation'
import { isPilotInviteLocalDevHostname } from './pilotInviteClient'

function trimBase(url: string): string {
  return url.replace(/\/$/, '')
}

/** POST /api/send-testuser-anmeldung */
export function getSendTestuserAnmeldungApiUrl(): string {
  if (typeof window === 'undefined') return `${trimBase(BASE_APP_URL)}/api/send-testuser-anmeldung`
  const host = window.location.hostname
  if (isPilotInviteLocalDevHostname(host) && isPlatformHostname(host)) {
    return `${trimBase(BASE_APP_URL)}/api/send-testuser-anmeldung`
  }
  return `${trimBase(window.location.origin)}/api/send-testuser-anmeldung`
}
