/**
 * mök2 – Werbefahrplan (Aktivitäten & Zeitraum). Nur APf/Mac-localStorage, kein Mandanten-Kundendaten-Key.
 */

export type Mok2WerbeKampagne = {
  id: string
  titel: string
  /** YYYY-MM-DD */
  vonISO: string
  bisISO: string
  /** Freitext / Zeilen – Inserate, Presse, Auktion … */
  aktivitaeten: string
}

const STORAGE_KEY = 'k2-mok2-werbefahrplan'

/** Erste Kampagne laut Vorgabe (Mitte Mai – Mitte Juni), bis du speicherst nur im Speicher wenn noch nichts liegt. */
export const MOK2_WERBEFAHRPLAN_DEFAULT: Mok2WerbeKampagne[] = [
  {
    id: 'kampagne-fruehjahr-2026-1',
    titel: 'Erste Aktion – Frühjahr 2026',
    vonISO: '2026-05-15',
    bisISO: '2026-06-15',
    aktivitaeten: [
      '1 redaktioneller Teil',
      '5 Inserate 1/4 Seite',
      'Teilnahme an Online-Auktion',
    ].join('\n'),
  },
]

function isValidRow(x: unknown): x is Mok2WerbeKampagne {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    typeof o.titel === 'string' &&
    typeof o.vonISO === 'string' &&
    typeof o.bisISO === 'string' &&
    typeof o.aktivitaeten === 'string'
  )
}

export function loadMok2Werbefahrplan(): Mok2WerbeKampagne[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    if (!raw?.trim()) return MOK2_WERBEFAHRPLAN_DEFAULT.map((k) => ({ ...k }))
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed) || parsed.length === 0) return MOK2_WERBEFAHRPLAN_DEFAULT.map((k) => ({ ...k }))
    const rows = parsed.filter(isValidRow)
    if (rows.length === 0) return MOK2_WERBEFAHRPLAN_DEFAULT.map((k) => ({ ...k }))
    return rows.map((r) => ({ ...r }))
  } catch {
    return MOK2_WERBEFAHRPLAN_DEFAULT.map((k) => ({ ...k }))
  }
}

/** Gleicher Tab: Teaser / andere UI kann darauf hören (storage-Event feuert nur in anderen Tabs). */
export const MOK2_WERBEFAHRPLAN_UPDATED_EVENT = 'k2-mok2-werbefahrplan-updated'

export function saveMok2Werbefahrplan(rows: Mok2WerbeKampagne[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows))
    window.dispatchEvent(new CustomEvent(MOK2_WERBEFAHRPLAN_UPDATED_EVENT))
  } catch {
    /* Quota o. ä. – keine stillen Kundendaten-Keys betroffen */
  }
}

export function createEmptyMok2WerbeKampagne(): Mok2WerbeKampagne {
  return {
    id: `w-${Date.now()}`,
    titel: '',
    vonISO: '',
    bisISO: '',
    aktivitaeten: '',
  }
}
