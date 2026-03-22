import {
  FOCUS_DIRECTION_PRODUCT_CATEGORIES,
  IDEA_CATEGORIES,
  K2_STAMMDATEN_DEFAULTS,
  MUSTER_TEXTE,
  PRODUCT_CATEGORIES,
} from '../config/tenantConfig'
import { loadStammdaten } from './stammdatenStorage'

function isProductCategoryId(cat: string | undefined): boolean {
  if (!cat) return false
  if (PRODUCT_CATEGORIES.some((c) => c.id === cat)) return true
  return Object.values(FOCUS_DIRECTION_PRODUCT_CATEGORIES).some((list) => list.some((c) => c.id === cat))
}

function isIdeaCategoryId(cat: string | undefined): boolean {
  if (!cat) return false
  return IDEA_CATEGORIES.some((c) => c.id === cat)
}

/**
 * Anzeige-Künstler für Statistik & Reports: gleiche Logik wie Admin (Neues Werk) –
 * malerei/grafik/sonstiges → Künstler:in 1, keramik/skulptur → Künstler:in 2;
 * wenn `artist` leer ist, aus Kategorie bzw. K2-Werknummer (K2-M-, K2-K-, …) ableiten.
 */

export type KuenstlerFallbackNamen = { martina: string; georg: string }

function norm(s: unknown): string {
  return String(s ?? '').trim()
}

/** Gleiche Person wie Stammdaten-Martina? (Vollname vs. Rufname, Tippfehler in Künstlerfeld.) */
function isLikelyMartinaName(direct: string, martinaFallback: string): boolean {
  const d = norm(direct).toLowerCase()
  const m = norm(martinaFallback).toLowerCase()
  if (!d || !m) return false
  if (d === m) return true
  if (m.startsWith(d + ' ') || m.startsWith(d + ',') || m.startsWith(d + '.')) return true
  const firstMartina = m.split(/[\s,]+/)[0]
  if (d === firstMartina) return true
  return false
}

/**
 * @param artwork – Werk-Objekt (artist, category, number, id, entryType)
 * @param fallback – Stammdaten-Namen (Martina / Georg bzw. ök2-Muster); wenn fehlt, nur `artist`
 */
export function resolveArtistLabelForGalerieStatistik(
  artwork: {
    artist?: string
    category?: string
    number?: string
    id?: string
    entryType?: string
  } | null | undefined,
  fallback?: KuenstlerFallbackNamen | null
): string {
  const direct = norm(artwork?.artist)
  const num = norm(artwork?.number || artwork?.id).toUpperCase()
  const letteredEarly = num.match(/^K2-([MKGSPOI])-/i)
  const L0 = letteredEarly ? letteredEarly[1].toUpperCase() : ''
  const cat0 = artwork?.category
  const georgByK2Letter = L0 === 'K' || L0 === 'S' || L0 === 'P'
  const georgByCategory = cat0 === 'keramik' || cat0 === 'skulptur'
  /** K2-K-/Keramik gehört zu Georg; altes Künstlerfeld „Martina …“ darf das nicht überschreiben (z. B. Echtheitszertifikat). */
  const ignoreWrongMartinaOnGeorgWerk =
    !!fallback &&
    !!norm(fallback.martina) &&
    !!direct &&
    isLikelyMartinaName(direct, fallback.martina) &&
    (georgByK2Letter || georgByCategory)

  /** Nummer K2-K-/K2-S-/K2-P- hat Vorrang vor falscher Kategorie + falschem Künstlerfeld (z. B. K2-K + malerei + „Martina“). */
  if (ignoreWrongMartinaOnGeorgWerk && fallback && norm(fallback.georg)) {
    return norm(fallback.georg)
  }

  if (direct && !ignoreWrongMartinaOnGeorgWerk) return direct

  if (!fallback || !norm(fallback.martina) || !norm(fallback.georg)) {
    return direct || 'Ohne Künstler'
  }

  const { martina, georg } = fallback
  const cat = artwork?.category

  if (cat === 'malerei' || cat === 'grafik' || cat === 'sonstiges') return martina
  if (cat === 'keramik' || cat === 'skulptur') return georg
  if (cat === 'konzept' || cat === 'fotografie' || cat === 'textil') return martina

  /** Produkt-/Idee-Kategorien (Serie, Druck, Projekt, …) – auch wenn entryType fehlt oder veraltet ist */
  if (isProductCategoryId(cat)) return georg
  if (isIdeaCategoryId(cat)) return martina

  const et = artwork?.entryType
  if (et === 'product') return georg
  if (et === 'idea') return martina

  const lettered = num.match(/^K2-([MKGSPOI])-/i)
  if (lettered) {
    const L = lettered[1].toUpperCase()
    // K Keramik, S Skulptur, P Produkt/Serien (typ. Werkstatt) → Georg; M/G/O/I → Martina
    if (L === 'K' || L === 'S' || L === 'P') return georg
    return martina
  }

  if (/^K2-\d/.test(num) && !/^K2-[A-Z]-/i.test(num)) return martina

  return 'Ohne Künstler'
}

/** Galerie-Vorschau / Werkkarten: Martina & Georg aus Stammdaten (K2 bzw. ök2). VK2: kein Fallback (Mitglieder-Werke). */
export function readKuenstlerFallbackGalerieKarten(musterOnly: boolean, vk2: boolean): KuenstlerFallbackNamen | null {
  if (typeof window === 'undefined') return null
  if (vk2) return null
  const tenant = musterOnly ? 'oeffentlich' : 'k2'
  const m = loadStammdaten(tenant, 'martina')
  const g = loadStammdaten(tenant, 'georg')
  const martina = String(m?.name ?? '').trim()
  const georg = String(g?.name ?? '').trim()
  if (!martina || !georg) return null
  return { martina, georg }
}

/** Shop-Warenkorb & Belege: Kontext K2 vs. ök2. */
export function readKuenstlerFallbackShop(fromOeffentlich: boolean): KuenstlerFallbackNamen | null {
  if (typeof window === 'undefined') return null
  const tenant = fromOeffentlich ? 'oeffentlich' : 'k2'
  const m = loadStammdaten(tenant, 'martina')
  const g = loadStammdaten(tenant, 'georg')
  const martina =
    String(m?.name ?? '').trim() ||
    (fromOeffentlich ? String(MUSTER_TEXTE.martina.name || '').trim() : String(K2_STAMMDATEN_DEFAULTS.martina.name || '').trim())
  const georg =
    String(g?.name ?? '').trim() ||
    (fromOeffentlich ? String(MUSTER_TEXTE.georg.name || '').trim() : String(K2_STAMMDATEN_DEFAULTS.georg.name || '').trim())
  if (!martina || !georg) return null
  return { martina, georg }
}
