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
  /** Verstorben – für Gedenkort (Phase 5). */
  verstorben?: boolean
  /** Sterbedatum (ISO-String), optional. */
  verstorbenAm?: string
  parentIds: string[]
  childIds: string[]
  partners: K2FamiliePartnerRef[]
  siblingIds: string[]
  wahlfamilieIds: string[]
  /** Position unter Geschwistern (1-basiert) für Sortierung im Stammbaum – z. B. 7 = 7. von 13. */
  positionAmongSiblings?: number
  createdAt?: string
  updatedAt?: string
}

/** Gabe am Gedenkort (Phase 5) – Blume, Kerze, Text, Foto. */
export interface K2FamilieGabe {
  id: string
  personId: string
  type: 'blume' | 'kerze' | 'text' | 'foto'
  content?: string
  imageUrl?: string
  createdBy?: string
  createdAt: string
  sichtbarkeit: 'privat' | 'oeffentlich'
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

/** Familien-Event (Phase 3.2) – Geburtstage, Treffen, Feste. */
export interface K2FamilieEvent {
  id: string
  title: string
  date: string
  participantIds: string[]
  note?: string
  createdAt?: string
  updatedAt?: string
}

/** Storage-Key für Personen pro Tenant. */
export function getK2FamiliePersonenKey(tenantId: string): string {
  return `k2-familie-${tenantId}-personen`
}

/** Storage-Key für Momente pro Tenant (Phase 3). */
export function getK2FamilieMomenteKey(tenantId: string): string {
  return `k2-familie-${tenantId}-momente`
}

/** Storage-Key für Events pro Tenant (Phase 3.2). */
export function getK2FamilieEventsKey(tenantId: string): string {
  return `k2-familie-${tenantId}-events`
}

/** Storage-Key für Gaben (Gedenkort) pro Tenant (Phase 5). */
export function getK2FamilieGabenKey(tenantId: string): string {
  return `k2-familie-${tenantId}-gaben`
}

/** Beitrag „Was unsere Familie dazu weiß“ – Erinnerung, Korrektur, Foto, Geschichte, Datum. */
export interface K2FamilieBeitrag {
  id: string
  personId: string
  art: 'erinnerung' | 'korrektur' | 'foto' | 'geschichte' | 'datum'
  inhalt: string
  /** Optionaler Anzeigename („von wem“). */
  vonWem?: string
  createdAt: string
}

/** Storage-Key für Beiträge pro Tenant. */
export function getK2FamilieBeitraegeKey(tenantId: string): string {
  return `k2-familie-${tenantId}-beitraege`
}

/** Startpunkt „Wo beginnt deine Familie?“ – Anker für Stammbaum/Home. */
export type K2FamilieStartpunktTyp = 'ich' | 'eltern' | 'grosseltern'

/** Einstellungen pro Tenant (Startpunkt, optional später Zweige). */
export interface K2FamilieEinstellungen {
  /** Anzeigename dieser Familie (z. B. „Familie Kreinecker“ statt Nummer/ID). */
  familyDisplayName?: string
  startpunktTyp?: K2FamilieStartpunktTyp
  /** Optional: konkrete Person als Wurzel (überschreibt Typ). */
  startpunktPersonId?: string
  /** Optional: Person, deren Herkunft als zweiter Zweig gleichrangig dargestellt wird („Herkunft [Partner]“). */
  partnerHerkunftPersonId?: string
  /** Optional: „Ich bin diese Person“ – im Stammbaum als „Du“ hervorgehoben (z. B. Stefan in Familie Hube). */
  ichBinPersonId?: string
  /** Optional: Position von „Du“ unter den Geschwister (1-basiert), für Sortierung 1…N (z. B. 7 = 6 vor mir, 6 hinter mir). */
  ichBinPositionAmongSiblings?: number
}

/** Storage-Key für Einstellungen pro Tenant. */
export function getK2FamilieEinstellungenKey(tenantId: string): string {
  return `k2-familie-${tenantId}-einstellungen`
}

/**
 * Zweig (Option C / Option 3): Ein Tenant, Zweig = verwalteter Bereich.
 * Zweig = Liste von Personen-IDs (oder Wurzel + Nachkommen), pro Zweig optional Verwalter.
 */
export interface K2FamilieZweig {
  id: string
  name?: string
  /** Personen-IDs die zu diesem Zweig gehören (z. B. Wurzel + Nachkommen). */
  personIds: string[]
  /** Optional: Verwalter-IDs (später für Rechte). */
  verwalterIds?: string[]
}

/** Storage-Key für Zweige pro Tenant. */
export function getK2FamilieZweigeKey(tenantId: string): string {
  return `k2-familie-${tenantId}-zweige`
}

/**
 * Zusammenfassende Geschichte ab Zeitpunkt (Events + Momente → redigierbarer Text).
 * Ab Datum werden Events und Momente einbezogen; Inhalt kann automatisch vorgeschlagen und danach bearbeitet werden.
 */
export interface K2FamilieGeschichte {
  id: string
  /** Optionaler Titel, z. B. „Unsere Geschichte ab 1990“. */
  title?: string
  /** Ab diesem Datum (ISO) fließen Events/Momente ein (für Vorschlag). */
  abDatum: string
  /** Redigierter Fließtext (zusammenfassende Geschichte). */
  content: string
  createdAt?: string
  updatedAt?: string
}

/** Storage-Key für Geschichten pro Tenant. */
export function getK2FamilieGeschichtenKey(tenantId: string): string {
  return `k2-familie-${tenantId}-geschichten`
}
