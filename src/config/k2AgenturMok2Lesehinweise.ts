/**
 * K2 Agentur – mök2-Lesehinweise pro Produkt (eine Tabelle, viele Kanäle).
 */
import { MOK2_ROUTE } from './navigation'
import type { MarketingProduktId } from './marketingKanalP1P2P3'

export type Mok2LesehinweisLink = {
  label: string
  /** Vollständiger Pfad inkl. Anker */
  href: string
}

function mok2(hash: string): string {
  return `${MOK2_ROUTE}#${hash}`
}

/** Vor dem Schalten in mök2 lesen – pro Produktlinie. */
const GEMEINSAM: Mok2LesehinweisLink[] = [
  { label: 'Corporate Design – eine Linie', href: mok2('mok2-cd-corporate-design') },
  { label: '7. Promotion für alle Medien', href: mok2('mok2-7') },
  { label: 'Sichtbarkeit & Werbung', href: mok2('mok2-sichtbarkeit-werbung') },
  { label: 'Kanäle 2026', href: mok2('mok2-kanale-2026') },
]

export const K2_AGENTUR_MOK2_LESEHINWEIS: Record<MarketingProduktId, Mok2LesehinweisLink[]> = {
  p1: [
    { label: '1. USPs', href: mok2('mok2-1') },
    { label: 'Genaue Produktbeschreibung', href: mok2('mok2-produktbeschreibung') },
    { label: 'Sweet-Spot Positionierung', href: mok2('mok2-sweet-spot') },
    ...GEMEINSAM,
  ],
  p2: [
    { label: 'Was kann die App? (ök2 | VK2)', href: mok2('mok2-was-kann-die-app') },
    { label: 'Lizenzstruktur VK2', href: mok2('mok2-10b-vk2-lizenz') },
    { label: 'Märkte Kunst-Fokus', href: mok2('mok2-maerkte-kunst-fokus') },
    ...GEMEINSAM,
  ],
  p3: [
    { label: 'K2 Familie – Mappe Kunde', href: '/projects/k2-familie/praesentationsmappe-kunde' },
    { label: 'K2 Familie Lizenzmodell', href: mok2('mok2-10d-k2-familie-lizenzmodell') },
    ...GEMEINSAM,
  ],
}
