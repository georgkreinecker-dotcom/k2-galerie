/**
 * Phase 1.3 Sportwagen: Eine Schicht für Stammdaten (K2, ök2, VK2).
 * Alle Lese-/Schreibzugriffe für k2-stammdaten-*, k2-oeffentlich-stammdaten-*, k2-vk2-stammdaten laufen hier.
 * Merge-Logik nur hier; keine leeren Werte überschreiben (kein-datenverlust).
 */

import { K2_STAMMDATEN_DEFAULTS, MUSTER_TEXTE, DEFAULT_OEK2_FOCUS_DIRECTION_ID } from '../config/tenantConfig'

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

/** Niemals leere Kontaktfelder/Adresse persistieren: vorhanden > Repo-Standard. Adresse getrennt von Galerie (Künstler-Adresse nur Fallback). */
export function mergeStammdatenPerson(
  incoming: any,
  existing: any,
  defaults: { name: string; email: string; phone: string; website?: string; address?: string; city?: string; country?: string }
): any {
  const e = existing && typeof existing === 'object' ? existing : {}
  return {
    ...incoming,
    name: (incoming?.name && String(incoming.name).trim()) || e.name || defaults.name,
    email: (incoming?.email && String(incoming.email).trim()) || (e.email && String(e.email).trim()) || defaults.email,
    phone: (incoming?.phone && String(incoming.phone).trim()) || (e.phone && String(e.phone).trim()) || defaults.phone,
    website: (incoming?.website && String(incoming.website).trim()) || (e.website && String(e.website).trim()) || (defaults.website || ''),
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
      if (fd.length === 0) {
        return { ...parsed, focusDirections: [DEFAULT_OEK2_FOCUS_DIRECTION_ID] }
      }
      // Demo-Muster = Sparte Kunst; verwaiste „Handwerk“-Einstellung aus frühen Tests nicht dauerhaft durchreichen.
      if (fd[0] === 'handwerk') {
        return { ...parsed, focusDirections: [DEFAULT_OEK2_FOCUS_DIRECTION_ID] }
      }
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
    if (typeof window !== 'undefined') localStorage.setItem(key, json)
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
    const json = JSON.stringify(data)
    if (json.length > 10_000_000) {
      console.error('❌ stammdatenStorage: VK2-Daten zu groß')
      return
    }
    if (typeof window !== 'undefined') localStorage.setItem(VK2_STAMMDATEN_KEY, json)
  } catch (e) {
    console.error('❌ stammdatenStorage saveVk2:', e)
  }
}
