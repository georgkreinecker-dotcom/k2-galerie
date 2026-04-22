import { BASE_APP_URL, PROJECT_ROUTES } from './navigation'

function presentationTenantIdFromEnv(): string {
  return String(
    import.meta.env.VITE_K2_FAMILIE_KREINECKER_STAMMBAUM_TENANT_ID ?? '',
  ).trim()
}

/**
 * K2-Familie-URL (absolut) mit `?t=…`, wenn in Vercel/Build gesetzt:
 * `VITE_K2_FAMILIE_KREINECKER_STAMMBAUM_TENANT_ID` = Wert aus der Einladung (Parameter t=).
 * Nutzung: Präsentationsboard, alle öffentlichen Einstiege, die **nicht** Huber-Fallback nutzen sollen.
 * Ohne Variable: nackter Pfad → App kann Musterfamilie wählen.
 */
export function k2FamilieUrlWithPresentationTenant(relativePath: string): string {
  const t = presentationTenantIdFromEnv()
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
