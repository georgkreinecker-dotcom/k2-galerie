/**
 * Muster-Lizenz: nur Demo/Vorschau – keine echte Stripe-Session, keine Datenbankzeile.
 * Gleiche Namen überall (Sportwagenmodus): Kaufformular vorfüllen + Erfolgsseite ?muster=1
 */
export const LIZENZ_MUSTER_TENANT_ID = 'muster-lizenz-demo'

export const LIZENZ_MUSTER_NAME = 'Muster Künstlerin'

/** RFC 2606 – keine echte Mailbox */
export const LIZENZ_MUSTER_EMAIL = 'muster@kgm.example'

export function buildLizenzMusterErfolgLinks(origin: string) {
  const b = String(origin || '').replace(/\/$/, '') || 'https://k2-galerie.vercel.app'
  return {
    galerie_url: `${b}/g/${LIZENZ_MUSTER_TENANT_ID}`,
    admin_url: `${b}/admin?tenantId=${encodeURIComponent(LIZENZ_MUSTER_TENANT_ID)}`,
    name: LIZENZ_MUSTER_NAME,
    email: LIZENZ_MUSTER_EMAIL,
    product_line: 'k2_galerie' as const,
  }
}
