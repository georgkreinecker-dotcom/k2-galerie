/**
 * K2 Agentur – Master-Strategien & Keywords (eine Registry für UI und Schalt-Paket).
 */

import type { MarketingPaidKanalId, MarketingProduktId } from './marketingKanalP1P2P3'
import type { FocusDirectionId } from './tenantConfig'
import { formatGoogleKeywordsP1Block } from './k2AgenturGoogleKeywordsP1'
import {
  formatGoogleKeywordsP1AlleSpartenBlock,
  formatGoogleKeywordsP1SparteBlock,
  type P1SparteKeywordId,
} from './k2AgenturGoogleKeywordsP1Sparten'
import { formatGoogleKeywordsP2Block } from './k2AgenturGoogleKeywordsP2'
import { formatGoogleKeywordsP3Block } from './k2AgenturGoogleKeywordsP3'
import { K2_AGENTUR_MASTER_STRATEGIE_P1_URL } from './k2AgenturMasterStrategieP1'
import { K2_AGENTUR_MASTER_STRATEGIE_P2_URL } from './k2AgenturMasterStrategieP2'
import { K2_AGENTUR_MASTER_STRATEGIE_P3_URL } from './k2AgenturMasterStrategieP3'
import { K2_AGENTUR_MASTER_STRATEGIE_MEIN_WEG_URL } from './k2AgenturMasterStrategieMeinWeg'
import { K2_AGENTUR_KEYWORDS_P1_GOOGLE_DRUCK_URL } from './k2AgenturGoogleKeywordsP1'
import { K2_AGENTUR_KEYWORDS_P1_SPARTEN_DRUCK_URL } from './k2AgenturGoogleKeywordsP1Sparten'
import { K2_AGENTUR_KEYWORDS_P2_GOOGLE_DRUCK_URL } from './k2AgenturGoogleKeywordsP2'
import { K2_AGENTUR_KEYWORDS_P3_GOOGLE_DRUCK_URL } from './k2AgenturGoogleKeywordsP3'

export type StrategieDruckEintrag = {
  id: string
  label: string
  url: string
  produkt?: MarketingProduktId
}

export const K2_AGENTUR_MASTER_STRATEGIEN: readonly StrategieDruckEintrag[] = [
  { id: 'p1', label: 'Master P1 · K2 Galerie (Kunst-Pilot)', url: K2_AGENTUR_MASTER_STRATEGIE_P1_URL, produkt: 'p1' },
  { id: 'mein-weg', label: 'Master · Mein Weg (6 Sparten)', url: K2_AGENTUR_MASTER_STRATEGIE_MEIN_WEG_URL, produkt: 'p1' },
  { id: 'p2', label: 'Master P2 · VK2', url: K2_AGENTUR_MASTER_STRATEGIE_P2_URL, produkt: 'p2' },
  { id: 'p3', label: 'Master P3 · K2 Familie', url: K2_AGENTUR_MASTER_STRATEGIE_P3_URL, produkt: 'p3' },
]

export { K2_AGENTUR_MASTER_STRATEGIE_P2_URL } from './k2AgenturMasterStrategieP2'
export { K2_AGENTUR_MASTER_STRATEGIE_P3_URL } from './k2AgenturMasterStrategieP3'
export { K2_AGENTUR_MASTER_STRATEGIE_MEIN_WEG_URL } from './k2AgenturMasterStrategieMeinWeg'
export { K2_AGENTUR_KEYWORDS_P1_SPARTEN_DRUCK_URL } from './k2AgenturGoogleKeywordsP1Sparten'
export { K2_AGENTUR_KEYWORDS_P2_GOOGLE_DRUCK_URL } from './k2AgenturGoogleKeywordsP2'
export { K2_AGENTUR_KEYWORDS_P3_GOOGLE_DRUCK_URL } from './k2AgenturGoogleKeywordsP3'

export const K2_AGENTUR_KEYWORDS_DRUCK: readonly StrategieDruckEintrag[] = [
  { id: 'p1-kunst', label: 'Keywords P1 · Kunst (Pilot)', url: K2_AGENTUR_KEYWORDS_P1_GOOGLE_DRUCK_URL, produkt: 'p1' },
  { id: 'p1-sparten', label: 'Keywords P1 · 5 Sparten', url: K2_AGENTUR_KEYWORDS_P1_SPARTEN_DRUCK_URL, produkt: 'p1' },
  { id: 'p2', label: 'Keywords P2 · Google', url: K2_AGENTUR_KEYWORDS_P2_GOOGLE_DRUCK_URL, produkt: 'p2' },
  { id: 'p3', label: 'Keywords P3 · Google', url: K2_AGENTUR_KEYWORDS_P3_GOOGLE_DRUCK_URL, produkt: 'p3' },
]

function isP1Sparte(id: FocusDirectionId): id is P1SparteKeywordId {
  return id !== 'kunst'
}

/** Keyword-Block fürs Schalt-Paket / Fertige Anzeige. */
export function formatGoogleKeywordsForKanal(
  produkt: MarketingProduktId,
  kanal: MarketingPaidKanalId,
  options?: { p1Sparte?: FocusDirectionId; p1AlleSparten?: boolean },
): string | null {
  if (kanal !== 'google') return null
  if (produkt === 'p2') return formatGoogleKeywordsP2Block()
  if (produkt === 'p3') return formatGoogleKeywordsP3Block()
  if (produkt === 'p1') {
    if (options?.p1AlleSparten) return formatGoogleKeywordsP1AlleSpartenBlock()
    const sp = options?.p1Sparte
    if (sp && isP1Sparte(sp)) return formatGoogleKeywordsP1SparteBlock(sp)
    return formatGoogleKeywordsP1Block()
  }
  return null
}
