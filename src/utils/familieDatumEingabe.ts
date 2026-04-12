/**
 * K2 Familie – Datums-Eingabe ohne natives date-Picker-Problem (Jahreszahl in Safari u. a.).
 * Speichern als ISO YYYY-MM-DD.
 */

/** Akzeptiert YYYY-MM-DD oder TT.MM.JJJJ, liefert YYYY-MM-DD oder undefined bei leer. */
export function normalizeFamilieDatum(raw: string): string | undefined {
  const s = raw.trim()
  if (!s) return undefined

  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (iso) {
    const y = parseInt(iso[1], 10)
    const mo = parseInt(iso[2], 10)
    const d = parseInt(iso[3], 10)
    if (y < 1 || y > 9999) return undefined
    const dt = new Date(y, mo - 1, d)
    if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return undefined
    return `${String(y).padStart(4, '0')}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }

  const de = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
  if (de) {
    const d = parseInt(de[1], 10)
    const mo = parseInt(de[2], 10)
    const y = parseInt(de[3], 10)
    if (y < 1 || y > 9999) return undefined
    const dt = new Date(y, mo - 1, d)
    if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return undefined
    return `${String(y).padStart(4, '0')}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }

  return undefined
}

/** true wenn nicht leer aber nicht parsbar. */
export function istFamilieDatumUngueltig(raw: string): boolean {
  const s = raw.trim()
  if (!s) return false
  return normalizeFamilieDatum(s) === undefined
}

/** Anzahl Tage im Monat (month 1–12). */
export function daysInMonth(year: number, month: number): number {
  if (month < 1 || month > 12) return 31
  return new Date(year, month, 0).getDate()
}

/** ISO YYYY-MM-DD (oder leer) in drei zweistellige Teile; ungültige/leere Eingabe → alles leer. */
export function splitIsoDateToParts(raw: string): { d: string; m: string; y: string } {
  const s = raw.trim()
  if (!s) return { d: '', m: '', y: '' }
  const norm = normalizeFamilieDatum(s)
  if (!norm) return { d: '', m: '', y: '' }
  const iso = norm.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!iso) return { d: '', m: '', y: '' }
  return { y: iso[1], m: iso[2], d: iso[3] }
}

/** Tag/Monat/Jahr als zweistellige Strings; liefert YYYY-MM-DD oder '' wenn ungültig oder unvollständig. */
export function tryBuildIsoFromParts(dStr: string, mStr: string, yStr: string): string {
  const d = dStr.trim()
  const m = mStr.trim()
  const y = yStr.trim()
  if (!d || !m || !y) return ''
  const di = parseInt(d, 10)
  const mi = parseInt(m, 10)
  const yi = parseInt(y, 10)
  if (Number.isNaN(di) || Number.isNaN(mi) || Number.isNaN(yi)) return ''
  const dt = new Date(yi, mi - 1, di)
  if (dt.getFullYear() !== yi || dt.getMonth() !== mi - 1 || dt.getDate() !== di) return ''
  return `${String(yi).padStart(4, '0')}-${String(mi).padStart(2, '0')}-${String(di).padStart(2, '0')}`
}
