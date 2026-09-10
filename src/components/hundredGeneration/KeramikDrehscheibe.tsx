import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import type { HundredGenerationAnsicht } from '../../config/hundredGenerationEntwuerfe'

const STEP_PX = 48

type Props = {
  ansichten: readonly HundredGenerationAnsicht[]
  index: number
  onIndexChange: (next: number) => void
  title: string
}

/**
 * Drehscheibe: Ziehen/Wischen wechselt echte Foto-Ansichten (Vorne → Seite → Hinten).
 * Kein Fake-Mesh – nur brauchbare Ansichten zum Drehen.
 */
export function KeramikDrehscheibe({ ansichten, index, onIndexChange, title }: Props) {
  const safeIdx = Math.min(Math.max(0, index), Math.max(0, ansichten.length - 1))
  const ansicht = ansichten[safeIdx]
  const dragRef = useRef<{ startX: number; lastStep: number; pointerId: number } | null>(null)
  const [dragging, setDragging] = useState(false)

  const stepBy = useCallback(
    (delta: number) => {
      if (ansichten.length < 2) return
      const next = (safeIdx + delta + ansichten.length) % ansichten.length
      onIndexChange(next)
    },
    [ansichten.length, onIndexChange, safeIdx]
  )

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (ansichten.length < 2) return
    if (e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { startX: e.clientX, lastStep: 0, pointerId: e.pointerId }
    setDragging(true)
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = dragRef.current
    if (!d || d.pointerId !== e.pointerId) return
    const dx = e.clientX - d.startX
    const step = Math.trunc(dx / STEP_PX)
    if (step === d.lastStep) return
    const delta = step - d.lastStep
    d.lastStep = step
    // nach rechts ziehen → eher „zurückdrehen“ (vorherige Ansicht)
    stepBy(-delta)
  }

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = dragRef.current
    if (!d || d.pointerId !== e.pointerId) return
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
    dragRef.current = null
    setDragging(false)
  }

  if (!ansicht) return null

  return (
    <div className="hg-drehscheibe">
      <div
        className={`hg-drehscheibe-stage${dragging ? ' is-dragging' : ''}${ansichten.length < 2 ? ' is-single' : ''}`}
        role="img"
        aria-label={`${title} · ${ansicht.label}. ${ansichten.length > 1 ? 'Ziehen zum Drehen.' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <img src={ansicht.src} alt={`${title} · ${ansicht.label}`} draggable={false} />
        {ansichten.length > 1 ? (
          <p className="hg-drehscheibe-hint">
            Ziehen = drehen · {ansicht.label} ({safeIdx + 1}/{ansichten.length})
          </p>
        ) : null}
      </div>
      <div className="hg-drehscheibe-actions">
        {ansichten.length > 1 ? (
          <>
            <button type="button" onClick={() => stepBy(-1)} aria-label="Vorherige Ansicht">
              ‹ zurück
            </button>
            <button type="button" onClick={() => stepBy(1)} aria-label="Nächste Ansicht">
              weiter ›
            </button>
          </>
        ) : null}
        <a href={ansicht.src} target="_blank" rel="noopener noreferrer">
          Groß öffnen
        </a>
      </div>
    </div>
  )
}
