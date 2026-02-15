import React, { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import QRCode from 'qrcode'
import { PROJECT_ROUTES } from '../config/navigation'
import { TENANT_CONFIGS, MUSTER_TEXTE, K2_STAMMDATEN_DEFAULTS, PRODUCT_BRAND_NAME } from '../config/tenantConfig'
import { getGalerieImages } from '../config/pageContentGalerie'
import { getPageTexts, type GaleriePageTexts } from '../config/pageTexts'
import { appendToHistory } from '../utils/artworkHistory'
import { buildQrUrlWithBust, useQrVersionTimestamp } from '../hooks/useServerBuildTimestamp'
import '../App.css'

/** Fallback-URL für Aktualisierung in anderem Netzwerk (z. B. zuerst Mac-WLAN, dann Mobilfunk) */
const GALLERY_DATA_PUBLIC_URL = 'https://k2-galerie.vercel.app'
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

/** Verhindert Absturz bei kaputtem localStorage (z. B. nach Druck/Teilen). */
function safeParseArtworks(): any[] {
  try {
    const raw = localStorage.getItem('k2-artworks')
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
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

/** Event-Dokument in neuem Fenster öffnen (PDF/Bild/Download) */
function openEventDocument(doc: { name?: string; fileData?: string; fileName?: string; fileType?: string }) {
  if (!doc?.fileData) return
  const w = window.open()
  if (!w) return
  const isPdf = doc.fileType?.includes('pdf')
  const isImage = doc.fileType?.includes('image')
  w.document.write(`
    <!DOCTYPE html><html><head><title>${(doc.name || doc.fileName || 'Dokument').replace(/</g, '&lt;')}</title></head>
    <body style="margin:0;padding:20px;background:#f5f5f5;">
      ${isPdf ? `<iframe src="${doc.fileData}" style="width:100%;height:100vh;border:none;"></iframe>` : isImage ? `<img src="${doc.fileData}" alt="" style="max-width:100%;height:auto;" />` : `<a href="${doc.fileData}" download="${(doc.fileName || '').replace(/</g, '&lt;')}">Download: ${(doc.name || doc.fileName || 'Dokument').replace(/</g, '&lt;')}</a>`}
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

const GaleriePage = ({ scrollToSection, musterOnly = false }: { scrollToSection?: string; musterOnly?: boolean }) => {
  const navigate = useNavigate()
  const location = useLocation()
  // K2-Galerie-Route: immer echte K2-Daten (Impressum, Willkommen). Keine Vermischung mit ök2 auch wenn k2-tenant mal auf oeffentlich steht.
  const tenantConfig = musterOnly ? TENANT_CONFIGS.oeffentlich : TENANT_CONFIGS.k2
  const tenantId = musterOnly ? 'oeffentlich' : 'k2'
  const isVorschauModusEarly = typeof window !== 'undefined' && new URLSearchParams(location.search).get('vorschau') === '1'
  const defaultGalerieTexts = useMemo(() => getPageTexts().galerie, [])
  const [vorschauGalerieTexts, setVorschauGalerieTexts] = useState<GaleriePageTexts | null>(null)
  useEffect(() => {
    if (isVorschauModusEarly) setVorschauGalerieTexts(getPageTexts().galerie)
  }, [isVorschauModusEarly])
  const galerieTexts = (isVorschauModusEarly && vorschauGalerieTexts) ? vorschauGalerieTexts : defaultGalerieTexts
  const willkommenRef = React.useRef<HTMLDivElement>(null)
  const galerieRef = React.useRef<HTMLDivElement>(null)
  const kunstschaffendeRef = React.useRef<HTMLDivElement>(null)
  const [mobileUrl, setMobileUrl] = React.useState<string>('')
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

  // ök2: Stammdaten immer auf Musterdaten halten (auch bei Navigation von normaler Galerie)
  React.useEffect(() => {
    if (musterOnly) {
      setMartinaData({ ...MUSTER_TEXTE.martina })
      setGeorgData({ ...MUSTER_TEXTE.georg })
      setGalleryData({ ...MUSTER_TEXTE.gallery })
    }
  }, [musterOnly])

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

  const qrVersionTs = useQrVersionTimestamp()
  const vercelGalerieUrl = GALLERY_DATA_PUBLIC_URL + PROJECT_ROUTES['k2-galerie'].galerie
  // Ein QR für Impressum (Vercel – funktioniert überall)
  useEffect(() => {
    QRCode.toDataURL(buildQrUrlWithBust(vercelGalerieUrl, qrVersionTs), { width: 100, margin: 1 }).then(setVercelQrDataUrl).catch(() => setVercelQrDataUrl(''))
  }, [vercelGalerieUrl, qrVersionTs])

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
        const localArtworks = safeParseArtworks()
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
            localStorage.setItem('k2-artworks', JSON.stringify(merged))
            
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
            localStorage.setItem('k2-artworks', JSON.stringify(localArtworks))
          }
        } else {
          // KEINE Server-Daten - behalte ALLE lokalen Werke!
          console.warn('⚠️ Keine Werke in gallery-data.json gefunden - behalte lokale Werke:', localArtworks.length)
          if (localArtworks.length > 0) {
            console.log('🔒 Lokale Werke bleiben erhalten:', localArtworks.map((a: any) => a.number || a.id).join(', '))
            // Stelle sicher dass lokale Werke gespeichert bleiben
            localStorage.setItem('k2-artworks', JSON.stringify(localArtworks))
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
      
      // Wenn weit genug nach unten gezogen wurde → Reload
      if (pullDistance > 80 && window.scrollY === 0) {
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
      const localArtworks = safeParseArtworks()
      
      // Prüfe ob Werk bereits vorhanden
      const exists = localArtworks.some((a: any) => 
        (a.number && artwork.number && a.number === artwork.number) ||
        (a.id && artwork.id && a.id === artwork.id)
      )
      
      if (!exists) {
        console.log(`✅ Neues Mobile-Werk synchronisiert: ${artwork.number || artwork.id}`)
        // Füge Werk hinzu
        localArtworks.push(artwork)
        localStorage.setItem('k2-artworks', JSON.stringify(localArtworks))
        
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
              const localArtworks = safeParseArtworks()
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
              
              localStorage.setItem('k2-artworks', JSON.stringify(merged))
              console.log('✅ Werke gemergt beim Initial-Load (Server = Quelle):', merged.length, 'Gesamt,', toHistory.length, 'in History')
              console.log('📋 Lokale Nummern:', localArtworks.map((a: any) => a.number || a.id).join(', '))
              console.log('📋 Server Nummern:', serverArtworks.map((a: any) => a.number || a.id).join(', '))
              console.log('📋 Gemergte Nummern:', merged.map((a: any) => a.number || a.id).join(', '))
              // Trigger Event für andere Komponenten (z.B. GalerieVorschauPage)
              window.dispatchEvent(new CustomEvent('artworks-updated', { detail: { count: merged.length, fromGaleriePage: true, initialLoad: true } }))
            } catch (e) {
              console.warn('⚠️ Werke zu groß für localStorage:', e)
              // Bei Fehler: Behalte lokale Werke!
              const localArtworks = safeParseArtworks()
              if (localArtworks.length > 0) {
                console.log('🔒 Fehler beim Merge beim Initial-Load - behalte lokale Werke:', localArtworks.length)
                localStorage.setItem('k2-artworks', JSON.stringify(localArtworks))
              }
            }
          } else {
            // KEINE Server-Daten - behalte ALLE lokalen Werke!
            const localArtworks = safeParseArtworks()
            if (localArtworks.length > 0) {
              console.warn('⚠️ Keine Werke in gallery-data.json gefunden beim Initial-Load - behalte lokale Werke:', localArtworks.length)
              console.log('🔒 Lokale Werke bleiben erhalten beim Initial-Load:', localArtworks.map((a: any) => a.number || a.id).join(', '))
              // Stelle sicher dass lokale Werke gespeichert bleiben
              localStorage.setItem('k2-artworks', JSON.stringify(localArtworks))
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
    
    const intervalId = setInterval(checkStammdatenUpdate, 2000)
    loadData()
    
    // Ein einziger Cleanup: interval, timeout, controller, isMounted
    return () => {
      isMounted = false
      clearInterval(intervalId)
      if (timeoutId) clearTimeout(timeoutId)
      if (controller) controller.abort()
    }
  }, [musterOnly])

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

  // Admin-Login Funktion
  const handleAdminLogin = () => {
    // Auf localhost automatisch ohne Passwort
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
    
    // Lade Passwort direkt aus localStorage für aktuelle Validierung
    let currentPassword = 'k2Galerie2026' // Standard
    try {
      const galleryStored = localStorage.getItem('k2-stammdaten-galerie')
      if (galleryStored) {
        const data = JSON.parse(galleryStored)
        currentPassword = data.adminPassword || 'k2Galerie2026'
      }
    } catch (error) {
      // Verwende Standard-Passwort bei Fehler
    }
    
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

  // Admin-Button Klick Handler (wenn Login bereits gespeichert → direkt zu Admin, auch auf Mobil)
  const handleAdminButtonClick = () => {
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname === '192.168.0.31' ||
                       window.location.hostname === '192.168.0.27'
    
    if (isLocalhost) {
      try { sessionStorage.setItem('k2-admin-context', musterOnly ? 'oeffentlich' : 'k2') } catch (_) {}
      navigate(musterOnly ? '/admin?context=oeffentlich' : '/admin')
      return
    }
    // Bereits eingeloggt (Session oder „Passwort merken“)?
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
    setShowAdminModal(true)
  }

  const theme = musterOnly
    ? { text: 'var(--k2-text)', muted: 'var(--k2-muted)', accent: 'var(--k2-accent)', accentGradient: 'linear-gradient(135deg, var(--k2-accent) 0%, #6b9080 100%)', cardBg: 'var(--k2-card-bg-1)' }
    : { text: 'var(--k2-text)', muted: 'var(--k2-muted)', accent: 'var(--k2-accent)', accentGradient: 'linear-gradient(135deg, var(--k2-accent) 0%, #e67a2a 100%)', cardBg: 'var(--k2-card-bg-1)' }

  const isVorschauModus = typeof window !== 'undefined' && new URLSearchParams(location.search).get('vorschau') === '1'

  return (
    <div style={{ 
      minHeight: '-webkit-fill-available',
      background: musterOnly
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
            onClick={() => navigate('/admin')}
            style={{ background: 'rgba(0,0,0,0.2)', border: 'none', color: 'inherit', padding: '0.4rem 0.8rem', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
          >
            ← Zurück zu Einstellungen
          </button>
          <span style={{ opacity: 0.9 }}>Vorschau – hier siehst du deine gespeicherten Änderungen</span>
        </div>
      )}
      {/* Animated Background Elements (ök2: dezent für Wohlbefinden) */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: musterOnly
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
        {/* Brand linkes oberes Eck – nur „K2 Galerie“, keine Tagline */}
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
            {PRODUCT_BRAND_NAME}
          </div>
        </div>
        {/* Admin Button – auf normaler Galerie und auf ök2-Willkommensseite (eigener Admin-Zugang) */}
        {/* iPhone: safe-area-inset-top + größerer Abstand, damit Button unter Notch sichtbar bleibt */}
        <button
          onClick={handleAdminButtonClick}
          style={{
            position: 'fixed',
            top: 'max(clamp(1rem, 2vw, 1.5rem), calc(env(safe-area-inset-top, 0px) + 1rem))',
            right: 'clamp(1rem, 2vw, 1.5rem)',
            background: musterOnly ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: musterOnly ? '1px solid rgba(45, 45, 42, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)',
            color: musterOnly ? 'var(--k2-text)' : 'rgba(255, 255, 255, 0.5)',
            padding: 'clamp(0.5rem, 1.5vw, 0.75rem) clamp(0.75rem, 2vw, 1rem)',
            borderRadius: '8px',
            fontSize: 'clamp(0.7rem, 1.8vw, 0.85rem)',
            cursor: 'pointer',
            zIndex: 1000,
            transition: 'all 0.3s ease',
            opacity: (isMobileDevice || isMobile) ? 0.9 : 0.6,
            touchAction: 'manipulation',
            minWidth: '44px',
            minHeight: '44px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1'
            e.currentTarget.style.background = musterOnly ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = (isMobileDevice || isMobile) ? '0.9' : '0.6'
            e.currentTarget.style.background = musterOnly ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.05)'
          }}
          onTouchStart={(e) => {
            e.currentTarget.style.opacity = '1'
            e.currentTarget.style.background = musterOnly ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.15)'
          }}
          onTouchEnd={(e) => {
            setTimeout(() => {
              e.currentTarget.style.opacity = (isMobileDevice || isMobile) ? '0.9' : '0.6'
              e.currentTarget.style.background = musterOnly ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.05)'
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
              <h3 style={{
                margin: '0 0 1.5rem',
                fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
                fontWeight: '600',
                color: '#ffffff',
                textAlign: 'center'
              }}>
                Admin-Zugang
              </h3>
              <input
                type="password"
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAdminLogin()
                  }
                }}
                placeholder="Passwort eingeben"
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
                marginBottom: '1.5rem',
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
              <div style={{
                display: 'flex',
                gap: '1rem'
              }}>
                <button
                  onClick={() => {
                    setShowAdminModal(false)
                    setAdminPasswordInput('')
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
            </div>
          </div>
        )}

        {/* Hero Section */}
        <header style={{ 
          padding: 'clamp(2rem, 6vw, 4rem) clamp(1.5rem, 4vw, 3rem)',
          paddingTop: 'clamp(3rem, 8vw, 5rem)',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <div style={{ 
            marginBottom: 'clamp(3rem, 8vw, 5rem)'
          }}>
            <h1 style={{ 
              margin: 0, 
              fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
              fontWeight: '700',
              background: musterOnly ? 'linear-gradient(135deg, var(--k2-text) 0%, var(--k2-accent) 100%)' : 'linear-gradient(135deg, var(--k2-text) 0%, var(--k2-accent) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.02em',
              lineHeight: '1.1'
            }}>
              {(galerieTexts.heroTitle ?? '').trim() || tenantConfig.galleryName}
            </h1>
            <p style={{ 
              margin: '0.75rem 0 0', 
              color: musterOnly ? 'var(--k2-muted)' : 'rgba(255, 255, 255, 0.7)', 
              fontSize: 'clamp(1rem, 3vw, 1.25rem)',
              fontWeight: '300',
              letterSpacing: '0.05em'
            }}>
              {(galerieTexts.welcomeSubtext ?? '').trim() || tenantConfig.tagline}
            </p>
          </div>

          {/* Hero Content */}
          <section ref={willkommenRef} id="willkommen" style={{ 
            marginBottom: 'clamp(4rem, 10vw, 6rem)',
            maxWidth: '800px',
            width: '100%',
            overflow: 'hidden'
          }}>
            <h2 style={{ 
              fontSize: 'clamp(2rem, 6vw, 3.5rem)', 
              marginBottom: '1.5rem',
              fontWeight: '700',
              lineHeight: '1.2',
              color: 'var(--k2-text)',
              letterSpacing: '-0.02em'
            }}>
              {(galerieTexts.welcomeHeading ?? 'Willkommen bei').trim() || 'Willkommen bei'} {(galerieTexts.heroTitle ?? '').trim() || tenantConfig.galleryName} –<br />
              <span style={{
                background: musterOnly ? 'linear-gradient(135deg, var(--k2-accent) 0%, #6b9080 100%)' : 'linear-gradient(135deg, var(--k2-accent) 0%, #e67a2a 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {(galerieTexts.welcomeSubtext ?? '').trim() || tenantConfig.tagline}
              </span>
            </h2>
            <p style={{ 
              fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', 
              color: musterOnly ? 'var(--k2-muted)' : 'rgba(255, 255, 255, 0.8)',
              lineHeight: '1.6',
              fontWeight: '300',
              maxWidth: '600px',
              marginBottom: 'clamp(2rem, 5vw, 3rem)'
            }}>
              {musterOnly ? MUSTER_TEXTE.welcomeText : (galerieTexts.welcomeIntroText?.trim() || 'Ein Neuanfang mit Leidenschaft. Entdecke die Verbindung von Malerei und Keramik in einem Raum, wo Kunst zum Leben erwacht.')}
            </p>
            {(function () {
              const galerieImages = getGalerieImages(galleryData)
              return galerieImages.welcomeImage && (
              <div style={{
                width: '100%',
                maxWidth: '100%',
                marginTop: 'clamp(1.5rem, 4vw, 2.5rem)',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxSizing: 'border-box'
              }}>
                <img 
                  src={galerieImages.welcomeImage} 
                  alt="Willkommen" 
                  style={{
                    width: '100%',
                    maxWidth: '100%',
                    height: 'auto',
                    display: 'block',
                    maxHeight: '500px',
                    objectFit: 'cover',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            )
            })()}
            {/* QR-Code ENTFERNT von Willkommensseite - jetzt im Impressum unten */}
          </section>
        </header>

        <main style={{
          padding: '0 clamp(1.5rem, 4vw, 3rem)',
          paddingBottom: 'clamp(4rem, 10vw, 6rem)',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>

          {/* Aktuelles aus den Eventplanungen – zwischen Foto und Kunstschaffende */}
          {!musterOnly && upcomingEvents.length > 0 && (
            <section style={{
              marginTop: 'clamp(2rem, 5vw, 3rem)',
              padding: 'clamp(1rem, 3vw, 1.5rem) clamp(1.25rem, 3vw, 1.75rem)',
              background: 'rgba(184, 184, 255, 0.08)',
              border: '1px solid rgba(184, 184, 255, 0.2)',
              borderRadius: '16px',
              borderLeft: '4px solid rgba(184, 184, 255, 0.6)'
            }}>
              <p style={{ margin: '0 0 0.5rem', fontSize: 'clamp(0.75rem, 2vw, 0.85rem)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', fontWeight: '600' }}>
                {galerieTexts.eventSectionHeading || 'Aktuelles aus den Eventplanungen'}
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#ffffff', fontSize: 'clamp(1rem, 2.5vw, 1.15rem)', lineHeight: 1.6 }}>
                {upcomingEvents.map((ev: any) => (
                  <li key={ev.id || ev.date} style={{ marginBottom: ev.documents?.length ? '0.5rem' : 0 }}>
                    <strong>{ev.title}</strong>
                    {ev.date && (
                      <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: '400' }}>
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
                                color: 'rgba(184, 184, 255, 0.95)',
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
                  <div>
                    <span style={{ fontSize: 'clamp(0.75rem, 2vw, 0.85rem)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>Bilder</span>
                    <h4 style={{ margin: '0.25rem 0 0', fontSize: 'clamp(1.2rem, 3.2vw, 1.6rem)', color: '#ffffff', fontWeight: '600' }}>
                      {musterOnly ? MUSTER_TEXTE.martina.name : ((tenantId === 'k2' && (martinaData.name === 'Künstlerin Muster' || !martinaData.name)) ? tenantConfig.artist1Name : (martinaData.name || tenantConfig.artist1Name))}
                    </h4>
                  </div>
                </div>
                <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)', margin: 0, lineHeight: '1.7' }}>
                  {(musterOnly ? (galerieTexts.martinaBio || MUSTER_TEXTE.artist1Bio) : (galerieTexts.martinaBio || 'Martina bringt mit ihren Gemälden eine lebendige Vielfalt an Farben und Ausdruckskraft auf die Leinwand. Ihre Werke spiegeln Jahre des Lernens, Experimentierens und der Leidenschaft für die Malerei wider.'))}
                </p>
                <Link to={PROJECT_ROUTES['k2-galerie'].vitaMartina} style={{ display: 'inline-block', marginTop: '0.75rem', fontSize: '0.85rem', color: 'rgba(184, 184, 255, 0.9)', textDecoration: 'none', fontWeight: 600 }}>Vita</Link>
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
                    <span style={{ fontSize: 'clamp(0.75rem, 2vw, 0.85rem)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>Keramik</span>
                    <h4 style={{ margin: '0.25rem 0 0', fontSize: 'clamp(1.2rem, 3.2vw, 1.6rem)', color: '#ffffff', fontWeight: '600' }}>
                      {musterOnly ? MUSTER_TEXTE.georg.name : ((tenantId === 'k2' && (georgData.name === 'Künstler Muster' || !georgData.name)) ? tenantConfig.artist2Name : (georgData.name || tenantConfig.artist2Name))}
                    </h4>
                  </div>
                </div>
                <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)', margin: 0, lineHeight: '1.7' }}>
                  {(musterOnly ? (galerieTexts.georgBio || MUSTER_TEXTE.artist2Bio) : (galerieTexts.georgBio || 'Georg verbindet in seiner Keramikarbeit technisches Können mit kreativer Gestaltung. Seine Arbeiten sind geprägt von Präzision und einer Liebe zum Detail, das Ergebnis von langjähriger Erfahrung.'))}
                </p>
                <Link to={PROJECT_ROUTES['k2-galerie'].vitaGeorg} style={{ display: 'inline-block', marginTop: '0.75rem', fontSize: '0.85rem', color: 'rgba(245, 87, 108, 0.9)', textDecoration: 'none', fontWeight: 600 }}>Vita</Link>
              </div>
            </div>
            
            <p style={{ 
              marginTop: 'clamp(2rem, 5vw, 3rem)', 
              fontSize: 'clamp(1.1rem, 3vw, 1.3rem)', 
              lineHeight: '1.7',
              color: 'rgba(255, 255, 255, 0.8)',
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
            <p style={{
              fontSize: 'clamp(0.9rem, 2.2vw, 1rem)',
              color: musterOnly ? 'var(--k2-muted)' : 'rgba(255, 255, 255, 0.7)',
              marginBottom: 'clamp(1.5rem, 4vw, 2rem)',
              textAlign: 'center',
              letterSpacing: '0.03em'
            }}>
              Willkommen in der Eingangshalle – wähle deinen Weg:
            </p>
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
                <div style={{
                  width: '100%',
                  maxWidth: '100%',
                  aspectRatio: '16/9',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  marginBottom: 'clamp(1rem, 3vw, 1.5rem)',
                  background: (() => { const gi = getGalerieImages(galleryData); return gi.galerieCardImage; })() 
                    ? 'transparent' 
                    : 'linear-gradient(135deg, rgba(255, 140, 66, 0.15) 0%, rgba(230, 122, 42, 0.15) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxSizing: 'border-box'
                }}>
                  {(function () { const gi = getGalerieImages(galleryData); return gi.galerieCardImage ? (
                    <img 
                      src={gi.galerieCardImage} 
                      alt="In die Galerie" 
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
                    <div style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', opacity: 0.3 }}>🖼️</div>
                  );
                  })()}
                </div>
                <h3 style={{
                  fontSize: 'clamp(1.25rem, 3.5vw, 1.5rem)',
                  fontWeight: '700',
                  color: '#ffffff',
                  marginBottom: 'clamp(0.5rem, 1.5vw, 0.75rem)'
                }}>
                  In die Galerie
                </h3>
                <p style={{
                  fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                  color: 'rgba(255, 255, 255, 0.85)',
                  marginBottom: 'clamp(1rem, 3vw, 1.25rem)',
                  lineHeight: '1.55'
                }}>
                  Wir laden dich/Sie ein, die Galerie zu betreten und die Werke zu entdecken.
                </p>
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
                  Galerie betreten →
                </Link>
                {!musterOnly && (
                  <p style={{
                    marginTop: 'clamp(0.75rem, 2vw, 1rem)',
                    fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                    color: 'rgba(255, 255, 255, 0.6)',
                    lineHeight: 1.4
                  }}>
                    In der Galerie findest du/finden Sie auch unseren Shop.
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
                  background: (() => { const gi = getGalerieImages(galleryData); return gi.virtualTourImage; })() 
                    ? 'transparent' 
                    : 'linear-gradient(135deg, rgba(255, 140, 66, 0.15) 0%, rgba(230, 122, 42, 0.15) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  boxSizing: 'border-box'
                }}>
                  {(function () { const gi = getGalerieImages(galleryData); return gi.virtualTourImage ? (
                    <img 
                      src={gi.virtualTourImage} 
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
                  );
                  })()}
                </div>
                <h3 style={{
                  fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                  fontWeight: '600',
                  color: 'rgba(255, 255, 255, 0.9)',
                  marginBottom: 'clamp(0.35rem, 1vw, 0.5rem)'
                }}>
                  Virtueller Rundgang
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
            <p style={{
              fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
              color: musterOnly ? 'var(--k2-muted)' : 'rgba(255, 255, 255, 0.5)',
              textAlign: 'center',
              marginTop: '-1rem',
              marginBottom: '0.5rem'
            }}>
              Admin-Bereich: oben rechts über den Button „Admin“ (mit Passwort).
            </p>
          </section>

          {/* Impressum */}
          <section style={{ 
            marginTop: 'clamp(2rem, 4vw, 2.5rem)',
            paddingTop: 'clamp(1rem, 2vw, 1.5rem)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{
              maxWidth: '1000px',
              margin: '0 auto',
              fontSize: 'clamp(0.75rem, 1.8vw, 0.85rem)',
              color: 'rgba(255, 255, 255, 0.7)',
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
                    color: '#ffffff' 
                  }}>
                    {tenantConfig.footerLine}
                  </h4>
                  
                  {/* Galerie Kontakt - Kompakt (ök2: immer aus MUSTER_TEXTE) */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <p style={{ margin: '0 0 0.25rem', fontWeight: '500', color: theme.text, fontSize: 'clamp(0.95rem, 2.2vw, 1.1rem)' }}>
                      {tenantConfig.galleryName}
                    </p>
                    {(musterOnly ? (MUSTER_TEXTE.gallery.address || (MUSTER_TEXTE.gallery as any).city || (MUSTER_TEXTE.gallery as any).country) : (galleryData.address || galleryData.city || galleryData.country)) && (
                      <p style={{ margin: '0 0 0.15rem', color: 'rgba(255, 255, 255, 0.7)', fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)', lineHeight: '1.4' }}>
                        {musterOnly
                          ? [MUSTER_TEXTE.gallery.address, (MUSTER_TEXTE.gallery as any).city, (MUSTER_TEXTE.gallery as any).country].filter(Boolean).join(', ')
                          : [galleryData.address, galleryData.city, galleryData.country].filter(Boolean).join(', ')}
                      </p>
                    )}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.15rem' }}>
                      {(musterOnly ? MUSTER_TEXTE.gallery.phone : galleryData.phone) && (
                        <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)' }}>
                          📞 {musterOnly ? MUSTER_TEXTE.gallery.phone : galleryData.phone}
                        </span>
                      )}
                      {(musterOnly ? MUSTER_TEXTE.gallery.email : galleryData.email) && (
                        <span style={{ fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)' }}>
                          ✉️ <a href={`mailto:${musterOnly ? MUSTER_TEXTE.gallery.email : galleryData.email}`} style={{ color: 'var(--k2-accent)', textDecoration: 'none' }}>
                            {musterOnly ? MUSTER_TEXTE.gallery.email : galleryData.email}
                          </a>
                        </span>
                      )}
                      {(musterOnly ? MUSTER_TEXTE.gallery.website : galleryData.website) && (
                        <span style={{ fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)' }}>
                          🌐 <a href={`https://${(musterOnly ? MUSTER_TEXTE.gallery.website : galleryData.website).replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--k2-accent)', textDecoration: 'none' }}>
                            {musterOnly ? MUSTER_TEXTE.gallery.website : galleryData.website}
                          </a>
                        </span>
                      )}
                      {(musterOnly ? (MUSTER_TEXTE.gallery as any).openingHours : galleryData.openingHours) && (
                        <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)' }}>
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
                        <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)' }}>
                          📞 {musterOnly ? MUSTER_TEXTE.martina.phone : martinaData.phone}
                        </span>
                      )}
                      {(musterOnly ? MUSTER_TEXTE.martina.email : martinaData.email) && (
                        <span style={{ fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)' }}>
                          ✉️ <a href={`mailto:${musterOnly ? MUSTER_TEXTE.martina.email : martinaData.email}`} style={{ color: 'var(--k2-accent)', textDecoration: 'none' }}>
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
                        <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)' }}>
                          📞 {musterOnly ? MUSTER_TEXTE.georg.phone : georgData.phone}
                        </span>
                      )}
                      {(musterOnly ? MUSTER_TEXTE.georg.email : georgData.email) && (
                        <span style={{ fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)' }}>
                          ✉️ <a href={`mailto:${musterOnly ? MUSTER_TEXTE.georg.email : georgData.email}`} style={{ color: 'var(--k2-accent)', textDecoration: 'none' }}>
                            {musterOnly ? MUSTER_TEXTE.georg.email : georgData.email}
                          </a>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Gewerbe & Haftungsausschluss */}
                  <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <p style={{ margin: '0 0 0.5rem', fontSize: 'clamp(0.7rem, 1.6vw, 0.8rem)' }}>
                      Gewerbe: freie Kunstschaffende
                    </p>
                    <p style={{ margin: '0 0 0.5rem', fontSize: 'clamp(0.7rem, 1.6vw, 0.8rem)', opacity: 0.6 }}>
                      Haftungsausschluss: Die Inhalte wurden mit Sorgfalt erstellt. Für Richtigkeit, Vollständigkeit und Aktualität kann keine Gewähr übernommen werden.
                    </p>
                    {!musterOnly && (
                    <p style={{ margin: '1rem 0 0', fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)', opacity: 0.5, fontStyle: 'italic' }}>
                      Website erstellt von Georg Kreinecker
                    </p>
                    )}
                  </div>
                </div>
                
                {/* Rechte Seite: genau ein QR (Vercel – funktioniert überall) */}
                {vercelQrDataUrl && (
                    <div style={{
                      textAlign: 'center',
                      flexShrink: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      alignItems: 'center'
                    }}>
                      <p style={{ margin: '0 0 0.25rem', fontSize: 'clamp(0.7rem, 1.6vw, 0.8rem)', color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                        📱 Für iPad/Handy: QR scannen (immer aktueller Stand)
                      </p>
                      <div style={{ background: '#fff', padding: '0.4rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                        <img src={vercelQrDataUrl} alt="QR Galerie" style={{ width: 100, height: 100, display: 'block' }} />
                      </div>
                      <p style={{ margin: 0, fontSize: 'clamp(0.55rem, 1.2vw, 0.65rem)', color: 'rgba(255,255,255,0.5)', wordBreak: 'break-all', maxWidth: 140 }}>
                        k2-galerie.vercel.app
                      </p>
                    </div>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default GaleriePage
