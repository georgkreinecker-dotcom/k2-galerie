/**
 * K2 Familie – Seitengestaltung pro Tenant (Fertige Homepage).
 * Keys: k2-familie-{tenantId}-page-content.
 * Analog zu pageContentGalerie, nur für Familie und pro tenantId.
 */

export interface PageContentFamilie {
  welcomeImage?: string
  cardImage?: string
}

function getStorageKey(tenantId: string): string {
  return `k2-familie-${tenantId}-page-content`
}

const DEFAULTS: PageContentFamilie = {}

/** Liest Seitengestaltung (Bilder) für eine Familie. */
export function getFamilyPageContent(tenantId: string): PageContentFamilie {
  try {
    const key = getStorageKey(tenantId)
    const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null
    if (raw && raw.length > 0) {
      const parsed = JSON.parse(raw) as Partial<PageContentFamilie>
      return {
        welcomeImage: parsed.welcomeImage ?? DEFAULTS.welcomeImage,
        cardImage: parsed.cardImage ?? DEFAULTS.cardImage,
      }
    }
  } catch (_) {}
  return { ...DEFAULTS }
}

/** Speichert Seitengestaltung (nur nach expliziter User-Aktion). */
export function setFamilyPageContent(tenantId: string, data: Partial<PageContentFamilie>): void {
  try {
    const key = getStorageKey(tenantId)
    const prev = getFamilyPageContent(tenantId)
    const next = { ...prev, ...data }
    localStorage.setItem(key, JSON.stringify(next))
  } catch (_) {}
}
