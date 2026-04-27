/**
 * Lager / Verkauf – Anzeige aus Werk + Verkaufsliste (Kasse).
 * Eine Quelle für Karten und „Werk bearbeiten“.
 */

export type ArtworkLagerCardVariant = 'verfuegbar' | 'teilweise' | 'ausverkauft'

export type ArtworkLagerInfo = {
  artworkNumber: string
  /** Noch am Lager (Stückzahl im Werk) */
  remaining: number
  /** Summe „Kasse“: max(Verkaufsliste, Bestellungen) – damit Wochenend-Verkäufe aus Orders mitzählen */
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

/**
 * Lageranzeige: `quantity` im Werkstamm = oft nur auf dem Gerät aktualisiert, wo abgerechnet wurde.
 * Kasse (Sold + Orders) kann neuer sein → sonst Fälle „1 am Lager · 1 verkauft“ bei Einzelstück.
 * Wenn laut Werkstamm **genau 1** Stück, die Kasse aber **≥1** Verkauf bucht → faktisch 0 (Einzelstück ausverkauft).
 * Bei Mehrfachstück: Werkstamm-Zahl vorerst führen (Abzug dort wo verkauft wurde).
 */
function computeDisplayRemaining(stockFromArtwork: number, soldSumKasse: number): number {
  const q = Math.max(0, stockFromArtwork)
  const s = Math.max(0, soldSumKasse)
  if (q === 1 && s >= 1) return 0
  return q
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

/** Wie getCartLineQuantity in ShopPage: Stückzahl pro Warenkorbzeile */
function orderLineQuantity(item: { quantity?: unknown } | null | undefined): number {
  const q = item?.quantity
  if (q == null || !Number.isFinite(Number(q))) return 1
  return Math.max(1, Math.min(9999, Math.floor(Number(q))))
}

/**
 * Summe verkaufter Stück aus Kassen-Bestellungen (k2-orders / kontextgleich).
 * Quelle der Wahrheit wenn Verkaufsliste auf einem Gerät fehlt oder veraltet ist.
 */
export function sumSoldFromOrdersForArtwork(
  artwork: { number?: string; id?: string; uid?: string },
  orders: unknown
): number {
  const num = getArtworkNumberKey(artwork)
  if (!num) return 0
  const uid = String(artwork?.uid ?? '').trim()
  const ords = Array.isArray(orders) ? orders : []
  let sum = 0
  for (const order of ords) {
    const items = (order as any)?.items
    if (!Array.isArray(items)) continue
    for (const it of items) {
      if (!it) continue
      const inum = String((it as any).number ?? '').trim()
      if (inum !== num) continue
      const iuid = String((it as any).artworkUid ?? '').trim()
      if (uid && iuid && iuid !== uid) continue
      sum += orderLineQuantity(it as { quantity?: unknown })
    }
  }
  return sum
}

export function getArtworkLagerInfo(
  artwork: { number?: string; id?: string; uid?: string; quantity?: number | string | null },
  soldList: unknown,
  /** Optional: Kassen-Bestellungen (z. B. k2-orders) – max mit Verkaufsliste = vollständige Kassen-Summe */
  orders?: unknown
): ArtworkLagerInfo {
  const artworkNumber = getArtworkNumberKey(artwork)
  const stockRaw = parseQuantityRemaining(artwork)
  const fromList = sumSoldFromListForArtwork(artwork, soldList)
  const fromOrders = orders != null ? sumSoldFromOrdersForArtwork(artwork, orders) : 0
  const soldSumFromList = Math.max(fromList, fromOrders)
  const hasEntriesInSoldList = soldSumFromList > 0
  const remaining = computeDisplayRemaining(stockRaw, soldSumFromList)
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

function parseOrderLinePriceEur(raw: unknown): number {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw
  const s = String(raw ?? '')
    .replace(/\s/g, '')
    .replace(/€/g, '')
    .replace(',', '.')
  const n = parseFloat(s)
  return Number.isFinite(n) ? n : 0
}

function orderLineSubtotalEurForRecalc(item: { price?: unknown; quantity?: unknown }): number {
  return parseOrderLinePriceEur((item as any).price) * orderLineQuantity(item)
}

/** Gleiche Zugehörigkeit wie sumSoldFromOrdersForArtwork */
function orderItemMatchesForRevert(
  it: { number?: unknown; artworkUid?: unknown; quantity?: unknown },
  artworkNumber: string,
  artworkUid?: string
): boolean {
  const inum = String((it as any)?.number ?? '').trim()
  if (inum !== artworkNumber) return false
  const uid = (artworkUid ?? '').trim()
  const iuid = String((it as any)?.artworkUid ?? '').trim()
  if (uid && iuid && iuid !== uid) return false
  return true
}

/**
 * Eine Stück aus Kassen-Bestellungen zurückbuchen (neueste passende Order-Zeile zuerst).
 * Wichtig für Lager-Anzeige: getArtworkLagerInfo nutzt max(Verkaufsliste, Orders).
 */
export function revertOneOrderUnitForArtwork(
  orders: unknown,
  artworkNumber: string,
  artworkUid?: string
): { newOrders: any[]; didChange: boolean } {
  const num = artworkNumber.trim()
  if (!num) return { newOrders: Array.isArray(orders) ? [...(orders as any[])] : [], didChange: false }
  const arr = Array.isArray(orders) ? [...(orders as any[])] : []
  const byNewest = arr
    .map((o, i) => ({ o, i }))
    .sort((a, b) => {
      const ta = new Date(a.o?.date || a.o?.soldAt || 0).getTime()
      const tb = new Date(b.o?.date || b.o?.soldAt || 0).getTime()
      return tb - ta
    })
  for (const { i: orderIndex } of byNewest) {
    const order = arr[orderIndex] as { items?: unknown; subtotal?: number; discount?: number; total?: number; id?: string }
    const rawItems = Array.isArray(order?.items) ? order.items : []
    const items = [...rawItems]
    const ii = items.findIndex((it: any) => orderItemMatchesForRevert(it, num, artworkUid))
    if (ii === -1) continue
    const it = items[ii] as { quantity?: unknown; price?: unknown }
    const q = orderLineQuantity(it)
    if (q > 1) {
      items[ii] = { ...it, quantity: q - 1 }
    } else {
      items.splice(ii, 1)
    }
    const oldSub = Number(order.subtotal) || 0
    const newSubtotal = items.reduce((s, x) => s + orderLineSubtotalEurForRecalc(x as { price?: unknown; quantity?: unknown }), 0)
    const discRaw = Number(order.discount) || 0
    const newDiscount = oldSub > 0 && newSubtotal >= 0 ? discRaw * (newSubtotal / oldSub) : discRaw
    const newTotal = Math.max(0, newSubtotal - newDiscount)
    if (items.length === 0) {
      arr.splice(orderIndex, 1)
    } else {
      arr[orderIndex] = {
        ...order,
        items,
        subtotal: newSubtotal,
        discount: newDiscount,
        total: newTotal,
      }
    }
    return { newOrders: arr, didChange: true }
  }
  return { newOrders: arr, didChange: false }
}
