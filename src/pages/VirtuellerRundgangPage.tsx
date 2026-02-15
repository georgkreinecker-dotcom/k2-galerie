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

const VirtuellerRundgangPage = () => {
  const navigate = useNavigate()
  const [artworks, setArtworks] = useState<any[]>([])
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

  // Zum Warenkorb hinzufügen
  const addToCart = (artwork: any) => {
    const priceVal = typeof artwork?.price === 'number' ? artwork.price : (parseFloat(String(artwork?.price ?? 0)) || 0)
    if (artwork.inShop === false || priceVal <= 0) {
      alert('Dieses Werk ist nicht im Online-Shop verfügbar oder hat keinen Preis.')
      return
    }

    try {
      const soldData = localStorage.getItem('k2-sold-artworks')
      if (soldData) {
        const soldArtworks = JSON.parse(soldData)
        if (Array.isArray(soldArtworks) && soldArtworks.some((a: any) => a && a.number === artwork.number)) {
          alert('Dieses Werk wurde bereits verkauft.')
          return
        }
      }
    } catch (error) {
      // Ignoriere Fehler
    }

    try {
      const cartData = localStorage.getItem('k2-cart')
      const cart = cartData ? JSON.parse(cartData) : []
      
      // Prüfe ob bereits im Warenkorb
      if (Array.isArray(cart) && cart.some((item: any) => item.number === artwork.number)) {
        alert('Dieses Werk ist bereits in deiner/Ihrer Auswahl.')
        return
      }

      cart.push({
        number: artwork.number,
        title: artwork.title,
        price: artwork.price,
        category: artwork.category,
        artist: artwork.artist,
        imageUrl: artwork.imageUrl || artwork.previewUrl
      })
      
      localStorage.setItem('k2-cart', JSON.stringify(cart))
      window.dispatchEvent(new CustomEvent('cart-updated'))
    } catch (error) {
      console.error('Fehler beim Hinzufügen zum Warenkorb:', error)
      alert('Fehler beim Hinzufügen zur Auswahl.')
    }
  }

  // Werke aus localStorage laden
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
    
    // KEIN Auto-Refresh mehr - verursacht Abstürze durch zu viele localStorage-Zugriffe
    // Stattdessen: Nur auf explizite Events reagieren
    
    // Event Listener mit Debouncing
    let updateTimeout: ReturnType<typeof setTimeout> | null = null
    const handleUpdate = () => {
      if (updateTimeout) {
        clearTimeout(updateTimeout)
      }
      updateTimeout = setTimeout(() => {
        try {
          loadData()
        } catch (error) {
          console.error('Fehler beim Update:', error)
        }
      }, 500)
    }
    
    window.addEventListener('artworks-updated', handleUpdate)
    window.addEventListener('storage', handleUpdate)
    window.addEventListener('focus', handleUpdate)
    
    return () => {
      if (updateTimeout) {
        clearTimeout(updateTimeout)
      }
      window.removeEventListener('artworks-updated', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
      window.removeEventListener('focus', handleUpdate)
    }
  }, [])

  return (
    <div style={{ 
      minHeight: '-webkit-fill-available',
      background: 'linear-gradient(135deg, var(--k2-bg-1) 0%, var(--k2-bg-2) 50%, var(--k2-bg-3) 100%)',
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
                Virtueller Rundgang
              </h1>
              <p style={{ 
                margin: '0.75rem 0 0', 
                color: 'rgba(255, 255, 255, 0.7)', 
                fontSize: 'clamp(1rem, 3vw, 1.2rem)',
                fontWeight: '300'
              }}>
                Erkunde die K2 Galerie auch wenn wir geschlossen haben
              </p>
            </div>
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
                fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
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
            borderRadius: '20px',
            padding: 'clamp(2rem, 5vw, 3rem)',
            marginBottom: 'clamp(3rem, 8vw, 4rem)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: 'clamp(3rem, 8vw, 5rem)',
              marginBottom: '1.5rem'
            }}>
              🏛️
            </div>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '1rem'
            }}>
              Willkommen zum virtuellen Rundgang
            </h2>
            <p style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: '1.7',
              maxWidth: '700px',
              margin: '0 auto'
            }}>
              Scanne den QR-Code an unseren Fenstern oder Türen, um die Galerie auch außerhalb der Öffnungszeiten zu erkunden. Entdecke unsere aktuellen Werke und lass dich von der Kunst inspirieren.
            </p>
          </div>

          {/* Werke Grid */}
          {artworks.length === 0 ? (
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
                Die Ausstellung wird bald eröffnet.
              </p>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(250px, 40vw, 350px), 1fr))', 
              gap: 'clamp(1.5rem, 4vw, 2rem)'
            }}>
              {artworks.map((artwork) => {
                if (!artwork) return null
                
                const imageSrc = artwork.imageUrl || artwork.previewUrl
                
                return (
                  <div key={artwork.number} style={{ 
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '20px', 
                    padding: 'clamp(1rem, 3vw, 1.5rem)', 
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                    position: 'relative',
                    width: '100%',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)'
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                  }}
                  >
                    {imageSrc ? (
                      <img 
                        src={imageSrc} 
                        alt={artwork.title || artwork.number}
                        style={{ 
                          width: '100%', 
                          height: 'clamp(250px, 40vw, 350px)', 
                          objectFit: 'cover', 
                          borderRadius: '12px', 
                          marginBottom: '1rem',
                          display: 'block',
                          cursor: 'pointer',
                          transition: 'transform 0.3s ease'
                        }}
                        loading="lazy"
                        onClick={() => {
                          setLightboxImage({
                            src: imageSrc,
                            title: artwork.title || artwork.number || '',
                            artwork: artwork
                          })
                          setImageZoom(1)
                          setImagePosition({ x: 0, y: 0 })
                        }}
                      />
                    ) : (
                      <div style={{ 
                        width: '100%', 
                        height: 'clamp(250px, 40vw, 350px)', 
                        background: 'rgba(255, 255, 255, 0.05)', 
                        borderRadius: '12px', 
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'rgba(255, 255, 255, 0.3)',
                        fontSize: 'clamp(3rem, 8vw, 5rem)'
                      }}>
                        🖼️
                      </div>
                    )}
                    <h4 style={{ 
                      margin: '0 0 0.5rem', 
                      fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
                      lineHeight: '1.3',
                      color: '#ffffff',
                      fontWeight: '600'
                    }}>
                      {artwork.title || artwork.number}
                    </h4>
                    <p style={{ 
                      margin: '0.25rem 0', 
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)', 
                      color: 'rgba(255, 255, 255, 0.6)',
                      lineHeight: '1.4'
                    }}>
                      {artwork.category === 'malerei' ? 'Bilder' : artwork.category === 'keramik' ? 'Keramik' : artwork.category}
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
                  </div>
                )
              })}
            </div>
          )}
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

            {/* Möchte ich kaufen Button – alle mit Preis, sofern nicht explizit "nur Ausstellung" */}
            {lightboxImage.artwork && lightboxImage.artwork.inShop !== false && (parseFloat(String(lightboxImage.artwork.price)) || 0) > 0 && (
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

export default VirtuellerRundgangPage
