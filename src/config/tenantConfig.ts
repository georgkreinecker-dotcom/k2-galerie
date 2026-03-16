/**
 * Zentrale Mandanten-/Produkt-Konfiguration
 * Basis für vermarktbare Version: K2 = deine Galerie, Demo = Beispiel für Lizenz-Version
 */

import { loadEvents, saveEvents } from '../utils/eventsStorage'
import { loadDocuments, saveDocuments } from '../utils/documentsStorage'

/** Firmen-/Plattform-Marke (Copyright, Rechtliches, Lizenz, Plattform-UI). */
export const PRODUCT_BRAND_NAME = 'kgm solution'

/** Zweite Marke – im Netz aktiv (Google, Galerie-Seiten, Besucher). Für SEO und alle Galerie-Routen. */
export const K2_GALERIE_PUBLIC_BRAND = 'K2 Galerie'

/** Aktuelles Jahr für Copyright – immer aktuell (Impressum, Footer, AGB, Druck). */
const COPYRIGHT_YEAR = new Date().getFullYear()

/** Copyright-Vermerk (kurz, mit „Copyright“) – für Footer, Impressum, AGB, Druck. */
export const PRODUCT_COPYRIGHT = `Copyright © ${COPYRIGHT_YEAR} kgm solution. Alle Rechte vorbehalten. Design und Entwicklung: kgm solution (G. Kreinecker)`

/** Nur Brand + Copyright – überall außerhalb von K2 (ök2, VK2): keine K2-Daten, nur diese Zeile. */
export const PRODUCT_COPYRIGHT_BRAND_ONLY = `Copyright © ${COPYRIGHT_YEAR} kgm solution. Alle Rechte vorbehalten.`

/**
 * Verbindliche Werbelinie – auf allen Werbemaßnahmen (Presse, Flyer, Plakat, Web, Social).
 * Eine Quelle, überall präsent.
 */
/** Werbeslogan 1 – markante Aussage (Menschen mit Idee = Künstler:innen, Macher:innen, alle mit etwas zu zeigen) */
export const PRODUCT_WERBESLOGAN = 'kgm solution – für Menschen mit Ideen, die gesehen werden wollen'

/** Werbeslogan 2 – zweiter Satz, immer zusammen mit Slogan 1 (Ideen + Werke = alle entryTypes) */
export const PRODUCT_WERBESLOGAN_2 = 'Deine Ideen, deine Werke verdienen mehr als einen Instagram-Post.'

/** Zweite Kernbotschaft: Empfehlungs-Programm – kostenlose Nutzung und Einkommen durch Weiterempfehlung */
export const PRODUCT_BOTSCHAFT_2 = 'Durch Weiterempfehlung: kostenlose Nutzung und Einkommen erzielen'

/** Zielgruppe in einem Satz – für Werbung, mök2, alle Kanäle (eine Quelle). Fokus = gesamter Markt; Kunstmarkt = Unterkategorie. */
export const PRODUCT_ZIELGRUPPE =
  'Fokus gesamter Markt: alle, die Ideen oder Produkte professionell zeigen und vermarkten wollen. Kunstmarkt ist unsere Unterkategorie und das Einstiegstor (Künstler:innen, Galerien, Kunstvereine).'

/** Positionierung zu Social Media – eine Quelle für mök2, Presse, alle Kanäle. */
export const PRODUCT_POSITIONING_SOCIAL = 'Social Media ist Masse – wir sind individuell und Klasse.'

/** Der Kern, der alle anspricht – eigener Ort statt Miete bei anderen. */
export const PRODUCT_KERN_EIGENER_ORT = 'Eigener Ort statt Miete bei anderen.'

/** E-Mail für „Lizenz anfragen“ (CTA nach Demo). mailto: wird damit gebaut. */
export const PRODUCT_LIZENZ_ANFRAGE_EMAIL = 'info@kgm.at'

/** Betreff für Lizenz-Anfrage-E-Mail (kurz, erkennbar). */
export const PRODUCT_LIZENZ_ANFRAGE_BETREFF = 'kgm solution – Lizenz anfragen'

/** Basis-URL der App (für Presse/Links/QR – keine Importe aus navigation). */
export const BASE_APP_URL = 'https://k2-galerie.vercel.app'

/** E-Mail für Nutzer-Feedback / Verbesserungswünsche – nicht im UI anzeigen */
export const PRODUCT_FEEDBACK_EMAIL = 'georg.kreinecker@kgm.at'

/** Betreff für Feedback-E-Mail */
export const PRODUCT_FEEDBACK_BETREFF = 'kgm solution – Mein Wunsch / Feedback'

export type TenantId = 'k2' | 'demo' | 'oeffentlich' | 'vk2'

export interface TenantConfig {
  id: TenantId
  /** Galerie- / Atelier-Name (z. B. "K2 Galerie", "Atelier Muster") */
  galleryName: string
  /** Künstler:in 1 (z. B. Bilder) */
  artist1Name: string
  /** Künstler:in 2 (z. B. Keramik) */
  artist2Name: string
  /** Kurzer Slogan unter dem Titel */
  tagline: string
  /** Footer / Impressum-Zeile */
  footerLine: string
  /**
   * Optionale öffentliche Basis-URL für diesen Mandanten (z. B. nach Lizenz-Erwerb).
   * Wenn gesetzt: eigener QR-Code und Links für Marketing (Flyer, Visitenkarte) nutzen diese URL.
   * Siehe docs/PRODUKT-VISION.md – „Eigener QR-Code pro Lizenz“.
   */
  publicBaseUrl?: string
}

const STORAGE_KEY = 'k2-tenant'

/**
 * K2-Stammdaten: E-Mail und Telefon (Vorgabe für Admin/Galerie, wenn noch nichts gespeichert).
 * Nach Änderung: In der App unter Admin → Stammdaten speichern, damit sie überall ankommen.
 */
export const K2_STAMMDATEN_DEFAULTS = {
  martina: {
    name: 'Martina Kreinecker',
    email: 'martina.kreinecker@kgm.at',
    phone: '0664 1046337',
    website: '',
    address: '',
    city: '',
    country: '',
  },
  georg: {
    name: 'Georg Kreinecker',
    email: 'georg.kreinecker@kgm.at',
    phone: '0664 1046337',
    website: '',
    address: '',
    city: '',
    country: '',
  },
  gallery: {
    name: 'K2 Galerie Kunst&Keramik',
    address: 'Schlossergasse 4',
    city: '4070 Eferding',
    country: 'Österreich',
    phone: '0664 1046337',
    email: 'info@kgm.at', // Galerie-Kontakt (anpassen falls anders)
    website: 'www.k2-galerie.at',
    internetadresse: 'www.k2-galerie.at',
    openingHours: 'Samstag 9.30 bis 14.00 Uhr',
    bankverbindung: '',
    /** IBAN für Rechnung/SEPA (optional; wenn gesetzt: auf Rechnung + EPC-QR-Code) */
    iban: '',
    /** BIC für SEPA (optional; bei vielen österr. Banken nicht nötig) */
    bic: '',
    /** Geschäftskunden: Firma, USt-IdNr., Rechnungsadresse (falls abweichend). Doku: STAMMDATEN-GESCHAEFTSKUNDEN-VORBEREITUNG.md */
    firmenname: '',
    ustIdNr: '',
    rechnungAddress: '',
    rechnungCity: '',
    rechnungCountry: '',
  },
}

/** Prüft ob ein Adress-Objekt mindestens ein gesetztes Feld hat. */
function hasAddress(g: { address?: string; city?: string; country?: string } | null | undefined): boolean {
  if (!g || typeof g !== 'object') return false
  return Boolean((g.address && String(g.address).trim()) || (g.city && String(g.city).trim()) || (g.country && String(g.country).trim()))
}

/**
 * Prominente Adresse für Impressum, alle Dokumente und Google Maps.
 * Immer zuerst Galerie-Adresse; nur wenn keine Galerie-Adresse eingetragen ist, werden Künstler-Adressen verwendet (Martina, dann Georg).
 */
export function getProminenteAdresse(
  gallery: { address?: string; city?: string; country?: string } | null | undefined,
  martina: { address?: string; city?: string; country?: string } | null | undefined,
  georg: { address?: string; city?: string; country?: string } | null | undefined
): { address: string; city: string; country: string } {
  if (hasAddress(gallery)) return { address: (gallery!.address ?? '').trim(), city: (gallery!.city ?? '').trim(), country: (gallery!.country ?? '').trim() }
  if (hasAddress(martina)) return { address: (martina!.address ?? '').trim(), city: (martina!.city ?? '').trim(), country: (martina!.country ?? '').trim() }
  if (hasAddress(georg)) return { address: (georg!.address ?? '').trim(), city: (georg!.city ?? '').trim(), country: (georg!.country ?? '').trim() }
  return { address: '', city: '', country: '' }
}

/** Formatierte prominente Adresse (eine Zeile für Impressum/Dokumente/Maps). */
export function getProminenteAdresseFormatiert(gallery: any, martina: any, georg: any): string {
  const p = getProminenteAdresse(gallery, martina, georg)
  return [p.address, p.city, p.country].filter(Boolean).join(', ')
}

