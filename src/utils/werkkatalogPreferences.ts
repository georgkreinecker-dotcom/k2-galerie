/** Nur UI-Präferenzen – keine Werk-/Stammdaten (K2 / ök2 / VK2 getrennt). */
export type KatalogFilterState = {
  status: 'alle' | 'galerie' | 'verkauft' | 'reserviert' | 'lager'
  kategorie: string
  artist: string
  vonDatum: string
  bisDatum: string
  vonPreis: string
  bisPreis: string
  suchtext: string
}

export type WerkkatalogPersistedV1 = {
  v: 1
  filter: KatalogFilterState
  spalten: string[]
}

const STATUS_VALUES = ['alle', 'galerie', 'verkauft', 'reserviert', 'lager'] as const

export const DEFAULT_KATALOG_FILTER: KatalogFilterState = {
  status: 'alle',
  kategorie: '',
  artist: '',
  vonDatum: '',
  bisDatum: '',
  vonPreis: '',
  bisPreis: '',
  suchtext: '',
}

/** Entspricht bisherigem Admin-Default (K2 / ök2). */
export const DEFAULT_KATALOG_SPALTEN_K2_OEK2 = [
  'nummer',
  'titel',
  'kategorie',
  'kuenstler',
  'masse',
  'technik',
  'ek',
  'preis',
  'status',
  'datum',
  'kaeufer',
] as const

/** VK2: wie WerkkatalogTab-Fallback. */
export const DEFAULT_KATALOG_SPALTEN_VK2 = [
  'nummer',
  'titel',
  'kuenstler',
  'masse',
  'technik',
  'beschreibung',
  'datum',
] as const

const ALL_COLUMN_IDS = new Set([
  'nummer',
  'vorschau',
  'titel',
  'typ',
  'kategorie',
  'kuenstler',
  'masse',
  'technik',
  'beschreibung',
  'ek',
  'preis',
  'status',
  'datum',
  'kaeufer',
  'verkauftam',
  'stueck',
  'standort',
])

const VK2_COLUMN_IDS = new Set([
  'nummer',
  'vorschau',
  'titel',
  'kuenstler',
  'masse',
  'technik',
  'beschreibung',
  'datum',
])

export function werkkatalogStorageKey(isOeffentlich: boolean, isVk2: boolean): string {
  if (isVk2) return 'k2-vk2-werkkatalog-prefs'
  if (isOeffentlich) return 'k2-oeffentlich-werkkatalog-prefs'
  return 'k2-werkkatalog-prefs'
}

function normalizeFilter(raw: unknown): KatalogFilterState {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_KATALOG_FILTER }
  const o = raw as Record<string, unknown>
  const st = o.status
  const status = STATUS_VALUES.includes(st as (typeof STATUS_VALUES)[number])
    ? (st as KatalogFilterState['status'])
    : 'alle'
  const str = (k: string) => (typeof o[k] === 'string' ? (o[k] as string) : '')
  return {
    status,
    kategorie: str('kategorie'),
    artist: str('artist'),
    vonDatum: str('vonDatum'),
    bisDatum: str('bisDatum'),
    vonPreis: str('vonPreis'),
    bisPreis: str('bisPreis'),
    suchtext: str('suchtext'),
  }
}

function normalizeSpalten(raw: unknown, isVk2: boolean): string[] {
  const allowed = isVk2 ? VK2_COLUMN_IDS : ALL_COLUMN_IDS
  const fallback = isVk2
    ? [...DEFAULT_KATALOG_SPALTEN_VK2]
    : [...DEFAULT_KATALOG_SPALTEN_K2_OEK2]
  if (!Array.isArray(raw)) return fallback
  const ids = raw.filter((x): x is string => typeof x === 'string' && allowed.has(x))
  return ids.length > 0 ? ids : fallback
}

/** Liest gespeicherte Werkkatalog-UI oder null (dann Defaults vom Aufrufer). */
export function loadWerkkatalogPrefs(
  key: string,
  options: { isVk2: boolean },
): WerkkatalogPersistedV1 | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw || !raw.trim()) return null
    const p = JSON.parse(raw) as { v?: number; filter?: unknown; spalten?: unknown }
    if (p.v !== 1 || !p.filter) return null
    return {
      v: 1,
      filter: normalizeFilter(p.filter),
      spalten: normalizeSpalten(p.spalten, options.isVk2),
    }
  } catch {
    return null
  }
}

export function saveWerkkatalogPrefs(
  key: string,
  data: { filter: KatalogFilterState; spalten: string[] },
): void {
  try {
    const payload: WerkkatalogPersistedV1 = { v: 1, filter: data.filter, spalten: data.spalten }
    localStorage.setItem(key, JSON.stringify(payload))
  } catch (e) {
    console.warn('Werkkatalog-Einstellungen speichern fehlgeschlagen', e)
  }
}
