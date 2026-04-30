/**
 * K2 Familie – Seitengestaltung pro Tenant (Fertige Homepage).
 * Keys: k2-familie-{tenantId}-page-content.
 * Analog zu pageContentGalerie, nur für Familie und pro tenantId.
 * Muster Huber: Bild-Defaults nur in k2FamilieMusterHuberQuelle (eine Quelle).
 */

import {
  FAMILIE_HUBER_TENANT_ID,
  FAMILIE_HUBER_DEFAULT_PAGE_CONTENT,
  FAMILIE_HUBER_DEFAULT_EINSTIEG_HERO,
  K2_FAMILIE_DECKBLATT_HOME_PNG,
} from '../data/k2FamilieMusterHuberQuelle'
import { isFamilieMusterHuberDemoReadOnly } from '../utils/familieMusterWriteGuard'

/** Nur Pfad (ohne Query); bei absoluter URL `pathname` – sonst schlägt `===` mit Vercel-URL fehl. */
function familieBildPathForVergleich(url: string): string {
  const s = url.trim()
  if (!s) return ''
  try {
    if (/^https?:\/\//i.test(s)) {
      return new URL(s).pathname
    }
  } catch {
    /* ignore */
  }
  const noQuery = s.split('?')[0] ?? s
  return noQuery
}

function isDeckblattHomePath(path: string): boolean {
  return path === K2_FAMILIE_DECKBLATT_HOME_PNG || path.endsWith('/pm-deckblatt-musterfamilie-home.png')
}

function isHuberEinstiegHeroPath(path: string): boolean {
  return path === FAMILIE_HUBER_DEFAULT_EINSTIEG_HERO || path.endsWith('/pm-familie-einstieg.png')
}

/**
 * Huber-Präsentations-Screenshots im localStorage: nur für `t=huber` anzeigen.
 * Sonst Verlauf / eigenes Foto – nicht `pm-familie-einstieg` (enthält Musterfamilie-Marketing-Text im PNG).
 * Lese-Sanitize, kein setItem.
 */
function sanitizeWelcomeImageRead(url: string | undefined, tenantId: string): string | undefined {
  if (url === undefined || url === '') return url
  const path = familieBildPathForVergleich(url)
  if (isDeckblattHomePath(path)) {
    return tenantId === FAMILIE_HUBER_TENANT_ID ? FAMILIE_HUBER_DEFAULT_EINSTIEG_HERO : undefined
  }
  if (tenantId !== FAMILIE_HUBER_TENANT_ID && isHuberEinstiegHeroPath(path)) {
    return undefined
  }
  return url
}

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
      const base: PageContentFamilie = {
        welcomeImage: sanitizeWelcomeImageRead(parsed.welcomeImage, tenantId) ?? DEFAULTS.welcomeImage,
        cardImage: parsed.cardImage ?? DEFAULTS.cardImage,
      }
      if (tenantId === FAMILIE_HUBER_TENANT_ID) {
        return {
          welcomeImage: base.welcomeImage || FAMILIE_HUBER_DEFAULT_PAGE_CONTENT.welcomeImage,
          cardImage: base.cardImage || FAMILIE_HUBER_DEFAULT_PAGE_CONTENT.cardImage,
        }
      }
      // Huber-nur-Grafik nicht unter fremder Mandanten-ID (Read-Pfad; kein stilles Löschen im Speicher)
      const cardLower = (base.cardImage ?? '').toLowerCase()
      const huberCardLower = FAMILIE_HUBER_DEFAULT_PAGE_CONTENT.cardImage.toLowerCase()
      if (cardLower && (cardLower.includes('familiengrafik-huber') || cardLower === huberCardLower)) {
        return { welcomeImage: base.welcomeImage }
      }
      return base
    }
  } catch (_) {}
  if (tenantId === FAMILIE_HUBER_TENANT_ID) {
    return { ...FAMILIE_HUBER_DEFAULT_PAGE_CONTENT }
  }
  // Echte Familie: kein Default-Foto (Huber-Screenshot wäre falsches Marketing im Bild)
  return { ...DEFAULTS }
}

/**
 * Nach Cloud-Laden: Server-Stand mit lokalem mergen.
 * Leere Server-Felder überschreiben kein lokales Bild (kein stilles Löschen bei altem/externem Server-Stand).
 */
export function mergeFamilyPageContentFromServer(
  local: PageContentFamilie,
  server: Partial<PageContentFamilie> | null | undefined,
  tenantId: string
): PageContentFamilie {
  if (!server || typeof server !== 'object') return local
  const out: PageContentFamilie = { ...local }
  for (const key of ['welcomeImage', 'cardImage'] as const) {
    const sv = server[key]
    if (sv === undefined) continue
    const s = typeof sv === 'string' ? sv : ''
    if (s.length > 0) {
      const sanitized = sanitizeWelcomeImageRead(s, tenantId) ?? s
      out[key] = sanitized
    }
    // Leerer Server-Wert: lokales Bild behalten (kein stilles Löschen)
  }
  return out
}

/** Speichert Seitengestaltung (nur nach expliziter User-Aktion). */
export function setFamilyPageContent(
  tenantId: string,
  data: Partial<PageContentFamilie>,
  opts?: { skipMusterDemoGuard?: boolean }
): void {
  try {
    if (!opts?.skipMusterDemoGuard && isFamilieMusterHuberDemoReadOnly(tenantId)) {
      console.warn('⚠️ pageContentFamilie: Musterfamilie (Demo-Sitzung) ist nur lesend')
      return
    }
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
