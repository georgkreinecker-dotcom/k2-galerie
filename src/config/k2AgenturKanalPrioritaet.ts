/**
 * K2 Agentur – empfohlene Schalt-Reihenfolge (nicht alle 9 gleichzeitig).
 */
import type { K2AgenturPlattformState } from '../utils/k2AgenturPlattformStorage'
import {
  getKanalChecklistProgress,
  isGlobalKontoDoneForKanal,
  kanalStorageKey,
} from '../utils/k2AgenturPlattformStorage'
import { listMarketingKanalUrls, type MarketingPaidKanalId, type MarketingProduktId } from './marketingKanalP1P2P3'

export type KanalPrioritySlot = { produkt: MarketingProduktId; kanal: MarketingPaidKanalId }

/** Sportwagen-Reihenfolge – eine Liste für alle. */
export const K2_AGENTUR_KANAL_PRIORITY: KanalPrioritySlot[] = [
  { produkt: 'p1', kanal: 'google' },
  { produkt: 'p1', kanal: 'meta' },
  { produkt: 'p2', kanal: 'google' },
  { produkt: 'p1', kanal: 'linkedin' },
  { produkt: 'p2', kanal: 'meta' },
  { produkt: 'p3', kanal: 'google' },
  { produkt: 'p2', kanal: 'linkedin' },
  { produkt: 'p3', kanal: 'meta' },
  { produkt: 'p3', kanal: 'linkedin' },
]

export type NextRecommendedKanal = {
  key: string
  produktLabel: string
  kanalLabel: string
  progressDone: number
  progressTotal: number
}

/** Erster Kanal in Reihenfolge: Konto OK, noch nicht vollständig live. */
export function getNextRecommendedKanal(state: K2AgenturPlattformState): NextRecommendedKanal | null {
  const katalog = listMarketingKanalUrls()
  for (const slot of K2_AGENTUR_KANAL_PRIORITY) {
    const key = kanalStorageKey(slot.produkt, slot.kanal)
    const row = state.kanaele[key]
    if (!row) continue
    if (row.status === 'live' || row.status === 'pausiert') continue
    if (!isGlobalKontoDoneForKanal(state, slot.kanal) && !row.kontoEingerichtet) continue
    const prog = getKanalChecklistProgress(state, key)
    if (prog.done >= prog.total && prog.total > 0) continue
    const meta = katalog.find((r) => r.produkt === slot.produkt && r.kanal === slot.kanal)
    if (!meta) continue
    return {
      key,
      produktLabel: meta.produktLabel,
      kanalLabel: meta.kanalLabel,
      progressDone: prog.done,
      progressTotal: prog.total,
    }
  }
  return null
}
