import { useState, useRef, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PROJECT_ROUTES, MOK2_ROUTE, ENTDECKEN_ROUTE } from '../config/navigation'
import { ERKUNDUNGS_NOTIZEN_KEY, type ErkundungsNotiz } from '../pages/EntdeckenPage'

const GUIDE_KEY = 'k2-entdecken-guide-antworten'

const GUIDE_LABELS: Record<string, string> = {
  pfad: 'Pfad',
  kunstart: 'Kunstart', erfahrung: 'Erfahrung', ziel_kuenstler: 'Ziel',
  ausstellungen: 'Ausstellungen',
  verein_groesse: 'Vereinsgröße', verein_ausstellungen: 'Ausstellungen',
  verein_wunsch: 'Wunsch', vereinsgalerie: 'Vereinsgalerie',
  atelier_groesse: 'Ateliergröße', atelier_bedarf: 'Bedarf', atelier_struktur: 'Struktur',
  entdecker_interesse: 'Interesse', entdecker_mut: 'Stand', entdecker_ziel: 'Ziel',
  kontakt: 'Kontakt',
}
const GUIDE_WERT_LABELS: Record<string, string> = {
  kuenstlerin: '🎨 Künstler:in', gemeinschaft: '🏛️ Gemeinschaft',
  atelier: '🏢 Atelier/Studio', entdecker: '🌱 Entdecker',
  malerei: 'Malerei', keramik: 'Keramik/Skulptur', foto: 'Fotografie', anderes: 'Mehreres',
  anfaenger: 'Erste Schritte', fortgeschritten: 'Einige Jahre', etabliert: 'Etabliert',
  sichtbarkeit: 'Mehr Sichtbarkeit', verkauf: 'Verkauf', auftritt: 'Prof. Auftritt',
  mehrmals: 'Mehrmals ausgestellt', wenige: 'Einmal/zweimal', privat: 'Nur privat',
  klein: 'Klein', mittel: 'Mittelgroß', gross: 'Groß',
  regelmaessig: 'Regelmäßig', selten: 'Manchmal', geplant: 'Geplant',
  webauftritt: 'Webauftritt', struktur: 'Ordnung', events: 'Events',
  ja: '✨ Ja!', besprechen: 'Erst besprechen', nein: 'Eher nicht',
  solo: 'Solo', gemeinsam: 'Gemeinsam', individuell: 'Individuell', beides: 'Beides',
  web: 'Webauftritt', inventar: 'Inventar', presse: 'Presse',
  malen: 'Malen/Zeichnen', handwerk: 'Handwerk', offen: 'Noch offen',
  idee: 'Idee', versuche: 'Erste Versuche', fertig: 'Schon Fertiges',
  zeigen: 'Etwas zeigen', community: 'Gleichgesinnte', professionell: 'Professionell',
  email: 'E-Mail', telefon: 'Telefon', website: 'Website', galerie: 'Über Galerie',
}

/** Fremder-Modus: alle Session-/localStorage-Keys die einen "ersten Besuch" simulieren */
const FREMDER_SESSION_KEYS = [
  'k2-agb-accepted',
  'k2-willkommen-name',
  'k2-willkommen-entwurf',
  'k2-admin-context',
  'k2-shop-from-oeffentlich',
  'k2-entdecken-q1',
  'k2-entdecken-q2',
  'k2-entdecken-guide-antworten',
  'k2-empfehlung-offen',
]

function startFremderModus() {
  // Im iframe (Cursor Preview) kein location.href – verhindert Reload/Crash
  if (typeof window !== 'undefined' && window.self !== window.top) return
  // Nur die relevanten Keys löschen – kein sessionStorage.clear() (würde Name-Übergabe killen)
  FREMDER_SESSION_KEYS.forEach(k => {
    try { sessionStorage.removeItem(k) } catch (_) {}
    try { localStorage.removeItem(k) } catch (_) {}
  })
  // Zur Landingpage – echter Neustart
  window.location.href = ENTDECKEN_ROUTE
}

/** VK2 immer per Voll-Navigation öffnen – verhindert, dass K2/Router-Zustand bleibt */
const VK2_GALERIE_URL = '/projects/vk2/galerie'

const PANEL_ORDER_KEY = 'smartpanel-reihenfolge'

type PanelItem = {
  id: string
  label: string
  page: string
  url: string
  color: string
  border: string
  direct?: boolean  // true = immer per window.location.href, nie über onNavigate
}

