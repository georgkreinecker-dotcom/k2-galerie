import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import jsQR from 'jsqr'
import { PROJECT_ROUTES } from '../config/navigation'
import { getCategoryLabel, MUSTER_TEXTE, PRODUCT_COPYRIGHT } from '../config/tenantConfig'
import { loadStammdaten } from '../utils/stammdatenStorage'
import { isOeffentlichDisplayContext } from '../utils/oeffentlichContext'
import { getCustomers, createCustomer, updateCustomer, type Customer } from '../utils/customers'
import { PROMO_FONTS_URL } from '../config/marketingWerbelinie'
import '../App.css'

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

  // Galerie-Stammdaten: nur über Schicht (Phase 5.3)
  const [internetShopNotSetUp, setInternetShopNotSetUp] = useState(true)
  const [galleryEmail, setGalleryEmail] = useState('')
  const [galleryPhone, setGalleryPhone] = useState('')
  useEffect(() => {
    try {
      const data = loadStammdaten('k2', 'gallery')
      if (data && typeof data === 'object') {
        setBankverbindung((data as any).bankverbindung || '')
        setGalleryEmail((data as any).email || '')
        setGalleryPhone((data as any).phone || '')
        setInternetShopNotSetUp((data as any).internetShopNotSetUp !== false)
      }
    } catch (_) {}
  }, [])

  // Von Galerie (Willkommensseite oder Galerie-Vorschau) zum Shop → Kundenansicht. Flag + Referrer (State geht bei SPA oft verloren).
  const fromStorage = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('k2-from-galerie-view') === '1'
  const referrer = typeof document !== 'undefined' ? document.referrer : ''
  // Nur Galerie-Vorschau (Werke ansehen) = Kundenansicht. Willkommensseite nicht – Workflow: Start → Admin → Kassa.
  const fromReferrer = referrer.includes('galerie-vorschau')
  const fromGalerieView =
    fromStorage ||
    (location.state as { fromGalerieView?: boolean } | null)?.fromGalerieView === true ||
    fromReferrer
  // Ök2: „Zur Galerie“ und Kontakt – eine zentrale Quelle (Phase 5.3)
  const fromOeffentlich = isOeffentlichDisplayContext(location.state)
  const galerieLink = fromOeffentlich ? PROJECT_ROUTES['k2-galerie'].galerieOeffentlichVorschau : PROJECT_ROUTES['k2-galerie'].galerieVorschau
  const displayPhone = fromOeffentlich ? MUSTER_TEXTE.gallery.phone : galleryPhone
  const displayEmail = fromOeffentlich ? MUSTER_TEXTE.gallery.email : galleryEmail

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

  // Admin: openAsKasse → direkt Kasse öffnen. Bei ök2-Admin: Kontext + fromOeffentlich setzen, damit „Zur Galerie“ und Kontakt ök2 bleiben.
  useEffect(() => {
    const state = location.state as { openAsKasse?: boolean; fromOeffentlich?: boolean } | null
    if (state?.openAsKasse) {
      try {
        sessionStorage.setItem('k2-admin-context', state.fromOeffentlich ? 'oeffentlich' : 'k2')
        if (state.fromOeffentlich) sessionStorage.setItem('k2-shop-from-oeffentlich', '1')
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

  // Alle Werke laden für Suche
  useEffect(() => {
    const loadArtworks = () => {
      try {
        const stored = localStorage.getItem('k2-artworks')
        if (stored) {
          const artworks = JSON.parse(stored)
          if (Array.isArray(artworks)) {
            setAllArtworks(artworks)
          }
        }
      } catch (error) {
        console.error('Fehler beim Laden der Werke:', error)
      }
    }
    loadArtworks()
    window.addEventListener('artworks-updated', loadArtworks)
    return () => window.removeEventListener('artworks-updated', loadArtworks)
  }, [])

  // Bestellungen laden (für Bon erneut drucken)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('k2-orders')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setOrders(parsed.slice(-20).reverse()) // Letzte 20, neueste zuerst
        }
      }
    } catch (_) {}
  }, [])

  // Kunden für Zuordnung beim Verkauf
  useEffect(() => {
    const load = () => setCustomers(getCustomers())
    load()
    window.addEventListener('customers-updated', load)
    return () => window.removeEventListener('customers-updated', load)
  }, [])

  // Bon erneut drucken – Dialog wie bei neuem Verkauf
  const handleReprintOrder = (order: any) => {
    const paymentText = order.paymentMethod === 'cash' ? 'Bar' : order.paymentMethod === 'card' ? 'Karte' : 'Überweisung'
    const useEtikett = confirm(`Bon ${order.orderNumber}\n€${(order.total || 0).toFixed(2)} · ${paymentText}\n\nEtikettendrucker (80mm) = OK\nA4 Druck = Abbrechen`)
    if (useEtikett) {
      printReceipt(order)
    } else {
      printReceiptA4(order)
    }
  }

  // Werk per Seriennummer finden und zum Warenkorb hinzufügen
  const addBySerialNumber = (overrideSerial?: string) => {
    const serial = (overrideSerial ?? serialInput).trim().toUpperCase()
    if (!serial) {
      alert('Bitte Seriennummer eingeben')
      return
    }

    // Suche Werk nach Nummer oder ID
    const artwork = allArtworks.find((a: any) => 
      (a.number && a.number.toUpperCase() === serial) || 
      (a.id && a.id.toUpperCase() === serial)
    )

    if (!artwork) {
      alert(`Werk mit Seriennummer "${serial}" nicht gefunden`)
      return
    }

    // Prüfe ob bereits verkauft
    try {
      const soldData = localStorage.getItem('k2-sold-artworks')
      if (soldData) {
        const soldArtworks = JSON.parse(soldData)
        if (Array.isArray(soldArtworks)) {
          const isSold = soldArtworks.some((a: any) => a && a.number === artwork.number)
          if (isSold) {
            alert('Dieses Werk ist bereits verkauft.')
            return
          }
        }
      }
    } catch (error) {
      // Ignoriere Fehler
    }

    // Prüfe ob bereits im Warenkorb
    if (cart.some(item => item.number === artwork.number)) {
      alert('Dieses Werk ist bereits in deiner Auswahl.')
      return
    }

    // Prüfe ob im Shop verfügbar
    const priceVal = typeof artwork?.price === 'number' ? artwork.price : (parseFloat(String(artwork?.price ?? 0)) || 0)
    if (artwork.inShop === false || priceVal <= 0) {
      alert('Dieses Werk ist nicht im Online-Shop verfügbar oder hat keinen Preis.')
      return
    }

    // Prüfe Preis
    if (!artwork.price || artwork.price <= 0) {
      alert('Dieses Werk hat keinen Preis.')
      return
    }

    // Zum Warenkorb hinzufügen
    const cartItem: CartItem = {
      number: artwork.number || artwork.id,
      title: artwork.title || artwork.number,
      price: artwork.price,
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
    alert(`✅ "${artwork.title || artwork.number}" wurde zur Auswahl hinzugefügt.`)
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
  // WICHTIG: paymentMethod als Parameter, da setState async ist und sonst alter Wert verwendet wird
  const quickSale = (method: 'cash' | 'card' | 'transfer') => {
    if (cart.length === 0) {
      alert('Auswahl ist leer.')
      return
    }
    processOrder(method)
  }

  // Kassenbon drucken (80mm Breite = Standard-Kassenbon, vollständig sichtbar)
  const printReceipt = (order: any) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Pop-up-Blocker verhindert Druck. Bitte erlaube Pop-ups für diese Seite.')
      return
    }

    let bankForReceipt = ''
    try {
      const g = loadStammdaten('k2', 'gallery')
      bankForReceipt = ((g && (g as any).bankverbindung) || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    } catch (_) {}

    const paymentMethodText = order.paymentMethod === 'cash' ? 'Bar' : order.paymentMethod === 'card' ? 'Karte' : 'Überweisung'
    const date = new Date(order.date)
    const dateStr = date.toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Kassenbon</title>
          <style>
            @media print {
              @page {
                size: 80mm 400mm;
                margin: 0;
                padding: 0;
              }
              * {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              body {
                margin: 0;
                padding: 0;
              }
            }
            body {
              font-family: 'Courier New', monospace;
              font-size: 11px;
              line-height: 1.3;
              width: 80mm;
              max-width: 80mm;
              margin: 0;
              padding: 5mm 4mm;
              color: #000;
              background: #fff;
            }
            @media screen {
              body {
                width: 80mm;
                margin: 20px auto;
                border: 1px dashed #ccc;
                min-height: 200px;
              }
            }
            .header {
              text-align: center;
              border-bottom: 1px solid #000;
              padding-bottom: 4px;
              margin-bottom: 4px;
            }
            .header h1 {
              margin: 0;
              font-size: 14px;
              font-weight: bold;
              letter-spacing: 0.5px;
              line-height: 1.2;
            }
            .header p {
              margin: 2px 0 0;
              font-size: 9px;
            }
            .info {
              margin: 6px 0;
              font-size: 10px;
              line-height: 1.4;
            }
            .items {
              border-top: 1px solid #000;
              border-bottom: 1px solid #000;
              padding: 4px 0;
              margin: 4px 0;
            }
            .item {
              margin-bottom: 3px;
              padding-bottom: 2px;
            }
            .item-title {
              font-weight: bold;
              margin-bottom: 1px;
              font-size: 10px;
              line-height: 1.2;
            }
            .item-details {
              font-size: 9px;
              margin-left: 4px;
              line-height: 1.2;
            }
            .item-price {
              text-align: right;
              margin-top: 1px;
              font-weight: bold;
              font-size: 10px;
            }
            .total {
              margin-top: 4px;
              padding-top: 4px;
              border-top: 1px solid #000;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin: 3px 0;
              font-size: 10px;
            }
            .total-final {
              font-size: 12px;
              font-weight: bold;
              margin-top: 4px;
              padding-top: 3px;
              border-top: 1px solid #000;
            }
            .payment {
              margin-top: 8px;
              padding-top: 6px;
              border-top: 1px solid #000;
              text-align: center;
              font-size: 10px;
            }
            .footer {
              margin-top: 10px;
              text-align: center;
              font-size: 9px;
              line-height: 1.4;
            }
            .divider {
              text-align: center;
              margin: 6px 0;
              font-size: 9px;
              letter-spacing: 1px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>K2 GALERIE</h1>
            <p>Kunst & Keramik</p>
          </div>
          
          <div class="info">
            <div>Datum: ${dateStr}</div>
            <div>Bon-Nr.: ${order.orderNumber}</div>
          </div>
          
          <div class="items">
            ${order.items.map((item: CartItem) => `
              <div class="item">
                <div class="item-title">${item.title || item.number}</div>
                <div class="item-details">${getCategoryLabel(item.category)}${item.artist ? ' • ' + item.artist : ''}</div>
                <div class="item-details" style="font-weight: bold; margin-top: 2px;">Seriennummer: ${item.number}</div>
                <div class="item-price">€ ${item.price.toFixed(2)}</div>
              </div>
            `).join('')}
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
              ${order.paymentMethod === 'cash' ? 'Bar bezahlt' : order.paymentMethod === 'card' ? 'Mit Karte bezahlt' : 'Überweisung'}
            </div>
            ${order.paymentMethod === 'transfer' && bankForReceipt ? `<div style="font-size: 7px; margin-top: 6px; text-align: left; white-space: pre-wrap; word-break: break-all;">Für Überweisung:\n${bankForReceipt}</div>` : ''}
            <div style="font-size: 7px;">Vielen Dank!</div>
          </div>
          
          <div class="divider">━━━━━━━━━━</div>
          
          <div class="footer">
            <div>K2 Galerie</div>
            <div>www.k2-galerie.at</div>
            <div>${PRODUCT_COPYRIGHT}</div>
          </div>
        </body>
      </html>
    `)

    printWindow.document.close()
    
    // Warte kurz, dann drucken
    setTimeout(() => {
      // Zeige Druck-Dialog mit Format-Auswahl
      printWindow.print()
      // Schließe Fenster nach Druck (mit Verzögerung für Druck-Dialog)
      setTimeout(() => {
        printWindow.close()
      }, 1000)
    }, 250)
  }

  // Kassenbon als A4 drucken (gleiche Größe wie Etikettendrucker)
  const printReceiptA4 = (order: any) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Pop-up-Blocker verhindert Druck. Bitte erlaube Pop-ups für diese Seite.')
      return
    }

    let bankForReceipt = ''
    try {
      const g = loadStammdaten('k2', 'gallery')
      bankForReceipt = ((g && (g as any).bankverbindung) || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    } catch (_) {}

    const paymentMethodText = order.paymentMethod === 'cash' ? 'Bar' : order.paymentMethod === 'card' ? 'Karte' : 'Überweisung'
    const date = new Date(order.date)
    const dateStr = date.toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Kassenbon - K2 Galerie</title>
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
            <h1>K2 GALERIE</h1>
            <p>Kunst & Keramik</p>
          </div>
          
          <div class="info">
            <div><strong>Datum:</strong> ${dateStr}</div>
            <div><strong>Bon-Nr.:</strong> ${order.orderNumber}</div>
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
              return `
              <div class="item">
                <div class="item-title">${item.title || item.number}</div>
                <div class="item-details">${getCategoryLabel(item.category)}${item.artist ? ' • ' + item.artist : ''}</div>
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
              ${order.paymentMethod === 'cash' ? 'Bar bezahlt' : order.paymentMethod === 'card' ? 'Mit Karte bezahlt' : 'Überweisung'}
            </div>
            ${order.paymentMethod === 'transfer' && bankForReceipt ? `<div style="font-size: 7px; margin-top: 6px; text-align: left; white-space: pre-wrap; word-break: break-all;">Für Überweisung:\n${bankForReceipt}</div>` : ''}
            <div style="font-size: 7px;">Vielen Dank!</div>
          </div>
          
          <div class="divider">━━━━━━━━━━</div>
          
          <div class="footer">
            <div><strong>K2 Galerie</strong></div>
            <div>Kunst & Keramik</div>
            <div style="margin-top: 10px;">www.k2-galerie.at</div>
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
    if (isAdmin) {
      customerId = selectedCustomerId || undefined
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

    // Bestellung speichern
    const order = {
      id: `ORDER-${Date.now()}`,
      date: new Date().toISOString(),
      items: cart,
      subtotal,
      discount: discountAmount,
      total,
      paymentMethod: method,
      customerId,
      orderNumber: `O-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Date.now()).slice(-4)}`
    }

    // Bestellungen speichern
    const ordersStored = JSON.parse(localStorage.getItem('k2-orders') || '[]')
    ordersStored.push(order)
    localStorage.setItem('k2-orders', JSON.stringify(ordersStored))
    setOrders(prev => [order, ...prev.slice(0, 19)])

    // Werke als verkauft markieren (mit optionaler Kundenzuordnung)
    cart.forEach(item => {
      const soldArtworks = JSON.parse(localStorage.getItem('k2-sold-artworks') || '[]')
      if (!soldArtworks.find((a: any) => a.number === item.number)) {
        soldArtworks.push({
          number: item.number,
          soldAt: new Date().toISOString(),
          orderId: order.id,
          ...(customerId ? { customerId } : {})
        })
        localStorage.setItem('k2-sold-artworks', JSON.stringify(soldArtworks))
      }
    })

    // Stückzahl pro verkauftem Werk um 1 verringern (Kasse nutzt k2-artworks)
    try {
      const key = 'k2-artworks'
      const raw = localStorage.getItem(key)
      if (raw) {
        const artworks = JSON.parse(raw)
        if (Array.isArray(artworks)) {
          let changed = false
          cart.forEach((item: { number: string }) => {
            const idx = artworks.findIndex((a: any) => (a.number || a.id) === item.number)
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
            localStorage.setItem(key, JSON.stringify(artworks))
          }
        }
      }
    } catch (_) {}

    // Event für andere Komponenten
    window.dispatchEvent(new CustomEvent('artworks-updated'))

    setCart([])
    setShowCheckout(false)
    setSelectedCustomerId(null)
    if (!isAdmin) {
      setGuestName('')
      setGuestEmail('')
      setGuestPhone('')
    }

    const paymentMethodText = method === 'cash' ? 'Bar' : method === 'card' ? 'Karte' : 'Überweisung'

    if (isAdmin) {
      // Admin: Erfolgsmeldung mit Druck-Optionen
      const printChoice = confirm(`✅ Verkauf erfolgreich!\n\nBetrag: €${total.toFixed(2)}\nZahlung: ${paymentMethodText}\n\nKassenbon drucken?\n\nOK = Etikettendrucker (80mm)\nAbbrechen = A4 Druck`)
      if (printChoice) {
        printReceipt(order)
      } else {
        printReceiptA4(order)
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
          K2 Galerie
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
              {!isAdminContext && hasStoredAdminLogin && (
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
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Seriennummer eingeben (z.B. K2-0001)"
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
                  <button
                    key={order.id || order.orderNumber || order.date}
                    onClick={() => handleReprintOrder(order)}
                    style={{
                      padding: '0.6rem 1rem',
                      background: s.bgElevated,
                      border: `1px solid ${s.accent}33`,
                      borderRadius: '10px',
                      color: s.text,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = s.bgElevated
                      e.currentTarget.style.borderColor = `${s.accent}88`
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = s.bgElevated
                      e.currentTarget.style.borderColor = `${s.accent}33`
                    }}
                  >
                    <span style={{ color: s.muted }}>{dateStr}</span>
                    <span style={{ fontWeight: '600' }}>{order.orderNumber}</span>
                    <span style={{ color: s.accent }}>€{(order.total || 0).toFixed(2)}</span>
                    <span style={{ fontSize: '0.85rem' }}>🖨️</span>
                  </button>
                )
              })}
            </div>
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
              Entdecke unsere Kunstwerke und füge sie zu deiner Auswahl hinzu.
            </p>
            <p style={{ 
              fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)', 
              color: s.muted, 
              marginBottom: orders.length > 0 ? '1rem' : '2rem', 
              fontStyle: 'italic' 
            }}>
              Hinweis: Nicht alle Werke sind im Online-Shop verfügbar. Werke, die nur zur Ausstellung gehören, können nicht online gekauft werden.
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
                  marginBottom: '1.5rem',
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
                        {item.artist && ` · ${item.artist}`}
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
                      Zur Kasse (Karte / Überweisung)
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

            {/* Nur Admin: Kassensumme & Schnellverkauf (Bar/Karte/Überweisung) */}
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
                      { method: 'transfer' as const, icon: '🏦', label: 'Überweisung' },
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

            {/* Checkout für alle: Karte / Überweisung / Bar, Bankverbindung aus Stammdaten */}
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
                    <span style={{ fontSize: 'clamp(1rem, 3vw, 1.1rem)', fontWeight: paymentMethod === 'transfer' ? '600' : '400', color: s.text }}>🏦 Überweisung</span>
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
                      <strong>Für Überweisung:</strong><br />
                      {bankverbindung}
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
                  <button
                    type="button"
                    onClick={() => processOrder()}
                    disabled={!isAdminContext && (!guestName.trim() || !guestEmail.trim())}
                    style={{
                      flex: 2,
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      background: (!isAdminContext && (!guestName.trim() || !guestEmail.trim())) ? s.bgElevated : s.gradientAccent,
                      color: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: 'clamp(1rem, 3vw, 1.1rem)',
                      fontWeight: '600',
                      cursor: (!isAdminContext && (!guestName.trim() || !guestEmail.trim())) ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: `0 10px 30px ${s.accent}40`,
                      opacity: (!isAdminContext && (!guestName.trim() || !guestEmail.trim())) ? 0.7 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (isAdminContext || (guestName.trim() && guestEmail.trim())) {
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
      </div>
    </div>
  )
}

export default ShopPage
