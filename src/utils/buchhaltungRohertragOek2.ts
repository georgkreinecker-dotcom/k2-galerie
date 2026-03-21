/**
 * Kleingewerbe-Übersicht ök2: Verkaufserlös vs. EK aus Werkstamm (Rohertrag).
 * Nur Positionen mit Werknummer; ohne EK = Eigenproduktion (EK 0).
 */

export type RohertragOek2Artwork = { number?: string; purchasePrice?: number | string | null }

export type RohertragOek2Order = {
  items?: Array<{ number?: string; title?: string; price?: number; quantity?: number }>
}

export type RohertragOek2Result = {
  /** Summe VK aller Positionen mit Werknummer */
  verkaufserloes: number
  /** Summe EK (nur wo im Werkstamm EK > 0) */
  wareneinsatz: number
  /** Verkaufserlös minus Wareneinsatz */
  rohertrag: number
  /** Anzahl Positionen mit Werknummer */
  positionenMitWerknummer: number
  /** Positionen mit Werknummer aber ohne EK (Eigenproduktion / nicht erfasst) */
  positionenEigenproduktion: number
}

function parseEk(raw: number | string | null | undefined): number {
  if (raw == null || raw === '') return 0
  if (typeof raw === 'number') return Number.isFinite(raw) && raw > 0 ? raw : 0
  const n = parseFloat(String(raw).replace(',', '.'))
  return Number.isFinite(n) && n > 0 ? n : 0
}

function parsePrice(raw: number | string | null | undefined): number {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0
  const n = parseFloat(String(raw ?? '').replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

export function computeRohertragOek2(orders: RohertragOek2Order[], artworks: RohertragOek2Artwork[]): RohertragOek2Result {
  const ekByNumber = new Map<string, number>()
  for (const a of artworks) {
    const num = String(a?.number ?? '').trim()
    if (!num) continue
    const ek = parseEk(a?.purchasePrice as number | string | null | undefined)
    if (ek > 0) ekByNumber.set(num, ek)
  }

  let verkaufserloes = 0
  let wareneinsatz = 0
  let positionenMitWerknummer = 0
  let positionenEigenproduktion = 0

  for (const o of orders) {
    const items = Array.isArray(o.items) ? o.items : []
    for (const it of items) {
      const num = String(it?.number ?? '').trim()
      if (!num) continue
      positionenMitWerknummer++
      const qty = it.quantity != null && Number(it.quantity) > 0 ? Number(it.quantity) : 1
      const lineVk = parsePrice(it.price) * qty
      verkaufserloes += lineVk
      const unitEk = ekByNumber.get(num) ?? 0
      if (unitEk > 0) {
        wareneinsatz += unitEk * qty
      } else {
        positionenEigenproduktion++
      }
    }
  }

  return {
    verkaufserloes,
    wareneinsatz,
    rohertrag: verkaufserloes - wareneinsatz,
    positionenMitWerknummer,
    positionenEigenproduktion,
  }
}
