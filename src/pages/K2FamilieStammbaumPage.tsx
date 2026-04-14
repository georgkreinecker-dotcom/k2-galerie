/**
 * K2 Familie – Stammbaum (Liste). Phase 2.1.
 * Route: /projects/k2-familie/stammbaum
 */

import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMemo, useEffect, useLayoutEffect, useCallback, useState, useRef, type MouseEvent as ReactMouseEvent } from 'react'
import '../App.css'
import { PROJECT_ROUTES } from '../config/navigation'
import { loadPersonen, savePersonen, loadEinstellungen, saveEinstellungen } from '../utils/familieStorage'
import { setIdentitaetBestaetigt } from '../utils/familieIdentitaetStorage'
import { getBeziehungenFromKarten, getFamilienzweigPersonen, getGeschwisterAnzeigeListe } from '../utils/familieBeziehungen'
import {
  buildStammbaumKartenState,
  buildGrossfamilieStammbaumSektionen,
  buildStammbaumPartnerUnterSektionen,
  buildStammbaumSektionenOhneGrossfamilieElternpaar,
  getStammbaumBranchCardStyle,
  type StammbaumKartenSektion,
} from '../utils/familieStammbaumKarten'
import { addPartnersForSiblingsExceptMaria } from '../utils/familieAddPartners'
import { ensureErsteEheVierGeschwister } from '../utils/familieErsteEheGeschwister'
import { getFamilieTenantDisplayName } from '../data/familieHuberMuster'
import { useFamilieTenant } from '../context/FamilieTenantContext'
import { useFamilieRolle } from '../context/FamilieRolleContext'
import type { K2FamilieEinstellungen, K2FamiliePerson } from '../types/k2Familie'
import { getAktuellesPersonenFoto } from '../utils/familiePersonFotos'
import FamilyTreeGraph, { type FamilyTreeLayout, type TreeOrientation } from '../components/FamilyTreeGraph'
import {
  StammbaumDruckGeburtstagsliste,
  StammbaumDruckNachGenerationen,
  StammbaumDruckPersonenblaetter,
  StammbaumDruckRegister,
  StammbaumDruckSchreibLeserechte,
  type KatalogSortierung,
} from '../components/StammbaumDruckFormate'
import {
  FAMILIE_KATALOG_SPALTEN_OPTIONS,
  loadFamilienKatalogSpalten,
  normalizeFamilieKatalogSpalten,
  saveFamilienKatalogSpalten,
} from '../utils/familieKatalogPreferences'

function generateId(): string {
  return 'person-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8)
}

type PrintFormat = 'a4' | 'a3' | 'poster'
type PrintFotos = '1' | '0'
/** Druck: Grafik oder übersichtliche Text-PDFs (ohne verschachtelte Grafik). */
type PrintStil =
  | 'grafik'
  | 'generationen'
  | 'register'
  | 'personenblaetter'
  | 'geburtstagsliste'
  | 'rechte'

/** Druck/PDF: ganze Familie oder nur Familienzweig von „Das bin ich“. */
type DruckUmfang = 'alle' | 'zweig'

const PRINT_STILE: PrintStil[] = [
  'personenblaetter',
  'generationen',
  'register',
  'geburtstagsliste',
  'rechte',
  'grafik',
]

function parsePrintStil(raw: string | null): PrintStil {
  if (raw && PRINT_STILE.includes(raw as PrintStil)) return raw as PrintStil
  return 'personenblaetter'
}

function parseDruckUmfang(raw: string | null): DruckUmfang {
  return raw === 'zweig' ? 'zweig' : 'alle'
}

/** Stammbaum: eine Kachel-Übersicht statt einer endlosen Seite (?bereich=). */
type StammbaumBereich = 'uebersicht' | 'karten' | 'nach-oben' | 'grafik' | 'pdf'

function parseStammbaumBereich(raw: string | null): StammbaumBereich {
  const v = raw?.toLowerCase()?.trim()
  if (v === 'karten' || v === 'nach-oben' || v === 'grafik' || v === 'pdf') return v
  if (v === 'uebersicht') return 'uebersicht'
  return 'uebersicht'
}

const STAMMBAUM_BEREICH_TITEL: Record<Exclude<StammbaumBereich, 'uebersicht'>, string> = {
  karten: 'Personen (alle Karten)',
  'nach-oben': 'Eltern & Vorfahren (gleiche Karten, anderer Fokus)',
  grafik: 'Grafik (Überblick)',
  pdf: 'Drucken & PDF',
}

/** Ein Satz: was dieser Bereich *ist* – nicht nur ein Schlagwort. */
const STAMMBAUM_BEREICH_UNTERTITEL: Record<Exclude<StammbaumBereich, 'uebersicht'>, string> = {
  karten:
    'Jede Person eine Karte – öffnen, bearbeiten, Beziehungen pflegen. Optional nur deinen Ast (Schalter „Nur mein Zweig“, wenn „Das bin ich“ gesetzt ist).',
  'nach-oben':
    'Dieselben Personen wie bei „Nach unten“, aber die Liste betont die Linie nach oben: Eltern, Großeltern, weiter zu den Wurzeln.',
  grafik:
    'Den Stammbaum als Bild – zoomen, Richtung wählen, Paare erkennen. Zum Anschauen, nicht zum Eintippen von Daten.',
  pdf:
    'Geburtstagslisten, Personenblätter, Katalog, Rechte-Übersicht – zum Drucken oder als PDF speichern.',
}

type StammbaumBereichTab = Exclude<StammbaumBereich, 'uebersicht'>

/** Symbol + Akzentfarbe pro Bereich (Lesbarkeit auf dunklem Grund, einheitliche Sprache). */
const STAMMBAUM_BEREICH_STIL: Record<
  StammbaumBereichTab,
  { symbol: string; accent: string; stripe: string; stripeSubtle: string; softBg: string; labelKurz: string }
> = {
  karten: {
    symbol: '🌿',
    accent: '#2dd4bf',
    stripe: 'rgba(45, 212, 191, 0.55)',
    stripeSubtle: 'rgba(45, 212, 191, 0.22)',
    softBg: 'rgba(45, 212, 191, 0.12)',
    labelKurz: 'Kinder',
  },
  'nach-oben': {
    symbol: '🌳',
    accent: '#fbbf24',
    stripe: 'rgba(251, 191, 36, 0.55)',
    stripeSubtle: 'rgba(251, 191, 36, 0.2)',
    softBg: 'rgba(251, 191, 36, 0.1)',
    labelKurz: 'Wurzeln',
  },
  grafik: {
    symbol: '🖼️',
    accent: '#7dd3fc',
    stripe: 'rgba(125, 211, 252, 0.5)',
    stripeSubtle: 'rgba(125, 211, 252, 0.2)',
    softBg: 'rgba(125, 211, 252, 0.1)',
    labelKurz: 'Bild',
  },
  pdf: {
    symbol: '📄',
    accent: '#fb923c',
    stripe: 'rgba(251, 146, 60, 0.55)',
    stripeSubtle: 'rgba(251, 146, 60, 0.2)',
    softBg: 'rgba(251, 146, 60, 0.11)',
    labelKurz: 'Druck',
  },
}

/** Kurzinfos für Tooltip am „i“-Icon (Tabs + Start-Kacheln). */
const STAMMBAUM_BEREICH_TABS: {
  key: StammbaumBereichTab
  label: string
  hint: string
  /** Untertitel auf der Start-Übersicht (optional, sonst = hint) */
  hintHub?: string
  info: string
}[] = [
  {
    key: 'karten',
    label: 'Nach unten',
    hint: 'Richtung Kinder: du, Partner, Nachkommen',
    info:
      'Arbeitsmodus „Nach unten“: Karten öffnen, Daten pflegen, Partner und Kinder eintragen. Das ist die Hauptarbeit im Stammbaum. Sinnvoll, wenn „Das bin ich“ schon gewählt ist.',
  },
  {
    key: 'nach-oben',
    label: 'Nach oben',
    hint: 'Richtung Wurzeln: Eltern, Vorfahren',
    info:
      'Arbeitsmodus „Nach oben“: dieselben Karten wie bei „Nach unten“, aber die Darstellung betont die Linie über dir (Eltern, weiter nach oben). Zum Ergänzen der Vorfahren.',
  },
  {
    key: 'grafik',
    label: 'Grafik',
    hint: 'Stammbaum als Bild, zoomen',
    hintHub: 'Bild, zoomen, Überblick',
    info:
      'Ansicht zum Anschauen: Stammbaum als Grafik, zoomen, Orientierung. Keine Eingabemaske – Bearbeitung bleibt bei den Karten.',
  },
  {
    key: 'pdf',
    label: 'Drucken',
    hint: 'Listen, A4, PDF speichern',
    info:
      'Alles für Papier oder Datei: Geburtstagslisten, Personenblätter, Katalog, Rechte-Seite, optional die Grafik. Druckdialog oder „Als PDF speichern“ im Browser.',
  },
]

/** Tooltip am „i“ neben „Nur mein Zweig“ */
const NUR_MEIN_ZWEIG_INFO =
  'Die Kartenliste kann auf deinen Familienzweig begrenzt werden: du, Partner, eure Kinder und deren Nachkommen. Geschwister und deren separate Familien blendet ihr aus. Voraussetzung: „Das bin ich“ ist gesetzt. Aus = alle Personen der Familie sichtbar (nach Blöcken sortiert).'

function StammbaumBereichInfoIcon({ text, corner }: { text: string; corner?: boolean }) {
  return (
    <span
      className={['stammbaum-bereich-info-icon', corner ? 'stammbaum-bereich-info-icon--corner' : '']
        .filter(Boolean)
        .join(' ')}
      title={text}
      aria-hidden="true"
    >
      i
    </span>
  )
}

