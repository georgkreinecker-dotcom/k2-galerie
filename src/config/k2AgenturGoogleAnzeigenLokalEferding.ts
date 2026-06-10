/**
 * Lokal Eferding · Google Ads – Responsive Search Anzeigen (2 Gruppen).
 */

export type GoogleRsaLokalEferdingGruppe = 'samstag' | 'gruppen'

export type GoogleRsaLokalEferdingEintrag = {
  gruppe: GoogleRsaLokalEferdingGruppe
  /** Anzeigengruppen-Name in Google (Vorschlag). */
  anzeigengruppe: string
  headlines: readonly string[]
  descriptions: readonly string[]
}

export const GOOGLE_RSA_LOKAL_EFERDING: readonly GoogleRsaLokalEferdingEintrag[] = [
  {
    gruppe: 'samstag',
    anzeigengruppe: 'Samstag & Galerie',
    headlines: [
      'K2 Galerie Eferding',
      'Samstag geöffnet',
      'Kunst & Keramik',
      'Schlossergasse 4',
      'Werke online ansehen',
      'Malerei und Keramik',
      'Kleine Galerie vor Ort',
      'Martina & Georg',
      'Besuch ohne Termin Sa',
    ],
    descriptions: [
      'Jeden Samstag offen – Malerei & Keramik Eferding. Werke online & Schlossergasse 4.',
      'K2 Galerie – persönlich, klein, fein. Zeiten und Route auf unserer Homepage.',
      'Vor dem Besuch online durchstöbern, samstags vorbeikommen. Öffnungszeiten auf der Website.',
    ],
  },
  {
    gruppe: 'gruppen',
    anzeigengruppe: 'Gruppen & Termin',
    headlines: [
      'Gruppenbesuch Eferding',
      'Programmpunkt für Clubs',
      'Galerie mit Führung',
      'Termin nach Vereinbarung',
      'Kunst für Vereine',
      'Senioren & Gruppen',
      'Schlossergasse 4',
      'K2 Galerie Eferding',
      'Klein & persönlich',
    ],
    descriptions: [
      'Verein oder Club: Besuch mit Führung – Termin telefonisch vereinbaren. Eferding.',
      'Martina & Georg führen durch Malerei und Keramik. Termin – auch außerhalb Samstag.',
      'Programmpunkt für Vereine: Kunst erleben, Fragen stellen. Schlossergasse 4.',
    ],
  },
] as const

export function formatGoogleRsaLokalEferdingBlock(): string {
  const lines: string[] = ['── Responsive Search · Lokal Eferding ──', '']
  for (const rsa of GOOGLE_RSA_LOKAL_EFERDING) {
    lines.push(`Anzeigengruppe: ${rsa.anzeigengruppe}`)
    lines.push('Headlines (je max. 30 Zeichen):')
    rsa.headlines.forEach((h, i) => lines.push(`  ${i + 1}. ${h} (${h.length})`))
    lines.push('Beschreibungen (je max. 90 Zeichen):')
    rsa.descriptions.forEach((d, i) => lines.push(`  ${i + 1}. ${d} (${d.length})`))
    lines.push('')
  }
  return lines.join('\n')
}
