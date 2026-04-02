/**
 * Besucherzähler: ein Standard für öffentliche Galerie-Seiten → POST /api/visit.
 * Regex muss zu api/visit-and-build.js (VISIT_TENANT_RE) passen.
 */
export const VISIT_TENANT_ID_RE = /^[a-z0-9-]{1,64}$/

export function isValidVisitTenantId(t: string): boolean {
  return typeof t === 'string' && VISIT_TENANT_ID_RE.test(t)
}

export type ReportPublicGalleryVisitOptions = {
  tenant: string
  sessionKey: string
  skip?: () => boolean
}

/**
 * Einmal pro Browser-Session melden (nicht im iframe).
 * sessionStorage nur bei HTTP-Erfolg (res.ok), damit bei API-/Netzfehlern ein erneuter Versuch möglich ist.
 */
export function reportPublicGalleryVisit(options: ReportPublicGalleryVisitOptions): void {
  if (typeof window === 'undefined' || window.self !== window.top) return
  if (!isValidVisitTenantId(options.tenant)) return
  try {
    if (options.skip?.()) return
    if (sessionStorage.getItem(options.sessionKey)) return
    const origin = window.location.origin
    fetch(`${origin}/api/visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenant: options.tenant }),
    })
      .then((res) => {
        if (res.ok) sessionStorage.setItem(options.sessionKey, '1')
      })
      .catch(() => {})
  } catch (_) {}
}
