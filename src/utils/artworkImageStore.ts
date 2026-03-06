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

/**
 * Löst imageRef in imageUrl auf: IndexedDB oder direkte URL (Supabase/Vercel).
 * Wenn imageRef eine http(s)-URL ist, wird sie direkt als imageUrl genutzt (kein Platzhalter).
 * Wenn imageRef = k2-img-{Nummer} und IndexedDB liefert nichts: Fallback-URL /img/k2/werk-{Nummer}.jpg (GitHub-Upload-Namensschema).
 */
export async function resolveArtworkImages(artworks: any[]): Promise<any[]> {
  if (!Array.isArray(artworks) || artworks.length === 0) return artworks
  const out: any[] = []
  for (const a of artworks) {
    if (!a) { out.push(a); continue }
    const ref = a.imageRef
    if (ref && typeof ref === 'string') {
      const isUrl = ref.startsWith('http://') || ref.startsWith('https://')
      if (isUrl) {
        out.push({ ...a, imageUrl: ref, imageRef: ref })
        continue
      }
      try {
        const dataUrl = await getArtworkImage(ref)
        let imageUrl = dataUrl || a.imageUrl || ''
        // Fallback: IndexedDB leer (z. B. anderes Gerät) – versuche Vercel-Pfad wie bei GitHub-Upload (werk-{safeNumber}.jpg)
        if (!imageUrl && ref.startsWith('k2-img-')) {
          const id = ref.replace(/^k2-img-/, '').trim().replace(/[^a-zA-Z0-9-]/g, '-')
          if (id) imageUrl = `${VERCEL_IMG_BASE}/img/k2/werk-${id}.jpg`
        }
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
