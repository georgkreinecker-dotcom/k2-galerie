/**
 * K2: Fehlende Keramik-Werke K2-K-0001 … K2-K-0021 aus einem Server-Payload (z. B. gallery-data.json)
 * nur **anfügen** – keine Löschung, keine Umbenennung bestehender Einträge.
 */

const KERAMIK_CANONICAL_COUNT = 21

export function canonicalKeramikK2Numbers(): string[] {
  return Array.from({ length: KERAMIK_CANONICAL_COUNT }, (_, i) => {
    const n = i + 1
    return `K2-K-${String(n).padStart(4, '0')}`
  })
}

function normNum(a: unknown): string {
  return String((a as { number?: string; id?: string })?.number ?? (a as { id?: string })?.id ?? '').trim()
}

/**
 * @param localList – aktuelle k2-artworks (Roh)
 * @param serverArtworks – `artworks` aus gallery-data.json o. ä.
 */
export function mergeMissingCanonicalKeramikK2FromServerArtworks(
  localList: any[],
  serverArtworks: any[]
): { merged: any[]; added: string[] } {
  const nums = canonicalKeramikK2Numbers()
  const localSet = new Set((localList || []).map(normNum).filter(Boolean))
  const byServerNum = new Map<string, any>()
  for (const a of serverArtworks || []) {
    const k = normNum(a)
    if (k) byServerNum.set(k, a)
  }
  const merged = [...(localList || [])]
  const added: string[] = []
  for (const num of nums) {
    if (localSet.has(num)) continue
    const src = byServerNum.get(num)
    if (!src) continue
    if (String(src.category || '').trim() !== 'keramik') continue
    merged.push({ ...src })
    added.push(num)
    localSet.add(num)
  }
  return { merged, added }
}

const K2_K_KERAMIK_NUM = /^K2-K-\d+$/i

/**
 * Alle Keramik-Werke mit Nummer K2-K- und Ziffern, die auf dem Server sind, aber lokal fehlen – nur anfügen.
 * Deckt z. B. 0019–0023 mit ab, nicht nur 0001–0021.
 */
export function mergeAllMissingKeramikK2KFromServerArtworks(
  localList: any[],
  serverArtworks: any[]
): { merged: any[]; added: string[] } {
  const localSet = new Set((localList || []).map(normNum).filter(Boolean))
  const merged = [...(localList || [])]
  const added: string[] = []
  for (const src of serverArtworks || []) {
    const k = normNum(src)
    if (!k || !K2_K_KERAMIK_NUM.test(k)) continue
    if (String(src.category || '').trim() !== 'keramik') continue
    if (localSet.has(k)) continue
    merged.push({ ...src })
    added.push(k)
    localSet.add(k)
  }
  added.sort((a, b) => {
    const na = parseInt(a.replace(/\D/g, ''), 10) || 0
    const nb = parseInt(b.replace(/\D/g, ''), 10) || 0
    return na - nb
  })
  return { merged, added }
}
