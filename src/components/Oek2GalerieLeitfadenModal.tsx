/**
 * ök2 Demo-Galerie: geführter Rundgang im gleichen Sheet-Muster wie K2 Familie (unten, ziehbar, Schritte mit **Markdown**).
 * Ohne Sprachausgabe / Audio (Sportwagen: gemeinsame Text-Render-Hilfe, eigenes html-Fokus-Attribut).
 */

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { adminTheme } from '../config/theme'
import { beendeGuideFlow } from '../utils/k2GuideFlowStorage'
import {
  HTML_OEK2_LEITFADEN_FOCUS_ATTR,
  scrollLeitfadenFocusIntoView,
  setLeitfadenFocusOnDocument,
} from '../utils/familieLeitfadenFocus'
import { renderLeitfadenText } from './guidedLeitfaden/renderLeitfadenMarkdownLite'
import {
  clampFamilieLeitfadenBounds,
  type FamilieLeitfadenPanelBounds,
} from './FamilieMusterHuberLeitfaden'

const t = adminTheme

const LS_OEK2_LEITFADEN_DONE = 'oek2-galerie-leitfaden-abgeschlossen'
const SS_OEK2_BOUNDS = 'oek2-galerie-leitfaden-bounds'
const SS_OEK2_MIN = 'oek2-galerie-leitfaden-minimized'

const MAX_W_CAP = 560
const MAX_H_VH = 0.88

function readBoundsFromSession(): FamilieLeitfadenPanelBounds | null {
  try {
    const raw = sessionStorage.getItem(SS_OEK2_BOUNDS)
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
    if (b === null) sessionStorage.removeItem(SS_OEK2_BOUNDS)
    else sessionStorage.setItem(SS_OEK2_BOUNDS, JSON.stringify(clampFamilieLeitfadenBounds(b)))
  } catch {
    /* ignore */
  }
}

export type Oek2GalerieLeitfadenStep = {
  id: string
  titel: string
  stimmung?: string
  text: string
  focusKey?: string
}

function buildSchritte(name: string): Oek2GalerieLeitfadenStep[] {
  const n = name.trim() || 'du'
  return [
    {
      id: 'begruessung',
      titel: 'Willkommen',
      stimmung: 'Diese Demo zeigt, wie eine Galerie wirken kann.',
      text:
        `**Schön, dass du da bist, ${n}.**\n\n` +
        'Hier siehst du eine **Muster-Galerie** – erfundene Inhalte, echte Struktur: **Willkommen**, **Künstler:in**, **Werke** in der Vorschau, **Impressum**.\n\n' +
        '**Kein Audio** in diesem Rundgang – du liest in Ruhe. Mit **Weiter** gehst du Schritt für Schritt; **▼** oder **Escape** legt das Fenster nur zusammen.',
    },
    {
      id: 'willkommen',
      titel: 'Erste Seite',
      stimmung: 'Eindruck, Farben, Einladung.',
      text:
        '**Willkommensbereich:** Bild, Titel und Text – so kommen Besucher:innen an.\n\n' +
        'Später legst du **alles im Admin** fest: Texte, Bilder, **Corporate Design** – eine Linie für Web und Druck.',
      focusKey: 'willkommen',
    },
    {
      id: 'kunstschaffende',
      titel: 'Künstler:in',
      stimmung: 'Wer steckt dahinter.',
      text:
        '**Kurzporträt** – wer die Werke macht, mit Vita und Foto.\n\n' +
        'In deiner echten Galerie sind das **deine** Daten – hier nur **Beispiel**.',
      focusKey: 'kunstschaffende',
    },
    {
      id: 'eingang-galerie',
      titel: 'In die Werke',
      stimmung: 'Von der Startseite in die Ausstellung.',
      text:
        '**Tür „In die Galerie“** führt zur **Vorschau** – dort liegen die **Werke** wie bei einer echten Ausstellung.\n\n' +
        'So bekommen Besucher:innen den **Überblick** und können einzelne Stücke öffnen.',
      focusKey: 'eingang-galerie',
    },
    {
      id: 'virtuell',
      titel: 'Virtueller Rundgang',
      stimmung: 'Optional – Bild oder Video.',
      text:
        '**Virtueller Rundgang:** Atelier oder Raum als **Video** oder **Panorama** – einbindbar unter Design → Seitengestaltung.\n\n' +
        'In der Demo kann das leer sein; bei dir wird es **dein** Material.',
      focusKey: 'virtueller-rundgang',
    },
    {
      id: 'admin',
      titel: 'Gestalten',
      stimmung: 'Alles an einem Ort.',
      text:
        '**Admin** ist die **Zentrale**: Werke, Texte, Design, Kassa, Events – **ohne** Programmierkenntnisse.\n\n' +
        'Oben findest du den Einstieg **„Mit mir in den Admin“** (wenn du von hier aus startest).',
      focusKey: 'admin-hinweis',
    },
    {
      id: 'impressum',
      titel: 'Kontakt & Abschluss',
      stimmung: 'Vertrauen nach außen.',
      text:
        '**Impressum** mit Adresse und Kontakt – so bleibt es **seriös** und **rechtskonform**.\n\n' +
        'Unten folgt noch ein kurzer **Schluss** – dann kannst du die Seite in Ruhe erkunden.',
      focusKey: 'impressum',
    },
    {
      id: 'fertig',
      titel: 'Viel Spaß beim Umschauen',
      stimmung: 'Kein Druck.',
      text:
        '**Das war der Kurz-Rundgang.** Du kannst die Demo **jederzeit** wieder aufrufen.\n\n' +
        'Wenn du **deine eigene Galerie** anlegst, liegen **deine** Daten bei **dir** – nach Lizenz und Einrichtung.',
    },
  ]
}