/** Konfiguration pro Mandant – K2 = deine Galerie, Demo = Beispiel für Lizenz-Version */
export const TENANT_CONFIGS: Record<TenantId, TenantConfig> = {
  k2: {
    id: 'k2',
    galleryName: 'K2 Galerie Kunst&Keramik',
    artist1Name: 'Martina Kreinecker',
    artist2Name: 'Georg Kreinecker',
    tagline: 'Kunst & Keramik',
    footerLine: 'K2 Galerie Kunst&Keramik | Martina & Georg Kreinecker',
  },
  demo: {
    id: 'demo',
    galleryName: 'Atelier Muster',
    artist1Name: 'Lisa Muster',
    artist2Name: 'Max Muster',
    tagline: 'Bilder & Skulptur',
    footerLine: 'Atelier Muster | Lisa & Max Muster',
  },
  /** Öffentliche Galerie K2 – nur Platzhalter, keine echten Namen (Impressum = Ausnahme) */
  oeffentlich: {
    id: 'oeffentlich',
    galleryName: 'Galerie Muster',
    artist1Name: 'Künstlerin Muster',
    artist2Name: 'Künstler Muster',
    tagline: 'Kunst & Keramik',
    footerLine: 'Galerie Muster | Kunst & Keramik',
  },
  vk2: {
    id: 'vk2',
    galleryName: 'Vereinsplattform',
    artist1Name: 'Künstler:in',
    artist2Name: 'Künstler:in',
    tagline: 'Kunstverein',
    footerLine: 'Vereinsplattform | Künstler:innen',
  },
}

/** Ein registriertes VK2-Mitglied (User mit K2-Account) – volle Stammdaten inkl. Adresse, Geburtstag, Eintritt */
export interface Vk2Mitglied {
  name: string
  email?: string
  lizenz?: string
  /** Kunstrichtung / Kategorie (z. B. Malerei, Keramik) */
  typ?: string
  /** Foto vom Mitglied (Porträt) – z. B. in Listen als kleines Rundbild */
  mitgliedFotoUrl?: string
  /** Werkfoto – erscheint als Bild in der Mitgliedergalerie (Kartenansicht) */
  imageUrl?: string
  phone?: string
  website?: string
  /** Straße und Hausnummer */
  strasse?: string
  plz?: string
  ort?: string
  land?: string
  /** Geburtsdatum (z. B. DD.MM.YYYY) */
  geburtsdatum?: string
  /** Eintrittsdatum in den Verein (kann lange zurückliegen bei bestehenden Vereinen) */
  eintrittsdatum?: string
  /** Eintrittsdatum / „Seit“ – Alias, wird bei Anzeige genutzt */
  seit?: string
  /** Auf der Karte / öffentlich sichtbar (Hakerl). false = gesperrt, nicht auf der öffentlichen Karte */
  oeffentlichSichtbar?: boolean
  /** Kurz-Bio / Vita für die öffentliche Mitgliederkarte (ein Satz) */
  bio?: string
  /** Kurzvita für Öffentlichkeitsarbeit (1–2 Sätze, Presse/Einladung/Flyer) */
  kurzVita?: string
  /** Ausführliche Vita (Langvita) – separater Bereich, editierbar, für Detailansicht */
  vita?: string
  /** Rolle im Verein: 'vorstand' = Voll-Admin (Präsident/Schriftführer), 'mitglied' = eingeschränkter Zugang */
  rolle?: 'vorstand' | 'mitglied'
  /** PIN für Mitglied-Login (4-stellig, vom Admin vergeben) */
  pin?: string
  /** Link zur eigenen K2-Galerie (wenn Lizenznehmer) oder externer Website */
  galerieLinkUrl?: string
  /** URL der Lizenz-Galerie auf Vercel (z.B. https://anna-k2.vercel.app) – für Vereinskatalog */
  lizenzGalerieUrl?: string
  /** Bankverbindung – für Mitglieder, die am Bonussystem teilnehmen */
  bankKontoinhaber?: string
  bankIban?: string
  bankBic?: string
  bankName?: string
}

/** VK2-Stammdaten: Verein mit Vorstand, Beirat, Mitgliedern (K2-Familie: gleiche Struktur, eigene Keys) */
export interface Vk2Stammdaten {
  verein: {
    name: string
    address: string
    city: string
    country: string
    vereinsnummer: string
    email: string
    website: string
    /** Für Rechnungen (Vereins-Kasse): Bankverbindung und IBAN – optional */
    bankverbindung?: string
    iban?: string
  }
  vorstand: { name: string }
  vize: { name: string }
  kassier: { name: string }
  schriftfuehrer: { name: string }
  beisitzer?: { name: string }
  /** Registrierte Mitglieder (User mit K2-Account/Lizenz). Ab 10 wird der Verein kostenfrei. Volle Daten. */
  mitglieder: Vk2Mitglied[]
  /** Nicht registrierte Mitglieder (ohne K2-Account). Obliegt dem Verein; werden im System erfasst (Datenschutz). */
  mitgliederNichtRegistriert: string[]
  /** Kommunikation: WhatsApp-Gruppe, Vorstand-Kontakt, Umfragen */
  kommunikation?: {
    /** WhatsApp Gruppen-Einladungslink (z.B. https://chat.whatsapp.com/xxx) */
    whatsappGruppeLink?: string
    /** Telefonnummer des Vorstands für WhatsApp (nur Ziffern, international: 43… Österreich, 49… Deutschland, etc.) */
    vorstandTelefon?: string
    /** Aktive Umfragen */
    umfragen?: Vk2Umfrage[]
  }
  /** Eigene Kategorien/Kunstrichtungen des Vereins für Mitglieder. Wenn gesetzt und nicht leer, ersetzen sie VK2_KUNSTBEREICHE im Dropdown und überall. */
  eigeneKategorien?: { id: string; label: string }[]
}

/** Umfrage für Vereinsmitglieder – wird per WhatsApp-Link geteilt */
export interface Vk2Umfrage {
  id: string
  frage: string
  antworten: string[]
  erstelltAm: string
  aktiv: boolean
}

/** Registrierungs-Config: Lizenztyp, Vereinsmitgliedschaft, Bonussystem-Option (für K2/ök2/VK2) */
export interface RegistrierungConfig {
  /** Basis = reduzierte Version, Pro = alle Features */
  lizenztyp: 'basis' | 'pro'
  /** Nutzer ist Vereinsmitglied (z. B. VK2-Verein) */
  vereinsmitglied: boolean
  /** Nur relevant wenn vereinsmitglied: true. false = 50 % Bonus (kein Bonussystem), true = Vollpreis (Bonussystem nutzen) */
  vollpreisFuerEmpfehlung: boolean
  /** Kostenlose Lizenz (Präfix KF) – das System kann kostenlose Lizenzen vergeben */
  kostenfrei: boolean
  /** Lizenznummer, die das K2-System vergibt. Präfix: B=Basis, P=Pro, VB=Verein+50 %, VP=Verein+Bonussystem, KF=Kostenfrei (vom Bonussystem ausgeschlossen) */
  lizenznummer: string
}

export const REGISTRIERUNG_CONFIG_DEFAULTS: RegistrierungConfig = {
  lizenztyp: 'pro',
  vereinsmitglied: false,
  vollpreisFuerEmpfehlung: false,
  kostenfrei: false,
  lizenznummer: '',
}

/** Ermittelt das Präfix der Lizenznummer aus der Registrierungs-Config: B, P, VB, VP, KF */
export function getLizenznummerPraefix(c: RegistrierungConfig): string {
  if (c.kostenfrei) return 'KF'
  if (c.vereinsmitglied) return c.vollpreisFuerEmpfehlung ? 'VP' : 'VB'
  return c.lizenztyp === 'pro' ? 'P' : 'B'
}

export const VK2_STAMMDATEN_DEFAULTS: Vk2Stammdaten = {
  verein: {
    name: '',
    address: '',
    city: '',
    country: '',
    vereinsnummer: '',
    email: '',
    website: '',
    bankverbindung: '',
    iban: '',
  },
  vorstand: { name: '' },
  vize: { name: '' },
  kassier: { name: '' },
  schriftfuehrer: { name: '' },
  beisitzer: { name: '' },
  mitglieder: [],
  mitgliederNichtRegistriert: [],
}

// Dummy-Fotos als SVG Data-URL (Portrait + Werk) – kein externer Server nötig
const _dummyColors = ['#e07b4a','#5b9bd5','#6dab6d','#c47ab5','#d4a843','#7a9ec4']
function _mkPortrait(i: number, initials: string): string {
  const c = _dummyColors[i % _dummyColors.length]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="${c}22"/><circle cx="100" cy="78" r="38" fill="${c}99"/><ellipse cx="100" cy="160" rx="52" ry="36" fill="${c}66"/><text x="100" y="88" text-anchor="middle" font-family="system-ui,sans-serif" font-size="32" font-weight="700" fill="${c}">${initials}</text></svg>`
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)))
}
function _mkWerk(i: number, titel: string, typ: string): string {
  const c = _dummyColors[i % _dummyColors.length]
  const shapes = [
    `<rect x="30" y="40" width="140" height="100" rx="8" fill="${c}44"/><circle cx="80" cy="90" r="28" fill="${c}88"/><polygon points="120,60 160,130 80,130" fill="${c}66"/>`,
    `<circle cx="100" cy="90" r="55" fill="${c}33"/><circle cx="100" cy="90" r="35" fill="${c}66"/><circle cx="100" cy="90" r="15" fill="${c}"/>`,
    `<rect x="25" y="35" width="150" height="110" rx="4" fill="${c}22"/><line x1="25" y1="35" x2="175" y2="145" stroke="${c}" stroke-width="3"/><line x1="175" y1="35" x2="25" y2="145" stroke="${c}88" stroke-width="2"/>`,
    `<polygon points="100,30 175,150 25,150" fill="${c}55"/><polygon points="100,55 155,145 45,145" fill="${c}99"/>`,
    `<rect x="40" y="50" width="50" height="80" fill="${c}77"/><rect x="110" y="70" width="50" height="60" fill="${c}44"/><rect x="60" y="100" width="80" height="30" fill="${c}"/>`,
    `<ellipse cx="100" cy="90" rx="65" ry="45" fill="${c}33"/><ellipse cx="100" cy="90" rx="40" ry="25" fill="${c}77"/><rect x="70" y="75" width="60" height="30" fill="${c}44"/>`,
  ]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="#f8f4ef"/>${shapes[i % shapes.length]}<text x="150" y="185" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" fill="#888">${titel} · ${typ}</text></svg>`
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)))
}