const DEFAULT_ITEMS: PanelItem[] = [
  { id: 'k2', label: '🎨 K2 Galerie Kunst&Keramik', page: 'galerie', url: PROJECT_ROUTES['k2-galerie'].galerie, color: 'linear-gradient(135deg, rgba(255,140,66,0.2), rgba(230,122,42,0.15))', border: 'rgba(255,140,66,0.4)' },
  { id: 'oek2', label: '🌐 Öffentliche Galerie K2', page: 'galerie-oeffentlich', url: PROJECT_ROUTES['k2-galerie'].galerieOeffentlich, color: 'linear-gradient(135deg, rgba(95,251,241,0.12), rgba(60,200,190,0.08))', border: 'rgba(95,251,241,0.3)' },
  { id: 'k2-familie', label: '👨‍👩‍👧‍👦 K2 Familie', page: 'k2-familie', url: PROJECT_ROUTES['k2-familie'].home, color: 'linear-gradient(135deg, rgba(13,148,136,0.22), rgba(20,184,166,0.12))', border: 'rgba(13,148,136,0.5)' },
  { id: 'vk2', label: '🎨 VK2 Vereinsplattform', page: 'vk2', url: VK2_GALERIE_URL, color: 'linear-gradient(135deg, rgba(230,122,42,0.2), rgba(255,140,66,0.15))', border: 'rgba(255,140,66,0.4)' },
  { id: 'mok2', label: '📋 mök2 – Vertrieb & Promotion', page: 'mok2', url: MOK2_ROUTE, color: 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(245,158,11,0.08))', border: 'rgba(251,191,36,0.3)' },
  { id: 'notizen', label: '📝 Notizen', page: 'notizen', url: PROJECT_ROUTES['k2-galerie'].notizen, color: 'linear-gradient(135deg, rgba(196,181,253,0.15), rgba(139,92,246,0.08))', border: 'rgba(196,181,253,0.35)' },
  { id: 'handbuch', label: '🧠 Handbuch', page: 'handbuch', url: '/k2team-handbuch', color: 'rgba(95,251,241,0.08)', border: 'rgba(95,251,241,0.2)', direct: true },
]

function loadOrder(): string[] {
  try {
    const saved = localStorage.getItem(PANEL_ORDER_KEY)
    if (saved) {
      const order = JSON.parse(saved) as string[]
      // Duplikate entfernen (erster Eintrag zählt), damit nicht zweimal „K2 Familie“ erscheint
      const deduped = order.filter((id, idx) => order.indexOf(id) === idx)
      if (deduped.length !== order.length) {
        try { localStorage.setItem(PANEL_ORDER_KEY, JSON.stringify(deduped)) } catch { /* ignore */ }
        return deduped
      }
      return order
    }
  } catch { /* ignore */ }
  return ['k2', 'oek2', 'k2-familie', 'vk2', 'mok2', 'notizen', 'handbuch']
}

function saveOrder(order: string[]) {
  try { localStorage.setItem(PANEL_ORDER_KEY, JSON.stringify(order)) } catch { /* ignore */ }
}

/** Deine To-dos – Vermarktung & Strategie (zum Abarbeiten). Links führen direkt zur Stelle. */
const MEINE_TODOS = [
  { text: 'Kooperation in mök2 „Kanäle 2026“ eintragen (Name/Ziel)', href: `${PROJECT_ROUTES['k2-galerie'].marketingOek2}#mok2-kanale-2026` },
  { text: 'Lizenz-Pakete (Basic/Pro/Pro+/VK2) für Außen sichtbar prüfen', href: `${PROJECT_ROUTES['k2-galerie'].marketingOek2}#mok2-lizenz-pakete-aussen` },
  { text: 'Trust: AGB-Link, Datenschutz, Support prüfen', href: PROJECT_ROUTES['k2-galerie'].marketingOek2 },
  { text: 'Quartal: Kanäle 2026 in mök2 prüfen und anpassen', href: `${PROJECT_ROUTES['k2-galerie'].marketingOek2}#mok2-kanale-2026` },
  { text: 'Optional: Eine Kooperation anvisieren (Erstgespräch/Pilot)', href: `${PROJECT_ROUTES['k2-galerie'].marketingOek2}#mok2-kanale-2026` },
  { text: 'Optional: Kurz-Anleitung „So empfiehlst du“ nutzen', href: `${PROJECT_ROUTES['k2-galerie'].marketingOek2}#mok2-6` },
]

// ── Diverses – frei befüllbare Ablage ──────────────────────────────────────────
const DIVERSES_KEY = 'smartpanel-diverses'

type DiversesItem = {
  id: string
  label: string
  url: string  // URL oder /pfad oder docs/DATEI.md
  emoji?: string
}

