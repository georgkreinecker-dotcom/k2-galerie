/**
 * Persönlicher Code: Produktstandard **2 Buchstaben + 2 Ziffern** (vier Positionen),
 * siehe `familieMitgliedsNummer.ts`. Vier sichtbare Plätze — leer = noch nicht vergeben.
 * Abweichende Legacy-Werte: ein Zeilenfeld.
 */
import { useRef, type CSSProperties, type KeyboardEvent, type ClipboardEvent } from 'react'
import { RE_AUTO_MITGLIEDS_NUMMER, trimMitgliedsNummerEingabe } from '../utils/familieMitgliedsNummer'

export type FamiliePersoenlicherCodeFelderProps = {
  value: string
  onChange: (next: string) => void
  /** Nur Anzeige (keine Eingabe) */
  readOnly?: boolean
  idPrefix?: string
  ariaLabelledBy?: string
  ariaDescribedBy?: string
}

const cellStyle: CSSProperties = {
  width: '2.35rem',
  height: '2.35rem',
  textAlign: 'center',
  fontSize: '1.1rem',
  fontFamily: 'ui-monospace, monospace, Menlo, monospace',
  borderRadius: 8,
  border: '1px solid rgba(20,184,166,0.45)',
  background: 'rgba(15,23,42,0.6)',
  color: 'rgba(226,232,240,0.98)',
}

const emptyReadCellStyle: CSSProperties = {
  ...cellStyle,
  borderStyle: 'dashed',
  borderColor: 'rgba(148,163,184,0.45)',
  color: 'rgba(148,163,184,0.75)',
  fontStyle: 'italic',
  fontSize: '0.9rem',
}

/** Vier-Platz-UI solange leer, unvollständig LLDD oder fertig LLDD — nicht bei echten Legacy-Strings (z. B. Import). */
function useVierPlatzModus(raw: string): boolean {
  const t = trimMitgliedsNummerEingabe(raw)
  if (!t) return true
  const u = t.toUpperCase()
  if (RE_AUTO_MITGLIEDS_NUMMER.test(u)) return true
  return u.length <= 4 && /^[A-Z]{0,2}\d{0,2}$/.test(u)
}

function slotsFromValue(raw: string): [string, string, string, string] {
  const t = trimMitgliedsNummerEingabe(raw).toUpperCase()
  if (!t) return ['', '', '', '']
  const m = t.match(/^([A-Z]?)([A-Z]?)(\d?)(\d?)$/)
  if (!m) return ['', '', '', '']
  return [(m[1] || '').slice(0, 1), (m[2] || '').slice(0, 1), (m[3] || '').slice(0, 1), (m[4] || '').slice(0, 1)]
}

function buildFromSlots(s: [string, string, string, string]): string {
  const x = s.join('').trim()
  return x.length === 0 ? '' : x
}

