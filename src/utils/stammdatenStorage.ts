/**
 * Phase 1.3 Sportwagen: Eine Schicht für Stammdaten (K2, ök2, VK2).
 * Alle Lese-/Schreibzugriffe für k2-stammdaten-*, k2-oeffentlich-stammdaten-*, k2-vk2-stammdaten laufen hier.
 * Merge-Logik nur hier; keine leeren Werte überschreiben (kein-datenverlust).
 */

import {
  K2_STAMMDATEN_DEFAULTS,
  MUSTER_TEXTE,
  DEFAULT_OEK2_FOCUS_DIRECTION_ID,
  isPlatformInstance,
  K2_DEFAULT_VITA_MARTINA,
  K2_DEFAULT_VITA_GEORG,
} from '../config/tenantConfig'

/** Verhindert Auto-Save-Race: noch nicht hydratisierter React-State (Repo-Defaults) darf abweichende gespeicherte Werte nicht überschreiben. */
function pickPersonScalar(incoming: unknown, existing: unknown, def: unknown): string {
  const inc = incoming != null && String(incoming).trim() ? String(incoming).trim() : ''
  const ex = existing != null && String(existing).trim() ? String(existing).trim() : ''
  const d = def != null && String(def).trim() ? String(def).trim() : ''
  if (inc && ex && d && inc === d && ex !== d) return ex
  return inc || ex || d
}

export type StammdatenTenantId = 'k2' | 'oeffentlich'
export type StammdatenType = 'martina' | 'georg' | 'gallery'

const KEYS: Record<StammdatenTenantId, Record<StammdatenType, string>> = {
  k2: {
    martina: 'k2-stammdaten-martina',
    georg: 'k2-stammdaten-georg',
    gallery: 'k2-stammdaten-galerie',
  },
  oeffentlich: {
    martina: 'k2-oeffentlich-stammdaten-martina',
    georg: 'k2-oeffentlich-stammdaten-georg',
    gallery: 'k2-oeffentlich-stammdaten-galerie',
  },
}

export const VK2_STAMMDATEN_KEY = 'k2-vk2-stammdaten'

export function getStammdatenKey(tenant: StammdatenTenantId, type: StammdatenType): string {
  return KEYS[tenant][type]
}

function readRawK2PersonParsed(type: 'martina' | 'georg'): Record<string, unknown> | null {
  const key = getStammdatenKey('k2', type)
  const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null
  if (!raw?.trim()) return null
  try {
    const p = JSON.parse(raw) as unknown
    if (!p || typeof p !== 'object') return null
    const s = JSON.stringify(p)
    if (s.length >= 100_000) return null
    return p as Record<string, unknown>
  } catch {
    return null
  }
}

const K2_ADMIN_FALLBACK_BIO: Record<'martina' | 'georg', string> = {
  martina:
    'Martina bringt mit ihren Gemälden eine lebendige Vielfalt an Farben und Ausdruckskraft auf die Leinwand. ihre Werke spiegeln Jahre des Lernens, Experimentierens und der Leidenschaft für die Malerei wider.',
  georg:
    'Georg verbindet in seiner Keramikarbeit technisches Können mit kreativer Gestaltung. Seine Arbeiten sind geprägt von Präzision und einer Liebe zum Detail, das Ergebnis von jahrzehntelanger Erfahrung.',
}

/**
 * K2 Admin: Personen-State aus localStorage (roh), ohne Fallback auf Defaults wenn noch kein Key existiert.
 * Gleiche Kontakt-/Vita-Logik wie der Stammdaten-useEffect im Admin – für useState-Hydration vor erstem Auto-Save.
 */
export function buildK2PersonStateForAdmin(type: 'martina' | 'georg'): Record<string, unknown> {
  const d = type === 'martina' ? K2_STAMMDATEN_DEFAULTS.martina : K2_STAMMDATEN_DEFAULTS.georg
  const category = type === 'martina' ? 'malerei' : 'keramik'
  const parsed = readRawK2PersonParsed(type)
  if (parsed) {
    const merged: Record<string, unknown> = {
      ...parsed,
      name: (parsed.name && String(parsed.name).trim()) ? parsed.name : d.name,
      email: (parsed.email && String(parsed.email).trim()) ? parsed.email : d.email,
      phone: (parsed.phone && String(parsed.phone).trim()) ? parsed.phone : d.phone,
      website: (parsed.website && String(parsed.website).trim()) ? parsed.website : (d.website || ''),
      address: (parsed.address != null && String(parsed.address).trim()) ? parsed.address : (d.address ?? ''),
      city: (parsed.city != null && String(parsed.city).trim()) ? parsed.city : (d.city ?? ''),
      country: (parsed.country != null && String(parsed.country).trim()) ? parsed.country : (d.country ?? ''),
    }
    if (!merged.vita || typeof merged.vita !== 'string' || !merged.vita.trim()) {
      merged.vita = isPlatformInstance() ? (type === 'martina' ? K2_DEFAULT_VITA_MARTINA : K2_DEFAULT_VITA_GEORG) : ''
    }
    return merged
  }
  return {
    name: d.name,
    category,
    bio: K2_ADMIN_FALLBACK_BIO[type],
    email: d.email,
    phone: d.phone,
    website: d.website || '',
    address: d.address ?? '',
    city: d.city ?? '',
    country: d.country ?? '',
    vita: isPlatformInstance() ? (type === 'martina' ? K2_DEFAULT_VITA_MARTINA : K2_DEFAULT_VITA_GEORG) : '',
  }
}

