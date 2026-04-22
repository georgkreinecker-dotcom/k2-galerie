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

/**
 * Musterfamilie Huber – gleiche URLs wie in seedFamilieHuber (familieHuberMuster).
 * Anzeige-Fallback: auf Vercel/anderem Gerät ist localStorage leer → ohne Fallback kein Hero-Foto,
 * obwohl auf der APf (localhost, voller Speicher) die Bilder sichtbar sind.
 */
const HUBER_TENANT_ID = 'huber'
const HUBER_FALLBACK: PageContentFamilie = {
  welcomeImage: 'https://picsum.photos/seed/huber-family/1200/500',
  cardImage: 'https://picsum.photos/seed/huber-card/800/400',
}

/** Liest Seitengestaltung (Bilder) für eine Familie. */
export function getFamilyPageContent(tenantId: string): PageContentFamilie {
  try {
    const key = getStorageKey(tenantId)
    const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null
    if (raw && raw.length > 0) {
      const parsed = JSON.parse(raw) as Partial<PageContentFamilie>
      const base: PageContentFamilie = {
        welcomeImage: parsed.welcomeImage ?? DEFAULTS.welcomeImage,
        cardImage: parsed.cardImage ?? DEFAULTS.cardImage,
      }
      if (tenantId === HUBER_TENANT_ID) {
        return {
          welcomeImage: base.welcomeImage || HUBER_FALLBACK.welcomeImage,
          cardImage: base.cardImage || HUBER_FALLBACK.cardImage,
        }
      }
      return base
    }
  } catch (_) {}
  if (tenantId === HUBER_TENANT_ID) {
    return { ...HUBER_FALLBACK }
  }
  return { ...DEFAULTS }
}

/** Speichert Seitengestaltung (nur nach expliziter User-Aktion). */
export function setFamilyPageContent(tenantId: string, data: Partial<PageContentFamilie>): void {
  try {
    const key = getStorageKey(tenantId)
    const prev = getFamilyPageContent(tenantId)
    const next: PageContentFamilie = { ...prev }
    // Nur gesetzte Keys übernehmen – kein welcomeImage: undefined (JSON.stringify würde den Key weglassen
    // und bei Spread zuvor das Feld mit undefined überschreiben → leeres {} im Speicher = Bild „weg“).
    for (const k of Object.keys(data) as (keyof PageContentFamilie)[]) {
      const v = data[k]
      if (v !== undefined) (next as Record<string, string | undefined>)[k] = v
    }
    localStorage.setItem(key, JSON.stringify(next))
  } catch (_) {}
}