export default function FamiliePersoenlicherCodeFelder({
  value,
  onChange,
  readOnly = false,
  idPrefix = 'k2fam-pers-code',
  ariaLabelledBy,
  ariaDescribedBy,
}: FamiliePersoenlicherCodeFelderProps) {
  const t = trimMitgliedsNummerEingabe(value)
  const vierPlatz = useVierPlatzModus(value)
  const isLegacy = Boolean(t && !vierPlatz)
  const slots = vierPlatz ? slotsFromValue(value) : (['', '', '', ''] as [string, string, string, string])
  const inputsRef = useRef<(HTMLInputElement | null)[]>([null, null, null, null])

  const setSlot = (index: number, ch: string) => {
    const next = [...slots] as [string, string, string, string]
    next[index] = ch
    onChange(buildFromSlots(next))
  }

  const onKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !slots[i] && i > 0) {
      inputsRef.current[i - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && i > 0) {
      e.preventDefault()
      inputsRef.current[i - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && i < 3) {
      e.preventDefault()
      inputsRef.current[i + 1]?.focus()
    }
  }

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const p = e.clipboardData.getData('text').trim().toUpperCase()
    if (p.length === 4 && RE_AUTO_MITGLIEDS_NUMMER.test(p)) {
      e.preventDefault()
      onChange(p)
      inputsRef.current[3]?.focus()
    }
  }

  if (readOnly) {
    if (isLegacy) {
      return (
        <div
          style={{ fontFamily: 'ui-monospace, monospace, Menlo, monospace', color: 'rgba(226,232,240,0.95)', fontSize: '1rem' }}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
        >
          {t}
          <span className="meta" style={{ display: 'block', marginTop: 8, fontSize: '0.78rem' }}>
            Hinweis: abweichendes Format (nicht die üblichen vier Zeichen Buchstabe-Buchstabe-Ziffer-Ziffer).
          </span>
        </div>
      )
    }
    const show = slotsFromValue(value)
    const anyFilled = show.some((c) => c !== '')
    return (
      <div
        role="group"
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}
      >
        <span className="meta" style={{ width: '100%', marginBottom: 4, fontSize: '0.72rem', letterSpacing: '0.04em' }}>
          Zwei Buchstaben · zwei Ziffern (Plätze)
        </span>
        {show.map((ch, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div
              style={{
                ...(ch ? cellStyle : emptyReadCellStyle),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '2.35rem',
              }}
              aria-hidden
            >
              {ch || (anyFilled ? '—' : '')}
            </div>
            <span className="meta" style={{ fontSize: '0.62rem', opacity: 0.85 }}>
              {i < 2 ? 'Bst.' : 'Ziff.'}
            </span>
          </div>
        ))}
        {!anyFilled && (
          <span className="meta" style={{ width: '100%', marginTop: 6, fontSize: '0.82rem', fontStyle: 'italic', color: 'rgba(148,163,184,0.95)' }}>
            Noch nicht vergeben — vier Plätze, von der Inhaber:in auszufüllen
          </span>
        )}
      </div>
    )
  }

  if (isLegacy) {
    return (
      <div>
        <p className="meta" style={{ margin: '0 0 0.5rem', fontSize: '0.82rem', lineHeight: 1.45 }}>
          Dieser Eintrag hat ein <strong style={{ color: 'rgba(226,232,240,0.95)' }}>anderes Format</strong> als die üblichen vier Zeichen. Anpassen oder löschen und neu mit vier Plätzen eintragen.
        </p>
        <input
          id={`${idPrefix}-legacy`}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          data-lpignore="true"
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          style={{ fontFamily: 'ui-monospace, monospace, Menlo, monospace', maxWidth: 320, width: '100%' }}
        />
        <button
          type="button"
          className="btn-outline"
          style={{ marginTop: '0.5rem', fontSize: '0.82rem', padding: '0.35rem 0.65rem' }}
          onClick={() => onChange('')}
        >
          Auf Standard (4 leere Plätze) zurücksetzen
        </button>
      </div>
    )
  }

  return (
    <div
      role="group"
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
    >
      <span className="meta" style={{ display: 'block', marginBottom: '0.45rem', fontSize: '0.72rem', letterSpacing: '0.03em' }}>
        Vier Plätze: Buchstabe · Buchstabe · Ziffer · Ziffer — leer lassen, bis du einen Code vergibst
      </span>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.45rem', flexWrap: 'wrap' }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <input
              ref={(el) => {
                inputsRef.current[i] = el
              }}
              id={i === 0 ? `${idPrefix}-0` : `${idPrefix}-${i}`}
              type="text"
              inputMode={i < 2 ? 'text' : 'numeric'}
              maxLength={1}
              value={slots[i]}
              autoComplete="off"
              data-lpignore="true"
              aria-label={i < 2 ? `Buchstabe ${i + 1} von 2` : `Ziffer ${i - 1} von 2`}
              onPaste={i === 0 ? onPaste : undefined}
              onChange={(e) => {
                let v = e.target.value
                if (i < 2) {
                  v = v.replace(/[^A-Za-z]/g, '').slice(-1).toUpperCase()
                } else {
                  v = v.replace(/\D/g, '').slice(-1)
                }
                setSlot(i, v)
                if (v && i < 3) inputsRef.current[i + 1]?.focus()
              }}
              onKeyDown={(e) => onKeyDown(i, e)}
              style={cellStyle}
            />
            <span className="meta" style={{ fontSize: '0.62rem', opacity: 0.85 }}>{i < 2 ? 'Bst.' : 'Ziff.'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
