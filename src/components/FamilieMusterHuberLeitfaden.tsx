/**
 * Musterfamilie Huber: geführter Rundgang durch die Demo – warm, von unten, mit Schwung (kein totes Zentrier-Modal).
 * Verschiebbar, in der Größe änderbar, minimierbar (Bounds in sessionStorage).
 */

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { adminTheme } from '../config/theme'
import { PROJECT_ROUTES } from '../config/navigation'
import { isK2FamilieMeineFamilieHomePath, K2_FAMILIE_APP_SHORT_PATH } from '../utils/k2FamiliePwaBranding'
import { scrollLeitfadenFocusIntoView, setLeitfadenFocusOnDocument } from '../utils/familieLeitfadenFocus'
import { K2_FAMILIE_NAV_LABEL_GESCHICHTE } from '../config/k2FamilieNavLabels'
import { isK2FamilieApfLocalhost } from '../config/k2FamilieApfDefaults'
import { useFamilieMusterDemoHint } from '../context/FamilieMusterDemoHintContext'
import {
  cancelFamilieMusterHintSpeech,
  getFamilieMusterHintSpeechEnabled,
  isFamilieMusterHintSpeechAvailable,
  setFamilieMusterHintSpeechEnabled,
  speakFamilieMusterHintText,
} from '../utils/familieMusterHintSpeech'

/** Modal-Theme; nicht `t` – gleicher Name wie Prop `t` im Sheet (TDZ/Referenzfehler vermeiden). */
const familieLeitfadenTheme = adminTheme
const R = PROJECT_ROUTES['k2-familie']

const LS_LEITFADEN_ABGESCHLOSSEN = 'k2-familie-muster-huber-leitfaden-abgeschlossen'
const SS_LEITFADEN_BOUNDS = 'k2-familie-leitfaden-bounds'
const SS_LEITFADEN_MINIMIZED = 'k2-familie-leitfaden-minimized'

export type FamilieLeitfadenPanelBounds = { left: number; top: number; width: number; height: number }

const MIN_W = 280
const MIN_H = 220
const MAX_W_CAP = 560
const MAX_H_VH = 0.88

export function clampFamilieLeitfadenBounds(b: FamilieLeitfadenPanelBounds): FamilieLeitfadenPanelBounds {
  if (typeof window === 'undefined') return b
  const maxW = Math.min(MAX_W_CAP, window.innerWidth - 8)
  const maxH = Math.min(window.innerHeight * MAX_H_VH, 720)
  const width = Math.min(maxW, Math.max(MIN_W, b.width))
  const height = Math.min(maxH, Math.max(MIN_H, b.height))
  const left = Math.min(window.innerWidth - width - 4, Math.max(4, b.left))
  const top = Math.min(window.innerHeight - height - 4, Math.max(4, b.top))
  return { left, top, width, height }
}

function readBoundsFromSession(): FamilieLeitfadenPanelBounds | null {
  try {
    const raw = sessionStorage.getItem(SS_LEITFADEN_BOUNDS)
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
    if (b === null) sessionStorage.removeItem(SS_LEITFADEN_BOUNDS)
    else sessionStorage.setItem(SS_LEITFADEN_BOUNDS, JSON.stringify(clampFamilieLeitfadenBounds(b)))
  } catch {
    /* ignore */
  }
}

export type FamilieMusterLeitfadenStep = {
  id: string
  titel: string
  /** Eine warme Zeile – Charme, kein Kleingedrucktes. */
  stimmung?: string
  text: string
  linkTo?: string
  linkLabel?: string
  /** Kurzer Sprechertext (Drehbuch Vertriebsmappe) – optional Vorlesen wie Hover-Hinweise. */
  sprecherDrehbuch?: string
  /** UI-Fokus: `data-leitfaden-focus` + html-Attribut für Outline. */
  focusKey?: string
}

