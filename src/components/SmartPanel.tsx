import { useState, useRef, useEffect, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

/** Team-Handbuch in der APf: gleicher Query-Parameter wie K2TeamHandbuchPage */
const HANDBUCH_DOC_QUERY = 'doc' as const
const HANDBUCH_DOC_KOMPASS = '24-TEXTE-BRIEFE-KOMPASS.md'
const HANDBUCH_DOC_ZENTRALE_THEMEN = '16-ZENTRALE-THEMEN-FUER-NUTZER.md'
const HANDBUCH_DOC_NOTFALL = '23-NOTFALL-CHECKLISTE.md'
import { PROJECT_ROUTES, PLATFORM_ROUTES, MOK2_ROUTE, ENTDECKEN_ROUTE } from '../config/navigation'
import { K2_FAMILIE_APP_SHORT_PATH } from '../utils/k2FamiliePwaBranding'
import { prepareFreshOek2VisitorSession } from '../utils/oek2FreshStart'
const GUIDE_KEY = 'k2-entdecken-guide-antworten'

const WISHES_LAST_SEEN_KEY = 'k2-wishes-last-seen'

interface UserWish {
  id: string
  text: string
  source?: string
  createdAt: string
  /** wish = Idee/Wunsch (Standard), problem = Störung / Problem melden */
  kind?: 'wish' | 'problem'
}

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

function startFremderModus() {
  // Im iframe (Cursor Preview) kein location.href – verhindert Reload/Crash
  if (typeof window !== 'undefined' && window.self !== window.top) return
  // Einheitlicher Standard: frische ök2-Besucher-Session
  prepareFreshOek2VisitorSession()
  // Zur Landingpage – echter Neustart
  window.location.href = ENTDECKEN_ROUTE
}

/** VK2 immer per Voll-Navigation öffnen – verhindert, dass K2/Router-Zustand bleibt */
const VK2_GALERIE_URL = '/projects/vk2/galerie'

/** Promo-Video-Hub + Quellen (violett, eigene Mappe im Smart Panel) */
const PROMO_VIDEO_PRODUKTION_ROUTE = PROJECT_ROUTES['k2-galerie'].promoVideoProduktion
const PROMO_RUNWAY_PACK_ROUTE = PROJECT_ROUTES['k2-galerie'].promoRunwayPack
const PRAEMAPPE_VOLL_OEK2 = `${PROJECT_ROUTES['k2-galerie'].praesentationsmappeVollversion}?context=oeffentlich`
const ADMIN_OEK2_EINSTELLUNGEN = '/admin?context=oeffentlich&tab=einstellungen'
/** Spiegel unter public/k2team-handbuch/ – gleicher Inhalt wie docs/ (APf-Handbuch lädt von /k2team-handbuch/) */
const DOC_VIDEO_PRAEMAPPE = 'VIDEO-PRODUKTION-PRAEMAPPE-ANALYSE.md'
const DOC_VIDEO_MATRIX = 'VIDEO-PRODUKTION-MATRIX-UND-DREHBUCH-V1.md'
const apfHandbuchDocUrl = (docFile: string) => `/projects/k2-galerie?page=handbuch&doc=${encodeURIComponent(docFile)}`

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
  { id: 'uebersicht', label: '📊 Übersicht-Board', page: 'uebersicht', url: PROJECT_ROUTES['k2-galerie'].uebersicht, color: 'linear-gradient(135deg, rgba(13,148,136,0.2), rgba(45,212,191,0.12))', border: 'rgba(45,212,191,0.4)' },
  { id: 'lizenzen', label: '🔑 Lizenzen & Testpilot', page: 'lizenzen', url: `${PROJECT_ROUTES['k2-galerie'].licences}#testpilot-einladen`, color: 'linear-gradient(135deg, rgba(245,158,11,0.18), rgba(217,119,6,0.12))', border: 'rgba(245,158,11,0.45)' },
  { id: 'k2', label: '🎨 K2 Galerie Kunst&Keramik', page: 'galerie', url: PROJECT_ROUTES['k2-galerie'].galerie, color: 'linear-gradient(135deg, rgba(255,140,66,0.2), rgba(230,122,42,0.15))', border: 'rgba(255,140,66,0.4)' },
  { id: 'oek2', label: '🌐 Öffentliche Galerie K2', page: 'galerie-oeffentlich', url: PROJECT_ROUTES['k2-galerie'].galerieOeffentlich, color: 'linear-gradient(135deg, rgba(95,251,241,0.12), rgba(60,200,190,0.08))', border: 'rgba(95,251,241,0.3)' },
  { id: 'k2-familie', label: '👨‍👩‍👧‍👦 K2 Familie', page: 'k2-familie', url: K2_FAMILIE_APP_SHORT_PATH, color: 'linear-gradient(135deg, rgba(13,148,136,0.22), rgba(20,184,166,0.12))', border: 'rgba(13,148,136,0.5)' },
  { id: 'vk2', label: '🎨 VK2 Vereinsplattform', page: 'vk2', url: VK2_GALERIE_URL, color: 'linear-gradient(135deg, rgba(230,122,42,0.2), rgba(255,140,66,0.15))', border: 'rgba(255,140,66,0.4)' },
  { id: 'mok2', label: '📋 mök2 – Vertrieb & Promotion', page: 'mok2', url: MOK2_ROUTE, color: 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(245,158,11,0.08))', border: 'rgba(251,191,36,0.3)' },
  { id: 'kampagne', label: '📁 Kampagne Marketing-Strategie', page: 'kampagne', url: PROJECT_ROUTES['k2-galerie'].kampagneMarketingStrategie, color: 'linear-gradient(135deg, rgba(95,251,241,0.15), rgba(60,200,190,0.08))', border: 'rgba(95,251,241,0.35)' },
  { id: 'k2-welt-strategie', label: '📐 K2-Welt – Strategie & Portfolio', page: 'k2-welt-strategie', url: PROJECT_ROUTES['k2-galerie'].k2WeltStrategie, color: 'linear-gradient(135deg, rgba(129,140,248,0.2), rgba(99,102,241,0.12))', border: 'rgba(129,140,248,0.45)' },
  { id: 'k2-markt', label: '🎯 K2 Markt', page: 'k2-markt', url: PROJECT_ROUTES['k2-markt'].home, color: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(22,163,74,0.08))', border: 'rgba(34,197,94,0.35)' },
  { id: 'presse', label: '📰 Events, Medien & Öffentlichkeit (K2)', page: 'presse', url: '/admin?tab=eventplan&eventplan=öffentlichkeitsarbeit', color: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(37,99,235,0.08))', border: 'rgba(59,130,246,0.35)' },
  { id: 'notizen', label: '📝 Notizen', page: 'notizen', url: PROJECT_ROUTES['k2-galerie'].notizen, color: 'linear-gradient(135deg, rgba(196,181,253,0.15), rgba(139,92,246,0.08))', border: 'rgba(196,181,253,0.35)' },
  { id: 'handbuch', label: '🧠 Handbuch', page: 'handbuch', url: '/k2team-handbuch', color: 'rgba(95,251,241,0.08)', border: 'rgba(95,251,241,0.2)' },
]

function loadOrder(): string[] {
  try {
    const saved = localStorage.getItem(PANEL_ORDER_KEY)
    if (saved) {
      const order = JSON.parse(saved) as string[]
      // Alte Kachel „oeffentlichkeitsarbeit“ → mit „presse“ zusammengeführt (ein Einstieg)
      const migrated = order.map((id) => (id === 'oeffentlichkeitsarbeit' ? 'presse' : id))
      const deduped = migrated.filter((id, idx) => migrated.indexOf(id) === idx)
      if (deduped.length !== order.length || migrated.some((id, i) => id !== order[i])) {
        try { localStorage.setItem(PANEL_ORDER_KEY, JSON.stringify(deduped)) } catch { /* ignore */ }
        return deduped
      }
      return order
    }
  } catch { /* ignore */ }
  return ['k2', 'oek2', 'k2-familie', 'vk2', 'mok2', 'kampagne', 'k2-welt-strategie', 'k2-markt', 'presse', 'notizen', 'handbuch']
}

