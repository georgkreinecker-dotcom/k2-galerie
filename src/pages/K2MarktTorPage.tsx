/**
 * K2 Markt – Qualitäts-Tor (Phase 3).
 * Zeigt Flyer-Entwurf, DoD-Prüfung, Button „Freigeben“.
 * Momente aus mök2 + Kampagne speisen → daraus Momente erzeugen, die umgesetzt werden können.
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PROJECT_ROUTES, K2_GALERIE_APF_EINSTIEG } from '../config/navigation'
import {
  momentToFlyerEntwurf,
  erfuelltDoDFlyer,
  FLYER_TEMPLATE_ID,
  type ProduktMoment,
  type FlyerEntwurf,
  type FreigabeEintrag,
} from '../utils/k2MarktFlyerAgent'
import {
  getMomentFromQuellenLive,
  getMok2Quellen,
  getKontaktFromStammdaten,
  fetchKampagneDocPreview,
  buildMomentFromQuellen,
  fetchMok2Ideen,
  type Mok2Idee,
} from '../utils/k2MarktQuellen'

const MOMENTE_URL = '/k2-markt/produkt-momente.json'
const MOMENTE_LOCAL_KEY = 'k2-markt-momente'
const FREIGABEN_KEY = 'k2-markt-freigaben'
const MAX_FREIGABEN_ANZEIGE = 10

/** Kampagne-Dokumente (gleiche Liste wie KampagneMarketingStrategiePage). */
const KAMPAGNE_DOCS = [
  { file: '00-INDEX.md', name: 'Inhaltsverzeichnis' },
  { file: 'AUFTRAG-MARKETING-STRATEGIE-ZWEI-ZWEIGE.md', name: 'Auftrag (Spezifikation)' },
  { file: 'MARKETING-STRATEGIE-AUTOMATISIERTER-VERTRIEB.md', name: 'Marketing-Strategie' },
  { file: 'KOMMUNIKATION-DOKUMENTE-STRUKTUR.md', name: 'Kommunikations-Struktur' },
  { file: 'KOMMUNIKATION-VORLAGE-ANSPRACHE-KUENSTLER-VEREIN.md', name: 'Ansprache Künstler:in / Verein' },
  { file: 'KOMMUNIKATION-FLYER-HANDOUT.md', name: 'Flyer / Handout' },
  { file: 'KOMMUNIKATION-EMAIL-VORLAGEN.md', name: 'E-Mail-Vorlagen' },
  { file: 'KOMMUNIKATION-FERTIGE-BEISPIELE.md', name: 'Fertige Beispiele (redigiert)' },
] as const

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