export const FAMILIE_MUSTER_LEITFADEN_SCHRITTE: FamilieMusterLeitfadenStep[] = [
  {
    id: 'begruessung',
    titel: 'Herzlich willkommen bei K2 Familie',
    stimmung: 'Wir freuen uns, dass du dich die Zeit nimmst – Familie, Erinnerung und Vertrauen gehören zusammen.',
    text:
      '**Herzlich willkommen** – schön, dass du da bist. **K2 Familie** ist gedacht als geschützter Raum für Beziehungen, gemeinsame Momente und würdevolle Erinnerung – **bewusst getrennt** von Galerie, öffentlicher Demo und Vereinswelten, damit ihr in Ruhe **eure** Geschichte pflegen könnt.\n\n' +
      'Im **nächsten Schritt** halten wir unser **Versprechen** in wenigen klaren Sätzen fest – verständlich, ohne Schnörkel. Danach öffnen wir die **Musterfamilie Huber**: frei erfundene Beispiele, nur damit du spüren kannst, wie sich die App anfühlt – ganz ohne Druck.',
    sprecherDrehbuch:
      'Herzlich willkommen – es freut uns wirklich, dass Sie sich die Zeit nehmen. Wir beginnen mit zwei kurzen Karten: zuerst, was K2 Familie für uns bedeutet, dann unser Versprechen in fünf herzlichen, klaren Punkten. Danach schauen wir gemeinsam in eine Demo-Familie mit erfundenen Daten – nur damit Sie die App spüren können, ohne sensible Angaben zu zeigen. Wenn Sie möchten, gehen wir Schritt für Schritt weiter; ich begleite Sie mit Erklärungen, was Sie sehen.',
  },
  {
    id: 'verkaufsversprechen',
    titel: 'Unser Versprechen an euch',
    stimmung: 'Fünf Säulen – weil wir wissen, worauf es in Familien ankommt.',
    text:
      '**Vertrauen:** Beziehungen ergeben sich **nur aus den Karten** in der App – eine nachvollziehbare Wahrheit, kein Raten und kein Vermischen mit anderen Welten.\n\n' +
      '**Ruhe:** **Eigene Schlüssel**, eigene Instanz – keine Vermischung mit Galerie-, Demo- oder Vereinsdaten.\n\n' +
      '**Mitgestaltung:** Rollen, Einladungen, persönliche Zugänge – **familienintern** geregelt, klar wer was darf.\n\n' +
      '**Erinnerung & Tiefe:** Momente, Kalender, Geschichten, **Gedenkort** – alles im gleichen respektvollen Produktgedanken.\n\n' +
      '**Zukunftssicherheit:** **Genom** – Familiendaten werden **nicht** kommerziell verwertet; das ist für uns **dauerhaft** ausgeschlossen.\n\n' +
      'Mehr zum Mitnehmen findet ihr in der Vertriebsmappe **K2 Familie** in der App. Als Nächstes: die **Huber-Demo** – zum Wohlfühlen und Ausprobieren.',
    sprecherDrehbuch:
      'Das hier ist kein Katalog zum Auswendiglernen – es sind fünf Säulen, mit denen wir ehrlich Vertrauen aufbauen wollen. Vertrauen: Beziehungen leiten wir nur aus den Karten ab – keine Vermutungen, keine zweite Wahrheit. Ruhe: eigene Schlüssel, eigene Instanz – nichts wird mit Galerie, Demo oder Vereinsdaten vermischt. Mitgestaltung: Rollen und Einladungen entscheiden Sie in Ihrer Familie. Erinnerung und Tiefe: Momente, Kalender, Geschichten, Gedenkort – alles in einem respektvollen Rahmen. Zukunftssicherheit beim Genom: Familiendaten werden bei uns nicht kommerziell verwertet – das ist dauerhaft ausgeschlossen. Wenn das für Sie stimmig klingt, gehen wir jetzt in die Familie Huber – komplett erfunden, nur damit Sie in Ruhe klicken und sich ein Bild machen können.',
  },
  {
    id: 'einordnung',
    titel: 'Herzlich willkommen bei den Hubers',
    stimmung: 'Hier dürft ihr neugierig sein – es ist eine liebevoll gebaute Spielwiese.',
    text:
      'Du bist jetzt in einer **Demo** mit erfundenen Daten – die **Musterfamilie Huber** gibt es nur zum Ausprobieren und Ankommen. ' +
      'Hier geht es noch nicht um **echte** Familiengeheimnisse – dafür habt ihr später euren eigenen, geschützten Raum. **Jetzt** könnt ihr in Ruhe klicken und spüren, ob sich das für euch gut anfühlt.',
    sprecherDrehbuch:
      'Herzlich willkommen in der Familie Huber – alles, was Sie hier sehen, ist bewusst erfunden: eine warme Spielwiese. Wenn Sie später Ihre eigene Familie anlegen, wird das Ihr geschützter Raum – getrennt von Galerie, Demo und Verein, damit Sie sich dort zu Hause fühlen können.',
  },
  {
    id: 'home',
    titel: 'Meine Familie',
    stimmung: 'So könnte euer „Zuhause“ in der App aussehen – einladend und übersichtlich.',
    text:
      'Hier beginnt der Alltag mit einem Willkommensbereich und Überblick. Wenn ihr **eure** Familie anlegt, wird das **euer** vertrauter Einstieg – der Ort, an dem ihr euch gegenseitig willkommen heißt.',
    linkTo: K2_FAMILIE_APP_SHORT_PATH,
    linkLabel: 'Diese Seite gleich öffnen',
    sprecherDrehbuch:
      '„Meine Familie“ – so könnte Ihr späterer Einstieg aussehen: ein Willkommensbereich und ein klarer Überblick. Wenn Sie Ihre Familie anlegen, wird das der Ort, an dem Sie sich jeden Tag willkommen fühlen – ruhig, übersichtlich, Ihr Raum.',
    focusKey: 'home',
  },
  {
    id: 'stammbaum',
    titel: 'Stammbaum',
    stimmung: 'Generationen sichtbar machen – mit Respekt vor jeder Verbindung.',
    text:
      'Hier werden Beziehungen und Generationen sichtbar – in der Demo mit Beispielpersonen, damit du siehst, wie sanft und klar das gemeint ist.',
    linkTo: R.stammbaum,
    linkLabel: 'Stammbaum ansehen',
    sprecherDrehbuch:
      'Der Stammbaum: Generationen und Verbindungen werden sichtbar – in der Demo mit Beispielpersonen, damit Sie das Gefühl bekommen: nicht technisch kalt, sondern ein Bild, das zu Familie passt.',
    focusKey: 'stammbaum',
  },
  {
    id: 'events-kalender',
    titel: 'Events & Kalender',
    stimmung: 'Gemeinsame Termine – damit nichts Wichtiges untergeht.',
    text:
      'Kalender und Events mit Beispielinhalten – damit ihr ein Gefühl bekommt, wie ihr später zusammen plant, erinnert und einander im Blick behaltet.',
    linkTo: R.events,
    linkLabel: 'Zu den Events',
    sprecherDrehbuch:
      'Events und Kalender: gemeinsame Termine und das Jahr im Blick – in der Demo mit Beispielen, damit Sie spüren, wie leicht sich Planung anfühlen kann. Die Kalender-Ansicht erreichen Sie auch über die obere Menüleiste.',
    focusKey: 'events',
  },
  {
    id: 'geschichte',
    titel: `${K2_FAMILIE_NAV_LABEL_GESCHICHTE} & Gedenkort`,
    stimmung: 'Wo Worte und Erinnerung einen Platz haben, der zählt.',
    text:
      'Geschichten und Gedenkort – Raum für gemeinsame Texte und für Orte der Erinnerung. In der Musterfamilie könnt ihr in Ruhe blättern und ausprobieren, wie sich das anfühlt.',
    linkTo: R.geschichte,
    linkLabel: 'Geschichten ansehen',
    sprecherDrehbuch:
      'Geschichten und Gedenkort – hier haben gemeinsame Texte und würdevolle Erinnerung ihren Platz. In der Musterfamilie können Sie in Ruhe lesen und ausprobieren – ohne Zeitdruck, einfach um das Gefühl mitzunehmen.',
    focusKey: 'geschichte',
  },
  {
    id: 'einstellungen',
    titel: 'Einstellungen',
    stimmung: 'Transparenz und Sicherheit – wer darf was, bleibt bei euch.',
    text:
      'In einer **echten** Familie liegen Zugang, Rollen und Einladungen hier – übersichtlich und verständlich. In der Demo nur zum Orientieren, **ohne** echte Daten, damit ihr wisst: später seid ihr die, die entscheidet.',
    linkTo: R.einstellungen,
    linkLabel: 'Einstellungen öffnen',
    sprecherDrehbuch:
      'Einstellungen: hier regeln Sie später, wer einlädt, wer mitliest, wer mitgestaltet – alles an einem Ort, verständlich gehalten. In der Demo ist das nur ein Orientierungsblick, ohne echte Daten – damit Sie sich sicher fühlen, bevor es ernst wird.',
    focusKey: 'einstellungen',
  },
  {
    id: 'entscheid',
    titel: 'Wenn es euch berührt',
    stimmung: 'Kein Druck – nur die offene Tür zu eurem Raum.',
    text:
      'Wenn euch das Gefühl passt: Demo beenden und mit Einladung oder neuer Familie **euren** geschützten Raum starten – dann sind es **eure** Daten und **eure** Geschichte. Ihr entscheidet in Ruhe.',
    sprecherDrehbuch:
      'Wenn Sie sich hier wohlgefühlt haben: Der Weg zu Ihrer eigenen Familie geht über Lizenz und Einladung – dann sind es Ihre Daten in Ihrem geschützten Mandanten. Die Demo können Sie jederzeit wieder öffnen; sie überschreibt nichts und drängt nicht. Wir möchten keine schnelle Unterschrift – eine Einladung zum Gespräch und zur Klärung reicht uns völlig. Danke, dass Sie sich die Zeit genommen haben.',
    focusKey: 'demo-ende',
  },
]

