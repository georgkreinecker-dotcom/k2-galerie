/**
 * Eine Quelle für Werke (K2 | ök2): k2-artworks, k2-oeffentlich-artworks.
 * Phase 1.2: Alle Lese-/Schreibzugriffe für Werke laufen über diese Schicht – keine direkten setItem in Pages/Admin.
 * Regeln (unveränderlich):
 * 1. Lesen: immer aus localStorage, für Anzeige ggf. filtern (nie zurück schreiben).
 * 2. Schreiben: nur bei expliziter Aktion (Speichern/Löschen) oder wenn Merge mindestens so viele Werke hat wie aktuell.
 * 3. Niemals mit weniger Werken überschreiben als aktuell vorhanden (außer User hat explizit gelöscht).
 */

const K2_ARTWORKS_KEY = 'k2-artworks'
const OEF_ARTWORKS_KEY = 'k2-oeffentlich-artworks'

/** Key für Artworks je Kontext. VK2 hat keinen Artwork-Key (Regel: datentrennung-localstorage-niemals-loeschen). */
export function getArtworksStorageKey(tenant: 'k2' | 'oeffentlich' | 'vk2'): string | null {
  if (tenant === 'vk2') return null
  return tenant === 'oeffentlich' ? OEF_ARTWORKS_KEY : K2_ARTWORKS_KEY
}

/**
 * Phase 5.2: Kontextbezogenes Lesen – eine API, Key intern.
 * musterOnly = ök2, vk2 = VK2 (kein Artwork-Key → immer []), sonst K2.
 */
export function readArtworksRawForContext(musterOnly: boolean, vk2: boolean): any[] {
  if (vk2) return [] // VK2 hat keinen Artwork-Key
  const key = musterOnly ? OEF_ARTWORKS_KEY : K2_ARTWORKS_KEY
  return readArtworksRawByKey(key)
}

/**
 * Phase 5.2: Kontextbezogenes Lesen – ök2: null wenn Key fehlt (erste Nutzung → Muster).
 */
export function readArtworksRawForContextOrNull(musterOnly: boolean): any[] | null {
  if (!musterOnly) return readArtworksRawForContext(false, false)
  return readArtworksRawByKeyOrNull(OEF_ARTWORKS_KEY)
}

/**
 * Phase 5.2: Kontextbezogenes Schreiben – eine API, Key intern.
 * K2: filterK2Only; ök2: keine Filterung; VK2: no-op (kein Artwork-Key).
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
  return saveArtworksByKey(key, data, { filterK2Only, allowReduce: options.allowReduce ?? true })
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

/** Wie readArtworksRawByKey, aber null wenn Key fehlt (z. B. ök2 erste Nutzung → Muster anzeigen). */
export function readArtworksRawByKeyOrNull(key: string): any[] | null {
  try {
    const stored = localStorage.getItem(key)
    if (stored === null || stored === undefined) return null
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

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
  const list = filterK2 ? filterK2Only(toSave) : (Array.isArray(toSave) ? toSave : [])
  const current = readArtworksRawByKey(key)
  const currentCount = current.length

  if (list.length === 0 && currentCount > 0 && !options.allowReduce) {
    console.warn('⚠️ artworksStorage: Speichern mit 0 Werken abgelehnt (Schutz)')
    return false
  }
  if (list.length < currentCount && !options.allowReduce) {
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
 */
export function saveArtworksOnly(
  toSave: any[],
  options: { allowReduce?: boolean } = {}
): boolean {
  return saveArtworksByKey(K2_ARTWORKS_KEY, toSave, { ...options, filterK2Only: true })
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
