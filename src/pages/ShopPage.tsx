import { useState, useEffect, useRef, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import jsQR from 'jsqr'
import QRCode from 'qrcode'
import { PROJECT_ROUTES } from '../config/navigation'
import { getCategoryLabel, MUSTER_TEXTE, MUSTER_ARTWORKS, PRODUCT_COPYRIGHT } from '../config/tenantConfig'
import { loadStammdaten, loadVk2Stammdaten } from '../utils/stammdatenStorage'
import { readArtworksRawByKey, saveArtworksByKey } from '../utils/artworksStorage'
import { isOeffentlichDisplayContext } from '../utils/oeffentlichContext'
import { getShopStorageKeys } from '../utils/shopContextKeys'
import { getCustomers, getCustomerById, createCustomer, updateCustomer, type Customer } from '../utils/customers'
import { readKuenstlerFallbackShop, resolveArtistLabelForGalerieStatistik } from '../utils/artworkArtistDisplay'
import { sortArtworksCategoryBlocksThenNumberAsc } from '../utils/artworkSort'
import { hasKassa, hasKassabuchVoll, isKassabuchAktiv, addKassabuchEintrag, loadKassabuch, saveKassabuch, type KassabuchEintrag } from '../utils/kassabuchStorage'
import { PROMO_FONTS_URL } from '../config/marketingWerbelinie'
import { useGamificationChecklistsUi } from '../hooks/useGamificationChecklistsUi'
import '../App.css'

/** VK-Preis aus Werkstamm: Zahl oder deutsche Schreibweise (z. B. „15,00“), € optional */
function parseArtworkPriceEur(raw: unknown): number {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0
  const n = parseFloat(
    String(raw ?? '')
      .trim()
      .replace(/€/g, '')
      .replace(/\s/g, '')
      .replace(',', '.')
  )
  return Number.isFinite(n) ? n : 0
}

/** CSS-Px → mm (96 CSS-Px = 1 Zoll) – für Bon-Höhe nach Layout (iPad/Safari ignoriert oft `size: … auto`). */
function pxToMmCss(px: number): number {
  return (px / 96) * 25.4
}

/**
 * Setzt @page auf feste mm-Höhe aus Inhalt (nach Layout). iOS-AirPrint-Vorschau bleibt oft A4-ähnlich,
 * aber Druck/Treiber bekommen eine kurze Seite → weniger „Endlos-Streifen“ als bei voller A4-Höhe.
 */
function injectReceiptPrintPageSizeMm(printWindow: Window, widthMm = 80): void {
  const doc = printWindow.document
  const body = doc.body
  if (!body) return
  const root = doc.documentElement
  const hPx = Math.max(body.scrollHeight, root?.scrollHeight ?? 0, body.offsetHeight)
  const hMm = Math.ceil(pxToMmCss(hPx) + 8)
  const clamped = Math.min(1200, Math.max(40, hMm))
  doc.getElementById('k2-receipt-print-page')?.remove()
  const style = doc.createElement('style')
  style.id = 'k2-receipt-print-page'
  style.textContent = `@media print {
  @page { size: ${widthMm}mm ${clamped}mm; margin: 0; }
}`
  doc.head.appendChild(style)
}

/** Nur Druckfarben + schmale Spalte; @page-Größe kommt per injectReceiptPrintPageSizeMm (siehe oben). */
const CSS_PRINT_80MM_ROLL = `
@media print {
  * {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  html, body {
    width: 80mm !important;
    max-width: 80mm !important;
    height: auto !important;
    min-height: 0 !important;
  }
  body {
    margin: 0;
    padding: 0;
  }
}
`

// Kassa-Stil – ruhig, edel, dezentes Terracotta als Akzent
const s = {
  bgDark: '#f8f7f5',          // Neutrales Warmweiß
  bgCard: '#ffffff',          // Reines Weiß für Karten
  bgElevated: '#f0eeeb',     // Leichtes Grau für Hover
  accent: '#7a3b1e',         // Gedämpftes Dunkelbraun-Terracotta (weniger Orange)
  accentSoft: 'rgba(122, 59, 30, 0.07)',
  accentGreen: '#2d7a3a',
  accentGreenSoft: 'rgba(45, 122, 58, 0.1)',
  text: '#1c1a17',           // Fast schwarz, warm
  muted: '#7a6f66',          // Warmes Mittelgrau
  gradientAccent: 'linear-gradient(135deg, #7a3b1e 0%, #9e4e28 100%)',
  gradientGreen: 'linear-gradient(135deg, #2d7a3a 0%, #3d9e4e 100%)',
  fontHeading: "'Playfair Display', Georgia, serif",
  fontBody: "'Source Sans 3', -apple-system, sans-serif",
  radius: '14px',
  radiusSm: '10px',
  shadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
  shadowMd: '0 4px 20px rgba(0, 0, 0, 0.08)',
  shadowLg: '0 8px 32px rgba(0, 0, 0, 0.12)',
  border: '1px solid rgba(0, 0, 0, 0.08)',
  borderStrong: '1px solid rgba(122, 59, 30, 0.25)',
}

interface CartItem {
  number: string
  /** Level 5: stabile technische Identität – Nummer kann sich ändern, uid nicht */
  artworkUid?: string
  title: string
  price: number
  category: string
  artist?: string
  imageUrl?: string
  previewUrl?: string
  paintingWidth?: number
  paintingHeight?: number
  ceramicHeight?: number
  ceramicDiameter?: number
  ceramicType?: string
  ceramicSurface?: string
  ceramicDescription?: string
  ceramicSubcategory?: string
}

const ShopPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { showChecklists: showGamificationChecklists } = useGamificationChecklistsUi()
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCheckout, setShowCheckout] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('card')
  const [discount, setDiscount] = useState(0)
  const [showScanner, setShowScanner] = useState(false)
  const [serialInput, setSerialInput] = useState('')
  const scannerVideoRef = useRef<HTMLVideoElement>(null)
  const scannerCanvasRef = useRef<HTMLCanvasElement>(null)
  const scannerStreamRef = useRef<MediaStream | null>(null)
  const scannerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [allArtworks, setAllArtworks] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [bankverbindung, setBankverbindung] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  // Internetshop: Kundendaten vom Besucher (werden in Kundendatei gespeichert)
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  // Reservierung: Formular und Kundendaten (ebenfalls in Kundendatei)
  const [showReservationForm, setShowReservationForm] = useState(false)
  const [reservationName, setReservationName] = useState('')
  const [reservationEmail, setReservationEmail] = useState('')
  const [reservationPhone, setReservationPhone] = useState('')
  // Mobil: Wenn Besucher-Ansicht, aber Admin-Login gespeichert → „Als Kasse öffnen“ anzeigen und nach Klick Kasse aktivieren
  const [forceKasseOpen, setForceKasseOpen] = useState(false)
  // Rechnungsformular: Kunde aus Datenbank oder manuell, Vorschau
  const [showRechnungForm, setShowRechnungForm] = useState(false)
  const [rechnungKundeTyp, setRechnungKundeTyp] = useState<'auswahl' | 'manuell'>('auswahl')
  const [rechnungManual, setRechnungManual] = useState({ name: '', email: '', phone: '', street: '', plz: '', city: '' })
  const [showNummernListe, setShowNummernListe] = useState(false)
  const [showVerkaufsliste, setShowVerkaufsliste] = useState(false)
  const [soldEntriesList, setSoldEntriesList] = useState<Array<{ number: string; artworkUid?: string; soldAt?: string; orderId?: string; title: string; price: number }>>([])
  // Kurze Bestätigung „zur Auswahl hinzugefügt“ – auto-schließend, kein Schließen-Button
  const [addedToast, setAddedToast] = useState<string | null>(null)
  const addedToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Rechnung ohne Kundendaten: manuelle Eingabe im Checkout (einfach = nur Name, ausführlich = Firma/Adresse)
  const [rechnungManuellCheckout, setRechnungManuellCheckout] = useState<{
    typ: 'einfach' | 'ausfuehrlich'
    name: string
    firma: string
    street: string
    plz: string
    city: string
    email: string
    phone: string
    uid: string
  }>({ typ: 'einfach', name: '', firma: '', street: '', plz: '', city: '', email: '', phone: '', uid: '' })
  // VK2 Vereins-Kasse (schlank): Betrag, Bezeichnung (5 Optionen), bei Spende/Mitgliedsbeitrag optional Name aus Mitgliederliste, Bon optional
  const [vk2Betrag, setVk2Betrag] = useState('')
  const [vk2Bezeichnung, setVk2Bezeichnung] = useState('')
  const [vk2MitgliedName, setVk2MitgliedName] = useState('') // bei Spende/Mitgliedsbeitrag: aus kurzem Mitgliederverzeichnis
  const [vk2PaymentMethod, setVk2PaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash')
  const [vk2RechnungEmpfaenger, setVk2RechnungEmpfaenger] = useState('') // bei Zahlungsart Rechnung: Name/Firma für A4-Rechnung
  const [vk2BonDrucken, setVk2BonDrucken] = useState(true)
  const [showVk2StornoList, setShowVk2StornoList] = useState(false)
  // VK2 Kassaausgang: Ausgabe erfassen (Betrag + Verwendungszweck → Kassabuch art: ausgang)
  const [vk2AusgangBetrag, setVk2AusgangBetrag] = useState('')
  const [vk2AusgangZweck, setVk2AusgangZweck] = useState('')
  const VK2_BEZEICHNUNG_OPTIONEN = ['Eintritt', 'Spende', 'Mitgliedsbeitrag', 'Verpflegung / Getränke', 'Sonstiges'] as const
  const VK2_AUSGANG_OPTIONEN = ['Material', 'Honorar', 'Miete', 'Getränke / Verpflegung', 'Sonstiges'] as const

  type SellerSnapshotV1 = {
    version: 1
    capturedAt: string
    tenant: 'k2' | 'oeffentlich' | 'vk2'
    gallery?: {
      name?: string
      address?: string
      city?: string
      country?: string
      phone?: string
      email?: string
      website?: string
      ustIdNr?: string
      bankverbindung?: string
      iban?: string
    }
    vk2Verein?: {
      name?: string
      address?: string
      city?: string
      country?: string
      phone?: string
      email?: string
      bankverbindung?: string
      iban?: string
    }
  }

  type BuyerSnapshotV1 = {
    version: 1
    capturedAt: string
    source: 'customerId' | 'guest' | 'manual'
    customerId?: string
    name?: string
    firma?: string
    street?: string
    plz?: string
    city?: string
    email?: string
    phone?: string
    uid?: string
  }

  const buildSellerSnapshot = (): SellerSnapshotV1 => {
    const capturedAt = new Date().toISOString()
    if (fromVk2) {
      const vk2 = loadVk2Stammdaten()
      const v = (vk2?.verein || {}) as Record<string, unknown>
      return {
        version: 1,
        capturedAt,
        tenant: 'vk2',
        vk2Verein: {
          name: typeof v.name === 'string' ? v.name : undefined,
          address: typeof v.address === 'string' ? v.address : undefined,
          city: typeof v.city === 'string' ? v.city : undefined,
          country: typeof v.country === 'string' ? v.country : undefined,
          phone: typeof v.phone === 'string' ? v.phone : undefined,
          email: typeof v.email === 'string' ? v.email : undefined,
          bankverbindung: typeof v.bankverbindung === 'string' ? v.bankverbindung : undefined,
          iban: typeof v.iban === 'string' ? v.iban : undefined,
        }
      }
    }
    const tenant = fromOeffentlich ? 'oeffentlich' : 'k2'
    const g = loadStammdaten(tenant as 'k2' | 'oeffentlich', 'gallery') || {}
    return {
      version: 1,
      capturedAt,
      tenant,
      gallery: {
        name: (g as any).name,
        address: (g as any).address,
        city: (g as any).city,
        country: (g as any).country,
        phone: (g as any).phone,
        email: (g as any).email,
        website: (g as any).website,
        ustIdNr: (g as any).ustIdNr,
        bankverbindung: (g as any).bankverbindung,
        iban: (g as any).iban,
      }
    }
  }

  const buildBuyerSnapshot = (args: { customerId?: string; manualRechnung?: any }): BuyerSnapshotV1 | undefined => {
    const capturedAt = new Date().toISOString()
    if (args.manualRechnung) {
      const m = args.manualRechnung
      return {
        version: 1,
        capturedAt,
        source: 'manual',
        name: (m.name || '').trim() || undefined,
        firma: (m.firma || '').trim() || undefined,
        street: (m.street || '').trim() || undefined,
        plz: (m.plz || '').trim() || undefined,
        city: (m.city || '').trim() || undefined,
        email: (m.email || '').trim() || undefined,
        phone: (m.phone || '').trim() || undefined,
        uid: (m.uid || '').trim() || undefined,
      }
    }
    if (args.customerId) {
      const c = customers.find(x => x.id === args.customerId)
      return {
        version: 1,
        capturedAt,
        source: 'customerId',
        customerId: args.customerId,
        name: (c?.name || '').trim() || undefined,
        email: (c?.email || '').trim() || undefined,
        phone: (c?.phone || '').trim() || undefined,
      }
    }
    const name = (guestName || '').trim()
    const email = (guestEmail || '').trim()
    const phone = (guestPhone || '').trim()
    if (name || email || phone) {
      return { version: 1, capturedAt, source: 'guest', name: name || undefined, email: email || undefined, phone: phone || undefined }
    }
    return undefined
  }

  // Ök2: „Zur Galerie“ und Kontakt – eine zentrale Quelle (Phase 5.3). Muss vor Galerie-Stammdaten-Load stehen.
  const fromOeffentlich = isOeffentlichDisplayContext(location.state)
  const fromVk2 =
    (location.state as { fromVk2?: boolean } | null)?.fromVk2 === true ||
    (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('k2-admin-context') === 'vk2')
  // Kontexteigene Keys (Datensicherheit: keine K2-Daten in ök2/VK2 und umgekehrt)
  const { ordersKey, soldArtworksKey } = getShopStorageKeys(fromOeffentlich, fromVk2)
  const vk2Mitglieder = (() => { try { const sd = loadVk2Stammdaten(); return Array.isArray(sd?.mitglieder) ? sd.mitglieder : [] } catch { return [] } })()
  const showVk2Mitglieder = fromVk2 && (vk2Bezeichnung === 'Spende' || vk2Bezeichnung === 'Mitgliedsbeitrag')
  const galerieLink = fromOeffentlich
    ? PROJECT_ROUTES['k2-galerie'].galerieOeffentlichVorschau
    : fromVk2
      ? PROJECT_ROUTES.vk2.galerie
      : PROJECT_ROUTES['k2-galerie'].galerieVorschau

  // Galerie-Stammdaten: Kontext getrennt – K2 = echte Daten, ök2 = nur oeffentlich/Muster
  const [internetShopNotSetUp, setInternetShopNotSetUp] = useState(true)
  const [galleryEmail, setGalleryEmail] = useState('')
  const [galleryPhone, setGalleryPhone] = useState('')
  useEffect(() => {
    try {
      const tenant = fromOeffentlich ? 'oeffentlich' : 'k2'
      const data = loadStammdaten(tenant as 'k2' | 'oeffentlich', 'gallery')
      if (data && typeof data === 'object') {
        setBankverbindung((data as any).bankverbindung || '')
        setGalleryEmail((data as any).email || '')
        setGalleryPhone((data as any).phone || '')
        setInternetShopNotSetUp((data as any).internetShopNotSetUp !== false)
      }
    } catch (_) {}
  }, [fromOeffentlich])

  // Von Galerie (Willkommensseite oder Galerie-Vorschau) zum Shop → Kundenansicht. Flag + Referrer (State geht bei SPA oft verloren).
  const fromStorage = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('k2-from-galerie-view') === '1'
  const referrer = typeof document !== 'undefined' ? document.referrer : ''
  // Nur Galerie-Vorschau (Werke ansehen) = Kundenansicht. Willkommensseite nicht – Workflow: Start → Admin → Kassa.
  const fromReferrer = referrer.includes('galerie-vorschau')
  const fromGalerieView =
    fromStorage ||
    (location.state as { fromGalerieView?: boolean } | null)?.fromGalerieView === true ||
    fromReferrer
  const displayPhone = fromOeffentlich ? MUSTER_TEXTE.gallery.phone : galleryPhone
  const displayEmail = fromOeffentlich ? MUSTER_TEXTE.gallery.email : galleryEmail
  const kuenstlerFbShop = useMemo(() => readKuenstlerFallbackShop(fromOeffentlich), [fromOeffentlich])

  // Ök2-Flag entfernen, wenn Shop von K2/APf aus geöffnet wurde (kein State, Referrer nicht von galerie-oeffentlich). Nicht entfernen wenn ök2-Kassa (k2-admin-context === oeffentlich).
  useEffect(() => {
    const stateOeffentlich = (location.state as { fromOeffentlich?: boolean } | null)?.fromOeffentlich === true
    const referrerOeffentlich = typeof document !== 'undefined' && document.referrer.includes('galerie-oeffentlich')
    const adminOeffentlich = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('k2-admin-context') === 'oeffentlich'
    if (!stateOeffentlich && !referrerOeffentlich && !adminOeffentlich) {
      try { sessionStorage.removeItem('k2-shop-from-oeffentlich') } catch (_) {}
    }
  }, [location.state])

  useEffect(() => {
    if (fromGalerieView) {
      try {
        sessionStorage.removeItem('k2-admin-context')
        sessionStorage.removeItem('k2-from-galerie-view')
        // Von ök2-Vorschau (Referrer) → Flag setzen, damit „Zur Galerie“ und Kontakt auch nach State-Clear ök2 bleiben
        if (typeof document !== 'undefined' && document.referrer.includes('galerie-oeffentlich')) {
          sessionStorage.setItem('k2-shop-from-oeffentlich', '1')
        }
      } catch (_) {}
      if ((location.state as { fromGalerieView?: boolean } | null)?.fromGalerieView === true) {
        navigate(location.pathname, { replace: true, state: {} })
      }
    }
  }, [fromGalerieView, location.state, location.pathname, navigate])

  // Admin: openAsKasse → direkt Kasse öffnen. Bei ök2/VK2: Kontext setzen.
  useEffect(() => {
    const state = location.state as { openAsKasse?: boolean; fromOeffentlich?: boolean; fromVk2?: boolean } | null
    if (state?.openAsKasse) {
      try {
        if (state.fromVk2) {
          sessionStorage.setItem('k2-admin-context', 'vk2')
        } else {
          sessionStorage.setItem('k2-admin-context', state.fromOeffentlich ? 'oeffentlich' : 'k2')
          if (state.fromOeffentlich) sessionStorage.setItem('k2-shop-from-oeffentlich', '1')
        }
      } catch (_) {}
      setForceKasseOpen(true)
    }
  }, [location.state])

  // Nur mit Admin-Login: Kasse. Von Galerie kommend = Kundenansicht. „Als Kasse öffnen“ setzt forceKasseOpen.
  const hasStoredAdminLogin =
    typeof localStorage !== 'undefined' &&
    localStorage.getItem('k2-admin-unlocked') === 'k2' &&
    (() => {
      const exp = localStorage.getItem('k2-admin-unlocked-expiry')
      return !exp || Date.now() < parseInt(exp, 10)
    })()
  const isAdminContext =
    forceKasseOpen ||
    (!fromGalerieView && typeof sessionStorage !== 'undefined' && !!sessionStorage.getItem('k2-admin-context'))

  // Zurück zum Admin: Kontext erhalten (VK2/ök2), sonst landet man in K2
  const adminLink =
    typeof sessionStorage !== 'undefined'
      ? (() => {
          const ctx = sessionStorage.getItem('k2-admin-context')
          if (ctx === 'vk2') return '/admin?context=vk2'
          if (ctx === 'oeffentlich') return '/admin?context=oeffentlich'
          return '/admin'
        })()
      : '/admin'

  // Warenkorb aus localStorage laden
  useEffect(() => {
    const loadCart = () => {
      try {
        const cartData = localStorage.getItem('k2-cart')
        if (cartData) {
          setCart(JSON.parse(cartData))
        }
      } catch (error) {
        console.error('Fehler beim Laden des Warenkorbs:', error)
      }
    }
    loadCart()
    window.addEventListener('storage', loadCart)
    return () => window.removeEventListener('storage', loadCart)
  }, [])

  // Warenkorb in localStorage speichern
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('k2-cart', JSON.stringify(cart))
    } else {
      localStorage.removeItem('k2-cart')
    }
  }, [cart])

  // Alle Werke laden für Suche – im ök2-Kontext Musterwerke, sonst k2-artworks
  useEffect(() => {
    const loadArtworks = () => {
      if (fromOeffentlich) {
        const stored = readArtworksRawByKey('k2-oeffentlich-artworks')
        const list = Array.isArray(stored) && stored.length > 0 ? stored : MUSTER_ARTWORKS
        setAllArtworks(list)
      } else {
        const artworks = readArtworksRawByKey('k2-artworks')
        if (Array.isArray(artworks)) setAllArtworks(artworks)
      }
    }
    loadArtworks()
    window.addEventListener('artworks-updated', loadArtworks)
    return () => window.removeEventListener('artworks-updated', loadArtworks)
  }, [fromOeffentlich])

  // Level 5: Falls ein alter Warenkorb noch keine artworkUid hat, beim Vorliegen der Werkliste ergänzen
  useEffect(() => {
    if (!Array.isArray(allArtworks) || allArtworks.length === 0) return
    setCart(prev => {
      if (!Array.isArray(prev) || prev.length === 0) return prev
      let changed = false
      const next = prev.map((item: CartItem) => {
        const hasUid = String((item as any)?.artworkUid ?? '').trim()
        if (hasUid) return item
        const num = String((item as any)?.number ?? '').trim()
        if (!num) return item
        const match = allArtworks.find((a: any) => String(a?.uid ?? '').trim() && String(a?.number ?? a?.id ?? '').trim() === num)
        const uid = String(match?.uid ?? '').trim()
        if (!uid) return item
        changed = true
        return { ...item, artworkUid: uid }
      })
      return changed ? next : prev
    })
  }, [allArtworks])

  // Bestellungen laden (für Bon erneut drucken) – kontexteigener Key (Datensicherheit)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(ordersKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setOrders(parsed.slice(-20).reverse()) // Letzte 20, neueste zuerst
        }
      }
    } catch (_) {}
  }, [ordersKey])

  // Kunden für Zuordnung beim Verkauf
  useEffect(() => {
    const load = () => setCustomers(getCustomers())
    load()
    window.addEventListener('customers-updated', load)
    return () => window.removeEventListener('customers-updated', load)
  }, [])

  // Bon oder Rechnung erneut drucken
  const handleReprintOrder = (order: any) => {
    const paymentText = order.paymentMethod === 'cash' ? 'Bar' : order.paymentMethod === 'card' ? 'Karte' : 'Rechnung'
    const useBon = confirm(`Bon ${order.orderNumber}\n€${(order.total || 0).toFixed(2)} · ${paymentText}\n\nKassabon (80mm) = OK\nRechnung (A4) = Abbrechen`)
    if (useBon) {
      printReceipt(order)
    } else {
      printReceiptA4(order, true)
    }
  }

  // Eintrag aus „Bon erneut drucken“-Liste entfernen (nur Anzeige, Verkauf bleibt in sold-artworks)
  const handleDeleteOrderFromList = (order: any) => {
    if (!confirm(`Eintrag ${order.orderNumber} (€${(order.total || 0).toFixed(2)}) aus der Liste entfernen?`)) return
    try {
      const stored = JSON.parse(localStorage.getItem(ordersKey) || '[]')
      if (!Array.isArray(stored)) return
      const key = order.id || `${order.orderNumber}-${order.date}`
      const filtered = stored.filter((o: any) => (o.id || `${o.orderNumber}-${o.date}`) !== key)
      localStorage.setItem(ordersKey, JSON.stringify(filtered))
      setOrders(prev => prev.filter((o: any) => (o.id || `${o.orderNumber}-${o.date}`) !== key))
    } catch (_) {}
  }

  // Verkauf stornieren: Eintrag aus Liste + aus sold-artworks entfernen, Stückzahl pro Werk +1
  const handleStornoOrder = (order: any) => {
    if (!confirm(`Verkauf ${order.orderNumber} (€${(order.total || 0).toFixed(2)}) wirklich stornieren? Die Werke gelten wieder als verfügbar.`)) return
    try {
      const orderKey = order.id || `${order.orderNumber}-${order.date}`
      const soldArtworks = JSON.parse(localStorage.getItem(soldArtworksKey) || '[]')
      const filtered = Array.isArray(soldArtworks)
        ? soldArtworks.filter((e: any) => e.orderId !== order.id)
        : []
      if (filtered.length < (soldArtworks?.length ?? 0)) {
        localStorage.setItem(soldArtworksKey, JSON.stringify(filtered))
      }
      const artworkKey = fromOeffentlich ? 'k2-oeffentlich-artworks' : 'k2-artworks'
      const artworks = readArtworksRawByKey(artworkKey)
      if (Array.isArray(artworks) && order.items && order.items.length > 0) {
        let changed = false
        order.items.forEach((item: { number: string; artworkUid?: string }) => {
          const uid = String((item as any)?.artworkUid ?? '').trim()
          const idx = artworks.findIndex((a: any) => {
            const aUid = String(a?.uid ?? '').trim()
            if (uid && aUid && aUid === uid) return true
            return (a.number || a.id) === item.number
          })
          if (idx !== -1) {
            const a = artworks[idx]
            const q = a.quantity != null ? Number(a.quantity) : 0
            artworks[idx] = { ...a, quantity: q + 1, inShop: true }
            changed = true
          }
        })
        if (changed) {
          saveArtworksByKey(artworkKey, artworks, { filterK2Only: artworkKey === 'k2-artworks', allowReduce: true })
        }
      }
      const stored = JSON.parse(localStorage.getItem(ordersKey) || '[]')
      if (Array.isArray(stored)) {
        const ordersFiltered = stored.filter((o: any) => (o.id || `${o.orderNumber}-${o.date}`) !== orderKey)
        localStorage.setItem(ordersKey, JSON.stringify(ordersFiltered))
        setOrders(prev => prev.filter((o: any) => (o.id || `${o.orderNumber}-${o.date}`) !== orderKey))
      }
      window.dispatchEvent(new CustomEvent('artworks-updated'))
      setAllArtworks(prev => {
        const key = fromOeffentlich ? 'k2-oeffentlich-artworks' : 'k2-artworks'
        const next = readArtworksRawByKey(key)
        return Array.isArray(next) ? next : prev
      })
      alert('✅ Verkauf storniert. Die Werke sind wieder verfügbar.')
    } catch (_) {
      alert('⚠️ Storno fehlgeschlagen.')
    }
  }

  const MAX_VERKAUFSLISTE = 15

  // Verkaufsliste für Storno laden (max 15 neueste)
  const loadVerkaufslisteForStorno = () => {
    try {
      const raw = localStorage.getItem(soldArtworksKey)
      const arr = JSON.parse(raw || '[]')
      if (!Array.isArray(arr)) {
        setSoldEntriesList([])
        return
      }
      const sorted = [...arr].sort((a: any, b: any) => (b.soldAt || '').localeCompare(a.soldAt || ''))
      const top = sorted.slice(0, MAX_VERKAUFSLISTE).map((e: any) => {
        const uid = String(e?.artworkUid ?? '').trim()
        const werk = allArtworks.find((a: any) => {
          const aUid = String(a?.uid ?? '').trim()
          if (uid && aUid && aUid === uid) return true
          return (a.number || a.id) === e.number
        })
        return {
          number: e.number || '',
          artworkUid: uid || undefined,
          soldAt: e.soldAt,
          orderId: e.orderId,
          title: werk?.title || e.number || '–',
          price: e.soldPrice ?? werk?.price ?? 0
        }
      })
      setSoldEntriesList(top)
    } catch (_) {
      setSoldEntriesList([])
    }
  }

  // Einzelnen Verkauf stornieren (nach Index in der Anzeige, max 15)
  const handleStornoSingle = (index: number) => {
    const entry = soldEntriesList[index]
    if (!entry || !confirm(`Verkauf „${entry.title}“ (Nr. ${entry.number}) stornieren? Das Werk gilt wieder als verfügbar.`)) return
    try {
      const raw = localStorage.getItem(soldArtworksKey)
      const arr = JSON.parse(raw || '[]')
      if (!Array.isArray(arr)) return
      const sorted = [...arr].sort((a: any, b: any) => (b.soldAt || '').localeCompare(a.soldAt || ''))
      if (index >= sorted.length) return
      const removed = sorted[index]
      const removeIdx = arr.findIndex((e: any) => e.number === removed.number && (e.soldAt || '') === (removed.soldAt || ''))
      if (removeIdx === -1) return
      arr.splice(removeIdx, 1)
      localStorage.setItem(soldArtworksKey, JSON.stringify(arr))
      const artworkKey = fromOeffentlich ? 'k2-oeffentlich-artworks' : 'k2-artworks'
      const artworks = readArtworksRawByKey(artworkKey)
      const uid = String((removed as any)?.artworkUid ?? '').trim()
      const idx = artworks.findIndex((a: any) => {
        const aUid = String(a?.uid ?? '').trim()
        if (uid && aUid && aUid === uid) return true
        return (a.number || a.id) === removed.number
      })
      if (idx !== -1) {
        const a = artworks[idx]
        const q = a.quantity != null ? Number(a.quantity) : 0
        artworks[idx] = { ...a, quantity: q + 1, inShop: true }
        saveArtworksByKey(artworkKey, artworks, { filterK2Only: artworkKey === 'k2-artworks', allowReduce: true })
      }
      window.dispatchEvent(new CustomEvent('artworks-updated'))
      setAllArtworks(prev => {
        const next = readArtworksRawByKey(artworkKey)
        return Array.isArray(next) ? next : prev
      })
      loadVerkaufslisteForStorno()
      alert('✅ Verkauf storniert.')
    } catch (_) {
      alert('⚠️ Storno fehlgeschlagen.')
    }
  }

  // Werk per Seriennummer oder Titel finden und zum Warenkorb hinzufügen
  const addBySerialNumber = (overrideSerial?: string) => {
    const raw = (overrideSerial ?? serialInput).trim()
    if (!raw) {
      alert('Bitte Seriennummer oder Werktitel eingeben')
      return
    }
    const serialUpper = raw.toUpperCase()
    const serialNorm = raw.toLowerCase()

    // Suche: zuerst exakt nach Nummer oder ID, sonst nach Titel (enthält Suchbegriff)
    let artwork = allArtworks.find((a: any) =>
      (a.number && a.number.toUpperCase() === serialUpper) ||
      (a.id && a.id.toUpperCase() === serialUpper)
    )
    if (!artwork && serialNorm.length >= 2) {
      artwork = allArtworks.find((a: any) =>
        a.title && a.title.trim().toLowerCase().includes(serialNorm)
      )
    }

    if (!artwork) {
      alert(`Werk "${raw}" nicht gefunden`)
      return
    }

    // Prüfe ob bereits verkauft
    try {
      const soldData = localStorage.getItem(soldArtworksKey)
      if (soldData) {
        const soldArtworks = JSON.parse(soldData)
        if (Array.isArray(soldArtworks)) {
          const auid = String(artwork?.uid ?? '').trim()
          const isSold = soldArtworks.some((a: any) => {
            if (!a) return false
            const suid = String(a?.artworkUid ?? '').trim()
            if (auid && suid && suid === auid) return true
            return a.number === artwork.number
          })
          if (isSold) {
            alert('Dieses Werk ist bereits verkauft.')
            return
          }
        }
      }
    } catch (error) {
      // Ignoriere Fehler
    }

    // Prüfe ob bereits im Warenkorb (Level 5: bevorzugt über uid)
    const foundUid = String(artwork?.uid ?? '').trim()
    if (foundUid ? cart.some(item => String(item.artworkUid ?? '').trim() === foundUid) : cart.some(item => item.number === artwork.number)) {
      alert('Dieses Werk ist bereits in deiner Auswahl.')
      return
    }

    // Preis (Komma-Notation sicher parsen)
    const priceVal = parseArtworkPriceEur(artwork?.price)
    // Besucher-Shop: nur Werke mit Online-Shop + Preis. Kassa (Admin): alle mit Preis > 0 (Werkkatalog/Laden, auch ohne inShop).
    if (isAdminContext) {
      if (priceVal <= 0) {
        alert('Dieses Werk hat keinen Preis.')
        return
      }
    } else if (artwork.inShop === false || priceVal <= 0) {
      alert('Dieses Werk ist nicht im Online-Shop verfügbar oder hat keinen Preis.')
      return
    }

    // Zum Warenkorb hinzufügen
    const cartItem: CartItem = {
      number: artwork.number || artwork.id,
      artworkUid: foundUid || undefined,
      title: artwork.title || artwork.number,
      price: priceVal,
      category: artwork.category,
      artist: artwork.artist,
      imageUrl: artwork.imageUrl,
      previewUrl: artwork.imageUrl,
      paintingWidth: artwork.paintingWidth,
      paintingHeight: artwork.paintingHeight,
      ceramicHeight: artwork.ceramicHeight,
      ceramicDiameter: artwork.ceramicDiameter,
      ceramicType: artwork.ceramicType,
      ceramicSurface: artwork.ceramicSurface,
      ceramicDescription: artwork.ceramicDescription,
      ceramicSubcategory: artwork.ceramicSubcategory
    }

    setCart([...cart, cartItem])
    setSerialInput('')
    const msg = `"${artwork.title || artwork.number}" wurde zur Auswahl hinzugefügt.`
    if (addedToastTimerRef.current) clearTimeout(addedToastTimerRef.current)
    setAddedToast(msg)
    addedToastTimerRef.current = setTimeout(() => {
      setAddedToast(null)
      addedToastTimerRef.current = null
    }, 1500)
  }

  // QR-Code Scanner: Kamera starten wenn Modal öffnet
  useEffect(() => {
    if (!showScanner) {
      // Kamera stoppen
      if (scannerIntervalRef.current) { clearInterval(scannerIntervalRef.current); scannerIntervalRef.current = null }
      if (scannerStreamRef.current) { scannerStreamRef.current.getTracks().forEach(t => t.stop()); scannerStreamRef.current = null }
      return
    }
    let cancelled = false
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }
        scannerStreamRef.current = stream
        if (scannerVideoRef.current) {
          scannerVideoRef.current.srcObject = stream
          scannerVideoRef.current.play()
        }
        // QR-Code alle 300ms scannen
        scannerIntervalRef.current = setInterval(async () => {
          const video = scannerVideoRef.current
          const canvas = scannerCanvasRef.current
          if (!video || !canvas || video.readyState < 2) return
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          const ctx = canvas.getContext('2d')
          if (!ctx) return
          ctx.drawImage(video, 0, 0)
          try {
            // BarcodeDetector API (Chrome/Safari iOS 17+)
            if ('BarcodeDetector' in window) {
              const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] })
              const codes = await detector.detect(canvas)
              if (codes.length > 0 && codes[0].rawValue) {
                processQRCode(codes[0].rawValue)
                return
              }
            }
            // Fallback: jsQR – funktioniert auf allen Geräten/Browsern
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const result = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' })
            if (result?.data) {
              processQRCode(result.data)
            }
          } catch (_) {}
        }, 300)
      } catch (err) {
        console.warn('Kamera nicht verfügbar:', err)
      }
    }
    startCamera()
    return () => { cancelled = true }
  }, [showScanner])

  // Toast-Timer beim Unmount aufräumen
  useEffect(() => () => {
    if (addedToastTimerRef.current) {
      clearTimeout(addedToastTimerRef.current)
      addedToastTimerRef.current = null
    }
  }, [])

  // QR-Code scannen – Modal öffnen (Kamera startet automatisch via useEffect)
  const handleQRScan = () => {
    setShowScanner(true)
  }

  // QR-Code aus URL oder Text verarbeiten
  const processQRCode = (qrData: string) => {
    if (!qrData || !qrData.trim()) return

    const data = qrData.trim()
    let serial = data.toUpperCase()
    
    try {
      // Versuche URL zu parsen – ?werk=K2-001 oder ähnlich
      const url = new URL(data)
      const werkParam = url.searchParams.get('werk')
      if (werkParam) {
        serial = werkParam.toUpperCase()
      }
    } catch (_) {
      // Keine URL – direkt als Seriennummer
    }
    
    setShowScanner(false)
    setSerialInput(serial)
    // Direkt mit dem gescannten Wert aufrufen (nicht auf State-Update warten)
    addBySerialNumber(serial)
  }

  // Artikel aus Warenkorb entfernen
  const removeFromCart = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index)
    setCart(newCart)
  }

  // Gesamtpreis berechnen
  const subtotal = cart.reduce((sum, item) => sum + item.price, 0)
  const discountAmount = (subtotal * discount) / 100
  const total = subtotal - discountAmount

  // Schnellverkauf - direkt abschließen mit gewählter Zahlungsmethode
  // Rechnung: nur wenn noch kein Kunde → Checkout öffnen; sonst wie Bar/Karte abschließen, danach Wahl Kassenbon oder Rechnung (A4)
  const quickSale = (method: 'cash' | 'card' | 'transfer') => {
    if (cart.length === 0) {
      alert('Auswahl ist leer.')
      return
    }
    if (method === 'transfer' && !selectedCustomerId && !rechnungManuellCheckout.name.trim()) {
      setShowCheckout(true)
      setPaymentMethod('transfer')
      return
    }
    processOrder(method)
  }

  // VK2: Einnahme erfassen (Betrag + Bezeichnung) → Order speichern, Kassabuch, Bon/Rechnung drucken
  const handleVk2Einnahme = () => {
    if (vk2PaymentMethod === 'transfer' && !(vk2RechnungEmpfaenger || '').trim()) {
      alert('Bei Zahlungsart Rechnung bitte Rechnungsempfänger (Name oder Firma) eintragen.')
      return
    }
    const betrag = parseFloat((vk2Betrag || '0').replace(',', '.'))
    if (!Number.isFinite(betrag) || betrag <= 0) {
      alert('Bitte einen gültigen Betrag eingeben.')
      return
    }
    let bezeichnung = (vk2Bezeichnung || 'Einnahme').trim() || 'Einnahme'
    if (vk2MitgliedName.trim()) bezeichnung = bezeichnung + ' – ' + vk2MitgliedName.trim()
    const rechnungEmpfaenger = vk2PaymentMethod === 'transfer' && (vk2RechnungEmpfaenger || '').trim() ? (vk2RechnungEmpfaenger || '').trim() : undefined
    const sellerSnapshot = buildSellerSnapshot()
    const buyerSnapshot: BuyerSnapshotV1 | undefined = rechnungEmpfaenger
      ? { version: 1, capturedAt: new Date().toISOString(), source: 'manual', name: rechnungEmpfaenger }
      : undefined
    const order = {
      id: `ORDER-VK2-${Date.now()}`,
      date: new Date().toISOString(),
      items: [{ title: bezeichnung, price: betrag, number: '', category: '' }],
      subtotal: betrag,
      discount: 0,
      total: betrag,
      paymentMethod: vk2PaymentMethod,
      sellerSnapshot,
      ...(buyerSnapshot ? { buyerSnapshot } : {}),
      orderNumber: `O-VK2-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Date.now()).slice(-4)}`,
      rechnungEmpfaenger: rechnungEmpfaenger,
      rechnungsNr: undefined as string | undefined
    }
    try {
      const ordersStored = JSON.parse(localStorage.getItem(ordersKey) || '[]')
      ordersStored.push(order)
      localStorage.setItem(ordersKey, JSON.stringify(ordersStored))
      setOrders(prev => [order, ...prev.slice(0, 19)])
      addKassabuchEintrag('vk2', {
        datum: order.date.slice(0, 10),
        betrag: order.total,
        art: 'eingang',
        verkaufId: order.id,
        verwendungszweck: bezeichnung
      })
      if (vk2BonDrucken) printVk2Bon(order)
      setVk2Betrag('')
      setVk2Bezeichnung('')
      setVk2MitgliedName('')
      setVk2RechnungEmpfaenger('')
    } catch (e) {
      console.error(e)
      alert('Speichern fehlgeschlagen. Bitte erneut versuchen.')
    }
  }

  // VK2: A4-Rechnung drucken (Verein = Aussteller, ein Position, Bankverbindung aus Verein falls hinterlegt). Gibt Rechnungsnr. zurück (für Nachdruck gleiche Nr.).
  const printVk2Rechnung = (order: any, empfaengerName: string): string | null => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Pop-up-Blocker verhindert Druck. Bitte erlaube Pop-ups für diese Seite.')
      return null
    }
    const vk2 = loadVk2Stammdaten()
    const verein = vk2?.verein || {} as Record<string, string>
    const sellerName = (verein.name && String(verein.name).trim()) ? String(verein.name) : 'Verein'
    const sellerAddress = [verein.address, verein.city, verein.country].filter(Boolean).join(', ') || ''
    const sellerContact = [verein.email, verein.phone].filter(Boolean).join(' · ') || ''
    const bankForRechnung = verein.bankverbindung && String(verein.bankverbindung).trim() ? String(verein.bankverbindung).replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''
    const ibanRaw = verein.iban && String(verein.iban).trim() ? String(verein.iban).trim() : ''
    const ibanDisplay = ibanRaw ? ibanRaw.replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''
    let nrValue = order.rechnungsNr || order.orderNumber
    if (!order.rechnungsNr) {
      try {
        const key = 'k2-vk2-rechnung-counter'
        const year = new Date().getFullYear()
        const stored = localStorage.getItem(key)
        const parsed = stored ? JSON.parse(stored) : { year, next: 1 }
        if (parsed.year !== year) { parsed.year = year; parsed.next = 1 }
        nrValue = `RE-VK2-${year}-${String(parsed.next).padStart(4, '0')}`
        parsed.next += 1
        localStorage.setItem(key, JSON.stringify(parsed))
      } catch (_) {}
    }
    const date = new Date(order.date)
    const rechnungDatum = date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const bezeichnung = (order.items && order.items[0] && order.items[0].title) ? String(order.items[0].title).replace(/</g, '&lt;') : 'Einnahme Vereinsbetrieb'
    const total = typeof order.total === 'number' ? order.total : parseFloat(String(order.total)) || 0
    const bankBlock = [
      bankForRechnung ? `<p style="margin:6px 0 0;font-size:10px;"><strong>Zahlung per Überweisung:</strong><br>${bankForRechnung}</p>` : '',
      ibanDisplay ? `<p style="margin:4px 0 0;font-size:10px;"><strong>IBAN:</strong> ${ibanDisplay}</p>` : ''
    ].filter(Boolean).join('')
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Rechnung – ${sellerName}</title>
<style>body{font-family:Georgia,serif;font-size:11px;line-height:1.4;max-width:600px;margin:12mm auto;padding:0 8mm;color:#111;}
.rechnung-header{font-size:20px;font-weight:700;margin-bottom:2mm;}
.two-cols{display:flex;justify-content:space-between;gap:12mm;margin:8mm 0;}
.col p{margin:2px 0;}
table{width:100%;border-collapse:collapse;margin:8mm 0;}
th,td{padding:4px 6px;text-align:left;border-bottom:1px solid #ddd;}
th{font-size:9px;text-transform:uppercase;}
.total{font-weight:700;font-size:12px;margin-top:6px;}
.footer{margin-top:10mm;padding-top:4px;border-top:1px solid #ddd;font-size:9px;color:#666;}
</style></head><body>
<div class="rechnung-header">RECHNUNG</div>
<div class="two-cols">
  <div class="col"><p><strong>Aussteller</strong></p><p>${sellerName.replace(/</g, '&lt;')}</p>${sellerAddress ? '<p>' + sellerAddress.replace(/</g, '&lt;') + '</p>' : ''}${sellerContact ? '<p>' + sellerContact.replace(/</g, '&lt;') + '</p>' : ''}</div>
  <div class="col"><p><strong>Rechnungsempfänger</strong></p><p>${empfaengerName.replace(/</g, '&lt;')}</p></div>
</div>
<p><strong>Rechnungsnr.:</strong> ${nrValue} &nbsp; <strong>Datum:</strong> ${rechnungDatum}</p>
<table><thead><tr><th>Pos</th><th>Bezeichnung</th><th>Menge</th><th style="text-align:right">Betrag</th></tr></thead>
<tbody><tr><td>1</td><td>${bezeichnung}</td><td>1</td><td style="text-align:right">€ ${total.toFixed(2)}</td></tr></tbody></table>
<div class="total">Gesamtbetrag: € ${total.toFixed(2)}</div>
<p style="margin-top:8px;">Zahlbar innerhalb von 14 Tagen nach Rechnungsdatum ohne Abzug.</p>
${bankBlock}
<div class="footer">${sellerName.replace(/</g, '&lt;')}${sellerAddress ? ' · ' + sellerAddress.replace(/</g, '&lt;') : ''} · Vereinsbetrieb</div>
</body></html>`
    printWindow.document.write(html)
    printWindow.document.close()
    setTimeout(() => { printWindow.print(); setTimeout(() => printWindow.close(), 800) }, 300)
    return nrValue
  }

  // VK2: Nach Klick „Rechnung drucken“ ggf. Rechnungsnr. am Order speichern (für Nachdruck gleiche Nr.)
  const handleVk2RechnungDrucken = () => {
    const o = orders[0]
    if (!o || o.paymentMethod !== 'transfer' || !(o.rechnungEmpfaenger || '').trim()) {
      alert('Nur möglich für die zuletzt erfasste Einnahme mit Zahlungsart Rechnung und Rechnungsempfänger.')
      return
    }
    const nr = printVk2Rechnung(o, (o.rechnungEmpfaenger || '').trim())
    if (nr && !o.rechnungsNr) {
      try {
        const stored = JSON.parse(localStorage.getItem(ordersKey) || '[]')
        const idx = stored.findIndex((x: any) => (x.id || x.orderNumber) === (o.id || o.orderNumber))
        if (idx !== -1) { stored[idx] = { ...stored[idx], rechnungsNr: nr }; localStorage.setItem(ordersKey, JSON.stringify(stored)) }
        setOrders(prev => prev.map(ord => (ord.id || ord.orderNumber) === (o.id || o.orderNumber) ? { ...ord, rechnungsNr: nr } : ord))
      } catch (_) {}
    }
  }

  // VK2: Ausgabe erfassen (Kassaausgang) → nur Kassabuch, art: ausgang
  const handleVk2Ausgabe = () => {
    const b = parseFloat((vk2AusgangBetrag || '0').replace(',', '.'))
    if (isNaN(b) || b <= 0) {
      alert('Bitte gültigen Betrag eingeben.')
      return
    }
    const zweck = (vk2AusgangZweck || '').trim()
    const ok = addKassabuchEintrag('vk2', {
      datum: new Date().toISOString().slice(0, 10),
      betrag: b,
      art: 'ausgang',
      verwendungszweck: zweck || undefined,
    })
    if (ok) {
      setVk2AusgangBetrag('')
      setVk2AusgangZweck('')
      alert('✅ Ausgabe erfasst.')
    } else {
      alert('Speichern fehlgeschlagen. Bitte erneut versuchen.')
    }
  }

  // VK2: Letzte Ausgaben (aus Kassabuch) für Belegdruck und Anzeige
  const vk2LastAusgaben = (() => {
    if (!fromVk2) return []
    try {
      return loadKassabuch('vk2')
        .filter((e: KassabuchEintrag) => e.art === 'ausgang')
        .sort((a, b) => b.datum.localeCompare(a.datum))
        .slice(0, 5)
    } catch { return [] }
  })()

  // VK2: Letzte 15 Buchungen – Storno (Einnahmen + Ausgaben, neueste zuerst)
  const MAX_VK2_STORNO = 15
  const vk2OrdersForStorno = (() => {
    try {
      const raw = localStorage.getItem(ordersKey)
      const arr = JSON.parse(raw || '[]')
      if (!Array.isArray(arr)) return []
      return [...arr].sort((a: any, b: any) => (b.date || '').localeCompare(a.date || '')).slice(0, MAX_VK2_STORNO)
    } catch { return [] }
  })()
  const vk2AusgabenForStorno = (() => {
    if (!fromVk2) return []
    try {
      return loadKassabuch('vk2')
        .filter((e: KassabuchEintrag) => e.art === 'ausgang')
        .sort((a, b) => b.datum.localeCompare(a.datum))
        .slice(0, MAX_VK2_STORNO)
    } catch { return [] }
  })()
  type Vk2StornoItem = { type: 'einnahme'; order: any } | { type: 'ausgabe'; eintrag: KassabuchEintrag }
  const vk2StornoListe: Vk2StornoItem[] = (() => {
    if (!fromVk2) return []
    const einnahmen: Vk2StornoItem[] = vk2OrdersForStorno.map((o: any) => ({ type: 'einnahme', order: o }))
    const ausgaben: Vk2StornoItem[] = vk2AusgabenForStorno.map(e => ({ type: 'ausgabe', eintrag: e }))
    const sortKey = (x: Vk2StornoItem) => x.type === 'einnahme' ? x.order.date : x.eintrag.datum + 'T23:59:59'
    return [...einnahmen, ...ausgaben].sort((a, b) => sortKey(b).localeCompare(sortKey(a))).slice(0, MAX_VK2_STORNO)
  })()

  const handleVk2Storno = (order: any) => {
    const label = (order.items && order.items[0] && order.items[0].title) ? order.items[0].title : 'Einnahme'
    if (!confirm(`Buchung „${label}“ (€ ${typeof order.total === 'number' ? order.total.toFixed(2) : order.total}) wirklich stornieren?`)) return
    try {
      const orderId = order.id || `${order.orderNumber}-${order.date}`
      const stored = JSON.parse(localStorage.getItem(ordersKey) || '[]')
      if (!Array.isArray(stored)) return
      const filtered = stored.filter((o: any) => (o.id || `${o.orderNumber}-${o.date}`) !== orderId)
      localStorage.setItem(ordersKey, JSON.stringify(filtered))
      const kassabuch = loadKassabuch('vk2').filter((e: { verkaufId?: string }) => e.verkaufId !== order.id)
      saveKassabuch('vk2', kassabuch)
      setOrders(prev => prev.filter((o: any) => (o.id || `${o.orderNumber}-${o.date}`) !== orderId))
      setShowVk2StornoList(false)
      alert('✅ Buchung storniert.')
    } catch (_) {
      alert('⚠️ Storno fehlgeschlagen.')
    }
  }

  const handleVk2StornoAusgabe = (eintrag: KassabuchEintrag) => {
    const label = (eintrag.verwendungszweck || 'Ausgabe').trim() || 'Ausgabe'
    if (!confirm(`Ausgabe „${label}“ (€ ${eintrag.betrag.toFixed(2)}) wirklich stornieren?`)) return
    try {
      const kassabuch = loadKassabuch('vk2').filter((e: KassabuchEintrag) => e.id !== eintrag.id)
      saveKassabuch('vk2', kassabuch)
      setShowVk2StornoList(false)
      alert('✅ Ausgabe storniert.')
    } catch (_) {
      alert('⚠️ Storno fehlgeschlagen.')
    }
  }

  // Kassenbon für VK2 (Vereins-Stammdaten)
  const printVk2Bon = (order: any) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Pop-up-Blocker verhindert Druck. Bitte erlaube Pop-ups für diese Seite.')
      return
    }
    const snap = order?.sellerSnapshot as SellerSnapshotV1 | undefined
    const verein = (snap && snap.version === 1 && snap.tenant === 'vk2' && snap.vk2Verein) ? snap.vk2Verein : ((loadVk2Stammdaten()?.verein || {}) as any)
    const sellerName = (verein.name && String(verein.name).trim()) ? String(verein.name) : 'Verein'
    const sellerAddress = [verein.address, verein.city, verein.country].filter(Boolean).join(', ') || ''
    const sellerContact = [verein.phone, verein.email].filter(Boolean).join(' · ') || ''
    const date = new Date(order.date)
    const dateStr = date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    const itemsRows = (order.items || []).map((item: any, idx: number) => {
      const title = (item.title || 'Einnahme').replace(/</g, '&lt;')
      const ep = parseArtworkPriceEur(item.price)
      return `<tr><td style="text-align:center;font-size:8px">${idx + 1}</td><td style="font-size:8px">${title}</td><td style="text-align:center;font-size:8px">1</td><td style="text-align:right;font-size:8px">€ ${ep.toFixed(2)}</td><td style="text-align:right;font-size:8px">€ ${ep.toFixed(2)}</td></tr>`
    }).join('')
    const paymentText = order.paymentMethod === 'cash' ? 'Bar bezahlt' : order.paymentMethod === 'card' ? 'Mit Karte bezahlt' : 'Rechnung'
    printWindow.document.write(`
      <!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=302, initial-scale=1, maximum-scale=1"><title>Kassenbon</title>
      <style>${CSS_PRINT_80MM_ROLL}
      body { font-family: 'Courier New', monospace; font-size: 9px; line-height: 1.25; width: 80mm; max-width: 80mm; margin: 0; padding: 4mm 3mm; color: #000; background: #fff; }
      @media screen { body { width: 80mm; margin: 20px auto; border: 1px dashed #ccc; } }
      .header { text-align: center; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 3px; }
      table { width: 100%; border-collapse: collapse; font-size: 8px; margin: 3px 0; }
      td { padding: 2px 1px; border-bottom: 1px solid #ccc; }
      .total { margin-top: 3px; padding-top: 3px; border-top: 1px solid #000; font-size: 9px; font-weight: bold; }
      .payment { margin-top: 6px; padding-top: 4px; border-top: 1px solid #000; font-size: 8px; text-align: center; }
      .footer { margin-top: 8px; text-align: center; font-size: 6px; }</style></head><body>
      <div class="header"><strong>KASSENBON</strong><br><span style="font-size:7px">${sellerName.replace(/</g, '&lt;')}</span>${sellerAddress ? '<br><span style="font-size:7px">' + sellerAddress.replace(/</g, '&lt;') + '</span>' : ''}${sellerContact ? '<br><span style="font-size:7px">' + sellerContact.replace(/</g, '&lt;') + '</span>' : ''}</div>
      <div style="margin:4px 0;font-size:8px">Datum: ${dateStr}</div><div style="font-size:8px">Bon-Nr.: ${order.orderNumber}</div>
      <table><thead><tr><th style="text-align:center">Pos</th><th>Bezeichnung</th><th style="text-align:center">Menge</th><th style="text-align:right">EP</th><th style="text-align:right">Betrag</th></tr></thead><tbody>${itemsRows}</tbody></table>
      <div class="total">Gesamtbetrag: € ${order.total.toFixed(2)}</div>
      <div class="payment"><strong>${paymentText}</strong><br>Vielen Dank!</div>
      <div class="footer">${sellerName.replace(/</g, '&lt;')} · Vereinsbetrieb<br>${PRODUCT_COPYRIGHT}</div></body></html>`)
    printWindow.document.close()
    setTimeout(() => {
      injectReceiptPrintPageSizeMm(printWindow)
      printWindow.print()
      setTimeout(() => {
        printWindow.close()
      }, 1000)
    }, 300)
  }

  // VK2: Ausgabenbeleg drucken (80mm, wie Kassenbon – Verein, Datum, Betrag, Verwendungszweck)
  const printVk2AusgabeBeleg = (eintrag: KassabuchEintrag) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Pop-up-Blocker verhindert Druck. Bitte erlaube Pop-ups für diese Seite.')
      return
    }
    const vk2 = loadVk2Stammdaten()
    const verein = vk2?.verein || {}
    const sellerName = (verein.name && String(verein.name).trim()) ? String(verein.name) : 'Verein'
    const sellerAddress = [verein.address, verein.city, verein.country].filter(Boolean).join(', ') || ''
    const sellerContact = [verein.phone, verein.email].filter(Boolean).join(' · ') || ''
    const dateStr = new Date(eintrag.datum + 'T12:00:00').toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const zweck = (eintrag.verwendungszweck || '–').replace(/</g, '&lt;')
    printWindow.document.write(`
      <!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=302, initial-scale=1, maximum-scale=1"><title>Ausgabenbeleg</title>
      <style>${CSS_PRINT_80MM_ROLL}
      body { font-family: 'Courier New', monospace; font-size: 9px; line-height: 1.25; width: 80mm; max-width: 80mm; margin: 0; padding: 4mm 3mm; color: #000; background: #fff; }
      @media screen { body { width: 80mm; margin: 20px auto; border: 1px dashed #ccc; } }
      .header { text-align: center; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 3px; }
      .total { margin-top: 6px; padding-top: 3px; border-top: 1px solid #000; font-size: 9px; font-weight: bold; }
      .footer { margin-top: 8px; text-align: center; font-size: 6px; }</style></head><body>
      <div class="header"><strong>AUSGABENBELEG</strong><br><span style="font-size:7px">${sellerName.replace(/</g, '&lt;')}</span>${sellerAddress ? '<br><span style="font-size:7px">' + sellerAddress.replace(/</g, '&lt;') + '</span>' : ''}${sellerContact ? '<br><span style="font-size:7px">' + sellerContact.replace(/</g, '&lt;') + '</span>' : ''}</div>
      <div style="margin:4px 0;font-size:8px">Datum: ${dateStr}</div>
      <div class="total">Betrag: € ${eintrag.betrag.toFixed(2)}</div>
      <div style="margin-top:4px;font-size:8px">Verwendungszweck: ${zweck}</div>
      <div class="footer">${sellerName.replace(/</g, '&lt;')} · Vereinsbetrieb<br>${PRODUCT_COPYRIGHT}</div></body></html>`)
    printWindow.document.close()
    setTimeout(() => {
      injectReceiptPrintPageSizeMm(printWindow)
      printWindow.print()
      setTimeout(() => {
        printWindow.close()
      }, 1000)
    }, 300)
  }

  // Kassenbon drucken (80mm Breite, EU-normgerechter Beleg) – Stammdaten aus aktuellem Kontext (K2 vs. ök2)
  const printReceipt = (order: any) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Pop-up-Blocker verhindert Druck. Bitte erlaube Pop-ups für diese Seite.')
      return
    }

    const snap = order?.sellerSnapshot as SellerSnapshotV1 | undefined
    const tenant = fromOeffentlich ? 'oeffentlich' : 'k2'
    let g: any = null
    if (snap && snap.version === 1 && snap.tenant === tenant && snap.gallery) {
      g = snap.gallery
    } else {
      try {
        g = loadStammdaten(tenant as 'k2' | 'oeffentlich', 'gallery')
      } catch (_) {}
    }
    const defaultName = fromOeffentlich ? 'Galerie Muster' : 'K2 Galerie'
    const defaultAddress = fromOeffentlich ? [MUSTER_TEXTE.gallery.address, MUSTER_TEXTE.gallery.city, MUSTER_TEXTE.gallery.country].filter(Boolean).join(', ') || 'Musterstraße 1, 12345 Musterstadt' : 'Schlossergasse 4, 4070 Eferding, Österreich'
    const sellerName = (g && (g as any).name && String((g as any).name).trim()) ? String((g as any).name) : defaultName
    const sellerAddress = [g?.address, g?.city, g?.country].filter(Boolean).join(', ') || defaultAddress
    const sellerContact = [g?.phone, g?.email].filter(Boolean).join(' · ') || ''
    const ustId = (g && (g as any).ustIdNr && String((g as any).ustIdNr).trim()) ? String((g as any).ustIdNr).trim() : ''
    const bankForReceipt = (g && (g as any).bankverbindung && String((g as any).bankverbindung).trim()) ? String((g as any).bankverbindung).replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''
    const sellerTagline = fromOeffentlich ? 'Kunst & Keramik (Demo)' : 'Kunst & Keramik'
    const sellerWebsite = (g && (g as any).website && String((g as any).website).trim()) ? String((g as any).website) : (fromOeffentlich ? (MUSTER_TEXTE.gallery.website || '') : '')

    const date = new Date(order.date)
    const dateStr = date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    const kuenstlerFbBon = readKuenstlerFallbackShop(fromOeffentlich)
    const itemsRows = order.items.map((item: CartItem, idx: number) => {
      const menge = 1
      const ep = parseArtworkPriceEur(item.price)
      const betrag = menge * ep
      const title = (item.title || item.number || '').replace(/</g, '&lt;')
      const sn = (item.number || '').replace(/</g, '&lt;')
      const r = resolveArtistLabelForGalerieStatistik(item, kuenstlerFbBon)
      const artistLine = r && r !== 'Ohne Künstler' ? `<br><small>${String(r).replace(/</g, '&lt;')}</small>` : ''
      return `<tr><td style="text-align:center;font-size:8px">${idx + 1}</td><td style="font-size:8px">${title}${artistLine}<br><small>Nr. ${sn}</small></td><td style="text-align:center;font-size:8px">${menge}</td><td style="text-align:right;font-size:8px">€ ${ep.toFixed(2)}</td><td style="text-align:center;font-size:7px">inkl.</td><td style="text-align:right;font-size:8px">€ ${betrag.toFixed(2)}</td></tr>`
    }).join('')
    const ustHinweis = !ustId ? 'Kleinunternehmer § 6 Abs. 1 Z 27 UStG 1994' : ''

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=302, initial-scale=1, maximum-scale=1">
          <title>Kassenbon</title>
          <style>
            ${CSS_PRINT_80MM_ROLL}
            body {
              font-family: 'Courier New', monospace;
              font-size: 9px;
              line-height: 1.25;
              width: 80mm;
              max-width: 80mm;
              margin: 0;
              padding: 4mm 3mm;
              color: #000;
              background: #fff;
            }
            @media screen {
              body { width: 80mm; margin: 20px auto; border: 1px dashed #ccc; }
            }
            .header { text-align: center; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 3px; }
            .header h1 { margin: 0; font-size: 12px; font-weight: bold; letter-spacing: 0.5px; }
            .header .seller { font-size: 7px; margin: 1px 0 0; line-height: 1.3; }
            .meta { margin: 4px 0; font-size: 8px; }
            table { width: 100%; border-collapse: collapse; font-size: 8px; margin: 3px 0; }
            th { text-align: left; padding: 2px 1px; border-bottom: 1px solid #000; font-size: 7px; text-transform: uppercase; }
            th:nth-child(1), td:nth-child(1) { width: 12px; text-align: center; }
            th:nth-child(3), td:nth-child(3) { width: 14px; text-align: center; }
            th:nth-child(4), td:nth-child(4), th:nth-child(6), td:nth-child(6) { width: 28px; text-align: right; }
            th:nth-child(5), td:nth-child(5) { width: 18px; text-align: center; }
            td { padding: 2px 1px; border-bottom: 1px solid #ccc; vertical-align: top; }
            .total { margin-top: 3px; padding-top: 3px; border-top: 1px solid #000; font-size: 9px; }
            .total-row { display: flex; justify-content: space-between; margin: 1px 0; }
            .total-final { font-size: 10px; font-weight: bold; margin-top: 3px; padding-top: 2px; border-top: 1px solid #000; }
            .payment { margin-top: 6px; padding-top: 4px; border-top: 1px solid #000; font-size: 8px; text-align: center; }
            .legal { margin-top: 4px; font-size: 6px; line-height: 1.3; color: #333; }
            .bank { margin-top: 4px; font-size: 6px; text-align: left; white-space: pre-wrap; word-break: break-all; }
            .footer { margin-top: 8px; text-align: center; font-size: 6px; line-height: 1.3; }
            .divider { text-align: center; margin: 4px 0; font-size: 7px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>KASSENBON / BELEG</h1>
            <div class="seller"><strong>${sellerName.replace(/</g, '&lt;')}</strong><br>${sellerAddress.replace(/</g, '&lt;')}${sellerContact ? '<br>' + sellerContact.replace(/</g, '&lt;') : ''}${ustId ? '<br>UID: ' + ustId.replace(/</g, '&lt;') : ''}</div>
          </div>
          <div class="meta">
            <div>Datum: ${dateStr}</div>
            <div>Bon-Nr.: ${order.orderNumber}</div>
          </div>
          <table>
            <thead><tr><th>Pos</th><th>Bezeichnung</th><th>Menge</th><th>EP</th><th>MwSt</th><th>Betrag</th></tr></thead>
            <tbody>${itemsRows}</tbody>
          </table>
          <div class="total">
            ${order.discount > 0 ? `<div class="total-row"><span>Zwischensumme:</span><span>€ ${(order.subtotal || order.total).toFixed(2)}</span></div><div class="total-row"><span>Rabatt:</span><span>-€ ${(order.discount || 0).toFixed(2)}</span></div>` : ''}
            <div class="total-row total-final"><span>Gesamtbetrag:</span><span>€ ${order.total.toFixed(2)}</span></div>
          </div>
          <div class="legal">Alle Preise inkl. gesetzl. MwSt. (sofern anwendbar).${ustHinweis ? ' ' + ustHinweis + ' – keine Ausweisung der Umsatzsteuer.' : ''}</div>
          <div class="payment">
            <strong>${order.paymentMethod === 'cash' ? 'Bar bezahlt' : order.paymentMethod === 'card' ? 'Mit Karte bezahlt' : 'Rechnung (Überweisung)'}</strong>
            ${order.paymentMethod === 'transfer' ? '<div style="margin-top:3px;font-size:7px;">Zahlbar innerhalb von 14 Tagen ohne Abzug.</div>' : ''}
            ${order.paymentMethod === 'transfer' && bankForReceipt ? `<div class="bank">Überweisung:<br>${bankForReceipt}</div>` : ''}
            <div style="margin-top:4px;">Vielen Dank!</div>
          </div>
          <div class="divider">━━━━━━━━━━</div>
          <div class="footer">${sellerName.replace(/</g, '&lt;')} · ${sellerAddress.replace(/</g, '&lt;')}<br>${PRODUCT_COPYRIGHT}</div>
        </body>
      </html>
    `)

    printWindow.document.close()

    setTimeout(() => {
      injectReceiptPrintPageSizeMm(printWindow)
      printWindow.print()
      setTimeout(() => {
        printWindow.close()
      }, 1000)
    }, 300)
  }

  // Kassenbon oder Rechnung als A4 drucken (asRechnung = Rechnung mit Rechnungsnummer) – Stammdaten aus aktuellem Kontext (K2 vs. ök2)
  const printReceiptA4 = async (order: any, asRechnung?: boolean) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Pop-up-Blocker verhindert Druck. Bitte erlaube Pop-ups für diese Seite.')
      return
    }

    const snap = order?.sellerSnapshot as SellerSnapshotV1 | undefined
    const tenant = fromOeffentlich ? 'oeffentlich' : 'k2'
    const kuenstlerFbA4 = readKuenstlerFallbackShop(fromOeffentlich)
    let gStamm: any = null
    if (snap && snap.version === 1 && snap.tenant === tenant && snap.gallery) {
      gStamm = snap.gallery
    } else {
      try {
        gStamm = loadStammdaten(tenant as 'k2' | 'oeffentlich', 'gallery')
      } catch (_) {}
    }
    const bankForReceipt = ((gStamm && (gStamm as any).bankverbindung) || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')

    const paymentMethodText = order.paymentMethod === 'cash' ? 'Bar' : order.paymentMethod === 'card' ? 'Karte' : 'Rechnung'
    const date = new Date(order.date)
    const dateStr = date.toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    const defaultHeaderName = fromOeffentlich ? 'Galerie Muster' : 'K2 Galerie'
    const defaultSub = fromOeffentlich ? 'Kunst & Keramik (Demo)' : 'Kunst & Keramik'
    const defaultAddress = fromOeffentlich ? [MUSTER_TEXTE.gallery.address, MUSTER_TEXTE.gallery.city, MUSTER_TEXTE.gallery.country].filter(Boolean).join(', ') || 'Musterstraße 1, 12345 Musterstadt' : 'Schlossergasse 4, 4070 Eferding, Österreich'
    const sellerNameForHeader = (gStamm && (gStamm as any).name && String((gStamm as any).name).trim()) ? String((gStamm as any).name) : defaultHeaderName
    const sellerTaglineA4 = defaultSub
    const sellerWebsiteA4 = (gStamm && (gStamm as any).website && String((gStamm as any).website).trim()) ? String((gStamm as any).website) : (fromOeffentlich ? (MUSTER_TEXTE.gallery.website || '') : '')

    let docTitle = fromOeffentlich ? 'Kassenbon - Galerie Muster' : 'Kassenbon - K2 Galerie'
    let headerTitle = sellerNameForHeader.toUpperCase()
    let headerSub = defaultSub
    let nrLabel = 'Bon-Nr.:'
    let nrValue = order.orderNumber
    if (asRechnung) {
      docTitle = fromOeffentlich ? 'Rechnung - Galerie Muster' : 'Rechnung - K2 Galerie'
      headerTitle = 'RECHNUNG'
      headerSub = sellerNameForHeader + (fromOeffentlich ? ' (Demo)' : ' · Kunst & Keramik')
      nrLabel = 'Rechnungsnr.:'
      try {
        const key = fromOeffentlich ? 'k2-oeffentlich-rechnung-counter' : 'k2-rechnung-counter'
        const year = new Date().getFullYear()
        const stored = localStorage.getItem(key)
        const parsed = stored ? JSON.parse(stored) : { year, next: 1 }
        if (parsed.year !== year) {
          parsed.year = year
          parsed.next = 1
        }
        nrValue = `RE-${year}-${String(parsed.next).padStart(4, '0')}`
        parsed.next += 1
        localStorage.setItem(key, JSON.stringify(parsed))
      } catch (_) {
        nrValue = `RE-${new Date().getFullYear()}-${order.orderNumber}`
      }
    }

    if (asRechnung) {
      const g = gStamm as { name?: string; address?: string; city?: string; country?: string; phone?: string; email?: string; website?: string; bankverbindung?: string; iban?: string; bic?: string; ustIdNr?: string } | null
      const sellerName = (g && (g.name || '').trim()) ? (g.name || '').trim() : defaultHeaderName
      const sellerAddress = [g?.address, g?.city, g?.country].filter(Boolean).join(', ') || defaultAddress
      const sellerContact = [g?.phone, g?.email].filter(Boolean).join(' · ') || ''
      const ustId = (g && (g as any).ustIdNr && String((g as any).ustIdNr).trim()) ? String((g as any).ustIdNr).trim() : ''
      const bankForRechnung = (g && (g as any).bankverbindung && String((g as any).bankverbindung).trim()) ? String((g as any).bankverbindung).replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''
      const ibanRaw = (g && (g as any).iban && String((g as any).iban).trim()) ? String((g as any).iban).trim() : ''
      const bicRaw = (g && (g as any).bic && String((g as any).bic).trim()) ? String((g as any).bic).trim() : ''
      const ibanDisplay = ibanRaw ? ibanRaw.replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''
      const bicDisplay = bicRaw ? bicRaw.replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''
      let qrDataUrl = ''
      if (ibanRaw) {
        const ibanNoSpaces = ibanRaw.replace(/\s/g, '')
        const bic = bicRaw || ''
        const name = sellerName.slice(0, 70)
        const amount = `EUR${Number(order.total).toFixed(2)}`
        const remittance = nrValue
        const epc = `BCD\n002\n1\nSCT\n${bic}\n${name}\n${ibanNoSpaces}\n${amount}\n\n\n${remittance}\n`
        try {
          qrDataUrl = await QRCode.toDataURL(epc, { width: 180, margin: 1 })
        } catch (_) {}
      }
      const customer = order.customerId ? getCustomerById(order.customerId) : null
      const manual = (order as any).manualRechnung as { name: string; firma?: string; street?: string; plz?: string; city?: string; email?: string; phone?: string; uid?: string } | undefined
      let buyerName: string
      let buyerAddress: string
      if (manual?.name) {
        buyerName = [manual.name, manual.firma].filter(Boolean).join(', ')
        const adr = [manual.street, [manual.plz, manual.city].filter(Boolean).join(' ')].filter(Boolean).join(', ')
        const contact = [manual.email, manual.phone].filter(Boolean).join(' · ')
        buyerAddress = [adr, contact, manual.uid].filter(Boolean).join(' · ') || '–'
      } else {
        buyerName = customer?.name || 'Kunde / Rechnungsempfänger'
        buyerAddress = [customer?.email, customer?.phone].filter(Boolean).join(' · ') || '–'
      }
      const rechnungDatum = date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
      const itemsRows = order.items.map((item: CartItem, idx: number) => {
        const menge = 1
        const ep = parseArtworkPriceEur(item.price)
        const betrag = menge * ep
        const r = resolveArtistLabelForGalerieStatistik(item, kuenstlerFbA4)
        const artEsc = r && r !== 'Ohne Künstler' ? ' · ' + String(r).replace(/</g, '&lt;') : ''
        return `<tr><td style="text-align:center">${idx + 1}</td><td>${(item.title || item.number).replace(/</g, '&lt;')}${artEsc}<br><small>Seriennr. ${String(item.number).replace(/</g, '&lt;')}</small></td><td style="text-align:center">${menge}</td><td style="text-align:right">€ ${ep.toFixed(2)}</td><td style="text-align:center">inkl.</td><td style="text-align:right">€ ${betrag.toFixed(2)}</td></tr>`
      }).join('')
      const paymentTextRechnung = order.paymentMethod === 'cash' ? 'Bar' : order.paymentMethod === 'card' ? 'Karte' : 'Rechnung (Zahlung per Überweisung)'
      const bankBlock = [
        bankForRechnung ? `<div class="bank"><strong>Zahlung per Überweisung:</strong><br>${bankForRechnung}</div>` : '',
        ibanDisplay ? `<div class="bank" style="margin-top:3px;"><strong>IBAN:</strong> ${ibanDisplay}</div>` : '',
        bicDisplay ? `<div class="bank" style="margin-top:2px;"><strong>BIC:</strong> ${bicDisplay}</div>` : ''
      ].filter(Boolean).join('')
      const qrBlock = qrDataUrl ? `<div class="zahlung-qr" style="margin-top:4mm;"><img src="${qrDataUrl}" alt="SEPA-QR" width="180" height="180" style="display:block;" /><span style="font-size:8px;">SEPA-Überweisung scannen</span></div>` : ''
      const rechnungHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${docTitle}</title>
<style>
@page { size: A4; margin: 15mm; }
* { box-sizing: border-box; }
body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; line-height: 1.4; color: #111; max-width: 210mm; margin: 0 auto; padding: 12mm 15mm; background: #fff; }
.rechnung-header { font-size: 22px; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 2mm; }
.rechnung-sub { font-size: 10px; color: #444; margin-bottom: 8mm; }
.two-cols { display: flex; justify-content: space-between; gap: 10mm; margin-bottom: 8mm; }
.col { flex: 1; }
.col h3 { font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; color: #666; margin: 0 0 3px; }
.col p { margin: 0 0 2px; }
.meta { margin-bottom: 6mm; font-size: 10px; }
.meta span { margin-right: 12px; }
table { width: 100%; border-collapse: collapse; margin: 4mm 0; }
th { text-align: left; padding: 4px 6px; border-bottom: 2px solid #000; font-size: 9px; text-transform: uppercase; }
td { padding: 6px; border-bottom: 1px solid #ddd; vertical-align: top; }
th:first-child, td:first-child { width: 28px; }
th:nth-child(3), td:nth-child(3) { width: 40px; text-align: center; }
th:nth-child(4), td:nth-child(4), th:nth-child(6), td:nth-child(6) { width: 70px; text-align: right; }
th:nth-child(5), td:nth-child(5) { width: 50px; text-align: center; }
.total-block { margin-top: 4mm; text-align: right; }
.total-row { margin: 2px 0; }
.gesamt { font-size: 14px; font-weight: 700; margin-top: 4px; padding-top: 4px; border-top: 2px solid #000; }
.zahlung { margin-top: 8mm; padding-top: 4mm; border-top: 1px solid #ddd; font-size: 10px; }
.zahlung strong { display: block; margin-bottom: 2px; }
.zahlung-qr { display: inline-block; margin-top: 4mm; }
.bank { margin-top: 4px; white-space: pre-wrap; word-break: break-all; font-size: 9px; }
.footer-rechnung { margin-top: 10mm; padding-top: 4mm; border-top: 1px solid #ddd; font-size: 8px; color: #666; line-height: 1.5; }
</style></head><body>
<div class="rechnung-header">RECHNUNG</div>
<div class="rechnung-sub">${sellerName}</div>
<div class="two-cols">
  <div class="col">
    <h3>Rechnungssteller / Aussteller</h3>
    <p><strong>${sellerName.replace(/</g, '&lt;')}</strong></p>
    <p>${sellerAddress.replace(/</g, '&lt;')}</p>
    ${sellerContact ? `<p>${sellerContact.replace(/</g, '&lt;')}</p>` : ''}
    ${ustId ? `<p>UID: ${ustId.replace(/</g, '&lt;')}</p>` : ''}
  </div>
  <div class="col">
    <h3>Rechnungsempfänger</h3>
    <p><strong>${buyerName.replace(/</g, '&lt;')}</strong></p>
    <p>${buyerAddress.replace(/</g, '&lt;')}</p>
  </div>
</div>
<div class="meta">
  <span><strong>Rechnungsnr.:</strong> ${nrValue}</span>
  <span><strong>Rechnungsdatum:</strong> ${rechnungDatum}</span>
  <span><strong>Leistungsdatum:</strong> ${rechnungDatum}</span>
</div>
<table>
  <thead><tr><th>Pos.</th><th>Bezeichnung</th><th>Menge</th><th>Einheitspreis</th><th>MwSt</th><th>Betrag</th></tr></thead>
  <tbody>${itemsRows}</tbody>
</table>
<div class="total-block">
  ${order.discount > 0 ? `<div class="total-row">Zwischensumme: € ${(order.subtotal || order.total).toFixed(2)}</div><div class="total-row">Rabatt: -€ ${(order.discount || 0).toFixed(2)}</div>` : ''}
  <div class="total-row gesamt">Gesamtbetrag: € ${order.total.toFixed(2)}</div>
</div>
<p style="font-size: 9px; margin-top: 4mm;">Alle Preise inkl. gesetzl. MwSt. (sofern anwendbar).</p>
${!ustId ? '<p style="font-size: 9px;">Kleinunternehmer gem. § 6 Abs. 1 Z 27 UStG 1994 – keine Ausweisung der Umsatzsteuer.</p>' : ''}
<div class="zahlung">
  <strong>Zahlungsart:</strong> ${paymentTextRechnung}
  <p style="margin: 2px 0;">Zahlbar innerhalb von 14 Tagen nach Rechnungsdatum ohne Abzug.</p>
  ${bankBlock}
  ${qrBlock}
</div>
<div class="footer-rechnung">
  <strong>${sellerName.replace(/</g, '&lt;')}</strong> · ${sellerAddress.replace(/</g, '&lt;')}<br>
  ${(g && (g as any).website) ? (g as any).website + '<br>' : ''}
  ${PRODUCT_COPYRIGHT}
</div>
</body></html>`
      printWindow.document.write(rechnungHtml)
      printWindow.document.close()
      setTimeout(() => { printWindow.print(); setTimeout(() => printWindow.close(), 1000) }, 250)
      return
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${docTitle}</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 0;
              }
              * {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              body {
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: flex-start;
              }
            }
            body {
              font-family: 'Courier New', monospace;
              font-size: 9px;
              line-height: 1.2;
              width: 29mm;
              margin: 0 auto;
              padding: 3mm 2mm;
              color: #000;
              background: #fff;
              min-height: 90.3mm;
            }
            @media screen {
              body {
                width: 29mm;
                margin: 20px auto;
                border: 1px dashed #ccc;
                min-height: 90.3mm;
              }
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 8px;
              margin-bottom: 8px;
            }
            .header h1 {
              margin: 0;
              font-size: 18px;
              font-weight: bold;
              letter-spacing: 1px;
            }
            .header p {
              margin: 4px 0 0;
              font-size: 9px;
            }
            .info {
              margin: 8px 0;
              font-size: 9px;
              line-height: 1.4;
            }
            .items {
              border-top: 1px solid #000;
              border-bottom: 1px solid #000;
              padding: 8px 0;
              margin: 8px 0;
            }
            .item {
              margin-bottom: 6px;
              padding-bottom: 4px;
            }
            .item-title {
              font-weight: bold;
              margin-bottom: 2px;
              font-size: 11px;
            }
            .item-details {
              font-size: 9px;
              margin-left: 8px;
              line-height: 1.3;
            }
            .item-price {
              text-align: right;
              margin-top: 2px;
              font-weight: bold;
            }
            .total {
              margin-top: 8px;
              padding-top: 8px;
              border-top: 2px solid #000;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin: 4px 0;
              font-size: 10px;
            }
            .total-final {
              font-size: 13px;
              font-weight: bold;
              margin-top: 6px;
              padding-top: 4px;
              border-top: 1px solid #000;
            }
            .payment {
              margin-top: 12px;
              padding-top: 8px;
              border-top: 1px solid #000;
              text-align: center;
              font-size: 10px;
            }
            .footer {
              margin-top: 15px;
              text-align: center;
              font-size: 8px;
              line-height: 1.4;
            }
            .divider {
              text-align: center;
              margin: 8px 0;
              font-size: 9px;
              letter-spacing: 2px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${headerTitle}</h1>
            <p>${headerSub}</p>
          </div>
          
          <div class="info">
            <div><strong>Datum:</strong> ${dateStr}</div>
            <div><strong>${nrLabel}</strong> ${nrValue}</div>
          </div>
          
          <div class="items">
            ${order.items.map((item: CartItem & { paintingWidth?: number; paintingHeight?: number; ceramicHeight?: number; ceramicDiameter?: number; ceramicType?: string; ceramicSurface?: string; ceramicDescription?: string; ceramicSubcategory?: string }) => {
              let sizeInfo = ''
              if (item.category === 'malerei' && item.paintingWidth && item.paintingHeight) {
                sizeInfo = `${item.paintingWidth} × ${item.paintingHeight} cm`
              } else if (item.category === 'keramik') {
                if (item.ceramicSubcategory === 'vase' || item.ceramicSubcategory === 'skulptur') {
                  if (item.ceramicHeight) sizeInfo = `Höhe: ${item.ceramicHeight} cm`
                } else if (item.ceramicSubcategory === 'teller') {
                  if (item.ceramicDiameter) sizeInfo = `Durchmesser: ${item.ceramicDiameter} cm`
                } else if (item.ceramicSubcategory === 'sonstig' && item.ceramicDescription) {
                  sizeInfo = item.ceramicDescription
                }
                const typeInfo = item.ceramicType === 'steingut' ? 'Steingut' : item.ceramicType === 'steinzeug' ? 'Steinzeug' : ''
                const surfaceInfo = item.ceramicSurface === 'engobe' ? 'Engobe' : item.ceramicSurface === 'glasur' ? 'Glasur' : item.ceramicSurface === 'mischtechnik' ? 'Mischtechnik' : ''
                if (typeInfo || surfaceInfo) {
                  sizeInfo += (sizeInfo ? ' • ' : '') + [typeInfo, surfaceInfo].filter(Boolean).join(' • ')
                }
              }
              const rA4 = resolveArtistLabelForGalerieStatistik(item, kuenstlerFbA4)
              const artPart = rA4 && rA4 !== 'Ohne Künstler' ? ' • ' + String(rA4).replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''
              return `
              <div class="item">
                <div class="item-title">${item.title || item.number}</div>
                <div class="item-details">${getCategoryLabel(item.category)}${artPart}</div>
                ${sizeInfo ? `<div class="item-details" style="margin-top: 1px;">${sizeInfo}</div>` : ''}
                <div class="item-details" style="font-weight: bold; margin-top: 2px;">Seriennummer: ${item.number}</div>
                <div class="item-price">€ ${item.price.toFixed(2)}</div>
              </div>
            `
            }).join('')}
          </div>
          
          <div class="total">
            ${order.discount > 0 ? `
              <div class="total-row">
                <span>Zwischensumme:</span>
                <span>€ ${order.subtotal.toFixed(2)}</span>
              </div>
              <div class="total-row" style="color: #666;">
                <span>Rabatt:</span>
                <span>-€ ${order.discount.toFixed(2)}</span>
              </div>
            ` : ''}
            <div class="total-row total-final">
              <span>GESAMT:</span>
              <span>€ ${order.total.toFixed(2)}</span>
            </div>
          </div>
          
          <div class="payment">
            <div style="font-weight: bold; margin-bottom: 3px; font-size: 8px;">
              ${order.paymentMethod === 'cash' ? 'Bar bezahlt' : order.paymentMethod === 'card' ? 'Mit Karte bezahlt' : 'Rechnung (Überweisung)'}
            </div>
            ${order.paymentMethod === 'transfer' && bankForReceipt ? `<div style="font-size: 7px; margin-top: 6px; text-align: left; white-space: pre-wrap; word-break: break-all;">Für Überweisung:\n${bankForReceipt}</div>` : ''}
            <div style="font-size: 7px;">Vielen Dank!</div>
          </div>
          
          <div class="divider">━━━━━━━━━━</div>
          
          <div class="footer">
            <div><strong>${sellerNameForHeader.replace(/</g, '&lt;')}</strong></div>
            <div>${sellerTaglineA4}</div>
            ${sellerWebsiteA4 ? `<div style="margin-top: 10px;">${sellerWebsiteA4.replace(/</g, '&lt;')}</div>` : ''}
            <div>${PRODUCT_COPYRIGHT}</div>
          </div>
        </body>
      </html>
    `)

    printWindow.document.close()
    
    setTimeout(() => {
      printWindow.print()
      setTimeout(() => {
        printWindow.close()
      }, 1000)
    }, 250)
  }

  // Bestellung abschließen (paymentMethodOverride: bei Schnellverkauf direkt übergeben, sonst aus State)
  const processOrder = (paymentMethodOverride?: 'cash' | 'card' | 'transfer') => {
    const method = paymentMethodOverride ?? paymentMethod
    const isAdmin = typeof sessionStorage !== 'undefined' && !!sessionStorage.getItem('k2-admin-context')

    let customerId: string | undefined
    let manualRechnung: { name: string; firma?: string; street?: string; plz?: string; city?: string; email?: string; phone?: string; uid?: string } | undefined
    if (isAdmin) {
      customerId = selectedCustomerId || undefined
      if (method === 'transfer' && !customerId && rechnungManuellCheckout.name.trim()) {
        manualRechnung = {
          name: rechnungManuellCheckout.name.trim(),
          ...(rechnungManuellCheckout.typ === 'ausfuehrlich' ? {
            firma: rechnungManuellCheckout.firma.trim() || undefined,
            street: rechnungManuellCheckout.street.trim() || undefined,
            plz: rechnungManuellCheckout.plz.trim() || undefined,
            city: rechnungManuellCheckout.city.trim() || undefined,
            email: rechnungManuellCheckout.email.trim() || undefined,
            phone: rechnungManuellCheckout.phone.trim() || undefined,
            uid: rechnungManuellCheckout.uid.trim() || undefined
          } : {})
        }
      }
    } else {
      // Internetshop: Kundendaten erforderlich, in Kundendatei speichern
      const name = guestName.trim()
      const email = guestEmail.trim()
      if (!name || !email) {
        alert('Bitte Name und E-Mail-Adresse angeben.')
        return
      }
      const phone = guestPhone.trim() || undefined
      const existing = getCustomers().find(c => c.email && c.email.toLowerCase() === email.toLowerCase())
      if (existing) {
        customerId = existing.id
        updateCustomer(existing.id, { name: name || existing.name, phone: phone ?? existing.phone })
      } else {
        const created = createCustomer({ name, email, phone })
        customerId = created.id
      }
    }

    // Bestellung speichern (Level 5: Snapshot von Aussteller/Kunde mitspeichern)
    const sellerSnapshot = buildSellerSnapshot()
    const buyerSnapshot = buildBuyerSnapshot({ customerId, manualRechnung })
    const order = {
      id: `ORDER-${Date.now()}`,
      date: new Date().toISOString(),
      items: cart,
      subtotal,
      discount: discountAmount,
      total,
      paymentMethod: method,
      customerId,
      sellerSnapshot,
      ...(buyerSnapshot ? { buyerSnapshot } : {}),
      ...(manualRechnung ? { manualRechnung } : {}),
      orderNumber: `O-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Date.now()).slice(-4)}`
    }

    // Bestellungen speichern (kontexteigener Key – Datensicherheit)
    const ordersStored = JSON.parse(localStorage.getItem(ordersKey) || '[]')
    ordersStored.push(order)
    localStorage.setItem(ordersKey, JSON.stringify(ordersStored))
    setOrders(prev => [order, ...prev.slice(0, 19)])

    // Werke als verkauft markieren (mit optionaler Kundenzuordnung)
    cart.forEach(item => {
      const soldArtworks = JSON.parse(localStorage.getItem(soldArtworksKey) || '[]')
      const iuid = String((item as any)?.artworkUid ?? '').trim()
      if (!soldArtworks.find((a: any) => {
        const suid = String(a?.artworkUid ?? '').trim()
        if (iuid && suid && suid === iuid) return true
        return a?.number === item.number
      })) {
        soldArtworks.push({
          number: item.number,
          ...(item.artworkUid ? { artworkUid: item.artworkUid } : {}),
          soldAt: new Date().toISOString(),
          orderId: order.id,
          ...(customerId ? { customerId } : {})
        })
        localStorage.setItem(soldArtworksKey, JSON.stringify(soldArtworks))
      }
    })

    // Stückzahl pro verkauftem Werk um 1 verringern (kontexteigener Artwork-Key)
    const artworkKey = fromOeffentlich ? 'k2-oeffentlich-artworks' : 'k2-artworks'
    try {
      const raw = localStorage.getItem(artworkKey)
      if (raw) {
        const artworks = JSON.parse(raw)
        if (Array.isArray(artworks)) {
          let changed = false
          cart.forEach((item: { number: string; artworkUid?: string }) => {
            const uid = String((item as any)?.artworkUid ?? '').trim()
            const idx = artworks.findIndex((a: any) => {
              const aUid = String(a?.uid ?? '').trim()
              if (uid && aUid && aUid === uid) return true
              return (a.number || a.id) === item.number
            })
            if (idx !== -1) {
              const a = artworks[idx]
              const q = a.quantity != null ? Number(a.quantity) : 1
              if (q > 1) {
                artworks[idx] = { ...a, quantity: q - 1 }
                changed = true
              } else {
                artworks[idx] = { ...a, quantity: 0, inShop: false }
                changed = true
              }
            }
          })
          if (changed) {
            saveArtworksByKey(artworkKey, artworks, { filterK2Only: artworkKey === 'k2-artworks', allowReduce: true })
          }
        }
      }
    } catch (_) {}

    // Event für andere Komponenten
    window.dispatchEvent(new CustomEvent('artworks-updated'))

    setCart([])
    setShowCheckout(false)
    setSelectedCustomerId(null)
    if (manualRechnung) {
      setRechnungManuellCheckout({ typ: 'einfach', name: '', firma: '', street: '', plz: '', city: '', email: '', phone: '', uid: '' })
    }
    if (!isAdmin) {
      setGuestName('')
      setGuestEmail('')
      setGuestPhone('')
    }

    const paymentMethodText = method === 'cash' ? 'Bar' : method === 'card' ? 'Karte' : 'Rechnung'

    if (isAdmin) {
      // Admin: Bei Rechnung direkt A4 drucken; bei Bar/Karte Wahl zwischen Kassabon und Rechnung
      if (method === 'transfer') {
        printReceiptA4(order, true)
      } else {
        const printChoice = confirm(`✅ Verkauf erfolgreich!\n\nBetrag: €${total.toFixed(2)}\nZahlung: ${paymentMethodText}\n\nKassabon oder Rechnung drucken?\n\nOK = Kassabon (80mm)\nAbbrechen = Rechnung (A4)`)
        if (printChoice) {
          printReceipt(order)
        } else {
          printReceiptA4(order, true)
        }
      }
    } else {
      // Besucher: nur Bestätigung, kein Bon
      alert(`✅ Bestellung aufgenommen!\n\nBetrag: €${total.toFixed(2)}\nZahlung: ${paymentMethodText}\n\nWir melden uns bei dir.`)
    }
  }

  // Reservierung: Kundendaten erforderlich, in Kundendatei speichern + Reservierung in k2-reservations
  const submitReservation = () => {
    const name = reservationName.trim()
    const email = reservationEmail.trim()
    if (!name || !email) {
      alert('Bitte Name und E-Mail-Adresse angeben.')
      return
    }
    const phone = reservationPhone.trim() || undefined
    let customerId: string
    const existing = getCustomers().find(c => c.email && c.email.toLowerCase() === email.toLowerCase())
    if (existing) {
      customerId = existing.id
      updateCustomer(existing.id, { name: name || existing.name, phone: phone ?? existing.phone })
    } else {
      const created = createCustomer({ name, email, phone })
      customerId = created.id
    }
    const reservation = {
      id: `RES-${Date.now()}`,
      date: new Date().toISOString(),
      customerId,
      items: [...cart],
      total,
      status: 'offen'
    }
    try {
      const stored = JSON.parse(localStorage.getItem('k2-reservations') || '[]')
      stored.push(reservation)
      localStorage.setItem('k2-reservations', JSON.stringify(stored))
    } catch (_) {
      alert('Reservierung konnte nicht gespeichert werden.')
      return
    }
    setShowReservationForm(false)
    setReservationName('')
    setReservationEmail('')
    setReservationPhone('')
    setCart([])
    try {
      localStorage.setItem('k2-cart', '[]')
    } catch (_) {}
    window.dispatchEvent(new CustomEvent('cart-updated'))
    alert(`✅ Reservierung aufgenommen!\n\nWir melden uns bei dir.`)
  }

  // VK2: nur schlanke Kasse für Vereinsbetrieb (Einnahme erfassen + Bon)
  if (fromVk2) {
    return (
      <div style={{ minHeight: '100vh', background: s.bgDark, color: s.text, fontFamily: s.fontBody, padding: '1.5rem' }}>
        <link rel="stylesheet" href={PROMO_FONTS_URL} />
        <div style={{ maxWidth: '420px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: s.accent }}>💰 Kasse – Vereinsbetrieb</h1>
            <Link to={adminLink} style={{ fontSize: '0.9rem', color: s.muted, textDecoration: 'none' }}>← Zurück</Link>
          </div>
          <p style={{ color: s.muted, marginBottom: '1.25rem', fontSize: '0.95rem' }}>
            Einnahme erfassen (z. B. Eintritt, Spende, Mitgliedsbeitrag) – Bon drucken. Ausgabe erfassen für Kassaausgänge (Material, Honorar, …).
          </p>
          <div style={{ background: s.bgCard, borderRadius: s.radius, padding: '1.25rem', marginBottom: '1rem', boxShadow: s.shadow }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: s.text, marginBottom: '0.35rem' }}>Betrag (€)</label>
            <input type="number" step="0.01" min="0" value={vk2Betrag} onChange={e => setVk2Betrag(e.target.value)} placeholder="0,00"
              style={{ width: '100%', padding: '0.6rem', fontSize: '1.1rem', border: `1px solid ${s.border}`, borderRadius: s.radiusSm, marginBottom: '1rem', boxSizing: 'border-box' }} />
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: s.text, marginBottom: '0.35rem' }}>Bezeichnung (optional)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
              {VK2_BEZEICHNUNG_OPTIONEN.map(opt => (
                <button key={opt} type="button" onClick={() => {
                  const next = vk2Bezeichnung === opt ? '' : opt
                  setVk2Bezeichnung(next)
                  if (next !== 'Spende' && next !== 'Mitgliedsbeitrag') setVk2MitgliedName('')
                }}
                  style={{ padding: '0.4rem 0.65rem', border: `2px solid ${vk2Bezeichnung === opt ? s.accent : s.border}`, borderRadius: s.radiusSm, background: vk2Bezeichnung === opt ? s.accentSoft : 'transparent', color: s.text, fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {opt}
                </button>
              ))}
            </div>
            <input type="text" value={vk2Bezeichnung} onChange={e => { setVk2Bezeichnung(e.target.value); if (e.target.value !== 'Spende' && e.target.value !== 'Mitgliedsbeitrag') setVk2MitgliedName('') }} placeholder="oder frei eingeben"
              style={{ width: '100%', padding: '0.5rem 0.6rem', fontSize: '0.9rem', border: `1px solid ${s.border}`, borderRadius: s.radiusSm, marginBottom: '1rem', boxSizing: 'border-box' }} />
            {showVk2Mitglieder && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: s.text, marginBottom: '0.35rem' }}>Name (laut Mitgliederverzeichnis, optional)</label>
                <select value={vk2MitgliedName} onChange={e => setVk2MitgliedName(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.6rem', fontSize: '0.9rem', border: `1px solid ${s.border}`, borderRadius: s.radiusSm, boxSizing: 'border-box', background: s.bgCard, color: s.text }}>
                  <option value="">– kein Name –</option>
                  {vk2Mitglieder.map((m: { name: string }) => (
                    <option key={m.name} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>
            )}
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: s.text, marginBottom: '0.35rem' }}>Zahlungsart</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              {(['cash', 'card', 'transfer'] as const).map(m => (
                <button key={m} type="button" onClick={() => setVk2PaymentMethod(m)}
                  style={{ flex: 1, padding: '0.5rem', border: `2px solid ${vk2PaymentMethod === m ? s.accent : s.border}`, borderRadius: s.radiusSm, background: vk2PaymentMethod === m ? s.accentSoft : 'transparent', color: s.text, fontSize: '0.85rem', cursor: 'pointer' }}>
                  {m === 'cash' ? 'Bar' : m === 'card' ? 'Karte' : 'Rechnung'}
                </button>
              ))}
            </div>
            {vk2PaymentMethod === 'transfer' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: s.text, marginBottom: '0.35rem' }}>Rechnungsempfänger (Name oder Firma)</label>
                <input type="text" value={vk2RechnungEmpfaenger} onChange={e => setVk2RechnungEmpfaenger(e.target.value)}
                  placeholder="z. B. Max Mustermann oder Firma XY"
                  style={{ width: '100%', padding: '0.5rem 0.6rem', fontSize: '0.9rem', border: `1px solid ${s.border}`, borderRadius: s.radiusSm, boxSizing: 'border-box', background: s.bgCard, color: s.text }} />
              </div>
            )}
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', cursor: 'pointer', fontSize: '0.9rem', color: s.text }}>
              <input type="checkbox" checked={vk2BonDrucken} onChange={e => setVk2BonDrucken(e.target.checked)} style={{ width: '1.1rem', height: '1.1rem' }} />
              Bon drucken
            </label>
            <button type="button" onClick={handleVk2Einnahme}
              style={{ width: '100%', padding: '0.75rem 1rem', background: s.gradientGreen, color: '#fff', border: 'none', borderRadius: s.radius, fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}>
              Einnahme erfassen{vk2BonDrucken ? ' & Bon drucken' : ''}
            </button>
          </div>
          {/* VK2 Kassaausgang: Ausgabe erfassen */}
          <div style={{ background: s.bgCard, borderRadius: s.radius, padding: '1.25rem', marginBottom: '1rem', boxShadow: s.shadow, borderLeft: `4px solid ${s.accent}` }}>
            <h2 style={{ margin: '0 0 0.75rem', fontSize: '1rem', fontWeight: 700, color: s.text }}>📤 Ausgabe erfassen (Kassaausgang)</h2>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: s.text, marginBottom: '0.35rem' }}>Betrag (€)</label>
            <input type="number" step="0.01" min="0" value={vk2AusgangBetrag} onChange={e => setVk2AusgangBetrag(e.target.value)} placeholder="0,00"
              style={{ width: '100%', padding: '0.6rem', fontSize: '1rem', border: `1px solid ${s.border}`, borderRadius: s.radiusSm, marginBottom: '0.75rem', boxSizing: 'border-box' }} />
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: s.text, marginBottom: '0.35rem' }}>Verwendungszweck</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
              {VK2_AUSGANG_OPTIONEN.map(opt => (
                <button key={opt} type="button" onClick={() => setVk2AusgangZweck(opt)}
                  style={{ padding: '0.4rem 0.65rem', border: `2px solid ${vk2AusgangZweck === opt ? s.accent : s.border}`, borderRadius: s.radiusSm, background: vk2AusgangZweck === opt ? s.accentSoft : 'transparent', color: s.text, fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {opt}
                </button>
              ))}
            </div>
            <input type="text" value={vk2AusgangZweck} onChange={e => setVk2AusgangZweck(e.target.value)} placeholder="z. B. Material, Honorar, Miete …"
              style={{ width: '100%', padding: '0.5rem 0.6rem', fontSize: '0.9rem', border: `1px solid ${s.border}`, borderRadius: s.radiusSm, marginBottom: '0.75rem', boxSizing: 'border-box' }} />
            <button type="button" onClick={handleVk2Ausgabe}
              style={{ width: '100%', padding: '0.6rem 1rem', background: s.accent, color: '#fff', border: 'none', borderRadius: s.radiusSm, fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}>
              Ausgabe erfassen
            </button>
            {vk2LastAusgaben.length > 0 && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${s.border}` }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: s.text, marginBottom: '0.5rem' }}>Letzte Ausgaben</div>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem', color: s.muted }}>
                  {vk2LastAusgaben.map((e: KassabuchEintrag) => (
                    <li key={e.id}>{e.datum} · € {e.betrag.toFixed(2)} {e.verwendungszweck ? ` · ${e.verwendungszweck}` : ''}</li>
                  ))}
                </ul>
                <button type="button" onClick={() => { if (vk2LastAusgaben[0]) printVk2AusgabeBeleg(vk2LastAusgaben[0]) }} style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: s.accent, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Beleg drucken (neueste)</button>
              </div>
            )}
          </div>
          {orders.length > 0 && (
            <div style={{ background: s.bgCard, borderRadius: s.radius, padding: '1rem', boxShadow: s.shadow }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: s.text, marginBottom: '0.5rem' }}>Letzte Einnahmen</div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem', color: s.muted }}>
                {orders.slice(0, 5).map((o: any) => (
                  <li key={o.id || o.date}>
                    {new Date(o.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })} · € {typeof o.total === 'number' ? o.total.toFixed(2) : o.total} {(o.items && o.items[0] && o.items[0].title) ? ` · ${o.items[0].title}` : ''}
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                <button type="button" onClick={() => { const o = orders[0]; if (o) printVk2Bon(o) }} style={{ fontSize: '0.8rem', color: s.accent, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Bon erneut drucken (neueste)</button>
                {orders[0]?.paymentMethod === 'transfer' && (orders[0]?.rechnungEmpfaenger || '').trim() && (
                  <button type="button" onClick={handleVk2RechnungDrucken} style={{ fontSize: '0.8rem', color: s.accent, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>🖨️ Rechnung drucken</button>
                )}
              </div>
            </div>
          )}
          <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: s.muted }}>
            <Link to={PROJECT_ROUTES['k2-galerie'].buchhaltung} state={{ fromVk2: true }} style={{ color: s.accent, textDecoration: 'none' }}>Kassabuch anzeigen</Link> (Einnahmen & Ausgaben)
          </p>
          <div style={{ marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setShowVk2StornoList(prev => !prev)}
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', color: s.text, background: showVk2StornoList ? s.accentSoft : 'transparent', border: `2px solid ${s.border}`, borderRadius: s.radiusSm, cursor: 'pointer' }}>
              {showVk2StornoList ? 'Storno-Liste schließen' : 'Letzte 15 Buchungen – Storno'}
            </button>
            {showVk2StornoList && (
              <div style={{ marginTop: '0.75rem', background: s.bgCard, borderRadius: s.radius, padding: '1rem', boxShadow: s.shadow, maxHeight: '40vh', overflowY: 'auto' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: s.text, marginBottom: '0.5rem' }}>Letzte 15 Buchungen (Einnahmen & Ausgaben, neueste zuerst) – Beleg drucken / Storno</div>
                {vk2StornoListe.length === 0 ? (
                  <p style={{ margin: 0, fontSize: '0.9rem', color: s.muted }}>Keine Buchungen vorhanden.</p>
                ) : (
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem', color: s.muted }}>
                    {vk2StornoListe.map((item: Vk2StornoItem) => (
                      <li key={item.type === 'einnahme' ? (item.order.id || item.order.date) : item.eintrag.id} style={{ marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {item.type === 'einnahme' ? (
                          <>
                            <span>
                              {new Date(item.order.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })} · € {typeof item.order.total === 'number' ? item.order.total.toFixed(2) : item.order.total} {(item.order.items && item.order.items[0] && item.order.items[0].title) ? ` · ${item.order.items[0].title}` : ''} <span style={{ color: s.muted, fontSize: '0.8em' }}>(Einnahme)</span>
                            </span>
                            <button type="button" onClick={() => { printVk2Bon(item.order) }} style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', color: s.accent, background: 'none', border: `1px solid ${s.accent}`, borderRadius: 4, cursor: 'pointer' }}>Bon</button>
                            <button type="button" onClick={() => handleVk2Storno(item.order)} style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', color: '#fff', background: '#b54a1e', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Storno</button>
                          </>
                        ) : (
                          <>
                            <span>
                              {item.eintrag.datum} · € {item.eintrag.betrag.toFixed(2)} {item.eintrag.verwendungszweck ? ` · ${item.eintrag.verwendungszweck}` : ''} <span style={{ color: s.muted, fontSize: '0.8em' }}>(Ausgabe)</span>
                            </span>
                            <button type="button" onClick={() => printVk2AusgabeBeleg(item.eintrag)} style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', color: s.accent, background: 'none', border: `1px solid ${s.accent}`, borderRadius: 4, cursor: 'pointer' }}>Beleg</button>
                            <button type="button" onClick={() => handleVk2StornoAusgabe(item.eintrag)} style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', color: '#fff', background: '#b54a1e', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Storno</button>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '-webkit-fill-available',
      background: s.bgDark,
      color: s.text,
      position: 'relative',
      overflowX: 'hidden',
      fontFamily: s.fontBody
    }}>
      <link rel="stylesheet" href={PROMO_FONTS_URL} />

      {/* Kurze Bestätigung „zur Auswahl hinzugefügt“ – schließt nach ~1,5 s automatisch */}
      {addedToast && (
        <div
          role="alert"
          aria-live="polite"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.35)',
            padding: '1rem'
          }}
        >
          <div
            style={{
              background: s.bgCard,
              borderRadius: s.radius,
              padding: '1.25rem 1.5rem',
              maxWidth: '320px',
              boxShadow: s.shadowLg,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem'
            }}
          >
            <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: s.accentGreen, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1rem' }}>✓</span>
            <p style={{ margin: 0, fontSize: '1rem', color: s.text, lineHeight: 1.4 }}>{addedToast}</p>
          </div>
        </div>
      )}

      {/* Dunkler Top-Streifen mit Galerie-Branding */}
      <div style={{
        background: '#2a2520',
        padding: '0.6rem clamp(1.5rem, 4vw, 3rem)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        <span style={{ fontFamily: s.fontHeading, color: '#c8a882', fontSize: '0.95rem', fontWeight: '600', letterSpacing: '0.04em' }}>
          {fromOeffentlich ? 'Galerie Muster' : 'K2 Galerie'}
        </span>
        {cart.length > 0 && (
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
            {cart.length} {cart.length === 1 ? 'Werk' : 'Werke'} · € {total.toFixed(2)}
          </span>
        )}
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <header style={{ 
          padding: 'clamp(1.5rem, 4vw, 2.5rem) clamp(1.5rem, 4vw, 3rem)',
          maxWidth: '960px',
          margin: '0 auto',
          marginBottom: '0'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: '1rem' 
          }}>
            <div>
              <h1 style={{ 
                margin: 0, 
                fontFamily: s.fontHeading,
                fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
                fontWeight: '700',
                color: s.accent,
                letterSpacing: '-0.01em',
                lineHeight: '1.1'
              }}>
                {isAdminContext ? '🧾 Kasse' : 'Deine Auswahl'}
              </h1>
              {cart.length > 0 && (
                <p style={{ 
                  margin: '0.4rem 0 0', 
                  color: s.muted, 
                  fontSize: '1rem',
                  fontWeight: '400'
                }}>
                  {cart.length} {cart.length === 1 ? 'Werk' : 'Werke'} · € {total.toFixed(2)}
                </p>
              )}
            </div>
            <nav style={{ 
              display: 'flex', 
              gap: '0.6rem', 
              flexWrap: 'wrap',
              fontSize: '0.95rem'
            }}>
              <Link 
                to={galerieLink} 
                style={{ 
                  padding: '0.6rem 1.25rem', 
                  background: s.bgCard,
                  border: s.border,
                  color: s.text, 
                  textDecoration: 'none', 
                  borderRadius: s.radiusSm,
                  whiteSpace: 'nowrap',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: s.shadow
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = s.bgElevated
                  e.currentTarget.style.borderColor = s.accent
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = s.bgCard
                  e.currentTarget.style.borderColor = 'rgba(181, 74, 30, 0.15)'
                }}
              >
                ← Zur Galerie
              </Link>
              {!isAdminContext && hasStoredAdminLogin && hasKassa('k2') && (
                <button
                  type="button"
                  onClick={() => {
                    try {
                      sessionStorage.setItem('k2-admin-context', 'k2')
                      sessionStorage.removeItem('k2-from-galerie-view')
                      sessionStorage.removeItem('k2-shop-from-oeffentlich')
                    } catch (_) {}
                    setForceKasseOpen(true)
                  }}
                  style={{
                    padding: '0.6rem 1.25rem',
                    background: s.accentSoft,
                    border: s.borderStrong,
                    color: s.accent,
                    borderRadius: s.radiusSm,
                    fontSize: '0.95rem',
                    whiteSpace: 'nowrap',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  🧾 Als Kasse öffnen
                </button>
              )}
              {isAdminContext && hasKassa(fromOeffentlich ? 'oeffentlich' : 'k2') && hasKassabuchVoll(fromOeffentlich ? 'oeffentlich' : 'k2') && isKassabuchAktiv(fromOeffentlich ? 'oeffentlich' : 'k2') && (
              <Link 
                to={PROJECT_ROUTES['k2-galerie'].kassabuchAusgang} 
                state={{ fromOeffentlich: fromOeffentlich || undefined }}
                style={{ 
                  padding: '0.6rem 1.25rem', 
                  background: s.accentSoft,
                  border: `1px solid ${s.accent}40`,
                  color: s.accent, 
                  textDecoration: 'none', 
                  borderRadius: s.radiusSm,
                  whiteSpace: 'nowrap',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: s.shadow
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = s.bgElevated
                  e.currentTarget.style.borderColor = s.accent
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = s.accentSoft
                  e.currentTarget.style.borderColor = `${s.accent}40`
                }}
              >
                📤 Auszahlen (Kassabuch)
              </Link>
              )}
              {isAdminContext && (
              <Link 
                to={adminLink} 
                style={{ 
                  padding: '0.6rem 1.25rem', 
                  background: s.bgCard,
                  border: s.border,
                  color: s.text, 
                  textDecoration: 'none', 
                  borderRadius: s.radiusSm,
                  whiteSpace: 'nowrap',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: s.shadow
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = s.bgElevated
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = s.bgCard
                }}
              >
                ⚙️ Admin
              </Link>
              )}
            </nav>
          </div>
        </header>

        {/* Trennlinie unter Header */}
        <div style={{ borderBottom: `2px solid ${s.accent}15`, maxWidth: '960px', margin: '0 auto 1.5rem' }} />

        {/* Gamification Phase 3: Demo-Kasse – nur Lesepfad (ök2, Admin, nicht VK2) */}
        {fromOeffentlich && isAdminContext && !fromVk2 && showGamificationChecklists && (() => {
          const demoSteps = [
            { id: 'dk1', done: allArtworks.length > 0, label: 'Werke geladen', hint: 'Sortiment für die Kasse' },
            { id: 'dk2', done: cart.length > 0, label: 'Warenkorb', hint: 'Artikel ausgewählt' },
            { id: 'dk3', done: showCheckout, label: 'Checkout', hint: 'Kassiervorgang gestartet' },
            { id: 'dk4', done: orders.length > 0, label: 'Verkauf / Bestellung', hint: 'mindestens ein Eintrag' },
          ]
          const doneDemo = demoSteps.filter((x) => x.done).length
          return (
            <div
              style={{
                maxWidth: '960px',
                margin: '0 auto 1.25rem',
                padding: '0.85rem 1rem',
                background: s.bgElevated,
                border: `1px solid ${s.accent}22`,
                borderRadius: s.radiusSm,
                borderLeft: `4px solid ${s.accent}`,
              }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em', color: s.accent, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Demo-Kasse (Lesepfad)
              </div>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.88rem', color: s.text, lineHeight: 1.45 }}>
                <strong>{doneDemo}/4</strong> – nur Orientierung in der Muster-Galerie, kein Muss. Unten wie gewohnt kassieren.
              </p>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {demoSteps.map((st) => (
                  <li key={st.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem', fontSize: '0.82rem', color: st.done ? s.text : s.muted }}>
                    <span style={{ flexShrink: 0, fontWeight: 800, color: st.done ? s.accentGreen : s.muted }}>{st.done ? '✓' : '○'}</span>
                    <span>
                      <strong style={{ color: s.text }}>{st.label}</strong>
                      <span style={{ color: s.muted }}> – {st.hint}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )
        })()}

        <main style={{
          padding: '0 clamp(1.5rem, 4vw, 3rem)',
          paddingBottom: 'clamp(4rem, 10vw, 6rem)',
          maxWidth: '960px',
          margin: '0 auto'
        }}>
          {/* Termin-Hinweis nur für Besucher (Internetshop), nicht in der Kasse – in der Kasse ist man ja schon vor Ort */}
          {internetShopNotSetUp && !isAdminContext && (
            <div style={{
              marginBottom: '1.25rem',
              padding: '0.9rem 1.25rem',
              background: `${s.accent}08`,
              border: s.border,
              borderLeft: `3px solid ${s.accent}`,
              borderRadius: s.radiusSm,
              color: s.muted,
              fontSize: '0.95rem',
              lineHeight: 1.5
            }}>
              <strong>Besuch gern unsere Galerie und vereinbare einen Termin.</strong>
              {' '}
              So kannst du die Werke vor Ort erleben. Eine Reservierung ist möglich.
              {displayPhone ? (
                <> – Termin: <a href={`tel:${displayPhone.replace(/\s/g, '')}`} style={{ color: s.accent, textDecoration: 'none' }}>{displayPhone}</a></>
              ) : displayEmail ? (
                <> – <a href={`mailto:${displayEmail}`} style={{ color: s.accent, textDecoration: 'none' }}>{displayEmail}</a></>
              ) : (
                ' (Kontakt siehe Galerie / Impressum).'
              )}.
            </div>
          )}
          {/* Nur für Admin: Werk hinzufügen (QR/Seriennummer) – Galerie-Besucher sehen das nicht */}
          {isAdminContext && (
          <section style={{
            background: s.bgCard,
            border: s.border,
            borderRadius: s.radius,
            padding: '1.25rem 1.5rem',
            boxShadow: s.shadow,
            marginBottom: '1.5rem'
          }}>
          <h3 style={{ 
            fontSize: '0.8rem', 
            marginBottom: '0.875rem',
            color: s.muted,
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.06em'
          }}>
            Werk hinzufügen
          </h3>
          
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.625rem' }}>
            <button
              onClick={handleQRScan}
              style={{
                flex: 1,
                minWidth: '120px',
                padding: '0.8rem 1rem',
                background: s.gradientAccent,
                color: '#fff',
                border: 'none',
                borderRadius: s.radiusSm,
                fontSize: '0.95rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease',
                boxShadow: s.shadowMd
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = s.shadowLg
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = s.shadowMd
              }}
            >
              📷 QR-Code scannen
            </button>
            <button
              type="button"
              onClick={() => setShowNummernListe((v) => !v)}
              style={{
                flex: 1,
                minWidth: '120px',
                padding: '0.8rem 1rem',
                background: showNummernListe ? s.bgElevated : s.bgElevated,
                color: s.text,
                border: `1px solid ${s.accent}44`,
                borderRadius: s.radiusSm,
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease',
                boxShadow: s.shadowMd
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = s.accent
                e.currentTarget.style.background = s.accentSoft
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${s.accent}44`
                e.currentTarget.style.background = showNummernListe ? s.bgElevated : s.bgElevated
              }}
            >
              📋 Nummernliste
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Nummer oder Titel (z.B. G1 oder Durch das Fenster)"
              value={serialInput}
              onChange={(e) => setSerialInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addBySerialNumber()
                }
              }}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '0.75rem 1rem',
                background: s.bgElevated,
                border: s.border,
                borderRadius: s.radiusSm,
                fontSize: '0.95rem',
                color: s.text,
                outline: 'none'
              }}
            />
            <button
              onClick={() => addBySerialNumber()}
              style={{
                padding: '0.75rem 1.5rem',
                background: s.gradientAccent,
                color: '#fff',
                border: 'none',
                borderRadius: s.radiusSm,
                fontSize: '0.95rem',
                fontWeight: '700',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                boxShadow: s.shadowMd
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = s.shadowLg
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = s.shadowMd
              }}
            >
              Hinzufügen
            </button>
          </div>

          {showNummernListe && (
            <div style={{ marginTop: '1rem', borderTop: `1px solid ${s.accent}22`, paddingTop: '1rem' }}>
              <p style={{ fontSize: '0.85rem', color: s.muted, marginBottom: '0.5rem' }}>Werk antippen → wird zur Auswahl hinzugefügt (ohne Scanner)</p>
              <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {sortArtworksCategoryBlocksThenNumberAsc(
                  allArtworks.filter((a: any) => {
                    const priceVal = parseArtworkPriceEur(a?.price)
                    if (priceVal <= 0) return false
                    if (isAdminContext) return true
                    return a.inShop !== false
                  })
                ).map((a: any) => {
                    const priceVal = parseArtworkPriceEur(a?.price)
                    const num = a.number || a.id || '–'
                    const title = (a.title || num).length > 28 ? (a.title || num).slice(0, 25) + '…' : (a.title || num)
                    return (
                      <button
                        key={a.id || a.number || title}
                        type="button"
                        onClick={() => addBySerialNumber(num)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          textAlign: 'left',
                          background: s.bgElevated,
                          border: `1px solid ${s.accent}22`,
                          borderRadius: s.radiusSm,
                          fontSize: '0.9rem',
                          color: s.text,
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = s.accent
                          e.currentTarget.style.background = s.accentSoft
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = `${s.accent}22`
                          e.currentTarget.style.background = s.bgElevated
                        }}
                      >
                        <span style={{ fontWeight: '600', minWidth: '3rem' }}>{num}</span>
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
                        <span style={{ color: s.accent, fontWeight: '600' }}>€ {priceVal.toFixed(2)}</span>
                      </button>
                    )
                  })}
              </div>
              <button type="button" onClick={() => setShowNummernListe(false)} style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: s.muted, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Liste schließen</button>
            </div>
          )}
        </section>
          )}

        {/* Nur für Admin: Bon erneut drucken */}
        {isAdminContext && orders.length > 0 && (
          <section style={{
            background: s.bgCard,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${s.accent}22`,
            borderRadius: '20px',
            padding: 'clamp(1.5rem, 4vw, 2rem)',
            marginBottom: 'clamp(2rem, 5vw, 3rem)'
          }}>
            <h3 style={{ 
              fontSize: 'clamp(1.1rem, 3vw, 1.3rem)', 
              marginBottom: '1rem',
              color: s.text,
              fontWeight: '600'
            }}>
              📄 Bon erneut drucken
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {orders.map((order) => {
                const dateStr = order.date ? new Date(order.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '–'
                return (
                  <div
                    key={order.id || order.orderNumber || order.date}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.25rem 0.25rem 0.25rem 0',
                      background: s.bgElevated,
                      border: `1px solid ${s.accent}33`,
                      borderRadius: '10px',
                      overflow: 'hidden'
                    }}
                  >
                    <button
                      onClick={() => handleReprintOrder(order)}
                      style={{
                        padding: '0.6rem 1rem',
                        background: 'transparent',
                        border: 'none',
                        color: s.text,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = s.accent
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = s.text
                      }}
                    >
                      <span style={{ color: s.muted }}>{dateStr}</span>
                      <span style={{ fontWeight: '600' }}>{order.orderNumber}</span>
                      <span style={{ color: s.accent }}>€{(order.total || 0).toFixed(2)}</span>
                      <span style={{ fontSize: '0.85rem' }}>🖨️</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleStornoOrder(order) }}
                      title="Verkauf stornieren – Werke wieder verfügbar"
                      style={{
                        padding: '0.4rem 0.6rem',
                        marginRight: '0.25rem',
                        background: 'transparent',
                        border: `1px solid ${s.muted}`,
                        borderRadius: '8px',
                        color: s.muted,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        lineHeight: 1
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `${s.accent}15`
                        e.currentTarget.style.color = s.accent
                        e.currentTarget.style.borderColor = s.accent
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = s.muted
                        e.currentTarget.style.borderColor = s.muted
                      }}
                    >
                      Storno
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDeleteOrderFromList(order) }}
                      title="Eintrag nur aus Liste entfernen (Verkauf bleibt erfasst)"
                      style={{
                        padding: '0.4rem 0.6rem',
                        marginRight: '0.25rem',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        color: s.muted,
                        fontSize: '1rem',
                        cursor: 'pointer',
                        lineHeight: 1
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `${s.accent}20`
                        e.currentTarget.style.color = s.accent
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = s.muted
                      }}
                    >
                      🗑
                    </button>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Nur für Admin: Verkaufsliste – Storno (max 15 neueste) */}
        {isAdminContext && (
          <section style={{
            background: s.bgCard,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${s.accent}22`,
            borderRadius: '20px',
            padding: 'clamp(1.5rem, 4vw, 2rem)',
            marginBottom: 'clamp(2rem, 5vw, 3rem)'
          }}>
            <h3 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.3rem)', marginBottom: '1rem', color: s.text, fontWeight: '600' }}>
              📋 Verkaufsliste – Storno
            </h3>
            {!showVerkaufsliste ? (
              <button
                type="button"
                onClick={() => { setShowVerkaufsliste(true); loadVerkaufslisteForStorno() }}
                style={{
                  padding: '0.6rem 1rem',
                  background: s.bgElevated,
                  border: `1px solid ${s.accent}33`,
                  borderRadius: s.radiusSm,
                  color: s.text,
                  fontSize: '0.95rem',
                  cursor: 'pointer'
                }}
              >
                Liste öffnen (max. 15 neueste Verkäufe)
              </button>
            ) : (
              <>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  {soldEntriesList.map((e, i) => (
                    <div
                      key={`${e.number}-${e.soldAt}-${i}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.4rem 0.6rem',
                        background: s.bgElevated,
                        border: `1px solid ${s.accent}22`,
                        borderRadius: '8px',
                        fontSize: '0.9rem'
                      }}
                    >
                      <span style={{ color: s.muted, minWidth: '2.5rem' }}>{e.number}</span>
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>{e.title}</span>
                      <span style={{ color: s.muted, fontSize: '0.8rem' }}>{e.soldAt ? new Date(e.soldAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '–'}</span>
                      <span style={{ fontWeight: 600, color: s.accent }}>€{(e.price || 0).toFixed(2)}</span>
                      <button
                        type="button"
                        onClick={() => handleStornoSingle(i)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.8rem',
                          background: 'transparent',
                          border: `1px solid ${s.muted}`,
                          borderRadius: 6,
                          color: s.muted,
                          cursor: 'pointer'
                        }}
                      >
                        Stornieren
                      </button>
                    </div>
                  ))}
                </div>
                {soldEntriesList.length === 0 && <p style={{ color: s.muted, fontSize: '0.9rem' }}>Keine Verkäufe in der Liste.</p>}
                <button type="button" onClick={() => setShowVerkaufsliste(false)} style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: s.muted, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Liste schließen</button>
              </>
            )}
          </section>
        )}

        {/* QR-Scanner Modal */}
        {showScanner && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setShowScanner(false)}
          >
            <div style={{
              background: s.bgCard,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${s.accent}33`,
              borderRadius: '20px',
              padding: 'clamp(1.5rem, 4vw, 2.5rem)',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, color: s.text, fontSize: '1.3rem', fontWeight: 700 }}>📷 QR-Code scannen</h3>
                <button onClick={() => setShowScanner(false)} style={{ background: s.bgElevated, border: 'none', borderRadius: '8px', fontSize: '1.5rem', cursor: 'pointer', padding: '0.25rem 0.75rem', color: s.text }}>×</button>
              </div>

              {/* Kamera-Vorschau */}
              <div style={{ position: 'relative', width: '100%', borderRadius: 12, overflow: 'hidden', background: '#000', marginBottom: '1rem', aspectRatio: '4/3' }}>
                <video ref={scannerVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <canvas ref={scannerCanvasRef} style={{ display: 'none' }} />
                {/* Zielrahmen */}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <div style={{ width: '60%', aspectRatio: '1', border: '3px solid rgba(95,251,241,0.8)', borderRadius: 12, boxShadow: '0 0 0 2000px rgba(0,0,0,0.3)' }} />
                </div>
                <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center', color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>
                  QR-Code in den Rahmen halten
                </div>
              </div>

              {/* Fallback: manuelle Eingabe */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <input
                  type="text"
                  placeholder="Seriennummer manuell (z.B. K2-M-0001)"
                  value={serialInput}
                  onChange={(e) => setSerialInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && serialInput.trim()) processQRCode(serialInput.trim()) }}
                  style={{ flex: 1, padding: '0.65rem 0.9rem', background: s.bgElevated, border: `1px solid ${s.accent}33`, borderRadius: 10, fontSize: '0.95rem', color: s.text, outline: 'none' }}
                />
                <button
                  onClick={() => { if (serialInput.trim()) processQRCode(serialInput.trim()) }}
                  style={{ padding: '0.65rem 1.2rem', background: s.gradientAccent, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}
                >
                  OK
                </button>
              </div>
              <button onClick={() => setShowScanner(false)} style={{ width: '100%', padding: '0.65rem', background: s.bgElevated, border: `1px solid ${s.accent}22`, color: s.text, borderRadius: 10, fontSize: '0.95rem', cursor: 'pointer' }}>
                Abbrechen
              </button>
            </div>
          </div>
        )}

        {cart.length === 0 ? (
          <div style={{ 
            padding: 'clamp(4rem, 10vw, 6rem)', 
            textAlign: 'center',
            background: s.bgCard,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${s.accent}22`,
            borderRadius: '24px'
          }}>
            <div style={{ fontSize: 'clamp(4rem, 10vw, 6rem)', marginBottom: '2rem' }}>🛒</div>
            <h2 style={{ 
              fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', 
              marginBottom: '1.5rem',
              color: s.text,
              fontWeight: '700'
            }}>
              Deine Auswahl ist leer
            </h2>
            <p style={{ 
              fontSize: 'clamp(1.1rem, 3vw, 1.3rem)', 
              marginBottom: '1rem',
              color: s.text
            }}>
              Entdecke die Galerie und füge Artikel zu deiner Auswahl hinzu.
            </p>
            {isAdminContext && orders.length > 0 && (
              <button
                onClick={() => handleReprintOrder(orders[0])}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.25rem',
                  background: `${s.accent}20`,
                  border: `1px solid ${s.accent}66`,
                  borderRadius: '12px',
                  color: s.accent,
                  fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: '1rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${s.accent}35`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `${s.accent}20`
                }}
              >
                🖨️ Letzten Bon erneut drucken ({orders[0].orderNumber} · €{(orders[0].total || 0).toFixed(2)})
              </button>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
              {!isAdminContext && (
                <Link
                  to={galerieLink}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: 'clamp(1rem, 2.5vw, 1.25rem) clamp(2rem, 5vw, 2.5rem)',
                    background: s.gradientAccent,
                    color: '#fff',
                    textDecoration: 'none',
                    borderRadius: '12px',
                    fontSize: 'clamp(1rem, 2.5vw, 1.1rem)',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    boxShadow: `0 10px 30px ${s.accent}40`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)'
                    e.currentTarget.style.boxShadow = `0 15px 40px ${s.accent}66`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = `0 10px 30px ${s.accent}40`
                  }}
                >
                  Zur Galerie
                  <span style={{ fontSize: '1.2em' }}>→</span>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Warenkorb */}
            <section style={{ marginBottom: 'clamp(2rem, 5vw, 3rem)' }}>
              <h2 style={{ 
                fontSize: '0.8rem', 
                marginBottom: '0.875rem',
                color: s.muted,
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.06em'
              }}>
                Auswahl · {cart.length} {cart.length === 1 ? 'Werk' : 'Werke'}
              </h2>
              
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.625rem' 
              }}>
                {cart.map((item, index) => (
                  <div key={`${item.number}-${index}`} style={{
                    background: s.bgCard,
                    border: s.border,
                    borderRadius: s.radius,
                    padding: '1rem 1.25rem',
                    boxShadow: s.shadow,
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = s.bgElevated
                    e.currentTarget.style.borderColor = 'rgba(181, 74, 30, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = s.bgCard
                    e.currentTarget.style.borderColor = 'rgba(181, 74, 30, 0.15)'
                  }}
                  >
                    {/* Werk-Bild */}
                    <div style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      background: s.bgElevated,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      border: s.border
                    }}>
                      {(item.imageUrl || item.previewUrl) ? (
                        <img 
                          src={item.imageUrl || item.previewUrl} 
                          alt={item.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block'
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const parent = target.parentElement
                            if (parent && !parent.querySelector('.shop-placeholder')) {
                              const placeholder = document.createElement('div')
                              placeholder.className = 'shop-placeholder'
                              placeholder.style.cssText = `width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: ${s.muted}; font-size: 0.75rem`
                              placeholder.textContent = item.number || '?'
                              parent.appendChild(placeholder)
                            }
                          }}
                        />
                      ) : (
                        <div style={{
                          color: s.muted,
                          fontSize: '0.75rem',
                          textAlign: 'center',
                          padding: '0.25rem'
                        }}>
                          {item.number || '?'}
                        </div>
                      )}
                    </div>
                    {/* Werk-Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ 
                        fontWeight: '600',
                        fontSize: '1rem',
                        color: s.text,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {item.title || item.number}
                      </div>
                      <div style={{ 
                        fontSize: '0.85rem',
                        color: s.muted,
                        marginTop: '0.15rem'
                      }}>
                        {getCategoryLabel(item.category)}
                        {(() => {
                          const r = resolveArtistLabelForGalerieStatistik(item, kuenstlerFbShop)
                          return r && r !== 'Ohne Künstler' ? ` · ${r}` : ''
                        })()}
                      </div>
                    </div>
                    {/* Preis + Entfernen */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                      <span style={{ 
                        fontWeight: '700', 
                        color: s.accent,
                        fontSize: '1.1rem',
                        whiteSpace: 'nowrap'
                      }}>
                        € {item.price.toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeFromCart(index)}
                        style={{
                          padding: '0.4rem 0.875rem',
                          background: 'transparent',
                          color: s.muted,
                          border: s.border,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          transition: 'all 0.2s ease',
                          whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#fef2ef'
                          e.currentTarget.style.color = s.accent
                          e.currentTarget.style.borderColor = s.accent
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.color = s.muted
                          e.currentTarget.style.borderColor = 'rgba(181, 74, 30, 0.15)'
                        }}
                      >
                        Entfernen
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Für Galerie-Besucher (ohne Admin): nur Gesamt + Kontakt – keine Kasse */}
            {!isAdminContext && cart.length > 0 && (
              <section style={{
                background: s.bgCard,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${s.accent}22`,
                borderRadius: '20px',
                padding: 'clamp(1.5rem, 4vw, 2rem)',
                marginBottom: 'clamp(2rem, 5vw, 3rem)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontWeight: '600', color: s.text }}>Gesamt:</span>
                  <span style={{ fontWeight: '700', fontSize: 'clamp(1.2rem, 3.5vw, 1.5rem)', color: s.accent }}>€ {total.toFixed(2)}</span>
                </div>
                <p style={{ margin: '0 0 1rem', color: s.text, fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)' }}>
                  Bei Interesse an diesen Werken kontaktiere uns gerne. Eine Reservierung ist möglich – dazu bitte deine Daten angeben.
                </p>
                {!showReservationForm ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                    <button
                      onClick={() => setShowReservationForm(true)}
                      style={{ padding: '0.75rem 1.25rem', background: `${s.accent}28`, border: `1px solid ${s.accent}88`, borderRadius: '12px', color: s.accent, fontWeight: '600', fontSize: 'clamp(0.95rem, 2.2vw, 1.05rem)', cursor: 'pointer' }}
                    >
                      📌 Reservierung anfragen
                    </button>
                    <button
                      onClick={() => setShowCheckout(true)}
                      style={{ padding: '0.75rem 1.25rem', background: s.gradientAccent, border: 'none', borderRadius: '12px', color: '#fff', fontWeight: '600', fontSize: 'clamp(0.95rem, 2.2vw, 1.05rem)', cursor: 'pointer', boxShadow: s.shadow }}
                    >
                      Zur Kasse (Karte / Bar / Rechnung)
                    </button>
                    {displayEmail && (
                      <a href={`mailto:${displayEmail}`} style={{ padding: '0.6rem 1rem', background: `${s.accent}40`, border: `1px solid ${s.accent}88`, borderRadius: '10px', color: '#fff', textDecoration: 'none', fontWeight: '600', fontSize: 'clamp(0.9rem, 2.2vw, 1rem)' }}>E-Mail</a>
                    )}
                    {displayPhone && (
                      <a href={`tel:${displayPhone.replace(/\s/g, '')}`} style={{ padding: '0.6rem 1rem', background: `${s.accent}28`, border: `1px solid ${s.accent}66`, borderRadius: '10px', color: s.accent, textDecoration: 'none', fontWeight: '600', fontSize: 'clamp(0.9rem, 2.2vw, 1rem)' }}>Anrufen</a>
                    )}
                    <Link to={galerieLink} style={{ padding: '0.6rem 1rem', background: s.bgCard, border: `1px solid ${s.accent}33`, borderRadius: '10px', color: s.text, textDecoration: 'none', fontWeight: '600', fontSize: 'clamp(0.9rem, 2.2vw, 1rem)' }}>Zur Galerie</Link>
                  </div>
                ) : (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${s.accent}15` }}>
                    <p style={{ margin: '0 0 1rem', fontSize: 'clamp(0.9rem, 2.2vw, 1rem)', color: s.text }}>Deine Daten (werden in der Kundendatei gespeichert):</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '360px', marginBottom: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: s.text, marginBottom: '0.25rem' }}>Name *</label>
                        <input type="text" value={reservationName} onChange={(e) => setReservationName(e.target.value)} placeholder="Vor- und Nachname" style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '10px', border: `1px solid ${s.accent}44`, background: s.bgElevated, color: s.text, fontSize: '0.95rem' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: s.text, marginBottom: '0.25rem' }}>E-Mail *</label>
                        <input type="email" value={reservationEmail} onChange={(e) => setReservationEmail(e.target.value)} placeholder="ihre@email.at" style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '10px', border: `1px solid ${s.accent}44`, background: s.bgElevated, color: s.text, fontSize: '0.95rem' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: s.text, marginBottom: '0.25rem' }}>Telefon (optional)</label>
                        <input type="tel" value={reservationPhone} onChange={(e) => setReservationPhone(e.target.value)} placeholder="+43 …" style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '10px', border: `1px solid ${s.accent}44`, background: s.bgElevated, color: s.text, fontSize: '0.95rem' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <button onClick={submitReservation} disabled={!reservationName.trim() || !reservationEmail.trim()} style={{ padding: '0.6rem 1.25rem', background: (!reservationName.trim() || !reservationEmail.trim()) ? s.bgElevated : s.gradientAccent, border: 'none', borderRadius: '10px', color: '#fff', fontWeight: '600', fontSize: '0.95rem', cursor: (!reservationName.trim() || !reservationEmail.trim()) ? 'not-allowed' : 'pointer', opacity: (!reservationName.trim() || !reservationEmail.trim()) ? 0.7 : 1 }}>Reservierung absenden</button>
                      <button onClick={() => setShowReservationForm(false)} style={{ padding: '0.6rem 1rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '10px', color: s.text, fontSize: '0.9rem', cursor: 'pointer' }}>Abbrechen</button>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Nur Admin: Kassensumme & Schnellverkauf (Bar/Karte/Rechnung) */}
            {isAdminContext && !showCheckout && (
              <section style={{
                background: s.bgCard,
                border: s.border,
                borderRadius: s.radius,
                overflow: 'hidden',
                boxShadow: s.shadowMd,
                marginTop: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                {/* Gesamt-Zeile oben – dunkel und auffällig */}
                <div style={{ 
                  background: '#2a2520',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Zu bezahlen
                  </span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      fontSize: '2rem',
                      fontWeight: '800',
                      color: '#c8a882',
                      fontFamily: s.fontHeading,
                      lineHeight: 1
                    }}>
                      € {total.toFixed(2)}
                    </div>
                    {discount > 0 && (
                      <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.2rem' }}>
                        inkl. {discount}% Rabatt (−€ {discountAmount.toFixed(2)})
                      </div>
                    )}
                  </div>
                </div>

                {/* Schnellverkauf-Buttons */}
                <div style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ 
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: s.muted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: '0.75rem'
                  }}>
                    Zahlungsart – direkt abschließen
                  </div>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: '0.625rem',
                    marginBottom: '0.75rem'
                  }}>
                    {([
                      { method: 'cash' as const, icon: '💵', label: 'Bar' },
                      { method: 'card' as const, icon: '💳', label: 'Karte' },
                      { method: 'transfer' as const, icon: '📄', label: 'Rechnung' },
                    ] as { method: 'cash' | 'card' | 'transfer', icon: string, label: string }[]).map(({ method, icon, label }) => (
                      <button
                        key={method}
                        onClick={() => {
                          setPaymentMethod(method)
                          quickSale(method)
                        }}
                        style={{
                          padding: '1rem 0.5rem',
                          background: s.gradientAccent,
                          color: '#fff',
                          border: 'none',
                          borderRadius: s.radiusSm,
                          fontSize: '0.95rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.35rem',
                          transition: 'all 0.2s ease',
                          boxShadow: s.shadowMd
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)'
                          e.currentTarget.style.boxShadow = s.shadowLg
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = s.shadowMd
                        }}
                      >
                        <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Option: Detail-Checkout */}
                  <button
                    onClick={() => setShowCheckout(true)}
                    style={{
                      width: '100%',
                      padding: '0.7rem',
                      background: 'transparent',
                      color: s.muted,
                      border: s.border,
                      borderRadius: s.radiusSm,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = s.bgElevated
                      e.currentTarget.style.color = s.text
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = s.muted
                    }}
                  >
                    Weitere Optionen (Rabatt, Kundendaten) →
                  </button>
                </div>
              </section>
            )}

            {/* Checkout für alle: Karte / Bar / Rechnung, Bankverbindung aus Stammdaten */}
            {showCheckout && (
              <section style={{
                background: s.bgCard,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${s.accent}22`,
                borderRadius: '20px',
                padding: 'clamp(2rem, 5vw, 3rem)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                marginBottom: 'clamp(2rem, 5vw, 3rem)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.3rem)', color: s.text, fontWeight: '600', margin: 0 }}>
                    Bestellübersicht
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowCheckout(false)}
                    style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '10px', color: s.text, fontSize: '0.9rem', cursor: 'pointer' }}
                  >
                    ← Zurück zur Auswahl
                  </button>
                </div>
                <ul style={{ margin: '0 0 1.25rem', paddingLeft: '1.25rem', color: s.text, fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)', lineHeight: 1.6 }}>
                  {cart.map((item, idx) => (
                    <li key={`${item.number}-${idx}`}>
                      {item.title || item.number} — € {item.price.toFixed(2)}
                    </li>
                  ))}
                </ul>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: `1px solid ${s.accent}15` }}>
                  <span style={{ fontWeight: '600', color: s.text }}>Gesamt:</span>
                  <span style={{ fontWeight: '700', color: s.accent, fontSize: 'clamp(1.1rem, 3vw, 1.25rem)' }}>€ {total.toFixed(2)}</span>
                </div>

                {internetShopNotSetUp && (
                  <p style={{ margin: '0 0 1.5rem', color: s.text, fontSize: 'clamp(0.9rem, 2.5vw, 1rem)' }}>
                    💡 Ein Besuch unserer Galerie und ein Termin sind sinnvoll – du kannst die Werke vor Ort erleben. Bestellung oder Reservierung hier möglich.
                  </p>
                )}
                {!isAdminContext && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: 'clamp(1rem, 2.8vw, 1.2rem)', color: s.text, fontWeight: '600', marginBottom: '1rem' }}>
                      Deine Daten (werden in der Kundendatei gespeichert)
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', color: s.text, marginBottom: '0.35rem' }}>Name *</label>
                        <input
                          type="text"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="Vor- und Nachname"
                          style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: `1px solid ${s.accent}44`, background: s.bgElevated, color: s.text, fontSize: '1rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', color: s.text, marginBottom: '0.35rem' }}>E-Mail *</label>
                        <input
                          type="email"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          placeholder="ihre@email.at"
                          style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: `1px solid ${s.accent}44`, background: s.bgElevated, color: s.text, fontSize: '1rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', color: s.text, marginBottom: '0.35rem' }}>Telefon (optional)</label>
                        <input
                          type="tel"
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                          placeholder="+43 …"
                          style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: `1px solid ${s.accent}44`, background: s.bgElevated, color: s.text, fontSize: '1rem' }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                {isAdminContext && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: 'clamp(0.9rem, 2.5vw, 1rem)', color: s.text, marginBottom: '0.5rem' }}>
                      Kunde zuordnen (optional)
                    </label>
                    <select
                      value={selectedCustomerId ?? ''}
                      onChange={(e) => setSelectedCustomerId(e.target.value ? e.target.value : null)}
                      style={{
                        width: '100%',
                        maxWidth: '400px',
                        padding: '0.75rem 1rem',
                        borderRadius: '12px',
                        border: `1px solid ${s.accent}33`,
                        background: s.bgElevated,
                        color: s.text,
                        fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="">— Kein Kunde —</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}{c.email ? ` · ${c.email}` : ''}</option>
                      ))}
                    </select>
                    <p style={{ fontSize: '0.8rem', color: s.muted, marginTop: '0.35rem' }}>
                      Kunden verwaltest du im Control-Studio unter „Kunden“. Erscheint im Archiv bei „Verkauft an“.
                    </p>
                  </div>
                )}

                <h3 style={{ 
                  fontSize: 'clamp(1.25rem, 3.5vw, 1.5rem)', 
                  marginBottom: 'clamp(1.5rem, 4vw, 2rem)',
                  color: s.text,
                  fontWeight: '600'
                }}>
                  Zahlungsmethode
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 'clamp(0.75rem, 2vw, 1rem)', 
                    cursor: 'pointer',
                    padding: 'clamp(1rem, 3vw, 1.5rem)',
                    border: paymentMethod === 'card' ? `2px solid ${s.accent}` : `2px solid ${s.accent}33`,
                    borderRadius: '16px',
                    background: paymentMethod === 'card' ? `${s.accent}28` : s.bgElevated,
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      style={{ width: '24px', height: '24px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: 'clamp(1rem, 3vw, 1.1rem)', fontWeight: paymentMethod === 'card' ? '600' : '400', color: s.text }}>💳 Karte</span>
                  </label>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 'clamp(0.75rem, 2vw, 1rem)', 
                    cursor: 'pointer',
                    padding: 'clamp(1rem, 3vw, 1.5rem)',
                    border: paymentMethod === 'transfer' ? `2px solid ${s.accent}` : `2px solid ${s.accent}33`,
                    borderRadius: '16px',
                    background: paymentMethod === 'transfer' ? `${s.accent}28` : s.bgElevated,
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <input
                      type="radio"
                      name="payment"
                      value="transfer"
                      checked={paymentMethod === 'transfer'}
                      onChange={() => setPaymentMethod('transfer')}
                      style={{ width: '24px', height: '24px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: 'clamp(1rem, 3vw, 1.1rem)', fontWeight: paymentMethod === 'transfer' ? '600' : '400', color: s.text }}>📄 Rechnung</span>
                  </label>
                  {paymentMethod === 'transfer' && bankverbindung && (
                    <div style={{
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      background: `${s.accent}20`,
                      borderRadius: '12px',
                      border: `1px solid ${s.accent}40`,
                      fontSize: 'clamp(0.8rem, 2.2vw, 0.95rem)',
                      color: s.text,
                      lineHeight: 1.4,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                      <strong>Zahlung per Überweisung (steht auf der Rechnung):</strong><br />
                      {bankverbindung}
                    </div>
                  )}
                  {paymentMethod === 'transfer' && isAdminContext && !selectedCustomerId && (
                    <div style={{
                      padding: 'clamp(1rem, 2.5vw, 1.25rem)',
                      background: s.bgCard,
                      borderRadius: '12px',
                      border: `1px solid ${s.accent}33`,
                      marginTop: '0.5rem'
                    }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: s.text, marginBottom: '0.75rem' }}>Rechnungsempfänger (kein Kunde ausgewählt)</div>
                      <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                          <input type="radio" name="rechnungManuellTyp" checked={rechnungManuellCheckout.typ === 'einfach'} onChange={() => setRechnungManuellCheckout((m) => ({ ...m, typ: 'einfach' }))} />
                          Nur Name
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                          <input type="radio" name="rechnungManuellTyp" checked={rechnungManuellCheckout.typ === 'ausfuehrlich'} onChange={() => setRechnungManuellCheckout((m) => ({ ...m, typ: 'ausfuehrlich' }))} />
                          Ausführlich (Firmenkunde)
                        </label>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', color: s.muted, marginBottom: '0.2rem' }}>{rechnungManuellCheckout.typ === 'einfach' ? 'Name / Firma' : 'Name'}</label>
                          <input type="text" value={rechnungManuellCheckout.name} onChange={(e) => setRechnungManuellCheckout((m) => ({ ...m, name: e.target.value }))} placeholder={rechnungManuellCheckout.typ === 'einfach' ? 'Name oder Firma' : 'Name'} style={{ width: '100%', padding: '0.5rem 0.6rem', fontSize: '0.9rem', border: `1px solid ${s.accent}33`, borderRadius: 8, background: s.bgElevated, color: s.text }} />
                        </div>
                        {rechnungManuellCheckout.typ === 'ausfuehrlich' && (
                          <>
                            <div><label style={{ display: 'block', fontSize: '0.8rem', color: s.muted, marginBottom: '0.2rem' }}>Firma (optional)</label><input type="text" value={rechnungManuellCheckout.firma} onChange={(e) => setRechnungManuellCheckout((m) => ({ ...m, firma: e.target.value }))} placeholder="Firma" style={{ width: '100%', padding: '0.5rem 0.6rem', fontSize: '0.9rem', border: `1px solid ${s.accent}33`, borderRadius: 8, background: s.bgElevated, color: s.text }} /></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 1fr', gap: '0.5rem' }}><div><label style={{ display: 'block', fontSize: '0.8rem', color: s.muted, marginBottom: '0.2rem' }}>Straße</label><input type="text" value={rechnungManuellCheckout.street} onChange={(e) => setRechnungManuellCheckout((m) => ({ ...m, street: e.target.value }))} placeholder="Straße, Nr." style={{ width: '100%', padding: '0.5rem 0.6rem', fontSize: '0.9rem', border: `1px solid ${s.accent}33`, borderRadius: 8, background: s.bgElevated, color: s.text }} /></div><div><label style={{ display: 'block', fontSize: '0.8rem', color: s.muted, marginBottom: '0.2rem' }}>PLZ</label><input type="text" value={rechnungManuellCheckout.plz} onChange={(e) => setRechnungManuellCheckout((m) => ({ ...m, plz: e.target.value }))} placeholder="PLZ" style={{ width: '100%', padding: '0.5rem 0.6rem', fontSize: '0.9rem', border: `1px solid ${s.accent}33`, borderRadius: 8, background: s.bgElevated, color: s.text }} /></div><div><label style={{ display: 'block', fontSize: '0.8rem', color: s.muted, marginBottom: '0.2rem' }}>Ort</label><input type="text" value={rechnungManuellCheckout.city} onChange={(e) => setRechnungManuellCheckout((m) => ({ ...m, city: e.target.value }))} placeholder="Ort" style={{ width: '100%', padding: '0.5rem 0.6rem', fontSize: '0.9rem', border: `1px solid ${s.accent}33`, borderRadius: 8, background: s.bgElevated, color: s.text }} /></div></div>
                            <div><label style={{ display: 'block', fontSize: '0.8rem', color: s.muted, marginBottom: '0.2rem' }}>E-Mail (optional)</label><input type="email" value={rechnungManuellCheckout.email} onChange={(e) => setRechnungManuellCheckout((m) => ({ ...m, email: e.target.value }))} placeholder="E-Mail" style={{ width: '100%', padding: '0.5rem 0.6rem', fontSize: '0.9rem', border: `1px solid ${s.accent}33`, borderRadius: 8, background: s.bgElevated, color: s.text }} /></div>
                            <div><label style={{ display: 'block', fontSize: '0.8rem', color: s.muted, marginBottom: '0.2rem' }}>Telefon (optional)</label><input type="text" value={rechnungManuellCheckout.phone} onChange={(e) => setRechnungManuellCheckout((m) => ({ ...m, phone: e.target.value }))} placeholder="Telefon" style={{ width: '100%', padding: '0.5rem 0.6rem', fontSize: '0.9rem', border: `1px solid ${s.accent}33`, borderRadius: 8, background: s.bgElevated, color: s.text }} /></div>
                            <div><label style={{ display: 'block', fontSize: '0.8rem', color: s.muted, marginBottom: '0.2rem' }}>UID (optional)</label><input type="text" value={rechnungManuellCheckout.uid} onChange={(e) => setRechnungManuellCheckout((m) => ({ ...m, uid: e.target.value }))} placeholder="UID-Nr." style={{ width: '100%', padding: '0.5rem 0.6rem', fontSize: '0.9rem', border: `1px solid ${s.accent}33`, borderRadius: 8, background: s.bgElevated, color: s.text }} /></div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 'clamp(0.75rem, 2vw, 1rem)', 
                    cursor: 'pointer',
                    padding: 'clamp(1rem, 3vw, 1.5rem)',
                    border: paymentMethod === 'cash' ? `2px solid ${s.accent}` : `2px solid ${s.accent}33`,
                    borderRadius: '16px',
                    background: paymentMethod === 'cash' ? `${s.accent}28` : s.bgElevated,
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={() => setPaymentMethod('cash')}
                      style={{ width: '24px', height: '24px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: 'clamp(1rem, 3vw, 1.1rem)', fontWeight: paymentMethod === 'cash' ? '600' : '400', color: s.text }}>💵 Bar</span>
                  </label>
                </div>

                <div style={{ 
                  borderTop: `2px solid ${s.accent}22`,
                  paddingTop: 'clamp(1rem, 3vw, 1.5rem)',
                  marginBottom: 'clamp(1.5rem, 4vw, 2rem)'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    fontSize: 'clamp(1.3rem, 4vw, 1.8rem)',
                    fontWeight: '700',
color: s.accent
                  }}>
                    <span>Gesamtbetrag:</span>
                    <span>€ {total.toFixed(2)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 'clamp(0.75rem, 2vw, 1rem)', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setShowCheckout(false)}
                    style={{
                      flex: 1,
                      minWidth: '120px',
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      background: s.bgElevated,
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${s.accent}33`,
                      color: s.text,
                      borderRadius: '12px',
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = s.bgElevated
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = s.bgCard
                    }}
                  >
                    Zurück
                  </button>
                  <Link
                    to={galerieLink}
                    style={{
                      flex: 1,
                      minWidth: '120px',
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      background: s.bgElevated,
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${s.accent}33`,
                      color: s.text,
                      borderRadius: '12px',
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                      fontWeight: '600',
                      textDecoration: 'none',
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = s.bgElevated
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = s.bgCard
                    }}
                  >
                    ← Zur Galerie
                  </Link>
                  <button
                    type="button"
                    onClick={() => processOrder()}
                    disabled={
                      (!isAdminContext && (!guestName.trim() || !guestEmail.trim())) ||
                      (isAdminContext && paymentMethod === 'transfer' && !selectedCustomerId && !rechnungManuellCheckout.name.trim())
                    }
                    style={{
                      flex: 2,
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      background: (!isAdminContext && (!guestName.trim() || !guestEmail.trim())) || (isAdminContext && paymentMethod === 'transfer' && !selectedCustomerId && !rechnungManuellCheckout.name.trim()) ? s.bgElevated : s.gradientAccent,
                      color: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: 'clamp(1rem, 3vw, 1.1rem)',
                      fontWeight: '600',
                      cursor: (!isAdminContext && (!guestName.trim() || !guestEmail.trim())) || (isAdminContext && paymentMethod === 'transfer' && !selectedCustomerId && !rechnungManuellCheckout.name.trim()) ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: `0 10px 30px ${s.accent}40`,
                      opacity: (!isAdminContext && (!guestName.trim() || !guestEmail.trim())) || (isAdminContext && paymentMethod === 'transfer' && !selectedCustomerId && !rechnungManuellCheckout.name.trim()) ? 0.7 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (isAdminContext ? (paymentMethod !== 'transfer' || selectedCustomerId || rechnungManuellCheckout.name.trim()) : (guestName.trim() && guestEmail.trim())) {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = `0 15px 40px ${s.accent}66`
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = `0 10px 30px ${s.accent}40`
                    }}
                  >
                    {isAdminContext ? 'Verkauf abschließen' : 'Bestellung abschließen'}
                  </button>
                </div>
              </section>
            )}
          </>
        )}
        </main>

      {/* Rechnungsformular: Kunde aus Kundendatenbank oder manuell, Vorschaufenster */}
      {showRechnungForm && isAdminContext && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            boxSizing: 'border-box'
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowRechnungForm(false) }}
        >
          <div
            style={{
              background: s.bgCard,
              borderRadius: '20px',
              boxShadow: s.shadowLg,
              maxWidth: '720px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              padding: 'clamp(1.25rem, 3vw, 2rem)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.35rem', color: s.text, fontWeight: 700 }}>📄 Rechnung schreiben</h2>
              <button type="button" onClick={() => setShowRechnungForm(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: s.muted, cursor: 'pointer', padding: '0.25rem', lineHeight: 1 }} aria-label="Schließen">×</button>
            </div>

            <p style={{ fontSize: '0.9rem', color: s.muted, marginBottom: '1rem' }}>Kundendaten aus der Kundendatenbank wählen oder manuell eintragen. Anschließend Artikel aus der Galerie hinzufügen.</p>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.95rem' }}>
                <input type="radio" name="rechnungKunde" checked={rechnungKundeTyp === 'auswahl'} onChange={() => { setRechnungKundeTyp('auswahl'); setSelectedCustomerId(null) }} />
                Aus Kundendatenbank
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.95rem' }}>
                <input type="radio" name="rechnungKunde" checked={rechnungKundeTyp === 'manuell'} onChange={() => { setRechnungKundeTyp('manuell'); setSelectedCustomerId(null) }} />
                Manuell eingeben
              </label>
            </div>

            {rechnungKundeTyp === 'auswahl' ? (
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: s.text, marginBottom: '0.35rem' }}>Kunde wählen</label>
                <select
                  value={selectedCustomerId ?? ''}
                  onChange={(e) => setSelectedCustomerId(e.target.value || null)}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', fontSize: '0.95rem', border: `1px solid ${s.accent}33`, borderRadius: s.radius, background: s.bgCard, color: s.text }}
                >
                  <option value="">— Bitte wählen —</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}{c.email ? ` · ${c.email}` : ''}</option>
                  ))}
                </select>
                {customers.length === 0 && <p style={{ fontSize: '0.82rem', color: s.muted, marginTop: '0.35rem' }}>Keine Kunden in der Kundendatei. Kunden im Control-Studio unter „Kunden“ anlegen oder unten „Manuell eingeben“ wählen.</p>}
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: s.text, marginBottom: '0.25rem' }}>Name</label><input type="text" value={rechnungManual.name} onChange={(e) => setRechnungManual((m) => ({ ...m, name: e.target.value }))} placeholder="Name / Firma" style={{ width: '100%', padding: '0.6rem 0.75rem', fontSize: '0.95rem', border: `1px solid ${s.accent}33`, borderRadius: s.radius, background: s.bgCard, color: s.text }} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: s.text, marginBottom: '0.25rem' }}>E-Mail</label><input type="email" value={rechnungManual.email} onChange={(e) => setRechnungManual((m) => ({ ...m, email: e.target.value }))} placeholder="E-Mail" style={{ width: '100%', padding: '0.6rem 0.75rem', fontSize: '0.95rem', border: `1px solid ${s.accent}33`, borderRadius: s.radius, background: s.bgCard, color: s.text }} /></div>
                  <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: s.text, marginBottom: '0.25rem' }}>Telefon</label><input type="text" value={rechnungManual.phone} onChange={(e) => setRechnungManual((m) => ({ ...m, phone: e.target.value }))} placeholder="Telefon" style={{ width: '100%', padding: '0.6rem 0.75rem', fontSize: '0.95rem', border: `1px solid ${s.accent}33`, borderRadius: s.radius, background: s.bgCard, color: s.text }} /></div>
                </div>
                <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: s.text, marginBottom: '0.25rem' }}>Adresse</label><input type="text" value={rechnungManual.street} onChange={(e) => setRechnungManual((m) => ({ ...m, street: e.target.value }))} placeholder="Straße, Hausnummer" style={{ width: '100%', padding: '0.6rem 0.75rem', fontSize: '0.95rem', border: `1px solid ${s.accent}33`, borderRadius: s.radius, background: s.bgCard, color: s.text }} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
                  <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: s.text, marginBottom: '0.25rem' }}>PLZ</label><input type="text" value={rechnungManual.plz} onChange={(e) => setRechnungManual((m) => ({ ...m, plz: e.target.value }))} placeholder="PLZ" style={{ width: '100%', padding: '0.6rem 0.75rem', fontSize: '0.95rem', border: `1px solid ${s.accent}33`, borderRadius: s.radius, background: s.bgCard, color: s.text }} /></div>
                  <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: s.text, marginBottom: '0.25rem' }}>Ort</label><input type="text" value={rechnungManual.city} onChange={(e) => setRechnungManual((m) => ({ ...m, city: e.target.value }))} placeholder="Ort" style={{ width: '100%', padding: '0.6rem 0.75rem', fontSize: '0.95rem', border: `1px solid ${s.accent}33`, borderRadius: s.radius, background: s.bgCard, color: s.text }} /></div>
                </div>
              </div>
            )}

            {/* Vorschaufenster */}
            <div style={{ background: s.bgElevated, border: `1px solid ${s.accent}22`, borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: s.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Vorschau Rechnung</div>
              <div style={{ fontSize: '0.95rem', color: s.text, lineHeight: 1.5 }}>
                {rechnungKundeTyp === 'auswahl' && selectedCustomerId ? (
                  (() => {
                    const c = customers.find((x) => x.id === selectedCustomerId)
                    return c ? <><strong>{c.name}</strong>{c.email && <><br />{c.email}</>}{c.phone && <><br />{c.phone}</>}</> : null
                  })()
                ) : rechnungKundeTyp === 'manuell' && (rechnungManual.name || rechnungManual.email) ? (
                  <><strong>{rechnungManual.name || '—'}</strong>{rechnungManual.email && <><br />{rechnungManual.email}</>}{rechnungManual.phone && <><br />{rechnungManual.phone}</>}{(rechnungManual.street || rechnungManual.plz || rechnungManual.city) && <><br />{[rechnungManual.street, [rechnungManual.plz, rechnungManual.city].filter(Boolean).join(' ')].filter(Boolean).join(', ')}</>}</>
                ) : (
                  <span style={{ color: s.muted }}>Kundendaten oben auswählen oder eingeben.</span>
                )}
              </div>
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: `1px solid ${s.accent}18`, fontSize: '0.9rem', color: s.muted }}>Positionen: {cart.length > 0 ? `${cart.length} Artikel · € ${cart.reduce((sum, i) => sum + i.price, 0).toFixed(2)}` : 'noch keine — unten „Artikel hinzufügen“'}</div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link to={galerieLink} onClick={() => setShowRechnungForm(false)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', background: s.gradientAccent, color: '#fff', textDecoration: 'none', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 600 }}>Artikel hinzufügen →</Link>
              <button type="button" onClick={() => setShowRechnungForm(false)} style={{ padding: '0.75rem 1.25rem', background: s.bgElevated, border: `1px solid ${s.accent}33`, borderRadius: '12px', fontSize: '0.95rem', fontWeight: 600, color: s.text, cursor: 'pointer' }}>Schließen</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

export default ShopPage
