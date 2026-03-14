/**
 * Kassabuch – eine Quelle pro Kontext (K2 | ök2).
 * Keys: k2-kassabuch, k2-oeffentlich-kassabuch. VK2 hat keine Kassa.
 * Steuerberatergeeignet: chronologisch, Beleg (QR/Foto), separat druckbar/exportierbar.
 */

export type KassabuchArt = 'eingang' | 'ausgang' | 'bar_privat' | 'bar_beleg' | 'kassa_an_bank' | 'bank_an_kassa'

export interface KassabuchEintrag {
  id: string
  datum: string // ISO-Datum YYYY-MM-DD
  betrag: number
  art: KassabuchArt
  verwendungszweck?: string
  verkaufId?: string // bei Eingang = Verkauf
  /** Bar mit Beleg: Bild (data URL oder /img/ Pfad) */
  belegImage?: string
  /** Bar mit Beleg: gescannter QR-Text (z. B. E-Rechnung) */
  belegQrText?: string
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

/** Art-Label für Anzeige und Export */
export function getKassabuchArtLabel(art: KassabuchArt): string {
  switch (art) {
    case 'eingang': return 'Eingang'
    case 'ausgang': return 'Ausgang'
    case 'bar_privat': return 'Bar privat'
    case 'bar_beleg': return 'Bar mit Beleg'
    case 'kassa_an_bank': return 'Kassa an Bank'
    case 'bank_an_kassa': return 'Bank an Kassa'
    default: return art
  }
}

/** Verkäufe (Orders) als Kassabuch-Eingänge laden – eine Quelle pro Kontext */
const K2_ORDERS_KEY = 'k2-orders'
const OEF_ORDERS_KEY = 'k2-oeffentlich-orders'

function loadOrdersKey(tenant: 'k2' | 'oeffentlich'): string {
  return tenant === 'oeffentlich' ? OEF_ORDERS_KEY : K2_ORDERS_KEY
}

/** Gibt alle Kassabuch-Einträge inkl. Kassaeingänge (Verkäufe) zurück – chronologisch sortiert. */
export function getKassabuchMitEingaengen(tenant: 'k2' | 'oeffentlich'): KassabuchEintrag[] {
  const ausgaenge = loadKassabuch(tenant)
  try {
    const ordersKey = loadOrdersKey(tenant)
    const raw = localStorage.getItem(ordersKey)
    const orders: { id?: string; date?: string; total?: number }[] = raw ? JSON.parse(raw) : []
    if (!Array.isArray(orders)) return [...ausgaenge].sort((a, b) => a.datum.localeCompare(b.datum) || 0)
    const eingaenge: KassabuchEintrag[] = orders
      .filter(o => o && (o.date || (o as any).soldAt))
      .map(o => {
        const datum = (o.date || (o as any).soldAt || '').slice(0, 10)
        const betrag = typeof o.total === 'number' ? o.total : 0
        return {
          id: `order-${o.id || Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          datum,
          betrag,
          art: 'eingang' as const,
          verkaufId: o.id,
        }
      })
    const combined = [...eingaenge, ...ausgaenge].sort((a, b) => a.datum.localeCompare(b.datum) || 0)
    return combined
  } catch {
    return [...ausgaenge].sort((a, b) => a.datum.localeCompare(b.datum) || 0)
  }
}

/** Lizenzstufe für Kassa/Kassabuch: Basic = keine Kassa, Pro = Kassa ohne volles Kassabuch, Pro+ / Pro++ = volles Kassabuch (Pro++ inkl. Rechnung) */
export type KassabuchLizenzStufe = 'basic' | 'pro' | 'proplus' | 'propplus'

const K2_LIZENZ_STUFE_KEY = 'k2-lizenz-stufe'
const OEF_LIZENZ_STUFE_KEY = 'k2-oeffentlich-lizenz-stufe'

export function getKassabuchLizenzStufe(tenant: 'k2' | 'oeffentlich'): KassabuchLizenzStufe {
  try {
    const key = tenant === 'oeffentlich' ? OEF_LIZENZ_STUFE_KEY : K2_LIZENZ_STUFE_KEY
    const v = localStorage.getItem(key)
    if (v === 'basic' || v === 'pro' || v === 'proplus' || v === 'propplus') return v
    return 'proplus'
  } catch {
    return 'proplus'
  }
}

export function setKassabuchLizenzStufe(tenant: 'k2' | 'oeffentlich', stufe: KassabuchLizenzStufe): void {
  try {
    const key = tenant === 'oeffentlich' ? OEF_LIZENZ_STUFE_KEY : K2_LIZENZ_STUFE_KEY
    localStorage.setItem(key, stufe)
  } catch {}
}

/** Kassa (Verkauf erfassen) nur ab Pro. Basic = keine Kassa. */
export function hasKassa(tenant: 'k2' | 'oeffentlich'): boolean {
  return getKassabuchLizenzStufe(tenant) !== 'basic'
}

/** Volles Kassabuch (Eingänge + Ausgänge, Bar privat, Kassa an Bank, Belege) mit Pro+ oder Pro++. */
export function hasKassabuchVoll(tenant: 'k2' | 'oeffentlich'): boolean {
  const stufe = getKassabuchLizenzStufe(tenant)
  return stufe === 'proplus' || stufe === 'propplus'
}

/** Kassabuch führen Ja/Nein – Einstellung pro Kontext (default: true) */
const K2_KASSABUCH_AKTIV_KEY = 'k2-kassabuch-aktiv'
const OEF_KASSABUCH_AKTIV_KEY = 'k2-oeffentlich-kassabuch-aktiv'

export function isKassabuchAktiv(tenant: 'k2' | 'oeffentlich'): boolean {
  try {
    const key = tenant === 'oeffentlich' ? OEF_KASSABUCH_AKTIV_KEY : K2_KASSABUCH_AKTIV_KEY
    const v = localStorage.getItem(key)
    if (v === '0' || v === 'false') return false
    return true
  } catch {
    return true
  }
}

export function setKassabuchAktiv(tenant: 'k2' | 'oeffentlich', aktiv: boolean): void {
  try {
    const key = tenant === 'oeffentlich' ? OEF_KASSABUCH_AKTIV_KEY : K2_KASSABUCH_AKTIV_KEY
    localStorage.setItem(key, aktiv ? '1' : '0')
  } catch {}
}

/** Export für Steuerberater: CSV (Zeitraum optional, alle Einträge wenn keine Grenzen) */
export function exportKassabuchCsv(entries: KassabuchEintrag[], fromDate?: string, toDate?: string): string {
  let list = [...entries]
  if (fromDate) list = list.filter(e => e.datum >= fromDate)
  if (toDate) list = list.filter(e => e.datum <= toDate)
  list.sort((a, b) => a.datum.localeCompare(b.datum) || 0)
  const header = 'Datum;Art;Betrag;Verwendungszweck;Beleg (QR/ Foto)'
  const rows = list.map(e => {
    const zweck = (e.verwendungszweck || '').replace(/;/g, ',')
    const beleg = e.belegQrText ? `QR: ${e.belegQrText.slice(0, 80)}${e.belegQrText.length > 80 ? '…' : ''}` : (e.belegImage ? 'Foto' : '')
    return `${e.datum};${getKassabuchArtLabel(e.art)};${e.betrag.toFixed(2)};${zweck};${beleg}`
  })
  return [header, ...rows].join('\n')
}
