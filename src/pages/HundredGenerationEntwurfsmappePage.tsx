import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  HUNDRED_GENERATION_FLAECHE_ROUTE,
  HUNDRED_GENERATION_ROUTE,
  PLATFORM_ROUTES,
} from '../config/navigation'
import {
  ENTWURFSMAPPE_NOTES_KEY,
  HUNDRED_GENERATION_MODELLE,
  HUNDRED_GENERATION_UEBERSICHTEN,
  type HundredGenerationEntwurfGruppe,
  type HundredGenerationModellId,
} from '../config/hundredGenerationEntwuerfe'
import {
  formatMassLabel,
  getMassForModell,
  HUNDRED_GENERATION_MAX_HOEHE_CM,
} from '../config/hundredGenerationMass'
import { KeramikDrehscheibe } from '../components/hundredGeneration/KeramikDrehscheibe'
import { HundredGenerationMassSkizze } from '../components/hundredGeneration/HundredGenerationMassSkizze'
import { HundredGenerationAhnenrasterBlatt } from '../components/hundredGeneration/HundredGenerationAhnenrasterBlatt'
import { AHNENRASTER_BLATT } from '../config/hundredGenerationAhnenraster'
import '../App.css'

type PrintSheet = {
  src: string
  caption: string
  subtitle?: string
}

