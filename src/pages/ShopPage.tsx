import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'
import '../App.css'

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
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCheckout, setShowCheckout] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('card')
  const [discount, setDiscount] = useState(0)
  const [showScanner, setShowScanner] = useState(false)
  const [serialInput, setSerialInput] = useState('')
  const [allArtworks, setAllArtworks] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])

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
  const addBySerialNumber = () => {
    const serial = serialInput.trim().toUpperCase()
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
      alert('Dieses Werk ist bereits im Warenkorb')
      return
    }

    // Prüfe ob im Shop verfügbar
    if (!artwork.inShop && artwork.inShop !== true) {
      alert('Dieses Werk ist nicht im Online-Shop verfügbar.')
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
    alert(`✅ "${artwork.title || artwork.number}" wurde zum Warenkorb hinzugefügt`)
  }

  // QR-Code scannen (für mobile Geräte)
  const handleQRScan = () => {
    // Prüfe ob auf mobilem Gerät
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    
    if (isMobile) {
      // Auf Mobile: Öffne Kamera für QR-Scan
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.capture = 'environment'
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) {
          // Hier könnte man eine QR-Code-Library verwenden
          // Für jetzt: Einfach Input-Feld öffnen
          setShowScanner(true)
        }
      }
      input.click()
    } else {
      // Auf Desktop: Einfach Input-Feld öffnen
      setShowScanner(true)
    }
  }

  // QR-Code aus URL oder Text verarbeiten
  const processQRCode = (qrData: string) => {
    if (!qrData || !qrData.trim()) return

    const data = qrData.trim()
    
    try {
      // Versuche URL zu parsen
      const url = new URL(data)
      const werkParam = url.searchParams.get('werk')
      if (werkParam) {
        setSerialInput(werkParam.toUpperCase())
        setTimeout(() => addBySerialNumber(), 100)
        setShowScanner(false)
        return
      }
    } catch (error) {
      // Keine URL, versuche direkt als Seriennummer
    }
    
    // Direkt als Seriennummer verwenden
    setSerialInput(data.toUpperCase())
    setTimeout(() => addBySerialNumber(), 100)
    setShowScanner(false)
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
      alert('Warenkorb ist leer')
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
                <div class="item-details">${item.category === 'malerei' ? 'Malerei' : 'Keramik'}${item.artist ? ' • ' + item.artist : ''}</div>
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
            <div style="font-size: 7px;">Vielen Dank!</div>
          </div>
          
          <div class="divider">━━━━━━━━━━</div>
          
          <div class="footer">
            <div>K2 Galerie</div>
            <div>www.k2-galerie.at</div>
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
                <div class="item-details">${item.category === 'malerei' ? 'Malerei' : 'Keramik'}${item.artist ? ' • ' + item.artist : ''}</div>
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
            <div style="font-size: 7px;">Vielen Dank!</div>
          </div>
          
          <div class="divider">━━━━━━━━━━</div>
          
          <div class="footer">
            <div><strong>K2 Galerie</strong></div>
            <div>Kunst & Keramik</div>
            <div style="margin-top: 10px;">www.k2-galerie.at</div>
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
    // Bestellung speichern
    const order = {
      id: `ORDER-${Date.now()}`,
      date: new Date().toISOString(),
      items: cart,
      subtotal,
      discount: discountAmount,
      total,
      paymentMethod: method,
      orderNumber: `O-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Date.now()).slice(-4)}`
    }

    // Bestellungen speichern
    const ordersStored = JSON.parse(localStorage.getItem('k2-orders') || '[]')
    ordersStored.push(order)
    localStorage.setItem('k2-orders', JSON.stringify(ordersStored))
    setOrders(prev => [order, ...prev.slice(0, 19)])

    // Werke als verkauft markieren
    cart.forEach(item => {
      const soldArtworks = JSON.parse(localStorage.getItem('k2-sold-artworks') || '[]')
      if (!soldArtworks.find((a: any) => a.number === item.number)) {
        soldArtworks.push({
          number: item.number,
          soldAt: new Date().toISOString(),
          orderId: order.id
        })
        localStorage.setItem('k2-sold-artworks', JSON.stringify(soldArtworks))
      }
    })

    // Event für andere Komponenten
    window.dispatchEvent(new CustomEvent('artworks-updated'))

    // Warenkorb leeren
    setCart([])
    setShowCheckout(false)
    
    // Erfolgsmeldung mit Druck-Optionen
    const paymentMethodText = method === 'cash' ? 'Bar' : method === 'card' ? 'Karte' : 'Überweisung'
    const printChoice = confirm(`✅ Verkauf erfolgreich!\n\nBetrag: €${total.toFixed(2)}\nZahlung: ${paymentMethodText}\n\nKassenbon drucken?\n\nOK = Etikettendrucker (80mm)\nAbbrechen = A4 Druck`)
    
    if (printChoice) {
      // Etikettendrucker (80mm)
      printReceipt(order)
    } else {
      // A4 Druck
      printReceiptA4(order)
    }
  }

  return (
    <div style={{ 
      minHeight: '-webkit-fill-available',
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1419 100%)',
      color: '#ffffff',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.15), transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 119, 198, 0.1), transparent 50%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <header style={{ 
          padding: 'clamp(2rem, 6vw, 4rem) clamp(1.5rem, 4vw, 3rem)',
          paddingTop: 'clamp(3rem, 8vw, 5rem)',
          maxWidth: '1400px',
          margin: '0 auto',
          marginBottom: 'clamp(2rem, 5vw, 3rem)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: '1.5rem' 
          }}>
            <div>
              <h1 style={{ 
                margin: 0, 
                fontSize: 'clamp(2rem, 6vw, 3rem)',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #ffffff 0%, #b8b8ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.02em',
                lineHeight: '1.1'
              }}>
                Kasse
              </h1>
              <p style={{ 
                margin: '0.75rem 0 0', 
                color: 'rgba(255, 255, 255, 0.7)', 
                fontSize: 'clamp(1rem, 3vw, 1.2rem)',
                fontWeight: '300'
              }}>
                {cart.length > 0 ? `${cart.length} ${cart.length === 1 ? 'Artikel' : 'Artikel'} • €${total.toFixed(2)}` : 'Warenkorb'}
              </p>
            </div>
            <nav style={{ 
              display: 'flex', 
              gap: '0.75rem', 
              flexWrap: 'wrap',
              fontSize: 'clamp(0.85rem, 2.5vw, 1rem)'
            }}>
              <Link 
                to={PROJECT_ROUTES['k2-galerie'].galerieVorschau} 
                style={{ 
                  padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)', 
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff', 
                  textDecoration: 'none', 
                  borderRadius: '12px',
                  fontSize: 'inherit',
                  whiteSpace: 'nowrap',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                ← Zur Galerie
              </Link>
              <Link 
                to="/admin" 
                style={{ 
                  padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)', 
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff', 
                  textDecoration: 'none', 
                  borderRadius: '12px',
                  fontSize: 'inherit',
                  whiteSpace: 'nowrap',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                ⚙️ Admin
              </Link>
            </nav>
          </div>
        </header>

        <main style={{
          padding: '0 clamp(1.5rem, 4vw, 3rem)',
          paddingBottom: 'clamp(4rem, 10vw, 6rem)',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {/* QR-Scanner & Seriennummer-Eingabe */}
          <section style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: 'clamp(1.5rem, 4vw, 2.5rem)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            marginBottom: 'clamp(2rem, 5vw, 3rem)'
          }}>
          <h3 style={{ 
            fontSize: 'clamp(1.25rem, 3.5vw, 1.5rem)', 
            marginBottom: '1.5rem',
            color: '#ffffff',
            fontWeight: '600'
          }}>
            Werk hinzufügen
          </h3>
          
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <button
              onClick={handleQRScan}
              style={{
                flex: 1,
                minWidth: '120px',
                padding: 'clamp(0.75rem, 2vw, 1rem)',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
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
                padding: 'clamp(0.75rem, 2vw, 1rem)',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                color: '#ffffff',
                outline: 'none'
              }}
            />
            <button
              onClick={addBySerialNumber}
              style={{
                padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s ease',
                boxShadow: '0 10px 30px rgba(245, 87, 108, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(245, 87, 108, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(245, 87, 108, 0.3)'
              }}
            >
              Hinzufügen
            </button>
          </div>
        </section>

        {/* Bon erneut drucken */}
        {orders.length > 0 && (
          <section style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: 'clamp(1.5rem, 4vw, 2rem)',
            marginBottom: 'clamp(2rem, 5vw, 3rem)'
          }}>
            <h3 style={{ 
              fontSize: 'clamp(1.1rem, 3vw, 1.3rem)', 
              marginBottom: '1rem',
              color: '#ffffff',
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
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '10px',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                      e.currentTarget.style.borderColor = 'rgba(95, 251, 241, 0.5)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{dateStr}</span>
                    <span style={{ fontWeight: '600' }}>{order.orderNumber}</span>
                    <span style={{ color: '#5ffbf1' }}>€{(order.total || 0).toFixed(2)}</span>
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
              background: 'rgba(26, 31, 58, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              padding: 'clamp(1.5rem, 4vw, 2.5rem)',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'clamp(1rem, 3vw, 1.5rem)' }}>
                <h3 style={{ margin: 0, color: '#ffffff', fontSize: 'clamp(1.25rem, 3.5vw, 1.5rem)', fontWeight: '600' }}>QR-Code scannen</h3>
                <button
                  onClick={() => setShowScanner(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    padding: '0.25rem 0.75rem',
                    color: '#ffffff',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  ×
                </button>
              </div>
              
              <input
                type="text"
                placeholder="QR-Code Text hier einfügen oder Seriennummer eingeben (z.B. K2-0001)"
                autoFocus
                value={serialInput}
                onChange={(e) => setSerialInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && serialInput.trim()) {
                    processQRCode(serialInput.trim())
                  }
                }}
                style={{
                  width: '100%',
                  padding: 'clamp(0.75rem, 2vw, 1rem)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                  marginBottom: 'clamp(1rem, 3vw, 1.5rem)',
                  color: '#ffffff',
                  outline: 'none'
                }}
              />
              
              <div style={{ display: 'flex', gap: 'clamp(0.75rem, 2vw, 1rem)' }}>
                <button
                  onClick={() => {
                    if (serialInput.trim()) {
                      processQRCode(serialInput.trim())
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: 'clamp(0.75rem, 2vw, 1rem)',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
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
                  Hinzufügen
                </button>
                <button
                  onClick={() => setShowScanner(false)}
                  style={{
                    padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    borderRadius: '12px',
                    fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  Abbrechen
                </button>
              </div>
              
              <p style={{ fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)', color: 'rgba(255, 255, 255, 0.6)', marginTop: 'clamp(1rem, 3vw, 1.5rem)', marginBottom: 0 }}>
                💡 Tipp: Auf mobilen Geräten kannst du die Kamera-App verwenden, um QR-Codes zu scannen und den Text hier einfügen.
              </p>
            </div>
          </div>
        )}

        {cart.length === 0 ? (
          <div style={{ 
            padding: 'clamp(4rem, 10vw, 6rem)', 
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px'
          }}>
            <div style={{ fontSize: 'clamp(4rem, 10vw, 6rem)', marginBottom: '2rem' }}>🛒</div>
            <h2 style={{ 
              fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', 
              marginBottom: '1.5rem',
              color: '#ffffff',
              fontWeight: '700'
            }}>
              Dein Warenkorb ist leer
            </h2>
            <p style={{ 
              fontSize: 'clamp(1.1rem, 3vw, 1.3rem)', 
              marginBottom: '1rem',
              color: 'rgba(255, 255, 255, 0.8)'
            }}>
              Entdecke unsere Kunstwerke und füge sie zu deinem Warenkorb hinzu.
            </p>
            <p style={{ 
              fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)', 
              color: 'rgba(255, 255, 255, 0.6)', 
              marginBottom: orders.length > 0 ? '1rem' : '2rem', 
              fontStyle: 'italic' 
            }}>
              Hinweis: Nicht alle Werke sind im Online-Shop verfügbar. Werke, die nur zur Ausstellung gehören, können nicht online gekauft werden.
            </p>
            {orders.length > 0 && (
              <button
                onClick={() => handleReprintOrder(orders[0])}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.25rem',
                  background: 'rgba(95, 251, 241, 0.15)',
                  border: '1px solid rgba(95, 251, 241, 0.4)',
                  borderRadius: '12px',
                  color: '#5ffbf1',
                  fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: '1.5rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(95, 251, 241, 0.25)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(95, 251, 241, 0.15)'
                }}
              >
                🖨️ Letzten Bon erneut drucken ({orders[0].orderNumber} · €{(orders[0].total || 0).toFixed(2)})
              </button>
            )}
            <Link 
              to={PROJECT_ROUTES['k2-galerie'].galerieVorschau}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: 'clamp(1rem, 2.5vw, 1.25rem) clamp(2rem, 5vw, 2.5rem)',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '12px',
                fontSize: 'clamp(1rem, 2.5vw, 1.1rem)',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.3)'
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
                fontSize: 'clamp(1.5rem, 4vw, 2rem)', 
                marginBottom: 'clamp(1.5rem, 4vw, 2rem)',
                color: '#ffffff',
                fontWeight: '600'
              }}>
                Warenkorb ({cart.length} {cart.length === 1 ? 'Artikel' : 'Artikel'})
              </h2>
              
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 'clamp(1rem, 3vw, 1.5rem)' 
              }}>
                {cart.map((item, index) => (
                  <div key={`${item.number}-${index}`} style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '20px',
                    padding: 'clamp(1.5rem, 4vw, 2rem)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                    display: 'flex',
                    gap: 'clamp(1rem, 3vw, 1.5rem)',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                    e.currentTarget.style.transform = 'translateY(-4px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                  >
                    <div style={{
                      width: 'clamp(80px, 20vw, 120px)',
                      height: 'clamp(80px, 20vw, 120px)',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      background: 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
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
                              placeholder.style.cssText = 'width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: rgba(255, 255, 255, 0.5); font-size: 0.8rem'
                              placeholder.textContent = item.number || '?'
                              parent.appendChild(placeholder)
                            }
                          }}
                        />
                      ) : (
                        <div style={{
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontSize: '0.8rem',
                          textAlign: 'center'
                        }}>
                          {item.number || '?'}
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <h3 style={{ 
                        margin: '0 0 0.75rem', 
                        fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
                        color: '#ffffff',
                        fontWeight: '600'
                      }}>
                        {item.title || item.number}
                      </h3>
                      <p style={{ 
                        margin: '0.25rem 0', 
                        fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)', 
                        color: 'rgba(255, 255, 255, 0.6)' 
                      }}>
                        {item.category === 'malerei' ? 'Malerei' : item.category === 'keramik' ? 'Keramik' : item.category}
                        {item.artist && ` • ${item.artist}`}
                      </p>
                      <p style={{ 
                        margin: '0.75rem 0 0', 
                        fontWeight: '700', 
                        background: 'linear-gradient(135deg, #b8b8ff 0%, #ff77c6 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontSize: 'clamp(1.1rem, 3vw, 1.3rem)'
                      }}>
                        € {item.price.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(index)}
                      style={{
                        padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                        background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                        fontWeight: '600',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 10px 30px rgba(245, 87, 108, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 15px 40px rgba(245, 87, 108, 0.4)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 10px 30px rgba(245, 87, 108, 0.3)'
                      }}
                    >
                      Entfernen
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Zusammenfassung & Schnellverkauf */}
            {!showCheckout && (
              <section style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: 'clamp(2rem, 5vw, 3rem)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                marginBottom: 'clamp(2rem, 5vw, 3rem)'
              }}>
                <div style={{ 
                  borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
                  paddingBottom: 'clamp(1rem, 3vw, 1.5rem)',
                  marginBottom: 'clamp(1.5rem, 4vw, 2rem)'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    fontSize: 'clamp(1.5rem, 5vw, 2.25rem)',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #ffffff 0%, #b8b8ff 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: '0.75rem'
                  }}>
                    <span>Gesamt:</span>
                    <span>€ {total.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                      color: 'rgba(255, 119, 198, 0.9)'
                    }}>
                      <span>Rabatt ({discount}%):</span>
                      <span>-€ {discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Schnellverkauf-Buttons */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: 'clamp(0.75rem, 2vw, 1rem)',
                  marginBottom: 'clamp(1rem, 3vw, 1.5rem)'
                }}>
                  <button
                    onClick={() => {
                      setPaymentMethod('cash')
                      quickSale('cash')
                    }}
                    style={{
                      padding: 'clamp(1rem, 2.5vw, 1.5rem)',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '16px',
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)'
                      e.currentTarget.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.4)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.3)'
                    }}
                  >
                    <span style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)' }}>💵</span>
                    <span>Bar</span>
                  </button>
                  <button
                    onClick={() => {
                      setPaymentMethod('card')
                      quickSale('card')
                    }}
                    style={{
                      padding: 'clamp(1rem, 2.5vw, 1.5rem)',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '16px',
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)'
                      e.currentTarget.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.4)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.3)'
                    }}
                  >
                    <span style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)' }}>💳</span>
                    <span>Karte</span>
                  </button>
                  <button
                    onClick={() => {
                      setPaymentMethod('transfer')
                      quickSale('transfer')
                    }}
                    style={{
                      padding: 'clamp(1rem, 2.5vw, 1.5rem)',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '16px',
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)'
                      e.currentTarget.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.4)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.3)'
                    }}
                  >
                    <span style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)' }}>🏦</span>
                    <span>Überweisung</span>
                  </button>
                </div>

                {/* Option: Andere Zahlungsmethode */}
                <button
                  onClick={() => setShowCheckout(true)}
                  style={{
                    width: '100%',
                    padding: 'clamp(0.75rem, 2vw, 1rem)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    color: 'rgba(255, 255, 255, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                  }}
                >
                  Andere Optionen
                </button>
              </section>
            )}

            {/* Checkout */}
            {showCheckout && (
              <section style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: 'clamp(2rem, 5vw, 3rem)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                marginBottom: 'clamp(2rem, 5vw, 3rem)'
              }}>
                <h3 style={{ 
                  fontSize: 'clamp(1.25rem, 3.5vw, 1.5rem)', 
                  marginBottom: 'clamp(1.5rem, 4vw, 2rem)',
                  color: '#ffffff',
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
                    border: paymentMethod === 'card' ? '2px solid rgba(102, 126, 234, 0.5)' : '2px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '16px',
                    background: paymentMethod === 'card' ? 'rgba(102, 126, 234, 0.2)' : 'rgba(255, 255, 255, 0.05)',
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
                    <span style={{ fontSize: 'clamp(1rem, 3vw, 1.1rem)', fontWeight: paymentMethod === 'card' ? '600' : '400', color: '#ffffff' }}>💳 Karte</span>
                  </label>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 'clamp(0.75rem, 2vw, 1rem)', 
                    cursor: 'pointer',
                    padding: 'clamp(1rem, 3vw, 1.5rem)',
                    border: paymentMethod === 'transfer' ? '2px solid rgba(102, 126, 234, 0.5)' : '2px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '16px',
                    background: paymentMethod === 'transfer' ? 'rgba(102, 126, 234, 0.2)' : 'rgba(255, 255, 255, 0.05)',
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
                    <span style={{ fontSize: 'clamp(1rem, 3vw, 1.1rem)', fontWeight: paymentMethod === 'transfer' ? '600' : '400', color: '#ffffff' }}>🏦 Überweisung</span>
                  </label>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 'clamp(0.75rem, 2vw, 1rem)', 
                    cursor: 'pointer',
                    padding: 'clamp(1rem, 3vw, 1.5rem)',
                    border: paymentMethod === 'cash' ? '2px solid rgba(102, 126, 234, 0.5)' : '2px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '16px',
                    background: paymentMethod === 'cash' ? 'rgba(102, 126, 234, 0.2)' : 'rgba(255, 255, 255, 0.05)',
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
                    <span style={{ fontSize: 'clamp(1rem, 3vw, 1.1rem)', fontWeight: paymentMethod === 'cash' ? '600' : '400', color: '#ffffff' }}>💵 Bar</span>
                  </label>
                </div>

                <div style={{ 
                  borderTop: '2px solid rgba(255, 255, 255, 0.1)',
                  paddingTop: 'clamp(1rem, 3vw, 1.5rem)',
                  marginBottom: 'clamp(1.5rem, 4vw, 2rem)'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    fontSize: 'clamp(1.3rem, 4vw, 1.8rem)',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #ffffff 0%, #b8b8ff 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
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
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#ffffff',
                      borderRadius: '12px',
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    Zurück
                  </button>
                  <button
                    onClick={() => processOrder()}
                    style={{
                      flex: 2,
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: 'clamp(1rem, 3vw, 1.1rem)',
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
                    Verkauf abschließen
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
