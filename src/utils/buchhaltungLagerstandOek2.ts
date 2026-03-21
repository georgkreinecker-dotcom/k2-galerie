/**
 * Kleingewerbe ök2: kompakte Lagerstand-Vorschau aus k2-oeffentlich-artworks.
 * Nur Stücke mit Stückzahl &gt; 0 (quantity fehlt → 1 wie üblich im Shop).
 */

export type LagerstandOek2Row = {
  number: string
  title: string
  menge: number
  vk: number
  ek: number
  eigenproduktion: boolean
}

export type LagerstandOek2Vorschau = {
  rows: LagerstandOek2Row[]
  gesamtStueck: number
  wertVk: number
  wertEk: number
}

function parseMoney(raw: unknown): number {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0
  const n = parseFloat(String(raw ?? '').replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

/** Stückzahl im Lager: 0 = aus Liste; fehlt → 1 */
function lagerMenge(a: Record<string, unknown>): number {
  const qRaw = a.quantity
  if (qRaw === undefined || qRaw === null || qRaw === '') return 1
  const q = Math.floor(Number(qRaw))
  if (!Number.isFinite(q) || q < 0) return 0
  return q
}

export function computeLagerstandOek2Vorschau(artworks: unknown[]): LagerstandOek2Vorschau {
  const rows: LagerstandOek2Row[] = []
  let gesamtStueck = 0
  let wertVk = 0
  let wertEk = 0

  for (const raw of artworks) {
    if (!raw || typeof raw !== 'object') continue
    const a = raw as Record<string, unknown>
    const num = String(a.number ?? '').trim()
    if (!num) continue

    const menge = lagerMenge(a)
    if (menge <= 0) continue

    const vk = parseMoney(a.price)
    const ekParsed = parseMoney(a.purchasePrice)
    const ek = ekParsed > 0 ? ekParsed : 0
    const title = String(a.title ?? '').trim().slice(0, 120)

    rows.push({
      number: num,
      title,
      menge,
      vk,
      ek,
      eigenproduktion: ek <= 0,
    })
    gesamtStueck += menge
    wertVk += vk * menge
    wertEk += ek * menge
  }

  rows.sort((x, y) => x.number.localeCompare(y.number, 'de', { numeric: true }))

  return { rows, gesamtStueck, wertVk, wertEk }
}
