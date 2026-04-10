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
