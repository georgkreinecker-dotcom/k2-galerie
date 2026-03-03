/**
 * Kassabuch – eine Quelle pro Kontext (K2 | ök2).
 * Keys: k2-kassabuch, k2-oeffentlich-kassabuch. VK2 hat keine Kassa.
 */

export type KassabuchArt = 'eingang' | 'ausgang' | 'bar_privat' | 'kassa_an_bank' | 'bank_an_kassa'

export interface KassabuchEintrag {
  id: string
  datum: string // ISO-Datum YYYY-MM-DD
  betrag: number
  art: KassabuchArt
  verwendungszweck?: string
  verkaufId?: string // bei Eingang = Verkauf
}

const K2_KASSABUCH_KEY = 'k2-kassabuch'
const OEF_KASSABUCH_KEY = 'k2-oeffentlich-kassabuch'

export function getKassabuchKey(tenant: 'k2' | 'oeffentlich'): string {
  return tenant === 'oeffentlich' ? OEF_KASSABUCH_KEY : K2_KASSABUCH_KEY
}

export function loadKassabuch(tenant: 'k2' | 'oeffentlich'): KassabuchEintrag[] {
  try {
    const key = getKassabuchKey(tenant)
    const raw = localStorage.getItem(key)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

export function saveKassabuch(tenant: 'k2' | 'oeffentlich', entries: KassabuchEintrag[]): boolean {
  try {
    const key = getKassabuchKey(tenant)
    localStorage.setItem(key, JSON.stringify(entries))
    return true
  } catch {
    return false
  }
}

export function addKassabuchEintrag(tenant: 'k2' | 'oeffentlich', eintrag: Omit<KassabuchEintrag, 'id'>): boolean {
  const list = loadKassabuch(tenant)
  const id = `kb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  list.push({ ...eintrag, id })
  list.sort((a, b) => a.datum.localeCompare(b.datum) || 0)
  return saveKassabuch(tenant, list)
}
