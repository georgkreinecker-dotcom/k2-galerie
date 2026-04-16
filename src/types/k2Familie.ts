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

/** Optional: Anschrift und direkter Kontakt (JSON-Block pro Person). */
export interface K2FamilieKontaktAdresse {
  zeile1?: string
  zeile2?: string
  plz?: string
  ort?: string
  land?: string
  email?: string
  telefon?: string
}

/** Eine Person im Familien-Stammbaum. */
export interface K2FamiliePerson {
  id: string
  name: string
  /** Geburtsdatum (ISO YYYY-MM-DD), optional. */
  geburtsdatum?: string
  /** Geburtsname / Mädchenname, z. B. bei Frauen – optional. */
  maedchenname?: string
  /** Legacy: gespiegelt aus dem zeitaktuellen Lebensphasen-Bild beim Speichern; Anzeige über getAktuellesPersonenFoto. */
  photo?: string
  /** Foto als Kind (optional). */
  photoKind?: string
  /** Jugendlich (optional). */
  photoJugend?: string
  /** Erwachsen (optional). */
  photoErwachsen?: string
  /** Alter / Seniorenphase (optional). */
  photoAlter?: string
  /** Optional: Link zu einem Fotoalbum (nicht die Bilddaten selbst). */
  linkFotoalbum?: string
  /** Optional: Website / Homepage. */
  linkWeb?: string
  /** Optional: YouTube (Kanal oder Video). */
  linkYoutube?: string
  /** Optional: Instagram-Profil oder -Beitrag. */
  linkInstagram?: string
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
  /**
   * Persönlicher Code (in der UI „Mitgliedsnummer“): **Schlüssel** zum persönlichen Bereich und **erste Identifikation**
   * beim Eintritt in die Plattform (Einladung mit `?m=` oder Eintrag auf der eigenen Karte). Danach reicht der
   * gespeicherte **persönliche QR oder Link** auf dem Gerät — kein erneutes Legitimieren bei jedem Besuch.
   * Produktentscheidung **B**, getrennt von `mitgliedsNummerAdmin`. Innerhalb des Tenants eindeutig; nach dem
   * Familienlink ordnet die Eingabe „Du“ zu (`ichBinPersonId`). Verwaltung kann vergeben; die Person trägt auf der **eigenen** Karte ein.
   */
  mitgliedsNummer?: string
  /** Optional: aufklappbarer Block Anschrift + E-Mail + Telefon auf der Personenseite. */
  kontaktAdresse?: K2FamilieKontaktAdresse
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
  /**
   * Vom Administrator vergebene Zugangs-/Mitgliedsnummer (neben QR).
   * Speicher nur im K2-Familie-Kontext (k2-familie-*); keine Vermischung mit K2/ök2.
   */
  mitgliedsNummerAdmin?: string
  /** Optional: Position von „Du“ unter den Geschwister (1-basiert), für Sortierung 1…N (z. B. 7 = 6 vor mir, 6 hinter mir). */
  ichBinPositionAmongSiblings?: number
  /**
   * Wer die **Inhaber:in** dieser Familien-Instanz ist (Personen-ID), familienweit – mit Backup/Cloud abgleichbar.
   * Ist sie gesetzt und „Du“ ist eine **andere** Person, zählt die lokale Rollenwahl „Inhaber:in“ für Rechte nur wie **Bearbeiter:in**.
   */
  inhaberPersonId?: string
  /**
   * Nur **Inhaber:in** stellt das unter **Einstellungen** ein (nicht auf der Stammbaum-Seite).
   * Keine **neuen** Personen mehr anlegen (Buttons „Hinzufügen“ / Hilfsfunktionen aus);
   * bestehende Karten bearbeiten und **verknüpfen** bleibt möglich.
   */
  stammbaumSchlusspunkt?: boolean
  /**
   * Nur **Inhaber:in** stellt das unter **Einstellungen** ein.
   * Wenn **true**: Personen **nicht mehr löschen** (Stammbaum-Struktur bleibt stimmig; Verknüpfungen ändern geht weiter).
   */
  stammbaumPersonenLoeschenGesperrt?: boolean
  /**
   * Stammbaum: Karten + Grafik – **true** = nur der Familienzweig von „Das bin ich“ (Standard wenn gesetzt);
   * **false** = alle Zweige (Großfamilie). **undefined** = wie **true**, sobald `ichBinPersonId` gesetzt ist.
   */
  stammbaumNurMeinFamilienzweig?: boolean
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
  /**
   * `entwurf` = in Arbeit (Register „In Arbeit“). `fertig` oder fehlend = fertige Geschichte.
   * Fehlend bei älteren Daten: gilt als fertig.
   */
  status?: 'fertig' | 'entwurf'
  createdAt?: string
  updatedAt?: string
}

/** Storage-Key für Geschichten pro Tenant. */
export function getK2FamilieGeschichtenKey(tenantId: string): string {
  return `k2-familie-${tenantId}-geschichten`
}
