import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'
import '../App.css'

const GaleriePage = ({ scrollToSection }: { scrollToSection?: string }) => {
  const navigate = useNavigate()
  const willkommenRef = React.useRef<HTMLDivElement>(null)
  const galerieRef = React.useRef<HTMLDivElement>(null)
  const kunstschaffendeRef = React.useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [adminPasswordInput, setAdminPasswordInput] = useState('')
  // adminPassword wird nur für Initialisierung verwendet, nicht für Login-Validierung
  const [, setAdminPassword] = useState('')

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Auto-Admin für localhost
  useEffect(() => {
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname === '192.168.0.31' ||
                       window.location.hostname === '192.168.0.27'
    
    if (isLocalhost && window.location.pathname === '/') {
      // Automatisch zu Admin navigieren auf localhost
      navigate('/admin')
    }
  }, [navigate])
  
  // Stammdaten laden
  const [martinaData, setMartinaData] = React.useState({
    name: 'Martina Kreinecker',
    email: '',
    phone: ''
  })
  const [georgData, setGeorgData] = React.useState({
    name: 'Georg Kreinecker',
    email: '',
    phone: ''
  })
  const [galleryData, setGalleryData] = React.useState({
    address: '',
    phone: '',
    email: '',
    website: '',
    adminPassword: 'k2Galerie2026'
  })
  
  React.useEffect(() => {
    // Martina Daten laden
    try {
      const martinaStored = localStorage.getItem('k2-stammdaten-martina')
      if (martinaStored) {
        const data = JSON.parse(martinaStored)
        setMartinaData({
          name: data.name || 'Martina Kreinecker',
          email: data.email || '',
          phone: data.phone || ''
        })
      }
    } catch (error) {
      // Ignoriere Fehler
    }
    
    // Georg Daten laden
    try {
      const georgStored = localStorage.getItem('k2-stammdaten-georg')
      if (georgStored) {
        const data = JSON.parse(georgStored)
        setGeorgData({
          name: data.name || 'Georg Kreinecker',
          email: data.email || '',
          phone: data.phone || ''
        })
      }
    } catch (error) {
      // Ignoriere Fehler
    }
    
    // Galerie Daten laden
    try {
      const galleryStored = localStorage.getItem('k2-stammdaten-galerie')
      if (galleryStored) {
        const data = JSON.parse(galleryStored)
        setGalleryData({
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          website: data.website || 'www.k2-galerie.at',
          adminPassword: data.adminPassword || 'k2Galerie2026'
        })
        setAdminPassword(data.adminPassword || 'k2Galerie2026')
      } else {
        // Setze Standard-Passwort wenn noch keine Daten vorhanden
        const defaultData = {
          address: '',
          phone: '',
          email: '',
          website: 'www.k2-galerie.at',
          adminPassword: 'k2Galerie2026'
        }
        localStorage.setItem('k2-stammdaten-galerie', JSON.stringify(defaultData))
        setGalleryData(defaultData)
        setAdminPassword('k2Galerie2026')
      }
    } catch (error) {
      // Ignoriere Fehler
    }
    
    // Event Listener für Updates
    const handleStorageUpdate = () => {
      try {
        const martinaStored = localStorage.getItem('k2-stammdaten-martina')
        if (martinaStored) {
          const data = JSON.parse(martinaStored)
          setMartinaData({
            name: data.name || 'Martina Kreinecker',
            email: data.email || '',
            phone: data.phone || ''
          })
        }
      } catch (error) {}
      
      try {
        const georgStored = localStorage.getItem('k2-stammdaten-georg')
        if (georgStored) {
          const data = JSON.parse(georgStored)
          setGeorgData({
            name: data.name || 'Georg Kreinecker',
            email: data.email || '',
            phone: data.phone || ''
          })
        }
      } catch (error) {}
      
      try {
        const galleryStored = localStorage.getItem('k2-stammdaten-galerie')
        if (galleryStored) {
          const data = JSON.parse(galleryStored)
          setGalleryData({
            address: data.address || '',
            phone: data.phone || '',
            email: data.email || '',
            website: data.website || 'www.k2-galerie.at',
            adminPassword: data.adminPassword || 'k2Galerie2026'
          })
          setAdminPassword(data.adminPassword || 'k2Galerie2026')
        }
      } catch (error) {}
    }
    
    window.addEventListener('storage', handleStorageUpdate)
    // Auch auf Custom Events hören (für Updates innerhalb desselben Tabs)
    window.addEventListener('stammdaten-updated', handleStorageUpdate)
    return () => {
      window.removeEventListener('storage', handleStorageUpdate)
      window.removeEventListener('stammdaten-updated', handleStorageUpdate)
    }
  }, [])

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

  // Admin-Login Funktion
  const handleAdminLogin = () => {
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
      navigate('/admin')
      setShowAdminModal(false)
      setAdminPasswordInput('')
    } else {
      alert('❌ Falsches Passwort')
      setAdminPasswordInput('')
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
      
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Admin Button - unauffällig oben rechts */}
        <button
          onClick={() => setShowAdminModal(true)}
          style={{
            position: 'fixed',
            top: 'clamp(1rem, 2vw, 1.5rem)',
            right: 'clamp(1rem, 2vw, 1.5rem)',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'rgba(255, 255, 255, 0.5)',
            padding: 'clamp(0.5rem, 1.5vw, 0.75rem) clamp(0.75rem, 2vw, 1rem)',
            borderRadius: '8px',
            fontSize: 'clamp(0.7rem, 1.8vw, 0.85rem)',
            cursor: 'pointer',
            zIndex: 1000,
            transition: 'all 0.3s ease',
            opacity: 0.6
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1'
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.6'
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
          }}
        >
          ⚙️ Admin
        </button>

        {/* Admin Login Modal */}
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
                background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
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
                  marginBottom: '1.5rem',
                  boxSizing: 'border-box'
                }}
                autoFocus
              />
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
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
              background: 'linear-gradient(135deg, #ffffff 0%, #b8b8ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.02em',
              lineHeight: '1.1'
            }}>
              K2 Galerie
            </h1>
            <p style={{ 
              margin: '0.75rem 0 0', 
              color: 'rgba(255, 255, 255, 0.7)', 
              fontSize: 'clamp(1rem, 3vw, 1.25rem)',
              fontWeight: '300',
              letterSpacing: '0.05em'
            }}>
              Kunst & Keramik
            </p>
          </div>

          {/* Hero Content */}
          <section ref={willkommenRef} id="willkommen" style={{ 
            marginBottom: 'clamp(4rem, 10vw, 6rem)',
            maxWidth: '800px'
          }}>
            <h2 style={{ 
              fontSize: 'clamp(2rem, 6vw, 3.5rem)', 
              marginBottom: '1.5rem',
              fontWeight: '700',
              lineHeight: '1.2',
              color: '#ffffff',
              letterSpacing: '-0.02em'
            }}>
              Willkommen bei K2 –<br />
              <span style={{
                background: 'linear-gradient(135deg, #b8b8ff 0%, #ff77c6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Kunst & Keramik
              </span>
            </h2>
            <p style={{ 
              fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', 
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: '1.6',
              fontWeight: '300',
              maxWidth: '600px'
            }}>
              Ein Neuanfang mit Leidenschaft. Entdecke die Verbindung von Malerei und Keramik in einem Raum, wo Kunst zum Leben erwacht.
            </p>
          </section>
        </header>

        <main style={{
          padding: '0 clamp(1.5rem, 4vw, 3rem)',
          paddingBottom: 'clamp(4rem, 10vw, 6rem)',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>

          {/* Kunstschaffende Section */}
          <section ref={kunstschaffendeRef} id="kunstschaffende" style={{ 
            marginTop: 'clamp(3rem, 8vw, 5rem)'
          }}>
            <h3 style={{ 
              fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', 
              marginBottom: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: '700',
              color: '#ffffff',
              textAlign: 'center',
              letterSpacing: '-0.02em'
            }}>
              Die Kunstschaffenden
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(280px, 40vw, 400px), 1fr))',
              gap: 'clamp(1.5rem, 4vw, 2.5rem)',
              marginBottom: 'clamp(3rem, 8vw, 4rem)'
            }}>
              {/* Martina */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: 'clamp(2rem, 5vw, 3rem)',
                textAlign: 'center',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
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
                <div style={{
                  width: 'clamp(80px, 12vw, 100px)',
                  height: 'clamp(80px, 12vw, 100px)',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#ffffff',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 'clamp(2rem, 5vw, 2.5rem)',
                  fontWeight: '700',
                  margin: '0 auto clamp(1.5rem, 4vw, 2rem)',
                  boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)'
                }}>
                  M
                </div>
                <h4 style={{
                  margin: '0 0 0.75rem',
                  fontSize: 'clamp(1.25rem, 3.5vw, 1.75rem)',
                  color: '#ffffff',
                  fontWeight: '600'
                }}>
                  Martina Kreinecker
                </h4>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontWeight: '500',
                  marginBottom: '1rem',
                  fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}>
                  Malerei
                </p>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                  margin: 0,
                  lineHeight: '1.7'
                }}>
                  Martina bringt mit ihren Gemälden eine lebendige Vielfalt an Farben und Ausdruckskraft auf die Leinwand. Ihre Werke spiegeln Jahre des Lernens, Experimentierens und der Leidenschaft für die Malerei wider.
                </p>
              </div>
              
              {/* Georg */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: 'clamp(2rem, 5vw, 3rem)',
                textAlign: 'center',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
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
                <div style={{
                  width: 'clamp(80px, 12vw, 100px)',
                  height: 'clamp(80px, 12vw, 100px)',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: '#ffffff',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 'clamp(2rem, 5vw, 2.5rem)',
                  fontWeight: '700',
                  margin: '0 auto clamp(1.5rem, 4vw, 2rem)',
                  boxShadow: '0 10px 30px rgba(245, 87, 108, 0.4)'
                }}>
                  G
                </div>
                <h4 style={{
                  margin: '0 0 0.75rem',
                  fontSize: 'clamp(1.25rem, 3.5vw, 1.75rem)',
                  color: '#ffffff',
                  fontWeight: '600'
                }}>
                  Georg Kreinecker
                </h4>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontWeight: '500',
                  marginBottom: '1rem',
                  fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}>
                  Keramik
                </p>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                  margin: 0,
                  lineHeight: '1.7'
                }}>
                  Georg verbindet in seiner Keramikarbeit technisches Können mit kreativer Gestaltung. Seine Arbeiten sind geprägt von Präzision und einer Liebe zum Detail, das Ergebnis von langjähriger Erfahrung.
                </p>
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
              Gemeinsam eröffnen Martina und Georg nach über 20 Jahren kreativer Tätigkeit die K2 Galerie – ein Raum, wo Malerei und Keramik verschmelzen und Kunst zum Leben erwacht.
            </p>

            {/* Virtueller Rundgang & Galerie Vorschau */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(280px, 40vw, 400px), 1fr))',
              gap: 'clamp(1.5rem, 4vw, 2rem)',
              marginBottom: 'clamp(3rem, 8vw, 5rem)'
            }}>
              {/* Virtueller Rundgang */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: 'clamp(1.5rem, 4vw, 2rem)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {/* Foto mit QR-Code Overlay */}
                <div style={{
                  width: '100%',
                  aspectRatio: '16/9',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  marginBottom: 'clamp(1rem, 3vw, 1.5rem)',
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  position: 'relative'
                }}>
                  <div style={{
                    fontSize: 'clamp(3rem, 8vw, 5rem)',
                    opacity: 0.3
                  }}>
                    📸
                  </div>
                </div>
                
                <h3 style={{
                  fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
                  fontWeight: '600',
                  color: '#ffffff',
                  marginBottom: 'clamp(0.5rem, 1.5vw, 0.75rem)'
                }}>
                  Virtueller Rundgang
                </h3>
                <p style={{
                  fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginBottom: 'clamp(1rem, 3vw, 1.5rem)',
                  lineHeight: '1.5'
                }}>
                  Erkunde die Galerie auch wenn wir geschlossen haben
                </p>
                <Link
                  to={PROJECT_ROUTES['k2-galerie'].virtuellerRundgang}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                    fontWeight: '500',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  Rundgang starten →
                </Link>
              </div>

              {/* Galerie Vorschau */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: 'clamp(1.5rem, 4vw, 2rem)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {/* Foto mit QR-Code Overlay */}
                <div style={{
                  width: '100%',
                  aspectRatio: '16/9',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  marginBottom: 'clamp(1rem, 3vw, 1.5rem)',
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  position: 'relative'
                }}>
                  <div style={{
                    fontSize: 'clamp(3rem, 8vw, 5rem)',
                    opacity: 0.3
                  }}>
                    🖼️
                  </div>
                </div>
                
                <h3 style={{
                  fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
                  fontWeight: '600',
                  color: '#ffffff',
                  marginBottom: 'clamp(0.5rem, 1.5vw, 0.75rem)'
                }}>
                  Galerie-Vorschau
                </h3>
                <p style={{
                  fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginBottom: 'clamp(1rem, 3vw, 1.5rem)',
                  lineHeight: '1.5'
                }}>
                  Entdecke alle Werke unserer Ausstellung
                </p>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'clamp(0.75rem, 2vw, 1rem)'
                }}>
                  <Link 
                    to={PROJECT_ROUTES['k2-galerie'].galerieVorschau}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#ffffff',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
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
                    Alle Werke anzeigen →
                  </Link>
                  <Link 
                    to={PROJECT_ROUTES['k2-galerie'].shop}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#ffffff',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                      fontWeight: '500',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    🛒 Zum Shop →
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Impressum */}
          <section style={{ 
            marginTop: 'clamp(2rem, 4vw, 2.5rem)',
            paddingTop: 'clamp(1rem, 2vw, 1.5rem)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{
              maxWidth: '700px',
              margin: '0 auto',
              fontSize: 'clamp(0.75rem, 1.8vw, 0.85rem)',
              color: 'rgba(255, 255, 255, 0.7)',
              lineHeight: '1.5',
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: 'clamp(1.5rem, 3vw, 2rem)',
              alignItems: isMobile ? 'center' : 'start'
            }}>
              {/* Linke Spalte: Kontaktdaten */}
              <div>
                <p style={{ margin: '0 0 0.5rem', fontWeight: '600', color: '#ffffff' }}>
                  K2 Galerie | Martina & Georg Kreinecker
                </p>
                {galleryData.address && <p style={{ margin: '0 0 0.25rem' }}>{galleryData.address}</p>}
                
                {/* Galerie Kontakt */}
                {(galleryData.phone || galleryData.email) && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <span style={{ fontWeight: '600', color: '#ffffff', marginRight: '0.5rem' }}>Galerie:</span>
                    {galleryData.phone && <span style={{ marginRight: '0.75rem' }}>{galleryData.phone}</span>}
                    {galleryData.email && (
                      <a href={`mailto:${galleryData.email}`} style={{ color: '#b8b8ff', textDecoration: 'none', marginRight: '0.75rem' }}>
                        {galleryData.email}
                      </a>
                    )}
                  </div>
                )}
                
                {/* Martina Kontakt */}
                {(martinaData.phone || martinaData.email) && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <span style={{ fontWeight: '600', color: '#ffffff', marginRight: '0.5rem' }}>Martina:</span>
                    {martinaData.phone && <span style={{ marginRight: '0.75rem' }}>{martinaData.phone}</span>}
                    {martinaData.email && (
                      <a href={`mailto:${martinaData.email}`} style={{ color: '#b8b8ff', textDecoration: 'none', marginRight: '0.75rem' }}>
                        {martinaData.email}
                      </a>
                    )}
                  </div>
                )}
                
                {/* Georg Kontakt */}
                {(georgData.phone || georgData.email) && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <span style={{ fontWeight: '600', color: '#ffffff', marginRight: '0.5rem' }}>Georg:</span>
                    {georgData.phone && <span style={{ marginRight: '0.75rem' }}>{georgData.phone}</span>}
                    {georgData.email && (
                      <a href={`mailto:${georgData.email}`} style={{ color: '#b8b8ff', textDecoration: 'none', marginRight: '0.75rem' }}>
                        {georgData.email}
                      </a>
                    )}
                  </div>
                )}
                
                <p style={{ margin: '0.75rem 0 0.5rem', fontSize: 'clamp(0.7rem, 1.6vw, 0.8rem)' }}>
                  Gewerbe: freie Kunstschaffende
                </p>
                
                <p style={{ margin: '1rem 0 0', fontSize: 'clamp(0.7rem, 1.6vw, 0.8rem)', opacity: 0.6 }}>
                  Haftungsausschluss: Die Inhalte wurden mit Sorgfalt erstellt. Für Richtigkeit, Vollständigkeit und Aktualität kann keine Gewähr übernommen werden.
                </p>
              </div>
              
              {/* Rechte Spalte: QR-Code */}
              <div style={{
                textAlign: 'center',
                flexShrink: 0,
                width: isMobile ? '100%' : 'auto',
                marginTop: isMobile ? '1rem' : '0'
              }}>
                <p style={{ 
                  margin: '0 0 0.5rem', 
                  fontSize: 'clamp(0.7rem, 1.6vw, 0.8rem)',
                  color: 'rgba(255, 255, 255, 0.7)'
                }}>
                  QR-Code
                </p>
                <div style={{
                  background: '#ffffff',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  display: 'inline-block',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                }}>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`${window.location.origin}${PROJECT_ROUTES['k2-galerie'].galerie}`)}`}
                    alt="QR-Code für Homepage"
                    style={{
                      width: '120px',
                      height: '120px',
                      display: 'block'
                    }}
                  />
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default GaleriePage
