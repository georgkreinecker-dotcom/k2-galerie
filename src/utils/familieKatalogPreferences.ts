/**
 * K2 Familie – nur UI-Präferenzen für den Stammbaum-PDF-Katalog (Spaltenwahl).
 * Analog zu werkkatalogPreferences (Werkkatalog ök2/K2).
 */

export const FAMILIE_KATALOG_SPALTEN_OPTIONS: ReadonlyArray<{ id: string; label: string }> = [
  { id: 'nr', label: 'Nr.' },
  { id: 'id', label: 'Karten-ID' },
  { id: 'name', label: 'Name' },
  { id: 'gebName', label: 'Geb.-Name' },
  { id: 'geboren', label: 'Geboren' },
  { id: 'gestorben', label: 'Gestorben' },
  { id: 'eltern', label: 'Eltern' },
  { id: 'partner', label: 'Partner' },
  { id: 'kinder', label: 'Kinder' },
  { id: 'geschwister', label: 'Geschw.' },
]

const ALLOWED = new Set(FAMILIE_KATALOG_SPALTEN_OPTIONS.map((c) => c.id))

export const DEFAULT_FAMILIE_KATALOG_SPALTEN: string[] = [...ALLOWED]

export type FamilienKatalogSpaltenPersistedV1 = {
  v: 1
  spalten: string[]
}

export function familienKatalogPrefsStorageKey(tenantId: string): string {
  return `k2-familie-${tenantId}-katalog-spalten`
}

export function normalizeFamilieKatalogSpalten(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [...DEFAULT_FAMILIE_KATALOG_SPALTEN]
  const ids = raw.filter((x): x is string => typeof x === 'string' && ALLOWED.has(x))
  if (ids.length === 0) return [...DEFAULT_FAMILIE_KATALOG_SPALTEN]
  if (!ids.includes('name')) return ['name', ...ids.filter((x) => x !== 'name')]
  return ids
}

export function loadFamilienKatalogSpalten(tenantId: string): string[] {
  try {
    const raw = localStorage.getItem(familienKatalogPrefsStorageKey(tenantId))
    if (!raw?.trim()) return [...DEFAULT_FAMILIE_KATALOG_SPALTEN]
    const p = JSON.parse(raw) as { v?: number; spalten?: unknown }
    if (p.v !== 1) return [...DEFAULT_FAMILIE_KATALOG_SPALTEN]
    return normalizeFamilieKatalogSpalten(p.spalten)
  } catch {
    return [...DEFAULT_FAMILIE_KATALOG_SPALTEN]
  }
}

export function saveFamilienKatalogSpalten(tenantId: string, spalten: string[]): void {
  try {
    const payload: FamilienKatalogSpaltenPersistedV1 = {
      v: 1,
      spalten: normalizeFamilieKatalogSpalten(spalten),
    }
    localStorage.setItem(familienKatalogPrefsStorageKey(tenantId), JSON.stringify(payload))
  } catch (e) {
    console.warn('Familien-Katalog-Spalten speichern fehlgeschlagen', e)
  }
}

export function familienKatalogSpalteLabel(id: string): string {
  return FAMILIE_KATALOG_SPALTEN_OPTIONS.find((c) => c.id === id)?.label ?? id
}