/** Ort für Mitgliederkarte (Untertitel). */
const _dm = [
  {
    name: 'Maria Mustermann',
    email: 'maria@muster.at',
    lizenz: 'VP-001',
    typ: 'Malerei',
    ort: 'Wien',
    bio: 'Malerei mit Öl und Acryl – Landschaften und Portraits.',
    kurzVita: 'Maria Mustermann arbeitet mit Öl und Acryl; Schwerpunkte Landschaften und Portraits. Studium der Bildenden Kunst, seit 2019 im Verein.',
    vita: 'Maria Mustermann\nMalerei · Öl, Acryl\n\nGeboren in Wien. Studium der Bildenden Kunst, Schwerpunkt Malerei.\n\nSeit 2019 Mitglied im Kunstverein Muster. Landschaften und Portraits in kräftigen Farben; Ausstellungen im In- und Ausland. Arbeiten in privaten Sammlungen.',
    seit: '2019',
  },
  {
    name: 'Hans Beispiel',
    email: 'hans@muster.at',
    lizenz: 'VP-002',
    typ: 'Skulptur',
    ort: 'Graz',
    bio: 'Bildhauer mit Fokus auf moderne Metall- und Holzskulpturen.',
    kurzVita: 'Hans Beispiel ist Bildhauer mit Fokus auf Metall und Holz. Zahlreiche Symposien und Ausstellungen, seit 2020 im Verein.',
    vita: 'Hans Beispiel\nSkulptur · Metall, Holz\n\nGeboren in Graz. Ausbildung in Bildhauerei und Metallgestaltung.\n\nSeit 2020 Mitglied im Kunstverein Muster. Moderne Skulpturen im öffentlichen Raum und in Galerien. Teilnahme an Bildhauer-Symposien in Österreich und Deutschland.',
    seit: '2020',
  },
  {
    name: 'Anna Probst',
    email: 'anna@muster.at',
    lizenz: 'VP-003',
    typ: 'Fotografie',
    ort: 'Linz',
    bio: 'Dokumentarfotografie und künstlerische Porträts.',
    kurzVita: 'Anna Probst widmet sich Dokumentarfotografie und künstlerischen Porträts. Preise und Stipendien, seit 2018 im Verein.',
    vita: 'Anna Probst\nFotografie · Dokumentar, Porträt\n\nGeboren in Linz. Studium der Fotografie und visuellen Medien.\n\nSeit 2018 Mitglied im Kunstverein Muster. Dokumentarische Reihen und künstlerische Porträts; Ausstellungen und Publikationen. Stipendien und Preise im Inland.',
    seit: '2018',
  },
  {
    name: 'Karl Vorlage',
    email: 'karl@muster.at',
    lizenz: 'VP-004',
    typ: 'Grafik',
    ort: 'Salzburg',
    bio: 'Illustration und digitale Grafik für Print und Web.',
    kurzVita: 'Karl Vorlage arbeitet in Illustration und digitaler Grafik für Print und Web. Seit 2021 Mitglied im Kunstverein Muster.',
    vita: 'Karl Vorlage\nGrafik · Illustration, Digital\n\nGeboren in Salzburg. Ausbildung in Grafikdesign und Illustration.\n\nSeit 2021 Mitglied im Kunstverein Muster. Illustrationen für Verlage und digitale Formate; freie Arbeiten in Siebdruck und Digital Print. Gruppenausstellungen.',
    seit: '2021',
  },
  {
    name: 'Eva Entwurf',
    email: 'eva@muster.at',
    lizenz: 'VP-005',
    typ: 'Keramik',
    ort: 'Innsbruck',
    bio: 'Töpferei und handgefertigte Keramikobjekte.',
    kurzVita: 'Eva Entwurf fertigt handgearbeitete Keramik und Objekte. Langjährige Werkstattpraxis, seit 2017 im Verein.',
    vita: 'Eva Entwurf\nKeramik · Objekt, Gebrauch\n\nGeboren in Innsbruck. Lehre und Werkstattpraxis in Keramik.\n\nSeit 2017 Mitglied im Kunstverein Muster. Handgefertigte Gefäße und Objekte; oxidierender und reduzierender Brand. Regelmäßige Teilnahme an Kunstmärkten und Ausstellungen.',
    seit: '2017',
  },
  {
    name: 'Josef Skizze',
    email: 'josef@muster.at',
    lizenz: 'VB-006',
    typ: 'Textil',
    ort: 'Klagenfurt',
    bio: 'Textile Kunst und experimentelle Stoffarbeiten.',
    kurzVita: 'Josef Skizze arbeitet mit textiler Kunst und experimentellen Stoffen. Seit 2022 Mitglied im Kunstverein Muster.',
    vita: 'Josef Skizze\nTextil · Experimentell, Objekt\n\nGeboren in Klagenfurt. Auseinandersetzung mit Textil und Material.\n\nSeit 2022 Mitglied im Kunstverein Muster. Experimentelle Stoffarbeiten und Objekte; Ausstellungen im Bereich Textilkunst und angewandte Kunst.',
    seit: '2022',
  },
]

/** Dummy-Verein für Demo/Vorschau – wird gesetzt wenn k2-vk2-stammdaten leer ist */
export const VK2_DEMO_STAMMDATEN: Vk2Stammdaten = {
  verein: {
    name: 'Kunstverein Muster',
    address: 'Musterstraße 12',
    city: 'Wien',
    country: 'Österreich',
    vereinsnummer: 'ZVR 123456789',
    email: 'office@kunstverein-muster.at',
    website: 'www.kunstverein-muster.at',
  },
  vorstand: { name: 'Maria Mustermann' },
  vize: { name: 'Hans Beispiel' },
  kassier: { name: 'Anna Probst' },
  schriftfuehrer: { name: 'Karl Vorlage' },
  beisitzer: { name: 'Eva Entwurf' },
  mitglieder: _dm.map((m, i) => ({
    ...m,
    oeffentlichSichtbar: true,
    mitgliedFotoUrl: _mkPortrait(i, m.name.split(' ').map(w => w[0]).join('').slice(0, 2)),
    imageUrl: _mkWerk(i, m.name.split(' ')[0], m.typ),
    // Erste 3 = imaginäre ök2-Lizenznehmer: direkter Link zur Demo-Galerie (Werke & Preise)
    lizenzGalerieUrl: i < 3 ? `${BASE_APP_URL}/projects/k2-galerie/galerie-oeffentlich` : undefined,
  })),
  mitgliederNichtRegistriert: ['Petra Farbe', 'Thomas Pinsel'],
}

