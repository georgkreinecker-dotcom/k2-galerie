/**
 * Lizenz-Kunden: Domän-Karteikarten – eine Quelle für Mission Control & spätere Auswertungen.
 * Mensch-lesbare Vorlage / Copy-Paste: docs/LIZENZ-KUNDE-DOMAIN-KARTEIKARTE.md
 */
export type LicenseeDomainCard = {
  /** POST/GET /api/visit?tenant=… – muss zu VISIT_TENANT_ID_RE passen */
  tenantId: string
  /** Kurzname im Register */
  label: string
  /** Kanonische öffentliche Galerie-URL (Anzeige) */
  canonicalGalerieUrl: string
  /** Hostnamen nur für diese Karteikarte (ohne Schema, Kleinbuchstaben) */
  hosts: string[]
}

export const LICENSEE_DOMAIN_REGISTRY: LicenseeDomainCard[] = [
  {
    tenantId: 'galerie-eferding',
    label: 'Galerie Eferding (Pilot)',
    canonicalGalerieUrl: 'https://www.galerie-eferding.at/g/galerie-eferding',
    hosts: ['galerie-eferding.at', 'www.galerie-eferding.at'],
  },
]
