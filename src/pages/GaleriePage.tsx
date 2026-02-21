import React, { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import QRCode from 'qrcode'
import { PROJECT_ROUTES, WILLKOMMEN_NAME_KEY, WILLKOMMEN_ENTWURF_KEY } from '../config/navigation'
import { TENANT_CONFIGS, MUSTER_TEXTE, MUSTER_EVENTS, MUSTER_VITA_MARTINA, MUSTER_VITA_GEORG, K2_STAMMDATEN_DEFAULTS, PRODUCT_BRAND_NAME, PRODUCT_COPYRIGHT, OEK2_WILLKOMMEN_IMAGES, OEK2_PLACEHOLDER_IMAGE } from '../config/tenantConfig'
import { buildVitaDocumentHtml } from '../utils/vitaDocument'
import { getGalerieImages, getPageContentGalerie } from '../config/pageContentGalerie'
import { getPageTexts, type GaleriePageTexts } from '../config/pageTexts'
import { appendToHistory } from '../utils/artworkHistory'
import { buildQrUrlWithBust, useServerBuildTimestamp, useQrVersionTimestamp } from '../hooks/useServerBuildTimestamp'
import { OK2_THEME } from '../config/ok2Theme'
import '../App.css'

/** SessionStorage: Willkommens-Fenster auf Galerieseite (QR-Einstieg) schon gesehen */
const KEY_GALERIE_WELCOME_SEEN = 'k2-galerie-welcome-seen'

/** Fallback-URL für Aktualisierung in anderem Netzwerk (z. B. zuerst Mac-WLAN, dann Mobilfunk) */
const GALLERY_DATA_PUBLIC_URL = 'https://k2-galerie.vercel.app'

/** Testphase: neue Kunden haben 2 Wochen Admin-Zugang ohne Passwort; danach oder für Wiederkehr Passwort nötig */
const ADMIN_TESTPHASE_DAYS = 14
const ADMIN_TESTPHASE_MS = ADMIN_TESTPHASE_DAYS * 24 * 60 * 60 * 1000
const KEY_FIRST_VISIT_K2 = 'k2-admin-first-visit'
const KEY_FIRST_VISIT_OEF = 'k2-oeffentlich-admin-first-visit'
const KEY_OEF_ADMIN_PASSWORD = 'k2-oeffentlich-admin-password'
const KEY_OEF_ADMIN_EMAIL = 'k2-oeffentlich-admin-email'
const KEY_OEF_ADMIN_PHONE = 'k2-oeffentlich-admin-phone'
/** K2 im Internet – gleiche Seite, funktioniert in jedem WLAN/Mobilfunk */
function getK2PublicPageUrl(): string {
  if (typeof window === 'undefined') return 'https://k2-galerie.vercel.app/projects/k2-galerie/galerie'
  return GALLERY_DATA_PUBLIC_URL + window.location.pathname
}

function isLocalOrPrivateOrigin(): boolean {
  if (typeof window === 'undefined') return false
  const h = window.location.hostname
  return h === 'localhost' || h === '127.0.0.1' || h.startsWith('192.168.') || h.startsWith('10.')
}

/** Artworks-Key je nach Kontext (K2, ök2, VK2). */
function getArtworksStorageKey(musterOnly: boolean, vk2: boolean): string {
  if (vk2) return 'k2-vk2-artworks'
  if (musterOnly) return 'k2-oeffentlich-artworks'
  return 'k2-artworks'
}

/** Erkennt VK2-Werke (aus Vereinsplattform/Mitgliederverzeichnis) – gehören nicht in K2-Galerie. */
function isVk2Artwork(a: any): boolean {
  if (!a) return false
  const num = a.number != null ? String(a.number) : ''
  const id = a.id != null ? String(a.id) : ''
  return num.startsWith('VK2-') || id.startsWith('vk2-seed-')
}

/** Erkennt Musterwerke (nur an id muster-*) – nur für ök2. Nicht nach Nummer filtern, sonst gehen echte Werke verloren. */
function isMusterArtwork(a: any): boolean {
  if (!a) return false
  const id = a.id != null ? String(a.id) : ''
  return id.startsWith('muster-')
}

/** Entfernt VK2- und Musterwerke aus einer Liste (nur für k2-artworks). */
function filterK2ArtworksOnly(artworks: any[]): any[] {
  if (!Array.isArray(artworks)) return []
  return artworks.filter((a: any) => !isVk2Artwork(a) && !isMusterArtwork(a))
}

/** Liste für Speichern in k2-artworks: VK2-Werke rausfiltern, sonst unverändert. */
function artworksToSave(key: string, list: any[]): any[] {
  return key === 'k2-artworks' ? filterK2ArtworksOnly(list) : list
}

/** Verhindert Absturz bei kaputtem localStorage (z. B. nach Druck/Teilen). K2: filtert VK2-Werke raus. */
function safeParseArtworks(storageKey: string = 'k2-artworks'): any[] {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    const list = Array.isArray(parsed) ? parsed : []
    if (storageKey === 'k2-artworks') {
      const filtered = filterK2ArtworksOnly(list)
      if (filtered.length < list.length) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(filtered))
          window.dispatchEvent(new CustomEvent('artworks-updated', { detail: { count: filtered.length, fromGaleriePage: true } }))
        } catch (_) {}
        return filtered
      }
      return filtered
    }
    return list
  } catch {
    return []
  }
}

/** Nächste/geplante Events aus k2-events laden (Datum oder Enddatum >= heute), sortiert, max. 5 */
function getUpcomingEvents(): any[] {
  try {
    const raw = localStorage.getItem('k2-events')
    if (!raw) return []
    const list = JSON.parse(raw)
    if (!Array.isArray(list)) return []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const upcoming = list.filter((e: any) => {
      if (!e || !e.date) return false
      const end = e.endDate ? new Date(e.endDate) : new Date(e.date)
      end.setHours(23, 59, 59, 999)
      return end >= today
    })
    upcoming.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    return upcoming.slice(0, 5)
  } catch {
    return []
  }
}

/** ök2: Nächste Events aus k2-oeffentlich-events; wenn leer, MUSTER_EVENTS (Vernissage etc.). */
function getUpcomingEventsOeffentlich(): any[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('k2-oeffentlich-events') : null
    if (raw && raw.trim()) {
      const list = JSON.parse(raw)
      if (Array.isArray(list) && list.length > 0) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const upcoming = list.filter((e: any) => {
          if (!e || !e.date) return false
          const end = e.endDate ? new Date(e.endDate) : new Date(e.date)
          end.setHours(23, 59, 59, 999)
          return end >= today
        })
        upcoming.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
        return upcoming.slice(0, 5)
      }
    }
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const fromMuster = MUSTER_EVENTS.filter((e: any) => {
      if (!e || !e.date) return false
      const end = e.endDate ? new Date(e.endDate) : new Date(e.date)
      end.setHours(23, 59, 59, 999)
      return end >= today
    })
    fromMuster.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    return fromMuster.slice(0, 5)
  } catch {
    return MUSTER_EVENTS.slice(0, 5)
  }
}

/** VK2: Events aus k2-vk2-events, fallback k2-events. */
function getUpcomingEventsVk2(): any[] {
  try {
    const raw = localStorage.getItem('k2-vk2-events') || localStorage.getItem('k2-events')
    if (!raw) return []
    const list = JSON.parse(raw)
    if (!Array.isArray(list)) return []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const upcoming = list.filter((e: any) => {
      if (!e || !e.date) return false
      const end = e.endDate ? new Date(e.endDate) : new Date(e.date)
      end.setHours(23, 59, 59, 999)
      return end >= today
    })
    upcoming.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    return upcoming.slice(0, 8)
  } catch {
    return []
  }
}

/** Event-Datum für Anzeige formatieren (z. B. "24. April 2025" oder "24.–26. April 2025") */
function formatEventDateRange(dateStr: string, endDateStr?: string): string {
  try {
    const d = new Date(dateStr)
    const toDe = (x: Date) => x.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })
    if (!endDateStr || endDateStr === dateStr) return toDe(d)
    const end = new Date(endDateStr)
    if (d.getMonth() === end.getMonth() && d.getFullYear() === end.getFullYear()) {
      return `${d.getDate()}.–${end.getDate()}. ${end.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}`
    }
    return `${toDe(d)} – ${toDe(end)}`
  } catch {
    return ''
  }
}

/** Event-Dokument in neuem Fenster öffnen (PDF/Bild/HTML/Download) */
function openEventDocument(doc: { name?: string; fileData?: string; fileName?: string; fileType?: string }) {
  if (!doc?.fileData) return
  const w = window.open()
  if (!w) return
  const isPdf = doc.fileType?.includes('pdf')
  const isImage = doc.fileType?.includes('image')
  const isHtml = doc.fileType?.includes('html') || (typeof doc.fileData === 'string' && doc.fileData.startsWith('data:text/html'))
  const safeTitle = (doc.name || doc.fileName || 'Dokument').replace(/</g, '&lt;')
  if (isHtml) {
    w.location.href = doc.fileData
    return
  }
  w.document.write(`
    <!DOCTYPE html><html><head><title>${safeTitle}</title></head>
    <body style="margin:0;padding:20px;background:#f5f5f5;">
      ${isPdf ? `<iframe src="${doc.fileData}" style="width:100%;height:100vh;border:none;"></iframe>` : isImage ? `<img src="${doc.fileData}" alt="" style="max-width:100%;height:auto;" />` : `<a href="${doc.fileData}" download="${(doc.fileName || '').replace(/</g, '&lt;')}">Download: ${safeTitle}</a>`}
    </body></html>
  `)
  w.document.close()
}

/** Altes Blau-Theme? Dann K2-Orange verwenden (gespeicherte Design-Werte können altes Blau sein). */
const K2_ORANGE = {
  backgroundColor1: '#1a0f0a',
  backgroundColor2: '#2d1a14',
  backgroundColor3: '#3d2419',
  textColor: '#fff5f0',
  mutedColor: '#d4a574',
  accentColor: '#ff8c42',
  cardBg1: 'rgba(45, 26, 20, 0.95)',
  cardBg2: 'rgba(26, 15, 10, 0.92)'
}
const OLD_BLUE_BG = ['#0a0e27', '#03040a', '#1a1f3a', '#0d1426', '#111c33', '#0f1419']
const OLD_CYAN_ACCENT = ['#5ffbf1', '#33a1ff', '#667eea', '#764ba2', '#b8b8ff', '#8fa0c9']
/** Blau/Cyan-Hex-Muster (Teilstring), damit auch abweichende gespeicherte Werte erkannt werden */
const BLUE_BG_PATTERNS = ['0a0e', '1a1f', '0d14', '111c', '0304', '0f14', '1426', '0e27', '1f3a', '0a0f', '1a2a']
const BLUE_ACCENT_PATTERNS = ['5ff', '33a', '667', '764', 'b8b', '8fa', 'a1f', 'eea', 'bfb', '1ff', '0ff', '7ee', '4ba2', 'c4e', 'add8e6', '87ceeb', '00bfff', '1e90ff']
function isOldBlueTheme(design: Record<string, string>): boolean {
  if (!design || typeof design !== 'object') return true
  const norm = (s: string) => (s || '').toLowerCase().trim().replace(/\s/g, '')
  const bg1 = norm(design.backgroundColor1)
  const bg2 = norm(design.backgroundColor2)
  const accent = norm(design.accentColor)
  if (OLD_BLUE_BG.some(b => b === bg1 || b === bg2)) return true
  if (OLD_CYAN_ACCENT.some(c => c === accent)) return true
  if (BLUE_BG_PATTERNS.some(p => bg1.includes(p) || bg2.includes(p))) return true
  if (BLUE_ACCENT_PATTERNS.some(p => accent.includes(p))) return true
  return false
}

/** Prüft ob die aktuell gesetzte Akzentfarbe blau/cyan ist – Fallback für Cache/ältere Daten */
function isDocumentStillBlue(): boolean {
  try {
    const accent = (getComputedStyle(document.documentElement).getPropertyValue('--k2-accent') || '').trim().toLowerCase()
    if (!accent) return false
    return OLD_CYAN_ACCENT.some(c => c === accent) || BLUE_ACCENT_PATTERNS.some(p => accent.includes(p))
  } catch { return false }
}

/** Design-Farben auf die Seite anwenden (CSS-Variablen) – für Kundenansicht aus gallery-data.json oder localStorage */
function applyDesignToDocument(design: Record<string, string> | null | undefined) {
  if (!design || typeof design !== 'object') return
  try {
    const root = document.documentElement
    const use = isOldBlueTheme(design) ? K2_ORANGE : design
    if (use.accentColor) root.style.setProperty('--k2-accent', use.accentColor)
    if (use.backgroundColor1) root.style.setProperty('--k2-bg-1', use.backgroundColor1)
    if (use.backgroundColor2) root.style.setProperty('--k2-bg-2', use.backgroundColor2)
    if (use.backgroundColor3) root.style.setProperty('--k2-bg-3', use.backgroundColor3)
    if (use.textColor) root.style.setProperty('--k2-text', use.textColor)
    if (use.mutedColor) root.style.setProperty('--k2-muted', use.mutedColor)
    if (use.cardBg1) root.style.setProperty('--k2-card-bg-1', use.cardBg1)
    if (use.cardBg2) root.style.setProperty('--k2-card-bg-2', use.cardBg2)
    if (isDocumentStillBlue()) {
      root.style.setProperty('--k2-accent', K2_ORANGE.accentColor)
      root.style.setProperty('--k2-bg-1', K2_ORANGE.backgroundColor1)
      root.style.setProperty('--k2-bg-2', K2_ORANGE.backgroundColor2)
      root.style.setProperty('--k2-bg-3', K2_ORANGE.backgroundColor3)
      root.style.setProperty('--k2-text', K2_ORANGE.textColor)
      root.style.setProperty('--k2-muted', K2_ORANGE.mutedColor)
      root.style.setProperty('--k2-card-bg-1', K2_ORANGE.cardBg1)
      root.style.setProperty('--k2-card-bg-2', K2_ORANGE.cardBg2)
    }
  } catch (_) {}
}

