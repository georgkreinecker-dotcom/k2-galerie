/**
 * VK2 Admin (nur Plattform): geführter Rundgang – gleiche Shell wie VK2-Galerie-Leitfaden (Sheet, Markdown, Fokus).
 * Keine App-Logik – nur Anzeige, Fokus auf Hub-Kacheln. Ohne Audio.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { adminTheme } from '../config/theme'
import { beendeGuideFlow } from '../utils/k2GuideFlowStorage'
import {
  HTML_VK2_ADMIN_LEITFADEN_FOCUS_ATTR,
  scrollLeitfadenFocusIntoView,
  setLeitfadenFocusOnDocument,
} from '../utils/familieLeitfadenFocus'
import { renderLeitfadenText } from './guidedLeitfaden/renderLeitfadenMarkdownLite'
import { buildVk2AdminLeitfadenSchritte } from './guidedLeitfaden/vk2AdminLeitfadenSteps'
import { type FamilieLeitfadenPanelBounds } from './FamilieMusterHuberLeitfaden'
import { LS_VK2_ADMIN_LEITFADEN_DONE } from '../utils/vk2AdminLeitfadenStorage'

const VK2_ADMIN_CLAMP_MAX_W = 720
const VK2_ADMIN_CLAMP_MAX_H = 800

/** Etwas großzügiger als der Standard-Leitfaden – VK2-Admin-Rundgang soll präsenter sein. */
function clampVk2AdminBounds(b: FamilieLeitfadenPanelBounds): FamilieLeitfadenPanelBounds {
  if (typeof window === 'undefined') return b
  const maxW = Math.min(VK2_ADMIN_CLAMP_MAX_W, window.innerWidth - 8)
  const maxH = Math.min(window.innerHeight * 0.9, VK2_ADMIN_CLAMP_MAX_H)
  const MIN_W = 280
  const MIN_H = 220
  const width = Math.min(maxW, Math.max(MIN_W, b.width))
  const height = Math.min(maxH, Math.max(MIN_H, b.height))
  const left = Math.min(window.innerWidth - width - 4, Math.max(4, b.left))
  const top = Math.min(window.innerHeight - height - 4, Math.max(4, b.top))
  return { left, top, width, height }
}

const t = adminTheme

const SS_VK2_ADMIN_BOUNDS = 'vk2-admin-leitfaden-bounds'
const SS_VK2_ADMIN_MIN = 'vk2-admin-leitfaden-minimized'

function readBoundsFromSession(): FamilieLeitfadenPanelBounds | null {
  try {
    const raw = sessionStorage.getItem(SS_VK2_ADMIN_BOUNDS)
    if (!raw) return null
    const p = JSON.parse(raw) as Partial<FamilieLeitfadenPanelBounds>
    if (
      typeof p.left !== 'number' ||
      typeof p.top !== 'number' ||
      typeof p.width !== 'number' ||
      typeof p.height !== 'number'
    ) {
      return null
    }
    return clampVk2AdminBounds({ left: p.left, top: p.top, width: p.width, height: p.height })
  } catch {
    return null
  }
}

function writeBoundsToSession(b: FamilieLeitfadenPanelBounds | null) {
  try {
    if (b === null) sessionStorage.removeItem(SS_VK2_ADMIN_BOUNDS)
    else sessionStorage.setItem(SS_VK2_ADMIN_BOUNDS, JSON.stringify(clampVk2AdminBounds(b)))
  } catch {
    /* ignore */
  }
}

const SHEET_STYLE_ID = 'vk2-admin-leitfaden-anim'

