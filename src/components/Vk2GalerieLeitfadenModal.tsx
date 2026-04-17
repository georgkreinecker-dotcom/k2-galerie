/**
 * VK2 Vereinsgalerie (nur Plattform): geführter Rundgang wie ök2-Sheet (unten, ziehbar, **Markdown**).
 * Keine App-Logik – nur Anzeige, Fokus-Highlights, lokale Keys. Ohne Audio.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { adminTheme } from '../config/theme'
import { beendeGuideFlow } from '../utils/k2GuideFlowStorage'
import {
  HTML_VK2_ADMIN_LEITFADEN_FOCUS_ATTR,
  HTML_VK2_LEITFADEN_FOCUS_ATTR,
  scrollLeitfadenFocusIntoView,
  setLeitfadenFocusOnDocument,
} from '../utils/familieLeitfadenFocus'
import {
  EVENT_VK2_PLATFORM_RUNDGANG,
  SS_VK2_GALERIE_LEITFADEN_MINIMIZED,
  setVk2PlatformLeitfadenCompleted,
} from '../utils/vk2PlatformLeitfadenStorage'
import { renderLeitfadenText } from './guidedLeitfaden/renderLeitfadenMarkdownLite'
import { type Vk2PlatformLeitfadenStep } from './guidedLeitfaden/vk2PlatformLeitfadenSteps'
import { buildVk2GalerieLeitfadenSchritte } from './guidedLeitfaden/vk2GalerieLeitfadenSteps'
import {
  clampFamilieLeitfadenBounds,
  type FamilieLeitfadenPanelBounds,
} from './FamilieMusterHuberLeitfaden'

const t = adminTheme

export const LS_VK2_GALERIE_LEITFADEN_DONE = 'vk2-galerie-leitfaden-abgeschlossen'
/** @internal – gleicher Key wie Export */
const LS_VK2_LEITFADEN_DONE = LS_VK2_GALERIE_LEITFADEN_DONE

export function hasVk2GalerieLeitfadenCompleted(): boolean {
  try {
    return localStorage.getItem(LS_VK2_GALERIE_LEITFADEN_DONE) === '1'
  } catch {
    return false
  }
}
const SS_VK2_BOUNDS = 'vk2-galerie-leitfaden-bounds'

const MAX_W_CAP = 560
const MAX_H_VH = 0.88

function readBoundsFromSession(): FamilieLeitfadenPanelBounds | null {
  try {
    const raw = sessionStorage.getItem(SS_VK2_BOUNDS)
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
    return clampFamilieLeitfadenBounds({ left: p.left, top: p.top, width: p.width, height: p.height })
  } catch {
    return null
  }
}

function writeBoundsToSession(b: FamilieLeitfadenPanelBounds | null) {
  try {
    if (b === null) sessionStorage.removeItem(SS_VK2_BOUNDS)
    else sessionStorage.setItem(SS_VK2_BOUNDS, JSON.stringify(clampFamilieLeitfadenBounds(b)))
  } catch {
    /* ignore */
  }
}

const SHEET_STYLE_ID = 'vk2-galerie-leitfaden-anim'
const ADMIN_SHEET_STYLE_ID = 'vk2-platform-admin-leitfaden-anim'

