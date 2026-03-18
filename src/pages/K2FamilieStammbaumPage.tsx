/**
 * K2 Familie – Stammbaum (Liste). Phase 2.1.
 * Route: /projects/k2-familie/stammbaum
 */

import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMemo, useEffect, useCallback, useState } from 'react'
import '../App.css'
import { PROJECT_ROUTES } from '../config/navigation'
import { loadPersonen, savePersonen, loadEinstellungen, saveEinstellungen } from '../utils/familieStorage'
import { getBeziehungenFromKarten, getKleinfamiliePersonen } from '../utils/familieBeziehungen'
import { addPartnersForSiblingsExceptMaria } from '../utils/familieAddPartners'
import { loadFamilieFromSupabase } from '../utils/familieSupabaseClient'
import { isSupabaseConfigured } from '../utils/supabaseClient'
import { getFamilieTenantDisplayName } from '../data/familieHuberMuster'
import { useFamilieTenant } from '../context/FamilieTenantContext'
import type { K2FamiliePerson } from '../types/k2Familie'
import FamilyTreeGraph, { type TreeOrientation } from '../components/FamilyTreeGraph'

function generateId(): string {
  return 'person-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8)
}

type PrintFormat = 'a4' | 'a3' | 'poster'
type PrintFotos = '1' | '0'

