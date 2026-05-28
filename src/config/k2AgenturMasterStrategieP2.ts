/**
 * Master-Strategie P2 (VK2 Vereinsplattform) – eine Quelle für Druck, Agentur, Plan B.
 */

import { buildMarketingCampaignKey } from './marketingKanalP1P2P3'
import { PROJECT_ROUTES } from './navigation'

export const K2_AGENTUR_MASTER_STRATEGIE_P2_URL =
  '/texte-schreibtisch/k2-agentur-master-strategie-p2.html'

export const MASTER_STRATEGIE_P2_META = {
  titel: 'Master-Strategie P2 – VK2',
  produkt: 'P2 · VK2 Vereinsplattform',
  demo: 'VK2-Demo-Galerie (Muster-Verein)',
  prioritaetKanal: 'Google Ads · Suche (DACH)',
  kampagnenKey: buildMarketingCampaignKey('p2', 'google'),
  landingPfad: PROJECT_ROUTES.vk2.galerie,
  checkoutPfad: PROJECT_ROUTES['k2-galerie'].lizenzKaufen,
  stand: 'Mai 2026',
} as const

export const MASTER_STRATEGIE_P2_EIN_SATZ =
  'Kunst- und Kulturvereine, die Mitglieder, Werke und Öffentlichkeitsarbeit professionell bündeln wollen – zuerst VK2-Demo, dann Vereins-Lizenz (Pro-Stufe / VK2-Konditionen).'

export const MASTER_STRATEGIE_P2_ZIELGRUPPE = {
  wer: [
    'Vorstand / Geschäftsführung kleiner und mittlerer Kunst- und Kulturvereine',
    'Vereine mit Mitgliedern, Werken, Ausstellungen oder Vereinsgalerie',
    'DACH, Deutsch, aktiv suchend (Google) oder LinkedIn (Vorstand)',
  ],
  nicht: [
    'Sportvereine, reine Hobbygruppen ohne öffentlichen Auftritt',
    'Einzelkünstler:innen ohne Verein → P1 K2 Galerie',
    'Private Familienarchive → P3 K2 Familie',
  ],
  hypothesenGoogle:
    '12 Keywords (Priorität 1–12) + Negativ-Liste – k2-agentur-keywords-p2-google.html / Schalt-Paket P2 Google',
  validieren: 'Suchbegriffe, CTR, Demo-Klicks, erste Vereins-Lizenz – Steuerzentrale + Google Ads',
} as const

export const MASTER_STRATEGIE_P2_POSITIONIERUNG = {
  kern: 'Vereinsplattform: Galerie, Mitglieder, Events – ein Auftritt statt verstreuter Kanäle.',
  gegenSocial: 'Mehr als eine Facebook-Seite: strukturierte Mitgliederliste, Werke, Einladungen.',
  demoVersprechen: 'VK2-Demo mit Muster-Verein – sofort erlebbar für den Vorstand.',
  headlines: ['Vereinsgalerie online', 'VK2 für Kunstvereine', 'Mitglieder & Werke'],
} as const

export const MASTER_STRATEGIE_P2_PILOT = {
  budgetHinweis: 'Start nach P1-Pilot oder parallel mit kleinem Budget (z. B. 100–200 € Test)',
  ampelRegel: '≥ 25 € Werbekosten in 7 Tagen ohne erste Lizenz → Pause (wie P1)',
  erfolg: 'Erste bezahlte Lizenz (Verein) über Stripe · Attribution k=p2-google-*',
  planB: 'K2 Agentur: Schalt-Paket P2, Fertige Anzeige, Steuerzentrale',
} as const