const GaleriePage = ({ scrollToSection, musterOnly = false, vk2 = false }: { scrollToSection?: string; musterOnly?: boolean; vk2?: boolean }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const artworksKey = getArtworksStorageKey(musterOnly, vk2)
  // K2 / ök2 / VK2: getrennte Daten, keine Vermischung
  const tenantConfig = vk2 ? TENANT_CONFIGS.vk2 : musterOnly ? TENANT_CONFIGS.oeffentlich : TENANT_CONFIGS.k2
  const tenantId = vk2 ? 'vk2' : musterOnly ? 'oeffentlich' : 'k2'
  const isVorschauModusEarly = typeof window !== 'undefined' && new URLSearchParams(location.search).get('vorschau') === '1'
  // K2/ök2/VK2: Immer mit Tenant – nie K2-Texte auf ök2 oder VK2
  const pageTextsTenant = vk2 ? 'vk2' : musterOnly ? 'oeffentlich' : undefined
  const defaultGalerieTexts = useMemo(() => getPageTexts(pageTextsTenant).galerie, [pageTextsTenant])
  const [vorschauGalerieTexts, setVorschauGalerieTexts] = useState<GaleriePageTexts | null>(null)
  useEffect(() => {
    if (isVorschauModusEarly) setVorschauGalerieTexts(getPageTexts(pageTextsTenant).galerie)
  }, [isVorschauModusEarly, pageTextsTenant])
  const galerieTexts = (isVorschauModusEarly && vorschauGalerieTexts) ? vorschauGalerieTexts : defaultGalerieTexts
  const willkommenRef = React.useRef<HTMLDivElement>(null)
  const galerieRef = React.useRef<HTMLDivElement>(null)
  const kunstschaffendeRef = React.useRef<HTMLDivElement>(null)
  const [mobileUrl, setMobileUrl] = React.useState<string>('')
  // Willkommens-Fenster (nur öffentliche Galerie): nur auf Mobilgeräten (QR-Einstieg). Am Mac/Desktop direkt rein wie lizenzierter Benutzer.
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [welcomeName, setWelcomeName] = useState('')
  useEffect(() => {
    if (!musterOnly) return
    try {
      const isMobile = window.innerWidth <= 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      if (isMobile && !sessionStorage.getItem(KEY_GALERIE_WELCOME_SEEN)) setShowWelcomeModal(true)
    } catch (_) {}
  }, [musterOnly])
  const closeWelcomeNurUmschauen = () => {
    try { sessionStorage.setItem(KEY_GALERIE_WELCOME_SEEN, '1') } catch (_) {}
    setShowWelcomeModal(false)
  }
  const goVorschauEntwurf = () => {
    const n = welcomeName.trim()
    if (n) {
      try {
        sessionStorage.setItem(WILLKOMMEN_NAME_KEY, n)
        sessionStorage.setItem(WILLKOMMEN_ENTWURF_KEY, '1')
      } catch (_) {}
    }
    try { sessionStorage.setItem(KEY_GALERIE_WELCOME_SEEN, '1') } catch (_) {}
    setShowWelcomeModal(false)
    navigate(PROJECT_ROUTES['k2-galerie'].galerieOeffentlichVorschau)
  }
  // Mobile-Erkennung: Prüfe sowohl Bildschirmbreite als auch User-Agent
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    const width = window.innerWidth <= 768
    const userAgent = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    return width || userAgent
  })
  
  // Mobile-Erkennung für CSS - wird bei jedem Render neu geprüft
  const isMobileDevice = React.useMemo(() => {
    if (typeof window === 'undefined') return false
    const width = window.innerWidth <= 768
    const userAgent = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    return width || userAgent
  }, [])
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [adminPasswordInput, setAdminPasswordInput] = useState('')
  const [rememberAdmin, setRememberAdmin] = useState(() => {
    try { return (localStorage.getItem('k2-admin-unlocked') === 'k2') } catch { return false }
  })
  const [vercelQrDataUrl, setVercelQrDataUrl] = useState('')
  // adminPassword wird nur für Initialisierung verwendet, nicht für Login-Validierung
  const [, setAdminPassword] = useState('')
  // Testphase + Passwort setzen / vergessen
  const [showSetPassword, setShowSetPassword] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [setPasswordEmail, setSetPasswordEmail] = useState('')
  const [setPasswordPhone, setSetPasswordPhone] = useState('')
  const [setPasswordNew, setSetPasswordNew] = useState('')
  const [setPasswordConfirm, setSetPasswordConfirm] = useState('')
  const [forgotEmailOrPhone, setForgotEmailOrPhone] = useState('')
  const [forgotSent, setForgotSent] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth <= 768
      const userAgent = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      setIsMobile(width || userAgent)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Design-Farben aus Admin anwenden – altes Blau-Theme wird automatisch auf K2-Orange umgestellt und migriert
  const applyDesignFromStorage = React.useCallback(() => {
    try {
      const stored = localStorage.getItem('k2-design-settings')
      if (!stored || stored.length > 50000) return
      const design = JSON.parse(stored) as Record<string, string>
      const root = document.documentElement
      let use = design
      if (isOldBlueTheme(design)) {
        use = K2_ORANGE
        localStorage.setItem('k2-design-settings', JSON.stringify(K2_ORANGE))
      }
      if (use.accentColor) root.style.setProperty('--k2-accent', use.accentColor)
      if (use.backgroundColor1) root.style.setProperty('--k2-bg-1', use.backgroundColor1)
      if (use.backgroundColor2) root.style.setProperty('--k2-bg-2', use.backgroundColor2)
      if (use.backgroundColor3) root.style.setProperty('--k2-bg-3', use.backgroundColor3)
      if (use.textColor) root.style.setProperty('--k2-text', use.textColor)
      if (use.mutedColor) root.style.setProperty('--k2-muted', use.mutedColor)
      if (use.cardBg1) root.style.setProperty('--k2-card-bg-1', use.cardBg1)
      if (use.cardBg2) root.style.setProperty('--k2-card-bg-2', use.cardBg2)
      if (isDocumentStillBlue()) {
        root.style.setProperty('--k2-accent', K2_ORANGE.accentColor)
        root.style.setProperty('--k2-bg-1', K2_ORANGE.backgroundColor1)
        root.style.setProperty('--k2-bg-2', K2_ORANGE.backgroundColor2)
        root.style.setProperty('--k2-bg-3', K2_ORANGE.backgroundColor3)
        root.style.setProperty('--k2-text', K2_ORANGE.textColor)
        root.style.setProperty('--k2-muted', K2_ORANGE.mutedColor)
        root.style.setProperty('--k2-card-bg-1', K2_ORANGE.cardBg1)
        root.style.setProperty('--k2-card-bg-2', K2_ORANGE.cardBg2)
      }
    } catch (_) {}
  }, [])
  useEffect(() => {
    applyDesignFromStorage()
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'k2-design-settings') applyDesignFromStorage()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [applyDesignFromStorage])

  
  // Stammdaten laden (bei musterOnly nur Mustertexte; K2 nutzt K2_STAMMDATEN_DEFAULTS bis localStorage geladen ist)
  const [martinaData, setMartinaData] = React.useState(() =>
    musterOnly ? MUSTER_TEXTE.martina : { name: K2_STAMMDATEN_DEFAULTS.martina.name, email: K2_STAMMDATEN_DEFAULTS.martina.email, phone: K2_STAMMDATEN_DEFAULTS.martina.phone, website: K2_STAMMDATEN_DEFAULTS.martina.website || '' }
  )
  const [georgData, setGeorgData] = React.useState(() =>
    musterOnly ? MUSTER_TEXTE.georg : { name: K2_STAMMDATEN_DEFAULTS.georg.name, email: K2_STAMMDATEN_DEFAULTS.georg.email, phone: K2_STAMMDATEN_DEFAULTS.georg.phone, website: K2_STAMMDATEN_DEFAULTS.georg.website || '' }
  )
  const [galleryData, setGalleryData] = React.useState(() =>
    musterOnly ? MUSTER_TEXTE.gallery : {
      address: K2_STAMMDATEN_DEFAULTS.gallery.address,
      city: K2_STAMMDATEN_DEFAULTS.gallery.city,
      country: K2_STAMMDATEN_DEFAULTS.gallery.country,
      phone: K2_STAMMDATEN_DEFAULTS.gallery.phone,
      email: K2_STAMMDATEN_DEFAULTS.gallery.email,
      website: K2_STAMMDATEN_DEFAULTS.gallery.website,
      internetadresse: K2_STAMMDATEN_DEFAULTS.gallery.internetadresse || '',
      openingHours: K2_STAMMDATEN_DEFAULTS.gallery.openingHours,
      adminPassword: 'k2Galerie2026',
      welcomeImage: '',
      virtualTourImage: '',
      galerieCardImage: ''
    }
  )

  // Aktuelles aus Eventplanung (k2-events): anzeigen zwischen Foto und Kunstschaffende
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>(() => getUpcomingEvents())
  useEffect(() => {
    const load = () => setUpcomingEvents(getUpcomingEvents())
    load()
    window.addEventListener('storage', load)
    window.addEventListener('k2-events-updated', load)
    return () => {
      window.removeEventListener('storage', load)
      window.removeEventListener('k2-events-updated', load)
    }
  }, [])

  // ök2: Events aus k2-oeffentlich-events oder MUSTER_EVENTS (Vernissage mit Einladung)
  const [upcomingEventsOeffentlich, setUpcomingEventsOeffentlich] = useState<any[]>(() => getUpcomingEventsOeffentlich())
  useEffect(() => {
    if (!musterOnly) return
    const load = () => setUpcomingEventsOeffentlich(getUpcomingEventsOeffentlich())
    load()
    window.addEventListener('storage', load)
    window.addEventListener('k2-events-updated', load)
    return () => {
      window.removeEventListener('storage', load)
      window.removeEventListener('k2-events-updated', load)
    }
  }, [musterOnly])

  // VK2: Events (k2-vk2-events) und Willkommensbild (k2-vk2-welcomeImage)
  const [vk2UpcomingEvents, setVk2UpcomingEvents] = useState<any[]>(() => getUpcomingEventsVk2())
  const [vk2WelcomeImage, setVk2WelcomeImage] = useState(() => {
    try {
      const v = typeof window !== 'undefined' ? localStorage.getItem('k2-vk2-welcomeImage') : null
      return (v && v.trim()) || ''
    } catch { return '' }
  })
  useEffect(() => {
    if (!vk2) return
    const loadEvents = () => setVk2UpcomingEvents(getUpcomingEventsVk2())
    loadEvents()
    window.addEventListener('storage', loadEvents)
    window.addEventListener('k2-events-updated', loadEvents)
    const loadImage = () => {
      try {
        const v = localStorage.getItem('k2-vk2-welcomeImage')
        setVk2WelcomeImage((v && v.trim()) || '')
      } catch (_) {}
    }
    loadImage()
    const onStorageImage = (e: StorageEvent) => { if (e.key === 'k2-vk2-welcomeImage') loadImage() }
    window.addEventListener('storage', onStorageImage)
    return () => {
      window.removeEventListener('storage', loadEvents)
      window.removeEventListener('k2-events-updated', loadEvents)
      window.removeEventListener('storage', onStorageImage)
    }
  }, [vk2])

  // ök2: Stammdaten immer auf Musterdaten halten (auch bei Navigation von normaler Galerie)
  React.useEffect(() => {
    if (musterOnly) {
      setMartinaData({ ...MUSTER_TEXTE.martina })
      setGeorgData({ ...MUSTER_TEXTE.georg })
      setGalleryData({ ...MUSTER_TEXTE.gallery })
    }
  }, [musterOnly])

  // ök2: Zuerst Bilder aus localStorage (von mök2 reinziehen), sonst galleryData / OEK2_WILLKOMMEN_IMAGES
  const [oefImagesVersion, setOefImagesVersion] = useState(0)
  useEffect(() => {
    if (!musterOnly) return
    const onUpdate = () => setOefImagesVersion((v) => v + 1)
    window.addEventListener('k2-oeffentlich-images-updated', onUpdate)
    return () => window.removeEventListener('k2-oeffentlich-images-updated', onUpdate)
  }, [musterOnly])
  const displayImages = useMemo(() => {
    if (musterOnly) {
      // ök2: Bilder aus k2-oeffentlich-page-content-galerie laden (gleicher Key wie Admin-Speichern)
      try {
        const pageContent = getPageContentGalerie('oeffentlich')
        return {
          welcomeImage: pageContent.welcomeImage || (galleryData.welcomeImage?.trim() || '') || OEK2_WILLKOMMEN_IMAGES.welcomeImage,
          galerieCardImage: pageContent.galerieCardImage || (galleryData.galerieCardImage?.trim() || '') || OEK2_WILLKOMMEN_IMAGES.galerieCardImage,
          virtualTourImage: pageContent.virtualTourImage || (galleryData.virtualTourImage?.trim() || '') || OEK2_WILLKOMMEN_IMAGES.virtualTourImage
        }
      } catch (_) {
        return {
          welcomeImage: (galleryData.welcomeImage?.trim() || '') || OEK2_WILLKOMMEN_IMAGES.welcomeImage,
          galerieCardImage: (galleryData.galerieCardImage?.trim() || '') || OEK2_WILLKOMMEN_IMAGES.galerieCardImage,
          virtualTourImage: (galleryData.virtualTourImage?.trim() || '') || OEK2_WILLKOMMEN_IMAGES.virtualTourImage
        }
      }
    }
    return getGalerieImages(galleryData)
  }, [musterOnly, galleryData, oefImagesVersion])

  // ök2: Bei Ladefehler Willkommensbild Fallback anzeigen (kein blaues Fragezeichen)
  const [welcomeImageFailed, setWelcomeImageFailed] = useState(false)
  useEffect(() => {
    if (musterOnly && displayImages.welcomeImage) setWelcomeImageFailed(false)
  }, [musterOnly, displayImages.welcomeImage])

  // ök2: Bild direkt auf die Galerie ziehen – speichern in localStorage, sofort anzeigen
  const [galerieDropOver, setGalerieDropOver] = useState(false)
  const oefDropMountedRef = React.useRef(true)
  React.useEffect(() => {
    oefDropMountedRef.current = true
    return () => { oefDropMountedRef.current = false }
  }, [])
  const saveOefWelcomeFromFile = React.useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        let dataUrl = String(reader.result)
        if (dataUrl.length > 600_000) {
          const img = new Image()
          img.onload = () => {
            if (!oefDropMountedRef.current) return
            const c = document.createElement('canvas')
            const scale = img.width > 1200 ? 1200 / img.width : 1
            c.width = Math.round(img.width * scale)
            c.height = Math.round(img.height * scale)
            const ctx = c.getContext('2d')
            if (ctx) {
              ctx.drawImage(img, 0, 0, c.width, c.height)
              dataUrl = c.toDataURL('image/jpeg', 0.85)
            }
            try {
              localStorage.setItem('k2-oeffentlich-welcomeImage', dataUrl)
              window.dispatchEvent(new Event('k2-oeffentlich-images-updated'))
              if (oefDropMountedRef.current) setOefImagesVersion((v) => v + 1)
            } catch (_) {}
          }
          img.src = dataUrl
        } else {
          localStorage.setItem('k2-oeffentlich-welcomeImage', dataUrl)
          window.dispatchEvent(new Event('k2-oeffentlich-images-updated'))
          if (oefDropMountedRef.current) setOefImagesVersion((v) => v + 1)
        }
      } catch (_) {}
    }
    reader.readAsDataURL(file)
  }, [])
  const handleGalerieDrop = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setGalerieDropOver(false)
    const file = e.dataTransfer?.files?.[0]
    if (file) saveOefWelcomeFromFile(file)
  }, [saveOefWelcomeFromFile])
  const handleGalerieDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setGalerieDropOver(true)
  }, [])
  const handleGalerieDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setGalerieDropOver(false)
  }, [])

  // Willkommensseite setzt NICHT das „von Galerie“-Flag – Workflow in der Ausstellung: hier starten → Admin (Passwort) → Kassa oder neue Werke. Flag nur auf Galerie-Vorschau (Werke ansehen).
  // LAN-IP für QR (z. B. 192.168.0.31) – bei localhost per RTCPeerConnection ermitteln
  const [detectedLanIp, setDetectedLanIp] = useState<string>('')
  const mobileUrlMemo = useMemo(() => {
    try {
      const hostname = window.location.hostname
      const port = window.location.port || '5177'
      const protocol = window.location.protocol
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return '' // Wird unten durch detectedLanIp oder 192.168.0.31 ersetzt
      }
      return `${protocol}//${hostname}:${port}${PROJECT_ROUTES['k2-galerie'].galerie}`
    } catch {
      return ''
    }
  }, [])

  useEffect(() => {
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') return
    let cancelled = false
    const rtc = new (window.RTCPeerConnection as any)({ iceServers: [] })
    rtc.createDataChannel('')
    rtc.createOffer().then((offer: any) => rtc.setLocalDescription(offer))
    rtc.onicecandidate = (e: any) => {
      if (cancelled || !e?.candidate?.candidate) return
      const m = e.candidate.candidate.match(/^candidate:\d+ \d+ udp \d+ (\d+\.\d+\.\d+\.\d+)/)
      if (m && (m[1].startsWith('192.168.') || m[1].startsWith('10.'))) {
        if (!cancelled) setDetectedLanIp(m[1])
        rtc.close()
      }
    }
    const t = setTimeout(() => { rtc.close() }, 3000)
    return () => { cancelled = true; clearTimeout(t); rtc.close() }
  }, [])

  React.useEffect(() => {
    setMobileUrl(mobileUrlMemo || (detectedLanIp ? `http://${detectedLanIp}:${window.location.port || '5177'}${PROJECT_ROUTES['k2-galerie'].galerie}` : ''))
  }, [mobileUrlMemo, detectedLanIp])

  // QR-Code URL für Impressum (gleiche Logik wie unten)
  const qrFinalUrl = useMemo(() => {
    try {
      const hostname = window.location.hostname || ''
      const port = window.location.port || '5177'
      const protocol = window.location.protocol
      const isVercel = hostname.includes('vercel.app')
      let finalUrl = ''
      if (!isVercel) {
        const isIPAddress = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)
        if (isIPAddress) {
          finalUrl = `${protocol}//${hostname}:${port}${PROJECT_ROUTES['k2-galerie'].galerie}`
        } else if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
          finalUrl = `${protocol}//${hostname}:${port}${PROJECT_ROUTES['k2-galerie'].galerie}`
        } else if (mobileUrl && !mobileUrl.includes('localhost') && !mobileUrl.includes('127.0.0.1')) {
          finalUrl = mobileUrl
        } else if (mobileUrlMemo && !mobileUrlMemo.includes('localhost') && !mobileUrlMemo.includes('127.0.0.1')) {
          finalUrl = mobileUrlMemo
        } else {
          finalUrl = `http://192.168.0.31:${port}${PROJECT_ROUTES['k2-galerie'].galerie}`
        }
      } else {
        finalUrl = `${window.location.protocol}//${hostname}${PROJECT_ROUTES['k2-galerie'].galerie}`
      }
      return finalUrl.split('#')[0] || `http://192.168.0.31:${port}${PROJECT_ROUTES['k2-galerie'].galerie}`
    } catch {
      return 'https://k2-galerie.vercel.app/projects/k2-galerie/galerie'
    }
  }, [mobileUrl, mobileUrlMemo])

  // Server-Stand für QR – QR nur mit Server-Stand bauen, sonst zeigt Scan alte Version (Regel stand-qr-niemals-zurueck)
  const serverBuildTs = useServerBuildTimestamp()
  const qrVersionTs = useQrVersionTimestamp()
  // ök2: QR MUSS auf Muster-Galerie zeigen (galerie-oeffentlich), nie auf K2 – sonst zeigt Scan die echte K2-Seite
  const vercelGalerieUrl = useMemo(() => {
    if (musterOnly) {
      const url = GALLERY_DATA_PUBLIC_URL + PROJECT_ROUTES['k2-galerie'].galerieOeffentlich
      if (!url.includes('galerie-oeffentlich')) return GALLERY_DATA_PUBLIC_URL + '/projects/k2-galerie/galerie-oeffentlich'
      return url
    }
    return GALLERY_DATA_PUBLIC_URL + PROJECT_ROUTES['k2-galerie'].galerie
  }, [musterOnly])
  // QR alle 45 s neu bauen mit frischem _= (Cache-Bust), damit Scan am Handy nicht gecachte alte Version lädt
  const [qrBustTick, setQrBustTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setQrBustTick((k) => k + 1), 45000)
    return () => clearInterval(t)
  }, [])
  useEffect(() => {
    let cancelled = false
    if (serverBuildTs == null) {
      setVercelQrDataUrl('')
      return
    }
    const urlForQr = vercelGalerieUrl
    if (musterOnly && !urlForQr.includes('galerie-oeffentlich')) {
      if (!cancelled) setVercelQrDataUrl('')
      return
    }
    const qrUrl = buildQrUrlWithBust(urlForQr, serverBuildTs)
    QRCode.toDataURL(qrUrl, { width: 100, margin: 1 })
      .then((url) => { if (!cancelled) setVercelQrDataUrl(url) })
      .catch(() => { if (!cancelled) setVercelQrDataUrl('') })
    return () => { cancelled = true }
  }, [vercelGalerieUrl, serverBuildTs, qrVersionTs, musterOnly, qrBustTick])

  // Aktualisieren-Funktion für Mobile-Version - lädt neue Daten ohne Reload
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  
  const handleRefresh = React.useCallback(async () => {
    setIsRefreshing(true)
    try {
      // KRITISCH: Kompletter Cache-Clear für Mobile
      localStorage.removeItem('k2-last-loaded-timestamp')
      localStorage.removeItem('k2-last-loaded-version')
      localStorage.removeItem('k2-last-build-id')
      sessionStorage.clear() // Kompletter Session-Cache-Clear
      
      // Erhöhe Versionsnummer für maximales Cache-Busting
      const currentVersion = parseInt(localStorage.getItem('k2-data-version') || '0')
      const newVersion = currentVersion + 1
      localStorage.setItem('k2-data-version', newVersion.toString())
      
      // Cache-Busting: Füge mehrere Timestamps hinzu um neue Daten zu laden
      const timestamp = Date.now()
      const random = Math.random()
      const sessionId = Math.random().toString(36).substring(7)
      const buildId = `${Date.now()}-${Math.random().toString(36).substring(7)}`
      sessionStorage.setItem('k2-session-id', sessionId)
      
      // KRITISCH: Maximale Cache-Busting URL (gleicher Pfad für Fallback in anderem Netzwerk)
      const pathAndQuery = `/gallery-data.json?v=${timestamp}&t=${timestamp}&r=${random}&sid=${sessionId}&ver=${newVersion}&bid=${buildId}&_=${Date.now()}&nocache=${Math.random()}&force=${Date.now()}&refresh=${Math.random()}`
      
      const fetchOpts: RequestInit = {
        cache: 'no-store',
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'If-None-Match': `"${timestamp}-${random}-${newVersion}-${buildId}"`,
          'If-Modified-Since': 'Thu, 01 Jan 1970 00:00:00 GMT',
          'X-Requested-With': 'XMLHttpRequest',
          'X-Data-Version': newVersion.toString(),
          'X-Build-ID': buildId,
          'X-Timestamp': timestamp.toString()
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        credentials: 'omit'
      }

      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      const isLocalLan = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.|10\.)/.test(origin)

      let response: Response | null = null
      try {
        response = await fetch(pathAndQuery, fetchOpts)
      } catch (_) {
        // Netzwerkfehler (z. B. Mobilgerät im LAN kann gleiche Origin nicht erreichen)
      }
      // Im lokalen LAN: Bei Fehler auch volle Origin-URL versuchen (manche Mobile Browser)
      if (!response?.ok && isLocalLan && origin) {
        try {
          const fullUrlRes = await fetch(origin + pathAndQuery, fetchOpts)
          if (fullUrlRes.ok) response = fullUrlRes
        } catch (_) {}
      }
      // Fallback: Vercel (funktioniert wenn Handy Internet hat)
      if (!response?.ok) {
        try {
          const fallbackRes = await fetch(GALLERY_DATA_PUBLIC_URL + pathAndQuery, fetchOpts)
          if (fallbackRes.ok) response = fallbackRes
        } catch (_) {}
      }

      if (response?.ok) {
        const data = await response.json()
        const currentTimestamp = data.exportedAt || ''
        const currentVersion = data.version || 0
        const currentBuildId = data.buildId || ''
        
        console.log('✅ Neue Daten geladen:', {
          timestamp: currentTimestamp,
          version: currentVersion,
          buildId: currentBuildId,
          artworks: data.artworks?.length || 0
        })
        
        // Setze Daten neu
        if (data.martina) {
          setMartinaData({
            name: data.martina.name || 'Martina Kreinecker',
            email: data.martina.email || '',
            phone: data.martina.phone || '',
            website: data.martina.website || ''
          })
        }
        if (data.georg) {
          setGeorgData({
            name: data.georg.name || 'Georg Kreinecker',
            email: data.georg.email || '',
            phone: data.georg.phone || '',
            website: data.georg.website || ''
          })
        }
        if (data.gallery) {
          setGalleryData({
            address: data.gallery.address || '',
            city: data.gallery.city || '',
            country: data.gallery.country || '',
            phone: data.gallery.phone || '',
            email: data.gallery.email || '',
            website: data.gallery.website || 'www.k2-galerie.at',
            internetadresse: data.gallery.internetadresse || data.gallery.website || '',
            openingHours: (data.gallery as any).openingHours || '',
            adminPassword: data.gallery.adminPassword || 'k2Galerie2026',
            welcomeImage: data.gallery.welcomeImage || '',
            virtualTourImage: data.gallery.virtualTourImage || '',
            galerieCardImage: data.gallery.galerieCardImage || ''
          })
          setAdminPassword(data.gallery.adminPassword || 'k2Galerie2026')
        }
        
        // KRITISCH: Lade ZUERST lokale Werke um sicherzustellen dass Mobile-Werke NICHT verloren gehen!
        const localArtworks = safeParseArtworks(artworksKey)
        const mobileWorks = localArtworks.filter((a: any) => a.createdOnMobile || a.updatedOnMobile)
        
        if (mobileWorks.length > 0) {
          console.log(`🔒 ${mobileWorks.length} Mobile-Werke geschützt:`, mobileWorks.map((a: any) => a.number || a.id).join(', '))
        }
        
        // Lade auch Werke wenn vorhanden - KRITISCH für Mobile
        // WICHTIG: Merge mit lokalen Werken statt Überschreiben!
        // KRITISCH: Mobile-Werke haben ABSOLUTE PRIORITÄT - sie dürfen NIEMALS gelöscht werden!
        if (data.artworks && Array.isArray(data.artworks)) {
          try {
            const serverArtworks = data.artworks
            
            // Erstelle Map für schnelle Suche (unterstützt verschiedene Formate)
            const serverMap = new Map<string, any>()
            serverArtworks.forEach((a: any) => {
              const key = a.number || a.id
              if (key) {
                serverMap.set(key, a)
                // Auch ohne K/M Präfix prüfen (für alte Nummern)
                if (key.includes('-K-') || key.includes('-M-')) {
                  const oldFormat = key.replace('-K-', '-').replace('-M-', '-')
                  if (oldFormat !== key) {
                    serverMap.set(oldFormat, a)
                  }
                }
              }
            })
            
            // SERVER = QUELLE DER WAHRHEIT nach Veröffentlichung (wie GalerieVorschauPage)
            const merged: any[] = [...serverArtworks]
            const toHistory: any[] = []
            
            localArtworks.forEach((local: any) => {
              const key = local.number || local.id
              if (!key) return
              const serverArtwork = serverMap.get(key)
              const isMobileWork = local.createdOnMobile || local.updatedOnMobile
              const createdAt = local.createdAt ? new Date(local.createdAt).getTime() : 0
              const isVeryNew = createdAt > Date.now() - 600000
              
              if (!serverArtwork) {
                if (isMobileWork && isVeryNew) {
                  merged.push(local)
                } else {
                  toHistory.push(local)
                }
              } else {
                if (isMobileWork) {
                  const idx = merged.findIndex((a: any) => (a.number || a.id) === key)
                  if (idx >= 0) merged[idx] = local
                  else merged.push(local)
                } else {
                  const localUpdated = local.updatedAt ? new Date(local.updatedAt).getTime() : 0
                  const serverUpdated = serverArtwork.updatedAt ? new Date(serverArtwork.updatedAt).getTime() : 0
                  if (localUpdated > serverUpdated) {
                    const idx = merged.findIndex((a: any) => (a.number || a.id) === key)
                    if (idx >= 0) merged[idx] = local
                    else merged.push(local)
                  }
                }
              }
            })
            
            if (toHistory.length > 0) appendToHistory(toHistory)
            
            console.log('✅ Werke gemergt (Server = Quelle):', merged.length, 'Gesamt,', toHistory.length, 'in History')
            console.log('📋 Lokale Nummern:', localArtworks.map((a: any) => a.number || a.id).join(', '))
            console.log('📋 Server Nummern:', serverArtworks.map((a: any) => a.number || a.id).join(', '))
            console.log('📋 Gemergte Nummern:', merged.map((a: any) => a.number || a.id).join(', '))
            
            // KRITISCH: Speichere merged Liste - Mobile-Werke sind geschützt!
            localStorage.setItem(artworksKey, JSON.stringify(artworksToSave(artworksKey, merged)))
            
            // ZUSÄTZLICH: Prüfe ob neue Mobile-Werke vom Server geladen wurden
            const newMobileWorks = merged.filter((a: any) => 
              (a.createdOnMobile || a.updatedOnMobile) && 
              !localArtworks.some((local: any) => 
                (local.number && a.number && local.number === a.number) ||
                (local.id && a.id && local.id === a.id)
              )
            )
            
            if (newMobileWorks.length > 0) {
              console.log(`📱 ${newMobileWorks.length} neue Mobile-Werke vom Server synchronisiert:`, newMobileWorks.map((a: any) => a.number || a.id).join(', '))
            }
            
            // Trigger Event für andere Komponenten - mit Flag dass es von GaleriePage kommt
            window.dispatchEvent(new CustomEvent('artworks-updated', { detail: { count: merged.length, fromGaleriePage: true, newMobileWorks: newMobileWorks.length } }))
          } catch (e) {
            console.warn('⚠️ Werke zu groß für localStorage:', e)
            // Bei Fehler: Behalte lokale Werke!
            console.log('🔒 Fehler beim Merge - behalte lokale Werke:', localArtworks.length)
            localStorage.setItem(artworksKey, JSON.stringify(artworksToSave(artworksKey, localArtworks)))
          }
        } else {
          // KEINE Server-Daten - behalte ALLE lokalen Werke!
          console.warn('⚠️ Keine Werke in gallery-data.json gefunden - behalte lokale Werke:', localArtworks.length)
          if (localArtworks.length > 0) {
            console.log('🔒 Lokale Werke bleiben erhalten:', localArtworks.map((a: any) => a.number || a.id).join(', '))
            // Stelle sicher dass lokale Werke gespeichert bleiben
            localStorage.setItem(artworksKey, JSON.stringify(artworksToSave(artworksKey, localArtworks)))
            window.dispatchEvent(new CustomEvent('artworks-updated', { detail: { count: localArtworks.length, fromGaleriePage: true, localOnly: true } }))
          }
        }
        
        // Lade auch Events wenn vorhanden – NIEMALS lokale Eventplanung mit leerem Server überschreiben
        if (data.events && Array.isArray(data.events)) {
          try {
            const localRaw = localStorage.getItem('k2-events')
            const localEvents = localRaw ? JSON.parse(localRaw) : []
            const localHasEvents = Array.isArray(localEvents) && localEvents.length > 0
            const serverHasEvents = data.events.length > 0
            if (serverHasEvents || !localHasEvents) {
              localStorage.setItem('k2-events', JSON.stringify(data.events))
              window.dispatchEvent(new CustomEvent('k2-events-updated'))
              console.log('✅ Events aktualisiert:', data.events.length)
            }
          } catch (e) {
            console.warn('⚠️ Events zu groß für localStorage')
          }
        }
        // Dokumente (Öffentlichkeitsarbeit) – NIEMALS lokale mit leerem Server überschreiben
        if (data.documents && Array.isArray(data.documents)) {
          try {
            const localRaw = localStorage.getItem('k2-documents')
            const localDocs = localRaw ? JSON.parse(localRaw) : []
            const localHasDocs = Array.isArray(localDocs) && localDocs.length > 0
            const serverHasDocs = data.documents.length > 0
            if (serverHasDocs || !localHasDocs) {
              localStorage.setItem('k2-documents', JSON.stringify(data.documents))
              console.log('✅ Dokumente aktualisiert:', data.documents.length)
            }
          } catch (e) {
            console.warn('⚠️ Dokumente zu groß für localStorage')
          }
        }
        if (data.pageTexts != null) {
          try {
            localStorage.setItem('k2-page-texts', JSON.stringify(data.pageTexts))
            console.log('✅ Seitentexte aktualisiert')
          } catch (e) {
            console.warn('⚠️ Seitentexte zu groß für localStorage')
          }
        }
        if (data.designSettings != null && typeof data.designSettings === 'object') {
          try {
            const designToUse = isOldBlueTheme(data.designSettings) ? K2_ORANGE : data.designSettings
            localStorage.setItem('k2-design-settings', JSON.stringify(designToUse))
            applyDesignToDocument(designToUse)
          } catch (_) {}
        }
        
        // Speichere Timestamp für nächsten Vergleich
        if (currentTimestamp) {
          localStorage.setItem('k2-last-loaded-timestamp', currentTimestamp)
        }
        if (currentVersion) {
          localStorage.setItem('k2-last-loaded-version', currentVersion.toString())
        }
        if (currentBuildId) {
          localStorage.setItem('k2-last-build-id', currentBuildId)
        }
        
        // DEAKTIVIERT: Automatisches Reload verursacht Crashes
        // Daten werden bereits oben gesetzt - kein Reload nötig
      } else {
        const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768
        const onLocalLan = isLocalOrPrivateOrigin()
        const localHint = onLocalLan
          ? '\n• Im LAN (192.168.0.x): Auf dem Mac „Veröffentlichen“ klicken, damit gallery-data.json existiert. Dev-Server muss laufen (npm run dev).'
          : ''
        if (!response) {
          alert(
            '⚠️ Aktualisieren fehlgeschlagen.\n\n' +
            '• Verbindung prüfen (WLAN/Mobilfunk)\n' +
            (isMobileDevice ? '• QR-Code NEU scannen (lädt aktuelle Version)\n' : '') +
            localHint +
            '\n• Oder in 1–2 Min. erneut versuchen'
          )
        } else {
          alert(
            `⚠️ Keine neuen Daten (HTTP ${response.status}).\n\n` +
            '• Nach Veröffentlichung 2–3 Min. warten\n' +
            (isMobileDevice ? '• QR-Code NEU scannen (frischer Laden)\n' : '') +
            localHint +
            '\n• Oder: Seite komplett neu laden (Pull nach unten)'
          )
        }
      }
      } catch (error) {
        console.error('❌ Fehler beim Aktualisieren:', error)
        alert('⚠️ Aktualisieren fehlgeschlagen.\n\nBitte Verbindung prüfen oder später erneut versuchen.')
        setIsRefreshing(false)
      } finally {
        setIsRefreshing(false)
        // Trigger Event für GalerieVorschauPage
        window.dispatchEvent(new CustomEvent('artworks-updated'))
      }
    }, [])

  // Pull-to-Refresh für Mobile - Wischen nach unten lädt Seite neu
  React.useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768
    if (!isMobile) return

    let touchStartY = 0
    let touchCurrentY = 0
    let isPulling = false

    const handleTouchStart = (e: TouchEvent) => {
      // Nur wenn ganz oben gescrollt ist
      if (window.scrollY === 0) {
        touchStartY = e.touches[0].clientY
        isPulling = true
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling) return
      touchCurrentY = e.touches[0].clientY
      const pullDistance = touchCurrentY - touchStartY
      
      // Wenn nach unten gezogen wird (mehr als 80px)
      if (pullDistance > 80 && window.scrollY === 0) {
        // Zeige visuelles Feedback
        document.body.style.transform = `translateY(${Math.min(pullDistance, 100)}px)`
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isPulling) return
      const pullDistance = touchCurrentY - touchStartY
      
      // Reset Transform
      document.body.style.transform = ''
      
      // Wenn weit genug nach unten gezogen wurde → Reload (nur außerhalb iframe – Cursor Preview sonst Crash/Loop)
      if (pullDistance > 80 && window.scrollY === 0 && window.self === window.top) {
        console.log('🔄 Pull-to-Refresh: Lade Seite neu...')
        // Kompletter Cache-Clear
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => caches.delete(name))
          })
        }
        // Hard Reload mit Cache-Busting
        window.location.href = window.location.href.split('?')[0] + '?v=' + Date.now() + '&reload=' + Math.random()
      }
      
      isPulling = false
      touchStartY = 0
      touchCurrentY = 0
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
      document.body.style.transform = ''
    }
  }, [])

  // WICHTIG: Automatisches Polling für Mobile-zu-Mobile Sync (nur wenn nicht auf Vercel)
  // KRITISCH: Mobile-Werke werden automatisch synchronisiert - kein manuelles Speichern nötig!
  React.useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768
    const isVercel = window.location.hostname.includes('vercel.app')
    
    // Nur auf Mobile-Geräten die auf Dev-Server zugreifen (nicht Vercel)
    if (isMobile && !isVercel) {
      console.log('✅ Automatisches Mobile-Polling aktiviert (alle 10 Sekunden)')
      console.log('📱 Mobile-Werke werden automatisch synchronisiert - kein manuelles Speichern nötig!')
      
      // Automatisches Polling alle 10 Sekunden für Mobile-zu-Mobile Sync
      const pollingInterval = setInterval(() => {
        console.log('🔄 Automatisches Polling für Mobile-Sync...')
        handleRefresh()
      }, 10000) // Alle 10 Sekunden
      
      return () => {
        console.log('🛑 Automatisches Mobile-Polling gestoppt')
        clearInterval(pollingInterval)
      }
    }
  }, [handleRefresh])
  
  // KRITISCH: Event-Listener für Mobile-Werke Synchronisation zwischen Geräten
  React.useEffect(() => {
    const handleMobileArtworkSaved = (event: CustomEvent) => {
      const artwork = event.detail?.artwork
      if (!artwork) return
      
      console.log(`📱 Mobile-Werk-Synchronisation erkannt: ${artwork.number || artwork.id}`)
      
      // Lade aktuelle Werke
      const localArtworks = safeParseArtworks(artworksKey)
      
      // Prüfe ob Werk bereits vorhanden
      const exists = localArtworks.some((a: any) => 
        (a.number && artwork.number && a.number === artwork.number) ||
        (a.id && artwork.id && a.id === artwork.id)
      )
      
      if (!exists) {
        console.log(`✅ Neues Mobile-Werk synchronisiert: ${artwork.number || artwork.id}`)
        // Füge Werk hinzu
        localArtworks.push(artwork)
        localStorage.setItem(artworksKey, JSON.stringify(artworksToSave(artworksKey, localArtworks)))
        
        // Trigger Event für UI-Update
        window.dispatchEvent(new CustomEvent('artworks-updated', { 
          detail: { count: localArtworks.length, mobileSync: true } 
        }))
      }
    }
    
    window.addEventListener('mobile-artwork-saved', handleMobileArtworkSaved as EventListener)
    
    return () => {
      window.removeEventListener('mobile-artwork-saved', handleMobileArtworkSaved as EventListener)
    }
  }, [])
  
  React.useEffect(() => {
    if (musterOnly) return () => {} // Öffentliches Projekt: keine echten Daten laden
    if (vk2) {
      // VK2: nur localStorage (k2-vk2-artworks), kein gallery-data.json
      const loadVk2 = () => {
        try {
          const raw = localStorage.getItem(artworksKey)
          const list = raw ? JSON.parse(raw) : []
          const artworks = Array.isArray(list) ? list : []
          // VK2: Kein Seed mehr – leer bleibt leer
          window.dispatchEvent(new CustomEvent('artworks-updated', { detail: { count: artworks.length, fromGaleriePage: true } }))
        } catch (_) {}
      }
      const t = setTimeout(loadVk2, 100)
      return () => clearTimeout(t)
    }
    // Lade Daten: Zuerst aus JSON-Datei (für Mobile-Version auf Vercel), dann localStorage (für lokale Entwicklung)
    let isMounted = true
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    let controller: AbortController | null = null
    
    const loadData = async () => {
      if (!isMounted) return
      
      let data: any = null
      const isVorschauModus = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('vorschau') === '1'

      // Vorschau aus Einstellungen „Seiten prüfen“: Nur localStorage nutzen, kein Fetch (sonst überschreiben alte Server-Daten die gerade gespeicherten)
      if (!isVorschauModus) {
      try {
        // Einfacheres Cache-Busting - nicht zu aggressiv
        const timestamp = Date.now()
        const pathAndQuery = `/gallery-data.json?v=${timestamp}&t=${timestamp}&_=${Math.random()}`
        
        // WICHTIG: Timeout hinzufügen um Hänger zu vermeiden
        controller = new AbortController()
        timeoutId = setTimeout(() => {
          if (controller) controller.abort()
        }, 8000) // 8 Sekunden Timeout (kürzer = weniger Crash-Risiko)
        
        const fetchOpts = {
          cache: 'no-store' as RequestCache,
          method: 'GET' as const,
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        }

        let response: Response | null = null
        try {
          response = await fetch(pathAndQuery, fetchOpts)
        } catch (_) {
          response = null
        }
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
        if ((!response || !response.ok) && !window.location.hostname.includes('vercel.app')) {
          try {
            controller = new AbortController()
            timeoutId = setTimeout(() => { if (controller) controller.abort() }, 8000)
            response = await fetch(GALLERY_DATA_PUBLIC_URL + pathAndQuery, { ...fetchOpts, signal: controller.signal })
          } catch (_) {
            response = response || null
          }
          if (timeoutId) {
            clearTimeout(timeoutId)
            timeoutId = null
          }
        }

        if (response?.ok) {
          const jsonData = await response.json()
          data = jsonData
          
          // Prüfe Timestamp UND Version - wenn neuer als gespeicherter, lade neu
          const lastLoadedTimestamp = localStorage.getItem('k2-last-loaded-timestamp')
          const currentTimestamp = jsonData.exportedAt || ''
          const currentVersion = jsonData.version || 0
          const currentBuildId = jsonData.buildId || ''
          const lastLoadedVersion = parseInt(localStorage.getItem('k2-last-loaded-version') || '0')
          const lastBuildId = localStorage.getItem('k2-last-build-id') || ''
          
          const isNewer = !lastLoadedTimestamp || 
                          currentTimestamp > lastLoadedTimestamp || 
                          currentVersion > lastLoadedVersion ||
                          currentBuildId !== lastBuildId
          
          console.log('✅ gallery-data.json geladen:', {
            timestamp: currentTimestamp,
            version: currentVersion,
            buildId: currentBuildId,
            lastLoaded: lastLoadedTimestamp || 'nie',
            lastVersion: lastLoadedVersion,
            lastBuildId: lastBuildId || 'nie',
            isNewer: isNewer,
            artworks: data.artworks?.length || 0,
            events: data.events?.length || 0,
            martina: data.martina?.name || 'nicht vorhanden',
            georg: data.georg?.name || 'nicht vorhanden',
            gallery: data.gallery?.name || 'nicht vorhanden'
          })
          
          // WICHTIG: Nur aktualisieren wenn wirklich neue Daten vorhanden
          if (!isNewer && lastLoadedTimestamp) {
            console.log('ℹ️ Keine neuen Daten - verwende vorhandene')
          }
          
          // Speichere Timestamp UND Version für nächsten Vergleich
          if (currentTimestamp && isNewer) {
            localStorage.setItem('k2-last-loaded-timestamp', currentTimestamp)
            if (currentVersion) {
              localStorage.setItem('k2-last-loaded-version', currentVersion.toString())
            }
            if (currentBuildId) {
              localStorage.setItem('k2-last-build-id', currentBuildId)
            }
            console.log('✅ Neue Daten gespeichert:', {
              timestamp: currentTimestamp,
              version: currentVersion,
              buildId: currentBuildId
            })
          }
          
          // Lade auch Werke - SERVER = QUELLE DER WAHRHEIT (wie handleRefresh)
          if (data.artworks && Array.isArray(data.artworks)) {
            try {
              const localArtworks = safeParseArtworks(artworksKey)
              const serverArtworks = data.artworks
              
              const serverMap = new Map<string, any>()
              serverArtworks.forEach((a: any) => {
                const key = a.number || a.id
                if (key) serverMap.set(key, a)
              })
              
              const merged: any[] = [...serverArtworks]
              const toHistory: any[] = []
              
              localArtworks.forEach((local: any) => {
                const key = local.number || local.id
                if (!key) return
                const serverArtwork = serverMap.get(key)
                const isMobileWork = local.createdOnMobile || local.updatedOnMobile
                const createdAt = local.createdAt ? new Date(local.createdAt).getTime() : 0
                const isVeryNew = createdAt > Date.now() - 600000
                
                if (!serverArtwork) {
                  if (isMobileWork && isVeryNew) merged.push(local)
                  else toHistory.push(local)
                } else {
                  if (isMobileWork) {
                    const idx = merged.findIndex((a: any) => (a.number || a.id) === key)
                    if (idx >= 0) merged[idx] = local
                    else merged.push(local)
                  } else {
                    const localUpdated = local.updatedAt ? new Date(local.updatedAt).getTime() : 0
                    const serverUpdated = serverArtwork.updatedAt ? new Date(serverArtwork.updatedAt).getTime() : 0
                    if (localUpdated > serverUpdated) {
                      const idx = merged.findIndex((a: any) => (a.number || a.id) === key)
                      if (idx >= 0) merged[idx] = local
                      else merged.push(local)
                    }
                  }
                }
              })
              
              if (toHistory.length > 0) appendToHistory(toHistory)
              
              localStorage.setItem(artworksKey, JSON.stringify(artworksToSave(artworksKey, merged)))
              console.log('✅ Werke gemergt beim Initial-Load (Server = Quelle):', merged.length, 'Gesamt,', toHistory.length, 'in History')
              console.log('📋 Lokale Nummern:', localArtworks.map((a: any) => a.number || a.id).join(', '))
              console.log('📋 Server Nummern:', serverArtworks.map((a: any) => a.number || a.id).join(', '))
              console.log('📋 Gemergte Nummern:', merged.map((a: any) => a.number || a.id).join(', '))
              // Trigger Event für andere Komponenten (z.B. GalerieVorschauPage)
              window.dispatchEvent(new CustomEvent('artworks-updated', { detail: { count: merged.length, fromGaleriePage: true, initialLoad: true } }))
            } catch (e) {
              console.warn('⚠️ Werke zu groß für localStorage:', e)
              // Bei Fehler: Behalte lokale Werke!
              const localArtworks = safeParseArtworks(artworksKey)
              if (localArtworks.length > 0) {
                console.log('🔒 Fehler beim Merge beim Initial-Load - behalte lokale Werke:', localArtworks.length)
                localStorage.setItem(artworksKey, JSON.stringify(artworksToSave(artworksKey, localArtworks)))
              }
            }
          } else {
            // KEINE Server-Daten - behalte ALLE lokalen Werke!
            const localArtworks = safeParseArtworks(artworksKey)
            if (localArtworks.length > 0) {
              console.warn('⚠️ Keine Werke in gallery-data.json gefunden beim Initial-Load - behalte lokale Werke:', localArtworks.length)
              console.log('🔒 Lokale Werke bleiben erhalten beim Initial-Load:', localArtworks.map((a: any) => a.number || a.id).join(', '))
              // Stelle sicher dass lokale Werke gespeichert bleiben
              localStorage.setItem(artworksKey, JSON.stringify(artworksToSave(artworksKey, localArtworks)))
              window.dispatchEvent(new CustomEvent('artworks-updated', { detail: { count: localArtworks.length, fromGaleriePage: true, localOnly: true, initialLoad: true } }))
            }
          }
          
          // Beim Initial-Load: Events/Dokumente nur überschreiben wenn Server echte Daten hat oder lokal leer
          if (data.events && Array.isArray(data.events)) {
            try {
              const localRaw = localStorage.getItem('k2-events')
              const localEvents = localRaw ? JSON.parse(localRaw) : []
              const localHasEvents = Array.isArray(localEvents) && localEvents.length > 0
              if (data.events.length > 0 || !localHasEvents) {
                localStorage.setItem('k2-events', JSON.stringify(data.events))
                window.dispatchEvent(new CustomEvent('k2-events-updated'))
              }
            } catch (_) {}
          }
          if (data.documents && Array.isArray(data.documents)) {
            try {
              const localRaw = localStorage.getItem('k2-documents')
              const localDocs = localRaw ? JSON.parse(localRaw) : []
              const localHasDocs = Array.isArray(localDocs) && localDocs.length > 0
              if (data.documents.length > 0 || !localHasDocs) {
                localStorage.setItem('k2-documents', JSON.stringify(data.documents))
              }
            } catch (_) {}
          }
          if (data.pageTexts != null) {
            try {
              localStorage.setItem('k2-page-texts', JSON.stringify(data.pageTexts))
            } catch (_) {}
          }
          if (data.designSettings != null && typeof data.designSettings === 'object') {
            try {
              const designToUse = isOldBlueTheme(data.designSettings) ? K2_ORANGE : data.designSettings
              localStorage.setItem('k2-design-settings', JSON.stringify(designToUse))
              applyDesignToDocument(designToUse)
            } catch (_) {}
          }
          
          // DEAKTIVIERT: Automatisches Reload verursacht Crashes
          // Stattdessen: Manueller "🔄 Aktualisieren" Button auf Mobile verwenden
          // Keine automatischen Reloads mehr!
        } else {
          // Nicht kritisch - verwende localStorage Daten
          console.log('ℹ️ gallery-data.json nicht verfügbar (HTTP ' + (response?.status ?? 'n/a') + ') - verwende localStorage')
        }
      } catch (error) {
        // KRITISCH: Fehler NICHT als Warnung loggen - verursacht Crashes
        // Einfach ignorieren und mit localStorage-Daten weiterarbeiten
        if (!isMounted) return
        // Kein console.log mehr - verursacht Crashes
        // JSON-Datei nicht gefunden - normal bei lokaler Entwicklung oder wenn nicht deployed
      } finally {
        // Cleanup: Timeout löschen
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
      }
      }
      
      // Falls keine JSON-Datei (oder Vorschau-Modus), lade aus localStorage
      if (!data) {
        try {
          const martinaStored = localStorage.getItem('k2-stammdaten-martina')
          const georgStored = localStorage.getItem('k2-stammdaten-georg')
          const galleryStored = localStorage.getItem('k2-stammdaten-galerie')
          
          if (martinaStored || georgStored || galleryStored) {
            data = {
              martina: martinaStored ? JSON.parse(martinaStored) : null,
              georg: georgStored ? JSON.parse(georgStored) : null,
              gallery: galleryStored ? JSON.parse(galleryStored) : null
            }
          }
        } catch (error) {
          // Ignoriere Fehler
        }
      }
      
      // Setze Daten - PRIORITÄT: localStorage > JSON-Datei
      // Crash-Schutz: Kein setState nach Unmount
      if (!isMounted) return
      try {
        const dm = K2_STAMMDATEN_DEFAULTS.martina
        const martinaStored = localStorage.getItem('k2-stammdaten-martina')
        let mergedMartina: { name: string; email: string; phone: string; website: string }
        if (martinaStored) {
          const martinaLocal = JSON.parse(martinaStored)
          mergedMartina = {
            name: martinaLocal.name || dm.name,
            email: (martinaLocal.email && String(martinaLocal.email).trim()) ? martinaLocal.email : dm.email,
            phone: (martinaLocal.phone && String(martinaLocal.phone).trim()) ? martinaLocal.phone : dm.phone,
            website: (martinaLocal.website && String(martinaLocal.website).trim()) ? martinaLocal.website : (dm.website || '')
          }
        } else if (data?.martina) {
          mergedMartina = {
            name: data.martina.name || dm.name,
            email: (data.martina.email && String(data.martina.email).trim()) ? data.martina.email : dm.email,
            phone: (data.martina.phone && String(data.martina.phone).trim()) ? data.martina.phone : dm.phone,
            website: (data.martina.website && String(data.martina.website).trim()) ? data.martina.website : (dm.website || '')
          }
        } else {
          mergedMartina = { name: dm.name, email: dm.email, phone: dm.phone, website: dm.website || '' }
        }
        if (isMounted) setMartinaData(mergedMartina)
        // Nur Kontaktfelder in den Speicher schreiben – bestehende Daten (Bio etc.) nicht überschreiben
        if (martinaStored) {
          try {
            const prev = JSON.parse(martinaStored)
            localStorage.setItem('k2-stammdaten-martina', JSON.stringify({ ...prev, name: mergedMartina.name, email: mergedMartina.email, phone: mergedMartina.phone, website: mergedMartina.website }))
          } catch (_) {}
        }
      } catch (error) {
        if (isMounted) console.error('Fehler beim Laden von Martina-Daten:', error)
      }
      
      if (!isMounted) return
      try {
        const dg = K2_STAMMDATEN_DEFAULTS.georg
        const georgStored = localStorage.getItem('k2-stammdaten-georg')
        let mergedGeorg: { name: string; email: string; phone: string; website: string }
        if (georgStored) {
          const georgLocal = JSON.parse(georgStored)
          mergedGeorg = {
            name: georgLocal.name || dg.name,
            email: (georgLocal.email && String(georgLocal.email).trim()) ? georgLocal.email : dg.email,
            phone: (georgLocal.phone && String(georgLocal.phone).trim()) ? georgLocal.phone : dg.phone,
            website: (georgLocal.website && String(georgLocal.website).trim()) ? georgLocal.website : (dg.website || '')
          }
        } else if (data?.georg) {
          mergedGeorg = {
            name: data.georg.name || dg.name,
            email: (data.georg.email && String(data.georg.email).trim()) ? data.georg.email : dg.email,
            phone: (data.georg.phone && String(data.georg.phone).trim()) ? data.georg.phone : dg.phone,
            website: (data.georg.website && String(data.georg.website).trim()) ? data.georg.website : (dg.website || '')
          }
        } else {
          mergedGeorg = { name: dg.name, email: dg.email, phone: dg.phone, website: dg.website || '' }
        }
        if (isMounted) setGeorgData(mergedGeorg)
        if (georgStored) {
          try {
            const prev = JSON.parse(georgStored)
            localStorage.setItem('k2-stammdaten-georg', JSON.stringify({ ...prev, name: mergedGeorg.name, email: mergedGeorg.email, phone: mergedGeorg.phone, website: mergedGeorg.website }))
          } catch (_) {}
        }
      } catch (error) {
        if (isMounted) console.error('Fehler beim Laden von Georg-Daten:', error)
      }
      
      if (!isMounted) return
      try {
        const g = K2_STAMMDATEN_DEFAULTS.gallery
        const galleryStored = localStorage.getItem('k2-stammdaten-galerie')
        let mergedGallery: any
        if (galleryStored) {
          const galleryLocal = JSON.parse(galleryStored)
          mergedGallery = {
            ...galleryLocal,
            address: (galleryLocal.address != null && String(galleryLocal.address).trim()) ? galleryLocal.address : g.address,
            city: (galleryLocal.city != null && String(galleryLocal.city).trim()) ? galleryLocal.city : g.city,
            country: (galleryLocal.country != null && String(galleryLocal.country).trim()) ? galleryLocal.country : g.country,
            phone: (galleryLocal.phone && String(galleryLocal.phone).trim()) ? galleryLocal.phone : g.phone,
            email: (galleryLocal.email && String(galleryLocal.email).trim()) ? galleryLocal.email : g.email,
            website: (galleryLocal.website != null && String(galleryLocal.website).trim()) ? galleryLocal.website : (g.website || galleryLocal.website || 'www.k2-galerie.at'),
            internetadresse: (galleryLocal.internetadresse != null && String(galleryLocal.internetadresse).trim()) ? galleryLocal.internetadresse : (galleryLocal.website || g.internetadresse || ''),
            openingHours: (galleryLocal as any).openingHours || g.openingHours || ''
          }
        } else if (data?.gallery) {
          // Server-Daten: Bilder aus data.gallery, falls nicht vorhanden aus localStorage (Server sendet oft keine Base64-Bilder)
          let imgFallback = { welcomeImage: '', virtualTourImage: '', galerieCardImage: '' }
          try {
            const stored = localStorage.getItem('k2-stammdaten-galerie')
            if (stored) {
              const parsed = JSON.parse(stored)
              if (parsed.welcomeImage) imgFallback.welcomeImage = parsed.welcomeImage
              if (parsed.virtualTourImage) imgFallback.virtualTourImage = parsed.virtualTourImage
              if (parsed.galerieCardImage) imgFallback.galerieCardImage = parsed.galerieCardImage
            }
          } catch (_) {}
          mergedGallery = {
            ...data.gallery,
            address: (data.gallery.address != null && String(data.gallery.address).trim()) ? data.gallery.address : g.address,
            city: (data.gallery.city != null && String(data.gallery.city).trim()) ? data.gallery.city : g.city,
            country: (data.gallery.country != null && String(data.gallery.country).trim()) ? data.gallery.country : g.country,
            phone: (data.gallery.phone && String(data.gallery.phone).trim()) ? data.gallery.phone : g.phone,
            email: (data.gallery.email && String(data.gallery.email).trim()) ? data.gallery.email : g.email,
            website: (data.gallery.website != null && String(data.gallery.website).trim()) ? data.gallery.website : (g.website || 'www.k2-galerie.at'),
            internetadresse: (data.gallery.internetadresse != null && String(data.gallery.internetadresse).trim()) ? data.gallery.internetadresse : (data.gallery.website || g.internetadresse || ''),
            openingHours: (data.gallery as any).openingHours || g.openingHours || '',
            welcomeImage: (data.gallery as any).welcomeImage || imgFallback.welcomeImage,
            virtualTourImage: (data.gallery as any).virtualTourImage || imgFallback.virtualTourImage,
            galerieCardImage: (data.gallery as any).galerieCardImage || imgFallback.galerieCardImage
          }
        } else {
          // Defaults: Bilder niemals mit '' überschreiben – aus localStorage erhalten falls vorhanden
          let existingImages = { welcomeImage: '', virtualTourImage: '', galerieCardImage: '' }
          try {
            const stored = localStorage.getItem('k2-stammdaten-galerie')
            if (stored) {
              const parsed = JSON.parse(stored)
              if (parsed.welcomeImage) existingImages.welcomeImage = parsed.welcomeImage
              if (parsed.virtualTourImage) existingImages.virtualTourImage = parsed.virtualTourImage
              if (parsed.galerieCardImage) existingImages.galerieCardImage = parsed.galerieCardImage
            }
          } catch (_) {}
          mergedGallery = {
            address: g.address,
            city: g.city,
            country: g.country,
            phone: g.phone,
            email: g.email,
            website: g.website || 'www.k2-galerie.at',
            internetadresse: g.internetadresse || g.website || '',
            openingHours: g.openingHours,
            adminPassword: 'k2Galerie2026',
            welcomeImage: existingImages.welcomeImage,
            virtualTourImage: existingImages.virtualTourImage,
            galerieCardImage: existingImages.galerieCardImage
          }
        }
        if (isMounted) {
          setGalleryData(mergedGallery)
          setAdminPassword(mergedGallery.adminPassword || 'k2Galerie2026')
        }
        // Nur Kontakt/Adresse-Felder reparieren – welcomeImage, virtualTourImage und alle anderen Felder aus dem Bestand behalten
        if (galleryStored) {
          try {
            const prev = JSON.parse(galleryStored)
            localStorage.setItem('k2-stammdaten-galerie', JSON.stringify({
              ...prev,
              name: mergedGallery.name,
              address: mergedGallery.address,
              city: mergedGallery.city,
              country: mergedGallery.country,
              phone: mergedGallery.phone,
              email: mergedGallery.email,
              website: mergedGallery.website,
              internetadresse: mergedGallery.internetadresse,
              openingHours: mergedGallery.openingHours
            }))
          } catch (_) {}
        }
      } catch (error) {
        if (isMounted) console.error('Fehler beim Laden von Galerie-Daten:', error)
      }
    }
    
    // Stammdaten-Updates: Prüfe alle 2 Sekunden localStorage (ohne storage-Event = kein Render-Loop)
    const checkStammdatenUpdate = () => {
      if (!isMounted) return
      try {
        const martinaStored = localStorage.getItem('k2-stammdaten-martina')
        if (martinaStored) {
          const data = JSON.parse(martinaStored)
          setMartinaData(prev => {
            if (prev.email !== data.email || prev.phone !== data.phone || prev.name !== data.name) {
              return { name: data.name || 'Martina Kreinecker', email: data.email || '', phone: data.phone || '', website: data.website ?? prev.website }
            }
            return prev
          })
        }
      } catch {}
      try {
        const georgStored = localStorage.getItem('k2-stammdaten-georg')
        if (georgStored) {
          const data = JSON.parse(georgStored)
          setGeorgData(prev => {
            if (prev.email !== data.email || prev.phone !== data.phone || prev.name !== data.name) {
              return { name: data.name || 'Georg Kreinecker', email: data.email || '', phone: data.phone || '', website: data.website ?? prev.website }
            }
            return prev
          })
        }
      } catch {}
      try {
        const galleryStored = localStorage.getItem('k2-stammdaten-galerie')
        if (galleryStored) {
          const data = JSON.parse(galleryStored)
          setGalleryData(prev => {
            const contactChanged = prev.address !== data.address || prev.city !== data.city || prev.country !== data.country || prev.phone !== data.phone || prev.email !== data.email || prev.website !== data.website
            // Bilder aus localStorage immer übernehmen – verhindert Verlust wenn State mal mit '' überschrieben wurde
            const welcomeImage = data.welcomeImage ?? prev.welcomeImage ?? ''
            const virtualTourImage = data.virtualTourImage ?? prev.virtualTourImage ?? ''
            const galerieCardImage = data.galerieCardImage ?? prev.galerieCardImage ?? ''
            if (contactChanged) {
              return {
                address: data.address || '', city: data.city || '', country: data.country || '',
                phone: data.phone || '', email: data.email || '',
                website: data.website || 'www.k2-galerie.at', internetadresse: data.internetadresse || data.website || '',
                openingHours: (data as any).openingHours ?? prev.openingHours ?? '',
                adminPassword: data.adminPassword || 'k2Galerie2026',
                welcomeImage, virtualTourImage, galerieCardImage
              }
            }
            // Auch ohne Kontaktänderung: Bilder aus localStorage in State zurückschreiben (Wiederherstellung)
            if (prev.welcomeImage !== welcomeImage || prev.virtualTourImage !== virtualTourImage || prev.galerieCardImage !== galerieCardImage) {
              return { ...prev, welcomeImage, virtualTourImage, galerieCardImage }
            }
            return prev
          })
          setAdminPassword(data.adminPassword || 'k2Galerie2026')
        }
      } catch {}
    }
    
    // Crash-Schutz: Erst nach 1 s laden (fetch + viel setState), damit erste Anzeige fertig ist
    let intervalId: ReturnType<typeof setInterval> | null = null
    const startId = setTimeout(() => {
      if (!isMounted) return
      loadData()
      intervalId = setInterval(checkStammdatenUpdate, 2000)
    }, 1000)

    return () => {
      isMounted = false
      clearTimeout(startId)
      if (intervalId) clearInterval(intervalId)
      if (timeoutId) clearTimeout(timeoutId)
      if (controller) controller.abort()
    }
  }, [musterOnly, vk2, artworksKey])

  // Scroll zu Bereich wenn scrollToSection sich ändert
  useEffect(() => {
    if (scrollToSection === 'willkommen' && willkommenRef.current) {
      willkommenRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else if (scrollToSection === 'galerie' && galerieRef.current) {
      galerieRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else if (scrollToSection === 'kunstschaffende' && kunstschaffendeRef.current) {
      kunstschaffendeRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [scrollToSection])
  
  // WICHTIG: Stelle sicher dass Seite immer oben startet (Willkommensseite)
  useEffect(() => {
    // Scroll nach oben beim ersten Laden (nur wenn kein scrollToSection gesetzt ist)
    if (!scrollToSection) {
      window.scrollTo(0, 0)
    }
  }, [])

  // Testphase: Erstbesuch speichern und prüfen ob innerhalb 2 Wochen
  const getFirstVisitKey = () => musterOnly ? KEY_FIRST_VISIT_OEF : KEY_FIRST_VISIT_K2
  const isInTestPhase = (): boolean => {
    try {
      const key = getFirstVisitKey()
      let ts = localStorage.getItem(key)
      if (!ts) return true // Noch nie → zählt als Testphase-Start
      const first = parseInt(ts, 10)
      if (Number.isNaN(first)) return true
      return (Date.now() - first) <= ADMIN_TESTPHASE_MS
    } catch { return false }
  }
  const setFirstVisitNow = () => {
    try {
      const key = getFirstVisitKey()
      if (!localStorage.getItem(key)) localStorage.setItem(key, String(Date.now()))
    } catch (_) {}
  }
  const testPhaseEndDate = (): string => {
    try {
      const key = getFirstVisitKey()
      const ts = localStorage.getItem(key)
      if (!ts) return ''
      const first = parseInt(ts, 10)
      if (Number.isNaN(first)) return ''
      const end = new Date(first + ADMIN_TESTPHASE_MS)
      return end.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })
    } catch { return '' }
  }
  const daysLeftInTestPhase = (): number => {
    try {
      const key = getFirstVisitKey()
      const ts = localStorage.getItem(key)
      if (!ts) return ADMIN_TESTPHASE_DAYS
      const first = parseInt(ts, 10)
      if (Number.isNaN(first)) return ADMIN_TESTPHASE_DAYS
      const elapsed = Date.now() - first
      if (elapsed >= ADMIN_TESTPHASE_MS) return 0
      return Math.ceil((ADMIN_TESTPHASE_MS - elapsed) / (24 * 60 * 60 * 1000))
    } catch { return 0 }
  }

  // Aktuelles Admin-Passwort (K2 aus Stammdaten, ök2 aus eigenem Key)
  const getCurrentAdminPassword = (): string => {
    if (musterOnly) {
      try {
        return localStorage.getItem(KEY_OEF_ADMIN_PASSWORD) || ''
      } catch { return '' }
    }
    try {
      const galleryStored = localStorage.getItem('k2-stammdaten-galerie')
      if (galleryStored) {
        const data = JSON.parse(galleryStored)
        return data.adminPassword || 'k2Galerie2026'
      }
    } catch (_) {}
    return 'k2Galerie2026'
  }

  const grantAdminAccess = () => {
    try {
      setFirstVisitNow()
      sessionStorage.setItem('k2-admin-context', musterOnly ? 'oeffentlich' : 'k2')
      if (rememberAdmin && !musterOnly) {
        localStorage.setItem('k2-admin-unlocked', 'k2')
        localStorage.setItem('k2-admin-unlocked-expiry', String(Date.now() + 30 * 24 * 60 * 60 * 1000))
      } else if (!rememberAdmin) {
        localStorage.removeItem('k2-admin-unlocked')
        localStorage.removeItem('k2-admin-unlocked-expiry')
      }
    } catch (_) {}
    navigate(musterOnly ? '/admin?context=oeffentlich' : '/admin')
    setShowAdminModal(false)
    setAdminPasswordInput('')
    setShowSetPassword(false)
    setShowForgotPassword(false)
    setForgotSent(false)
  }

  // Admin-Login Funktion
  const handleAdminLogin = () => {
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname === '192.168.0.31' ||
                       window.location.hostname === '192.168.0.27'
    
    if (isLocalhost) {
      try {
        sessionStorage.setItem('k2-admin-context', musterOnly ? 'oeffentlich' : 'k2')
        if (rememberAdmin && !musterOnly) {
          localStorage.setItem('k2-admin-unlocked', 'k2')
          localStorage.setItem('k2-admin-unlocked-expiry', String(Date.now() + 30 * 24 * 60 * 60 * 1000))
        }
      } catch (_) {}
      navigate(musterOnly ? '/admin?context=oeffentlich' : '/admin')
      return
    }
    
    setFirstVisitNow()
    // Testphase: innerhalb 2 Wochen und noch kein Passwort gesetzt → ohne Passwort rein
    if (isInTestPhase() && !getCurrentAdminPassword()) {
      grantAdminAccess()
      return
    }
    
    const currentPassword = getCurrentAdminPassword()
    if (adminPasswordInput === currentPassword) {
      try {
        sessionStorage.setItem('k2-admin-context', musterOnly ? 'oeffentlich' : 'k2')
        if (rememberAdmin && !musterOnly) {
          localStorage.setItem('k2-admin-unlocked', 'k2')
          localStorage.setItem('k2-admin-unlocked-expiry', String(Date.now() + 30 * 24 * 60 * 60 * 1000))
        } else if (!rememberAdmin) {
          localStorage.removeItem('k2-admin-unlocked')
          localStorage.removeItem('k2-admin-unlocked-expiry')
        }
      } catch (_) {}
      navigate(musterOnly ? '/admin?context=oeffentlich' : '/admin')
      setShowAdminModal(false)
      setAdminPasswordInput('')
    } else {
      alert('❌ Falsches Passwort')
      setAdminPasswordInput('')
    }
  }

  // Admin-Button Klick Handler (K2/ök2/VK2 strikt getrennt)
  const handleAdminButtonClick = () => {
    // VK2-Galerie: immer in VK2-Admin (Mitglieder, Werke), nie K2-Admin
    if (vk2) {
      try { sessionStorage.setItem('k2-admin-context', 'vk2') } catch (_) {}
      navigate('/admin?context=vk2')
      return
    }
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname === '192.168.0.31' ||
                       window.location.hostname === '192.168.0.27'
    
    if (isLocalhost) {
      try { sessionStorage.setItem('k2-admin-context', musterOnly ? 'oeffentlich' : 'k2') } catch (_) {}
      navigate(musterOnly ? '/admin?context=oeffentlich' : '/admin')
      return
    }
    // Von ök2-Galerie: nur ök2-Zugang – nie K2-Session/k2-admin-unlocked prüfen (sonst käme Gast mit K2-Passwort in K2-Admin)
    if (musterOnly) {
      try {
        if (sessionStorage.getItem('k2-admin-context') === 'oeffentlich') {
          navigate('/admin?context=oeffentlich')
          return
        }
      } catch (_) {}
      setFirstVisitNow()
      if (isInTestPhase() && !getCurrentAdminPassword()) {
        grantAdminAccess()
        return
      }
      setShowAdminModal(true)
      return
    }
    // K2-Galerie: bestehende K2-Session / „Passwort merken“ nutzen
    try {
      if (sessionStorage.getItem('k2-admin-context') === 'k2') {
        navigate('/admin')
        return
      }
      const unlocked = localStorage.getItem('k2-admin-unlocked')
      const expiry = localStorage.getItem('k2-admin-unlocked-expiry')
      if (unlocked === 'k2' && (!expiry || Date.now() <= parseInt(expiry, 10))) {
        sessionStorage.setItem('k2-admin-context', 'k2')
        navigate('/admin')
        return
      }
    } catch (_) {}
    setFirstVisitNow()
    if (isInTestPhase() && !getCurrentAdminPassword()) {
      grantAdminAccess()
      return
    }
    setShowAdminModal(true)
  }

  // Passwort setzen (ök2: eigener Key; K2: in Stammdaten speichern)
  const handleSetPassword = () => {
    if (setPasswordNew.length < 6) {
      alert('Passwort muss mindestens 6 Zeichen haben.')
      return
    }
    if (setPasswordNew !== setPasswordConfirm) {
      alert('Passwort und Wiederholung stimmen nicht überein.')
      return
    }
    try {
      if (musterOnly) {
        localStorage.setItem(KEY_OEF_ADMIN_PASSWORD, setPasswordNew)
        if (setPasswordEmail.trim()) localStorage.setItem(KEY_OEF_ADMIN_EMAIL, setPasswordEmail.trim())
        if (setPasswordPhone.trim()) localStorage.setItem(KEY_OEF_ADMIN_PHONE, setPasswordPhone.trim())
      } else {
        const galleryStored = localStorage.getItem('k2-stammdaten-galerie')
        const data = galleryStored ? JSON.parse(galleryStored) : {}
        data.adminPassword = setPasswordNew
        localStorage.setItem('k2-stammdaten-galerie', JSON.stringify(data))
      }
      alert('✅ Passwort wurde gespeichert. Du kannst es beim nächsten Mal zum Anmelden nutzen.')
      setShowSetPassword(false)
      setSetPasswordNew('')
      setSetPasswordConfirm('')
      setSetPasswordEmail('')
      setSetPasswordPhone('')
    } catch (e) {
      alert('Speichern fehlgeschlagen.')
    }
  }

  // Passwort vergessen: E-Mail/Tel anfordern → Hinweis (E-Mail-Versand kann später aktiviert werden)
  const handleForgotPassword = () => {
    const contact = musterOnly
      ? (localStorage.getItem(KEY_OEF_ADMIN_EMAIL) || localStorage.getItem(KEY_OEF_ADMIN_PHONE) || '')
      : (() => {
          try {
            const g = localStorage.getItem('k2-stammdaten-galerie')
            const d = g ? JSON.parse(g) : {}
            return d.email || d.phone || ''
          } catch { return '' }
        })()
    setForgotSent(true)
    if (forgotEmailOrPhone.trim()) {
      // TODO: Backend-Anbindung für E-Mail/SMS – bis dahin Hinweis
      const msg = contact
        ? `Falls ein Zugang mit dieser Angabe existiert, wird in Kürze ein Link zum Zurücksetzen gesendet.\n\n(E-Mail-Versand wird aktiviert – bis dahin: Kontakt unter ${contact} für manuellen Reset.)`
        : 'Falls ein Zugang mit dieser Angabe existiert, wird in Kürze ein Link zum Zurücksetzen gesendet.\n\n(E-Mail-Versand wird aktiviert.)'
      alert(msg)
    }
  }

  const theme = musterOnly
    ? { text: 'var(--k2-text)', muted: 'var(--k2-muted)', accent: 'var(--k2-accent)', accentGradient: 'linear-gradient(135deg, var(--k2-accent) 0%, #6b9080 100%)', cardBg: 'var(--k2-card-bg-1)' }
    : { text: 'var(--k2-text)', muted: 'var(--k2-muted)', accent: 'var(--k2-accent)', accentGradient: 'linear-gradient(135deg, var(--k2-accent) 0%, #e67a2a 100%)', cardBg: 'var(--k2-card-bg-1)' }

  // Vita im Nutzer-Design öffnen (gleiches Layout wie Einladung/Presse)
  const openVita = (personId: 'martina' | 'georg') => {
    try {
      const designStored = typeof window !== 'undefined' ? localStorage.getItem('k2-design-settings') : null
      const design = designStored ? (JSON.parse(designStored) as Record<string, string>) : {}
      const designForVita = {
        accentColor: design.accentColor || OK2_THEME.accentColor,
        backgroundColor1: design.backgroundColor1 || OK2_THEME.backgroundColor1,
        textColor: design.textColor || OK2_THEME.textColor,
        mutedColor: design.mutedColor || OK2_THEME.mutedColor
      }
      let data: { name: string; email?: string; phone?: string; website?: string; vita: string }
      let galleryName: string | undefined
      if (musterOnly) {
        const m = personId === 'martina' ? MUSTER_TEXTE.martina : MUSTER_TEXTE.georg
        data = { name: m.name, email: m.email, phone: m.phone, website: m.website, vita: personId === 'martina' ? MUSTER_VITA_MARTINA : MUSTER_VITA_GEORG }
        galleryName = 'Galerie Muster'
      } else {
        const key = personId === 'martina' ? 'k2-stammdaten-martina' : 'k2-stammdaten-georg'
        const raw = localStorage.getItem(key)
        const parsed = raw ? JSON.parse(raw) : {}
        data = {
          name: parsed.name || (personId === 'martina' ? K2_STAMMDATEN_DEFAULTS.martina.name : K2_STAMMDATEN_DEFAULTS.georg.name),
          email: parsed.email,
          phone: parsed.phone,
          website: parsed.website,
          vita: (parsed.vita && String(parsed.vita).trim()) ? parsed.vita : (personId === 'martina' ? MUSTER_VITA_MARTINA : MUSTER_VITA_GEORG)
        }
        const g = localStorage.getItem('k2-stammdaten-galerie')
        const gParsed = g ? JSON.parse(g) : {}
        galleryName = gParsed.name
      }
      const html = buildVitaDocumentHtml(personId, data, designForVita, galleryName)
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const opened = window.open(url, '_blank')
      if (!opened) alert('Pop-up wurde blockiert. Bitte Fenster erlauben und erneut tippen.')
      setTimeout(() => URL.revokeObjectURL(url), 5000)
    } catch (e) {
      alert('Vita konnte nicht geöffnet werden.')
    }
  }

  const isVorschauModus = typeof window !== 'undefined' && new URLSearchParams(location.search).get('vorschau') === '1'

  return (
    <div style={{ 
      minHeight: '-webkit-fill-available',
      background: vk2
        ? 'linear-gradient(135deg, var(--k2-bg-1) 0%, var(--k2-bg-2) 50%, var(--k2-bg-3) 100%)'
        : musterOnly
        ? 'linear-gradient(135deg, var(--k2-bg-1) 0%, var(--k2-bg-2) 50%, var(--k2-bg-3) 100%)'
        : 'linear-gradient(135deg, var(--k2-bg-1) 0%, var(--k2-bg-2) 50%, var(--k2-bg-3) 100%)',
      color: 'var(--k2-text)',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Vorschau aus Einstellungen „Seiten prüfen“ – Zurück-Link */}
      {isVorschauModus && (
        <div style={{
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          padding: '0.6rem 1rem',
          background: 'rgba(245, 158, 11, 0.95)',
          color: '#1a1a1a',
          fontSize: '0.95rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}>
          <button
            type="button"
            onClick={() => navigate(vk2 ? '/admin?context=vk2' : '/admin')}
            style={{ background: 'rgba(0,0,0,0.2)', border: 'none', color: 'inherit', padding: '0.4rem 0.8rem', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
          >
            ← Zurück zu Einstellungen
          </button>
          <span style={{ opacity: 0.9 }}>Vorschau – hier siehst du deine gespeicherten Änderungen</span>
        </div>
      )}
      {/* Animated Background Elements – VK2/K2: Orange (Hausherr), ök2: dezent */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: vk2
          ? 'radial-gradient(circle at 20% 50%, rgba(255, 140, 66, 0.12), transparent 50%), radial-gradient(circle at 80% 80%, rgba(212, 165, 116, 0.08), transparent 50%)'
          : musterOnly
          ? 'radial-gradient(circle at 30% 40%, rgba(90, 122, 110, 0.08), transparent 50%), radial-gradient(circle at 70% 70%, rgba(90, 122, 110, 0.05), transparent 50%)'
          : 'radial-gradient(circle at 20% 50%, rgba(255, 140, 66, 0.12), transparent 50%), radial-gradient(circle at 80% 80%, rgba(212, 165, 116, 0.08), transparent 50%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Optional: Link für Internet-Zugriff – nur auf Desktop, nicht auf iPhone/iPad */}
        {isLocalOrPrivateOrigin() && !(isMobileDevice || isMobile) && (
          <div style={{
            padding: '0.5rem 1rem',
            margin: '0 0 0.5rem 0',
            background: 'rgba(0,0,0,0.2)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            fontSize: '0.8rem',
            textAlign: 'center'
          }}>
            <span style={{ marginRight: '0.5rem', color: musterOnly ? 'var(--k2-text)' : 'rgba(255,255,255,0.75)' }}>
              Auch aus anderem WLAN erreichbar:
            </span>
            <a href={getK2PublicPageUrl()} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--k2-accent)', fontWeight: 600, textDecoration: 'underline' }}>
              K2 im Internet öffnen
            </a>
          </div>
        )}
        {/* Brand linkes oberes Eck – VK2 klar erkennbar, sonst K2 Galerie */}
        <div
          style={{
            position: 'fixed',
            top: 'max(clamp(0.75rem, 2vw, 1.25rem), calc(env(safe-area-inset-top, 0px) + 0.75rem))',
            left: 'clamp(1rem, 2vw, 1.5rem)',
            zIndex: 100,
            pointerEvents: 'none'
          }}
        >
          <div style={{
            fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
            fontWeight: '600',
            color: 'var(--k2-text)',
            letterSpacing: '0.02em',
            lineHeight: 1.25,
            textShadow: musterOnly ? 'none' : '0 1px 2px rgba(0,0,0,0.2)'
          }}>
            {vk2 ? 'VK2 Vereinsplattform' : PRODUCT_BRAND_NAME}
          </div>
        </div>
        {/* VK2: deutlicher Balken, damit klar ist: das ist die Vereinsplattform-Galerie, nicht K2 */}
        {vk2 && (
          <div style={{
            position: 'sticky',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 99,
            padding: '0.6rem 1rem',
            background: 'linear-gradient(135deg, rgba(255, 140, 66, 0.25), rgba(230, 122, 42, 0.2))',
            color: '#fff',
            fontSize: '1rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            border: '1px solid rgba(255, 140, 66, 0.3)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            marginBottom: '1rem'
          }}>
            <span>VK2 Vereinsplattform – Galerie</span>
            <button
              type="button"
              onClick={handleAdminButtonClick}
              style={{
                padding: '0.35rem 0.75rem',
                background: 'rgba(255,255,255,0.25)',
                border: '1px solid rgba(255,255,255,0.5)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Admin
            </button>
          </div>
        )}
        {/* Admin Button – auf normaler Galerie, ök2 und VK2 (VK2: K2-Familie Orange) */}
        {/* iPhone: safe-area-inset-top + größerer Abstand, damit Button unter Notch sichtbar bleibt */}
        <button
          onClick={handleAdminButtonClick}
          style={{
            position: 'fixed',
            top: 'max(clamp(1rem, 2vw, 1.5rem), calc(env(safe-area-inset-top, 0px) + 1rem))',
            right: 'clamp(1rem, 2vw, 1.5rem)',
            background: vk2 ? 'linear-gradient(135deg, rgba(255, 140, 66, 0.35), rgba(230, 122, 42, 0.3))' : musterOnly ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: vk2 ? '1px solid rgba(255, 140, 66, 0.4)' : musterOnly ? '1px solid rgba(45, 45, 42, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)',
            color: musterOnly ? 'var(--k2-text)' : 'rgba(255, 255, 255, 0.9)',
            padding: 'clamp(0.5rem, 1.5vw, 0.75rem) clamp(0.75rem, 2vw, 1rem)',
            borderRadius: '8px',
            fontSize: 'clamp(0.7rem, 1.8vw, 0.85rem)',
            cursor: 'pointer',
            zIndex: 1000,
            transition: 'all 0.3s ease',
            opacity: vk2 ? 1 : (isMobileDevice || isMobile) ? 0.9 : 0.6,
            touchAction: 'manipulation',
            minWidth: '44px',
            minHeight: '44px',
            boxShadow: vk2 ? '0 4px 12px rgba(0,0,0,0.25)' : undefined
          }}
          onMouseEnter={(e) => {
            if (vk2) { e.currentTarget.style.opacity = '1'; e.currentTarget.style.filter = 'brightness(1.1)' } else { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = musterOnly ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.1)' }
          }}
          onMouseLeave={(e) => {
            if (vk2) { e.currentTarget.style.opacity = '1'; e.currentTarget.style.filter = 'none' } else { e.currentTarget.style.opacity = (isMobileDevice || isMobile) ? '0.9' : '0.6'; e.currentTarget.style.background = musterOnly ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.05)' }
          }}
          onTouchStart={(e) => {
            e.currentTarget.style.opacity = '1'
            if (vk2) e.currentTarget.style.filter = 'brightness(1.1)'; else e.currentTarget.style.background = musterOnly ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.15)'
          }}
          onTouchEnd={(e) => {
            setTimeout(() => {
              if (vk2) { e.currentTarget.style.opacity = '1'; e.currentTarget.style.filter = 'none' } else { e.currentTarget.style.opacity = (isMobileDevice || isMobile) ? '0.9' : '0.6'; e.currentTarget.style.background = musterOnly ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.05)' }
            }, 200)
          }}
        >
          ⚙️ Admin
        </button>
        
        {/* Aktualisieren Button ENTFERNT - Automatisches Polling alle 10 Sekunden aktiv! */}
        {/* Neue Werke werden automatisch synchronisiert - kein manueller Button nötig */}

        {/* Admin Login Modal – auch von ök2-Willkommensseite erreichbar */}
        {showAdminModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
              padding: '1rem'
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowAdminModal(false)
                setAdminPasswordInput('')
                setShowSetPassword(false)
                setShowForgotPassword(false)
                setForgotSent(false)
              }
            }}
          >
            <div
              style={{
                background: musterOnly ? 'linear-gradient(135deg, var(--k2-bg-1) 0%, var(--k2-bg-2) 100%)' : 'linear-gradient(135deg, var(--k2-bg-1) 0%, var(--k2-bg-2) 100%)',
                border: musterOnly ? '1px solid rgba(45, 45, 42, 0.15)' : '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                padding: 'clamp(2rem, 5vw, 3rem)',
                maxWidth: '400px',
                width: '100%',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {showForgotPassword ? (
                <>
                  <h3 style={{ margin: '0 0 1rem', fontSize: 'clamp(1.1rem, 2.8vw, 1.35rem)', fontWeight: 600, color: '#ffffff', textAlign: 'center' }}>
                    Passwort zurücksetzen
                  </h3>
                  <p style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)', textAlign: 'center' }}>
                    E-Mail oder Telefonnummer eingeben – du erhältst einen Link zum Zurücksetzen.
                  </p>
                  {!forgotSent ? (
                    <>
                      <input
                        type="text"
                        value={forgotEmailOrPhone}
                        onChange={(e) => setForgotEmailOrPhone(e.target.value)}
                        placeholder="E-Mail oder Telefon"
                        style={{
                          width: '100%',
                          padding: 'clamp(0.75rem, 2vw, 1rem)',
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: 12,
                          color: '#ffffff',
                          fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                          marginBottom: '1rem',
                          boxSizing: 'border-box'
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        style={{
                          width: '100%',
                          padding: 'clamp(0.75rem, 2vw, 1rem)',
                          background: 'linear-gradient(135deg, var(--k2-accent) 0%, #e67a2a 100%)',
                          border: 'none',
                          borderRadius: 12,
                          color: '#ffffff',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: '1rem'
                        }}
                      >
                        Link anfordern
                      </button>
                    </>
                  ) : (
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>
                      Falls ein Zugang existiert, wurde ein Hinweis gesendet. Prüfe deine E-Mail bzw. nutze bei Bedarf den Kontakt für manuellen Reset.
                    </p>
                  )}
                  <button type="button" onClick={() => { setShowForgotPassword(false); setForgotSent(false); setForgotEmailOrPhone('') }} style={{ marginTop: '1rem', background: 'none', border: 'none', color: 'var(--k2-accent)', cursor: 'pointer', fontSize: '0.9rem' }}>← Zurück</button>
                </>
              ) : showSetPassword ? (
                <>
                  <h3 style={{ margin: '0 0 1rem', fontSize: 'clamp(1.1rem, 2.8vw, 1.35rem)', fontWeight: 600, color: '#ffffff', textAlign: 'center' }}>
                    Passwort setzen
                  </h3>
                  <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', textAlign: 'center' }}>
                    Mindestens 6 Zeichen. E-Mail/Telefon optional – für Passwort-Zurücksetzen falls vergessen.
                  </p>
                  <input type="email" value={setPasswordEmail} onChange={(e) => setSetPasswordEmail(e.target.value)} placeholder="E-Mail (optional)" style={{ width: '100%', padding: '0.6rem 0.9rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, color: '#fff', fontSize: '0.9rem', marginBottom: '0.5rem', boxSizing: 'border-box' }} />
                  <input type="tel" value={setPasswordPhone} onChange={(e) => setSetPasswordPhone(e.target.value)} placeholder="Telefon (optional)" style={{ width: '100%', padding: '0.6rem 0.9rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, color: '#fff', fontSize: '0.9rem', marginBottom: '0.5rem', boxSizing: 'border-box' }} />
                  <input type="password" value={setPasswordNew} onChange={(e) => setSetPasswordNew(e.target.value)} placeholder="Neues Passwort (min. 6 Zeichen)" style={{ width: '100%', padding: '0.6rem 0.9rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, color: '#fff', fontSize: '0.9rem', marginBottom: '0.5rem', boxSizing: 'border-box' }} />
                  <input type="password" value={setPasswordConfirm} onChange={(e) => setSetPasswordConfirm(e.target.value)} placeholder="Passwort wiederholen" style={{ width: '100%', padding: '0.6rem 0.9rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, color: '#fff', fontSize: '0.9rem', marginBottom: '1rem', boxSizing: 'border-box' }} />
                  <button type="button" onClick={handleSetPassword} style={{ width: '100%', padding: '0.75rem', background: 'linear-gradient(135deg, var(--k2-accent) 0%, #e67a2a 100%)', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}>Passwort speichern</button>
                  <button type="button" onClick={() => setShowSetPassword(false)} style={{ marginTop: '0.75rem', background: 'none', border: 'none', color: 'var(--k2-accent)', cursor: 'pointer', fontSize: '0.9rem' }}>← Zurück</button>
                </>
              ) : (
                <>
              <h3 style={{
                margin: '0 0 1.5rem',
                fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
                fontWeight: '600',
                color: '#ffffff',
                textAlign: 'center'
              }}>
                Admin-Zugang
              </h3>
              {isInTestPhase() && (
                <p style={{ margin: '0 0 1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.08)', borderRadius: 10, fontSize: '0.85rem', color: 'rgba(255,255,255,0.9)' }}>
                  Du bist in der Testphase (noch {daysLeftInTestPhase()} Tage bis {testPhaseEndDate()}). Optional: Passwort setzen, um später wiederzukommen.
                </p>
              )}
              <input
                type="password"
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAdminLogin()
                  }
                }}
                placeholder={isInTestPhase() && !getCurrentAdminPassword() ? 'Leer lassen für Testphase oder Passwort eingeben' : 'Passwort eingeben'}
                style={{
                  width: '100%',
                  padding: 'clamp(0.75rem, 2vw, 1rem)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                  marginBottom: '0.75rem',
                  boxSizing: 'border-box'
                }}
                autoFocus
              />
              {!musterOnly && (
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
                cursor: 'pointer',
                fontSize: 'clamp(0.85rem, 2.2vw, 0.95rem)',
                color: 'rgba(255, 255, 255, 0.85)'
              }}>
                <input
                  type="checkbox"
                  checked={rememberAdmin}
                  onChange={(e) => setRememberAdmin(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--k2-accent)' }}
                />
                Passwort merken (30 Tage, auch auf Mobil)
              </label>
              )}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button type="button" onClick={() => setShowSetPassword(true)} style={{ background: 'none', border: 'none', color: 'var(--k2-accent)', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}>Passwort setzen</button>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>·</span>
                <button type="button" onClick={() => setShowForgotPassword(true)} style={{ background: 'none', border: 'none', color: 'var(--k2-accent)', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}>Passwort vergessen?</button>
              </div>
              <div style={{
                display: 'flex',
                gap: '1rem'
              }}>
                <button
                  onClick={() => {
                    setShowAdminModal(false)
                    setAdminPasswordInput('')
                    setShowSetPassword(false)
                    setShowForgotPassword(false)
                  }}
                  style={{
                    flex: 1,
                    padding: 'clamp(0.75rem, 2vw, 1rem)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleAdminLogin}
                  style={{
                    flex: 1,
                    padding: 'clamp(0.75rem, 2vw, 1rem)',
                    background: 'linear-gradient(135deg, var(--k2-accent) 0%, #e67a2a 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.3)'
                  }}
                >
                  Anmelden
                </button>
              </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Hero Section – VK2: eigener, schlanker Block (nicht K2-Kopie) */}
        {vk2 ? (
          <header style={{
            padding: 'clamp(1.5rem, 4vw, 2.5rem) clamp(1.5rem, 4vw, 3rem)',
            paddingTop: 'clamp(2rem, 6vw, 3.5rem)',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {/* Foto oben */}
            {vk2WelcomeImage && (
              <div style={{
                width: '100%',
                maxWidth: '100%',
                marginBottom: 'clamp(1.5rem, 4vw, 2.5rem)',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
              }}>
                <img
                  src={vk2WelcomeImage}
                  alt="VK2 Vereinsplattform"
                  style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover', maxHeight: 'min(50vh, 360px)' }}
                />
              </div>
            )}
            <h1 style={{
              margin: 0,
              fontSize: 'clamp(2rem, 6vw, 3.5rem)',
              fontWeight: '700',
              color: '#fff',
              letterSpacing: '-0.02em',
              lineHeight: '1.15'
            }}>
              VK2 Vereinsplattform
            </h1>
            <p style={{
              margin: '0.5rem 0 0',
              color: 'rgba(255,255,255,0.9)',
              fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
              fontWeight: '400'
            }}>
              Künstler:innen & Werke des Vereins
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
              gap: 'clamp(1.5rem, 4vw, 2.5rem)',
              alignItems: 'start',
              marginTop: 'clamp(1.5rem, 4vw, 2.5rem)'
            }}>
              <div>
                <p style={{
                  margin: 0,
                  color: 'rgba(255,255,255,0.88)',
                  fontSize: 'clamp(1rem, 2.5vw, 1.15rem)',
                  lineHeight: 1.6,
                  fontWeight: '300'
                }}>
                  {(galerieTexts.welcomeIntroText ?? '').trim() || 'Künstler:innen und Werke der Vereinsplattform.'}
                </p>
                <Link
                  to={PROJECT_ROUTES.vk2.galerieVorschau}
                  style={{
                    display: 'inline-block',
                    marginTop: 'clamp(1.25rem, 3vw, 1.75rem)',
                    padding: 'clamp(0.85rem, 2vw, 1rem) clamp(1.75rem, 4vw, 2.25rem)',
                    background: 'linear-gradient(135deg, var(--k2-accent) 0%, #e67a2a 100%)',
                    color: '#fff',
                    textDecoration: 'none',
                    borderRadius: '12px',
                    fontSize: 'clamp(1rem, 2.5vw, 1.1rem)',
                    fontWeight: '600',
                    boxShadow: '0 8px 24px rgba(255, 140, 66, 0.4)'
                  }}
                >
                  Werke ansehen →
                </Link>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                borderLeft: '4px solid rgba(255, 140, 66, 0.5)'
              }}>
                <p style={{ margin: '0 0 0.75rem', fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)', fontWeight: '600' }}>
                  {galerieTexts.eventSectionHeading || 'Termine & Events'}
                </p>
                {vk2UpcomingEvents.length === 0 ? (
                  <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: 'clamp(0.95rem, 2vw, 1.05rem)' }}>
                    Derzeit keine anstehenden Termine.
                  </p>
                ) : (
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#fff', fontSize: 'clamp(0.95rem, 2vw, 1.05rem)', lineHeight: 1.6 }}>
                    {vk2UpcomingEvents.map((ev: any) => (
                      <li key={ev.id || ev.date} style={{ marginBottom: '0.5rem' }}>
                        <strong>{ev.title}</strong>
                        {ev.date && (
                          <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: '400' }}>
                            {' — '}{formatEventDateRange(ev.date, ev.endDate)}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </header>
        ) : (
        <>
        {/* Hero Section (K2 / ök2) – Bild zuerst, dann Titel: sofortiger visueller Eindruck */}
        <header style={{
          maxWidth: '1400px',
          margin: '0 auto',
          paddingBottom: 'clamp(2rem, 5vw, 3rem)'
        }}>
          {/* Bild ganz oben – volle Breite, dominant. SVG-Musterbilder = kein echtes Foto → Text-Hero stattdessen */}
          {displayImages.welcomeImage && !displayImages.welcomeImage.endsWith('.svg') && !displayImages.welcomeImage.startsWith('data:image/svg') && (
            <div style={{
              width: '100%',
              height: 'clamp(220px, 40vw, 520px)',
              overflow: 'hidden',
              position: 'relative',
              marginBottom: 0,
            }}>
              <img
                src={musterOnly && welcomeImageFailed ? OEK2_PLACEHOLDER_IMAGE : displayImages.welcomeImage}
                alt={musterOnly ? tenantConfig.galleryName : ((galerieTexts.heroTitle ?? '').trim() || tenantConfig.galleryName)}
                onError={() => { if (musterOnly) setWelcomeImageFailed(true) }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              {/* Dunkler Gradient unten – Titel lesbar */}
              <div style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0,
                height: '55%',
                background: musterOnly
                  ? 'linear-gradient(to top, rgba(240,237,232,0.97) 0%, rgba(240,237,232,0.6) 60%, transparent 100%)'
                  : 'linear-gradient(to top, rgba(14,12,10,0.96) 0%, rgba(14,12,10,0.55) 60%, transparent 100%)',
                pointerEvents: 'none',
              }} />
              {/* Titel über dem Bild */}
              <div style={{
                position: 'absolute',
                bottom: 'clamp(1.25rem, 4vw, 2.5rem)',
                left: 'clamp(1.25rem, 4vw, 3rem)',
                right: 'clamp(1.25rem, 4vw, 3rem)',
              }}>
                <p style={{
                  margin: '0 0 0.3rem',
                  fontSize: 'clamp(0.7rem, 1.8vw, 0.85rem)',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: musterOnly ? 'var(--k2-muted)' : 'rgba(255,255,255,0.6)',
                  fontWeight: 500,
                }}>
                  {musterOnly ? 'Willkommen bei' : ((galerieTexts.welcomeHeading ?? 'Willkommen bei').trim() || 'Willkommen bei')}
                </p>
                <h1 style={{
                  margin: 0,
                  fontSize: 'clamp(1.8rem, 5vw, 3.5rem)',
                  fontWeight: 700,
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                  color: musterOnly ? 'var(--k2-text)' : '#fff',
                }}>
                  {musterOnly ? tenantConfig.galleryName : ((galerieTexts.heroTitle ?? '').trim() || tenantConfig.galleryName)}
                </h1>
                <p style={{
                  margin: '0.5rem 0 0',
                  fontSize: 'clamp(0.95rem, 2.5vw, 1.2rem)',
                  fontWeight: 300,
                  color: musterOnly ? 'var(--k2-accent)' : 'rgba(255,255,255,0.75)',
                  letterSpacing: '0.02em',
                }}>
                  {musterOnly ? tenantConfig.tagline : ((galerieTexts.welcomeSubtext ?? '').trim() || tenantConfig.tagline)}
                </p>
              </div>
            </div>
          )}

          {/* Kein echtes Foto: klassischer Text-Hero */}
          {(!displayImages.welcomeImage || displayImages.welcomeImage.endsWith('.svg') || displayImages.welcomeImage.startsWith('data:image/svg')) && (
            <div style={{
              padding: 'clamp(2.5rem, 7vw, 4.5rem) clamp(1.5rem, 4vw, 3rem) clamp(1.5rem, 4vw, 2.5rem)',
              borderBottom: musterOnly ? '1px solid rgba(90,122,110,0.15)' : '1px solid rgba(255,255,255,0.08)',
            }}>
              <p style={{
                margin: '0 0 0.5rem',
                fontSize: 'clamp(0.7rem, 1.8vw, 0.82rem)',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: musterOnly ? 'var(--k2-accent)' : 'rgba(255,255,255,0.45)',
                fontWeight: 600,
              }}>
                {musterOnly ? 'Willkommen bei' : ((galerieTexts.welcomeHeading ?? 'Willkommen bei').trim() || 'Willkommen bei')}
              </p>
              <h1 style={{
                margin: '0 0 0.6rem',
                fontSize: 'clamp(2.8rem, 9vw, 5rem)',
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
                color: musterOnly ? 'var(--k2-text)' : '#fff',
              }}>
                {musterOnly ? tenantConfig.galleryName : ((galerieTexts.heroTitle ?? '').trim() || tenantConfig.galleryName)}
              </h1>
              {/* Dekorative Linie */}
              <div style={{
                width: 'clamp(2.5rem, 6vw, 4rem)',
                height: '3px',
                background: musterOnly ? 'var(--k2-accent)' : 'var(--k2-accent)',
                borderRadius: '2px',
                margin: '0.9rem 0 1rem',
              }} />
              <p style={{
                margin: '0 0 1.1rem',
                fontSize: 'clamp(1.05rem, 3vw, 1.35rem)',
                fontWeight: 300,
                color: musterOnly ? 'var(--k2-accent)' : 'rgba(255,255,255,0.7)',
                letterSpacing: '0.02em',
                fontStyle: 'italic',
              }}>
                {musterOnly ? tenantConfig.tagline : ((galerieTexts.welcomeSubtext ?? '').trim() || tenantConfig.tagline)}
              </p>
              <p style={{
                margin: 0,
                fontSize: 'clamp(0.95rem, 2.4vw, 1.1rem)',
                color: musterOnly ? 'var(--k2-muted)' : 'rgba(255,255,255,0.7)',
                lineHeight: 1.75,
                fontWeight: 300,
                maxWidth: '620px',
              }}>
                {musterOnly ? MUSTER_TEXTE.welcomeText : (galerieTexts.welcomeIntroText?.trim() || 'Ein Neuanfang mit Leidenschaft. Entdecke die Verbindung von Malerei und Keramik in einem Raum, wo Kunst zum Leben erwacht.')}
              </p>
            </div>
          )}

          {/* Willkommens-Text + Anker (nur wenn echtes Bild vorhanden – Text dann separat unter Bild) */}
          {displayImages.welcomeImage && !displayImages.welcomeImage.endsWith('.svg') && !displayImages.welcomeImage.startsWith('data:image/svg') && (
          <section ref={willkommenRef} id="willkommen" style={{
            padding: 'clamp(1.5rem, 4vw, 2.5rem) clamp(1.25rem, 4vw, 3rem) 0',
            maxWidth: '720px',
          }}>
            <p style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
              color: musterOnly ? 'var(--k2-muted)' : 'rgba(255,255,255,0.75)',
              lineHeight: 1.75,
              fontWeight: 300,
              margin: 0,
            }}>
              {musterOnly ? MUSTER_TEXTE.welcomeText : (galerieTexts.welcomeIntroText?.trim() || 'Ein Neuanfang mit Leidenschaft. Entdecke die Verbindung von Malerei und Keramik in einem Raum, wo Kunst zum Leben erwacht.')}
            </p>
          </section>
          )}
          {/* Anker auch ohne Bild */}
          <span ref={willkommenRef} id="willkommen" />
        </header>

        <main style={{
          padding: '0 clamp(1.5rem, 4vw, 3rem)',
          paddingBottom: 'clamp(4rem, 10vw, 6rem)',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>

          {/* Aktuelles aus den Eventplanungen – zwischen Foto und Kunstschaffende (K2, ök2, VK2) */}
          {((musterOnly && upcomingEventsOeffentlich.length > 0) || (!musterOnly && !vk2 && upcomingEvents.length > 0) || (vk2 && vk2UpcomingEvents.length > 0)) && (
            <section style={{
              marginTop: 'clamp(2rem, 5vw, 3rem)',
              padding: 'clamp(1rem, 3vw, 1.5rem) clamp(1.25rem, 3vw, 1.75rem)',
              background: musterOnly ? 'rgba(107, 144, 128, 0.12)' : vk2 ? 'rgba(255, 140, 66, 0.1)' : 'rgba(184, 184, 255, 0.08)',
              border: musterOnly ? '1px solid rgba(107, 144, 128, 0.3)' : vk2 ? '1px solid rgba(255, 140, 66, 0.25)' : '1px solid rgba(184, 184, 255, 0.2)',
              borderRadius: '16px',
              borderLeft: musterOnly ? '4px solid #6b9080' : vk2 ? '4px solid var(--k2-accent)' : '4px solid rgba(184, 184, 255, 0.6)'
            }}>
              <p style={{ margin: '0 0 0.5rem', fontSize: 'clamp(0.75rem, 2vw, 0.85rem)', letterSpacing: '0.08em', textTransform: 'uppercase', color: musterOnly ? 'var(--k2-muted)' : vk2 ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.6)', fontWeight: '600' }}>
                {galerieTexts.eventSectionHeading || 'Demnächst bei uns'}
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', color: musterOnly ? 'var(--k2-text)' : '#ffffff', fontSize: 'clamp(1rem, 2.5vw, 1.15rem)', lineHeight: 1.6 }}>
                {(musterOnly ? upcomingEventsOeffentlich : vk2 ? vk2UpcomingEvents : upcomingEvents).map((ev: any) => (
                  <li key={ev.id || ev.date} style={{ marginBottom: ev.documents?.length ? '0.5rem' : 0 }}>
                    <strong>{ev.title}</strong>
                    {ev.date && (
                      <span style={{ color: musterOnly ? 'var(--k2-muted)' : vk2 ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.85)', fontWeight: '400' }}>
                        {' — '}{formatEventDateRange(ev.date, ev.endDate)}
                      </span>
                    )}
                    {ev.documents && ev.documents.length > 0 && (
                      <ul style={{ margin: '0.25rem 0 0 1rem', paddingLeft: '0.75rem', listStyle: 'none', fontSize: '0.95em' }}>
                        {ev.documents.map((doc: any) => (
                          <li key={doc.id || doc.name}>
                            <button
                              type="button"
                              onClick={() => openEventDocument(doc)}
                              style={{
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                color: musterOnly ? '#6b9080' : vk2 ? 'var(--k2-accent)' : 'rgba(184, 184, 255, 0.95)',
                                textDecoration: 'underline',
                                cursor: 'pointer',
                                font: 'inherit'
                              }}
                            >
                              📎 {doc.name || doc.fileName || 'Dokument'}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Kunstschaffende Section */}
          <section ref={kunstschaffendeRef} id="kunstschaffende" style={{ 
            marginTop: 'clamp(3rem, 8vw, 5rem)'
          }}>
            <h3 style={{ 
              fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', 
              marginBottom: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: '700',
              color: 'var(--k2-text)',
              textAlign: 'center',
              letterSpacing: '-0.02em'
            }}>
              {galerieTexts.kunstschaffendeHeading || 'Die Kunstschaffenden'}
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(280px, 40vw, 400px), 1fr))',
              gap: 'clamp(1.5rem, 4vw, 2.5rem)',
              marginBottom: 'clamp(3rem, 8vw, 4rem)'
            }}>
              {/* Martina – Malerei: Karte mit Pinsel-Akzent, asymmetrisch */}
              <div style={{
                position: 'relative',
                background: 'linear-gradient(145deg, rgba(255, 140, 66, 0.08) 0%, rgba(255, 255, 255, 0.04) 50%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(184, 184, 255, 0.2)',
                borderRadius: '24px 24px 8px 24px',
                padding: 'clamp(2rem, 5vw, 3rem)',
                textAlign: 'left',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
                transition: 'all 0.35s ease',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px) scale(1.01)'
                e.currentTarget.style.boxShadow = '0 28px 70px rgba(102, 126, 234, 0.25), inset 0 1px 0 rgba(255,255,255,0.08)'
                e.currentTarget.style.borderColor = 'rgba(184, 184, 255, 0.35)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.06)'
                e.currentTarget.style.borderColor = 'rgba(184, 184, 255, 0.2)'
              }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '60%', background: 'linear-gradient(180deg, var(--k2-accent) 0%, #e67a2a 100%)', borderRadius: '0 4px 4px 0' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                  {musterOnly && (MUSTER_TEXTE.martina as { photoUrl?: string }).photoUrl ? (
                    <img
                      src={(MUSTER_TEXTE.martina as { photoUrl?: string }).photoUrl}
                      alt=""
                      style={{
                        width: 'clamp(64px, 10vw, 80px)',
                        height: 'clamp(64px, 10vw, 80px)',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                        flexShrink: 0
                      }}
                    />
                  ) : (
                    <div style={{
                      width: 'clamp(64px, 10vw, 80px)',
                      height: 'clamp(64px, 10vw, 80px)',
                      borderRadius: '50%',
                      background: theme.accentGradient,
                      color: theme.text,
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
                      fontWeight: '700',
                      boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                      flexShrink: 0
                    }}>
                      {(musterOnly ? MUSTER_TEXTE.martina.name : ((tenantId === 'k2' && (martinaData.name === 'Künstlerin Muster' || !martinaData.name)) ? tenantConfig.artist1Name : (martinaData.name || tenantConfig.artist1Name))).charAt(0)}
                    </div>
                  )}
                  <div>
                    <span style={{ fontSize: 'clamp(0.75rem, 2vw, 0.85rem)', letterSpacing: '0.12em', textTransform: 'uppercase', color: musterOnly ? theme.muted : 'rgba(255,255,255,0.5)', fontWeight: '600' }}>Bilder</span>
                    <h4 style={{ margin: '0.25rem 0 0', fontSize: 'clamp(1.2rem, 3.2vw, 1.6rem)', color: theme.text, fontWeight: '600' }}>
                      {musterOnly ? MUSTER_TEXTE.martina.name : ((tenantId === 'k2' && (martinaData.name === 'Künstlerin Muster' || !martinaData.name)) ? tenantConfig.artist1Name : (martinaData.name || tenantConfig.artist1Name))}
                    </h4>
                  </div>
                </div>
                <p style={{ color: musterOnly ? theme.text : 'rgba(255, 255, 255, 0.8)', fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)', margin: 0, lineHeight: '1.7' }}>
                  {(musterOnly ? (galerieTexts.martinaBio || MUSTER_TEXTE.artist1Bio) : (galerieTexts.martinaBio || 'Martina bringt mit ihren Gemälden eine lebendige Vielfalt an Farben und Ausdruckskraft auf die Leinwand. ihre Werke spiegeln Jahre des Lernens, Experimentierens und der Leidenschaft für die Malerei wider.'))}
                </p>
                <button type="button" onClick={() => openVita('martina')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.75rem', fontSize: '0.85rem', color: theme.accent, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0, textDecoration: 'none' }} title="Vita öffnen">
                  <span aria-hidden>📄</span> Vita
                </button>
              </div>
              
              {/* Georg – Keramik: Karte mit Ton-Akzent, andere Ecke betont */}
              <div style={{
                position: 'relative',
                background: 'linear-gradient(145deg, rgba(255, 140, 66, 0.06) 0%, rgba(255, 255, 255, 0.04) 50%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(245, 87, 108, 0.2)',
                borderRadius: '24px 24px 24px 8px',
                padding: 'clamp(2rem, 5vw, 3rem)',
                textAlign: 'left',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
                transition: 'all 0.35s ease',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px) scale(1.01)'
                e.currentTarget.style.boxShadow = '0 28px 70px rgba(245, 87, 108, 0.2), inset 0 1px 0 rgba(255,255,255,0.08)'
                e.currentTarget.style.borderColor = 'rgba(245, 87, 108, 0.35)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.06)'
                e.currentTarget.style.borderColor = 'rgba(245, 87, 108, 0.2)'
              }}
              >
                <div style={{ position: 'absolute', top: 0, right: 0, width: '4px', height: '60%', background: 'linear-gradient(180deg, #e67a2a 0%, var(--k2-accent) 100%)', borderRadius: '4px 0 0 4px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{
                    width: 'clamp(64px, 10vw, 80px)',
                    height: 'clamp(64px, 10vw, 80px)',
                    borderRadius: '50%',
                    background: musterOnly ? 'linear-gradient(135deg, #6b9080 0%, var(--k2-accent) 100%)' : 'linear-gradient(135deg, #e67a2a 0%, var(--k2-accent) 100%)',
                    color: theme.text,
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
                    fontWeight: '700',
                    boxShadow: '0 8px 24px rgba(245, 87, 108, 0.4)',
                    flexShrink: 0
                  }}>
                    {(musterOnly ? MUSTER_TEXTE.georg.name : ((tenantId === 'k2' && (georgData.name === 'Künstler Muster' || !georgData.name)) ? tenantConfig.artist2Name : (georgData.name || tenantConfig.artist2Name))).charAt(0)}
                  </div>
                  <div>
                    <span style={{ fontSize: 'clamp(0.75rem, 2vw, 0.85rem)', letterSpacing: '0.12em', textTransform: 'uppercase', color: musterOnly ? theme.muted : 'rgba(255,255,255,0.5)', fontWeight: '600' }}>Keramik</span>
                    <h4 style={{ margin: '0.25rem 0 0', fontSize: 'clamp(1.2rem, 3.2vw, 1.6rem)', color: theme.text, fontWeight: '600' }}>
                      {musterOnly ? MUSTER_TEXTE.georg.name : ((tenantId === 'k2' && (georgData.name === 'Künstler Muster' || !georgData.name)) ? tenantConfig.artist2Name : (georgData.name || tenantConfig.artist2Name))}
                    </h4>
                  </div>
                </div>
                <p style={{ color: musterOnly ? theme.text : 'rgba(255, 255, 255, 0.8)', fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)', margin: 0, lineHeight: '1.7' }}>
                  {(musterOnly ? (galerieTexts.georgBio || MUSTER_TEXTE.artist2Bio) : (galerieTexts.georgBio || 'Georg verbindet in seiner Keramikarbeit technisches Können mit kreativer Gestaltung. Seine Arbeiten sind geprägt von Präzision und einer Liebe zum Detail, das Ergebnis von langjähriger Erfahrung.'))}
                </p>
                <button type="button" onClick={() => openVita('georg')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.75rem', fontSize: '0.85rem', color: theme.accent, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0, textDecoration: 'none' }} title="Vita öffnen">
                  <span aria-hidden>📄</span> Vita
                </button>
              </div>
            </div>
            
            <p style={{ 
              marginTop: 'clamp(2rem, 5vw, 3rem)', 
              fontSize: 'clamp(1.1rem, 3vw, 1.3rem)', 
              lineHeight: '1.7',
              color: musterOnly ? theme.text : 'rgba(255, 255, 255, 0.8)',
              textAlign: 'center',
              maxWidth: '800px',
              marginLeft: 'auto',
              marginRight: 'auto',
              fontWeight: '300',
              marginBottom: 'clamp(3rem, 8vw, 4rem)'
            }}>
              {musterOnly ? (galerieTexts.gemeinsamText?.trim() || MUSTER_TEXTE.gemeinsamText) : (galerieTexts.gemeinsamText?.trim() || `Gemeinsam eröffnen ${(tenantId === 'k2' && (martinaData.name === 'Künstlerin Muster' || !martinaData.name)) ? tenantConfig.artist1Name : (martinaData.name || tenantConfig.artist1Name)} und ${(tenantId === 'k2' && (georgData.name === 'Künstler Muster' || !georgData.name)) ? tenantConfig.artist2Name : (georgData.name || tenantConfig.artist2Name)} nach über 20 Jahren kreativer Tätigkeit die ${tenantConfig.galleryName} – ein Raum, wo Malerei und Keramik verschmelzen und Kunst zum Leben erwacht.`)}
            </p>

            {/* Eingangshalle: zwei Türen – Galerie (mit Shop-Hinweis) und Virtueller Rundgang. Admin = Button oben rechts. */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: musterOnly ? '1fr' : '1.2fr 1fr',
              gap: 'clamp(1.25rem, 3vw, 1.75rem)',
              marginBottom: 'clamp(3rem, 8vw, 5rem)',
              alignItems: 'stretch'
            }}>
              {/* Tür: In die Galerie – Hauptzugang, einladend. Shop nur als kleiner Hinweis. */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                borderRadius: '20px',
                padding: 'clamp(1.5rem, 4vw, 2rem)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <h3 style={{ fontSize: 'clamp(1rem, 2.5vw, 1.15rem)', fontWeight: '700', color: 'rgba(255,255,255,0.9)', marginBottom: 'clamp(0.5rem, 1.5vw, 0.75rem)' }}>
                  {galerieTexts.galerieButtonText || 'In die Galerie'}
                </h3>
                <div style={{
                  width: '100%',
                  maxWidth: '100%',
                  aspectRatio: '16/9',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  marginBottom: 'clamp(1rem, 3vw, 1.5rem)',
                  background: displayImages.galerieCardImage 
                    ? 'transparent' 
                    : musterOnly
                      ? 'linear-gradient(160deg, #e8e2d8 0%, #d4cfc5 100%)'
                      : 'linear-gradient(135deg, rgba(255, 140, 66, 0.12) 0%, rgba(14,12,10,0.6) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: musterOnly ? '1px solid rgba(90,122,110,0.18)' : '1px solid rgba(255, 255, 255, 0.1)',
                  boxSizing: 'border-box',
                  position: 'relative',
                }}>
                  {displayImages.galerieCardImage ? (
                    <img 
                      src={displayImages.galerieCardImage} 
                      alt="Galerie" 
                      style={{
                        width: '100%',
                        maxWidth: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        boxSizing: 'border-box'
                      }}
                    />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', opacity: 0.45 }}>
                      <svg width="64" height="48" viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="16" width="56" height="30" rx="2" fill={musterOnly ? '#5a7a6e' : '#ff8c42'} fillOpacity="0.25" stroke={musterOnly ? '#5a7a6e' : '#ff8c42'} strokeOpacity="0.5" strokeWidth="1.5"/>
                        <rect x="10" y="22" width="16" height="18" rx="1" fill={musterOnly ? '#5a7a6e' : '#ff8c42'} fillOpacity="0.35"/>
                        <rect x="30" y="22" width="16" height="18" rx="1" fill={musterOnly ? '#5a7a6e' : '#ff8c42'} fillOpacity="0.35"/>
                        <path d="M4 16 L32 4 L60 16" stroke={musterOnly ? '#5a7a6e' : '#ff8c42'} strokeOpacity="0.6" strokeWidth="1.5" fill="none"/>
                        <line x1="32" y1="4" x2="32" y2="16" stroke={musterOnly ? '#5a7a6e' : '#ff8c42'} strokeOpacity="0.4" strokeWidth="1"/>
                      </svg>
                      <span style={{ fontSize: '0.75rem', color: musterOnly ? '#5a7a6e' : 'rgba(255,140,66,0.7)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>
                        {musterOnly ? 'Ihr Galeriebild hier' : 'Galerie'}
                      </span>
                    </div>
                  )}
                </div>
                <Link 
                  to={musterOnly ? PROJECT_ROUTES['k2-galerie'].galerieOeffentlichVorschau : PROJECT_ROUTES['k2-galerie'].galerieVorschau}
                  state={musterOnly ? undefined : { fromAdmin: (location.state as { fromAdmin?: boolean } | null)?.fromAdmin === true }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: 'clamp(0.85rem, 2vw, 1rem) clamp(1.75rem, 4vw, 2.25rem)',
                    background: 'linear-gradient(135deg, var(--k2-accent) 0%, #e67a2a 100%)',
                    color: '#ffffff',
                    textDecoration: 'none',
                    borderRadius: '10px',
                    fontSize: 'clamp(1rem, 2.5vw, 1.1rem)',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.35)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.45)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.35)'
                  }}
                >
                  Herzlich willkommen – Galerie betreten →
                </Link>
                {!musterOnly && (
                  <p style={{
                    marginTop: 'clamp(0.75rem, 2vw, 1rem)',
                    fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                    color: 'rgba(255, 255, 255, 0.6)',
                    lineHeight: 1.4
                  }}>
                    In der Galerie findest du auch unseren Shop.
                  </p>
                )}
              </div>

              {/* Tür: Virtueller Rundgang – für virtuelle Besucher, dezenter */}
              {!musterOnly && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: 'clamp(1rem, 3vw, 1.25rem)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{
                  width: '100%',
                  maxWidth: '100%',
                  aspectRatio: '16/9',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  marginBottom: 'clamp(0.75rem, 2vw, 1rem)',
                  background: displayImages.virtualTourImage 
                    ? 'transparent' 
                    : 'linear-gradient(135deg, rgba(255, 140, 66, 0.15) 0%, rgba(230, 122, 42, 0.15) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  boxSizing: 'border-box'
                }}>
                  {displayImages.virtualTourImage ? (
                    <img 
                      src={displayImages.virtualTourImage} 
                      alt="Virtueller Rundgang" 
                      style={{
                        width: '100%',
                        maxWidth: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        boxSizing: 'border-box'
                      }}
                    />
                  ) : (
                    <div style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', opacity: 0.25 }}>📸</div>
                  )}
                </div>
                <h3 style={{
                  fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                  fontWeight: '600',
                  color: 'rgba(255, 255, 255, 0.9)',
                  marginBottom: 'clamp(0.35rem, 1vw, 0.5rem)'
                }}>
                  {galerieTexts.virtualTourButtonText || 'Virtueller Rundgang'}
                </h3>
                <p style={{
                  fontSize: 'clamp(0.8rem, 2vw, 0.85rem)',
                  color: 'rgba(255, 255, 255, 0.55)',
                  marginBottom: 'clamp(0.75rem, 2vw, 1rem)',
                  lineHeight: '1.4'
                }}>
                  Galerie auch bei geschlossener Tür erkunden
                </p>
                <Link
                  to={PROJECT_ROUTES['k2-galerie'].virtuellerRundgang}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: 'clamp(0.5rem, 1.5vw, 0.65rem) clamp(1rem, 3vw, 1.25rem)',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    color: 'rgba(255, 255, 255, 0.9)',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.35)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)'
                  }}
                >
                  Rundgang starten →
                </Link>
              </div>
              )}
            </div>
          </section>

          {/* Impressum – Schriftfarben aus Theme (lesbar auf hell und dunkel) */}
          <section style={{ 
            marginTop: 'clamp(2rem, 4vw, 2.5rem)',
            paddingTop: 'clamp(1rem, 2vw, 1.5rem)',
            borderTop: `1px solid color-mix(in srgb, ${theme.muted} 35%, transparent)`
          }}>
            <div style={{
              maxWidth: '1000px',
              margin: '0 auto',
              fontSize: 'clamp(0.75rem, 1.8vw, 0.85rem)',
              color: theme.muted,
              lineHeight: '1.5',
            }}>
              {/* Impressum Layout: Stammdaten links, QR-Code rechts */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 'clamp(2rem, 4vw, 3rem)',
                alignItems: 'flex-start'
              }}>
                {/* Linke Seite: Vollständige Stammdaten */}
                <div style={{ flex: 1 }}>
                  <h4 style={{ 
                    margin: '0 0 1rem', 
                    fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', 
                    fontWeight: '600', 
                    color: theme.text 
                  }}>
                    {tenantConfig.footerLine}
                  </h4>
                  
                  {/* Galerie Kontakt - Kompakt (ök2: immer aus MUSTER_TEXTE) */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <p style={{ margin: '0 0 0.25rem', fontWeight: '500', color: theme.text, fontSize: 'clamp(0.95rem, 2.2vw, 1.1rem)' }}>
                      {tenantConfig.galleryName}
                    </p>
                    {(musterOnly ? (MUSTER_TEXTE.gallery.address || (MUSTER_TEXTE.gallery as any).city || (MUSTER_TEXTE.gallery as any).country) : (galleryData.address || galleryData.city || galleryData.country)) && (
                      <p style={{ margin: '0 0 0.15rem', color: theme.muted, fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)', lineHeight: '1.4' }}>
                        {musterOnly
                          ? [MUSTER_TEXTE.gallery.address, (MUSTER_TEXTE.gallery as any).city, (MUSTER_TEXTE.gallery as any).country].filter(Boolean).join(', ')
                          : [galleryData.address, galleryData.city, galleryData.country].filter(Boolean).join(', ')}
                      </p>
                    )}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.15rem' }}>
                      {(musterOnly ? MUSTER_TEXTE.gallery.phone : galleryData.phone) && (
                        <span style={{ color: theme.muted, fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)' }}>
                          📞 {musterOnly ? MUSTER_TEXTE.gallery.phone : galleryData.phone}
                        </span>
                      )}
                      {(musterOnly ? MUSTER_TEXTE.gallery.email : galleryData.email) && (
                        <span style={{ fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)' }}>
                          ✉️ <a href={`mailto:${musterOnly ? MUSTER_TEXTE.gallery.email : galleryData.email}`} style={{ color: theme.accent, textDecoration: 'none' }}>
                            {musterOnly ? MUSTER_TEXTE.gallery.email : galleryData.email}
                          </a>
                        </span>
                      )}
                      {(musterOnly ? MUSTER_TEXTE.gallery.website : galleryData.website) && (
                        <span style={{ fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)' }}>
                          🌐 <a href={`https://${(musterOnly ? MUSTER_TEXTE.gallery.website : galleryData.website).replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" style={{ color: theme.accent, textDecoration: 'none' }}>
                            {musterOnly ? MUSTER_TEXTE.gallery.website : galleryData.website}
                          </a>
                        </span>
                      )}
                      {(musterOnly ? (MUSTER_TEXTE.gallery as any).openingHours : galleryData.openingHours) && (
                        <span style={{ color: theme.muted, fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)' }}>
                          🕐 {musterOnly ? (MUSTER_TEXTE.gallery as any).openingHours : galleryData.openingHours}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Martina Kontakt - Kompakt (ök2: immer aus MUSTER_TEXTE) */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <p style={{ margin: '0 0 0.15rem', fontWeight: '500', color: theme.text, fontSize: 'clamp(0.95rem, 2.2vw, 1.1rem)' }}>
                      {musterOnly ? MUSTER_TEXTE.martina.name : ((tenantId === 'k2' && (martinaData.name === 'Künstlerin Muster' || !martinaData.name)) ? tenantConfig.artist1Name : (martinaData.name || tenantConfig.artist1Name))}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {(musterOnly ? MUSTER_TEXTE.martina.phone : martinaData.phone) && (
                        <span style={{ color: theme.muted, fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)' }}>
                          📞 {musterOnly ? MUSTER_TEXTE.martina.phone : martinaData.phone}
                        </span>
                      )}
                      {(musterOnly ? MUSTER_TEXTE.martina.email : martinaData.email) && (
                        <span style={{ fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)' }}>
                          ✉️ <a href={`mailto:${musterOnly ? MUSTER_TEXTE.martina.email : martinaData.email}`} style={{ color: theme.accent, textDecoration: 'none' }}>
                            {musterOnly ? MUSTER_TEXTE.martina.email : martinaData.email}
                          </a>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Georg Kontakt - Kompakt (ök2: immer aus MUSTER_TEXTE) */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <p style={{ margin: '0 0 0.15rem', fontWeight: '500', color: theme.text, fontSize: 'clamp(0.95rem, 2.2vw, 1.1rem)' }}>
                      {musterOnly ? MUSTER_TEXTE.georg.name : ((tenantId === 'k2' && (georgData.name === 'Künstler Muster' || !georgData.name)) ? tenantConfig.artist2Name : (georgData.name || tenantConfig.artist2Name))}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {(musterOnly ? MUSTER_TEXTE.georg.phone : georgData.phone) && (
                        <span style={{ color: theme.muted, fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)' }}>
                          📞 {musterOnly ? MUSTER_TEXTE.georg.phone : georgData.phone}
                        </span>
                      )}
                      {(musterOnly ? MUSTER_TEXTE.georg.email : georgData.email) && (
                        <span style={{ fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)' }}>
                          ✉️ <a href={`mailto:${musterOnly ? MUSTER_TEXTE.georg.email : georgData.email}`} style={{ color: theme.accent, textDecoration: 'none' }}>
                            {musterOnly ? MUSTER_TEXTE.georg.email : georgData.email}
                          </a>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Gewerbe & Haftungsausschluss – gut lesbar, Theme-Farbe */}
                  <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: `1px solid color-mix(in srgb, ${theme.muted} 35%, transparent)` }}>
                    <p style={{ margin: '0 0 0.5rem', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)', color: theme.text, lineHeight: 1.45 }}>
                      Gewerbe: freie Kunstschaffende
                    </p>
                    <p style={{ margin: '0 0 0.5rem', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)', color: theme.muted, lineHeight: 1.45 }}>
                      Haftungsausschluss: Die Inhalte wurden mit Sorgfalt erstellt. Für Richtigkeit, Vollständigkeit und Aktualität kann keine Gewähr übernommen werden.
                    </p>
                  </div>
                </div>
                
                {/* Rechte Seite: QR mit Bezeichnung der Seite (Kunde sieht Galeriename, kein Vercel) */}
                {vercelQrDataUrl && (
                    <div style={{
                      textAlign: 'center',
                      flexShrink: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      alignItems: 'center'
                    }}>
                      <p style={{ margin: '0 0 0.25rem', fontSize: 'clamp(0.7rem, 1.6vw, 0.8rem)', color: theme.text, fontWeight: 600 }}>
                        📱 QR scannen → öffnet diese Galerie auf dem Handy
                      </p>
                      <div style={{ background: '#fff', padding: '0.4rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                        <img src={vercelQrDataUrl} alt={`QR-Code: ${tenantConfig.galleryName}`} style={{ width: 100, height: 100, display: 'block' }} />
                      </div>
                      <p style={{ margin: 0, fontSize: 'clamp(0.55rem, 1.2vw, 0.65rem)', color: theme.muted, fontWeight: 500, maxWidth: 140 }}>
                        {tenantConfig.galleryName}
                      </p>
                    </div>
                )}
              </div>
              <p style={{ marginTop: '1.25rem', marginBottom: 0, fontSize: 'clamp(0.85rem, 2vw, 0.95rem)', color: theme.muted }}>
                {PRODUCT_COPYRIGHT}
              </p>
            </div>
          </section>
        </main>
        </>
        )}

        {/* Willkommens-Fenster (nur öffentliche Galerie): Einstieg per QR – Optionen zentriert als Fenster */}
        {musterOnly && showWelcomeModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
              padding: '1rem',
            }}
          >
            <div
              style={{
                maxWidth: 440,
                width: '100%',
                background: OK2_THEME.cardBg1,
                borderRadius: '12px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                padding: '1.75rem 1.5rem',
                border: `2px solid ${OK2_THEME.accentColor}40`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <p style={{ margin: 0, fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: OK2_THEME.mutedColor }}>Willkommen</p>
              <h2 style={{ margin: '0.35rem 0 0.75rem', fontSize: '1.35rem', fontWeight: 600, color: OK2_THEME.accentColor }}>{PRODUCT_BRAND_NAME}</h2>
              <p style={{ margin: '0 0 1.25rem', fontSize: '0.95rem', lineHeight: 1.5, color: OK2_THEME.textColor }}>Wähle deinen Einstieg:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={closeWelcomeNurUmschauen}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1.25rem',
                    background: OK2_THEME.cardBg2,
                    color: OK2_THEME.textColor,
                    border: `1px solid ${OK2_THEME.accentColor}40`,
                    borderRadius: '10px',
                    textAlign: 'left',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: '0.95rem',
                  }}
                >
                  <span style={{ display: 'block', marginBottom: '0.2rem' }}>Nur umschauen</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 400, color: OK2_THEME.mutedColor }}>Galerie ansehen, ohne Anmeldung.</span>
                </button>
                <div style={{ padding: '0.75rem', background: OK2_THEME.backgroundColor2, borderRadius: '10px', border: `1px solid ${OK2_THEME.accentColor}30` }}>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: OK2_THEME.mutedColor }}>Vorschau & Entwurf (optional Name):</p>
                  <input
                    type="text"
                    value={welcomeName}
                    onChange={(e) => setWelcomeName(e.target.value)}
                    placeholder="Galerie- oder Künstlername (optional)"
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      border: `1px solid ${OK2_THEME.accentColor}40`,
                      borderRadius: '8px',
                      fontFamily: 'inherit',
                      fontSize: '0.9rem',
                      background: OK2_THEME.cardBg1,
                      color: OK2_THEME.textColor,
                      marginBottom: '0.75rem',
                    }}
                  />
                  <button
                    type="button"
                    onClick={goVorschauEntwurf}
                    style={{
                      width: '100%',
                      padding: '0.65rem 1rem',
                      background: OK2_THEME.accentColor,
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: '0.9rem',
                    }}
                  >
                    Vorschau & Entwurf ansehen →
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => { setShowWelcomeModal(false); handleAdminButtonClick(); }}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1.25rem',
                    background: OK2_THEME.cardBg2,
                    color: OK2_THEME.textColor,
                    border: `1px solid ${OK2_THEME.accentColor}40`,
                    borderRadius: '10px',
                    textAlign: 'left',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: '0.95rem',
                  }}
                >
                  <span style={{ display: 'block', marginBottom: '0.2rem' }}>Admin-Zugang (Testversion)</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 400, color: OK2_THEME.mutedColor }}>Du hast eine Testversion? Hier geht’s in den Zugangsbereich.</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GaleriePage