function saveOrder(order: string[]) {
  try { localStorage.setItem(PANEL_ORDER_KEY, JSON.stringify(order)) } catch { /* ignore */ }
}

const MAPPEN_OPEN_KEY = 'smartpanel-mappen-open'
const K2_SOFTWAREENTWICKLUNG = PROJECT_ROUTES['k2-galerie'].softwareentwicklung
const EINLADUNG_EROEFFNUNG_24 = PROJECT_ROUTES['k2-galerie'].notizenEinladungEroeffnung24
const MARKETING_OEK2_PAGE = PROJECT_ROUTES['k2-galerie'].marketingOek2
/** Arbeitsmappen – Hall of Fame: K2 Galerie, K2 Markt, K2 Familie, Notizen, Vermächtnis (jeweils eigenes Produkt) */
const GALERIE_ITEM_IDS = ['uebersicht', 'lizenzen', 'k2', 'oek2', 'vk2', 'mok2', 'kampagne', 'presse'] as const
const MAPPEN = [
  { id: 'ready-to-go', label: 'K2 Ready to go', icon: '🎯', itemIds: [] as const },
  {
    id: 'promo-video',
    label: 'Promo-Video-Produktion',
    icon: '🎬',
    itemIds: [] as const,
  },
  {
    id: 'k2-welt-strategie-mappe',
    label: 'K2-Welt – Strategie & Portfolio',
    icon: '📐',
    itemIds: ['k2-welt-strategie'] as const,
  },
  { id: 'galerie', label: 'K2 Galerie', icon: '🎨', itemIds: [...GALERIE_ITEM_IDS] },
  { id: 'k2-markt', label: 'K2 Markt', icon: '🏪', itemIds: ['k2-markt'] },
  { id: 'familie', label: 'K2 Familie', icon: '👨‍👩‍👧‍👦', itemIds: ['k2-familie'] },
  { id: 'notizen', label: 'Notizen', icon: '📝', itemIds: ['notizen'] },
  { id: 'vermaechtnis', label: 'Vermächtnis', icon: '🏛️', itemIds: ['handbuch'] },
] as const

function loadMappenOpen(): Record<string, boolean> {
  try {
    const v = localStorage.getItem(MAPPEN_OPEN_KEY)
    if (v) return JSON.parse(v)
  } catch { /* ignore */ }
  return { 'ready-to-go': true, 'promo-video': true, 'k2-welt-strategie-mappe': true, galerie: true, 'k2-markt': true, familie: true, notizen: true, vermaechtnis: true }
}

function saveMappenOpen(open: Record<string, boolean>) {
  try { localStorage.setItem(MAPPEN_OPEN_KEY, JSON.stringify(open)) } catch { /* ignore */ }
}

// ── Diverses – frei befüllbare Ablage ──────────────────────────────────────────
const DIVERSES_KEY = 'smartpanel-diverses'

type DiversesItem = {
  id: string
  label: string
  url: string  // URL oder /pfad oder docs/DATEI.md
  emoji?: string
}

const DEFAULT_DIVERSES: DiversesItem[] = [
  { id: 'notizen-uebersicht', label: 'Georgs Notizen (Übersicht)', url: PROJECT_ROUTES['k2-galerie'].notizen, emoji: '📝' },
  { id: 'august-softwarestand', label: 'Schreiben an August – Softwarestand', url: PROJECT_ROUTES['k2-galerie'].notizenAugustSoftwarestand, emoji: '🛠️' },
  { id: 'brief-august', label: 'Brief an August', url: PROJECT_ROUTES['k2-galerie'].notizenBriefAugust, emoji: '✉️' },
  { id: 'brief-andreas', label: 'Brief an Andreas', url: PROJECT_ROUTES['k2-galerie'].notizenBriefAndreas, emoji: '✉️' },
  { id: 'einladung-eroeffnung-24', label: 'Einladung Freunde – Eröffnung 24.–26.04. · Mail + WhatsApp', url: PROJECT_ROUTES['k2-galerie'].notizenEinladungEroeffnung24, emoji: '📅' },
  { id: 'freunde', label: 'Für meine Freunde', url: '/freunde-erklaerung.html', emoji: '👥' },
]

function loadDiverses(): DiversesItem[] {
  try {
    const v = localStorage.getItem(DIVERSES_KEY)
    if (v) {
      const items: DiversesItem[] = JSON.parse(v)
      // Fehlt "Brief an Andreas" oder ist die Liste kürzer als der Standard → auf Standard setzen (damit neue Einträge immer erscheinen)
      if (!items.some((x) => x.id === 'august-softwarestand') || !items.some((x) => x.id === 'brief-andreas') || !items.some((x) => x.id === 'einladung-eroeffnung-24') || items.length < DEFAULT_DIVERSES.length) {
        saveDiverses(DEFAULT_DIVERSES)
        return DEFAULT_DIVERSES
      }
      return items
    }
  } catch { /* ignore */ }
  return DEFAULT_DIVERSES
}

function saveDiverses(items: DiversesItem[]) {
  try { localStorage.setItem(DIVERSES_KEY, JSON.stringify(items)) } catch { /* ignore */ }
}

// Smart Panel (SP) – K2-Balken & Schnellzugriff (schlank, mök2-Links nur in mök2)

interface SmartPanelProps {
  currentPage?: string
  onNavigate?: (page: string) => void
}

const K2_FAMILIE_HOME = K2_FAMILIE_APP_SHORT_PATH

