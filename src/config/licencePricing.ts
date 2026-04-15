/**
 * Verbindliche Lizenzpreise – eine Quelle für LicencesPage, Guide und LicenseManager.
 * Hier sind die festgelegten Gebühren; überall dieselben Werte anzeigen.
 */

export const LIZENZPREISE = {
  basic: { name: 'Basic', price: '15 €/Monat', priceEur: 15 },
  pro: { name: 'Pro', price: '35 €/Monat', priceEur: 35 },
  proplus: { name: 'Pro+', price: '45 €/Monat', priceEur: 45 },
  propplus: { name: 'Pro++', price: '55 €/Monat', priceEur: 55 },
  vk2: {
    name: 'Kunstvereine (VK2)',
    /** Hauptpreis wie Pro (Stripe-Checkout nutzt licenceType „pro“) */
    price: '35 €/Monat (wie Pro)',
    /** Kurz für Karten/Fußzeilen */
    priceLabel: '35 €/Monat (wie Pro); ab 10 Vereinsmitgliedern für den Verein kostenfrei',
    /** Erklärung unter der Preiszeile */
    priceSubtitle: 'Ab 10 registrierten Vereinsmitgliedern ist die Vereinslizenz für den Verein kostenfrei.',
    /** Entspricht Pro – für Abgleiche; vk2 ist kein eigener Stripe-Produktcode */
    priceEur: 35,
  },
} as const

/**
 * K2 Familie – eigene Lizenzpreise; Checkout über dieselbe `/api/create-checkout`-Kette wie K2 Galerie (Stripe).
 * `licenceType`: `familie_monat` | `familie_jahr`
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