function renderLeitfadenInline(markdownLite: string): ReactNode {
  const parts = markdownLite.split(/\*\*(.+?)\*\*/g)
  return parts.map((chunk, i) => (i % 2 === 1 ? <strong key={i}>{chunk}</strong> : <span key={i}>{chunk}</span>))
}

/** Absätze bei `\n\n` – jeweils eigenes `<p>` im umgebenden `div` (kein p-in-p). */
function renderLeitfadenText(markdownLite: string): ReactNode {
  const paras = markdownLite.split(/\n\n/).filter(Boolean)
  return paras.map((para, pi) => (
    <p key={pi} style={{ margin: pi === 0 ? 0 : '0.65rem 0 0' }}>
      {renderLeitfadenInline(para.trim())}
    </p>
  ))
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAbgeschlossen: () => void
}

const SHEET_STYLE_ID = 'k2-familie-muster-leitfaden-anim'

function LeitfadenKeyframes() {
  return (
    <style id={SHEET_STYLE_ID}>{`
      @keyframes k2FamilieLeitfadenBackdropIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes k2FamilieLeitfadenSheetIn {
        from {
          transform: translate3d(0, 110%, 0);
          opacity: 0.85;
        }
        to {
          transform: translate3d(0, 0, 0);
          opacity: 1;
        }
      }
      @keyframes k2FamilieLeitfadenStepCross {
        from { opacity: 0; transform: translate3d(0, 8px, 0); }
        to { opacity: 1; transform: translate3d(0, 0, 0); }
      }
      .k2-familie-muster-leitfaden-backdrop {
        animation: k2FamilieLeitfadenBackdropIn 0.32s ease-out forwards;
      }
      .k2-familie-muster-leitfaden-sheet {
        animation: k2FamilieLeitfadenSheetIn 0.48s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      }
      .k2-familie-muster-leitfaden-step-body {
        animation: k2FamilieLeitfadenStepCross 0.28s ease-out forwards;
      }
      html[data-k2-familie-leitfaden-focus] [data-leitfaden-focus] {
        transition: outline 0.35s ease, box-shadow 0.35s ease;
      }
      html[data-k2-familie-leitfaden-focus="home"] [data-leitfaden-focus="home"],
      html[data-k2-familie-leitfaden-focus="stammbaum"] [data-leitfaden-focus="stammbaum"],
      html[data-k2-familie-leitfaden-focus="events"] [data-leitfaden-focus="events"],
      html[data-k2-familie-leitfaden-focus="kalender"] [data-leitfaden-focus="kalender"],
      html[data-k2-familie-leitfaden-focus="geschichte"] [data-leitfaden-focus="geschichte"],
      html[data-k2-familie-leitfaden-focus="gedenkort"] [data-leitfaden-focus="gedenkort"],
      html[data-k2-familie-leitfaden-focus="einstellungen"] [data-leitfaden-focus="einstellungen"],
      html[data-k2-familie-leitfaden-focus="handbuch"] [data-leitfaden-focus="handbuch"],
      html[data-k2-familie-leitfaden-focus="leitfaden"] [data-leitfaden-focus="leitfaden"],
      html[data-k2-familie-leitfaden-focus="demo-ende"] [data-leitfaden-focus="demo-ende"] {
        outline: 3px solid rgba(94, 234, 212, 0.92);
        outline-offset: 3px;
        border-radius: 12px;
        box-shadow: 0 0 0 4px rgba(94, 234, 212, 0.12);
      }
    `}</style>
  )
}

