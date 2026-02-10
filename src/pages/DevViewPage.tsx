import React, { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PROJECT_ROUTES, PLATFORM_ROUTES, getAllProjectIds } from '../config/navigation'
import { usePersistentBoolean } from '../hooks/usePersistentState'
import { checkMobileUpdates } from '../utils/supabaseClient'
import '../App.css'
import GaleriePage from './GaleriePage'
import GalerieVorschauPage from './GalerieVorschauPage'
import PlatzanordnungPage from './PlatzanordnungPage'
import ShopPage from './ShopPage'
import ControlStudioPage from './ControlStudioPage'
import ProjectPlanPage from './ProjectPlanPage'
import ScreenshotExportAdmin from '../../components/ScreenshotExportAdmin'
import ProjectsPage from './ProjectsPage'
import PlatformStartPage from './PlatformStartPage'
import SmartPanel from '../components/SmartPanel'

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
      alert('⚠️ Vercel-Check:\n\nTimeout nach 10 Sekunden\n\nPrüfe manuell: https://vercel.com/k2-galerie/k2-galerie')
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
          alert(`✅ Vercel-Status:\n\nDatei verfügbar\nExportedAt: ${exportedAt}\n\nPrüfe: https://vercel.com/k2-galerie/k2-galerie`)
        })
        .catch(err => {
          clearTimeout(fetchTimeout)
          clearTimeout(timeoutId)
          if (err.name === 'AbortError') {
            alert('⚠️ Vercel-Check:\n\nTimeout - Anfrage dauerte zu lange\n\nPrüfe: https://vercel.com/k2-galerie/k2-galerie')
          } else {
            alert('⚠️ Vercel-Check:\n\nDatei nicht verfügbar\n\nPrüfe: https://vercel.com/k2-galerie/k2-galerie')
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
  
  // Standardmäßig Desktop-Ansicht für optimale Arbeitsansicht
  const [viewMode, setViewMode] = useState<ViewMode>(isLocalhost ? 'desktop' : 'desktop')
  // Starte mit 'galerie' - lazy loading sollte jetzt helfen
  const [currentPage, setCurrentPage] = useState(pageFromUrl || (isLocalhost ? 'galerie' : defaultPage) || 'mission')
  const [mobileZoom, setMobileZoom] = useState(1)
  const [desktopZoom, setDesktopZoom] = useState(1)
  
  // Update currentPage wenn URL-Parameter sich ändert
  useEffect(() => {
    if (pageFromUrl) {
      setCurrentPage(pageFromUrl)
    } else if (isLocalhost && !pageFromUrl) {
      // Auf localhost automatisch Galerie-Seite zeigen
      setCurrentPage('galerie')
    }
  }, [pageFromUrl, isLocalhost])

  // Bereiche der aktuellen Seite für untere Navigationsleiste
  const getPageSections = (): PageSection[] => {
    if (currentPage === 'galerie') {
      // Bereiche der Galerie-Homepage
      return [
        { id: 'willkommen', name: 'Willkommen', icon: '👋', scrollTo: 'willkommen' },
        { id: 'galerie', name: 'Galerie', icon: '🎨', scrollTo: 'galerie-vorschau' },
        { id: 'kunstschaffende', name: 'Künstler', icon: '👨‍🎨', scrollTo: 'kunstschaffende' },
      ]
    }
    if (currentPage === 'galerie-vorschau') {
      // Filter für Galerie-Vorschau
      return [
        { id: 'alle', name: 'Alle', icon: '📋', filter: 'alle' },
        { id: 'malerei', name: 'Malerei', icon: '🖼️', filter: 'malerei' },
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
  const [gitPushing, setGitPushing] = useState(false)
  // Smart Panel standardmäßig geöffnet (false = nicht minimiert)
  // WICHTIG: Standardmäßig NICHT minimiert damit es sichtbar ist
  const [panelMinimized, setPanelMinimized] = useState(false) // Immer sichtbar beim Start
  
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
      
      let artworks = getItemSafe('k2-artworks', [])
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
            console.log(`✅ ${merged.length - localArtworks.length} Mobile-Werke zu Veröffentlichung hinzugefügt`)
            artworks = merged
            // Speichere auch lokal für nächste Veröffentlichung
            try {
              localStorage.setItem('k2-artworks', JSON.stringify(merged))
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
      
      const data = {
        martina: getItemSafe('k2-stammdaten-martina', {}),
        georg: getItemSafe('k2-stammdaten-georg', {}),
        gallery: getItemSafe('k2-stammdaten-galerie', {}),
        artworks: allArtworks,
        events: Array.isArray(events) ? events.slice(0, 20) : [],
        documents: Array.isArray(documents) ? documents.slice(0, 20) : [],
        designSettings: getItemSafe('k2-design-settings', {}),
        version: Date.now(),
        buildId: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
        exportedAt: new Date().toISOString()
      }
      
      const json = JSON.stringify(data)
      
      if (json.length > 5000000) {
        setIsPublishing(false)
        alert('⚠️ Daten zu groß (über 5MB). Bitte reduzieren Sie die Anzahl der Werke.')
        return
      }
      
      // Versuche direkt in public Ordner zu schreiben über API
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
        setIsPublishing(false)
        alert('⚠️ API-Timeout:\n\nDie Anfrage dauerte zu lange.\n\n📋 Bitte prüfen:\n1. Terminal öffnen\n2. cd /Users/georgkreinecker/k2Galerie\n3. Prüfe ob public/gallery-data.json existiert')
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
          
          console.log('✅ Datei geschrieben:', {
            path: result.path,
            size: result.size,
            artworksCount: artworksCount
          })
          
          // WICHTIG: Zeige Hinweis dass Git Push nötig ist
          setPublishStatus({
            success: true,
            message: `✅ Datei geschrieben!\n\n📦 WICHTIG: Git Push ausführen!\n\n1. Button "📦 Git Push" klicken\nODER\n2. Terminal: bash scripts/git-push-gallery-data.sh\n\n📱 Mobile: Nach Git Push (1-2 Min) QR-Code neu scannen`,
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
            message: '⚠️ API-Timeout - Bitte manuell prüfen'
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
            alert('✅ gallery-data.json wurde heruntergeladen!\n\n📁 Nächste Schritte:\n1. Datei in "public" Ordner kopieren\n2. Terminal öffnen und ausführen:\n   git add public/gallery-data.json\n   git commit -m "Update"\n   git push\n3. Mobile: Seite neu laden')
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
    
    // WICHTIG: Automatischer Git Push nach Veröffentlichung
    const handleGalleryDataPublished = (event: Event) => {
      const customEvent = event as CustomEvent
      console.log('📦 gallery-data.json wurde veröffentlicht - Git Push nötig!')
      
      // Zeige Hinweis dass Git Push nötig ist
      console.log('💡 Hinweis: Bitte "📦 Git Push" Button klicken damit Datei auf Vercel verfügbar ist')
    }
    
    window.addEventListener('artwork-saved-needs-publish', handleArtworkSaved)
    window.addEventListener('gallery-data-published', handleGalleryDataPublished)
    
    return () => {
      window.removeEventListener('artwork-saved-needs-publish', handleArtworkSaved)
      window.removeEventListener('gallery-data-published', handleGalleryDataPublished)
    }
  }, [])
  
  // Mobile-Daten synchronisieren (Mac → lokal)
  const syncMobileData = async () => {
    try {
      const { hasUpdates, artworks } = await checkMobileUpdates()
      if (hasUpdates && artworks) {
        // Speichere in localStorage
        localStorage.setItem('k2-artworks', JSON.stringify(artworks))
        localStorage.setItem('k2-last-load-time', Date.now().toString())
        
        // Update Hash für bessere Update-Erkennung
        const hash = artworks.map((a: any) => a.number || a.id).sort().join(',')
        localStorage.setItem('k2-artworks-hash', hash)
        
        // Event für andere Komponenten
        window.dispatchEvent(new CustomEvent('artworks-updated', { 
          detail: { count: artworks.length, manualSync: true } 
        }))
        
        setMobileSyncAvailable(false)
        alert(`✅ ${artworks.length} Werke von Mobile synchronisiert!`)
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
            message: '⚠️ Keine Werke gefunden - prüfe localStorage\n\nBitte zuerst Werke speichern und veröffentlichen!',
            artworksCount: 0
          })
          setGitPushing(false)
          setTimeout(() => setPublishStatus(null), 8000)
          return
        }
      } else {
        setPublishStatus({
          success: false,
          message: '⚠️ Datei gallery-data.json nicht gefunden!\n\nBitte zuerst Werke speichern und veröffentlichen!',
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
        
        // Zeige nicht-blockierenden Hinweis mit Anzahl der Werke
        const statusMessage = fileExists && artworksCount > 0
          ? `✅ Befehle kopiert! Terminal öffnen und einfügen (Cmd+V)\n\n📦 ${artworksCount} Werke werden gepusht`
          : '✅ Befehle kopiert! Terminal öffnen und einfügen (Cmd+V)'
        
        setPublishStatus({
          success: true,
          message: statusMessage,
          artworksCount: artworksCount
        })
        
        // Status: Warte auf Git Push Abschluss
        setTimeout(() => {
          setSyncStatus({ step: 'vercel-deploy', progress: 66 })
          
          // Simuliere Vercel Deployment Check (nach 90 Sekunden)
          setTimeout(() => {
            setSyncStatus({ step: 'ready', progress: 100 })
            setTimeout(() => {
              setSyncStatus({ step: null, progress: 0 })
            }, 5000)
          }, 90000) // 90 Sekunden für Vercel Deployment
        }, 5000)
        
        setTimeout(() => setPublishStatus(null), 8000)
      } catch (copyError) {
        // Fallback: Zeige Befehle
        const statusMessage = fileExists && artworksCount > 0
          ? `Terminal öffnen und ausführen:\n${commands}\n\n📦 ${artworksCount} Werke werden gepusht`
          : `Terminal öffnen und ausführen:\n${commands}`
        
        setPublishStatus({
          success: true,
          message: statusMessage,
          artworksCount: artworksCount
        })
        setTimeout(() => setPublishStatus(null), 8000)
      }
    } catch (error) {
      setPublishStatus({
        success: false,
        message: 'Fehler: ' + (error instanceof Error ? error.message : String(error))
      })
      setSyncStatus({ step: null, progress: 0 })
      setTimeout(() => setPublishStatus(null), 5000)
    } finally {
      // Button bleibt aktiv für weiteren Versuch
      setTimeout(() => setGitPushing(false), 2000)
    }
  }

  const pages = [
    { id: 'galerie', name: 'Galerie', component: GaleriePage },
    { id: 'galerie-vorschau', name: 'Galerie-Vorschau', component: GalerieVorschauPage },
    { id: 'platzanordnung', name: 'Platzanordnung', component: PlatzanordnungPage },
    { id: 'shop', name: 'Shop', component: ShopPage },
    { id: 'control', name: 'Control Studio', component: ControlStudioPage },
    { id: 'mission', name: 'Projektplan', component: ProjectPlanPage },
    { id: 'admin', name: 'Admin', component: ScreenshotExportAdmin },
    { id: 'projects', name: 'Projekte', component: ProjectsPage },
    { id: 'platform', name: 'Plattform Start', component: PlatformStartPage },
  ]

  const currentPageData = pages.find(p => p.id === currentPage) || pages[0]
  const CurrentComponent = currentPageData.component
  
  // Render-Komponente mit Props für GaleriePage
  // WICHTIG: Admin-Komponente nur einmal rendern (verhindert doppeltes Mounten)
  const renderComponent = (key?: string, skipAdmin?: boolean) => {
    // Im Split-Mode: Admin nur im Desktop-Bereich rendern
    if (skipAdmin && currentPage === 'admin') {
      return <div key={`${key}-skip`} style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>Admin nur im Desktop-Bereich</div>
    }
    
    // Eindeutiger Key: Kombiniere currentPage mit viewMode um doppeltes Mounten zu verhindern
    const componentKey = `${currentPage}-${key || 'default'}`
    
    if (currentPage === 'galerie') {
      return <GaleriePage key={componentKey} scrollToSection={galerieSection} />
    }
    if (currentPage === 'galerie-vorschau') {
      return <GalerieVorschauPage key={componentKey} initialFilter={galerieFilter} />
    }
    if (currentPage === 'platzanordnung') {
      return <PlatzanordnungPage key={componentKey} />
    }
    
    // Admin-Komponente: Nur einmal rendern - IMMER gleicher Key verhindert doppeltes Mounten
    if (currentPage === 'admin') {
      // WICHTIG: Gleicher Key für alle Render-Modi verhindert doppeltes Mounten
      return <ScreenshotExportAdmin key="admin-singleton" />
    }
    
    return <CurrentComponent key={componentKey} />
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#1a1a1a', 
      color: '#fff',
      padding: '1rem',
      paddingBottom: '80px', // Platz für untere Navigationsleiste
      paddingLeft: !panelMinimized ? '420px' : '1rem', // Platz für Smart Panel
      fontFamily: 'system-ui, sans-serif',
      transition: 'padding-left 0.3s ease',
      position: 'relative'
    }}>
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
              {gitPushing ? '⏳ Push...' : '📦 Git Push'}
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
          border: '1px solid rgba(95, 251, 241, 0.3)',
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
              <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#5ffbf1', marginBottom: '0.25rem' }}>
                {syncStatus.step === 'published' && 'Veröffentlichung erfolgreich'}
                {syncStatus.step === 'git-push' && 'Git Push läuft...'}
                {syncStatus.step === 'vercel-deploy' && 'Warte auf Vercel Deployment...'}
                {syncStatus.step === 'ready' && '✅ Bereit für Mobile!'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#8fa0c9' }}>
                {syncStatus.step === 'published' && 'Datei wurde gespeichert'}
                {syncStatus.step === 'git-push' && 'Terminal öffnen und Git Push ausführen'}
                {syncStatus.step === 'vercel-deploy' && 'Deployment dauert ca. 1-2 Minuten'}
                {syncStatus.step === 'ready' && 'Mobile Gerät: QR-Code neu scannen oder Seite aktualisieren'}
              </div>
            </div>
            {syncStatus.step === 'ready' && (
              <button
                onClick={() => setSyncStatus({ step: null, progress: 0 })}
                style={{
                  background: 'rgba(95, 251, 241, 0.2)',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#5ffbf1',
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
            background: 'rgba(95, 251, 241, 0.1)',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${syncStatus.progress}%`,
              height: '100%',
              background: syncStatus.step === 'ready' 
                ? 'linear-gradient(90deg, #10b981, #059669)'
                : 'linear-gradient(90deg, #5ffbf1, #33a1ff)',
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
                background: viewMode === mode ? '#5ffbf1' : '#444',
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
          {pages.map(page => (
            <option key={page.id} value={page.id}>{page.name}</option>
          ))}
        </select>

        {/* Quick-Actions - Git Push und Mission Control sind jetzt im Smart Panel */}
        <Link
          to={currentPageData.id === 'galerie' ? PROJECT_ROUTES['k2-galerie'].galerie :
              currentPageData.id === 'galerie-vorschau' ? PROJECT_ROUTES['k2-galerie'].galerieVorschau :
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
          title="Mobile Version veröffentlichen - lädt gallery-data.json herunter"
        >
          {isPublishing ? '⏳ Veröffentliche...' : '🚀 Veröffentlichen'}
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
            background: checkingVercel ? 'rgba(95, 251, 241, 0.3)' : 'rgba(95, 251, 241, 0.2)',
            color: '#5ffbf1',
            border: '1px solid rgba(95, 251, 241, 0.4)',
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
        <button
          onClick={async (e) => {
            e.preventDefault()
            e.stopPropagation()
            
            try {
              // Lade die Feedback-Vorlage direkt aus public Ordner
              const response = await fetch('/mission-control/CURSOR-FEEDBACK-VORLAGE.md?t=' + Date.now())
              if (!response.ok) {
                throw new Error('Datei nicht gefunden')
              }
              const text = await response.text()
              
              // Erstelle Modal mit dem Inhalt
              const modal = document.createElement('div')
              modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.95);
                z-index: 10000;
                padding: 2rem;
                overflow: auto;
                font-family: system-ui, -apple-system, sans-serif;
              `
              
              const content = document.createElement('div')
              content.style.cssText = `
                max-width: 1000px;
                margin: 0 auto;
                background: linear-gradient(135deg, #1a1f3a 0%, #0f1419 100%);
                border-radius: 12px;
                padding: 2rem;
                color: #fff;
                line-height: 1.6;
                box-shadow: 0 8px 32px rgba(0,0,0,0.5);
              `
              
              const header = document.createElement('div')
              header.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1.5rem;
                padding-bottom: 1rem;
                border-bottom: 2px solid rgba(95, 251, 241, 0.3);
              `
              
              const title = document.createElement('h2')
              title.textContent = '📧 Cursor Feedback-Vorlage'
              title.style.cssText = 'margin: 0; color: #5ffbf1; font-size: 1.5rem;'
              
              const buttonGroup = document.createElement('div')
              buttonGroup.style.cssText = 'display: flex; gap: 0.5rem;'
              
              const copyBtn = document.createElement('button')
              copyBtn.textContent = '📋 Alles kopieren'
              copyBtn.style.cssText = `
                padding: 0.5rem 1rem;
                background: linear-gradient(120deg, #5ffbf1, #33a1ff);
                color: #0a0e27;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.9rem;
                font-weight: 600;
              `
              copyBtn.onclick = () => {
                navigator.clipboard.writeText(text).then(() => {
                  copyBtn.textContent = '✅ Kopiert!'
                  setTimeout(() => {
                    copyBtn.textContent = '📋 Alles kopieren'
                  }, 2000)
                })
              }
              
              const closeBtn = document.createElement('button')
              closeBtn.textContent = '✕ Schließen'
              closeBtn.style.cssText = `
                padding: 0.5rem 1rem;
                background: #f5576c;
                color: #fff;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.9rem;
                font-weight: 600;
              `
              closeBtn.onclick = () => {
                document.body.removeChild(modal)
                document.removeEventListener('keydown', handleEsc)
              }
              
              const textarea = document.createElement('textarea')
              textarea.value = text
              textarea.style.cssText = `
                width: 100%;
                min-height: 600px;
                background: #0a0e27;
                color: #fff;
                border: 1px solid rgba(95, 251, 241, 0.3);
                border-radius: 8px;
                padding: 1.5rem;
                font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
                font-size: 0.85rem;
                line-height: 1.6;
                resize: vertical;
                white-space: pre;
                overflow-x: auto;
              `
              
              buttonGroup.appendChild(copyBtn)
              buttonGroup.appendChild(closeBtn)
              header.appendChild(title)
              header.appendChild(buttonGroup)
              
              content.appendChild(header)
              content.appendChild(textarea)
              modal.appendChild(content)
              document.body.appendChild(modal)
              
              // Fokussiere Textarea für besseres Scrollen
              textarea.focus()
              
              // Schließen mit ESC
              const handleEsc = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                  document.body.removeChild(modal)
                  document.removeEventListener('keydown', handleEsc)
                }
              }
              document.addEventListener('keydown', handleEsc)
              
              // Klick außerhalb schließt Modal
              modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                  document.body.removeChild(modal)
                  document.removeEventListener('keydown', handleEsc)
                }
              })
              
            } catch (error) {
              alert(`❌ Fehler beim Laden der Vorlage:\n\n${error instanceof Error ? error.message : String(error)}\n\n💡 Versuche:\n1. Server neu starten\n2. Datei prüfen: public/mission-control/CURSOR-FEEDBACK-VORLAGE.md`)
            }
          }}
          style={{
            padding: '0.5rem 1rem',
            background: 'linear-gradient(120deg, #f093fb, #f5576c)',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            minWidth: '180px'
          }}
          title="Zeigt die Cursor Feedback-Vorlage direkt an - fertig zum Kopieren"
        >
          📧 Kommunikation Cursor
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
      {(currentPage === 'galerie' || currentPage === 'galerie-vorschau') && (
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
                  if ('filter' in section) {
                    setGalerieFilter(section.filter as 'alle' | 'malerei' | 'keramik')
                    if (currentPage !== 'galerie-vorschau') {
                      setCurrentPage('galerie-vorschau')
                    }
                  } else if ('scrollTo' in section) {
                    setGalerieSection(section.id)
                    if (currentPage !== 'galerie') {
                      setCurrentPage('galerie')
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
                  background: isActive ? '#5ffbf1' : '#444',
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
      {currentPage !== 'galerie' && currentPage !== 'galerie-vorschau' && (
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
            <Link
              key={section.id}
              to={'path' in section ? section.path : '#'}
              onClick={(e) => {
                e.preventDefault()
                if ('path' in section && section.path) {
                  setCurrentPage(section.id)
                }
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.5rem 0.75rem',
                background: currentPage === section.id ? '#5ffbf1' : '#444',
                color: currentPage === section.id ? '#000' : '#fff',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '0.75rem',
                minWidth: '60px',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{section.icon}</span>
              <span style={{ fontWeight: currentPage === section.id ? 'bold' : 'normal' }}>{section.name}</span>
            </Link>
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
          background: 'linear-gradient(180deg, rgba(26, 31, 50, 0.98), rgba(12, 16, 28, 0.98))',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(95, 251, 241, 0.2)',
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
            background: 'rgba(95, 251, 241, 0.15)',
            border: '1px solid rgba(95, 251, 241, 0.3)',
            borderRadius: '8px',
            color: '#5ffbf1',
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
            e.currentTarget.style.background = 'rgba(95, 251, 241, 0.25)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(95, 251, 241, 0.15)'
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
              background: 'rgba(95, 251, 241, 0.2)',
              border: '2px solid rgba(95, 251, 241, 0.4)',
              borderRadius: '12px',
              color: '#5ffbf1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              zIndex: 10003, // Höchster z-index
              boxShadow: '0 4px 12px rgba(95, 251, 241, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(95, 251, 241, 0.3)'
              e.currentTarget.style.transform = 'scale(1.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(95, 251, 241, 0.2)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
            title="Smart Panel öffnen"
          >
            ⚡
          </button>
        )}
        
        {/* Smart Panel Content */}
        {!panelMinimized && (
          <SmartPanel currentPage={currentPage} onGitPush={handleGitPush} />
        )}
      </div>
    </div>
  )
}

export default DevViewPage
