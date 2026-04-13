/**
 * K2 Familie – Einstiegsseite B (zwischen Flyer A und „Meine Familie“ C).
 * Eigene Keys – kein Teilen mit Marketing-Texten (A) und kein Teilen mit Homepage (C).
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

const DEFAULT_EINSTIEG_TEXTS: FamilieEinstiegTexts = {
  title: 'Willkommen in eurer Familien-App',
  subtitle: 'Hier startet euer gemeinsamer Bereich',
  body:
    'Im nächsten Schritt gelangt ihr zur Übersicht „Meine Familie“ mit Stammbaum, Kalender und mehr. Diese Seite könnt ihr später unter Familie gestalten anpassen.',
  ctaLabel: 'Weiter zu Meine Familie',
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
