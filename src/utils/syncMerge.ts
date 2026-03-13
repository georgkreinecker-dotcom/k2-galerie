/**
 * Phase 2.1 Sportwagen: Eine zentrale Merge-Funktion für Server + lokale Werke.
 * Regel: Server = Quelle; lokale Neu-Anlagen geschützt; Konflikt: Mobile gewinnt, sonst neueres updatedAt.
 * Doku: docs/SYNC-REGEL.md
 *
 * Fortlaufende Nummern: Server-Max wird bei jedem Server-Load gespeichert; bei Kollision
 * (gleiche Nummer, anderes Werk) werden Mobile-Werke vor dem Merge umnummeriert.
 *
 * Prozesssicherheit: Beim Laden von Server-Daten NUR applyServerDataToLocal (oder explizit
 * mergeServerWithLocal + preserveLocalImageData in dieser Reihenfolge) nutzen.
 * Doku: docs/PROZESS-VEROEFFENTLICHEN-LADEN.md
 */

const KNOWN_MAX_PREFIX = 'k2-known-max-number-'

/** K2-Nummer parsen: K2-M-0001 → { prefixLetter: 'M', categoryPrefix: 'K2-M-', num: 1 } */
function parseK2Number(number: string | undefined): { prefixLetter: string; categoryPrefix: string; num: number } | null {
  if (!number || typeof number !== 'string') return null
  const s = number.trim()
  const withLetter = s.match(/^K2-([A-Z])-?(\d+)$/i)
  if (withLetter) {
    const letter = withLetter[1].toUpperCase()
    return { prefixLetter: letter, categoryPrefix: `K2-${letter}-`, num: parseInt(withLetter[2], 10) || 0 }
  }
  const legacy = s.match(/^K2-(\d+)$/)
  if (legacy) return { prefixLetter: 'M', categoryPrefix: 'K2-', num: parseInt(legacy[1], 10) || 0 }
  return null
}

/**
 * Speichert den pro Kategorie bekannten Maximalwert aus einer Server-Liste.
 * Wird bei jedem Laden von gallery-data.json / Supabase aufgerufen, damit neue Werke
 * am iPad/Mac keine doppelten Nummern vergeben.
 */
export function updateKnownServerMaxNumbers(artworks: any[]): void {
  if (!Array.isArray(artworks)) return
  const maxByPrefix: Record<string, number> = {}
  artworks.forEach((a: any) => {
    const parsed = parseK2Number(a?.number)
    if (!parsed) return
    const prev = maxByPrefix[parsed.prefixLetter] ?? 0
    if (parsed.num > prev) maxByPrefix[parsed.prefixLetter] = parsed.num
  })
  try {
    Object.entries(maxByPrefix).forEach(([letter, num]) => {
      localStorage.setItem(`${KNOWN_MAX_PREFIX}${letter}`, String(num))
    })
  } catch (_) {}
}

/**
 * Liefert den gespeicherten bekannten Server-Max für eine Kategorie (Buchstabe M/K/G/S/O).
 * 0 wenn nie gesetzt.
 */
export function getKnownServerMaxForPrefix(prefixLetter: string): number {
  try {
    const v = localStorage.getItem(`${KNOWN_MAX_PREFIX}${prefixLetter}`)
    return v ? parseInt(v, 10) || 0 : 0
  } catch {
    return 0
  }
}

/**
 * Nächste freie Nummer (nur Ziffernteil) für eine Kategorie aus einer bestehenden Liste.
 * categoryPrefix z.B. "K2-M-". Rückgabe z.B. 51 für K2-M-0051.
 */
export function getNextFreeNumberInCategory(categoryPrefix: string, existingArtworks: any[]): number {
  let maxNum = 0
  const norm = categoryPrefix.replace(/-$/, '')
  existingArtworks.forEach((a: any) => {
    const num = a?.number
    if (!num || typeof num !== 'string') return
    if (!num.startsWith(categoryPrefix) && !num.startsWith(norm)) return
    const parsed = parseK2Number(num)
    if (parsed && parsed.num > maxNum) maxNum = parsed.num
  })
  return maxNum + 1
}

/**
 * Vor dem Merge: Lokale Mobile-Werke, die dieselbe Nummer wie ein Server-Werk haben
 * (aber anderes Werk = anderes id), umnummerieren, damit kein Überschreiben/Löschen entsteht.
 * Gibt eine Kopie von localList zurück, in der kollidierende Werke eine neue Nummer haben.
 */
