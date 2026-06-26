/**
 * Galerie: verkaufte Werke anzeigen und nach Frist ausblenden – eine Quelle (K2/VK2).
 */
import { getArtworkLagerInfo, getArtworkNumberKey, soldEntryMatchesArtwork } from './artworkLagerStatus'

export type GalerieSoldStatus = { isSoldOut: boolean; isPartiallySold: boolean }

export type GalerieSoldDisplayContext = {
  soldDisplayDays: number
  soldAtByArtworkKey: Map<string, string>
  soldStatusByArtworkKey: Map<string, GalerieSoldStatus>
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

export function getSoldArtworksDisplayDaysFromGalerieStammdaten(rawGalerieJson: string | null): number {
  let soldDisplayDays = 30
  if (!rawGalerieJson) return soldDisplayDays
  try {
    const g = JSON.parse(rawGalerieJson)
    if (typeof g?.soldArtworksDisplayDays === 'number') soldDisplayDays = g.soldArtworksDisplayDays
  } catch {
    /* ignore */
  }
  return soldDisplayDays
}

function getNewestSoldAtForArtwork(
  artwork: { number?: string; id?: string; uid?: string },
  soldList: unknown[],
  ordersList: unknown[]
): string {
  let newest = ''
  for (const e of soldList) {
    if (!soldEntryMatchesArtwork(artwork, e as { number?: string; artworkUid?: string })) continue
    const d = String((e as { soldAt?: string })?.soldAt || '')
    if (d && (!newest || new Date(d).getTime() > new Date(newest).getTime())) newest = d
  }
  for (const o of ordersList) {
    if (!o || !Array.isArray((o as { items?: unknown }).items)) continue
    const items = (o as { items: { number?: string }[] }).items
    const hasItem = items.some((it) => soldEntryMatchesArtwork(artwork, { number: it?.number }))
    if (!hasItem) continue
    const od = String((o as { date?: string }).date || '')
    if (od && (!newest || new Date(od).getTime() > new Date(newest).getTime())) newest = od
  }
  return newest
}

/** Verkaufsstand für Galerie-Ansicht aus Werken + Kasse (Sold + Orders). */
export function buildGalerieSoldDisplayContext(
  artworks: { number?: string; id?: string; uid?: string; quantity?: number | string | null }[],
  soldList: unknown[],
  ordersList: unknown[],
  soldDisplayDays: number
): GalerieSoldDisplayContext {
  const soldAtByArtworkKey = new Map<string, string>()
  const soldStatusByArtworkKey = new Map<string, GalerieSoldStatus>()

  for (const artwork of artworks) {
    const num = getArtworkNumberKey(artwork)
    if (!num) continue
    const lager = getArtworkLagerInfo(artwork, soldList, ordersList)
    soldStatusByArtworkKey.set(num, {
      isSoldOut: lager.isAusverkauft,
      isPartiallySold: lager.isTeilverkauft,
    })
    const soldAt = getNewestSoldAtForArtwork(artwork, soldList, ordersList)
    if (soldAt) soldAtByArtworkKey.set(num, soldAt)
  }

  return { soldDisplayDays, soldAtByArtworkKey, soldStatusByArtworkKey }
}

export function shouldHideSoldArtworkFromGalerie(
  soldStatus: GalerieSoldStatus | null | undefined,
  soldAtIso: string | null | undefined,
  soldDisplayDays: number
): boolean {
  if (!soldStatus?.isSoldOut) return false
  if (soldDisplayDays === 0) return true
  if (!soldAtIso) return false
  const t = new Date(soldAtIso).getTime()
  if (Number.isNaN(t)) return false
  const cutoff = Date.now() - soldDisplayDays * MS_PER_DAY
  return t < cutoff
}

export function filterArtworksForGalerieView<T extends { number?: string; id?: string; category?: string }>(
  artworks: T[],
  ctx: GalerieSoldDisplayContext,
  filter: string,
  musterOnly: boolean
): T[] {
  return artworks.filter((artwork) => {
    if (!artwork) return false
    const num = getArtworkNumberKey(artwork)
    const soldStatus = num ? ctx.soldStatusByArtworkKey.get(num) : null
    const soldAt = num ? ctx.soldAtByArtworkKey.get(num) : null

    const hideSold =
      !musterOnly &&
      ctx.soldStatusByArtworkKey.size > 0 &&
      shouldHideSoldArtworkFromGalerie(soldStatus, soldAt, ctx.soldDisplayDays)

    if (filter === 'alle') {
      return !hideSold
    }
    if (!artwork.category) return false
    if (artwork.category !== filter) return false
    return !hideSold
  })
}
