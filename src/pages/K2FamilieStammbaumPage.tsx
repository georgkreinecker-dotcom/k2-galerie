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
import {
  buildStammbaumKartenState,
  buildGrossfamilieStammbaumSektionen,
  getStammbaumBranchCardStyle,
  type StammbaumKartenSektion,
} from '../utils/familieStammbaumKarten'
import { addPartnersForSiblingsExceptMaria } from '../utils/familieAddPartners'
import { ensureErsteEheVierGeschwister } from '../utils/familieErsteEheGeschwister'
import { loadFamilieFromSupabase } from '../utils/familieSupabaseClient'
import { isSupabaseConfigured } from '../utils/supabaseClient'
import { getFamilieTenantDisplayName } from '../data/familieHuberMuster'
import { useFamilieTenant } from '../context/FamilieTenantContext'
import type { K2FamiliePerson } from '../types/k2Familie'
import FamilyTreeGraph, { type FamilyTreeLayout, type TreeOrientation } from '../components/FamilyTreeGraph'
import {
  StammbaumDruckNachGenerationen,
  StammbaumDruckPersonenblaetter,
  StammbaumDruckRegister,
} from '../components/StammbaumDruckFormate'

function generateId(): string {
  return 'person-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8)
}

type PrintFormat = 'a4' | 'a3' | 'poster'
type PrintFotos = '1' | '0'
/** Druck: Grafik oder übersichtliche Text-PDFs (ohne verschachtelte Grafik). */
type PrintStil = 'grafik' | 'generationen' | 'register' | 'personenblaetter'

const PRINT_STILE: PrintStil[] = ['personenblaetter', 'generationen', 'register', 'grafik']

function parsePrintStil(raw: string | null): PrintStil {
  if (raw && PRINT_STILE.includes(raw as PrintStil)) return raw as PrintStil
  return 'personenblaetter'
}

/** Stammbaum-Kachel: bei „Verstorben“ in der Personenkarte schwarzer Rand (statt Zweig-Farbe). */
function stammbaumKachelRaender(p: K2FamiliePerson, st: { border: string; bg: string }) {
  const v = p.verstorben === true
  return {
    cardBorder: v ? '2px solid rgba(0,0,0,0.92)' : `2px solid ${st.border}`,
    avatarBorder: v ? '3px solid rgba(0,0,0,0.92)' : `3px solid ${st.border}`,
  }
}

/** Ab dieser Anzahl Sektionen: Akkordeon, kompakte Karten, Sprungleiste (viele Kleinfamilien). */
const STAMMBAUM_VIELE_SEKTIONEN_AB = 5

function stammbaumSektionDomId(key: string): string {
  return `stammbaum-sek-${key.replace(/[^a-zA-Z0-9_-]/g, '-')}`
}

function stammbaumSektionTocLabel(s: StammbaumKartenSektion): string {
  if (s.key === 'eltern') return 'Eltern'
  if (s.key === 'weitere') return 'Weitere'
  if (s.key.startsWith('kleinfamilie-')) {
    const m = s.titel.match(/^Kleinfamilie\s+(\S+)\s*[–-]\s*(.+)$/)
    if (m) {
      const name = m[2].trim()
      return `${m[1]} · ${name.length > 16 ? `${name.slice(0, 16)}…` : name}`
    }
  }
  return s.titel.length > 26 ? `${s.titel.slice(0, 26)}…` : s.titel
}