function loadNotes(): Record<string, string> {
  try {
    const raw = localStorage.getItem(ENTWURFSMAPPE_NOTES_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, string>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function saveNotes(notes: Record<string, string>) {
  try {
    localStorage.setItem(ENTWURFSMAPPE_NOTES_KEY, JSON.stringify(notes))
  } catch {
    /* ignore */
  }
}

/**
 * Arbeitsmappe: Handskizze + drehbare Keramik-Ansichten (Fotos) + Notizen.
 * Drehen = Ziehen durch echte Vorne/Seite/Hinten – kein Fake-Lowpoly.
 */
export default function HundredGenerationEntwurfsmappePage() {
  const [gruppe, setGruppe] = useState<HundredGenerationEntwurfGruppe>('serie')
  const gefiltert = useMemo(
    () => HUNDRED_GENERATION_MODELLE.filter((m) => m.gruppe === gruppe),
    [gruppe]
  )
  const [activeId, setActiveId] = useState<HundredGenerationModellId>('chaosgott')
  const [ansichtIdx, setAnsichtIdx] = useState(0)
  const [notes, setNotes] = useState<Record<string, string>>(() => loadNotes())
  /** mappe | vollformat | mass | ahnenraster */
  const [printMode, setPrintMode] = useState<'mappe' | 'vollformat' | 'mass' | 'ahnenraster'>('mappe')
  const [printSheets, setPrintSheets] = useState<PrintSheet[]>([])

  useEffect(() => {
    if (!gefiltert.some((m) => m.id === activeId) && gefiltert[0]) {
      setActiveId(gefiltert[0].id)
    }
  }, [gruppe, gefiltert, activeId])

  const active = useMemo(
    () => HUNDRED_GENERATION_MODELLE.find((m) => m.id === activeId) ?? HUNDRED_GENERATION_MODELLE[0],
    [activeId]
  )

  useEffect(() => {
    setAnsichtIdx(0)
  }, [activeId])

  useEffect(() => {
    saveNotes(notes)
  }, [notes])

  useEffect(() => {
    const clear = () => {
      setPrintMode('mappe')
      setPrintSheets([])
    }
    window.addEventListener('afterprint', clear)
    return () => window.removeEventListener('afterprint', clear)
  }, [])

  const printMappe = () => {
    setPrintMode('mappe')
    setPrintSheets([])
    requestAnimationFrame(() => window.print())
  }

  const printVollformat = (sheets: PrintSheet[]) => {
    if (sheets.length === 0) return
    setPrintMode('vollformat')
    setPrintSheets(sheets)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => window.print())
    })
  }

  const aktuelleAnsicht = active.ansichten[ansichtIdx] ?? active.ansichten[0]
  const activeMass = getMassForModell(active.id)
  const massAnsichtIdx = active.ansichten.length
  const isMassAnsicht = ansichtIdx === massAnsichtIdx
  const ansichtTotal = massAnsichtIdx + 1

  const printMassSkizze = () => {
    setPrintMode('mass')
    setPrintSheets([])
    requestAnimationFrame(() => {
      requestAnimationFrame(() => window.print())
    })
  }

  const printAhnenrasterBlatt = () => {
    setPrintMode('ahnenraster')
    setPrintSheets([])
    setActiveId(AHNENRASTER_BLATT.modellId)
    setGruppe('mythos')
    requestAnimationFrame(() => {
      requestAnimationFrame(() => window.print())
    })
  }

  const massTrailing = {
    label: 'Maßskizze',
    render: () => (
      <HundredGenerationMassSkizze
        title={active.title}
        mass={activeMass}
        imageSrc={active.src}
        variant="screen"
      />
    ),
  }

  return (
    <div
      className={`hg-entwurfsmappe${
        printMode === 'vollformat'
          ? ' is-print-vollformat'
          : printMode === 'mass'
            ? ' is-print-mass'
            : printMode === 'ahnenraster'
              ? ' is-print-ahnenraster'
              : ' is-print-mappe'
      }`}
    >
      <style>{`
        .hg-entwurfsmappe {
          --hg-bg: #12151c;
          --hg-panel: #1a1f2a;
          --hg-ink: #eef2f7;
          --hg-muted: #a8b3c4;
          --hg-accent: #d4a017;
          --hg-line: rgba(212, 160, 23, 0.35);
          min-height: 100vh;
          background:
            radial-gradient(ellipse 70% 45% at 10% 0%, rgba(161, 98, 7, 0.16), transparent 55%),
            radial-gradient(ellipse 50% 40% at 90% 10%, rgba(40, 52, 72, 0.5), transparent 50%),
            var(--hg-bg);
          color: var(--hg-ink);
          font-family: "Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif;
        }
        .hg-entwurfsmappe .shell {
          max-width: 56rem;
          margin: 0 auto;
          padding: 1.15rem 1.15rem 3rem;
        }
        .hg-entwurfsmappe .nav {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.35rem;
          font-family: system-ui, sans-serif;
          font-size: 0.9rem;
        }
        .hg-entwurfsmappe .nav a { color: var(--hg-muted); text-decoration: none; }
        .hg-entwurfsmappe .nav a:hover { color: var(--hg-accent); }
        .hg-entwurfsmappe .chapters {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin: 0 0 1.25rem;
          font-family: system-ui, sans-serif;
        }
        .hg-entwurfsmappe .chapters a,
        .hg-entwurfsmappe .chapters span {
          padding: 0.4rem 0.75rem;
          border-radius: 8px;
          text-decoration: none;
          font-size: 0.85rem;
          border: 1px solid var(--hg-line);
          color: var(--hg-muted);
        }
        .hg-entwurfsmappe .chapters .is-active {
          background: rgba(212, 160, 23, 0.2);
          color: var(--hg-ink);
          border-color: var(--hg-accent);
          font-weight: 600;
        }
        .hg-entwurfsmappe .kicker {
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-size: 0.72rem;
          color: var(--hg-accent);
          font-family: system-ui, sans-serif;
          margin: 0 0 0.5rem;
        }
        .hg-entwurfsmappe h1 {
          font-size: clamp(1.6rem, 4vw, 2.2rem);
          margin: 0 0 0.4rem;
          line-height: 1.15;
        }
        .hg-entwurfsmappe .lede {
          color: var(--hg-muted);
          line-height: 1.55;
          margin: 0 0 1.25rem;
          font-size: 0.98rem;
        }
        .hg-entwurfsmappe .gruppen,
        .hg-entwurfsmappe .model-tabs,
        .hg-entwurfsmappe .ansicht-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
          margin: 0 0 0.85rem;
          font-family: system-ui, sans-serif;
        }
        .hg-entwurfsmappe .gruppen button,
        .hg-entwurfsmappe .model-tabs button,
        .hg-entwurfsmappe .ansicht-tabs button {
          appearance: none;
          border: 1px solid var(--hg-line);
          background: rgba(255,255,255,0.04);
          color: var(--hg-muted);
          padding: 0.45rem 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.82rem;
        }
        .hg-entwurfsmappe .gruppen button.is-on,
        .hg-entwurfsmappe .model-tabs button.is-on,
        .hg-entwurfsmappe .ansicht-tabs button.is-on {
          background: rgba(212, 160, 23, 0.22);
          color: var(--hg-ink);
          border-color: var(--hg-accent);
          font-weight: 600;
        }
        .hg-entwurfsmappe .work {
          display: grid;
          grid-template-columns: 1fr 1.35fr;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }
        .hg-entwurfsmappe .work.solo { grid-template-columns: 1fr; }
        @media (max-width: 820px) {
          .hg-entwurfsmappe .work { grid-template-columns: 1fr; }
        }
        .hg-entwurfsmappe .card {
          background: var(--hg-panel);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 0.85rem;
        }
        .hg-entwurfsmappe .card h2 {
          font-family: system-ui, sans-serif;
          font-size: 0.85rem;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--hg-accent);
          margin: 0 0 0.65rem;
        }
        .hg-entwurfsmappe .card img {
          display: block;
          width: 100%;
          border-radius: 8px;
          background: #0a0c10;
        }
        .hg-entwurfsmappe .hint {
          margin: 0.55rem 0 0;
          font-size: 0.85rem;
          color: var(--hg-muted);
          line-height: 1.45;
        }
        .hg-entwurfsmappe .hg-drehscheibe-stage.is-mass {
          cursor: default;
          background: #0e1118;
        }
        .hg-entwurfsmappe .hg-drehscheibe-mass {
          width: 100%;
          padding: 0.5rem 0.35rem 1.75rem;
          box-sizing: border-box;
        }
        .hg-entwurfsmappe .thumb-row button.thumb-mass {
          position: relative;
        }
        .hg-entwurfsmappe .thumb-row button.thumb-mass span {
          display: block;
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          padding: 0.15rem;
          background: linear-gradient(transparent, rgba(0,0,0,0.75));
          color: var(--hg-accent);
          font-size: 0.58rem;
          font-weight: 700;
        }
        .hg-entwurfsmappe .thumb-row button {
          appearance: none;
          border: 2px solid transparent;
          padding: 0;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          background: #0a0c10;
          width: 4.5rem;
        }
        .hg-entwurfsmappe .thumb-row button.is-on {
          border-color: var(--hg-accent);
        }
        .hg-entwurfsmappe .thumb-row img {
          width: 100%;
          aspect-ratio: 3/4;
          object-fit: cover;
          display: block;
        }
        .hg-entwurfsmappe .thumb-row span {
          display: block;
          font-family: system-ui, sans-serif;
          font-size: 0.65rem;
          color: var(--hg-muted);
          padding: 0.25rem;
          text-align: center;
        }
        .hg-entwurfsmappe textarea {
          width: 100%;
          min-height: 7.5rem;
          margin-top: 0.75rem;
          border-radius: 8px;
          border: 1px solid var(--hg-line);
          background: rgba(0,0,0,0.28);
          color: var(--hg-ink);
          padding: 0.7rem 0.8rem;
          font-family: system-ui, sans-serif;
          font-size: 0.9rem;
          line-height: 1.45;
          resize: vertical;
        }
        .hg-entwurfsmappe .ueber-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
          gap: 0.75rem;
          margin-top: 0.75rem;
        }
        .hg-entwurfsmappe .ueber-grid > div {
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          overflow: hidden;
          background: rgba(0,0,0,0.2);
        }
        .hg-entwurfsmappe .ueber-grid a {
          display: block;
          color: inherit;
          text-decoration: none;
        }
        .hg-entwurfsmappe .ueber-grid img {
          width: 100%;
          aspect-ratio: 16/9;
          object-fit: cover;
          display: block;
        }
        .hg-entwurfsmappe .ueber-grid span {
          display: block;
          padding: 0.5rem 0.65rem;
          font-family: system-ui, sans-serif;
          font-size: 0.8rem;
          color: var(--hg-muted);
        }
        .hg-entwurfsmappe .foot {
          margin-top: 1.75rem;
          padding-top: 0.85rem;
          border-top: 1px solid rgba(255,255,255,0.08);
          font-family: system-ui, sans-serif;
          font-size: 0.78rem;
          color: var(--hg-muted);
          line-height: 1.5;
        }
        .hg-entwurfsmappe .hg-drehscheibe { margin: 0; }
        .hg-entwurfsmappe .hg-drehscheibe-stage {
          position: relative;
          touch-action: none;
          cursor: grab;
          user-select: none;
          -webkit-user-select: none;
          border-radius: 10px;
          overflow: hidden;
          background: #0e1118;
        }
        .hg-entwurfsmappe .hg-drehscheibe-stage.is-single { cursor: default; }
        .hg-entwurfsmappe .hg-drehscheibe-stage.is-dragging { cursor: grabbing; }
        .hg-entwurfsmappe .hg-drehscheibe-stage img {
          display: block;
          width: 100%;
          height: auto;
          pointer-events: none;
          -webkit-user-drag: none;
        }
        .hg-entwurfsmappe .hg-drehscheibe-hint {
          position: absolute;
          left: 0; right: 0; bottom: 0;
          margin: 0;
          padding: 0.55rem 0.75rem;
          font-family: system-ui, sans-serif;
          font-size: 0.78rem;
          color: #f4f0e8;
          background: linear-gradient(transparent, rgba(0,0,0,0.72));
        }
        .hg-entwurfsmappe .hg-drehscheibe-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          align-items: center;
          margin-top: 0.65rem;
          font-family: system-ui, sans-serif;
          font-size: 0.85rem;
        }
        .hg-entwurfsmappe .hg-drehscheibe-actions button,
        .hg-entwurfsmappe .hg-drehscheibe-actions a {
          padding: 0.35rem 0.7rem;
          border-radius: 8px;
          border: 1px solid var(--hg-line);
          background: transparent;
          color: var(--hg-muted);
          text-decoration: none;
          cursor: pointer;
        }
        .hg-entwurfsmappe .hg-drehscheibe-actions button:hover,
        .hg-entwurfsmappe .hg-drehscheibe-actions a:hover {
          color: var(--hg-accent);
          border-color: var(--hg-accent);
        }
        .hg-entwurfsmappe .hg-drehscheibe-actions button.is-on {
          background: rgba(212, 160, 23, 0.22);
          color: var(--hg-ink);
          border-color: var(--hg-accent);
          font-weight: 600;
        }
        .hg-entwurfsmappe .btn-print {
          appearance: none;
          border: 1px solid var(--hg-accent);
          background: rgba(212, 160, 23, 0.2);
          color: var(--hg-ink);
          padding: 0.45rem 0.9rem;
          border-radius: 8px;
          cursor: pointer;
          font-family: system-ui, sans-serif;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .hg-entwurfsmappe .btn-print-ghost {
          appearance: none;
          border: 1px solid var(--hg-line);
          background: transparent;
          color: var(--hg-muted);
          padding: 0.4rem 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          font-family: system-ui, sans-serif;
          font-size: 0.82rem;
          font-weight: 600;
        }
        .hg-entwurfsmappe .btn-print-ghost:hover {
          color: var(--hg-accent);
          border-color: var(--hg-accent);
        }
        .hg-entwurfsmappe .print-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
          margin-top: 0.65rem;
          font-family: system-ui, sans-serif;
        }
        .hg-entwurfsmappe .print-only { display: none; }
        .hg-entwurfsmappe .seitenfuss { display: none; }
        @media print {
          @page { margin: 10mm 12mm 14mm 12mm; }
          body { background: #fff !important; }
          .hg-entwurfsmappe {
            background: #fff !important;
            color: #1c1a18 !important;
            font-size: 10.5pt;
          }
          .hg-entwurfsmappe .no-print { display: none !important; }
          .hg-entwurfsmappe .shell { max-width: none; padding: 0; }
          .hg-entwurfsmappe.is-print-mappe .print-mappe { display: block !important; }
          .hg-entwurfsmappe.is-print-mappe .print-vollformat,
          .hg-entwurfsmappe.is-print-mappe .print-mass,
          .hg-entwurfsmappe.is-print-mappe .print-ahnenraster { display: none !important; }
          .hg-entwurfsmappe.is-print-vollformat .print-mappe,
          .hg-entwurfsmappe.is-print-vollformat .print-mass,
          .hg-entwurfsmappe.is-print-vollformat .print-ahnenraster { display: none !important; }
          .hg-entwurfsmappe.is-print-vollformat .print-vollformat { display: block !important; }
          .hg-entwurfsmappe.is-print-mass .print-mappe,
          .hg-entwurfsmappe.is-print-mass .print-vollformat,
          .hg-entwurfsmappe.is-print-mass .print-ahnenraster { display: none !important; }
          .hg-entwurfsmappe.is-print-mass .print-mass { display: block !important; }
          .hg-entwurfsmappe.is-print-ahnenraster .print-mappe,
          .hg-entwurfsmappe.is-print-ahnenraster .print-vollformat,
          .hg-entwurfsmappe.is-print-ahnenraster .print-mass { display: none !important; }
          .hg-entwurfsmappe.is-print-ahnenraster .print-ahnenraster { display: block !important; }
          .hg-entwurfsmappe .print-ahnenraster-sheet {
            min-height: 250mm;
          }
          .hg-entwurfsmappe .print-mass-sheet {
            min-height: 240mm;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }
          .hg-entwurfsmappe .print-mass-inline {
            max-width: 11cm;
            margin: 0.4rem 0 0.2rem;
            break-inside: avoid;
          }
          .hg-entwurfsmappe .print-kicker {
            font-family: system-ui, sans-serif;
            font-size: 8pt;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #5c5650;
            margin: 0 0 0.25rem;
          }
          .hg-entwurfsmappe .print-block {
            break-inside: avoid;
            page-break-inside: avoid;
            margin: 0 0 0.85rem;
            padding-bottom: 0.55rem;
            border-bottom: 1px solid #ccc;
          }
          .hg-entwurfsmappe .print-block h2 {
            font-size: 11pt;
            color: #1c1a18;
            margin: 0 0 0.25rem;
            text-transform: none;
            letter-spacing: 0;
          }
          .hg-entwurfsmappe .print-meta {
            font-family: system-ui, sans-serif;
            font-size: 9pt;
            color: #5c5650;
            margin: 0 0 0.4rem;
            line-height: 1.35;
          }
          .hg-entwurfsmappe .print-views {
            display: flex;
            flex-wrap: wrap;
            gap: 0.4rem;
          }
          .hg-entwurfsmappe .print-views figure {
            margin: 0;
            width: 28%;
            min-width: 3.8cm;
          }
          .hg-entwurfsmappe .print-views img {
            width: 100%;
            height: auto;
            display: block;
            border: 1px solid #ddd;
            background: #f6f4f0;
          }
          .hg-entwurfsmappe .print-views figcaption {
            font-family: system-ui, sans-serif;
            font-size: 7.5pt;
            color: #5c5650;
            text-align: center;
            margin-top: 0.15rem;
          }
          .hg-entwurfsmappe .print-note {
            font-family: system-ui, sans-serif;
            font-size: 9pt;
            color: #1c1a18;
            margin: 0.35rem 0 0;
            white-space: pre-wrap;
          }
          .hg-entwurfsmappe .print-sheet {
            break-after: page;
            page-break-after: always;
            display: flex;
            flex-direction: column;
            min-height: 95vh;
            box-sizing: border-box;
            padding: 0;
          }
          .hg-entwurfsmappe .print-sheet:last-child {
            break-after: auto;
            page-break-after: auto;
          }
          .hg-entwurfsmappe .print-sheet-head {
            font-family: system-ui, sans-serif;
            margin: 0 0 0.5rem;
          }
          .hg-entwurfsmappe .print-sheet-head .print-kicker {
            margin: 0 0 0.15rem;
          }
          .hg-entwurfsmappe .print-sheet-head h1 {
            font-size: 14pt;
            color: #1c1a18;
            margin: 0;
            line-height: 1.2;
          }
          .hg-entwurfsmappe .print-sheet-head p {
            font-size: 9pt;
            color: #5c5650;
            margin: 0.2rem 0 0;
          }
          .hg-entwurfsmappe .print-sheet-figure {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
            min-height: 0;
          }
          .hg-entwurfsmappe .print-sheet-figure img {
            display: block;
            max-width: 100%;
            max-height: 88vh;
            width: auto;
            height: auto;
            object-fit: contain;
            border: none;
            background: #fff;
          }
          .hg-entwurfsmappe .seitenfuss {
            display: block !important;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 0.65rem;
            color: #666;
            padding: 0.2rem 0;
            font-family: system-ui, sans-serif;
          }
          .hg-entwurfsmappe .seitenfuss::after {
            content: "Seite " counter(page);
          }
        }
      `}</style>

      <div className="shell">
        <nav className="nav no-print">
          <Link to={PLATFORM_ROUTES.projects}>← Projekte</Link>
          <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button type="button" className="btn-print" onClick={printMappe}>
              🖨️ Ganze Mappe
            </button>
            <Link to={HUNDRED_GENERATION_ROUTE}>Konzept Keramik</Link>
          </div>
        </nav>

        <div className="print-only print-mappe">
          <p className="print-kicker">100 Generationen · Chaos &amp; Code</p>
          <h1>Entwurfsmappe – Druckfassung</h1>
          <p className="print-meta">
            Alle Modelle mit Ansichten, Maßskizze (max. Höhe {HUNDRED_GENERATION_MAX_HOEHE_CM} cm) und
            Notizen. Zum Arbeiten am Tisch und mit dem Bruder.
          </p>
          {HUNDRED_GENERATION_MODELLE.map((m) => (
            <section key={m.id} className="print-block">
              <h2>
                {m.title} · {m.note} · {formatMassLabel(getMassForModell(m.id))}
              </h2>
              <p className="print-meta">{m.formHint}</p>
              {m.sketchSrc ? (
                <div className="print-views" style={{ marginBottom: '0.35rem' }}>
                  <figure>
                    <img src={m.sketchSrc} alt={`Skizze ${m.title}`} />
                    <figcaption>Handskizze</figcaption>
                  </figure>
                </div>
              ) : null}
              <div className="print-views">
                {m.ansichten.map((a) => (
                  <figure key={a.id}>
                    <img src={a.src} alt={`${m.title} ${a.label}`} />
                    <figcaption>{a.label}</figcaption>
                  </figure>
                ))}
              </div>
              <div className="print-mass-inline">
                <HundredGenerationMassSkizze
                  title={m.title}
                  mass={getMassForModell(m.id)}
                  imageSrc={m.src}
                  variant="print"
                />
              </div>
              {m.id === AHNENRASTER_BLATT.modellId ? (
                <div style={{ marginTop: '0.5rem', breakInside: 'avoid' }}>
                  <HundredGenerationAhnenrasterBlatt variant="print" />
                </div>
              ) : null}
              {notes[m.id]?.trim() ? (
                <p className="print-note">
                  <strong>Notizen:</strong> {notes[m.id]}
                </p>
              ) : (
                <p className="print-note">Notizen: —</p>
              )}
            </section>
          ))}
        </div>

        <div className="print-only print-vollformat">
          {printSheets.map((sheet, i) => (
            <section key={`${sheet.src}-${i}`} className="print-sheet">
              <div className="print-sheet-head">
                <p className="print-kicker">100 Generationen · Vollformat</p>
                <h1>{sheet.caption}</h1>
                {sheet.subtitle ? <p>{sheet.subtitle}</p> : null}
              </div>
              <figure className="print-sheet-figure">
                <img src={sheet.src} alt={sheet.caption} />
              </figure>
            </section>
          ))}
        </div>

        <div className="print-only print-mass">
          <section className="print-mass-sheet">
            <p className="print-kicker">100 Generationen · Maßskizze Werkstatt</p>
            <h1>
              {active.title} · max. Höhe {HUNDRED_GENERATION_MAX_HOEHE_CM} cm
            </h1>
            <p className="print-meta">
              {formatMassLabel(activeMass)} · geplante Endgröße (Schätzung)
            </p>
            <HundredGenerationMassSkizze
              title={active.title}
              mass={activeMass}
              imageSrc={active.src}
              variant="print"
            />
          </section>
        </div>

        <div className="print-only print-ahnenraster">
          <section className="print-ahnenraster-sheet">
            <HundredGenerationAhnenrasterBlatt variant="print" />
          </section>
        </div>

        <div className="no-print">
        <p className="kicker">100 Generationen · Arbeitsplatz</p>
        <h1>Entwurfsmappe</h1>
        <div className="chapters">
          <Link to={HUNDRED_GENERATION_ROUTE}>🏺 Keramik – Konzept</Link>
          <span className="is-active">🗂️ Entwurfsmappe</span>
          <Link to={HUNDRED_GENERATION_FLAECHE_ROUTE}>🖼️ Fläche</Link>
        </div>
        <p className="lede">
          Am Bild ziehen oder „weiter ›“ / „‹ zurück“: Vorne, Seite, Hinten, Schräg oben.
          Serie = Basisformen. <strong>Di Kurugu · Mythos</strong> = zu jedem Entwurf die Variante mit
          Axt-Form, Flecht-Textur und mythologischem Aspekt.
          <strong> Maßskizze</strong> = echte Vorne-Ansicht mit H/B/T (4. Ansicht) – Serie max.{' '}
          {HUNDRED_GENERATION_MAX_HOEHE_CM} cm.
          <strong> Formatblatt 4M</strong> = Ahnenraster / heiliges Muster (eigenes Blatt).
          <strong> Ganze Mappe</strong> = Übersicht inkl. Maß. <strong>Vollformat</strong> = ein Bild
          auf eine Seite.
        </p>

        <div className="gruppen" role="tablist" aria-label="Gruppen">
          <button
            type="button"
            className={gruppe === 'serie' ? 'is-on' : undefined}
            onClick={() => setGruppe('serie')}
          >
            Serie Chaos &amp; Code
          </button>
          <button
            type="button"
            className={gruppe === 'mythos' ? 'is-on' : undefined}
            onClick={() => setGruppe('mythos')}
          >
            Di Kurugu · Mythos
          </button>
          <button
            type="button"
            className={gruppe === 'handskizze' ? 'is-on' : undefined}
            onClick={() => setGruppe('handskizze')}
          >
            Deine Handskizzen
          </button>
        </div>

        <div className="model-tabs" role="tablist" aria-label="Modelle">
          {gefiltert.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={m.id === activeId}
              className={m.id === activeId ? 'is-on' : undefined}
              onClick={() => setActiveId(m.id)}
            >
              {m.title}
            </button>
          ))}
        </div>

        <div className={`work${active.sketchSrc ? '' : ' solo'}`}>
          {active.sketchSrc ? (
            <div className="card">
              <h2>Deine Skizze</h2>
              <a href={active.sketchSrc} target="_blank" rel="noopener noreferrer">
                <img src={active.sketchSrc} alt={`Skizze ${active.title}`} />
              </a>
              <div className="print-actions">
                <button
                  type="button"
                  className="btn-print"
                  onClick={() =>
                    printVollformat([
                      {
                        src: active.sketchSrc!,
                        caption: `${active.title} · Handskizze`,
                        subtitle: active.note,
                      },
                    ])
                  }
                >
                  🖨️ Vollformat
                </button>
              </div>
            </div>
          ) : null}

          <div className="card">
            <h2>Modell drehen</h2>
            <div className="ansicht-tabs" role="tablist" aria-label="Ansicht">
              {active.ansichten.map((a, i) => (
                <button
                  key={a.id}
                  type="button"
                  className={i === ansichtIdx ? 'is-on' : undefined}
                  onClick={() => setAnsichtIdx(i)}
                >
                  {a.label}
                </button>
              ))}
              <button
                type="button"
                className={isMassAnsicht ? 'is-on' : undefined}
                onClick={() => setAnsichtIdx(massAnsichtIdx)}
              >
                Maßskizze
              </button>
            </div>
            <KeramikDrehscheibe
              ansichten={active.ansichten}
              index={ansichtIdx}
              onIndexChange={setAnsichtIdx}
              title={active.title}
              trailingSlot={massTrailing}
            />
            <div className="print-actions">
              {isMassAnsicht ? (
                <button type="button" className="btn-print" onClick={printMassSkizze}>
                  🖨️ Maßskizze drucken
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-print"
                  disabled={!aktuelleAnsicht}
                  onClick={() => {
                    if (!aktuelleAnsicht) return
                    printVollformat([
                      {
                        src: aktuelleAnsicht.src,
                        caption: `${active.title} · ${aktuelleAnsicht.label}`,
                        subtitle: `${active.note} · ${active.formHint}`,
                      },
                    ])
                  }}
                >
                  🖨️ Diese Ansicht Vollformat
                </button>
              )}
              <button
                type="button"
                className="btn-print-ghost"
                onClick={() => {
                  const sheets: PrintSheet[] = []
                  if (active.sketchSrc) {
                    sheets.push({
                      src: active.sketchSrc,
                      caption: `${active.title} · Handskizze`,
                      subtitle: active.note,
                    })
                  }
                  for (const a of active.ansichten) {
                    sheets.push({
                      src: a.src,
                      caption: `${active.title} · ${a.label}`,
                      subtitle: `${active.note} · ${active.formHint}`,
                    })
                  }
                  printVollformat(sheets)
                }}
              >
                Alle Ansichten Vollformat
              </button>
            </div>
            <div className="thumb-row">
              {active.ansichten.map((a, i) => (
                <button
                  key={a.id}
                  type="button"
                  className={i === ansichtIdx ? 'is-on' : undefined}
                  onClick={() => setAnsichtIdx(i)}
                  aria-label={a.label}
                >
                  <img src={a.src} alt="" />
                  <span>{a.label}</span>
                </button>
              ))}
              <button
                type="button"
                className={`thumb-mass${isMassAnsicht ? ' is-on' : ''}`}
                onClick={() => setAnsichtIdx(massAnsichtIdx)}
                aria-label="Maßskizze"
              >
                <img src={active.src} alt="" />
                <span>
                  Maß · {massAnsichtIdx + 1}/{ansichtTotal}
                </span>
              </button>
            </div>
            <p className="hint">
              <strong style={{ color: 'var(--hg-ink)' }}>{active.title}</strong>
              {' · '}
              {active.note}. {active.formHint}
              {active.baseId ? (
                <>
                  {' '}
                  (Variante zu{' '}
                  {HUNDRED_GENERATION_MODELLE.find((m) => m.id === active.baseId)?.title ??
                    active.baseId}
                  )
                </>
              ) : null}
              {isMassAnsicht ? (
                <>
                  {' '}
                  · Geplante Endgröße {formatMassLabel(activeMass)} (ohne Sockel).
                </>
              ) : null}
            </p>
          </div>
        </div>

        <div className="card">
          <h2>Notizen zu diesem Modell</h2>
          <p className="hint">Bleiben auf diesem Mac (für dich und Bruder).</p>
          <textarea
            value={notes[activeId] ?? ''}
            onChange={(e) =>
              setNotes((prev) => ({ ...prev, [activeId]: e.target.value }))
            }
            placeholder="Maße, Ton, Brand, was noch fehlt …"
            aria-label={`Notizen ${active.title}`}
          />
        </div>

        {active.id === AHNENRASTER_BLATT.modellId ? (
          <div className="card" style={{ marginTop: '1rem' }} id="formatblatt-ahnenraster">
            <h2>Formatblatt · {AHNENRASTER_BLATT.title}</h2>
            <p className="hint" style={{ marginBottom: '0.75rem' }}>
              Eigenes Blatt für das heilige Muster – getrennt vom Objektkörper, zum Ritzen / Stempeln /
              Übertragen.
            </p>
            <HundredGenerationAhnenrasterBlatt variant="screen" />
            <div className="print-actions">
              <button type="button" className="btn-print" onClick={printAhnenrasterBlatt}>
                🖨️ Formatblatt drucken
              </button>
            </div>
          </div>
        ) : gruppe === 'mythos' ? (
          <div className="card" style={{ marginTop: '1rem' }}>
            <h2>Formatblatt · 4M Ahnenraster</h2>
            <p className="hint">
              Zum heiligen Muster gibt es ein eigenes Formatblatt (Werkstatt).
            </p>
            <div className="print-actions">
              <button
                type="button"
                className="btn-print"
                onClick={() => {
                  setGruppe('mythos')
                  setActiveId(AHNENRASTER_BLATT.modellId)
                }}
              >
                4M · Formatblatt öffnen
              </button>
            </div>
          </div>
        ) : null}

        <div className="card" style={{ marginTop: '1rem' }}>
          <h2>Übersichten</h2>
          <div className="ueber-grid">
            {HUNDRED_GENERATION_UEBERSICHTEN.map((u) => (
              <div key={u.id}>
                <a href={u.src} target="_blank" rel="noopener noreferrer">
                  <img src={u.src} alt={u.title} loading="lazy" />
                  <span>
                    {u.title} · {u.note}
                  </span>
                </a>
                <button
                  type="button"
                  className="btn-print-ghost"
                  style={{ alignSelf: 'flex-start', margin: '0 0.5rem 0.5rem' }}
                  onClick={() =>
                    printVollformat([
                      {
                        src: u.src,
                        caption: u.title,
                        subtitle: u.note,
                      },
                    ])
                  }
                >
                  🖨️ Vollformat
                </button>
              </div>
            ))}
          </div>
        </div>

        <footer className="foot">
          Entwurfsmappe · Maßskizze max. {HUNDRED_GENERATION_MAX_HOEHE_CM} cm Höhe · Drehen über
          Foto-Ansichten · Ganze Mappe oder Einzelbild Vollformat.
        </footer>
        </div>
        <div className="seitenfuss" aria-hidden />
      </div>
    </div>
  )
}
