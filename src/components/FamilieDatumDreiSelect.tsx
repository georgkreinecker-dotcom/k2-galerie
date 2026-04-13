/**
 * K2 Familie – Geburtsdatum / Datum als drei native Auswahlfelder (Tag · Monat · Jahr).
 * Ohne type="date"-Popup; auf Mobilgeräten wirken die Selects wie Scroll-Räder.
 */

import { useEffect, useState } from 'react'
import { daysInMonth, splitIsoDateToParts, tryBuildIsoFromParts } from '../utils/familieDatumEingabe'

const MONATE: [string, string][] = [
  ['01', 'Januar'],
  ['02', 'Februar'],
  ['03', 'März'],
  ['04', 'April'],
  ['05', 'Mai'],
  ['06', 'Juni'],
  ['07', 'Juli'],
  ['08', 'August'],
  ['09', 'September'],
  ['10', 'Oktober'],
  ['11', 'November'],
  ['12', 'Dezember'],
]

type Props = {
  /** YYYY-MM-DD oder leer */
  value: string
  onChange: (iso: string) => void
  idPrefix: string
  /** Kurz für aria-label der Gruppe */
  labelShort: string
  /** Bei Personenwechsel: gleicher Key wie Person-Id → lokale Felder zurücksetzen */
  resetKey?: string
  /** z. B. Leser:in auf eigener Karte: strukturelle Daten nur Anzeige */
  disabled?: boolean
}

export default function FamilieDatumDreiSelect({ value, onChange, idPrefix, labelShort, resetKey, disabled }: Props) {
  const [d, setD] = useState(() => splitIsoDateToParts(value).d)
  const [m, setM] = useState(() => splitIsoDateToParts(value).m)
  const [y, setY] = useState(() => splitIsoDateToParts(value).y)

  /** Person gewechselt / Formular zurück: immer aus value übernehmen. */
  useEffect(() => {
    const p = splitIsoDateToParts(value)
    setD(p.d)
    setM(p.m)
    setY(p.y)
  }, [resetKey])

  /** Gespeichertes Datum nachgeladen (value nicht leer): mit Eltern synchronisieren. */
  useEffect(() => {
    if (!value.trim()) return
    const p = splitIsoDateToParts(value)
    setD(p.d)
    setM(p.m)
    setY(p.y)
  }, [value])

  const yNum = y ? parseInt(y, 10) : NaN
  const mNum = m ? parseInt(m, 10) : NaN
  const maxDay =
    !Number.isNaN(yNum) && !Number.isNaN(mNum) ? daysInMonth(yNum, mNum) : 31

  const yearMax = new Date().getFullYear() + 1
  const yearMin = 1600
  const years: number[] = []
  for (let yr = yearMax; yr >= yearMin; yr--) years.push(yr)

  const dayOptions: number[] = []
  const n = Math.max(1, Math.min(31, maxDay))
  for (let i = 1; i <= n; i++) dayOptions.push(i)

  const apply = (nextD: string, nextM: string, nextY: string) => {
    if (disabled) return
    let nd = nextD
    let nm = nextM
    let ny = nextY
    if (nd && nm && ny) {
      const yi = parseInt(ny, 10)
      const mi = parseInt(nm, 10)
      let di = parseInt(nd, 10)
      const max = daysInMonth(yi, mi)
      if (di > max) di = max
      nd = String(di).padStart(2, '0')
    }
    setD(nd)
    setM(nm)
    setY(ny)
    if (!nd || !nm || !ny) {
      onChange('')
      return
    }
    const iso = tryBuildIsoFromParts(nd, nm, ny)
    onChange(iso || '')
  }

  return (
    <div
      className="familie-datum-drei-selects"
      style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}
      role="group"
      aria-label={labelShort}
    >
      <label htmlFor={`${idPrefix}-tag`} className="meta" style={{ margin: 0 }}>
        Tag
      </label>
      <select
        id={`${idPrefix}-tag`}
        value={d}
        onChange={(e) => apply(e.target.value, m, y)}
        aria-label={`${labelShort}: Tag`}
        disabled={disabled}
        style={{ minWidth: '4.25rem', opacity: disabled ? 0.75 : undefined }}
      >
        <option value="">—</option>
        {dayOptions.map((day) => {
          const v = String(day).padStart(2, '0')
          return (
            <option key={v} value={v}>
              {day}
            </option>
          )
        })}
      </select>
      <label htmlFor={`${idPrefix}-monat`} className="meta" style={{ margin: 0 }}>
        Monat
      </label>
      <select
        id={`${idPrefix}-monat`}
        value={m}
        onChange={(e) => apply(d, e.target.value, y)}
        aria-label={`${labelShort}: Monat`}
        disabled={disabled}
        style={{ minWidth: '9rem', opacity: disabled ? 0.75 : undefined }}
      >
        <option value="">—</option>
        {MONATE.map(([val, name]) => (
          <option key={val} value={val}>
            {name}
          </option>
        ))}
      </select>
      <label htmlFor={`${idPrefix}-jahr`} className="meta" style={{ margin: 0 }}>
        Jahr
      </label>
      <select
        id={`${idPrefix}-jahr`}
        value={y}
        onChange={(e) => apply(d, m, e.target.value)}
        aria-label={`${labelShort}: Jahr`}
        disabled={disabled}
        style={{ minWidth: '5.25rem', opacity: disabled ? 0.75 : undefined }}
      >
        <option value="">—</option>
        {years.map((yr) => (
          <option key={yr} value={String(yr)}>
            {yr}
          </option>
        ))}
      </select>
    </div>
  )
}
