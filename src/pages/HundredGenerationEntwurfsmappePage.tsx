import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
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
import '../App.css'

const KeramikModell3D = lazy(() => import('../components/hundredGeneration/KeramikModell3D'))

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
 * Arbeitsmappe: Handskizze / KI-Bild + drehbares 3D-Konzeptmodell + Notizen.
 */
export default function HundredGenerationEntwurfsmappePage() {
  const [gruppe, setGruppe] = useState<HundredGenerationEntwurfGruppe>('handskizze')
  const gefiltert = useMemo(
    () => HUNDRED_GENERATION_MODELLE.filter((m) => m.gruppe === gruppe),
    [gruppe]
  )
  const [activeId, setActiveId] = useState<HundredGenerationModellId>('skizze-zwei-tuerme')
  const [show3d, setShow3d] = useState(true)
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
          max-width: 58rem;
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
        .hg-entwurfsmappe .gruppen {
          display: flex;
          gap: 0.5rem;
          margin: 0 0 0.85rem;
          font-family: system-ui, sans-serif;
        }
        .hg-entwurfsmappe .gruppen button {
          appearance: none;
          border: 1px solid var(--hg-line);
          background: rgba(255,255,255,0.04);
          color: var(--hg-muted);
          padding: 0.5rem 0.9rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.85rem;
        }
        .hg-entwurfsmappe .gruppen button.is-on {
          background: rgba(212, 160, 23, 0.22);
          color: var(--hg-ink);
          border-color: var(--hg-accent);
          font-weight: 600;
        }
        .hg-entwurfsmappe .model-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
          margin: 0 0 1rem;
          font-family: system-ui, sans-serif;
        }
        .hg-entwurfsmappe .model-tabs button {
          appearance: none;
          border: 1px solid var(--hg-line);
          background: rgba(255,255,255,0.04);
          color: var(--hg-muted);
          padding: 0.45rem 0.7rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.8rem;
        }
        .hg-entwurfsmappe .model-tabs button.is-on {
          background: rgba(212, 160, 23, 0.22);
          color: var(--hg-ink);
          border-color: var(--hg-accent);
          font-weight: 600;
        }
        .hg-entwurfsmappe .work {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }
        .hg-entwurfsmappe .work.has-skizze {
          grid-template-columns: 1fr 1fr 1.15fr;
        }
        @media (max-width: 980px) {
          .hg-entwurfsmappe .work,
          .hg-entwurfsmappe .work.has-skizze { grid-template-columns: 1fr; }
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
        .hg-entwurfsmappe .toggle3d {
          appearance: none;
          border: 1px solid var(--hg-line);
          background: rgba(212, 160, 23, 0.15);
          color: var(--hg-ink);
          padding: 0.4rem 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          font-family: system-ui, sans-serif;
          font-size: 0.82rem;
          margin-bottom: 0.65rem;
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
      `}</style>

      <div className="shell">
        <nav className="nav">
          <Link to={PLATFORM_ROUTES.projects}>← Projekte</Link>
          <Link to={HUNDRED_GENERATION_ROUTE}>Konzept Keramik</Link>
        </nav>

        <p className="kicker">100 Generationen · Arbeitsplatz</p>
        <h1>Entwurfsmappe</h1>
        <div className="chapters">
          <Link to={HUNDRED_GENERATION_ROUTE}>🏺 Keramik – Konzept</Link>
          <span className="is-active">🗂️ Entwurfsmappe</span>
          <Link to={HUNDRED_GENERATION_FLAECHE_ROUTE}>🖼️ Fläche</Link>
        </div>
        <p className="lede">
          Handskizzen von dir + KI-Umsetzung als Keramikfoto + drehbares 3D.
          Notizen bleiben auf diesem Mac.
        </p>

        <div className="gruppen" role="tablist" aria-label="Gruppen">
          <button
            type="button"
            className={gruppe === 'handskizze' ? 'is-on' : undefined}
            onClick={() => setGruppe('handskizze')}
          >
            Deine Handskizzen
          </button>
          <button
            type="button"
            className={gruppe === 'serie' ? 'is-on' : undefined}
            onClick={() => setGruppe('serie')}
          >
            Serie Chaos &amp; Code
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

        <div className={`work${active.sketchSrc ? ' has-skizze' : ''}`}>
          {active.sketchSrc ? (
            <div className="card">
              <h2>Deine Skizze</h2>
              <a href={active.sketchSrc} target="_blank" rel="noopener noreferrer">
                <img src={active.sketchSrc} alt={`Skizze ${active.title}`} />
              </a>
            </div>
          ) : null}

          <div className="card">
            <h2>KI als Keramik</h2>
            <a href={active.src} target="_blank" rel="noopener noreferrer">
              <img src={active.src} alt={active.title} />
            </a>
            <p className="hint">
              <strong style={{ color: 'var(--hg-ink)' }}>{active.title}</strong>
              {' · '}
              {active.note}. {active.formHint}
            </p>
          </div>

          <div className="card">
            <h2>3D drehbar</h2>
            <button type="button" className="toggle3d" onClick={() => setShow3d((v) => !v)}>
              {show3d ? '3D ausblenden' : '3D anzeigen'}
            </button>
            {show3d ? (
              <Suspense
                fallback={
                  <p className="hint" style={{ minHeight: 280 }}>
                    3D wird geladen …
                  </p>
                }
              >
                <KeramikModell3D key={activeId} modelId={activeId} />
              </Suspense>
            ) : (
              <p className="hint">3D ausgeblendet – schont Rechner/Preview.</p>
            )}
          </div>
        </div>

        <div className="card">
          <h2>Notizen zu diesem Modell</h2>
          <p className="hint">
            Bleiben auf diesem Mac gespeichert (Arbeitsnotizen für dich und Bruder).
          </p>
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
          Entwurfsmappe · Handskizzen + KI + 3D-Konzept. Später echte Scans/GLB möglich.
        </footer>
      </div>
    </div>
  )
}