function loadDiverses(): DiversesItem[] {
  try {
    const v = localStorage.getItem(DIVERSES_KEY)
    if (v) return JSON.parse(v)
  } catch { /* ignore */ }
  // Standardeinträge beim ersten Start – inkl. Georgs Notizen (Leseansicht)
  return [
    { id: 'notizen-uebersicht', label: 'Georgs Notizen (Übersicht)', url: PROJECT_ROUTES['k2-galerie'].notizen, emoji: '📝' },
    { id: 'brief-august', label: 'Brief an August', url: PROJECT_ROUTES['k2-galerie'].notizenBriefAugust, emoji: '✉️' },
    { id: 'freunde', label: 'Für meine Freunde', url: '/freunde-erklaerung.html', emoji: '👥' },
  ]
}

function saveDiverses(items: DiversesItem[]) {
  try { localStorage.setItem(DIVERSES_KEY, JSON.stringify(items)) } catch { /* ignore */ }
}

// Smart Panel (SP) – K2-Balken & Schnellzugriff (schlank, mök2-Links nur in mök2)

interface SmartPanelProps {
  currentPage?: string
  onNavigate?: (page: string) => void
}

const K2_FAMILIE_HOME = PROJECT_ROUTES['k2-familie'].home

export default function SmartPanel({ currentPage, onNavigate }: SmartPanelProps) {
  const navigate = useNavigate()
  // Aktiven Button per URL erkennen – überschreibt den prop wenn Seite direkt per URL geöffnet wurde
  const [browserPath, setBrowserPath] = useState(() => typeof window !== 'undefined' ? window.location.pathname : '')
  useEffect(() => {
    const onPop = () => setBrowserPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  const activePage = useMemo(() => {
    if (browserPath.startsWith('/projects/vk2')) return 'vk2'
    if (browserPath.startsWith('/projects/k2-familie')) return 'k2-familie'
    if (browserPath.startsWith('/projects/k2-galerie/galerie-oeffentlich') || browserPath.startsWith('/galerie-oeffentlich')) return 'galerie-oeffentlich'
    if (browserPath.startsWith('/galerie') || browserPath.startsWith('/projects/k2-galerie/galerie')) return 'galerie'
    if (browserPath.startsWith('/mok2') || browserPath.startsWith('/projects/k2-galerie/marketing')) return 'mok2'
    if (browserPath.startsWith('/projects/k2-galerie/notizen')) return 'notizen'
    if (browserPath.startsWith('/k2team-handbuch')) return 'handbuch'
    return currentPage || ''
  }, [browserPath, currentPage])

  const nav = (page: string, url: string) => {
    if (onNavigate) onNavigate(page)
    else if (typeof window !== 'undefined' && window.self === window.top) window.location.href = url
  }

  // Sortierbare Hauptbuttons
  const [itemOrder, setItemOrder] = useState<string[]>(loadOrder)
  const [editMode, setEditMode] = useState(false)

  // Guide-Antworten (letzter Besucher via Fremder-Modus)
  const [guideAntworten, setGuideAntworten] = useState<Record<string, string>>(() => {
    try { const v = localStorage.getItem(GUIDE_KEY); if (v) return JSON.parse(v) } catch (_) {}
    return {}
  })

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === GUIDE_KEY) {
        try { setGuideAntworten(e.newValue ? JSON.parse(e.newValue) : {}) } catch (_) {}
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const loescheGuideAntworten = () => {
    setGuideAntworten({})
    try { localStorage.removeItem(GUIDE_KEY) } catch (_) {}
  }

  // Diverses – frei befüllbare Ablage
  const [diverses, setDiverses] = useState<DiversesItem[]>(loadDiverses)
  const [diversesNeuLabel, setDiversesNeuLabel] = useState('')
  const [diversesNeuUrl, setDiversesNeuUrl] = useState('')
  const [diversesNeuEmoji, setDiversesNeuEmoji] = useState('📄')
  const [diversesAddMode, setDiversesAddMode] = useState(false)

  const diversesHinzufuegen = () => {
    if (!diversesNeuLabel.trim() || !diversesNeuUrl.trim()) return
    const neu: DiversesItem = {
      id: Date.now().toString(),
      label: diversesNeuLabel.trim(),
      url: diversesNeuUrl.trim(),
      emoji: diversesNeuEmoji || '📄',
    }
    const updated = [...diverses, neu]
    setDiverses(updated)
    saveDiverses(updated)
    setDiversesNeuLabel('')
    setDiversesNeuUrl('')
    setDiversesNeuEmoji('📄')
    setDiversesAddMode(false)
  }

  const diversesLoeschen = (id: string) => {
    const updated = diverses.filter(d => d.id !== id)
    setDiverses(updated)
    saveDiverses(updated)
  }

  const diversesOeffnen = (item: DiversesItem) => {
    if (item.url.startsWith('http')) {
      window.open(item.url, '_blank')
    } else if (item.url.startsWith('/')) {
      window.open(item.url, '_blank')
    } else {
      window.open('/' + item.url, '_blank')
    }
  }

  // Erkundungs-Notizen
  const [notizen, setNotizen] = useState<ErkundungsNotiz[]>(() => {
    try {
      const v = localStorage.getItem(ERKUNDUNGS_NOTIZEN_KEY)
      if (v) return JSON.parse(v)
    } catch (_) {}
    return []
  })

  // Aktualisieren wenn aus EntdeckenPage neue Notiz gespeichert wird
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === ERKUNDUNGS_NOTIZEN_KEY) {
        try {
          const v = e.newValue ? JSON.parse(e.newValue) : []
          setNotizen(v)
        } catch (_) {}
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const loescheNotiz = (id: string) => {
    const neu = notizen.filter(n => n.id !== id)
    setNotizen(neu)
    try { localStorage.setItem(ERKUNDUNGS_NOTIZEN_KEY, JSON.stringify(neu)) } catch (_) {}
  }

  const loescheAlle = () => {
    setNotizen([])
    try { localStorage.removeItem(ERKUNDUNGS_NOTIZEN_KEY) } catch (_) {}
  }
  const dragId = useRef<string | null>(null)
  const dragOverId = useRef<string | null>(null)

  // Duplikate aus Order entfernen (jeder Eintrag nur einmal), damit nicht zweimal „K2 Familie“ o.ä. erscheint
  const sortedItems = itemOrder
    .reduce((acc, id) => {
      if (acc.some(i => i.id === id)) return acc
      const item = DEFAULT_ITEMS.find(i => i.id === id)
      if (item) acc.push(item)
      return acc
    }, [] as PanelItem[])

  const handleDragStart = (id: string) => { dragId.current = id }
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    dragOverId.current = id
  }
  const handleDrop = () => {
    if (!dragId.current || !dragOverId.current || dragId.current === dragOverId.current) return
    const newOrder = [...itemOrder]
    const fromIdx = newOrder.indexOf(dragId.current)
    const toIdx = newOrder.indexOf(dragOverId.current)
    newOrder.splice(fromIdx, 1)
    newOrder.splice(toIdx, 0, dragId.current)
    setItemOrder(newOrder)
    saveOrder(newOrder)
    dragId.current = null
    dragOverId.current = null
  }

  // Nur noch besondere Aktionen die nicht in den Hauptbuttons sind
  const extraActions = [
    {
      label: '📌 Zentrale Themen',
      action: () => nav('handbuch', '/k2team-handbuch?doc=16-ZENTRALE-THEMEN-FUER-NUTZER.md'),
      hint: 'Was Nutzer wissen sollten – Übersicht',
      highlight: true
    },
  ]

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '1rem',
      gap: '1rem',
      overflowY: 'auto',
      overflowX: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid rgba(95, 251, 241, 0.2)',
        paddingBottom: '1rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.5rem'
        }}>
          <span style={{ fontSize: '1.5rem' }}>⚡</span>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#5ffbf1' }}>
            Smart Panel
          </h3>
        </div>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#8fa0c9' }}>
          Schnellzugriff
        </p>
      </div>

      {/* ── Diverses – frei befüllbare Ablage ─────────────────────── */}
      <div style={{ borderBottom: '1px solid rgba(95,251,241,0.12)', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
          <h4 style={{ margin: 0, fontSize: '0.88rem', color: '#c4b5fd', fontWeight: 700 }}>
            📁 Diverses
          </h4>
          <button
            type="button"
            onClick={() => setDiversesAddMode(m => !m)}
            style={{ fontSize: '0.72rem', color: diversesAddMode ? '#5ffbf1' : 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.1rem 0.4rem', fontFamily: 'inherit' }}
          >{diversesAddMode ? '✕ Abbrechen' : '＋ Hinzufügen'}</button>
        </div>

        {/* Neuer Eintrag */}
        {diversesAddMode && (
          <div style={{ background: 'rgba(196,181,253,0.06)', border: '1px solid rgba(196,181,253,0.2)', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                value={diversesNeuEmoji}
                onChange={e => setDiversesNeuEmoji(e.target.value)}
                placeholder="📄"
                maxLength={4}
                style={{ width: 38, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(196,181,253,0.25)', borderRadius: '6px', color: '#fff', fontSize: '1rem', padding: '0.35rem 0.4rem', fontFamily: 'inherit', textAlign: 'center' }}
              />
              <input
                value={diversesNeuLabel}
                onChange={e => setDiversesNeuLabel(e.target.value)}
                placeholder="Name / Bezeichnung"
                style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(196,181,253,0.25)', borderRadius: '6px', color: '#fff', fontSize: '0.82rem', padding: '0.35rem 0.6rem', fontFamily: 'inherit' }}
              />
            </div>
            <input
              value={diversesNeuUrl}
              onChange={e => setDiversesNeuUrl(e.target.value)}
              placeholder="Link oder Pfad (z. B. docs/DATEI.md oder https://...)"
              style={{ width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(196,181,253,0.25)', borderRadius: '6px', color: '#fff', fontSize: '0.78rem', padding: '0.35rem 0.6rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
            <button
              type="button"
              onClick={diversesHinzufuegen}
              style={{ background: 'rgba(196,181,253,0.18)', border: '1px solid rgba(196,181,253,0.4)', borderRadius: '6px', color: '#c4b5fd', fontWeight: 600, fontSize: '0.82rem', padding: '0.4rem', cursor: 'pointer', fontFamily: 'inherit' }}
            >✅ Ablegen</button>
          </div>
        )}

        {/* Abgelegte Einträge */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {diverses.length === 0 && (
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>Noch nichts abgelegt – „＋ Hinzufügen" drücken</p>
          )}
          {diverses.map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <button
                type="button"
                onClick={() => diversesOeffnen(item)}
                style={{ flex: 1, textAlign: 'left', background: 'rgba(196,181,253,0.07)', border: '1px solid rgba(196,181,253,0.2)', borderRadius: '7px', color: '#e9d5ff', fontSize: '0.82rem', padding: '0.5rem 0.7rem', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <span>{item.emoji ?? '📄'}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                <span style={{ fontSize: '0.68rem', opacity: 0.4 }}>→</span>
              </button>
              <button
                type="button"
                onClick={() => diversesLoeschen(item.id)}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: '0.75rem', padding: '0.25rem 0.4rem', lineHeight: 1 }}
                title="Entfernen"
              >✕</button>
            </div>
          ))}
        </div>
      </div>

      {/* Fremder-Modus – Landingpage aus Kundenperspektive testen */}
      <div style={{ borderBottom: '1px solid rgba(95,251,241,0.12)', paddingBottom: '1rem' }}>
        <button
          type="button"
          onClick={startFremderModus}
          style={{
            width: '100%',
            padding: '0.85rem 1rem',
            background: 'linear-gradient(135deg, rgba(255,140,66,0.18), rgba(181,74,30,0.12))',
            border: '1px solid rgba(255,140,66,0.5)',
            borderRadius: '10px',
            color: '#ff8c42',
            fontWeight: 700,
            fontSize: '0.92rem',
            cursor: 'pointer',
            fontFamily: 'inherit',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            transition: 'all 0.18s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,140,66,0.28), rgba(181,74,30,0.2))'; e.currentTarget.style.borderColor = 'rgba(255,140,66,0.8)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,140,66,0.18), rgba(181,74,30,0.12))'; e.currentTarget.style.borderColor = 'rgba(255,140,66,0.5)' }}
          title="Landingpage wie ein Erstbesucher erleben – alle Session-Daten werden kurz zurückgesetzt"
        >
          <span style={{ fontSize: '1.2rem' }}>👤</span>
          <span style={{ flex: 1 }}>
            <span style={{ display: 'block', lineHeight: 1.2 }}>Als Fremder eintreten</span>
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,140,66,0.7)', fontWeight: 400 }}>Landingpage wie beim ersten Besuch</span>
          </span>
          <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>→</span>
        </button>
      </div>

      {/* Erkundungs-Notizen Inbox */}
      {notizen.length > 0 && (
        <div style={{ borderBottom: '1px solid rgba(95,251,241,0.12)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.88rem', color: '#fbbf24', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ background: '#b54a1e', color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>{notizen.length}</span>
              💡 Deine Erkundungs-Ideen
            </h4>
            <button type="button" onClick={loescheAlle} style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.25)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.1rem 0.3rem', fontFamily: 'inherit' }}>Alle löschen</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {notizen.map(n => (
              <div key={n.id} style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '8px', padding: '0.6rem 0.75rem', position: 'relative' }}>
                <div style={{ fontSize: '0.82rem', color: '#fff8f0', lineHeight: 1.5, paddingRight: '1.2rem' }}>{n.text}</div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.25rem' }}>
                  {n.zeit} · Schritt: {n.step}
                </div>
                <button type="button" onClick={() => loescheNotiz(n.id)} style={{ position: 'absolute', top: '0.4rem', right: '0.4rem', background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: '0.75rem', padding: '0.1rem 0.3rem', lineHeight: 1 }} title="Erledigt">✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guide-Antworten Auswertung */}
      {Object.keys(guideAntworten).length > 0 && (
        <div style={{ borderBottom: '1px solid rgba(95,251,241,0.12)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.88rem', color: '#5ffbf1', fontWeight: 700 }}>
              🧭 Letzter Besucher – Antworten
            </h4>
            <button type="button" onClick={loescheGuideAntworten}
              style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.25)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.1rem 0.3rem', fontFamily: 'inherit' }}>
              Löschen
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {Object.entries(guideAntworten).map(([key, wert]) => (
              <div key={key} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', alignItems: 'baseline' }}>
                <span style={{ color: 'rgba(255,255,255,0.35)', minWidth: 80, flexShrink: 0 }}>
                  {GUIDE_LABELS[key] ?? key}
                </span>
                <span style={{ color: '#fff8f0', fontWeight: key === 'pfad' ? 700 : 400 }}>
                  {GUIDE_WERT_LABELS[wert] ?? wert}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sortierbare Hauptbuttons – wie iPhone: Bearbeiten → Ziehen */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>
            {editMode ? '↕ Ziehen zum Verschieben' : ''}
          </span>
          <button
            type="button"
            onClick={() => setEditMode(m => !m)}
            style={{ fontSize: '0.72rem', color: editMode ? '#5ffbf1' : 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.1rem 0.3rem', fontFamily: 'inherit' }}
          >{editMode ? '✅ Fertig' : '✏️ Anordnen'}</button>
        </div>

        {sortedItems.map(item => (
          <div
            key={item.id}
            draggable={editMode}
            onDragStart={() => handleDragStart(item.id)}
            onDragOver={(e) => handleDragOver(e, item.id)}
            onDrop={handleDrop}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: 1 }}
          >
            {editMode && (
              <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.3)', cursor: 'grab', userSelect: 'none', flexShrink: 0 }}>☰</span>
            )}
            {editMode ? (
              <span
                style={{
                  flex: 1,
                  padding: '0.85rem 1rem',
                  background: item.color,
                  border: `1px solid ${item.border}`,
                  borderRadius: '8px',
                  color: item.id === 'oek2' || item.id === 'admin' || item.id === 'handbuch' ? '#5ffbf1' : item.id === 'mok2' ? '#fbbf24' : item.id === 'k2-familie' ? '#14b8a6' : '#ff8c42',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  textAlign: 'center',
                  fontFamily: 'inherit',
                }}
              >
                {item.label}
              </span>
            ) : item.id === 'k2-familie' && onNavigate ? (
              <span
                role="button"
                tabIndex={0}
                onClick={() => navigate(K2_FAMILIE_HOME)}
                onKeyDown={(e) => e.key === 'Enter' && navigate(K2_FAMILIE_HOME)}
                style={{
                  flex: 1,
                  padding: '0.85rem 1rem',
                  background: activePage === item.page
                    ? item.color.replace(/0\.\d+\)/g, m => String(Math.min(parseFloat(m) * 2.5, 1)) + ')')
                    : item.color,
                  border: activePage === item.page
                    ? `2px solid ${item.border.replace(/0\.\d+\)/, '1)')}`
                    : `1px solid ${item.border}`,
                  borderRadius: '8px',
                  color: '#14b8a6',
                  fontWeight: activePage === item.page ? 800 : 600,
                  fontSize: '0.95rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s ease',
                  boxShadow: activePage === item.page ? `0 0 12px ${item.border}` : 'none',
                  display: 'block',
                }}
              >
                {activePage === item.page && <span style={{ marginRight: '0.4rem', fontSize: '0.75rem' }}>▶</span>}
                {item.label}
              </span>
            ) : (
              <Link
                to={item.id === 'k2-familie' ? K2_FAMILIE_HOME : item.url}
                style={{
                  flex: 1,
                  padding: '0.85rem 1rem',
                  background: activePage === item.page
                    ? item.color.replace(/0\.\d+\)/g, m => String(Math.min(parseFloat(m) * 2.5, 1)) + ')')
                    : item.color,
                  border: activePage === item.page
                    ? `2px solid ${item.border.replace(/0\.\d+\)/, '1)')}`
                    : `1px solid ${item.border}`,
                  borderRadius: '8px',
                  color: item.id === 'oek2' || item.id === 'admin' || item.id === 'handbuch' ? '#5ffbf1' : item.id === 'mok2' ? '#fbbf24' : item.id === 'k2-familie' ? '#14b8a6' : '#ff8c42',
                  fontWeight: activePage === item.page ? 800 : 600,
                  fontSize: '0.95rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s ease',
                  boxShadow: activePage === item.page ? `0 0 12px ${item.border}` : 'none',
                  textDecoration: 'none',
                  display: 'block',
                }}
              >
                {activePage === item.page && <span style={{ marginRight: '0.4rem', fontSize: '0.75rem' }}>▶</span>}
                {item.label}
              </Link>
            )}
          </div>
        ))}

      </div>

      {/* ── K2 Familie – eigenes Projekt, eigene Struktur (nicht K2 Galerie) ───────────────── */}
      <div style={{
        borderBottom: '1px solid rgba(13,148,136,0.35)',
        paddingBottom: '1rem',
        background: 'linear-gradient(135deg, rgba(13,148,136,0.08), rgba(20,184,166,0.04))',
        borderRadius: '10px',
        padding: '0.85rem 1rem',
        border: '1px solid rgba(13,148,136,0.25)',
      }}>
        <h4 style={{ margin: '0 0 0.6rem 0', fontSize: '0.9rem', color: '#14b8a6', fontWeight: 700 }}>
          👨‍👩‍👧‍👦 K2 Familie
        </h4>
        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)' }}>
          Eigenes Projekt – keine Ausgrenzung, Respekt für jeden. Religion & Politik haben hier nichts zu suchen (hat mit K2 Galerie nichts zu tun).
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <Link
            to={PROJECT_ROUTES['k2-familie'].home}
            style={{
              display: 'block',
              padding: '0.5rem 0.75rem',
              background: 'rgba(13,148,136,0.15)',
              border: '1px solid rgba(13,148,136,0.4)',
              borderRadius: '8px',
              color: '#14b8a6',
              fontWeight: 600,
              fontSize: '0.85rem',
              textDecoration: 'none',
              fontFamily: 'inherit',
            }}
          >
            → Start & Vision
          </Link>
        </div>
      </div>

      {/* Deine To-dos – Vermarktung & Strategie */}
      <div>
        <h4 style={{
          margin: '0 0 0.5rem 0',
          fontSize: '0.9rem',
          color: '#fbbf24',
          fontWeight: 600
        }}>
          📋 Deine To-dos
        </h4>
        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: '#8fa0c9' }}>
          Vermarktung & Strategie – Klick führt zur Stelle
        </p>
        <ul style={{ margin: 0, paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {MEINE_TODOS.map((todo, i) => (
            <li key={i} style={{ fontSize: '0.8rem', lineHeight: 1.35 }}>
              <a
                href={todo.href}
                style={{ color: '#fbbf24', textDecoration: 'none' }}
                onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline' }}
                onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none' }}
              >
                {todo.text}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Vermächtnis – Der Schlüssel zum Raum */}
      <div style={{ borderTop: '1px solid rgba(95,251,241,0.15)', paddingTop: '1rem' }}>
        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#c4b5fd', fontWeight: 600 }}>
          🏛️ Mein Vermächtnis
        </h4>
        <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.75rem', color: '#8fa0c9', lineHeight: 1.5 }}>
          Dieser digitale Raum ist Georgs bleibendes Werk – für Kinder, Enkel und alle die nach ihm kommen.
        </p>
        <button
          type="button"
          onClick={() => {
            const w = window.open('', '_blank')
            if (!w) return
            w.document.write(`<!DOCTYPE html><html lang="de"><head><meta charset="utf-8">
<title>Georgs Raum – Der Schlüssel</title>
<style>
  @media print { @page { size: A4; margin: 18mm; } body { -webkit-print-color-adjust: exact; } }
  body { font-family: Georgia, serif; color: #111; max-width: 600px; margin: 0 auto; padding: 30px 20px; }
  h1 { font-size: 1.8rem; color: #111; margin-bottom: 0.2rem; }
  .sub { font-size: 1rem; color: #555; font-style: italic; margin-bottom: 1.5rem; }
  .qr-box { text-align: center; margin: 1.5rem 0; }
  .qr-box svg { width: 200px; height: 200px; }
  .url { font-family: monospace; font-size: 0.9rem; background: #f5f5f5; padding: 0.6rem 1rem; border-radius: 6px; border: 1px solid #ddd; text-align: center; margin: 0.75rem 0; word-break: break-all; }
  .motto { font-size: 1.1rem; font-style: italic; border-left: 4px solid #8b6914; padding-left: 1rem; margin: 1.25rem 0; color: #444; }
  hr { border: none; border-top: 1px solid #ddd; margin: 1.25rem 0; }
  .text { font-size: 0.95rem; line-height: 1.75; color: #333; }
  .text strong { color: #111; }
  .hinweis { font-size: 0.85rem; color: #666; line-height: 1.65; margin-top: 1rem; background: #fafafa; padding: 0.75rem 1rem; border-radius: 6px; border: 1px solid #eee; }
  .footer { font-size: 0.75rem; color: #aaa; text-align: center; margin-top: 1.5rem; }
</style>
</head><body>

<h1>&#127963; Georgs Raum</h1>
<div class="sub">Der digitale Nachlass von Georg Kreinecker</div>

<div class="qr-box">
  <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://github.com/georgkreinecker-dotcom/k2-galerie" alt="QR-Code" width="200" height="200" style="border:1px solid #ddd;border-radius:8px;" />
</div>

<div class="url">https://github.com/georgkreinecker-dotcom/k2-galerie</div>

<hr>

<div class="motto">
  &bdquo;Tue eine Sache &ndash; und du wirst die Kraft dazu haben.&ldquo;
</div>

<hr>

<div class="text">
  <p>Dieser QR-Code ist der <strong>Schlüssel zu einem digitalen Raum</strong> &ndash; einem Ort der niemals verschwindet.</p>

  <p>Georg Kreinecker hat diesen Raum gebaut: als Elitesoldat und Yogalehrer, als Bauernsohn mit 12 Geschwistern, als Unternehmer und Gitarrist, als Mensch der Ideen einfach umsetzt &ndash; ohne Angst vor Fehlern.</p>

  <p>In diesem Raum liegt sein <strong>Wissen, seine Werte und sein Lebenswerk</strong> &ndash; die K2 Galerie, sein letztes großes Projekt. Alles ist dokumentiert, strukturiert und zugänglich. Nichts davon geht verloren.</p>

  <p>Das Fundament dieses Raumes ist ein kantisches Grundgesetz:<br>
  <strong>Nichts Halbes. Nichts was Menschen schadet. Nur das Reine. Nur das Licht.</strong></p>
</div>

<div class="hinweis">
  <strong>Für wer auch immer diesen Schlüssel findet:</strong><br><br>
  Scanne den QR-Code oder tippe die Adresse in jeden Browser.<br>
  Dort findest du die Datei <strong>EINGANG.md</strong> &ndash; sie erklärt alles was du brauchst.<br><br>
  Du kannst in diesem Raum lesen, verstehen und auf Georgs Werk aufbauen.<br>
  Der Raum wartet auf dich. Er wurde gebaut um zu bleiben.
</div>

<hr>
<div class="footer">Georg Kreinecker &middot; K2 Galerie &middot; Erstellt 23.02.2026</div>

<script>window.onload = () => window.print()</script>
</body></html>`)
            w.document.close()
          }}
          style={{
            width: '100%',
            padding: '0.7rem 1rem',
            background: 'linear-gradient(135deg, rgba(196,181,253,0.15), rgba(167,139,250,0.1))',
            border: '1px solid rgba(196,181,253,0.35)',
            borderRadius: '8px',
            color: '#c4b5fd',
            fontWeight: 600,
            fontSize: '0.88rem',
            cursor: 'pointer',
            fontFamily: 'inherit',
            textAlign: 'center'
          }}
        >
          🖨️ Schlüssel drucken / für den Safe
        </button>
      </div>

      {/* APf-Navigation – Mission Control, Projekte, Zentrale Themen */}
      <div>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.7} }`}</style>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {extraActions.map((action, i) => {
            const isHighlighted = action.highlight
            return (
              <button
                key={i}
                onClick={action.action}
                style={{
                  padding: '0.6rem 0.75rem',
                  background: isHighlighted ? 'rgba(34,197,94,0.15)' : 'rgba(95,251,241,0.08)',
                  border: `1px solid ${isHighlighted ? 'rgba(34,197,94,0.4)' : 'rgba(95,251,241,0.15)'}`,
                  borderRadius: '6px',
                  color: isHighlighted ? '#86efac' : '#5ffbf1',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontFamily: 'inherit',
                  animation: isHighlighted ? 'pulse 2s infinite' : 'none'
                }}
                title={action.hint}
              >
                <span>{action.label}</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>→</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
