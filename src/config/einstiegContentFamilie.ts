/**
 * K2 Familie – Texte für Einstieg B (nur Mandant huber / Musterfamilie).
 * Eigene Keys pro Tenant – kein Teilen mit Marketing-Flyer (A) oder „Meine Familie“-Homepage (C).
 */

export interface FamilieEinstiegTexts {
  title: string
  subtitle: string
  body: string
  ctaLabel: string
}

export interface FamilieEinstiegContent {
  heroImage?: string
}

/** Nur sichtbar bei Mandant „huber“ (Musterfamilie) – Umschauen ohne eigene Daten. */
const DEFAULT_EINSTIEG_TEXTS: FamilieEinstiegTexts = {
  title: 'K2 Familie – Musterfamilie zum Umschauen',
  subtitle: 'Demo: Familie Huber',
  body:
    'Hier kannst du ohne eigene Daten stöbern: Stammbaum, Kalender und mehr. Für eure echte Familie legst du mit „Neue Familie“ eine Instanz an oder wählst sie oben im Menü.',
  ctaLabel: 'Weiter zur Übersicht',
}

function textsKey(tenantId: string): string {
  return `k2-familie-${tenantId}-einstieg-texts`
}

function contentKey(tenantId: string): string {
  return `k2-familie-${tenantId}-einstieg-content`
}

export function getFamilieEinstiegTexts(tenantId: string): FamilieEinstiegTexts {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(textsKey(tenantId)) : null
    if (raw && raw.length > 0) {
      const parsed = JSON.parse(raw) as Partial<FamilieEinstiegTexts>
      return {
        title: parsed.title?.trim() || DEFAULT_EINSTIEG_TEXTS.title,
        subtitle: parsed.subtitle?.trim() || DEFAULT_EINSTIEG_TEXTS.subtitle,
        body: parsed.body?.trim() || DEFAULT_EINSTIEG_TEXTS.body,
        ctaLabel: parsed.ctaLabel?.trim() || DEFAULT_EINSTIEG_TEXTS.ctaLabel,
      }
    }
  } catch (_) {}
  return { ...DEFAULT_EINSTIEG_TEXTS }
}

export function setFamilieEinstiegTexts(tenantId: string, data: Partial<FamilieEinstiegTexts>): void {
  try {
    const prev = getFamilieEinstiegTexts(tenantId)
    localStorage.setItem(textsKey(tenantId), JSON.stringify({ ...prev, ...data }))
  } catch (_) {}
}

export function getFamilieEinstiegContent(tenantId: string): FamilieEinstiegContent {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(contentKey(tenantId)) : null
    if (raw && raw.length > 0) {
      const parsed = JSON.parse(raw) as Partial<FamilieEinstiegContent>
      return { heroImage: parsed.heroImage }
    }
  } catch (_) {}
  return {}
}

export function setFamilieEinstiegContent(tenantId: string, data: Partial<FamilieEinstiegContent>): void {
  try {
    const prev = getFamilieEinstiegContent(tenantId)
    const next = { ...prev, ...data }
    localStorage.setItem(contentKey(tenantId), JSON.stringify(next))
  } catch (_) {}
}
