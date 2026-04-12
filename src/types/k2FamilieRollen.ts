/**
 * K2 Familie – Rollenmodell (lizenzierfähig, pro Familie / Tenant).
 * Keine Vermischung mit K2 Galerie: gilt nur für k2-familie-* und FamilieTenantContext.
 */

/** Rolle der aktuellen Sitzung für die gewählte Familie (lokal / später Server-Token). */
export type K2FamilieRolle = 'inhaber' | 'bearbeiter' | 'leser'

export const K2_FAMILIE_ROLLEN: K2FamilieRolle[] = ['inhaber', 'bearbeiter', 'leser']

export const K2_FAMILIE_ROLLEN_LABELS: Record<K2FamilieRolle, string> = {
  inhaber: 'Inhaber:in',
  bearbeiter: 'Bearbeiter:in',
  leser: 'Leser:in',
}

/** Kurzbeschreibung für UI / Handbuch */
export const K2_FAMILIE_ROLLEN_KURZ: Record<K2FamilieRolle, string> = {
  inhaber: 'Volle Kontrolle inkl. Sicherung wiederherstellen und Familien-Verwaltung',
  bearbeiter: 'Stammbaum, Personen, Events & Co. bearbeiten – keine Wiederherstellung/Merge',
  leser: 'Nur ansehen, nichts speichern',
}

export interface FamilieRollenCapabilities {
  rolle: K2FamilieRolle
  /** Immer true (Leser dürfen alles sehen) */
  canView: true
  /** Personen, Beziehungen, Stammbaum, Events, Kalender, Geschichte, Gedenkort, Momente */
  canEditFamiliendaten: boolean
  /** Sicherungskopie + GEDCOM herunterladen */
  canExportSicherung: boolean
  /** Aus Backup wiederherstellen oder Merge – nur Inhaber:in */
  canRestoreSicherung: boolean
  /** Neue Familie, Musterfamilie laden, Zugangsnummer-Admin – nur Inhaber:in */
  canManageFamilienInstanz: boolean
}

export function getFamilieRollenCapabilities(rolle: K2FamilieRolle): FamilieRollenCapabilities {
  const isInhaber = rolle === 'inhaber'
  const isBearbeiter = rolle === 'bearbeiter'
  const canEdit = isInhaber || isBearbeiter
  return {
    rolle,
    canView: true,
    canEditFamiliendaten: canEdit,
    canExportSicherung: canEdit,
    canRestoreSicherung: isInhaber,
    canManageFamilienInstanz: isInhaber,
  }
}
