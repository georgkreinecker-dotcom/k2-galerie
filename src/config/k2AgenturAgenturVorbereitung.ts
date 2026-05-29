/**
 * K2 Agentur – Vorbereitung Agentur-Partnerschaft (Arno / 5-Punkte-Rahmen).
 * Eine Quelle für Doku, Druckvorlage und UI (Option B in K2 Agentur).
 */

import { K2_AGENTUR_MASTER_STRATEGIE_P1_URL } from './k2AgenturMasterStrategieP1'
import { K2_AGENTUR_MASTER_STRATEGIE_P2_URL } from './k2AgenturMasterStrategieP2'
import { K2_AGENTUR_MASTER_STRATEGIE_P3_URL } from './k2AgenturMasterStrategieP3'
import { K2_AGENTUR_MASTER_STRATEGIE_MEIN_WEG_URL } from './k2AgenturMasterStrategieMeinWeg'
import { buildMarketingKanalUrl } from './marketingKanalP1P2P3'
import { AGB_ROUTE, PROJECT_ROUTES } from './navigation'

export type AgenturFuenfPunkteAmpel = 'gruen' | 'gelb'

export type AgenturFuenfPunkteEintrag = {
  nr: 1 | 2 | 3 | 4 | 5
  titel: string
  ampel: AgenturFuenfPunkteAmpel
  statusKurz: string
  vorhanden: string[]
  feinschliff: string[]
  /** Interne Quellen – relative Pfade im Repo / App */
  quellen: string[]
}

export const K2_AGENTUR_PARTNER_MAIL_GESENDET_LABEL = 'Antwort an Agentur (Grow-SaaS / Arno Schambach) versendet – Mai 2026'

export const ARNOS_FUENF_PUNKTE: AgenturFuenfPunkteEintrag[] = [
  {
    nr: 1,
    titel: 'Vertriebs- und Marketingstrategie klar definiert',
    ampel: 'gruen',
    statusKurz: 'Weitgehend vorhanden',
    vorhanden: [
      'Drei Produkte P1/P2/P3 mit eigener Landing- und Checkout-Logik',
      'Neun Kanäle (Google, Meta, LinkedIn je Produkt) mit Kampagnenschlüssel k=',
      'K2 Agentur: Checkliste, Schalt-Paket, fertige Anzeige, Priorisierung (Start P1 · Google)',
      'Plan B ohne Agentur-Fixhonorar dokumentiert',
    ],
    feinschliff: [
      'Master P1, P2, P3 und Mein Weg (6 Sparten) – Druck in K2 Agentur → Strategie & Keywords',
    ],
    quellen: [
      'docs/MARKETING-KANAL-P1-P2-P3-EINRICHTUNG.md',
      'public/texte-schreibtisch/agentur-anforderungskatalog-internetvertrieb.html',
      'src/config/marketingKanalP1P2P3.ts',
    ],
  },
  {
    nr: 2,
    titel: 'Zielgruppen und Positionierung validiert',
    ampel: 'gelb',
    statusKurz: 'Hypothesen vorhanden – Validierung mit Live-Daten offen',
    vorhanden: [
      'Zielgruppen-Hinweise je Kanal in Schalt-Paket (Keywords, Interessen, LinkedIn)',
      'Positionierung und USPs in mök2 und Anforderungskatalog',
      'Marktgrößen-Schätzungen DACH (P1, P3 Familie)',
    ],
    feinschliff: [
      'Pilot P1 Google: CTR, CPC, Suchbegriffe, Conversions auswerten',
      'Negativ-Keywords und Zielgruppen nach 2–4 Wochen Live schärfen',
    ],
    quellen: [
      'src/config/k2AgenturLaunchCheckliste.ts (ZIELGRUPPE_HINT)',
      'docs/MARKTGROESSE-DACH-SCHAETZUNG.md',
      'docs/K2-FAMILIE-MARKTGROESSE-DACH-SCHAETZUNG.md',
    ],
  },
  {
    nr: 3,
    titel: 'Performante Landingpages und Creatives',
    ampel: 'gruen',
    statusKurz: 'Operative Basis vorhanden',
    vorhanden: [
      'Landings: ök2-Demo (P1), VK2-Galerie (P2), Huber-Familie (P3)',
      'Fertige Anzeigen-Texte pro Kanal (Headlines, Beschreibungen, Finale URL)',
      'CTA- und Checkout-Pfade je Produkt',
    ],
    feinschliff: [
      'A/B-Varianten (Headlines, ggf. zweites Creative)',
      'Ladezeit/UX-Feintuning auf Mobile',
    ],
    quellen: [
      'src/config/k2AgenturAnzeigenTexte.ts',
      'docs/MARKETING-KANAL-P1-P2-P3-EINRICHTUNG.md',
    ],
  },
  {
    nr: 4,
    titel: 'Technische Infrastruktur und Tracking',
    ampel: 'gruen',
    statusKurz: 'Vorhanden – Phase A manuell',
    vorhanden: [
      'k=/UTM-Attribution, Marketing-Events (landing, conversion_licence)',
      'API marketing-attribution (Summary 7 Tage)',
      'Steuerzentrale: Ampel, Regeln, Kostenfeld 7 Tage',
    ],
    feinschliff: ['Optional Phase B: Kosten/Klicks automatisch aus Google Ads API'],
    quellen: [
      'docs/K2-AGENTUR-REICHWEITE-PHASE-A.md',
      'src/config/k2AgenturSteuerRegeln.ts',
      'api/marketing-attribution (Vercel)',
    ],
  },
  {
    nr: 5,
    titel: 'Belastbarer Sales-Prozess',
    ampel: 'gruen',
    statusKurz: 'Klick bis Lizenz definiert',
    vorhanden: [
      'Stripe-Checkout je Produkt, Erfolg = erste bezahlte Lizenz',
      '7-Tage-Auswertung und Ampel-Entscheidung in K2 Agentur',
      'Attribution für spätere CPA-Abrechnung vorbereitet',
    ],
    feinschliff: [
      'Sales-/Reaktions-Playbook schriftlich (rote Ampel, Budgetgrenzen, wer reagiert)',
    ],
    quellen: [
      'public/texte-schreibtisch/agentur-anforderungskatalog-internetvertrieb.html (B.5, B.6)',
      'docs/K2-AGENTUR-REICHWEITE-PHASE-A.md',
    ],
  },
]