/** Stammbaum-Kachel: bei „Verstorben“ in der Personenkarte schwarzer Rand (statt Zweig-Farbe). */
function stammbaumKachelRaender(p: K2FamiliePerson, st: { border: string; bg: string }) {
  const v = p.verstorben === true
  return {
    cardBorder: v ? '2px solid rgba(0,0,0,0.92)' : `2px solid ${st.border}`,
    avatarBorder: v ? '3px solid rgba(0,0,0,0.92)' : `3px solid ${st.border}`,
  }
}

/**
 * Ab dieser Anzahl Hauptblöcke: Akkordeon, kompakte Karten, Sprungleiste.
 * Muss niedrig sein: Nach Zusammenführung eines Geschwisterkreises in **einen** Familienzweig-Block
 * (z. B. Familie Lef: 4 Personen) gibt es oft nur 2–3 Blöcke (Eltern · Familienzweig · ggf. Weitere) –
 * bei 5 wäre die Ziehharmonika nie aktiv gewesen.
 */
const STAMMBAUM_VIELE_SEKTIONEN_AB = 2

function stammbaumSektionDomId(key: string): string {
  return `stammbaum-sek-${key.replace(/[^a-zA-Z0-9_-]/g, '-')}`
}

function stammbaumSektionTocLabel(s: StammbaumKartenSektion): string {
  if (s.key === 'eltern') return 'Eltern'
  if (s.key === 'weitere') return 'Weitere'
  if (s.key.startsWith('kleinfamilie-')) {
    const m = s.titel.match(/^Familienzweig\s+(\S+)\s*[–-]\s*(.+)$/)
    if (m) {
      const name = m[2].trim()
      return `${m[1]} · ${name.length > 16 ? `${name.slice(0, 16)}…` : name}`
    }
  }
  return s.titel.length > 26 ? `${s.titel.slice(0, 26)}…` : s.titel
}