export function renumberCollidingLocalArtworks(
  serverList: any[],
  localList: any[],
  options: { getKey?: (a: any) => string | undefined; isMobileWork?: (a: any) => boolean } = {}
): any[] {
  const getKey = options.getKey ?? DEFAULT_GET_KEY
  const isMobileWork = options.isMobileWork ?? DEFAULT_IS_MOBILE
  const serverMap = new Map<string, any>()
  serverList.forEach((a: any) => {
    const k = getKey(a)
    if (k) serverMap.set(k, a)
  })
  const result: any[] = []
  const usedNumbers = new Set<string>(serverList.map((a: any) => getKey(a)).filter(Boolean) as string[])
  localList.forEach((local: any) => {
    const key = getKey(local)
    if (!key) {
      result.push(local)
      return
    }
    const serverItem = serverMap.get(key)
    const mobile = isMobileWork(local)
    if (!serverItem || !mobile) {
      result.push(local)
      if (key) usedNumbers.add(key)
      return
    }
    if (serverItem.id === local.id) {
      result.push(local)
      return
    }
    const parsed = parseK2Number(local.number)
    if (!parsed) {
      result.push(local)
      return
    }
    const existingForMax = [...serverList, ...result]
    const nextNum = getNextFreeNumberInCategory(parsed.categoryPrefix, existingForMax)
    const newNumber = `${parsed.categoryPrefix}${String(nextNum).padStart(4, '0')}`
    result.push({ ...local, number: newNumber })
    usedNumbers.add(newNumber)
  })
  return result
}

export interface SyncMergeOptions {
  /** Eindeutiger Key pro Werk (default: number || id) */
  getKey?: (a: any) => string | undefined
  /** Ist das Werk vom Mobilgerät? Dann gewinnt es bei Konflikt. */
  isMobileWork?: (a: any) => boolean
  /** „Sehr neu“ = innerhalb 10 Min – für toHistory (nur nicht-sehr-neue in History). */
  isVeryNew?: (a: any) => boolean
  /** Zeitstempel für Konflikt (lokal vs. Server). */
  getUpdated?: (a: any) => number
  /** Optional: vorgefertigte Server-Map (z. B. mit alten Key-Varianten -K-/-M-). Sonst wird aus serverList gebaut. */
  serverMap?: Map<string, any>
  /** Wenn true: Lokale Werke ohne Server-Eintrag NUR übernehmen wenn (mobile ODER sehr neu). Mobile-Werke (createdOnMobile) bleiben immer erhalten; alte Musterwerke (nicht mobile) kommen nicht zurück. */
  onlyAddLocalIfMobileAndVeryNew?: boolean
  /**
   * Eisernes Gesetz: Server = einzige Wahrheit beim Abholen.
   * Wenn true: Ein auf dem Server vorhandenes Werk wird NIEMALS durch die lokale Version ersetzt.
   * Ergebnis: Nach „An Server senden“ und „Vom Server laden“ sind Mac und Handy zu 100 % gleich.
   */
  serverAsSoleTruth?: boolean
}

const DEFAULT_GET_KEY = (a: any): string | undefined => {
  const k = a?.number ?? a?.id
  return k != null ? String(k) : undefined
}

/** Alle Keys für Abgleich (z. B. 0031 ↔ K2-K-0031), damit preserveLocalImageData lokales Bild auch bei unterschiedlicher Nummernschreibweise findet. */
function getKeysForMatching(a: any): string[] {
  const main = DEFAULT_GET_KEY(a)
  if (!main) return []
  const keys = new Set<string>([main])
  const parsed = parseK2Number(a?.number)
  if (parsed) {
    keys.add(String(parsed.num))
    keys.add(String(parsed.num).padStart(4, '0'))
  }
  const numOnly = main.replace(/^K2-[A-Z]-?/i, '').replace(/^0+/, '') || main
  if (numOnly && numOnly !== main) keys.add(numOnly)
  return Array.from(keys)
}
const DEFAULT_IS_MOBILE = (a: any): boolean =>
  !!(a?.createdOnMobile || a?.updatedOnMobile)
const DEFAULT_IS_VERY_NEW = (a: any): boolean => {
  const t = a?.createdAt ? new Date(a.createdAt).getTime() : 0
  return t > Date.now() - 600000 // 10 Min
}
const DEFAULT_GET_UPDATED = (a: any): number =>
  a?.updatedAt ? new Date(a.updatedAt).getTime() : 0

export interface SyncMergeResult {
  /** Gemergte Liste (Server + geschützte Lokale + Konflikt gelöst). */
  merged: any[]
  /** Lokale Werke für History/Logging (nicht-Mobile oder nicht sehr neu). */
  toHistory: any[]
}

