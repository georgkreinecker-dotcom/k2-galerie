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
import { KeramikDrehscheibe } from '../components/hundredGeneration/KeramikDrehscheibe'
import '../App.css'

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

  return (
    <div className="hg-entwurfsmappe">
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
        .hg-entwurfsmappe .thumb-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.75rem;
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
        .hg-entwurfsmappe .ueber-grid a {
          display: block;
          color: inherit;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          overflow: hidden;
          background: rgba(0,0,0,0.2);
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
        .hg-entwurfsmappe .print-only { display: none; }
        .hg-entwurfsmappe .seitenfuss { display: none; }
        @media print {
          @page { margin: 12mm 14mm 14mm 14mm; }
          body { background: #fff !important; }
          .hg-entwurfsmappe {
            background: #fff !important;
            color: #1c1a18 !important;
            font-size: 10.5pt;
          }
          .hg-entwurfsmappe .no-print { display: none !important; }
          .hg-entwurfsmappe .print-only { display: block !important; }
          .hg-entwurfsmappe .shell { max-width: none; padding: 0; }
          .hg-entwurfsmappe h1 { color: #1c1a18; font-size: 16pt; margin: 0 0 0.4rem; }
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
            <button type="button" className="btn-print" onClick={() => window.print()}>
              🖨️ Drucken
            </button>
            <Link to={HUNDRED_GENERATION_ROUTE}>Konzept Keramik</Link>
          </div>
        </nav>

        <div className="print-only">
          <p className="print-kicker">100 Generationen · Chaos &amp; Code</p>
          <h1>Entwurfsmappe – Druckfassung</h1>
          <p className="print-meta">
            Alle Modelle mit Ansichten (Vorne / Seite / Hinten / Schräg) und Notizen. Zum Arbeiten
            am Tisch und mit dem Bruder.
          </p>
          {HUNDRED_GENERATION_MODELLE.map((m) => (
            <section key={m.id} className="print-block">
              <h2>
                {m.title} · {m.note}
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
          Echte Keramik-Fotos – so siehst du alle Ansichten zum Formen. Button „Drucken“ = ganze Mappe.
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
            </div>
            <KeramikDrehscheibe
              ansichten={active.ansichten}
              index={ansichtIdx}
              onIndexChange={setAnsichtIdx}
              title={active.title}
            />
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
            </div>
            <p className="hint">
              <strong style={{ color: 'var(--hg-ink)' }}>{active.title}</strong>
              {' · '}
              {active.note}. {active.formHint}
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

        <div className="card" style={{ marginTop: '1rem' }}>
          <h2>Übersichten</h2>
          <div className="ueber-grid">
            {HUNDRED_GENERATION_UEBERSICHTEN.map((u) => (
              <a key={u.id} href={u.src} target="_blank" rel="noopener noreferrer">
                <img src={u.src} alt={u.title} loading="lazy" />
                <span>
                  {u.title} · {u.note}
                </span>
              </a>
            ))}
          </div>
        </div>

        <footer className="foot">
          Entwurfsmappe · Drehen über Foto-Ansichten · Drucken für den Tisch. Echtes Mesh erst mit Scan/GLB.
        </footer>
        </div>
        <div className="seitenfuss" aria-hidden />
      </div>
    </div>
  )
}
