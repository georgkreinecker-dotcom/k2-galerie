/**
 * Phase 2.1 Sportwagen: Eine zentrale Merge-Funktion für Server + lokale Werke.
 * Regel: Server = Quelle; lokale Neu-Anlagen geschützt; Konflikt: Mobile gewinnt, sonst neueres updatedAt.
 * Doku: docs/SYNC-REGEL.md
 */

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
  /** Wenn true: Lokale Werke ohne Server-Eintrag NUR übernehmen wenn (mobile UND sehr neu). Verhindert, dass alte Musterwerke vom Handy wieder reinkommen (QR/Load vom Server = Server ist Quelle). */
  onlyAddLocalIfMobileAndVeryNew?: boolean
}

const DEFAULT_GET_KEY = (a: any): string | undefined => {
  const k = a?.number ?? a?.id
  return k != null ? String(k) : undefined
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
 * - Lokale Werke ohne Server-Eintrag werden immer übernommen.
 * - Bei Konflikt (gleicher Key): Mobile gewinnt; sonst neueres updatedAt.
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

  const serverMap =
    options.serverMap ??
    (() => {
      const m = new Map<string, any>()
      serverList.forEach((a: any) => {
        const key = getKey(a)
        if (key) m.set(key, a)
      })
      return m
    })()

  const merged: any[] = [...serverList]
  const toHistory: any[] = []

  localList.forEach((local: any) => {
    const key = getKey(local)
    if (!key) return
    const serverItem = serverMap.get(key)
    const mobile = isMobileWork(local)
    const veryNew = isVeryNew(local)

    if (!serverItem) {
      if (!onlyAddLocalIfMobileAndVeryNew || (mobile && veryNew)) {
        merged.push(local)
      }
      if (!mobile || !veryNew) toHistory.push(local)
      return
    }

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
 * Erhält lokale Bilddaten (imageUrl, imageRef, previewUrl), wenn das gemergte Werk vom Server kein Bild hat.
 * Server-Daten (z. B. gallery-data) enthalten oft keine Base64-Bilder → nach Merge würden Anzeigen leer.
 * Doku: docs/GELOESTE-BUGS.md BUG-021
 */
export function preserveLocalImageData(
  merged: any[],
  localList: any[],
  getKey: (a: any) => string | undefined = DEFAULT_GET_KEY
): any[] {
  const localByKey = new Map<string, any>()
  localList.forEach((a: any) => {
    const k = getKey(a)
    if (k) localByKey.set(k, a)
  })
  return merged.map((item: any) => {
    const key = getKey(item)
    if (!key) return item
    const local = localByKey.get(key)
    if (!local) return item
    const serverHasNoImage =
      isPlaceholderOrEmpty(item.imageUrl) && !(item.imageRef && String(item.imageRef).trim() !== '')
    const localHasImage =
      (!isPlaceholderOrEmpty(local.imageUrl) || (local.imageRef && String(local.imageRef).trim() !== ''))
    if (!serverHasNoImage || !localHasImage) return item
    return {
      ...item,
      imageUrl: local.imageUrl ?? item.imageUrl,
      imageRef: local.imageRef ?? item.imageRef,
      previewUrl: local.previewUrl ?? item.previewUrl,
    }
  })
}
