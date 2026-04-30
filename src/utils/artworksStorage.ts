/**
 * Eine Quelle für Werke (K2 | ök2): k2-artworks, k2-oeffentlich-artworks.
 * Phase 1.2: Alle Lese-/Schreibzugriffe für Werke laufen über diese Schicht – keine direkten setItem in Pages/Admin.
 * Regeln (unveränderlich):
 * 1. Lesen: immer aus localStorage, für Anzeige ggf. filtern (nie zurück schreiben).
 * 2. Schreiben: nur bei expliziter Aktion (Speichern/Löschen) oder wenn Merge mindestens so viele Werke hat wie aktuell.
 * 3. Niemals mit weniger Werken überschreiben als aktuell vorhanden (außer User hat explizit gelöscht).
 *
 * Speichermix: Große Werkbilder werden in IndexedDB ausgelagert (artworkImageStore), nur Referenzen in localStorage.
 */

import { fillMissingImageRefsFromIndexedDB, imageUrlWithCacheBust, prepareArtworksForStorage, resolveArtworkImages } from './artworkImageStore'
import { MUSTER_ARTWORKS } from '../config/tenantConfig'

const K2_ARTWORKS_KEY = 'k2-artworks'
const OEF_ARTWORKS_KEY = 'k2-oeffentlich-artworks'

/**
 * ök2 öffentliche Demo: Nur die in MUSTER_ARTWORKS festgelegten Werke (ids + Nummern).
 * Besucher-„neue Werke“ oder Testeinträge werden nicht in der Muster-Galerie / auf Vercel gehalten.
 */
export function canonicalOek2MusterArtworksList(fromList: unknown): any[] {
  const arr = Array.isArray(fromList) ? fromList : []
  return MUSTER_ARTWORKS.map(template => {
    const tid = String(template.id)
    const tnum = String(template.number ?? '').trim().toUpperCase()
    const match =
      arr.find((a: any) => a && String(a.id) === tid) ||
      arr.find((a: any) => a && String(a.number ?? '').trim().toUpperCase() === tnum)
    if (!match) return { ...template }
    return { ...template, ...match, id: template.id, number: template.number }
  })
}

export function ensureArtworkUid(a: any): string {
  const existing = String(a?.uid ?? '').trim()
  if (existing) return existing
  try {
    const c: any = typeof crypto !== 'undefined' ? (crypto as any) : undefined
    if (c && typeof c.randomUUID === 'function') return c.randomUUID()
  } catch (_) {}
  // Fallback: ausreichend einzigartig für lokale Identität (nicht kryptografisch)
  return `uid_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`
}

/**
 * Klare Regel (Datentrennung ök2 vs. K2):
 * - Echte K2-Galerie (Martina & Georg): Werknummern wie 0030, 0031, 0035, K2-K-0030 (3–4 Ziffern, ggf. Präfix K2-K-/K2-M-).
 * - ök2-Musterwerke (Demo): nur M1, K1, G1, S1, O1 oder muster-*.
 * Exportiert für VK2-Katalog und Admin – eine Definition, überall dieselbe Prüfung.
 */
export function isEchteK2Werknummer(num: string): boolean {
  const s = String(num || '').trim()
  if (!s) return false
  if (/^M\d$|^K\d$|^G\d$|^S\d$|^O\d$/.test(s)) return false // Muster (ök2)
  if (s.startsWith('muster-')) return false
  if (/^(K2-K-|K2-M-)?\d{3,4}$/.test(s)) return true // echte K2: 0030, 0031, K2-K-0030
  return false
}

/**
 * Wenn k2-oeffentlich-artworks echte K2-Werke enthält (siehe isEchteK2Werknummer), ersetze durch MUSTER_ARTWORKS.
 */
function repairOek2ArtworksIfContaminated(): boolean {
  try {
    const raw = localStorage.getItem(OEF_ARTWORKS_KEY)
    if (raw === null || raw === undefined) return false // Key fehlt = UI nutzt Fallback Muster
    let arr: any[]
    try {
      const parsed = JSON.parse(raw)
      arr = Array.isArray(parsed) ? parsed : []
    } catch {
      return false
    }
    if (arr.length === 0) return false
    const contaminated = arr.some((a: any) => isEchteK2Werknummer(String(a?.number ?? a?.id ?? '')))
    if (!contaminated) return false
    console.warn('⚠️ ök2: k2-oeffentlich-artworks enthielt K2-Daten – automatisch auf Musterwerke zurückgesetzt.')
    saveArtworksByKey(OEF_ARTWORKS_KEY, [...MUSTER_ARTWORKS], { filterK2Only: false, allowReduce: true })
    return true
  } catch {
    return false
  }
}