const SHEET_STYLE_ID = 'oek2-galerie-leitfaden-anim'

function Oek2LeitfadenKeyframes() {
  return (
    <style id={SHEET_STYLE_ID}>{`
      @keyframes oek2LeitfadenBackdropIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes oek2LeitfadenSheetIn {
        from {
          transform: translate3d(0, 110%, 0);
          opacity: 0.85;
        }
        to {
          transform: translate3d(0, 0, 0);
          opacity: 1;
        }
      }
      @keyframes oek2LeitfadenStepCross {
        from { opacity: 0; transform: translate3d(0, 8px, 0); }
        to { opacity: 1; transform: translate3d(0, 0, 0); }
      }
      .oek2-galerie-leitfaden-backdrop {
        animation: oek2LeitfadenBackdropIn 0.32s ease-out forwards;
      }
      .oek2-galerie-leitfaden-sheet {
        animation: oek2LeitfadenSheetIn 0.48s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      }
      .oek2-galerie-leitfaden-step-body {
        animation: oek2LeitfadenStepCross 0.28s ease-out forwards;
      }
      html[data-oek2-leitfaden-focus] [data-leitfaden-focus] {
        transition: outline 0.35s ease, box-shadow 0.35s ease;
      }
      html[data-oek2-leitfaden-focus="willkommen"] [data-leitfaden-focus="willkommen"],
      html[data-oek2-leitfaden-focus="kunstschaffende"] [data-leitfaden-focus="kunstschaffende"],
      html[data-oek2-leitfaden-focus="eingang-galerie"] [data-leitfaden-focus="eingang-galerie"],
      html[data-oek2-leitfaden-focus="virtueller-rundgang"] [data-leitfaden-focus="virtueller-rundgang"],
      html[data-oek2-leitfaden-focus="admin-hinweis"] [data-leitfaden-focus="admin-hinweis"],
      html[data-oek2-leitfaden-focus="impressum"] [data-leitfaden-focus="impressum"] {
        outline: 3px solid rgba(107, 144, 128, 0.92);
        outline-offset: 3px;
        border-radius: 12px;
        box-shadow: 0 0 0 4px rgba(107, 144, 128, 0.14);
      }
    `}</style>
  )
}

type Props = {
  name: string
  onDismiss: () => void
}

