/**
 * Master-Strategie P3 (K2 Familie) – eine Quelle für Druck, Agentur, Plan B.
 */

import {
  PRODUCT_K2_FAMILIE_WERBE_KERN_KOMPAKT,
  PRODUCT_K2_FAMILIE_WERBESLOGAN,
} from './tenantConfig'
import { buildMarketingCampaignKey } from './marketingKanalP1P2P3'
import { getMusterfamilieHuberMeineFamiliePathWithQuery } from '../data/k2FamilieMusterHuberQuelle'
import { PROJECT_ROUTES } from './navigation'

export const K2_AGENTUR_MASTER_STRATEGIE_P3_URL =
  '/texte-schreibtisch/k2-agentur-master-strategie-p3.html'

export const MASTER_STRATEGIE_P3_META = {
  titel: 'Master-Strategie P3 – K2 Familie',
  produkt: 'P3 · K2 Familie',
  demo: 'Musterfamilie Huber (Meine Familie)',
  prioritaetKanal: 'Google Ads · Suche (DACH)',
  kampagnenKey: buildMarketingCampaignKey('p3', 'google'),
  landingPfad: getMusterfamilieHuberMeineFamiliePathWithQuery(),
  checkoutPfad: PROJECT_ROUTES['k2-familie'].lizenzErwerben,
  stand: 'Mai 2026',
} as const

export const MASTER_STRATEGIE_P3_EIN_SATZ =
  'Familien, die Geschichten, Fotos und Stammbaum privat und dauerhaft bündeln wollen – Demo ohne Anmeldung, dann Familien-Lizenz. Keine kommerzielle Verwertung der Daten.'

export const MASTER_STRATEGIE_P3_ZIELGRUPPE = {
  wer: [
    'Familien mit Interesse an Chronik, Stammbaum, gemeinsamen Erinnerungen',
    '40–70 Jahre, DACH, Deutsch – oft aktiv suchend oder Meta (Familie/Genealogie)',
    'Verantwortliche für Familienbuch / Familientreffen',
  ],
  nicht: [
    'Professionelle Genealogie-Agenturen (B2B-Dienstleister)',
    'Öffentliche Galerien / Vereine → P1/P2',
    'Nutzer, die nur Social-Media-Sharing wollen',
  ],
  hypothesenGoogle:
    '12 Keywords (Priorität 1–12) + Negativ-Liste – k2-agentur-keywords-p3-google.html',
  validieren: 'Demo-Besuche, erste Familien-Lizenz, Kosten/Lizenz – Steuerzentrale',
} as const

export const MASTER_STRATEGIE_P3_POSITIONIERUNG = {
  kern: PRODUCT_K2_FAMILIE_WERBESLOGAN,
  kern2: PRODUCT_K2_FAMILIE_WERBE_KERN_KOMPAKT,
  gegenCloud: 'Privat bei euch – nicht öffentlich, nicht verkauft. Raumschiff-Qualitätsanspruch.',
  demoVersprechen: 'Musterfamilie Huber – Demo ohne Anmeldung.',
  headlines: ['Stammbaum & Erinnerungen', 'K2 Familie – Demo', 'Geschichten für die Familie'],
} as const

export const MASTER_STRATEGIE_P3_PILOT = {
  budgetHinweis: 'Eigener Test nach P1 oder parallel mit kleinem Budget',
  ampelRegel: '≥ 25 € in 7 Tagen ohne erste Lizenz → Pause',
  erfolg: 'Erste bezahlte K2-Familie-Lizenz · Attribution k=p3-google-*',
  planB: 'K2 Agentur: Schalt-Paket P3, Fertige Anzeige, Steuerzentrale',
} as const
