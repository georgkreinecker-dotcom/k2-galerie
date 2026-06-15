/**
 * K2 Agentur Phase A – Steuerregeln (Reichweite halbautomatisch).
 * Daten: Attribution (Landings/Lizenzen) + manuelle Kosten aus dem Ads-Konto.
 */
import type { K2AgenturKanalStatus } from '../utils/k2AgenturPlattformStorage'
import type { MarketingPaidKanalId, MarketingProduktId } from './marketingKanalP1P2P3'

/** Sportwagen: mit diesem Kanal starten (höchste Kaufabsicht bei Suche). */
export const K2_AGENTUR_PHASE_A_PILOT: {
  produkt: MarketingProduktId
  kanal: MarketingPaidKanalId
  label: string
  warum: string
} = {
  produkt: 'p1',
  kanal: 'google',
  label: 'P1 Galerie · Google Ads (Suche)',
  warum:
    'Wer aktiv sucht („Online Galerie Künstler“) ist am nächsten dran. Meta/LinkedIn kommen danach – gleiche Steuerlogik.',
}

export type SteuerAmpel = 'gruen' | 'gelb' | 'rot' | 'grau'

export type SteuerEmpfehlung =
  | 'weiter'
  | 'budget_pruefen'
  | 'pause_empfohlen'
  | 'daten_eintragen'
  | 'noch_nicht_live'
  | 'attribution_aus'

export type KanalAttributionZahlen = {
  landings: number
  conversions: number
  configured: boolean
}

export type SteuerRegelInput = {
  status: K2AgenturKanalStatus
  budgetEurMonat: string
  /** Manuell aus Ads-Konto (letzte 7 Tage), € */
  kostenEur7Tage: string
  attribution: KanalAttributionZahlen
}

export type SteuerRegelErgebnis = {
  ampel: SteuerAmpel
  empfehlung: SteuerEmpfehlung
  titel: string
  detail: string
  /** Kurz für Ampel-Chip */
  aktionLabel: string
}

/** Google-Ads-Abrechnung: Kampagnen-Kosten 6.–12.06.2026 (7 Tage, 2 Kampagnen). */
export const K2_AGENTUR_KOSTEN_7T_P1_GOOGLE_ABRECHNUNG = '318'

export const K2_AGENTUR_STEUER_SCHWELLEN = {
  /** Ab dieser Summe (7 Tage) ohne Lizenz → Pause empfohlen */
  kostenOhneConversionPauseEur: 25,
  /** Ab so vielen Landings mit Lizenz → Budget prüfen (positiv) */
  conversionsBudgetHinweis: 1,
} as const

function parseEur(raw: string): number | null {
  const n = parseFloat(String(raw).replace(',', '.').trim())
  if (Number.isNaN(n) || n < 0) return null
  return n
}