function defaultStammbaumSekOpen(
  sek: StammbaumKartenSektion,
  viele: boolean,
  ichBinPersonId: string | undefined
): boolean {
  if (!viele) return true
  if (sek.key === 'eltern') return true
  if (sek.key === 'weitere') return false
  if (sek.key.startsWith('kleinfamilie-')) {
    const rootId = sek.key.slice('kleinfamilie-'.length)
    return rootId === ichBinPersonId
  }
  return true
}

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
  const stilFromUrl = parsePrintStil(searchParams.get('stil'))
  const oriFromUrl = (searchParams.get('ori') as TreeOrientation) || 'vertical'
  const treeFromUrl = (searchParams.get('tree') as FamilyTreeLayout) || 'zeilen'
  const titelFromUrl = searchParams.get('titel') || getFamilieTenantDisplayName(currentTenantId, 'Familie')
  const format = druck ? formatFromUrl : (searchParams.get('format') as PrintFormat) || 'a4'
  const fotos = druck ? fotosFromUrl : (searchParams.get('fotos') as PrintFotos) || '1'
  const titel = druck ? titelFromUrl : (searchParams.get('titel') || getFamilieTenantDisplayName(currentTenantId, 'Familie'))

  const [druckFormat, setDruckFormat] = useState<PrintFormat>(formatFromUrl)
  const [druckFotos, setDruckFotos] = useState<PrintFotos>(fotosFromUrl)
  const [druckStil, setDruckStil] = useState<PrintStil>(stilFromUrl)
  const [druckOri, setDruckOri] = useState<TreeOrientation>(oriFromUrl)
  const [druckTree, setDruckTree] = useState<FamilyTreeLayout>(treeFromUrl)
  const [druckTitel, setDruckTitel] = useState(titelFromUrl)
  const [familyDisplayNameInput, setFamilyDisplayNameInput] = useState('')
  const [familyNameSaved, setFamilyNameSaved] = useState(false)
  const [partnersAddedMsg, setPartnersAddedMsg] = useState(false)
  const [ersteEheMsg, setErsteEheMsg] = useState('')
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

  /** Karten: ein Raster pro Sektion (Großfamilie: Eltern → Kleinfamilie 1…n → Weitere) oder klassisch eine Liste. */
  const stammbaumKarten = useMemo(
    () => buildStammbaumKartenState(personenForGraph, einstellungen.ichBinPersonId),
    [personenForGraph, einstellungen.ichBinPersonId]
  )
  /** Wenn „Ich bin“ + Datenlage passt: Blöcke untereinander statt einem Gemisch. */
  const stammbaumSektionen = useMemo(() => {
    const ichId = einstellungen.ichBinPersonId
    if (!ichId || personenForGraph.length === 0) return null
    if (nurKleinfamilie) {
      return [
        {
          key: 'deine-kleinfamilie',
          titel: 'Deine Kleinfamilie',
          untertitel: undefined,
          personen: buildStammbaumKartenState(personenForGraph, ichId).sortedPersonen,
          branchIndex: 0,
        },
      ]
    }
    return buildGrossfamilieStammbaumSektionen(personenForGraph, ichId)
  }, [personenForGraph, einstellungen.ichBinPersonId, nurKleinfamilie])

  const vieleStammbaumSektionen = Boolean(
    stammbaumSektionen &&
      stammbaumSektionen.length >= STAMMBAUM_VIELE_SEKTIONEN_AB &&
      !nurKleinfamilie
  )

  const [sekExpanded, setSekExpanded] = useState<Record<string, boolean>>({})
  useEffect(() => {
    if (!vieleStammbaumSektionen) setSekExpanded({})
  }, [vieleStammbaumSektionen])

  useEffect(() => {
    setFamilyDisplayNameInput(einstellungen.familyDisplayName ?? '')
  }, [currentTenantId, einstellungen.familyDisplayName])

  /** Druck nur Kleinfamilie – sonst kein automatischer Druckdialog. */
  useEffect(() => {
    if (!druck) return
    if (!einstellungen.ichBinPersonId) return
    const klein = getKleinfamiliePersonen(personen, einstellungen.ichBinPersonId)
    if (klein.length === 0) return
    const t = setTimeout(() => window.print(), 300)
    return () => clearTimeout(t)
  }, [druck, personen, einstellungen.ichBinPersonId])

  const handleAfterPrint = useCallback(() => {
    if (druck) setSearchParams({}, { replace: true })
  }, [druck, setSearchParams])

  useEffect(() => {
    window.addEventListener('afterprint', handleAfterPrint)
    return () => window.removeEventListener('afterprint', handleAfterPrint)
  }, [handleAfterPrint])

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

  const openDruck = (opts: {
    format: PrintFormat
    fotos: PrintFotos
    titel?: string
    stil: PrintStil
    ori: TreeOrientation
    tree: FamilyTreeLayout
  }) => {
    const p = new URLSearchParams()
    p.set('druck', '1')
    p.set('format', opts.format)
    p.set('fotos', opts.fotos)
    p.set('stil', opts.stil)
    p.set('ori', opts.ori)
    p.set('tree', opts.tree)
    if (opts.titel?.trim()) p.set('titel', opts.titel.trim())
    setSearchParams(p)
  }

  const printScale = format === 'poster' ? 1.5 : format === 'a3' ? 1.2 : 1

  /** PDF/Plakat: ausschließlich Kleinfamilie (Du + Partner + Kinder + Partner der Kinder), nie die ganze Stammbaum-Datei. */
  const personenFuerDruck = useMemo(() => {
    if (!einstellungen.ichBinPersonId) return [] as K2FamiliePerson[]
    return getKleinfamiliePersonen(personen, einstellungen.ichBinPersonId)
  }, [personen, einstellungen.ichBinPersonId])

  if (druck) {
    if (!einstellungen.ichBinPersonId || personenFuerDruck.length === 0) {
      return (
        <div className="stammbaum-druck-view" data-stil="hinweis">
          <div className="card" style={{ maxWidth: 420, margin: '2rem auto', padding: '1.25rem' }}>
            <h1 style={{ margin: '0 0 0.75rem', fontSize: '1.1rem' }}>Druck nur für die Kleinfamilie</h1>
            <p className="meta" style={{ margin: 0 }}>
              {personen.length === 0 ? (
                'Sobald Personen angelegt sind, kannst du dich im Stammbaum mit „Das bin ich“ festlegen – dann ist der Druck nur für deine Kleinfamilie möglich (du, Partner, Kinder, Partner der Kinder).'
              ) : (
                <>
                  Bitte im Stammbaum bei deiner Person <strong>Das bin ich</strong> wählen. Danach druckst du nur diese Kleinfamilie – nicht die ganze erfasste Familie.
                </>
              )}
            </p>
            <p style={{ margin: '1rem 0 0' }}>
              <button type="button" className="btn" onClick={() => setSearchParams({}, { replace: true })}>
                Zurück zum Stammbaum
              </button>
            </p>
          </div>
        </div>
      )
    }
    const forDruck = personenFuerDruck
    const dataFormatAttr = formatFromUrl === 'poster' ? 'poster' : formatFromUrl

    if (stilFromUrl === 'generationen') {
      return (
        <div className="stammbaum-druck-view" data-format={dataFormatAttr} data-stil="generationen">
          <StammbaumDruckNachGenerationen
            personen={forDruck}
            titel={titel}
            ichBinPersonId={einstellungen.ichBinPersonId}
            ichBinPositionAmongSiblings={einstellungen.ichBinPositionAmongSiblings ?? undefined}
          />
        </div>
      )
    }
    if (stilFromUrl === 'register') {
      return (
        <div className="stammbaum-druck-view" data-format={dataFormatAttr} data-stil="register">
          <StammbaumDruckRegister
            personen={forDruck}
            titel={titel}
            ichBinPersonId={einstellungen.ichBinPersonId}
          />
        </div>
      )
    }
    if (stilFromUrl === 'personenblaetter') {
      return (
        <div className="stammbaum-druck-view" data-format={dataFormatAttr} data-stil="personenblaetter">
          <StammbaumDruckPersonenblaetter
            personen={forDruck}
            titel={titel}
            ichBinPersonId={einstellungen.ichBinPersonId}
          />
        </div>
      )
    }

    return (
      <div className="stammbaum-druck-view" data-format={dataFormatAttr} data-stil="grafik">
        <h1 className="stammbaum-druck-titel">{titel}</h1>
        <FamilyTreeGraph
          personen={forDruck}
          personPathPrefix={PROJECT_ROUTES['k2-familie'].personen}
          printMode
          noPhotos={fotos === '0'}
          scale={printScale}
          layout={treeFromUrl}
          orientation={oriFromUrl}
          partnerHerkunftPersonId={einstellungen.partnerHerkunftPersonId}
          ichBinPersonId={einstellungen.ichBinPersonId}
          ichBinPositionAmongSiblings={einstellungen.ichBinPositionAmongSiblings}
        />
      </div>
    )
  }

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
              <h2 style={{ margin: '0 0 0.75rem', fontSize: '1rem', color: 'rgba(255,255,255,0.9)' }}>Als PDF / Plakat drucken</h2>
              <p className="meta" style={{ marginBottom: '0.75rem' }}>
                <strong>Nur Kleinfamilie:</strong> Gedruckt wird immer nur deine Kleinfamilie (du, Partner, Kinder, Partner der Kinder) – wie bei „Nur meine Kleinfamilie“. Dafür musst du im Stammbaum <strong>Das bin ich</strong> gesetzt haben.
              </p>
              <p className="meta" style={{ marginBottom: '1rem' }}>
                <strong>Für ein klares PDF:</strong> zuerst <strong>Personenblätter</strong>, <strong>Generationen</strong> oder <strong>Tabelle A–Z</strong> wählen – ohne verschachtelte Grafik. Die <strong>Stammbaum-Grafik</strong> eignet sich eher als Poster; im Druckdialog „Als PDF speichern“ wählen.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span className="meta">Inhalt</span>
                  <select
                    id="druck-stil"
                    value={druckStil}
                    onChange={(e) => {
                      const v = parsePrintStil(e.target.value)
                      setDruckStil(v)
                      if (v !== 'grafik' && druckFormat === 'poster') setDruckFormat('a4')
                    }}
                  >
                    <optgroup label="Übersichtliche PDFs (empfohlen)">
                      <option value="personenblaetter">Personenblätter (A4 hoch, eine Person pro Block)</option>
                      <option value="generationen">Liste nach Generationen</option>
                      <option value="register">Tabelle A–Z (breit → Druck Querformat)</option>
                    </optgroup>
                    <optgroup label="Grafik">
                      <option value="grafik">Stammbaum als Bild (bei vielen Personen unübersichtlich)</option>
                    </optgroup>
                  </select>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span className="meta">Papier / Größe</span>
                  <select
                    id="druck-format"
                    value={druckFormat}
                    onChange={(e) => setDruckFormat(e.target.value as PrintFormat)}
                  >
                    <option value="a4">A4</option>
                    <option value="a3">A3</option>
                    <option value="poster" disabled={druckStil !== 'grafik'}>
                      Poster (nur Stammbaum-Grafik)
                    </option>
                  </select>
                </label>
                {druckStil === 'grafik' && (
                  <>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span className="meta">Grafik-Richtung</span>
                      <select
                        id="druck-ori"
                        value={druckOri}
                        onChange={(e) => setDruckOri(e.target.value as TreeOrientation)}
                      >
                        <option value="vertical">Vertikal (ältere oben)</option>
                        <option value="horizontal">Horizontal (ältere links)</option>
                      </select>
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span className="meta">Grafik-Ansicht</span>
                      <select
                        id="druck-tree"
                        value={druckTree}
                        onChange={(e) => setDruckTree(e.target.value as FamilyTreeLayout)}
                      >
                        <option value="zeilen">Mit Zeilen / Blöcken (übersichtlich)</option>
                        <option value="baum">Eine Zeile pro Generation</option>
                      </select>
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span className="meta">Grafik: Fotos</span>
                      <select
                        id="druck-fotos"
                        value={druckFotos}
                        onChange={(e) => setDruckFotos(e.target.value as PrintFotos)}
                      >
                        <option value="1">Mit Fotos</option>
                        <option value="0">Nur Namen (sparsam)</option>
                      </select>
                    </label>
                  </>
                )}
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
                <button
                  type="button"
                  className="btn"
                  disabled={!einstellungen.ichBinPersonId}
                  title={!einstellungen.ichBinPersonId ? 'Zuerst bei deiner Person „Das bin ich“ wählen – Druck nur für die Kleinfamilie.' : undefined}
                  onClick={() =>
                    openDruck({
                      format: druckFormat,
                      fotos: druckFotos,
                      titel: druckTitel || undefined,
                      stil: druckStil,
                      ori: druckOri,
                      tree: druckTree,
                    })
                  }
                >
                  Druckvorschau &amp; Drucken
                </button>
              </div>
              {druckStil !== 'grafik' && (
                <p className="meta" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
                  {druckStil === 'register' ? (
                    <>Bei der <strong>Tabelle A–Z</strong>: im Druckdialog oft <strong>Querformat</strong> wählen, damit alle Spalten mit auf die Seite passen.</>
                  ) : druckStil === 'personenblaetter' ? (
                    <>Bei <strong>Personenblättern</strong>: <strong>Hochformat</strong> ist meist am besten (eine Spalte, gut lesbar).</>
                  ) : (
                    <>Bei <strong>Generationen</strong>: Hoch- oder Querformat nach Geschmack; lange Namen umbrechen automatisch.</>
                  )}
                </p>
              )}
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
          <p className="meta" style={{ marginBottom: '0.75rem' }}>
            Nur deine Kleinfamilie – Grafik und Karten unten zeigen nur diese Personen. Verstorbene: schwarzer Rand an der Kachel.
          </p>
        )}
        {stammbaumSektionen && stammbaumSektionen.length > 1 && !nurKleinfamilie && (
          <p className="meta" style={{ marginBottom: '0.75rem', maxWidth: '48rem' }}>
            <strong>Großfamilie:</strong> Blöcke nacheinander – zuerst <strong>Eltern</strong>, dann <strong>Kleinfamilie 1, 2, 3 …</strong> nach Geschwisterstellung (bei 12 Geschwistern + Eltern bis zu 13 Strukturen). Pro Block eine Randfarbe; innerhalb des Blocks kannst du Personen hinzufügen und bearbeiten.{' '}
            <strong>Verstorben:</strong> schwarzer Rand an der Kachel (Häkchen in der Personenkarte).
            {vieleStammbaumSektionen && (
              <>
                {' '}
                <strong>Viele Blöcke:</strong> Standard sind <strong>Eltern</strong> und <strong>deine Kleinfamilie</strong> geöffnet; Rest eingeklappt – Pfeil zum Aufklappen, unten springen per Leiste.
              </>
            )}
          </p>
        )}
        {vieleStammbaumSektionen && stammbaumSektionen && stammbaumSektionen.length > 0 && (
          <div
            className="k2-familie-stammbaum-sprungleiste"
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 6,
              marginBottom: '0.75rem',
              padding: '0.5rem 0',
              background: 'linear-gradient(180deg, rgba(15,23,42,0.97) 70%, rgba(15,23,42,0))',
              backdropFilter: 'blur(6px)',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.45rem', marginBottom: '0.5rem' }}>
              <span className="meta" style={{ marginRight: '0.25rem' }}>
                Blöcke:
              </span>
              <button
                type="button"
                className="btn-outline"
                style={{ fontSize: '0.82rem', padding: '0.25rem 0.65rem' }}
                onClick={() => {
                  if (!stammbaumSektionen) return
                  setSekExpanded(Object.fromEntries(stammbaumSektionen.map((s) => [s.key, true])))
                }}
              >
                Alle aufklappen
              </button>
              <button
                type="button"
                className="btn-outline"
                style={{ fontSize: '0.82rem', padding: '0.25rem 0.65rem' }}
                onClick={() => {
                  if (!stammbaumSektionen) return
                  setSekExpanded(Object.fromEntries(stammbaumSektionen.map((s) => [s.key, false])))
                }}
              >
                Alle einklappen
              </button>
              <button
                type="button"
                className="btn-outline"
                style={{ fontSize: '0.82rem', padding: '0.25rem 0.65rem' }}
                onClick={() => {
                  if (!stammbaumSektionen) return
                  const ichId = einstellungen.ichBinPersonId
                  const ichKey = ichId ? `kleinfamilie-${ichId}` : null
                  setSekExpanded(
                    Object.fromEntries(
                      stammbaumSektionen.map((s) => {
                        if (s.key === 'eltern') return [s.key, true]
                        if (ichKey && s.key === ichKey) return [s.key, true]
                        return [s.key, false]
                      })
                    )
                  )
                }}
              >
                Nur Eltern + meine Kleinfamilie
              </button>
            </div>
            <nav
              aria-label="Zu einem Block springen"
              style={{
                display: 'flex',
                gap: '0.35rem',
                flexWrap: 'wrap',
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch',
                paddingBottom: '0.15rem',
              }}
            >
              {stammbaumSektionen.map((sek) => (
                <a
                  key={`jump-${sek.key}`}
                  href={`#${stammbaumSektionDomId(sek.key)}`}
                  className="meta"
                  style={{
                    display: 'inline-block',
                    padding: '0.28rem 0.65rem',
                    borderRadius: 6,
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(148,163,184,0.35)',
                    color: 'rgba(255,255,255,0.95)',
                    fontSize: '0.82rem',
                    whiteSpace: 'nowrap',
                    textDecoration: 'none',
                  }}
                >
                  {stammbaumSektionTocLabel(sek)}
                </a>
              ))}
            </nav>
          </div>
        )}
        {stammbaumSektionen && stammbaumSektionen.length > 0 ? (
          stammbaumSektionen.map((sek, sekIdx) => {
            const compact = vieleStammbaumSektionen
            const avatarPx = compact ? 64 : 96
            const pad = compact ? '0.75rem' : '1.25rem'
            const gapInner = compact ? '0.45rem' : '0.75rem'
            const titleFs = compact ? '0.95rem' : '1.05rem'
            const shortLen = compact ? 48 : 70
            const gridMin = compact ? 'minmax(132px, 1fr)' : 'minmax(200px, 1fr)'
            const gridGap = compact ? '0.75rem' : '1.25rem'
            const mbSek = compact ? '1rem' : '2rem'

            const open =
              !vieleStammbaumSektionen ||
              (sekExpanded[sek.key] !== undefined
                ? sekExpanded[sek.key]!
                : defaultStammbaumSekOpen(sek, true, einstellungen.ichBinPersonId))

            const toggleSek = () => {
              if (!vieleStammbaumSektionen) return
              const cur =
                sekExpanded[sek.key] !== undefined
                  ? sekExpanded[sek.key]!
                  : defaultStammbaumSekOpen(sek, true, einstellungen.ichBinPersonId)
              setSekExpanded((prev) => ({ ...prev, [sek.key]: !cur }))
            }

            const sekDomId = stammbaumSektionDomId(sek.key)

            return (
              <section
                key={sek.key}
                id={sekDomId}
                style={{ marginBottom: mbSek, scrollMarginTop: '6rem' }}
              >
                {vieleStammbaumSektionen ? (
                  <button
                    type="button"
                    onClick={toggleSek}
                    aria-expanded={open}
                    style={{
                      display: 'flex',
                      width: '100%',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      padding: 0,
                      margin: '0 0 0.35rem',
                    }}
                  >
                    <span style={{ fontSize: '0.9rem', opacity: 0.85, flexShrink: 0, marginTop: '0.15rem' }} aria-hidden>
                      {open ? '▼' : '▶'}
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span
                        style={{
                          display: 'block',
                          fontSize: '1.12rem',
                          fontWeight: 700,
                          color: 'rgba(255,255,255,0.95)',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {sek.titel}
                      </span>
                    </span>
                  </button>
                ) : (
                  <h3
                    style={{
                      margin: '0 0 0.35rem',
                      fontSize: '1.12rem',
                      fontWeight: 700,
                      color: 'rgba(255,255,255,0.95)',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {sek.titel}
                  </h3>
                )}
                {sek.untertitel ? (
                  <p className="meta" style={{ margin: '0 0 0.85rem' }}>
                    {sek.untertitel}
                    {!open && vieleStammbaumSektionen ? (
                      <span style={{ opacity: 0.75 }}> · eingeklappt</span>
                    ) : null}
                  </p>
                ) : null}
                {open ? (
                  <div
                    className="k2-familie-stammbaum-grid"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(auto-fill, ${gridMin})`,
                      gap: gridGap,
                    }}
                  >
                    {sek.personen.map((p, i) => {
                      const st = getStammbaumBranchCardStyle(sek.branchIndex)
                      const r = stammbaumKachelRaender(p, st)
                      const delay = compact ? '0s' : `${(sekIdx * 24 + i) * 0.06}s`
                      return (
                        <Link
                          key={p.id}
                          to={`${PROJECT_ROUTES['k2-familie'].personen}/${p.id}`}
                          className="familie-card-enter"
                          style={{ textDecoration: 'none', color: 'inherit', animationDelay: delay }}
                          title={p.verstorben ? 'Verstorben – Person ansehen' : undefined}
                        >
                          <div
                            className="card"
                            style={{
                              padding: pad,
                              textAlign: 'center',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: gapInner,
                              border: r.cardBorder,
                              background: st.bg,
                              boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                            }}
                          >
                            {p.photo ? (
                              <img
                                src={p.photo}
                                alt=""
                                className="person-photo"
                                style={{
                                  width: avatarPx,
                                  height: avatarPx,
                                  borderRadius: '50%',
                                  objectFit: 'cover',
                                  border: r.avatarBorder,
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: avatarPx,
                                  height: avatarPx,
                                  borderRadius: '50%',
                                  background: 'rgba(13,148,136,0.25)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: compact ? '1.8rem' : '2.5rem',
                                  border: r.avatarBorder,
                                }}
                              >
                                👤
                              </div>
                            )}
                            <div style={{ width: '100%' }}>
                              <h2 style={{ margin: 0, fontSize: titleFs, lineHeight: 1.2 }}>{p.name}</h2>
                              {p.shortText && (
                                <p className="meta" style={{ margin: '0.35rem 0 0', fontSize: '0.82rem', lineHeight: 1.4 }}>
                                  {p.shortText.slice(0, shortLen)}
                                  {p.shortText.length > shortLen ? '…' : ''}
                                </p>
                              )}
                            </div>
                            <span className="meta" style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                              → ansehen
                            </span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                ) : null}
              </section>
            )
          })
        ) : (
          <div className="k2-familie-stammbaum-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem' }}>
            {stammbaumKarten.sortedPersonen.map((p, i) => {
              const bi = stammbaumKarten.branchIndexByKey.get(stammbaumKarten.getBranchKey(p)) ?? 0
              const st = getStammbaumBranchCardStyle(bi)
              const r = stammbaumKachelRaender(p, st)
              return (
                <Link
                  key={p.id}
                  to={`${PROJECT_ROUTES['k2-familie'].personen}/${p.id}`}
                  className="familie-card-enter"
                  style={{ textDecoration: 'none', color: 'inherit', animationDelay: `${i * 0.06}s` }}
                  title={p.verstorben ? 'Verstorben – Person ansehen' : undefined}
                >
                  <div
                    className="card"
                    style={{
                      padding: '1.25rem',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.75rem',
                      border: r.cardBorder,
                      background: st.bg,
                      boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                    }}
                  >
                    {p.photo ? (
                      <img
                        src={p.photo}
                        alt=""
                        className="person-photo"
                        style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: r.avatarBorder }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 96,
                          height: 96,
                          borderRadius: '50%',
                          background: 'rgba(13,148,136,0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '2.5rem',
                          border: r.avatarBorder,
                        }}
                      >
                        👤
                      </div>
                    )}
                    <div style={{ width: '100%' }}>
                      <h2 style={{ margin: 0, fontSize: '1.05rem', lineHeight: 1.2 }}>{p.name}</h2>
                      {p.shortText && <p className="meta" style={{ margin: '0.35rem 0 0', fontSize: '0.82rem', lineHeight: 1.4 }}>{p.shortText.slice(0, 70)}{p.shortText.length > 70 ? '…' : ''}</p>}
                    </div>
                    <span className="meta" style={{ fontSize: '0.9rem', opacity: 0.8 }}>→ ansehen</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {personen.length > 0 && (
          <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
            <button type="button" className="btn" onClick={addPerson}>＋ Person hinzufügen</button>
            {einstellungen.ichBinPersonId && (
              <>
                <button
                  type="button"
                  className="btn-outline"
                  title="Fügt Rupert, Notburga, Anna und Maria mit denselben Eltern wie du ein – für vier Kleinfamilien im Stammbaum (erste Ehe Anna Stöbich)."
                  onClick={() => {
                    const r = ensureErsteEheVierGeschwister(personen, einstellungen.ichBinPersonId!)
                    if (r.angelegt === 0) {
                      setErsteEheMsg(r.meldung)
                      setTimeout(() => setErsteEheMsg(''), 6000)
                      return
                    }
                    if (savePersonen(currentTenantId, r.personen, { allowReduce: false })) {
                      setStammbaumRefresh((k) => k + 1)
                      setErsteEheMsg(r.meldung)
                      setTimeout(() => setErsteEheMsg(''), 8000)
                    }
                  }}
                >
                  Erste Ehe: 4 Geschwister (Rupert, Notburga, Anna, Maria)
                </button>
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
                {ersteEheMsg && <span className="meta" style={{ color: 'rgba(20,184,166,0.95)', maxWidth: 420 }}>{ersteEheMsg}</span>}
                {partnersAddedMsg && <span className="meta" style={{ color: 'rgba(20,184,166,0.95)' }}>✓ Partner ergänzt (Rupert: 1. Frau verstorben, 2. Frau; Gisela: Mann verstorben)</span>}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
