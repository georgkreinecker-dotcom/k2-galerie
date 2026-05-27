/**
 * K2 Agentur – Schalt-Checkliste (Sportwagen: eine Quelle, viele Kanäle).
 * Schritte + Schalt-Paket-Text + Plattform-Links – nur hier pflegen.
 */
import {
  buildMarketingCampaignKey,
  listMarketingKanalUrls,
  type MarketingPaidKanalId,
  type MarketingProduktId,
} from './marketingKanalP1P2P3'

export type LaunchStepDef = {
  id: string
  label: string
  hint: string
  /** Nach „Schalt-Paket kopieren“ automatisch abhaken (Ziel-URL-Schritt). */
  autoOnPaketKopiert?: boolean
  /** Nach „Anzeigen-Paket kopieren“ automatisch abhaken. */
  autoOnAnzeigenKopiert?: boolean
}

/** Einmal pro Plattform (nicht 9× wiederholen). */
export const K2_AGENTUR_GLOBAL_LAUNCH_STEPS: LaunchStepDef[] = [
  {
    id: 'global-google-konto',
    label: 'Google Ads – Konto + Zahlungsmittel',
    hint: 'ads.google.com – Werbekonto anlegen, Rechnungsdaten hinterlegen.',
  },
  {
    id: 'global-meta-konto',
    label: 'Meta – Business Manager + Werbekonto',
    hint: 'business.facebook.com – Seite/Instagram verknüpfen, Zahlung hinterlegen.',
  },
  {
    id: 'global-linkedin-konto',
    label: 'LinkedIn – Campaign Manager + Zahlung',
    hint: 'linkedin.com/campaignmanager – Konto aktiv, Zahlungsmethode hinterlegen.',
  },
]

/** Pro Kanal (P1/P2/P3 × Google/Meta/LinkedIn) – dieselben Schritte überall. */
export const K2_AGENTUR_KANAL_LAUNCH_STEPS: LaunchStepDef[] = [
  {
    id: 'kampagne-angelegt',
    label: 'Kampagne angelegt',
    hint: 'Neue Kampagne; Name = Kampagnenname aus dem Schalt-Paket.',
  },
  {
    id: 'budget-gesetzt',
    label: 'Tagesbudget / Monatsbudget gesetzt',
    hint: 'Kleiner Testbetrag (z. B. 5–15 €/Tag), später erhöhen.',
  },
  {
    id: 'zielgruppe-keywords',
    label: 'Zielgruppe oder Keywords',
    hint: 'Google: Suchbegriffe · Meta: Interessen/Ort · LinkedIn: Branche/Verein.',
  },
  {
    id: 'anzeige-creative',
    label: 'Anzeige mit Text + Bild/Video',
    hint: '„Anzeigen-Paket kopieren“ = kurze Headlines/Beschreibungen fürs Ads-Konto (nicht mök2).',
    autoOnAnzeigenKopiert: true,
  },
  {
    id: 'ziel-url-eingetragen',
    label: 'Ziel-URL in der Anzeige eingetragen',
    hint: '„Final URL“ / Website-URL = Ziel-URL aus Schalt-Paket (ein Klick: Paket kopieren).',
    autoOnPaketKopiert: true,
  },
  {
    id: 'freigabe-aktiv',
    label: 'Freigabe – Status „Aktiv“',
    hint: 'Erst nach Prüfung schalten; Plattform zeigt dann Impressionen.',
  },
  {
    id: 'landing-getestet',
    label: 'Landing im Browser getestet',
    hint: 'Link „Landing testen“ – Seite lädt, Weg zur Lizenz ist klar.',
  },
  {
    id: 'auswertung-geplant',
    label: 'Auswertung in 7 Tagen eingeplant',
    hint: 'Kalender/Notiz: Klicks, Kosten, ggf. Verkäufe in K2 Agentur notieren.',
  },
]

export const K2_AGENTUR_PLATTFORM_CONSOLE_URL: Record<MarketingPaidKanalId, string> = {
  google: 'https://ads.google.com/',
  meta: 'https://business.facebook.com/',
  linkedin: 'https://www.linkedin.com/campaignmanager/',
}

