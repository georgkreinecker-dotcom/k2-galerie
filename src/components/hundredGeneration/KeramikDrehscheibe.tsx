import {
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import type { HundredGenerationAnsicht } from '../../config/hundredGenerationEntwuerfe'

const STEP_PX = 36

export type KeramikDrehscheibeTrailing = {
  label: string
  render: () => ReactNode
}

type Props = {
  ansichten: readonly HundredGenerationAnsicht[]
  index: number
  onIndexChange: (next: number) => void
  title: string
  /** Optional: z. B. Maßskizze als letzte Ansicht im Ring */
  trailingSlot?: KeramikDrehscheibeTrailing
}

/**
 * Modell drehen/schwenken = durch echte Foto-Ansichten blättern.
 * Optional trailingSlot (Maßskizze) als letzte Ansicht.
 * Eine Quelle: parent `index`. idxRef verhindert Stale-Index beim Ziehen.
 */
export function KeramikDrehscheibe({
  ansichten,
  index,
  onIndexChange,
  title,
  trailingSlot,
}: Props) {
  const fotoN = ansichten.length
  const total = fotoN + (trailingSlot ? 1 : 0)
  const safeIdx = total === 0 ? 0 : ((index % total) + total) % total
  const isTrailing = Boolean(trailingSlot) && safeIdx === fotoN
  const ansicht = isTrailing ? null : ansichten[safeIdx]
  const label = isTrailing ? trailingSlot!.label : (ansicht?.label ?? '')
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
    if (total < 2) return
    const wrapped = ((next % total) + total) % total
    idxRef.current = wrapped
    onIndexChange(wrapped)
  }

  const step = (delta: number) => go(idxRef.current + delta)

  const schwenkIdx = ansichten.findIndex((a) => a.achse === 'schwenk')
  const ringIdx = ansichten.findIndex((a) => a.achse === 'ring')

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (total < 2 || e.button !== 0 || isTrailing) return
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

    if (schwenkIdx >= 0 && !isTrailing) {
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

  if (total === 0) return null
  if (!isTrailing && !ansicht) return null

  return (
    <div className="hg-drehscheibe">
      <div
        className={`hg-drehscheibe-stage${dragging ? ' is-dragging' : ''}${total < 2 ? ' is-single' : ''}${isTrailing ? ' is-mass' : ''}`}
        role="group"
        aria-label={
          isTrailing
            ? `${title} · ${label}`
            : `${title} · ${label}. Ziehen zum Drehen.`
        }
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {isTrailing ? (
          <div className="hg-drehscheibe-mass">{trailingSlot!.render()}</div>
        ) : (
          <img
            key={ansicht!.src}
            src={ansicht!.src}
            alt={`${title} · ${label}`}
            draggable={false}
          />
        )}
        {total > 1 ? (
          <p className="hg-drehscheibe-hint">
            {isTrailing ? 'Buttons · ' : 'Ziehen oder Buttons · '}
            {label} ({safeIdx + 1}/{total})
          </p>
        ) : null}
      </div>
      <div className="hg-drehscheibe-actions">
        {total > 1 ? (
          <>
            <button type="button" onClick={() => step(-1)} aria-label="Vorherige Ansicht">
              ‹ zurück
            </button>
            <button type="button" onClick={() => step(1)} aria-label="Nächste Ansicht">
              weiter ›
            </button>
          </>
        ) : null}
        {schwenkIdx >= 0 && !isTrailing ? (
          <button
            type="button"
            className={safeIdx === schwenkIdx ? 'is-on' : undefined}
            onClick={() => go(safeIdx === schwenkIdx ? (ringIdx >= 0 ? ringIdx : 0) : schwenkIdx)}
          >
            {safeIdx === schwenkIdx ? '↓ von vorn' : '↑ schräg oben'}
          </button>
        ) : null}
        {trailingSlot ? (
          <button
            type="button"
            className={isTrailing ? 'is-on' : undefined}
            onClick={() => go(isTrailing ? (ringIdx >= 0 ? ringIdx : 0) : fotoN)}
          >
            {isTrailing ? '↓ Fotos' : `📐 ${trailingSlot.label}`}
          </button>
        ) : null}
        {!isTrailing && ansicht ? (
          <a href={ansicht.src} target="_blank" rel="noopener noreferrer">
            Groß öffnen
          </a>
        ) : null}
      </div>
    </div>
  )
}
