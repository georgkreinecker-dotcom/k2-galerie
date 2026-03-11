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
 * Alle möglichen Refs für ein Werk (nur für Lookup in IndexedDB – keine Schreiblogik).
 * 30–48: iPad kann unter K2-K-0040 oder K2-K-40 speichern – alle Varianten probieren, damit Bild beim „An Server senden“ gefunden wird.
 */
export function getArtworkImageRefVariants(artwork: any): string[] {
  const ref = artwork?.imageRef || getArtworkImageRef(artwork)
  const variants = new Set<string>([ref])
  const raw = String(artwork?.number ?? artwork?.id ?? '').trim()
  if (raw) {
    variants.add(`k2-img-${raw}`)
    const digits = raw.replace(/\D/g, '')
    if (digits.length >= 1) {
      const num = parseInt(digits, 10)
      if (!Number.isNaN(num)) {
        variants.add(`k2-img-${digits.padStart(4, '0')}`)
        variants.add(`k2-img-${digits}`)
        const k2 = raw.match(/^K2-([A-Z])-?(\d+)$/i)
        if (k2) {
          variants.add(`k2-img-K2-${k2[1]}-${num}`)
          variants.add(`k2-img-K2-${k2[1]}-${String(num).padStart(4, '0')}`)
        }
      }
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
 * Bereitet eine Werkliste für localStorage vor: data:image Bilddaten
 * werden in IndexedDB ausgelagert, in der Liste bleibt nur imageRef.
 * previewUrl als Base64 wird geleert (keine Dopplung in der Liste).
 * KRITISCH: Bestehendes imageRef niemals leer überschreiben – sonst Bildverlust (11.03.26).
 */
export async function prepareArtworksForStorage(artworks: any[]): Promise<any[]> {
  if (!Array.isArray(artworks) || artworks.length === 0) return artworks
  const out: any[] = []
  for (const a of artworks) {
    if (!a) { out.push(a); continue }
    const ref = a.imageRef || getArtworkImageRef(a)
    const url = a.imageUrl
    let next = a
    if (typeof url === 'string' && url.startsWith('data:image') && url.length > MOVE_TO_IDB_THRESHOLD) {
      try {
        await putArtworkImage(ref, url)
        next = { ...a, imageUrl: '', imageRef: ref }
      } catch (e) {
        console.warn('Artwork image store put failed, keeping in list:', e)
      }
    } else if (a.imageRef && typeof a.imageUrl === 'string' && a.imageUrl.startsWith('data:') && a.imageUrl.length > MOVE_TO_IDB_THRESHOLD) {
      try {
        await putArtworkImage(a.imageRef, a.imageUrl)
        next = { ...a, imageUrl: '', imageRef: a.imageRef }
      } catch (e) {
        console.warn('Artwork image store put failed:', e)
      }
    }
    // Niemals vorhandenes imageRef durch leeres ersetzen (Schutz vor Bildverlust, 11.03.26)
    const hadRef = a.imageRef && String(a.imageRef).trim() !== ''
    if (hadRef && (!next.imageRef || String(next.imageRef).trim() === ''))
      next = { ...next, imageRef: a.imageRef }
    if (isBase64ImageUrl(next.previewUrl)) next = { ...next, previewUrl: '' }
    out.push(next)
  }
  return out
}

/** Basis-URL für Vercel-Bilder (Fallback wenn IndexedDB leer, z. B. anderes Gerät). */
const VERCEL_IMG_BASE = 'https://k2-galerie.vercel.app'

/** 30–39: Alte Repo-Dateien nicht anzeigen (Bereinigung). 40+: Keine Repo-Dateien → kein Fallback, sonst 404. */
const STATIC_FALLBACK_EXCLUDE_RANGE: [number, number] = [30, 39]
/** Repo-Fallback nur 1–29 (dort liegen werk-K2-K-0001.jpg … 0029.jpg). 30–39 und 40+ → kein Fallback-URL, kein 404. */
const STATIC_FALLBACK_ALLOWED_RANGE: [number, number] = [1, 29]

function isInStaticFallbackExcludeRange(artwork: any): boolean {
  return isArtworkNumberInRange(artwork, STATIC_FALLBACK_EXCLUDE_RANGE[0], STATIC_FALLBACK_EXCLUDE_RANGE[1])
}

function isInStaticFallbackAllowedRange(artwork: any): boolean {
  const num = artwork?.number ?? artwork?.id
  if (num == null || num === '') return false
  const s = String(num).trim()
  const withPrefix = s.match(/^K2-[A-Z]-?(\d+)$/i)
  const n = withPrefix ? parseInt(withPrefix[1], 10) : parseInt(s.replace(/\D/g, '') || '0', 10)
  if (Number.isNaN(n)) return false
  return n >= STATIC_FALLBACK_ALLOWED_RANGE[0] && n <= STATIC_FALLBACK_ALLOWED_RANGE[1]
}

/** Repo-Fallback nur 1–29. Für GalerieVorschauPage etc. – 30–39 und 40+ bekommen keine Fallback-URL (kein 404). */
export function isStaticFallbackAllowed(artwork: any): boolean {
  return isInStaticFallbackAllowedRange(artwork)
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
        // Fallback nur 1–29 (Repo hat nur werk-K2-K-0001 … 0029). 30–39 und 40+ → kein URL, sonst 404.
        if (!imageUrl && ref.startsWith('k2-img-') && isInStaticFallbackAllowedRange(a)) {
          const id = ref.replace(/^k2-img-/, '').trim().replace(/[^a-zA-Z0-9-]/g, '-')
          if (id) imageUrl = `${VERCEL_IMG_BASE}/img/k2/werk-${id}.jpg`
        }
        if (inExclude && imageUrl && isOldVercelStaticUrl(imageUrl)) imageUrl = ''
        out.push({ ...a, imageUrl, imageRef: ref })
      } catch {
        let imageUrl = a.imageUrl || ''
        if (!imageUrl && ref.startsWith('k2-img-') && isInStaticFallbackAllowedRange(a)) {
          const id = ref.replace(/^k2-img-/, '').trim().replace(/[^a-zA-Z0-9-]/g, '-')
          if (id) imageUrl = `${VERCEL_IMG_BASE}/img/k2/werk-${id}.jpg`
        }
        if (inExclude && imageUrl && isOldVercelStaticUrl(imageUrl)) imageUrl = ''
        out.push({ ...a, imageUrl, imageRef: ref })
      }
    } else {
      // Kein imageRef: Repo-Fallback nur 1–29. 30–39 und 40+ → kein Fallback, kein 404, nur „Kein Bild“.
      const fallbackId = getVercelFallbackIdFromArtwork(a)
      if (fallbackId && isInStaticFallbackAllowedRange(a)) {
        out.push({ ...a, imageUrl: `${VERCEL_IMG_BASE}/img/k2/werk-${fallbackId}.jpg` })
      } else {
        out.push(a)
      }
    }
  }
  return out
}
