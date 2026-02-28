import React, { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PROJECT_ROUTES, PLATFORM_ROUTES, getAllProjectIds } from '../config/navigation'
import { usePersistentBoolean } from '../hooks/usePersistentState'
import { checkMobileUpdates } from '../utils/supabaseClient'
import { filterK2ArtworksOnly } from '../utils/autoSave'
import { readArtworksRawByKey, saveArtworksByKey } from '../utils/artworksStorage'
import '../App.css'
import GaleriePage from './GaleriePage'
import GalerieVorschauPage from './GalerieVorschauPage'
import ProduktVorschauPage from './ProduktVorschauPage'
import MarketingOek2Page from './MarketingOek2Page'
import PlatzanordnungPage from './PlatzanordnungPage'
import ShopPage from './ShopPage'
import ControlStudioPage from './ControlStudioPage'
import ProjectPlanPage from './ProjectPlanPage'
import ScreenshotExportAdmin from '../../components/ScreenshotExportAdmin'
import ProjectsPage from './ProjectsPage'
import PlatformStartPage from './PlatformStartPage'
import SmartPanel from '../components/SmartPanel'
import { BUILD_TIMESTAMP } from '../buildInfo.generated'
import { getPageContentGalerie } from '../config/pageContentGalerie'

// Helper: Lese persistent Boolean ohne Hook (für useMemo)
function getPersistentBoolean(key: string): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(key) === '1'
}

type ViewMode = 'mobile' | 'tablet' | 'desktop' | 'split'

type PageSection = 
  | { id: string; name: string; icon: string; scrollTo: string }
  | { id: string; name: string; icon: string; filter: string }
  | { id: string; name: string; icon: string; path: string }

