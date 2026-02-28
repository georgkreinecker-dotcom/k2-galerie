/**
 * Zentrale Mandanten-/Produkt-Konfiguration
 * Basis für vermarktbare Version: K2 = deine Galerie, Demo = Beispiel für Lizenz-Version
 */

import { loadEvents, saveEvents } from '../utils/eventsStorage'
import { loadDocuments, saveDocuments } from '../utils/documentsStorage'

/** Markenname des Produkts – festgeschrieben, einheitlich in der gesamten App verwenden */
export const PRODUCT_BRAND_NAME = 'K2 Galerie'

/** Copyright-Zeile mit K2-Brand – an Footer/Impressum/AGB etc. verwenden */
export const PRODUCT_COPYRIGHT = '© 2026 K2 Galerie · Alle Rechte vorbehalten · Design und Entwicklung: kgm solution (G. Kreinecker)'

/** Werbeslogan für Promotion (Web, Social, Print, Pitch) – einheitlich nutzbar */
export const PRODUCT_WERBESLOGAN = 'K2 Galerie – in 5 Minuten zu deiner eigenen Galerie in deinem Atelier und im Netz'

/** Zweite Kernbotschaft: Empfehlungs-Programm – kostenlose Nutzung und Einkommen durch Weiterempfehlung */
export const PRODUCT_BOTSCHAFT_2 = 'Durch Weiterempfehlung: kostenlose Nutzung und Einkommen erzielen'

/** Zielgruppe in einem Satz – für Werbung, mök2, alle Kanäle (eine Quelle). */
export const PRODUCT_ZIELGRUPPE =
  'Künstler:innen mit Verkauf – Atelier, Ausstellungen, Märkte – die Webauftritt, Kasse und Werbung aus einer Hand wollen.'

/** E-Mail für „Lizenz anfragen“ (CTA nach Demo). mailto: wird damit gebaut. */
export const PRODUCT_LIZENZ_ANFRAGE_EMAIL = 'info@kgm.at'

/** Betreff für Lizenz-Anfrage-E-Mail (kurz, erkennbar). */
export const PRODUCT_LIZENZ_ANFRAGE_BETREFF = 'K2 Galerie – Lizenz anfragen'

/** E-Mail für Nutzer-Feedback / Verbesserungswünsche – nicht im UI anzeigen */
export const PRODUCT_FEEDBACK_EMAIL = 'georg.kreinecker@kgm.at'

/** Betreff für Feedback-E-Mail */
export const PRODUCT_FEEDBACK_BETREFF = 'K2 Galerie – Mein Wunsch / Feedback'

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
  },
  georg: {
    name: 'Georg Kreinecker',
    email: 'georg.kreinecker@kgm.at',
    phone: '0664 1046337',
    website: '',
  },
  gallery: {
    name: 'K2 Galerie Kunst&Keramik',
    address: '',
    city: '',
    country: '',
    phone: '0664 1046337',
    email: 'info@kgm.at', // Galerie-Kontakt (anpassen falls anders)
    website: '',
    internetadresse: '',
    openingHours: '',
    bankverbindung: '',
  },
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
    /** Telefonnummer des Vorstands für Direkt-Nachricht (Format: 4366412345678) */
    vorstandTelefon?: string
    /** Aktive Umfragen */
    umfragen?: Vk2Umfrage[]
  }
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

