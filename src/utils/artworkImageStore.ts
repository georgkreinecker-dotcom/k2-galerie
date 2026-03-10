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

/** Schwellwert: Bilddaten größer als das werden in IndexedDB ausgelagert (Bytes). */
const MOVE_TO_IDB_THRESHOLD = 30 * 1024 // 30 KB – alles darüber in IDB

/**
 * Bereitet eine Werkliste für localStorage vor: große data:image Bilddaten
 * werden in IndexedDB ausgelagert, in der Liste bleibt nur imageRef.
 * Gibt die schlanke Liste zurück (ohne große Base64).
 */
export async function prepareArtworksForStorage(artworks: any[]): Promise<any[]> {
  if (!Array.isArray(artworks) || artworks.length === 0) return artworks
  const out: any[] = []
  for (const a of artworks) {
    if (!a) { out.push(a); continue }
    const url = a.imageUrl
    if (typeof url === 'string' && url.startsWith('data:image') && url.length > MOVE_TO_IDB_THRESHOLD) {
      const ref = a.imageRef || getArtworkImageRef(a)
      try {
        await putArtworkImage(ref, url)
        out.push({ ...a, imageUrl: '', imageRef: ref })
      } catch (e) {
        console.warn('Artwork image store put failed, keeping in list:', e)
        out.push(a)
      }
    } else if (a.imageRef && typeof a.imageUrl === 'string' && a.imageUrl.startsWith('data:') && a.imageUrl.length > MOVE_TO_IDB_THRESHOLD) {
      try {
        await putArtworkImage(a.imageRef, a.imageUrl)
        out.push({ ...a, imageUrl: '', imageRef: a.imageRef })
      } catch (e) {
        console.warn('Artwork image store put failed:', e)
        out.push(a)
      }
    } else {
      out.push(a)
    }
  }
  return out
}

/** Basis-URL für Vercel-Bilder (Fallback wenn IndexedDB leer, z. B. anderes Gerät). */
const VERCEL_IMG_BASE = 'https://k2-galerie.vercel.app'

/** Bereich 30–39: Nach „Bilder 0030–0039 bereinigen“ darf hier nie wieder ein Fallback-Bild angezeigt werden (auch nicht aus Server/alten Daten). */
const CLEARED_IMAGE_RANGE: [number, number] = [30, 39]

/** Prüft, ob die Nummer aus imageRef (z. B. k2-img-0030 oder k2-img-K2-K-0030) im bereinigten Bereich liegt. */
function isRefInClearedImageRange(ref: string): boolean {
  if (!ref || !ref.startsWith('k2-img-')) return false
  const id = ref.replace(/^k2-img-/, '').trim()
  const withPrefix = id.match(/^K2-[A-Z]-?(\d+)$/i)
  const n = withPrefix ? parseInt(withPrefix[1], 10) : parseInt(id.replace(/\D/g, '') || '0', 10)
  if (Number.isNaN(n)) return false
  return n >= CLEARED_IMAGE_RANGE[0] && n <= CLEARED_IMAGE_RANGE[1]
}

/**
 * Löst imageRef in imageUrl auf: IndexedDB oder direkte URL (Supabase/Vercel).
 * Wenn imageRef eine http(s)-URL ist, wird sie direkt als imageUrl genutzt (kein Platzhalter).
 * Wenn imageRef = k2-img-{Nummer} und IndexedDB liefert nichts: Fallback-URL /img/k2/werk-{Nummer}.jpg (GitHub-Upload-Namensschema).
 * Ausnahme: Nummern im bereinigten Bereich (30–39) bekommen nie Fallback – Bilder bleiben dort weg.
 */
export async function resolveArtworkImages(artworks: any[]): Promise<any[]> {
  if (!Array.isArray(artworks) || artworks.length === 0) return artworks
  const out: any[] = []
  for (const a of artworks) {
    if (!a) { out.push(a); continue }
    // Bereits echte URL (z. B. Supabase vom iPad) → sofort nutzen, kein IndexedDB nötig (Mac/anderes Gerät).
    const url = a.imageUrl
    if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
      // Bereinigter Bereich 30–39: auch echte URLs (z. B. aus altem Server-Stand) nicht anzeigen
      const inCleared = a?.number != null && isArtworkNumberInRange(a, CLEARED_IMAGE_RANGE[0], CLEARED_IMAGE_RANGE[1])
      out.push({ ...a, imageUrl: inCleared ? '' : url, imageRef: inCleared ? '' : (a.imageRef || url) })
      continue
    }
    const ref = a.imageRef
    if (ref && typeof ref === 'string') {
      const isUrl = ref.startsWith('http://') || ref.startsWith('https://')
      if (isUrl) {
        const inCleared = a?.number != null && isArtworkNumberInRange(a, CLEARED_IMAGE_RANGE[0], CLEARED_IMAGE_RANGE[1])
        out.push({ ...a, imageUrl: inCleared ? '' : ref, imageRef: inCleared ? '' : ref })
        continue
      }
      try {
        const dataUrl = await getArtworkImage(ref)
        let imageUrl = dataUrl || a.imageUrl || ''
        // Fallback: IndexedDB leer – Vercel-Pfad. Ausnahme: bereinigter Bereich 30–39 → nie Fallback
        if (!imageUrl && ref.startsWith('k2-img-') && !isRefInClearedImageRange(ref)) {
          const id = ref.replace(/^k2-img-/, '').trim().replace(/[^a-zA-Z0-9-]/g, '-')
          if (id) imageUrl = `${VERCEL_IMG_BASE}/img/k2/werk-${id}.jpg`
        }
        if (isRefInClearedImageRange(ref)) imageUrl = ''
        out.push({ ...a, imageUrl, imageRef: ref })
      } catch {
        out.push(a)
      }
    } else {
      out.push(a)
    }
  }
  return out
}
