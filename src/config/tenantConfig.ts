/**
 * Zentrale Mandanten-/Produkt-Konfiguration
 * Basis für vermarktbare Version: K2 = deine Galerie, Demo = Beispiel für Lizenzversion
 */

/** Markenname des Produkts – festgeschrieben, einheitlich in der gesamten App verwenden */
export const PRODUCT_BRAND_NAME = 'K2 Galerie'

export type TenantId = 'k2' | 'demo' | 'oeffentlich'

export interface TenantConfig {
  id: TenantId
  /** Galerie- / Atelier-Name (z. B. "K2 Galerie", "Atelier Muster") */
  galleryName: string
  /** Künstler:in 1 (z. B. Malerei) */
  artist1Name: string
  /** Künstler:in 2 (z. B. Keramik) */
  artist2Name: string
  /** Kurzer Slogan unter dem Titel */
  tagline: string
  /** Footer / Impressum-Zeile */
  footerLine: string
}

const STORAGE_KEY = 'k2-tenant'

/** Konfiguration pro Mandant – K2 = deine Galerie, Demo = Beispiel für Lizenzversion */
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
    tagline: 'Malerei & Skulptur',
    footerLine: 'Atelier Muster | Lisa & Max Muster',
  },
  oeffentlich: {
    id: 'oeffentlich',
    galleryName: 'Galerie Muster',
    artist1Name: 'Künstlerin Muster',
    artist2Name: 'Künstler Muster',
    tagline: 'Malerei & Skulptur',
    footerLine: 'Galerie Muster | Künstlerin & Künstler Muster',
  },
}

/** Mustertexte für Öffentliches Projekt – keine echten personenbezogenen Daten */
export const MUSTER_TEXTE = {
  martina: { name: 'Künstlerin Muster', email: '', phone: '' },
  georg: { name: 'Künstler Muster', email: '', phone: '' },
  gallery: {
    address: 'Musterstraße 1, 12345 Musterstadt',
    phone: '',
    email: '',
    website: 'www.galerie-muster.example',
    internetadresse: 'www.galerie-muster.example',
    adminPassword: '',
    welcomeImage: '',
    virtualTourImage: '',
  },
  welcomeText: 'Ein Neuanfang mit Leidenschaft. Entdecke die Verbindung von Malerei und Skulptur in einem Raum, wo Kunst zum Leben erwacht.',
  artist1Bio: 'Künstlerin Muster bringt mit ihren Gemälden eine lebendige Vielfalt an Farben und Ausdruckskraft auf die Leinwand. Ihre Werke spiegeln Jahre des Lernens und der Leidenschaft für die Malerei wider.',
  artist2Bio: 'Künstler Muster verbindet in seiner Arbeit technisches Können mit kreativer Gestaltung. Seine Arbeiten sind geprägt von Präzision und einer Liebe zum Detail.',
  gemeinsamText: 'Gemeinsam eröffnen Künstlerin und Künstler Muster die Galerie Muster – ein Raum, wo Malerei und Skulptur verschmelzen und Kunst zum Leben erwacht.',
}

/** Platzhalter-Bild für Musterwerke (keine echten Fotos) – gleicher Stil wie „Kein Bild“ in der App */
const MUSTER_PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5NdXN0ZXI8L3RleHQ+PC9zdmc+'

/** Musterwerke für ök2 – nur Platzhalter, keine echten Fotos */
export const MUSTER_ARTWORKS = [
  { id: 'muster-1', number: 'M1', title: 'Musterwerk Malerei 1', category: 'malerei', imageUrl: MUSTER_PLACEHOLDER_IMAGE, price: '', description: 'Beispiel Malerei.', inExhibition: true },
  { id: 'muster-2', number: 'M2', title: 'Musterwerk Malerei 2', category: 'malerei', imageUrl: MUSTER_PLACEHOLDER_IMAGE, price: '', description: 'Beispiel Malerei.', inExhibition: true },
  { id: 'muster-3', number: 'M3', title: 'Musterwerk Skulptur 1', category: 'keramik', imageUrl: MUSTER_PLACEHOLDER_IMAGE, price: '', description: 'Beispiel Skulptur.', inExhibition: true },
  { id: 'muster-4', number: 'M4', title: 'Musterwerk Skulptur 2', category: 'keramik', imageUrl: MUSTER_PLACEHOLDER_IMAGE, price: '', description: 'Beispiel Skulptur.', inExhibition: true },
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