const _dm = [
  {
    name: 'Maria Mustermann',
    email: 'maria@muster.at',
    lizenz: 'VP-001',
    typ: 'Malerei',
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
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Presseaussendung – Gemeinschaftsausstellung</title><style>${VK2_MUSTER_CSS}</style></head><body><h1>PRESSEAUSSENDUNG</h1><p><strong>${v.name}</strong> – Gemeinschaftsausstellung</p><p class="meta">Vereinshaus Muster, Musterstraße 12, 1010 Wien</p><p>Kontakt: ${v.email || 'office@kunstverein-muster.at'}</p><p>– Ende der Presseaussendung –</p></body></html>`
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

/** Initialisiert VK2-Stammdaten mit Demo-Daten falls noch nichts gespeichert ist.
 *  Füllt auch fehlende Demo-Fotos nach (mitgliedFotoUrl / imageUrl) ohne echte Daten zu überschreiben. */
export function initVk2DemoStammdatenIfEmpty(): void {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem('k2-vk2-stammdaten')
    if (!raw) {
      localStorage.setItem('k2-vk2-stammdaten', JSON.stringify(VK2_DEMO_STAMMDATEN))
      return
    }
    const parsed = JSON.parse(raw) as Vk2Stammdaten
    if (!parsed?.verein?.name) {
      localStorage.setItem('k2-vk2-stammdaten', JSON.stringify(VK2_DEMO_STAMMDATEN))
      return
    }
    // Fotos für Demo-Mitglieder nachfüllen (nur wenn Vereinsname = Demo UND Foto fehlt)
    if (parsed.verein.name === 'Kunstverein Muster' && Array.isArray(parsed.mitglieder)) {
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
        return Object.keys(patch).length > 0 ? { ...m, ...patch } : m
      })
      if (changed) {
        localStorage.setItem('k2-vk2-stammdaten', JSON.stringify({ ...parsed, mitglieder: updated }))
      }
    }
  } catch (_) {}
}

/** Platzhalter-Bild für Musterwerke und ök2-Seiten (keine echten Fotos). Exportiert für Fallback bei Ladefehler. */
export const OEK2_PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5NdXN0ZXI8L3RleHQ+PC9zdmc+'
const MUSTER_PLACEHOLDER_IMAGE = OEK2_PLACEHOLDER_IMAGE

/** ök2: Ein Bild pro Kategorie für Musterwerke; vorhandene Bilder bleiben. Wenn ein Werk kein Bild hat, wird dieses genutzt. */
export const OEK2_DEFAULT_ARTWORK_IMAGES: Record<string, string> = {
  malerei: 'https://images.unsplash.com/photo-1541961019084-0c6c558310ec?w=800&q=85',
  keramik: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=85',
  grafik: 'https://images.unsplash.com/photo-1618005182384-a4a7eda50492?w=800&q=85',
  skulptur: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=85',
  sonstiges: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800&q=85',
}

/** ök2: Lokale Bilder – oben Menschen/Galerie-Eingang, unten Galerie Innenansicht. Liegen in public/img/oeffentlich/ (ersetzbar durch eigene Fotos). */
export const OEK2_WILLKOMMEN_IMAGES = {
  // Eigene Fotos aus public/img/oeffentlich/ – von Vercel direkt serviert, keine CORS-Probleme
  welcomeImage: '/img/oeffentlich/willkommen.jpg',
  virtualTourImage: '/img/oeffentlich/galerie-innen.jpg',   // TODO: Foto noch hineinziehen
  galerieCardImage: '/img/oeffentlich/galerie-karte.jpg',   // TODO: Foto noch hineinziehen
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
    adminPassword: '',
    /* Einladende Musterbilder für ök2 (lizenzfrei) – Willkommensseite & Galerie-Start */
    welcomeImage: OEK2_WILLKOMMEN_IMAGES.welcomeImage,
    virtualTourImage: OEK2_WILLKOMMEN_IMAGES.virtualTourImage,
    galerieCardImage: OEK2_WILLKOMMEN_IMAGES.galerieCardImage,
  },
  welcomeText: 'Ein Neuanfang mit Leidenschaft. Entdecke die Verbindung von Bildern und Skulptur in einem Raum, wo Kunst zum Leben erwacht.',
  artist1Bio: 'Lena Berg arbeitet in Malerei, Grafik und Mischtechnik. Studium der Bildenden Kunst, seit über zwanzig Jahren freischaffend. Ihre Werke – oft Landschaften und Atelierblicke – leben von kräftigen Farben und reduzierten Formen. Ausstellungen im In- und Ausland, Arbeiten in privaten Sammlungen.',
  artist2Bio: 'Paul Weber widmet sich vor allem Keramik und Skulptur. Ausbildung zum Keramiker, langjährige Erfahrung mit Aufbau und Brand. Seine Objekte und Skulpturen verbinden handwerkliche Präzision mit klaren, zeitgenössischen Formen. Regelmäßige Teilnahme an Kunstmärkten und Gruppenausstellungen.',
  gemeinsamText: 'Gemeinsam eröffnen Lena Berg und Paul Weber die Galerie Muster – ein Raum, wo Bilder und Skulptur verschmelzen und Kunst zum Leben erwacht.',
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

/** VK2: Kunstbereiche (ein „Werk“ = ein Künstler:innen-Profil im Verein) */
export const VK2_KUNSTBEREICHE = [
  { id: 'malerei', label: 'Malerei' },
  { id: 'keramik', label: 'Keramik' },
  { id: 'grafik', label: 'Grafik' },
  { id: 'skulptur', label: 'Skulptur' },
  { id: 'fotografie', label: 'Fotografie' },
  { id: 'textil', label: 'Textil' },
  { id: 'sonstiges', label: 'Sonstiges' },
] as const

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

/** Kategorie-ID → Anzeigetext (für Kassa, History, Admin) */
export function getCategoryLabel(categoryId: string | undefined): string {
  if (!categoryId) return ''
  const c = ARTWORK_CATEGORIES.find((x) => x.id === categoryId)
  return c ? c.label : categoryId
}

/** Kategorie-ID → Buchstabe für Werknummer (M/K/G/S/O) */
const CATEGORY_PREFIX_LETTER: Record<string, string> = { malerei: 'M', keramik: 'K', grafik: 'G', skulptur: 'S', sonstiges: 'O' }
export function getCategoryPrefixLetter(cat: string | undefined): string {
  return (cat && CATEGORY_PREFIX_LETTER[cat]) || 'M'
}

/** Musterwerke für ök2 – zwei vielseitige Künstler:innen, je ein Werk pro Kategorie; mit Beschreibung und Kategoriebild. */
const _musterTs = new Date().toISOString()
export const MUSTER_ARTWORKS = [
  { id: 'muster-1', number: 'M1', title: 'Morgenlicht über den Hügeln', category: 'malerei', artist: 'Lena Berg', imageUrl: getOek2DefaultArtworkImage('malerei'), price: 480, description: 'Acryl auf Leinwand, 80 × 60 cm. Weite Landschaft im ersten Licht – kräftige Farben, reduzierter Stil. Aus der Serie „Tageszeiten“.', inExhibition: true, inShop: true, createdAt: _musterTs, addedToGalleryAt: _musterTs },
  { id: 'muster-2', number: 'K1', title: 'Vase „Herbstlaub“', category: 'keramik', artist: 'Paul Weber', imageUrl: getOek2DefaultArtworkImage('keramik'), price: 320, description: 'Steingut, handgeformt, Engobe in Erdtönen, 28 cm hoch. Inspiriert von herbstlichen Wäldern – matt glasiert, haptisch.', inExhibition: true, inShop: true, createdAt: _musterTs, addedToGalleryAt: _musterTs },
  { id: 'muster-3', number: 'G1', title: 'Durch das Fenster', category: 'grafik', artist: 'Lena Berg', imageUrl: getOek2DefaultArtworkImage('grafik'), price: 180, description: 'Linolschnitt, Auflage 15, 30 × 40 cm. Innen und Außen – Blick aus dem Atelier. Klare Linien, starke Kontraste.', inExhibition: true, inShop: true, createdAt: _musterTs, addedToGalleryAt: _musterTs },
  { id: 'muster-4', number: 'S1', title: 'Stehende Form', category: 'skulptur', artist: 'Paul Weber', imageUrl: getOek2DefaultArtworkImage('skulptur'), price: 1200, description: 'Keramik, oxidierend gebrannt, 45 cm. Abstrakte Figur – Balance und Bewegung. Einzelstück.', inExhibition: true, inShop: true, createdAt: _musterTs, addedToGalleryAt: _musterTs },
  { id: 'muster-5', number: 'O1', title: 'Kleines Feld', category: 'sonstiges', artist: 'Lena Berg', imageUrl: getOek2DefaultArtworkImage('sonstiges'), price: 95, description: 'Mischtechnik auf Papier, 25 × 25 cm. Farbige Flächen und Strukturen – experimentell, spielerisch.', inExhibition: true, inShop: true, createdAt: _musterTs, addedToGalleryAt: _musterTs },
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

/** Presse-Text Vernissage – HTML aus MUSTER_TEXTE, für Öffentlichkeitsarbeit. */
function getMusterPresseDataUrl(): string {
  const g = MUSTER_TEXTE.gallery
  const m = MUSTER_TEXTE.martina.name
  const p = MUSTER_TEXTE.georg.name
  const adresse = [g.address, g.city, g.country].filter(Boolean).join(', ')
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Presse Vernissage</title><style>body{font-family:Georgia,serif;max-width:600px;margin:2rem auto;padding:0 1rem;line-height:1.65;color:#222}h1{font-size:1.35rem;border-bottom:2px solid #6b9080;padding-bottom:.4rem}p{margin:.6rem 0}.meta{color:#555;font-size:.9rem}</style></head><body><h1>Presseinformation – Vernissage</h1><p><strong>Galerie Muster</strong> lädt zur Eröffnung der Ausstellung „Neue Arbeiten“ ein.</p><p class="meta">Samstag, 15. März 2026, 18 Uhr<br>${adresse || 'Musterstraße 1, 12345 Musterstadt'}</p><p>${m} (Malerei, Grafik) und ${p} (Keramik, Skulptur) zeigen aktuelle Werke in Malerei, Keramik, Grafik und Skulptur. Die Ausstellung ist im Anschluss zu den Öffnungszeiten zu sehen.</p><p>Kontakt: ${g.email || 'info@galerie-muster.example'}, ${g.phone || ''}</p></body></html>`
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
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Presseaussendung – Vernissage</title><style>${MUSTER_CSS}</style></head><body><h1>PRESSEAUSSENDUNG</h1><p><strong>Galerie Muster</strong> – Vernissage – Neue Arbeiten</p><p class="meta">Samstag, 15. März 2026, 18 Uhr · ${adresse || 'Musterstraße 1, 12345 Musterstadt'}</p><p>${m} und ${p} zeigen aktuelle Werke in Malerei, Keramik, Grafik und Skulptur.</p><p>Kontakt: ${g.email || 'info@galerie-muster.example'}, ${g.phone || ''}</p><p>– Ende der Presseaussendung –</p></body></html>`
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
