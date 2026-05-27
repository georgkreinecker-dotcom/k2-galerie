/**
 * K2 Agentur – Anzeigen-Paket (kurze Texte für Google/Meta/LinkedIn-Felder).
 *
 * Bewusst NICHT mök2 und NICHT die langen Positionierungs-Slogans aus tenantConfig.
 * mök2 = nur lesen (siehe k2AgenturMok2Lesehinweise.ts).
 * Hier = fertige, kanal-knappe Anzeigenvarianten zum Einfügen.
 */
import type { MarketingPaidKanalId, MarketingProduktId } from './marketingKanalP1P2P3'
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

/**
 * Kurze Anzeigentexte pro Produkt × Kanal – extra formuliert, nicht aus mök2 übernommen.
 */
const ANZEIGEN_COPY: Record<MarketingProduktId, Record<MarketingPaidKanalId, AnzeigenCopySet>> = {
  p1: {
    google: {
      headlines: ['Online-Galerie starten', 'Kunst sichtbar verkaufen', 'Demo: K2 Galerie'],
      descriptions: [
        'Galerie, Shop und Tour in einer Demo. Kostenlos ansehen – ohne Anmeldung.',
        'Eigener Webauftritt statt nur Social Media. Demo jetzt öffnen.',
      ],
    },
    meta: {
      headlines: ['Deine Galerie – ein Ort', 'Werke zeigen & verkaufen', 'Mehr als ein Insta-Post'],
      descriptions: [
        'Professionell online: Werke, Shop, virtuelle Tour. Demo in einer Minute – kostenlos.',
        'Für Künstler:innen mit Ideen, die gesehen werden wollen. Jetzt Demo entdecken.',
      ],
    },
    linkedin: {
      headlines: ['Galerie-Software für Künstler:innen', 'Eigene Plattform statt nur Social', 'Demo: digitale Galerie'],
      descriptions: [
        'Werke präsentieren, verkaufen, Events – alles an einem Ort. Kostenlose Demo ansehen.',
        'Für Galerien und Künstler:innen: professioneller Auftritt ohne Technik-Stress.',
      ],
    },
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
    google: {
      headlines: ['Privater Familienraum', 'Stammbaum digital', 'K2 Familie – Demo'],
      descriptions: [
        'Geschichten, Fotos, Stammbaum – nur für eure Familie. Demo ohne Anmeldung.',
        'Familiendaten bleiben bei der Familie. Jetzt Demo ansehen.',
      ],
    },
    meta: {
      headlines: ['Euer Familienraum online', 'Stammbaum & Erinnerungen', 'Nur für die Familie'],
      descriptions: [
        'Geschichten und Fotos sicher teilen – ohne öffentliches Netzwerk. Demo kostenlos.',
        'Für Familien, die Erinnerungen bewahren wollen. Ein Klick zur Demo.',
      ],
    },
    linkedin: {
      headlines: ['Digitaler Raum für Familien', 'Stammbaum & Familiengeschichte', 'K2 Familie – privat'],
      descriptions: [
        'Familienchronik und Fotos nur für Angehörige. Demo für interessierte Familien.',
        'Daten gehören der Familie – kein Social-Media-Profil. Demo ansehen.',
      ],
    },
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

export function formatAnzeigenPaketText(p: AnzeigenPaket): string {
  const s = p.schalt
  const lines = [
    '── K2 Agentur · Anzeigen-Paket (kurz – für Ads-Felder) ──',
    'Hinweis: Nicht der mök2-Strategietext. mök2 nur zum Lesen – hier nur Headlines & Beschreibungen.',
    `Produkt: ${s.produktLabel} · Kanal: ${s.kanalLabel}`,
    `Ziel-URL (Final URL): ${s.landingUrl}`,
    '',
    `Zeichenlimits: ${p.limits.note}`,
    '',
    '── Headlines (A/B/C) – in Anzeigenkonto einfügen ──',
    `A: ${p.headlines[0] ?? ''}`,
    `B: ${p.headlines[1] ?? ''}`,
    `C: ${p.headlines[2] ?? ''}`,
    '',
    '── Beschreibungen (A/B) ──',
    `A: ${p.descriptions[0] ?? ''}`,
    `B: ${p.descriptions[1] ?? ''}`,
    '',
    `CTA-Button (Vorschlag): ${p.cta}`,
    '',
    `Keywords/Zielgruppe (Vorschlag): ${s.zielgruppeHint}`,
    '',
    '── Ende Anzeigen-Paket ──',
  ]
  return lines.join('\n')
}