/** Niemals leere Kontaktfelder/Adresse persistieren: vorhanden > Repo-Standard. Adresse getrennt von Galerie (Künstler-Adresse nur Fallback). */
export function mergeStammdatenPerson(
  incoming: any,
  existing: any,
  defaults: { name: string; email: string; phone: string; website?: string; address?: string; city?: string; country?: string }
): any {
  const e = existing && typeof existing === 'object' ? existing : {}
  return {
    ...incoming,
    name: pickPersonScalar(incoming?.name, e.name, defaults.name),
    email: pickPersonScalar(incoming?.email, e.email, defaults.email),
    phone: pickPersonScalar(incoming?.phone, e.phone, defaults.phone),
    website: pickPersonScalar(incoming?.website, e.website, defaults.website || ''),
    address: (incoming?.address != null && String(incoming.address).trim()) ? incoming.address : (e.address ?? (defaults.address || '')),
    city: (incoming?.city != null && String(incoming.city).trim()) ? incoming.city : (e.city ?? (defaults.city || '')),
    country: (incoming?.country != null && String(incoming.country).trim()) ? incoming.country : (e.country ?? (defaults.country || '')),
  }
}

/** Galerie-Merge: keine leeren Werte überschreiben; Bilder (welcomeImage etc.) aus existing übernehmen wenn incoming leer. */
export function mergeStammdatenGallery(
  incoming: any,
  existing: any,
  defaults: typeof K2_STAMMDATEN_DEFAULTS.gallery
): any {
  const e = existing && typeof existing === 'object' ? existing : {}
  return {
    ...incoming,
    name: (incoming?.name && String(incoming.name).trim()) || e.name || defaults.name,
    address: (incoming?.address != null && String(incoming.address).trim()) ? incoming.address : (e.address || defaults.address),
    city: (incoming?.city != null && String(incoming.city).trim()) ? incoming.city : (e.city || defaults.city),
    country: (incoming?.country != null && String(incoming.country).trim()) ? incoming.country : (e.country || defaults.country),
    phone: (incoming?.phone && String(incoming.phone).trim()) || (e.phone && String(e.phone).trim()) || defaults.phone,
    email: (incoming?.email && String(incoming.email).trim()) || (e.email && String(e.email).trim()) || defaults.email,
    website: (incoming?.website != null && String(incoming.website).trim()) ? incoming.website : (e.website || defaults.website || ''),
    internetadresse: (incoming?.internetadresse != null && String(incoming.internetadresse).trim()) ? incoming.internetadresse : (e.internetadresse || defaults.internetadresse || ''),
    openingHours: (incoming?.openingHours != null && String(incoming.openingHours).trim()) ? incoming.openingHours : ((e as any)?.openingHours || defaults.openingHours || ''),
    bankverbindung: (incoming?.bankverbindung != null && String(incoming.bankverbindung).trim()) ? incoming.bankverbindung : (e.bankverbindung || defaults.bankverbindung || ''),
    iban: (incoming?.iban != null && String(incoming.iban).trim()) ? String(incoming.iban).trim() : ((e as any)?.iban ?? (defaults as any)?.iban ?? ''),
    bic: (incoming?.bic != null && String(incoming.bic).trim()) ? String(incoming.bic).trim() : ((e as any)?.bic ?? (defaults as any)?.bic ?? ''),
    gewerbebezeichnung: (incoming?.gewerbebezeichnung != null && String(incoming.gewerbebezeichnung).trim()) ? incoming.gewerbebezeichnung : ((e as any)?.gewerbebezeichnung || (defaults as any)?.gewerbebezeichnung || 'freie Kunstschaffende'),
    firmenname: (incoming?.firmenname != null && String(incoming.firmenname).trim()) ? incoming.firmenname : ((e as any)?.firmenname ?? (defaults as any)?.firmenname ?? ''),
    ustIdNr: (incoming?.ustIdNr != null && String(incoming.ustIdNr).trim()) ? incoming.ustIdNr : ((e as any)?.ustIdNr ?? (defaults as any)?.ustIdNr ?? ''),
    rechnungAddress: (incoming?.rechnungAddress != null && String(incoming.rechnungAddress).trim()) ? incoming.rechnungAddress : ((e as any)?.rechnungAddress ?? (defaults as any)?.rechnungAddress ?? ''),
    rechnungCity: (incoming?.rechnungCity != null && String(incoming.rechnungCity).trim()) ? incoming.rechnungCity : ((e as any)?.rechnungCity ?? (defaults as any)?.rechnungCity ?? ''),
    rechnungCountry: (incoming?.rechnungCountry != null && String(incoming.rechnungCountry).trim()) ? incoming.rechnungCountry : ((e as any)?.rechnungCountry ?? (defaults as any)?.rechnungCountry ?? ''),
    welcomeImage: (incoming?.welcomeImage && String(incoming.welcomeImage).trim()) ? incoming.welcomeImage : (e.welcomeImage ?? ''),
    virtualTourImage: (incoming?.virtualTourImage && String(incoming.virtualTourImage).trim()) ? incoming.virtualTourImage : (e.virtualTourImage ?? ''),
    galerieCardImage: (incoming?.galerieCardImage && String(incoming.galerieCardImage).trim()) ? incoming.galerieCardImage : (e.galerieCardImage ?? ''),
    focusDirections: (() => { const arr = Array.isArray(incoming?.focusDirections) ? incoming.focusDirections.filter((id: unknown) => typeof id === 'string') : (Array.isArray((e as any)?.focusDirections) ? (e as any).focusDirections : []); return arr.length > 0 ? [arr[0]] : []; })(),
    /** Produktstory / Idee-Story für Presse & PR (ök2 andere Sparten); bei Kunst ungenutzt. Kein Leer überschreiben (kein-datenverlust). */
    story: (incoming?.story != null && String(incoming.story).trim()) ? String(incoming.story).trim() : ((e as any)?.story ?? ''),
    socialYoutubeUrl: (incoming?.socialYoutubeUrl != null && String(incoming.socialYoutubeUrl).trim())
      ? String(incoming.socialYoutubeUrl).trim()
      : ((e as any)?.socialYoutubeUrl ?? ''),
    socialInstagramUrl: (incoming?.socialInstagramUrl != null && String(incoming.socialInstagramUrl).trim())
      ? String(incoming.socialInstagramUrl).trim()
      : ((e as any)?.socialInstagramUrl ?? ''),
    socialFeaturedVideoUrl: (incoming?.socialFeaturedVideoUrl != null && String(incoming.socialFeaturedVideoUrl).trim())
      ? String(incoming.socialFeaturedVideoUrl).trim()
      : ((e as any)?.socialFeaturedVideoUrl ?? ''),
  }
}

