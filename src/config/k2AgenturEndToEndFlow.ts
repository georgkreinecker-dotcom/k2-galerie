/**
 * K2 Agentur – End-to-End-Phasen (eine Seite, ein durchgängiger Weg).
 */
import { K2_AGENTUR_KANAL_PRIORITY } from './k2AgenturKanalPrioritaet'
import {
  getGlobalChecklistProgress,
  getKanalChecklistProgress,
  isGlobalKontoDoneForKanal,
  kanalStorageKey,
  type K2AgenturPlattformState,
} from '../utils/k2AgenturPlattformStorage'

export type K2AgenturE2EPhaseId = 'vorbereiten' | 'schalten' | 'auswerten'

export type K2AgenturE2EPhaseDef = {
  id: K2AgenturE2EPhaseId
  nummer: number
  titel: string
  kurz: string
}

export const K2_AGENTUR_E2E_PHASEN: K2AgenturE2EPhaseDef[] = [
  {
    id: 'vorbereiten',
    nummer: 1,
    titel: 'Konten bereit',
    kurz: 'Google, Meta, LinkedIn – einmal einrichten',
  },
  {
    id: 'schalten',
    nummer: 2,
    titel: 'Kanal schalten',
    kurz: 'Anzeige kopieren → Ads → abhaken – Kanal für Kanal',
  },
  {
    id: 'auswerten',
    nummer: 3,
    titel: 'Auswerten',
    kurz: 'Nach 7 Tagen: Klicks, Kosten, Entscheidung',
  },
]

export function getK2AgenturSchaltenFortschritt(state: K2AgenturPlattformState): {
  live: number
  total: number
} {
  let live = 0
  for (const slot of K2_AGENTUR_KANAL_PRIORITY) {
    const key = kanalStorageKey(slot.produkt, slot.kanal)
    const row = state.kanaele[key]
    if (row?.status === 'live' || row?.status === 'pausiert') live++
  }
  return { live, total: K2_AGENTUR_KANAL_PRIORITY.length }
}

/** Kanäle mit Status live/pausiert, Auswertung noch nicht geplant. */
export function getK2AgenturAuswertungOffen(state: K2AgenturPlattformState): string[] {
  const offen: string[] = []
  for (const slot of K2_AGENTUR_KANAL_PRIORITY) {
    const key = kanalStorageKey(slot.produkt, slot.kanal)
    const row = state.kanaele[key]
    if (!row) continue
    if (row.status !== 'live' && row.status !== 'pausiert') continue
    if (state.kanalSchritte[key]?.['auswertung-geplant'] !== true) offen.push(key)
  }
  return offen
}

export function getK2AgenturE2EPhaseStatus(
  state: K2AgenturPlattformState,
): Record<K2AgenturE2EPhaseId, { done: number; total: number; complete: boolean }> {
  const global = getGlobalChecklistProgress(state)
  const schalten = getK2AgenturSchaltenFortschritt(state)
  const auswertungOffen = getK2AgenturAuswertungOffen(state)
  const auswertungTotal = schalten.live
  const auswertungDone = auswertungTotal - auswertungOffen.length

  return {
    vorbereiten: {
      done: global.done,
      total: global.total,
      complete: global.done >= global.total && global.total > 0,
    },
    schalten: {
      done: schalten.live,
      total: schalten.total,
      complete: schalten.live >= schalten.total && schalten.total > 0,
    },
    auswerten: {
      done: auswertungDone,
      total: Math.max(auswertungTotal, 1),
      complete: auswertungTotal > 0 && auswertungOffen.length === 0,
    },
  }
}

/** Empfohlene Phase – Georg startet immer am richtigen Ende des Weges. */
export function getSuggestedK2AgenturE2EPhase(state: K2AgenturPlattformState): K2AgenturE2EPhaseId {
  const status = getK2AgenturE2EPhaseStatus(state)
  if (!status.vorbereiten.complete) return 'vorbereiten'
  if (!status.schalten.complete) {
    for (const slot of K2_AGENTUR_KANAL_PRIORITY) {
      const key = kanalStorageKey(slot.produkt, slot.kanal)
      const row = state.kanaele[key]
      if (!row) continue
      if (row.status === 'live' || row.status === 'pausiert') continue
      if (!isGlobalKontoDoneForKanal(state, slot.kanal) && !row.kontoEingerichtet) continue
      const prog = getKanalChecklistProgress(state, key)
      if (prog.done >= prog.total && prog.total > 0) continue
      return 'schalten'
    }
    return 'schalten'
  }
  return 'auswerten'
}