/**
 * Einmalige Migration: Gespeicherte alte Musterwerke (K1, O1) auf aktuelle Vorlage (P1, I1, neue Kategorien) umstellen.
 * Nur wenn die gespeicherte Liste genau die alte Seed-Form hat (5 Einträge, davon K1 und O1).
 */
function migrateOek2OldMusterToNewIfNeeded(): boolean {
  try {
    const raw = localStorage.getItem(OEF_ARTWORKS_KEY)
    if (raw === null || raw === undefined) return false
    let arr: any[]
    try {
      const parsed = JSON.parse(raw)
      arr = Array.isArray(parsed) ? parsed : []
    } catch {
      return false
    }
    if (arr.length !== 5) return false
    const hasK1 = arr.some((a: any) => String(a?.number ?? '').trim() === 'K1')
    const hasO1 = arr.some((a: any) => String(a?.number ?? '').trim() === 'O1')
    if (!hasK1 || !hasO1) return false
    console.log('🔄 ök2: Alte Musterwerke (K1/O1) → aktuelle Vorlage (P1/I1, Überkategorien)')
    saveArtworksByKey(OEF_ARTWORKS_KEY, [...MUSTER_ARTWORKS], { filterK2Only: false, allowReduce: true })
    return true
  } catch {
    return false
  }
}

/** Key für Artworks je Kontext. VK2 hat keinen Artwork-Key (Regel: datentrennung-localstorage-niemals-loeschen). */
export function getArtworksStorageKey(tenant: 'k2' | 'oeffentlich' | 'vk2'): string | null {
  if (tenant === 'vk2') return null
  return tenant === 'oeffentlich' ? OEF_ARTWORKS_KEY : K2_ARTWORKS_KEY
}

/**
 * Phase 5.2: Kontextbezogenes Lesen – eine API, Key intern.
 * musterOnly = ök2, vk2 = VK2 (kein Artwork-Key → immer []), sonst K2.
 * ök2: Vor Rückgabe automatische Reparatur (K2-Daten → Musterwerke), damit alles wieder in Ordnung kommt.
 */
export function readArtworksRawForContext(musterOnly: boolean, vk2: boolean): any[] {
  if (vk2) return [] // VK2 hat keinen Artwork-Key
  if (musterOnly) {
    if (repairOek2ArtworksIfContaminated()) return [...MUSTER_ARTWORKS]
    if (migrateOek2OldMusterToNewIfNeeded()) return [...MUSTER_ARTWORKS]
    const list = readArtworksRawByKey(OEF_ARTWORKS_KEY)
    // ök2: Leerer Speicher = Musterwerke anzeigen (Demo soll immer etwas zeigen)
    if (!list || list.length === 0) return [...MUSTER_ARTWORKS]
    return canonicalOek2MusterArtworksList(list)
  }
  return readArtworksRawByKey(K2_ARTWORKS_KEY)
}

/**
 * Phase 5.2: Kontextbezogenes Lesen – ök2: null wenn Key fehlt (erste Nutzung → Muster).
 * ök2: Automatische Reparatur wenn Key mit K2-Daten verseucht ist.
 */
export function readArtworksRawForContextOrNull(musterOnly: boolean): any[] | null {
  if (!musterOnly) return readArtworksRawForContext(false, false) as any
  if (repairOek2ArtworksIfContaminated()) return [...MUSTER_ARTWORKS]
  if (migrateOek2OldMusterToNewIfNeeded()) return [...MUSTER_ARTWORKS]
  const raw = readArtworksRawByKeyOrNull(OEF_ARTWORKS_KEY)
  // ök2: Key fehlt oder leer = Musterwerke (Demo soll immer etwas zeigen)
  if (raw === null || raw.length === 0) return [...MUSTER_ARTWORKS]
  return canonicalOek2MusterArtworksList(raw)
}

