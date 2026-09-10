import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import type { HundredGenerationAnsicht } from '../../config/hundredGenerationEntwuerfe'

const STEP_PX = 36

type Props = {
  ansichten: readonly HundredGenerationAnsicht[]
  index: number
  onIndexChange: (next: number) => void
  title: string
}

/**
 * Modell drehen/schwenken = durch echte Foto-Ansichten blättern.
 * Eine Quelle: parent `index`. idxRef verhindert Stale-Index beim Ziehen.
 */
export function KeramikDrehscheibe({ ansichten, index, onIndexChange, title }: Props) {
  const n = ansichten.length
  const safeIdx = n === 0 ? 0 : ((index % n) + n) % n
  const ansicht = ansichten[safeIdx]
  const idxRef = useRef(safeIdx)
  idxRef.current = safeIdx

  const dragRef = useRef<{
    pointerId: number
    startX: number
    startY: number
    lastStepX: number
    lastStepY: number
  } | null>(null)
  const [dragging, setDragging] = useState(false)

  const go = (next: number) => {
    if (n < 2) return
    const wrapped = ((next % n) + n) % n
    idxRef.current = wrapped
    onIndexChange(wrapped)
  }

  const step = (delta: number) => go(idxRef.current + delta)

  const schwenkIdx = ansichten.findIndex((a) => a.achse === 'schwenk')
  const ringIdx = ansichten.findIndex((a) => a.achse === 'ring')

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (n < 2 || e.button !== 0) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      lastStepX: 0,
      lastStepY: 0,
    }
    setDragging(true)
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = dragRef.current
    if (!d || d.pointerId !== e.pointerId) return
    e.preventDefault()
    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY

    const stepX = Math.trunc(dx / STEP_PX)
    if (stepX !== d.lastStepX) {
      const delta = stepX - d.lastStepX
      d.lastStepX = stepX
      step(-delta)
    }

    if (schwenkIdx >= 0) {
      const stepY = Math.trunc(-dy / (STEP_PX + 10))
      if (stepY !== d.lastStepY) {
        d.lastStepY = stepY
        if (stepY >= 1) go(schwenkIdx)
        else if (stepY <= -1) go(ringIdx >= 0 ? ringIdx : 0)
      }
    }
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
        className={`hg-drehscheibe-stage${dragging ? ' is-dragging' : ''}${n < 2 ? ' is-single' : ''}`}
        role="group"
        aria-label={`${title} · ${ansicht.label}. Ziehen zum Drehen.`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <img
          key={ansicht.src}
          src={ansicht.src}
          alt={`${title} · ${ansicht.label}`}
          draggable={false}
        />
        {n > 1 ? (
          <p className="hg-drehscheibe-hint">
            Ziehen oder Buttons · {ansicht.label} ({safeIdx + 1}/{n})
          </p>
        ) : null}
      </div>
      <div className="hg-drehscheibe-actions">
        {n > 1 ? (
          <>
            <button type="button" onClick={() => step(-1)} aria-label="Vorherige Ansicht">
              ‹ zurück
            </button>
            <button type="button" onClick={() => step(1)} aria-label="Nächste Ansicht">
              weiter ›
            </button>
          </>
        ) : null}
        {schwenkIdx >= 0 ? (
          <button
            type="button"
            className={safeIdx === schwenkIdx ? 'is-on' : undefined}
            onClick={() => go(safeIdx === schwenkIdx ? (ringIdx >= 0 ? ringIdx : 0) : schwenkIdx)}
          >
            {safeIdx === schwenkIdx ? '↓ von vorn' : '↑ schräg oben'}
          </button>
        ) : null}
        <a href={ansicht.src} target="_blank" rel="noopener noreferrer">
          Groß öffnen
        </a>
      </div>
    </div>
  )
}
