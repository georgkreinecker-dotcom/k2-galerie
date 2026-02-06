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

  // Werke aus localStorage laden mit Auto-Refresh
  useEffect(() => {
    const loadData = () => {
      try {
        const stored = loadArtworks()
        if (Array.isArray(stored)) {
          const exhibitionArtworks = stored.filter((a: any) => a && a.inExhibition === true)
          setArtworks(exhibitionArtworks)
        } else {
          setArtworks([])
        }
      } catch (error) {
        console.error('Fehler beim Laden:', error)
        setArtworks([])
      }
    }
    
    loadData()
    
    // Auto-Refresh alle 3 Sekunden
    const interval = setInterval(loadData, 3000)
    
    window.addEventListener('artworks-updated', loadData)
    window.addEventListener('storage', loadData)
    window.addEventListener('focus', loadData)
    return () => {
      clearInterval(interval)
      window.removeEventListener('artworks-updated', loadData)
      window.removeEventListener('storage', loadData)
      window.removeEventListener('focus', loadData)
    }
  }, [])

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
    window.addEventListener('storage', updateCartCount)
    const interval = setInterval(updateCartCount, 1000)
    return () => {
      window.removeEventListener('storage', updateCartCount)
      clearInterval(interval)
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
      previewUrl: artwork.previewUrl
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
                    {(artwork.imageUrl || artwork.previewUrl) && (
                      <img 
                        src={artwork.imageUrl || artwork.previewUrl} 
                        alt={artwork.title || artwork.number}
                        style={{ 
                          width: '100%', 
                          height: 'clamp(150px, 40vw, 200px)', 
                          objectFit: 'cover', 
                          borderRadius: '8px', 
                          marginBottom: '0.5rem',
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
                          // Fallback falls Bild nicht geladen werden kann
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const parent = target.parentElement
                          if (parent) {
                            const placeholder = document.createElement('div')
                            placeholder.style.cssText = 'width: 100%; height: clamp(150px, 40vw, 200px); background: #e8e6e2; border-radius: 8px; margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: center; color: #999; font-size: clamp(0.8rem, 2.5vw, 0.9rem)'
                            placeholder.textContent = artwork.number
                            parent.insertBefore(placeholder, target)
                          }
                        }}
                      />
                    )}
                    {!artwork.imageUrl && !artwork.previewUrl && (
                      <div style={{ 
                        width: '100%', 
                        height: 'clamp(150px, 40vw, 200px)', 
                        background: '#e8e6e2', 
                        borderRadius: '8px', 
                        marginBottom: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#999',
                        fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)'
                      }}>
                        {artwork.number}
                      </div>
                    )}
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
                      fontSize: 'clamp(0.9rem, 2.5vw, 1rem)', 
                      color: 'rgba(255, 255, 255, 0.6)',
                      lineHeight: '1.4'
                    }}>
                      {artwork.category === 'malerei' ? 'Malerei' : artwork.category === 'keramik' ? 'Keramik' : artwork.category}
                      {artwork.artist && ` • ${artwork.artist}`}
                    </p>
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
                    {/* Nur anzeigen wenn Werk im Shop verfügbar ist */}
                    {!isSold && artwork.inShop && artwork.price && artwork.price > 0 && (
                      <button
                        onClick={() => addToCart(artwork)}
                        style={{
                          width: '100%',
                          marginTop: '1rem',
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
                        Zum Warenkorb
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
                maxWidth: '100%',
                maxHeight: '100%',
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
  )
}

export default GalerieVorschauPage
