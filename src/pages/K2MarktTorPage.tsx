/**
 * K2 Markt – Qualitäts-Tor (Phase 3).
 * Zeigt Flyer-Entwurf, DoD-Prüfung, Button „Freigeben“.
 * Momente aus mök2 + Kampagne speisen → daraus Momente erzeugen, die umgesetzt werden können.
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'
import {
  momentToFlyerEntwurf,
  erfuelltDoDFlyer,
  FLYER_TEMPLATE_ID,
  type ProduktMoment,
  type FlyerEntwurf,
  type FreigabeEintrag,
} from '../utils/k2MarktFlyerAgent'
import {
  getMok2Quellen,
  getKontaktFromStammdaten,
  fetchKampagneDocPreview,
  buildMomentFromQuellen,
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

  useEffect(() => {
    if (!selectedId || momente.length === 0) return
    const m = momente.find((x) => x.id === selectedId)
    if (m) setEntwurf(momentToFlyerEntwurf(m))
  }, [selectedId, momente])

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
            <Link to={PROJECT_ROUTES['k2-galerie'].home} style={{ color: '#5ffbf1', textDecoration: 'none', fontSize: '0.9rem' }}>← K2 Galerie</Link>
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
            <Link to={PROJECT_ROUTES['k2-galerie'].home} style={{ color: '#5ffbf1', textDecoration: 'none', fontSize: '0.9rem' }}>← K2 Galerie</Link>
            <Link to={PROJECT_ROUTES['k2-galerie'].k2Markt} style={{ color: 'rgba(95,251,241,0.85)', textDecoration: 'none', fontSize: '0.9rem' }}>K2 Markt Mappe</Link>
            <Link to={PROJECT_ROUTES['k2-galerie'].kampagneMarketingStrategie} style={{ color: 'rgba(95,251,241,0.85)', textDecoration: 'none', fontSize: '0.9rem' }}>Kampagne Marketing-Strategie</Link>
          </div>
        </header>

        {/* Moment aus mök2 & Kampagne speisen – daraus Momente erzeugen */}
        <section className="no-print" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem', background: 'rgba(95,251,241,0.06)', border: '1px solid rgba(95,251,241,0.25)', borderRadius: 12 }}>
          <h2 style={{ margin: '0 0 0.5rem', color: 'rgba(95,251,241,0.95)', fontSize: '1.1rem' }}>Moment aus Quellen erzeugen</h2>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)' }}>
            Aus mök2 (Slogan, Botschaft, Zielgruppe) und optional Kampagne Marketing-Strategie (Dokument) einen Produkt-Moment bauen – dann speichern und am Tor umsetzen.
          </p>
          {!newMoment ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
              <select
                value={kampagneDocFile}
                onChange={(e) => setKampagneDocFile(e.target.value)}
                style={{ background: '#1e293b', color: '#fff', border: '1px solid rgba(95,251,241,0.3)', borderRadius: 6, padding: '0.4rem 0.6rem', fontSize: '0.88rem' }}
              >
                <option value="">Kein Kampagne-Dokument</option>
                {KAMPAGNE_DOCS.map((d) => (
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
                    const moment = buildMomentFromQuellen({ mok2, kontakt, kampagne })
                    setNewMoment(moment)
                  } finally {
                    setSpeisenLoading(false)
                  }
                }}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#0d9488',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: speisenLoading ? 'wait' : 'pointer',
                }}
              >
                {speisenLoading ? 'Lade …' : 'Aus mök2 & Kampagne füllen'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '0.25rem' }}>Titel</label>
                <input
                  value={newMoment.titel}
                  onChange={(e) => setNewMoment((m) => m ? { ...m, titel: e.target.value } : null)}
                  style={{ width: '100%', maxWidth: 400, background: '#1e293b', color: '#fff', border: '1px solid rgba(95,251,241,0.3)', borderRadius: 6, padding: '0.4rem 0.6rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '0.25rem' }}>Botschaft</label>
                <textarea
                  value={newMoment.botschaft}
                  onChange={(e) => setNewMoment((m) => m ? { ...m, botschaft: e.target.value } : null)}
                  rows={4}
                  style={{ width: '100%', maxWidth: 560, background: '#1e293b', color: '#fff', border: '1px solid rgba(95,251,241,0.3)', borderRadius: 6, padding: '0.4rem 0.6rem', resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => {
                    const list = loadLocalMomente()
                    const toSave = { ...newMoment!, id: newMoment!.id || `moment-${Date.now()}` }
                    list.push(toSave)
                    saveLocalMomente(list)
                    setMomente((prev) => {
                      const byId = new Map(prev.map((m) => [m.id, m]))
                      byId.set(toSave.id, toSave)
                      return Array.from(byId.values())
                    })
                    setSelectedId(toSave.id)
                    setEntwurf(momentToFlyerEntwurf(toSave))
                    setNewMoment(null)
                  }}
                  style={{ padding: '0.5rem 1rem', background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Moment speichern
                </button>
                <button
                  type="button"
                  onClick={() => setNewMoment(null)}
                  style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, fontSize: '0.9rem', cursor: 'pointer' }}
                >
                  Abbrechen
                </button>
              </div>
            </div>
          )}
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Entwurf-Vorschau */}
        <section style={{ background: 'rgba(95,251,241,0.06)', border: '1px solid rgba(95,251,241,0.25)', borderRadius: 12, padding: '1.25rem' }}>
          <h2 style={{ margin: '0 0 1rem', color: 'rgba(95,251,241,0.95)', fontSize: '1.1rem' }}>Flyer-Entwurf</h2>
          {momente.length > 1 && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>Produkt-Moment: </label>
              <select
                value={selectedId ?? ''}
                onChange={(e) => setSelectedId(e.target.value || null)}
                style={{ background: '#1e293b', color: '#fff', border: '1px solid rgba(95,251,241,0.3)', borderRadius: 6, padding: '0.35rem 0.6rem', marginLeft: '0.5rem' }}
              >
                {momente.map((m) => (
                  <option key={m.id} value={m.id}>{m.titel}</option>
                ))}
              </select>
            </div>
          )}
          {entwurf ? (
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
                  if (!entwurf || !selectedId) return
                  const moment = momente.find((m) => m.id === selectedId)
                  const eintrag: FreigabeEintrag = {
                    momentId: selectedId,
                    momentTitel: moment?.titel ?? entwurf.title,
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