export default function SmartPanel({ currentPage, onNavigate }: SmartPanelProps) {
  const navigate = useNavigate()
  const [, setSearchParams] = useSearchParams()

  /** In der APf: URL mit page=handbuch & doc=… setzen, sonst öffnet sich der Kompass nicht. */
  const openTeamHandbuchDoc = (docFile: string) => {
    const handbuchApfUrl = `/projects/k2-galerie?page=handbuch&doc=${encodeURIComponent(docFile)}`
    if (onNavigate) {
      // Hart auf die APf-URL navigieren: verhindert Race, bei dem nur das Index-Dokument erscheint.
      if (typeof window !== 'undefined' && window.self === window.top) {
        window.location.href = handbuchApfUrl
        return
      }
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set('page', 'handbuch')
          next.set(HANDBUCH_DOC_QUERY, docFile)
          return next
        },
        { replace: true }
      )
      onNavigate('handbuch')
      return
    }
    if (typeof window !== 'undefined' && window.self === window.top) {
      window.location.href = handbuchApfUrl
    }
  }
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
    if (browserPath.startsWith('/projects/k2-galerie/uebersicht')) return 'uebersicht'
    if (browserPath.startsWith('/projects/k2-galerie/galerie-oeffentlich') || browserPath.startsWith('/galerie-oeffentlich')) return 'galerie-oeffentlich'
    if (browserPath.startsWith('/galerie') || browserPath.startsWith('/projects/k2-galerie/galerie')) return 'galerie'
    if (browserPath.startsWith('/mok2') || browserPath.startsWith('/projects/k2-galerie/marketing')) return 'mok2'
    if (browserPath.startsWith('/projects/k2-galerie/notizen')) return 'notizen'
    if (browserPath.startsWith('/projects/k2-galerie/promo-runway-pack')) return 'promo-runway-pack'
    if (browserPath.startsWith('/projects/k2-galerie/promo-video-produktion')) return 'promo-video-produktion'
    if (browserPath.startsWith('/projects/k2-galerie/k2-welt-strategie')) return 'k2-welt-strategie'
    if (browserPath.startsWith('/k2-familie-handbuch')) return 'k2-familie-handbuch'
    if (browserPath.startsWith('/k2team-handbuch')) return 'handbuch'
    return currentPage || ''
  }, [browserPath, currentPage])

  const nav = (page: string, url: string) => {
    if (page === 'galerie-oeffentlich' || url.includes('/galerie-oeffentlich')) {
      prepareFreshOek2VisitorSession()
      if (onNavigate) onNavigate('entdecken')
      else if (typeof window !== 'undefined' && window.self === window.top) window.location.href = ENTDECKEN_ROUTE
      return
    }
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

  // Wünsche von Nutzer:innen (API)
  const [wishes, setWishes] = useState<UserWish[]>([])
  const [wishesLoading, setWishesLoading] = useState(true)
  const [wuenscheOpen, setWuenscheOpen] = useState(false)
  const [lastSeen, setLastSeen] = useState<string | null>(() => {
    try { return localStorage.getItem(WISHES_LAST_SEEN_KEY) } catch (_) {}
    return null
  })

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    fetch(`${origin}/api/user-wishes`)
      .then(res => res.ok ? res.json() : Promise.reject(new Error('Laden fehlgeschlagen')))
      .then((data: { wishes?: UserWish[] }) => setWishes(Array.isArray(data?.wishes) ? data.wishes : []))
      .catch(() => setWishes([]))
      .finally(() => setWishesLoading(false))
  }, [])

  const markWishesSeen = () => {
    const now = new Date().toISOString()
    setLastSeen(now)
    try { localStorage.setItem(WISHES_LAST_SEEN_KEY, now) } catch (_) {}
  }

  const newCount = useMemo(() => {
    if (!lastSeen) return wishes.length
    const t = new Date(lastSeen).getTime()
    return wishes.filter(w => new Date(w.createdAt).getTime() > t).length
  }, [wishes, lastSeen])

  const toggleWuensche = () => {
    if (!wuenscheOpen) {
      setWuenscheOpen(true)
      markWishesSeen()
    } else {
      setWuenscheOpen(false)
    }
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
        {onNavigate ? (
          <button
            type="button"
            onClick={() => onNavigate('texte-schreibtisch')}
            style={{
              width: '100%',
              marginTop: '0.65rem',
              padding: '0.65rem 0.85rem',
              background: 'linear-gradient(135deg, rgba(180,120,60,0.35), rgba(138,90,43,0.2))',
              border: '1px solid rgba(212,167,106,0.65)',
              borderRadius: '10px',
              color: '#f5e6c8',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              textAlign: 'center',
              boxShadow: '0 2px 12px rgba(40,26,12,0.25)',
            }}
            title="Texte wie auf dem Schreibtisch: Bereiche und Zettel, keine Listen"
          >
            🪑 Texte-Schreibtisch
          </button>
        ) : (
          <Link
            to={PROJECT_ROUTES['k2-galerie'].texteSchreibtisch}
            style={{
              display: 'block',
              width: '100%',
              marginTop: '0.65rem',
              padding: '0.65rem 0.85rem',
              background: 'linear-gradient(135deg, rgba(180,120,60,0.35), rgba(138,90,43,0.2))',
              border: '1px solid rgba(212,167,106,0.65)',
              borderRadius: '10px',
              color: '#f5e6c8',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              textAlign: 'center',
              boxShadow: '0 2px 12px rgba(40,26,12,0.25)',
              textDecoration: 'none',
            }}
            title="Texte wie auf dem Schreibtisch: Bereiche und Zettel, keine Listen"
          >
            🪑 Texte-Schreibtisch
          </Link>
        )}
        <button
          type="button"
          onClick={() => openTeamHandbuchDoc(HANDBUCH_DOC_KOMPASS)}
          style={{
            width: '100%',
            marginTop: '0.45rem',
            padding: '0.45rem 0.65rem',
            background: 'transparent',
            border: '1px solid rgba(96,165,250,0.35)',
            borderRadius: '8px',
            color: '#93c5fd',
            fontWeight: 600,
            fontSize: '0.75rem',
            cursor: 'pointer',
            fontFamily: 'inherit',
            textAlign: 'center',
            opacity: 0.92,
          }}
          title="Klassische Tabellenübersicht im Team-Handbuch"
        >
          📋 Kompass als Tabelle
        </button>
      </div>

      {/* ── Arbeitsmappen (Themen gebündelt) – Promo-Video: eigene Mappe, nicht nur ein Button ── */}
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
                ...(mappe.id === 'promo-video'
                  ? {
                      background: 'linear-gradient(135deg, rgba(124,58,237,0.22), rgba(91,33,182,0.12))',
                      border: '1px solid rgba(167,139,250,0.45)',
                      color: '#e9d5ff',
                    }
                  : mappe.id === 'k2-welt-strategie-mappe'
                    ? {
                        background: 'linear-gradient(135deg, rgba(129,140,248,0.22), rgba(99,102,241,0.12))',
                        border: '1px solid rgba(165,180,252,0.45)',
                        color: '#c7d2fe',
                      }
                    : {
                        background: 'rgba(95,251,241,0.06)',
                        border: '1px solid rgba(95,251,241,0.2)',
                        color: '#5ffbf1',
                      }),
                borderRadius: '8px',
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
                {mappe.id === 'ready-to-go' && (
                  <>
                    <p style={{ margin: '0 0 0.35rem', fontSize: '0.72rem', lineHeight: 1.45, color: 'rgba(255,245,240,0.75)' }}>
                      Live-Start, Sicherheit <strong style={{ color: 'rgba(255,245,240,0.92)' }}>und</strong> Galerie-Eröffnung (24.–26.04.) – eine Mappe. Details: K2 Softwareentwicklung; Einladung &amp; Marketing direkt hier.
                    </p>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(253,224,71,0.95)', fontWeight: 700, margin: '0.15rem 0 0.2rem' }}>Galerie-Eröffnung 24.–26.04.</div>
                    <ul style={{ margin: '0 0 0.45rem', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.74rem', lineHeight: 1.35, color: 'rgba(255,245,240,0.88)' }}>
                      <li>
                        {onNavigate ? (
                          <span role="button" tabIndex={0} onClick={() => navigate(EINLADUNG_EROEFFNUNG_24)} onKeyDown={e => e.key === 'Enter' && navigate(EINLADUNG_EROEFFNUNG_24)} style={{ color: '#fcd34d', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}>Einladung Freunde – Mail &amp; WhatsApp</span>
                        ) : (
                          <Link to={EINLADUNG_EROEFFNUNG_24} style={{ color: '#fcd34d', textDecoration: 'underline', fontFamily: 'inherit' }}>Einladung Freunde – Mail &amp; WhatsApp</Link>
                        )}
                      </li>
                      <li>
                        {onNavigate ? (
                          <span role="button" tabIndex={0} onClick={() => onNavigate('mok2')} onKeyDown={e => e.key === 'Enter' && onNavigate('mok2')} style={{ color: '#fcd34d', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}>mök2 – Vertrieb &amp; Promotion</span>
                        ) : (
                          <Link to={MOK2_ROUTE} style={{ color: '#fcd34d', textDecoration: 'underline', fontFamily: 'inherit' }}>mök2 – Vertrieb &amp; Promotion</Link>
                        )}
                        {' · '}
                        {onNavigate ? (
                          <span role="button" tabIndex={0} onClick={() => navigate(MARKETING_OEK2_PAGE)} onKeyDown={e => e.key === 'Enter' && navigate(MARKETING_OEK2_PAGE)} style={{ color: '#fcd34d', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}>Marketing ök2</span>
                        ) : (
                          <Link to={MARKETING_OEK2_PAGE} style={{ color: '#fcd34d', textDecoration: 'underline', fontFamily: 'inherit' }}>Marketing ök2</Link>
                        )}
                      </li>
                      <li>
                        {onNavigate ? (
                          <span role="button" tabIndex={0} onClick={() => onNavigate('presse')} onKeyDown={e => e.key === 'Enter' && onNavigate('presse')} style={{ color: '#fcd34d', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}>Admin – Events & Öffentlichkeit</span>
                        ) : (
                          <Link to="/admin?tab=eventplan&eventplan=öffentlichkeitsarbeit" style={{ color: '#fcd34d', textDecoration: 'underline', fontFamily: 'inherit' }}>Admin – Events & Öffentlichkeit</Link>
                        )}
                      </li>
                      <li>
                        Docs: <code style={{ fontSize: '0.68rem', color: 'rgba(255,245,240,0.7)' }}>MARKETING-EROEFFNUNG-K2-OEK2.md</code>, <code style={{ fontSize: '0.68rem', color: 'rgba(255,245,240,0.7)' }}>K2-DOKUMENTE-GALERIEEROEFFNUNG.md</code>
                      </li>
                      <li>
                        {onNavigate ? (
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                              onNavigate('softwareentwicklung')
                              window.setTimeout(() => {
                                try {
                                  window.location.hash = 'k2-ready-eroeffnung'
                                  const el = document.getElementById('k2-ready-eroeffnung')
                                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                } catch {
                                  /* ignore */
                                }
                              }, 450)
                            }}
                            onKeyDown={e => {
                              if (e.key !== 'Enter') return
                              onNavigate('softwareentwicklung')
                              window.setTimeout(() => {
                                try {
                                  window.location.hash = 'k2-ready-eroeffnung'
                                  const el = document.getElementById('k2-ready-eroeffnung')
                                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                } catch {
                                  /* ignore */
                                }
                              }, 450)
                            }}
                            style={{ color: '#fcd34d', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}
                          >
                            Abschnitt Eröffnung auf „K2 Softwareentwicklung“
                          </span>
                        ) : (
                          <Link to={`${K2_SOFTWAREENTWICKLUNG}#k2-ready-eroeffnung`} style={{ color: '#fcd34d', textDecoration: 'underline', fontFamily: 'inherit' }}>
                            Abschnitt Eröffnung auf „K2 Softwareentwicklung“
                          </Link>
                        )}
                      </li>
                    </ul>
                    {onNavigate ? (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={() => onNavigate('softwareentwicklung')}
                        onKeyDown={e => e.key === 'Enter' && onNavigate('softwareentwicklung')}
                        style={{ display: 'block', padding: '0.55rem 0.75rem', background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.12))', border: '1px solid rgba(251,191,36,0.45)', borderRadius: '8px', color: '#fcd34d', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}
                      >
                        📘 K2 Softwareentwicklung – Ready-to-go &amp; Docs
                      </span>
                    ) : (
                      <Link
                        to={`${K2_SOFTWAREENTWICKLUNG}#k2-ready-go`}
                        style={{ display: 'block', padding: '0.55rem 0.75rem', background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.12))', border: '1px solid rgba(251,191,36,0.45)', borderRadius: '8px', color: '#fcd34d', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none', fontFamily: 'inherit' }}
                      >
                        📘 K2 Softwareentwicklung – Ready-to-go &amp; Docs
                      </Link>
                    )}
                    <div style={{ fontSize: '0.72rem', color: 'rgba(253,224,71,0.95)', fontWeight: 700, marginTop: '0.35rem' }}>Zahlung (nur wenn Online-Lizenz)</div>
                    <ul style={{ margin: '0.15rem 0 0', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.74rem', lineHeight: 1.35, color: 'rgba(255,245,240,0.88)' }}>
                      <li>Migration 003 (Stripe-Tabellen), Vercel-Env, Stripe-Webhook – siehe docs/START-NUR-NOCH-OFFEN.md</li>
                      <li>
                        {onNavigate ? (
                          <span role="button" tabIndex={0} onClick={() => onNavigate('softwareentwicklung')} onKeyDown={e => e.key === 'Enter' && onNavigate('softwareentwicklung')} style={{ color: '#fcd34d', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}>Abschnitt Stripe Go-Live öffnen</span>
                        ) : (
                          <Link to={`${K2_SOFTWAREENTWICKLUNG}#k2-ready-stripe`} style={{ color: '#fcd34d', textDecoration: 'underline', fontFamily: 'inherit' }}>Abschnitt Stripe Go-Live öffnen</Link>
                        )}
                      </li>
                    </ul>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(253,224,71,0.95)', fontWeight: 700, marginTop: '0.35rem' }}>Sicherheit &amp; Audit</div>
                    <ul style={{ margin: '0.15rem 0 0', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.74rem', lineHeight: 1.35, color: 'rgba(255,245,240,0.88)' }}>
                      <li>API-Key „An Server senden“, Supabase-User, Migration 002, Env-Variablen, npm audit, AGB/DSGVO – docs/SICHERHEIT-VOR-GO-LIVE.md</li>
                      <li>
                        Verbindlicher Ablauf &amp; Ampel:{' '}
                        {onNavigate ? (
                          <span role="button" tabIndex={0} onClick={() => onNavigate('softwareentwicklung')} onKeyDown={e => e.key === 'Enter' && onNavigate('softwareentwicklung')} style={{ color: '#fcd34d', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}>Audit &amp; Programmsicherheit</span>
                        ) : (
                          <Link to={`${K2_SOFTWAREENTWICKLUNG}#k2-ready-audit`} style={{ color: '#fcd34d', textDecoration: 'underline', fontFamily: 'inherit' }}>Audit &amp; Programmsicherheit</Link>
                        )}
                      </li>
                    </ul>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(253,224,71,0.95)', fontWeight: 700, marginTop: '0.35rem' }}>Erstrunde technisch (22.03.26)</div>
                    <p style={{ margin: '0.1rem 0 0.25rem', fontSize: '0.7rem', lineHeight: 1.4, color: 'rgba(255,245,240,0.78)' }}>
                      <code style={{ fontSize: '0.68em' }}>npm run test</code> + <code style={{ fontSize: '0.68em' }}>npm run test:daten</code> grün. Ampel in <code style={{ fontSize: '0.68em' }}>AUDIT-PROZESS-PROGRAMMSICHERHEIT-GO-LIVE.md</code>.
                    </p>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(253,224,71,0.95)', fontWeight: 700, marginTop: '0.35rem' }}>Noch von dir (manuell)</div>
                    <ul style={{ margin: '0.15rem 0 0', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.74rem', lineHeight: 1.35, color: 'rgba(255,245,240,0.88)' }}>
                      <li>Vercel-Keys + „An Server senden“ live testen</li>
                      <li>Supabase: Migration 002 (003 bei Stripe) bestätigen</li>
                      <li>AGB / DSGVO / Impressum · Backup-Wiederherstellung üben</li>
                      <li>npm audit Follow-up</li>
                    </ul>
                    {onNavigate ? (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          onNavigate('softwareentwicklung')
                          window.setTimeout(() => {
                            try {
                              window.location.hash = 'k2-ready-georg'
                              const el = document.getElementById('k2-ready-georg')
                              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                            } catch {
                              /* ignore */
                            }
                          }, 450)
                        }}
                        onKeyDown={e => {
                          if (e.key !== 'Enter') return
                          onNavigate('softwareentwicklung')
                          window.setTimeout(() => {
                            try {
                              window.location.hash = 'k2-ready-georg'
                              const el = document.getElementById('k2-ready-georg')
                              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                            } catch {
                              /* ignore */
                            }
                          }, 450)
                        }}
                        style={{ display: 'inline-block', marginTop: '0.35rem', color: '#fcd34d', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.74rem', fontFamily: 'inherit' }}
                      >
                        Vollständige Checkliste öffnen →
                      </span>
                    ) : (
                      <Link
                        to={`${K2_SOFTWAREENTWICKLUNG}#k2-ready-georg`}
                        style={{ display: 'inline-block', marginTop: '0.35rem', color: '#fcd34d', textDecoration: 'underline', fontSize: '0.74rem', fontFamily: 'inherit' }}
                      >
                        Vollständige Checkliste öffnen →
                      </Link>
                    )}
                    <div style={{ fontSize: '0.72rem', color: 'rgba(253,224,71,0.95)', fontWeight: 700, marginTop: '0.35rem' }}>Testen &amp; Backups</div>
                    <ul style={{ margin: '0.15rem 0 0', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.74rem', lineHeight: 1.35, color: 'rgba(255,245,240,0.88)' }}>
                      <li>
                        {onNavigate ? (
                          <span role="button" tabIndex={0} onClick={() => onNavigate('galerie-vorschau')} onKeyDown={e => e.key === 'Enter' && onNavigate('galerie-vorschau')} style={{ color: '#fcd34d', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}>Werke-Vorschau K2</span>
                        ) : (
                          <Link to={PROJECT_ROUTES['k2-galerie'].galerieVorschau} style={{ color: '#fcd34d', textDecoration: 'underline', fontFamily: 'inherit' }}>Werke-Vorschau K2</Link>
                        )}
                        {' '}– Veröffentlichen, Laden, Stand, Etikett, Dokumente
                      </li>
                      <li>
                        {onNavigate ? (
                          <span role="button" tabIndex={0} onClick={() => onNavigate('mobile-connect')} onKeyDown={e => e.key === 'Enter' && onNavigate('mobile-connect')} style={{ color: '#fcd34d', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}>Mobile verbinden</span>
                        ) : (
                          <Link to={PROJECT_ROUTES['k2-galerie'].mobileConnect} style={{ color: '#fcd34d', textDecoration: 'underline', fontFamily: 'inherit' }}>Mobile verbinden</Link>
                        )}
                        {' '}– Stand, QR, Geräte
                      </li>
                      <li>
                        {onNavigate ? (
                          <span role="button" tabIndex={0} onClick={() => onNavigate('galerie')} onKeyDown={e => e.key === 'Enter' && onNavigate('galerie')} style={{ color: '#fcd34d', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}>Galerie K2</span>
                        ) : (
                          <Link to={PROJECT_ROUTES['k2-galerie'].galerie} style={{ color: '#fcd34d', textDecoration: 'underline', fontFamily: 'inherit' }}>Galerie K2</Link>
                        )}
                        {' '}·{' '}
                        {onNavigate ? (
                          <span role="button" tabIndex={0} onClick={() => onNavigate('galerie-oeffentlich')} onKeyDown={e => e.key === 'Enter' && onNavigate('galerie-oeffentlich')} style={{ color: '#fcd34d', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}>ök2</span>
                        ) : (
                          <Link to={PROJECT_ROUTES['k2-galerie'].galerieOeffentlich} style={{ color: '#fcd34d', textDecoration: 'underline', fontFamily: 'inherit' }}>ök2</Link>
                        )}
                        {' '}· VK2 – Kontexte prüfen
                      </li>
                      <li>
                        Vollbackup &amp; Wiederherstellung:{' '}
                        {onNavigate ? (
                          <span role="button" tabIndex={0} onClick={() => onNavigate('admin-einstellungen')} onKeyDown={e => e.key === 'Enter' && onNavigate('admin-einstellungen')} style={{ color: '#fcd34d', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}>Admin → Einstellungen</span>
                        ) : (
                          <Link to="/admin?tab=einstellungen" style={{ color: '#fcd34d', textDecoration: 'underline', fontFamily: 'inherit' }}>Admin → Einstellungen</Link>
                        )}
                      </li>
                      <li>
                        ök2-Texte:{' '}
                        {onNavigate ? (
                          <span role="button" tabIndex={0} onClick={() => onNavigate('galerie-oeffentlich-vorschau')} onKeyDown={e => e.key === 'Enter' && onNavigate('galerie-oeffentlich-vorschau')} style={{ color: '#fcd34d', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}>Werke-Vorschau ök2</span>
                        ) : (
                          <Link to={PROJECT_ROUTES['k2-galerie'].galerieOeffentlichVorschau} style={{ color: '#fcd34d', textDecoration: 'underline', fontFamily: 'inherit' }}>Werke-Vorschau ök2</Link>
                        )}
                      </li>
                    </ul>
                    <p style={{ margin: '0.4rem 0 0', fontSize: '0.68rem', lineHeight: 1.35, color: 'rgba(255,255,255,0.45)' }}>Daten-Tests: im Cursor Terminal <code style={{ fontSize: '0.65rem' }}>npm run test:daten</code> – wenn vorhanden.</p>
                  </>
                )}
                {mappe.id === 'promo-video' && (
                  <>
                    <p style={{ margin: '0 0 0.35rem', fontSize: '0.72rem', lineHeight: 1.45, color: 'rgba(237,233,254,0.88)' }}>
                      Mappe als <strong style={{ color: '#f5f3ff' }}>Quelle</strong>, fertiges Video in Stammdaten – nicht in der Besucher-Galerie. Hier: Hub, Präsentationsmappe, ök2, Vertrieb, Docs.
                    </p>
                    {onNavigate ? (
                      <button
                        type="button"
                        onClick={() => onNavigate('promo-video-produktion')}
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.85rem',
                          background: 'linear-gradient(135deg, rgba(124,58,237,0.42), rgba(91,33,182,0.24))',
                          border: activePage === 'promo-video-produktion' ? '2px solid rgba(216,180,254,0.95)' : '1px solid rgba(167,139,250,0.65)',
                          borderRadius: '10px',
                          color: '#ede9fe',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          textAlign: 'center',
                          boxShadow: '0 2px 14px rgba(91,33,182,0.35)',
                        }}
                        title="Hub: Regeln, Ablauf, Screens"
                      >
                        🎬 Hub Promo-Video-Produktion
                      </button>
                    ) : (
                      <Link
                        to={PROMO_VIDEO_PRODUKTION_ROUTE}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '0.65rem 0.85rem',
                          background: 'linear-gradient(135deg, rgba(124,58,237,0.42), rgba(91,33,182,0.24))',
                          border: '1px solid rgba(167,139,250,0.65)',
                          borderRadius: '10px',
                          color: '#ede9fe',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          textDecoration: 'none',
                          fontFamily: 'inherit',
                          textAlign: 'center',
                          boxShadow: '0 2px 14px rgba(91,33,182,0.35)',
                        }}
                        title="Hub: Regeln, Ablauf, Screens"
                      >
                        🎬 Hub Promo-Video-Produktion
                      </Link>
                    )}
                    {onNavigate ? (
                      <button
                        type="button"
                        onClick={() => onNavigate('promo-runway-pack')}
                        style={{
                          width: '100%',
                          padding: '0.55rem 0.85rem',
                          marginTop: '0.4rem',
                          background: 'linear-gradient(135deg, rgba(91,33,182,0.28), rgba(124,58,237,0.16))',
                          border: activePage === 'promo-runway-pack' ? '2px solid rgba(216,180,254,0.85)' : '1px solid rgba(167,139,250,0.5)',
                          borderRadius: '10px',
                          color: '#e9d5ff',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          textAlign: 'center',
                        }}
                        title="Deutsche Texte + englische Runway-Prompts zum Kopieren"
                      >
                        ✨ Runway-Paket ~2 Min (Texte &amp; Prompts)
                      </button>
                    ) : (
                      <Link
                        to={PROMO_RUNWAY_PACK_ROUTE}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '0.55rem 0.85rem',
                          marginTop: '0.4rem',
                          background: 'linear-gradient(135deg, rgba(91,33,182,0.28), rgba(124,58,237,0.16))',
                          border: '1px solid rgba(167,139,250,0.5)',
                          borderRadius: '10px',
                          color: '#e9d5ff',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          textDecoration: 'none',
                          fontFamily: 'inherit',
                          textAlign: 'center',
                        }}
                        title="Deutsche Texte + englische Runway-Prompts zum Kopieren"
                      >
                        ✨ Runway-Paket ~2 Min (Texte &amp; Prompts)
                      </Link>
                    )}
                    <div style={{ fontSize: '0.72rem', color: 'rgba(216,180,254,0.95)', fontWeight: 700, margin: '0.45rem 0 0.2rem' }}>Quelle &amp; Inhalt</div>
                    <ul style={{ margin: '0 0 0.4rem', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.74rem', lineHeight: 1.35, color: 'rgba(237,233,254,0.9)' }}>
                      <li>
                        {onNavigate ? (
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={() => navigate(PRAEMAPPE_VOLL_OEK2)}
                            onKeyDown={e => e.key === 'Enter' && navigate(PRAEMAPPE_VOLL_OEK2)}
                            style={{ color: '#c4b5fd', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}
                          >
                            Präsentationsmappe Vollversion
                          </span>
                        ) : (
                          <Link to={PRAEMAPPE_VOLL_OEK2} style={{ color: '#c4b5fd', textDecoration: 'underline', fontFamily: 'inherit' }}>
                            Präsentationsmappe Vollversion
                          </Link>
                        )}
                        {' '}
                        <span style={{ color: 'rgba(237,233,254,0.55)', fontSize: '0.68rem' }}>(?context=oeffentlich)</span>
                      </li>
                      <li>
                        {onNavigate ? (
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={() => onNavigate('galerie-oeffentlich')}
                            onKeyDown={e => e.key === 'Enter' && onNavigate('galerie-oeffentlich')}
                            style={{ color: '#c4b5fd', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}
                          >
                            ök2-Galerie
                          </span>
                        ) : (
                          <Link to={PROJECT_ROUTES['k2-galerie'].galerieOeffentlich} style={{ color: '#c4b5fd', textDecoration: 'underline', fontFamily: 'inherit' }}>
                            ök2-Galerie
                          </Link>
                        )}
                        {' · '}
                        {onNavigate ? (
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={() => onNavigate('galerie-oeffentlich-vorschau')}
                            onKeyDown={e => e.key === 'Enter' && onNavigate('galerie-oeffentlich-vorschau')}
                            style={{ color: '#c4b5fd', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}
                          >
                            Vorschau
                          </span>
                        ) : (
                          <Link to={PROJECT_ROUTES['k2-galerie'].galerieOeffentlichVorschau} style={{ color: '#c4b5fd', textDecoration: 'underline', fontFamily: 'inherit' }}>
                            Vorschau
                          </Link>
                        )}
                      </li>
                      <li>
                        {onNavigate ? (
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={() => navigate(ADMIN_OEK2_EINSTELLUNGEN)}
                            onKeyDown={e => e.key === 'Enter' && navigate(ADMIN_OEK2_EINSTELLUNGEN)}
                            style={{ color: '#c4b5fd', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}
                          >
                            Admin ök2 → Einstellungen
                          </span>
                        ) : (
                          <Link to={ADMIN_OEK2_EINSTELLUNGEN} style={{ color: '#c4b5fd', textDecoration: 'underline', fontFamily: 'inherit' }}>
                            Admin ök2 → Einstellungen
                          </Link>
                        )}
                        {' '}
                        <span style={{ color: 'rgba(237,233,254,0.6)', fontSize: '0.68rem' }}>(Stammdaten / Video)</span>
                      </li>
                    </ul>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(216,180,254,0.95)', fontWeight: 700, margin: '0.2rem 0 0.2rem' }}>Vertrieb &amp; Recht</div>
                    <ul style={{ margin: '0 0 0.4rem', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.74rem', lineHeight: 1.35, color: 'rgba(237,233,254,0.9)' }}>
                      <li>
                        {onNavigate ? (
                          <span role="button" tabIndex={0} onClick={() => onNavigate('mok2')} onKeyDown={e => e.key === 'Enter' && onNavigate('mok2')} style={{ color: '#c4b5fd', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}>
                            mök2
                          </span>
                        ) : (
                          <Link to={MOK2_ROUTE} style={{ color: '#c4b5fd', textDecoration: 'underline', fontFamily: 'inherit' }}>
                            mök2
                          </Link>
                        )}
                        {' · '}
                        {onNavigate ? (
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={() => navigate(MARKETING_OEK2_PAGE)}
                            onKeyDown={e => e.key === 'Enter' && navigate(MARKETING_OEK2_PAGE)}
                            style={{ color: '#c4b5fd', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}
                          >
                            Marketing ök2
                          </span>
                        ) : (
                          <Link to={MARKETING_OEK2_PAGE} style={{ color: '#c4b5fd', textDecoration: 'underline', fontFamily: 'inherit' }}>
                            Marketing ök2
                          </Link>
                        )}
                      </li>
                      <li>
                        {onNavigate ? (
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={() => onNavigate('lizenzen')}
                            onKeyDown={e => e.key === 'Enter' && onNavigate('lizenzen')}
                            style={{ color: '#c4b5fd', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}
                          >
                            Lizenzen &amp; Testpilot
                          </span>
                        ) : (
                          <Link to={`${PROJECT_ROUTES['k2-galerie'].licences}#testpilot-einladen`} style={{ color: '#c4b5fd', textDecoration: 'underline', fontFamily: 'inherit' }}>
                            Lizenzen &amp; Testpilot
                          </Link>
                        )}
                      </li>
                    </ul>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(216,180,254,0.95)', fontWeight: 700, margin: '0.2rem 0 0.2rem' }}>Doku im Repo – in der APf öffnen</div>
                    <p style={{ margin: '0 0 0.35rem', fontSize: '0.65rem', lineHeight: 1.35, color: 'rgba(237,233,254,0.65)' }}>
                      Quelle: <code style={{ fontSize: '0.62rem' }}>docs/</code> · Lesen: Team-Handbuch (Spiegel)
                    </p>
                    {onNavigate ? (
                      <>
                        <button
                          type="button"
                          onClick={() => openTeamHandbuchDoc(DOC_VIDEO_PRAEMAPPE)}
                          style={{
                            width: '100%',
                            marginBottom: '0.35rem',
                            padding: '0.5rem 0.65rem',
                            background: 'rgba(91,33,182,0.25)',
                            border: '1px solid rgba(167,139,250,0.5)',
                            borderRadius: '8px',
                            color: '#e9d5ff',
                            fontWeight: 600,
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            textAlign: 'left',
                          }}
                          title="Öffnet im Smart-Panel-Kontext das Handbuch mit dieser Datei"
                        >
                          📄 Prämappe-Analyse
                          <span style={{ display: 'block', fontWeight: 400, fontSize: '0.65rem', opacity: 0.85, marginTop: '0.15rem' }}>{DOC_VIDEO_PRAEMAPPE}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openTeamHandbuchDoc(DOC_VIDEO_MATRIX)}
                          style={{
                            width: '100%',
                            padding: '0.5rem 0.65rem',
                            background: 'rgba(91,33,182,0.25)',
                            border: '1px solid rgba(167,139,250,0.5)',
                            borderRadius: '8px',
                            color: '#e9d5ff',
                            fontWeight: 600,
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            textAlign: 'left',
                          }}
                          title="Öffnet im Smart-Panel-Kontext das Handbuch mit dieser Datei"
                        >
                          📄 Matrix &amp; Drehbuch V1
                          <span style={{ display: 'block', fontWeight: 400, fontSize: '0.65rem', opacity: 0.85, marginTop: '0.15rem' }}>{DOC_VIDEO_MATRIX}</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to={apfHandbuchDocUrl(DOC_VIDEO_PRAEMAPPE)}
                          style={{
                            display: 'block',
                            marginBottom: '0.35rem',
                            padding: '0.5rem 0.65rem',
                            background: 'rgba(91,33,182,0.25)',
                            border: '1px solid rgba(167,139,250,0.5)',
                            borderRadius: '8px',
                            color: '#e9d5ff',
                            fontWeight: 600,
                            fontSize: '0.78rem',
                            textDecoration: 'none',
                            fontFamily: 'inherit',
                          }}
                        >
                          📄 Prämappe-Analyse
                        </Link>
                        <Link
                          to={apfHandbuchDocUrl(DOC_VIDEO_MATRIX)}
                          style={{
                            display: 'block',
                            padding: '0.5rem 0.65rem',
                            background: 'rgba(91,33,182,0.25)',
                            border: '1px solid rgba(167,139,250,0.5)',
                            borderRadius: '8px',
                            color: '#e9d5ff',
                            fontWeight: 600,
                            fontSize: '0.78rem',
                            textDecoration: 'none',
                            fontFamily: 'inherit',
                          }}
                        >
                          📄 Matrix &amp; Drehbuch V1
                        </Link>
                      </>
                    )}
                  </>
                )}
                {mappe.id === 'galerie' && (
                  <>
                    {onNavigate ? (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={() => onNavigate('mission-control')}
                        onKeyDown={e => e.key === 'Enter' && onNavigate('mission-control')}
                        style={{ display: 'block', padding: '0.65rem 0.85rem', background: 'linear-gradient(135deg, rgba(129,140,248,0.2), rgba(99,102,241,0.12))', border: '1px solid rgba(129,140,248,0.4)', borderRadius: '8px', color: '#a5b4fc', fontWeight: 600, fontSize: '0.88rem', textAlign: 'center', cursor: 'pointer', fontFamily: 'inherit' }}
                      >
                        🚀 Mission Control
                      </span>
                    ) : (
                      <Link to={PLATFORM_ROUTES.missionControl} style={{ display: 'block', padding: '0.65rem 0.85rem', background: 'linear-gradient(135deg, rgba(129,140,248,0.2), rgba(99,102,241,0.12))', border: '1px solid rgba(129,140,248,0.4)', borderRadius: '8px', color: '#a5b4fc', fontWeight: 600, fontSize: '0.88rem', textAlign: 'center', textDecoration: 'none', fontFamily: 'inherit' }}>
                        🚀 Mission Control
                      </Link>
                    )}
                    {items.map(item => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {onNavigate ? (
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={() => onNavigate(item.page)}
                            onKeyDown={e => e.key === 'Enter' && onNavigate(item.page)}
                            style={{
                              flex: 1,
                              padding: '0.65rem 0.85rem',
                              background: item.color,
                              border: `1px solid ${item.border}`,
                              borderRadius: '8px',
                              color: item.id === 'uebersicht' ? '#2dd4bf' : item.id === 'lizenzen' ? '#f59e0b' : item.id === 'oek2' ? '#5ffbf1' : item.id === 'mok2' ? '#fbbf24' : '#ff8c42',
                              fontWeight: 600,
                              fontSize: '0.88rem',
                              textAlign: 'center',
                              cursor: 'pointer',
                              fontFamily: 'inherit',
                              display: 'block',
                            }}
                          >
                            {item.label}
                          </span>
                        ) : (
                          <Link
                            to={item.url}
                            style={{
                              flex: 1,
                              padding: '0.65rem 0.85rem',
                              background: item.color,
                              border: `1px solid ${item.border}`,
                              borderRadius: '8px',
                              color: item.id === 'uebersicht' ? '#2dd4bf' : item.id === 'lizenzen' ? '#f59e0b' : item.id === 'oek2' ? '#5ffbf1' : item.id === 'mok2' ? '#fbbf24' : '#ff8c42',
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
                        )}
                      </div>
                    ))}
                    {onNavigate ? (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={() => onNavigate('handbuch-galerie')}
                        onKeyDown={e => e.key === 'Enter' && onNavigate('handbuch-galerie')}
                        style={{ display: 'block', padding: '0.55rem 0.75rem', background: 'rgba(95,251,241,0.08)', border: '1px solid rgba(95,251,241,0.2)', borderRadius: '8px', color: '#5ffbf1', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}
                      >
                        🧠 Handbuch (K2 Galerie)
                      </span>
                    ) : (
                      <Link to="/k2-galerie-handbuch" style={{ display: 'block', padding: '0.55rem 0.75rem', background: 'rgba(95,251,241,0.08)', border: '1px solid rgba(95,251,241,0.2)', borderRadius: '8px', color: '#5ffbf1', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', fontFamily: 'inherit' }}>
                        🧠 Handbuch (K2 Galerie)
                      </Link>
                    )}
                    <div style={{ marginTop: '0.6rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(196,181,253,0.25)' }}>
                      <div style={{ fontSize: '0.8rem', color: 'rgba(196,181,253,0.95)', fontWeight: 700, marginBottom: '0.4rem' }}>Praktisch</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <Link to="/zettel-pilot-form" style={{ display: 'block', padding: '0.6rem 0.85rem', background: 'linear-gradient(120deg, rgba(245,158,11,0.28), rgba(217,119,6,0.2))', border: '1px solid rgba(245,158,11,0.5)', borderRadius: '8px', color: '#fbbf24', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', fontFamily: 'inherit' }} title="Zettel mit neuen Codes drucken (ök2 oder VK2): Nr., Name, Pilot-URL eintragen → Zettel anzeigen → drucken. Ablauf kontrolliert und wiederholbar.">
                          ✈️ Neuer Test-Pilot
                        </Link>
                        <Link to={PROJECT_ROUTES['k2-galerie'].testuserMappe} style={{ display: 'block', padding: '0.55rem 0.75rem', background: 'linear-gradient(120deg, rgba(13,148,136,0.22), rgba(15,118,110,0.14))', border: '1px solid rgba(13,148,136,0.45)', borderRadius: '8px', color: '#5eead4', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none', fontFamily: 'inherit' }} title="Testuser-Mappe: Dokumente, Anmeldung, Katalog">
                          📂 Testuser-Mappe
                        </Link>
                        <Link to={`${PROJECT_ROUTES['k2-galerie'].texteSchreibtisch}`} style={{ display: 'block', padding: '0.5rem 0.75rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.28)', borderRadius: '8px', color: 'rgba(253,230,138,0.95)', fontWeight: 600, fontSize: '0.78rem', textDecoration: 'none', fontFamily: 'inherit' }} title="Zettel Pilot & Testuser auf dem Texte-Schreibtisch">
                          🪑 Zettel auf dem Texte-Schreibtisch
                        </Link>
                      </div>
                    </div>
                    <button type="button" onClick={startFremderModus} style={{ width: '100%', padding: '0.6rem 0.85rem', background: 'linear-gradient(135deg, rgba(255,140,66,0.18), rgba(181,74,30,0.12))', border: '1px solid rgba(255,140,66,0.5)', borderRadius: '8px', color: '#ff8c42', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem' }} title="Landingpage wie ein Erstbesucher">
                      <span>👤</span><span>Als Fremder eintreten</span>
                    </button>
                  </>
                )}
                {mappe.id === 'k2-markt' && (
                  <>
                    {items.map(item => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {onNavigate ? (
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={() => onNavigate(item.page)}
                            onKeyDown={e => e.key === 'Enter' && onNavigate(item.page)}
                            style={{
                              flex: 1,
                              padding: '0.65rem 0.85rem',
                              background: item.color,
                              border: `1px solid ${item.border}`,
                              borderRadius: '8px',
                              color: '#22c55e',
                              fontWeight: 600,
                              fontSize: '0.88rem',
                              textAlign: 'center',
                              cursor: 'pointer',
                              fontFamily: 'inherit',
                              display: 'block',
                            }}
                          >
                            {item.label}
                          </span>
                        ) : (
                          <Link
                            to={item.url}
                            style={{
                              flex: 1,
                              padding: '0.65rem 0.85rem',
                              background: item.color,
                              border: `1px solid ${item.border}`,
                              borderRadius: '8px',
                              color: '#22c55e',
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
                        )}
                      </div>
                    ))}
                  </>
                )}
                {mappe.id === 'k2-welt-strategie-mappe' && (
                  <>
                    <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.45 }}>
                      Strategisches Gesamtbild (ök2, VK2, K2 Familie) – <strong style={{ color: 'rgba(255,255,255,0.75)' }}>nicht</strong> Vertriebstexte in mök2.
                    </p>
                    {items.map(item => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {onNavigate ? (
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={() => onNavigate(item.page)}
                            onKeyDown={e => e.key === 'Enter' && onNavigate(item.page)}
                            style={{
                              flex: 1,
                              padding: '0.65rem 0.85rem',
                              background: item.color,
                              border: `1px solid ${item.border}`,
                              borderRadius: '8px',
                              color: '#a5b4fc',
                              fontWeight: 600,
                              fontSize: '0.88rem',
                              textAlign: 'center',
                              cursor: 'pointer',
                              fontFamily: 'inherit',
                              display: 'block',
                            }}
                          >
                            {item.label}
                          </span>
                        ) : (
                          <Link
                            to={item.url}
                            style={{
                              flex: 1,
                              padding: '0.65rem 0.85rem',
                              background: item.color,
                              border: `1px solid ${item.border}`,
                              borderRadius: '8px',
                              color: '#a5b4fc',
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
                        )}
                      </div>
                    ))}
                  </>
                )}
                {mappe.id === 'familie' && (
                  <>
                    <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>Eigenes Projekt – keine Ausgrenzung, Respekt für jeden.</p>
                    {onNavigate ? (
                      <span role="button" tabIndex={0} onClick={() => onNavigate('k2-familie')} onKeyDown={(e) => e.key === 'Enter' && onNavigate('k2-familie')}
                        style={{ display: 'block', padding: '0.55rem 0.75rem', background: 'rgba(13,148,136,0.15)', border: '1px solid rgba(13,148,136,0.4)', borderRadius: '8px', color: '#14b8a6', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                        → Zur Startseite (erste Seite)
                      </span>
                    ) : (
                      <Link to={K2_FAMILIE_HOME} style={{ display: 'block', padding: '0.55rem 0.75rem', background: 'rgba(13,148,136,0.15)', border: '1px solid rgba(13,148,136,0.4)', borderRadius: '8px', color: '#14b8a6', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', fontFamily: 'inherit' }}>
                        → Zur Startseite (erste Seite)
                      </Link>
                    )}
                    {onNavigate ? (
                      <span role="button" tabIndex={0} onClick={() => onNavigate('k2-familie-handbuch')} onKeyDown={e => e.key === 'Enter' && onNavigate('k2-familie-handbuch')}
                        style={{ display: 'block', padding: '0.5rem 0.7rem', background: 'rgba(13,148,136,0.08)', border: '1px solid rgba(13,148,136,0.3)', borderRadius: '8px', color: '#14b8a6', fontWeight: 500, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                        📖 Benutzerhandbuch (lesen)
                      </span>
                    ) : (
                      <Link to={PROJECT_ROUTES['k2-familie'].benutzerHandbuch} style={{ display: 'block', padding: '0.5rem 0.7rem', background: 'rgba(13,148,136,0.08)', border: '1px solid rgba(13,148,136,0.3)', borderRadius: '8px', color: '#14b8a6', fontWeight: 500, fontSize: '0.82rem', textDecoration: 'none', fontFamily: 'inherit' }}>
                        📖 Benutzerhandbuch (lesen)
                      </Link>
                    )}
                    {onNavigate ? (
                      <span role="button" tabIndex={0} onClick={() => onNavigate('k2-familie-doku')} onKeyDown={e => e.key === 'Enter' && onNavigate('k2-familie-doku')}
                        style={{ display: 'block', padding: '0.5rem 0.7rem', background: 'rgba(13,148,136,0.12)', border: '1px solid rgba(13,148,136,0.38)', borderRadius: '8px', color: '#14b8a6', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                        🗂️ Doku & Entwicklung (alle K2-FAMILIE-*.md)
                      </span>
                    ) : (
                      <Link to={PROJECT_ROUTES['k2-familie'].entwicklungDoku} style={{ display: 'block', padding: '0.5rem 0.7rem', background: 'rgba(13,148,136,0.12)', border: '1px solid rgba(13,148,136,0.38)', borderRadius: '8px', color: '#14b8a6', fontWeight: 600, fontSize: '0.82rem', textDecoration: 'none', fontFamily: 'inherit' }}>
                        🗂️ Doku & Entwicklung (alle K2-FAMILIE-*.md)
                      </Link>
                    )}
                  </>
                )}
                {mappe.id === 'notizen' && (
                  <>
                    {onNavigate ? (
                      <span role="button" tabIndex={0} onClick={() => onNavigate('notizen')} onKeyDown={e => e.key === 'Enter' && onNavigate('notizen')}
                        style={{ display: 'block', padding: '0.55rem 0.75rem', background: 'rgba(196,181,253,0.12)', border: '1px solid rgba(196,181,253,0.3)', borderRadius: '8px', color: '#c4b5fd', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                        📝 Notizen
                      </span>
                    ) : (
                      <Link to={PROJECT_ROUTES['k2-galerie'].notizen} style={{ display: 'block', padding: '0.55rem 0.75rem', background: 'rgba(196,181,253,0.12)', border: '1px solid rgba(196,181,253,0.3)', borderRadius: '8px', color: '#c4b5fd', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', fontFamily: 'inherit' }}>
                        📝 Notizen
                      </Link>
                    )}
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
                    {onNavigate ? (
                      <span role="button" tabIndex={0} onClick={() => onNavigate('handbuch')} onKeyDown={e => e.key === 'Enter' && onNavigate('handbuch')}
                        style={{ display: 'block', width: '100%', padding: '0.55rem 0.75rem', marginBottom: '0.4rem', background: 'rgba(95,251,241,0.1)', border: '1px solid rgba(95,251,241,0.3)', borderRadius: '8px', color: '#5ffbf1', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center', boxSizing: 'border-box' }}>
                        🧠 Team-Handbuch (Vermächtnis)
                      </span>
                    ) : (
                      <Link to="/k2team-handbuch" style={{ display: 'block', width: '100%', padding: '0.55rem 0.75rem', marginBottom: '0.4rem', background: 'rgba(95,251,241,0.1)', border: '1px solid rgba(95,251,241,0.3)', borderRadius: '8px', color: '#5ffbf1', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', fontFamily: 'inherit', textAlign: 'center', boxSizing: 'border-box' }}>🧠 Team-Handbuch (Vermächtnis)</Link>
                    )}
                    <p style={{ margin: '0.35rem 0 0', fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)' }}>Texte-Schreibtisch &amp; Kompass: oben unter „Schnellzugriff“.</p>
                    <button type="button" onClick={() => openTeamHandbuchDoc(HANDBUCH_DOC_ZENTRALE_THEMEN)} style={{ width: '100%', padding: '0.5rem 0.7rem', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)', borderRadius: '6px', color: '#86efac', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}>📌 Zentrale Themen</button>
                    <button type="button" onClick={() => openTeamHandbuchDoc(HANDBUCH_DOC_NOTFALL)} style={{ width: '100%', padding: '0.5rem 0.7rem', marginTop: '0.35rem', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '6px', color: '#fca5a5', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}>🚨 Notfall-Checkliste</button>
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

      {/* Rückmeldungen: Ideen/Wünsche + Probleme (API /admin „Idee? Wunsch?“ / „Probleme“) */}
      <div style={{ borderBottom: '1px solid rgba(95,251,241,0.12)', paddingBottom: '1rem' }}>
        <button
          type="button"
          onClick={toggleWuensche}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: wuenscheOpen ? '0.6rem' : 0,
            padding: '0.5rem 0',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            textAlign: 'left',
          }}
        >
          <h4 style={{ margin: 0, fontSize: '0.88rem', color: '#fbbf24', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {newCount > 0 && (
              <span style={{ background: '#b54a1e', color: '#fff', borderRadius: '50%', minWidth: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, padding: '0 0.25rem' }}>{newCount}</span>
            )}
            💬 Rückmeldungen
          </h4>
          <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>{wuenscheOpen ? '▼' : '▶'}</span>
        </button>
        {wuenscheOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {wishesLoading ? (
              <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>Lade …</div>
            ) : wishes.length === 0 ? (
              <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)' }}>Noch keine Rückmeldungen.</div>
            ) : (
              wishes.map(w => {
                const isProblem = w.kind === 'problem'
                return (
                  <div
                    key={w.id}
                    style={{
                      background: isProblem ? 'rgba(239,68,68,0.08)' : 'rgba(251,191,36,0.07)',
                      border: isProblem ? '1px solid rgba(239,68,68,0.28)' : '1px solid rgba(251,191,36,0.2)',
                      borderRadius: '8px',
                      padding: '0.6rem 0.75rem',
                    }}
                  >
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: isProblem ? '#fca5a5' : '#fcd34d', marginBottom: '0.35rem', letterSpacing: '0.02em' }}>
                      {isProblem ? '⚠️ Problem' : '💡 Idee / Wunsch'}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#fff8f0', lineHeight: 1.5 }}>{w.text}</div>
                    <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.25rem' }}>
                      {new Date(w.createdAt).toLocaleString('de-AT', { dateStyle: 'short', timeStyle: 'short' })}
                      {w.source ? ` · ${w.source}` : ''}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

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
