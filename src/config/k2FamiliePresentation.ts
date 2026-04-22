import { BASE_APP_URL, PROJECT_ROUTES } from './navigation'

/**
 * Öffentliche Stammbaum-URL inkl. Mandant, wenn in Vercel/Build gesetzt:
 * VITE_K2_FAMILIE_KREINECKER_STAMMBAUM_TENANT_ID = Wert aus K2-Familie-Einladung (URL-Parameter t=).
 * Ohne Variable: nur Pfad (Fallback-Verhalten in der App = ggf. Muster/anderer Rechner).
 */
export function getK2FamilieStammbaumKreineckerPublicUrl(): string {
  const path = PROJECT_ROUTES['k2-familie'].stammbaum
  const t = String(
    import.meta.env.VITE_K2_FAMILIE_KREINECKER_STAMMBAUM_TENANT_ID ?? '',
  ).trim()
  if (!t) return `${BASE_APP_URL}${path}`
  return `${BASE_APP_URL}${path}?${new URLSearchParams({ t }).toString()}`
}
