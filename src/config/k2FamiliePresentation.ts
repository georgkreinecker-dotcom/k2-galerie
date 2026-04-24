import { BASE_APP_URL, PROJECT_ROUTES } from './navigation'
import { FAMILIE_HUBER_TENANT_ID } from '../data/k2FamilieMusterHuberQuelle'
import { resolveKreineckerPresentationTenantIdFromEnv } from '../data/k2FamilieKreineckerStammbaumQuelle'

export type K2FamiliePresentationUrlOpts = {
  /**
   * Fester Mandant (z. B. Musterfamilie Huber = `huber`) statt Vite-Env.
   * Ohne: `resolveKreineckerPresentationTenantIdFromEnv()`.
   */
  tenantId?: string
  /**
   * Vom Präsentationsboard: `pm=0&d=0` – beendet ggf. anhaftende Screenshot/Deckblatt-Session
   * (`k2-familie-pm` / k2-familie-deckblatt-minimal), damit voller Hero (kgm, Teilen, Titel) wie im normalen Aufruf.
   */
  forPräsentationsboardLive?: boolean
}

/**
 * K2-Familie-URL (absolut) mit optional `?t=…` (Mandant aus Env oder Override).
 * Optional Präsi-Board-Reset-Query, damit Live-Ansicht nicht wie „nur Mappe/PNG“ aussieht.
 */
export function k2FamilieUrlWithPresentationTenant(
  relativePath: string,
  opts?: K2FamiliePresentationUrlOpts,
): string {
  const t = opts?.tenantId ?? resolveKreineckerPresentationTenantIdFromEnv()
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`
  const base = `${BASE_APP_URL}${path}`
  const params = new URLSearchParams()
  if (t) params.set('t', t)
  if (opts?.forPräsentationsboardLive) {
    params.set('pm', '0')
    params.set('d', '0')
  }
  const qs = params.toString()
  if (!qs) return base
  const sep = base.includes('?') ? '&' : '?'
  return `${base}${sep}${qs}`
}

export function getK2FamilieStammbaumKreineckerPublicUrl(): string {
  return k2FamilieUrlWithPresentationTenant(PROJECT_ROUTES['k2-familie'].stammbaum, {
    forPräsentationsboardLive: true,
  })
}

/**
 * Musterfamilie Huber (Demo) – öffentlicher Link; Mandant `huber` in der URL, inkl. Board-Reset.
 * Kachel „K2 Familie – Musterfamilie Huber“: dieselbe Kette wie manuell `?t=huber` in der App (nicht Kreinecker-Env).
 */
export function getK2FamilieMeineFamilieMusterHuberPublicUrl(): string {
  return k2FamilieUrlWithPresentationTenant(PROJECT_ROUTES['k2-familie'].meineFamilie, {
    tenantId: FAMILIE_HUBER_TENANT_ID,
    forPräsentationsboardLive: true,
  })
}

/**
 * Echte Stammfamilie aus Vercel-Env (Kreinecker-Kette) – z. B. `go=meine-familie` mit Env,
 * sonst: nutze {@link getK2FamilieMeineFamilieMusterHuberPublicUrl} für Muster-Huber.
 */
export function getK2FamilieMeineFamilieKreineckerPublicUrl(): string {
  return k2FamilieUrlWithPresentationTenant(PROJECT_ROUTES['k2-familie'].meineFamilie, {
    forPräsentationsboardLive: true,
  })
}
