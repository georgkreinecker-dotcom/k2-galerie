/**
 * Verbindliche Lizenzpreise – eine Quelle für LicencesPage, Guide, LicenseManager, Stripe.
 * Öffentlich: Basic · Pro (alles inkl.) · VK2. Pro+/Pro++ = Legacy (Altdaten, gleicher Preis wie Pro).
 */

/** Eingeladene Testpilot:innen (Testprotokoll) – nicht in Google Ads verwenden. */
export const LIZENZ_PILOT_TESTPHASE_WOCHEN = 4
export const LIZENZ_PILOT_TESTPHASE_TAGE = LIZENZ_PILOT_TESTPHASE_WOCHEN * 7

/** @deprecated Alias – nur Pilot-Doku */
export const LIZENZ_TESTPHASE_WOCHEN = LIZENZ_PILOT_TESTPHASE_WOCHEN
export const LIZENZ_TESTPHASE_TAGE = LIZENZ_PILOT_TESTPHASE_TAGE

export const LIZENZPREISE = {
  basic: {
    name: 'Basic',
    price: '10 €/Monat',
    priceEur: 10,
    summary: 'Bis 30 Werke, Galerie, Events, Etiketten, Standard-URL – ohne Kassa',
  },
  pro: {
    name: 'Pro',
    price: '25 €/Monat',
    priceEur: 25,
    summary:
      'Alles in einer App: unbegrenzte Werke, Custom Domain, Kassa, Marketing, Rechnung § 11 UStG, Buchhaltung',
    features: [
      'Unbegrenzte Werke',
      'Custom Domain (eigene Adresse)',
      'Kassa, volles Kassabuch, Rechnung (§ 11 UStG)',
      'Gesamter Marketingbereich: Events, Flyer, Presse, Social, Plakat, PR',
      'Buchhaltung: CSV, Belege als PDF – Vorarbeit für Steuerberater',
    ],
  },
  vk2: {
    name: 'Kunstvereine (VK2)',
    price: '25 €/Monat',
    priceLabel: '25 €/Monat; ab 10 Vereinsmitgliedern für den Verein kostenfrei',
    priceSubtitle: 'Ab 10 registrierten Vereinsmitgliedern ist die Vereinslizenz für den Verein kostenfrei.',
    priceEur: 25,
  },
} as const

/** Öffentliche UI – ehrlich: Demo ansehen, Lizenz kostet ab Abschluss (kein „gratis testen“ in Werbung). */
export const LIZENZ_PUBLIC_OFFER_LINE = `Demo zuerst ansehen · Lizenz ab ${LIZENZPREISE.basic.price} (Stripe-Monatsabo)`

/** @deprecated Bitte LIZENZ_PUBLIC_OFFER_LINE nutzen – Name bleibt für bestehende Imports. */
export const LIZENZ_TESTPHASE_LABEL = LIZENZ_PUBLIC_OFFER_LINE

export type PublicLicenceTierId = 'basic' | 'pro' | 'vk2'

/** Karten für öffentliche UI (mök2 Lizenzen, Lizenz kaufen, Einstellungen) */
export function getPublicLicenceTierCards(): Array<{
  id: PublicLicenceTierId
  name: string
  price: string
  priceEur: number
  summary: string
  icon: string
  highlight?: boolean
}> {
  return [
    {
      id: 'basic',
      name: LIZENZPREISE.basic.name,
      price: LIZENZPREISE.basic.price,
      priceEur: LIZENZPREISE.basic.priceEur,
      summary: LIZENZPREISE.basic.summary,
      icon: '🎨',
    },
    {
      id: 'pro',
      name: LIZENZPREISE.pro.name,
      price: LIZENZPREISE.pro.price,
      priceEur: LIZENZPREISE.pro.priceEur,
      summary: LIZENZPREISE.pro.summary,
      icon: '⭐',
      highlight: true,
    },
    {
      id: 'vk2',
      name: LIZENZPREISE.vk2.name,
      price: LIZENZPREISE.vk2.price,
      priceEur: LIZENZPREISE.vk2.priceEur,
      summary: 'Vereinsplattform wie Pro; ab 10 Mitgliedern für den Verein kostenfrei; Lizenzmitglieder 50 % Rabatt',
      icon: '🏛️',
    },
  ]
}

/** Voller Pro-Umfang (Marketing, Kassabuch, Rechnung) – inkl. Legacy-Stufen */
export function isFullProLicenceType(licenceType: string | undefined | null): boolean {
  const lt = (licenceType || '').trim()
  return lt === 'pro' || lt === 'proplus' || lt === 'propplus'
}

/** Alte Stufen in DB/localStorage → heute Pro (voller Umfang) */
export function normalizeLicenceTypeForDisplay(licenceType: string | undefined | null): 'basic' | 'pro' | 'vk2' | string {
  const lt = (licenceType || '').trim()
  if (lt === 'proplus' || lt === 'propplus' || lt === 'excellent') return 'pro'
  return lt
}

/** Stripe/API: proplus/propplus → pro (Neukauf nur noch basic | pro) */
export function normalizeCheckoutLicenceType(licenceType: string): 'basic' | 'pro' {
  const lt = (licenceType || '').trim()
  if (lt === 'basic') return 'basic'
  return 'pro'
}

/**
 * K2 Familie – eigene Lizenzpreise; Checkout über dieselbe `/api/create-checkout`-Kette wie K2 Galerie (Stripe).
 */
export const K2_FAMILIE_LIZENZPREISE = {
  familie_monat: {
    name: 'K2 Familie Monatslizenz',
    price: '10 €/Monat (Abo)',
    priceEur: 10,
  },
  familie_jahr: {
    name: 'K2 Familie Jahreslizenz',
    price: '100 €/Jahr (einmalig)',
    priceEur: 100,
  },
} as const