/** Eine Regel-Engine für alle Kanäle – Phase A. */
export function evaluateKanalSteuerung(input: SteuerRegelInput): SteuerRegelErgebnis {
  const { status, budgetEurMonat, kostenEur7Tage, attribution } = input
  const kosten = parseEur(kostenEur7Tage)
  const budget = parseEur(budgetEurMonat)
  const { landings, conversions, configured } = attribution

  if (!configured) {
    return {
      ampel: 'grau',
      empfehlung: 'attribution_aus',
      titel: 'Messung noch nicht verbunden',
      detail:
        'Supabase-Attribution fehlt (SUPABASE_URL). Landings/Lizenzen werden nicht gezählt – Kosten trotzdem eintragen.',
      aktionLabel: 'Attribution prüfen',
    }
  }

  if (status !== 'live' && status !== 'pausiert') {
    return {
      ampel: 'grau',
      empfehlung: 'noch_nicht_live',
      titel: 'Noch nicht live geschaltet',
      detail: 'Erst Checkliste bis „Freigabe Aktiv“, dann Kosten aus Ads eintragen und Ampel beachten.',
      aktionLabel: 'Checkliste abschließen',
    }
  }

  if (kosten === null) {
    return {
      ampel: 'gelb',
      empfehlung: 'daten_eintragen',
      titel: 'Kosten (7 Tage) fehlen',
      detail:
        'Trage die Summe aus dem Ads-Konto ein (letzte 7 Tage). Ohne Kosten sieht die Ampel nur Landings/Lizenzen.',
      aktionLabel: 'Kosten eintragen',
    }
  }

  if (
    conversions === 0 &&
    kosten >= K2_AGENTUR_STEUER_SCHWELLEN.kostenOhneConversionPauseEur
  ) {
    return {
      ampel: 'rot',
      empfehlung: 'pause_empfohlen',
      titel: 'Viel ausgegeben, keine Lizenz',
      detail: `≥ ${K2_AGENTUR_STEUER_SCHWELLEN.kostenOhneConversionPauseEur} € in 7 Tagen, 0 Lizenzen – in Google Ads pausieren oder Zielgruppe/Anzeige anpassen.`,
      aktionLabel: 'In Ads pausieren',
    }
  }

  if (landings === 0 && kosten > 0) {
    return {
      ampel: 'rot',
      empfehlung: 'pause_empfohlen',
      titel: 'Kosten, aber keine Landings',
      detail:
        'Ads laufen, aber niemand kommt auf die Landing – Final URL, Tracking oder Kampagne prüfen.',
      aktionLabel: 'Landing / URL prüfen',
    }
  }

  if (conversions >= K2_AGENTUR_STEUER_SCHWELLEN.conversionsBudgetHinweis) {
    const budgetHint =
      budget != null && budget > 0
        ? ` Monatsbudget ${budget} € – nach 7-Tage-Review vorsichtig erhöhen.`
        : ' Monatsbudget eintragen, dann vorsichtig erhöhen.'
    return {
      ampel: 'gruen',
      empfehlung: 'weiter',
      titel: 'Läuft – Lizenz(en) da',
      detail: `${conversions} Lizenz(en), ${landings} Landing(s), ${kosten} € Kosten (7 T.).${budgetHint}`,
      aktionLabel: 'Weiterlaufen',
    }
  }

  if (landings > 0 && conversions === 0) {
    return {
      ampel: 'gelb',
      empfehlung: 'budget_pruefen',
      titel: 'Klicks da, noch keine Lizenz',
      detail: `${landings} Landing(s), ${kosten} € – Demo ansehen, Checkout testen; noch nicht blind Budget erhöhen.`,
      aktionLabel: 'Landing/Checkout prüfen',
    }
  }

  if (kosten === 0 && landings === 0) {
    return {
      ampel: 'gelb',
      empfehlung: 'budget_pruefen',
      titel: 'Live, aber wenig Signal',
      detail: 'Status live – Reichweite kommt erst mit Budget und aktiver Anzeige im Ads-Konto.',
      aktionLabel: 'Budget in Ads prüfen',
    }
  }

  return {
    ampel: 'gelb',
    empfehlung: 'weiter',
    titel: 'Beobachten',
    detail: `${landings} Landing(s), ${conversions} Lizenz(en), ${kosten} € – in ein paar Tagen erneut prüfen.`,
    aktionLabel: 'Beobachten',
  }
}

export const STEUER_EMPFEHLUNG_LABEL: Record<SteuerEmpfehlung, string> = {
  weiter: 'Weiterlaufen',
  budget_pruefen: 'Prüfen',
  pause_empfohlen: 'Pause empfohlen',
  daten_eintragen: 'Kosten eintragen',
  noch_nicht_live: 'Noch nicht live',
  attribution_aus: 'Messung fehlt',
}

export const STEUER_AMPEL_STYLE: Record<
  SteuerAmpel,
  { bg: string; border: string; text: string; emoji: string }
> = {
  gruen: { bg: '#ecfdf5', border: '#16a34a', text: '#166534', emoji: '🟢' },
  gelb: { bg: '#fffbeb', border: '#d97706', text: '#92400e', emoji: '🟡' },
  rot: { bg: '#fef2f2', border: '#dc2626', text: '#991b1b', emoji: '🔴' },
  grau: { bg: '#f5f5f4', border: '#a8a29e', text: '#44403c', emoji: '⚪' },
}
