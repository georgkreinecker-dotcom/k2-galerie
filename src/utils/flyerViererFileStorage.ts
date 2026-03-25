/**
 * Vierer-Flyer: Mitte + Rückseite als Foto vom Gerät.
 * Früher sessionStorage → bei 3–4 großen JPEGs oft QuotaExceeded (~5 MB), dann „lädt nicht“ ohne Meldung.
 * IndexedDB: deutlich mehr Platz, gleiche Origin.
 */

const DB_NAME = 'k2-flyer-vierer-session-files'
const DB_VERSION = 1
const STORE = 'slots'

export type FlyerViererFileSlot = 'welcome' | 'tor'

const LEGACY_SS: Record<FlyerViererFileSlot, string> = {
  welcome: 'k2-flyer-vierer-welcome-file-data',
  tor: 'k2-flyer-vierer-tor-file-data',
}

type Row = { id: FlyerViererFileSlot; dataUrl: string; ts: number }

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

function idbPut(row: Row): Promise<void> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite')
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error ?? new Error('IDB put failed'))
        tx.objectStore(STORE).put(row)
      })
  )
}

function idbGet(id: FlyerViererFileSlot): Promise<Row | undefined> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readonly')
        tx.onerror = () => reject(tx.error ?? new Error('IDB get failed'))
        const r = tx.objectStore(STORE).get(id)
        r.onsuccess = () => resolve(r.result as Row | undefined)
      })
  )
}

function idbDelete(id: FlyerViererFileSlot): Promise<void> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite')
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error ?? new Error('IDB delete failed'))
        tx.objectStore(STORE).delete(id)
      })
  )
}

function clearLegacySession(slot: FlyerViererFileSlot): void {
  try {
    sessionStorage.removeItem(LEGACY_SS[slot])
  } catch {
    /* */
  }
}

/** Einmalig: alte sessionStorage-Daten nach IDB ziehen. */
async function migrateLegacySessionIfNeeded(slot: FlyerViererFileSlot): Promise<string | null> {
  try {
    const raw = sessionStorage.getItem(LEGACY_SS[slot])
    if (raw && raw.startsWith('data:image/')) {
      await saveFlyerViererFileSlot(slot, raw)
      clearLegacySession(slot)
      return raw
    }
  } catch {
    /* Quota beim Lesen – ignorieren */
  }
  return null
}

/** Speichert Data-URL oder löscht Slot bei null/leer. */
export async function saveFlyerViererFileSlot(
  slot: FlyerViererFileSlot,
  dataUrl: string | null
): Promise<{ ok: boolean; message?: string }> {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) {
    try {
      await idbDelete(slot)
      clearLegacySession(slot)
      return { ok: true }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      return { ok: false, message: msg }
    }
  }
  try {
    await idbPut({ id: slot, dataUrl, ts: Date.now() })
    clearLegacySession(slot)
    return { ok: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { ok: false, message: msg }
  }
}

export async function loadFlyerViererFileSlot(slot: FlyerViererFileSlot): Promise<string | null> {
  try {
    const row = await idbGet(slot)
    if (row?.dataUrl?.startsWith('data:image/')) return row.dataUrl
  } catch {
    /* IDB fehlt – Fallback unten */
  }
  const migrated = await migrateLegacySessionIfNeeded(slot)
  if (migrated) return migrated
  return null
}

export async function clearAllFlyerViererFileSlots(): Promise<void> {
  try {
    await idbDelete('welcome')
  } catch {
    /* */
  }
  try {
    await idbDelete('tor')
  } catch {
    /* */
  }
  clearLegacySession('welcome')
  clearLegacySession('tor')
}
