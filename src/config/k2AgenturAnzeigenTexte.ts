/**
 * K2 Agentur – fertige Anzeige zum Einfügen (Google/Meta/LinkedIn).
 * Kurztexte für Ads-Felder – abgeleitet aus verbindlichen Werbelinien (tenantConfig), auf Kanal-Limits gekürzt.
 */
import { formatGoogleKeywordsForKanal } from './k2AgenturStrategieKeywordsRegistry'
import type { MarketingPaidKanalId, MarketingProduktId } from './marketingKanalP1P2P3'
import {
  PRODUCT_K2_FAMILIE_WERBE_KERN_KOMPAKT,
  PRODUCT_K2_FAMILIE_WERBESLOGAN,
  PRODUCT_WERBESLOGAN,
  PRODUCT_WERBESLOGAN_2,
} from './tenantConfig'
import { getSchaltPaket, type SchaltPaket } from './k2AgenturLaunchCheckliste'

export type AnzeigenPaket = {
  schalt: SchaltPaket
  headlines: string[]
  descriptions: string[]
  cta: string
  limits: { headline: number; description: number; note: string }
}

type AnzeigenCopySet = {
  headlines: [string, string, string]
  descriptions: [string, string]
}

const LIMITS: Record<MarketingPaidKanalId, { headline: number; description: number; note: string }> = {
  google: {
    headline: 30,
    description: 90,
    note: 'Google Ads: Responsive Search – Headlines max. 30 Zeichen, Descriptions max. 90.',
  },
  meta: {
    headline: 40,
    description: 125,
    note: 'Meta: Primary Text bis 125, Headline bis 40 Zeichen (kürzer = besser).',
  },
  linkedin: {
    headline: 70,
    description: 150,
    note: 'LinkedIn: Intro bis 150, Headline bis 70 Zeichen.',
  },
}

/** Verbindliche Werbelinien → Headlines/Beschreibungen (pro Kanal gekürzt). */
function p1CopyForKanal(kanal: MarketingPaidKanalId): AnzeigenCopySet {
  const lim = LIMITS[kanal]
  return {
    headlines: [
      clip('K2 Galerie – Demo', lim.headline),
      clip('Ideen, die gesehen werden', lim.headline),
      clip('Mehr als ein Insta-Post', lim.headline),
    ],
    descriptions: [
      clip(PRODUCT_WERBESLOGAN_2, lim.description),
      clip(
        `${PRODUCT_WERBESLOGAN} Galerie, Shop, Tour – kostenlose Demo, ohne Anmeldung.`,
        lim.description,
      ),
    ],
  }
}

function p3CopyForKanal(kanal: MarketingPaidKanalId): AnzeigenCopySet {
  const lim = LIMITS[kanal]
  return {
    headlines: [
      clip(PRODUCT_K2_FAMILIE_WERBESLOGAN, lim.headline),
      clip('Stammbaum & Erinnerungen', lim.headline),
      clip('K2 Familie – Demo', lim.headline),
    ],
    descriptions: [
      clip(PRODUCT_K2_FAMILIE_WERBE_KERN_KOMPAKT, lim.description),
      clip('Geschichten und Fotos nur für eure Familie. Demo ohne Anmeldung.', lim.description),
    ],
  }
}

