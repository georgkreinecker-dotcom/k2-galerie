import { BASE_APP_URL, PROJECT_ROUTES } from './navigation'
import { resolveKreineckerPresentationTenantIdFromEnv } from '../data/k2FamilieKreineckerStammbaumQuelle'

/**
 * K2-Familie-URL (absolut) mit `?t=…`, wenn in Vercel/Build ein Mandant gesetzt ist.
 * Eine Quelle für den `t=`-Wert: `k2FamilieKreineckerStammbaumQuelle.ts` (Kette + Env-Reihenfolge).
 * Ohne gültigen Wert: nackter Pfad → App kann Musterfamilie wählen.
 */
export function k2FamilieUrlWithPresentationTenant(relativePath: string): string {
  const t = resolveKreineckerPresentationTenantIdFromEnv()
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`
  const base = `${BASE_APP_URL}${path}`
  if (!t) return base
  const sep = base.includes('?') ? '&' : '?'
  return `${base}${sep}${new URLSearchParams({ t }).toString()}`
}

export function getK2FamilieStammbaumKreineckerPublicUrl(): string {
  return k2FamilieUrlWithPresentationTenant(PROJECT_ROUTES['k2-familie'].stammbaum)
}

/** Präsentationsboard „K2 Familie“ / Meine Familie – gleicher Mandant wie Stammbaum. */
export function getK2FamilieMeineFamilieKreineckerPublicUrl(): string {
  return k2FamilieUrlWithPresentationTenant(PROJECT_ROUTES['k2-familie'].meineFamilie)
}
