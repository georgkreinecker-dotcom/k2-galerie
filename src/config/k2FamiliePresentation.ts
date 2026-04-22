import { isValidFamilieTenantId } from '../utils/familieStorage'
import { BASE_APP_URL, PROJECT_ROUTES } from './navigation'

/** 1) Stammbaum/Präsentation 2) gleicher Wert wie APf (Meine Familie) – oft nur einer von beiden in .env / Vercel. */
function presentationTenantIdFromEnv(): string {
  const candidates: unknown[] = [
    import.meta.env.VITE_K2_FAMILIE_KREINECKER_STAMMBAUM_TENANT_ID,
    import.meta.env.VITE_K2_FAMILIE_APF_MEINE_FAMILIE_TENANT_ID,
  ]
  for (const c of candidates) {
    const t = String(c ?? '')
      .trim()
      .toLowerCase()
    if (t && isValidFamilieTenantId(t)) return t
  }
  return ''
}

/**
 * K2-Familie-URL (absolut) mit `?t=…`, wenn in Vercel/Build gesetzt:
 * `VITE_K2_FAMILIE_KREINECKER_STAMMBAUM_TENANT_ID` oder (Fallback)
 * `VITE_K2_FAMILIE_APF_MEINE_FAMILIE_TENANT_ID` = Wert aus der Einladung (Parameter t=).
 * Nutzung: Präsentationsboard, alle öffentlichen Einstiege, die **nicht** Huber-Fallback nutzen sollen.
 * Ohne beide: nackter Pfad → App kann Musterfamilie wählen.
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