/**
 * Merged Server-Liste mit lokaler Liste nach verbindlicher Sync-Regel.
 * - Server = Quelle (merged startet mit serverList).
 * - Lokale Werke ohne Server-Eintrag: je nach onlyAddLocalIfMobileAndVeryNew (und ggf. mobile/veryNew).
 * - Bei Konflikt (gleicher Key): Wenn serverAsSoleTruth → Server bleibt (eisernes Gesetz). Sonst: Mobile gewinnt; sonst neueres updatedAt.
 */
export function mergeServerWithLocal(
  serverList: any[],
  localList: any[],
  options: SyncMergeOptions = {}
): SyncMergeResult {
  const getKey = options.getKey ?? DEFAULT_GET_KEY
  const isMobileWork = options.isMobileWork ?? DEFAULT_IS_MOBILE
  const isVeryNew = options.isVeryNew ?? DEFAULT_IS_VERY_NEW
  const getUpdated = options.getUpdated ?? DEFAULT_GET_UPDATED
  const onlyAddLocalIfMobileAndVeryNew = options.onlyAddLocalIfMobileAndVeryNew === true
  const serverAsSoleTruth = options.serverAsSoleTruth === true

  // Server-Map mit ALLEN Key-Varianten (0030, K2-K-0030, 30 …), damit lokales "K2-K-0030" das Server-Werk "0030" findet – sonst Duplikate + Bildverlust
  const serverMap =
    options.serverMap ??
    (() => {
      const m = new Map<string, any>()
      serverList.forEach((a: any) => {
        getKeysForMatching(a).forEach((k) => { if (k) m.set(k, a) })
      })
      return m
    })()

  const merged: any[] = [...serverList]
  const toHistory: any[] = []

  localList.forEach((local: any) => {
    const keysToTry = getKeysForMatching(local)
    if (keysToTry.length === 0) return
    const serverItem = keysToTry.map((k) => serverMap.get(k)).find(Boolean)
    const mobile = isMobileWork(local)
    const veryNew = isVeryNew(local)

    if (!serverItem) {
      if (!onlyAddLocalIfMobileAndVeryNew || mobile || veryNew) {
        merged.push(local)
      }
      if (!mobile || !veryNew) toHistory.push(local)
      return
    }

    // Eisernes Gesetz: Server = einzige Wahrheit. Einmal gesendet = dieser Stand gilt zu 100 %; beim Abholen wird Server nie durch Lokal überschrieben.
    if (serverAsSoleTruth) return

    if (mobile) {
      const idx = merged.indexOf(serverItem)
      if (idx >= 0) merged[idx] = local
      else merged.push(local)
      return
    }

    const localUpdated = getUpdated(local)
    const serverUpdated = getUpdated(serverItem)
    if (localUpdated > serverUpdated) {
      const idx = merged.indexOf(serverItem)
      if (idx >= 0) merged[idx] = local
      else merged.push(local)
    }
  })

  return { merged, toHistory }
}

/** Platzhalter-SVG („Kein Bild“) – zählt nicht als echtes Bild. */
function isPlaceholderOrEmpty(url: string | undefined): boolean {
  if (!url || String(url).trim() === '') return true
  if (String(url).includes('data:image/svg')) return true
  return false
}

/**
 * Bilddaten beim Merge: Was der Server sendet, kommt an – lokale Daten nur, wenn Server keins hat.
 * - Wenn Server eine echte Bild-URL (https) hat → immer Server nehmen (damit „vom iPad gesendet“ auf Mac/Handy ankommt).
 * - Nur wenn Server KEINE URL hat: lokales Bild behalten.
 * - Lokal bewusst leer → Merged-Item ohne Bild. Abgleich über getKeysForMatching: 0031 ↔ K2-K-0031 ↔ 31.
 * Doku: docs/GELOESTE-BUGS.md BUG-021, PROZESS-VEROEFFENTLICHEN-LADEN.md
 */
