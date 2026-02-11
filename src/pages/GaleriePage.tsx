import React, { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'
import { getTenantConfig, getCurrentTenantId, TENANT_CONFIGS, MUSTER_TEXTE } from '../config/tenantConfig'
import { BUILD_LABEL } from '../buildInfo.generated'
import '../App.css'

const GaleriePage = ({ scrollToSection, musterOnly = false }: { scrollToSection?: string; musterOnly?: boolean }) => {
  const navigate = useNavigate()
  const tenantConfig = musterOnly ? TENANT_CONFIGS.oeffentlich : getTenantConfig()
  const tenantId = musterOnly ? 'oeffentlich' : getCurrentTenantId()
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

  
  // Stammdaten laden (bei musterOnly nur Mustertexte, keine echten Daten)
  const [martinaData, setMartinaData] = React.useState(() =>
    musterOnly ? MUSTER_TEXTE.martina : { name: 'Martina Kreinecker', email: '', phone: '' }
  )
  const [georgData, setGeorgData] = React.useState(() =>
    musterOnly ? MUSTER_TEXTE.georg : { name: 'Georg Kreinecker', email: '', phone: '' }
  )
  const [galleryData, setGalleryData] = React.useState(() =>
    musterOnly ? MUSTER_TEXTE.gallery : {
      address: '',
      phone: '',
      email: '',
      website: '',
      internetadresse: '',
      adminPassword: 'k2Galerie2026',
      welcomeImage: '',
      virtualTourImage: ''
    }
  )

  // ök2: Stammdaten immer auf Musterdaten halten (auch bei Navigation von normaler Galerie)
  React.useEffect(() => {
    if (musterOnly) {
      setMartinaData({ ...MUSTER_TEXTE.martina })
      setGeorgData({ ...MUSTER_TEXTE.georg })
      setGalleryData({ ...MUSTER_TEXTE.gallery })
    }
  }, [musterOnly])
  
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
        
        // KRITISCH: Lade ZUERST lokale Werke um sicherzustellen dass Mobile-Werke NICHT verloren gehen!
        const localArtworks = JSON.parse(localStorage.getItem('k2-artworks') || '[]')
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
            
            // KRITISCH: Lokale Werke haben IMMER Priorität - sie wurden gerade erstellt/bearbeitet!
            // WICHTIG: Starte mit ALLEN lokalen Werken als Basis!
            const localMap = new Map<string, any>()
            localArtworks.forEach((local: any) => {
              const key = local.number || local.id
              if (key) {
                localMap.set(key, local)
                // Mobile-Werke besonders markieren
                if (local.createdOnMobile || local.updatedOnMobile) {
                  console.log(`🔒 Lokales Mobile-Werk geschützt: ${key}`)
                }
              }
            })
            
            // KRITISCH: Starte mit ALLEN lokalen Werken (haben ABSOLUTE Priorität!)
            // Mobile-Werke dürfen NIEMALS verloren gehen!
            const merged: any[] = []
            
            // ZUERST: Alle lokalen Werke hinzufügen (inkl. Mobile-Werke)
            localArtworks.forEach((local: any) => {
              merged.push(local)
              if (local.createdOnMobile || local.updatedOnMobile) {
                console.log(`🔒 Mobile-Werk geschützt beim Merge: ${local.number || local.id}`)
              }
            })
            
            // DANN: Server-Werke hinzufügen die NICHT lokal sind
            serverArtworks.forEach((server: any) => {
              const key = server.number || server.id
              if (key && !localMap.has(key)) {
                // Prüfe ob Server-Werk eine Nummer hat die lokal bereits existiert (aber andere ID)
                const localWithSameNumber = localArtworks.find((l: any) => (l.number || l.id) === key)
                if (!localWithSameNumber) {
                  merged.push(server)
                } else {
                  console.log(`⚠️ Server-Werk ${key} übersprungen - lokales Werk existiert bereits`)
                }
              }
            })
            
            // KRITISCH: Prüfe ob ALLE lokalen Werke erhalten bleiben!
            const localKeys = new Set(localArtworks.map((a: any) => a.number || a.id))
            const mergedKeys = new Set(merged.map((a: any) => a.number || a.id))
            const missingLocal = [...localKeys].filter(key => !mergedKeys.has(key))
            
            if (missingLocal.length > 0) {
              console.error('❌ KRITISCH: Lokale Werke wurden verloren beim Merge!')
              console.error('Fehlende Nummern:', missingLocal)
              // Stelle fehlende lokale Werke wieder her
              missingLocal.forEach(missingKey => {
                const missingArtwork = localArtworks.find((a: any) => (a.number || a.id) === missingKey)
                if (missingArtwork) {
                  console.log(`🔧 Stelle fehlendes Werk wieder her: ${missingKey}`)
                  merged.push(missingArtwork)
                }
              })
              console.log('✅ Fehlende lokale Werke wiederhergestellt!')
            }
            
            // ZUSÄTZLICH: Prüfe ob Mobile-Werke alle erhalten sind
            const mobileKeys = new Set(mobileWorks.map((a: any) => a.number || a.id))
            const mergedMobileKeys = new Set(merged.filter((a: any) => a.createdOnMobile || a.updatedOnMobile).map((a: any) => a.number || a.id))
            const missingMobile = [...mobileKeys].filter(key => !mergedMobileKeys.has(key))
            
            if (missingMobile.length > 0) {
              console.error('❌ KRITISCH: Mobile-Werke wurden verloren!')
              console.error('Fehlende Mobile-Nummern:', missingMobile)
              // Stelle fehlende Mobile-Werke wieder her
              missingMobile.forEach(missingKey => {
                const missingArtwork = mobileWorks.find((a: any) => (a.number || a.id) === missingKey)
                if (missingArtwork) {
                  console.log(`🔧 Stelle fehlendes Mobile-Werk wieder her: ${missingKey}`)
                  // Prüfe ob bereits in merged
                  const exists = merged.find((a: any) => (a.number || a.id) === missingKey)
                  if (!exists) {
                    merged.push(missingArtwork)
                  }
                }
              })
              console.log('✅ Fehlende Mobile-Werke wiederhergestellt!')
            }
            
            console.log('✅ Werke gemergt (Lokale zuerst, dann Server):', merged.length, 'Werke (', localArtworks.length, 'Lokal +', merged.length - localArtworks.length, 'Server)')
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
      const localArtworks = JSON.parse(localStorage.getItem('k2-artworks') || '[]')
      
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
          // KRITISCH: Mobile-Werke haben ABSOLUTE PRIORITÄT - sie dürfen NIEMALS gelöscht werden!
          if (data.artworks && Array.isArray(data.artworks)) {
            try {
              // KRITISCH: Lade ZUERST lokale Werke um sicherzustellen dass Mobile-Werke NICHT verloren gehen!
              const localArtworks = JSON.parse(localStorage.getItem('k2-artworks') || '[]')
              const mobileWorks = localArtworks.filter((a: any) => a.createdOnMobile || a.updatedOnMobile)
              
              if (mobileWorks.length > 0) {
                console.log(`🔒 ${mobileWorks.length} Mobile-Werke geschützt beim Initial-Load:`, mobileWorks.map((a: any) => a.number || a.id).join(', '))
              }
              
              const serverArtworks = data.artworks
              
              // Erstelle Map für lokale Werke
              const localMap = new Map<string, any>()
              localArtworks.forEach((local: any) => {
                const key = local.number || local.id
                if (key) {
                  localMap.set(key, local)
                  // Mobile-Werke besonders markieren
                  if (local.createdOnMobile || local.updatedOnMobile) {
                    console.log(`🔒 Lokales Mobile-Werk geschützt beim Initial-Load: ${key}`)
                  }
                }
              })
              
              // KRITISCH: Starte mit ALLEN lokalen Werken (haben ABSOLUTE Priorität!)
              const merged: any[] = []
              
              // ZUERST: Alle lokalen Werke hinzufügen (inkl. Mobile-Werke)
              localArtworks.forEach((local: any) => {
                merged.push(local)
                if (local.createdOnMobile || local.updatedOnMobile) {
                  console.log(`🔒 Mobile-Werk geschützt beim Initial-Load: ${local.number || local.id}`)
                }
              })
              
              // DANN: Server-Werke hinzufügen die NICHT lokal sind
              serverArtworks.forEach((server: any) => {
                const key = server.number || server.id
                if (key && !localMap.has(key)) {
                  // Prüfe ob Server-Werk eine Nummer hat die lokal bereits existiert (aber andere ID)
                  const localWithSameNumber = localArtworks.find((l: any) => (l.number || l.id) === key)
                  if (!localWithSameNumber) {
                    merged.push(server)
                  } else {
                    console.log(`⚠️ Server-Werk ${key} übersprungen beim Initial-Load - lokales Werk existiert bereits`)
                  }
                }
              })
              
              // KRITISCH: Prüfe ob ALLE lokalen Werke erhalten bleiben!
              const localKeys = new Set(localArtworks.map((a: any) => a.number || a.id))
              const mergedKeys = new Set(merged.map((a: any) => a.number || a.id))
              const missingLocal = [...localKeys].filter(key => !mergedKeys.has(key))
              
              if (missingLocal.length > 0) {
                console.error('❌ KRITISCH: Lokale Werke wurden verloren beim Initial-Load!')
                console.error('Fehlende Nummern:', missingLocal)
                // Stelle fehlende lokale Werke wieder her
                missingLocal.forEach(missingKey => {
                  const missingArtwork = localArtworks.find((a: any) => (a.number || a.id) === missingKey)
                  if (missingArtwork) {
                    console.log(`🔧 Stelle fehlendes Werk wieder her beim Initial-Load: ${missingKey}`)
                    merged.push(missingArtwork)
                  }
                })
                console.log('✅ Fehlende lokale Werke wiederhergestellt beim Initial-Load!')
              }
              
              // ZUSÄTZLICH: Prüfe ob Mobile-Werke alle erhalten sind
              const mobileKeys = new Set(mobileWorks.map((a: any) => a.number || a.id))
              const mergedMobileKeys = new Set(merged.filter((a: any) => a.createdOnMobile || a.updatedOnMobile).map((a: any) => a.number || a.id))
              const missingMobile = [...mobileKeys].filter(key => !mergedMobileKeys.has(key))
              
              if (missingMobile.length > 0) {
                console.error('❌ KRITISCH: Mobile-Werke wurden verloren beim Initial-Load!')
                console.error('Fehlende Mobile-Nummern:', missingMobile)
                // Stelle fehlende Mobile-Werke wieder her
                missingMobile.forEach(missingKey => {
                  const missingArtwork = mobileWorks.find((a: any) => (a.number || a.id) === missingKey)
                  if (missingArtwork) {
                    console.log(`🔧 Stelle fehlendes Mobile-Werk wieder her beim Initial-Load: ${missingKey}`)
                    // Prüfe ob bereits in merged
                    const exists = merged.find((a: any) => (a.number || a.id) === missingKey)
                    if (!exists) {
                      merged.push(missingArtwork)
                    }
                  }
                })
                console.log('✅ Fehlende Mobile-Werke wiederhergestellt beim Initial-Load!')
              }
              
              localStorage.setItem('k2-artworks', JSON.stringify(merged))
              console.log('✅ Werke gemergt beim Initial-Load (Lokale zuerst, dann Server):', merged.length, 'Werke (', localArtworks.length, 'Lokal +', merged.length - localArtworks.length, 'Server)')
              console.log('📋 Lokale Nummern:', localArtworks.map((a: any) => a.number || a.id).join(', '))
              console.log('📋 Server Nummern:', serverArtworks.map((a: any) => a.number || a.id).join(', '))
              console.log('📋 Gemergte Nummern:', merged.map((a: any) => a.number || a.id).join(', '))
              // Trigger Event für andere Komponenten (z.B. GalerieVorschauPage)
              window.dispatchEvent(new CustomEvent('artworks-updated', { detail: { count: merged.length, fromGaleriePage: true, initialLoad: true } }))
            } catch (e) {
              console.warn('⚠️ Werke zu groß für localStorage:', e)
              // Bei Fehler: Behalte lokale Werke!
              const localArtworks = JSON.parse(localStorage.getItem('k2-artworks') || '[]')
              if (localArtworks.length > 0) {
                console.log('🔒 Fehler beim Merge beim Initial-Load - behalte lokale Werke:', localArtworks.length)
                localStorage.setItem('k2-artworks', JSON.stringify(localArtworks))
              }
            }
          } else {
            // KEINE Server-Daten - behalte ALLE lokalen Werke!
            const localArtworks = JSON.parse(localStorage.getItem('k2-artworks') || '[]')
            if (localArtworks.length > 0) {
              console.warn('⚠️ Keine Werke in gallery-data.json gefunden beim Initial-Load - behalte lokale Werke:', localArtworks.length)
              console.log('🔒 Lokale Werke bleiben erhalten beim Initial-Load:', localArtworks.map((a: any) => a.number || a.id).join(', '))
              // Stelle sicher dass lokale Werke gespeichert bleiben
              localStorage.setItem('k2-artworks', JSON.stringify(localArtworks))
              window.dispatchEvent(new CustomEvent('artworks-updated', { detail: { count: localArtworks.length, fromGaleriePage: true, localOnly: true, initialLoad: true } }))
            }
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
      
      // Setze Daten - PRIORITÄT: localStorage > JSON-Datei
      // Zuerst aus localStorage laden (aktuellste Daten)
      try {
        const martinaStored = localStorage.getItem('k2-stammdaten-martina')
        if (martinaStored) {
          const martinaLocal = JSON.parse(martinaStored)
          setMartinaData({
            name: martinaLocal.name || 'Martina Kreinecker',
            email: martinaLocal.email || '',
            phone: martinaLocal.phone || ''
          })
        } else if (data?.martina) {
          setMartinaData({
            name: data.martina.name || 'Martina Kreinecker',
            email: data.martina.email || '',
            phone: data.martina.phone || ''
          })
        }
      } catch (error) {
        console.error('Fehler beim Laden von Martina-Daten:', error)
      }
      
      try {
        const georgStored = localStorage.getItem('k2-stammdaten-georg')
        if (georgStored) {
          const georgLocal = JSON.parse(georgStored)
          setGeorgData({
            name: georgLocal.name || 'Georg Kreinecker',
            email: georgLocal.email || '',
            phone: georgLocal.phone || ''
          })
        } else if (data?.georg) {
          setGeorgData({
            name: data.georg.name || 'Georg Kreinecker',
            email: data.georg.email || '',
            phone: data.georg.phone || ''
          })
        }
      } catch (error) {
        console.error('Fehler beim Laden von Georg-Daten:', error)
      }
      
      try {
        const galleryStored = localStorage.getItem('k2-stammdaten-galerie')
        if (galleryStored) {
          const galleryLocal = JSON.parse(galleryStored)
          setGalleryData({
            address: galleryLocal.address || '',
            phone: galleryLocal.phone || '',
            email: galleryLocal.email || '',
            website: galleryLocal.website || 'www.k2-galerie.at',
            internetadresse: galleryLocal.internetadresse || galleryLocal.website || '',
            adminPassword: galleryLocal.adminPassword || 'k2Galerie2026',
            welcomeImage: galleryLocal.welcomeImage || '',
            virtualTourImage: galleryLocal.virtualTourImage || ''
          })
          setAdminPassword(galleryLocal.adminPassword || 'k2Galerie2026')
        } else if (data?.gallery) {
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
      } catch (error) {
        console.error('Fehler beim Laden von Galerie-Daten:', error)
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
    
    // Event Listener für Stammdaten-Updates (sicher implementiert)
    // Prüfe nur localStorage, keine Events die Loops verursachen könnten
    const checkStammdatenUpdate = () => {
      try {
        const martinaStored = localStorage.getItem('k2-stammdaten-martina')
        if (martinaStored) {
          const data = JSON.parse(martinaStored)
          setMartinaData(prev => {
            // Nur updaten wenn sich etwas geändert hat
            if (prev.email !== data.email || prev.phone !== data.phone || prev.name !== data.name) {
              return {
                name: data.name || 'Martina Kreinecker',
                email: data.email || '',
                phone: data.phone || ''
              }
            }
            return prev
          })
        }
      } catch (error) {}
      
      try {
        const georgStored = localStorage.getItem('k2-stammdaten-georg')
        if (georgStored) {
          const data = JSON.parse(georgStored)
          setGeorgData(prev => {
            // Nur updaten wenn sich etwas geändert hat
            if (prev.email !== data.email || prev.phone !== data.phone || prev.name !== data.name) {
              return {
                name: data.name || 'Georg Kreinecker',
                email: data.email || '',
                phone: data.phone || ''
              }
            }
            return prev
          })
        }
      } catch (error) {}
      
      try {
        const galleryStored = localStorage.getItem('k2-stammdaten-galerie')
        if (galleryStored) {
          const data = JSON.parse(galleryStored)
          setGalleryData(prev => {
            // Nur updaten wenn sich etwas geändert hat
            if (prev.address !== data.address || prev.phone !== data.phone || prev.email !== data.email || prev.website !== data.website) {
              return {
                address: data.address || '',
                phone: data.phone || '',
                email: data.email || '',
                website: data.website || 'www.k2-galerie.at',
                internetadresse: data.internetadresse || data.website || '',
                adminPassword: data.adminPassword || 'k2Galerie2026',
                welcomeImage: data.welcomeImage || '',
                virtualTourImage: data.virtualTourImage || ''
              }
            }
            return prev
          })
        }
      } catch (error) {}
    }
    
    // Prüfe alle 2 Sekunden ob Stammdaten aktualisiert wurden
    const intervalId = setInterval(checkStammdatenUpdate, 2000)
    
    // Cleanup
    return () => {
      clearInterval(intervalId)
    }
    
    // Cleanup: Setze isMounted auf false beim Unmount
    return () => {
      isMounted = false
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
      try { sessionStorage.setItem('k2-admin-context', musterOnly ? 'oeffentlich' : 'k2') } catch (_) {}
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
      try { sessionStorage.setItem('k2-admin-context', musterOnly ? 'oeffentlich' : 'k2') } catch (_) {}
      navigate(musterOnly ? '/admin?context=oeffentlich' : '/admin')
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
      try { sessionStorage.setItem('k2-admin-context', musterOnly ? 'oeffentlich' : 'k2') } catch (_) {}
      navigate(musterOnly ? '/admin?context=oeffentlich' : '/admin')
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
        {/* Entwicklungsstand (Mac = Handy? Profi-Check) – unten links, dezent */}
        <div
          style={{
            position: 'fixed',
            bottom: '0.5rem',
            left: '0.5rem',
            zIndex: 9999,
            fontSize: '0.7rem',
            color: 'rgba(255, 255, 255, 0.4)',
            fontFamily: 'monospace',
            pointerEvents: 'none'
          }}
          title="Gleicher Stand wie am Mac? Hier vergleichen."
        >
          Stand: {BUILD_LABEL}
        </div>

        {/* Admin Button – auf normaler Galerie und auf ök2-Willkommensseite (eigener Admin-Zugang) */}
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
            opacity: 0.6,
            touchAction: 'manipulation',
            minWidth: '44px',
            minHeight: '44px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1'
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.6'
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
          }}
          onTouchStart={(e) => {
            e.currentTarget.style.opacity = '1'
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
          }}
          onTouchEnd={(e) => {
            setTimeout(() => {
              e.currentTarget.style.opacity = '0.6'
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
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
              {tenantConfig.galleryName}
            </h1>
            <p style={{ 
              margin: '0.75rem 0 0', 
              color: 'rgba(255, 255, 255, 0.7)', 
              fontSize: 'clamp(1rem, 3vw, 1.25rem)',
              fontWeight: '300',
              letterSpacing: '0.05em'
            }}>
              {tenantConfig.tagline}
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
              Willkommen bei {tenantConfig.galleryName} –<br />
              <span style={{
                background: 'linear-gradient(135deg, #b8b8ff 0%, #ff77c6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {tenantConfig.tagline}
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
              {musterOnly ? MUSTER_TEXTE.welcomeText : 'Ein Neuanfang mit Leidenschaft. Entdecke die Verbindung von Malerei und Keramik in einem Raum, wo Kunst zum Leben erwacht.'}
            </p>
            
            {/* QR-Code ENTFERNT von Willkommensseite - jetzt im Impressum unten */}
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
                  {(musterOnly ? MUSTER_TEXTE.martina.name : (tenantId === 'demo' ? tenantConfig.artist1Name : (martinaData.name || tenantConfig.artist1Name))).charAt(0)}
                </div>
                <h4 style={{
                  margin: '0 0 0.75rem',
                  fontSize: 'clamp(1.25rem, 3.5vw, 1.75rem)',
                  color: '#ffffff',
                  fontWeight: '600'
                }}>
                  {musterOnly ? MUSTER_TEXTE.martina.name : (tenantId === 'demo' ? tenantConfig.artist1Name : (martinaData.name || tenantConfig.artist1Name))}
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
                  {musterOnly ? MUSTER_TEXTE.artist1Bio : 'Martina bringt mit ihren Gemälden eine lebendige Vielfalt an Farben und Ausdruckskraft auf die Leinwand. Ihre Werke spiegeln Jahre des Lernens, Experimentierens und der Leidenschaft für die Malerei wider.'}
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
                  {(musterOnly ? MUSTER_TEXTE.georg.name : (tenantId === 'demo' ? tenantConfig.artist2Name : (georgData.name || tenantConfig.artist2Name))).charAt(0)}
                </div>
                <h4 style={{
                  margin: '0 0 0.75rem',
                  fontSize: 'clamp(1.25rem, 3.5vw, 1.75rem)',
                  color: '#ffffff',
                  fontWeight: '600'
                }}>
                  {musterOnly ? MUSTER_TEXTE.georg.name : (tenantId === 'demo' ? tenantConfig.artist2Name : (georgData.name || tenantConfig.artist2Name))}
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
                  {musterOnly ? MUSTER_TEXTE.artist2Bio : 'Georg verbindet in seiner Keramikarbeit technisches Können mit kreativer Gestaltung. Seine Arbeiten sind geprägt von Präzision und einer Liebe zum Detail, das Ergebnis von langjähriger Erfahrung.'}
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
              {musterOnly ? MUSTER_TEXTE.gemeinsamText : `Gemeinsam eröffnen ${tenantId === 'demo' ? tenantConfig.artist1Name : (martinaData.name || tenantConfig.artist1Name)} und ${tenantId === 'demo' ? tenantConfig.artist2Name : (georgData.name || tenantConfig.artist2Name)} nach über 20 Jahren kreativer Tätigkeit die ${tenantConfig.galleryName} – ein Raum, wo Malerei und Keramik verschmelzen und Kunst zum Leben erwacht.`}
            </p>

            {/* Virtueller Rundgang & Galerie Vorschau */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(280px, 40vw, 400px), 1fr))',
              gap: 'clamp(1.5rem, 4vw, 2rem)',
              marginBottom: 'clamp(3rem, 8vw, 5rem)'
            }}>
              {/* Virtueller Rundgang – ök2: ausblenden (keine echten Bilder) */}
              {!musterOnly && (
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
              )}

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
                    to={musterOnly ? PROJECT_ROUTES['k2-galerie'].galerieOeffentlichVorschau : PROJECT_ROUTES['k2-galerie'].galerieVorschau}
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
                  {!musterOnly && (
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
                  )}
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
                    <p style={{ margin: '0 0 0.25rem', fontWeight: '500', color: '#ffffff', fontSize: 'clamp(0.95rem, 2.2vw, 1.1rem)' }}>
                      {tenantConfig.galleryName}
                    </p>
                    {(musterOnly ? MUSTER_TEXTE.gallery.address : galleryData.address) && (
                      <p style={{ margin: '0 0 0.15rem', color: 'rgba(255, 255, 255, 0.7)', fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)', lineHeight: '1.4' }}>
                        {musterOnly ? MUSTER_TEXTE.gallery.address : galleryData.address}
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
                          ✉️ <a href={`mailto:${musterOnly ? MUSTER_TEXTE.gallery.email : galleryData.email}`} style={{ color: '#b8b8ff', textDecoration: 'none' }}>
                            {musterOnly ? MUSTER_TEXTE.gallery.email : galleryData.email}
                          </a>
                        </span>
                      )}
                      {(musterOnly ? MUSTER_TEXTE.gallery.website : galleryData.website) && (
                        <span style={{ fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)' }}>
                          🌐 <a href={`https://${(musterOnly ? MUSTER_TEXTE.gallery.website : galleryData.website).replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#b8b8ff', textDecoration: 'none' }}>
                            {musterOnly ? MUSTER_TEXTE.gallery.website : galleryData.website}
                          </a>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Martina Kontakt - Kompakt (ök2: immer aus MUSTER_TEXTE) */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <p style={{ margin: '0 0 0.15rem', fontWeight: '500', color: '#ffffff', fontSize: 'clamp(0.95rem, 2.2vw, 1.1rem)' }}>
                      {musterOnly ? MUSTER_TEXTE.martina.name : (martinaData.name || 'Martina Kreinecker')}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {(musterOnly ? MUSTER_TEXTE.martina.phone : martinaData.phone) && (
                        <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)' }}>
                          📞 {musterOnly ? MUSTER_TEXTE.martina.phone : martinaData.phone}
                        </span>
                      )}
                      {(musterOnly ? MUSTER_TEXTE.martina.email : martinaData.email) && (
                        <span style={{ fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)' }}>
                          ✉️ <a href={`mailto:${musterOnly ? MUSTER_TEXTE.martina.email : martinaData.email}`} style={{ color: '#b8b8ff', textDecoration: 'none' }}>
                            {musterOnly ? MUSTER_TEXTE.martina.email : martinaData.email}
                          </a>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Georg Kontakt - Kompakt (ök2: immer aus MUSTER_TEXTE) */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <p style={{ margin: '0 0 0.15rem', fontWeight: '500', color: '#ffffff', fontSize: 'clamp(0.95rem, 2.2vw, 1.1rem)' }}>
                      {musterOnly ? MUSTER_TEXTE.georg.name : (georgData.name || 'Georg Kreinecker')}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {(musterOnly ? MUSTER_TEXTE.georg.phone : georgData.phone) && (
                        <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)' }}>
                          📞 {musterOnly ? MUSTER_TEXTE.georg.phone : georgData.phone}
                        </span>
                      )}
                      {(musterOnly ? MUSTER_TEXTE.georg.email : georgData.email) && (
                        <span style={{ fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)' }}>
                          ✉️ <a href={`mailto:${musterOnly ? MUSTER_TEXTE.georg.email : georgData.email}`} style={{ color: '#b8b8ff', textDecoration: 'none' }}>
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
                
                {/* Rechte Seite: QR-Code (platzsparend) */}
                {(() => {
                try {
                  const hostname = window.location.hostname || ''
                  const port = window.location.port || '5177'
                  const protocol = window.location.protocol
                  const isVercel = hostname.includes('vercel.app')
                  
                  // WICHTIG: Immer die korrekte Galerie-Route verwenden
                  let finalUrl = ''
                  
                  // KRITISCH: Wenn NICHT auf Vercel → IMMER lokale IP verwenden!
                  if (!isVercel) {
                    // Prüfe ob hostname eine IP-Adresse ist (192.168.x.x oder 10.x.x.x etc.)
                    const isIPAddress = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)
                    
                    if (isIPAddress) {
                      // IP-Adresse gefunden → VERWENDE DIESE DIREKT!
                      finalUrl = `${protocol}//${hostname}:${port}${PROJECT_ROUTES['k2-galerie'].galerie}`
                      console.log('📱 QR-Code: IP-Adresse direkt verwendet:', finalUrl)
                    } else if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
                      // Andere hostname (nicht localhost) → verwende diese
                      finalUrl = `${protocol}//${hostname}:${port}${PROJECT_ROUTES['k2-galerie'].galerie}`
                      console.log('📱 QR-Code: Hostname verwendet:', finalUrl)
                    } else {
                      // Auf localhost: Versuche mobileUrl oder mobileUrlMemo
                      if (mobileUrl && !mobileUrl.includes('localhost') && !mobileUrl.includes('127.0.0.1')) {
                        finalUrl = mobileUrl
                        console.log('📱 QR-Code: mobileUrl verwendet:', finalUrl)
                      } else if (mobileUrlMemo && !mobileUrlMemo.includes('localhost') && !mobileUrlMemo.includes('127.0.0.1')) {
                        finalUrl = mobileUrlMemo
                        console.log('📱 QR-Code: mobileUrlMemo verwendet:', finalUrl)
                      } else {
                        // Fallback: Verwende bekannte Netzwerk-IPs aus Server-Output
                        const knownIPs = ['192.168.0.31', '192.168.0.27']
                        const fallbackIP = knownIPs[0] // Verwende erste bekannte IP
                        finalUrl = `http://${fallbackIP}:${port}${PROJECT_ROUTES['k2-galerie'].galerie}`
                        console.log('📱 QR-Code: localhost erkannt → verwende Fallback-IP:', finalUrl)
                      }
                    }
                  } else {
                    // Nur auf Vercel: Verwende Vercel-URL
                    finalUrl = `${window.location.protocol}//${hostname}${PROJECT_ROUTES['k2-galerie'].galerie}`
                    console.log('📱 QR-Code: Auf Vercel → verwende Vercel-URL:', finalUrl)
                  }
                  
                  // WICHTIG: Entferne Hash-Fragmente die Probleme verursachen können
                  finalUrl = finalUrl.split('#')[0]
                  
                  // WICHTIG: Wenn noch localhost oder Vercel drin ist (und nicht auf Vercel) → Fallback-IP verwenden
                  if (!isVercel && (finalUrl.includes('localhost') || finalUrl.includes('127.0.0.1') || finalUrl.includes('vercel.app'))) {
                    console.warn('⚠️ QR-Code: Ungültige URL erkannt, verwende Fallback-IP:', finalUrl)
                    const knownIPs = ['192.168.0.31', '192.168.0.27']
                    const fallbackIP = knownIPs[0]
                    finalUrl = `http://${fallbackIP}:${port}${PROJECT_ROUTES['k2-galerie'].galerie}`
                    console.log('📱 QR-Code: Fallback-IP verwendet:', finalUrl)
                  }
                  
                  // Stelle sicher dass URL gültig ist
                  if (!finalUrl || finalUrl === '') {
                    // Letzter Fallback: Verwende bekannte IP
                    const knownIPs = ['192.168.0.31', '192.168.0.27']
                    const fallbackIP = knownIPs[0]
                    finalUrl = `http://${fallbackIP}:${port}${PROJECT_ROUTES['k2-galerie'].galerie}`
                    console.log('📱 QR-Code: Letzter Fallback verwendet:', finalUrl)
                  }
                  
                  // Debug-Log für Entwicklung
                  console.log('📱 QR-Code URL:', finalUrl)
                  
                  // URL für QR-Code encoden
                  const encodedUrl = encodeURIComponent(finalUrl)
                  
                  return (
                    <div style={{
                      textAlign: 'center',
                      flexShrink: 0
                    }}>
                      <p style={{ 
                        margin: '0 0 0.5rem', 
                        fontSize: 'clamp(0.7rem, 1.6vw, 0.8rem)',
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontWeight: '500'
                      }}>
                        QR-Code
                      </p>
                      <div style={{
                        background: '#ffffff',
                        padding: '0.4rem',
                        borderRadius: '8px',
                        display: 'inline-block',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                      }}>
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodedUrl}`}
                          alt="QR-Code"
                          style={{
                            width: '100px',
                            height: '100px',
                            display: 'block'
                          }}
                        />
                      </div>
                      <p style={{ 
                        margin: '0.4rem 0 0', 
                        fontSize: 'clamp(0.6rem, 1.3vw, 0.7rem)',
                        color: 'rgba(255, 255, 255, 0.5)',
                        wordBreak: 'break-all',
                        maxWidth: '120px'
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
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default GaleriePage
