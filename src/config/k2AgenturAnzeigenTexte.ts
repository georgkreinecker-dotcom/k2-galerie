/**
 * K2 Agentur – Anzeigen-Paket (Texte für Google/Meta/LinkedIn).
 * Eine Quelle: tenantConfig + Produktzeile; Zeichenlimits pro Plattform.
 */
import {
  PRODUCT_BOTSCHAFT_2,
  PRODUCT_KERN_EIGENER_ORT,
  PRODUCT_K2_FAMILIE_WERBESLOGAN,
  PRODUCT_K2_FAMILIE_WERBE_KERN_KOMPAKT,
  PRODUCT_POSITIONING_SOCIAL,
  PRODUCT_WERBESLOGAN,
  PRODUCT_WERBESLOGAN_2,
} from './tenantConfig'
import type { MarketingPaidKanalId, MarketingProduktId } from './marketingKanalP1P2P3'
import { getSchaltPaket, type SchaltPaket } from './k2AgenturLaunchCheckliste'

export type AnzeigenPaket = {
  schalt: SchaltPaket
  headlines: string[]
  descriptions: string[]
  cta: string
  limits: { headline: number; description: number; note: string }
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

const PRODUKT_HOOK: Record<MarketingProduktId, string[]> = {
  p1: [PRODUCT_WERBESLOGAN, PRODUCT_WERBESLOGAN_2, PRODUCT_KERN_EIGENER_ORT],
  p2: [
    'VK2 – die Vereinsplattform: Mitglieder, Galerie und Events an einem Ort.',
    'Kunstvereine und Kulturvereine digital professionell – nicht nur Social Media.',
    PRODUCT_KERN_EIGENER_ORT,
  ],
  p3: [
    `${PRODUCT_K2_FAMILIE_WERBESLOGAN} ${PRODUCT_K2_FAMILIE_WERBE_KERN_KOMPAKT}`,
    'Stammbaum, Geschichten und Fotos – nur für die Familie.',
    PRODUCT_KERN_EIGENER_ORT,
  ],
}

function clip(text: string, max: number): string {
  const t = text.replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  return `${t.slice(0, max - 1).trim()}…`
}

function buildHeadlines(produkt: MarketingProduktId, kanal: MarketingPaidKanalId): string[] {
  const lim = LIMITS[kanal].headline
  const hooks = PRODUKT_HOOK[produkt]
  return [
    clip(hooks[0], lim),
    clip(hooks[1] ?? hooks[0], lim),
    clip(PRODUCT_POSITIONING_SOCIAL, lim),
  ]
}

function buildDescriptions(produkt: MarketingProduktId, kanal: MarketingPaidKanalId): string[] {
  const lim = LIMITS[kanal].description
  const hooks = PRODUKT_HOOK[produkt]
  return [
    clip(`${hooks[0]} ${PRODUCT_BOTSCHAFT_2}`, lim),
    clip(hooks[2] ?? PRODUCT_KERN_EIGENER_ORT, lim),
  ]
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
  return {
    schalt,
    headlines: buildHeadlines(produkt, kanal),
    descriptions: buildDescriptions(produkt, kanal),
    cta: ctaForKanal(kanal),
    limits: LIMITS[kanal],
  }
}

export function formatAnzeigenPaketText(p: AnzeigenPaket): string {
  const s = p.schalt
  const lines = [
    '── K2 Agentur · Anzeigen-Paket ──',
    `Produkt: ${s.produktLabel} · Kanal: ${s.kanalLabel}`,
    `Kampagne: ${s.campaignKey}`,
    `Ziel-URL: ${s.landingUrl}`,
    '',
    `Hinweis Zeichenlimits: ${p.limits.note}`,
    '',
    '── Headlines (Variante A/B/C) ──',
    `A: ${p.headlines[0] ?? ''}`,
    `B: ${p.headlines[1] ?? ''}`,
    `C: ${p.headlines[2] ?? ''}`,
    '',
    '── Beschreibungen (Variante A/B) ──',
    `A: ${p.descriptions[0] ?? ''}`,
    `B: ${p.descriptions[1] ?? ''}`,
    '',
    `CTA-Vorschlag: ${p.cta}`,
    '',
    `Zielgruppe/Keywords: ${s.zielgruppeHint}`,
    '',
    '── Ende Anzeigen-Paket ──',
  ]
  return lines.join('\n')
}