const DevViewPage = ({ defaultPage }: { defaultPage?: string }) => {
  const [searchParams] = useSearchParams()
  const pageFromUrl = searchParams.get('page')
  const [checkingVercel, setCheckingVercel] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  
  // WICHTIG: publishMobile Funktion muss außerhalb des useEffect definiert werden
  // damit sie von Event-Listenern aufgerufen werden kann
  const publishMobileRef = React.useRef<(() => Promise<void>) | null>(null)
  
  // KEINE automatische Vercel-Prüfung mehr - verursacht Abstürze!
  // Verwende nur den manuellen "🔍 Vercel-Status" Button
  
  // Vercel-Status prüfen - MIT TIMEOUT UND CRASH-SCHUTZ
  const checkVercelStatus = () => {
    if (checkingVercel) return
    
    setCheckingVercel(true)
    
    // Timeout nach 10 Sekunden - verhindert Hänger
    const timeoutId = setTimeout(() => {
      setCheckingVercel(false)
      alert('⚠️ Vercel-Check:\n\nTimeout nach 10 Sekunden\n\nPrüfe manuell: https://vercel.com/dashboard')
    }, 10000)
    
    try {
      // Fetch mit Timeout
      const controller = new AbortController()
      const fetchTimeout = setTimeout(() => controller.abort(), 8000) // 8 Sekunden Timeout
      
      fetch('https://k2-galerie.vercel.app/gallery-data.json?t=' + Date.now(), {
        signal: controller.signal
      })
        .then(response => {
          clearTimeout(fetchTimeout)
          clearTimeout(timeoutId)
          if (response.ok) {
            return response.json()
          }
          throw new Error('HTTP ' + response.status)
        })
        .then(data => {
          const exportedAt = data?.exportedAt || 'nicht gefunden'
          alert(`✅ Vercel-Status:\n\nDatei verfügbar\nExportedAt: ${exportedAt}\n\nPrüfe: https://vercel.com/dashboard`)
        })
        .catch(err => {
          clearTimeout(fetchTimeout)
          clearTimeout(timeoutId)
          if (err.name === 'AbortError') {
            alert('⚠️ Vercel-Check:\n\nTimeout - Anfrage dauerte zu lange\n\nPrüfe: https://vercel.com/dashboard')
          } else {
            alert('⚠️ Vercel-Check:\n\nDatei nicht verfügbar\n\nPrüfe: https://vercel.com/dashboard')
          }
        })
        .finally(() => {
          clearTimeout(fetchTimeout)
          clearTimeout(timeoutId)
          setCheckingVercel(false)
        })
    } catch (error) {
      clearTimeout(timeoutId)
      setCheckingVercel(false)
      alert('⚠️ Vercel-Check Fehler:\n\n' + (error instanceof Error ? error.message : String(error)))
    }
  }
  
  // Auto-Desktop für localhost
  const isLocalhost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '192.168.0.31' ||
    window.location.hostname === '192.168.0.27'
  )
  
  const APF_LAST_PAGE_KEY = 'k2-apf-last-page'

  // Standardmäßig Desktop-Ansicht für optimale Arbeitsansicht
  const [viewMode, setViewMode] = useState<ViewMode>(isLocalhost ? 'desktop' : 'desktop')
  // Beim Zurückkehren zur APf: leerer Desktop (wie Mac-Desktop). Nur wenn ?page= gesetzt ist, direkt öffnen.
  const [currentPage, setCurrentPage] = useState(() => {
    if (pageFromUrl) return pageFromUrl
    // Kein automatisches Wiederherstellen der letzten Seite – Desktop startet leer
    return defaultPage || 'desktop-leer'
  })
  const [mobileZoom, setMobileZoom] = useState(1)
  const [desktopZoom, setDesktopZoom] = useState(1)

  // Alten gespeicherten Wert beim ersten Laden löschen → Desktop startet immer leer
  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.removeItem(APF_LAST_PAGE_KEY)
  }, []) // nur einmal beim Mount

  // Aktuelle Seite in localStorage merken – desktop-leer NICHT speichern
  useEffect(() => {
    if (currentPage && currentPage !== 'desktop-leer' && typeof window !== 'undefined') {
      localStorage.setItem(APF_LAST_PAGE_KEY, currentPage)
    }
  }, [currentPage])

  // Update currentPage NUR wenn explizit ein ?page= Parameter gesetzt ist
  // Nicht bei leerem pageFromUrl – sonst wird die zuletzt gemerkte Seite überschrieben
  useEffect(() => {
    if (pageFromUrl && pageFromUrl.trim()) {
      setCurrentPage(pageFromUrl)
    }
  }, [pageFromUrl])

  // Auf Mobile: "platform" Tab automatisch zu "galerie" umleiten
  useEffect(() => {
    const isMobileDevice = typeof window !== 'undefined' && (
      window.innerWidth <= 768 || 
      /iPad|iPhone|iPod/.test(navigator.userAgent)
    )
    
    if (isMobileDevice && currentPage === 'platform') {
      console.log('📱 Mobile erkannt - leite von "platform" zu "galerie" um...')
      setCurrentPage('galerie')
    }
  }, [currentPage])

  // Bereiche der aktuellen Seite für untere Navigationsleiste
  const getPageSections = (): PageSection[] => {
    if (currentPage === 'galerie' || currentPage === 'galerie-oeffentlich') {
      // Bereiche der Galerie-Homepage (K2 bzw. ök2)
      return [
        { id: 'willkommen', name: 'Willkommen', icon: '👋', scrollTo: 'willkommen' },
        { id: 'galerie', name: 'Galerie', icon: '🎨', scrollTo: 'galerie-vorschau' },
        { id: 'kunstschaffende', name: 'Künstler', icon: '👨‍🎨', scrollTo: 'kunstschaffende' },
      ]
    }
    if (currentPage === 'galerie-vorschau' || currentPage === 'galerie-oeffentlich-vorschau') {
      // Filter für Galerie-Vorschau
      return [
        { id: 'alle', name: 'Alle', icon: '📋', filter: 'alle' },
        { id: 'malerei', name: 'Bilder', icon: '🖼️', filter: 'malerei' },
        { id: 'keramik', name: 'Keramik', icon: '🏺', filter: 'keramik' },
      ]
    }
    // Standard: Projektseiten
    return [
      { id: 'galerie', name: 'Galerie', icon: '🎨', path: PROJECT_ROUTES['k2-galerie'].galerie },
      { id: 'control', name: 'Control', icon: '🎛️', path: PROJECT_ROUTES['k2-galerie'].controlStudio },
      { id: 'mission', name: 'Plan', icon: '📋', path: PROJECT_ROUTES['k2-galerie'].plan },
      { id: 'mobile', name: 'Mobile', icon: '📱', path: PROJECT_ROUTES['k2-galerie'].mobileConnect },
      { id: 'admin', name: 'Admin', icon: '⚙️', path: '/admin' },
    ]
  }

  const pageSections = getPageSections()
  const [galerieFilter, setGalerieFilter] = useState<'alle' | 'malerei' | 'keramik'>('alle')
  const [galerieSection, setGalerieSection] = useState<string>('willkommen')

  // Grafiker-Tisch: aktive Seite → iframe-URL
  const getGrafikerUrl = (): string => {
    switch (currentPage) {
      case 'galerie': return PROJECT_ROUTES['k2-galerie'].galerie
      case 'galerie-oeffentlich': return PROJECT_ROUTES['k2-galerie'].galerieOeffentlich
      case 'galerie-vorschau': return PROJECT_ROUTES['k2-galerie'].galerieVorschau
      case 'galerie-oeffentlich-vorschau': return PROJECT_ROUTES['k2-galerie'].galerieOeffentlichVorschau
      case 'willkommen': return '/willkommen'
      default: return PROJECT_ROUTES['k2-galerie'].galerieOeffentlich
    }
  }
  const getGrafikerLabel = (): string => {
    switch (currentPage) {
      case 'galerie': return '🏛️ K2 Galerie (echt)'
      case 'galerie-oeffentlich': return '🖼️ Galerie ök2'
      case 'galerie-vorschau': return '🎨 Werke-Vorschau K2'
      case 'galerie-oeffentlich-vorschau': return '🎨 Werke-Vorschau ök2'
      case 'willkommen': return '👋 Willkommensseite'
      default: return '🖼️ Galerie'
    }
  }
  const [gitPushing, setGitPushing] = useState(false)
  // Smart Panel standardmäßig geöffnet (false = nicht minimiert)
  // WICHTIG: Standardmäßig NICHT minimiert damit es sichtbar ist
  const [panelMinimized, setPanelMinimized] = useState(false) // Immer sichtbar beim Start
  const [grafikerTischOpen, setGrafikerTischOpen] = useState(false)
  const [grafikerReloadKey, setGrafikerReloadKey] = useState(0)
  const [grafikerNotizOpen, setGrafikerNotizOpen] = useState(false)
  const [grafikerNotizText, setGrafikerNotizText] = useState(() => {
    try { return localStorage.getItem('grafiker-notiz-entwurf') || '' } catch { return '' }
  })
  const [grafikerNotizGespeichert, setGrafikerNotizGespeichert] = useState(false)

  const grafikerNotizSpeichern = () => {
    if (!grafikerNotizText.trim()) return
    const datum = new Date().toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
    const eintrag = `- [${datum}] ${grafikerNotizText.trim()}`
    // In localStorage für nächste Session merken
    const bisherige = (() => { try { return localStorage.getItem('grafiker-notizen-offen') || '' } catch { return '' } })()
    const neu = bisherige ? bisherige + '\n' + eintrag : eintrag
    try { localStorage.setItem('grafiker-notizen-offen', neu) } catch { /* ignore */ }
    try { localStorage.setItem('grafiker-notiz-entwurf', '') } catch { /* ignore */ }
    setGrafikerNotizText('')
    setGrafikerNotizGespeichert(true)
    setTimeout(() => setGrafikerNotizGespeichert(false), 2500)
  }
  
  // Speichere Panel-Status in localStorage (optional)
  useEffect(() => {
    if (panelMinimized) {
      localStorage.setItem('devview-panel-minimized', '1')
    } else {
      localStorage.removeItem('devview-panel-minimized') // Entferne wenn geöffnet
    }
  }, [panelMinimized])
  const [publishStatus, setPublishStatus] = useState<{ success: boolean; message: string; artworksCount?: number; size?: number } | null>(null)
  const [syncStatus, setSyncStatus] = useState<{ step: 'published' | 'git-push' | 'vercel-deploy' | 'ready' | null; progress: number }>({ step: null, progress: 0 })
  const [lastPublishedTime, setLastPublishedTime] = useState<string | null>(() => localStorage.getItem('k2-last-published-time'))
  const [mobileSyncAvailable, setMobileSyncAvailable] = useState(false)
  
  // publishMobile Funktion - außerhalb des onClick Handlers definiert
  const publishMobile = React.useCallback(async () => {
    if (isPublishing) return // Verhindere mehrfaches Klicken
    setIsPublishing(true)
    
    try {
      const getItemSafe = (key: string, defaultValue: any) => {
        try {
          const item = localStorage.getItem(key)
          if (!item || item.length > 1000000) return defaultValue
          return JSON.parse(item)
        } catch {
          return defaultValue
        }
      }
      
      let artworks = readArtworksRawByKey('k2-artworks')
      if (!Array.isArray(artworks)) artworks = []
      const events = getItemSafe('k2-events', [])
      const documents = getItemSafe('k2-documents', [])
      
      // WICHTIG: Lade Mobile-Werke von Supabase BEVOR veröffentlicht wird
      // Das stellt sicher, dass alle Mobile-Werke in gallery-data.json enthalten sind
      try {
        const { loadArtworksFromSupabase } = await import('../utils/supabaseClient')
        const supabaseArtworks = await loadArtworksFromSupabase()
        
        if (supabaseArtworks && Array.isArray(supabaseArtworks) && supabaseArtworks.length > 0) {
          console.log('📱 Mobile-Werke von Supabase geladen:', supabaseArtworks.length)
          
          // Merge mit lokalen Werken - Mobile-Werke haben Priorität
          const localArtworks = Array.isArray(artworks) ? artworks : []
          const merged: any[] = []
          
          // Erstelle Map für schnelle Suche
          const localMap = new Map<string, any>()
          localArtworks.forEach((a: any) => {
            const key = a.number || a.id
            if (key) localMap.set(key, a)
          })
          
          // Füge zuerst alle lokalen Werke hinzu
          localArtworks.forEach((a: any) => merged.push(a))
          
          // Dann füge Mobile-Werke hinzu oder ersetze lokale Versionen
          supabaseArtworks.forEach((supabaseArtwork: any) => {
            const key = supabaseArtwork.number || supabaseArtwork.id
            if (!key) return
            
            const localArtwork = localMap.get(key)
            const isMobileWork = supabaseArtwork.createdOnMobile || supabaseArtwork.updatedOnMobile
            
            if (!localArtwork) {
              // Mobile-Werk existiert nicht lokal → hinzufügen
              console.log('📱 Füge Mobile-Werk hinzu:', key)
              merged.push(supabaseArtwork)
            } else if (isMobileWork) {
              // Mobile-Werk → IMMER Mobile-Version verwenden
              console.log('📱 Ersetze lokales Werk mit Mobile-Version:', key)
              const index = merged.findIndex((a: any) => (a.number || a.id) === key)
              if (index >= 0) {
                merged[index] = supabaseArtwork
              } else {
                merged.push(supabaseArtwork)
              }
            } else {
              // Prüfe Timestamps - Mobile-Version könnte neuer sein
              const localUpdated = localArtwork.updatedAt ? new Date(localArtwork.updatedAt).getTime() : 0
              const mobileUpdated = supabaseArtwork.updatedAt ? new Date(supabaseArtwork.updatedAt).getTime() : 0
              
              if (mobileUpdated > localUpdated) {
                console.log('📱 Ersetze lokales Werk mit neuerer Mobile-Version:', key)
                const index = merged.findIndex((a: any) => (a.number || a.id) === key)
                if (index >= 0) {
                  merged[index] = supabaseArtwork
                }
              }
            }
          })
          
          if (merged.length > localArtworks.length) {
            const toSave = filterK2ArtworksOnly(merged)
            console.log(`✅ ${toSave.length - localArtworks.length} Mobile-Werke zu Veröffentlichung hinzugefügt`)
            artworks = toSave
            try {
              saveArtworksByKey('k2-artworks', toSave, { filterK2Only: false, allowReduce: true })
            } catch (e) {
              console.warn('⚠️ Konnte merged Werke nicht speichern:', e)
            }
          }
        }
      } catch (error) {
        console.warn('⚠️ Supabase-Check fehlgeschlagen (normal wenn nicht konfiguriert):', error)
        // Weiter mit lokalen Werken
      }
      
      // KRITISCH: Alle Werke mitnehmen, nicht nur die ersten 50
      const allArtworks = Array.isArray(artworks) ? artworks : []
      console.log('📦 Veröffentliche Werke:', allArtworks.length, 'Werke gefunden (inkl. Mobile-Werke)')
      
      // WICHTIG: Wenn keine Werke gefunden werden, zeige Warnung
      if (allArtworks.length === 0) {
        console.warn('⚠️ KEINE WERKE GEFUNDEN in localStorage!')
        setIsPublishing(false)
        alert('⚠️ Keine Werke gefunden! Bitte zuerst im Admin Werke anlegen.')
        return
      }
      
      const galleryStamm = getItemSafe('k2-stammdaten-galerie', {})
      const pageContent = getPageContentGalerie()
      const maxList = 100
      const data = {
        martina: getItemSafe('k2-stammdaten-martina', {}),
        georg: getItemSafe('k2-stammdaten-georg', {}),
        gallery: {
          ...galleryStamm,
          // pageContent hat Priorität (Admin-Upload) – || statt ?? weil '' kein Fallback auslöst bei ??
          welcomeImage: pageContent.welcomeImage || galleryStamm.welcomeImage || '',
          galerieCardImage: pageContent.galerieCardImage || galleryStamm.galerieCardImage || '',
          virtualTourImage: pageContent.virtualTourImage || galleryStamm.virtualTourImage || ''
        },
        artworks: allArtworks,
        events: Array.isArray(events) ? events.slice(0, maxList) : [],
        documents: Array.isArray(documents) ? documents.slice(0, maxList) : [],
        designSettings: getItemSafe('k2-design-settings', {}),
        pageTexts: getItemSafe('k2-page-texts', null),
        version: Date.now(),
        buildId: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
        exportedAt: new Date().toISOString()
      }
      
      const json = JSON.stringify(data)
      
      if (json.length > 5000000) {
        setIsPublishing(false)
        alert('⚠️ Daten zu groß (über 5MB). Bitte reduziere die Anzahl der Werke.')
        return
      }
      
      // Prüfung: Nur veröffentlichen wenn sich etwas geändert hat (sonst verwirrend)
      const signaturePayload = {
        a: allArtworks.map((x: any) => (x.number || x.id) + ':' + (x.updatedAt || x.createdAt || '')).sort().join(','),
        n: allArtworks.length,
        m: JSON.stringify(data.martina),
        g: JSON.stringify(data.georg),
        gal: JSON.stringify(data.gallery),
        e: data.events.length,
        d: data.documents.length,
        design: JSON.stringify(data.designSettings),
        // Bilder explizit in Signatur – damit Bild-Änderungen immer erkannt werden
        imgW: (data.gallery.welcomeImage || '').length,
        imgG: (data.gallery.galerieCardImage || '').length,
        imgV: (data.gallery.virtualTourImage || '').length,
      }
      const simpleHash = (str: string) => {
        let h = 0
        for (let i = 0; i < str.length; i++) {
          h = ((h << 5) - h) + str.charCodeAt(i)
          h |= 0
        }
        return String(h)
      }
      const currentSignature = simpleHash(JSON.stringify(signaturePayload))
      const lastSignature = localStorage.getItem('k2-last-publish-signature')
      if (lastSignature !== null && lastSignature === currentSignature) {
        setIsPublishing(false)
        const lastBackup = localStorage.getItem('k2-last-publish-time')
        const backupLabel = lastBackup ? new Date(lastBackup).toLocaleString('de-AT', { dateStyle: 'short', timeStyle: 'short' }) : ''
        setPublishStatus({
          success: true,
          message: backupLabel
            ? `📁 Daten: Keine Änderungen\n\nNichts veröffentlicht – Stand wie beim letzten Backup (${backupLabel}).\n\nDaten sind identisch.`
            : '📁 Daten: Keine Änderungen – nichts veröffentlicht. Daten sind identisch mit dem letzten Stand.',
          artworksCount: allArtworks.length
        })
        setTimeout(() => setPublishStatus(null), 6000)
        return
      }
      
      // Versuche direkt in public Ordner zu schreiben über API
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
        setIsPublishing(false)
        alert('⚠️ Speichern dauert zu lange.\n\nBitte kurz warten und nochmal auf „Speichern" klicken.')
      }, 5000)
      
      fetch('/api/write-gallery-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: json,
        signal: controller.signal
      })
      .then(response => {
        clearTimeout(timeoutId)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        return response.json()
      })
      .then(result => {
        clearTimeout(timeoutId)
        
        if (result.success) {
          const artworksCount = data.artworks.length
          const backupTime = new Date().toISOString()
          try {
            localStorage.setItem('k2-last-publish-signature', currentSignature)
            localStorage.setItem('k2-last-publish-time', backupTime)
          } catch (_) {}
          console.log('✅ Datei geschrieben:', {
            path: result.path,
            size: result.size,
            artworksCount: artworksCount
          })
          
          // Klar als "Daten veröffentlicht" kennzeichnen (nicht Code-Update)
          const backupLabel = new Date(backupTime).toLocaleString('de-AT', { dateStyle: 'short', timeStyle: 'short' })
          const nowLabel = new Date().toLocaleString('de-AT', { dateStyle: 'short', timeStyle: 'short' })
          localStorage.setItem('k2-last-published-time', nowLabel)
          setLastPublishedTime(nowLabel)
          
          setPublishStatus({
            success: true,
            message: `✅ Gespeichert (${backupLabel})\n\nAlle Änderungen werden jetzt auf alle Geräte übertragen.`,
            artworksCount,
            size: result.size
          })
          
          setSyncStatus({ step: 'published', progress: 10 })
          
          setIsPublishing(false)
          
          setTimeout(() => {
            setPublishStatus(null)
          }, 120000) // 2 Minuten anzeigen
        } else {
          throw new Error(result.error || 'Unbekannter Fehler')
        }
      })
      .catch(error => {
        clearTimeout(timeoutId)
        setIsPublishing(false)
        
        if (error.name === 'AbortError') {
          setIsPublishing(false)
          setPublishStatus({
            success: false,
            message: '⚠️ Speichern dauert zu lange. Bitte nochmal versuchen.'
          })
          setTimeout(() => setPublishStatus(null), 5000)
          return
        }
        
        // Fallback: Download falls API nicht funktioniert
        try {
          const blob = new Blob([json], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = 'gallery-data.json'
          link.style.display = 'none'
          document.body.appendChild(link)
          link.click()
          
          setTimeout(() => {
            try {
              document.body.removeChild(link)
              URL.revokeObjectURL(url)
            } catch {}
            alert('⚠️ Automatisches Speichern nicht möglich (Server nicht aktiv).\n\nBitte dem Assistenten Bescheid geben – einmalige Einrichtung nötig.')
          }, 100)
        } catch (downloadError) {
          alert('❌ Fehler:\n\nAPI nicht verfügbar UND Download fehlgeschlagen\n\n' + (error instanceof Error ? error.message : String(error)))
        }
      })
    } catch (error) {
      setIsPublishing(false)
      alert('Fehler: ' + (error instanceof Error ? error.message : String(error)))
    }
  }, [isPublishing])
  
  // Speichere publishMobile in Ref beim Mount
  React.useEffect(() => {
    publishMobileRef.current = publishMobile
  }, [publishMobile])

  
  // Prüfe regelmäßig ob es neue Mobile-Daten gibt (nur auf Mac)
  useEffect(() => {
    const isMac = !/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) && window.innerWidth > 768
    if (!isMac) return // Nur auf Mac prüfen
    
    const checkForMobileUpdates = async () => {
      try {
        const { hasUpdates } = await checkMobileUpdates()
        setMobileSyncAvailable(hasUpdates)
      } catch (error) {
        console.warn('⚠️ Mobile-Update-Check fehlgeschlagen:', error)
      }
    }
    
    // Sofort prüfen
    checkForMobileUpdates()
    
    // Dann alle 10 Sekunden prüfen (häufiger für bessere Sync)
    const interval = setInterval(checkForMobileUpdates, 10000)
    return () => clearInterval(interval)
  }, [])
  
  // WICHTIG: Automatisches Veröffentlichen nach Admin-Speicherung
  useEffect(() => {
    const handleArtworkSaved = (event: Event) => {
      const customEvent = event as CustomEvent
      console.log('📦 Neues Werk im Admin gespeichert - automatisches Veröffentlichen...')
      const artworkCount = (customEvent.detail as any)?.artworkCount || 0
      
      // Warte kurz damit localStorage sicher gespeichert ist
      setTimeout(() => {
        // Prüfe ob publishMobile verfügbar ist
        if (publishMobileRef.current) {
          console.log('🚀 Rufe publishMobile() automatisch auf...')
          publishMobileRef.current()
        } else {
          console.warn('⚠️ publishMobile noch nicht verfügbar - Event wird ignoriert')
        }
      }, 1000) // 1 Sekunde warten damit localStorage sicher gespeichert ist
    }
    
    // Nach Veröffentlichung: automatischer Git Push (silently im Hintergrund)
    const handleGalleryDataPublished = (_event: Event) => {
      console.log('📦 gallery-data.json veröffentlicht – automatischer Git Push...')
      window.dispatchEvent(new CustomEvent('k2-auto-git-push'))
    }
    
    // Automatisches Veröffentlichen nach Design-Speichern (Aussehen-Tab)
    const handleDesignSavedPublish = () => {
      setTimeout(() => {
        if (publishMobileRef.current) {
          publishMobileRef.current()
          // Git Push folgt automatisch via 'gallery-data-published' → 'k2-auto-git-push'
        }
      }, 500)
    }

    window.addEventListener('artwork-saved-needs-publish', handleArtworkSaved)
    window.addEventListener('gallery-data-published', handleGalleryDataPublished)
    window.addEventListener('k2-design-saved-publish', handleDesignSavedPublish)
    
    return () => {
      window.removeEventListener('artwork-saved-needs-publish', handleArtworkSaved)
      window.removeEventListener('gallery-data-published', handleGalleryDataPublished)
      window.removeEventListener('k2-design-saved-publish', handleDesignSavedPublish)
    }
  }, [])
  
  // Mobile-Daten synchronisieren (Mac → lokal)
  const syncMobileData = async () => {
    try {
      const { hasUpdates, artworks } = await checkMobileUpdates()
      if (hasUpdates && artworks) {
        const toSave = filterK2ArtworksOnly(artworks)
        saveArtworksByKey('k2-artworks', toSave, { filterK2Only: false, allowReduce: true })
        localStorage.setItem('k2-last-load-time', Date.now().toString())
        const hash = toSave.map((a: any) => a.number || a.id).sort().join(',')
        localStorage.setItem('k2-artworks-hash', hash)
        
        // Event für andere Komponenten
        window.dispatchEvent(new CustomEvent('artworks-updated', { 
          detail: { count: toSave.length, manualSync: true } 
        }))
        
        setMobileSyncAvailable(false)
        alert(`✅ ${toSave.length} Werke von Mobile synchronisiert!`)
      } else {
        alert('ℹ️ Keine neuen Mobile-Daten gefunden')
      }
    } catch (error) {
      console.error('❌ Mobile-Sync Fehler:', error)
      alert('⚠️ Fehler bei Mobile-Sync: ' + (error instanceof Error ? error.message : String(error)))
    }
  }
  
  // Aktuelles Projekt & Status berechnen
  const currentProject = useMemo(() => {
    const projectId = 'k2-galerie' // Für jetzt: K2 Galerie als Standard
    const project = PROJECT_ROUTES[projectId]
    
    // Berechne Fortschritt basierend auf Tasks
    const phaseKeys = [
      'k2-mission-phase1-1', 'k2-mission-phase1-2', 'k2-mission-phase1-3', 'k2-mission-phase1-4',
      'k2-mission-phase2-1', 'k2-mission-phase2-2', 'k2-mission-phase2-3', 'k2-mission-phase2-4', 'k2-mission-phase2-5',
      'k2-mission-phase3-1', 'k2-mission-phase3-2', 'k2-mission-phase3-3', 'k2-mission-phase3-4', 'k2-mission-phase3-5',
      'k2-mission-phase4-1', 'k2-mission-phase4-2', 'k2-mission-phase4-3', 'k2-mission-phase4-4',
      'k2-mission-phase5-1', 'k2-mission-phase5-2', 'k2-mission-phase5-3', 'k2-mission-phase5-4', 'k2-mission-phase5-5', 'k2-mission-phase5-6', 'k2-mission-phase5-7', 'k2-mission-phase5-8',
    ]
    
    const completed = phaseKeys.filter(key => getPersistentBoolean(key)).length
    const total = phaseKeys.length
    const progress = total ? Math.round((completed / total) * 100) : 0
    
    return {
      id: projectId,
      name: project.name,
      progress,
      completed,
      total
    }
  }, [])
  
  // Git Push Funktion - öffnet Terminal mit Script und Status-Anzeige
  const handleGitPush = async () => {
    if (gitPushing) return
    setGitPushing(true)
    
    // WICHTIG: Prüfe zuerst ob Datei existiert und Werke enthält
    let artworksCount = 0
    let fileExists = false
    
    try {
      // Versuche Datei zu lesen um Anzahl der Werke zu prüfen
      const response = await fetch('/gallery-data.json?t=' + Date.now())
      if (response.ok) {
        const data = await response.json()
        artworksCount = Array.isArray(data.artworks) ? data.artworks.length : 0
        fileExists = true
        
        if (artworksCount === 0) {
          setPublishStatus({
            success: false,
            message: '📦 Code-Update: Keine Werke in gallery-data.json.\n\nZuerst „📁 Daten veröffentlichen“ klicken, dann Code-Update.',
            artworksCount: 0
          })
          setGitPushing(false)
          setTimeout(() => setPublishStatus(null), 8000)
          return
        }
      } else {
        setPublishStatus({
          success: false,
          message: '📦 Code-Update: gallery-data.json fehlt.\n\nZuerst „📁 Daten veröffentlichen“, dann Code-Update (Git).',
          artworksCount: 0
        })
        setGitPushing(false)
        setTimeout(() => setPublishStatus(null), 8000)
        return
      }
    } catch (error) {
      console.warn('⚠️ Konnte Datei nicht prüfen:', error)
      // Weiter mit Git Push auch wenn Prüfung fehlschlägt
    }
    
    // Synchronisierungs-Status: Git Push gestartet
    setSyncStatus({ step: 'git-push', progress: 33 })
    
    try {
      // Versuche Terminal über AppleScript zu öffnen (nur auf Mac)
      const scriptPath = '/Users/georgkreinecker/k2Galerie/scripts/git-push-gallery-data.sh'
      
      // Erstelle AppleScript um Terminal zu öffnen
      const appleScript = `tell application "Terminal"
  activate
  do script "cd /Users/georgkreinecker/k2Galerie && bash ${scriptPath}"
end tell`
      
      // Versuche AppleScript auszuführen (nur im Electron-Kontext möglich)
      // Im Browser: Zeige Anleitung und kopiere Befehle
      const commands = `cd /Users/georgkreinecker/k2Galerie\nbash scripts/git-push-gallery-data.sh`
      
      // Kopiere Befehle in Zwischenablage
      try {
        const textarea = document.createElement('textarea')
        textarea.value = commands
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        textarea.style.pointerEvents = 'none'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        
        // Zeige nur Code-Update – keine Werke-Anzahl (nur bei Daten relevant)
        const statusMessage = '📦 Code-Update (Git)\n\n✅ Befehle in Zwischenablage. Terminal öffnen und einfügen (Cmd+V) – dann baut Vercel die neue Version.'
        
        setPublishStatus({
          success: true,
          message: statusMessage
          // artworksCount weglassen → Banner zeigt nicht "X Werke gespeichert"
        })
        
        // Status: Warte auf Vercel – echte Prüfung per build-info.json
        setTimeout(() => {
          setSyncStatus({ step: 'vercel-deploy', progress: 66 })
          const vercelUrl = 'https://k2-galerie.vercel.app/build-info.json'
          const maxAttempts = 18
          let attempts = 0
          const check = () => {
            attempts += 1
            fetch(vercelUrl + '?t=' + Date.now(), { cache: 'no-store' })
              .then((r) => r.ok ? r.json() : null)
              .then((d: { timestamp?: number } | null) => {
                if (d?.timestamp != null && d.timestamp >= BUILD_TIMESTAMP) {
                  setSyncStatus({ step: 'ready', progress: 100 })
                  setTimeout(() => setSyncStatus({ step: null, progress: 0 }), 8000)
                  return
                }
                if (attempts < maxAttempts) setTimeout(check, 10000)
                else {
                  setSyncStatus({ step: 'ready', progress: 100 })
                  setTimeout(() => setSyncStatus({ step: null, progress: 0 }), 8000)
                }
              })
              .catch(() => {
                if (attempts < maxAttempts) setTimeout(check, 10000)
                else {
                  setSyncStatus({ step: 'ready', progress: 100 })
                  setTimeout(() => setSyncStatus({ step: null, progress: 0 }), 8000)
                }
              })
          }
          setTimeout(check, 8000)
        }, 5000)
        
        setTimeout(() => setPublishStatus(null), 8000)
      } catch (copyError) {
        // Fallback: Zeige Befehle – nur Code-Update, keine Werke-Anzahl
        const statusMessage = `📦 Code-Update (Git)\n\nTerminal öffnen und ausführen:\n${commands}\n\n→ Vercel baut danach die neue Version.`
        
        setPublishStatus({
          success: true,
          message: statusMessage
        })
        setTimeout(() => setPublishStatus(null), 8000)
      }
    } catch (error) {
      setPublishStatus({
        success: false,
        message: '📦 Code-Update fehlgeschlagen: ' + (error instanceof Error ? error.message : String(error))
      })
      setSyncStatus({ step: null, progress: 0 })
      setTimeout(() => setPublishStatus(null), 5000)
    } finally {
      // Button bleibt aktiv für weiteren Versuch
      setTimeout(() => setGitPushing(false), 2000)
    }
  }

  // Automatischer Git Push nach gallery-data-published (über k2-auto-git-push Event)
  useEffect(() => {
    const onAutoGitPush = () => { handleGitPush() }
    window.addEventListener('k2-auto-git-push', onAutoGitPush)
    return () => window.removeEventListener('k2-auto-git-push', onAutoGitPush)
  }, [])

  // Mobile-Erkennung für Tab-Filterung
  const isMobileDevice = typeof window !== 'undefined' && (
    window.innerWidth <= 768 || 
    /iPad|iPhone|iPod/.test(navigator.userAgent)
  )

  const allPages = [
    { id: 'galerie', name: 'Galerie', component: GaleriePage },
    { id: 'galerie-oeffentlich', name: 'Öffentliche Galerie K2', component: GaleriePage },
    { id: 'galerie-vorschau', name: 'Galerie-Vorschau', component: GalerieVorschauPage },
    { id: 'galerie-oeffentlich-vorschau', name: 'Öffentliche Galerie K2 Vorschau', component: GalerieVorschauPage },
    { id: 'vk2', name: 'VK2 Vereinsplattform', component: GaleriePage },
    { id: 'vk2-kunden', name: 'VK2 Mitglieder', component: GalerieVorschauPage },
    { id: 'vk2-vorschau', name: 'VK2 Künstler-Vorschau', component: GalerieVorschauPage },
    { id: 'vk2-admin', name: 'VK2 Admin', component: ScreenshotExportAdmin },
    { id: 'produkt-vorschau', name: 'Produkt-Vorschau', component: ProduktVorschauPage },
    { id: 'marketing-oek2', name: 'mök2 (Marketing)', component: MarketingOek2Page },
    { id: 'platzanordnung', name: 'Platzanordnung', component: PlatzanordnungPage },
    { id: 'shop', name: 'Shop', component: ShopPage },
    { id: 'control', name: 'Control Studio', component: ControlStudioPage },
    { id: 'mission', name: 'Projektplan', component: ProjectPlanPage },
    { id: 'admin', name: 'Admin', component: ScreenshotExportAdmin },
    { id: 'projects', name: 'Projekte', component: ProjectsPage },
    { id: 'platform', name: 'Plattform Start', component: PlatformStartPage },
    { id: 'mok2', name: 'mök2 – Vertrieb', component: MarketingOek2Page },
    { id: 'handbuch', name: 'Handbuch', component: PlatformStartPage },
  ]

  // Auf Mobile: "Plattform Start" Tab ausblenden (nur für Mac)
  // Bei context=vk2: Shop-Tab ausblenden (Vereinsplattform hat keine Kasse)
  const contextVk2 = searchParams.get('context') === 'vk2'
  const pages = isMobileDevice 
    ? allPages.filter(p => p.id !== 'platform')
    : allPages
  const pagesFiltered = contextVk2 ? pages.filter(p => p.id !== 'shop') : pages

  // Wenn aktueller Tab "platform" auf Mobile ist → automatisch zu "galerie" wechseln
  const effectiveCurrentPage = isMobileDevice && currentPage === 'platform' 
    ? 'galerie' 
    : currentPage

  const currentPageData = effectiveCurrentPage === 'desktop-leer'
    ? { id: 'desktop-leer', name: 'Desktop', component: () => null }
    : (pagesFiltered.find(p => p.id === effectiveCurrentPage) || pagesFiltered[0])
  const CurrentComponent = currentPageData.component
  
  // Render-Komponente mit Props für GaleriePage
  // WICHTIG: Admin-Komponente nur einmal rendern (verhindert doppeltes Mounten)
  const renderComponent = (key?: string, skipAdmin?: boolean) => {
    // Verwende effectiveCurrentPage statt currentPage (umleitet "platform" auf Mobile zu "galerie")
    const pageToRender = effectiveCurrentPage

    // Leerer Desktop – neutraler Hintergrund, keine Seite geöffnet
    if (pageToRender === 'desktop-leer') {
      return (
        <div key="desktop-leer" style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
          color: 'rgba(255,255,255,0.18)',
          userSelect: 'none',
        }}>
          <div style={{ fontSize: '3.5rem', opacity: 0.25 }}>💚</div>
          <div style={{ fontSize: '0.9rem', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.4 }}>
            K2 Galerie
          </div>
        </div>
      )
    }
    
    // Im Split-Mode: Admin nur im Desktop-Bereich rendern
    if (skipAdmin && pageToRender === 'admin') {
      return <div key={`${key}-skip`} style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>Admin nur im Desktop-Bereich</div>
    }
    
    // Eindeutiger Key: Kombiniere pageToRender mit viewMode um doppeltes Mounten zu verhindern
    const componentKey = `${pageToRender}-${key || 'default'}`
    
    if (pageToRender === 'galerie') {
      return <GaleriePage key={componentKey} scrollToSection={galerieSection} />
    }
    // ök2: Im Cursor Preview (iframe) Platzhalter – im Browser echte Seite
    if (pageToRender === 'galerie-oeffentlich') {
      const inCursorPreview = window.self !== window.top
      if (inCursorPreview) {
        return (
          <div key={componentKey} style={{ padding: '2rem', maxWidth: 400, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontSize: '1.1rem', color: 'var(--k2-muted)', marginBottom: '1rem' }}>Öffentliche Galerie K2</p>
            <Link to={PROJECT_ROUTES['k2-galerie'].galerieOeffentlich} style={{ display: 'inline-block', padding: '0.75rem 1.5rem', background: 'var(--k2-accent)', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>Im Vollbild öffnen</Link>
          </div>
        )
      }
      return <GaleriePage key={componentKey} musterOnly={true} />
    }
    if (pageToRender === 'galerie-vorschau') {
      return <GalerieVorschauPage key={componentKey} initialFilter={galerieFilter} />
    }
    if (pageToRender === 'galerie-oeffentlich-vorschau') {
      const inCursorPreview = window.self !== window.top
      if (inCursorPreview) {
        return (
          <div key={componentKey} style={{ padding: '2rem', maxWidth: 400, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontSize: '1.1rem', color: 'var(--k2-muted)', marginBottom: '1rem' }}>Öffentliche Galerie K2 Vorschau</p>
            <Link to={PROJECT_ROUTES['k2-galerie'].galerieOeffentlichVorschau} style={{ display: 'inline-block', padding: '0.75rem 1.5rem', background: 'var(--k2-accent)', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>Im Vollbild öffnen</Link>
          </div>
        )
      }
      return <GalerieVorschauPage key={componentKey} musterOnly={true} initialFilter={galerieFilter} />
    }
    // VK2 Seiten
    if (pageToRender === 'vk2') {
      return <GaleriePage key={componentKey} vk2={true} />
    }
    if (pageToRender === 'vk2-kunden') {
      return <GalerieVorschauPage key={componentKey} vk2={true} initialFilter={galerieFilter} />
    }
    if (pageToRender === 'vk2-vorschau') {
      return <GalerieVorschauPage key={componentKey} vk2={true} initialFilter={galerieFilter} />
    }
    if (pageToRender === 'vk2-admin') {
      return <ScreenshotExportAdmin key="vk2-admin-singleton" />
    }
    if (pageToRender === 'mok2') {
      return <MarketingOek2Page key={componentKey} />
    }
    if (pageToRender === 'platzanordnung') {
      return <PlatzanordnungPage key={componentKey} />
    }
    
    // Admin-Komponente: Nur einmal rendern - IMMER gleicher Key verhindert doppeltes Mounten
    if (pageToRender === 'admin') {
      return <ScreenshotExportAdmin key="admin-singleton" />
    }
    
    return <CurrentComponent key={componentKey} />
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--k2-bg-1, #1a0f0a)', 
      color: 'var(--k2-text, #fff5f0)',
      padding: '1rem',
      paddingBottom: '80px', // Platz für untere Navigationsleiste
      paddingLeft: !panelMinimized ? '420px' : '1rem', // Platz für Smart Panel
      fontFamily: 'system-ui, sans-serif',
      transition: 'padding-left 0.3s ease',
      position: 'relative'
    }}>
      {/* Dauerhafter Veröffentlicht-Badge – immer sichtbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        marginBottom: '1rem',
        padding: '0.6rem 1rem',
        background: lastPublishedTime ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
        border: `1px solid ${lastPublishedTime ? 'rgba(16,185,129,0.35)' : 'rgba(245,158,11,0.35)'}`,
        borderRadius: '10px',
        fontSize: 'clamp(0.82rem, 1.8vw, 0.9rem)',
        color: lastPublishedTime ? '#6ee7b7' : '#fcd34d'
      }}>
        <span style={{ fontSize: '1.1rem' }}>{lastPublishedTime ? '✅' : '⚠️'}</span>
        <span style={{ fontWeight: '600' }}>
          {lastPublishedTime
            ? `Zuletzt veröffentlicht: ${lastPublishedTime}`
            : 'Noch nicht veröffentlicht – Daten sind nur lokal gespeichert'}
        </span>
        {lastPublishedTime && (
          <span style={{ marginLeft: 'auto', opacity: 0.7, fontSize: '0.78rem' }}>
            Galerie auf Handy: aktuell
          </span>
        )}
      </div>

      {/* Projekt-Info ist jetzt im Smart Panel */}
      
      {/* Status-Banner nach Veröffentlichen - NICHT blockierend */}
      {publishStatus && (
        <div style={{
          position: 'fixed',
          top: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10001,
          background: publishStatus.success 
            ? 'linear-gradient(120deg, #10b981, #059669)' 
            : 'linear-gradient(120deg, #ef4444, #dc2626)',
          color: '#fff',
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          maxWidth: '600px',
          width: '90%',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          animation: 'slideDown 0.3s ease-out'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.25rem' }}>
              {publishStatus.message}
            </div>
            {publishStatus.success && publishStatus.artworksCount !== undefined && (
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                📁 {publishStatus.size ? `${(publishStatus.size / 1024).toFixed(1)} KB` : ''} • 🎨 {publishStatus.artworksCount} {publishStatus.artworksCount === 1 ? 'Werk' : 'Werke'} gespeichert
                {publishStatus.artworksCount === 0 && (
                  <span style={{ color: '#fca5a5', marginLeft: '0.5rem' }}>
                    ⚠️ Keine Werke gefunden - prüfe localStorage
                  </span>
                )}
              </div>
            )}
          </div>
          {publishStatus.success && (
            <button
              onClick={() => {
                setPublishStatus(null)
                handleGitPush()
              }}
              disabled={gitPushing}
              style={{
                padding: '0.5rem 1rem',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                color: '#fff',
                fontWeight: '600',
                cursor: gitPushing ? 'wait' : 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                if (!gitPushing) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
              }}
              onMouseLeave={(e) => {
                if (!gitPushing) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
              }}
            >
              {gitPushing ? '⏳ Push...' : '📦 Code-Update (Git)'}
            </button>
          )}
          <button
            onClick={() => setPublishStatus(null)}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              width: '28px',
              height: '28px',
              cursor: 'pointer',
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: '1'
            }}
            title="Schließen"
          >
            ×
          </button>
        </div>
      )}
      
      {/* Synchronisierungs-Status-Balken */}
      {syncStatus.step && (
        <div style={{
          position: 'fixed',
          bottom: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10003,
          background: 'linear-gradient(120deg, rgba(26, 31, 50, 0.98), rgba(12, 16, 28, 0.98))',
          border: '1px solid rgba(255, 140, 66, 0.3)',
          borderRadius: '12px',
          padding: '1rem 1.5rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          maxWidth: '600px',
          width: '90%',
          backdropFilter: 'blur(20px)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '0.75rem'
          }}>
            <div style={{ fontSize: '1.5rem' }}>
              {syncStatus.step === 'published' && '📁'}
              {syncStatus.step === 'git-push' && '📦'}
              {syncStatus.step === 'vercel-deploy' && '🚀'}
              {syncStatus.step === 'ready' && '✅'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: 'var(--k2-accent)', marginBottom: '0.25rem' }}>
                {syncStatus.step === 'published' && 'Gespeichert ✓'}
                {syncStatus.step === 'git-push' && 'Wird veröffentlicht…'}
                {syncStatus.step === 'vercel-deploy' && 'Wird übertragen – bitte kurz warten…'}
                {syncStatus.step === 'ready' && '✅ Fertig – auf allen Geräten sichtbar!'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#8fa0c9' }}>
                {syncStatus.step === 'published' && 'Wird jetzt auf alle Geräte übertragen…'}
                {syncStatus.step === 'git-push' && 'Änderungen werden hochgeladen…'}
                {syncStatus.step === 'vercel-deploy' && 'In 1–2 Minuten auf dem Handy sichtbar'}
                {syncStatus.step === 'ready' && 'Auf dem Handy QR-Code neu scannen oder Seite neu laden.'}
              </div>
            </div>
            {syncStatus.step === 'ready' && (
              <button
                onClick={() => setSyncStatus({ step: null, progress: 0 })}
                style={{
                  background: 'rgba(255, 140, 66, 0.2)',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'var(--k2-accent)',
                  width: '28px',
                  height: '28px',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: '1'
                }}
                title="Schließen"
              >
                ×
              </button>
            )}
          </div>
          {/* Progress Bar */}
          <div style={{
            width: '100%',
            height: '6px',
            background: 'rgba(255, 140, 66, 0.1)',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${syncStatus.progress}%`,
              height: '100%',
              background: syncStatus.step === 'ready' 
                ? 'linear-gradient(90deg, #10b981, #059669)'
                : 'linear-gradient(90deg, var(--k2-accent), #e67a2a)',
              transition: 'width 0.3s ease',
              animation: syncStatus.step !== 'ready' ? 'pulse 2s ease-in-out infinite' : 'none'
            }} />
          </div>
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
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }
      `}</style>

      {/* Einfache Toolbar */}
      <div style={{
        background: '#2a2a2a',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        alignItems: 'center',
        position: 'relative'
      }}>
        {/* Ansicht wählen */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {(['mobile', 'tablet', 'desktop', 'split'] as ViewMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                padding: '0.5rem 1rem',
                background: viewMode === mode ? 'var(--k2-accent)' : '#444',
                color: viewMode === mode ? '#000' : '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: viewMode === mode ? 'bold' : 'normal'
              }}
            >
              {mode === 'mobile' ? '📱 iPhone' : 
               mode === 'tablet' ? '📱 iPad' : 
               mode === 'desktop' ? '💻 Desktop' : 
               '⚡ Split'}
            </button>
          ))}
          
          {/* Zoom Controls Mobile */}
          {(viewMode === 'mobile' || viewMode === 'split') && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginLeft: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#999' }}>📱 Zoom:</span>
              <button
                onClick={() => setMobileZoom(Math.max(0.5, mobileZoom - 0.1))}
                style={{
                  padding: '0.25rem 0.5rem',
                  background: '#444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                −
              </button>
              <span style={{ fontSize: '0.85rem', color: '#fff', minWidth: '40px', textAlign: 'center' }}>
                {Math.round(mobileZoom * 100)}%
              </span>
              <button
                onClick={() => setMobileZoom(Math.min(2, mobileZoom + 0.1))}
                style={{
                  padding: '0.25rem 0.5rem',
                  background: '#444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                +
              </button>
            </div>
          )}
          
          {/* Zoom Controls Desktop */}
          {(viewMode === 'desktop' || viewMode === 'split') && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginLeft: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#999' }}>💻 Zoom:</span>
              <button
                onClick={() => setDesktopZoom(Math.max(0.5, desktopZoom - 0.1))}
                style={{
                  padding: '0.25rem 0.5rem',
                  background: '#444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                −
              </button>
              <span style={{ fontSize: '0.85rem', color: '#fff', minWidth: '40px', textAlign: 'center' }}>
                {Math.round(desktopZoom * 100)}%
              </span>
              <button
                onClick={() => setDesktopZoom(Math.min(2, desktopZoom + 0.1))}
                style={{
                  padding: '0.25rem 0.5rem',
                  background: '#444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                +
              </button>
            </div>
          )}
        </div>

        {/* Seite wählen */}
        <select
          value={currentPage}
          onChange={(e) => setCurrentPage(e.target.value)}
          style={{
            padding: '0.5rem',
            background: '#444',
            color: '#fff',
            border: '1px solid #666',
            borderRadius: '6px',
            fontSize: '0.9rem'
          }}
        >
          {pagesFiltered.map(page => (
            <option key={page.id} value={page.id}>{page.name}</option>
          ))}
        </select>

        {/* Quick-Actions: Daten veröffentlichen + Code-Update (Git) nebeneinander */}
        <Link
          to={currentPageData.id === 'galerie' ? PROJECT_ROUTES['k2-galerie'].galerie :
              currentPageData.id === 'galerie-oeffentlich' ? PROJECT_ROUTES['k2-galerie'].galerieOeffentlich :
              currentPageData.id === 'galerie-vorschau' ? PROJECT_ROUTES['k2-galerie'].galerieVorschau :
              currentPageData.id === 'galerie-oeffentlich-vorschau' ? PROJECT_ROUTES['k2-galerie'].galerieOeffentlichVorschau :
              currentPageData.id === 'vk2' ? PROJECT_ROUTES.vk2.galerie :
              currentPageData.id === 'vk2-kunden' ? PROJECT_ROUTES.vk2.kunden :
              currentPageData.id === 'vk2-vorschau' ? PROJECT_ROUTES.vk2.galerieVorschau :
              currentPageData.id === 'vk2-admin' ? PROJECT_ROUTES.vk2.vollversion :
              currentPageData.id === 'mok2' ? PROJECT_ROUTES['k2-galerie'].marketingOek2 :
              currentPageData.id === 'handbuch' ? '/k2team-handbuch' :
              currentPageData.id === 'produkt-vorschau' ? PROJECT_ROUTES['k2-galerie'].produktVorschau :
              currentPageData.id === 'marketing-oek2' ? PROJECT_ROUTES['k2-galerie'].marketingOek2 :
              currentPageData.id === 'shop' ? PROJECT_ROUTES['k2-galerie'].shop :
              currentPageData.id === 'control' ? PROJECT_ROUTES['k2-galerie'].controlStudio :
              currentPageData.id === 'mission' ? PROJECT_ROUTES['k2-galerie'].plan :
              currentPageData.id === 'admin' ? '/admin' :
              currentPageData.id === 'projects' ? '/projects' : '/'}
          style={{
            padding: '0.5rem 1rem',
            background: '#33a1ff',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '0.9rem'
          }}
          target="_blank"
        >
          ↗️ Vollbild
        </Link>
        <button
          onClick={() => {
            publishMobile()
          }}
          disabled={isPublishing}
          style={{
            padding: '0.5rem 1rem',
            background: '#10b981',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.9rem',
            cursor: isPublishing ? 'wait' : 'pointer',
            fontWeight: '500',
            opacity: isPublishing ? 0.7 : 1
          }}
          title="Galerie-Daten (Werke, Stammdaten) in Datei schreiben – für Mobile"
        >
          {isPublishing ? '⏳ ...' : '📁 Daten veröffentlichen'}
        </button>
        <button
          onClick={async (e) => {
            e.preventDefault()
            e.stopPropagation()
            await handleGitPush()
          }}
          disabled={gitPushing}
          style={{
            padding: '0.5rem 1rem',
            background: '#6366f1',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.9rem',
            cursor: gitPushing ? 'wait' : 'pointer',
            fontWeight: '500',
            opacity: gitPushing ? 0.7 : 1
          }}
          title="Code-Änderungen (App, Freistellung, etc.) zu Vercel pushen"
        >
          {gitPushing ? '⏳ Push...' : '📦 Code-Update (Git)'}
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            checkVercelStatus()
          }}
          disabled={checkingVercel}
          style={{
            padding: '0.5rem 1rem',
            background: checkingVercel ? 'rgba(255, 140, 66, 0.3)' : 'rgba(255, 140, 66, 0.2)',
            color: 'var(--k2-accent)',
            border: '1px solid rgba(255, 140, 66, 0.4)',
            borderRadius: '6px',
            fontSize: '0.9rem',
            cursor: checkingVercel ? 'wait' : 'pointer',
            fontWeight: '500',
            opacity: checkingVercel ? 0.7 : 1,
            pointerEvents: checkingVercel ? 'none' : 'auto',
            minWidth: '150px',
            position: 'relative',
            zIndex: 1000 // Sicherstellen dass Button immer klickbar ist
          }}
          title="Vercel-Deployment-Status prüfen - funktioniert IMMER, auch während Veröffentlichung"
        >
          {checkingVercel ? '⏳ Prüfe...' : '🔍 Vercel-Status'}
        </button>
      </div>

      {/* Ansichten */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: viewMode === 'split' ? '1fr 1fr' : '1fr',
        gap: '1rem'
      }}>
        {/* Mobile/Tablet */}
        {(viewMode === 'mobile' || viewMode === 'tablet' || viewMode === 'split') && (
          <div style={{
            background: '#000',
            padding: '1rem',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ color: '#999', fontSize: '0.8rem', marginBottom: '0.5rem', textAlign: 'center' }}>
              {viewMode === 'split' ? '📱 Mobile' : viewMode === 'mobile' ? '📱 iPhone' : '📱 iPad'}
            </div>
            <div style={{
              width: viewMode === 'split' ? '375px' : viewMode === 'mobile' ? '375px' : '768px',
              height: viewMode === 'split' ? '667px' : viewMode === 'mobile' ? '667px' : '1024px',
              background: '#fff',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '2px solid #333',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative'
            }}>
              <div style={{ 
                width: '100%',
                height: '100%',
                overflow: 'auto',
                transform: `scale(${mobileZoom})`,
                transformOrigin: 'top center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch'
              }}>
                {renderComponent('mobile', viewMode === 'split' && currentPage === 'admin')}
              </div>
            </div>
          </div>
        )}

        {/* Desktop */}
        {(viewMode === 'desktop' || viewMode === 'split') && (
          <div style={{
            background: '#000',
            padding: '1rem',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ color: '#999', fontSize: '0.8rem', marginBottom: '0.5rem', textAlign: 'center' }}>
              💻 Desktop
            </div>
            <div style={{
              width: viewMode === 'split' ? '1200px' : '100%',
              height: viewMode === 'split' ? '800px' : '800px',
              background: '#fff',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '2px solid #333',
              margin: viewMode === 'split' ? '0' : '0 auto',
              position: 'relative'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                overflow: 'auto',
                transform: `scale(${desktopZoom})`,
                transformOrigin: 'top center'
              }}>
                {renderComponent('desktop', false)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Untere Navigationsleiste - zeigt Bereiche der aktuellen Seite */}
      {(currentPage === 'galerie' || currentPage === 'galerie-oeffentlich' || currentPage === 'galerie-vorschau' || currentPage === 'galerie-oeffentlich-vorschau') && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: !panelMinimized ? '400px' : 0, // Platz für Smart Panel
          right: 0,
          background: '#2a2a2a',
          borderTop: '1px solid #444',
          padding: '0.5rem',
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          zIndex: 1000,
          boxShadow: '0 -4px 16px rgba(0,0,0,0.3)',
          transition: 'left 0.3s ease'
        }}>
          {pageSections.map(section => {
            const isActive = 'filter' in section ? galerieFilter === section.filter : galerieSection === section.id
            
            return (
              <button
                key={section.id}
                onClick={() => {
                  const isOek2 = currentPage === 'galerie-oeffentlich' || currentPage === 'galerie-oeffentlich-vorschau'
                  if ('filter' in section) {
                    setGalerieFilter(section.filter as 'alle' | 'malerei' | 'keramik')
                    if (currentPage !== 'galerie-vorschau' && currentPage !== 'galerie-oeffentlich-vorschau') {
                      setCurrentPage(isOek2 ? 'galerie-oeffentlich-vorschau' : 'galerie-vorschau')
                    }
                  } else if ('scrollTo' in section) {
                    setGalerieSection(section.id)
                    if (currentPage !== 'galerie' && currentPage !== 'galerie-oeffentlich') {
                      setCurrentPage(isOek2 ? 'galerie-oeffentlich' : 'galerie')
                    }
                    // Scroll zu Bereich (wird von GaleriePage gehandhabt)
                  }
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.5rem 0.75rem',
                  background: isActive ? 'var(--k2-accent)' : '#444',
                  color: isActive ? '#000' : '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  minWidth: '60px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{section.icon}</span>
                <span style={{ fontWeight: isActive ? 'bold' : 'normal' }}>{section.name}</span>
              </button>
            )
          })}
        </div>
      )}
      
      {/* Standard-Navigation für andere Seiten */}
      {currentPage !== 'galerie' && currentPage !== 'galerie-oeffentlich' && currentPage !== 'galerie-vorschau' && currentPage !== 'galerie-oeffentlich-vorschau' && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: !panelMinimized ? '400px' : 0, // Platz für Smart Panel
          right: 0,
          background: '#2a2a2a',
          borderTop: '1px solid #444',
          padding: '0.5rem',
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          zIndex: 1000,
          boxShadow: '0 -4px 16px rgba(0,0,0,0.3)',
          transition: 'left 0.3s ease'
        }}>
          {pageSections.map(section => (
            <button
              key={section.id}
              type="button"
              onClick={() => { if ('path' in section && section.path) setCurrentPage(section.id) }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.5rem 0.75rem',
                background: currentPage === section.id ? 'var(--k2-accent)' : '#444',
                color: currentPage === section.id ? '#000' : '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.75rem',
                minWidth: '60px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit',
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{section.icon}</span>
              <span style={{ fontWeight: currentPage === section.id ? 'bold' : 'normal' }}>{section.name}</span>
            </button>
          ))}
        </div>
      )}
      
        {/* Smart Panel - Projekt-Status & Schnellzugriff */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: panelMinimized ? '-380px' : '0',
          width: '400px',
          height: '100vh',
          background: 'linear-gradient(180deg, #2d1a14, #1a0f0a)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255, 140, 66, 0.2)',
          boxShadow: '8px 0 32px rgba(0, 0, 0, 0.5)',
          zIndex: 10002, // Höher als Status-Banner (10001)
          display: 'flex',
          flexDirection: 'column',
          transition: 'left 0.3s ease',
          overflow: 'hidden',
          pointerEvents: 'auto', // Sicherstellen dass Klicks funktionieren
          visibility: 'visible' // Explizit sichtbar machen
        }}>
        {/* Minimize/Expand Button - IMMER sichtbar */}
        <button
          onClick={() => {
            setPanelMinimized(!panelMinimized)
            console.log('📱 Smart Panel:', !panelMinimized ? 'wird minimiert' : 'wird geöffnet')
          }}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem', // Immer rechts im Panel
            width: '2.5rem',
            height: '2.5rem',
            background: 'rgba(255, 140, 66, 0.15)',
            border: '1px solid rgba(255, 140, 66, 0.3)',
            borderRadius: '8px',
            color: 'var(--k2-accent)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.3rem',
            zIndex: 10001,
            transition: 'background 0.2s ease',
            backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 140, 66, 0.25)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 140, 66, 0.15)'
          }}
          title={panelMinimized ? 'Panel öffnen' : 'Panel minimieren'}
        >
          {panelMinimized ? '⚡' : '←'}
        </button>
        
        {/* Button außerhalb des Panels wenn minimiert - IMMER sichtbar */}
        {panelMinimized && (
          <button
            onClick={() => {
              setPanelMinimized(false)
              console.log('📱 Smart Panel wird geöffnet')
            }}
            style={{
              position: 'fixed',
              top: '1rem',
              left: '1rem',
              width: '3rem',
              height: '3rem',
              background: 'rgba(255, 140, 66, 0.2)',
              border: '2px solid rgba(255, 140, 66, 0.4)',
              borderRadius: '12px',
              color: 'var(--k2-accent)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              zIndex: 10003, // Höchster z-index
              boxShadow: '0 4px 12px rgba(255, 140, 66, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 140, 66, 0.3)'
              e.currentTarget.style.transform = 'scale(1.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 140, 66, 0.2)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
            title="Smart Panel öffnen"
          >
            ⚡
          </button>
        )}
        
        {/* Smart Panel Content */}
        {!panelMinimized && (
          <>
            {/* Grafiker-Tisch Button – prominent im SmartPanel, kontextsensitiv */}
            <div style={{ padding: '0.75rem 1rem 0', flexShrink: 0 }}>
              <button
                onClick={() => { setGrafikerTischOpen(o => !o); setGrafikerReloadKey(k => k + 1) }}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  background: grafikerTischOpen
                    ? 'linear-gradient(135deg, rgba(95,251,241,0.25), rgba(60,200,190,0.18))'
                    : 'linear-gradient(135deg, rgba(95,251,241,0.12), rgba(60,200,190,0.08))',
                  border: grafikerTischOpen ? '2px solid #5ffbf1' : '2px solid rgba(95,251,241,0.45)',
                  borderRadius: '10px',
                  color: '#5ffbf1',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  letterSpacing: '0.02em',
                  boxShadow: grafikerTischOpen ? '0 0 16px rgba(95,251,241,0.2)' : 'none',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                }}
              >
                🎨 Grafiker-Tisch
                {grafikerTischOpen && (
                  <span style={{ fontSize: '0.72rem', opacity: 0.7, fontWeight: 400 }}>
                    → {getGrafikerLabel()}
                  </span>
                )}
              </button>
            </div>
            <SmartPanel currentPage={currentPage} onNavigate={setCurrentPage} />
          </>
        )}
      </div>

      {/* ── GRAFIKER-TISCH – rechtes Panel, kontextsensitiv ── */}
      {grafikerTischOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: 'calc(100vw - 400px)',
          height: '100vh',
          background: '#0e0c0a',
          zIndex: 10003,
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '2px solid rgba(95,251,241,0.3)',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.6)',
        }}>
          {/* Header */}
          <div style={{
            background: '#1a1410',
            borderBottom: '1px solid rgba(95,251,241,0.2)',
            padding: '0.6rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flexShrink: 0,
          }}>
            <span style={{ fontWeight: 800, color: '#5ffbf1', fontSize: '0.9rem' }}>🎨 Grafiker-Tisch</span>
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', flex: 1 }}>
              {getGrafikerLabel()} – du siehst die Seite wie ein Besucher
            </span>
            <button
              onClick={() => setGrafikerReloadKey(k => k + 1)}
              style={{ padding: '0.3rem 0.5rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'inherit' }}
            >🔄 Neu laden</button>
            <button
              onClick={() => setGrafikerNotizOpen(o => !o)}
              style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', border: `1px solid ${grafikerNotizOpen ? 'rgba(95,251,241,0.5)' : 'rgba(255,255,255,0.12)'}`, background: grafikerNotizOpen ? 'rgba(95,251,241,0.12)' : 'rgba(255,255,255,0.04)', color: grafikerNotizOpen ? '#5ffbf1' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'inherit', fontWeight: grafikerNotizOpen ? 700 : 400 }}
            >📝 Notiz an KI</button>
            <a
              href={getGrafikerUrl()}
              target="_blank"
              rel="noopener noreferrer"
              style={{ padding: '0.3rem 0.5rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.78rem' }}
            >↗ Vollbild</a>
            <button
              onClick={() => setGrafikerTischOpen(false)}
              style={{ padding: '0.3rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(255,80,80,0.35)', background: 'rgba(255,80,80,0.08)', color: 'rgba(255,120,120,0.8)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700, fontFamily: 'inherit' }}
            >✕ Schließen</button>
          </div>

          {/* Notiz-Dialogfeld – Kommunikation mit KI */}
          {grafikerNotizOpen && (
            <div style={{
              background: '#1a1410',
              borderBottom: '1px solid rgba(95,251,241,0.2)',
              padding: '0.75rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              flexShrink: 0,
            }}>
              <div style={{ fontSize: '0.78rem', color: 'rgba(95,251,241,0.7)', marginBottom: '0.1rem' }}>
                📝 Schreib mir was du ändern möchtest – ich setze es beim nächsten Mal um:
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <textarea
                  value={grafikerNotizText}
                  onChange={(e) => {
                    setGrafikerNotizText(e.target.value)
                    try { localStorage.setItem('grafiker-notiz-entwurf', e.target.value) } catch { /* ignore */ }
                  }}
                  placeholder="z.B. 'Der Titel soll groesser sein' oder 'Die Farbe gefaellt mir nicht'"
                  rows={3}
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(95,251,241,0.25)',
                    borderRadius: '6px',
                    color: '#fff5f0',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.82rem',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    outline: 'none',
                  }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <button
                    onClick={grafikerNotizSpeichern}
                    disabled={!grafikerNotizText.trim()}
                    style={{
                      padding: '0.5rem 0.85rem',
                      borderRadius: '6px',
                      border: '1px solid rgba(95,251,241,0.4)',
                      background: grafikerNotizText.trim() ? 'rgba(95,251,241,0.15)' : 'rgba(255,255,255,0.04)',
                      color: grafikerNotizText.trim() ? '#5ffbf1' : 'rgba(255,255,255,0.3)',
                      cursor: grafikerNotizText.trim() ? 'pointer' : 'default',
                      fontSize: '0.82rem',
                      fontFamily: 'inherit',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                  >{grafikerNotizGespeichert ? '✅ Gespeichert!' : '💾 Speichern'}</button>
                </div>
              </div>
              {/* Gespeicherte Notizen anzeigen */}
              {(() => {
                const gespeichert = (() => { try { return localStorage.getItem('grafiker-notizen-offen') || '' } catch { return '' } })()
                if (!gespeichert) return null
                return (
                  <div style={{ marginTop: '0.25rem' }}>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginBottom: '0.3rem' }}>Bereits notiert (für KI beim nächsten Session-Start):</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,200,100,0.7)', whiteSpace: 'pre-wrap', background: 'rgba(255,200,100,0.05)', padding: '0.4rem 0.6rem', borderRadius: '4px', border: '1px solid rgba(255,200,100,0.1)' }}>
                      {gespeichert}
                    </div>
                    <button
                      onClick={() => { try { localStorage.removeItem('grafiker-notizen-offen') } catch { /* ignore */ }; setGrafikerNotizGespeichert(o => !o) }}
                      style={{ marginTop: '0.3rem', fontSize: '0.7rem', color: 'rgba(255,100,100,0.5)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >✕ Liste leeren</button>
                  </div>
                )
              })()}
            </div>
          )}

          {/* iframe – aktive Seite */}
          <iframe
            key={grafikerReloadKey}
            src={getGrafikerUrl()}
            style={{
              flex: 1,
              border: 'none',
              background: '#fff',
            }}
            title={getGrafikerLabel()}
          />
        </div>
      )}
    </div>
  )
}

export default DevViewPage