/** Leere Stammdaten für ök2 – nur bei expliziter Aktion (z. B. „Demo leeren“). Normal = Muster. */
function getEmptyOeffentlich(type: StammdatenType): any {
  if (type === 'martina' || type === 'georg') {
    return { name: '', email: '', phone: '', website: '', address: '', city: '', country: '' }
  }
  return {
    name: '',
    address: '',
    city: '',
    country: '',
    phone: '',
    email: '',
    website: '',
    internetadresse: '',
    openingHours: '',
    bankverbindung: '',
    iban: '',
    bic: '',
    gewerbebezeichnung: '',
    firmenname: '',
    ustIdNr: '',
    rechnungAddress: '',
    rechnungCity: '',
    rechnungCountry: '',
    welcomeImage: '',
    virtualTourImage: '',
    galerieCardImage: '',
    focusDirections: [],
    story: '',
    socialYoutubeUrl: '',
    socialInstagramUrl: '',
    socialFeaturedVideoUrl: '',
  }
}

function getDefaults(tenant: StammdatenTenantId, type: StammdatenType): any {
  if (tenant === 'oeffentlich') {
    if (type === 'martina') return MUSTER_TEXTE.martina
    if (type === 'georg') return MUSTER_TEXTE.georg
    return MUSTER_TEXTE.gallery
  }
  if (type === 'martina') return K2_STAMMDATEN_DEFAULTS.martina
  if (type === 'georg') return K2_STAMMDATEN_DEFAULTS.georg
  return K2_STAMMDATEN_DEFAULTS.gallery
}

/**
 * ök2 Galerie: Wenn alle Social-URL-Felder leer sind (älterer Speicher vor Demo-URLs),
 * Muster-Demo aus MUSTER_TEXTE.gallery ergänzen – ohne bestehende Einträge zu überschreiben.
 */