export type AgenturAktionsSchritt = {
  id: string
  label: string
  hint: string
  /** Zuordnung zu Arno-Punkt 1–5 */
  punktNr?: 1 | 2 | 3 | 4 | 5
  /** Druck/PDF im Schreibtisch */
  druckUrl?: string
  /** Test-Link (relativ, gleiche Origin wie APf) */
  testPath?: string
}

/** Themen aus Partner-Rückmeldung (Conversion-ready) – ohne externe Agentur umsetzbar */
export type PartnerRueckmeldungKategorie = 'strecke' | 'angebot' | 'vertrauen' | 'positionierung' | 'messung'

export type PartnerRueckmeldungSchritt = AgenturAktionsSchritt & {
  kategorie: PartnerRueckmeldungKategorie
  kategorieLabel: string
}

const P1_GOOGLE_LANDING = buildMarketingKanalUrl('p1', 'google', { absolute: false })

/** Feinschliff bei uns – vor / parallel zur Agentur-Validierung */
export const K2_AGENTUR_FEINSCHLIFF_SCHRITTE: AgenturAktionsSchritt[] = [
  {
    id: 'fein-master-strategie-1seite',
    label: 'Master-Strategie P1 (1 Seite)',
    hint: 'Druck/PDF für Agentur und Plan B – Zielgruppe, Pilot Google, Ampel.',
    punktNr: 1,
    druckUrl: K2_AGENTUR_MASTER_STRATEGIE_P1_URL,
  },
  {
    id: 'fein-master-mein-weg',
    label: 'Master Mein Weg (6 Sparten)',
    hint: 'Eine Seite: alle Richtungen, Ablauf Anzeigengruppen, Links zu Keyword-Drucken.',
    punktNr: 1,
    druckUrl: K2_AGENTUR_MASTER_STRATEGIE_MEIN_WEG_URL,
  },
  {
    id: 'fein-master-p2',
    label: 'Master-Strategie P2 (VK2)',
    hint: 'Vereine – Landing VK2-Demo, Keywords im Schalt-Paket P2 Google.',
    punktNr: 1,
    druckUrl: K2_AGENTUR_MASTER_STRATEGIE_P2_URL,
  },
  {
    id: 'fein-master-p3',
    label: 'Master-Strategie P3 (K2 Familie)',
    hint: 'Familien – Demo Huber, Keywords im Schalt-Paket P3 Google.',
    punktNr: 1,
    druckUrl: K2_AGENTUR_MASTER_STRATEGIE_P3_URL,
  },
  {
    id: 'fein-pilot-p1-google-live',
    label: 'Pilot P1 · Google Ads live schalten',
    hint: 'Checkliste in K2 Agentur – Fertige Anzeige, Status Live, Kosten nach 7 Tagen eintragen.',
    punktNr: 2,
  },
  {
    id: 'fein-zielgruppe-auswerten',
    label: 'Zielgruppe/Keywords nach Pilot auswerten',
    hint: 'Suchbegriffe, CTR, Kosten/Lizenz – Notiz in Kanal oder Steuerzentrale.',
    punktNr: 2,
  },
  {
    id: 'fein-creative-variante-b',
    label: 'Zweite Creative-Variante (optional)',
    hint: 'Headline oder Beschreibung B in Google Ads testen.',
    punktNr: 3,
  },
  {
    id: 'fein-sales-playbook',
    label: 'Sales-Playbook 1 Seite',
    hint: 'Wer reagiert bei roter Ampel, Wochenbudget-Obergrenze, wann pausieren.',
    punktNr: 5,
  },
]