function Vk2AdminLeitfadenKeyframes() {
  return (
    <style id={SHEET_STYLE_ID}>{`
      @keyframes vk2AdminLeitfadenBackdropIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes vk2AdminLeitfadenSheetIn {
        from {
          transform: translate3d(0, 110%, 0);
          opacity: 0.85;
        }
        to {
          transform: translate3d(0, 0, 0);
          opacity: 1;
        }
      }
      @keyframes vk2AdminLeitfadenStepCross {
        from { opacity: 0; transform: translate3d(0, 8px, 0); }
        to { opacity: 1; transform: translate3d(0, 0, 0); }
      }
      @keyframes vk2AdminLeitfadenSpotPulse {
        0%, 100% {
          box-shadow: 0 0 0 5px rgba(30, 92, 181, 0.32), 0 10px 36px rgba(192, 86, 42, 0.22);
        }
        50% {
          box-shadow: 0 0 0 10px rgba(30, 92, 181, 0.42), 0 14px 48px rgba(192, 86, 42, 0.3);
        }
      }
      .vk2-admin-leitfaden-backdrop {
        animation: vk2AdminLeitfadenBackdropIn 0.32s ease-out forwards;
      }
      .vk2-admin-leitfaden-sheet {
        animation: vk2AdminLeitfadenSheetIn 0.48s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      }
      .vk2-admin-leitfaden-step-body {
        animation: vk2AdminLeitfadenStepCross 0.28s ease-out forwards;
      }
      html[data-vk2-admin-leitfaden-focus] [data-leitfaden-focus] {
        transition: outline 0.35s ease, box-shadow 0.35s ease;
      }
      html[data-vk2-admin-leitfaden-focus="admin-hub-leiste"] [data-leitfaden-focus="admin-hub-leiste"],
      html[data-vk2-admin-leitfaden-focus="hub-intro"] [data-leitfaden-focus="hub-intro"],
      html[data-vk2-admin-leitfaden-focus="hub-werke"] [data-leitfaden-focus="hub-werke"],
      html[data-vk2-admin-leitfaden-focus="hub-design"] [data-leitfaden-focus="hub-design"],
      html[data-vk2-admin-leitfaden-focus="hub-einstellungen"] [data-leitfaden-focus="hub-einstellungen"],
      html[data-vk2-admin-leitfaden-focus="hub-katalog"] [data-leitfaden-focus="hub-katalog"],
      html[data-vk2-admin-leitfaden-focus="hub-eventplan"] [data-leitfaden-focus="hub-eventplan"],
      html[data-vk2-admin-leitfaden-focus="werke-bereich"] [data-leitfaden-focus="werke-bereich"] {
        position: relative;
        z-index: 25040;
        isolation: isolate;
        outline: 4px solid rgba(192, 86, 42, 0.95);
        outline-offset: 4px;
        border-radius: 12px;
        animation: vk2AdminLeitfadenSpotPulse 2.2s ease-in-out infinite;
      }
      html[data-vk2-admin-leitfaden-focus="admin-hub-leiste"] [data-leitfaden-focus="admin-hub-leiste"] {
        border-radius: 0 0 18px 18px;
      }
    `}</style>
  )
}

type Props = {
  name: string
  onDismiss: () => void
}