export default function K2FamilieStammbaumPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { currentTenantId, tenantList, setCurrentTenantId, addTenant } = useFamilieTenant()
  const [synced, setSynced] = useState(false)
  const [stammbaumRefresh, setStammbaumRefresh] = useState(0)
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setSynced(true)
      return
    }
    loadFamilieFromSupabase(currentTenantId).then(() => setSynced(true))
  }, [currentTenantId])
  const personen = useMemo(() => loadPersonen(currentTenantId), [currentTenantId, synced, stammbaumRefresh])
  const einstellungen = useMemo(() => loadEinstellungen(currentTenantId), [currentTenantId, stammbaumRefresh])
  const partnerHerkunftPerson = useMemo(() => {
    const id = einstellungen.partnerHerkunftPersonId
    return id ? personen.find((p) => p.id === id) : null
  }, [einstellungen.partnerHerkunftPersonId, personen])

  /** Beziehungen von „Du“ – ausschließlich aus den Karten (eine Quelle der Wahrheit). */
  const beziehungenDu = useMemo(() => {
    const id = einstellungen.ichBinPersonId
    return id ? getBeziehungenFromKarten(personen, id) : null
  }, [einstellungen.ichBinPersonId, personen])

  const druck = searchParams.get('druck') === '1'
  const formatFromUrl = (searchParams.get('format') as PrintFormat) || 'a4'
  const fotosFromUrl = (searchParams.get('fotos') as PrintFotos) || '1'
  const titelFromUrl = searchParams.get('titel') || getFamilieTenantDisplayName(currentTenantId, 'Familie')
  const format = druck ? formatFromUrl : (searchParams.get('format') as PrintFormat) || 'a4'
  const fotos = druck ? fotosFromUrl : (searchParams.get('fotos') as PrintFotos) || '1'
  const titel = druck ? titelFromUrl : (searchParams.get('titel') || getFamilieTenantDisplayName(currentTenantId, 'Familie'))

  const [druckFormat, setDruckFormat] = useState<PrintFormat>(formatFromUrl)
  const [druckFotos, setDruckFotos] = useState<PrintFotos>(fotosFromUrl)
  const [druckTitel, setDruckTitel] = useState(titelFromUrl)
  const [familyDisplayNameInput, setFamilyDisplayNameInput] = useState('')
  const [familyNameSaved, setFamilyNameSaved] = useState(false)
  const [partnersAddedMsg, setPartnersAddedMsg] = useState(false)
  const [viewZoom, setViewZoom] = useState(1)
  const [nurKleinfamilie, setNurKleinfamilie] = useState(false)
  const [viewOrientation, setViewOrientation] = useState<TreeOrientation>('vertical')
  const ZOOM_MIN = 0.25
  const ZOOM_MAX = 2
  const ZOOM_STEP = 0.25

  /** Für Grafik und Druck: bei „Nur meine Kleinfamilie“ nur Du + Partner + Kinder + Partner der Kinder – eine Einheit. */
  const personenForGraph = useMemo(() => {
    if (nurKleinfamilie && einstellungen.ichBinPersonId) return getKleinfamiliePersonen(personen, einstellungen.ichBinPersonId)
    return personen
  }, [personen, einstellungen.ichBinPersonId, nurKleinfamilie])
  useEffect(() => {
    setFamilyDisplayNameInput(einstellungen.familyDisplayName ?? '')
  }, [currentTenantId, einstellungen.familyDisplayName])

  useEffect(() => {
    if (!druck || personen.length === 0) return
    const t = setTimeout(() => window.print(), 300)
    return () => clearTimeout(t)
  }, [druck, personen.length])

  const handleAfterPrint = useCallback(() => {
    if (druck) setSearchParams({}, { replace: true })
  }, [druck, setSearchParams])

  useEffect(() => {
    window.addEventListener('afterprint', handleAfterPrint)
    return () => window.removeEventListener('afterprint', handleAfterPrint)
  }, [handleAfterPrint])

  const openDruck = (opts: { format: PrintFormat; fotos: PrintFotos; titel?: string }) => {
    const p = new URLSearchParams()
    p.set('druck', '1')
    p.set('format', opts.format)
    p.set('fotos', opts.fotos)
    if (opts.titel?.trim()) p.set('titel', opts.titel.trim())
    setSearchParams(p)
  }

  const printScale = format === 'poster' ? 1.5 : format === 'a3' ? 1.2 : 1

  if (druck && personen.length > 0) {
    const forDruck = nurKleinfamilie && einstellungen.ichBinPersonId ? getKleinfamiliePersonen(personen, einstellungen.ichBinPersonId) : personen
    return (
      <div className="stammbaum-druck-view">
        <h1 className="stammbaum-druck-titel">{titel}</h1>
        <FamilyTreeGraph
          personen={forDruck}
          personPathPrefix={PROJECT_ROUTES['k2-familie'].personen}
          printMode
          noPhotos={fotos === '0'}
          scale={printScale}
          partnerHerkunftPersonId={einstellungen.partnerHerkunftPersonId}
          ichBinPersonId={einstellungen.ichBinPersonId}
          ichBinPositionAmongSiblings={einstellungen.ichBinPositionAmongSiblings}
        />
      </div>
    )
  }

  const saveFamilyDisplayName = useCallback(() => {
    const name = familyDisplayNameInput.trim()
    if (saveEinstellungen(currentTenantId, { ...einstellungen, familyDisplayName: name || undefined })) {
      setStammbaumRefresh((k) => k + 1)
      setFamilyNameSaved(true)
      setTimeout(() => setFamilyNameSaved(false), 2000)
    }
  }, [currentTenantId, einstellungen, familyDisplayNameInput])

  const handleSetIchBin = useCallback((personId: string) => {
    const p = personen.find((x) => x.id === personId)
    const pos = p?.name?.match(/^(?:Geschwister|Kind)\s+(\d+)$/i)?.[1]
    const einst = loadEinstellungen(currentTenantId)
    const ichBinPositionAmongSiblings = pos ? parseInt(pos, 10) : einst.ichBinPositionAmongSiblings
    let changed = saveEinstellungen(currentTenantId, { ...einst, ichBinPersonId: personId, ichBinPositionAmongSiblings })
    const posNum = ichBinPositionAmongSiblings != null && ichBinPositionAmongSiblings >= 1 && ichBinPositionAmongSiblings <= 99 ? ichBinPositionAmongSiblings : (p?.positionAmongSiblings ?? null)
    if (p != null && posNum != null) {
      const updated = personen.map((x) => x.id === personId ? { ...x, positionAmongSiblings: posNum } : x)
      if (savePersonen(currentTenantId, updated, { allowReduce: false })) changed = true
    }
    if (changed) setStammbaumRefresh((k: number) => k + 1)
  }, [currentTenantId, personen])

  const addPerson = () => {
    const neu: K2FamiliePerson = {
      id: generateId(),
      name: 'Neue Person',
      parentIds: [],
      childIds: [],
      partners: [],
      siblingIds: [],
      wahlfamilieIds: [],
    }
    const next = [...personen, neu]
    if (!savePersonen(currentTenantId, next, { allowReduce: false })) return
    navigate(`${PROJECT_ROUTES['k2-familie'].personen}/${neu.id}`)
  }

  return (
    <div className="mission-wrapper">
      <div className="viewport k2-familie-page">
        <header>
          <div>
            <div className="familie-toolbar" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Link to={PROJECT_ROUTES['k2-familie'].home} className="meta">← K2 Familie</Link>
              <span className="meta">Familie:</span>
              <select value={currentTenantId} onChange={(e) => setCurrentTenantId(e.target.value)}>
                {tenantList.map((id) => (
                  <option key={id} value={id}>{getFamilieTenantDisplayName(id, 'Standard')}</option>
                ))}
              </select>
              <button type="button" className="btn-outline" onClick={() => addTenant()}>Neue Familie</button>
            </div>
            <div className="familie-name-save" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <label htmlFor="ft-family-display-name" className="meta">Anzeigename dieser Familie:</label>
              <input
                id="ft-family-display-name"
                type="text"
                value={familyDisplayNameInput}
                onChange={(e) => setFamilyDisplayNameInput(e.target.value)}
                placeholder="z. B. Familie Kreinecker"
                autoComplete="off"
                name="ft-family-display"
                style={{ minWidth: 180, padding: '0.35rem 0.5rem' }}
              />
              <button type="button" className="btn" onClick={saveFamilyDisplayName}>Speichern</button>
              {familyNameSaved && <span className="meta" style={{ color: 'rgba(20,184,166,0.95)' }}>✓ Gespeichert</span>}
            </div>
            <h1>Stammbaum</h1>
            {partnerHerkunftPerson && (
              <p className="meta" style={{ margin: '0.25rem 0 0', color: 'rgba(20,184,166,0.95)' }}>Zwei Zweige gleichrangig: Meine Herkunft · Herkunft {partnerHerkunftPerson.name}</p>
            )}
            <div className="meta">Grafik der Familienstruktur – Klick auf eine Person öffnet ihre Seite. Unter jeder Person steht „Das bin ich“: damit identifizierst du dich (z. B. als Georg Kreinecker). Deine Partnerin steht automatisch neben dir, wenn du sie bei deiner Person unter Partner eingetragen hast; eure Kinder erscheinen unter euch, wenn sie bei dir (oder deiner Partnerin) unter Kinder eingetragen sind. Steht „Du“ in der falschen Reihe? Dann Person bearbeiten → Eltern anpassen (z. B. Vater + Mutter), dann erscheint sie in der Geschwister-Reihe.</div>
            {einstellungen.ichBinPersonId && (
              <p style={{ margin: '0.5rem 0 0' }}>
                <button type="button" className="btn-outline" style={{ fontSize: '0.9rem' }} onClick={() => { const e = loadEinstellungen(currentTenantId); if (saveEinstellungen(currentTenantId, { ...e, ichBinPersonId: undefined, ichBinPositionAmongSiblings: undefined })) setStammbaumRefresh((k) => k + 1); }}>Du zurücksetzen</button>
                <span className="meta" style={{ marginLeft: '0.5rem' }}>– falls du „Das bin ich“ falsch gesetzt hast</span>
              </p>
            )}
            {beziehungenDu && (
              <div className="meta" style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: 6 }}>
                <strong>Beziehungen (aus deinen Karten)</strong> – nur das, was in den Personenkarten steht:
                <ul style={{ margin: '0.35rem 0 0', paddingLeft: '1.2rem' }}>
                  <li>Eltern: {beziehungenDu.eltern.length ? beziehungenDu.eltern.map((p) => p.name).join(', ') : '–'}</li>
                  <li>Kinder: {beziehungenDu.kinder.length ? beziehungenDu.kinder.map((p) => p.name).join(', ') : '–'}</li>
                  <li>Geschwister: {beziehungenDu.geschwister.length ? beziehungenDu.geschwister.map((p) => p.name).join(', ') : '–'}</li>
                  <li>Partner: {beziehungenDu.partner.length ? beziehungenDu.partner.map((p) => p.name).join(', ') : '–'}</li>
                </ul>
              </div>
            )}
          </div>
        </header>

        {/* Visualisierter Stammbaum (Grafik) – Zoomen für bessere Lesbarkeit */}
        <div className="card familie-card-enter" style={{ padding: '1rem', overflow: 'visible' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', color: 'rgba(255,255,255,0.9)' }}>Stammbaum</h2>
            {personen.length > 0 && (
              <>
                {einstellungen.ichBinPersonId && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={nurKleinfamilie}
                      onChange={(e) => setNurKleinfamilie(e.target.checked)}
                      aria-label="Nur meine Kleinfamilie"
                    />
                    <span className="meta">Nur meine Kleinfamilie</span>
                  </label>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="meta" style={{ marginRight: '0.2rem' }}>Ansicht:</span>
                  <button
                    type="button"
                    className={viewOrientation === 'vertical' ? 'btn' : 'btn-outline'}
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.9rem' }}
                    onClick={() => setViewOrientation('vertical')}
                    aria-pressed={viewOrientation === 'vertical'}
                  >
                    Vertikal
                  </button>
                  <button
                    type="button"
                    className={viewOrientation === 'horizontal' ? 'btn' : 'btn-outline'}
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.9rem' }}
                    onClick={() => setViewOrientation('horizontal')}
                    aria-pressed={viewOrientation === 'horizontal'}
                  >
                    Horizontal
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span className="meta" style={{ marginRight: '0.35rem' }}>Zoomen:</span>
                  <button
                    type="button"
                    className="btn-outline"
                    style={{ padding: '0.25rem 0.5rem', minWidth: 32 }}
                    onClick={() => setViewZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))}
                    title="Verkleinern"
                    aria-label="Verkleinern"
                  >
                    −
                  </button>
                  <span className="meta" style={{ minWidth: 48, textAlign: 'center' }}>{Math.round(viewZoom * 100)}%</span>
                  <button
                    type="button"
                    className="btn-outline"
                    style={{ padding: '0.25rem 0.5rem', minWidth: 32 }}
                    onClick={() => setViewZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))}
                    title="Vergrößern"
                    aria-label="Vergrößern"
                  >
                    +
                  </button>
                </div>
              </>
            )}
          </div>
          {personen.length > 0 ? (
            <FamilyTreeGraph
              personen={personenForGraph}
              personPathPrefix={PROJECT_ROUTES['k2-familie'].personen}
              partnerHerkunftPersonId={einstellungen.partnerHerkunftPersonId}
              ichBinPersonId={einstellungen.ichBinPersonId}
              ichBinPositionAmongSiblings={einstellungen.ichBinPositionAmongSiblings}
              onSetIchBin={handleSetIchBin}
              scale={viewZoom}
              orientation={viewOrientation}
            />
          ) : (
            <p className="meta" style={{ margin: 0, padding: '0.75rem 0', textAlign: 'center' }}>Grafik erscheint, sobald Personen angelegt sind.</p>
          )}
        </div>

        {personen.length > 0 && (
          <>
            <section className="card familie-card-enter" style={{ padding: '1rem', marginTop: '1rem' }} aria-label="Druckvorlagen">
              <h2 style={{ margin: '0 0 0.75rem', fontSize: '1rem', color: 'rgba(255,255,255,0.9)' }}>Als Plakat drucken</h2>
              <p className="meta" style={{ marginBottom: '1rem' }}>Format und Darstellung wählen, dann Drucken – die Grafik öffnet sich druckoptimiert.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span className="meta">Format</span>
                  <select
                    id="druck-format"
                    value={druckFormat}
                    onChange={(e) => setDruckFormat(e.target.value as PrintFormat)}
                  >
                    <option value="a4">A4</option>
                    <option value="a3">A3</option>
                    <option value="poster">Poster (größer)</option>
                  </select>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span className="meta">Darstellung</span>
                  <select
                    id="druck-fotos"
                    value={druckFotos}
                    onChange={(e) => setDruckFotos(e.target.value as PrintFotos)}
                  >
                    <option value="1">Mit Fotos</option>
                    <option value="0">Nur Namen (sparsam)</option>
                  </select>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span className="meta">Titel (optional)</span>
                  <input
                    type="text"
                    id="druck-titel"
                    placeholder={getFamilieTenantDisplayName(currentTenantId, 'Familie')}
                    value={druckTitel}
                    onChange={(e) => setDruckTitel(e.target.value)}
                    style={{ minWidth: 160 }}
                  />
                </label>
                <button type="button" className="btn" onClick={() => openDruck({ format: druckFormat, fotos: druckFotos, titel: druckTitel || undefined })}>
                  Druckvorschau &amp; Drucken
                </button>
              </div>
            </section>
          </>
        )}

        {personen.length === 0 && (
          <div className="card familie-card-enter" style={{ animationDelay: '0s', padding: '1.25rem', border: '1px solid rgba(13,148,136,0.4)' }}>
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', color: 'rgba(255,255,255,0.95)' }}>Grundstruktur anlegen</h2>
            <p className="meta" style={{ margin: 0 }}>Du und Partner, Kinder unten, Geschwister oben, Vater und Mütter – einmal die Struktur festlegen. Fehlende Personen kannst du später jederzeit einfügen.</p>
            <div style={{ marginTop: '1rem' }}>
              <Link to={PROJECT_ROUTES['k2-familie'].grundstruktur} className="btn" style={{ marginRight: '0.75rem' }}>Grundstruktur anlegen</Link>
              <button type="button" className="btn-outline" onClick={addPerson}>＋ Einzelne Person hinzufügen</button>
            </div>
          </div>
        )}

        {nurKleinfamilie && einstellungen.ichBinPersonId && (
          <p className="meta" style={{ marginBottom: '0.75rem' }}>Nur deine Kleinfamilie – Grafik und Karten unten zeigen nur diese Personen.</p>
        )}
        <div className="k2-familie-stammbaum-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem' }}>
          {personenForGraph.map((p, i) => (
            <Link
              key={p.id}
              to={`${PROJECT_ROUTES['k2-familie'].personen}/${p.id}`}
              className="familie-card-enter"
              style={{ textDecoration: 'none', color: 'inherit', animationDelay: `${i * 0.06}s` }}
            >
              <div className="card" style={{ padding: '1.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                {p.photo ? (
                  <img
                    src={p.photo}
                    alt=""
                    className="person-photo"
                    style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(20,184,166,0.4)' }}
                  />
                ) : (
                  <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'rgba(13,148,136,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', border: '3px solid rgba(20,184,166,0.3)' }}>👤</div>
                )}
                <div style={{ width: '100%' }}>
                  <h2 style={{ margin: 0, fontSize: '1.05rem', lineHeight: 1.2 }}>{p.name}</h2>
                  {p.shortText && <p className="meta" style={{ margin: '0.35rem 0 0', fontSize: '0.82rem', lineHeight: 1.4 }}>{p.shortText.slice(0, 70)}{p.shortText.length > 70 ? '…' : ''}</p>}
                </div>
                <span className="meta" style={{ fontSize: '0.9rem', opacity: 0.8 }}>→ ansehen</span>
              </div>
            </Link>
          ))}
        </div>

        {personen.length > 0 && (
          <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
            <button type="button" className="btn" onClick={addPerson}>＋ Person hinzufügen</button>
            {einstellungen.ichBinPersonId && (
              <>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => {
                    const next = addPartnersForSiblingsExceptMaria(personen, einstellungen.ichBinPersonId!)
                    if (savePersonen(currentTenantId, next, { allowReduce: false })) {
                      setStammbaumRefresh((k) => k + 1)
                      setPartnersAddedMsg(true)
                      setTimeout(() => setPartnersAddedMsg(false), 3000)
                    }
                  }}
                >
                  Partner für alle Geschwister (außer Maria) einfügen
                </button>
                {partnersAddedMsg && <span className="meta" style={{ color: 'rgba(20,184,166,0.95)' }}>✓ Partner ergänzt (Rupert: 1. Frau verstorben, 2. Frau; Gisela: Mann verstorben)</span>}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