/** Muster-Vereinsaktivität: Gemeinschaftsausstellung im Vereinshaus X, in einem Monat, mit allen Dummy-Künstlern. Inkl. 2 Druckfertige Dokumente (Einladung, Presse). */
export function getVk2DemoEvent(): {
  id: string
  title: string
  type: string
  date: string
  endDate: string
  startTime: string
  endTime: string
  dailyTimes: Record<string, { start: string; end: string }>
  description: string
  location: string
  documents: Array<{ id: string; name: string; fileName: string; fileType: string; fileData: string }>
  createdAt: string
  updatedAt: string
} {
  const d = new Date()
  d.setMonth(d.getMonth() + 1)
  const dateStr = d.toISOString().slice(0, 10)
  const kuenstler = _dm.map(m => `${m.name} (${m.typ})`).join(', ')
  return {
    id: 'vk2-demo-gemeinschaftsausstellung',
    title: 'Gemeinschaftsausstellung im Vereinshaus Muster',
    type: 'vernissage',
    date: dateStr,
    endDate: dateStr,
    startTime: '18:00',
    endTime: '21:00',
    dailyTimes: {},
    description: `Alle unsere Künstler:innen präsentieren ihre Werke unter einem Dach: ${kuenstler}. Malerei, Skulptur, Fotografie, Grafik, Keramik und Textilkunst – ein Querschnitt durch das Schaffen des Kunstvereins Muster.`,
    location: 'Vereinshaus Muster, Musterstraße 12, 1010 Wien',
    documents: [
      { id: 'vk2-demo-einladung', name: 'Einladung – Gemeinschaftsausstellung', fileName: 'einladung-gemeinschaftsausstellung.html', fileType: 'text/html', fileData: getVk2MusterEinladungDataUrl() },
      { id: 'vk2-demo-presse', name: 'Presseinformation – Gemeinschaftsausstellung', fileName: 'presse-gemeinschaftsausstellung.html', fileType: 'text/html', fileData: getVk2MusterPresseDataUrl() },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

const VK2_MUSTER_CSS = 'body{font-family:Georgia,serif;max-width:600px;margin:2rem auto;padding:0 1rem;line-height:1.6;color:#222}h1{font-size:1.35rem;border-bottom:2px solid #6b9080;padding-bottom:.5rem}p{margin:.5rem 0}.meta{color:#555;font-size:.9rem}'

function getVk2MusterEinladungDataUrl(): string {
  const v = VK2_DEMO_STAMMDATEN.verein
  const adr = [v.address, v.city].filter(Boolean).join(', ')
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Einladung – Gemeinschaftsausstellung</title><style>${VK2_MUSTER_CSS}</style></head><body><h1>Einladung zur Gemeinschaftsausstellung</h1><p><strong>${v.name}</strong></p><p class="meta">Vereinshaus Muster, Musterstraße 12, 1010 Wien · 18 Uhr</p><p>Wir freuen uns, Sie persönlich einzuladen. Alle Künstler:innen des Vereins präsentieren ihre Werke.</p><p>Anmeldung erwünscht: ${v.email || 'office@kunstverein-muster.at'}</p></body></html>`
  return 'data:text/html;charset=utf-8,' + encodeURIComponent(html)
}

function getVk2MusterPresseDataUrl(): string {
  const v = VK2_DEMO_STAMMDATEN.verein
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Presse – Gemeinschaftsausstellung</title><style>${VK2_MUSTER_CSS}</style></head><body><h1>Presseinformation – Gemeinschaftsausstellung</h1><p><strong>${v.name}</strong> lädt zur Vernissage ein.</p><p class="meta">Vereinshaus Muster, Musterstraße 12, 1010 Wien</p><p>Die Vereinsmitglieder zeigen Malerei, Skulptur, Fotografie, Grafik, Keramik und Textilkunst. Kontakt: ${v.email || 'office@kunstverein-muster.at'}</p></body></html>`
  return 'data:text/html;charset=utf-8,' + encodeURIComponent(html)
}

function getVk2MusterNewsletterDataUrl(): string {
  const v = VK2_DEMO_STAMMDATEN.verein
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Newsletter – Gemeinschaftsausstellung</title><style>${VK2_MUSTER_CSS}</style></head><body><h1>E-Mail Newsletter</h1><p><strong>${v.name}</strong></p><p class="meta">Einladung: Gemeinschaftsausstellung im Vereinshaus Muster</p><p>Liebe Kunstfreundinnen und Kunstfreunde, wir freuen uns auf Ihre Teilnahme. Anmeldung: ${v.email || 'office@kunstverein-muster.at'}</p></body></html>`
  return 'data:text/html;charset=utf-8,' + encodeURIComponent(html)
}

function getVk2MusterPlakatDataUrl(): string {
  const v = VK2_DEMO_STAMMDATEN.verein
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Plakat – Gemeinschaftsausstellung</title><style>${VK2_MUSTER_CSS}</style></head><body><h1>Gemeinschaftsausstellung im Vereinshaus Muster</h1><p class="meta">Vernissage · Vereinshaus Muster, Musterstraße 12, 1010 Wien</p><p>${v.name} · Kontakt: ${v.email || 'office@kunstverein-muster.at'}</p></body></html>`
  return 'data:text/html;charset=utf-8,' + encodeURIComponent(html)
}

function getVk2MusterEventFlyerDataUrl(): string {
  const v = VK2_DEMO_STAMMDATEN.verein
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Event-Flyer – Gemeinschaftsausstellung</title><style>${VK2_MUSTER_CSS}</style></head><body><h1>Gemeinschaftsausstellung im Vereinshaus Muster</h1><p class="meta">Vereinshaus Muster, Musterstraße 12, 1010 Wien</p><p>${v.name} – Handzettel für persönliche Einladung. ✉ ${v.email || 'office@kunstverein-muster.at'}</p></body></html>`
  return 'data:text/html;charset=utf-8,' + encodeURIComponent(html)
}

function getVk2MusterPresseaussendungDataUrl(): string {
  const v = VK2_DEMO_STAMMDATEN.verein
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Presseaussendung – Gemeinschaftsausstellung</title><style>${VK2_MUSTER_CSS}</style></head><body><h1>PRESSEAUSSENDUNG</h1><p><strong>${v.name}</strong> – Gemeinschaftsausstellung</p><p class="meta">Vereinshaus Muster, Musterstraße 12, 1010 Wien</p><p>Kontakt: ${v.email || 'office@kunstverein-muster.at'}</p>${getPresseLinksQrSnippet()}</body></html>`
  return 'data:text/html;charset=utf-8,' + encodeURIComponent(html)
}

function getVk2MusterSocialDataUrl(): string {
  const v = VK2_DEMO_STAMMDATEN.verein
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Social Media – Gemeinschaftsausstellung</title><style>${VK2_MUSTER_CSS}</style></head><body><h1>Social Media Posts</h1><p><strong>Instagram / Facebook / WhatsApp</strong></p><p>✦ Gemeinschaftsausstellung im Vereinshaus Muster</p><p>${v.name} · ✉ ${v.email || 'office@kunstverein-muster.at'}</p></body></html>`
  return 'data:text/html;charset=utf-8,' + encodeURIComponent(html)
}

/** Muster-Dokumente für Öffentlichkeitsarbeit (7 Typen wie ök2) zum Demo-Event – mit fileData zum Öffnen. */
export function getVk2DemoDocuments(eventId: string): Array<{ id: string; name: string; category: string; eventId: string; werbematerialTyp: string; fileData: string; fileName: string; fileType: string }> {
  return [
    { id: `${eventId}-newsletter`, name: 'Newsletter – Gemeinschaftsausstellung', eventId, category: 'pr-dokumente', werbematerialTyp: 'newsletter', fileData: getVk2MusterNewsletterDataUrl(), fileName: 'newsletter-gemeinschaftsausstellung.html', fileType: 'text/html' },
    { id: `${eventId}-plakat`, name: 'Plakat – Gemeinschaftsausstellung', eventId, category: 'pr-dokumente', werbematerialTyp: 'plakat', fileData: getVk2MusterPlakatDataUrl(), fileName: 'plakat-gemeinschaftsausstellung.html', fileType: 'text/html' },
    { id: `${eventId}-event-flyer`, name: 'Event-Flyer – Gemeinschaftsausstellung', eventId, category: 'pr-dokumente', werbematerialTyp: 'event-flyer', fileData: getVk2MusterEventFlyerDataUrl(), fileName: 'event-flyer-gemeinschaftsausstellung.html', fileType: 'text/html' },
    { id: `${eventId}-presse`, name: 'Presseaussendung – Gemeinschaftsausstellung', eventId, category: 'pr-dokumente', werbematerialTyp: 'presse', fileData: getVk2MusterPresseaussendungDataUrl(), fileName: 'presse-gemeinschaftsausstellung.html', fileType: 'text/html' },
    { id: `${eventId}-social`, name: 'Social Media – Gemeinschaftsausstellung', eventId, category: 'pr-dokumente', werbematerialTyp: 'social', fileData: getVk2MusterSocialDataUrl(), fileName: 'social-gemeinschaftsausstellung.html', fileType: 'text/html' },
  ]
}

/** Initialisiert VK2-Muster-Event und -Dokumente, wenn Verein = Kunstverein Muster und Events/Dokumente leer. */
export function initVk2DemoEventAndDocumentsIfEmpty(): void {
  if (typeof window === 'undefined') return
  try {
    const rawStamm = localStorage.getItem('k2-vk2-stammdaten')
    if (!rawStamm) return
    const stamm = JSON.parse(rawStamm) as Vk2Stammdaten
    if (stamm?.verein?.name !== 'Kunstverein Muster') return

    const events = loadEvents('vk2')
    if (Array.isArray(events) && events.length === 0) {
      saveEvents('vk2', [getVk2DemoEvent()])
    }

    const docs = loadDocuments('vk2')
    if (Array.isArray(docs) && docs.length === 0) {
      saveDocuments('vk2', getVk2DemoDocuments('vk2-demo-gemeinschaftsausstellung'))
    }
  } catch (_) {}
}

/** Für Demo „Kunstverein Muster“: ein Dummy-Werk pro einfachem Mitglied (ohne Lizenz-Galerie) im Vereinskatalog. */
function _seedVk2DemoArtworksIfEmpty(stammdaten: Vk2Stammdaten): void {
  const mitglieder = Array.isArray(stammdaten.mitglieder) ? stammdaten.mitglieder : []
  const demo = VK2_DEMO_STAMMDATEN.mitglieder
  for (let i = 3; i < Math.min(6, mitglieder.length); i++) {
    const m = mitglieder[i]
    if (!m?.name || (m as Vk2Mitglied).lizenzGalerieUrl) continue
    const key = `k2-vk2-artworks-${m.name.replace(/\s+/g, '-').toLowerCase()}`
    try {
      const raw = localStorage.getItem(key)
      if (raw) {
        const arr = JSON.parse(raw)
        if (Array.isArray(arr) && arr.length > 0) continue
      }
    } catch { /* ignore */ }
    const dm = demo[i] as (Vk2Mitglied & { imageUrl?: string }) | undefined
    const oneWerk = {
      id: `vk2-demo-werk-${i}`,
      number: `VK2-${(m.typ || 'O').slice(0, 1)}${i + 1}`,
      title: `${m.typ || 'Werk'} – ${m.name.split(' ')[0]}`,
      category: ((m.typ || 'sonstiges') as string).toLowerCase(),
      description: m.bio || '',
      imageUrl: dm?.imageUrl || OEK2_PLACEHOLDER_IMAGE,
      imVereinskatalog: true,
      price: 0,
      inShop: false,
      inExhibition: true,
    }
    localStorage.setItem(key, JSON.stringify([oneWerk]))
  }
}

/** Initialisiert VK2-Stammdaten mit Demo-Daten falls noch nichts gespeichert ist.
 *  Füllt auch fehlende Demo-Fotos nach (mitgliedFotoUrl / imageUrl) ohne echte Daten zu überschreiben.
 *  Für Demo-Verein: je ein Dummy-Werk pro einfachem Mitglied im Vereinskatalog. */
export function initVk2DemoStammdatenIfEmpty(): void {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem('k2-vk2-stammdaten')
    if (!raw) {
      localStorage.setItem('k2-vk2-stammdaten', JSON.stringify(VK2_DEMO_STAMMDATEN))
      _seedVk2DemoArtworksIfEmpty(VK2_DEMO_STAMMDATEN)
      return
    }
    const parsed = JSON.parse(raw) as Vk2Stammdaten
    if (!parsed?.verein?.name) {
      localStorage.setItem('k2-vk2-stammdaten', JSON.stringify(VK2_DEMO_STAMMDATEN))
      _seedVk2DemoArtworksIfEmpty(VK2_DEMO_STAMMDATEN)
      return
    }
    // Demo-Verein „Kunstverein Muster“: Muster-Mitglieder anzeigen (auch wenn mitglieder leer war)
    if (parsed.verein.name === 'Kunstverein Muster') {
      const hasMembers = Array.isArray(parsed.mitglieder) && parsed.mitglieder.length > 0
      if (!hasMembers) {
        const data = { ...parsed, mitglieder: VK2_DEMO_STAMMDATEN.mitglieder }
        localStorage.setItem('k2-vk2-stammdaten', JSON.stringify(data))
        _seedVk2DemoArtworksIfEmpty(data)
        return
      }
      // Fotos für bestehende Demo-Mitglieder nachfüllen (Foto/Bio/Vita fehlt)
      let changed = false
      const updated = parsed.mitglieder.map((m, i) => {
        const dm = VK2_DEMO_STAMMDATEN.mitglieder[i]
        if (!dm) return m
        const patch: Partial<Vk2Mitglied> = {}
        if (!m.mitgliedFotoUrl && dm.mitgliedFotoUrl) { patch.mitgliedFotoUrl = dm.mitgliedFotoUrl; changed = true }
        if (!m.imageUrl && dm.imageUrl) { patch.imageUrl = dm.imageUrl; changed = true }
        if (!m.bio && dm.bio) { patch.bio = dm.bio; changed = true }
        if (!m.kurzVita && (dm as Partial<Vk2Mitglied>).kurzVita) { patch.kurzVita = (dm as Partial<Vk2Mitglied>).kurzVita; changed = true }
        if (!m.vita && (dm as Partial<Vk2Mitglied>).vita) { patch.vita = (dm as Partial<Vk2Mitglied>).vita; changed = true }
        if (!m.seit && dm.seit) { patch.seit = dm.seit; changed = true }
        if (!m.ort && dm.ort) { patch.ort = dm.ort; changed = true }
        if (!m.lizenzGalerieUrl && dm.lizenzGalerieUrl) { patch.lizenzGalerieUrl = dm.lizenzGalerieUrl; changed = true }
        return Object.keys(patch).length > 0 ? { ...m, ...patch } : m
      })
      if (changed) {
        const data = { ...parsed, mitglieder: updated }
        localStorage.setItem('k2-vk2-stammdaten', JSON.stringify(data))
        _seedVk2DemoArtworksIfEmpty(data)
      } else {
        _seedVk2DemoArtworksIfEmpty(parsed)
      }
    }
  } catch (_) {}
}

/** Platzhalter-Bild für Musterwerke und ök2-Seiten (keine echten Fotos). Exportiert für Fallback bei Ladefehler. */
export const OEK2_PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5NdXN0ZXI8L3RleHQ+PC9zdmc+'
const MUSTER_PLACEHOLDER_IMAGE = OEK2_PLACEHOLDER_IMAGE

/** ök2: Ein Bild pro Kategorie für Musterwerke. M1/G1: Unsplash (wie Willkommensbild); übrige Kategorien: Inline-SVG, damit immer etwas angezeigt wird. */
export const OEK2_DEFAULT_ARTWORK_IMAGES: Record<string, string> = {
  /** M1 „Morgenlicht über den Hügeln“ – Landschaft, erstes Licht (Unsplash, lizenzfrei). */
  malerei: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=85',
  keramik: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzJkMzc0OCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2EwYWVjMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPktlcmFtaWs8L3RleHQ+PC9zdmc+',
  /** G1 „Durch das Fenster“ – Blick durch Fenster, klare Linien (Unsplash, lizenzfrei). */
  grafik: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=85',
  skulptur: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzJkMzc0OCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2EwYWVjMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlNrdWxwdHVyPC90ZXh0Pjwvc3ZnPg==',
  sonstiges: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzJkMzc0OCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2EwYWVjMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlNvbnN0aWdlczwvdGV4dD48L3N2Zz4=',
}

/** ök2: Default-Bilder für Willkommen/Galerie-Karte/Virtual-Tour.
 *  Willkommensbild = NUR stabile URL (nie Repo-Dateipfad) – Uraltbild ist bereits zweimal aufgetreten.
 *  Regel: .cursor/rules/oek2-willkommensbild-nie-uraltbild.mdc | GELOESTE-BUGS.md BUG-022 */
export const OEK2_WILLKOMMEN_IMAGES = {
  welcomeImage: 'https://images.unsplash.com/photo-1577083165633-14d2a4d2d6a4?w=1200&q=85',
  virtualTourImage: '/img/oeffentlich/galerie-innen.jpg',
  galerieCardImage: '/img/oeffentlich/galerie-karte.jpg',
}

/** ök2: Pfade, die NIEMALS als Willkommensbild angezeigt werden (alte/irrelevante Dateien). Siehe Regel oek2-willkommensbild-nie-uraltbild.mdc. */
export const OEK2_LEGACY_WELCOME_IMAGE_PATHS: string[] = [
  '/img/oeffentlich/willkommen.jpg',
]

/** Gibt für ök2 das anzuzeigende Willkommensbild zurück: gespeicherter Wert, außer er steht auf einer Legacy-Liste – dann sicherer Default. */
export function getOek2WelcomeImageEffective(storedOrStammdaten: string | undefined): string {
  const v = (storedOrStammdaten || '').trim()
  if (!v) return OEK2_WILLKOMMEN_IMAGES.welcomeImage
  if (OEK2_LEGACY_WELCOME_IMAGE_PATHS.some((p) => v === p || v.endsWith(p))) return OEK2_WILLKOMMEN_IMAGES.welcomeImage
  return v
}

/** Liefert das Standard-Werkbild für ök2 für eine Kategorie (Fallback: sonstiges). */
export function getOek2DefaultArtworkImage(categoryId: string | undefined): string {
  const id = categoryId && OEK2_DEFAULT_ARTWORK_IMAGES[categoryId] ? categoryId : 'sonstiges'
  return OEK2_DEFAULT_ARTWORK_IMAGES[id] || OEK2_DEFAULT_ARTWORK_IMAGES.sonstiges
}

/** Mustertexte für Öffentliches Projekt (ök2) – keine echten personenbezogenen Daten, vollständige Basis für Impressum/Shop/Demo. Zwei Künstler:innen mit Namen und Gesicht (Demo-Fotos). */
export const MUSTER_TEXTE = {
  martina: {
    name: 'Lena Berg',
    email: 'kontakt-bilder@galerie-muster.example',
    phone: '+43 1 234 5678',
    website: 'www.kuenstlerin-muster.example',
    /** Profilfoto für Demo (Unsplash, lizenzfrei). */
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=85',
  },
  georg: {
    name: 'Paul Weber',
    email: 'kontakt-skulptur@galerie-muster.example',
    phone: '+43 1 234 5679',
    website: 'www.kuenstler-muster.example',
    /** Profilfoto für Demo (Unsplash, lizenzfrei). */
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=85',
  },
  gallery: {
    address: 'Musterstraße 1',
    city: '12345 Musterstadt',
    country: 'Österreich',
    phone: '+43 1 234 5670',
    email: 'info@galerie-muster.example',
    website: 'www.galerie-muster.example',
    internetadresse: 'www.galerie-muster.example',
    openingHours: 'Do–So 14–18 Uhr',
    bankverbindung: 'AT00 0000 0000 0000 0000 (Musterbank, nur Demo)',
    firmenname: '',
    ustIdNr: '',
    rechnungAddress: '',
    rechnungCity: '',
    rechnungCountry: '',
    adminPassword: '',
    /* Einladende Musterbilder für ök2 (lizenzfrei) – Willkommensseite & Galerie-Start */
    welcomeImage: OEK2_WILLKOMMEN_IMAGES.welcomeImage,
    virtualTourImage: OEK2_WILLKOMMEN_IMAGES.virtualTourImage,
    galerieCardImage: OEK2_WILLKOMMEN_IMAGES.galerieCardImage,
  },
  welcomeText: 'Für Künstler:innen – eine Galerie für Werke, Ideen und Produkte. Ein Modell: Bilder und Skulptur in einem Raum.',
  artist1Bio: 'Lena Berg: Malerei, Grafik, Mischtechnik. Studium Bildende Kunst, seit über zwanzig Jahren freischaffend. Landschaften und Atelierblicke – kräftige Farben, reduzierte Formen. Ausstellungen im In- und Ausland, Arbeiten in privaten Sammlungen.',
  artist2Bio: 'Paul Weber: Keramik und Skulptur. Ausbildung Keramiker, langjährig Aufbau und Brand. Objekte und Skulpturen – handwerkliche Präzision, zeitgenössische Formen. Regelmäßig Kunstmärkte und Gruppenausstellungen.',
  gemeinsamText: 'Lena Berg und Paul Weber eröffnen die Galerie Muster – Bilder und Skulptur in einem Raum.',
  /** ök2: nur eine Person (Lena Berg) – Absatz unter der Kunstschaffenden-Karte. */
  gemeinsamTextSinglePerson: 'Lena Berg eröffnet die Galerie Muster – Malerei, Grafik und Mischtechnik.',
}

/** Dummy-Vita für Künstler:in 1 (Malerei/Grafik), ~50 Zeilen – für Einstellungen, Außenkommunikation, Galeriegestaltung. */
export const MUSTER_VITA_MARTINA = `Lena Berg
Malerei · Grafik · Mischtechnik

Geboren in Wien. Seit früher Jugend Auseinandersetzung mit Zeichnung und Farbe.

1998–2003 Studium der Bildenden Kunst, Schwerpunkt Malerei und Grafik. Diplom mit Auszeichnung.

2003–2006 Atelier in Wien; erste Einzelausstellungen; Teilnahme an Kunstmessen.

2006 Umzug nach Niederösterreich. Atelier in einem ehemaligen Gutshof – Licht und Landschaft prägen die Arbeit.

2008 Stipendium Künstlerhaus; Arbeitsaufenthalt in der Toskana. Serie „Tagebücher der Landschaft“.

2010–2015 Lehrtätigkeit Zeichen und Malerei (Kunstschule, Workshops). Zahlreiche Gruppenausstellungen im In- und Ausland.

2015 Fokus auf großformatige Malerei; Reduktion der Palette, stärkere Betonung von Struktur und Fläche.

2018 Einzelausstellung Galerie Musterstadt; Katalog „Zwischenräume“.

2020 Serie „Fenster“ – Innen und Außen, Linolschnitte und Monotypien. Auflage 15.

2022 Beteiligung Kunst am Bau (öffentlicher Raum); Arbeiten in privaten und institutionellen Sammlungen.

2024 Gründung der Galerie Muster gemeinsam mit Paul Weber. Malerei und Grafik im Dialog mit Keramik und Skulptur.

Arbeitsweise: Acryl, Öl, Tusche, Linolschnitt, Mischtechnik. Themen: Landschaft, Atelier, Erinnerung, Reduktion. Arbeiten in privaten Sammlungen in Österreich, Deutschland, Schweiz.

Kontakt und aktuelle Werke über die Galerie.`

/** Dummy-Vita für Künstler:in 2 (Keramik/Skulptur), ~50 Zeilen. */
export const MUSTER_VITA_GEORG = `Paul Weber
Keramik · Skulptur

Geboren in Graz. Ursprünglich Ausbildung im technischen Bereich; Wechsel zur Keramik Mitte der 1990er Jahre.

1995–1999 Lehre und Praxis in Keramikwerkstätten; Schwerpunkt Aufbau, Drehen, Brand.

1999 Eigenes Atelier; erste Ausstellungen mit Gebrauchskeramik und Objekten.

2002 Umstellung auf oxidierenden und reduzierenden Brand; Experimente mit Glasuren und Engoben.

2005 Teilnahme an Keramiksymposien; Austausch mit Bildhauer:innen und Keramiker:innen in Österreich und Tschechien.

2008 Erste skulpturale Serien; Verbindung von Gefäß und Figur. Ausstellung „Grenzgänge“.

2010–2016 Regelmäßige Teilnahme an Kunstmärkten und Messen; Verkauf in Galerien und direkt aus dem Atelier.

2016 Serie „Stehende Formen“ – abstrakte Skulptur, handgeformt, oxidierend gebrannt. Einzelstücke.

2018 Kooperation mit Architekturbüro (Kunst am Bau); großformatige Wandobjekte.

2020 Fokus auf Reduktion: wenige Formen, klare Linien, Oberflächen im Wechsel von matt und glasiert.

2022 Einzelausstellung „Ton und Zeit“; Katalog mit Texten zur Arbeitsweise.

2024 Mitgründung der Galerie Muster. Keramik und Skulptur im Zusammenspiel mit Malerei und Grafik.

Arbeitsweise: Handaufbau, Drehen, Modellieren. Brennverfahren: Oxidation, Reduktion, Raku. Material: Steinzeug, Porzellan, Engoben. Themen: Form, Balance, Reduktion, Serie und Einzelstück.

Arbeiten in privaten Sammlungen und im öffentlichen Raum.

Kontakt und aktuelle Werke über die Galerie.`

/** Max. 5 Werk-Kategorien – einheitlich für Werke-Verwaltung, History und Kassa */
export const ARTWORK_CATEGORIES = [
  { id: 'malerei', label: 'Bilder' },
  { id: 'keramik', label: 'Keramik' },
  { id: 'grafik', label: 'Grafik' },
  { id: 'skulptur', label: 'Skulptur' },
  { id: 'sonstiges', label: 'Sonstiges' },
] as const

export type ArtworkCategoryId = typeof ARTWORK_CATEGORIES[number]['id']

/** Überkategorien Produkt (Vision: typgerechte Kategorien pro entryType). Doku: docs/PLAN-WOHIN-UEBERKATEGORIEN.md */
export const PRODUCT_CATEGORIES = [
  { id: 'druck', label: 'Druck / Repro' },
  { id: 'serie', label: 'Serie / Edition' },
  { id: 'merchandise', label: 'Merchandise' },
  { id: 'buch', label: 'Buch' },
  { id: 'sonstiges_produkt', label: 'Sonstiges' },
] as const

export type ProductCategoryId = typeof PRODUCT_CATEGORIES[number]['id']

/** Überkategorien Idee (Vision: typgerechte Kategorien pro entryType). Doku: docs/PLAN-WOHIN-UEBERKATEGORIEN.md */
export const IDEA_CATEGORIES = [
  { id: 'projekt', label: 'Projekt' },
  { id: 'kooperation', label: 'Kooperation' },
  { id: 'dienstleistung', label: 'Dienstleistung' },
  { id: 'konzept', label: 'Konzept' },
  { id: 'sonstiges_idee', label: 'Sonstiges' },
] as const

export type IdeaCategoryId = typeof IDEA_CATEGORIES[number]['id']

/** Kategorie-Liste für den gegebenen entryType (eine Quelle für Admin, mobil, Kassa). */
export function getCategoriesForEntryType(entryType: string | undefined): readonly { id: string; label: string }[] {
  if (entryType === 'product') return PRODUCT_CATEGORIES
  if (entryType === 'idea') return IDEA_CATEGORIES
  return ARTWORK_CATEGORIES
}

/** Prüft, ob die Kategorie zum Typ passt (für Konsistenz-Check auf Werkkarten). */
export function categoryBelongsToEntryType(categoryId: string | undefined, entryType: string | undefined): boolean {
  if (!categoryId) return true
  const effectiveType = entryType && ENTRY_TYPES.some((t) => t.id === entryType) ? entryType : 'artwork'
  const allowed = getCategoriesForEntryType(effectiveType)
  return allowed.some((c) => c.id === categoryId)
}

/** Thematische Phrasen, die keine technische Unterkategorie sind (z. B. „Kunst und Kunstschaffenden“ passt nicht zu „Druck / Repro“). */
const THEMATIC_SUBCATEGORY_PHRASES = [
  'kunst und kunstschaffenden',
  'kunst und kunstschaffende',
  'kunstschaffenden',
  'kunstschaffende',
]

/** Kategorien, bei denen thematische Phrasen nicht als Unterkategorie passen (Produkt-Kategorien). */
const CATEGORIES_NO_THEMATIC_SUBCATEGORY = ['druck', 'serie', 'merchandise', 'buch', 'sonstiges_produkt']

/** Prüft, ob die freie Unterkategorie zur Kategorie plausibel ist (z. B. „Kunst und Kunstschaffenden“ nicht bei „Druck / Repro“). */
export function isSubcategoryPlausibleForCategory(categoryId: string | undefined, subcategoryFree: string): boolean {
  const sub = (subcategoryFree || '').trim().toLowerCase()
  if (!sub) return true
  if (!categoryId) return true
  if (!CATEGORIES_NO_THEMATIC_SUBCATEGORY.includes(categoryId)) return true
  const hasThematic = THEMATIC_SUBCATEGORY_PHRASES.some((phrase) => sub.includes(phrase))
  return !hasThematic
}

/**
 * Werktypen (Vision: Werke = Oberbegriff, Kunstwerk = Unterkategorie).
 * Ein Modell, eine Liste – Typ als Feld, konfigurierbar. Kunst = Träger der Idee; ganzer Markt hat Platz.
 * Doku: docs/VISION-WERKE-IDEEN-PRODUKTE.md
 */
export const ENTRY_TYPES = [
  { id: 'artwork', label: 'Kunstwerk' },
  { id: 'product', label: 'Produkt' },
  { id: 'idea', label: 'Idee' },
] as const

export type EntryTypeId = typeof ENTRY_TYPES[number]['id']

export function getEntryTypeLabel(entryType: string | undefined): string {
  if (!entryType) return 'Kunstwerk'
  const t = ENTRY_TYPES.find((x) => x.id === entryType)
  return t ? t.label : entryType
}

/** VK2: Kunstbereiche (ein „Werk“ = ein Künstler:innen-Profil im Verein). Standard-Liste; kann pro Verein durch eigene Kategorien ersetzt werden. */
export const VK2_KUNSTBEREICHE = [
  { id: 'malerei', label: 'Malerei' },
  { id: 'keramik', label: 'Keramik' },
  { id: 'grafik', label: 'Grafik' },
  { id: 'skulptur', label: 'Skulptur' },
  { id: 'fotografie', label: 'Fotografie' },
  { id: 'textil', label: 'Textil' },
  { id: 'sonstiges', label: 'Sonstiges' },
] as const

/** VK2: Liefert die Kunstrichtungen für den Verein – eigene Kategorien, wenn gesetzt, sonst Standard (VK2_KUNSTBEREICHE). */
export function getVk2Kunstrichtungen(stamm: Vk2Stammdaten | null | undefined): { id: string; label: string }[] {
  const list = stamm?.eigeneKategorien
  if (list && list.length > 0) return list
  return [...VK2_KUNSTBEREICHE]
}

/** VK2: Seed-Künstler:innen (ein Platzhalter pro Kunstbereich), wenn k2-vk2-artworks leer */
const _vk2SeedTs = new Date().toISOString()
export const SEED_VK2_ARTISTS = [
  { id: 'vk2-seed-malerei', number: 'VK2-M1', title: 'Malerei', category: 'malerei', description: 'Künstler:in Malerei.', imageUrl: OEK2_DEFAULT_ARTWORK_IMAGES.malerei || OEK2_PLACEHOLDER_IMAGE, price: 0, inShop: false, inExhibition: true, createdAt: _vk2SeedTs, addedToGalleryAt: _vk2SeedTs },
  { id: 'vk2-seed-keramik', number: 'VK2-K1', title: 'Keramik', category: 'keramik', description: 'Künstler:in Keramik.', imageUrl: OEK2_DEFAULT_ARTWORK_IMAGES.keramik || OEK2_PLACEHOLDER_IMAGE, price: 0, inShop: false, inExhibition: true, createdAt: _vk2SeedTs, addedToGalleryAt: _vk2SeedTs },
  { id: 'vk2-seed-grafik', number: 'VK2-G1', title: 'Grafik', category: 'grafik', description: 'Künstler:in Grafik.', imageUrl: OEK2_DEFAULT_ARTWORK_IMAGES.grafik || OEK2_PLACEHOLDER_IMAGE, price: 0, inShop: false, inExhibition: true, createdAt: _vk2SeedTs, addedToGalleryAt: _vk2SeedTs },
  { id: 'vk2-seed-skulptur', number: 'VK2-S1', title: 'Skulptur', category: 'skulptur', description: 'Künstler:in Skulptur.', imageUrl: OEK2_DEFAULT_ARTWORK_IMAGES.skulptur || OEK2_PLACEHOLDER_IMAGE, price: 0, inShop: false, inExhibition: true, createdAt: _vk2SeedTs, addedToGalleryAt: _vk2SeedTs },
  { id: 'vk2-seed-fotografie', number: 'VK2-F1', title: 'Fotografie', category: 'fotografie', description: 'Künstler:in Fotografie.', imageUrl: OEK2_DEFAULT_ARTWORK_IMAGES.sonstiges || OEK2_PLACEHOLDER_IMAGE, price: 0, inShop: false, inExhibition: true, createdAt: _vk2SeedTs, addedToGalleryAt: _vk2SeedTs },
  { id: 'vk2-seed-textil', number: 'VK2-T1', title: 'Textil', category: 'textil', description: 'Künstler:in Textil.', imageUrl: OEK2_DEFAULT_ARTWORK_IMAGES.sonstiges || OEK2_PLACEHOLDER_IMAGE, price: 0, inShop: false, inExhibition: true, createdAt: _vk2SeedTs, addedToGalleryAt: _vk2SeedTs },
  { id: 'vk2-seed-sonstiges', number: 'VK2-O1', title: 'Sonstiges', category: 'sonstiges', description: 'Künstler:in Sonstiges.', imageUrl: OEK2_DEFAULT_ARTWORK_IMAGES.sonstiges || OEK2_PLACEHOLDER_IMAGE, price: 0, inShop: false, inExhibition: true, createdAt: _vk2SeedTs, addedToGalleryAt: _vk2SeedTs },
]

/** Kategorie-ID → Anzeigetext (für Kassa, History, Admin). Prüft ARTWORK, PRODUCT, IDEA – eine Quelle. */
export function getCategoryLabel(categoryId: string | undefined): string {
  if (!categoryId) return ''
  const fromArt = ARTWORK_CATEGORIES.find((x) => x.id === categoryId)
  if (fromArt) return fromArt.label
  const fromProd = PRODUCT_CATEGORIES.find((x) => x.id === categoryId)
  if (fromProd) return fromProd.label
  const fromIdea = IDEA_CATEGORIES.find((x) => x.id === categoryId)
  if (fromIdea) return fromIdea.label
  return categoryId
}

/** Kategorie-ID → Buchstabe für Werknummer (M/K/G/S/O). Für product/idea: P bzw. I (entryType entscheidet). */
const CATEGORY_PREFIX_LETTER: Record<string, string> = { malerei: 'M', keramik: 'K', grafik: 'G', skulptur: 'S', sonstiges: 'O' }
export function getCategoryPrefixLetter(cat: string | undefined, entryType?: string): string {
  if (entryType === 'product') return 'P'
  if (entryType === 'idea') return 'I'
  return (cat && CATEGORY_PREFIX_LETTER[cat]) || 'M'
}

/** Musterwerke für ök2 – zwei vielseitige Künstler:innen, je ein Werk pro Kategorie; mit Beschreibung und Kategoriebild. Vision: Kunstwerk / Produkt / Idee sichtbar (entryType). */
const _musterTs = new Date().toISOString()
export const MUSTER_ARTWORKS = [
  { id: 'muster-1', number: 'M1', title: 'Morgenlicht über den Hügeln', category: 'malerei', artist: 'Lena Berg', imageUrl: getOek2DefaultArtworkImage('malerei'), price: 480, description: 'Acryl auf Leinwand, 80 × 60 cm. Weite Landschaft im ersten Licht – kräftige Farben, reduzierter Stil. Aus der Serie „Tageszeiten“.', inExhibition: true, inShop: true, createdAt: _musterTs, addedToGalleryAt: _musterTs, entryType: 'artwork' as const },
  { id: 'muster-2', number: 'P1', title: 'Vase „Herbstlaub“', category: 'serie', artist: 'Paul Weber', imageUrl: getOek2DefaultArtworkImage('keramik'), price: 320, description: 'Steingut, handgeformt, Engobe in Erdtönen, 28 cm hoch. Inspiriert von herbstlichen Wäldern – matt glasiert, haptisch.', inExhibition: true, inShop: true, createdAt: _musterTs, addedToGalleryAt: _musterTs, entryType: 'product' as const },
  { id: 'muster-3', number: 'G1', title: 'Durch das Fenster', category: 'grafik', artist: 'Lena Berg', imageUrl: getOek2DefaultArtworkImage('grafik'), price: 180, description: 'Linolschnitt, Auflage 15, 30 × 40 cm. Innen und Außen – Blick aus dem Atelier. Klare Linien, starke Kontraste.', inExhibition: true, inShop: true, createdAt: _musterTs, addedToGalleryAt: _musterTs, entryType: 'artwork' as const },
  { id: 'muster-4', number: 'S1', title: 'Stehende Form', category: 'skulptur', artist: 'Paul Weber', imageUrl: getOek2DefaultArtworkImage('skulptur'), price: 1200, description: 'Keramik, oxidierend gebrannt, 45 cm. Abstrakte Figur – Balance und Bewegung. Einzelstück.', inExhibition: true, inShop: true, createdAt: _musterTs, addedToGalleryAt: _musterTs, entryType: 'artwork' as const },
  { id: 'muster-5', number: 'I1', title: 'Kleines Feld', category: 'konzept', artist: 'Lena Berg', imageUrl: getOek2DefaultArtworkImage('sonstiges'), price: 95, description: 'Mischtechnik auf Papier, 25 × 25 cm. Farbige Flächen und Strukturen – experimentell, spielerisch.', inExhibition: true, inShop: true, createdAt: _musterTs, addedToGalleryAt: _musterTs, entryType: 'idea' as const },
]

/** Einladung Vernissage – HTML aus MUSTER_TEXTE (Stammdaten), für Demo/ök2. */
function getMusterEinladungDataUrl(): string {
  const g = MUSTER_TEXTE.gallery
  const m = MUSTER_TEXTE.martina.name
  const p = MUSTER_TEXTE.georg.name
  const adresse = [g.address, g.city, g.country].filter(Boolean).join(', ')
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Einladung Vernissage</title><style>body{font-family:Georgia,serif;max-width:560px;margin:2rem auto;padding:0 1rem;line-height:1.6;color:#222}h1{font-size:1.5rem;border-bottom:2px solid #6b9080;padding-bottom:.5rem}p{margin:.75rem 0}.meta{color:#555;font-size:.95rem}</style></head><body><h1>Einladung zur Vernissage</h1><p><strong>Galerie Muster</strong> – Malerei, Keramik, Grafik &amp; Skulptur</p><p class="meta">Samstag, 15. März 2026, 18 Uhr</p><p>${adresse || 'Musterstraße 1, 12345 Musterstadt'}</p><p>Wir freuen uns auf Ihren Besuch. ${m} und ${p} präsentieren neue Arbeiten aus allen Sparten.</p><p>Um Anmeldung wird gebeten: ${g.email || 'info@galerie-muster.example'}</p></body></html>`
  return 'data:text/html;charset=utf-8,' + encodeURIComponent(html)
}

/** Snippet Links & QR für Presseaussendungen (ök2/VK2) – Platzhalter <!-- QR_BLOCK --> wird beim Öffnen ersetzt. */
function getPresseLinksQrSnippet(): string {
  const oek2 = BASE_APP_URL + '/projects/k2-galerie/galerie-oeffentlich'
  const willkommen = BASE_APP_URL + '/willkommen'
  const vk2 = BASE_APP_URL + '/projects/vk2'
  return `<p class="meta">– Ende der Presseaussendung –</p><div class="presse-links-qr" style="margin-top:1.2rem;padding-top:1rem;border-top:1px solid #ddd;"><p><strong>Links &amp; QR-Codes</strong></p><p>ök2 Demo: <a href="${oek2}">${oek2}</a><br>Willkommen &amp; Lizenz: <a href="${willkommen}">${willkommen}</a><br>VK2 Vereinsplattform: <a href="${vk2}">${vk2}</a></p><!-- QR_BLOCK --></div>`
}

/** Presse-Text Vernissage – HTML aus MUSTER_TEXTE, für Öffentlichkeitsarbeit. */
function getMusterPresseDataUrl(): string {
  const g = MUSTER_TEXTE.gallery
  const m = MUSTER_TEXTE.martina.name
  const p = MUSTER_TEXTE.georg.name
  const adresse = [g.address, g.city, g.country].filter(Boolean).join(', ')
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Presse Vernissage</title><style>body{font-family:Georgia,serif;max-width:600px;margin:2rem auto;padding:0 1rem;line-height:1.65;color:#222}h1{font-size:1.35rem;border-bottom:2px solid #6b9080;padding-bottom:.4rem}p{margin:.6rem 0}.meta{color:#555;font-size:.9rem}</style></head><body><h1>Presseinformation – Vernissage</h1><p><strong>Galerie Muster</strong> lädt zur Eröffnung der Ausstellung „Neue Arbeiten“ ein.</p><p class="meta">Samstag, 15. März 2026, 18 Uhr<br>${adresse || 'Musterstraße 1, 12345 Musterstadt'}</p><p>${m} (Malerei, Grafik) und ${p} (Keramik, Skulptur) zeigen aktuelle Werke in Malerei, Keramik, Grafik und Skulptur. Die Ausstellung ist im Anschluss zu den Öffnungszeiten zu sehen.</p><p>Kontakt: ${g.email || 'info@galerie-muster.example'}, ${g.phone || ''}</p>${getPresseLinksQrSnippet()}</body></html>`
  return 'data:text/html;charset=utf-8,' + encodeURIComponent(html)
}

const MUSTER_CSS = 'body{font-family:Georgia,serif;max-width:600px;margin:2rem auto;padding:0 1rem;line-height:1.6;color:#222}h1{font-size:1.35rem;border-bottom:2px solid #6b9080;padding-bottom:.5rem}p{margin:.5rem 0}.meta{color:#555;font-size:.9rem}'

/** Newsletter Muster (ök2) – HTML aus MUSTER_TEXTE, einheitliches Design. */
function getMusterNewsletterDataUrl(): string {
  const g = MUSTER_TEXTE.gallery
  const m = MUSTER_TEXTE.martina.name
  const p = MUSTER_TEXTE.georg.name
  const adresse = [g.address, g.city].filter(Boolean).join(', ')
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Newsletter – Vernissage</title><style>${MUSTER_CSS}</style></head><body><h1>E-Mail Newsletter</h1><p><strong>Galerie Muster</strong></p><p class="meta">Einladung: Vernissage – Neue Arbeiten · Samstag, 15. März 2026, 18 Uhr</p><p>Liebe Kunstfreundinnen und Kunstfreunde,</p><p>wir freuen uns, Sie persönlich zu unserer Veranstaltung einladen zu dürfen: <strong>Vernissage – Neue Arbeiten</strong>.</p><p>${adresse ? `📍 ${adresse}` : ''}</p><p>${m} und ${p} zeigen neue Arbeiten aus Malerei, Keramik, Grafik und Skulptur.</p><p>Anmeldung erwünscht: ${g.email || 'info@galerie-muster.example'}</p><p>Mit herzlichen Grüßen<br>${m} &amp; ${p}<br>Galerie Muster</p></body></html>`
  return 'data:text/html;charset=utf-8,' + encodeURIComponent(html)
}

/** Plakat Muster (ök2). */
function getMusterPlakatDataUrl(): string {
  const g = MUSTER_TEXTE.gallery
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Plakat – Vernissage</title><style>${MUSTER_CSS}</style></head><body><h1>Vernissage – Neue Arbeiten</h1><p class="meta">Samstag, 15. März 2026, 18 Uhr</p><p>Galerie Muster · ${g.address || 'Musterstraße 1'}, ${(g as any).city || '12345 Musterstadt'}</p><p>Lena Berg &amp; Paul Weber · Malerei, Keramik, Grafik &amp; Skulptur</p><p>Kontakt: ${g.email || 'info@galerie-muster.example'}</p></body></html>`
  return 'data:text/html;charset=utf-8,' + encodeURIComponent(html)
}

/** Event-Flyer Muster (ök2). */
function getMusterEventFlyerDataUrl(): string {
  const g = MUSTER_TEXTE.gallery
  const m = MUSTER_TEXTE.martina.name
  const p = MUSTER_TEXTE.georg.name
  const adresse = [g.address, (g as any).city].filter(Boolean).join(', ')
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Event-Flyer – Vernissage</title><style>${MUSTER_CSS}</style></head><body><h1>Vernissage – Neue Arbeiten</h1><p class="meta">Samstag, 15. März 2026, 18 Uhr</p><p>${adresse || 'Musterstraße 1, 12345 Musterstadt'}</p><p>${m} und ${p} präsentieren neue Arbeiten. Handzettel für persönliche Einladung.</p><p>${g.email ? `✉ ${g.email}` : ''} ${g.phone ? `☎ ${g.phone}` : ''}</p></body></html>`
  return 'data:text/html;charset=utf-8,' + encodeURIComponent(html)
}

/** Presseaussendung Muster (ök2). */
function getMusterPresseaussendungDataUrl(): string {
  const g = MUSTER_TEXTE.gallery
  const m = MUSTER_TEXTE.martina.name
  const p = MUSTER_TEXTE.georg.name
  const adresse = [g.address, (g as any).city].filter(Boolean).join(', ')
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Presseaussendung – Vernissage</title><style>${MUSTER_CSS}</style></head><body><h1>PRESSEAUSSENDUNG</h1><p><strong>Galerie Muster</strong> – Vernissage – Neue Arbeiten</p><p class="meta">Samstag, 15. März 2026, 18 Uhr · ${adresse || 'Musterstraße 1, 12345 Musterstadt'}</p><p>${m} und ${p} zeigen aktuelle Werke in Malerei, Keramik, Grafik und Skulptur.</p><p>Kontakt: ${g.email || 'info@galerie-muster.example'}, ${g.phone || ''}</p>${getPresseLinksQrSnippet()}</body></html>`
  return 'data:text/html;charset=utf-8,' + encodeURIComponent(html)
}

/** Social Media Muster (ök2). */
function getMusterSocialDataUrl(): string {
  const g = MUSTER_TEXTE.gallery
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Social Media – Vernissage</title><style>${MUSTER_CSS}</style></head><body><h1>Social Media Posts</h1><p><strong>Instagram / Facebook / WhatsApp</strong></p><p>✦ Vernissage – Neue Arbeiten</p><p>📅 Samstag, 15. März 2026, 18 Uhr</p><p>Galerie Muster – Lena Berg &amp; Paul Weber zeigen neue Werke.</p><p>✉ ${g.email || 'info@galerie-muster.example'}</p></body></html>`
  return 'data:text/html;charset=utf-8,' + encodeURIComponent(html)
}

const MUSTER_EVENT_ID = 'muster-event-1'

/** Liefert 5 vorgefertigte PR-Musterdokumente für ök2 (Newsletter, Plakat, Event-Flyer, Presseaussendung, Social). Mit MUSTER_TEXTE und einheitlichem Design. */
export function getOek2MusterPrDocuments(): Array<{ id: string; name: string; eventId: string; category: string; werbematerialTyp: string; fileData: string; fileName: string; fileType: string }> {
  return [
    { id: 'muster-pr-newsletter', name: 'Newsletter – Vernissage', eventId: MUSTER_EVENT_ID, category: 'pr-dokumente', werbematerialTyp: 'newsletter', fileData: getMusterNewsletterDataUrl(), fileName: 'newsletter-vernissage.html', fileType: 'text/html' },
    { id: 'muster-pr-plakat', name: 'Plakat – Vernissage', eventId: MUSTER_EVENT_ID, category: 'pr-dokumente', werbematerialTyp: 'plakat', fileData: getMusterPlakatDataUrl(), fileName: 'plakat-vernissage.html', fileType: 'text/html' },
    { id: 'muster-pr-flyer', name: 'Event-Flyer – Vernissage', eventId: MUSTER_EVENT_ID, category: 'pr-dokumente', werbematerialTyp: 'event-flyer', fileData: getMusterEventFlyerDataUrl(), fileName: 'event-flyer-vernissage.html', fileType: 'text/html' },
    { id: 'muster-pr-presse', name: 'Presseaussendung – Vernissage', eventId: MUSTER_EVENT_ID, category: 'pr-dokumente', werbematerialTyp: 'presse', fileData: getMusterPresseaussendungDataUrl(), fileName: 'presseaussendung-vernissage.html', fileType: 'text/html' },
    { id: 'muster-pr-social', name: 'Social Media – Vernissage', eventId: MUSTER_EVENT_ID, category: 'pr-dokumente', werbematerialTyp: 'social', fileData: getMusterSocialDataUrl(), fileName: 'social-vernissage.html', fileType: 'text/html' },
  ]
}

/** Muster-Events für ök2 (Vernissage mit Einladung + Presse). Wenn k2-oeffentlich-events leer ist, werden diese angezeigt. */
export const MUSTER_EVENTS = [
  {
    id: 'muster-event-1',
    title: 'Vernissage – Neue Arbeiten',
    date: '2026-03-15',
    endDate: '2026-03-15',
    description: 'Eröffnung der Ausstellung mit Malerei, Keramik, Grafik und Skulptur von Lena Berg und Paul Weber.',
    documents: [
      { id: 'muster-doc-1', name: 'Einladung zur Vernissage', fileName: 'einladung-vernissage.html', fileType: 'text/html', fileData: getMusterEinladungDataUrl() },
      { id: 'muster-doc-2', name: 'Presseinformation Vernissage', fileName: 'presse-vernissage.html', fileType: 'text/html', fileData: getMusterPresseDataUrl() },
    ],
  },
]

/** Aktuellen Mandanten lesen (localStorage, Default: k2). Wirft nie – auch bei leerem Cache/Privatmodus. */
export function getCurrentTenantId(): TenantId {
  if (typeof window === 'undefined') return 'k2'
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'demo' || stored === 'k2' || stored === 'oeffentlich' || stored === 'vk2') return stored as TenantId
  } catch (_) {}
  return 'k2'
}

/** Mandanten setzen (z. B. für Produkt-Vorschau) */
export function setCurrentTenantId(tenantId: TenantId): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, tenantId)
  } catch (_) {}
}

/** Konfiguration des aktuellen Mandanten. Wirft nie. */
export function getTenantConfig(): TenantConfig {
  try {
    return TENANT_CONFIGS[getCurrentTenantId()]
  } catch (_) {
    return TENANT_CONFIGS.k2
  }
}