export function Vk2AdminLeitfadenModal({ name, onDismiss }: Props) {
  const sheetRef = useRef<HTMLDivElement | null>(null)
  const [schritt, setSchritt] = useState(0)
  const [bounds, setBounds] = useState<FamilieLeitfadenPanelBounds | null>(null)
  const [minimized, setMinimized] = useState(false)
  const dragRef = useRef<{
    kind: 'move' | 'resize'
    startX: number
    startY: number
    startBounds: FamilieLeitfadenPanelBounds
  } | null>(null)

  const schritte = useMemo(() => buildVk2AdminLeitfadenSchritte(name), [name])
  const max = schritte.length - 1
  const istLetzter = schritt >= max
  const total = schritte.length
  const s = schritte[schritt]!

  useEffect(() => {
    beendeGuideFlow()
  }, [])

  useEffect(() => {
    setSchritt(0)
    try {
      setMinimized(sessionStorage.getItem(SS_VK2_ADMIN_MIN) === '1')
    } catch {
      setMinimized(false)
    }
    const saved = readBoundsFromSession()
    setBounds(saved ?? null)
  }, [name])

  useEffect(() => {
    const onResize = () => {
      setBounds((prev) => (prev ? clampVk2AdminBounds(prev) : null))
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const schliessenUndMerken = useCallback(() => {
    try {
      localStorage.setItem(LS_VK2_ADMIN_LEITFADEN_DONE, '1')
    } catch {
      /* ignore */
    }
    setLeitfadenFocusOnDocument(null)
    onDismiss()
  }, [onDismiss])

  const minimize = useCallback(() => {
    setMinimized(true)
    try {
      sessionStorage.setItem(SS_VK2_ADMIN_MIN, '1')
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    if (!minimized) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMinimized(false)
        try {
          sessionStorage.removeItem(SS_VK2_ADMIN_MIN)
        } catch {
          /* ignore */
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [minimized])

  useEffect(() => {
    if (minimized) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') minimize()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [minimized, minimize])

  const restoreFromMinimized = useCallback(() => {
    setMinimized(false)
    try {
      sessionStorage.removeItem(SS_VK2_ADMIN_MIN)
    } catch {
      /* ignore */
    }
  }, [])

  const onHeaderPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return
      const el = sheetRef.current
      if (!el) return
      e.preventDefault()
      const r = el.getBoundingClientRect()
      const startBounds =
        bounds ??
        clampVk2AdminBounds({
          left: r.left,
          top: r.top,
          width: r.width,
          height: r.height,
        })
      if (!bounds) {
        setBounds(startBounds)
        writeBoundsToSession(startBounds)
      }
      dragRef.current = {
        kind: 'move',
        startX: e.clientX,
        startY: e.clientY,
        startBounds,
      }
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    },
    [bounds],
  )

  const onResizePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return
      e.preventDefault()
      e.stopPropagation()
      const el = sheetRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const startBounds =
        bounds ??
        clampVk2AdminBounds({
          left: r.left,
          top: r.top,
          width: r.width,
          height: r.height,
        })
      if (!bounds) {
        setBounds(startBounds)
        writeBoundsToSession(startBounds)
      }
      dragRef.current = {
        kind: 'resize',
        startX: e.clientX,
        startY: e.clientY,
        startBounds,
      }
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    },
    [bounds],
  )

  const onDragPointerMove = useCallback((e: React.PointerEvent) => {
    const d = dragRef.current
    if (!d) return
    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY
    const sb = d.startBounds
    if (d.kind === 'move') {
      setBounds(
        clampVk2AdminBounds({
          left: sb.left + dx,
          top: sb.top + dy,
          width: sb.width,
          height: sb.height,
        }),
      )
    } else {
      setBounds(
        clampVk2AdminBounds({
          left: sb.left,
          top: sb.top,
          width: sb.width + dx,
          height: sb.height + dy,
        }),
      )
    }
  }, [])

  const onDragPointerUp = useCallback((e: React.PointerEvent) => {
    dragRef.current = null
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
    setBounds((prev) => {
      if (!prev) return prev
      const c = clampVk2AdminBounds(prev)
      writeBoundsToSession(c)
      return c
    })
  }, [])

  const nudgeSize = useCallback((delta: number) => {
    setBounds((prev) => {
      const el = sheetRef.current
      const base =
        prev ??
        (el
          ? clampVk2AdminBounds({
              left: el.getBoundingClientRect().left,
              top: el.getBoundingClientRect().top,
              width: el.getBoundingClientRect().width,
              height: el.getBoundingClientRect().height,
            })
          : null)
      if (!base) return prev
      const next = clampVk2AdminBounds({
        ...base,
        width: base.width + delta,
        height: base.height + delta * 0.6,
      })
      writeBoundsToSession(next)
      return next
    })
  }, [])

  const resetPanelLayout = useCallback(() => {
    setBounds(null)
    writeBoundsToSession(null)
  }, [])

  useEffect(() => {
    if (minimized) {
      setLeitfadenFocusOnDocument(null)
      return
    }
    const step = schritte[schritt]
    if (!step) {
      setLeitfadenFocusOnDocument(null)
      return
    }
    setLeitfadenFocusOnDocument(step.focusKey ?? null, HTML_VK2_ADMIN_LEITFADEN_FOCUS_ATTR)
    scrollLeitfadenFocusIntoView(step.focusKey)
    return () => {
      setLeitfadenFocusOnDocument(null)
    }
  }, [minimized, schritt, schritte])

  const sheetBaseStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow:
      '0 -16px 56px rgba(15, 23, 42, 0.38), 0 0 0 2px rgba(192, 86, 42, 0.2), 0 0 0 1px rgba(255, 254, 251, 0.12) inset',
    background: 'linear-gradient(180deg, #fffefb 0%, #faf6f0 100%)',
    border: '1px solid rgba(192, 86, 42, 0.38)',
  }

  const sheetPositionStyle: CSSProperties =
    bounds !== null
      ? {
          position: 'fixed',
          left: bounds.left,
          top: bounds.top,
          width: bounds.width,
          height: bounds.height,
          maxHeight: 'none',
          margin: 0,
          borderRadius: 18,
          zIndex: 25001,
          borderBottom: '1px solid rgba(192, 86, 42, 0.25)',
          ...sheetBaseStyle,
        }
      : {
          position: 'relative',
          width: '100%',
          maxWidth: 'min(100%, 720px)',
          margin: '0 auto',
          maxHeight: 'min(90vh, 820px)',
          minHeight: 'min(42vh, 420px)',
          borderRadius: '24px 24px 0 0',
          borderBottom: 'none',
          zIndex: 25001,
          ...sheetBaseStyle,
        }

  function renderSheetBody() {
    return (
      <>
        <div
          onPointerDown={onHeaderPointerDown}
          onPointerMove={onDragPointerMove}
          onPointerUp={onDragPointerUp}
          onPointerCancel={onDragPointerUp}
          style={{
            flexShrink: 0,
            padding: '10px 1rem 0',
            background: 'linear-gradient(90deg, rgba(30, 92, 181, 0.1) 0%, rgba(255, 248, 240, 0.4) 50%, rgba(192, 86, 42, 0.08) 100%)',
            cursor: 'grab',
            touchAction: 'none',
          }}
        >
          <div
            style={{
              width: 44,
              height: 5,
              borderRadius: 999,
              background: 'rgba(192, 86, 42, 0.4)',
              margin: '0 auto 12px',
            }}
            aria-hidden
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', paddingBottom: '0.65rem', flexWrap: 'wrap' }}>
            <p style={{ margin: 0, fontSize: 'clamp(0.95rem, 3.2vw, 1.05rem)', fontWeight: 800, letterSpacing: '0.04em', color: '#7a3418', fontFamily: t.fontHeading }}>
              VK2 Admin · Rundgang
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }} onPointerDown={(e) => e.stopPropagation()}>
              <button
                type="button"
                title="Kleiner"
                onClick={(e) => {
                  e.stopPropagation()
                  nudgeSize(-32)
                }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: '1px solid rgba(192, 86, 42, 0.35)',
                  background: '#fffefb',
                  color: t.text,
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontSize: '1rem',
                  lineHeight: 1,
                  padding: 0,
                }}
              >
                −
              </button>
              <button
                type="button"
                title="Größer"
                onClick={(e) => {
                  e.stopPropagation()
                  nudgeSize(32)
                }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: '1px solid rgba(192, 86, 42, 0.35)',
                  background: '#fffefb',
                  color: t.text,
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontSize: '1rem',
                  lineHeight: 1,
                  padding: 0,
                }}
              >
                +
              </button>
              {bounds !== null ? (
                <button
                  type="button"
                  title="Wieder unten mittig"
                  onClick={(e) => {
                    e.stopPropagation()
                    resetPanelLayout()
                  }}
                  style={{
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    borderRadius: 8,
                    border: '1px solid rgba(192, 86, 42, 0.28)',
                    background: 'rgba(255, 254, 251, 0.9)',
                    color: t.muted,
                    cursor: 'pointer',
                  }}
                >
                  Unten
                </button>
              ) : null}
              <button
                type="button"
                title="Minimieren"
                onClick={(e) => {
                  e.stopPropagation()
                  minimize()
                }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: '1px solid rgba(192, 86, 42, 0.35)',
                  background: '#fffefb',
                  color: t.muted,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  padding: 0,
                }}
              >
                ▼
              </button>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            padding: '0 1rem 0.75rem',
            justifyContent: 'center',
            background: 'linear-gradient(180deg, rgba(250, 246, 240, 0.98) 0%, #fffefb 100%)',
          }}
          aria-label={`Schritt ${schritt + 1} von ${total}`}
        >
          {schritte.map((st, i) => {
            const aktiv = i === schritt
            const done = i < schritt
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => setSchritt(i)}
                title={`Schritt ${i + 1}: ${st.titel}`}
                style={{
                  width: aktiv ? 28 : 10,
                  height: 10,
                  borderRadius: 999,
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'width 0.25s ease, background 0.2s ease',
                  background: aktiv
                    ? 'linear-gradient(90deg, #c0562a, #a04520)'
                    : done
                      ? 'rgba(192, 86, 42, 0.5)'
                      : 'rgba(92, 86, 80, 0.2)',
                }}
              />
            )
          })}
        </div>

        <p
          style={{
            margin: 0,
            padding: '0 1rem 0.5rem',
            fontSize: '0.68rem',
            color: t.muted,
            lineHeight: 1.35,
          }}
        >
          Der Hintergrund blockiert Klicks nicht – du kannst die Seite dahinter bedienen. Ohne Audio: alles lesen. **Später** oder **▼** minimiert – der Rundgang bleibt in dieser Sitzung unten rechts erreichbar.
        </p>

        <div
          className="vk2-admin-leitfaden-step-body"
          key={schritt}
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '0.25rem 1.15rem 1rem',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <p style={{ margin: '0 0 0.35rem', fontSize: '0.72rem', fontWeight: 700, color: t.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Schritt {schritt + 1} / {total}
          </p>
          <h2
            id="vk2-admin-leitfaden-titel"
            style={{
              margin: '0 0 0.35rem',
              fontSize: 'clamp(1.35rem, 4.2vw, 1.65rem)',
              fontWeight: 800,
              color: t.text,
              fontFamily: t.fontHeading,
              lineHeight: 1.2,
            }}
          >
            {s.titel}
          </h2>
          {s.stimmung ? (
            <p
              style={{
                margin: '0 0 0.75rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#1e5cb5',
                lineHeight: 1.4,
                fontStyle: 'italic',
              }}
            >
              {s.stimmung}
            </p>
          ) : null}
          <div style={{ fontSize: '0.94rem', color: t.text, lineHeight: 1.62 }}>{renderLeitfadenText(s.text)}</div>
        </div>

        <div
          style={{
            flexShrink: 0,
            padding: '0.75rem 1rem calc(0.85rem + env(safe-area-inset-bottom, 0px))',
            borderTop: '1px solid rgba(192, 86, 42, 0.15)',
            background: 'rgba(255, 254, 251, 0.96)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', alignItems: 'center' }}>
            {schritt > 0 ? (
              <button
                type="button"
                onClick={() => setSchritt((n) => n - 1)}
                style={{
                  padding: '0.5rem 0.95rem',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  borderRadius: 999,
                  border: '1px solid rgba(192, 86, 42, 0.35)',
                  background: '#fffefb',
                  color: t.text,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                ← Zurück
              </button>
            ) : null}
            <button
              type="button"
              onClick={minimize}
              style={{
                padding: '0.5rem 0.85rem',
                fontSize: '0.86rem',
                fontWeight: 600,
                borderRadius: 999,
                border: 'none',
                background: 'transparent',
                color: t.muted,
                cursor: 'pointer',
                fontFamily: 'inherit',
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
              }}
            >
              Später
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', justifyContent: 'flex-end' }}>
            {!istLetzter ? (
              <button
                type="button"
                onClick={() => setSchritt((n) => Math.min(max, n + 1))}
                style={{
                  padding: '0.55rem 1.15rem',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  borderRadius: 999,
                  border: 'none',
                  background: 'linear-gradient(90deg, #c0562a, #a04520)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: '0 4px 16px rgba(192, 86, 42, 0.35)',
                }}
              >
                Weiter →
              </button>
            ) : (
              <button
                type="button"
                onClick={schliessenUndMerken}
                style={{
                  padding: '0.55rem 1.15rem',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  borderRadius: 999,
                  border: 'none',
                  background: 'linear-gradient(90deg, #c0562a, #a04520)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: '0 4px 16px rgba(192, 86, 42, 0.35)',
                }}
              >
                Fertig
              </button>
            )}
          </div>
        </div>

        <div
          onPointerDown={onResizePointerDown}
          onPointerMove={onDragPointerMove}
          onPointerUp={onDragPointerUp}
          onPointerCancel={onDragPointerUp}
          role="separator"
          aria-label="Größe ziehen"
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: 28,
            height: 28,
            cursor: 'nwse-resize',
            touchAction: 'none',
            background:
              'linear-gradient(135deg, transparent 52%, rgba(192, 86, 42, 0.22) 52%, rgba(192, 86, 42, 0.45) 100%)',
            borderRadius: '0 0 18px 0',
          }}
        />
      </>
    )
  }

  if (minimized) {
    return (
      <>
        <Vk2AdminLeitfadenKeyframes />
        <button
          type="button"
          className="k2-familie-no-print"
          onClick={restoreFromMinimized}
          style={{
            position: 'fixed',
            right: 'max(12px, env(safe-area-inset-right, 0px))',
            bottom: 'max(12px, env(safe-area-inset-bottom, 0px))',
            zIndex: 25042,
            padding: '0.7rem 1.25rem',
            fontSize: 'clamp(0.92rem, 2.8vw, 1rem)',
            fontWeight: 800,
            borderRadius: 999,
            border: '2px solid rgba(192, 86, 42, 0.55)',
            background: 'linear-gradient(90deg, #fffefb, #f5ebe3)',
            color: '#7a3418',
            cursor: 'pointer',
            fontFamily: t.fontHeading,
            boxShadow: '0 8px 28px rgba(15, 23, 42, 0.28), 0 0 0 1px rgba(30, 92, 181, 0.12)',
          }}
        >
          Admin-Rundgang ▶
        </button>
      </>
    )
  }

  return (
    <>
      <Vk2AdminLeitfadenKeyframes />
      <div
        className="vk2-admin-leitfaden-backdrop"
        role="presentation"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 25000,
          background:
            'linear-gradient(165deg, rgba(28, 26, 24, 0.52) 0%, rgba(30, 92, 181, 0.18) 50%, rgba(15, 23, 42, 0.55) 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'stretch',
          padding: 0,
          fontFamily: t.fontBody,
          pointerEvents: 'none',
        }}
      >
        {bounds === null ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-end',
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          >
            <div
              ref={sheetRef}
              className="vk2-admin-leitfaden-sheet"
              role="dialog"
              aria-modal="true"
              aria-labelledby="vk2-admin-leitfaden-titel"
              style={{ ...sheetPositionStyle, pointerEvents: 'auto' }}
              onClick={(e) => e.stopPropagation()}
            >
              {renderSheetBody()}
            </div>
          </div>
        ) : (
          <div
            ref={sheetRef}
            className="vk2-admin-leitfaden-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="vk2-admin-leitfaden-titel"
            style={{ ...sheetPositionStyle, pointerEvents: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            {renderSheetBody()}
          </div>
        )}
      </div>
    </>
  )

}
