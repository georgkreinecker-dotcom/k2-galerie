import React, { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'
import '../App.css'

const GaleriePage = ({ scrollToSection }: { scrollToSection?: string }) => {
  const navigate = useNavigate()
  const willkommenRef = React.useRef<HTMLDivElement>(null)
  const galerieRef = React.useRef<HTMLDivElement>(null)
  const kunstschaffendeRef = React.useRef<HTMLDivElement>(null)
  const [mobileUrl, setMobileUrl] = React.useState<string>('')
  // Mobile-Erkennung: Prüfe sowohl Bildschirmbreite als auch User-Agent
  const [isMobile, setIsMobile] = useState(() => {
    const width = window.innerWidth <= 768
    const userAgent = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    return width || userAgent
  })
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [adminPasswordInput, setAdminPasswordInput] = useState('')
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
    internetadresse: '', // Für QR-Code
    adminPassword: 'k2Galerie2026',
    welcomeImage: '',
    virtualTourImage: ''
  })
  
  // Mobile-URL für QR-Code ermitteln (IP statt localhost) - mit useMemo optimiert
  const mobileUrlMemo = useMemo(() => {
    try {
      const hostname = window.location.hostname
      const port = window.location.port || '5177'
      const protocol = window.location.protocol
      
      // WICHTIG: Wenn localhost, versuche IP-Adresse zu ermitteln
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // Für Entwicklung: Zeige Hinweis dass IP-Adresse benötigt wird
        // Die echte IP muss manuell eingegeben werden oder über MobileConnectPage
        return '' // Leer lassen, damit der Hinweis angezeigt wird
      }
      
      // Wenn bereits IP-Adresse vorhanden, verwende diese
      return `${protocol}//${hostname}:${port}${PROJECT_ROUTES['k2-galerie'].galerie}`
    } catch {
      return ''
    }
  }, [])
  
  React.useEffect(() => {
    setMobileUrl(mobileUrlMemo)
  }, [mobileUrlMemo])

  // Aktualisieren-Funktion für Mobile-Version - lädt neue Daten ohne Reload
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  
  const handleRefresh = async () => {
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
      
      // KRITISCH: Maximale Cache-Busting URL
      const url = `/gallery-data.json?v=${timestamp}&t=${timestamp}&r=${random}&sid=${sessionId}&ver=${newVersion}&bid=${buildId}&_=${Date.now()}&nocache=${Math.random()}&force=${Date.now()}&refresh=${Math.random()}`
      
      console.log('🔄 Lade neue Daten mit maximalem Cache-Busting...', {
        url: url.substring(0, 100) + '...',
        version: newVersion,
        timestamp: new Date(timestamp).toISOString()
      })
      
      const response = await fetch(url, { 
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
      })
      
      if (response.ok) {
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
            phone: data.martina.phone || ''
          })
        }
        if (data.georg) {
          setGeorgData({
            name: data.georg.name || 'Georg Kreinecker',
            email: data.georg.email || '',
            phone: data.georg.phone || ''
          })
        }
        if (data.gallery) {
          setGalleryData({
            address: data.gallery.address || '',
            phone: data.gallery.phone || '',
            email: data.gallery.email || '',
            website: data.gallery.website || 'www.k2-galerie.at',
            internetadresse: data.gallery.internetadresse || data.gallery.website || '',
            adminPassword: data.gallery.adminPassword || 'k2Galerie2026',
            welcomeImage: data.gallery.welcomeImage || '',
            virtualTourImage: data.gallery.virtualTourImage || ''
          })
          setAdminPassword(data.gallery.adminPassword || 'k2Galerie2026')
        }
        
        // Lade auch Werke wenn vorhanden - KRITISCH für Mobile
        if (data.artworks && Array.isArray(data.artworks)) {
          try {
            localStorage.setItem('k2-artworks', JSON.stringify(data.artworks))
            console.log('✅ Werke aktualisiert:', data.artworks.length, 'Werke')
            // Trigger Event für andere Komponenten
            window.dispatchEvent(new CustomEvent('artworks-updated', { detail: { count: data.artworks.length } }))
          } catch (e) {
            console.warn('⚠️ Werke zu groß für localStorage:', e)
          }
        } else {
          console.warn('⚠️ Keine Werke in gallery-data.json gefunden')
        }
        
        // Lade auch Events wenn vorhanden
        if (data.events && Array.isArray(data.events)) {
          try {
            localStorage.setItem('k2-events', JSON.stringify(data.events))
            console.log('✅ Events aktualisiert:', data.events.length)
          } catch (e) {
            console.warn('⚠️ Events zu groß für localStorage')
          }
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
        console.log('✅ Daten aktualisiert - verwende manuellen Refresh-Button falls nötig')
      } else {
        alert(`⚠️ Keine neuen Daten gefunden (HTTP ${response.status}).\n\nBitte:\n1. Warte 2-3 Minuten nach Veröffentlichung\n2. QR-Code NEU scannen\n3. Oder: Seite komplett neu laden`)
      }
      } catch (error) {
        console.error('❌ Fehler beim Aktualisieren:', error)
        alert('⚠️ Fehler beim Aktualisieren.\n\nBitte QR-Code neu scannen oder Seite neu laden.')
        setIsRefreshing(false)
      } finally {
        setIsRefreshing(false)
        // Trigger Event für GalerieVorschauPage
        window.dispatchEvent(new CustomEvent('artworks-updated'))
      }
    }
  
  React.useEffect(() => {
    // Lade Daten: Zuerst aus JSON-Datei (für Mobile-Version auf Vercel), dann localStorage (für lokale Entwicklung)
    let isMounted = true
    let timeoutId: NodeJS.Timeout | null = null
    let controller: AbortController | null = null
    
    const loadData = async () => {
      if (!isMounted) return
      
      let data: any = null
      
      // Versuche zuerst JSON-Datei zu laden (für Mobile-Version auf Vercel)
      // KRITISCH: Robusteres Error-Handling um Crashes zu vermeiden
      try {
        // Einfacheres Cache-Busting - nicht zu aggressiv
        const timestamp = Date.now()
        const url = `/gallery-data.json?v=${timestamp}&t=${timestamp}&_=${Math.random()}`
        
        // WICHTIG: Timeout hinzufügen um Hänger zu vermeiden
        controller = new AbortController()
        timeoutId = setTimeout(() => {
          if (controller) controller.abort()
        }, 8000) // 8 Sekunden Timeout (kürzer = weniger Crash-Risiko)
        
        const response = await fetch(url, { 
          cache: 'no-store',
          method: 'GET',
          signal: controller.signal, // WICHTIG: Signal für Timeout
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        })
        
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
        
        if (response.ok) {
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
          
          // Lade auch Werke wenn vorhanden - KRITISCH für Mobile
          if (data.artworks && Array.isArray(data.artworks)) {
            try {
              localStorage.setItem('k2-artworks', JSON.stringify(data.artworks))
              console.log('✅ Werke in localStorage gespeichert:', data.artworks.length, 'Werke')
              // Trigger Event für andere Komponenten (z.B. GalerieVorschauPage)
              window.dispatchEvent(new CustomEvent('artworks-updated', { detail: { count: data.artworks.length } }))
            } catch (e) {
              console.warn('⚠️ Werke zu groß für localStorage:', e)
            }
          } else {
            console.warn('⚠️ Keine Werke in gallery-data.json gefunden')
          }
          
          // DEAKTIVIERT: Automatisches Reload verursacht Crashes
          // Stattdessen: Manueller "🔄 Aktualisieren" Button auf Mobile verwenden
          // Keine automatischen Reloads mehr!
        } else {
          // Nicht kritisch - verwende localStorage Daten
          console.log('ℹ️ gallery-data.json nicht verfügbar (HTTP ' + response.status + ') - verwende localStorage')
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
      
      // Falls keine JSON-Datei, lade aus localStorage
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
      
      // Setze Daten
      if (data) {
        // Martina Daten
        if (data.martina) {
          setMartinaData({
            name: data.martina.name || 'Martina Kreinecker',
            email: data.martina.email || '',
            phone: data.martina.phone || ''
          })
        }
        
        // Georg Daten
        if (data.georg) {
          setGeorgData({
            name: data.georg.name || 'Georg Kreinecker',
            email: data.georg.email || '',
            phone: data.georg.phone || ''
          })
        }
        
        // Galerie Daten
        if (data.gallery) {
          setGalleryData({
            address: data.gallery.address || '',
            phone: data.gallery.phone || '',
            email: data.gallery.email || '',
            website: data.gallery.website || 'www.k2-galerie.at',
            internetadresse: data.gallery.internetadresse || data.gallery.website || '',
            adminPassword: data.gallery.adminPassword || 'k2Galerie2026',
            welcomeImage: data.gallery.welcomeImage || '',
            virtualTourImage: data.gallery.virtualTourImage || ''
          })
          setAdminPassword(data.gallery.adminPassword || 'k2Galerie2026')
        }
      } else {
        // Fallback: Standard-Daten
        const defaultData = {
          address: '',
          phone: '',
          email: '',
          website: 'www.k2-galerie.at',
          internetadresse: '',
          adminPassword: 'k2Galerie2026',
          welcomeImage: '',
          virtualTourImage: ''
        }
        setGalleryData(defaultData)
        setAdminPassword('k2Galerie2026')
      }
    }
    
    loadData()
    
    // Cleanup beim Unmount
    return () => {
      isMounted = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      if (controller) {
        controller.abort()
      }
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
            internetadresse: data.internetadresse || data.website || '', // Für QR-Code
            adminPassword: data.adminPassword || 'k2Galerie2026',
            welcomeImage: data.welcomeImage || '',
            virtualTourImage: data.virtualTourImage || ''
          })
          setAdminPassword(data.adminPassword || 'k2Galerie2026')
        }
      } catch (error) {}
    }
    
    // DEAKTIVIERT: Verursacht Render-Loops und Crashes (Code 5)
    // Diese Event-Listener triggern State-Updates die wieder Events dispatchen → Endlos-Loop
    // window.addEventListener('storage', handleStorageUpdate)
    // window.addEventListener('stammdaten-updated', handleStorageUpdate)
    
    // Cleanup: Setze isMounted auf false beim Unmount
    return () => {
      isMounted = false
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
      navigate('/admin')
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
      navigate('/admin')
      setShowAdminModal(false)
      setAdminPasswordInput('')
    } else {
      alert('❌ Falsches Passwort')
      setAdminPasswordInput('')
    }
  }

  // Admin-Button Klick Handler
  const handleAdminButtonClick = () => {
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname === '192.168.0.31' ||
                       window.location.hostname === '192.168.0.27'
    
    if (isLocalhost) {
      // Auf localhost direkt zum Admin navigieren
      navigate('/admin')
    } else {
      // Auf Produktion Modal öffnen
      setShowAdminModal(true)
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
          onClick={handleAdminButtonClick}
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
        
        {/* Aktualisieren Button - für Mobile-Version - PROMINENTER & FUNKTIONIERT */}
        {isMobile && (
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('🔄 Aktualisieren-Button geklickt')
              handleRefresh()
            }}
            disabled={isRefreshing}
            style={{
              position: 'fixed',
              top: 'clamp(1rem, 2vw, 1.5rem)',
              left: 'clamp(1rem, 3vw, 1.5rem)', // Links statt rechts, damit Admin-Button nicht überdeckt wird
              zIndex: 10001, // Höher als Admin-Button (1000)
              background: isRefreshing 
                ? 'rgba(95, 251, 241, 0.5)' 
                : 'linear-gradient(120deg, #5ffbf1, #33a1ff)',
              color: '#0a0e27',
              border: '2px solid rgba(95, 251, 241, 0.5)',
              borderRadius: '12px',
              padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.25rem, 4vw, 1.75rem)',
              fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
              fontWeight: '700',
              cursor: isRefreshing ? 'wait' : 'pointer',
              opacity: isRefreshing ? 0.7 : 1,
              boxShadow: '0 6px 20px rgba(95, 251, 241, 0.5)',
              transition: 'all 0.2s ease',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'rgba(95, 251, 241, 0.3)',
              minWidth: '120px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
            title="Daten vom Server neu laden"
            onTouchStart={(e) => {
              if (!isRefreshing) {
                e.currentTarget.style.transform = 'scale(0.95)'
                e.currentTarget.style.opacity = '0.9'
              }
            }}
            onTouchEnd={(e) => {
              if (!isRefreshing) {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.opacity = '1'
              }
            }}
          >
            <span style={{ fontSize: '1.2em' }}>{isRefreshing ? '⏳' : '🔄'}</span>
            <span>{isRefreshing ? 'Lädt...' : 'Aktualisieren'}</span>
          </button>
        )}

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
            maxWidth: '800px',
            width: '100%',
            overflow: 'hidden'
          }}>
            {galleryData.welcomeImage && (
              <div style={{
                width: '100%',
                maxWidth: '100%',
                marginBottom: 'clamp(2rem, 5vw, 3rem)',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxSizing: 'border-box'
              }}>
                <img 
                  src={galleryData.welcomeImage} 
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
            )}
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
              maxWidth: '600px',
              marginBottom: 'clamp(2rem, 5vw, 3rem)'
            }}>
              Ein Neuanfang mit Leidenschaft. Entdecke die Verbindung von Malerei und Keramik in einem Raum, wo Kunst zum Leben erwacht.
            </p>
            
            {/* QR-Code auf Willkommensseite - EINMALIG */}
            {(() => {
              try {
                const hostname = window.location.hostname || ''
                const isVercel = hostname.includes('vercel.app')
                
                // WICHTIG: Immer die korrekte Galerie-Route verwenden
                let finalUrl = ''
                
                if (isVercel) {
                  // Auf Vercel: Verwende aktuelle Domain + korrekte Route
                  finalUrl = `${window.location.protocol}//${hostname}${PROJECT_ROUTES['k2-galerie'].galerie}`
                } else if (mobileUrl && !mobileUrl.includes('localhost') && !mobileUrl.includes('127.0.0.1')) {
                  // Lokale Netzwerk-IP: Verwende mobileUrl (bereits korrekt formatiert)
                  finalUrl = mobileUrl
                } else if (galleryData?.internetadresse) {
                  // Aus Stammdaten: Stelle sicher dass Route korrekt ist
                  const url = galleryData.internetadresse.trim()
                  if (url) {
                    let baseUrl = url.startsWith('http') ? url : `https://${url.replace(/^www\./, '')}`
                    // Stelle sicher dass Route angehängt ist
                    if (!baseUrl.includes('/galerie') && !baseUrl.includes('/projects/k2-galerie/galerie')) {
                      baseUrl = baseUrl.replace(/\/$/, '') + PROJECT_ROUTES['k2-galerie'].galerie
                    }
                    finalUrl = baseUrl
                  }
                } else {
                  // Fallback: Verwende mobileUrlMemo wenn verfügbar
                  finalUrl = mobileUrlMemo || `${window.location.origin}${PROJECT_ROUTES['k2-galerie'].galerie}`
                }
                
                // WICHTIG: Entferne Hash-Fragmente die Probleme verursachen können
                finalUrl = finalUrl.split('#')[0]
                
                // WICHTIG: Prüfe ob localhost - das funktioniert NICHT auf Handy!
                const isLocalhost = finalUrl.includes('localhost') || finalUrl.includes('127.0.0.1')
                
                // Wenn localhost: Versuche IP-Adresse zu finden oder verwende Vercel-URL
                if (isLocalhost) {
                  // Versuche IP-Adresse zu ermitteln für lokale Entwicklung
                  const networkIP = mobileUrlMemo && !mobileUrlMemo.includes('localhost') 
                    ? mobileUrlMemo 
                    : null
                  
                  if (networkIP) {
                    finalUrl = networkIP
                    console.log('📱 QR-Code: localhost erkannt → verwende Netzwerk-IP:', finalUrl)
                  } else {
                    // Fallback: IMMER Vercel-URL verwenden (funktioniert auf Handy!)
                    finalUrl = 'https://k2-galerie.vercel.app/projects/k2-galerie/galerie'
                    console.log('📱 QR-Code: localhost erkannt → verwende Vercel-URL:', finalUrl)
                  }
                }
                
                // Stelle sicher dass URL gültig ist
                if (!finalUrl || finalUrl === '') {
                  // Letzter Fallback: Root-URL der aktuellen Domain
                  finalUrl = `${window.location.origin}${PROJECT_ROUTES['k2-galerie'].galerie}`
                  console.warn('⚠️ QR-Code: Keine gültige URL gefunden, verwende Fallback:', finalUrl)
                }
                
                // Wenn auf Vercel: Verwende aktuelle Domain
                if (hostname.includes('vercel.app') && !isLocalhost) {
                  finalUrl = `${window.location.protocol}//${hostname}${PROJECT_ROUTES['k2-galerie'].galerie}`
                  console.log('📱 QR-Code: Auf Vercel → verwende aktuelle Domain:', finalUrl)
                }
                
                // Debug-Log für Entwicklung
                console.log('📱 QR-Code URL:', finalUrl)
                
                return (
                  <div 
                    key="welcome-qr-code-single"
                    style={{
                      marginTop: 'clamp(2rem, 5vw, 3rem)',
                      textAlign: 'center',
                      padding: 'clamp(1.5rem, 4vw, 2rem)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '20px'
                    }}>
                    <p style={{ 
                      margin: '0 0 1rem', 
                      fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontWeight: '500'
                    }}>
                      QR-Code für diese Seite
                    </p>
                    <div style={{
                      background: '#ffffff',
                      padding: '0.75rem',
                      borderRadius: '12px',
                      display: 'inline-block',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                    }}>
                      <img 
                        key="qr-code-image-single"
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodedUrl}`}
                        alt="QR-Code"
                        style={{
                          width: '180px',
                          height: '180px',
                          display: 'block'
                        }}
                      />
                    </div>
                    <p style={{ 
                      margin: '1rem 0 0.5rem', 
                      fontSize: 'clamp(0.7rem, 1.8vw, 0.85rem)',
                      color: 'rgba(255, 255, 255, 0.6)',
                      wordBreak: 'break-all'
                    }}>
                      {finalUrl}
                    </p>
                    {/* Test-Link für Debugging */}
                    <a 
                      href={finalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-block',
                        marginTop: '0.5rem',
                        padding: '0.5rem 1rem',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '6px',
                        color: '#ffffff',
                        textDecoration: 'none',
                        fontSize: 'clamp(0.7rem, 1.6vw, 0.8rem)'
                      }}
                    >
                      🔗 Link testen
                    </a>
                  </div>
                )
              } catch (error) {
                console.error('QR-Code Fehler:', error)
                return null
              }
            })()}
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
                  maxWidth: '100%',
                  aspectRatio: '16/9',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  marginBottom: 'clamp(1rem, 3vw, 1.5rem)',
                  background: galleryData.virtualTourImage 
                    ? 'transparent' 
                    : 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  position: 'relative',
                  boxSizing: 'border-box'
                }}>
                  {galleryData.virtualTourImage ? (
                    <img 
                      src={galleryData.virtualTourImage} 
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
                    <div style={{
                      fontSize: 'clamp(3rem, 8vw, 5rem)',
                      opacity: 0.3
                    }}>
                      📸
                    </div>
                  )}
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
                  maxWidth: '100%',
                  aspectRatio: '16/9',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  marginBottom: 'clamp(1rem, 3vw, 1.5rem)',
                  background: galleryData.virtualTourImage 
                    ? 'transparent' 
                    : 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  position: 'relative',
                  boxSizing: 'border-box'
                }}>
                  {galleryData.virtualTourImage ? (
                    <img 
                      src={galleryData.virtualTourImage} 
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
                    <div style={{
                      fontSize: 'clamp(3rem, 8vw, 5rem)',
                      opacity: 0.3
                    }}>
                      🖼️
                    </div>
                  )}
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
            }}>
              {/* Kontaktdaten */}
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
              
              {/* QR-Code im Impressum */}
              {(() => {
                try {
                  const hostname = window.location.hostname || ''
                  const isVercel = hostname.includes('vercel.app')
                  
                  // Gleiche Logik wie auf Willkommensseite
                  let finalUrl = ''
                  
                  if (isVercel) {
                    finalUrl = `${window.location.protocol}//${hostname}${PROJECT_ROUTES['k2-galerie'].galerie}`
                  } else if (mobileUrl && !mobileUrl.includes('localhost') && !mobileUrl.includes('127.0.0.1')) {
                    finalUrl = mobileUrl
                  } else if (galleryData?.internetadresse) {
                    const url = galleryData.internetadresse.trim()
                    if (url) {
                      let baseUrl = url.startsWith('http') ? url : `https://${url.replace(/^www\./, '')}`
                      if (!baseUrl.includes('/galerie') && !baseUrl.includes('/projects/k2-galerie/galerie')) {
                        baseUrl = baseUrl.replace(/\/$/, '') + PROJECT_ROUTES['k2-galerie'].galerie
                      }
                      finalUrl = baseUrl
                    }
                  } else {
                    finalUrl = mobileUrlMemo || `https://k2-galerie.vercel.app/projects/k2-galerie/galerie`
                  }
                  
                  finalUrl = finalUrl.split('#')[0]
                  const isLocalhost = finalUrl.includes('localhost') || finalUrl.includes('127.0.0.1')
                  
                  // Wenn localhost: Zeige Vercel-URL statt Warnung
                  if (isLocalhost) {
                    finalUrl = 'https://k2-galerie.vercel.app/projects/k2-galerie/galerie'
                  }
                  
                  // Stelle sicher dass URL gültig ist
                  if (!finalUrl || finalUrl === '') {
                    finalUrl = 'https://k2-galerie.vercel.app/projects/k2-galerie/galerie'
                  }
                  
                  const encodedUrl = encodeURIComponent(finalUrl)
                  
                  return (
                    <div style={{
                      marginTop: 'clamp(1.5rem, 3vw, 2rem)',
                      paddingTop: 'clamp(1rem, 2vw, 1.5rem)',
                      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                      textAlign: 'center'
                    }}>
                      <p style={{ 
                        margin: '0 0 0.75rem', 
                        fontSize: 'clamp(0.75rem, 1.8vw, 0.85rem)',
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontWeight: '500'
                      }}>
                        QR-Code für diese Seite
                      </p>
                      <div style={{
                        background: '#ffffff',
                        padding: '0.5rem',
                        borderRadius: '8px',
                        display: 'inline-block',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                      }}>
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodedUrl}`}
                          alt="QR-Code"
                          style={{
                            width: '120px',
                            height: '120px',
                            display: 'block'
                          }}
                        />
                      </div>
                      <p style={{ 
                        margin: '0.5rem 0 0', 
                        fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)',
                        color: 'rgba(255, 255, 255, 0.5)',
                        wordBreak: 'break-all'
                      }}>
                        {finalUrl}
                      </p>
                    </div>
                  )
                } catch (error) {
                  console.error('QR-Code Fehler:', error)
                  return null
                }
              })()}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default GaleriePage
