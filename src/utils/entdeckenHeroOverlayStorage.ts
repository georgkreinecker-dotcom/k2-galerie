/**
 * Entdecken-Hero nach Upload: JPG auf dem Server erst nach Deploy.
 * Zwei Speicher: IndexedDB (groß) + localStorage-Fallback (wenn IDB scheitert / Safari).
 */

const DB_NAME = 'k2-entdecken-hero-overlay'
const DB_VERSION = 2
const STORE = 'overlay'
const ROW_ID = 'current' as const
/** Fallback wenn IDB blockiert / fehlschlägt (gleicher Browser, auch neuer Tab). */
const LS_FALLBACK_KEY = 'k2-entdecken-hero-overlay-fallback'

export const ENTDECKEN_HERO_OVERLAY_MAX_MS = 48 * 3600 * 1000

type OverlayRow = { id: typeof ROW_ID; dataUrl: string; ts: number }

type LsPayload = { dataUrl: string; ts: number }

let dbOpenPromise: Promise<IDBDatabase> | null = null

function openDB(): Promise<IDBDatabase> {
  if (dbOpenPromise) return dbOpenPromise
  dbOpenPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      dbOpenPromise = null
      reject(new Error('IndexedDB nicht verfügbar'))
      return
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = () => {
      dbOpenPromise = null
      reject(req.error ?? new Error('IDB open failed'))
    }
    req.onsuccess = () => resolve(req.result)
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
    }
  })
  return dbOpenPromise
}

function idbPut(db: IDBDatabase, row: OverlayRow): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('IDB put failed'))
    tx.objectStore(STORE).put(row)
  })
}

function idbGet(db: IDBDatabase): Promise<OverlayRow | undefined> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    tx.onerror = () => reject(tx.error ?? new Error('IDB get failed'))
    const r = tx.objectStore(STORE).get(ROW_ID)
    r.onsuccess = () => resolve(r.result as OverlayRow | undefined)
  })
}

function idbClear(db: IDBDatabase): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('IDB clear failed'))
    tx.objectStore(STORE).delete(ROW_ID)
  })
}

function clearLegacyLocalStorageOverlay(): void {
  try {
    localStorage.removeItem('k2-entdecken-hero-dataurl-overlay')
    localStorage.removeItem('k2-entdecken-hero-overlay-ts')
  } catch {
    /* ignore */
  }
}

function readLsFallback(): string | null {
  try {
    const raw = localStorage.getItem(LS_FALLBACK_KEY)
    if (!raw) return null
    const o = JSON.parse(raw) as LsPayload
    if (!o?.dataUrl?.startsWith('data:image/') || typeof o.ts !== 'number') return null
    if (Date.now() - o.ts >= ENTDECKEN_HERO_OVERLAY_MAX_MS) {
      localStorage.removeItem(LS_FALLBACK_KEY)
      return null
    }
    return o.dataUrl
  } catch {
    return null
  }
}

function writeLsFallback(dataUrl: string, ts: number): void {
  try {
    localStorage.setItem(LS_FALLBACK_KEY, JSON.stringify({ dataUrl, ts } satisfies LsPayload))
  } catch {
    /* Quota – nur IDB */
  }
}

function clearLsFallback(): void {
  try {
    localStorage.removeItem(LS_FALLBACK_KEY)
  } catch {
    /* ignore */
  }
}

function isFresh(ts: number): boolean {
  return Date.now() - ts < ENTDECKEN_HERO_OVERLAY_MAX_MS
}

export async function saveEntdeckenHeroOverlay(dataUrl: string): Promise<void> {
  if (!dataUrl.startsWith('data:image/')) return
  const ts = Date.now()
  const row: OverlayRow = { id: ROW_ID, dataUrl, ts }

  let idbSaved = false
  try {
    const db = await openDB()
    await idbPut(db, row)
    idbSaved = true
  } catch (e) {
    console.warn('Entdecken-Hero Overlay: IndexedDB speichern fehlgeschlagen, nutze Fallback.', e)
  }

  if (idbSaved) {
    clearLsFallback()
  } else {
    writeLsFallback(dataUrl, ts)
  }

  clearLegacyLocalStorageOverlay()
}

export async function loadEntdeckenHeroOverlayIfFresh(): Promise<string | null> {
  try {
    const db = await openDB()
    const row = await idbGet(db)
    if (row?.dataUrl?.startsWith('data:image/')) {
      if (!isFresh(row.ts)) {
        await clearEntdeckenHeroOverlay()
        return null
      }
      return row.dataUrl
    }
  } catch {
    /* IDB lesen fehlgeschlagen → Fallback */
  }

  const fromLs = readLsFallback()
  if (fromLs) return fromLs

  return null
}

export async function clearEntdeckenHeroOverlay(): Promise<void> {
  clearLsFallback()
  try {
    const db = await openDB()
    await idbClear(db)
  } catch {
    /* ignore */
  }
  clearLegacyLocalStorageOverlay()
}
