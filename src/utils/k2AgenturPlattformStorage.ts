/**
 * K2 Agentur – Arbeitsstand nur APf (localStorage).
 * Kanäle P1/P2/P3 × Google/Meta/LinkedIn – Status, Budget, Notizen.
 */

import {
  listMarketingKanalUrls,
  type MarketingPaidKanalId,
  type MarketingProduktId,
} from '../config/marketingKanalP1P2P3'

const STORAGE_KEY = 'k2-agentur-plattform'
export const K2_AGENTUR_PLATTFORM_UPDATED_EVENT = 'k2-agentur-plattform-updated'

export type K2AgenturKanalStatus = 'offen' | 'vorbereitet' | 'live' | 'pausiert'

export type K2AgenturKanalRow = {
  produkt: MarketingProduktId
  kanal: MarketingPaidKanalId
  status: K2AgenturKanalStatus
  /** Freitext, z. B. „200“ für 200 €/Monat Test */
  budgetEurMonat: string
  kontoEingerichtet: boolean
  notizen: string
}

export type K2AgenturPlattformState = {
  version: 1
  kanaele: Record<string, K2AgenturKanalRow>
  allgemeinNotizen: string
}

export function kanalStorageKey(produkt: MarketingProduktId, kanal: MarketingPaidKanalId): string {
  return `${produkt}_${kanal}`
}

function defaultRow(produkt: MarketingProduktId, kanal: MarketingPaidKanalId): K2AgenturKanalRow {
  return {
    produkt,
    kanal,
    status: 'offen',
    budgetEurMonat: '',
    kontoEingerichtet: false,
    notizen: '',
  }
}

export function createDefaultK2AgenturPlattformState(): K2AgenturPlattformState {
  const kanaele: Record<string, K2AgenturKanalRow> = {}
  for (const row of listMarketingKanalUrls()) {
    const key = kanalStorageKey(row.produkt, row.kanal)
    kanaele[key] = defaultRow(row.produkt, row.kanal)
  }
  return { version: 1, kanaele, allgemeinNotizen: '' }
}

function mergeWithDefaults(parsed: Partial<K2AgenturPlattformState>): K2AgenturPlattformState {
  const base = createDefaultK2AgenturPlattformState()
  const kanaele = { ...base.kanaele }
  if (parsed.kanaele && typeof parsed.kanaele === 'object') {
    for (const key of Object.keys(kanaele)) {
      const patch = parsed.kanaele[key]
      if (!patch || typeof patch !== 'object') continue
      kanaele[key] = {
        ...kanaele[key],
        status: isValidStatus(patch.status) ? patch.status : kanaele[key].status,
        budgetEurMonat:
          typeof patch.budgetEurMonat === 'string' ? patch.budgetEurMonat.slice(0, 32) : kanaele[key].budgetEurMonat,
        kontoEingerichtet: patch.kontoEingerichtet === true,
        notizen: typeof patch.notizen === 'string' ? patch.notizen.slice(0, 4000) : kanaele[key].notizen,
      }
    }
  }
  const allgemeinNotizen =
    typeof parsed.allgemeinNotizen === 'string' ? parsed.allgemeinNotizen.slice(0, 8000) : ''
  return { version: 1, kanaele, allgemeinNotizen }
}

function isValidStatus(s: unknown): s is K2AgenturKanalStatus {
  return s === 'offen' || s === 'vorbereitet' || s === 'live' || s === 'pausiert'
}

export function loadK2AgenturPlattform(): K2AgenturPlattformState {
  if (typeof localStorage === 'undefined') return createDefaultK2AgenturPlattformState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createDefaultK2AgenturPlattformState()
    const parsed = JSON.parse(raw) as Partial<K2AgenturPlattformState>
    return mergeWithDefaults(parsed)
  } catch {
    return createDefaultK2AgenturPlattformState()
  }
}

export function saveK2AgenturPlattform(state: K2AgenturPlattformState): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    window.dispatchEvent(new CustomEvent(K2_AGENTUR_PLATTFORM_UPDATED_EVENT))
  } catch {
    console.warn('⚠️ K2 Agentur: Speichern fehlgeschlagen (Quota?)')
  }
}

export function countK2AgenturByStatus(state: K2AgenturPlattformState): Record<K2AgenturKanalStatus, number> {
  const out: Record<K2AgenturKanalStatus, number> = {
    offen: 0,
    vorbereitet: 0,
    live: 0,
    pausiert: 0,
  }
  for (const row of Object.values(state.kanaele)) {
    out[row.status] += 1
  }
  return out
}