function enrichOeffentlichGallerySocialIfAllEmpty(parsed: Record<string, unknown>): Record<string, unknown> {
  const g = MUSTER_TEXTE.gallery
  const y =
    parsed.socialYoutubeUrl != null && String(parsed.socialYoutubeUrl).trim()
      ? String(parsed.socialYoutubeUrl).trim()
      : ''
  const i =
    parsed.socialInstagramUrl != null && String(parsed.socialInstagramUrl).trim()
      ? String(parsed.socialInstagramUrl).trim()
      : ''
  const f =
    parsed.socialFeaturedVideoUrl != null && String(parsed.socialFeaturedVideoUrl).trim()
      ? String(parsed.socialFeaturedVideoUrl).trim()
      : ''
  if (y || i || f) return parsed
  return {
    ...parsed,
    socialYoutubeUrl: g.socialYoutubeUrl,
    socialInstagramUrl: g.socialInstagramUrl,
    socialFeaturedVideoUrl: g.socialFeaturedVideoUrl,
  }
}

/** Liest Stammdaten – eine Schicht. Leer/ungültig → Defaults. Für ök2 bei leerem Speicher: MUSTER_TEXTE (Normal = Muster; neuer User leert explizit). */
export function loadStammdaten(tenant: StammdatenTenantId, type: StammdatenType): any {
  try {
    const key = getStammdatenKey(tenant, type)
    const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null
    if (!raw || !raw.trim()) {
      return getDefaults(tenant, type)
    }
    const parsed = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return getDefaults(tenant, type)
    if (tenant === 'oeffentlich' && type === 'gallery') {
      const fd = Array.isArray((parsed as any).focusDirections)
        ? (parsed as any).focusDirections.filter((id: unknown) => typeof id === 'string')
        : []
      let result: Record<string, unknown> = parsed as Record<string, unknown>
      if (fd.length === 0) {
        result = { ...parsed, focusDirections: [DEFAULT_OEK2_FOCUS_DIRECTION_ID] }
      } else if (fd[0] === 'handwerk') {
        // Demo-Muster = Sparte Kunst; verwaiste „Handwerk“-Einstellung aus frühen Tests nicht dauerhaft durchreichen.
        result = { ...parsed, focusDirections: [DEFAULT_OEK2_FOCUS_DIRECTION_ID] }
      }
      return enrichOeffentlichGallerySocialIfAllEmpty(result) as any
    }
    return parsed
  } catch {
    return getDefaults(tenant, type)
  }
}

/** Schreibt Stammdaten. Bei merge: mit bestehenden mergen (keine leeren Überschreibungen). */
export function saveStammdaten(
  tenant: StammdatenTenantId,
  type: StammdatenType,
  data: any,
  options: { merge?: boolean } = {}
): void {
  try {
    const key = getStammdatenKey(tenant, type)
    const defaults = getDefaults(tenant, type)
    let toWrite = data
    if (options.merge !== false) {
      const existing = loadStammdaten(tenant, type)
      if (type === 'martina' || type === 'georg') {
        toWrite = mergeStammdatenPerson(data, existing, defaults)
      } else {
        toWrite = mergeStammdatenGallery(data, existing, defaults)
      }
    }
    const json = JSON.stringify(toWrite)
    if (json.length > 10_000_000) {
      console.error('❌ stammdatenStorage: Daten zu groß')
      return
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, json)
      if (type === 'gallery') {
        window.dispatchEvent(new CustomEvent('k2-gallery-stammdaten-updated', { detail: { tenant } }))
      }
      window.dispatchEvent(
        new CustomEvent('k2-tenant-stammdaten-updated', { detail: { tenant, type } }),
      )
    }
  } catch (e) {
    console.error('❌ stammdatenStorage save:', e)
  }
}

/** VK2: ein Key, anderes Format (verein, mitglieder). Nur lesen/schreiben, kein Merge. */
export function loadVk2Stammdaten(): any {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(VK2_STAMMDATEN_KEY) : null
    if (!raw || !raw.trim()) return null
    const parsed = JSON.parse(raw)
    return typeof parsed === 'object' && parsed !== null ? parsed : null
  } catch {
    return null
  }
}

export function saveVk2Stammdaten(data: any): void {
  try {
    let payload = data
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const { kommunikation: _vk2KommEntfernt, ...rest } = data as Record<string, unknown>
      payload = rest
    }
    const json = JSON.stringify(payload)
    if (json.length > 10_000_000) {
      console.error('❌ stammdatenStorage: VK2-Daten zu groß')
      return
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(VK2_STAMMDATEN_KEY, json)
      window.dispatchEvent(new Event('vk2-stammdaten-updated'))
      window.dispatchEvent(new CustomEvent('k2-vk2-stammdaten-updated'))
    }
  } catch (e) {
    console.error('❌ stammdatenStorage saveVk2:', e)
  }
}