export function FamilieMusterHuberLeitfadenModal({ open, onOpenChange, onAbgeschlossen }: Props) {
  const navigate = useNavigate()
  const location = useLocation()
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

  const max = FAMILIE_MUSTER_LEITFADEN_SCHRITTE.length - 1
  const istLetzter = schritt >= max
  const total = FAMILIE_MUSTER_LEITFADEN_SCHRITTE.length

  useEffect(() => {
    if (open) {
      setSchritt(0)
      try {
        setMinimized(sessionStorage.getItem(SS_LEITFADEN_MINIMIZED) === '1')
      } catch {
        setMinimized(false)
      }
      const saved = readBoundsFromSession()
      if (saved) setBounds(saved)
      else setBounds(null)
    }
  }, [open])

  useEffect(() => {
    const onResize = () => {
      setBounds((prev) => (prev ? clampFamilieLeitfadenBounds(prev) : null))
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const schliessenUndMerken = useCallback(() => {
    try {
      localStorage.setItem(LS_LEITFADEN_ABGESCHLOSSEN, '1')
    } catch {
      /* ignore */
    }
    onAbgeschlossen()
    onOpenChange(false)
  }, [onAbgeschlossen, onOpenChange])

  const minimize = useCallback(() => {
    setMinimized(true)
    try {
      sessionStorage.setItem(SS_LEITFADEN_MINIMIZED, '1')
    } catch {
      /* ignore */
    }
  }, [])

  /** Escape auch wenn Backdrop pointer-events: none (Muster-Hover-Hinweise unter dem Overlay). */
  useEffect(() => {
    if (!open || minimized) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') minimize()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, minimized, minimize])

  const restoreFromMinimized = useCallback(() => {
    setMinimized(false)
    try {
      sessionStorage.removeItem(SS_LEITFADEN_MINIMIZED)
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
    [bounds]
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
    [bounds]
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
        })
      )
    } else {
      setBounds(
        clampFamilieLeitfadenBounds({
          left: sb.left,
          top: sb.top,
          width: sb.width + dx,
          height: sb.height + dy,
        })
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

  const demoBeenden = useCallback(() => {
    schliessenUndMerken()
    navigate({ pathname: K2_FAMILIE_APP_SHORT_PATH, search: '' }, { replace: true })
  }, [navigate, schliessenUndMerken])

  /** Proaktiv: passende Seite öffnen, Fokus markieren, in den Blick scrollen (interaktiver Rundgang). */
  useEffect(() => {
    if (!open || minimized) {
      setLeitfadenFocusOnDocument(null)
      return
    }
    const step = FAMILIE_MUSTER_LEITFADEN_SCHRITTE[schritt]
    if (!step) {
      setLeitfadenFocusOnDocument(null)
      return
    }

    const linkTo = step.linkTo
    if (linkTo) {
      let needNav = true
      if (linkTo === K2_FAMILIE_APP_SHORT_PATH) {
        needNav = !isK2FamilieMeineFamilieHomePath(location.pathname)
      } else {
        const p = (location.pathname || '/').replace(/\/$/, '') || '/'
        const l = linkTo.replace(/\/$/, '') || '/'
        needNav = p !== l && !p.startsWith(`${l}/`)
      }
      if (needNav) navigate(linkTo)
    }

    setLeitfadenFocusOnDocument(step.focusKey ?? null)
    scrollLeitfadenFocusIntoView(step.focusKey)

    return () => {
      setLeitfadenFocusOnDocument(null)
    }
  }, [open, minimized, schritt, location.pathname, navigate])

  if (!open) return null

  const s = FAMILIE_MUSTER_LEITFADEN_SCHRITTE[schritt]!

  const sheetBaseStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 -12px 48px rgba(15, 23, 42, 0.28), 0 0 0 1px rgba(255, 254, 251, 0.12) inset',
    background: 'linear-gradient(180deg, #fffefb 0%, #faf6f0 100%)',
    border: '1px solid rgba(181, 74, 30, 0.2)',
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
          borderBottom: '1px solid rgba(181, 74, 30, 0.2)',
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

  if (minimized) {
    return (
      <>
        <LeitfadenKeyframes />
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
            border: '1px solid rgba(181, 74, 30, 0.45)',
            background: 'linear-gradient(90deg, #fffefb, #faf6f0)',
            color: '#b54a1e',
            cursor: 'pointer',
            fontFamily: familieLeitfadenTheme.fontHeading,
            boxShadow: '0 6px 24px rgba(15, 23, 42, 0.2)',
          }}
        >
          Rundgang · Huber ▶
        </button>
      </>
    )
  }

  return (
    <>
      <LeitfadenKeyframes />
      <div
        className="k2-familie-no-print k2-familie-muster-leitfaden-backdrop"
        role="presentation"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 25000,
          background:
            'linear-gradient(165deg, rgba(28, 26, 24, 0.45) 0%, rgba(181, 74, 30, 0.22) 55%, rgba(15, 23, 42, 0.5) 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'stretch',
          padding: 0,
          fontFamily: familieLeitfadenTheme.fontBody,
          /** Durchlässig: Nav/Kacheln darunter bleiben per Hover für data-muster-hint erreichbar. */
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
              className="k2-familie-muster-leitfaden-sheet"
              role="dialog"
              aria-modal="true"
              aria-labelledby="k2-familie-muster-leitfaden-titel"
              style={{ ...sheetPositionStyle, pointerEvents: 'auto' }}
              onClick={(e) => e.stopPropagation()}
            >
              <LeitfadenSheetInner
                t={familieLeitfadenTheme}
                schritt={schritt}
                setSchritt={setSchritt}
                total={total}
                max={max}
                istLetzter={istLetzter}
                s={s}
                onHeaderPointerDown={onHeaderPointerDown}
                onHeaderPointerMove={onDragPointerMove}
                onHeaderPointerUp={onDragPointerUp}
                onResizePointerDown={onResizePointerDown}
                onResizePointerMove={onDragPointerMove}
                onResizePointerUp={onDragPointerUp}
                minimize={minimize}
                nudgeSize={nudgeSize}
                resetPanelLayout={resetPanelLayout}
                schliessenUndMerken={schliessenUndMerken}
                demoBeenden={demoBeenden}
                hasFixedBounds={false}
              />
            </div>
          </div>
        ) : (
          <div
            ref={sheetRef}
            className="k2-familie-muster-leitfaden-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="k2-familie-muster-leitfaden-titel"
            style={{ ...sheetPositionStyle, pointerEvents: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <LeitfadenSheetInner
              t={familieLeitfadenTheme}
              schritt={schritt}
              setSchritt={setSchritt}
              total={total}
              max={max}
              istLetzter={istLetzter}
              s={s}
              onHeaderPointerDown={onHeaderPointerDown}
              onHeaderPointerMove={onDragPointerMove}
              onHeaderPointerUp={onDragPointerUp}
              onResizePointerDown={onResizePointerDown}
              onResizePointerMove={onDragPointerMove}
              onResizePointerUp={onDragPointerUp}
              minimize={minimize}
              nudgeSize={nudgeSize}
              resetPanelLayout={resetPanelLayout}
              schliessenUndMerken={schliessenUndMerken}
              demoBeenden={demoBeenden}
              hasFixedBounds
            />
          </div>
        )}
      </div>
    </>
  )
}

type LeitfadenSheetInnerProps = {
  t: typeof adminTheme
  schritt: number
  setSchritt: (n: number | ((prev: number) => number)) => void
  total: number
  max: number
  istLetzter: boolean
  s: FamilieMusterLeitfadenStep
  onHeaderPointerDown: (e: React.PointerEvent) => void
  onHeaderPointerMove: (e: React.PointerEvent) => void
  onHeaderPointerUp: (e: React.PointerEvent) => void
  onResizePointerDown: (e: React.PointerEvent) => void
  onResizePointerMove: (e: React.PointerEvent) => void
  onResizePointerUp: (e: React.PointerEvent) => void
  minimize: () => void
  nudgeSize: (delta: number) => void
  resetPanelLayout: () => void
  schliessenUndMerken: () => void
  demoBeenden: () => void
  hasFixedBounds: boolean
}

function LeitfadenSheetInner({
  t,
  schritt,
  setSchritt,
  total,
  max,
  istLetzter,
  s,
  onHeaderPointerDown,
  onHeaderPointerMove,
  onHeaderPointerUp,
  onResizePointerDown,
  onResizePointerMove,
  onResizePointerUp,
  minimize,
  nudgeSize,
  resetPanelLayout,
  schliessenUndMerken,
  demoBeenden,
  hasFixedBounds,
}: LeitfadenSheetInnerProps) {
  const musterHint = useFamilieMusterDemoHint()
  const hoverHint = musterHint?.hoverHint ?? null
  const speechAvail = isFamilieMusterHintSpeechAvailable()
  const [speechOn, setSpeechOn] = useState(() => getFamilieMusterHintSpeechEnabled())

  /** Hover hat Vorrang; sonst Sprechertext aus Drehbuch pro Schritt. */
  useEffect(() => {
    if (!speechOn) {
      cancelFamilieMusterHintSpeech()
      return
    }
    cancelFamilieMusterHintSpeech()
    const text = hoverHint ?? s.sprecherDrehbuch
    if (!text) return
    const delay = hoverHint ? 380 : 520
    const id = window.setTimeout(() => {
      speakFamilieMusterHintText(text)
    }, delay)
    return () => {
      window.clearTimeout(id)
      cancelFamilieMusterHintSpeech()
    }
  }, [speechOn, hoverHint, schritt, s.sprecherDrehbuch, s.id])

  useEffect(() => {
    return () => {
      cancelFamilieMusterHintSpeech()
    }
  }, [])

  return (
    <>
          {/* Griff + Kopf – ziehbar */}
          <div
            onPointerDown={onHeaderPointerDown}
            onPointerMove={onHeaderPointerMove}
            onPointerUp={onHeaderPointerUp}
            onPointerCancel={onHeaderPointerUp}
            style={{
              flexShrink: 0,
              padding: '10px 1rem 0',
              background: 'linear-gradient(90deg, rgba(181, 74, 30, 0.12) 0%, rgba(255, 200, 140, 0.2) 50%, rgba(94, 234, 212, 0.12) 100%)',
              cursor: 'grab',
              touchAction: 'none',
            }}
          >
            <div
              style={{
                width: 44,
                height: 5,
                borderRadius: 999,
                background: 'rgba(181, 74, 30, 0.35)',
                margin: '0 auto 12px',
              }}
              aria-hidden
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', paddingBottom: '0.65rem', flexWrap: 'wrap' }}>
              <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.04em', color: '#b54a1e', fontFamily: t.fontHeading }}>
                {s.id === 'begruessung' || s.id === 'verkaufsversprechen'
                  ? 'K2 Familie · Begrüßung & Versprechen'
                  : 'Rundgang · Musterfamilie Huber'}
              </p>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}
                onPointerDown={(e) => e.stopPropagation()}
              >
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
                    border: '1px solid rgba(181, 74, 30, 0.35)',
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
                    border: '1px solid rgba(181, 74, 30, 0.35)',
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
                {hasFixedBounds ? (
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
                      border: '1px solid rgba(181, 74, 30, 0.25)',
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
                  title="Nur Leiste – Rundgang aus dem Weg"
                  onClick={(e) => {
                    e.stopPropagation()
                    minimize()
                  }}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: '1px solid rgba(181, 74, 30, 0.35)',
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
                <span style={{ fontSize: '1.15rem', lineHeight: 1 }} aria-hidden>
                  ✨
                </span>
              </div>
            </div>
          </div>

          {/* Fortschritt: sichtbare Punkte */}
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
            {FAMILIE_MUSTER_LEITFADEN_SCHRITTE.map((st, i) => {
              const aktiv = i === schritt
              const done = i < schritt
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSchritt(i)}
                  title={`Schritt ${i + 1}: ${st.titel}`}
                  style={{
                    width: aktiv ? 28 : done ? 10 : 10,
                    height: 10,
                    borderRadius: 999,
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    transition: 'width 0.25s ease, background 0.2s ease',
                    background: aktiv
                      ? 'linear-gradient(90deg, #b54a1e, #d4622a)'
                      : done
                        ? 'rgba(181, 74, 30, 0.45)'
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
            Der dunkle Hintergrund blockiert die Maus nicht – du kannst die Navigation und Kacheln anfahren (Hover-Hinweise).
            Pro Schritt führt der Rundgang zur passenden Ansicht und markiert die Stelle – optional Vorlesen wie beim Drehbuch.
            Rundgang aus dem Weg: <strong style={{ color: t.text }}>▼</strong> oder <strong style={{ color: t.text }}>Escape</strong>.
          </p>

          {speechAvail ? (
            <div
              onPointerDown={(e) => e.stopPropagation()}
              style={{
                padding: '0 1rem 0.5rem',
                borderBottom: '1px solid rgba(181, 74, 30, 0.06)',
                background: 'rgba(250, 248, 244, 0.95)',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: t.text,
                  userSelect: 'none',
                }}
              >
                <input
                  type="checkbox"
                  checked={speechOn}
                  onChange={(e) => {
                    const v = e.target.checked
                    setSpeechOn(v)
                    setFamilieMusterHintSpeechEnabled(v)
                    if (!v) cancelFamilieMusterHintSpeech()
                  }}
                  aria-label="Hinweise und Schritt-Sprechertext per Sprachausgabe vorlesen"
                  style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#b54a1e' }}
                />
                Hinweis & Schritte vorlesen
              </label>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.68rem', color: t.muted, lineHeight: 1.35 }}>
                Nutzt die Sprachausgabe des Browsers (Deutsch). Am Mac sind dafür keine extra Systemeinstellungen nötig – Checkbox an,
                Lautstärke prüfen. Safari braucht manchmal einmal die Checkbox als Klick, dann klappt’s.
              </p>
            </div>
          ) : null}

          {hoverHint ? (
            <div
              role="status"
              aria-live="polite"
              style={{
                padding: '0.5rem 1rem',
                borderBottom: '1px solid rgba(181, 74, 30, 0.1)',
                background: 'rgba(94, 234, 212, 0.08)',
              }}
            >
              <p style={{ margin: 0, fontSize: '0.68rem', fontWeight: 700, color: t.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Aktuell unter dem Cursor
              </p>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: t.text, lineHeight: 1.45, fontWeight: 600 }}>
                {hoverHint}
              </p>
            </div>
          ) : null}

          <div
            className="k2-familie-muster-leitfaden-step-body"
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
              id="k2-familie-muster-leitfaden-titel"
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
                  color: '#b54a1e',
                  lineHeight: 1.4,
                  fontStyle: 'italic',
                }}
              >
                {s.stimmung}
              </p>
            ) : null}
            <div style={{ fontSize: '0.94rem', color: t.text, lineHeight: 1.62 }}>{renderLeitfadenText(s.text)}</div>
            {s.linkTo && s.linkLabel ? (
              <p style={{ margin: '0.85rem 0 0' }}>
                <Link
                  to={s.linkTo}
                  style={{
                    display: 'inline-block',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: '#fff',
                    background: 'linear-gradient(90deg, #b54a1e, #c95624)',
                    padding: '0.45rem 0.95rem',
                    borderRadius: 999,
                    textDecoration: 'none',
                    boxShadow: '0 3px 12px rgba(181, 74, 30, 0.35)',
                  }}
                >
                  {s.linkLabel} →
                </Link>
              </p>
            ) : null}
            {isK2FamilieApfLocalhost() && s.id === 'einordnung' ? (
              <p style={{ margin: '0.75rem 0 0', fontSize: '0.8rem', color: t.muted, lineHeight: 1.45 }}>
                Tipp APf: Nach dem Demo-Ende kann die Stammfamilie automatisch gewählt werden.
              </p>
            ) : null}
          </div>

          <div
            style={{
              flexShrink: 0,
              padding: '0.75rem 1rem calc(0.85rem + env(safe-area-inset-bottom, 0px))',
              borderTop: '1px solid rgba(181, 74, 30, 0.12)',
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
                    border: '1px solid rgba(181, 74, 30, 0.35)',
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
                    background: 'linear-gradient(90deg, #b54a1e, #d4622a)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    boxShadow: '0 4px 16px rgba(181, 74, 30, 0.4)',
                  }}
                >
                  Weiter →
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={schliessenUndMerken}
                    style={{
                      padding: '0.55rem 1rem',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      borderRadius: 999,
                      border: '1px solid rgba(181, 74, 30, 0.35)',
                      background: '#fffefb',
                      color: t.text,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Schließen
                  </button>
                  <button
                    type="button"
                    onClick={demoBeenden}
                    style={{
                      padding: '0.55rem 1.1rem',
                      fontSize: '0.9rem',
                      fontWeight: 800,
                      borderRadius: 999,
                      border: 'none',
                      background: 'linear-gradient(90deg, #1c1a18, #3d3834)',
                      color: '#fff',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      boxShadow: '0 4px 14px rgba(28, 26, 24, 0.25)',
                    }}
                  >
                    Demo beenden
                  </button>
                </>
              )}
            </div>
          </div>

          <div
            onPointerDown={onResizePointerDown}
            onPointerMove={onResizePointerMove}
            onPointerUp={onResizePointerUp}
            onPointerCancel={onResizePointerUp}
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
                'linear-gradient(135deg, transparent 52%, rgba(181, 74, 30, 0.2) 52%, rgba(181, 74, 30, 0.45) 100%)',
              borderRadius: '0 0 18px 0',
            }}
          />
    </>
  )
}

export function readMusterLeitfadenAbgeschlossen(): boolean {
  try {
    return localStorage.getItem(LS_LEITFADEN_ABGESCHLOSSEN) === '1'
  } catch {
    return false
  }
}
