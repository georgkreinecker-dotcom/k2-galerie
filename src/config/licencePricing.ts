/**
 * Verbindliche Lizenzpreise – eine Quelle für LicencesPage, Guide und LicenseManager.
 * Hier sind die festgelegten Gebühren; überall dieselben Werte anzeigen.
 */

export const LIZENZPREISE = {
  basic: { name: 'Basic', price: '15 €/Monat', priceEur: 15 },
  pro: { name: 'Pro', price: '35 €/Monat', priceEur: 35 },
  proplus: { name: 'Pro+', price: '45 €/Monat', priceEur: 45 },
  vk2: { name: 'Kunstvereine (VK2)', priceLabel: 'ab 10 Mitgliedern kostenfrei', priceEur: null as number | null },
} as const
