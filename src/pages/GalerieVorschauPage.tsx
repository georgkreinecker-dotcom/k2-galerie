import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'
import '../App.css'

// Einfache localStorage-Funktion
function loadArtworks(): any[] {
  try {
    const stored = localStorage.getItem('k2-artworks')
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Fehler beim Laden:', error)
    return []
  }
}

type Filter = 'alle' | 'malerei' | 'keramik'

const GalerieVorschauPage = ({ initialFilter }: { initialFilter?: Filter }) => {
  const navigate = useNavigate()
  const [artworks, setArtworks] = useState<any[]>([])
  const [filter, setFilter] = useState<Filter>(initialFilter || 'alle')
  const [cartCount, setCartCount] = useState(0)
  const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string; artwork: any } | null>(null)
  const [imageZoom, setImageZoom] = useState(1)
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [likedArtworks, setLikedArtworks] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [loadStatus, setLoadStatus] = useState<{ message: string; success: boolean } | null>(null)

  // Gelikte Werke laden
  useEffect(() => {
    try {
      const liked = localStorage.getItem('k2-liked-artworks')
      if (liked) {
        setLikedArtworks(new Set(JSON.parse(liked)))
      }
    } catch (error) {
      // Ignoriere Fehler
    }
  }, [])

  // Like-Funktion
  const toggleLike = (artworkNumber: string) => {
    const newLiked = new Set(likedArtworks)
    if (newLiked.has(artworkNumber)) {
      newLiked.delete(artworkNumber)
    } else {
      newLiked.add(artworkNumber)
    }
    setLikedArtworks(newLiked)
    localStorage.setItem('k2-liked-artworks', JSON.stringify(Array.from(newLiked)))
  }

  // Update filter wenn initialFilter sich ändert
  useEffect(() => {
    if (initialFilter) {
      setFilter(initialFilter)
    }
  }, [initialFilter])

  // Werke aus localStorage laden, falls leer: aus gallery-data.json laden
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setLoadStatus({ message: '🔄 Lade Werke...', success: false })
      
      try {
        // Prüfe zuerst ob neue Version verfügbar ist
        const lastVersion = localStorage.getItem('k2-last-loaded-version')
        const lastBuildId = localStorage.getItem('k2-last-build-id')
        
        // Lade Metadaten vom Server um Version zu prüfen
        let needsReload = false
        try {
          const metaUrl = `/gallery-data.json?meta=true&v=${Date.now()}`
          const metaResponse = await fetch(metaUrl, {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache' }
          })
          
          if (metaResponse.ok) {
            const metaData = await metaResponse.json()
            const serverVersion = metaData.version || 0
            const serverBuildId = metaData.buildId || ''
            
            // Prüfe ob neue Version verfügbar
            if (serverVersion && serverVersion !== lastVersion) {
              console.log('🔄 Neue Version verfügbar:', serverVersion, 'vs', lastVersion)
              needsReload = true
            } else if (serverBuildId && serverBuildId !== lastBuildId) {
              console.log('🔄 Neue Build-ID verfügbar:', serverBuildId, 'vs', lastBuildId)
              needsReload = true
            }
          }
        } catch (e) {
          console.warn('⚠️ Version-Check fehlgeschlagen, lade trotzdem:', e)
        }
        
        // Zuerst aus localStorage laden
        let stored = loadArtworks()
        
        // Wenn localStorage leer ist ODER neue Version verfügbar, lade aus gallery-data.json
        if (!stored || stored.length === 0 || needsReload) {
          console.log('🔄 Lade aus gallery-data.json...', needsReload ? '(neue Version)' : '(localStorage leer)')
          setLoadStatus({ message: '🔄 Synchronisiere mit Server...', success: false })
          
          try {
            const timestamp = Date.now()
            const url = `/gallery-data.json?v=${timestamp}&t=${timestamp}&_=${Math.random()}`
            const response = await fetch(url, {
              cache: 'no-store',
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
              }
            })
            
            if (response.ok) {
              const data = await response.json()
              if (data.artworks && Array.isArray(data.artworks)) {
                // Speichere Version-Info
                if (data.version) localStorage.setItem('k2-last-loaded-version', String(data.version))
                if (data.buildId) localStorage.setItem('k2-last-build-id', data.buildId)
                
                // Speichere in localStorage
                try {
                  localStorage.setItem('k2-artworks', JSON.stringify(data.artworks))
                  console.log('✅ Werke aus gallery-data.json geladen und gespeichert:', data.artworks.length)
                  stored = data.artworks
                  setLoadStatus({ message: `✅ ${data.artworks.length} Werke synchronisiert`, success: true })
                  setTimeout(() => setLoadStatus(null), 3000)
                } catch (e) {
                  console.warn('⚠️ Werke zu groß für localStorage, verwende direkt')
                  stored = data.artworks
                  setLoadStatus({ message: `✅ ${data.artworks.length} Werke geladen`, success: true })
                  setTimeout(() => setLoadStatus(null), 3000)
                }
              } else {
                setLoadStatus({ message: '⚠️ Keine Werke gefunden', success: false })
                setTimeout(() => setLoadStatus(null), 3000)
              }
            } else {
              setLoadStatus({ message: '⚠️ Server nicht erreichbar', success: false })
              setTimeout(() => setLoadStatus(null), 3000)
            }
          } catch (error) {
            console.warn('⚠️ gallery-data.json konnte nicht geladen werden:', error)
            setLoadStatus({ message: '⚠️ Fehler beim Laden', success: false })
            setTimeout(() => setLoadStatus(null), 3000)
          }
        } else {
          setLoadStatus({ message: `✅ ${stored.length} Werke geladen`, success: true })
          setTimeout(() => setLoadStatus(null), 2000)
        }
        
        if (Array.isArray(stored) && stored.length > 0) {
          // Filtere nur echte Werke und stelle sicher, dass imageUrl vorhanden ist
          // WICHTIG: Zeige ALLE Werke, nicht nur die mit inExhibition === true
          const exhibitionArtworks = stored
            .filter((a: any) => {
              if (!a) return false
              // Stelle sicher, dass mindestens ein Bild vorhanden ist
              if (!a.imageUrl && !a.previewUrl) {
                console.warn('Werk ohne Bild gefunden:', a.number || a.id)
                return false // Kein Bild = nicht anzeigen
              }
              return true // Alle Werke mit Bild anzeigen
            })
            .map((a: any) => {
              // Stelle sicher, dass imageUrl korrekt gesetzt ist
              if (!a.imageUrl && a.previewUrl) {
                a.imageUrl = a.previewUrl
              }
              return a
            })
          console.log('✅ Geladene Werke:', exhibitionArtworks.length)
          setArtworks(exhibitionArtworks)
        } else {
          console.warn('⚠️ Keine Werke gefunden')
          setArtworks([])
          setLoadStatus({ message: '⚠️ Keine Werke gefunden', success: false })
          setTimeout(() => setLoadStatus(null), 3000)
        }
      } catch (error) {
        console.error('❌ Fehler beim Laden:', error)
        setArtworks([])
        setLoadStatus({ message: '❌ Fehler beim Laden', success: false })
        setTimeout(() => setLoadStatus(null), 3000)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
    
    // Event Listener für Updates von GaleriePage
    const handleArtworksUpdate = () => {
      console.log('🔄 Werke wurden aktualisiert, lade neu...')
      loadData()
    }
    
    window.addEventListener('artworks-updated', handleArtworksUpdate)
    
    return () => {
      window.removeEventListener('artworks-updated', handleArtworksUpdate)
    }
  }, [])
  
  // Manuelle Refresh-Funktion - lädt IMMER neu vom Server
  const handleRefresh = async () => {
    setIsLoading(true)
    setLoadStatus({ message: '🔄 Synchronisiere mit Server...', success: false })
    
    try {
      // Leere localStorage um neue Daten zu erzwingen
      localStorage.removeItem('k2-artworks')
      localStorage.removeItem('k2-last-loaded-timestamp')
      localStorage.removeItem('k2-last-loaded-version')
      localStorage.removeItem('k2-last-build-id')
      
      // Maximale Cache-Busting URL
      const timestamp = Date.now()
      const random = Math.random()
      const url = `/gallery-data.json?v=${timestamp}&t=${timestamp}&r=${random}&_=${Date.now()}&nocache=${Math.random()}&force=${Date.now()}&refresh=${Math.random()}`
      
      console.log('🔄 Lade neue Daten vom Server...', url.substring(0, 100))
      
      const response = await fetch(url, {
        cache: 'no-store',
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'If-None-Match': `"${timestamp}-${random}"`,
          'If-Modified-Since': 'Thu, 01 Jan 1970 00:00:00 GMT'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.artworks && Array.isArray(data.artworks)) {
          // Speichere Version-Info
          if (data.version) localStorage.setItem('k2-last-loaded-version', String(data.version))
          if (data.buildId) localStorage.setItem('k2-last-build-id', data.buildId)
          if (data.exportedAt) localStorage.setItem('k2-last-loaded-timestamp', data.exportedAt)
          
          // Speichere in localStorage
          try {
            localStorage.setItem('k2-artworks', JSON.stringify(data.artworks))
            console.log('✅ Neue Werke geladen:', data.artworks.length, 'Version:', data.version)
            
            // Filtere nur echte Werke - Zeige ALLE Werke mit Bild
            const exhibitionArtworks = data.artworks
              .filter((a: any) => {
                if (!a) return false
                // Stelle sicher, dass mindestens ein Bild vorhanden ist
                if (!a.imageUrl && !a.previewUrl) return false
                return true // Alle Werke mit Bild anzeigen
              })
              .map((a: any) => {
                if (!a.imageUrl && a.previewUrl) {
                  a.imageUrl = a.previewUrl
                }
                return a
              })
            
            setArtworks(exhibitionArtworks)
            setLoadStatus({ message: `✅ ${exhibitionArtworks.length} Werke synchronisiert`, success: true })
            console.log('📊 Werke Details:', {
              total: data.artworks.length,
              withImage: exhibitionArtworks.length,
              withoutImage: data.artworks.length - exhibitionArtworks.length
            })
            setTimeout(() => setLoadStatus(null), 3000)
          } catch (e) {
            console.warn('⚠️ Werke zu groß für localStorage')
            setLoadStatus({ message: '⚠️ Zu viele Werke für Cache', success: false })
            setTimeout(() => setLoadStatus(null), 3000)
          }
        } else {
          setLoadStatus({ message: '⚠️ Keine Werke in Datei', success: false })
          setTimeout(() => setLoadStatus(null), 3000)
        }
      } else {
        setLoadStatus({ message: '⚠️ Server nicht erreichbar', success: false })
        setTimeout(() => setLoadStatus(null), 3000)
      }
    } catch (error) {
      console.error('❌ Fehler beim Aktualisieren:', error)
      setLoadStatus({ message: '❌ Fehler beim Laden', success: false })
      setTimeout(() => setLoadStatus(null), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  // Warenkorb-Zähler aktualisieren
  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cartData = localStorage.getItem('k2-cart')
        if (cartData) {
          const cart = JSON.parse(cartData)
          setCartCount(Array.isArray(cart) ? cart.length : 0)
        } else {
          setCartCount(0)
        }
      } catch (error) {
        setCartCount(0)
      }
    }
    updateCartCount()
    // KEIN Event Listener mehr - verursacht Memory Leaks
    return () => {
      // Kein Cleanup nötig
    }
  }, [])

  // Zum Warenkorb hinzufügen
  const addToCart = (artwork: any) => {
    // Prüfe ob Werk im Shop verfügbar ist
    if (!artwork.inShop && artwork.inShop !== true) {
      alert('Dieses Werk ist nicht im Online-Shop verfügbar.')
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

    // Prüfe ob Preis vorhanden
    if (!artwork.price || artwork.price <= 0) {
      alert('Dieses Werk hat keinen Preis.')
      return
    }

    const cartItem = {
      number: artwork.number,
      title: artwork.title || artwork.number,
      price: artwork.price || 0,
      category: artwork.category,
      artist: artwork.artist,
      imageUrl: artwork.imageUrl,
      previewUrl: artwork.previewUrl,
      paintingWidth: artwork.paintingWidth,
      paintingHeight: artwork.paintingHeight,
      ceramicHeight: artwork.ceramicHeight,
      ceramicDiameter: artwork.ceramicDiameter,
      ceramicType: artwork.ceramicType,
      ceramicSurface: artwork.ceramicSurface,
      ceramicDescription: artwork.ceramicDescription,
      ceramicSubcategory: artwork.ceramicSubcategory
    }

    try {
      const cartData = localStorage.getItem('k2-cart')
      const cart = cartData ? JSON.parse(cartData) : []
      
      // Prüfe ob bereits im Warenkorb
      if (cart.some((item: any) => item.number === artwork.number)) {
        alert('Dieses Werk ist bereits im Warenkorb.')
        return
      }

      cart.push(cartItem)
      localStorage.setItem('k2-cart', JSON.stringify(cart))
      setCartCount(cart.length)
      
      // Event für andere Komponenten
      window.dispatchEvent(new CustomEvent('cart-updated'))
      
      alert('Werk wurde zum Warenkorb hinzugefügt!')
    } catch (error) {
      console.error('Fehler beim Hinzufügen zum Warenkorb:', error)
      alert('Fehler beim Hinzufügen zum Warenkorb.')
    }
  }

  // WICHTIG: Stelle sicher dass die Komponente immer etwas rendert - verhindert schwarze Seite
  if (!artworks || artworks.length === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1419 100%)',
        color: '#ffffff',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {isLoading ? (
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄 Lade Werke...</h1>
            <p>{loadStatus?.message || 'Bitte warten...'}</p>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>📸 Keine Werke gefunden</h1>
            <p style={{ marginBottom: '1rem' }}>Bitte aktualisiere die Seite.</p>
            <button 
              onClick={handleRefresh}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              🔄 Aktualisieren
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Synchronisierungs-Status-Balken für Mobile */}
      {loadStatus && (
        <div style={{
          position: 'fixed',
          top: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10000,
          background: loadStatus.success 
            ? 'linear-gradient(120deg, #10b981, #059669)' 
            : 'linear-gradient(120deg, #ef4444, #dc2626)',
          color: '#fff',
          padding: '0.75rem 1rem',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
          maxWidth: '90%',
          fontSize: '0.9rem',
          fontWeight: '500',
          textAlign: 'center',
          animation: 'slideDown 0.3s ease-out'
        }}>
          {loadStatus.message}
        </div>
      )}
      
      <style>{`
        @keyframes slideDown {
          from {
            transform: translateX(-50%) translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }
      `}</style>
      
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
        {/* Aktualisieren Button - Mobile */}
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            zIndex: 10001,
            background: isLoading 
              ? 'rgba(95, 251, 241, 0.5)' 
              : 'linear-gradient(120deg, #5ffbf1, #33a1ff)',
            color: '#0a0e27',
            border: '2px solid rgba(95, 251, 241, 0.5)',
            borderRadius: '12px',
            padding: '0.75rem 1rem',
            fontSize: '0.9rem',
            fontWeight: '700',
            cursor: isLoading ? 'wait' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
            boxShadow: '0 4px 16px rgba(95, 251, 241, 0.5)',
            transition: 'all 0.2s ease',
            touchAction: 'manipulation',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            minWidth: '120px',
            minHeight: '44px'
          }}
          title="Daten vom Server neu laden"
        >
          <span style={{ fontSize: '1.2em' }}>{isLoading ? '⏳' : '🔄'}</span>
          <span>{isLoading ? 'Lädt...' : 'Aktualisieren'}</span>
        </button>
        
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
                Galerie-Vorschau
              </h1>
              <p style={{ 
                margin: '0.75rem 0 0', 
                color: 'rgba(255, 255, 255, 0.7)', 
                fontSize: 'clamp(1rem, 3vw, 1.2rem)',
                fontWeight: '300'
              }}>
                Alle Werke der Ausstellung
              </p>
            </div>
            <nav style={{ 
              display: 'flex', 
              gap: '0.75rem', 
              flexWrap: 'wrap',
              fontSize: 'clamp(0.85rem, 2.5vw, 1rem)'
            }}>
              <Link 
                to={PROJECT_ROUTES['k2-galerie'].galerie} 
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
                to={PROJECT_ROUTES['k2-galerie'].shop}
                style={{ 
                  padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)', 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#ffffff', 
                  textDecoration: 'none', 
                  borderRadius: '12px',
                  fontSize: 'inherit',
                  whiteSpace: 'nowrap',
                  fontWeight: '600',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
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
                🛒 Warenkorb
                {cartCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: '#ff77c6',
                    color: '#ffffff',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(255, 119, 198, 0.4)'
                  }}>
                    {cartCount}
                  </span>
                )}
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
          {/* Info-Banner */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: 'clamp(1rem, 3vw, 1.5rem)',
            marginBottom: 'clamp(2rem, 5vw, 3rem)',
            fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
            color: 'rgba(255, 255, 255, 0.9)',
            textAlign: 'center',
            lineHeight: '1.6'
          }}>
            <strong style={{ color: '#ffffff' }}>Alle Werke</strong> sind Teil unserer Ausstellung und in der Online-Galerie sichtbar. 
            Werke mit <strong style={{ color: '#b8b8ff' }}>"Zum Warenkorb"</strong>-Button können zusätzlich online gekauft werden.
          </div>

          {/* Filter - Mobile optimiert */}
          <div style={{ 
            display: 'flex', 
            gap: '0.75rem', 
            marginBottom: 'clamp(2rem, 5vw, 3rem)', 
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <button
              onClick={() => setFilter('alle')}
              style={{
                padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                border: filter === 'alle' ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                background: filter === 'alle' 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                color: '#ffffff',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
                fontWeight: filter === 'alle' ? '600' : '500',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s ease',
                boxShadow: filter === 'alle' ? '0 10px 30px rgba(102, 126, 234, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (filter !== 'alle') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }
              }}
              onMouseLeave={(e) => {
                if (filter !== 'alle') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }
              }}
            >
              Alle Werke
            </button>
            <button
              onClick={() => setFilter('malerei')}
              style={{
                padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                border: filter === 'malerei' ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                background: filter === 'malerei' 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                color: '#ffffff',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
                fontWeight: filter === 'malerei' ? '600' : '500',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s ease',
                boxShadow: filter === 'malerei' ? '0 10px 30px rgba(102, 126, 234, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (filter !== 'malerei') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }
              }}
              onMouseLeave={(e) => {
                if (filter !== 'malerei') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }
              }}
            >
              Malerei
            </button>
            <button
              onClick={() => setFilter('keramik')}
              style={{
                padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                border: filter === 'keramik' ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                background: filter === 'keramik' 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                color: '#ffffff',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
                fontWeight: filter === 'keramik' ? '600' : '500',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s ease',
                boxShadow: filter === 'keramik' ? '0 10px 30px rgba(102, 126, 234, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (filter !== 'keramik') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }
              }}
              onMouseLeave={(e) => {
                if (filter !== 'keramik') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }
              }}
            >
              Keramik
            </button>
          </div>

        {(() => {
          const filteredArtworks = artworks.filter((artwork) => {
            if (!artwork) return false
            if (filter === 'alle') return true
            return artwork.category === filter
          })

          return filteredArtworks.length === 0 ? (
            <div style={{ 
              padding: 'clamp(3rem, 8vw, 5rem)', 
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px'
            }}>
              <p style={{ fontSize: 'clamp(1.1rem, 3vw, 1.3rem)', color: 'rgba(255, 255, 255, 0.9)' }}>
                Noch keine Werke in der Galerie
              </p>
              <p style={{ 
                fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)', 
                marginTop: '1rem',
                color: 'rgba(255, 255, 255, 0.7)'
              }}>
                Füge im Admin-Bereich neue Werke hinzu und markiere sie als "Teil der Ausstellung".
              </p>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(180px, 40vw, 250px), 1fr))', 
              gap: 'clamp(1.5rem, 4vw, 2rem)'
            }}>
              {filteredArtworks.map((artwork) => {
                if (!artwork) return null
                
                // Prüfe ob verkauft
                let isSold = false
                try {
                  const soldData = localStorage.getItem('k2-sold-artworks')
                  if (soldData) {
                    const soldArtworks = JSON.parse(soldData)
                    if (Array.isArray(soldArtworks)) {
                      isSold = soldArtworks.some((a: any) => a && a.number === artwork.number)
                    }
                  }
                } catch (error) {
                  // Ignoriere Fehler
                }

                return (
                  <div key={artwork.number} style={{ 
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '20px', 
                    padding: 'clamp(1rem, 3vw, 1.5rem)', 
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                    opacity: isSold ? 0.5 : 1,
                    position: 'relative',
                    width: '100%',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSold) {
                      e.currentTarget.style.transform = 'translateY(-8px)'
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                  }}
                  >
                    {isSold && (
                      <div style={{
                        position: 'absolute',
                        top: '0.75rem',
                        right: '0.75rem',
                        background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
                        color: '#fff',
                        padding: 'clamp(0.4rem, 1.5vw, 0.5rem) clamp(0.75rem, 2vw, 1rem)',
                        borderRadius: '8px',
                        fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
                        fontWeight: '600',
                        zIndex: 1,
                        boxShadow: '0 4px 12px rgba(245, 87, 108, 0.4)'
                      }}>
                        Verkauft
                      </div>
                    )}
                    {/* Bild immer anzeigen - robuster Fallback */}
                    <div style={{ 
                      width: '100%', 
                      height: 'clamp(150px, 40vw, 200px)', 
                      borderRadius: '8px', 
                      marginBottom: '0.5rem',
                      position: 'relative',
                      overflow: 'hidden',
                      background: 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {(artwork.imageUrl || artwork.previewUrl) ? (
                        <img 
                          src={artwork.imageUrl || artwork.previewUrl} 
                          alt={artwork.title || artwork.number}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover', 
                            display: 'block',
                            cursor: 'pointer',
                            transition: 'transform 0.3s ease'
                          }}
                          loading="lazy"
                          onClick={() => {
                            setLightboxImage({
                              src: artwork.imageUrl || artwork.previewUrl || '',
                              title: artwork.title || artwork.number || '',
                              artwork: artwork
                            })
                            setImageZoom(1)
                            setImagePosition({ x: 0, y: 0 })
                          }}
                          onError={(e) => {
                            // Bei Fehler: Bild ausblenden und Platzhalter zeigen
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const parent = target.parentElement
                            if (parent) {
                              const existingPlaceholder = parent.querySelector('.artwork-placeholder-fallback')
                              if (!existingPlaceholder) {
                                const placeholder = document.createElement('div')
                                placeholder.className = 'artwork-placeholder-fallback'
                                placeholder.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; color: rgba(255, 255, 255, 0.5); font-size: clamp(0.8rem, 2.5vw, 0.9rem); background: rgba(255, 255, 255, 0.05)'
                                placeholder.textContent = artwork.number || 'Kein Bild'
                                parent.appendChild(placeholder)
                              }
                            }
                          }}
                          onLoad={() => {
                            // Bei erfolgreichem Laden: Platzhalter entfernen
                            const parent = (e.target as HTMLImageElement).parentElement
                            if (parent) {
                              const placeholder = parent.querySelector('.artwork-placeholder-fallback')
                              if (placeholder) {
                                placeholder.remove()
                              }
                            }
                          }}
                        />
                      ) : (
                        <div style={{ 
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)',
                          textAlign: 'center',
                          padding: '1rem'
                        }}>
                          {artwork.number || 'Kein Bild'}
                        </div>
                      )}
                    </div>
                    <h4 style={{ 
                      margin: '1rem 0 0.5rem', 
                      fontSize: 'clamp(1rem, 3vw, 1.2rem)',
                      lineHeight: '1.3',
                      color: '#ffffff',
                      fontWeight: '600'
                    }}>
                      {artwork.title || artwork.number}
                    </h4>
                    <p style={{ 
                      margin: '0.25rem 0', 
                      fontSize: 'clamp(0.75rem, 2vw, 0.85rem)', 
                      color: 'rgba(255, 255, 255, 0.4)',
                      lineHeight: '1.3'
                    }}>
                      {artwork.number}
                    </p>
                    <p style={{ 
                      margin: '0.5rem 0', 
                      fontSize: 'clamp(0.9rem, 2.5vw, 1rem)', 
                      color: 'rgba(255, 255, 255, 0.6)',
                      lineHeight: '1.4'
                    }}>
                      {artwork.category === 'malerei' ? 'Malerei' : artwork.category === 'keramik' ? 'Keramik' : artwork.category}
                      {artwork.artist && ` • ${artwork.artist}`}
                    </p>
                    {/* Erweiterte Beschreibung mit allen Details */}
                    <div style={{ 
                      margin: '0.75rem 0', 
                      fontSize: 'clamp(0.8rem, 2.2vw, 0.9rem)', 
                      color: 'rgba(255, 255, 255, 0.7)',
                      lineHeight: '1.5'
                    }}>
                      {artwork.description && (
                        <p style={{ margin: '0 0 0.5rem 0', fontStyle: 'italic' }}>
                          {artwork.description}
                        </p>
                      )}
                      {/* Malerei: Bildgröße */}
                      {artwork.category === 'malerei' && (artwork.paintingWidth || artwork.paintingHeight) && (
                        <p style={{ margin: '0.25rem 0', fontSize: 'clamp(0.75rem, 2vw, 0.85rem)' }}>
                          {artwork.paintingWidth && artwork.paintingHeight 
                            ? `${artwork.paintingWidth} × ${artwork.paintingHeight} cm`
                            : artwork.paintingWidth 
                            ? `Breite: ${artwork.paintingWidth} cm`
                            : `Höhe: ${artwork.paintingHeight} cm`}
                        </p>
                      )}
                      {/* Keramik: Details */}
                      {artwork.category === 'keramik' && (
                        <>
                          {artwork.ceramicSubcategory && (
                            <p style={{ margin: '0.25rem 0', fontSize: 'clamp(0.75rem, 2vw, 0.85rem)' }}>
                              {artwork.ceramicSubcategory === 'vase' ? 'Vase' : 
                               artwork.ceramicSubcategory === 'teller' ? 'Teller' : 
                               artwork.ceramicSubcategory === 'skulptur' ? 'Skulptur' : 
                               artwork.ceramicSubcategory === 'sonstig' ? 'Sonstig' : artwork.ceramicSubcategory}
                            </p>
                          )}
                          {artwork.ceramicType && (
                            <p style={{ margin: '0.25rem 0', fontSize: 'clamp(0.75rem, 2vw, 0.85rem)' }}>
                              {artwork.ceramicType === 'steingut' ? 'Steingut' : 'Steinzeug'}
                            </p>
                          )}
                          {artwork.ceramicSurface && (
                            <p style={{ margin: '0.25rem 0', fontSize: 'clamp(0.75rem, 2vw, 0.85rem)' }}>
                              {artwork.ceramicSurface === 'engobe' ? 'Engobe' : 
                               artwork.ceramicSurface === 'glasur' ? 'Glasur' : 
                               artwork.ceramicSurface === 'mischtechnik' ? 'Mischtechnik' : artwork.ceramicSurface}
                            </p>
                          )}
                          {(artwork.ceramicHeight || artwork.ceramicDiameter) && (
                            <p style={{ margin: '0.25rem 0', fontSize: 'clamp(0.75rem, 2vw, 0.85rem)' }}>
                              {artwork.ceramicHeight ? `Höhe: ${artwork.ceramicHeight} cm` : ''}
                              {artwork.ceramicHeight && artwork.ceramicDiameter ? ' • ' : ''}
                              {artwork.ceramicDiameter ? `Durchmesser: ${artwork.ceramicDiameter} cm` : ''}
                            </p>
                          )}
                          {artwork.ceramicDescription && (
                            <p style={{ margin: '0.25rem 0', fontSize: 'clamp(0.75rem, 2vw, 0.85rem)', fontStyle: 'italic' }}>
                              {artwork.ceramicDescription}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                    {artwork.price && (
                      <p style={{ 
                        margin: '0.75rem 0 0', 
                        fontWeight: '700', 
                        background: 'linear-gradient(135deg, #b8b8ff 0%, #ff77c6 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontSize: 'clamp(1.1rem, 3vw, 1.3rem)'
                      }}>
                        € {artwork.price.toFixed(2)}
                      </p>
                    )}
                    {/* Warenkorb-Button kleiner und weniger präsent */}
                    {!isSold && artwork.inShop && artwork.price && artwork.price > 0 && (
                      <button
                        onClick={() => addToCart(artwork)}
                        style={{
                          width: '100%',
                          marginTop: '0.75rem',
                          padding: 'clamp(0.5rem, 1.5vw, 0.65rem) clamp(0.75rem, 2vw, 1rem)',
                          background: 'rgba(102, 126, 234, 0.2)',
                          color: '#b8b8ff',
                          border: '1px solid rgba(102, 126, 234, 0.3)',
                          borderRadius: '8px',
                          fontSize: 'clamp(0.8rem, 2.2vw, 0.9rem)',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(102, 126, 234, 0.3)'
                          e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.5)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)'
                          e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)'
                        }}
                      >
                        🛒 Zum Warenkorb
                      </button>
                    )}
                    {/* Info wenn Werk nicht im Shop verfügbar ist */}
                    {!isSold && !artwork.inShop && artwork.price && artwork.price > 0 && (
                      <p style={{
                        width: '100%',
                        marginTop: '1rem',
                        padding: 'clamp(0.75rem, 2vw, 1rem)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: 'rgba(255, 255, 255, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)',
                        textAlign: 'center',
                        fontStyle: 'italic'
                      }}>
                        Nur Ausstellung
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })()}
        </main>
      </div>

      {/* Bildschirmfüllende Lightbox für Bilder */}
      {lightboxImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.95)',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setLightboxImage(null)
              setImageZoom(1)
              setImagePosition({ x: 0, y: 0 })
            }
          }}
          onWheel={(e) => {
            e.preventDefault()
            const delta = e.deltaY > 0 ? -0.1 : 0.1
            setImageZoom(Math.max(0.5, Math.min(5, imageZoom + delta)))
          }}
          onMouseDown={(e) => {
            if (imageZoom > 1) {
              setIsDragging(true)
              setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y })
            }
          }}
          onMouseMove={(e) => {
            if (isDragging && imageZoom > 1) {
              setImagePosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
              })
            }
          }}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
        >
          {/* Header mit Titel, Like, Kaufen und Schließen */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            padding: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
            zIndex: 1,
            gap: '1rem'
          }}>
            <h3 style={{
              color: '#ffffff',
              margin: 0,
              fontSize: 'clamp(1rem, 3vw, 1.5rem)',
              fontWeight: '600',
              flex: 1
            }}>
              {lightboxImage.title}
            </h3>
            
            {/* Like Button */}
            {lightboxImage.artwork && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleLike(lightboxImage.artwork.number || lightboxImage.artwork.id)
                }}
                style={{
                  background: likedArtworks.has(lightboxImage.artwork.number || lightboxImage.artwork.id)
                    ? 'rgba(255, 87, 108, 0.3)'
                    : 'rgba(255, 255, 255, 0.2)',
                  border: likedArtworks.has(lightboxImage.artwork.number || lightboxImage.artwork.id)
                    ? '1px solid rgba(255, 87, 108, 0.5)'
                    : '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#ffffff',
                  fontSize: '1.5rem',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 87, 108, 0.4)'
                  e.currentTarget.style.transform = 'scale(1.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = likedArtworks.has(lightboxImage.artwork.number || lightboxImage.artwork.id)
                    ? 'rgba(255, 87, 108, 0.3)'
                    : 'rgba(255, 255, 255, 0.2)'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                {likedArtworks.has(lightboxImage.artwork.number || lightboxImage.artwork.id) ? '❤️' : '🤍'}
              </button>
            )}

            {/* Möchte ich kaufen Button */}
            {lightboxImage.artwork && lightboxImage.artwork.inShop && lightboxImage.artwork.price && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  addToCart(lightboxImage.artwork)
                  navigate(PROJECT_ROUTES['k2-galerie'].shop)
                  setLightboxImage(null)
                  setImageZoom(1)
                  setImagePosition({ x: 0, y: 0 })
                }}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                  padding: 'clamp(0.5rem, 1.5vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: '600',
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
                🛒 Möchte ich kaufen
              </button>
            )}

            <button
              onClick={() => {
                setLightboxImage(null)
                setImageZoom(1)
                setImagePosition({ x: 0, y: 0 })
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: '#ffffff',
                fontSize: '2rem',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
                e.currentTarget.style.transform = 'rotate(90deg)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                e.currentTarget.style.transform = 'rotate(0deg)'
              }}
            >
              ×
            </button>
          </div>

          {/* Zoom Controls */}
          <div style={{
            position: 'absolute',
            bottom: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.7)',
            padding: '0.75rem 1.5rem',
            borderRadius: '12px',
            zIndex: 1
          }}>
            <button
              onClick={() => setImageZoom(Math.max(0.5, imageZoom - 0.25))}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: '#ffffff',
                fontSize: '1.5rem',
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              −
            </button>
            <span style={{
              color: '#ffffff',
              fontSize: '1rem',
              minWidth: '60px',
              textAlign: 'center',
              fontWeight: '600'
            }}>
              {Math.round(imageZoom * 100)}%
            </span>
            <button
              onClick={() => setImageZoom(Math.min(5, imageZoom + 0.25))}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: '#ffffff',
                fontSize: '1.5rem',
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              +
            </button>
            <button
              onClick={() => {
                setImageZoom(1)
                setImagePosition({ x: 0, y: 0 })
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.9rem',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                marginLeft: '1rem'
              }}
            >
              Reset
            </button>
          </div>

          {/* Bild Container */}
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              cursor: imageZoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
            }}
          >
            <img
              src={lightboxImage.src}
              alt={lightboxImage.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                transform: `scale(${imageZoom}) translate(${imagePosition.x / imageZoom}px, ${imagePosition.y / imageZoom}px)`,
                transition: isDragging ? 'none' : 'transform 0.1s ease',
                userSelect: 'none',
                ...({ WebkitUserDrag: 'none' } as any)
              } as React.CSSProperties}
              draggable={false}
            />
          </div>
        </div>
      )}
    </div>
    </>
  )
}

export default GalerieVorschauPage
