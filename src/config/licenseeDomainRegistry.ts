/**
 * Lizenz-Mandanten: Domän-Karteikarten für Visit-Zähler (tenantId ↔ Hosts, Galerie-URL).
 * Anzeige „echte Lizenzkäufe“ = Supabase via /api/licence-data (Mission Control), nicht dieses Register.
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
    label: 'Galerie Eferding',
    canonicalGalerieUrl: 'https://www.galerie-eferding.at/g/galerie-eferding',
    hosts: ['galerie-eferding.at', 'www.galerie-eferding.at'],
  },
]

export function findLicenseeDomainByTenantId(tenantId: string): LicenseeDomainCard | undefined {
  const tid = tenantId.trim()
  if (!tid) return undefined
  return LICENSEE_DOMAIN_REGISTRY.find((row) => row.tenantId === tid)
}