export function Oek2GalerieLeitfadenModal({ name, onDismiss }: Props) {
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

  const schritte = useMemo(() => buildSchritte(name), [name])
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
      setMinimized(sessionStorage.getItem(SS_OEK2_MIN) === '1')
    } catch {
      setMinimized(false)
    }
    const saved = readBoundsFromSession()
    setBounds(saved ?? null)
  }, [name])

  useEffect(() => {
    const onResize = () => {
      setBounds((prev) => (prev ? clampFamilieLeitfadenBounds(prev) : null))
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const schliessenUndMerken = useCallback(() => {
    try {
      localStorage.setItem(LS_OEK2_LEITFADEN_DONE, '1')
    } catch {
      /* ignore */
    }
    setLeitfadenFocusOnDocument(null)
    onDismiss()
  }, [onDismiss])

  const minimize = useCallback(() => {
    setMinimized(true)
    try {
      sessionStorage.setItem(SS_OEK2_MIN, '1')
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
          sessionStorage.removeItem(SS_OEK2_MIN)
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
      sessionStorage.removeItem(SS_OEK2_MIN)
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
    setLeitfadenFocusOnDocument(step.focusKey ?? null, HTML_OEK2_LEITFADEN_FOCUS_ATTR)
    scrollLeitfadenFocusIntoView(step.focusKey)
    return () => {
      setLeitfadenFocusOnDocument(null)
    }
  }, [minimized, schritt, schritte])

  const sheetBaseStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 -12px 48px rgba(15, 23, 42, 0.28), 0 0 0 1px rgba(255, 254, 251, 0.12) inset',
    background: 'linear-gradient(180deg, #fffefb 0%, #faf6f0 100%)',
    border: '1px solid rgba(107, 144, 128, 0.28)',
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
          borderBottom: '1px solid rgba(107, 144, 128, 0.25)',
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
            background: 'linear-gradient(90deg, rgba(107, 144, 128, 0.14) 0%, rgba(255, 248, 240, 0.35) 50%, rgba(94, 234, 212, 0.1) 100%)',
            cursor: 'grab',
            touchAction: 'none',
          }}
        >
          <div
            style={{
              width: 44,
              height: 5,
              borderRadius: 999,
              background: 'rgba(107, 144, 128, 0.4)',
              margin: '0 auto 12px',
            }}
            aria-hidden
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', paddingBottom: '0.65rem', flexWrap: 'wrap' }}>
            <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.04em', color: '#3d5c4a', fontFamily: t.fontHeading }}>
              Muster-Galerie · Rundgang
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
                  border: '1px solid rgba(107, 144, 128, 0.35)',
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
                  border: '1px solid rgba(107, 144, 128, 0.35)',
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
                    border: '1px solid rgba(107, 144, 128, 0.28)',
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
                  border: '1px solid rgba(107, 144, 128, 0.35)',
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
                    ? 'linear-gradient(90deg, #5a7a6a, #6b9080)'
                    : done
                      ? 'rgba(107, 144, 128, 0.5)'
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
          Der Hintergrund blockiert Klicks nicht – du kannst die Seite dahinter bedienen. Ohne Audio: alles lesen. Zusammenklappen:{' '}
          <strong style={{ color: t.text }}>▼</strong>.
        </p>

        <div
          className="oek2-galerie-leitfaden-step-body"
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
            id="oek2-galerie-leitfaden-titel"
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
                color: '#4a6b58',
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
            borderTop: '1px solid rgba(107, 144, 128, 0.15)',
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
                  border: '1px solid rgba(107, 144, 128, 0.35)',
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
              onClick={schliessenUndMerken}
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
                  background: 'linear-gradient(90deg, #5a7a6a, #6b9080)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: '0 4px 16px rgba(90, 122, 106, 0.35)',
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
                  background: 'linear-gradient(90deg, #5a7a6a, #6b9080)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: '0 4px 16px rgba(90, 122, 106, 0.35)',
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
              'linear-gradient(135deg, transparent 52%, rgba(107, 144, 128, 0.22) 52%, rgba(107, 144, 128, 0.45) 100%)',
            borderRadius: '0 0 18px 0',
          }}
        />
      </>
    )
  }

  if (minimized) {
    return (
      <>
        <Oek2LeitfadenKeyframes />
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
            border: '1px solid rgba(107, 144, 128, 0.45)',
            background: 'linear-gradient(90deg, #fffefb, #faf6f0)',
            color: '#3d5c4a',
            cursor: 'pointer',
            fontFamily: t.fontHeading,
            boxShadow: '0 6px 24px rgba(15, 23, 42, 0.2)',
          }}
        >
          Demo-Rundgang ök2 ▶
        </button>
      </>
    )
  }

  return (
    <>
      <Oek2LeitfadenKeyframes />
      <div
        className="oek2-galerie-leitfaden-backdrop"
        role="presentation"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 25000,
          background:
            'linear-gradient(165deg, rgba(28, 26, 24, 0.42) 0%, rgba(107, 144, 128, 0.2) 55%, rgba(15, 23, 42, 0.48) 100%)',
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
              className="oek2-galerie-leitfaden-sheet"
              role="dialog"
              aria-modal="true"
              aria-labelledby="oek2-galerie-leitfaden-titel"
              style={{ ...sheetPositionStyle, pointerEvents: 'auto' }}
              onClick={(e) => e.stopPropagation()}
            >
              {renderSheetBody()}
            </div>
          </div>
        ) : (
          <div
            ref={sheetRef}
            className="oek2-galerie-leitfaden-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="oek2-galerie-leitfaden-titel"
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
