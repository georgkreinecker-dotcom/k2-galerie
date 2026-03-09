/**
 * K2 Markt – Die neue Schicht (funktionierend, nicht nur Bild).
 * Drei Zonen: Quellen → KI/Agenten (Erzeugen) → Ausgabe (Flyer, Presse, Markt).
 * Rechte Seite wie Vision; Punkte leuchten, wenn KI arbeitet.
 */

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'
import {
  getMomentFromQuellenLive,
  fetchMok2Ideen,
  type Mok2Idee,
} from '../utils/k2MarktQuellen'
import {
  momentToFlyerEntwurf,
  erfuelltDoDFlyer,
  type ProduktMoment,
  type FlyerEntwurf,
} from '../utils/k2MarktFlyerAgent'

const MOMENTE_LOCAL_KEY = 'k2-markt-momente'

function loadLocalMomente(): ProduktMoment[] {
  try {
    const raw = localStorage.getItem(MOMENTE_LOCAL_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveLocalMomente(list: ProduktMoment[]): void {
  try {
    localStorage.setItem(MOMENTE_LOCAL_KEY, JSON.stringify(list))
  } catch (_) {}
}

const KAMPAGNE_DOCS = [
  { file: '', name: '– Keine Kampagne –' },
  { file: 'MARKETING-STRATEGIE-AUTOMATISIERTER-VERTRIEB.md', name: 'Marketing-Strategie' },
  { file: 'KOMMUNIKATION-FLYER-HANDOUT.md', name: 'Flyer / Handout' },
  { file: 'KOMMUNIKATION-EMAIL-VORLAGEN.md', name: 'E-Mail-Vorlagen' },
]

export default function K2MarktSchichtPage() {
  const navigate = useNavigate()
  const [mok2Ideen, setMok2Ideen] = useState<Mok2Idee[]>([])
  const [selectedIdeeId, setSelectedIdeeId] = useState<string>('nur-slogan')
  const [kampagneDoc, setKampagneDoc] = useState<string>('')
  const [erzeugenLoading, setErzeugenLoading] = useState(false)
  const [moment, setMoment] = useState<ProduktMoment | null>(null)
  const [entwurf, setEntwurf] = useState<FlyerEntwurf | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchMok2Ideen().then((list) => {
      if (!cancelled) setMok2Ideen(list)
    })
    return () => { cancelled = true }
  }, [])

  const handleErzeugen = async () => {
    setErzeugenLoading(true)
    setMoment(null)
    setEntwurf(null)
    try {
      const m = await getMomentFromQuellenLive({
        mok2IdeenId: selectedIdeeId,
        kampagneDoc: kampagneDoc || undefined,
      })
      setMoment(m)
      setEntwurf(momentToFlyerEntwurf(m))
    } catch (_) {
      setMoment(null)
      setEntwurf(null)
    } finally {
      setErzeugenLoading(false)
    }
  }

  const handleZumTor = () => {
    if (!moment) return
    const list = loadLocalMomente()
    const exists = list.some((x) => x.id === moment.id)
    if (!exists) {
      list.unshift(moment)
      saveLocalMomente(list)
    }
    navigate(PROJECT_ROUTES['k2-markt'].tor, { state: { selectedMomentId: moment.id } })
  }

  const dodOk = entwurf ? erfuelltDoDFlyer(entwurf) : false

  const glassNode = (aktiv: boolean) => ({
    padding: '0.9rem 1rem',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${aktiv ? 'rgba(20, 184, 166, 0.45)' : 'rgba(20, 184, 166, 0.2)'}`,
    borderRadius: 14,
    boxShadow: aktiv ? '0 0 24px rgba(20, 184, 166, 0.2), inset 0 1px 0 rgba(255,255,255,0.06)' : '0 0 16px rgba(20, 184, 166, 0.08), inset 0 1px 0 rgba(255,255,255,0.04)',
  })

  const flowLine = { height: 2, background: 'linear-gradient(90deg, transparent, rgba(20, 184, 166, 0.5), transparent)', borderRadius: 1, position: 'relative' as const, overflow: 'hidden' }

  return (
    <div className="mission-wrapper" style={{ minHeight: '100vh', background: '#0a0e17' }}>
      <style>{`
        @keyframes schicht-dot-glow {
          0%, 100% { opacity: 0.6; transform: scale(1); box-shadow: 0 0 8px rgba(20, 184, 166, 0.6); }
          50% { opacity: 1; transform: scale(1.2); box-shadow: 0 0 18px rgba(20, 184, 166, 0.95); }
        }
        @keyframes schicht-flow-dot {
          0% { left: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
        .schicht-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(20, 184, 166, 0.8); }
        .schicht-dot.aktiv { animation: schicht-dot-glow 0.9s ease-in-out infinite; }
        .schicht-flow-dot { position: absolute; width: 8px; height: 8px; border-radius: 50%; background: #5eead4; box-shadow: 0 0 12px rgba(94, 234, 212, 0.9); top: -3px; animation: schicht-flow-dot 2s ease-in-out infinite; }
      `}</style>
      <div className="viewport" style={{ padding: '1.5rem', maxWidth: 960, margin: '0 auto' }}>
        <nav className="no-print" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
          <Link to={PROJECT_ROUTES['k2-markt'].uebersicht} style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>← Übersicht</Link>
          <Link to={PROJECT_ROUTES['k2-markt'].mappe} style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Mappe</Link>
          <Link to={PROJECT_ROUTES['k2-markt'].tor} style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Zum Tor</Link>
        </nav>

        <h1 style={{ margin: '0 0 1rem', fontSize: '1.6rem', fontWeight: 700, color: '#fff', textAlign: 'center', letterSpacing: '-0.02em' }}>
          Heute auf den Markt
        </h1>

        {/* Glas-Fenster wie im Bild: eigener Rahmen, Titel „Kreativ-Schicht“ */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(20px)',
          borderRadius: 20,
          border: '1px solid rgba(20, 184, 166, 0.18)',
          boxShadow: '0 0 60px rgba(20, 184, 166, 0.12), 0 25px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
          overflow: 'hidden',
        }}>
          {/* Fenster-Titelleiste */}
          <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'rgba(255,255,255,0.95)', letterSpacing: '0.02em' }}>Kreativ-Schicht</span>
          </div>

          {/* Inhalt: Links | Linien | Mitte | Linien | Rechts */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 56px minmax(200px, 240px) 56px 1fr',
            gap: 0,
            alignItems: 'stretch',
            padding: '1.5rem 1.25rem',
            minHeight: 380,
          }}>
            {/* Links: 4 Nodes – Glas, Icons wie im Bild */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', justifyContent: 'center' }}>
              <div style={glassNode(true)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>
                  <span style={{ opacity: 0.9 }}>📁</span> Quellen
                </div>
              </div>
              <div style={glassNode(false)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.95)', fontSize: '0.85rem', marginBottom: '0.4rem' }}><span style={{ opacity: 0.9 }}>{'</>'}</span> mök2</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', maxHeight: 120, overflowY: 'auto' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.78rem', color: 'rgba(255,255,255,0.9)' }}>
                    <input type="radio" name="idee" checked={selectedIdeeId === 'nur-slogan'} onChange={() => setSelectedIdeeId('nur-slogan')} /> Nur Slogan
                  </label>
                  {mok2Ideen.slice(0, 6).map((i) => (
                    <label key={i.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.78rem', color: 'rgba(255,255,255,0.9)' }}>
                      <input type="radio" name="idee" checked={selectedIdeeId === i.id} onChange={() => setSelectedIdeeId(i.id)} /> {i.titel}
                    </label>
                  ))}
                </div>
              </div>
              <div style={glassNode(false)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.95)', fontSize: '0.85rem', marginBottom: '0.35rem' }}><span style={{ opacity: 0.9 }}>📢</span> Kampagne</div>
                <select value={kampagneDoc} onChange={(e) => setKampagneDoc(e.target.value)} style={{ width: '100%', padding: '0.35rem 0.5rem', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#fff', fontSize: '0.78rem' }}>
                  {KAMPAGNE_DOCS.map((d) => <option key={d.file} value={d.file}>{d.name}</option>)}
                </select>
              </div>
              <Link to={PROJECT_ROUTES['k2-markt'].mappe} style={{ ...glassNode(false), color: '#fff', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ opacity: 0.9 }}>📁</span> Mappe
              </Link>
            </div>

            {/* Verbindungslinien links → Mitte: sichtbare Linien + laufende Punkte */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center', padding: '0 4px' }}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={flowLine}>
                  <div className="schicht-flow-dot" style={{ animationDelay: `${i * 0.35}s` }} />
                </div>
              ))}
            </div>

            {/* Mitte: stark leuchtende Kugel + KI/AGENTEN + KREATIV-SCHICHT */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0.5rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.95)', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>KI / AGENTEN</div>
              <div style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: 'radial-gradient(circle at 32% 28%, rgba(94, 234, 212, 0.7), rgba(20, 184, 166, 0.35) 40%, rgba(6, 95, 70, 0.2) 100%)',
                boxShadow: '0 0 50px rgba(20, 184, 166, 0.5), 0 0 90px rgba(20, 184, 166, 0.25), inset 0 0 40px rgba(94, 234, 212, 0.2)',
                border: '1px solid rgba(94, 234, 212, 0.4)',
              }} />
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#5eead4', letterSpacing: '0.08em', marginTop: '0.5rem' }}>KREATIV-SCHICHT</div>
              <button type="button" onClick={handleErzeugen} disabled={erzeugenLoading} style={{ marginTop: '0.9rem', padding: '0.5rem 1rem', background: erzeugenLoading ? 'rgba(255,255,255,0.15)' : 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)', color: '#fff', border: 'none', borderRadius: 10, fontSize: '0.85rem', fontWeight: 600, cursor: erzeugenLoading ? 'wait' : 'pointer', boxShadow: '0 0 20px rgba(20, 184, 166, 0.35)' }}>
                {erzeugenLoading ? '⏳ Erzeuge…' : '→ Erzeugen'}
              </button>
              <div style={{ display: 'flex', gap: 4, marginTop: '0.5rem', justifyContent: 'center' }}>
                {[0, 1, 2, 3, 4].map((j) => (
                  <div key={j} className={`schicht-dot ${erzeugenLoading ? 'aktiv' : ''}`} style={erzeugenLoading ? { animationDelay: `${j * 0.12}s` } : { opacity: 0.35 }} />
                ))}
              </div>
            </div>

            {/* Verbindungslinien Mitte → rechts: 4 Linien für 4 Nodes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center', padding: '0 4px' }}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={flowLine}>
                  <div className="schicht-flow-dot" style={{ animationDelay: `${i * 0.4}s` }} />
                </div>
              ))}
            </div>

            {/* Rechts: 4 Ausgabe-Nodes – Flyer, Presse, Markt, Eventplan (Links in Admin) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', justifyContent: 'center' }}>
              <div style={glassNode(!!entwurf)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1rem' }}>→▭</span>
                  <strong style={{ color: '#f0fdfa', fontSize: '0.9rem' }}>Flyer</strong>
                </div>
                {!entwurf && <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)' }}>Erzeugen → Entwurf erscheint hier.</p>}
                {entwurf && (
                  <>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#f0fdfa', fontWeight: 600 }}>{moment?.titel}</p>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.35 }}>{entwurf.bodyText.slice(0, 70)}…</p>
                    <p style={{ margin: '0.4rem 0 0', fontSize: '0.78rem', color: dodOk ? '#86efac' : 'rgba(255,255,255,0.55)' }}>{dodOk ? '✅ DoD erfüllt' : '○ DoD am Tor prüfen'}</p>
                    <button type="button" onClick={handleZumTor} style={{ marginTop: '0.6rem', width: '100%', padding: '0.5rem', background: 'linear-gradient(135deg, #22c55e 0%, #0d9488 100%)', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                      🚦 Zum Tor
                    </button>
                  </>
                )}
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem' }}>
                  <Link to="/admin?tab=eventplan" style={{ color: 'rgba(94, 234, 212, 0.9)', textDecoration: 'none' }}>Dokumentvorlagen (Events) →</Link>
                </p>
              </div>
              <Link to="/admin?tab=presse" style={{ textDecoration: 'none' }}>
                <div style={glassNode(false)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1rem' }}>→▭</span>
                    <strong style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem' }}>Presse</strong>
                  </div>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)' }}>Presse & Medien, Medientool</p>
                </div>
              </Link>
              <Link to="/admin?tab=eventplan&eventplan=öffentlichkeitsarbeit" style={{ textDecoration: 'none' }}>
                <div style={glassNode(false)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1rem' }}>→▭</span>
                    <strong style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem' }}>Markt</strong>
                  </div>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)' }}>Marktauftritt, Öffentlichkeitsarbeit</p>
                </div>
              </Link>
              <Link to="/admin?tab=eventplan" style={{ textDecoration: 'none' }}>
                <div style={glassNode(false)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1rem' }}>→▭</span>
                    <strong style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem' }}>Eventplan</strong>
                  </div>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)' }}>Gesamt-Eventplanung, Events & Ausstellungen</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        <footer className="no-print" style={{ marginTop: '1.5rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>
          <Link to={PROJECT_ROUTES['k2-markt'].uebersicht} style={{ color: 'inherit', textDecoration: 'none', marginRight: '1rem' }}>Übersicht</Link>
          <Link to={PROJECT_ROUTES['k2-markt'].tor} style={{ color: 'inherit', textDecoration: 'none' }}>Zum Tor</Link>
        </footer>
      </div>
    </div>
  )
}
