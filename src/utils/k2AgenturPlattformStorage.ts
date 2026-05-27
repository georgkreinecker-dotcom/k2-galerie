/**
 * K2 Agentur – Arbeitsstand nur APf (localStorage).
 * Kanäle P1/P2/P3 × Google/Meta/LinkedIn – Status, Budget, Notizen, Schalt-Checkliste.
 */

import {
  globalStepIds,
  kanalStepIds,
  kanalStepIdAutoOnPaketKopiert,
  kanalStepIdAutoOnAnzeigenKopiert,
  globalKontoStepIdForKanal,
  K2_AGENTUR_GLOBAL_LAUNCH_STEPS,
  K2_AGENTUR_KANAL_LAUNCH_STEPS,
} from '../config/k2AgenturLaunchCheckliste'
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
  version: 2
  kanaele: Record<string, K2AgenturKanalRow>
  allgemeinNotizen: string
  /** Einmal-Schritte (Google/Meta/LinkedIn Konto) */
  globalSchritte: Record<string, boolean>
  /** Pro Kanal-Key: Schritt-ID → erledigt */
  kanalSchritte: Record<string, Record<string, boolean>>
}

export function kanalStorageKey(produkt: MarketingProduktId, kanal: MarketingPaidKanalId): string {
  return `${produkt}_${kanal}`
}

function defaultGlobalSchritte(): Record<string, boolean> {
  const out: Record<string, boolean> = {}
  for (const id of globalStepIds()) out[id] = false
  return out
}

function defaultKanalSchritteForKey(_key: string): Record<string, boolean> {
  const out: Record<string, boolean> = {}
  for (const id of kanalStepIds()) out[id] = false
  return out
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
  const kanalSchritte: Record<string, Record<string, boolean>> = {}
  for (const row of listMarketingKanalUrls()) {
    const key = kanalStorageKey(row.produkt, row.kanal)
    kanaele[key] = defaultRow(row.produkt, row.kanal)
    kanalSchritte[key] = defaultKanalSchritteForKey(key)
  }
  return {
    version: 2,
    kanaele,
    allgemeinNotizen: '',
    globalSchritte: defaultGlobalSchritte(),
    kanalSchritte,
  }
}

function isValidStatus(s: unknown): s is K2AgenturKanalStatus {
  return s === 'offen' || s === 'vorbereitet' || s === 'live' || s === 'pausiert'
}

function mergeSchritte(
  defaults: Record<string, boolean>,
  patch: unknown,
): Record<string, boolean> {
  const out = { ...defaults }
  if (!patch || typeof patch !== 'object') return out
  for (const id of Object.keys(out)) {
    const p = (patch as Record<string, unknown>)[id]
    if (p === true) out[id] = true
  }
  return out
}

function mergeWithDefaults(parsed: Partial<K2AgenturPlattformState> & { version?: number }): K2AgenturPlattformState {
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
  const kanalSchritte = { ...base.kanalSchritte }
  if (parsed.kanalSchritte && typeof parsed.kanalSchritte === 'object') {
    for (const key of Object.keys(kanalSchritte)) {
      kanalSchritte[key] = mergeSchritte(kanalSchritte[key], parsed.kanalSchritte[key])
    }
  }
  const allgemeinNotizen =
    typeof parsed.allgemeinNotizen === 'string' ? parsed.allgemeinNotizen.slice(0, 8000) : ''
  return {
    version: 2,
    kanaele,
    allgemeinNotizen,
    globalSchritte: mergeSchritte(base.globalSchritte, parsed.globalSchritte),
    kanalSchritte,
  }
}