/**
 * Verbesserungen aus Agentur-Rückmeldung („noch nicht conversion-ready“) –
 * wir fahren mit K2 Agentur weiter und arbeiten das selbst ab (Plan B).
 */
export const K2_AGENTUR_PARTNER_RUECKMELDUNG_SCHRITTE: PartnerRueckmeldungSchritt[] = [
  {
    id: 'rueck-strecke-e2e',
    kategorie: 'strecke',
    kategorieLabel: 'Conversion-Strecke',
    label: 'Ganze Strecke einmal durchspielen',
    hint: 'Klick wie ein Kunde: Demo ansehen → Lizenz wählen → Checkout → Erfolgsseite. Mac und Handy.',
    punktNr: 3,
    testPath: P1_GOOGLE_LANDING,
  },
  {
    id: 'rueck-angebot-preise',
    kategorie: 'angebot',
    kategorieLabel: 'Angebotsklarheit',
    label: 'Preise & Stufen vor dem Kauf sichtbar',
    hint: 'Auf der Lizenz-Seite: Was kostet was? Demo ist Muster – Lizenz ist eigene Galerie.',
    punktNr: 5,
    testPath: PROJECT_ROUTES['k2-galerie'].lizenzKaufen,
  },
  {
    id: 'rueck-demo-vs-lizenz',
    kategorie: 'angebot',
    kategorieLabel: 'Angebotsklarheit',
    label: 'Demo vs. Lizenz in einem Satz auf der Landing',
    hint: 'Besucher versteht sofort: hier ausprobieren – dort kaufen. Kein Rätselraten.',
    punktNr: 3,
    testPath: P1_GOOGLE_LANDING,
  },
  {
    id: 'rueck-vertrauen-footer',
    kategorie: 'vertrauen',
    kategorieLabel: 'Vertrauen',
    label: 'Impressum, AGB, kgm solution erreichbar',
    hint: 'Von der Demo-Galerie aus: seriöser Kontakt, kein „leerer“ Fuß.',
    punktNr: 3,
    testPath: AGB_ROUTE,
  },
  {
    id: 'rueck-nutzen-oben',
    kategorie: 'positionierung',
    kategorieLabel: 'Positionierung',
    label: 'Drei Nutzen-Sätze im ersten Bildschirm',
    hint: 'Nutzen für Künstler:innen (sichtbar, verkaufen, einfach) – nicht Technik-Features.',
    punktNr: 2,
    testPath: P1_GOOGLE_LANDING,
  },
  {
    id: 'rueck-anzeige-landing',
    kategorie: 'positionierung',
    kategorieLabel: 'Positionierung',
    label: 'Anzeige und Landing passen zusammen',
    hint: 'Headlines aus „Fertige Anzeige“ = gleiche Botschaft wie erster Eindruck auf der Galerie.',
    punktNr: 3,
  },
  {
    id: 'rueck-mobile-cta',
    kategorie: 'strecke',
    kategorieLabel: 'Conversion-Strecke',
    label: 'Handy: Lizenz-Button & Checkout lesbar',
    hint: 'Ohne langes Suchen: CTA sichtbar, Formular und Bezahlung ohne Zoom-Fummeln.',
    punktNr: 3,
    testPath: P1_GOOGLE_LANDING,
  },
  {
    id: 'rueck-pilot-7tage',
    kategorie: 'messung',
    kategorieLabel: 'Messung (Pilot)',
    label: 'Nach Google-Freigabe: 7 Tage auswerten',
    hint: 'Kosten eintragen, Lizenzen zählen, Ampel in Steuerzentrale – Suchbegriffe/CTR notieren.',
    punktNr: 2,
  },
  {
    id: 'rueck-creative-b',
    kategorie: 'messung',
    kategorieLabel: 'Messung (Pilot)',
    label: 'Zweite Anzeigen-Variante (optional)',
    hint: 'Headline B in Google – nur wenn Strecke und Angebot oben grün sind.',
    punktNr: 3,
  },
]

