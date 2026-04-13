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
  bearbeiter: 'Organisches bearbeiten (Momente, Events, Geschichte, Gedenkort) – kein Stammbaum/Kern',
  leser: 'Nur ansehen, nichts speichern',
}

/** Eine Zeile unter der Rollenwahl – Alltagssprache, keine Fachliste (Sportwagenmodus: sofort klar). */
export const K2_FAMILIE_ROLLEN_EINZEILER: Record<K2FamilieRolle, string> = {
  inhaber: 'Du kannst alles bearbeiten – Stammbaum, Daten und Sicherung.',
  bearbeiter: 'Du bearbeitest Texte und Termine; den Stammbaum siehst du, änderst du nicht.',
  leser: 'Du schaust nur zu – nichts wird gespeichert.',
}

/** Ampel-Punkt neben der Erklärung (Leser = zurückhaltend, Inhaber = klar „darf“). */
export const K2_FAMILIE_ROLLEN_AMPEL: Record<K2FamilieRolle, string> = {
  inhaber: '#0d9488',
  bearbeiter: '#d97706',
  leser: '#64748b',
}

/** Druck-PDF „Schreib- und Leserechte“ – gleiche Rollen wie in der App, eine Tabelle. */
export const FAMILIE_DRUCK_RECHTE_ZEILEN: readonly {
  rolle: string
  lesen: string
  schreiben: string
}[] = [
  {
    rolle: 'Inhaber:in',
    lesen: 'Alles ansehen, was in der Familie eingetragen ist.',
    schreiben:
      'Stammbaum und Stammdaten, Momente, Events, Geschichte, Gedenkort; Sicherung und neue Familie – volle Verantwortung für die Instanz.',
  },
  {
    rolle: 'Bearbeiter:in',
    lesen: 'Wie Inhaber:in – alles ansehen.',
    schreiben:
      'Geschichte, Events, Gedenkort und persönliche Texte auf Karten; kein Stammbaum/Beziehungen ändern, kein Backup einspielen oder neue Familie.',
  },
  {
    rolle: 'Leser:in',
    lesen: 'Alles ansehen.',
    schreiben: 'Nichts – Speichern ist aus.',
  },
]

export interface FamilieRollenCapabilities {
  rolle: K2FamilieRolle
  /** Immer true (Leser dürfen alles sehen) */
  canView: true
  /**
   * Inhaber oder Bearbeiter – Kurzform „irgendetwas speichern dürfen“.
   * Für Stammbaum/Personenkarten immer `canEditStrukturUndStammdaten` prüfen.
   */
  canEditFamiliendaten: boolean
  /** Personenkarten-Stammdaten, Beziehungen, strukturelle Einstellungen, Grundstruktur – nur Inhaber:in */
  canEditStrukturUndStammdaten: boolean
  /** Momente, Beiträge, Events, Geschichten, Gaben, Druck-Spalten/Anzeige – Inhaber + Bearbeiter */
  canEditOrganisches: boolean
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
    canEditStrukturUndStammdaten: isInhaber,
    canEditOrganisches: canEdit,
    canExportSicherung: canEdit,
    canRestoreSicherung: isInhaber,
    canManageFamilienInstanz: isInhaber,
  }
}