const ANZEIGEN_COPY: Record<MarketingProduktId, Record<MarketingPaidKanalId, AnzeigenCopySet>> = {
  p1: {
    google: p1CopyForKanal('google'),
    meta: p1CopyForKanal('meta'),
    linkedin: p1CopyForKanal('linkedin'),
  },
  p2: {
    google: {
      headlines: ['Vereinsgalerie online', 'VK2 für Kunstvereine', 'Mitglieder & Werke'],
      descriptions: [
        'Vereinsplattform: Galerie, Mitglieder, Events. Demo für Vorstand und Verein.',
        'Digital professionell – nicht nur Facebook. Jetzt Vereins-Demo ansehen.',
      ],
    },
    meta: {
      headlines: ['Kunstverein digital organisieren', 'VK2 – eure Vereinswelt', 'Mitglieder sichtbar machen'],
      descriptions: [
        'Galerie, Mitgliederliste und Events für euren Verein. Demo kostenlos – für den Vorstand.',
        'Für Kulturvereine in Österreich und Deutschland. Ein Klick zur Demo.',
      ],
    },
    linkedin: {
      headlines: ['Plattform für Kunst- und Kulturvereine', 'VK2 – Verein digital führen', 'Demo für Vereinsvorstände'],
      descriptions: [
        'Mitglieder, Werke und Öffentlichkeitsarbeit an einem Ort. Kostenlose Demo für den Vorstand.',
        'Für Vereine, die mehr wollen als eine lose Social-Media-Präsenz.',
      ],
    },
  },
  p3: {
    google: p3CopyForKanal('google'),
    meta: p3CopyForKanal('meta'),
    linkedin: p3CopyForKanal('linkedin'),
  },
}

function clip(text: string, max: number): string {
  const t = text.replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  return `${t.slice(0, max - 1).trim()}…`
}

function copyForKanal(produkt: MarketingProduktId, kanal: MarketingPaidKanalId): AnzeigenCopySet {
  const raw = ANZEIGEN_COPY[produkt][kanal]
  const lim = LIMITS[kanal]
  return {
    headlines: [
      clip(raw.headlines[0], lim.headline),
      clip(raw.headlines[1], lim.headline),
      clip(raw.headlines[2], lim.headline),
    ],
    descriptions: [clip(raw.descriptions[0], lim.description), clip(raw.descriptions[1], lim.description)],
  }
}

function ctaForKanal(kanal: MarketingPaidKanalId): string {
  if (kanal === 'linkedin') return 'Mehr erfahren'
  if (kanal === 'meta') return 'Jetzt entdecken'
  return 'Demo ansehen'
}

export function getAnzeigenPaket(
  produkt: MarketingProduktId,
  kanal: MarketingPaidKanalId,
  ag?: string,
): AnzeigenPaket | null {
  const schalt = getSchaltPaket(produkt, kanal, ag)
  if (!schalt) return null
  const copy = copyForKanal(produkt, kanal)
  return {
    schalt,
    headlines: [...copy.headlines],
    descriptions: [...copy.descriptions],
    cta: ctaForKanal(kanal),
    limits: LIMITS[kanal],
  }
}

/** Fertige Anzeige – alles zum Einfügen ins Ads-Konto (ein Kopierblock). */
export function formatFertigeAnzeigeText(p: AnzeigenPaket): string {
  const s = p.schalt
  const lines = [
    `FERTIGE ANZEIGE · ${s.produktLabel} · ${s.kanalLabel}`,
    '',
    `Kampagnenname: ${s.campaignKey}`,
    `Finale URL: ${s.landingUrl}`,
    '',
    'HEADLINE 1:',
    p.headlines[0] ?? '',
    'HEADLINE 2:',
    p.headlines[1] ?? '',
    'HEADLINE 3:',
    p.headlines[2] ?? '',
    '',
    'BESCHREIBUNG 1:',
    p.descriptions[0] ?? '',
    'BESCHREIBUNG 2:',
    p.descriptions[1] ?? '',
    '',
    `BUTTON / CTA: ${p.cta}`,
    '',
    `Zielgruppe / Keywords: ${s.zielgruppeHint}`,
    '',
    `(${p.limits.note})`,
  ]
  if (s.kanal === 'google') {
    const kw = formatGoogleKeywordsForKanal(s.produkt, s.kanal)
    if (kw) lines.push('', kw)
  }
  return lines.join('\n')
}

/** @deprecated Alias – nutze formatFertigeAnzeigeText */
export const formatAnzeigenPaketText = formatFertigeAnzeigeText