/**
 * Phase 5.2: Kontextbezogenes Schreiben – eine API, Key intern.
 * K2: filterK2Only; ök2: keine Filterung; VK2: no-op (kein Artwork-Key).
 * Sportwagen: allowReduce default false – nur bei expliziter User-Aktion (Löschen, Backup-Restore) true übergeben.
 */
export function saveArtworksForContext(
  musterOnly: boolean,
  vk2: boolean,
  data: any[],
  options: { allowReduce?: boolean } = {}
): boolean {
  if (vk2) return false // VK2 hat keinen Artwork-Key
  const key = musterOnly ? OEF_ARTWORKS_KEY : K2_ARTWORKS_KEY
  const filterK2Only = key === K2_ARTWORKS_KEY
  return saveArtworksByKey(key, data, { filterK2Only, allowReduce: options.allowReduce ?? false })
}

/**
 * Speichermix: Lagert große Bilder in IndexedDB aus, dann Speichern in localStorage.
 * Nutzen wo "volle" Werke (mit Bildern) gespeichert werden – entlastet localStorage.
 */
export async function saveArtworksForContextWithImageStore(
  musterOnly: boolean,
  vk2: boolean,
  data: any[],
  options: { allowReduce?: boolean } = {}
): Promise<boolean> {
  if (vk2) return false
  const key = musterOnly ? OEF_ARTWORKS_KEY : K2_ARTWORKS_KEY
  const filterK2Only = key === K2_ARTWORKS_KEY
  return saveArtworksByKeyWithImageStore(key, data, { filterK2Only, allowReduce: options.allowReduce ?? false })
}

/** Speichermix: Bilder in IndexedDB, dann saveArtworksByKey. */
export async function saveArtworksByKeyWithImageStore(
  key: string,
  toSave: any[],
  options: { allowReduce?: boolean; filterK2Only?: boolean } = {}
): Promise<boolean> {
  try {
    const prepared = await prepareArtworksForStorage(Array.isArray(toSave) ? toSave : [])
    return saveArtworksByKey(key, prepared, options)
  } catch (e) {
    console.warn('prepareArtworksForStorage failed, saving without image store:', e)
    return saveArtworksByKey(key, toSave, options)
  }
}

/**
 * Liest Werke ROH aus einem Key – keine Filterung. Eine Schicht für alle Kontexte.
 */
