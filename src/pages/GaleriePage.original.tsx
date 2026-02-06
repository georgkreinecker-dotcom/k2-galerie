import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'
import '../App.css'
import { ScreenshotExportK2 } from '../../components/ScreenshotExportK2'
import ScreenshotExportAdmin from '../../components/ScreenshotExportAdmin'
import { ScreenshotExportSaaS } from '../../components/ScreenshotExportSaaS'

type Filter = 'alle' | 'malerei' | 'keramik'

const GaleriePage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const screenshotMode = searchParams.get('screenshot')
  
  // Alle Hooks müssen VOR bedingten Returns stehen (Rules of Hooks)
  const [filter, setFilter] = useState<Filter>('alle')
  const [activeSection, setActiveSection] = useState<string>('')
  const [documentsOpen, setDocumentsOpen] = useState(false)
  const [artworks, setArtworks] = useState<any[]>([])
  const [showCashRegister, setShowCashRegister] = useState(false)
  const [saleInput, setSaleInput] = useState('')
  const [saleMethod, setSaleMethod] = useState<'scan' | 'manual'>('scan')
  const [cart, setCart] = useState<Array<{number: string, title: string, price: number, category: string, artist: string}>>([])
  const [currentProduct, setCurrentProduct] = useState<{number: string, title: string, price: number, category: string, artist: string} | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | null>(null)
  const [showReceipt, setShowReceipt] = useState(false)
  const [lastSale, setLastSale] = useState<any>(null)
  const [cashReceived, setCashReceived] = useState('')
  const [discount, setDiscount] = useState(0)
  const [showDailySummary, setShowDailySummary] = useState(false)
  
  // Kassa automatisch öffnen wenn Query-Parameter gesetzt
  useEffect(() => {
    try {
      const kasseParam = searchParams.get('kasse')
      if (kasseParam === '1') {
        setShowCashRegister(true)
        // URL-Manipulation entfernt - lässt die Browser-History intakt
        // Die Kasse wird einfach geöffnet, ohne die URL zu ändern
      }
    } catch (error) {
      console.error('Fehler beim Verarbeiten der Kassa-Parameter:', error)
    }
  }, [searchParams])

  // Werke aus localStorage laden
  useEffect(() => {
    const loadArtworks = () => {
      try {
        if (typeof window === 'undefined' || !window.localStorage) {
          setArtworks([])
          return
        }
        const storedData = localStorage.getItem('k2-artworks')
        if (!storedData) {
          setArtworks([])
          return
        }
        const stored = JSON.parse(storedData)
        // Sicherstellen, dass es ein Array ist
        if (!Array.isArray(stored)) {
          setArtworks([])
          return
        }
        // Nur Werke anzeigen, die Teil der Ausstellung sind
        const exhibitionArtworks = stored.filter((a: any) => a && a.inExhibition === true)
        setArtworks(exhibitionArtworks)
      } catch (error) {
        console.error('Fehler beim Laden der Werke:', error)
        setArtworks([])
      }
    }
    
    // Verzögertes Laden, um sicherzustellen, dass die Komponente erst rendert
    const timeoutId = setTimeout(() => {
      loadArtworks()
    }, 0)
    
    // Event Listener für Änderungen (wenn neue Werke hinzugefügt werden)
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', loadArtworks)
      window.addEventListener('artworks-updated', loadArtworks)
      window.addEventListener('focus', loadArtworks)
    }
    
    return () => {
      clearTimeout(timeoutId)
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', loadArtworks)
        window.removeEventListener('artworks-updated', loadArtworks)
        window.removeEventListener('focus', loadArtworks)
      }
    }
  }, [])

  // Screenshot Export Pages (nach allen Hooks)
  if (screenshotMode === 'k2') {
    return <ScreenshotExportK2 />
  }
  if (screenshotMode === 'admin') {
    return <ScreenshotExportAdmin />
  }
  if (screenshotMode === 'saas') {
    return <ScreenshotExportSaaS />
  }

  // Hilfsfunktionen
  const scrollToSection = (id: string) => {
    setActiveSection(id)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Werk-Daten laden (aus LocalStorage oder Demo)
  const loadArtworkData = (artworkNumber: string) => {
    try {
      const storedData = localStorage.getItem('k2-artworks')
      if (!storedData) {
        alert(`Werk ${artworkNumber} nicht gefunden!\n\nBitte zuerst im Admin-Bereich anlegen.`)
        return null
      }
      const artworks = JSON.parse(storedData)
      if (!Array.isArray(artworks)) {
        alert(`Werk ${artworkNumber} nicht gefunden!\n\nBitte zuerst im Admin-Bereich anlegen.`)
        return null
      }
      const found = artworks.find((a: any) => a && a.number === artworkNumber.toUpperCase())
      
      if (found) {
        return {
          number: found.number,
          title: found.title,
          price: found.price || 0,
          category: found.category === 'malerei' ? 'Malerei' : 'Keramik',
          artist: found.artist || (found.category === 'malerei' ? 'Martina Kreinecker' : 'Georg Kreinecker')
        }
      }
      
      // Fallback: Werk nicht gefunden
      alert(`Werk ${artworkNumber} nicht gefunden!\n\nBitte zuerst im Admin-Bereich anlegen.`)
      return null
    } catch (error) {
      console.error('Fehler beim Laden der Werk-Daten:', error)
      alert(`Fehler beim Laden des Werks ${artworkNumber}`)
      return null
    }
  }

  // Produkt scannen/eingeben und anzeigen
  const handleProductScan = (artworkNumber: string) => {
    const product = loadArtworkData(artworkNumber.toUpperCase())
    if (product) {
      setCurrentProduct(product)
      setSaleInput('')
    } else {
      setSaleInput('')
    }
  }

  // Produkt zum Warenkorb hinzufügen
  const addProductToCart = () => {
    if (currentProduct) {
      setCart([...cart, currentProduct])
      setCurrentProduct(null)
    }
  }

  // Artikel aus Warenkorb entfernen
  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index))
  }

  // Rabatt berechnen
  const discountAmount = (totalPrice * discount) / 100
  const finalTotal = totalPrice - discountAmount

  // Rückgeld berechnen
  const changeAmount = cashReceived ? parseFloat(cashReceived) - finalTotal : 0

  // Tagesumsatz berechnen
  const getDailySales = () => {
    const sales = JSON.parse(localStorage.getItem('k2-sales') || '[]')
    const today = new Date().toDateString()
    const todaySales = sales.filter((sale: any) => new Date(sale.date).toDateString() === today)
    return {
      count: todaySales.length,
      total: todaySales.reduce((sum: number, sale: any) => sum + sale.total, 0),
      cash: todaySales.filter((s: any) => s.paymentMethod === 'cash').reduce((sum: number, s: any) => sum + s.total, 0),
      card: todaySales.filter((s: any) => s.paymentMethod === 'card').reduce((sum: number, s: any) => sum + s.total, 0)
    }
  }

  // QR-Code scannen oder Seriennummer eingeben
  const handleSaleInput = () => {
    if (saleInput.trim()) {
      handleProductScan(saleInput.trim().toUpperCase())
    }
  }

  // Gesamtpreis berechnen
  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0)

  // Zur Bezahlung
  const proceedToPayment = () => {
    if (cart.length === 0) {
      alert('Warenkorb ist leer')
      return
    }
    setShowPaymentModal(true)
  }

  // Bezahlung verarbeiten
  const processPayment = async (method: 'cash' | 'card') => {
    if (method === 'cash' && (!cashReceived || parseFloat(cashReceived) < finalTotal)) {
      alert(`Bitte mindestens €${finalTotal.toFixed(2)} eingeben`)
      return
    }
    
    if (method === 'card') {
      // SumUp Integration würde hier erfolgen
      alert('SumUp Zahlung wird verarbeitet...\n\n(Demo - echte SumUp Integration würde hier erfolgen)')
    }
    
    // Verkauf speichern
    const sale = {
      id: `SALE-${Date.now()}`,
      date: new Date().toISOString(),
      items: cart,
      subtotal: totalPrice,
      discount: discountAmount,
      total: finalTotal,
      paymentMethod: method,
      cashReceived: method === 'cash' ? parseFloat(cashReceived) : 0,
      change: method === 'cash' ? changeAmount : 0,
      receiptNumber: `R-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Date.now()).slice(-4)}`
    }
    
    // Verkäufe speichern
    const sales = JSON.parse(localStorage.getItem('k2-sales') || '[]')
    sales.push(sale)
    localStorage.setItem('k2-sales', JSON.stringify(sales))
    
    // Werk als verkauft markieren
    cart.forEach(item => {
      const soldArtworks = JSON.parse(localStorage.getItem('k2-sold-artworks') || '[]')
      if (!soldArtworks.find((a: any) => a.number === item.number)) {
        soldArtworks.push({
          number: item.number,
          soldAt: new Date().toISOString()
        })
        localStorage.setItem('k2-sold-artworks', JSON.stringify(soldArtworks))
      }
    })
    
    setLastSale(sale)
    setShowPaymentModal(false)
    setShowCashRegister(false)
    setShowReceipt(true)
    // Zurücksetzen
    setCart([])
    setCurrentProduct(null)
    setDiscount(0)
    setCashReceived('')
  }

  // Kassabon drucken
  const printReceipt = () => {
    if (!lastSale) return
    
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Kassabon - K2 Galerie</title>
          <style>
            @media print {
              @page {
                size: 80mm auto;
                margin: 0;
              }
            }
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              padding: 10mm;
              max-width: 60mm;
              margin: 0 auto;
            }
            .receipt-header {
              text-align: center;
              border-bottom: 1px dashed #000;
              padding-bottom: 10px;
              margin-bottom: 10px;
            }
            .receipt-header h1 {
              margin: 0;
              font-size: 16px;
              font-weight: bold;
            }
            .receipt-info {
              margin: 10px 0;
              font-size: 10px;
            }
            .receipt-items {
              margin: 15px 0;
            }
            .receipt-item {
              margin: 5px 0;
              display: flex;
              justify-content: space-between;
            }
            .receipt-total {
              border-top: 1px dashed #000;
              padding-top: 10px;
              margin-top: 10px;
              font-weight: bold;
              font-size: 14px;
            }
            .receipt-footer {
              text-align: center;
              margin-top: 20px;
              font-size: 10px;
              border-top: 1px dashed #000;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="receipt-header">
            <h1>K2 Galerie</h1>
            <p>Schlossergasse 4<br>4070 Eferding</p>
          </div>
          <div class="receipt-info">
            <p><strong>Bon-Nr.:</strong> ${lastSale.receiptNumber}</p>
            <p><strong>Datum:</strong> ${new Date(lastSale.date).toLocaleString('de-DE')}</p>
            <p><strong>Zahlungsart:</strong> ${lastSale.paymentMethod === 'cash' ? 'Bar' : 'Karte (SumUp)'}</p>
          </div>
          <div class="receipt-items">
            ${lastSale.items.map((item: any) => `
              <div class="receipt-item">
                <span>${item.number}<br>${item.title}</span>
                <span>€${item.price.toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
          ${lastSale.discount > 0 ? `
          <div style="margin: 10px 0; font-size: 11px;">
            <div style="display: flex; justify-content: space-between;">
              <span>Zwischensumme:</span>
              <span>€${lastSale.subtotal.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; color: #2d6a2d;">
              <span>Rabatt:</span>
              <span>-€${lastSale.discount.toFixed(2)}</span>
            </div>
          </div>
          ` : ''}
          <div class="receipt-total">
            <div style="display: flex; justify-content: space-between;">
              <span>Gesamt:</span>
              <span>€${lastSale.total.toFixed(2)}</span>
            </div>
            ${lastSale.paymentMethod === 'cash' ? `
            <div style="display: flex; justify-content: space-between; margin-top: 5px; font-size: 11px;">
              <span>Erhalten:</span>
              <span>€${lastSale.cashReceived.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 5px; font-size: 11px; color: #2d6a2d;">
              <span>Rückgeld:</span>
              <span>€${lastSale.change.toFixed(2)}</span>
            </div>
            ` : ''}
          </div>
          <div class="receipt-footer">
            <p>Vielen Dank für Ihren Einkauf!</p>
            <p>www.k2galerie.at</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  // Sicherstellen, dass artworks immer ein Array ist
  const safeArtworks = Array.isArray(artworks) ? artworks : []

  // Sicherstellen, dass die Komponente immer etwas rendert
  if (!safeArtworks && typeof artworks === 'undefined') {
    // Initial render - zeige Ladeanzeige
    return (
      <div style={{ minHeight: '100vh', background: '#f7f5f1', padding: '2rem', color: '#1f1f1f' }}>
        <h1>K2 Galerie</h1>
        <p>Lade...</p>
        <button onClick={() => navigate(-1)} style={{ padding: '0.5rem 1rem', marginTop: '1rem' }}>
          ← Zurück
        </button>
      </div>
    )
  }

  return (
    <div className="galerie-page" style={{ minHeight: '100vh', background: '#f7f5f1', color: '#1f1f1f', display: 'block', visibility: 'visible' }}>
      <header className="galerie-header">
        <div className="galerie-brand">
          <h1>K2 Galerie</h1>
          <span className="subtitle">Kunst & Keramik</span>
        </div>
        <nav className="galerie-nav">
          <button 
            onClick={() => navigate(-1)} 
            className="nav-item" 
            style={{ fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit', color: 'inherit' }}
          >
            ← Zurück
          </button>
          <Link to={PROJECT_ROUTES['k2-galerie'].home} className="nav-item" style={{ fontWeight: 'bold' }}>
            ← Projekt
          </Link>
          <span className="nav-item secured">
            <span className="check">✓</span> Gesichert
          </span>
          <Link to={PROJECT_ROUTES['k2-galerie'].controlStudio} className="nav-item">Control</Link>
          <Link to="/admin" className="nav-item" style={{ background: '#8b6914', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '6px', fontWeight: '600' }}>
            ⚙️ Admin
          </Link>
          <button 
            className="nav-item" 
            onClick={() => setShowCashRegister(true)}
            style={{ background: '#2d6a2d', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '6px', fontWeight: '600', border: 'none', cursor: 'pointer' }}
          >
            💰 Kasse
          </button>
          <a 
            href="#ueber-uns" 
            className={`nav-item ${activeSection === 'ueber-uns' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); scrollToSection('ueber-uns') }}
          >
            Über uns
          </a>
          <a 
            href="#kunstschaffende" 
            className={`nav-item ${activeSection === 'kunstschaffende' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); scrollToSection('kunstschaffende') }}
          >
            Kunstschaffende
          </a>
          <a 
            href="#galerie" 
            className={`nav-item ${activeSection === 'galerie' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); scrollToSection('galerie') }}
          >
            Galerie
          </a>
          <a 
            href="#eroeffnung" 
            className={`nav-item ${activeSection === 'eroeffnung' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); scrollToSection('eroeffnung') }}
          >
            Eröffnung
          </a>
          <div className="nav-item dropdown" onClick={() => setDocumentsOpen(!documentsOpen)}>
            Dokumente ▾
            {documentsOpen && (
              <div className="dropdown-menu">
                <a href="#dokumente-presse" onClick={(e) => { e.preventDefault(); setDocumentsOpen(false) }}>Presse</a>
                <a href="#dokumente-katalog" onClick={(e) => { e.preventDefault(); setDocumentsOpen(false) }}>Katalog</a>
                <a href="#dokumente-impressum" onClick={(e) => { e.preventDefault(); setDocumentsOpen(false) }}>Impressum</a>
              </div>
            )}
          </div>
        </nav>
      </header>

      <main className="galerie-main">
        {/* Hero Section */}
        <section className="hero">
          <span className="tag">Galerie-Eröffnung</span>
          <h2>Willkommen bei K2 – Kunst & Keramik</h2>
          <p className="hero-sub">Ein Neuanfang mit Leidenschaft</p>
          <div className="hero-buttons">
            <a 
              href="#eroeffnung" 
              className="btn-primary"
              onClick={(e) => { e.preventDefault(); scrollToSection('eroeffnung') }}
            >
              Zur Eröffnung
            </a>
            <a 
              href="#galerie" 
              className="btn-secondary"
              onClick={(e) => { e.preventDefault(); scrollToSection('galerie') }}
            >
              Galerie entdecken
            </a>
          </div>
          <a href="#teilen" className="share-link">Teilen</a>
        </section>

        {/* Über uns Section */}
        <section id="ueber-uns" className="galerie-section">
          <h3>Über uns</h3>
          <div className="section-content">
            <p>
              Nach über 20 Jahren kreativer Tätigkeit in der Malerei und Keramik eröffnen wir, Martina und Georg Kreinecker, unsere eigene Galerie. Seit 45 Jahren verheiratet, mit 4 Kindern und 4 Enkelkindern, starten wir nun in der Pension in einen neuen Lebensabschnitt. Wir möchten unsere langjährige Erfahrung und unsere Liebe zur Kunst mit Ihnen teilen.
            </p>
            <p>
              Unser Ziel ist es, einen Ort zu schaffen, an dem Kunst und Keramik zusammenkommen, um zu inspirieren und Freude zu bereiten. Ein Raum, der Begegnung, Austausch und neue kreative Impulse ermöglicht.
            </p>
          </div>
        </section>

        {/* Kunstschaffende Section */}
        <section id="kunstschaffende" className="galerie-section">
          <h3>Kunstschaffende</h3>
          <div className="section-content">
            <div className="artists-grid">
              <div className="artist-card">
                <div className="artist-avatar">M</div>
                <h4>Martina Kreinecker</h4>
                <p className="artist-medium">Malerei</p>
                <p className="artist-bio">
                  Martina bringt mit ihren Gemälden eine lebendige Vielfalt an Farben und Ausdruckskraft auf die Leinwand. Ihre Werke spiegeln Jahre des Lernens, Experimentierens und der Leidenschaft für die Malerei wider.
                </p>
              </div>
              <div className="artist-card">
                <div className="artist-avatar">G</div>
                <h4>Georg Kreinecker</h4>
                <p className="artist-medium">Keramik</p>
                <p className="artist-bio">
                  Georg verbindet in seiner Keramikarbeit technisches Können mit kreativer Gestaltung. Seine Arbeiten sind geprägt von Präzision und einer Liebe zum Detail, das Ergebnis von jahrzehntelanger Erfahrung.
                </p>
              </div>
            </div>
            <p style={{ marginTop: '2rem', fontSize: '1.05rem', lineHeight: '1.6' }}>
              Gemeinsam eröffnen Martina und Georg nach über 20 Jahren kreativer Tätigkeit die K2 Galerie – ein Raum, wo Malerei und Keramik verschmelzen und Kunst zum Leben erwacht.
            </p>
          </div>
        </section>

        {/* Galerie Section */}
        <section id="galerie" className="galerie-section">
          <h3>Galerie-Vorschau</h3>
          <p className="section-intro">Ein Einblick in unsere Kunstwerke</p>
          <div className="filter-bar">
            <button
              className={filter === 'alle' ? 'active' : ''}
              onClick={() => setFilter('alle')}
            >
              Alle Werke
            </button>
            <button
              className={filter === 'malerei' ? 'active' : ''}
              onClick={() => setFilter('malerei')}
            >
              Malerei
            </button>
            <button
              className={filter === 'keramik' ? 'active' : ''}
              onClick={() => setFilter('keramik')}
            >
              Keramik
            </button>
          </div>
          <div className="artwork-grid">
            {safeArtworks
              .filter((artwork) => {
                // Filter nach Kategorie
                if (!artwork) return false
                if (filter === 'alle') return true
                return artwork.category === filter
              })
              .map((artwork) => {
                if (!artwork) return null
                let soldArtworks: any[] = []
                try {
                  const soldData = localStorage.getItem('k2-sold-artworks')
                  if (soldData) {
                    const parsed = JSON.parse(soldData)
                    soldArtworks = Array.isArray(parsed) ? parsed : []
                  }
                } catch (error) {
                  console.error('Fehler beim Laden der verkauften Werke:', error)
                }
                const soldArtwork = soldArtworks.find((a: any) => a && a.number === artwork.number)
                const displayMode = localStorage.getItem('k2-sold-display-mode') || 'weeks'
                const displayWeeks = parseInt(localStorage.getItem('k2-sold-display-weeks') || '4', 10)
                
                // Prüfe ob Werk als verkauft angezeigt werden soll
                let isSold = false
                let showAsSold = false
                
                if (soldArtwork) {
                  isSold = true
                  if (displayMode === 'weeks') {
                    const soldDate = new Date(soldArtwork.soldAt)
                    const weeksSinceSale = (Date.now() - soldDate.getTime()) / (1000 * 60 * 60 * 24 * 7)
                    showAsSold = weeksSinceSale < displayWeeks
                  } else {
                    showAsSold = false // Sofort in History
                  }
                }
                
                // Wenn sofort in History: Werk nicht anzeigen
                if (isSold && displayMode === 'immediate' && !showAsSold) {
                  return null
                }
                
                // Bild-URL aus gespeicherten Daten laden
                let imageUrl = ''
                if (artwork.imageUrl) {
                  imageUrl = artwork.imageUrl // Data URL (neu gespeichert)
                } else if (artwork.previewUrl) {
                  imageUrl = artwork.previewUrl // Fallback: Preview-URL
                } else if (artwork.file) {
                  // Legacy: Falls noch File-Objekt vorhanden (sollte nicht mehr vorkommen)
                  if (typeof artwork.file === 'string') {
                    imageUrl = artwork.file
                  }
                }
                
                return (
                  <div key={artwork.number} className={`artwork-card ${showAsSold ? 'artwork-sold' : ''}`}>
                    {showAsSold && (
                      <div className="sold-badge">Verkauft</div>
                    )}
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={artwork.title || artwork.number}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '12px'
                        }}
                      />
                    ) : (
                      <div className="artwork-placeholder">{artwork.number}</div>
                    )}
                    <div className="artwork-info">
                      <span className="artwork-title">{artwork.title || artwork.number}</span>
                      <span className="artwork-medium">
                        {artwork.category === 'malerei' ? 'Malerei' : artwork.category === 'keramik' ? 'Keramik' : artwork.category}
                        {artwork.artist && ` • ${artwork.artist}`}
                      </span>
                      {artwork.price && (
                        <span style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '0.25rem', display: 'block' }}>
                          € {artwork.price.toFixed(2)}
                        </span>
                      )}
                      {showAsSold && (
                        <span className="artwork-sold-label" style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.25rem', display: 'block' }}>
                          Verkauft
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            {safeArtworks.filter((artwork) => {
              if (!artwork) return false
              if (filter === 'alle') return true
              return artwork.category === filter
            }).length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#666' }}>
                <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Noch keine Werke in der Galerie</p>
                <p style={{ fontSize: '0.95rem' }}>Füge im Admin-Bereich neue Werke hinzu und markiere sie als "Teil der Ausstellung".</p>
              </div>
            )}
          </div>
        </section>

        {/* Eröffnung Section */}
        <section id="eroeffnung" className="galerie-section">
          <h3>Einladung zur Eröffnung</h3>
          <div className="section-content">
            <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
              Wir laden Sie/Dich herzlich ein. Kommen Sie vorbei, um unsere Werke zu entdecken, mit uns ins Gespräch zu kommen und gemeinsam einen besonderen Moment zu erleben.
            </p>
            <div className="opening-info">
              <div className="info-card">
                <h4>📅 Eröffnungswochenende</h4>
                <p><strong>25. - 27. April 2026</strong></p>
                <p className="info-note">Freitag bis Sonntag</p>
              </div>
              <div className="info-card">
                <h4>🕐 Öffnungszeiten</h4>
                <p>Fr ab 14:00 Uhr</p>
                <p className="info-note">Sa & So 10:00-18:00 Uhr</p>
              </div>
              <div className="info-card">
                <h4>📍 Ort</h4>
                <p><strong>K2 Galerie</strong></p>
                <p className="info-note">Schlossergasse 4, 4070 Eferding</p>
              </div>
            </div>
          </div>
        </section>

        {/* Dokumente Section */}
        <section id="dokumente" className="galerie-section">
          <h3>Dokumente</h3>
          <div className="section-content">
            <div className="documents-list">
              <a href="#einladungsfolder" className="document-link">
                <span className="doc-icon">📋</span>
                <div>
                  <h4>Einladungsfolder</h4>
                  <p>Einladung zur Eröffnung – Download</p>
                </div>
              </a>
              <a href="#plakat" className="document-link">
                <span className="doc-icon">🖼️</span>
                <div>
                  <h4>Plakat A4</h4>
                  <p>Eröffnungsplakat zum Download</p>
                </div>
              </a>
              <a href="#presse" className="document-link">
                <span className="doc-icon">📰</span>
                <div>
                  <h4>Presse</h4>
                  <p>Pressemitteilungen und Pressebilder</p>
                </div>
              </a>
              <a href="#katalog" className="document-link">
                <span className="doc-icon">📖</span>
                <div>
                  <h4>Katalog</h4>
                  <p>Digitaler Katalog unserer Werke</p>
                </div>
              </a>
              <a href="#impressum" className="document-link">
                <span className="doc-icon">ℹ️</span>
                <div>
                  <h4>Impressum</h4>
                  <p>Rechtliche Informationen</p>
                </div>
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="galerie-footer">
        <div className="footer-content">
          <p>&copy; 2026 K2 Galerie – Kunst & Keramik</p>
          <div className="footer-links">
            <a href="#impressum">Impressum</a>
            <a href="#datenschutz">Datenschutz</a>
            <a href="#kontakt">Kontakt</a>
          </div>
        </div>
      </footer>

      {/* Kasse Modal für mobile Geräte */}
      {showCashRegister && (
        <div className="cash-register-overlay" onClick={() => setShowCashRegister(false)}>
          <div className="cash-register-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cash-register-header">
              <div>
                <h2>💰 Kasse</h2>
                <button 
                  onClick={() => setShowDailySummary(true)}
                  style={{ 
                    fontSize: '0.85rem', 
                    background: 'rgba(255,255,255,0.2)', 
                    border: 'none', 
                    color: '#fff', 
                    padding: '0.4rem 0.8rem', 
                    borderRadius: '6px',
                    cursor: 'pointer',
                    marginTop: '0.5rem'
                  }}
                >
                  📊 Tagesübersicht
                </button>
              </div>
              <button className="cash-register-close" onClick={() => {
                setShowCashRegister(false)
                setCart([])
                setCurrentProduct(null)
                setDiscount(0)
                setCashReceived('')
              }}>×</button>
            </div>
            <div className="cash-register-content">
              {/* Methode wählen */}
              <div className="field" style={{ marginBottom: '1.5rem' }}>
                <label>Werk hinzufügen</label>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <button
                    className={saleMethod === 'scan' ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setSaleMethod('scan')}
                    style={{ flex: 1 }}
                  >
                    📷 QR-Code scannen
                  </button>
                  <button
                    className={saleMethod === 'manual' ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setSaleMethod('manual')}
                    style={{ flex: 1 }}
                  >
                    ⌨️ Seriennummer
                  </button>
                </div>
              </div>

              {/* QR-Code Scanner */}
              {saleMethod === 'scan' && (
                <div className="scan-area">
                  <label htmlFor="cash-qr-scanner" className="btn-primary" style={{ display: 'block', textAlign: 'center', padding: '1rem', cursor: 'pointer' }}>
                    📷 Kamera öffnen
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        // QR-Code würde hier gelesen werden
                        alert('QR-Code gescannt!\n\nFür Demo: Bitte Seriennummer manuell eingeben.')
                        setSaleMethod('manual')
                      }
                    }}
                    style={{ display: 'none' }}
                    id="cash-qr-scanner"
                  />
                </div>
              )}

              {/* Seriennummer Eingabe */}
              {saleMethod === 'manual' && !currentProduct && (
                <div className="field">
                  <label>Seriennummer eingeben</label>
                  <input
                    type="text"
                    value={saleInput}
                    onChange={(e) => setSaleInput(e.target.value.toUpperCase())}
                    placeholder="z.B. K2-0001"
                    style={{ fontSize: '1.2rem', textAlign: 'center', letterSpacing: '0.1em' }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && saleInput.trim()) {
                        handleSaleInput()
                      }
                    }}
                  />
                  <button className="btn-primary" onClick={handleSaleInput} style={{ width: '100%', marginTop: '0.5rem' }}>
                    Produkt laden
                  </button>
                </div>
              )}

              {/* Produktanzeige */}
              {currentProduct && (
                <div className="product-display" style={{ marginTop: '1.5rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px', border: '2px solid #8b6914' }}>
                  <h3 style={{ marginTop: 0, color: '#8b6914' }}>Produkt gefunden</h3>
                  <div style={{ marginTop: '1rem' }}>
                    <p style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '0.5rem 0' }}>
                      {currentProduct.number} - {currentProduct.title}
                    </p>
                    <p style={{ margin: '0.5rem 0', color: '#666' }}>
                      {currentProduct.category} • {currentProduct.artist}
                    </p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#8b6914', margin: '1rem 0' }}>
                      €{currentProduct.price.toFixed(2)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button className="btn-secondary" onClick={() => setCurrentProduct(null)} style={{ flex: 1 }}>
                      Abbrechen
                    </button>
                    <button className="btn-primary" onClick={addProductToCart} style={{ flex: 1 }}>
                      Zum Warenkorb hinzufügen
                    </button>
                  </div>
                </div>
              )}

              {/* Warenkorb */}
              {cart.length > 0 && (
                <div className="cash-cart" style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0 }}>Warenkorb ({cart.length})</h3>
                    <button 
                      className="btn-secondary" 
                      onClick={() => {
                        setCart([])
                        setDiscount(0)
                        setCashReceived('')
                      }}
                      style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
                    >
                      Leeren
                    </button>
                  </div>
                  {cart.map((item, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '0.75rem', 
                      marginBottom: '0.5rem',
                      background: '#fff',
                      borderRadius: '6px',
                      border: '1px solid #eee'
                    }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{item.number}</span>
                        <br />
                        <span style={{ fontSize: '0.85rem', color: '#666' }}>{item.title}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>€{item.price.toFixed(2)}</span>
                        <button 
                          onClick={() => removeFromCart(index)}
                          style={{ 
                            background: '#b8403a', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: '4px', 
                            padding: '0.25rem 0.5rem',
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Zwischensumme & Rabatt */}
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #ddd' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                      <span>Zwischensumme:</span>
                      <span>€{totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="field" style={{ marginBottom: '0.5rem' }}>
                      <label style={{ fontSize: '0.85rem' }}>Rabatt (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={discount}
                        onChange={(e) => setDiscount(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                        style={{ width: '100%', padding: '0.5rem', fontSize: '0.9rem' }}
                        placeholder="0"
                      />
                    </div>
                    {discount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#2d6a2d' }}>
                        <span>Rabatt ({discount}%):</span>
                        <span>-€{discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid #8b6914', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    <span>Gesamt:</span>
                    <span style={{ color: '#8b6914', fontSize: '1.3rem' }}>€{finalTotal.toFixed(2)}</span>
                  </div>
                  <button className="btn-primary" onClick={proceedToPayment} style={{ width: '100%', marginTop: '1rem', background: '#2d6a2d', fontSize: '1.1rem', padding: '1rem' }}>
                    💰 Zur Bezahlung
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bezahl-Modal */}
      {showPaymentModal && (
        <div className="cash-register-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="cash-register-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="cash-register-header">
              <h2>Bezahlung</h2>
              <button className="cash-register-close" onClick={() => setShowPaymentModal(false)}>×</button>
            </div>
            <div className="cash-register-content">
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#8b6914', marginBottom: '0.5rem' }}>
                  Zu zahlen
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2d6a2d' }}>
                  €{finalTotal.toFixed(2)}
                </div>
                {discount > 0 && (
                  <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                    (Rabatt: {discount}%)
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Barzahlung */}
                <div style={{ border: '2px solid #8b6914', borderRadius: '8px', padding: '1rem' }}>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      if (!cashReceived || parseFloat(cashReceived) < finalTotal) {
                        alert(`Bitte mindestens €${finalTotal.toFixed(2)} eingeben`)
                        return
                      }
                      processPayment('cash')
                    }}
                    style={{ 
                      fontSize: '1.2rem', 
                      padding: '1rem',
                      background: '#8b6914',
                      width: '100%',
                      marginBottom: '1rem'
                    }}
                  >
                    💵 Bar bezahlen
                  </button>
                  <div className="field">
                    <label style={{ fontSize: '0.9rem' }}>Erhalten</label>
                    <input
                      type="number"
                      step="0.01"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      placeholder="0.00"
                      style={{ fontSize: '1.2rem', textAlign: 'center', padding: '0.75rem' }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && cashReceived && parseFloat(cashReceived) >= finalTotal) {
                          processPayment('cash')
                        }
                      }}
                    />
                  </div>
                  {cashReceived && parseFloat(cashReceived) >= finalTotal && (
                    <div style={{ 
                      marginTop: '0.5rem', 
                      padding: '0.75rem', 
                      background: '#e8f5e9', 
                      borderRadius: '6px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: '#2d6a2d'
                    }}>
                      Rückgeld: €{changeAmount.toFixed(2)}
                    </div>
                  )}
                </div>

                {/* Kartenzahlung */}
                <button
                  className="btn-primary"
                  onClick={() => processPayment('card')}
                  style={{ 
                    fontSize: '1.2rem', 
                    padding: '1.5rem',
                    background: '#2d6a2d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  💳 Mit Karte bezahlen (SumUp)
                </button>
              </div>

              <button 
                className="btn-secondary" 
                onClick={() => {
                  setShowPaymentModal(false)
                  setCashReceived('')
                }}
                style={{ width: '100%', marginTop: '1rem' }}
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kassabon-Modal */}
      {showReceipt && lastSale && (
        <div className="cash-register-overlay" onClick={() => setShowReceipt(false)}>
          <div className="cash-register-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="cash-register-header" style={{ background: '#2d6a2d' }}>
              <h2>✅ Verkauf abgeschlossen</h2>
              <button className="cash-register-close" onClick={() => {
                setShowReceipt(false)
                setCart([])
                setCurrentProduct(null)
              }}>×</button>
            </div>
            <div className="cash-register-content">
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✅</div>
                <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  <strong>Bon-Nr.:</strong> {lastSale.receiptNumber}
                </p>
                <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  <strong>Zahlungsart:</strong> {lastSale.paymentMethod === 'cash' ? 'Bar' : 'Karte (SumUp)'}
                </p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2d6a2d', marginTop: '1rem' }}>
                  €{lastSale.total.toFixed(2)}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button
                  className="btn-primary"
                  onClick={printReceipt}
                  style={{ 
                    fontSize: '1.1rem', 
                    padding: '1rem',
                    background: '#8b6914'
                  }}
                >
                  🖨️ Kassabon drucken
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setShowReceipt(false)
                    setCart([])
                    setCurrentProduct(null)
                    setShowCashRegister(false)
                  }}
                  style={{ fontSize: '1rem', padding: '0.75rem' }}
                >
                  Fertig
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tagesübersicht Modal */}
      {showDailySummary && (
        <div className="cash-register-overlay" onClick={() => setShowDailySummary(false)}>
          <div className="cash-register-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="cash-register-header">
              <h2>📊 Tagesübersicht</h2>
              <button className="cash-register-close" onClick={() => setShowDailySummary(false)}>×</button>
            </div>
            <div className="cash-register-content">
              {(() => {
                const daily = getDailySales()
                return (
                  <>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                      <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                        {new Date().toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                      <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2d6a2d' }}>
                        €{daily.total.toFixed(2)}
                      </div>
                    </div>

                    <div className="stats-grid" style={{ marginBottom: '2rem' }}>
                      <div className="stat-card" style={{ background: '#f5f5f5' }}>
                        <div className="stat-icon">💰</div>
                        <div className="stat-value">{daily.count}</div>
                        <div className="stat-label">Verkäufe</div>
                      </div>
                      <div className="stat-card" style={{ background: '#f5f5f5' }}>
                        <div className="stat-icon">💵</div>
                        <div className="stat-value">€{daily.cash.toFixed(2)}</div>
                        <div className="stat-label">Bar</div>
                      </div>
                      <div className="stat-card" style={{ background: '#f5f5f5' }}>
                        <div className="stat-icon">💳</div>
                        <div className="stat-value">€{daily.card.toFixed(2)}</div>
                        <div className="stat-label">Karte</div>
                      </div>
                    </div>

                    <button 
                      className="btn-secondary" 
                      onClick={() => setShowDailySummary(false)}
                      style={{ width: '100%' }}
                    >
                      Schließen
                    </button>
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GaleriePage