const ZIELGRUPPE_HINT: Record<MarketingPaidKanalId, Record<MarketingProduktId, string>> = {
  google: {
    p1: 'z. B. Online Galerie Künstler, Kunst verkaufen online, Atelier Website',
    p2: 'z. B. Kunstverein Website, Vereinsgalerie online, VK2',
    p3: 'z. B. Familienbuch digital, Stammbaum App, Familienchronik',
  },
  meta: {
    p1: 'Künstler:innen, Malerei/Keramik, Galerie-Interesse, DACH',
    p2: 'Vereinsvorstand, Kulturverein, Ehrenamt, Österreich/DE',
    p3: 'Familie, Genealogie, 40–65, DACH',
  },
  linkedin: {
    p1: 'Galerie, Kulturunternehmen, Künstler (selbstständig)',
    p2: 'Vereinsvorstand, NGO, Kulturverein, Vorstandschaft',
    p3: 'Familienunternehmen, Stiftungen, Historiker (optional)',
  },
}

export type SchaltPaket = {
  produkt: MarketingProduktId
  kanal: MarketingPaidKanalId
  campaignKey: string
  landingUrl: string
  checkoutPath: string
  produktLabel: string
  kanalLabel: string
  zielgruppeHint: string
  plattformUrl: string
}

export function getSchaltPaket(
  produkt: MarketingProduktId,
  kanal: MarketingPaidKanalId,
  ag?: string,
): SchaltPaket | null {
  const row = listMarketingKanalUrls(ag).find((r) => r.produkt === produkt && r.kanal === kanal)
  if (!row) return null
  return {
    produkt,
    kanal,
    campaignKey: row.campaignKey,
    landingUrl: row.landingUrl,
    checkoutPath: row.checkoutPath,
    produktLabel: row.produktLabel,
    kanalLabel: row.kanalLabel,
    zielgruppeHint: ZIELGRUPPE_HINT[kanal][produkt],
    plattformUrl: K2_AGENTUR_PLATTFORM_CONSOLE_URL[kanal],
  }
}

/** Ein Block zum Kopieren in Ads-Konto (Sportwagen: ein Klick). */
export function formatSchaltPaketText(p: SchaltPaket): string {
  return [
    '── K2 Agentur · Schalt-Paket ──',
    `Produkt: ${p.produktLabel}`,
    `Kanal: ${p.kanalLabel}`,
    '',
    `Kampagnenname: ${p.campaignKey}`,
    `Ziel-URL (Final URL): ${p.landingUrl}`,
    `Checkout (nach Klick): ${p.checkoutPath}`,
    '',
    `Zielgruppe/Keywords (Vorschlag): ${p.zielgruppeHint}`,
    '',
    `Plattform öffnen: ${p.plattformUrl}`,
    '',
    'Reihenfolge: Konto → Kampagne → Budget → Zielgruppe → Anzeige → Ziel-URL → Aktiv',
    '── Ende Schalt-Paket ──',
  ].join('\n')
}

export function globalStepIds(): string[] {
  return K2_AGENTUR_GLOBAL_LAUNCH_STEPS.map((s) => s.id)
}

export function kanalStepIds(): string[] {
  return K2_AGENTUR_KANAL_LAUNCH_STEPS.map((s) => s.id)
}

export function kanalStepIdAutoOnPaketKopiert(): string | undefined {
  return K2_AGENTUR_KANAL_LAUNCH_STEPS.find((s) => s.autoOnPaketKopiert)?.id
}

export function kanalStepIdAutoOnAnzeigenKopiert(): string | undefined {
  return K2_AGENTUR_KANAL_LAUNCH_STEPS.find((s) => s.autoOnAnzeigenKopiert)?.id
}

/** Global-Konto-Step-ID für Kanal (gleiche Plattform). */
export function globalKontoStepIdForKanal(kanal: MarketingPaidKanalId): string {
  if (kanal === 'google') return 'global-google-konto'
  if (kanal === 'meta') return 'global-meta-konto'
  return 'global-linkedin-konto'
}

export function countLaunchStepsTotal(): { global: number; perKanal: number; kanaele: number } {
  return {
    global: K2_AGENTUR_GLOBAL_LAUNCH_STEPS.length,
    perKanal: K2_AGENTUR_KANAL_LAUNCH_STEPS.length,
    kanaele: 9,
  }
}
