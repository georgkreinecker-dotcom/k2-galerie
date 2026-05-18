/**
 * Rechte und Hilfen für Familien-Einträge zu Geschichten (K2 Familie).
 */
import type { K2FamilieGeschichteEintrag, K2FamiliePerson } from '../types/k2Familie'

/** Datum + Uhrzeit für Geschichten-Metadaten (de-AT). */
export function formatGeschichteZeitpunkt(iso?: string): string {
  if (!iso?.trim()) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('de-AT', { dateStyle: 'medium', timeStyle: 'short' })
}

export function personNameById(personen: K2FamiliePerson[], personId?: string): string {
  const id = personId?.trim()
  if (!id) return 'Unbekannt'
  return personen.find((p) => p.id === id)?.name?.trim() || 'Unbekannt'
}

export function generateGeschichteEintragId(): string {
  return `ge-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/** Neuen Eintrag anlegen: Organisch-Recht + „Du“ auf der Karte. */
export function canAddGeschichteEintrag(
  kannOrganisch: boolean,
  ichBinPersonId: string | undefined,
): boolean {
  return kannOrganisch && Boolean(ichBinPersonId?.trim())
}

/** Eigenen Eintrag bearbeiten; Inhaber:in darf alle. */
export function canEditGeschichteEintrag(
  eintrag: K2FamilieGeschichteEintrag,
  ichBinPersonId: string | undefined,
  kannInstanzVerwalten: boolean,
): boolean {
  if (kannInstanzVerwalten) return true
  const ich = ichBinPersonId?.trim()
  return Boolean(ich && eintrag.authorPersonId === ich)
}

export function canDeleteGeschichteEintrag(
  eintrag: K2FamilieGeschichteEintrag,
  ichBinPersonId: string | undefined,
  kannInstanzVerwalten: boolean,
): boolean {
  return canEditGeschichteEintrag(eintrag, ichBinPersonId, kannInstanzVerwalten)
}

export function geschichteEintraegeFuerGeschichte(
  alle: K2FamilieGeschichteEintrag[],
  geschichteId: string,
): K2FamilieGeschichteEintrag[] {
  return alle
    .filter((e) => e.geschichteId === geschichteId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}