/** Admin-Hub-Fokus-Styles – für durchgängigen Plattform-Rundgang neben Galerie-Styles */
function Vk2PlatformAdminLeitfadenKeyframes() {
  return (
    <style id={ADMIN_SHEET_STYLE_ID}>{`
      @keyframes vk2AdminLeitfadenSpotPulse {
        0%, 100% {
          box-shadow: 0 0 0 5px rgba(30, 92, 181, 0.32), 0 10px 36px rgba(192, 86, 42, 0.22);
        }
        50% {
          box-shadow: 0 0 0 10px rgba(30, 92, 181, 0.42), 0 14px 48px rgba(192, 86, 42, 0.3);
        }
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

function Vk2LeitfadenKeyframes() {
  return (
    <style id={SHEET_STYLE_ID}>{`
      @keyframes vk2LeitfadenBackdropIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes vk2LeitfadenSheetIn {
        from {
          transform: translate3d(0, 110%, 0);
          opacity: 0.85;
        }
        to {
          transform: translate3d(0, 0, 0);
          opacity: 1;
        }
      }
      @keyframes vk2LeitfadenStepCross {
        from { opacity: 0; transform: translate3d(0, 8px, 0); }
        to { opacity: 1; transform: translate3d(0, 0, 0); }
      }
      .vk2-galerie-leitfaden-backdrop {
        animation: vk2LeitfadenBackdropIn 0.32s ease-out forwards;
      }
      .vk2-galerie-leitfaden-sheet {
        animation: vk2LeitfadenSheetIn 0.48s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      }
      .vk2-galerie-leitfaden-step-body {
        animation: vk2LeitfadenStepCross 0.28s ease-out forwards;
      }
      html[data-vk2-leitfaden-focus] [data-leitfaden-focus] {
        transition: outline 0.35s ease, box-shadow 0.35s ease;
      }
      html[data-vk2-leitfaden-focus="willkommen"] [data-leitfaden-focus="willkommen"],
      html[data-vk2-leitfaden-focus="eingangskarten"] [data-leitfaden-focus="eingangskarten"],
      html[data-vk2-leitfaden-focus="gemeinschaft"] [data-leitfaden-focus="gemeinschaft"],
      html[data-vk2-leitfaden-focus="admin-hinweis"] [data-leitfaden-focus="admin-hinweis"],
      html[data-vk2-leitfaden-focus="impressum"] [data-leitfaden-focus="impressum"] {
        outline: 3px solid rgba(192, 86, 42, 0.92);
        outline-offset: 3px;
        border-radius: 12px;
        box-shadow: 0 0 0 4px rgba(30, 92, 181, 0.12);
      }
    `}</style>
  )
}

type Props = {
  name: string
  onDismiss: () => void
  /** Durchgängiger VK2-Plattform-Rundgang (Galerie + Admin): gesteuerte Schritte, eine Quelle „Fertig“ */
  platform?: {
    schritte: Vk2PlatformLeitfadenStep[]
    schritt: number
    onSchrittChange: (i: number) => void
  }
}

export function Vk2GalerieLeitfadenModal({ name, onDismiss, platform }: Props) {
  const sheetRef = useRef<HTMLDivElement | null>(null)
  const [schrittInternal, setSchrittInternal] = useState(0)
  const schritt = platform ? platform.schritt : schrittInternal
  const setSchritt = platform ? platform.onSchrittChange : setSchrittInternal
  const [bounds, setBounds] = useState<FamilieLeitfadenPanelBounds | null>(null)
  const [minimized, setMinimized] = useState(false)
  const dragRef = useRef<{
    kind: 'move' | 'resize'
    startX: number
    startY: number
    startBounds: FamilieLeitfadenPanelBounds
  } | null>(null)

  const schritte = useMemo(
    () => (platform ? platform.schritte : buildVk2GalerieLeitfadenSchritte(name)),
    [name, platform],
  )
  const max = schritte.length - 1
  const istLetzter = schritt >= max
  const total = schritte.length
  const s = schritte[schritt]!

  useEffect(() => {
    beendeGuideFlow()
  }, [])

  /**
   * Bounds + Schritt: bei jeder relevanten Änderung.
   * Minimiert: bei reinem VK2-Galerie-Leitfaden aus sessionStorage.
   * Plattform-Rundgang: Minimiert **nicht** bei jedem neuen `platform`-Objekt-Referenz neu aus sessionStorage lesen –
   * sonst überschreibt ein Host-Re-Render den geleerten Zustand nach VK2-Einstieg wieder mit „minimiert“.
   */
  useEffect(() => {
    if (!platform) {
      setSchrittInternal(0)
      try {
        setMinimized(sessionStorage.getItem(SS_VK2_GALERIE_LEITFADEN_MINIMIZED) === '1')
      } catch {
        setMinimized(false)
      }
    }
    const saved = readBoundsFromSession()
    setBounds(saved ?? null)
  }, [name, platform])

  useEffect(() => {
    if (!platform) return
    try {
      setMinimized(sessionStorage.getItem(SS_VK2_GALERIE_LEITFADEN_MINIMIZED) === '1')
    } catch {
      setMinimized(false)
    }
  }, [name])

  useEffect(() => {
    const onResize = () => {
      setBounds((prev) => (prev ? clampFamilieLeitfadenBounds(prev) : null))
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (!platform) return
    const onRundgang = () => {
      try {
        sessionStorage.removeItem(SS_VK2_GALERIE_LEITFADEN_MINIMIZED)
      } catch {
        /* ignore */
      }
      setMinimized(false)
    }
    window.addEventListener(EVENT_VK2_PLATFORM_RUNDGANG, onRundgang)
    return () => window.removeEventListener(EVENT_VK2_PLATFORM_RUNDGANG, onRundgang)
  }, [platform])

  /** Plattform-Rundgang: Fenster ausblenden, Fokus löschen – ohne „Fertig“/Abgeschlossen zu setzen. */
  const schliessenPlattformNurAusblenden = useCallback(() => {
    setLeitfadenFocusOnDocument(null)
    onDismiss()
  }, [onDismiss])

  const schliessenUndMerken = useCallback(() => {
    if (platform) {
      setVk2PlatformLeitfadenCompleted(true)
      setLeitfadenFocusOnDocument(null)
      onDismiss()
      return
    }
    try {
      localStorage.setItem(LS_VK2_LEITFADEN_DONE, '1')
    } catch {
      /* ignore */
    }
    setLeitfadenFocusOnDocument(null)
    onDismiss()
  }, [onDismiss, platform])

  const minimize = useCallback(() => {
    setMinimized(true)
    try {
      sessionStorage.setItem(SS_VK2_GALERIE_LEITFADEN_MINIMIZED, '1')
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
          sessionStorage.removeItem(SS_VK2_GALERIE_LEITFADEN_MINIMIZED)
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
      if (e.key !== 'Escape') return
      if (platform) {
        schliessenPlattformNurAusblenden()
        return
      }
      minimize()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [minimized, minimize, platform, schliessenPlattformNurAusblenden])

  const restoreFromMinimized = useCallback(() => {
    setMinimized(false)
    try {
      sessionStorage.removeItem(SS_VK2_GALERIE_LEITFADEN_MINIMIZED)
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
        clampFamilieLeitfadenBounds({
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
        clampFamilieLeitfadenBounds({
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
        clampFamilieLeitfadenBounds({
          left: sb.left + dx,
          top: sb.top + dy,
          width: sb.width,
          height: sb.height,
        }),
      )
    } else {
      setBounds(
        clampFamilieLeitfadenBounds({
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
      const c = clampFamilieLeitfadenBounds(prev)
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
          ? clampFamilieLeitfadenBounds({
              left: el.getBoundingClientRect().left,
              top: el.getBoundingClientRect().top,
              width: el.getBoundingClientRect().width,
              height: el.getBoundingClientRect().height,
            })
          : null)
      if (!base) return prev
      const next = clampFamilieLeitfadenBounds({
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
    const htmlAttr =
      platform && 'phase' in step && step.phase === 'admin'
        ? HTML_VK2_ADMIN_LEITFADEN_FOCUS_ATTR
        : HTML_VK2_LEITFADEN_FOCUS_ATTR
    setLeitfadenFocusOnDocument(step.focusKey ?? null, htmlAttr)
    // Galerie-Phase: oben ansetzen – sonst bleibt der Hero „Willkommen“ oft unter dem unteren Sheet unsichtbar (block: nearest)
    const galerieOben =
      platform && 'phase' in step && step.phase === 'galerie'
        ? ({ behavior: 'smooth' as const, block: 'start' as const, inline: 'nearest' as const })
        : undefined
    scrollLeitfadenFocusIntoView(step.focusKey, galerieOben)
    return () => {
      setLeitfadenFocusOnDocument(null)
    }
  }, [minimized, schritt, schritte, platform])

  useEffect(() => {
    if (!platform || minimized) return
    let hoverTimer: ReturnType<typeof setTimeout> | null = null
    const findIndexForFocusKey = (key: string | null | undefined) => {
      if (!key) return -1
      return schritte.findIndex((st) => st.focusKey === key)
    }
    const applyFromPointer = (e: Event, immediate: boolean) => {
      const t = e.target as HTMLElement | null
      if (!t?.closest) return
      // Links: keinen Schritt per Hover/Klick überschreiben – sonst kollidiert es mit der Navigation zur Galerie
      if (t.closest('a[href]')) return
      const el = t.closest('[data-leitfaden-focus]') as HTMLElement | null
      const key = el?.getAttribute('data-leitfaden-focus') ?? null
      const idx = findIndexForFocusKey(key)
      if (idx < 0 || idx === schritt) return
      const step = schritte[idx]
      if (!step || !('phase' in step)) return
      if (immediate) {
        if (hoverTimer) clearTimeout(hoverTimer)
        platform.onSchrittChange(idx)
        return
      }
      if (hoverTimer) clearTimeout(hoverTimer)
      hoverTimer = setTimeout(() => platform.onSchrittChange(idx), 200)
    }
    const onPointerOver = (e: Event) => applyFromPointer(e, false)
    const onClick = (e: Event) => applyFromPointer(e, true)
    document.addEventListener('pointerover', onPointerOver, true)
    document.addEventListener('click', onClick, true)
    return () => {
      if (hoverTimer) clearTimeout(hoverTimer)
      document.removeEventListener('pointerover', onPointerOver, true)
      document.removeEventListener('click', onClick, true)
    }
  }, [platform, minimized, schritte, schritt])

  const sheetBaseStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 -12px 48px rgba(15, 23, 42, 0.28), 0 0 0 1px rgba(255, 254, 251, 0.12) inset',
    background: 'linear-gradient(180deg, #fffefb 0%, #faf6f0 100%)',
    border: '1px solid rgba(192, 86, 42, 0.28)',
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
          maxWidth: 'min(100%, 560px)',
          margin: '0 auto',
          maxHeight: 'min(88vh, 720px)',
          borderRadius: '22px 22px 0 0',
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
            <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.04em', color: '#7a3418', fontFamily: t.fontHeading }}>
              {platform ? 'VK2 Plattform · Rundgang' : 'Vereinsgalerie · Rundgang'}
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
          {platform ? (
            <>
              Der Hintergrund blockiert Klicks nicht.{' '}
              <strong style={{ color: t.text }}>Schließen</strong> beendet den Rundgang;{' '}
              <strong style={{ color: t.text }}>▼</strong> klappt nur zu. Ohne Audio.
            </>
          ) : (
            <>
              Der Hintergrund blockiert Klicks nicht – du kannst die Seite dahinter bedienen. Ohne Audio: alles lesen. Zusammenklappen:{' '}
              <strong style={{ color: t.text }}>▼</strong>.
            </>
          )}
        </p>

        <div
          className="vk2-galerie-leitfaden-step-body"
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
            id="vk2-galerie-leitfaden-titel"
            style={{
              margin: '0 0 0.35rem',
              fontSize: 'clamp(1.2rem, 4vw, 1.45rem)',
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
                onClick={() => setSchritt(schritt - 1)}
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
              onClick={platform ? schliessenPlattformNurAusblenden : minimize}
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
              {platform ? 'Schließen' : 'Später'}
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', justifyContent: 'flex-end' }}>
            {!istLetzter ? (
              <button
                type="button"
                onClick={() => setSchritt(Math.min(max, schritt + 1))}
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
        <Vk2LeitfadenKeyframes />
        {platform ? <Vk2PlatformAdminLeitfadenKeyframes /> : null}
        <button
          type="button"
          className="k2-familie-no-print"
          onClick={restoreFromMinimized}
          style={{
            position: 'fixed',
            right: 'max(12px, env(safe-area-inset-right, 0px))',
            bottom: 'max(12px, env(safe-area-inset-bottom, 0px))',
            zIndex: 25002,
            padding: '0.55rem 1rem',
            fontSize: '0.88rem',
            fontWeight: 800,
            borderRadius: 999,
            border: '1px solid rgba(192, 86, 42, 0.45)',
            background: 'linear-gradient(90deg, #fffefb, #faf8f5)',
            color: '#7a3418',
            cursor: 'pointer',
            fontFamily: t.fontHeading,
            boxShadow: '0 6px 24px rgba(15, 23, 42, 0.2)',
          }}
        >
          Rundgang VK2 ▶
        </button>
      </>
    )
  }

  return (
    <>
      <Vk2LeitfadenKeyframes />
      {platform ? <Vk2PlatformAdminLeitfadenKeyframes /> : null}
      <div
        className="vk2-galerie-leitfaden-backdrop"
        role="presentation"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 25000,
          background:
            'linear-gradient(165deg, rgba(28, 26, 24, 0.38) 0%, rgba(30, 92, 181, 0.12) 50%, rgba(15, 23, 42, 0.45) 100%)',
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
              className="vk2-galerie-leitfaden-sheet"
              role="dialog"
              aria-modal="true"
              aria-labelledby="vk2-galerie-leitfaden-titel"
              style={{ ...sheetPositionStyle, pointerEvents: 'auto' }}
              onClick={(e) => e.stopPropagation()}
            >
              {renderSheetBody()}
            </div>
          </div>
        ) : (
          <div
            ref={sheetRef}
            className="vk2-galerie-leitfaden-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="vk2-galerie-leitfaden-titel"
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
