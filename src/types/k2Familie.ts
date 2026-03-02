/**
 * K2 Familie – Datenmodell (Phase 1.1).
 * Verbindliche Typen für Person, Beziehungen, Moment.
 * Siehe docs/K2-FAMILIE-DATENMODELL.md
 */

/** Partner*in mit optionalem Zeitraum – für wechselnde Partnerschaften. */
export interface K2FamiliePartnerRef {
  personId: string
  /** Beginn der Beziehung (ISO-Datum); null = unbekannt/offen */
  from: string | null
  /** Ende der Beziehung (ISO-Datum); null = andauern */
  to: string | null
}

/** Eine Person im Familien-Stammbaum. */
export interface K2FamiliePerson {
  id: string
  name: string
  photo?: string
  shortText?: string
  parentIds: string[]
  childIds: string[]
  partners: K2FamiliePartnerRef[]
  siblingIds: string[]
  wahlfamilieIds: string[]
  createdAt?: string
  updatedAt?: string
}

/** Ein Moment (Phase 3) – wie ein Werk: Bild + Titel + Datum + Text. */
export interface K2FamilieMoment {
  id: string
  personId: string
  title: string
  date: string | null
  image?: string
  text?: string
  createdAt?: string
  updatedAt?: string
}

/** Storage-Key für Personen pro Tenant. */
export function getK2FamiliePersonenKey(tenantId: string): string {
  return `k2-familie-${tenantId}-personen`
}