export function readArtworksRawByKey(key: string): any[] {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/** Wie readArtworksRawByKey, aber null wenn Key fehlt (z. B. ök2 erste Nutzung → Muster anzeigen). Bei ök2-Key: automatische Reparatur wenn K2-Daten drin. */
export function readArtworksRawByKeyOrNull(key: string): any[] | null {
  try {
    if (key === OEF_ARTWORKS_KEY && repairOek2ArtworksIfContaminated()) return [...MUSTER_ARTWORKS]
    const stored = localStorage.getItem(key)
    if (stored === null || stored === undefined) return null
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * Speichermix: Liest Werke und löst imageRef in imageUrl auf (Bilder aus IndexedDB).
 * Für Anzeige nutzen – liefert Werke mit geladenen Bildern.
 */
export async function readArtworksWithResolvedImages(key: string): Promise<any[]> {
  const raw = readArtworksRawByKey(key)
  const list = Array.isArray(raw) ? raw : []
  // Fehlende imageRef aus IndexedDB holen, damit „Kein Bild“ nicht bleibt wenn Bild in IDB liegt
  const healed = await fillMissingImageRefsFromIndexedDB(list)
  return resolveArtworkImages(healed)
}

/** Kontext-Variante: Werke mit aufgelösten Bildern für Anzeige. */
export async function readArtworksForContextWithResolvedImages(musterOnly: boolean, vk2: boolean): Promise<any[]> {
  if (vk2) return []
  const key = musterOnly ? OEF_ARTWORKS_KEY : K2_ARTWORKS_KEY
  return readArtworksWithResolvedImages(key)
}

export { imageUrlWithCacheBust, resolveArtworkImages } from './artworkImageStore'

/**
 * Speichert Werke in einen Key. Schutz: nicht mit weniger überschreiben (außer allowReduce).
 * Für k2-artworks wird optional filterK2Only angewendet (Standard: true bei K2-Key).
 */
export function saveArtworksByKey(
  key: string,
  toSave: any[],
  options: { allowReduce?: boolean; filterK2Only?: boolean } = {}
): boolean {
  const filterK2 = options.filterK2Only ?? (key === K2_ARTWORKS_KEY)
  let list = filterK2 ? filterK2Only(toSave) : (Array.isArray(toSave) ? toSave : [])
  if (key === OEF_ARTWORKS_KEY) {
    const raw = Array.isArray(toSave) ? toSave : []
    if (raw.length === 0) {
      console.warn('⚠️ artworksStorage: Leere Liste für ök2 abgelehnt – Musterwerke bleiben Standard.')
      return false
    }
    list = canonicalOek2MusterArtworksList(list)
  }
  const current = readArtworksRawByKey(key)
  const currentCount = current.length

  // ök2: Niemals leere Liste persistieren – Normal ist Muster; nur explizite Aktion (z. B. „Musterwerke zurücksetzen“) darf leeren.
  if (key === OEF_ARTWORKS_KEY && list.length === 0) {
    console.warn('⚠️ artworksStorage: Leere Liste für ök2 abgelehnt – Musterwerke bleiben Standard.')
    return false
  }
  // KRITISCH: Niemals leere Liste schreiben wenn noch Werke da sind (verhindert Datenverlust bei Crash/Bug)
  if (list.length === 0 && currentCount > 0) {
    console.warn('⚠️ artworksStorage: Speichern mit 0 Werken abgelehnt (Schutz – auch bei allowReduce)')
    return false
  }
  if (list.length < currentCount && !options.allowReduce && key !== OEF_ARTWORKS_KEY) {
    console.warn(`⚠️ artworksStorage: Speichern würde ${currentCount} → ${list.length} reduzieren, abgelehnt`)
    return false
  }
  try {
    const json = JSON.stringify(list)
    if (json.length > 10000000) {
      console.error('❌ artworksStorage: Daten zu groß')
      return false
    }
    localStorage.setItem(key, json)
    return true
  } catch (e) {
    console.error('❌ artworksStorage: Fehler beim Schreiben', e)
    return false
  }
}

export function readArtworksRaw(): any[] {
  return readArtworksRawByKey(K2_ARTWORKS_KEY)
}

/** Muster/VK2-Nummern – gehören nicht in K2-artworks. Nur für Anzeige filtern, nie automatisch zurückschreiben. */
const MUSTER_NUMMERN = new Set(['M1', 'M2', 'M3', 'M4', 'M5', 'G1', 'S1', 'O1'])

export function isMusterOrVk2(a: any): boolean {
  if (!a) return false
  if ((a as any)._isMuster === true) return false
  const num = (a.number != null ? String(a.number).trim() : '').toUpperCase()
  const id = (a.id != null ? String(a.id) : '') || ''
  if (id.startsWith('muster-')) return true
  if (num.startsWith('VK2-') || id.startsWith('vk2-seed-')) return true
  if (MUSTER_NUMMERN.has(num)) return true
  return false
}

/** Für Anzeige/Speichern: nur echte K2-Werke. */
export function filterK2Only(artworks: any[]): any[] {
  if (!Array.isArray(artworks)) return []
  return artworks.filter((a: any) => !isMusterOrVk2(a))
}

/**
 * Lädt Werke für Anzeige. Liest nur aus localStorage, filtert nur für Anzeige.
 * Schreibt NIEMALS beim Laden – keine stillen Überschreibungen.
 */
export function loadForDisplay(): any[] {
  const raw = readArtworksRaw()
  return filterK2Only(raw)
}

/**
 * Speichert Werke. Nur aufrufen bei expliziter User-Aktion (Werk speichern, Werk löschen).
 * Regel: Wenn toSave weniger Werke hat als aktuell und allowReduce nicht true → nicht speichern (Schutz).
 * Sportwagen: allowReduce default false.
 */
export function saveArtworksOnly(
  toSave: any[],
  options: { allowReduce?: boolean } = {}
): boolean {
  return saveArtworksByKey(K2_ARTWORKS_KEY, toSave, { filterK2Only: true, allowReduce: options.allowReduce ?? false })
}

/**
 * Merge: lokale + Server. Gibt gemergte Liste zurück.
 * Schreibt nur, wenn merged.length >= currentCount (niemals mit weniger überschreiben).
 * Returns: { list, written } – list = zu setzende Anzeige, written = ob in localStorage geschrieben wurde.
 */
export function mergeAndMaybeWrite(
  localList: any[],
  serverList: any[],
  getTimestamp: (a: any) => number = (a) => Math.max(
    a.updatedAt ? new Date(a.updatedAt).getTime() : 0,
    a.createdAt ? new Date(a.createdAt).getTime() : 0
  )
): { list: any[]; written: boolean } {
  const localFiltered = filterK2Only(localList)
  const serverFiltered = filterK2Only(serverList)
  const currentCount = localFiltered.length

  const byKey = new Map<string, any>()
  serverFiltered.forEach((a: any) => {
    const k = a.number || a.id
    if (k) byKey.set(k, a)
  })
  localFiltered.forEach((local: any) => {
    const k = local.number || local.id
    if (!k) return
    const server = byKey.get(k)
    if (!server) {
      byKey.set(k, local)
      return
    }
    if (getTimestamp(local) >= getTimestamp(server)) {
      byKey.set(k, local)
    }
  })

  const merged = Array.from(byKey.values())
  if (merged.length < currentCount) {
    return { list: localFiltered, written: false }
  }
  const ok = saveArtworksByKey(K2_ARTWORKS_KEY, merged, { allowReduce: false, filterK2Only: true })
  return { list: merged, written: ok }
}

/**
 * Prüft: Soll eine Server-Liste (z. B. Supabase) in localStorage geschrieben werden?
 * Nur ja, wenn serverList.length >= currentCount. Sonst niemals überschreiben.
 */
export function mayWriteServerList(serverList: any[], currentCount: number): boolean {
  const filtered = filterK2Only(serverList)
  return filtered.length >= currentCount
}

// ─── Pending-Werke (Alternative: neu gespeicherte Werke bleiben sichtbar auch wenn etwas überschreibt) ───
const PENDING_KEY = 'k2-artworks-pending'
const PENDING_MAX = 30

/** Liest die Pending-Liste (Werke die gerade hinzugefügt wurden und immer angezeigt werden sollen). */
export function getPendingArtworks(): any[] {
  try {
    const raw = localStorage.getItem(PENDING_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/** Hängt ein neu gespeichertes Werk an Pending an – es bleibt in der Anzeige, auch wenn k2-artworks überschrieben wird. */
export function addPendingArtwork(artwork: any): void {
  if (!artwork || (artwork.number == null && artwork.id == null)) return
  try {
    const pending = getPendingArtworks()
    const key = artwork.number ?? artwork.id
    if (pending.some((a: any) => (a.number ?? a.id) === key)) return
    const next = [...pending, { ...artwork, _pending: true }].slice(-PENDING_MAX)
    localStorage.setItem(PENDING_KEY, JSON.stringify(next))
  } catch (e) {
    console.warn('addPendingArtwork:', e)
  }
}

/** Entfernt Werke aus Pending, die bereits in der übergebenen Liste vorkommen (by number/id). */
export function clearPendingIfInList(mainList: any[]): void {
  const mainKeys = new Set((mainList || []).map((a: any) => a?.number ?? a?.id).filter(Boolean))
  const pending = getPendingArtworks().filter((a: any) => !mainKeys.has(a?.number ?? a?.id))
  try {
    if (pending.length === 0) localStorage.removeItem(PENDING_KEY)
    else localStorage.setItem(PENDING_KEY, JSON.stringify(pending))
  } catch (_) {}
}

/**
 * Für Anzeige: Hauptliste mit Pending mergen. Werke aus Pending die noch nicht in main sind, werden angehängt.
 * So bleibt ein gerade gespeichertes Werk sichtbar, auch wenn k2-artworks woanders überschrieben wurde.
 */
export function mergeWithPending(mainList: any[]): any[] {
  const main = Array.isArray(mainList) ? mainList : []
  const mainKeys = new Set(main.map((a: any) => a?.number ?? a?.id).filter(Boolean))
  const pending = getPendingArtworks()
  const toAdd = pending.filter((a: any) => {
    const k = a?.number ?? a?.id
    return k && !mainKeys.has(k)
  })
  if (toAdd.length === 0) return main
  return [...main, ...toAdd]
}
