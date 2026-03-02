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

const MAPPEN_OPEN_KEY = 'smartpanel-mappen-open'
/** Arbeitsmappen – Themen gebündelt (K2 Galerie, K2 Familie, Notizen, Vermächtnis) */
const GALERIE_ITEM_IDS = ['k2', 'oek2', 'vk2', 'mok2'] as const
const MAPPEN = [
  { id: 'galerie', label: 'K2 Galerie', icon: '🎨', itemIds: [...GALERIE_ITEM_IDS] },
  { id: 'familie', label: 'K2 Familie', icon: '👨‍👩‍👧‍👦', itemIds: ['k2-familie'] },
  { id: 'notizen', label: 'Notizen', icon: '📝', itemIds: ['notizen'] },
  { id: 'vermaechtnis', label: 'Vermächtnis', icon: '🏛️', itemIds: ['handbuch'] },
] as const

function loadMappenOpen(): Record<string, boolean> {
  try {
    const v = localStorage.getItem(MAPPEN_OPEN_KEY)
    if (v) return JSON.parse(v)
  } catch { /* ignore */ }
  return { galerie: true, familie: true, notizen: true, vermaechtnis: true }
}

function saveMappenOpen(open: Record<string, boolean>) {
  try { localStorage.setItem(MAPPEN_OPEN_KEY, JSON.stringify(open)) } catch { /* ignore */ }
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

  const [mappenOpen, setMappenOpen] = useState<Record<string, boolean>>(loadMappenOpen)

  const toggleMappe = (id: string) => {
    const next = { ...mappenOpen, [id]: !mappenOpen[id] }
    setMappenOpen(next)
    saveMappenOpen(next)
  }

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

      {/* ── Arbeitsmappen (Themen gebündelt) ───────────────────────────── */}
      {MAPPEN.map(mappe => {
        const isOpen = mappenOpen[mappe.id] !== false
        const items = mappe.itemIds.map(id => DEFAULT_ITEMS.find(i => i.id === id)).filter(Boolean) as PanelItem[]
        return (
          <div key={mappe.id} style={{ borderBottom: '1px solid rgba(95,251,241,0.12)', paddingBottom: '0.75rem' }}>
            <button
              type="button"
              onClick={() => toggleMappe(mappe.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 0.75rem',
                background: 'rgba(95,251,241,0.06)',
                border: '1px solid rgba(95,251,241,0.2)',
                borderRadius: '8px',
                color: '#5ffbf1',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                fontFamily: 'inherit',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>{mappe.icon}</span>
              <span style={{ flex: 1 }}>📁 {mappe.label}</span>
              <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>{isOpen ? '▼' : '▶'}</span>
            </button>
            {isOpen && (
              <div style={{ marginTop: '0.5rem', paddingLeft: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {mappe.id === 'galerie' && (
                  <>
                    {items.map(item => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Link
                          to={item.url}
                          style={{
                            flex: 1,
                            padding: '0.65rem 0.85rem',
                            background: item.color,
                            border: `1px solid ${item.border}`,
                            borderRadius: '8px',
                            color: item.id === 'oek2' ? '#5ffbf1' : item.id === 'mok2' ? '#fbbf24' : '#ff8c42',
                            fontWeight: 600,
                            fontSize: '0.88rem',
                            textAlign: 'center',
                            textDecoration: 'none',
                            fontFamily: 'inherit',
                            display: 'block',
                          }}
                        >
                          {item.label}
                        </Link>
                      </div>
                    ))}
                    <Link to="/k2team-handbuch" style={{ display: 'block', padding: '0.55rem 0.75rem', background: 'rgba(95,251,241,0.08)', border: '1px solid rgba(95,251,241,0.2)', borderRadius: '8px', color: '#5ffbf1', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', fontFamily: 'inherit' }}>
                      🧠 Handbuch (K2 Galerie)
                    </Link>
                    <button type="button" onClick={startFremderModus} style={{ width: '100%', padding: '0.6rem 0.85rem', background: 'linear-gradient(135deg, rgba(255,140,66,0.18), rgba(181,74,30,0.12))', border: '1px solid rgba(255,140,66,0.5)', borderRadius: '8px', color: '#ff8c42', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem' }} title="Landingpage wie ein Erstbesucher">
                      <span>👤</span><span>Als Fremder eintreten</span>
                    </button>
                    <div style={{ marginTop: '0.25rem' }}>
                      <span style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: 600 }}>📋 To-dos</span>
                      <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {MEINE_TODOS.map((todo, i) => (
                          <li key={i} style={{ fontSize: '0.75rem', lineHeight: 1.3 }}>
                            <a href={todo.href} style={{ color: '#fbbf24', textDecoration: 'none' }} onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline' }} onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none' }}>{todo.text}</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
                {mappe.id === 'familie' && (
                  <>
                    <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>Eigenes Projekt – keine Ausgrenzung, Respekt für jeden.</p>
                    {onNavigate ? (
                      <span role="button" tabIndex={0} onClick={() => navigate(K2_FAMILIE_HOME)} onKeyDown={(e) => e.key === 'Enter' && navigate(K2_FAMILIE_HOME)}
                        style={{ display: 'block', padding: '0.55rem 0.75rem', background: 'rgba(13,148,136,0.15)', border: '1px solid rgba(13,148,136,0.4)', borderRadius: '8px', color: '#14b8a6', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                        → Zur Startseite (erste Seite)
                      </span>
                    ) : (
                      <Link to={K2_FAMILIE_HOME} style={{ display: 'block', padding: '0.55rem 0.75rem', background: 'rgba(13,148,136,0.15)', border: '1px solid rgba(13,148,136,0.4)', borderRadius: '8px', color: '#14b8a6', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', fontFamily: 'inherit' }}>
                        → Zur Startseite (erste Seite)
                      </Link>
                    )}
                    <Link to="/k2team-handbuch?doc=17-K2-FAMILIE-ERSTE-SCHRITTE.md" style={{ display: 'block', padding: '0.5rem 0.7rem', background: 'rgba(13,148,136,0.08)', border: '1px solid rgba(13,148,136,0.3)', borderRadius: '8px', color: '#14b8a6', fontWeight: 500, fontSize: '0.82rem', textDecoration: 'none', fontFamily: 'inherit' }}>
                      📖 Handbuch Familie (Erste Schritte)
                    </Link>
                  </>
                )}
                {mappe.id === 'notizen' && (
                  <>
                    <Link to={PROJECT_ROUTES['k2-galerie'].notizen} style={{ display: 'block', padding: '0.55rem 0.75rem', background: 'rgba(196,181,253,0.12)', border: '1px solid rgba(196,181,253,0.3)', borderRadius: '8px', color: '#c4b5fd', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', fontFamily: 'inherit' }}>
                      📝 Notizen
                    </Link>
                    <div style={{ marginTop: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.8rem', color: '#c4b5fd', fontWeight: 600 }}>Diverses</span>
                        <button type="button" onClick={() => setDiversesAddMode(m => !m)} style={{ fontSize: '0.7rem', color: diversesAddMode ? '#5ffbf1' : 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.1rem 0.35rem', fontFamily: 'inherit' }}>{diversesAddMode ? '✕' : '＋ Hinzufügen'}</button>
                      </div>
                      {diversesAddMode && (
                        <div style={{ background: 'rgba(196,181,253,0.06)', border: '1px solid rgba(196,181,253,0.2)', borderRadius: '6px', padding: '0.5rem', marginBottom: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            <input value={diversesNeuEmoji} onChange={e => setDiversesNeuEmoji(e.target.value)} placeholder="📄" maxLength={4} style={{ width: 32, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(196,181,253,0.25)', borderRadius: '6px', color: '#fff', fontSize: '0.9rem', padding: '0.3rem', fontFamily: 'inherit', textAlign: 'center' }} />
                            <input value={diversesNeuLabel} onChange={e => setDiversesNeuLabel(e.target.value)} placeholder="Name" style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(196,181,253,0.25)', borderRadius: '6px', color: '#fff', fontSize: '0.78rem', padding: '0.3rem 0.5rem', fontFamily: 'inherit' }} />
                          </div>
                          <input value={diversesNeuUrl} onChange={e => setDiversesNeuUrl(e.target.value)} placeholder="Link oder Pfad" style={{ width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(196,181,253,0.25)', borderRadius: '6px', color: '#fff', fontSize: '0.72rem', padding: '0.3rem 0.5rem', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                          <button type="button" onClick={diversesHinzufuegen} style={{ background: 'rgba(196,181,253,0.18)', border: '1px solid rgba(196,181,253,0.4)', borderRadius: '6px', color: '#c4b5fd', fontWeight: 600, fontSize: '0.78rem', padding: '0.35rem', cursor: 'pointer', fontFamily: 'inherit' }}>✅ Ablegen</button>
                        </div>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        {diverses.length === 0 && <p style={{ margin: 0, fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>Noch nichts abgelegt</p>}
                        {diverses.map(d => (
                          <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <button type="button" onClick={() => diversesOeffnen(d)} style={{ flex: 1, textAlign: 'left', background: 'rgba(196,181,253,0.07)', border: '1px solid rgba(196,181,253,0.2)', borderRadius: '6px', color: '#e9d5ff', fontSize: '0.78rem', padding: '0.4rem 0.6rem', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <span>{d.emoji ?? '📄'}</span><span style={{ flex: 1 }}>{d.label}</span><span style={{ fontSize: '0.65rem', opacity: 0.4 }}>→</span>
                            </button>
                            <button type="button" onClick={() => diversesLoeschen(d.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: '0.7rem', padding: '0.2rem 0.35rem' }} title="Entfernen">✕</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {mappe.id === 'vermaechtnis' && (
                  <>
                    <p style={{ margin: '0 0 0.35rem 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>Dieser digitale Raum ist Georgs bleibendes Werk – für Kinder, Enkel und alle die nach ihm kommen.</p>
                    <button type="button" onClick={() => nav('handbuch', '/k2team-handbuch?doc=16-ZENTRALE-THEMEN-FUER-NUTZER.md')} style={{ width: '100%', padding: '0.5rem 0.7rem', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)', borderRadius: '6px', color: '#86efac', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}>📌 Zentrale Themen</button>
                    <button
                      type="button"
                      onClick={() => {
                        const w = window.open('', '_blank')
                        if (!w) return
                        w.document.write(`<!DOCTYPE html><html lang="de"><head><meta charset="utf-8">
<title>Georgs Raum – Der Schlüssel</title>
<style>@media print { @page { size: A4; margin: 18mm; } body { -webkit-print-color-adjust: exact; } }
body { font-family: Georgia, serif; color: #111; max-width: 600px; margin: 0 auto; padding: 30px 20px; }
h1 { font-size: 1.8rem; color: #111; margin-bottom: 0.2rem; }
.sub { font-size: 1rem; color: #555; font-style: italic; margin-bottom: 1.5rem; }
.qr-box { text-align: center; margin: 1.5rem 0; }
.qr-box img { width: 200px; height: 200px; }
.url { font-family: monospace; font-size: 0.9rem; background: #f5f5f5; padding: 0.6rem 1rem; border-radius: 6px; border: 1px solid #ddd; text-align: center; margin: 0.75rem 0; word-break: break-all; }
.motto { font-size: 1.1rem; font-style: italic; border-left: 4px solid #8b6914; padding-left: 1rem; margin: 1.25rem 0; color: #444; }
hr { border: none; border-top: 1px solid #ddd; margin: 1.25rem 0; }
.text { font-size: 0.95rem; line-height: 1.75; color: #333; }
.text strong { color: #111; }
.hinweis { font-size: 0.85rem; color: #666; line-height: 1.65; margin-top: 1rem; background: #fafafa; padding: 0.75rem 1rem; border-radius: 6px; border: 1px solid #eee; }
.footer { font-size: 0.75rem; color: #aaa; text-align: center; margin-top: 1.5rem; }
</style></head><body>
<h1>&#127963; Georgs Raum</h1>
<div class="sub">Der digitale Nachlass von Georg Kreinecker</div>
<div class="qr-box"><img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://github.com/georgkreinecker-dotcom/k2-galerie" alt="QR-Code" width="200" height="200" style="border:1px solid #ddd;border-radius:8px;" /></div>
<div class="url">https://github.com/georgkreinecker-dotcom/k2-galerie</div>
<hr><div class="motto">&bdquo;Tue eine Sache &ndash; und du wirst die Kraft dazu haben.&ldquo;</div><hr>
<div class="text"><p>Dieser QR-Code ist der <strong>Schlüssel zu einem digitalen Raum</strong> &ndash; einem Ort der niemals verschwindet.</p>
<p>Georg Kreinecker hat diesen Raum gebaut. In diesem Raum liegt sein <strong>Wissen, seine Werte und sein Lebenswerk</strong> &ndash; die K2 Galerie. Alles ist dokumentiert, strukturiert und zugänglich.</p>
<p>Das Fundament: <strong>Nichts Halbes. Nichts was Menschen schadet. Nur das Reine. Nur das Licht.</strong></p></div>
<div class="hinweis"><strong>Für wer auch immer diesen Schlüssel findet:</strong><br><br>Scanne den QR-Code oder tippe die Adresse in jeden Browser. Dort findest du <strong>EINGANG.md</strong> &ndash; sie erklärt alles. Der Raum wartet auf dich.</div>
<hr><div class="footer">Georg Kreinecker &middot; K2 Galerie &middot; Erstellt 23.02.2026</div>
<script>window.onload = () => window.print()</script>
</body></html>`)
                        w.document.close()
                      }}
                      style={{ width: '100%', padding: '0.55rem 0.75rem', background: 'linear-gradient(135deg, rgba(196,181,253,0.15), rgba(167,139,250,0.1))', border: '1px solid rgba(196,181,253,0.35)', borderRadius: '8px', color: '#c4b5fd', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center', marginTop: '0.35rem' }}
                    >🖨️ Schlüssel drucken / für den Safe</button>
                  </>
                )}
              </div>
            )}
          </div>
        )
      })}

      {/* Erkundungs-Notizen Inbox (Galerie/Entdecken) */}
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

    </div>
  )
}
