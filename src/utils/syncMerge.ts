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
      merged.push(local)
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