export function loadK2AgenturPlattform(): K2AgenturPlattformState {
  if (typeof localStorage === 'undefined') return createDefaultK2AgenturPlattformState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createDefaultK2AgenturPlattformState()
    const parsed = JSON.parse(raw) as Partial<K2AgenturPlattformState> & { version?: number }
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

export function countChecked(map: Record<string, boolean>): { done: number; total: number } {
  const keys = Object.keys(map)
  let done = 0
  for (const k of keys) if (map[k]) done += 1
  return { done, total: keys.length }
}

export function getGlobalChecklistProgress(state: K2AgenturPlattformState): { done: number; total: number } {
  return countChecked(state.globalSchritte)
}

export function getKanalChecklistProgress(
  state: K2AgenturPlattformState,
  kanalKey: string,
): { done: number; total: number } {
  const map = state.kanalSchritte[kanalKey]
  if (!map) return { done: 0, total: kanalStepIds().length }
  return countChecked(map)
}

export function isGlobalKontoDoneForKanal(state: K2AgenturPlattformState, kanal: MarketingPaidKanalId): boolean {
  const gid = globalKontoStepIdForKanal(kanal)
  return state.globalSchritte[gid] === true
}

/** Vorgeschlagener Ampel-Status aus Checkliste (manuell übernehmen). */
export function suggestKanalStatusFromChecklist(
  state: K2AgenturPlattformState,
  kanalKey: string,
): K2AgenturKanalStatus {
  const row = state.kanaele[kanalKey]
  if (!row) return 'offen'
  const { done, total } = getKanalChecklistProgress(state, kanalKey)
  const schritte = state.kanalSchritte[kanalKey]
  const aktiv = schritte?.['freigabe-aktiv'] === true
  const globalKonto = isGlobalKontoDoneForKanal(state, row.kanal) || row.kontoEingerichtet
  if (done === total && total > 0 && aktiv && globalKonto) return 'live'
  if (done >= Math.ceil(total * 0.5) && globalKonto) return 'vorbereitet'
  return 'offen'
}

export function toggleGlobalSchritt(
  state: K2AgenturPlattformState,
  stepId: string,
  checked: boolean,
): K2AgenturPlattformState {
  const globalSchritte = { ...state.globalSchritte, [stepId]: checked }
  let kanaele = state.kanaele
  if (checked && stepId.startsWith('global-') && stepId.endsWith('-konto')) {
    const kanal: MarketingPaidKanalId | null =
      stepId === 'global-google-konto' ? 'google' : stepId === 'global-meta-konto' ? 'meta' : stepId === 'global-linkedin-konto' ? 'linkedin' : null
    if (kanal) {
      kanaele = { ...kanaele }
      for (const key of Object.keys(kanaele)) {
        if (kanaele[key].kanal === kanal) {
          kanaele[key] = { ...kanaele[key], kontoEingerichtet: true }
        }
      }
    }
  }
  return { ...state, globalSchritte, kanaele }
}

export function toggleKanalSchritt(
  state: K2AgenturPlattformState,
  kanalKey: string,
  stepId: string,
  checked: boolean,
): K2AgenturPlattformState {
  const prev = state.kanalSchritte[kanalKey] ?? defaultKanalSchritteForKey(kanalKey)
  const kanalSchritte = {
    ...state.kanalSchritte,
    [kanalKey]: { ...prev, [stepId]: checked },
  }
  return { ...state, kanalSchritte }
}

/** Nach „Schalt-Paket kopieren“: Ziel-URL-Schritt automatisch abhaken. */
export function markPaketKopiert(state: K2AgenturPlattformState, kanalKey: string): K2AgenturPlattformState {
  const autoId = kanalStepIdAutoOnPaketKopiert()
  if (!autoId) return state
  return toggleKanalSchritt(state, kanalKey, autoId, true)
}

/** Nach „Anzeigen-Paket kopieren“: Creative-Schritt automatisch abhaken. */
export function markAnzeigenPaketKopiert(state: K2AgenturPlattformState, kanalKey: string): K2AgenturPlattformState {
  const autoId = kanalStepIdAutoOnAnzeigenKopiert()
  if (!autoId) return state
  return toggleKanalSchritt(state, kanalKey, autoId, true)
}

/** Nach „Auswertungs-Paket kopieren“: Auswertung-Schritt abhaken. */
export function markAuswertungPaketKopiert(state: K2AgenturPlattformState, kanalKey: string): K2AgenturPlattformState {
  return toggleKanalSchritt(state, kanalKey, 'auswertung-geplant', true)
}

/** Auswertungs-Vorlage an Kanal-Notizen anhängen (max. 4000 Zeichen gesamt). */
export function appendKanalNotizBlock(
  state: K2AgenturPlattformState,
  kanalKey: string,
  block: string,
): K2AgenturPlattformState {
  const row = state.kanaele[kanalKey]
  if (!row) return state
  const trimmed = block.trim()
  if (!trimmed) return state
  const sep = row.notizen.trim() ? '\n\n' : ''
  const notizen = (row.notizen + sep + trimmed).slice(0, 4000)
  return {
    ...state,
    kanaele: { ...state.kanaele, [kanalKey]: { ...row, notizen } },
  }
}

/** Summe der eingetragenen Monatsbudgets (€) über alle Kanäle. */
export function sumBudgetEurMonat(state: K2AgenturPlattformState): number {
  let sum = 0
  for (const row of Object.values(state.kanaele)) {
    const n = parseFloat(String(row.budgetEurMonat).replace(',', '.').trim())
    if (!Number.isNaN(n) && n > 0) sum += n
  }
  return sum
}

export function applySuggestedStatusToAllKanaele(state: K2AgenturPlattformState): K2AgenturPlattformState {
  const kanaele = { ...state.kanaele }
  for (const key of Object.keys(kanaele)) {
    const suggested = suggestKanalStatusFromChecklist(state, key)
    if (kanaele[key].status === 'pausiert') continue
    kanaele[key] = { ...kanaele[key], status: suggested }
  }
  return { ...state, kanaele }
}

export { K2_AGENTUR_GLOBAL_LAUNCH_STEPS, K2_AGENTUR_KANAL_LAUNCH_STEPS }
