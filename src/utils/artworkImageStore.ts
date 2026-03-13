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

/** ök2-Musterwerke (M1, K1, G1, S1, O1, muster-*) – keine IndexedDB-Suche, sonst bekommen alle dasselbe Bild (Variante k2-img-1). */
function isOek2MusterArtwork(a: any): boolean {
  if (!a) return false
  const num = String(a?.number ?? a?.id ?? '').trim().toUpperCase()
  const id = String(a?.id ?? '').trim()
  if (id.startsWith('muster-')) return true
  if (['M1', 'M2', 'M3', 'M4', 'M5', 'K1', 'G1', 'S1', 'O1'].includes(num)) return true
  return false
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
 * Wenn number nur "0030" oder "30" ist, trotzdem K2-K-/K2-M-Varianten hinzufügen, da das Bild oft unter k2-img-K2-K-0030 gespeichert wurde.
 *
 * WARNUNG (BUG-031): Bei number "K2-K-0030" liefert raw.replace(/\D/g,'') = "20030" (alle Ziffern) – völlig falsch.
 * Für 0030/30 MUSS die Zifferngruppe aus dem K2-Match (k2[2]) genutzt werden, nie "digits" aus dem ganzen String.
 * Test: src/tests/artworkImageStore.test.ts – schlägt sofort an, wenn jemand das wieder kaputt macht.
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
        const four = String(num).padStart(4, '0')
        const k2 = raw.match(/^K2-([A-Z])-?(\d+)$/i)
        if (k2) {
          // K2-K-0030: NUR k2[2] (Zifferngruppe "0030") – nie digits aus ganzem String (="20030")!
          const digitPart = k2[2]
          const digitNum = parseInt(digitPart, 10)
          const digitFour = digitPart.length >= 4 ? digitPart : digitPart.padStart(4, '0')
          variants.add(`k2-img-K2-${k2[1]}-${digitNum}`)
          variants.add(`k2-img-K2-${k2[1]}-${digitFour}`)
          variants.add(`k2-img-${digitFour}`)
          variants.add(`k2-img-${digitNum}`)
        } else {
          // Nur Ziffern (0030, 30): digits/four/num sind korrekt
          variants.add(`k2-img-${digits.padStart(4, '0')}`)
          variants.add(`k2-img-${digits}`)
          variants.add(`k2-img-${num}`)
          variants.add(`k2-img-K2-K-${num}`)
          variants.add(`k2-img-K2-K-${four}`)
          variants.add(`k2-img-K2-M-${num}`)
          variants.add(`k2-img-K2-M-${four}`)
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

/**
 * Vor stripBase64: Alle Data-URLs in IndexedDB sichern und in der Liste durch imageRef ersetzen.
 * So geht beim „vom Server laden“ + Speichern kein Bild verloren – die Kette bleibt, die Karte bekommt das Bild.
 */
export async function persistDataUrlsToIndexedDB(artworks: any[]): Promise<any[]> {
  if (!Array.isArray(artworks) || artworks.length === 0) return artworks
  const out: any[] = []
  for (const a of artworks) {
    if (!a) { out.push(a); continue }
    const url = a?.imageUrl
    if (typeof url === 'string' && url.startsWith('data:image')) {
      const ref = a.imageRef || getArtworkImageRef(a)
      try {
        await putArtworkImage(ref, url)
      } catch (_) {}
      const previewUrl = (a.previewUrl && !String(a.previewUrl).startsWith('data:')) ? a.previewUrl : ''
      out.push({ ...a, imageUrl: '', imageRef: ref, previewUrl })
    } else {
      out.push(a)
    }
  }
  return out
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

/**
 * Stellt fehlende imageRef aus IndexedDB wieder her (z. B. wenn localStorage sie verloren hat).
 * Verhindert: Beim Speichern eines Werks wird „fresh“ aus localStorage gelesen – hat ein anderes Werk dort keinen Ref, würde er sonst dauerhaft fehlen. Hier suchen wir in IndexedDB (Varianten) und setzen den Ref, falls ein Bild gefunden wird.
 */
export async function fillMissingImageRefsFromIndexedDB(artworks: any[]): Promise<any[]> {
  if (!Array.isArray(artworks) || artworks.length === 0) return artworks
  const out: any[] = []
  for (const a of artworks) {
    if (!a) { out.push(a); continue }
    const hasRef = a.imageRef && String(a.imageRef).trim() !== ''
    if (hasRef) { out.push(a); continue }
    const variants = getArtworkImageRefVariants(a)
    const found = await getArtworkImageByRefVariants(variants)
    if (found) out.push({ ...a, imageRef: found.foundRef })
    else out.push(a)
  }
  return out
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
 * Bild-zu-Karte: Immer kanonischer Ref (getArtworkImageRef) – Kette trifft wieder am gleichen Glied.
 * KRITISCH: Bestehendes imageRef niemals leer überschreiben – sonst Bildverlust (11.03.26).
 */
export async function prepareArtworksForStorage(artworks: any[]): Promise<any[]> {
  if (!Array.isArray(artworks) || artworks.length === 0) return artworks
  const out: any[] = []
  for (const a of artworks) {
    if (!a) { out.push(a); continue }
    const canonicalRef = getArtworkImageRef(a)
    const url = a.imageUrl
    let next = a
    // 1) Frisches data:image → unter kanonischem Ref in IndexedDB, Liste imageRef = kanonisch
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
    } else if (a.imageRef && (a.imageRef.startsWith('http://') || a.imageRef.startsWith('https://'))) {
      next = { ...a, imageUrl: '', imageRef: a.imageRef }
    } else if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
      // Externe URL (z. B. Musterwerke Unsplash): als imageRef speichern, keine IndexedDB-Suche – sonst bekommen M1/K1/G1/S1 alle dasselbe Bild (Variante k2-img-1).
      next = { ...a, imageUrl: '', imageRef: url }
    } else {
      // 2) Kein data:image – Bild aus IndexedDB holen (Ref oder Varianten), unter kanonischem Ref sichern (Bild zu Karte)
      const variants = getArtworkImageRefVariants(a)
      const found = await getArtworkImageByRefVariants(variants)
      if (found) {
        try {
          await putArtworkImage(canonicalRef, found.dataUrl)
          next = { ...a, imageUrl: '', imageRef: canonicalRef }
        } catch (_) {
          next = { ...a, imageUrl: '', imageRef: found.foundRef }
        }
      } else {
        const hadRef = a.imageRef && String(a.imageRef).trim() !== ''
        if (hadRef) next = { ...next, imageRef: a.imageRef }
      }
    }
    if (!next.imageRef || String(next.imageRef).trim() === '') {
      const hadRef = a.imageRef && String(a.imageRef).trim() !== ''
      if (hadRef) next = { ...next, imageRef: a.imageRef }
    }
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
    // Bereits echte URL: 30–39 + alte Repo-URL → nicht anzeigen (alte gelöschte Datei). imageRef NIEMALS leeren – sonst wird State zurückgeschrieben und Bild geht verloren.
    if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
      if (inExclude && isOldVercelStaticUrl(url)) {
        out.push({ ...a, imageUrl: '', imageRef: a.imageRef || '' })
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
          out.push({ ...a, imageUrl: '', imageRef: ref })
        } else {
          out.push({ ...a, imageUrl: ref, imageRef: ref })
        }
        continue
      }
      // Musterwerke (M1, K1, …): Kein IDB-Lookup – sonst alle dasselbe Bild (k2-img-1). imageUrl leer lassen → UI nutzt getOek2DefaultArtworkImage(category).
      if (isOek2MusterArtwork(a)) {
        out.push({ ...a, imageUrl: '', imageRef: ref })
        continue
      }
      try {
        let dataUrl = await getArtworkImage(ref)
        let usedRef = ref
        if (!dataUrl) {
          const variants = getArtworkImageRefVariants(a)
          const found = await getArtworkImageByRefVariants(variants)
          if (found) {
            dataUrl = found.dataUrl
            usedRef = found.foundRef
          }
        }
        let imageUrl = dataUrl || a.imageUrl || ''
        if (!imageUrl && ref.startsWith('k2-img-') && isInStaticFallbackAllowedRange(a)) {
          const id = ref.replace(/^k2-img-/, '').trim().replace(/[^a-zA-Z0-9-]/g, '-')
          if (id) imageUrl = `${VERCEL_IMG_BASE}/img/k2/werk-${id}.jpg`
        }
        if (inExclude && imageUrl && isOldVercelStaticUrl(imageUrl)) imageUrl = ''
        out.push({ ...a, imageUrl, imageRef: usedRef })
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
      // Kein imageRef: Bei Musterwerken (M1, K1, …) keine IndexedDB-Suche – sonst bekommen alle dasselbe Bild (k2-img-1). UI nutzt getOek2DefaultArtworkImage(category).
      if (isOek2MusterArtwork(a)) {
        out.push(a)
        continue
      }
      // IndexedDB per Varianten probieren (Bild kann da sein, Ref in Liste verloren) – sonst „Kein Bild“. Danach Repo-Fallback nur 1–29.
      const variants = getArtworkImageRefVariants(a)
      const found = await getArtworkImageByRefVariants(variants)
      if (found) {
        let imageUrl = found.dataUrl
        if (inExclude && imageUrl && isOldVercelStaticUrl(imageUrl)) imageUrl = ''
        out.push({ ...a, imageUrl: imageUrl || '', imageRef: found.foundRef })
        continue
      }
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
