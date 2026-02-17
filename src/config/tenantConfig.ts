/**
 * Zentrale Mandanten-/Produkt-Konfiguration
 * Basis für vermarktbare Version: K2 = deine Galerie, Demo = Beispiel für Lizenz-Version
 */

/** Markenname des Produkts – festgeschrieben, einheitlich in der gesamten App verwenden */
export const PRODUCT_BRAND_NAME = 'K2 Galerie'

/** Copyright-Zeile mit K2-Brand – an Footer/Impressum/AGB etc. verwenden */
export const PRODUCT_COPYRIGHT = '© 2026 K2 Galerie · Alle Rechte vorbehalten · Design und Entwicklung: Georg Kreinecker'

/** Werbeslogan für Promotion (Web, Social, Print, Pitch) – einheitlich nutzbar */
export const PRODUCT_WERBESLOGAN = 'K2 Galerie – in 5 Minuten zu deiner eigenen Galerie in deinem Atelier und im Netz'

/** Zweite Kernbotschaft: Empfehlungs-Programm – kostenlose Nutzung und Einkommen durch Weiterempfehlung */
export const PRODUCT_BOTSCHAFT_2 = 'Durch Weiterempfehlung: kostenlose Nutzung und Einkommen erzielen'

export type TenantId = 'k2' | 'demo' | 'oeffentlich'

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
    name: 'K2 Galerie',
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
    galleryName: 'K2 Galerie',
    artist1Name: 'Martina Kreinecker',
    artist2Name: 'Georg Kreinecker',
    tagline: 'Kunst & Keramik',
    footerLine: 'K2 Galerie | Martina & Georg Kreinecker',
  },
  demo: {
    id: 'demo',
    galleryName: 'Atelier Muster',
    artist1Name: 'Lisa Muster',
    artist2Name: 'Max Muster',
    tagline: 'Bilder & Skulptur',
    footerLine: 'Atelier Muster | Lisa & Max Muster',
  },
  oeffentlich: {
    id: 'oeffentlich',
    galleryName: 'Galerie Muster',
    artist1Name: 'Künstlerin Muster',
    artist2Name: 'Künstler Muster',
    tagline: 'Bilder & Skulptur',
    footerLine: 'Galerie Muster | Künstlerin & Künstler Muster',
  },
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
  welcomeImage: '/img/oeffentlich/willkommen.svg',
  virtualTourImage: '/img/oeffentlich/galerie-innen.svg',
  galerieCardImage: '/img/oeffentlich/galerie-innen.svg',
}

/** Liefert das Standard-Werkbild für ök2 für eine Kategorie (Fallback: sonstiges). */
export function getOek2DefaultArtworkImage(categoryId: string | undefined): string {
  const id = categoryId && OEK2_DEFAULT_ARTWORK_IMAGES[categoryId] ? categoryId : 'sonstiges'
  return OEK2_DEFAULT_ARTWORK_IMAGES[id] || OEK2_DEFAULT_ARTWORK_IMAGES.sonstiges
}

/** Mustertexte für Öffentliches Projekt (ök2) – keine echten personenbezogenen Daten, vollständige Basis für Impressum/Shop/Demo */
export const MUSTER_TEXTE = {
  martina: {
    name: 'Künstlerin Muster',
    email: 'kontakt-bilder@galerie-muster.example',
    phone: '+43 1 234 5678',
    website: 'www.kuenstlerin-muster.example',
  },
  georg: {
    name: 'Künstler Muster',
    email: 'kontakt-skulptur@galerie-muster.example',
    phone: '+43 1 234 5679',
    website: 'www.kuenstler-muster.example',
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
  artist1Bio: 'Künstlerin Muster bringt mit ihren Gemälden eine lebendige Vielfalt an Farben und Ausdruckskraft auf die Leinwand. ihre Werke spiegeln Jahre des Lernens und der Leidenschaft für die Bilder wider.',
  artist2Bio: 'Künstler Muster verbindet in seiner Arbeit technisches Können mit kreativer Gestaltung. Seine Arbeiten sind geprägt von Präzision und einer Liebe zum Detail.',
  gemeinsamText: 'Gemeinsam eröffnen Künstlerin und Künstler Muster die Galerie Muster – ein Raum, wo Bilder und Skulptur verschmelzen und Kunst zum Leben erwacht.',
}

/** Max. 5 Werk-Kategorien – einheitlich für Werke-Verwaltung, History und Kassa */
export const ARTWORK_CATEGORIES = [
  { id: 'malerei', label: 'Bilder' },
  { id: 'keramik', label: 'Keramik' },
  { id: 'grafik', label: 'Grafik' },
  { id: 'skulptur', label: 'Skulptur' },
  { id: 'sonstiges', label: 'Sonstiges' },
] as const

export type ArtworkCategoryId = typeof ARTWORK_CATEGORIES[number]['id']

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

/** Musterwerke für ök2 – mit kategoriepassenden Standardbildern (OEK2_DEFAULT_ARTWORK_IMAGES); alle 5 Kategorien abgedeckt. */
export const MUSTER_ARTWORKS = [
  { id: 'muster-1', number: 'M1', title: 'Musterwerk Bilder 1', category: 'malerei', imageUrl: getOek2DefaultArtworkImage('malerei'), price: '', description: 'Beispiel Bilder.', inExhibition: true },
  { id: 'muster-2', number: 'M2', title: 'Musterwerk Bilder 2', category: 'malerei', imageUrl: getOek2DefaultArtworkImage('malerei'), price: '', description: 'Beispiel Bilder.', inExhibition: true },
  { id: 'muster-3', number: 'M3', title: 'Musterwerk Keramik 1', category: 'keramik', imageUrl: getOek2DefaultArtworkImage('keramik'), price: '', description: 'Beispiel Keramik.', inExhibition: true },
  { id: 'muster-4', number: 'M4', title: 'Musterwerk Keramik 2', category: 'keramik', imageUrl: getOek2DefaultArtworkImage('keramik'), price: '', description: 'Beispiel Keramik.', inExhibition: true },
  { id: 'muster-5', number: 'G1', title: 'Musterwerk Grafik', category: 'grafik', imageUrl: getOek2DefaultArtworkImage('grafik'), price: '', description: 'Beispiel Grafik.', inExhibition: true },
  { id: 'muster-6', number: 'S1', title: 'Musterwerk Skulptur', category: 'skulptur', imageUrl: getOek2DefaultArtworkImage('skulptur'), price: '', description: 'Beispiel Skulptur.', inExhibition: true },
  { id: 'muster-7', number: 'O1', title: 'Musterwerk Sonstiges', category: 'sonstiges', imageUrl: getOek2DefaultArtworkImage('sonstiges'), price: '', description: 'Beispiel Sonstiges.', inExhibition: true },
]

/** Aktuellen Mandanten lesen (localStorage, Default: k2). Wirft nie – auch bei leerem Cache/Privatmodus. */
export function getCurrentTenantId(): TenantId {
  if (typeof window === 'undefined') return 'k2'
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'demo' || stored === 'k2' || stored === 'oeffentlich') return stored as TenantId
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
