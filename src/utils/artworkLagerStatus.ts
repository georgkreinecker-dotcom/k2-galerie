/**
 * Lager / Verkauf – Anzeige aus Werk + Verkaufsliste (Kasse).
 * Eine Quelle für Karten und „Werk bearbeiten“.
 */

export type ArtworkLagerCardVariant = 'verfuegbar' | 'teilweise' | 'ausverkauft'

export type ArtworkLagerInfo = {
  artworkNumber: string
  /** Noch am Lager (Stückzahl im Werk) */
  remaining: number
  /** Summe aus Verkaufsliste: soldQuantity oder 1 pro Zeile */
  soldSumFromList: number
  hasEntriesInSoldList: boolean
  isAusverkauft: boolean
  isTeilverkauft: boolean
  cardVariant: ArtworkLagerCardVariant
}

export function getArtworkNumberKey(artwork: { number?: string; id?: string }): string {
  return String(artwork?.number ?? artwork?.id ?? '').trim()
}

function parseQuantityRemaining(artwork: { quantity?: number | string | null }): number {
  const qRaw = artwork?.quantity
  if (qRaw == null || qRaw === '') return 1
  const n = Number(qRaw)
  if (Number.isNaN(n)) return 1
  return Math.max(0, n)
}

export function sumSoldFromListForArtwork(
  artwork: { number?: string; id?: string; uid?: string },
  soldList: unknown
): number {
  const num = getArtworkNumberKey(artwork)
  if (!num) return 0
  const uid = String(artwork?.uid ?? '').trim()
  const arr = Array.isArray(soldList) ? soldList : []
  let sum = 0
  for (const e of arr) {
    if (!e || String((e as any).number ?? '').trim() !== num) continue
    const euid = String((e as any).artworkUid ?? '').trim()
    if (uid && euid && euid !== uid) continue
    if (uid && !euid) {
      /* Nummer passt, Eintrag ohne UID – mitzählen */
    }
    const sq = (e as any).soldQuantity
    if (sq != null && Number(sq) > 0) sum += Number(sq)
    else sum += 1
  }
  return sum
}

export function getArtworkLagerInfo(
  artwork: { number?: string; id?: string; uid?: string; quantity?: number | string | null },
  soldList: unknown
): ArtworkLagerInfo {
  const artworkNumber = getArtworkNumberKey(artwork)
  const remaining = parseQuantityRemaining(artwork)
  const soldSumFromList = sumSoldFromListForArtwork(artwork, soldList)
  const hasEntriesInSoldList = soldSumFromList > 0
  const isAusverkauft = remaining === 0
  const isTeilverkauft = !isAusverkauft && hasEntriesInSoldList

  let cardVariant: ArtworkLagerCardVariant = 'verfuegbar'
  if (isAusverkauft) cardVariant = 'ausverkauft'
  else if (isTeilverkauft) cardVariant = 'teilweise'

  return {
    artworkNumber,
    remaining,
    soldSumFromList,
    hasEntriesInSoldList,
    isAusverkauft,
    isTeilverkauft,
    cardVariant,
  }
}

function entryMatchesNumber(
  e: { number?: string; artworkUid?: string },
  artworkNumber: string,
  artworkUid?: string
): boolean {
  if (String(e?.number ?? '').trim() !== artworkNumber) return false
  const uid = (artworkUid ?? '').trim()
  const euid = String(e?.artworkUid ?? '').trim()
  if (uid) {
    if (euid && euid !== uid) return false
  }
  return true
}

/**
 * Macht einen Verkauf rückgängig: eine Stück aus der Verkaufsliste (neueste passende Zeile),
 * soldQuantity wird erniedrigt oder Zeile entfernt.
 */
export function revertOneSoldUnitInList(
  list: unknown,
  artworkNumber: string,
  artworkUid?: string
): { newList: any[]; didChange: boolean } {
  const num = artworkNumber.trim()
  if (!num) return { newList: Array.isArray(list) ? (list as any[]) : [], didChange: false }
  const arr = Array.isArray(list) ? [...(list as any[])] : []
  const uid = (artworkUid ?? '').trim()

  const candidates = arr
    .map((e, i) => ({ e, i }))
    .filter(({ e }) => entryMatchesNumber(e, num, uid))
    .sort((a, b) => {
      const ta = new Date(a.e?.soldAt || 0).getTime()
      const tb = new Date(b.e?.soldAt || 0).getTime()
      return tb - ta
    })

  if (candidates.length === 0) return { newList: arr, didChange: false }

  const { e, i } = candidates[0]
  const sq = Number(e?.soldQuantity)
  if (Number.isFinite(sq) && sq > 1) {
    arr[i] = { ...e, soldQuantity: sq - 1 }
  } else {
    arr.splice(i, 1)
  }
  return { newList: arr, didChange: true }
}