/** Wenn die Agentur ein Angebot schickt – Punkt für Punkt prüfen */
export const K2_AGENTUR_ANGEBOT_PRUEFUNG: AgenturAktionsSchritt[] = [
  {
    id: 'ang-scope',
    label: 'Scope Validierungsphase klar',
    hint: 'Nur Feinschliff/Validierung – kein „alles neu bauen“.',
  },
  {
    id: 'ang-dauer',
    label: 'Feste Laufzeit (z. B. 2–4 Wochen)',
    hint: 'Kein offenes Projektmanagement ohne Ende.',
  },
  {
    id: 'ang-deckel',
    label: 'Budgetdeckel in Euro (Fixpreis)',
    hint: 'Startup: keine unbegrenzte Stundenkasse.',
  },
  {
    id: 'ang-kpi',
    label: 'KPI- und Abnahmekriterien',
    hint: 'Was muss am Ende der Phase messbar/documentiert sein?',
  },
  {
    id: 'ang-kein-retainer',
    label: 'Kein Retainer / kein Setup-Honorar ohne Deckel',
    hint: 'Unser Ziel: danach nur Erfolgsvergütung (CPA/%).',
  },
  {
    id: 'ang-erfolgsmodell',
    label: 'Anschließendes Erfolgsmodell konkret',
    hint: 'CPA pro Produkt/Stufe oder % erste Zahlung – Tabelle B.6.',
  },
  {
    id: 'ang-medien-modell',
    label: 'Medienkosten: Modell A oder B klar',
    hint: 'A = wir zahlen Google direkt; B = All-in-CPA – transparent.',
  },
  {
    id: 'ang-chancen-risiko',
    label: 'Erfolgsanteil deckt Chancen und Risiken',
    hint: 'Fair für Startup mit geringen Ressourcen – nicht nur Agentur-Vorteil.',
  },
]

export const K2_AGENTUR_VERHANDLUNG_KERN = {
  kurzfazit:
    'Kein Null-Setup – substantielle Basis vorhanden. Agentur liefert Validierung und Performance-Feintuning auf unserem Fundament.',
  leitplanken: [
    'Begrenzte Validierungsphase (Scope, Dauer, Deckel, KPI)',
    'Danach verbindlich erfolgsabhängig (CPA oder % erste Zahlung)',
    'Keine Agentur-Fixkosten ohne Obergrenze',
    'Wer überzeugt ist, verdient am messbaren Erfolg',
  ],
  angebotAnfordern: [
    'Scope der Validierungsphase',
    'Dauer',
    'Budgetdeckel',
    'KPI- und Abnahmekriterien',
    'Anschließendes Erfolgsmodell (CPA/%, Medien Modell A oder B)',
  ],
} as const

export const K2_AGENTUR_PARTNER_DRUCK_URL =
  '/texte-schreibtisch/k2-agentur-agentur-partner-vorbereitung.html'

export const K2_AGENTUR_PARTNER_RUECKMELDUNG_DRUCK_URL =
  '/texte-schreibtisch/agentur-rueckmeldung-verbesserungen-p1.html'

export { K2_AGENTUR_MASTER_STRATEGIE_P1_URL } from './k2AgenturMasterStrategieP1'

export const K2_AGENTUR_PARTNER_DOKU_PATH = 'docs/K2-AGENTUR-AGENTUR-PARTNER-VORBEREITUNG.md'
