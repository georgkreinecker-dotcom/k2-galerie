import React, { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import { PROJECT_ROUTES } from '../config/navigation'
import { getTenantConfig, getCurrentTenantId, TENANT_CONFIGS, MUSTER_TEXTE } from '../config/tenantConfig'
import { appendToHistory } from '../utils/artworkHistory'
import { buildQrUrlWithBust, useQrVersionTimestamp } from '../hooks/useServerBuildTimestamp'
import '../App.css'

/** Fallback-URL für Aktualisierung in anderem Netzwerk (z. B. zuerst Mac-WLAN, dann Mobilfunk) */
const GALLERY_DATA_PUBLIC_URL = 'https://k2-galerie.vercel.app'
/** K2 im Internet – gleiche Seite, funktioniert in jedem WLAN/Mobilfunk */
function getK2PublicPageUrl(): string {
  if (typeof window === 'undefined') return 'https://k2-galerie.vercel.app/projects/k2-galerie/galerie'
  return GALLERY_DATA_PUBLIC_URL + window.location.pathname
}

function isLocalOrPrivateOrigin(): boolean {
  if (typeof window === 'undefined') return false
  const h = window.location.hostname
  return h === 'localhost' || h === '127.0.0.1' || h.startsWith('192.168.') || h.startsWith('10.')
}

/** Verhindert Absturz bei kaputtem localStorage (z. B. nach Druck/Teilen). */
function safeParseArtworks(): any[] {
  try {
    const raw = localStorage.getItem('k2-artworks')
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

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
  const [vercelQrDataUrl, setVercelQrDataUrl] = useState('')
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
  
  // LAN-IP für QR (z. B. 192.168.0.31) – bei localhost per RTCPeerConnection ermitteln
  const [detectedLanIp, setDetectedLanIp] = useState<string>('')
  const mobileUrlMemo = useMemo(() => {
    try {
      const hostname = window.location.hostname
      const port = window.location.port || '5177'
      const protocol = window.location.protocol
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return '' // Wird unten durch detectedLanIp oder 192.168.0.31 ersetzt
      }
      return `${protocol}//${hostname}:${port}${PROJECT_ROUTES['k2-galerie'].galerie}`
    } catch {
      return ''
    }
  }, [])

  useEffect(() => {
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') return
    let cancelled = false
    const rtc = new (window.RTCPeerConnection as any)({ iceServers: [] })
    rtc.createDataChannel('')
    rtc.createOffer().then((offer: any) => rtc.setLocalDescription(offer))
    rtc.onicecandidate = (e: any) => {
      if (cancelled || !e?.candidate?.candidate) return
      const m = e.candidate.candidate.match(/^candidate:\d+ \d+ udp \d+ (\d+\.\d+\.\d+\.\d+)/)
      if (m && (m[1].startsWith('192.168.') || m[1].startsWith('10.'))) {
        if (!cancelled) setDetectedLanIp(m[1])
        rtc.close()
      }
    }
    const t = setTimeout(() => { rtc.close() }, 3000)
    return () => { cancelled = true; clearTimeout(t); rtc.close() }
  }, [])

  React.useEffect(() => {
    setMobileUrl(mobileUrlMemo || (detectedLanIp ? `http://${detectedLanIp}:${window.location.port || '5177'}${PROJECT_ROUTES['k2-galerie'].galerie}` : ''))
  }, [mobileUrlMemo, detectedLanIp])

  // QR-Code URL für Impressum (gleiche Logik wie unten)
  const qrFinalUrl = useMemo(() => {
    try {
      const hostname = window.location.hostname || ''
      const port = window.location.port || '5177'
      const protocol = window.location.protocol
      const isVercel = hostname.includes('vercel.app')
      let finalUrl = ''
      if (!isVercel) {
        const isIPAddress = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)
        if (isIPAddress) {
          finalUrl = `${protocol}//${hostname}:${port}${PROJECT_ROUTES['k2-galerie'].galerie}`
        } else if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
          finalUrl = `${protocol}//${hostname}:${port}${PROJECT_ROUTES['k2-galerie'].galerie}`
        } else if (mobileUrl && !mobileUrl.includes('localhost') && !mobileUrl.includes('127.0.0.1')) {
          finalUrl = mobileUrl
        } else if (mobileUrlMemo && !mobileUrlMemo.includes('localhost') && !mobileUrlMemo.includes('127.0.0.1')) {
          finalUrl = mobileUrlMemo
        } else {
          finalUrl = `http://192.168.0.31:${port}${PROJECT_ROUTES['k2-galerie'].galerie}`
        }
      } else {
        finalUrl = `${window.location.protocol}//${hostname}${PROJECT_ROUTES['k2-galerie'].galerie}`
      }
      return finalUrl.split('#')[0] || `http://192.168.0.31:${port}${PROJECT_ROUTES['k2-galerie'].galerie}`
    } catch {
      return 'https://k2-galerie.vercel.app/projects/k2-galerie/galerie'
    }
  }, [mobileUrl, mobileUrlMemo])

  const qrVersionTs = useQrVersionTimestamp()
  const vercelGalerieUrl = GALLERY_DATA_PUBLIC_URL + PROJECT_ROUTES['k2-galerie'].galerie
  // Ein QR für Impressum (Vercel – funktioniert überall)
  useEffect(() => {
    QRCode.toDataURL(buildQrUrlWithBust(vercelGalerieUrl, qrVersionTs), { width: 100, margin: 1 }).then(setVercelQrDataUrl).catch(() => setVercelQrDataUrl(''))
  }, [vercelGalerieUrl, qrVersionTs])

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
      
      // KRITISCH: Maximale Cache-Busting URL (gleicher Pfad für Fallback in anderem Netzwerk)
      const pathAndQuery = `/gallery-data.json?v=${timestamp}&t=${timestamp}&r=${random}&sid=${sessionId}&ver=${newVersion}&bid=${buildId}&_=${Date.now()}&nocache=${Math.random()}&force=${Date.now()}&refresh=${Math.random()}`
      
      const fetchOpts: RequestInit = {
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
      }

      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      const isLocalLan = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.|10\.)/.test(origin)

      let response: Response | null = null
      try {
        response = await fetch(pathAndQuery, fetchOpts)
      } catch (_) {
        // Netzwerkfehler (z. B. Mobilgerät im LAN kann gleiche Origin nicht erreichen)
      }
      // Im lokalen LAN: Bei Fehler auch volle Origin-URL versuchen (manche Mobile Browser)
      if (!response?.ok && isLocalLan && origin) {
        try {
          const fullUrlRes = await fetch(origin + pathAndQuery, fetchOpts)
          if (fullUrlRes.ok) response = fullUrlRes
        } catch (_) {}
      }
      // Fallback: Vercel (funktioniert wenn Handy Internet hat)
      if (!response?.ok) {
        try {
          const fallbackRes = await fetch(GALLERY_DATA_PUBLIC_URL + pathAndQuery, fetchOpts)
          if (fallbackRes.ok) response = fallbackRes
        } catch (_) {}
      }

      if (response?.ok) {
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
        const localArtworks = safeParseArtworks()
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
            
            // SERVER = QUELLE DER WAHRHEIT nach Veröffentlichung (wie GalerieVorschauPage)
            const merged: any[] = [...serverArtworks]
            const toHistory: any[] = []
            
            localArtworks.forEach((local: any) => {
              const key = local.number || local.id
              if (!key) return
              const serverArtwork = serverMap.get(key)
              const isMobileWork = local.createdOnMobile || local.updatedOnMobile
              const createdAt = local.createdAt ? new Date(local.createdAt).getTime() : 0
              const isVeryNew = createdAt > Date.now() - 600000
              
              if (!serverArtwork) {
                if (isMobileWork && isVeryNew) {
                  merged.push(local)
                } else {
                  toHistory.push(local)
                }
              } else {
                if (isMobileWork) {
                  const idx = merged.findIndex((a: any) => (a.number || a.id) === key)
                  if (idx >= 0) merged[idx] = local
                  else merged.push(local)
                } else {
                  const localUpdated = local.updatedAt ? new Date(local.updatedAt).getTime() : 0
                  const serverUpdated = serverArtwork.updatedAt ? new Date(serverArtwork.updatedAt).getTime() : 0
                  if (localUpdated > serverUpdated) {
                    const idx = merged.findIndex((a: any) => (a.number || a.id) === key)
                    if (idx >= 0) merged[idx] = local
                    else merged.push(local)
                  }
                }
              }
            })
            
            if (toHistory.length > 0) appendToHistory(toHistory)
            
            console.log('✅ Werke gemergt (Server = Quelle):', merged.length, 'Gesamt,', toHistory.length, 'in History')
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
      } else {
        const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768
        const onLocalLan = isLocalOrPrivateOrigin()
        const localHint = onLocalLan
          ? '\n• Im LAN (192.168.0.x): Auf dem Mac „Veröffentlichen“ klicken, damit gallery-data.json existiert. Dev-Server muss laufen (npm run dev).'
          : ''
        if (!response) {
          alert(
            '⚠️ Aktualisieren fehlgeschlagen.\n\n' +
            '• Verbindung prüfen (WLAN/Mobilfunk)\n' +
            (isMobileDevice ? '• QR-Code NEU scannen (lädt aktuelle Version)\n' : '') +
            localHint +
            '\n• Oder in 1–2 Min. erneut versuchen'
          )
        } else {
          alert(
            `⚠️ Keine neuen Daten (HTTP ${response.status}).\n\n` +
            '• Nach Veröffentlichung 2–3 Min. warten\n' +
            (isMobileDevice ? '• QR-Code NEU scannen (frischer Laden)\n' : '') +
            localHint +
            '\n• Oder: Seite komplett neu laden (Pull nach unten)'
          )
        }
      }
      } catch (error) {
        console.error('❌ Fehler beim Aktualisieren:', error)
        alert('⚠️ Aktualisieren fehlgeschlagen.\n\nBitte Verbindung prüfen oder später erneut versuchen.')
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
      const localArtworks = safeParseArtworks()
      
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
        const pathAndQuery = `/gallery-data.json?v=${timestamp}&t=${timestamp}&_=${Math.random()}`
        
        // WICHTIG: Timeout hinzufügen um Hänger zu vermeiden
        controller = new AbortController()
        timeoutId = setTimeout(() => {
          if (controller) controller.abort()
        }, 8000) // 8 Sekunden Timeout (kürzer = weniger Crash-Risiko)
        
        const fetchOpts = {
          cache: 'no-store' as RequestCache,
          method: 'GET' as const,
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        }

        let response: Response | null = null
        try {
          response = await fetch(pathAndQuery, fetchOpts)
        } catch (_) {
          response = null
        }
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
        if ((!response || !response.ok) && !window.location.hostname.includes('vercel.app')) {
          try {
            controller = new AbortController()
            timeoutId = setTimeout(() => { if (controller) controller.abort() }, 8000)
            response = await fetch(GALLERY_DATA_PUBLIC_URL + pathAndQuery, { ...fetchOpts, signal: controller.signal })
          } catch (_) {
            response = response || null
          }
          if (timeoutId) {
            clearTimeout(timeoutId)
            timeoutId = null
          }
        }

        if (response?.ok) {
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
          
          // Lade auch Werke - SERVER = QUELLE DER WAHRHEIT (wie handleRefresh)
          if (data.artworks && Array.isArray(data.artworks)) {
            try {
              const localArtworks = safeParseArtworks()
              const serverArtworks = data.artworks
              
              const serverMap = new Map<string, any>()
              serverArtworks.forEach((a: any) => {
                const key = a.number || a.id
                if (key) serverMap.set(key, a)
              })
              
              const merged: any[] = [...serverArtworks]
              const toHistory: any[] = []
              
              localArtworks.forEach((local: any) => {
                const key = local.number || local.id
                if (!key) return
                const serverArtwork = serverMap.get(key)
                const isMobileWork = local.createdOnMobile || local.updatedOnMobile
                const createdAt = local.createdAt ? new Date(local.createdAt).getTime() : 0
                const isVeryNew = createdAt > Date.now() - 600000
                
                if (!serverArtwork) {
                  if (isMobileWork && isVeryNew) merged.push(local)
                  else toHistory.push(local)
                } else {
                  if (isMobileWork) {
                    const idx = merged.findIndex((a: any) => (a.number || a.id) === key)
                    if (idx >= 0) merged[idx] = local
                    else merged.push(local)
                  } else {
                    const localUpdated = local.updatedAt ? new Date(local.updatedAt).getTime() : 0
                    const serverUpdated = serverArtwork.updatedAt ? new Date(serverArtwork.updatedAt).getTime() : 0
                    if (localUpdated > serverUpdated) {
                      const idx = merged.findIndex((a: any) => (a.number || a.id) === key)
                      if (idx >= 0) merged[idx] = local
                      else merged.push(local)
                    }
                  }
                }
              })
              
              if (toHistory.length > 0) appendToHistory(toHistory)
              
              localStorage.setItem('k2-artworks', JSON.stringify(merged))
              console.log('✅ Werke gemergt beim Initial-Load (Server = Quelle):', merged.length, 'Gesamt,', toHistory.length, 'in History')
              console.log('📋 Lokale Nummern:', localArtworks.map((a: any) => a.number || a.id).join(', '))
              console.log('📋 Server Nummern:', serverArtworks.map((a: any) => a.number || a.id).join(', '))
              console.log('📋 Gemergte Nummern:', merged.map((a: any) => a.number || a.id).join(', '))
              // Trigger Event für andere Komponenten (z.B. GalerieVorschauPage)
              window.dispatchEvent(new CustomEvent('artworks-updated', { detail: { count: merged.length, fromGaleriePage: true, initialLoad: true } }))
            } catch (e) {
              console.warn('⚠️ Werke zu groß für localStorage:', e)
              // Bei Fehler: Behalte lokale Werke!
              const localArtworks = safeParseArtworks()
              if (localArtworks.length > 0) {
                console.log('🔒 Fehler beim Merge beim Initial-Load - behalte lokale Werke:', localArtworks.length)
                localStorage.setItem('k2-artworks', JSON.stringify(localArtworks))
              }
            }
          } else {
            // KEINE Server-Daten - behalte ALLE lokalen Werke!
            const localArtworks = safeParseArtworks()
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
          console.log('ℹ️ gallery-data.json nicht verfügbar (HTTP ' + (response?.status ?? 'n/a') + ') - verwende localStorage')
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
    
    // Stammdaten-Updates: Prüfe alle 2 Sekunden localStorage (ohne storage-Event = kein Render-Loop)
    const checkStammdatenUpdate = () => {
      if (!isMounted) return
      try {
        const martinaStored = localStorage.getItem('k2-stammdaten-martina')
        if (martinaStored) {
          const data = JSON.parse(martinaStored)
          setMartinaData(prev => {
            if (prev.email !== data.email || prev.phone !== data.phone || prev.name !== data.name) {
              return { name: data.name || 'Martina Kreinecker', email: data.email || '', phone: data.phone || '' }
            }
            return prev
          })
        }
      } catch {}
      try {
        const georgStored = localStorage.getItem('k2-stammdaten-georg')
        if (georgStored) {
          const data = JSON.parse(georgStored)
          setGeorgData(prev => {
            if (prev.email !== data.email || prev.phone !== data.phone || prev.name !== data.name) {
              return { name: data.name || 'Georg Kreinecker', email: data.email || '', phone: data.phone || '' }
            }
            return prev
          })
        }
      } catch {}
      try {
        const galleryStored = localStorage.getItem('k2-stammdaten-galerie')
        if (galleryStored) {
          const data = JSON.parse(galleryStored)
          setGalleryData(prev => {
            if (prev.address !== data.address || prev.phone !== data.phone || prev.email !== data.email || prev.website !== data.website) {
              return {
                address: data.address || '', phone: data.phone || '', email: data.email || '',
                website: data.website || 'www.k2-galerie.at', internetadresse: data.internetadresse || data.website || '',
                adminPassword: data.adminPassword || 'k2Galerie2026', welcomeImage: data.welcomeImage || '', virtualTourImage: data.virtualTourImage || ''
              }
            }
            return prev
          })
          setAdminPassword(data.adminPassword || 'k2Galerie2026')
        }
      } catch {}
    }
    
    const intervalId = setInterval(checkStammdatenUpdate, 2000)
    loadData()
    
    // Ein einziger Cleanup: interval, timeout, controller, isMounted
    return () => {
      isMounted = false
      clearInterval(intervalId)
      if (timeoutId) clearTimeout(timeoutId)
      if (controller) controller.abort()
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

  const theme = musterOnly
    ? { text: 'var(--k2-text)', muted: 'var(--k2-muted)', accent: 'var(--k2-accent)', accentGradient: 'linear-gradient(135deg, var(--k2-accent) 0%, #6b9080 100%)', cardBg: 'var(--k2-card-bg-1)' }
    : { text: '#ffffff', muted: 'rgba(255,255,255,0.7)', accent: '#5ffbf1', accentGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', cardBg: 'rgba(18,22,35,0.95)' }

  return (
    <div style={{ 
      minHeight: '-webkit-fill-available',
      background: musterOnly
        ? 'linear-gradient(135deg, var(--k2-bg-1) 0%, var(--k2-bg-2) 50%, var(--k2-bg-3) 100%)'
        : 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1419 100%)',
      color: musterOnly ? 'var(--k2-text)' : '#ffffff',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Animated Background Elements (ök2: dezent für Wohlbefinden) */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: musterOnly
          ? 'radial-gradient(circle at 30% 40%, rgba(90, 122, 110, 0.08), transparent 50%), radial-gradient(circle at 70% 70%, rgba(90, 122, 110, 0.05), transparent 50%)'
          : 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.15), transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 119, 198, 0.1), transparent 50%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Optional: Link für Internet-Zugriff – nur auf Desktop, nicht auf iPhone/iPad */}
        {isLocalOrPrivateOrigin() && !(isMobileDevice || isMobile) && (
          <div style={{
            padding: '0.5rem 1rem',
            margin: '0 0 0.5rem 0',
            background: 'rgba(0,0,0,0.2)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            fontSize: '0.8rem',
            textAlign: 'center'
          }}>
            <span style={{ marginRight: '0.5rem', color: musterOnly ? 'var(--k2-text)' : 'rgba(255,255,255,0.75)' }}>
              Auch aus anderem WLAN erreichbar:
            </span>
            <a href={getK2PublicPageUrl()} target="_blank" rel="noopener noreferrer" style={{ color: musterOnly ? 'var(--k2-accent)' : '#5ffbf1', fontWeight: 600, textDecoration: 'underline' }}>
              K2 im Internet öffnen
            </a>
          </div>
        )}
        {/* Admin Button – auf normaler Galerie und auf ök2-Willkommensseite (eigener Admin-Zugang) */}
        {/* iPhone: safe-area-inset-top + größerer Abstand, damit Button unter Notch sichtbar bleibt */}
        <button
          onClick={handleAdminButtonClick}
          style={{
            position: 'fixed',
            top: 'max(clamp(1rem, 2vw, 1.5rem), calc(env(safe-area-inset-top, 0px) + 1rem))',
            right: 'clamp(1rem, 2vw, 1.5rem)',
            background: musterOnly ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: musterOnly ? '1px solid rgba(45, 45, 42, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)',
            color: musterOnly ? 'var(--k2-text)' : 'rgba(255, 255, 255, 0.5)',
            padding: 'clamp(0.5rem, 1.5vw, 0.75rem) clamp(0.75rem, 2vw, 1rem)',
            borderRadius: '8px',
            fontSize: 'clamp(0.7rem, 1.8vw, 0.85rem)',
            cursor: 'pointer',
            zIndex: 1000,
            transition: 'all 0.3s ease',
            opacity: (isMobileDevice || isMobile) ? 0.9 : 0.6,
            touchAction: 'manipulation',
            minWidth: '44px',
            minHeight: '44px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1'
            e.currentTarget.style.background = musterOnly ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = (isMobileDevice || isMobile) ? '0.9' : '0.6'
            e.currentTarget.style.background = musterOnly ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.05)'
          }}
          onTouchStart={(e) => {
            e.currentTarget.style.opacity = '1'
            e.currentTarget.style.background = musterOnly ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.15)'
          }}
          onTouchEnd={(e) => {
            setTimeout(() => {
              e.currentTarget.style.opacity = (isMobileDevice || isMobile) ? '0.9' : '0.6'
              e.currentTarget.style.background = musterOnly ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.05)'
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
                background: musterOnly ? 'linear-gradient(135deg, var(--k2-bg-1) 0%, var(--k2-bg-2) 100%)' : 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
                border: musterOnly ? '1px solid rgba(45, 45, 42, 0.15)' : '1px solid rgba(255, 255, 255, 0.2)',
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
              background: musterOnly ? 'linear-gradient(135deg, var(--k2-text) 0%, var(--k2-accent) 100%)' : 'linear-gradient(135deg, #ffffff 0%, #b8b8ff 100%)',
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
              color: musterOnly ? 'var(--k2-muted)' : 'rgba(255, 255, 255, 0.7)', 
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
              color: musterOnly ? 'var(--k2-text)' : '#ffffff',
              letterSpacing: '-0.02em'
            }}>
              Willkommen bei {tenantConfig.galleryName} –<br />
              <span style={{
                background: musterOnly ? 'linear-gradient(135deg, var(--k2-accent) 0%, #6b9080 100%)' : 'linear-gradient(135deg, #b8b8ff 0%, #ff77c6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {tenantConfig.tagline}
              </span>
            </h2>
            <p style={{ 
              fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', 
              color: musterOnly ? 'var(--k2-muted)' : 'rgba(255, 255, 255, 0.8)',
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
              color: musterOnly ? 'var(--k2-text)' : '#ffffff',
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
                  background: theme.accentGradient,
                  color: theme.text,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 'clamp(2rem, 5vw, 2.5rem)',
                  fontWeight: '700',
                  margin: '0 auto clamp(1.5rem, 4vw, 2rem)',
                  boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)'
                }}>
                  {(musterOnly ? MUSTER_TEXTE.martina.name : (tenantId === 'demo' ? tenantConfig.artist1Name : ((tenantId === 'k2' && (martinaData.name === 'Künstlerin Muster' || !martinaData.name)) ? tenantConfig.artist1Name : (martinaData.name || tenantConfig.artist1Name)))).charAt(0)}
                </div>
                <h4 style={{
                  margin: '0 0 0.75rem',
                  fontSize: 'clamp(1.25rem, 3.5vw, 1.75rem)',
                  color: '#ffffff',
                  fontWeight: '600'
                }}>
                  {musterOnly ? MUSTER_TEXTE.martina.name : (tenantId === 'demo' ? tenantConfig.artist1Name : ((tenantId === 'k2' && (martinaData.name === 'Künstlerin Muster' || !martinaData.name)) ? tenantConfig.artist1Name : (martinaData.name || tenantConfig.artist1Name)))}
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
                  background: musterOnly ? 'linear-gradient(135deg, #6b9080 0%, var(--k2-accent) 100%)' : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: theme.text,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 'clamp(2rem, 5vw, 2.5rem)',
                  fontWeight: '700',
                  margin: '0 auto clamp(1.5rem, 4vw, 2rem)',
                  boxShadow: '0 10px 30px rgba(245, 87, 108, 0.4)'
                }}>
                  {(musterOnly ? MUSTER_TEXTE.georg.name : (tenantId === 'demo' ? tenantConfig.artist2Name : ((tenantId === 'k2' && (georgData.name === 'Künstler Muster' || !georgData.name)) ? tenantConfig.artist2Name : (georgData.name || tenantConfig.artist2Name)))).charAt(0)}
                </div>
                <h4 style={{
                  margin: '0 0 0.75rem',
                  fontSize: 'clamp(1.25rem, 3.5vw, 1.75rem)',
                  color: '#ffffff',
                  fontWeight: '600'
                }}>
                  {musterOnly ? MUSTER_TEXTE.georg.name : (tenantId === 'demo' ? tenantConfig.artist2Name : ((tenantId === 'k2' && (georgData.name === 'Künstler Muster' || !georgData.name)) ? tenantConfig.artist2Name : (georgData.name || tenantConfig.artist2Name)))}
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
              {musterOnly ? MUSTER_TEXTE.gemeinsamText : `Gemeinsam eröffnen ${tenantId === 'demo' ? tenantConfig.artist1Name : ((tenantId === 'k2' && (martinaData.name === 'Künstlerin Muster' || !martinaData.name)) ? tenantConfig.artist1Name : (martinaData.name || tenantConfig.artist1Name))} und ${tenantId === 'demo' ? tenantConfig.artist2Name : ((tenantId === 'k2' && (georgData.name === 'Künstler Muster' || !georgData.name)) ? tenantConfig.artist2Name : (georgData.name || tenantConfig.artist2Name))} nach über 20 Jahren kreativer Tätigkeit die ${tenantConfig.galleryName} – ein Raum, wo Malerei und Keramik verschmelzen und Kunst zum Leben erwacht.`}
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
                    <p style={{ margin: '0 0 0.25rem', fontWeight: '500', color: theme.text, fontSize: 'clamp(0.95rem, 2.2vw, 1.1rem)' }}>
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
                          ✉️ <a href={`mailto:${musterOnly ? MUSTER_TEXTE.gallery.email : galleryData.email}`} style={{ color: musterOnly ? 'var(--k2-accent)' : '#b8b8ff', textDecoration: 'none' }}>
                            {musterOnly ? MUSTER_TEXTE.gallery.email : galleryData.email}
                          </a>
                        </span>
                      )}
                      {(musterOnly ? MUSTER_TEXTE.gallery.website : galleryData.website) && (
                        <span style={{ fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)' }}>
                          🌐 <a href={`https://${(musterOnly ? MUSTER_TEXTE.gallery.website : galleryData.website).replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" style={{ color: musterOnly ? 'var(--k2-accent)' : '#b8b8ff', textDecoration: 'none' }}>
                            {musterOnly ? MUSTER_TEXTE.gallery.website : galleryData.website}
                          </a>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Martina Kontakt - Kompakt (ök2: immer aus MUSTER_TEXTE) */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <p style={{ margin: '0 0 0.15rem', fontWeight: '500', color: theme.text, fontSize: 'clamp(0.95rem, 2.2vw, 1.1rem)' }}>
                      {musterOnly ? MUSTER_TEXTE.martina.name : ((tenantId === 'k2' && (martinaData.name === 'Künstlerin Muster' || !martinaData.name)) ? tenantConfig.artist1Name : (martinaData.name || tenantConfig.artist1Name))}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {(musterOnly ? MUSTER_TEXTE.martina.phone : martinaData.phone) && (
                        <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)' }}>
                          📞 {musterOnly ? MUSTER_TEXTE.martina.phone : martinaData.phone}
                        </span>
                      )}
                      {(musterOnly ? MUSTER_TEXTE.martina.email : martinaData.email) && (
                        <span style={{ fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)' }}>
                          ✉️ <a href={`mailto:${musterOnly ? MUSTER_TEXTE.martina.email : martinaData.email}`} style={{ color: musterOnly ? 'var(--k2-accent)' : '#b8b8ff', textDecoration: 'none' }}>
                            {musterOnly ? MUSTER_TEXTE.martina.email : martinaData.email}
                          </a>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Georg Kontakt - Kompakt (ök2: immer aus MUSTER_TEXTE) */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <p style={{ margin: '0 0 0.15rem', fontWeight: '500', color: theme.text, fontSize: 'clamp(0.95rem, 2.2vw, 1.1rem)' }}>
                      {musterOnly ? MUSTER_TEXTE.georg.name : ((tenantId === 'k2' && (georgData.name === 'Künstler Muster' || !georgData.name)) ? tenantConfig.artist2Name : (georgData.name || tenantConfig.artist2Name))}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {(musterOnly ? MUSTER_TEXTE.georg.phone : georgData.phone) && (
                        <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)' }}>
                          📞 {musterOnly ? MUSTER_TEXTE.georg.phone : georgData.phone}
                        </span>
                      )}
                      {(musterOnly ? MUSTER_TEXTE.georg.email : georgData.email) && (
                        <span style={{ fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)' }}>
                          ✉️ <a href={`mailto:${musterOnly ? MUSTER_TEXTE.georg.email : georgData.email}`} style={{ color: musterOnly ? 'var(--k2-accent)' : '#b8b8ff', textDecoration: 'none' }}>
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
                
                {/* Rechte Seite: genau ein QR (Vercel – funktioniert überall) */}
                {vercelQrDataUrl && (
                    <div style={{
                      textAlign: 'center',
                      flexShrink: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      alignItems: 'center'
                    }}>
                      <p style={{ margin: '0 0 0.25rem', fontSize: 'clamp(0.7rem, 1.6vw, 0.8rem)', color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                        📱 Für iPad/Handy: QR scannen (immer aktueller Stand)
                      </p>
                      <div style={{ background: '#fff', padding: '0.4rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                        <img src={vercelQrDataUrl} alt="QR Galerie" style={{ width: 100, height: 100, display: 'block' }} />
                      </div>
                      <p style={{ margin: 0, fontSize: 'clamp(0.55rem, 1.2vw, 0.65rem)', color: 'rgba(255,255,255,0.5)', wordBreak: 'break-all', maxWidth: 140 }}>
                        k2-galerie.vercel.app
                      </p>
                    </div>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default GaleriePage