function loadFreigabenLog(): FreigabeEintrag[] {
  try {
    const raw = localStorage.getItem(FREIGABEN_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function appendFreigabe(entry: FreigabeEintrag): void {
  const log = loadFreigabenLog()
  log.unshift(entry)
  const max = 200
  const trimmed = log.slice(0, max)
  try {
    localStorage.setItem(FREIGABEN_KEY, JSON.stringify(trimmed))
  } catch {
    // Quota oder Lesefehler – still
  }
}

export default function K2MarktTorPage() {
  const [momente, setMomente] = useState<ProduktMoment[]>([])
  const [entwurf, setEntwurf] = useState<FlyerEntwurf | null>(null)
  const [loading, setLoading] = useState(true)
  const [fehler, setFehler] = useState<string | null>(null)
  const [freigegeben, setFreigegeben] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [freigabenLog, setFreigabenLog] = useState<FreigabeEintrag[]>(() => loadFreigabenLog())
  const [newMoment, setNewMoment] = useState<ProduktMoment | null>(null)
  const [speisenLoading, setSpeisenLoading] = useState(false)
  const [kampagneDocFile, setKampagneDocFile] = useState<string>('')
  /** "live" = Entwurf immer aus Quellen (ein Dropdown → sofort aktuell); "saved" = aus Liste wählen */
  const [modus, setModus] = useState<'live' | 'saved'>('live')
  /** Im Live-Modus: gewählte mök2-Idee (Basis aus Brainstorming) */
  const [liveMok2IdeenId, setLiveMok2IdeenId] = useState<string>('nur-slogan')
  /** Im Live-Modus: gewähltes Kampagne-Dokument (optional) */
  const [liveKampagneDoc, setLiveKampagneDoc] = useState<string>('')
  const [mok2Ideen, setMok2Ideen] = useState<Mok2Idee[]>([])
  const [liveMoment, setLiveMoment] = useState<ProduktMoment | null>(null)
  const [liveLoading, setLiveLoading] = useState(false)
  const [resolveLoading, setResolveLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setFehler(null)
    Promise.all([
      fetch(MOMENTE_URL).then((r) => (r.ok ? r.json() : [])),
      Promise.resolve(loadLocalMomente()),
    ])
      .then(([staticData, localList]: [ProduktMoment[], ProduktMoment[]]) => {
        if (cancelled) return
        const byId = new Map<string, ProduktMoment>()
        ;(Array.isArray(staticData) ? staticData : []).forEach((m) => byId.set(m.id, m))
        localList.forEach((m) => byId.set(m.id, m))
        const merged = Array.from(byId.values())
        setMomente(merged)
        const first = merged[0]
        if (first) {
          setSelectedId(first.id)
          setEntwurf(momentToFlyerEntwurf(first))
        } else {
          setEntwurf(null)
        }
      })
      .catch((e) => {
        if (!cancelled) setFehler(e instanceof Error ? e.message : String(e))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  /** Live-Modus: mök2-Ideen einmal laden (Brainstorming-Quellen). */
  useEffect(() => {
    if (modus !== 'live') return
    let cancelled = false
    fetchMok2Ideen().then((list) => {
      if (!cancelled) setMok2Ideen(list)
    })
    return () => { cancelled = true }
  }, [modus])

  /** Live-Modus: Entwurf immer aus aktuellen Quellen (mök2-Idee + optional Kampagne). */
  useEffect(() => {
    if (modus !== 'live') return
    let cancelled = false
    setLiveLoading(true)
    getMomentFromQuellenLive({ mok2IdeenId: liveMok2IdeenId, kampagneDoc: liveKampagneDoc || undefined })
      .then((m) => {
        if (cancelled) return
        setLiveMoment(m)
        setEntwurf(momentToFlyerEntwurf(m))
      })
      .finally(() => {
        if (!cancelled) setLiveLoading(false)
      })
    return () => { cancelled = true }
  }, [modus, liveMok2IdeenId, liveKampagneDoc])

  /** Gespeicherte Momente: bei Auswahl mit source → live auflösen, sonst gespeicherte Kopie. */
  useEffect(() => {
    if (modus !== 'saved' || !selectedId || momente.length === 0) return
    const m = momente.find((x) => x.id === selectedId)
    if (!m) return
    if (m.source?.kampagneDoc || m.source?.mok2IdeenId) {
      let cancelled = false
      setResolveLoading(true)
      getMomentFromQuellenLive({ mok2IdeenId: m.source.mok2IdeenId, kampagneDoc: m.source.kampagneDoc })
        .then((resolved) => {
          if (cancelled) return
          setEntwurf(momentToFlyerEntwurf(resolved))
        })
        .finally(() => {
          if (!cancelled) setResolveLoading(false)
        })
      return () => { cancelled = true }
    }
    setEntwurf(momentToFlyerEntwurf(m))
  }, [modus, selectedId, momente])

  /** Aktueller Moment für Anzeige/Freigabe (im Live-Modus = liveMoment, sonst gewählter aus Liste). */
  const currentMomentForDisplay =
    modus === 'live' ? liveMoment : momente.find((x) => x.id === selectedId) ?? null

  const dod = entwurf ? erfuelltDoDFlyer(entwurf) : null

  if (loading) {
    return (
      <div className="mission-wrapper">
        <div className="viewport" style={{ padding: '1.5rem 2rem' }}>
          <p style={{ color: '#5ffbf1' }}>Lade Produkt-Momente …</p>
        </div>
      </div>
    )
  }

  if (fehler) {
    return (
      <div className="mission-wrapper">
        <div className="viewport" style={{ padding: '1.5rem 2rem' }}>
          <p style={{ color: '#f87171' }}>{fehler}</p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
            <Link to={K2_GALERIE_APF_EINSTIEG} style={{ color: '#5ffbf1', textDecoration: 'none', fontSize: '0.9rem' }}>← K2 Galerie</Link>
            <Link to={PROJECT_ROUTES['k2-markt'].home} style={{ color: 'rgba(95,251,241,0.85)', textDecoration: 'none', fontSize: '0.9rem' }}>🎯 Arbeitsoberfläche</Link>
            <Link to={PROJECT_ROUTES['k2-galerie'].k2Markt} style={{ color: 'rgba(95,251,241,0.85)', textDecoration: 'none', fontSize: '0.9rem' }}>K2 Markt Mappe</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mission-wrapper">
      <div className="viewport" style={{ padding: '1.5rem 2rem' }}>
        <header className="no-print" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ margin: 0, color: '#5ffbf1', fontSize: '1.75rem' }}>🚦 K2 Markt – Qualitäts-Tor</h1>
            <p className="meta" style={{ marginTop: '0.35rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
              Entwurf prüfen (DoD Flyer), dann freigeben – erst dann marktfähig.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '0.75rem' }}>
            <Link to={K2_GALERIE_APF_EINSTIEG} style={{ color: '#5ffbf1', textDecoration: 'none', fontSize: '0.9rem' }}>← K2 Galerie</Link>
            <Link to={PROJECT_ROUTES['k2-markt'].home} style={{ color: 'rgba(95,251,241,0.85)', textDecoration: 'none', fontSize: '0.9rem' }}>🎯 Arbeitsoberfläche</Link>
            <Link to={PROJECT_ROUTES['k2-galerie'].k2Markt} style={{ color: 'rgba(95,251,241,0.85)', textDecoration: 'none', fontSize: '0.9rem' }}>K2 Markt Mappe</Link>
            <Link to={PROJECT_ROUTES['k2-galerie'].kampagneMarketingStrategie} style={{ color: 'rgba(95,251,241,0.85)', textDecoration: 'none', fontSize: '0.9rem' }}>Kampagne Marketing-Strategie</Link>
          </div>
        </header>

        {/* Modus: Live aus Quellen (dynamisch) oder Gespeicherte Momente */}
        <section className="no-print" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem', background: 'rgba(95,251,241,0.06)', border: '1px solid rgba(95,251,241,0.25)', borderRadius: 12 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>Quelle:</span>
            <button
              type="button"
              onClick={() => setModus('live')}
              style={{
                padding: '0.4rem 0.75rem',
                background: modus === 'live' ? 'rgba(13,148,136,0.5)' : 'transparent',
                color: '#5ffbf1',
                border: `1px solid ${modus === 'live' ? '#0d9488' : 'rgba(95,251,241,0.35)'}`,
                borderRadius: 8,
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              Live aus mök2 & Kampagne
            </button>
            <button
              type="button"
              onClick={() => setModus('saved')}
              style={{
                padding: '0.4rem 0.75rem',
                background: modus === 'saved' ? 'rgba(13,148,136,0.5)' : 'transparent',
                color: '#5ffbf1',
                border: `1px solid ${modus === 'saved' ? '#0d9488' : 'rgba(95,251,241,0.35)'}`,
                borderRadius: 8,
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              Gespeicherte Momente
            </button>
          </div>

          {modus === 'live' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
              <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>mök2-Idee (Basis):</label>
              <select
                value={liveMok2IdeenId}
                onChange={(e) => setLiveMok2IdeenId(e.target.value)}
                style={{ background: '#1e293b', color: '#fff', border: '1px solid rgba(95,251,241,0.3)', borderRadius: 6, padding: '0.4rem 0.6rem', fontSize: '0.88rem' }}
              >
                {mok2Ideen.length === 0 && <option value="nur-slogan">Nur Slogan & Botschaft</option>}
                {mok2Ideen.map((i) => (
                  <option key={i.id} value={i.id}>{i.titel}</option>
                ))}
              </select>
              <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>Kampagne (optional):</label>
              <select
                value={liveKampagneDoc}
                onChange={(e) => setLiveKampagneDoc(e.target.value)}
                style={{ background: '#1e293b', color: '#fff', border: '1px solid rgba(95,251,241,0.3)', borderRadius: 6, padding: '0.4rem 0.6rem', fontSize: '0.88rem' }}
              >
                <option value="">–</option>
                {KAMPAGNE_DOCS.filter((d) => d.file !== '00-INDEX.md').map((d) => (
                  <option key={d.file} value={d.file}>{d.name}</option>
                ))}
              </select>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Entwurf immer aus aktuellen Quellen – Ideen aus mök2 → medial umsetzbar.</span>
              <button
                type="button"
                onClick={() => {
                  const m = liveMoment
                  if (!m) return
                  const list = loadLocalMomente()
                  const toSave = { ...m, id: `ref-${m.id}`, source: { kampagneDoc: liveKampagneDoc || undefined, mok2IdeenId: liveMok2IdeenId !== 'nur-slogan' ? liveMok2IdeenId : undefined } }
                  list.push(toSave)
                  saveLocalMomente(list)
                  setMomente((prev) => { const byId = new Map(prev.map((x) => [x.id, x])); byId.set(toSave.id, toSave); return Array.from(byId.values()) })
                }}
                disabled={!liveMoment || liveLoading}
                style={{ padding: '0.35rem 0.75rem', background: 'rgba(34,197,94,0.3)', color: '#86efac', border: '1px solid rgba(34,197,94,0.5)', borderRadius: 6, fontSize: '0.82rem', cursor: liveMoment && !liveLoading ? 'pointer' : 'default' }}
              >
                Als Moment speichern (bleibt live)
              </button>
            </div>
          )}

          {modus === 'saved' && (
            <>
              {!newMoment ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                  <select
                    value={kampagneDocFile}
                    onChange={(e) => setKampagneDocFile(e.target.value)}
                    style={{ background: '#1e293b', color: '#fff', border: '1px solid rgba(95,251,241,0.3)', borderRadius: 6, padding: '0.4rem 0.6rem', fontSize: '0.88rem' }}
                  >
                    <option value="">Quelle für neuen Moment</option>
                    {KAMPAGNE_DOCS.filter((d) => d.file !== '00-INDEX.md').map((d) => (
                      <option key={d.file} value={d.file}>{d.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={speisenLoading}
                    onClick={async () => {
                      setSpeisenLoading(true)
                      try {
                        const mok2 = getMok2Quellen()
                        const kontakt = getKontaktFromStammdaten()
                        const kampagne = kampagneDocFile ? await fetchKampagneDocPreview(kampagneDocFile) : null
                        const moment = buildMomentFromQuellen({ mok2, kontakt, kampagne, withSource: true, kampagneDocFile })
                        setNewMoment(moment)
                      } finally {
                        setSpeisenLoading(false)
                      }
                    }}
                    style={{ padding: '0.4rem 0.75rem', background: '#0d9488', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.88rem', fontWeight: 600, cursor: speisenLoading ? 'wait' : 'pointer' }}
                  >
                    {speisenLoading ? 'Lade …' : 'Neuer Moment aus Quellen (bleibt live)'}
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input
                    value={newMoment.titel}
                    onChange={(e) => setNewMoment((m) => m ? { ...m, titel: e.target.value } : null)}
                    placeholder="Titel"
                    style={{ width: '100%', maxWidth: 320, background: '#1e293b', color: '#fff', border: '1px solid rgba(95,251,241,0.3)', borderRadius: 6, padding: '0.35rem 0.5rem', fontSize: '0.88rem' }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        const list = loadLocalMomente()
                        const toSave = { ...newMoment!, id: newMoment!.id || `moment-${Date.now()}`, source: kampagneDocFile ? { kampagneDoc: kampagneDocFile } : undefined }
                        list.push(toSave)
                        saveLocalMomente(list)
                        setMomente((prev) => { const byId = new Map(prev.map((m) => [m.id, m])); byId.set(toSave.id, toSave); return Array.from(byId.values()) })
                        setSelectedId(toSave.id)
                        setNewMoment(null)
                      }}
                      style={{ padding: '0.35rem 0.75rem', background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Speichern
                    </button>
                    <button type="button" onClick={() => setNewMoment(null)} style={{ padding: '0.35rem 0.75rem', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 6, fontSize: '0.85rem', cursor: 'pointer' }}>Abbrechen</button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Entwurf-Vorschau */}
        <section style={{ background: 'rgba(95,251,241,0.06)', border: '1px solid rgba(95,251,241,0.25)', borderRadius: 12, padding: '1.25rem' }}>
          <h2 style={{ margin: '0 0 1rem', color: 'rgba(95,251,241,0.95)', fontSize: '1.1rem' }}>Flyer-Entwurf</h2>
          {modus === 'saved' && momente.length > 1 && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>Produkt-Moment: </label>
              <select
                value={selectedId ?? ''}
                onChange={(e) => setSelectedId(e.target.value || null)}
                style={{ background: '#1e293b', color: '#fff', border: '1px solid rgba(95,251,241,0.3)', borderRadius: 6, padding: '0.35rem 0.6rem', marginLeft: '0.5rem' }}
              >
                {momente.map((m) => (
                  <option key={m.id} value={m.id}>{m.titel}{m.source?.kampagneDoc ? ' (live)' : ''}</option>
                ))}
              </select>
            </div>
          )}
          {(liveLoading || resolveLoading) && (
            <p style={{ color: 'rgba(95,251,241,0.8)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>Lade Entwurf aus Quellen …</p>
          )}
          {entwurf && !resolveLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div><strong style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>Titel</strong><div style={{ color: '#fff' }}>{entwurf.title}</div></div>
              <div><strong style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>Botschaft</strong><div style={{ color: '#fff', whiteSpace: 'pre-wrap' }}>{entwurf.bodyText}</div></div>
              <div><strong style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>Kontakt</strong><div style={{ color: '#fff' }}>{entwurf.contactText}</div></div>
              <div><strong style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>Link/QR</strong><div style={{ color: '#5ffbf1', wordBreak: 'break-all' }}>{entwurf.qrUrl || '–'}</div></div>
              <div><strong style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>Bild</strong><div style={{ color: '#fff' }}>{entwurf.imageRef ? entwurf.imageRef : '–'}</div></div>
              {entwurf.kernargumente.length > 0 && (
                <div><strong style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>Kernargumente</strong><ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem', color: '#fff' }}>{entwurf.kernargumente.map((a, i) => <li key={i}>{a}</li>)}</ul></div>
              )}
            </div>
          ) : (
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>Kein Produkt-Moment vorhanden. Bitte in <code>public/k2-markt/produkt-momente.json</code> anlegen.</p>
          )}
        </section>

        {/* DoD-Checkliste + Freigabe */}
        <aside style={{ background: 'rgba(95,251,241,0.06)', border: '1px solid rgba(95,251,241,0.25)', borderRadius: 12, padding: '1.25rem', position: 'sticky', top: '1rem' }}>
          <h2 style={{ margin: '0 0 1rem', color: 'rgba(95,251,241,0.95)', fontSize: '1.1rem' }}>Definition of Done (Flyer)</h2>
          {dod ? (
            <>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {['Kernbotschaft', 'Kontakt', 'Link/QR', 'Bild/Visuell'].map((label) => {
                  const fehlt = dod.fehlend.includes(label)
                  return (
                    <li key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '1.1rem' }}>{fehlt ? '❌' : '✅'}</span>
                      <span style={{ color: fehlt ? '#f87171' : 'rgba(255,255,255,0.9)' }}>{label}</span>
                    </li>
                  )
                })}
              </ul>
              <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: dod.ok ? '#22c55e' : '#f87171' }}>
                {dod.ok ? 'DoD erfüllt – bereit zur Freigabe.' : `Noch fehlend: ${dod.fehlend.join(', ')}.`}
              </p>
              <button
                type="button"
                disabled={freigegeben || !dod.ok}
                onClick={() => {
                  if (!entwurf || !currentMomentForDisplay) return
                  const eintrag: FreigabeEintrag = {
                    momentId: currentMomentForDisplay.id,
                    momentTitel: currentMomentForDisplay.titel,
                    template: FLYER_TEMPLATE_ID,
                    timestamp: new Date().toISOString(),
                  }
                  appendFreigabe(eintrag)
                  setFreigabenLog((prev) => [eintrag, ...prev].slice(0, 200))
                  setFreigegeben(true)
                }}
                style={{
                  marginTop: '1rem',
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: freigegeben ? 'rgba(34,197,94,0.3)' : (dod.ok ? '#22c55e' : 'rgba(255,255,255,0.15)'),
                  color: '#fff',
                  border: '1px solid rgba(34,197,94,0.5)',
                  borderRadius: 8,
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: dod.ok && !freigegeben ? 'pointer' : 'default',
                }}
              >
                {freigegeben ? '✓ Freigegeben' : 'Freigeben'}
              </button>
            </>
          ) : (
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>Kein Entwurf – zuerst Produkt-Moment wählen.</p>
          )}

          {freigabenLog.length > 0 && (
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(95,251,241,0.2)' }}>
              <h3 style={{ margin: '0 0 0.5rem', color: 'rgba(95,251,241,0.9)', fontSize: '0.95rem' }}>Traceability – letzte Freigaben</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>
                {freigabenLog.slice(0, MAX_FREIGABEN_ANZEIGE).map((e, i) => (
                  <li key={`${e.timestamp}-${i}`} style={{ marginBottom: '0.35rem' }}>
                    <span style={{ color: 'rgba(95,251,241,0.7)' }}>{new Date(e.timestamp).toLocaleString('de-AT', { dateStyle: 'short', timeStyle: 'short' })}</span>
                    {' · '}{e.momentTitel} <span style={{ color: 'rgba(255,255,255,0.5)' }}>({e.template})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
        </div>
      </div>
    </div>
  )
}
