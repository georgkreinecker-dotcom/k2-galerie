/**
 * Speichermix: Werkbilder in IndexedDB statt localStorage.
 * IndexedDB hat typisch 50%+ des freien Speichers (viele hundert MB), localStorage nur ~5–10 MB.
 * Metadaten bleiben in localStorage (k2-artworks), nur Bilddaten gehen hier rein.
 */

const DB_NAME = 'k2-artwork-images'
const STORE_NAME = 'images'
const DB_VERSION = 1

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB nicht verfügbar'))
      return
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = () => reject(req.error)
    req.onsuccess = () => resolve(req.result)
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}

/** Eindeutige Ref für ein Werk (für IndexedDB-Key). */
export function getArtworkImageRef(artwork: any): string {
  const id = artwork?.id ?? artwork?.number
  if (id != null && String(id).trim()) return `k2-img-${String(id).trim()}`
  return `k2-img-temp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Alle möglichen Refs für ein Werk (für Lookup in IndexedDB).
 * Beim Export können Werke unter 0031 oder K2-K-0031 gespeichert sein – damit alle 70 Bilder gefunden werden.
 */
export function getArtworkImageRefVariants(artwork: any): string[] {
  const ref = artwork?.imageRef || getArtworkImageRef(artwork)
  const variants = new Set<string>([ref])
  const raw = String(artwork?.number ?? artwork?.id ?? '').trim()
  if (raw) {
    variants.add(`k2-img-${raw}`)
    const digits = raw.replace(/\D/g, '')
    if (digits.length >= 2) {
      variants.add(`k2-img-${digits.padStart(4, '0')}`)
      variants.add(`k2-img-${digits}`)
    }
  }
  return Array.from(variants)
}

/** Speichert ein Werkbild in IndexedDB. dataUrl = data:image/... Base64. */
export async function putArtworkImage(artworkRef: string, dataUrl: string): Promise<void> {
  if (!artworkRef || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) return
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.put({ id: artworkRef, data: dataUrl })
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror = () => { db.close(); reject(tx.error) }
  })
}

/** Liest ein Werkbild aus IndexedDB. Gibt dataUrl oder null. */
export async function getArtworkImage(artworkRef: string): Promise<string | null> {
  if (!artworkRef) return null
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const req = store.get(artworkRef)
    tx.oncomplete = () => {
      db.close()
      resolve(req.result?.data ?? null)
    }
    tx.onerror = () => { db.close(); reject(tx.error) }
  })
}

/**
 * Sucht ein Werkbild unter mehreren Ref-Varianten (z. B. k2-img-0031, k2-img-K2-K-0031).
 * Gibt das erste gefundene Bild und den Ref zurück – damit die Kette beim Speichern
 * wieder am gleichen Glied zusammengeführt werden kann (Bild unter kanonischem Ref speichern).
 */
export async function getArtworkImageByRefVariants(refs: string[]): Promise<{ dataUrl: string; foundRef: string } | null> {
  if (!Array.isArray(refs) || refs.length === 0) return null
  for (const ref of refs) {
    if (!ref) continue
    const dataUrl = await getArtworkImage(ref)
    if (dataUrl) return { dataUrl, foundRef: ref }
  }
  return null
}

/** Entfernt ein Werkbild aus IndexedDB. */
export async function deleteArtworkImage(artworkRef: string): Promise<void> {
  if (!artworkRef) return
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.delete(artworkRef)
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror = () => { db.close(); reject(tx.error) }
  })
}

/** Prüft, ob die Werknummer im Bereich fromNum–toNum liegt (z. B. 30–39 für 0030–0039). */
function isArtworkNumberInRange(artwork: any, fromNum: number, toNum: number): boolean {
  const num = artwork?.number ?? artwork?.id
  if (num == null || num === '') return false
  const s = String(num).trim()
  const withPrefix = s.match(/^K2-[A-Z]-?(\d+)$/i)
  const n = withPrefix ? parseInt(withPrefix[1], 10) : parseInt(s.replace(/\D/g, '') || '0', 10)
  if (Number.isNaN(n)) return false
  return n >= fromNum && n <= toNum
}

/**
 * Entfernt nur die BILDER für Werke mit Nummern fromNum–toNum (z. B. 30–39 = 0030–0039).
 * Die Werke selbst bleiben erhalten; imageUrl, imageRef, previewUrl werden geleert.
 * IndexedDB-Einträge für diese Nummern werden gelöscht.
 * Gibt die aktualisierte Werkliste zurück (ohne Bilddaten für den Bereich).
 */
export async function clearArtworkImagesForNumberRange(
  artworks: any[],
  fromNum: number,
  toNum: number
): Promise<{ updated: any[]; clearedCount: number; idbDeletedCount: number }> {
  if (!Array.isArray(artworks)) return { updated: artworks, clearedCount: 0, idbDeletedCount: 0 }
  const refsToDelete = new Set<string>()
  const updated = artworks.map((a: any) => {
    if (!a || !isArtworkNumberInRange(a, fromNum, toNum)) return a
    const ref = a.imageRef || getArtworkImageRef(a)
    if (ref && ref.startsWith('k2-img-')) refsToDelete.add(ref)
    return { ...a, imageUrl: '', imageRef: '', previewUrl: '' }
  })
  let idbDeletedCount = 0
  for (const ref of refsToDelete) {
    try {
      await deleteArtworkImage(ref)
      idbDeletedCount++
    } catch (_) {}
  }
  const clearedCount = updated.filter((a: any) => isArtworkNumberInRange(a, fromNum, toNum)).length
  return { updated, clearedCount, idbDeletedCount }
}

/** Alle data:image-Bilder in IndexedDB (nicht nur große) – damit „An Server senden“ sie auflösen kann und andere Geräte die Bilder bekommen. */
const MOVE_TO_IDB_THRESHOLD = 0

/** previewUrl als Base64 gehört nicht in die Liste (Dopplung, Speicher). Anzeige nutzt imageUrl/Ref. */
function isBase64ImageUrl(v: unknown): boolean {
  return typeof v === 'string' && v.startsWith('data:image')
}

/**
 * Kanonischer Ref pro Werk – das eine „Glied“ der Kette (Werk ↔ Bild).
 * Beim Speichern wird immer dieser Ref verwendet; so rastet die Kette nach einer
 * Trennung wieder am gleichen Glied ein (wie in der Mechanik).
 */
function getCanonicalImageRef(artwork: any): string {
  return getArtworkImageRef(artwork)
}

/**
 * Bereitet eine Werkliste für localStorage vor: data:image Bilddaten
 * werden in IndexedDB ausgelagert, in der Liste bleibt nur imageRef.
 * Kette Werk ↔ Bild: Beim Speichern wird immer der kanonische Ref verwendet;
 * wenn das Bild unter einer anderen Variante lag (Trennung), wird es unter dem
 * kanonischen Ref gespeichert – die Kette trifft wieder am gleichen Glied.
 * previewUrl als Base64 wird geleert (keine Dopplung in der Liste).
 */
export async function prepareArtworksForStorage(artworks: any[]): Promise<any[]> {
  if (!Array.isArray(artworks) || artworks.length === 0) return artworks
  const out: any[] = []
  for (const a of artworks) {
    if (!a) { out.push(a); continue }
    const canonicalRef = getCanonicalImageRef(a)
    const url = a.imageUrl
    let next = a
    if (typeof url === 'string' && url.startsWith('data:image') && url.length > MOVE_TO_IDB_THRESHOLD) {
      try {
        await putArtworkImage(canonicalRef, url)
        next = { ...a, imageUrl: '', imageRef: canonicalRef }
      } catch (e) {
        console.warn('Artwork image store put failed, keeping in list:', e)
      }
    } else if (a.imageRef && typeof a.imageUrl === 'string' && a.imageUrl.startsWith('data:') && a.imageUrl.length > MOVE_TO_IDB_THRESHOLD) {
      try {
        await putArtworkImage(canonicalRef, a.imageUrl)
        next = { ...a, imageUrl: '', imageRef: canonicalRef }
      } catch (e) {
        console.warn('Artwork image store put failed:', e)
      }
    } else if (a.imageRef || a.number != null || a.id != null) {
      // Kein frisches data:image – Bild ggf. unter anderem Ref (Trennung). Unter Varianten suchen und unter kanonischem Ref wieder zusammenführen.
      const variants = getArtworkImageRefVariants(a)
      const found = await getArtworkImageByRefVariants(variants)
      if (found) {
        try {
          await putArtworkImage(canonicalRef, found.dataUrl)
          next = { ...a, imageUrl: '', imageRef: canonicalRef }
        } catch (e) {
          console.warn('Artwork image store put (re-join) failed:', e)
        }
      }
    }
    if (isBase64ImageUrl(next.previewUrl)) next = { ...next, previewUrl: '' }
    out.push(next)
  }
  return out
}

/** Basis-URL für Vercel-Bilder (Fallback wenn IndexedDB leer, z. B. anderes Gerät). */
const VERCEL_IMG_BASE = 'https://k2-galerie.vercel.app'

/** 30–39: Alte Repo-Dateien (/img/k2/werk-…) nicht anzeigen – nur aktuelle Daten (IndexedDB, frischer Server). Keine Unterdrückung neuer Bilder. */
const STATIC_FALLBACK_EXCLUDE_RANGE: [number, number] = [30, 39]

function isInStaticFallbackExcludeRange(artwork: any): boolean {
  return isArtworkNumberInRange(artwork, STATIC_FALLBACK_EXCLUDE_RANGE[0], STATIC_FALLBACK_EXCLUDE_RANGE[1])
}

/** Alte Vercel-Static-URL für 30–39? Dann nicht nutzen (sonst laden alte gelöschte Bilder). */
function isOldVercelStaticUrl(urlOrRef: string): boolean {
  return typeof urlOrRef === 'string' && urlOrRef.includes('/img/k2/werk-')
}

/** Dateinamen-Teil für Vercel-Fallback aus Werk (number/id). z. B. K2-K-0014 → K2-K-0014 für werk-K2-K-0014.jpg */
function getVercelFallbackIdFromArtwork(artwork: any): string | null {
  const raw = artwork?.number ?? artwork?.id
  if (raw == null || String(raw).trim() === '') return null
  const s = String(raw).trim()
  if (!/^K2-[A-Z]-?\d+$/i.test(s)) return null
  return s.replace(/[^a-zA-Z0-9-]/g, '-')
}

/**
 * Löst imageRef in imageUrl auf: IndexedDB oder direkte URL (Supabase/Vercel).
 * 30–39: Kein Fallback auf Repo-Dateien (/img/k2/werk-…) – sonst erscheinen alte gelöschte Bilder. Neue Bilder (IndexedDB, frischer Server) werden normal angezeigt.
 */
export async function resolveArtworkImages(artworks: any[]): Promise<any[]> {
  if (!Array.isArray(artworks) || artworks.length === 0) return artworks
  const out: any[] = []
  for (const a of artworks) {
    if (!a) { out.push(a); continue }
    const inExclude = isInStaticFallbackExcludeRange(a)
    const url = a.imageUrl
    // Bereits echte URL: 30–39 + alte Repo-URL → nicht anzeigen (alte gelöschte Datei)
    if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
      if (inExclude && isOldVercelStaticUrl(url)) {
        out.push({ ...a, imageUrl: '', imageRef: '' })
      } else {
        out.push({ ...a, imageRef: a.imageRef || url })
      }
      continue
    }
    const ref = a.imageRef
    if (ref && typeof ref === 'string') {
      const isUrl = ref.startsWith('http://') || ref.startsWith('https://')
      if (isUrl) {
        if (inExclude && isOldVercelStaticUrl(ref)) {
          out.push({ ...a, imageUrl: '', imageRef: '' })
        } else {
          out.push({ ...a, imageUrl: ref, imageRef: ref })
        }
        continue
      }
      try {
        let dataUrl = await getArtworkImage(ref)
        // Kette: Wenn unter gespeichertem Ref nichts – unter Varianten suchen (Trennung), Anzeige funktioniert bis zum nächsten Speichern
        if (!dataUrl) {
          const variants = getArtworkImageRefVariants(a)
          const found = await getArtworkImageByRefVariants(variants)
          if (found) dataUrl = found.dataUrl
        }
        let imageUrl = dataUrl || a.imageUrl || ''
        // Fallback: IndexedDB leer – Vercel-Pfad. 30–39: keinen Static-Fallback (keine alten Repo-Dateien)
        if (!imageUrl && ref.startsWith('k2-img-') && !inExclude) {
          const id = ref.replace(/^k2-img-/, '').trim().replace(/[^a-zA-Z0-9-]/g, '-')
          if (id) imageUrl = `${VERCEL_IMG_BASE}/img/k2/werk-${id}.jpg`
        }
        if (inExclude && imageUrl && isOldVercelStaticUrl(imageUrl)) imageUrl = ''
        out.push({ ...a, imageUrl, imageRef: ref })
      } catch {
        let imageUrl = a.imageUrl || ''
        if (!imageUrl && ref.startsWith('k2-img-') && !inExclude) {
          const id = ref.replace(/^k2-img-/, '').trim().replace(/[^a-zA-Z0-9-]/g, '-')
          if (id) imageUrl = `${VERCEL_IMG_BASE}/img/k2/werk-${id}.jpg`
        }
        if (inExclude && imageUrl && isOldVercelStaticUrl(imageUrl)) imageUrl = ''
        out.push({ ...a, imageUrl, imageRef: ref })
      }
    } else {
      const fallbackId = getVercelFallbackIdFromArtwork(a)
      if (fallbackId && !inExclude) {
        out.push({ ...a, imageUrl: `${VERCEL_IMG_BASE}/img/k2/werk-${fallbackId}.jpg` })
      } else {
        out.push(a)
      }
    }
  }
  return out
}
