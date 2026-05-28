/**
 * Master-Strategie P1 · Mein Weg (sechs Sparten) – eine Seite für alle Richtungen.
 * Pilot-Start: Kunst · danach Anzeigengruppen je Sparte.
 */

import { FOCUS_DIRECTIONS } from './tenantConfig'
import { K2_AGENTUR_KEYWORDS_P1_GOOGLE_DRUCK_URL } from './k2AgenturGoogleKeywordsP1'
import { K2_AGENTUR_KEYWORDS_P1_SPARTEN_DRUCK_URL } from './k2AgenturGoogleKeywordsP1Sparten'
import { K2_AGENTUR_MASTER_STRATEGIE_P1_URL } from './k2AgenturMasterStrategieP1'

export const K2_AGENTUR_MASTER_STRATEGIE_MEIN_WEG_URL =
  '/texte-schreibtisch/k2-agentur-master-strategie-mein-weg.html'

export const MASTER_STRATEGIE_MEIN_WEG_EIN_SATZ =
  'Ein Produkt P1 (ök2 → Lizenz) – sechs Wege über „Mein Weg“ in den Stammdaten. Ads starten mit Kunst-Pilot, erweitern über eigene Anzeigengruppen und Keyword-Sets je Sparte.'

export const MASTER_STRATEGIE_MEIN_WEG_SPARTEN = FOCUS_DIRECTIONS.map((d) => ({
  id: d.id,
  label: d.label,
  pilot: d.id === 'kunst',
  keywordsDruck:
    d.id === 'kunst' ? K2_AGENTUR_KEYWORDS_P1_GOOGLE_DRUCK_URL : K2_AGENTUR_KEYWORDS_P1_SPARTEN_DRUCK_URL,
}))

export const MASTER_STRATEGIE_MEIN_WEG_ABLAUF = [
  'Phase A: Eine Google-Kampagne P1 · Landing ök2-Demo · Anzeigengruppe „Kunst“ (13 Keywords)',
  'Phase B: + Anzeigengruppe je Sparte (Handwerk, Design, Mode, Food, Dienstleister) – gleiche Final URL',
  'In ök2-Admin: Nutzer wählt „Mein Weg“ → passende Kategorien und Texte',
  'Vereine nicht in P1 – Produkt P2 VK2',
] as const

export const MASTER_STRATEGIE_MEIN_WEG_LINKS = {
  masterP1Kunst: K2_AGENTUR_MASTER_STRATEGIE_P1_URL,
  keywordsKunst: K2_AGENTUR_KEYWORDS_P1_GOOGLE_DRUCK_URL,
  keywordsSparten: K2_AGENTUR_KEYWORDS_P1_SPARTEN_DRUCK_URL,
} as const
