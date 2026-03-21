/**
 * K2 nur: Malerei („Bilder“) mit fälschlich K2-K-… (Keramik-Buchstabe) statt K2-M-…
 * für Martinas Werke automatisch korrigieren. Kein ök2/VK2.
 *
 * Regeln: Kategorie malerei, kein Produkt/Idee-Kontext; Nummer passt auf K2-K-<Ziffern>;
 * Künstler leer (= Default Martina bei Malerei) oder eindeutig Martina laut Stammdaten,
 * nicht Georg.
 */

import { getNextFreeNumberInCategory } from './syncMerge'

const WRONG_K_PREFIX = /^K2-K-(\d+)$/i
const M_PREFIX = 'K2-M-'

function normName(s: unknown): string {
  return String(s ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
}

/** Prüft ob displayName im Künstlerfeld vorkommt (Teilstrings / Vor- Nachname). */
export function nameMatchesArtistField(artistField: string, displayName: string): boolean {
  const f = normName(artistField)
  const n = normName(displayName)
  if (!f || !n) return false
  if (f.includes(n) || n.includes(f)) return true
  const parts = n.split(/\s+/).filter((p) => p.length > 2)
  return parts.some((p) => f.includes(p))
}

/**
 * Malerei + K2-K-Fix: leer = Martina (wie Galerie-Default). Georg am Vornamen erkennen und ausschließen.
 * Nur gemeinsamer Nachname ohne Vornamen → Malerei gilt als Martina.
 */
export function artistIndicatesMartinaForK2MalereiFix(
  artist: string,
  martinaName: string,
  georgName: string
): boolean {
  const f = normName(artist)
  if (!f) return true
  const mt = normName(martinaName)
  const gt = normName(georgName)
  if (!mt) return false
  const mParts = mt.split(/\s+/).filter((t) => t.length > 0)
  const gParts = gt.split(/\s+/).filter((t) => t.length > 0)
  const mFirst = mParts[0] || ''
  const gFirst = gParts[0] || ''
  if (gFirst.length >= 2 && f.includes(gFirst)) return false
  if (mFirst.length >= 2 && f.includes(mFirst)) return true
  if (mt.length >= 3 && f.includes(mt)) return true
  const mLast = mParts.length ? mParts[mParts.length - 1] : ''
  const gLast = gParts.length ? gParts[gParts.length - 1] : ''
  if (mLast.length >= 2 && mLast === gLast && f.includes(mLast)) return true
  return mParts.some((t) => t.length > 2 && f.includes(t))
}

/**
 * Trifft zu, wenn dieses Werk fälschlich K2-K-… trägt, aber zu Martinas Malerei gehört.
 */
export function isK2MalereiMartinaWrongKPrefix(
  artwork: { category?: string; entryType?: string; number?: string; id?: string; artist?: string },
  martinaName: string,
  georgName: string
): boolean {
  if (!String(martinaName || '').trim()) return false
  if (artwork.category !== 'malerei') return false
  if (artwork.entryType === 'product' || artwork.entryType === 'idea') return false
  const num = String(artwork.number ?? artwork.id ?? '').trim()
  if (!WRONG_K_PREFIX.test(num)) return false
  const artist = String(artwork.artist ?? '').trim()
  return artistIndicatesMartinaForK2MalereiFix(artist, martinaName, georgName)
}

function formatMNumber(digits: string): string {
  const w = Math.max(4, digits.length)
  return `${M_PREFIX}${digits.padStart(w, '0')}`
}

/**
 * Liefert die korrigierte Nummer oder null, wenn keine Korrektur nötig/erlaubt ist.
 * @param allArtworks – aktuelle Liste (inkl. dieses Werks); Kollisionen → nächste freie K2-M-.
 */
export function computeK2MalereiMartinaCorrectedNumber(
  artwork: { category?: string; entryType?: string; number?: string; id?: string; artist?: string },
  allArtworks: any[],
  martinaName: string,
  georgName: string
): string | null {
  if (!isK2MalereiMartinaWrongKPrefix(artwork, martinaName, georgName)) return null
  const num = String(artwork.number ?? artwork.id ?? '').trim()
  const m = num.match(WRONG_K_PREFIX)
  if (!m) return null
  const digits = m[1]
  const candidate = formatMNumber(digits)
  const selfKey = num
  const otherHas = (n: string) =>
    allArtworks.some((a: any) => {
      const k = String(a?.number ?? a?.id ?? '').trim()
      if (!k || k === selfKey) return false
      return k === n
    })
  if (!otherHas(candidate)) return candidate
  const next = getNextFreeNumberInCategory(M_PREFIX, allArtworks)
  return `${M_PREFIX}${String(next).padStart(4, '0')}`
}

export type K2MalereiRename = { from: string; to: string }

/**
 * Ein Durchlauf: jedes passende Werk anhand der dann schon aktualisierten Liste korrigieren.
 */
export function applyK2MalereiMartinaKtoMBatch(
  artworks: any[],
  martinaName: string,
  georgName: string
): { list: any[]; renames: K2MalereiRename[] } {
  const list = artworks.map((a) => ({ ...a }))
  const renames: K2MalereiRename[] = []
  for (let i = 0; i < list.length; i++) {
    const to = computeK2MalereiMartinaCorrectedNumber(list[i], list, martinaName, georgName)
    const from = String(list[i].number ?? list[i].id ?? '').trim()
    if (!to || from === to) continue
    list[i] = { ...list[i], number: to, id: to }
    renames.push({ from, to })
  }
  return { list, renames }
}

/** Nach Batch oder manuell: verkaufte / reservierte / Bestellungen auf neue Nummern mappen. */
export function patchK2LocalStorageAfterArtworkRenames(renameMap: Record<string, string>): void {
  if (Object.keys(renameMap).length === 0) return

  try {
    const soldRaw = localStorage.getItem('k2-sold-artworks')
    if (soldRaw) {
      const arr = JSON.parse(soldRaw)
      if (Array.isArray(arr)) {
        let touched = false
        const next = arr.map((e: any) => {
          if (e && typeof e.number === 'string' && renameMap[e.number]) {
            touched = true
            return { ...e, number: renameMap[e.number] }
          }
          return e
        })
        if (touched) localStorage.setItem('k2-sold-artworks', JSON.stringify(next))
      }
    }
  } catch (_) {}

  try {
    const resRaw = localStorage.getItem('k2-reserved-artworks')
    if (resRaw) {
      const arr = JSON.parse(resRaw)
      if (Array.isArray(arr)) {
        let touched = false
        const next = arr.map((e: any) => {
          if (e && typeof e.number === 'string' && renameMap[e.number]) {
            touched = true
            return { ...e, number: renameMap[e.number] }
          }
          return e
        })
        if (touched) localStorage.setItem('k2-reserved-artworks', JSON.stringify(next))
      }
    }
  } catch (_) {}

  try {
    const ordRaw = localStorage.getItem('k2-orders')
    if (ordRaw) {
      const orders = JSON.parse(ordRaw)
      if (Array.isArray(orders)) {
        let touched = false
        const next = orders.map((o: any) => {
          if (!o || !Array.isArray(o.items)) return o
          const items = o.items.map((it: any) => {
            if (it && typeof it.number === 'string' && renameMap[it.number]) {
              touched = true
              return { ...it, number: renameMap[it.number] }
            }
            return it
          })
          return { ...o, items }
        })
        if (touched) localStorage.setItem('k2-orders', JSON.stringify(next))
      }
    }
  } catch (_) {}
}