export function preserveLocalImageData(
  merged: any[],
  localList: any[],
  getKey: (a: any) => string | undefined = DEFAULT_GET_KEY
): any[] {
  const localByKey = new Map<string, any>()
  localList.forEach((a: any) => {
    getKeysForMatching(a).forEach((k) => { if (k) localByKey.set(k, a) })
  })
  return merged.map((item: any) => {
    const keysToTry = getKeysForMatching(item)
    if (keysToTry.length === 0) return item
    const local = keysToTry.map((k) => localByKey.get(k)).find(Boolean)
    if (!local) return item
    const localHasImage = !isPlaceholderOrEmpty(local.imageUrl) || (local.imageRef && String(local.imageRef).trim() !== '')
    const isRealUrl = (s: string | undefined) => s && !isPlaceholderOrEmpty(s) && (String(s).startsWith('http://') || String(s).startsWith('https://'))
    const serverHasRealUrl = isRealUrl(item.imageUrl) || isRealUrl(item.imageRef)
    // Lokal bewusst leer (z. B. nach „Bilder 30–39 bereinigen“) → nur ohne Bild übernehmen, wenn Server auch keins hat. Hat Server eine URL (neue Fotos vom iPad), behalten – sonst blockiert Mac 30–39 für immer.
    if (!localHasImage && !serverHasRealUrl) {
      return { ...item, imageUrl: '', imageRef: '', previewUrl: '' }
    }
    // KRITISCH: Wenn Server eine echte URL hat → immer Server nehmen. Sonst kommt „vom iPad gesendet“ auf Mac/Handy nie an.
    const serverUrl = (isRealUrl(item.imageUrl) ? item.imageUrl : null) || (isRealUrl(item.imageRef) ? item.imageRef : null) || ''
    const imageUrl = serverHasRealUrl ? serverUrl : (local.imageUrl ?? item.imageUrl)
    const imageRef = serverHasRealUrl ? (item.imageRef ?? serverUrl) : (local.imageRef ?? item.imageRef)
    const previewUrl = serverHasRealUrl ? (item.previewUrl ?? serverUrl) : (local.previewUrl ?? item.previewUrl)
    return { ...item, imageUrl, imageRef, previewUrl }
  })
}

/**
 * Für AutoSave: Werke die im Speicher sind aber im State (incoming) fehlen wieder hinzufügen.
 * Verhindert: Gerade gespeichertes Werk 30 ist im Speicher, State hat noch 29 → AutoSave würde 29 schreiben und 30 löschen.
 */
export function mergeMissingFromStorage(
  incoming: any[],
  fromStorage: any[],
  getKey: (a: any) => string | undefined = DEFAULT_GET_KEY
): any[] {
  if (fromStorage.length <= incoming.length) return incoming
  const hasMatchInIncoming = (stored: any): boolean => {
    const keys = getKeysForMatching(stored)
    return keys.some((k) => k && incoming.some((inItem) => getKeysForMatching(inItem).includes(k)))
  }
  const missing = fromStorage.filter((a) => !hasMatchInIncoming(a))
  if (missing.length === 0) return incoming
  return [...incoming, ...missing]
}

/**
 * Für AutoSave: Incoming-Liste (z. B. aus React-State) mit aktuellem Speicher zusammenführen,
 * sodass imageRef aus dem Speicher nie verloren geht, wenn der State für ein Werk kein Bild hat.
 * Verhindert: „Bild bei 30 verschwindet wenn 31 gespeichert“ – AutoSave schreibt sonst State ohne 30s Bild.
 */
export function preserveStorageImageRefs(
  incoming: any[],
  fromStorage: any[],
  getKey: (a: any) => string | undefined = DEFAULT_GET_KEY
): any[] {
  const storageByKey = new Map<string, any>()
  fromStorage.forEach((a: any) => {
    getKeysForMatching(a).forEach((k) => { if (k) storageByKey.set(k, a) })
  })
  return incoming.map((item: any) => {
    const keysToTry = getKeysForMatching(item)
    if (keysToTry.length === 0) return item
    const stored = keysToTry.map((k) => storageByKey.get(k)).find(Boolean)
    if (!stored) return item
    const incomingHasImage = (item.imageRef && String(item.imageRef).trim() !== '') ||
      (typeof item.imageUrl === 'string' && item.imageUrl.startsWith('data:image'))
    if (incomingHasImage) return item
    const storageRef = stored.imageRef && String(stored.imageRef).trim()
    if (!storageRef) return item
    return { ...item, imageRef: storageRef }
  })
}

/**
 * Einziger Standard-Einstieg für „Server-Daten in lokale Galerie übernehmen“.
 * Führt mergeServerWithLocal und preserveLocalImageData in der verbindlichen Reihenfolge aus.
 * Nutzen: GaleriePage loadData, GalerieVorschauPage handleRefresh, alle künftigen Lade-Pfade.
 * Doku: docs/PROZESS-VEROEFFENTLICHEN-LADEN.md, .cursor/rules/prozesssicherheit-veroeffentlichen-laden.mdc
 */
export function applyServerDataToLocal(
  serverList: any[],
  localList: any[],
  options: SyncMergeOptions = {}
): SyncMergeResult {
  const { merged, toHistory } = mergeServerWithLocal(serverList, localList, options)
  const getKey = options.getKey ?? DEFAULT_GET_KEY
  const withImages = preserveLocalImageData(merged, localList, getKey)
  return { merged: withImages, toHistory }
}