/** Jede Person sieht zuerst den eigenen Familienzweig – außer sie wählt ausdrücklich die ganze Familie. */
function effectiveNurMeinFamilienzweig(einst: K2FamilieEinstellungen): boolean {
  if (!einst.ichBinPersonId) return false
  if (einst.stammbaumNurMeinFamilienzweig !== undefined) return einst.stammbaumNurMeinFamilienzweig
  return true
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
  const bereichParam = searchParams.get('bereich')
  const setStammbaumBereich = useCallback(
    (b: StammbaumBereich) => {
      setSearchParams(
        (prev) => {
          const n = new URLSearchParams(prev)
          if (b === 'uebersicht') n.set('bereich', 'uebersicht')
          else n.set('bereich', b)
          return n
        },
        { replace: true }
      )
    },
    [setSearchParams]
  )
  const { currentTenantId, familieStorageRevision } = useFamilieTenant()
  const { capabilities } = useFamilieRolle()
  const kannStruktur = capabilities.canEditStrukturUndStammdaten
  const kannOrganisch = capabilities.canEditOrganisches
  /** Druck / PDF: wie Schreibrecht – Inhaber:in + Bearbeiter:in (nicht Leser:in; Inhaber in Leser-Ansicht ebenfalls nicht). */
  const kannDrucken = capabilities.canEditFamiliendaten
  const kannManageFamilienInstanz = capabilities.canManageFamilienInstanz
  const [stammbaumRefresh, setStammbaumRefresh] = useState(0)
  const personen = useMemo(() => loadPersonen(currentTenantId), [currentTenantId, familieStorageRevision, stammbaumRefresh])
  const stammbaumBereich = useMemo((): StammbaumBereich => {
    const p = parseStammbaumBereich(bereichParam)
    if (personen.length > 0 && (bereichParam === null || bereichParam === '')) return 'karten'
    return p
  }, [bereichParam, personen.length])
  useLayoutEffect(() => {
    if (personen.length === 0) return
    if (bereichParam === null || bereichParam === '') {
      setSearchParams(
        (prev) => {
          const n = new URLSearchParams(prev)
          n.set('bereich', 'karten')
          return n
        },
        { replace: true }
      )
    }
  }, [personen.length, bereichParam, setSearchParams])
  useEffect(() => {
    if (typeof window === 'undefined') return
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [stammbaumBereich])
  const einstellungen = useMemo(() => loadEinstellungen(currentTenantId), [currentTenantId, familieStorageRevision, stammbaumRefresh])

  /** Beziehungen von „Du“ – ausschließlich aus den Karten (eine Quelle der Wahrheit). */
  const beziehungenDu = useMemo(() => {
    const id = einstellungen.ichBinPersonId
    return id ? getBeziehungenFromKarten(personen, id) : null
  }, [einstellungen.ichBinPersonId, personen])

  /** Geschwister für „Du“ – gleiche Quelle wie getGeschwisterAnzeigeListe (nur Karten). */
  const geschwisterDuAnzeigeText = useMemo(() => {
    const id = einstellungen.ichBinPersonId
    const g = id ? getGeschwisterAnzeigeListe(personen, id) : []
    return g.length ? g.map((p) => p.name).join(', ') : '–'
  }, [einstellungen.ichBinPersonId, personen])

  const druck = searchParams.get('druck') === '1'
  const umfangFromUrl = parseDruckUmfang(searchParams.get('umfang'))
  const formatFromUrl = (searchParams.get('format') as PrintFormat) || 'a4'
  const fotosFromUrl = (searchParams.get('fotos') as PrintFotos) || '1'
  const stilFromUrl = parsePrintStil(searchParams.get('stil'))
  const oriFromUrl = (searchParams.get('ori') as TreeOrientation) || 'vertical'
  const treeFromUrl = (searchParams.get('tree') as FamilyTreeLayout) || 'baum'
  const titelFromUrl = searchParams.get('titel') || getFamilieTenantDisplayName(currentTenantId, 'Familie')
  const katalogSortFromUrl: KatalogSortierung =
    searchParams.get('katalogSort') === 'geburt' ? 'geburt' : 'geschwister'
  const format = druck ? formatFromUrl : (searchParams.get('format') as PrintFormat) || 'a4'
  const fotos = druck ? fotosFromUrl : (searchParams.get('fotos') as PrintFotos) || '1'
  const titel = druck ? titelFromUrl : (searchParams.get('titel') || getFamilieTenantDisplayName(currentTenantId, 'Familie'))

  const [druckFormat, setDruckFormat] = useState<PrintFormat>(formatFromUrl)
  const [druckFotos, setDruckFotos] = useState<PrintFotos>(fotosFromUrl)
  const [druckUmfang, setDruckUmfang] = useState<DruckUmfang>(() => parseDruckUmfang(searchParams.get('umfang')))
  const [druckStil, setDruckStil] = useState<PrintStil>(stilFromUrl)
  const [druckOri, setDruckOri] = useState<TreeOrientation>(oriFromUrl)
  const [druckTree, setDruckTree] = useState<FamilyTreeLayout>(treeFromUrl)
  const [druckTitel, setDruckTitel] = useState(titelFromUrl)
  const [druckKatalogSort, setDruckKatalogSort] = useState<KatalogSortierung>(katalogSortFromUrl)
  const [druckKatalogSpalten, setDruckKatalogSpalten] = useState<string[]>(() =>
    loadFamilienKatalogSpalten(currentTenantId)
  )
  const [familyDisplayNameInput, setFamilyDisplayNameInput] = useState('')
  const [familyNameSaved, setFamilyNameSaved] = useState(false)
  const [partnersAddedMsg, setPartnersAddedMsg] = useState(false)
  const [ersteEheMsg, setErsteEheMsg] = useState('')
  const [viewZoom, setViewZoom] = useState(1)
  const nurMeinFamilienzweig = effectiveNurMeinFamilienzweig(einstellungen)
  const setNurMeinFamilienzweigPersist = useCallback(
    (checked: boolean) => {
      if (!kannOrganisch) return
      const e = loadEinstellungen(currentTenantId)
      if (saveEinstellungen(currentTenantId, { ...e, stammbaumNurMeinFamilienzweig: checked })) {
        setStammbaumRefresh((k) => k + 1)
      }
    },
    [currentTenantId, kannOrganisch]
  )
  /** Einsteiger-Karte ausblenden (nur Anzeige, localStorage). */
  const [stammbaumFuehrungAusblenden, setStammbaumFuehrungAusblenden] = useState(() => {
    try {
      return typeof localStorage !== 'undefined' && localStorage.getItem('k2-familie-stammbaum-fuehrung-zu') === '1'
    } catch {
      return false
    }
  })
  const [viewOrientation, setViewOrientation] = useState<TreeOrientation>('vertical')
  const ZOOM_MIN = 0.25
  const ZOOM_MAX = 2
  const ZOOM_STEP = 0.25

  /** Rechtsklick auf Personen-Kachel: Kontextmenü (Zuordnen → Personenseite Beziehungen). */
  const [kachelKontext, setKachelKontext] = useState<{ x: number; y: number; personId: string } | null>(null)
  const kachelKontextRef = useRef<HTMLDivElement | null>(null)

  const onStammbaumKachelContextMenu = (e: ReactMouseEvent, personId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setKachelKontext({ x: e.clientX, y: e.clientY, personId })
  }

  useEffect(() => {
    if (!kachelKontext) return
    const onDown = (ev: MouseEvent) => {
      if (kachelKontextRef.current?.contains(ev.target as Node)) return
      setKachelKontext(null)
    }
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') setKachelKontext(null)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [kachelKontext])

  /** Für Grafik und Karten: bei „Nur mein Familienzweig“ Du + Partner + Nachkommen – ohne Eltern-/Geschwister-Ebene oben (Grafik: Wurzel = Du + Partner). */
  const personenForGraph = useMemo(() => {
    if (nurMeinFamilienzweig && einstellungen.ichBinPersonId)
      return getFamilienzweigPersonen(personen, einstellungen.ichBinPersonId, {
        includeSiblingCircle: false,
        includeParentsOfCore: false,
      })
    return personen
  }, [personen, einstellungen.ichBinPersonId, nurMeinFamilienzweig])

  /** Karten: ein Raster pro Sektion (Großfamilie: Eltern → Familienzweig 1…n → Weitere) oder klassisch eine Liste. */
  const stammbaumKarten = useMemo(
    () => buildStammbaumKartenState(personenForGraph, einstellungen.ichBinPersonId),
    [personenForGraph, einstellungen.ichBinPersonId]
  )
  /** Wenn „Ich bin“ + Datenlage passt: Blöcke untereinander statt einem Gemisch. */
  const stammbaumSektionen = useMemo(() => {
    const ichId = einstellungen.ichBinPersonId
    if (!ichId || personenForGraph.length === 0) return null
    if (nurMeinFamilienzweig) {
      const sortedKlein = buildStammbaumKartenState(personenForGraph, ichId).sortedPersonen
      const unterSektionen = buildStammbaumPartnerUnterSektionen(personen, ichId, sortedKlein)
      return [
        {
          key: 'dein-familienzweig',
          titel: 'Dein Familienzweig',
          untertitel:
            sortedKlein.length > 0
              ? `${sortedKlein.length} Person${sortedKlein.length === 1 ? '' : 'en'}${
                  unterSektionen.length > 1
                    ? ` · ${unterSektionen.length} Teil-Zweige (Kern & Partner je Familienast)`
                    : ''
                }`
              : undefined,
          personen: sortedKlein,
          branchIndex: 0,
          unterSektionen: unterSektionen.length > 0 ? unterSektionen : undefined,
        },
      ]
    }
    const gross = buildGrossfamilieStammbaumSektionen(personenForGraph, ichId)
    if (gross !== null) return gross
    return buildStammbaumSektionenOhneGrossfamilieElternpaar(personen, personenForGraph, ichId)
  }, [personen, personenForGraph, einstellungen.ichBinPersonId, nurMeinFamilienzweig])

  const vieleStammbaumSektionen = Boolean(
    stammbaumSektionen &&
      stammbaumSektionen.length >= STAMMBAUM_VIELE_SEKTIONEN_AB &&
      !nurMeinFamilienzweig
  )

  const [sekExpanded, setSekExpanded] = useState<Record<string, boolean>>({})
  /** Teil-Zweige innerhalb eines Familienzweigs (Kern, Kind & Partner …) – optional einklappbar. */
  const [unterSektExpanded, setUnterSektExpanded] = useState<Record<string, boolean>>({})
  useEffect(() => {
    if (!vieleStammbaumSektionen) setSekExpanded({})
  }, [vieleStammbaumSektionen])
  useEffect(() => {
    if (!vieleStammbaumSektionen) setUnterSektExpanded({})
  }, [vieleStammbaumSektionen])

  useEffect(() => {
    setFamilyDisplayNameInput(einstellungen.familyDisplayName ?? '')
  }, [currentTenantId, einstellungen.familyDisplayName])

  const familieKopfName = useMemo(
    () => familyDisplayNameInput.trim() || getFamilieTenantDisplayName(currentTenantId, 'Familie'),
    [familyDisplayNameInput, currentTenantId]
  )

  useEffect(() => {
    setDruckKatalogSpalten(loadFamilienKatalogSpalten(currentTenantId))
  }, [currentTenantId])

  /** Nach Druck-Öffnung: Druckdialog (ganze Familie oder Familienzweig je nach umfang). */
  useEffect(() => {
    if (!druck || !kannDrucken) return
    if (stilFromUrl === 'rechte') {
      const t = setTimeout(() => window.print(), 300)
      return () => clearTimeout(t)
    }
    if (umfangFromUrl === 'alle') {
      if (personen.length === 0) return
    } else {
      if (!einstellungen.ichBinPersonId) return
      const klein = getFamilienzweigPersonen(personen, einstellungen.ichBinPersonId, {
        includeSiblingCircle: false,
        includeParentsOfCore: false,
      })
      if (klein.length === 0) return
    }
    const t = setTimeout(() => window.print(), 300)
    return () => clearTimeout(t)
  }, [druck, stilFromUrl, umfangFromUrl, personen, einstellungen.ichBinPersonId])

  const handleAfterPrint = useCallback(() => {
    if (druck) setSearchParams({}, { replace: true })
  }, [druck, setSearchParams])

  useEffect(() => {
    window.addEventListener('afterprint', handleAfterPrint)
    return () => window.removeEventListener('afterprint', handleAfterPrint)
  }, [handleAfterPrint])

  /** Kein extra Speichern-Button: nur bei Blur oder Enter (siehe Input). */
  const commitFamilyDisplayNameIfChanged = useCallback(() => {
    if (!kannStruktur) return
    const name = familyDisplayNameInput.trim()
    const e = loadEinstellungen(currentTenantId)
    const prev = (e.familyDisplayName ?? '').trim()
    if (name === prev) return
    if (saveEinstellungen(currentTenantId, { ...e, familyDisplayName: name || undefined })) {
      setStammbaumRefresh((k) => k + 1)
      setFamilyNameSaved(true)
      setTimeout(() => setFamilyNameSaved(false), 2000)
    }
  }, [currentTenantId, familyDisplayNameInput, kannStruktur])

  const handleSetIchBin = useCallback((personId: string) => {
    if (!kannStruktur) return
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
    if (changed) {
      setIdentitaetBestaetigt(currentTenantId, personId)
      setStammbaumRefresh((k: number) => k + 1)
    }
  }, [currentTenantId, personen, kannStruktur])

  const openDruck = (opts: {
    format: PrintFormat
    fotos: PrintFotos
    titel?: string
    stil: PrintStil
    ori: TreeOrientation
    tree: FamilyTreeLayout
    umfang: DruckUmfang
    katalogSort?: KatalogSortierung
  }) => {
    if (!kannDrucken) return
    const p = new URLSearchParams()
    p.set('druck', '1')
    p.set('format', opts.format)
    p.set('fotos', opts.fotos)
    p.set('stil', opts.stil)
    p.set('ori', opts.ori)
    p.set('tree', opts.tree)
    p.set('umfang', opts.umfang)
    if (opts.titel?.trim()) p.set('titel', opts.titel.trim())
    if (opts.stil === 'register') {
      p.set('katalogSort', opts.katalogSort === 'geburt' ? 'geburt' : 'geschwister')
    }
    setSearchParams(p)
  }

  const toggleDruckKatalogSpalte = useCallback(
    (id: string, checked: boolean) => {
      if (!kannOrganisch) return
      setDruckKatalogSpalten((prev) => {
        let next: string[]
        if (checked) {
          next = prev.includes(id) ? prev : [...prev, id]
        } else {
          next = prev.filter((x) => x !== id)
        }
        const norm = normalizeFamilieKatalogSpalten(next)
        saveFamilienKatalogSpalten(currentTenantId, norm)
        return norm
      })
    },
    [currentTenantId, kannOrganisch]
  )

  const printScale = format === 'poster' ? 1.5 : format === 'a3' ? 1.2 : 1
  /** Wie Druck/PDF-Seite: Skalierung der Grafik nach Papierwahl (Vorschau im PDF-Bereich). */
  const previewPrintScale = druckFormat === 'poster' ? 1.5 : druckFormat === 'a3' ? 1.2 : 1

  /** PDF/Plakat: Familienzweig wie „Nur mein Familienzweig“ (Du + Partner + Nachkommen, ohne Eltern-/Geschwisterkreis). */
  const personenFuerDruck = useMemo(() => {
    if (!einstellungen.ichBinPersonId) return [] as K2FamiliePerson[]
    return getFamilienzweigPersonen(personen, einstellungen.ichBinPersonId, {
      includeSiblingCircle: false,
      includeParentsOfCore: false,
    })
  }, [personen, einstellungen.ichBinPersonId])

  /** Druck/Vorschau: nach Umfang-Wahl – ganze Familie oder nur Familienzweig (URL bei druck=1, sonst Panel-State). */
  const personenDruckInhalt = useMemo(() => {
    const umfang = druck ? umfangFromUrl : druckUmfang
    if (umfang === 'alle') return personen
    return personenFuerDruck
  }, [druck, umfangFromUrl, druckUmfang, personen, personenFuerDruck])

  const zeigeStammbaumUebersicht =
    (personen.length === 0 && stammbaumBereich !== 'pdf') || stammbaumBereich === 'uebersicht'
  const zeigeKarten = personen.length > 0 && stammbaumBereich === 'karten'
  const zeigeNachOben = personen.length > 0 && stammbaumBereich === 'nach-oben'
  const zeigeGrafik = personen.length > 0 && stammbaumBereich === 'grafik'
  const zeigePdf = stammbaumBereich === 'pdf'

  if (druck) {
    if (!kannDrucken) {
      return (
        <div className="stammbaum-druck-view" data-stil="hinweis">
          <div className="card" style={{ maxWidth: 440, margin: '2rem auto', padding: '1.25rem' }}>
            <h1 style={{ margin: '0 0 0.75rem', fontSize: '1.1rem' }}>Drucken nicht verfügbar</h1>
            <p className="meta" style={{ margin: 0, lineHeight: 1.45 }}>
              <strong>Drucken und PDF</strong> sind nur mit <strong>Schreibrecht</strong> möglich (Inhaber:in oder Bearbeiter:in).{' '}
              <strong>Listen und Vorschau</strong> in Schritt 4 kannst du als Leser:in weiterhin ansehen.
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
    const dataFormatAttr = formatFromUrl === 'poster' ? 'poster' : formatFromUrl
    if (stilFromUrl === 'rechte') {
      return (
        <div className="stammbaum-druck-view" data-format={dataFormatAttr} data-stil="rechte">
          <StammbaumDruckSchreibLeserechte familienName={titel} />
        </div>
      )
    }
    if (umfangFromUrl === 'alle') {
      if (personen.length === 0) {
        return (
          <div className="stammbaum-druck-view" data-stil="hinweis">
            <div className="card" style={{ maxWidth: 420, margin: '2rem auto', padding: '1.25rem' }}>
              <h1 style={{ margin: '0 0 0.75rem', fontSize: '1.1rem' }}>Keine Personen zum Drucken</h1>
              <p className="meta" style={{ margin: 0 }}>Lege zuerst Personen an, dann kannst du die ganze Familie oder einen Zweig drucken.</p>
              <p style={{ margin: '1rem 0 0' }}>
                <button type="button" className="btn" onClick={() => setSearchParams({}, { replace: true })}>
                  Zurück zum Stammbaum
                </button>
              </p>
            </div>
          </div>
        )
      }
    } else if (!einstellungen.ichBinPersonId || personenFuerDruck.length === 0) {
      return (
        <div className="stammbaum-druck-view" data-stil="hinweis">
          <div className="card" style={{ maxWidth: 420, margin: '2rem auto', padding: '1.25rem' }}>
            <h1 style={{ margin: '0 0 0.75rem', fontSize: '1.1rem' }}>Druck: Nur Familienzweig</h1>
            <p className="meta" style={{ margin: 0 }}>
              {personen.length === 0 ? (
                'Sobald Personen angelegt sind, kannst du dich im Stammbaum mit „Das bin ich“ festlegen – dann ist der Druck für deinen Familienzweig möglich (du, Partner, Kinder, Partner der Kinder).'
              ) : (
                <>
                  Bitte im Stammbaum bei deiner Person <strong>Das bin ich</strong> wählen. Oder wähle in Schritt 4 beim Druck <strong>Ganze erfasste Familie</strong>.
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
    const forDruck = personenDruckInhalt

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
            sortierung={katalogSortFromUrl}
            spalten={loadFamilienKatalogSpalten(currentTenantId)}
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
    if (stilFromUrl === 'geburtstagsliste') {
      return (
        <div className="stammbaum-druck-view" data-format={dataFormatAttr} data-stil="geburtstagsliste">
          <StammbaumDruckGeburtstagsliste
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
          personen={personenDruckInhalt}
          personPathPrefix={PROJECT_ROUTES['k2-familie'].personen}
          printMode
          noPhotos={fotos === '0'}
          scale={printScale}
          layout={treeFromUrl}
          orientation={oriFromUrl}
          partnerHerkunftPersonId={einstellungen.partnerHerkunftPersonId}
          ichBinPersonId={einstellungen.ichBinPersonId}
          ichBinPositionAmongSiblings={einstellungen.ichBinPositionAmongSiblings}
          familienzweigWurzelPersonId={
            umfangFromUrl === 'zweig' && einstellungen.ichBinPersonId
              ? einstellungen.ichBinPersonId
              : undefined
          }
        />
      </div>
    )
  }

  const addPerson = () => {
    if (!kannStruktur) return
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
            {/** Familie wählen / Neue Familie: nur in K2FamilieLayout (keine zweite Zeile) */}
            <h1
              style={{
                margin: '0 0 0.35rem',
                fontSize: 'clamp(1.35rem, 4vw, 1.85rem)',
                fontWeight: 700,
                lineHeight: 1.2,
                color: 'rgba(255,255,255,0.96)',
              }}
            >
              {familieKopfName}
            </h1>
            {kannStruktur && (
              <div
                className="familie-name-save"
                style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}
              >
                <label htmlFor="ft-family-display-name" className="meta" title="Nur für die gerade gewählte Familie – nicht zum Wechseln zwischen Familien (das geht oben).">
                  Anzeigename bearbeiten (nur diese Familie):
                </label>
                <input
                  id="ft-family-display-name"
                  type="text"
                  value={familyDisplayNameInput}
                  onChange={(e) => setFamilyDisplayNameInput(e.target.value)}
                  onBlur={commitFamilyDisplayNameIfChanged}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      ;(e.currentTarget as HTMLInputElement).blur()
                    }
                  }}
                  placeholder="z. B. Familie Kreinecker"
                  autoComplete="off"
                  name="ft-family-display"
                  title="Name dieser Familie speichern: Feld verlassen oder Enter. Familie wechseln: oben in der Leiste."
                  style={{ minWidth: 200, maxWidth: '100%', padding: '0.35rem 0.5rem' }}
                />
                {familyNameSaved && (
                  <span className="meta" style={{ color: 'rgba(20,184,166,0.95)' }}>
                    ✓ Gespeichert
                  </span>
                )}
                <span className="meta" style={{ opacity: 0.82, fontSize: '0.78rem' }}>
                  Speichert beim Verlassen des Feldes oder Enter
                </span>
              </div>
            )}
            {zeigeStammbaumUebersicht && (
              <>
                <h2 style={{ margin: '0.35rem 0 0', fontSize: '1.25rem', color: 'rgba(255,255,255,0.96)' }}>Stammbaum</h2>
                <details className="meta" style={{ margin: '0.35rem 0 0' }}>
                  <summary style={{ cursor: 'pointer', color: 'rgba(20,184,166,0.95)' }}>Kurz: „Das bin ich“, Partner, Kinder</summary>
                  <p style={{ margin: '0.5rem 0 0', lineHeight: 1.45 }}>
                    In der <strong>Grafik</strong> unten: <strong>Das bin ich</strong> wählen. Partner: <strong>Partner*innen</strong> auf deiner Personenseite. Kinder: <strong>Kinder</strong>. Falsche Reihe? Person öffnen → Eltern in der Karte anpassen.
                  </p>
                </details>
                {einstellungen.ichBinPersonId && kannStruktur && (
                  <p style={{ margin: '0.5rem 0 0' }}>
                    <button type="button" className="btn-outline" style={{ fontSize: '0.9rem' }} onClick={() => { const e = loadEinstellungen(currentTenantId); if (saveEinstellungen(currentTenantId, { ...e, ichBinPersonId: undefined, ichBinPositionAmongSiblings: undefined })) setStammbaumRefresh((k) => k + 1); }}>Du zurücksetzen</button>
                    <span className="meta" style={{ marginLeft: '0.5rem' }}>– falls „Das bin ich“ falsch</span>
                  </p>
                )}
                {beziehungenDu && (
                  <details className="meta" style={{ marginTop: '0.6rem', padding: '0.5rem 0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: 6 }}>
                    <summary style={{ cursor: 'pointer', color: 'rgba(20,184,166,0.95)' }}>Deine Beziehungen aus den Karten (Überblick)</summary>
                    <p style={{ margin: '0.45rem 0 0', lineHeight: 1.45 }}>Geschwister auch aus gemeinsamen Eltern:</p>
                    <ul style={{ margin: '0.35rem 0 0', paddingLeft: '1.2rem' }}>
                      <li>Eltern: {beziehungenDu.eltern.length ? beziehungenDu.eltern.map((p) => p.name).join(', ') : '–'}</li>
                      <li>Kinder: {beziehungenDu.kinder.length ? beziehungenDu.kinder.map((p) => p.name).join(', ') : '–'}</li>
                      <li>Geschwister: {geschwisterDuAnzeigeText}</li>
                      <li>Partner: {beziehungenDu.partner.length ? beziehungenDu.partner.map((p) => p.name).join(', ') : '–'}</li>
                    </ul>
                  </details>
                )}
              </>
            )}
            {(personen.length > 0 || stammbaumBereich === 'pdf') && !zeigeStammbaumUebersicht && (
              <div className="no-print" style={{ marginTop: '0.35rem' }}>
                <nav aria-label="Stammbaum: Bereich wählen">
                  <p style={{ margin: '0 0 0.25rem', fontSize: '0.88rem', fontWeight: 700, color: 'rgba(255,255,255,0.96)', lineHeight: 1.35 }}>
                    Vier Bereiche – was willst du gerade tun?
                  </p>
                  <p
                    style={{
                      margin: '0 0 0.55rem',
                      fontSize: '0.8rem',
                      lineHeight: 1.45,
                      color: 'rgba(226, 232, 240, 0.9)',
                      maxWidth: '44rem',
                    }}
                  >
                    <strong style={{ color: 'rgba(255,255,255,0.95)' }}>Nach unten / Nach oben</strong> = dieselben Personenkarten, nur andere Sortierung (Kinderlinie vs. Vorfahren).{' '}
                    <strong style={{ color: 'rgba(255,255,255,0.95)' }}>Grafik / Drucken</strong> = anschauen oder ausdrucken, weniger tippen.
                  </p>
                  <div
                    role="tablist"
                    aria-orientation="horizontal"
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.45rem',
                      alignItems: 'stretch',
                    }}
                  >
                    {STAMMBAUM_BEREICH_TABS.map((tab, idx) => {
                      const active = stammbaumBereich === tab.key
                      const st = STAMMBAUM_BEREICH_STIL[tab.key]
                      return (
                        <button
                          key={tab.key}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          title={tab.info}
                          onClick={() => setStammbaumBereich(tab.key)}
                          style={{
                            flex: '1 1 140px',
                            minWidth: 132,
                            maxWidth: 220,
                            textAlign: 'left',
                            padding: '0.5rem 0.65rem',
                            borderRadius: 10,
                            border: active ? `2px solid ${st.accent}` : '1px solid rgba(148,163,184,0.4)',
                            borderLeft: `4px solid ${active ? st.stripe : st.stripeSubtle}`,
                            background: active
                              ? `linear-gradient(145deg, ${st.softBg} 0%, rgba(15,23,42,0.72) 100%)`
                              : `linear-gradient(90deg, ${st.softBg} 0%, rgba(15,23,42,0.52) 55%)`,
                            color: 'inherit',
                            cursor: 'pointer',
                            font: 'inherit',
                          }}
                        >
                          <span
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              justifyContent: 'space-between',
                              gap: '0.35rem',
                              width: '100%',
                            }}
                          >
                            <span style={{ minWidth: 0 }}>
                              <span style={{ fontSize: '1rem', marginRight: '0.25rem' }} aria-hidden>
                                {st.symbol}
                              </span>
                              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'rgba(255,255,255,0.96)' }}>
                                {idx + 1}.{' '}
                              </span>
                              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'rgba(255,255,255,0.96)' }}>{tab.label}</span>
                            </span>
                            <StammbaumBereichInfoIcon text={tab.info} />
                          </span>
                          <span
                            style={{
                              display: 'block',
                              marginTop: '0.25rem',
                              fontSize: '0.78rem',
                              lineHeight: 1.4,
                              color: 'rgba(226, 232, 240, 0.92)',
                            }}
                          >
                            {tab.hint}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </nav>
                {(() => {
                  const st = STAMMBAUM_BEREICH_STIL[stammbaumBereich]
                  return (
                    <div
                      style={{
                        marginTop: '0.65rem',
                        padding: '0.65rem 0.85rem',
                        borderRadius: 10,
                        border: `1px solid rgba(148,163,184,0.28)`,
                        borderLeft: `5px solid ${st.stripe}`,
                        background: `linear-gradient(100deg, ${st.softBg} 0%, rgba(15,23,42,0.42) 100%)`,
                      }}
                    >
                      <h2 style={{ margin: 0, fontSize: '1.12rem', color: 'rgba(255,255,255,0.96)' }}>
                        <span style={{ marginRight: '0.4rem' }} aria-hidden>
                          {st.symbol}
                        </span>
                        {STAMMBAUM_BEREICH_TITEL[stammbaumBereich]}
                      </h2>
                      <p style={{ margin: '0.35rem 0 0', fontSize: '0.84rem', lineHeight: 1.5, maxWidth: '44rem', color: 'rgba(226, 232, 240, 0.92)' }}>
                        {STAMMBAUM_BEREICH_UNTERTITEL[stammbaumBereich]}
                      </p>
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
        </header>

        {personen.length === 0 && (
          <div className="card familie-card-enter" style={{ animationDelay: '0s', padding: '1.25rem', border: '1px solid rgba(13,148,136,0.4)' }}>
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', color: 'rgba(255,255,255,0.95)' }}>Grundstruktur anlegen</h2>
            <p className="meta" style={{ margin: 0 }}>Du und Partner, Kinder unten, Geschwister oben, Vater und Mütter – einmal die Struktur festlegen. Fehlende Personen kannst du später jederzeit einfügen.</p>
            <div style={{ marginTop: '1rem' }}>
              {kannStruktur ? (
                <Link to={PROJECT_ROUTES['k2-familie'].grundstruktur} className="btn" style={{ marginRight: '0.75rem' }}>Grundstruktur anlegen</Link>
              ) : (
                <p className="meta" style={{ margin: '0 0 0.75rem', maxWidth: '40rem' }}>
                  Grundstruktur und erste Personen anlegen ist nur für Inhaber:in möglich.
                </p>
              )}
              {!einstellungen.stammbaumSchlusspunkt && kannStruktur && (
                <button type="button" className="btn-outline" onClick={addPerson}>＋ Einzelne Person hinzufügen</button>
              )}
            </div>
            <p className="meta" style={{ margin: '0.85rem 0 0', lineHeight: 1.45, maxWidth: '40rem' }}>
              Auch ohne Personen:{' '}
              <button
                type="button"
                className="btn-outline"
                style={{ fontSize: '0.88rem', marginLeft: 4 }}
                onClick={() => setStammbaumBereich('pdf')}
              >
                PDF &amp; Drucken
              </button>
              <span className="meta" style={{ marginLeft: 6 }}>– z.&nbsp;B. Schreib- und Leserechte für die Familie (eine Seite).</span>
            </p>
          </div>
        )}

        {personen.length > 0 && stammbaumBereich === 'uebersicht' && (
          <nav className="no-print k2-familie-stammbaum-hub" aria-label="Stammbaum Bereiche" style={{ marginBottom: '1rem' }}>
            <p style={{ margin: '0 0 0.35rem', fontWeight: 700, color: 'rgba(255,255,255,0.96)', fontSize: '0.95rem' }}>Wohin als Nächstes?</p>
            <p style={{ margin: '0 0 0.65rem', fontSize: '0.8rem', lineHeight: 1.45, color: 'rgba(226, 232, 240, 0.88)', maxWidth: '42rem' }}>
              Tippe einen Bereich – unten siehst du die ausführlichere Überschrift und Erklärung.
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(158px, 1fr))',
                gap: '0.75rem',
              }}
            >
              {STAMMBAUM_BEREICH_TABS.map((tab, idx) => {
                const hubHint = tab.hintHub ?? tab.hint
                const st = STAMMBAUM_BEREICH_STIL[tab.key]
                return (
                  <button
                    key={tab.key}
                    type="button"
                    className="card familie-card-enter"
                    title={tab.info}
                    style={{
                      margin: 0,
                      padding: '1rem 0.85rem',
                      paddingRight: '1.75rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      position: 'relative',
                      border: `2px solid ${st.accent}99`,
                      borderLeft: `5px solid ${st.stripe}`,
                      background: `linear-gradient(165deg, ${st.softBg} 0%, rgba(15,23,42,0.52) 100%)`,
                      borderRadius: 12,
                      color: 'inherit',
                      font: 'inherit',
                    }}
                    onClick={() => setStammbaumBereich(tab.key)}
                  >
                    <StammbaumBereichInfoIcon text={tab.info} corner />
                    <span style={{ fontSize: '1.35rem', lineHeight: 1, display: 'flex', alignItems: 'center', gap: '0.35rem' }} aria-hidden>
                      <span style={{ fontSize: '1.5rem' }}>{st.symbol}</span>
                      <span style={{ fontWeight: 800, color: st.accent }}>{idx + 1}</span>
                    </span>
                    <span
                      style={{
                        display: 'block',
                        marginTop: '0.35rem',
                        fontWeight: 700,
                        fontSize: '0.98rem',
                        color: 'rgba(255,255,255,0.96)',
                      }}
                    >
                      {tab.label}
                    </span>
                    <span style={{ display: 'block', marginTop: '0.35rem', lineHeight: 1.45, fontSize: '0.82rem', color: 'rgba(226, 232, 240, 0.9)' }}>
                      {hubHint}
                    </span>
                  </button>
                )
              })}
            </div>
          </nav>
        )}

        {personen.length > 0 && stammbaumBereich === 'uebersicht' && !stammbaumFuehrungAusblenden && (
          <section
            className="card familie-card-enter no-print"
            aria-label="Einstieg Stammbaum"
            style={{
              marginBottom: '1rem',
              padding: '1rem 1.1rem',
              border: '1px solid rgba(20,184,166,0.5)',
              background: 'linear-gradient(165deg, rgba(13,148,136,0.18) 0%, rgba(15,23,42,0.5) 100%)',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.05rem', color: 'rgba(255,255,255,0.96)' }}>So ist der Stammbaum aufgebaut</h2>
              <button
                type="button"
                className="btn-outline"
                style={{ fontSize: '0.85rem', flexShrink: 0 }}
                onClick={() => {
                  try {
                    localStorage.setItem('k2-familie-stammbaum-fuehrung-zu', '1')
                  } catch {
                    /* ignore */
                  }
                  setStammbaumFuehrungAusblenden(true)
                }}
              >
                Hinweis ausblenden
              </button>
            </div>
            <p className="meta" style={{ margin: '0.5rem 0 0.65rem', lineHeight: 1.5, maxWidth: '42rem' }}>
              Zuerst <strong>nach unten</strong> (du, Partner, Kinder), dann <strong>nach oben</strong> (Eltern …). Nicht alles auf einmal.
            </p>
            <ol
              style={{
                margin: 0,
                paddingLeft: '1.15rem',
                lineHeight: 1.55,
                color: 'rgba(255,255,255,0.92)',
                fontSize: '0.94rem',
                maxWidth: '44rem',
              }}
            >
              <li style={{ marginBottom: '0.35rem' }}>
                <strong>1 – Nach unten:</strong> Hauptarbeit – Karten, Partner, Kinder (Richtung jüngere Generationen).
              </li>
              <li style={{ marginBottom: '0.35rem' }}>
                <strong>2 – Nach oben:</strong> dieselben Karten, Fokus auf Eltern und Vorfahren (Richtung ältere Generationen).
              </li>
              <li>
                <strong>3 &amp; 4 – Grafik / Drucken:</strong> anschauen oder ausdrucken (PDF, Listen) – weniger Datenpflege.
              </li>
            </ol>
          </section>
        )}

        {zeigeKarten && (
        <div id="stufe-nach-unten" style={{ scrollMarginTop: '5rem' }}>
        {einstellungen.ichBinPersonId && (
          <div
            className="no-print"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.75rem',
              padding: '0.5rem 0.65rem',
              borderRadius: 8,
              background: `linear-gradient(95deg, ${STAMMBAUM_BEREICH_STIL.karten.softBg} 0%, rgba(15,23,42,0.35) 100%)`,
              border: `1px solid ${STAMMBAUM_BEREICH_STIL.karten.stripeSubtle}`,
              borderLeft: `4px solid ${STAMMBAUM_BEREICH_STIL.karten.stripe}`,
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', margin: 0 }}>
              <input
                type="checkbox"
                checked={nurMeinFamilienzweig}
                onChange={(e) => setNurMeinFamilienzweigPersist(e.target.checked)}
                aria-label="Kartenliste auf meinen Familienzweig einschränken (du, Partner, eure Nachkommen; ohne Geschwister-Äste)"
              />
              <span style={{ fontSize: '1rem', marginRight: '0.15rem' }} aria-hidden>
                {STAMMBAUM_BEREICH_STIL.karten.symbol}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.96)', fontSize: '0.92rem', fontWeight: 600 }}>Nur mein Zweig in der Liste</span>
              <StammbaumBereichInfoIcon text={NUR_MEIN_ZWEIG_INFO} />
            </label>
            <span style={{ fontSize: '0.82rem', maxWidth: '38rem', lineHeight: 1.45, color: 'rgba(226, 232, 240, 0.92)' }}>
              <strong style={{ color: 'rgba(255,255,255,0.96)' }}>Ein</strong>: nur du, Partner und eure Kinder-Linie (Geschwister mit eigenen Familien sind ausgeblendet).{' '}
              <strong style={{ color: 'rgba(255,255,255,0.96)' }}>Aus</strong>: <strong>alle</strong> Personen der Familie – auch andere Äste.
            </span>
          </div>
        )}

        {nurMeinFamilienzweig && einstellungen.ichBinPersonId && (
          <details className="meta" style={{ marginBottom: '0.75rem', maxWidth: '48rem' }}>
            <summary style={{ cursor: 'pointer', color: 'rgba(20,184,166,0.95)', fontWeight: 600 }}>Mehr zu „Nur mein Zweig“</summary>
            <p style={{ margin: '0.5rem 0 0', lineHeight: 1.45, color: 'rgba(226, 232, 240, 0.92)' }}>
              Gemeint ist nur die <strong style={{ color: 'rgba(255,255,255,0.95)' }}>Kartenliste</strong> – nicht die Personen löschen. Es erscheinen nur du, Partner und eure Nachkommen; die Liste ist in Bereiche geteilt (du &amp; Partner, dann Kinder-Äste). Karte öffnen mit <strong>ansehen</strong>. In der Grafik: Paare erkennbar. Verstorbene: <strong>schwarzer Rand</strong> an der Karte.
            </p>
          </details>
        )}
        {stammbaumSektionen && stammbaumSektionen.length > 1 && !nurMeinFamilienzweig && (
          <details className="meta" style={{ marginBottom: '0.75rem', maxWidth: '48rem' }}>
            <summary style={{ cursor: 'pointer', color: 'rgba(20,184,166,0.95)', fontWeight: 600 }}>Mehr bei einer großen Familie</summary>
            <p style={{ margin: '0.5rem 0 0', lineHeight: 1.45 }}>
              Zuerst <strong>Eltern</strong>, dann je ein großer Bereich pro Geschwister-Linie. Darin: <strong>Kern</strong> (Person &amp; Partner) und Unterbereiche für <strong>Kinder</strong> bzw. <strong>Geschwister</strong> mit ihren Familien. Farbe am Rand = ein großer Bereich. Verstorbene: schwarzer Rand. Bei vielen Bereichen sind oft nur Eltern und dein Zweig aufgeklappt – die Leiste unten hilft beim Springen.
            </p>
          </details>
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
              <span className="meta" style={{ marginRight: '0.15rem', fontWeight: 600, color: 'rgba(255,255,255,0.88)' }}>
                Springen:
              </span>
              <details className="meta" style={{ display: 'inline-block' }}>
                <summary
                  style={{
                    cursor: 'pointer',
                    listStyle: 'none',
                    color: 'rgba(20,184,166,0.95)',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    padding: '0.2rem 0',
                  }}
                >
                  Listen öffnen &amp; schließen
                </summary>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.45rem' }}>
                  <button
                    type="button"
                    className="btn-outline"
                    style={{ fontSize: '0.82rem', padding: '0.25rem 0.65rem' }}
                    onClick={() => {
                      if (!stammbaumSektionen) return
                      setSekExpanded(Object.fromEntries(stammbaumSektionen.map((s) => [s.key, true])))
                      setUnterSektExpanded({})
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
                      const alleTeilzweigeZu: Record<string, boolean> = {}
                      for (const s of stammbaumSektionen) {
                        for (const us of s.unterSektionen ?? []) {
                          alleTeilzweigeZu[`${s.key}::${us.key}`] = false
                        }
                      }
                      setUnterSektExpanded(alleTeilzweigeZu)
                    }}
                  >
                    Alle zuklappen
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
                      setUnterSektExpanded({})
                    }}
                  >
                    Nur Eltern + mein Zweig
                  </button>
                </div>
              </details>
            </div>
            <nav
              aria-label="Zu einem Bereich springen"
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
                  sek.unterSektionen && sek.unterSektionen.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? '0.85rem' : '1.15rem' }}>
                      {sek.unterSektionen.map((us, usIdx) => {
                        const unterAccordion =
                          compact && sek.unterSektionen!.length > 1
                        const unterKey = `${sek.key}::${us.key}`
                        const unterOpen =
                          !unterAccordion || unterSektExpanded[unterKey] !== false
                        const toggleUnter = () => {
                          if (!unterAccordion) return
                          setUnterSektExpanded((prev) => {
                            const cur = prev[unterKey] !== false
                            return { ...prev, [unterKey]: !cur }
                          })
                        }
                        return (
                          <div
                            key={us.key}
                            style={{
                              borderLeft: '3px solid rgba(148, 163, 184, 0.5)',
                              paddingLeft: compact ? '0.55rem' : '0.85rem',
                            }}
                          >
                            {unterAccordion ? (
                              <button
                                type="button"
                                onClick={toggleUnter}
                                aria-expanded={unterOpen}
                                style={{
                                  display: 'flex',
                                  width: '100%',
                                  alignItems: 'flex-start',
                                  gap: '0.4rem',
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  padding: 0,
                                  margin: '0 0 0.2rem',
                                }}
                              >
                                <span
                                  style={{ fontSize: '0.82rem', opacity: 0.8, flexShrink: 0, marginTop: '0.12rem' }}
                                  aria-hidden
                                >
                                  {unterOpen ? '▼' : '▶'}
                                </span>
                                <span style={{ flex: 1, minWidth: 0 }}>
                                  <span
                                    style={{
                                      display: 'block',
                                      fontSize: compact ? '0.88rem' : '0.98rem',
                                      fontWeight: 700,
                                      color: 'rgba(255,255,255,0.92)',
                                      letterSpacing: '0.02em',
                                    }}
                                  >
                                    {us.titel}
                                  </span>
                                </span>
                              </button>
                            ) : (
                              <h4
                                style={{
                                  margin: '0 0 0.25rem',
                                  fontSize: compact ? '0.88rem' : '0.98rem',
                                  fontWeight: 700,
                                  color: 'rgba(255,255,255,0.92)',
                                  letterSpacing: '0.02em',
                                }}
                              >
                                {us.titel}
                              </h4>
                            )}
                            {us.untertitel ? (
                              <p className="meta" style={{ margin: '0 0 0.5rem', fontSize: compact ? '0.78rem' : '0.82rem' }}>
                                {us.untertitel}
                                {!unterOpen && unterAccordion ? (
                                  <span style={{ opacity: 0.75 }}> · eingeklappt</span>
                                ) : null}
                              </p>
                            ) : null}
                            {unterOpen ? (
                              <div
                                className="k2-familie-stammbaum-grid"
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: `repeat(auto-fill, ${gridMin})`,
                                  gap: gridGap,
                                }}
                              >
                                {us.personen.map((p, i) => {
                                  const st = getStammbaumBranchCardStyle(sek.branchIndex)
                                  const r = stammbaumKachelRaender(p, st)
                                  const delay = compact ? '0s' : `${(sekIdx * 24 + usIdx * 10 + i) * 0.06}s`
                                  return (
                                    <Link
                                      key={p.id}
                                      to={`${PROJECT_ROUTES['k2-familie'].personen}/${p.id}`}
                                      className="familie-card-enter"
                                      style={{ textDecoration: 'none', color: 'inherit', animationDelay: delay }}
                                      title={
                                        p.verstorben
                                          ? 'Verstorben · Klick: öffnen · Rechtsklick: Zuordnen'
                                          : 'Klick: öffnen · Rechtsklick: Zuordnen'
                                      }
                                      onContextMenu={(e) => onStammbaumKachelContextMenu(e, p.id)}
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
                                        {(() => {
                                          const fotoAktuell = getAktuellesPersonenFoto(p)
                                          return fotoAktuell ? (
                                          <img
                                            src={fotoAktuell}
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
                                        )})()}
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
                          </div>
                        )
                      })}
                    </div>
                  ) : (
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
                            title={
                              p.verstorben
                                ? 'Verstorben · Klick: öffnen · Rechtsklick: Zuordnen'
                                : 'Klick: öffnen · Rechtsklick: Zuordnen'
                            }
                            onContextMenu={(e) => onStammbaumKachelContextMenu(e, p.id)}
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
                              {(() => {
                                const fotoAktuell = getAktuellesPersonenFoto(p)
                                return fotoAktuell ? (
                                <img
                                  src={fotoAktuell}
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
                              )})()}
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
                  )
                ) : null}
              </section>
            )
          })
        ) : !einstellungen.ichBinPersonId ? (
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
                  title={
                    p.verstorben
                      ? 'Verstorben · Klick: öffnen · Rechtsklick: Zuordnen'
                      : 'Klick: öffnen · Rechtsklick: Zuordnen'
                  }
                  onContextMenu={(e) => onStammbaumKachelContextMenu(e, p.id)}
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
                    {(() => {
                      const fotoAktuell = getAktuellesPersonenFoto(p)
                      return fotoAktuell ? (
                      <img
                        src={fotoAktuell}
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
                    )})()}
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
        ) : null}

        {personen.length > 0 && (
          <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
            {!einstellungen.stammbaumSchlusspunkt && (
              <>
                {kannStruktur && (
                <button type="button" className="btn" onClick={addPerson}>＋ Person hinzufügen</button>
                )}
                {einstellungen.ichBinPersonId && kannStruktur && (
                  <>
                    <button
                      type="button"
                      className="btn-outline"
                      title="Fügt Rupert, Notburga, Anna und Maria mit denselben Eltern wie du ein – für vier Familienzweige im Stammbaum (erste Ehe Anna Stöbich)."
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
                  </>
                )}
              </>
            )}
            {!einstellungen.stammbaumSchlusspunkt && ersteEheMsg && (
              <span className="meta" style={{ color: 'rgba(20,184,166,0.95)', maxWidth: 420 }}>{ersteEheMsg}</span>
            )}
            {!einstellungen.stammbaumSchlusspunkt && partnersAddedMsg && (
              <span className="meta" style={{ color: 'rgba(20,184,166,0.95)' }}>✓ Partner ergänzt (Rupert: 1. Frau verstorben, 2. Frau; Gisela: Mann verstorben)</span>
            )}
          </div>
        )}

        </div>
        )}

        {zeigeNachOben && (
        <section
          id="stufe-nach-oben"
          className="card familie-card-enter no-print"
          aria-label="Schritt Nach oben"
          style={{
            padding: '0.85rem 1rem',
            marginTop: '1rem',
            scrollMarginTop: '5rem',
            border: '1px solid rgba(20,184,166,0.35)',
            background: 'rgba(15,23,42,0.35)',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.02rem', color: 'rgba(255,255,255,0.95)' }}>2 · Nach oben</h2>
          <p className="meta" style={{ margin: '0.45rem 0 0', lineHeight: 1.45, maxWidth: '44rem' }}>
            Wenn Partner und Kinder stehen: <strong>Eltern</strong> und <strong>weitere Vorfahren</strong> in den Personenkarten eintragen – die Liste ordnet sie <strong>oben</strong> (Block „Eltern“, dann Familienzweige). Nicht alles auf einmal; eine Generation nach der anderen reicht.
          </p>
        </section>
        )}

        {/* 3 · Grafik */}
        {zeigeGrafik && (
        <div id="stufe-grafik" className="card familie-card-enter" style={{ padding: '1rem', overflow: 'visible', scrollMarginTop: '5rem', marginTop: '1rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.05rem', color: 'rgba(255,255,255,0.95)' }}>3 · Grafik</h2>
            <span className="meta" style={{ fontSize: '0.85rem', opacity: 0.9 }}>Stammbaum</span>
            {personen.length > 0 && (
              <>
                {einstellungen.ichBinPersonId && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: kannOrganisch ? 'pointer' : 'not-allowed' }}>
                    <input
                      type="checkbox"
                      checked={nurMeinFamilienzweig}
                      disabled={!kannOrganisch}
                      onChange={(e) => setNurMeinFamilienzweigPersist(e.target.checked)}
                      aria-label="Nur mein Familienzweig"
                    />
                    <span className="meta">Nur mein Familienzweig</span>
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
          {personen.length > 0 && (
            <p className="meta" style={{ margin: '0 0 0.6rem', fontSize: '0.85rem', lineHeight: 1.4 }}>
              <span aria-hidden style={{ display: 'inline-block', width: 28, borderBottom: '2px dashed rgba(20,184,166,0.75)', verticalAlign: 'middle', marginRight: 6 }} />
              Partnerschaft
              <span style={{ margin: '0 0.75rem' }} aria-hidden>
                ·
              </span>
              <span aria-hidden style={{ display: 'inline-block', width: 28, borderBottom: '1.5px solid rgba(20,184,166,0.55)', verticalAlign: 'middle', marginRight: 6 }} />
              Eltern–Kind
            </p>
          )}
          {personen.length > 0 ? (
            <FamilyTreeGraph
              personen={personenForGraph}
              personPathPrefix={PROJECT_ROUTES['k2-familie'].personen}
              partnerHerkunftPersonId={einstellungen.partnerHerkunftPersonId}
              ichBinPersonId={einstellungen.ichBinPersonId}
              ichBinPositionAmongSiblings={einstellungen.ichBinPositionAmongSiblings}
              onSetIchBin={kannStruktur ? handleSetIchBin : undefined}
              scale={viewZoom}
              orientation={viewOrientation}
              familienzweigWurzelPersonId={
                nurMeinFamilienzweig && einstellungen.ichBinPersonId ? einstellungen.ichBinPersonId : undefined
              }
            />
          ) : (
            <p className="meta" style={{ margin: 0, padding: '0.75rem 0', textAlign: 'center' }}>Grafik erscheint, sobald Personen angelegt sind.</p>
          )}
        </div>
        )}

        {/* 4 · PDF & Auswertung */}
        {zeigePdf && (
          <div id="stufe-pdf" style={{ scrollMarginTop: '5rem' }}>
            <section className="card familie-card-enter" style={{ padding: '1rem', marginTop: '1rem' }} aria-label="Druckvorlagen">
              <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.05rem', color: 'rgba(255,255,255,0.95)' }}>4 · PDF &amp; Auswertung</h2>
              <div className="stammbaum-pdf-steuerung">
              <ul
                className="meta"
                style={{
                  margin: '0 0 0.75rem',
                  paddingLeft: '1.1rem',
                  fontSize: '0.8rem',
                  lineHeight: 1.38,
                  color: 'rgba(226,232,240,0.88)',
                  listStyleType: 'disc',
                }}
              >
                <li style={{ marginBottom: '0.28rem' }}>
                  <strong>Umfang</strong> (ganze Familie / nur Zweig): für Vorschau – Zweig braucht <strong>Das bin ich</strong>.
                </li>
                <li style={{ marginBottom: '0.28rem' }}>
                  <strong>Leser:innen</strong>: Vorschau &amp; Typ wählen. <strong>Druck / PDF</strong> (Button):{' '}
                  <strong>Inhaber:in</strong> und <strong>Bearbeiter:in</strong>.
                </li>
                <li style={{ marginBottom: '0.28rem' }}>
                  <strong>Katalog:</strong> Spalten speichern nur mit Schreibrecht. Personenblätter &amp; Generationen gut lesbar; Grafik eher fürs Poster.
                </li>
                <li>Im System-Druckdialog: <strong>Als PDF speichern</strong>.</li>
              </ul>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
                {druckStil !== 'rechte' && (
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span className="meta">Umfang</span>
                    <select
                      id="druck-umfang"
                      value={druckUmfang}
                      onChange={(e) => setDruckUmfang(e.target.value as DruckUmfang)}
                    >
                      <option value="alle">Ganze erfasste Familie</option>
                      <option value="zweig">Nur mein Familienzweig</option>
                    </select>
                  </label>
                )}
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span className="meta">Typ</span>
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
                      <option value="register">Katalog (Tabelle, Datenblätter → Druck oft Querformat)</option>
                      <option value="geburtstagsliste">Geburtstagsliste (Kalenderjahr, nach Tag sortiert)</option>
                    </optgroup>
                    <optgroup label="Familie">
                      <option value="rechte">Schreib- und Leserechte (eine Seite, ohne Personendaten)</option>
                    </optgroup>
                    <optgroup label="Grafik">
                      <option value="grafik">Stammbaum als Bild (bei vielen Personen unübersichtlich)</option>
                    </optgroup>
                  </select>
                </label>
                {druckStil === 'register' && (
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span className="meta">Katalog-Sortierung</span>
                    <select
                      id="druck-katalog-sort"
                      value={druckKatalogSort}
                      onChange={(e) => setDruckKatalogSort(e.target.value as KatalogSortierung)}
                    >
                      <option value="geschwister">Geschwisterfolge wie im Stammbaum</option>
                      <option value="geburt">Innerhalb Zweig: Geburtsjahr</option>
                    </select>
                  </label>
                )}
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
                <label
                  className="stammbaum-pdf-steuerung-titel-norm"
                  style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}
                >
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
                  disabled={
                    !kannDrucken ||
                    (druckStil === 'rechte'
                      ? false
                      : personen.length === 0 ||
                        (druckUmfang === 'zweig' && (!einstellungen.ichBinPersonId || personenFuerDruck.length === 0)))
                  }
                  title={
                    !kannDrucken
                      ? 'Drucken und PDF nur mit Schreibrecht (Inhaber:in oder Bearbeiter:in). Vorschau kannst du ansehen.'
                      : druckStil === 'rechte'
                        ? undefined
                        : personen.length === 0
                          ? 'Zuerst Personen anlegen.'
                          : druckUmfang === 'zweig' && !einstellungen.ichBinPersonId
                            ? 'Bei „Nur Familienzweig“: „Das bin ich“ setzen oder Umfang „Ganze Familie“ wählen.'
                            : undefined
                  }
                  onClick={() =>
                    openDruck({
                      format: druckFormat,
                      fotos: druckFotos,
                      titel: druckTitel || undefined,
                      stil: druckStil,
                      ori: druckOri,
                      tree: druckTree,
                      umfang: druckUmfang,
                      katalogSort: druckStil === 'register' ? druckKatalogSort : undefined,
                    })
                  }
                >
                  Druckvorschau &amp; Drucken
                </button>
              </div>
              {druckStil === 'register' && (
                <div
                  className="stammbaum-pdf-katalog-spalten"
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    alignItems: 'center',
                    marginTop: '0.75rem',
                    padding: '0.65rem 0.75rem',
                    background: 'rgba(15,23,42,0.35)',
                    borderRadius: 8,
                    border: '1px solid rgba(148,163,184,0.25)',
                  }}
                >
                  <span className="meta" style={{ marginRight: 4 }}>
                    Spalten:
                  </span>
                  {FAMILIE_KATALOG_SPALTEN_OPTIONS.map((col) => (
                    <label
                      key={col.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        color: druckKatalogSpalten.includes(col.id)
                          ? 'rgba(255,255,255,0.92)'
                          : 'rgba(148,163,184,0.85)',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={druckKatalogSpalten.includes(col.id)}
                        disabled={!kannOrganisch}
                        title={!kannOrganisch ? 'Spalten speichern nur mit Schreibrecht (Inhaber:in oder Bearbeiter:in).' : undefined}
                        onChange={(e) => toggleDruckKatalogSpalte(col.id, e.target.checked)}
                        style={{ accentColor: '#2dd4bf' }}
                      />
                      {col.label}
                    </label>
                  ))}
                </div>
              )}
              </div>
              <div className="stammbaum-pdf-vorschau-wrap" style={{ marginTop: '1rem' }}>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.95)' }}>
                  Vorschau
                </h3>
                {druckStil === 'rechte' ? (
                  <div className="stammbaum-pdf-vorschau-scroll">
                    <div
                      className="stammbaum-druck-view stammbaum-druck-view--vorschau"
                      data-format={druckFormat === 'poster' ? 'poster' : druckFormat}
                      data-stil="rechte"
                    >
                      <StammbaumDruckSchreibLeserechte
                        familienName={druckTitel.trim() || getFamilieTenantDisplayName(currentTenantId, 'Familie')}
                      />
                    </div>
                  </div>
                ) : druckUmfang === 'alle' && personen.length === 0 ? (
                  <p className="meta" style={{ margin: 0 }}>Lege zuerst Personen an, dann erscheint die Vorschau.</p>
                ) : druckUmfang === 'zweig' && !einstellungen.ichBinPersonId ? (
                  <p className="meta" style={{ margin: 0 }}>
                    Bei <strong>Nur Familienzweig</strong>: Bitte <strong>Das bin ich</strong> setzen oder Umfang <strong>Ganze erfasste Familie</strong> wählen.
                  </p>
                ) : druckUmfang === 'zweig' && personenFuerDruck.length === 0 ? (
                  <p className="meta" style={{ margin: 0 }}>Keine Personen im Familienzweig – Vorschau kann nicht angezeigt werden.</p>
                ) : (
                  <div className="stammbaum-pdf-vorschau-scroll">
                    <div
                      className="stammbaum-druck-view stammbaum-druck-view--vorschau"
                      data-format={druckFormat === 'poster' ? 'poster' : druckFormat}
                      data-stil={druckStil}
                    >
                      {druckStil === 'generationen' && (
                        <StammbaumDruckNachGenerationen
                          personen={personenDruckInhalt}
                          titel={druckTitel.trim() || getFamilieTenantDisplayName(currentTenantId, 'Familie')}
                          ichBinPersonId={einstellungen.ichBinPersonId}
                          ichBinPositionAmongSiblings={einstellungen.ichBinPositionAmongSiblings ?? undefined}
                        />
                      )}
                      {druckStil === 'register' && (
                        <StammbaumDruckRegister
                          personen={personenDruckInhalt}
                          titel={druckTitel.trim() || getFamilieTenantDisplayName(currentTenantId, 'Familie')}
                          ichBinPersonId={einstellungen.ichBinPersonId}
                          sortierung={druckKatalogSort}
                          spalten={normalizeFamilieKatalogSpalten(druckKatalogSpalten)}
                        />
                      )}
                      {druckStil === 'personenblaetter' && (
                        <StammbaumDruckPersonenblaetter
                          personen={personenDruckInhalt}
                          titel={druckTitel.trim() || getFamilieTenantDisplayName(currentTenantId, 'Familie')}
                          ichBinPersonId={einstellungen.ichBinPersonId}
                        />
                      )}
                      {druckStil === 'geburtstagsliste' && (
                        <StammbaumDruckGeburtstagsliste
                          personen={personenDruckInhalt}
                          titel={druckTitel.trim() || getFamilieTenantDisplayName(currentTenantId, 'Familie')}
                          ichBinPersonId={einstellungen.ichBinPersonId}
                        />
                      )}
                      {druckStil === 'grafik' && (
                        <>
                          <h1 className="stammbaum-druck-titel">
                            {druckTitel.trim() || getFamilieTenantDisplayName(currentTenantId, 'Familie')}
                          </h1>
                          <FamilyTreeGraph
                            personen={personenDruckInhalt}
                            personPathPrefix={PROJECT_ROUTES['k2-familie'].personen}
                            printMode
                            noPhotos={druckFotos === '0'}
                            scale={previewPrintScale}
                            layout={druckTree}
                            orientation={druckOri}
                            partnerHerkunftPersonId={einstellungen.partnerHerkunftPersonId}
                            ichBinPersonId={einstellungen.ichBinPersonId}
                            ichBinPositionAmongSiblings={einstellungen.ichBinPositionAmongSiblings}
                            familienzweigWurzelPersonId={
                              druckUmfang === 'zweig' && einstellungen.ichBinPersonId
                                ? einstellungen.ichBinPersonId
                                : undefined
                            }
                          />
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {druckStil !== 'grafik' && druckStil !== 'personenblaetter' && (
                <p className="meta stammbaum-pdf-steuerung-hint" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
                  {druckStil === 'register' ? (
                    <>
                      <strong>Katalog</strong>: Spalten per Checkbox; <strong>Kontakt</strong> zeigt Anschrift, E-Mail und Telefon kompakt
                      (nur wenn bei der Person eingetragen). Einstellung wird gespeichert. Druck oft im <strong>Querformat</strong>.
                    </>
                  ) : druckStil === 'geburtstagsliste' ? (
                    <>
                      <strong>Geburtstagsliste</strong>: Personen mit vollständigem Datum (TT.MM.JJJJ) erscheinen nach Kalendertag sortiert; andere am Ende der Liste. Verstorbene mit †.
                    </>
                  ) : druckStil === 'rechte' ? (
                    <>
                      <strong>Schreib- und Leserechte</strong>: eine Seite für die Familie – im Druckdialog „Als PDF speichern“ oder Papier wählen. Keine Personendaten nötig.
                    </>
                  ) : (
                    <>
                      <strong>Generationen</strong>: Unter jeder Zeile optional 1–2 Zeilen Kontakt (Anschrift, E-Mail, Tel.), wenn erfasst.
                    </>
                  )}
                </p>
              )}
            </section>
          </div>
        )}

        {kachelKontext &&
          (() => {
            const menuW = 220
            const menuH = 96
            const ww = typeof window !== 'undefined' ? window.innerWidth : 800
            const wh = typeof window !== 'undefined' ? window.innerHeight : 600
            const bx = Math.max(8, Math.min(kachelKontext.x, ww - menuW - 8))
            const by = Math.max(8, Math.min(kachelKontext.y, wh - menuH - 8))
            const personenBase = PROJECT_ROUTES['k2-familie'].personen
            return (
              <div
                ref={kachelKontextRef}
                role="menu"
                aria-label="Personen-Kachel"
                style={{
                  position: 'fixed',
                  left: bx,
                  top: by,
                  zIndex: 10000,
                  minWidth: menuW,
                  padding: '0.35rem 0',
                  background: 'rgba(15,23,42,0.98)',
                  border: '1px solid rgba(148,163,184,0.45)',
                  borderRadius: 10,
                  boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
                }}
              >
                <button
                  type="button"
                  role="menuitem"
                  className="btn-outline"
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    border: 'none',
                    borderRadius: 0,
                    padding: '0.55rem 1rem',
                    background: 'transparent',
                    color: '#e2e8f0',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(148,163,184,0.18)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                  onClick={() => {
                    navigate(`${personenBase}/${kachelKontext.personId}`)
                    setKachelKontext(null)
                  }}
                >
                  Person öffnen
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="btn-outline"
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    border: 'none',
                    borderRadius: 0,
                    padding: '0.55rem 1rem',
                    background: 'transparent',
                    color: '#e2e8f0',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(148,163,184,0.18)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                  onClick={() => {
                    navigate(`${personenBase}/${kachelKontext.personId}?fokus=beziehungen`)
                    setKachelKontext(null)
                  }}
                >
                  Beziehungen zuordnen…
                </button>
              </div>
            )
          })()}
      </div>
    </div>
  )
}
