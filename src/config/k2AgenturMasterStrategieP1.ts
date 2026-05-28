/**
 * Master-Strategie P1 (K2 Galerie / ök2-Demo) – eine Quelle für Druck, Agentur, Plan B.
 * Druck/PDF: public/texte-schreibtisch/k2-agentur-master-strategie-p1.html
 */

import { PRODUCT_WERBESLOGAN, PRODUCT_WERBESLOGAN_2 } from './tenantConfig'
import { PROJECT_ROUTES } from './navigation'
import { buildMarketingCampaignKey } from './marketingKanalP1P2P3'

export const K2_AGENTUR_MASTER_STRATEGIE_P1_URL =
  '/texte-schreibtisch/k2-agentur-master-strategie-p1.html'

export const MASTER_STRATEGIE_P1_META = {
  titel: 'Master-Strategie P1 – K2 Galerie',
  produkt: 'P1 · K2 Galerie (Lizenz)',
  demo: 'ök2 – öffentliche Demo-Galerie',
  prioritaetKanal: 'Google Ads · Suche (DACH)',
  kampagnenKey: buildMarketingCampaignKey('p1', 'google'),
  landingPfad: PROJECT_ROUTES['k2-galerie'].galerieOeffentlich,
  checkoutPfad: PROJECT_ROUTES['k2-galerie'].lizenzKaufen,
  stand: 'Mai 2026',
} as const

export const MASTER_STRATEGIE_P1_EIN_SATZ =
  'Künstler:innen und kleine Galerien mit Ideen, die professionell gesehen werden wollen – zuerst über die kostenlose ök2-Demo überzeugen, dann Lizenz (Galerie, Shop, Tour).'

export const MASTER_STRATEGIE_P1_ZIELGRUPPE = {
  wer: [
    'Künstler:innen (Malerei, Keramik, Grafik, Skulptur) mit Verkauf oder Ausstellung',
    'Kleine Galerien / Ateliers mit eigenem Sortiment und Wunsch nach eigenem Webauftritt',
    'DACH, Deutsch, aktiv suchend oder social-affin (Pilot: Google Suche)',
  ],
  nicht: [
    'Reine Hobby ohne Verkauf/Auftritt',
    'Große institutionelle Galerien (Enterprise)',
    'Vereine mit Schwerpunkt Mitgliederverwaltung → Produkt P2 (VK2)',
  ],
  hypothesenGoogle:
    '13 Keywords (Priorität 1–13) + Negativ-Liste – siehe k2AgenturGoogleKeywordsP1.ts / Druck keywords-p1-google',
  validieren:
    'Suchbegriffe, CTR, CPC, Kosten pro erster Lizenz – nach 7–14 Tagen Pilot auswerten (Steuerzentrale + Google Ads)',
} as const

export const MASTER_STRATEGIE_P1_POSITIONIERUNG = {
  kern: PRODUCT_WERBESLOGAN,
  kern2: PRODUCT_WERBESLOGAN_2,
  gegenInsta: 'Mehr als Feed-Post: eigene Galerie, Shop, Etiketten, Events – professionell und dauerhaft.',
  demoVersprechen: 'ök2-Demo ohne Anmeldung – Musterwerke, sofort erlebbar.',
  headlines: ['K2 Galerie – Demo', 'Ideen, die gesehen werden', 'Mehr als ein Insta-Post'],
} as const

export const MASTER_STRATEGIE_P1_PILOT = {
  budgetHinweis: 'Start z. B. 150–300 € Test (7 Tage beobachten)',
  ampelRegel: '≥ 25 € Werbekosten in 7 Tagen ohne erste Lizenz → Pause empfohlen (Steuerzentrale)',
  erfolg: 'Erste bezahlte Lizenz über Stripe-Checkout (Attribution über k= / UTM)',
  planB: 'K2 Agentur: Checkliste, Fertige Anzeige, Steuerzentrale – ohne Agentur-Fixhonorar',
  agenturOptional:
    'Externe Agentur nur bei Deckel + danach CPA/% – sonst selbst schalten und optimieren',
} as const

export const MASTER_STRATEGIE_P1_MARKT_HINWEIS =
  'Adressierbarer Kern „Kunst“ DACH grob ~70.000 (Schätzung) – Pilot validiert Segment, nicht Gesamtmarkt.'
