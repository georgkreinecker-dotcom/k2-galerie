import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'
import { MUSTER_ARTWORKS } from '../config/tenantConfig'
import { 
  syncMobileToSupabase, 
  checkMobileUpdates, 
  saveArtworksToSupabase,
  loadArtworksFromSupabase,
  isSupabaseConfigured
} from '../utils/supabaseClient'
// Fotos für neue Werke nur im Admin (Neues Werk hinzufügen) – dort Option Freistellen/Original
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

// KRITISCH: Backup-System für Mobile-Werke
function createBackup(artworks: any[]): void {
  try {
    const backup = {
      timestamp: new Date().toISOString(),
      artworks: artworks,
      count: artworks.length,
      mobileWorks: artworks.filter((a: any) => a.createdOnMobile || a.updatedOnMobile).length
    }
    localStorage.setItem('k2-artworks-backup', JSON.stringify(backup))
    console.log('💾 Backup erstellt:', backup.count, 'Werke,', backup.mobileWorks, 'Mobile-Werke')
  } catch (error) {
    console.warn('⚠️ Backup konnte nicht erstellt werden:', error)
  }
}

// KRITISCH: Lade Backup falls vorhanden
function loadBackup(): any[] | null {
  try {
    const backupData = localStorage.getItem('k2-artworks-backup')
    if (backupData) {
      const backup = JSON.parse(backupData)
      console.log('💾 Backup gefunden:', backup.count, 'Werke,', backup.mobileWorks, 'Mobile-Werke')
      return backup.artworks || null
    }
  } catch (error) {
    console.warn('⚠️ Backup konnte nicht geladen werden:', error)
  }
  return null
}

function saveArtworks(artworks: any[]): boolean {
  try {
    // KRITISCH: Erstelle Backup VOR dem Speichern (besonders wichtig für Mobile-Werke!)
    const currentArtworks = loadArtworks()
    if (currentArtworks && currentArtworks.length > 0) {
      createBackup(currentArtworks)
    }
    
    // KRITISCH: Prüfe ob Mobile-Werke vorhanden sind
    const mobileWorks = artworks.filter((a: any) => a.createdOnMobile || a.updatedOnMobile)
    if (mobileWorks.length > 0) {
      console.log(`🔒 ${mobileWorks.length} Mobile-Werke werden geschützt beim Speichern`)
    }
    
    const json = JSON.stringify(artworks)
    
    // Prüfe Größe
    if (json.length > 5000000) {
      console.error('❌ Daten zu groß für localStorage:', json.length, 'Bytes')
      alert('⚠️ Zu viele Werke! Bitte einige löschen.')
      return false
    }
    
    // KRITISCH: Prüfe ob wir versehentlich alle Werke löschen wollen
    if (artworks.length === 0 && currentArtworks && currentArtworks.length > 0) {
      console.error('❌ KRITISCH: Versuch alle Werke zu löschen!')
      console.error('Aktuelle Werke:', currentArtworks.length)
      console.error('Mobile-Werke:', currentArtworks.filter((a: any) => a.createdOnMobile || a.updatedOnMobile).length)
      
      // Stelle Backup wieder her
      const backup = loadBackup()
      if (backup && backup.length > 0) {
        console.log('💾 Backup wiederhergestellt:', backup.length, 'Werke')
        localStorage.setItem('k2-artworks', JSON.stringify(backup))
        alert('⚠️ KRITISCH: Alle Werke würden gelöscht werden!\n\n💾 Backup wurde wiederhergestellt.\n\nBitte prüfe was passiert ist!')
        return false
      } else {
        alert('⚠️ KRITISCH: Alle Werke würden gelöscht werden!\n\n❌ Kein Backup verfügbar!\n\nVorgang abgebrochen!')
        return false
      }
    }
    
    localStorage.setItem('k2-artworks', json)
    console.log('✅ Gespeichert:', artworks.length, 'Werke, Größe:', json.length, 'Bytes')
    
    // Verifiziere Speicherung
    const verify = localStorage.getItem('k2-artworks')
    if (!verify || verify !== json) {
      console.error('❌ Verifikation fehlgeschlagen!')
      // Stelle Backup wieder her
      const backup = loadBackup()
      if (backup && backup.length > 0) {
        console.log('💾 Backup wiederhergestellt nach Verifikationsfehler')
        localStorage.setItem('k2-artworks', JSON.stringify(backup))
      }
      return false
    }
    
    return true
  } catch (error: any) {
    console.error('❌ Fehler beim Speichern:', error)
    
    // Stelle Backup wieder her bei Fehler
    const backup = loadBackup()
    if (backup && backup.length > 0) {
      console.log('💾 Backup wiederhergestellt nach Fehler')
      localStorage.setItem('k2-artworks', JSON.stringify(backup))
    }
    
    // Spezifische Fehlerbehandlung
    if (error.name === 'QuotaExceededError') {
      alert('⚠️ Speicher voll! Bitte einige Werke löschen.')
    } else {
      alert('⚠️ Fehler beim Speichern: ' + (error.message || error))
    }
    
    return false
  }
}

type Filter = 'alle' | 'malerei' | 'keramik'

const GalerieVorschauPage = ({ initialFilter, musterOnly = false }: { initialFilter?: Filter; musterOnly?: boolean }) => {
  const navigate = useNavigate()
  
  // ök2 (musterOnly): nur Musterwerke, keine echten Daten. Sonst: aus localStorage (Supabase async im useEffect)
  const initialArtworks = (() => {
    if (musterOnly) return [...MUSTER_ARTWORKS]
    try {
      const stored = localStorage.getItem('k2-artworks')
      if (!stored) return []
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log('✅ Initiale Werke aus localStorage geladen:', parsed.length, 'Nummern:', parsed.map((a: any) => a.number || a.id))
        return parsed.map((a: any) => {
          if (!a.imageUrl && a.previewUrl) {
            a.imageUrl = a.previewUrl
          }
          if (!a.imageUrl && !a.previewUrl) {
            a.imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5LZWluIEJpbGQ8L3RleHQ+PC9zdmc+'
          }
          return a
        })
      }
      return []
    } catch (error) {
      console.error('Fehler beim initialen Laden:', error)
      return []
    }
  })()
  
  const [artworks, setArtworks] = useState<any[]>(initialArtworks)
  const [filter, setFilter] = useState<Filter>(initialFilter || 'alle')
  const [cartCount, setCartCount] = useState(0)

  // ök2: Bei musterOnly immer nur Musterwerke anzeigen (auch bei Navigation von normaler Vorschau)
  useEffect(() => {
    if (musterOnly) setArtworks([...MUSTER_ARTWORKS])
  }, [musterOnly])
  const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string; artwork: any } | null>(null)
  const [imageZoom, setImageZoom] = useState(1)
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [likedArtworks, setLikedArtworks] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [loadStatus, setLoadStatus] = useState<{ message: string; success: boolean } | null>(null)
  
  // Mobile-First Admin: Neues Objekt hinzufügen / Bearbeiten
  const [showMobileAdmin, setShowMobileAdmin] = useState(false)
  const [editingArtwork, setEditingArtwork] = useState<any | null>(null) // null = neues Objekt, sonst = zu bearbeitendes Objekt
  const [isEditingMode, setIsEditingMode] = useState(false) // Expliziter Flag für Bearbeitungs-Modus
  const [mobilePhoto, setMobilePhoto] = useState<string | null>(null)
  const [mobileTitle, setMobileTitle] = useState('')
  const [mobileCategory, setMobileCategory] = useState<'malerei' | 'keramik'>('malerei')
  const [mobilePrice, setMobilePrice] = useState('')
  const [mobileDescription, setMobileDescription] = useState('')
  const [mobileLocationType, setMobileLocationType] = useState<'regal' | 'bildflaeche' | 'sonstig' | ''>('')
  const [mobileLocationNumber, setMobileLocationNumber] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [showLocationQR, setShowLocationQR] = useState(false)
  const qrScannerVideoRef = useRef<HTMLVideoElement>(null)
  const qrScannerCanvasRef = useRef<HTMLCanvasElement>(null)
  
  // Öffne Modal zum Bearbeiten eines Objekts
  const openEditModal = (artwork: any) => {
    console.log('🔍 openEditModal aufgerufen mit artwork:', artwork)
    
    if (!artwork) {
      console.error('❌ openEditModal: artwork ist null/undefined!')
      return
    }
    
    // Stelle sicher dass number oder id vorhanden ist
    const artworkNumber = artwork.number || artwork.id
    if (!artworkNumber) {
      console.error('❌ openEditModal: artwork hat weder number noch id!', artwork)
      return
    }
    
    console.log('✅ artwork hat number/id:', artworkNumber)
    
    // Setze editingArtwork mit vollständigem Objekt - WICHTIG: number UND id müssen beide gesetzt sein
    const artworkToEdit = {
      ...artwork,
      number: artwork.number || artwork.id,
      id: artwork.id || artwork.number
    }
    
    console.log('✅ artworkToEdit erstellt:', artworkToEdit)
    console.log('✅ artworkToEdit.number:', artworkToEdit.number)
    console.log('✅ artworkToEdit.id:', artworkToEdit.id)
    
    // WICHTIG: Setze editingArtwork ZUERST und explizit den Bearbeitungs-Modus
    setEditingArtwork(artworkToEdit)
    setIsEditingMode(true) // Expliziter Flag für Bearbeitungs-Modus
    
    // Setze alle anderen States
    setMobilePhoto(artwork.imageUrl || artwork.previewUrl || null)
    setMobileTitle(artwork.title || '')
    setMobileCategory(artwork.category || 'malerei')
    setMobilePrice(artwork.price ? String(artwork.price) : '')
    setMobileDescription(artwork.description || '')
    
    // Zuweisungsplatz laden
    if (artwork.location) {
      if (artwork.location.startsWith('Regal')) {
        setMobileLocationType('regal')
        setMobileLocationNumber(artwork.location.replace('Regal ', '').trim())
      } else if (artwork.location.startsWith('Bildfläche')) {
        setMobileLocationType('bildflaeche')
        setMobileLocationNumber(artwork.location.replace('Bildfläche ', '').trim())
      } else {
        setMobileLocationType('sonstig')
        setMobileLocationNumber(artwork.location)
      }
    } else {
      setMobileLocationType('')
      setMobileLocationNumber('')
    }
    
    // Öffne Modal NACH allen State Updates
    setShowMobileAdmin(true)
    
    console.log('✅ Modal geöffnet im Bearbeitungs-Modus, editingArtwork:', artworkToEdit.number || artworkToEdit.id)
  }
  
  // Öffne Modal für neues Objekt
  const openNewModal = () => {
    setEditingArtwork(null)
    setIsEditingMode(false) // Explizit auf "Neues Objekt" Modus setzen
    setMobilePhoto(null)
    setMobileTitle('')
    setMobileCategory('malerei')
    setMobilePrice('')
    setMobileDescription('')
    setMobileLocationType('')
    setMobileLocationNumber('')
    setShowMobileAdmin(true)
  }

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
  
  // QR-Code Scanner für Zuweisungsplätze
  useEffect(() => {
    if (!showQRScanner) return
    
    let stream: MediaStream | null = null
    let scanningInterval: ReturnType<typeof setInterval> | null = null
    
    const startScanning = async () => {
      try {
        // Kamera-Zugriff anfordern
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' } // Rückkamera bevorzugen
        })
        
        if (qrScannerVideoRef.current) {
          qrScannerVideoRef.current.srcObject = stream
        }
        
        // QR-Code-Scanning mit jsQR (falls verfügbar) oder einfachem Text-Scanning
        scanningInterval = setInterval(() => {
          if (qrScannerVideoRef.current && qrScannerCanvasRef.current) {
            const video = qrScannerVideoRef.current
            const canvas = qrScannerCanvasRef.current
            const ctx = canvas.getContext('2d')
            
            if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
              canvas.width = video.videoWidth
              canvas.height = video.videoHeight
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
              
              // Einfaches QR-Code-Scanning: Versuche BarcodeDetector API (moderne Browser)
              if ('BarcodeDetector' in window) {
                const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] })
                detector.detect(canvas)
                  .then((detectedCodes: any[]) => {
                    if (detectedCodes && detectedCodes.length > 0) {
                      const code = detectedCodes[0].rawValue
                      handleScannedQRCode(code)
                    }
                  })
                  .catch(() => {
                    // Fallback: Manuelles Scannen
                  })
              }
            }
          }
        }, 500) // Alle 500ms scannen
      } catch (error) {
        console.error('Kamera-Zugriff fehlgeschlagen:', error)
        alert('⚠️ Kamera-Zugriff fehlgeschlagen. Bitte Berechtigung erteilen.')
        setShowQRScanner(false)
      }
    }
    
    startScanning()
    
    return () => {
      if (scanningInterval) {
        clearInterval(scanningInterval)
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      if (qrScannerVideoRef.current) {
        qrScannerVideoRef.current.srcObject = null
      }
    }
  }, [showQRScanner])

  // Debug: Prüfe editingArtwork wenn Modal geöffnet wird
  useEffect(() => {
    if (showMobileAdmin) {
      console.log('🔍 Modal geöffnet - editingArtwork:', editingArtwork)
      console.log('🔍 editingArtwork?.number:', editingArtwork?.number)
      console.log('🔍 editingArtwork?.id:', editingArtwork?.id)
      console.log('🔍 Hat number oder id?', editingArtwork && (editingArtwork.number || editingArtwork.id))
    }
  }, [showMobileAdmin, editingArtwork])
  
  // Handler für gescannten QR-Code
  const handleScannedQRCode = (code: string) => {
    // Prüfe ob es ein K2-LOCATION QR-Code ist
    if (code.startsWith('K2-LOCATION:')) {
      const locationData = code.replace('K2-LOCATION:', '').trim()
      
      if (locationData.startsWith('Regal')) {
        const number = locationData.replace('Regal', '').trim()
        setMobileLocationType('regal')
        setMobileLocationNumber(number)
        setShowQRScanner(false)
        alert(`✅ Zuweisungsplatz gesetzt: Regal ${number}`)
      } else if (locationData.startsWith('Bildfläche')) {
        const number = locationData.replace('Bildfläche', '').trim()
        setMobileLocationType('bildflaeche')
        setMobileLocationNumber(number)
        setShowQRScanner(false)
        alert(`✅ Zuweisungsplatz gesetzt: Bildfläche ${number}`)
      } else {
        setMobileLocationType('sonstig')
        setMobileLocationNumber(locationData)
        setShowQRScanner(false)
        alert(`✅ Zuweisungsplatz gesetzt: ${locationData}`)
      }
    } else {
      // Nicht erkannt - zeige Info
      console.log('Gescannt:', code)
    }
  }

  // PROFESSIONELL: Lade Werke aus Supabase (primär) oder localStorage (Fallback)
  // musterOnly (ök2): keine echten Daten laden
  useEffect(() => {
    if (musterOnly) return () => {}
    let isMounted = true
    
    // KRITISCH: Erstelle Backup beim ersten Laden
    const currentArtworks = loadArtworks()
    if (currentArtworks && currentArtworks.length > 0) {
      createBackup(currentArtworks)
      console.log('💾 Initiales Backup erstellt:', currentArtworks.length, 'Werke')
    }
    
    const loadArtworksData = async () => {
      // WICHTIG: Prüfe zuerst ob artworks bereits gesetzt sind (z.B. von initialArtworks)
      // Wenn ja und localStorage hat die gleiche Anzahl, überspringe das Laden
      const currentStored = loadArtworks()
      if (artworks && artworks.length > 0 && currentStored && currentStored.length === artworks.length) {
        // Vergleiche IDs um sicherzustellen dass es die gleichen Werke sind
        const currentIds = new Set(artworks.map((a: any) => a.number || a.id).sort())
        const storedIds = new Set(currentStored.map((a: any) => a.number || a.id).sort())
        const idsMatch = currentIds.size === storedIds.size && [...currentIds].every(id => storedIds.has(id))
        
        if (idsMatch) {
          console.log('⏭️ Überspringe Laden - artworks State ist bereits aktuell:', artworks.length, 'Werke')
          setIsLoading(false)
          return
        }
      }
      
      setIsLoading(true)
      setLoadStatus({ message: '🔄 Lade Werke...', success: false })
      
      try {
        // PRIORITÄT 1: Supabase (wenn konfiguriert)
        if (isSupabaseConfigured()) {
          console.log('🗄️ Supabase konfiguriert - lade aus Datenbank...')
          
          try {
            const supabaseArtworks = await loadArtworksFromSupabase()
            
            if (isMounted && supabaseArtworks && supabaseArtworks.length > 0) {
              console.log(`✅ ${supabaseArtworks.length} Werke aus Supabase geladen`)
              setArtworks(supabaseArtworks)
              setLoadStatus({ message: `✅ ${supabaseArtworks.length} Werke geladen`, success: true })
              setTimeout(() => setLoadStatus(null), 2000)
              setIsLoading(false)
              return
            }
            
            // Supabase ist leer - prüfe localStorage für Migration
            if (isMounted && initialArtworks && initialArtworks.length > 0) {
              console.log('🔄 Supabase leer - migriere localStorage → Supabase:', initialArtworks.length, 'Werke')
              const migrationSuccess = await saveArtworksToSupabase(initialArtworks)
              if (migrationSuccess && isMounted) {
                console.log('✅ Migration erfolgreich - lade erneut aus Supabase')
                const migratedArtworks = await loadArtworksFromSupabase()
                if (migratedArtworks && migratedArtworks.length > 0) {
                  setArtworks(migratedArtworks)
                  setLoadStatus({ message: `✅ ${migratedArtworks.length} Werke migriert und geladen`, success: true })
                  setTimeout(() => setLoadStatus(null), 2000)
                  setIsLoading(false)
                  return
                }
              }
            }
          } catch (supabaseError) {
            console.warn('⚠️ Supabase-Laden fehlgeschlagen, verwende Fallback:', supabaseError)
            // Fallback zu localStorage
          }
        }
        
        // PRIORITÄT 2: localStorage (Fallback oder wenn Supabase nicht konfiguriert)
        // WICHTIG: Lade IMMER direkt aus localStorage (nicht initialArtworks verwenden!)
        // initialArtworks wurde beim ersten Render erstellt und könnte veraltet sein
        // KRITISCH: Lokale Werke haben IMMER Priorität - sie wurden gerade erstellt/bearbeitet!
        if (isMounted) {
          // Lade IMMER direkt aus localStorage um neueste Daten zu bekommen
          const stored = loadArtworks()
          if (stored && stored.length > 0) {
            const nummern = stored.map((a: any) => a.number || a.id).join(', ')
            const mobileWorks = stored.filter((a: any) => a.createdOnMobile || a.updatedOnMobile)
            console.log('💾 Gefunden in localStorage:', stored.length, 'Werke, Nummern:', nummern)
            if (mobileWorks.length > 0) {
              console.log(`🔒 ${mobileWorks.length} lokale Mobile-Werke geschützt:`, mobileWorks.map((a: any) => a.number || a.id).join(', '))
            }
            // Bereite Werke für Anzeige vor
            const exhibitionArtworks = stored.map((a: any) => {
              if (!a.imageUrl && a.previewUrl) {
                a.imageUrl = a.previewUrl
              }
              if (!a.imageUrl && !a.previewUrl) {
                a.imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5LZWluIEJpbGQ8L3RleHQ+PC9zdmc+'
              }
              return a
            })
            console.log('✅ Setze artworks State mit', exhibitionArtworks.length, 'Werken (lokale Werke geschützt)')
            setArtworks(exhibitionArtworks)
            setLoadStatus({ message: `✅ ${exhibitionArtworks.length} Werke geladen`, success: true })
            setTimeout(() => setLoadStatus(null), 2000)
            setIsLoading(false)
            return
          } else {
            console.log('⚠️ Keine Werke in localStorage gefunden')
          }
        }
        
        // Keine Daten gefunden
        if (isMounted) {
          console.log('ℹ️ Keine Werke gefunden')
          // KRITISCH: Prüfe Backup bevor wir leeren!
          const backup = loadBackup()
          if (backup && backup.length > 0) {
            console.log('💾 Backup gefunden - verwende Backup statt leeren:', backup.length, 'Werke')
            setArtworks(backup)
            localStorage.setItem('k2-artworks', JSON.stringify(backup))
          } else {
            // Nur leeren wenn wirklich keine Daten vorhanden sind
            setArtworks([])
          }
          setIsLoading(false)
        }
      } catch (error) {
        console.error('❌ Fehler beim Laden:', error)
        if (isMounted) {
          setLoadStatus({ message: '❌ Fehler beim Laden', success: false })
          setTimeout(() => setLoadStatus(null), 3000)
          setIsLoading(false)
        }
      }
    }
    
    loadArtworksData()
    
    // PROFESSIONELL: Automatisches Polling für Mobile-Updates (nur auf Mac)
    const isMac = !/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) && window.innerWidth > 768
    let pollingInterval: ReturnType<typeof setInterval> | null = null
    let initialCheckTimeoutId: ReturnType<typeof setTimeout> | null = null
    
    if (isMac && isSupabaseConfigured()) {
      const checkForMobileUpdates = async () => {
        try {
          const { hasUpdates, artworks } = await checkMobileUpdates()
          if (hasUpdates && artworks && isMounted) {
            console.log(`🔄 Automatisch ${artworks.length} neue Mobile-Daten gefunden und synchronisiert`)
            setArtworks(artworks)
            // Update Hash für nächsten Check
            const hash = artworks.map((a: any) => a.number || a.id).sort().join(',')
            localStorage.setItem('k2-artworks-hash', hash)
            localStorage.setItem('k2-last-load-time', Date.now().toString())
            // Event für andere Komponenten
            window.dispatchEvent(new CustomEvent('artworks-updated', { 
              detail: { count: artworks.length, autoSync: true } 
            }))
          }
        } catch (error) {
          console.warn('⚠️ Auto-Polling fehlgeschlagen:', error)
        }
      }
      
      // Prüfe alle 10 Sekunden auf Mobile-Updates
      pollingInterval = setInterval(checkForMobileUpdates, 10000)
      
      // Erste Prüfung nach 5 Sekunden (mit Cleanup beim Unmount)
      initialCheckTimeoutId = setTimeout(() => {
        if (isMounted) checkForMobileUpdates()
      }, 5000)
    }
    
    // WICHTIG: Automatisches Polling für Mobile-zu-Mobile Sync im Admin-Bereich
    // (nur wenn nicht auf Vercel und auf Mobile-Gerät)
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768
    const isVercel = window.location.hostname.includes('vercel.app')
    let mobilePollingInterval: ReturnType<typeof setInterval> | null = null
    
    if (isMobile && !isVercel && isMounted) {
      console.log('✅ Automatisches Mobile-Polling im Admin-Bereich aktiviert (alle 10 Sekunden)')
      
      const syncFromGalleryData = async () => {
        try {
          // KRITISCH: Lade ZUERST lokale Werke um sicherzustellen dass sie nicht verloren gehen
          const localArtworks = loadArtworks()
          const localCount = localArtworks.length
          
          // Lade gallery-data.json mit Cache-Busting
          const timestamp = Date.now()
          const random = Math.random()
          const url = `/gallery-data.json?v=${timestamp}&t=${timestamp}&r=${random}&_=${Date.now()}`
          
          const response = await fetch(url, { 
            cache: 'no-store',
            method: 'GET',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache'
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            
            if (data.artworks && Array.isArray(data.artworks)) {
              // KRITISCH: Merge mit lokalen Werken - LOKALE HABEN IMMER PRIORITÄT!
              // WICHTIG: Lokale Werke wurden gerade erstellt/bearbeitet und dürfen NICHT überschrieben werden!
              const localMap = new Map<string, any>()
              localArtworks.forEach((local: any) => {
                const key = local.number || local.id
                if (key) {
                  localMap.set(key, local)
                  // Marker für lokale Werke die noch nicht auf Server sind
                  if (local.createdOnMobile || local.updatedOnMobile) {
                    console.log(`🔒 Lokales Werk behalten: ${key} (createdOnMobile/updatedOnMobile)`)
                  }
                }
              })
              
              // Starte MIT ALLEN lokalen Werken (haben Priorität!)
              const merged: any[] = [...localArtworks]
              
              // Füge Server-Werke hinzu die NICHT lokal sind
              data.artworks.forEach((server: any) => {
                const key = server.number || server.id
                if (key && !localMap.has(key)) {
                  merged.push(server)
                }
              })
              
              // KRITISCH: Prüfe ob lokale Werke erhalten bleiben
              const localKeys = new Set(localArtworks.map((a: any) => a.number || a.id))
              const mergedKeys = new Set(merged.map((a: any) => a.number || a.id))
              const allLocalPreserved = [...localKeys].every(key => mergedKeys.has(key))
              
              if (!allLocalPreserved) {
                console.error('❌ KRITISCH: Lokale Werke wurden verloren beim Merge!')
                console.error('Lokale Nummern:', [...localKeys])
                console.error('Gemergte Nummern:', [...mergedKeys])
                // Stelle lokale Werke wieder her
                merged.length = 0
                merged.push(...localArtworks)
                data.artworks.forEach((server: any) => {
                  const key = server.number || server.id
                  if (key && !localMap.has(key)) {
                    merged.push(server)
                  }
                })
                console.log('✅ Lokale Werke wiederhergestellt')
              }
              
              // Nur updaten wenn sich etwas geändert hat
              const currentHash = artworks.map((a: any) => a.number || a.id).sort().join(',')
              const newHash = merged.map((a: any) => a.number || a.id).sort().join(',')
              
              if (currentHash !== newHash && isMounted) {
                console.log(`🔄 Admin-Bereich: ${merged.length} Werke synchronisiert (${localArtworks.length} lokal + ${merged.length - localArtworks.length} Server)`)
                console.log(`🔒 Lokale Werke geschützt: ${localArtworks.length} Werke bleiben erhalten`)
                // KRITISCH: Speichere merged Liste in localStorage
                localStorage.setItem('k2-artworks', JSON.stringify(merged))
                setArtworks(merged)
                window.dispatchEvent(new CustomEvent('artworks-updated', { 
                  detail: { count: merged.length, autoSync: true, fromAdmin: true } 
                }))
              }
            } else {
              // Keine Server-Werke - behalte lokale Werke
              if (localArtworks.length > 0 && isMounted) {
                console.log(`🔒 Keine Server-Daten - behalte ${localArtworks.length} lokale Werke`)
                localStorage.setItem('k2-artworks', JSON.stringify(localArtworks))
                if (artworks.length !== localArtworks.length) {
                  setArtworks(localArtworks)
                }
              }
            }
          } else {
            // Server nicht erreichbar - behalte lokale Werke
            if (localArtworks.length > 0 && isMounted) {
              console.log(`🔒 Server nicht erreichbar - behalte ${localArtworks.length} lokale Werke`)
              localStorage.setItem('k2-artworks', JSON.stringify(localArtworks))
              if (artworks.length !== localArtworks.length) {
                setArtworks(localArtworks)
              }
            }
          }
        } catch (error) {
          console.warn('⚠️ Admin-Bereich Auto-Polling fehlgeschlagen:', error)
          // Bei Fehler: Behalte lokale Werke
          const localArtworks = loadArtworks()
          if (localArtworks.length > 0 && isMounted) {
            console.log(`🔒 Fehler beim Polling - behalte ${localArtworks.length} lokale Werke`)
            localStorage.setItem('k2-artworks', JSON.stringify(localArtworks))
            if (artworks.length !== localArtworks.length) {
              setArtworks(localArtworks)
            }
          }
        }
      }
      
      // Automatisches Polling alle 10 Sekunden
      mobilePollingInterval = setInterval(syncFromGalleryData, 10000)
      
      // Erste Prüfung nach 5 Sekunden
      setTimeout(syncFromGalleryData, 5000)
    }
    
    // Event Listener für Updates von Admin oder GaleriePage
    const handleArtworksUpdate = async (event?: any) => {
      // WICHTIG: Ignoriere Events die von dieser Komponente selbst kommen (justSaved Flag)
      if (event?.detail?.justSaved || event?.detail?.autoSync) {
        console.log('⏭️ Ignoriere artworks-updated Event (gerade gespeichert/synchronisiert)')
        return
      }
      
      // WICHTIG: Ignoriere Events von GaleriePage - die merged bereits korrekt und speichert in localStorage
      // Wir müssen nicht neu laden wenn GaleriePage bereits alles korrekt gemacht hat
      if (event?.detail?.fromGaleriePage) {
        console.log('⏭️ Ignoriere artworks-updated Event (von GaleriePage - bereits gemerged)')
        // Aber lade trotzdem aus localStorage um sicherzustellen dass State aktuell ist
        setTimeout(() => {
          if (!isMounted) return
          const stored = loadArtworks()
          if (stored && stored.length > 0 && isMounted) {
            const exhibitionArtworks = stored.map((a: any) => {
              if (!a.imageUrl && a.previewUrl) {
                a.imageUrl = a.previewUrl
              }
              if (!a.imageUrl && !a.previewUrl) {
                a.imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5LZWluIEJpbGQ8L3RleHQ+PC9zdmc+'
              }
              return a
            })
            // Prüfe ob sich die Anzahl geändert hat
            if (artworks.length !== exhibitionArtworks.length) {
              console.log('🔄 Aktualisiere artworks State nach GaleriePage-Merge:', exhibitionArtworks.length, 'Werke')
              setArtworks(exhibitionArtworks)
            }
          }
        }, 100)
        return
      }
      
      console.log('🔄 Werke wurden aktualisiert (Admin/Galerie), lade neu...', event?.detail)
      
      // Lade aus Supabase wenn konfiguriert, sonst localStorage
      setTimeout(async () => {
        if (!isMounted) return
        
        if (isSupabaseConfigured()) {
          try {
            const updatedArtworks = await loadArtworksFromSupabase()
            if (updatedArtworks && updatedArtworks.length > 0 && isMounted) {
              setArtworks(updatedArtworks)
            }
          } catch (error) {
            console.warn('⚠️ Supabase-Update fehlgeschlagen:', error)
            const stored = loadArtworks()
            if (stored && stored.length > 0 && isMounted) {
              setArtworks(stored)
            }
          }
        } else {
          const stored = loadArtworks()
          if (stored && stored.length > 0 && isMounted) {
            const exhibitionArtworks = stored.map((a: any) => {
              if (!a.imageUrl && a.previewUrl) {
                a.imageUrl = a.previewUrl
              }
              if (!a.imageUrl && !a.previewUrl) {
                a.imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5LZWluIEJpbGQ8L3RleHQ+PC9zdmc+'
              }
              return a
            })
            setArtworks(exhibitionArtworks)
          }
        }
      }, 200)
    }
    
    // WICHTIG: Nur EINMAL registrieren (kein doppelter Listener)
    window.addEventListener('artworks-updated', handleArtworksUpdate)
    
    return () => {
      isMounted = false
      if (initialCheckTimeoutId) {
        clearTimeout(initialCheckTimeoutId)
      }
      if (pollingInterval) {
        clearInterval(pollingInterval)
      }
      if (mobilePollingInterval) {
        console.log('🛑 Automatisches Mobile-Polling im Admin-Bereich gestoppt')
        clearInterval(mobilePollingInterval)
      }
      window.removeEventListener('artworks-updated', handleArtworksUpdate)
    }
  }, [musterOnly])
  
  // ZUSÄTZLICHER useEffect: Stelle sicher dass artworks State IMMER aktuell ist
  // WICHTIG: Prüft localStorage regelmäßig für Updates (z.B. von anderen Tabs/Komponenten)
  // DEAKTIVIERT: Verursacht Konflikte mit dem Haupt-Loading-Mechanismus
  // Die Haupt-Loading-Logik bei Zeile 340 lädt bereits korrekt aus localStorage
  /*
  useEffect(() => {
    const checkForUpdates = () => {
      try {
        const stored = localStorage.getItem('k2-artworks')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed) && parsed.length > 0) {
            const processedArtworks = parsed.map((a: any) => {
              if (!a.imageUrl && a.previewUrl) {
                a.imageUrl = a.previewUrl
              }
              if (!a.imageUrl && !a.previewUrl) {
                a.imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5LZWluIEJpbGQ8L3RleHQ+PC9zdmc+'
              }
              return a
            })
            
            // Prüfe ob sich die Anzahl geändert hat oder ob artworks leer ist
            // WICHTIG: Vergleiche auch die IDs/Numbers um sicherzustellen dass wirklich neue Werke da sind
            const currentIds = new Set(artworks?.map((a: any) => a.number || a.id) || [])
            const newIds = new Set(processedArtworks.map((a: any) => a.number || a.id))
            const hasNewArtworks = processedArtworks.some((a: any) => !currentIds.has(a.number || a.id))
            
            if (!artworks || artworks.length === 0 || artworks.length !== processedArtworks.length || hasNewArtworks) {
              console.log('🔧 Aktualisiere artworks State:', {
                alt: artworks?.length || 0,
                neu: processedArtworks.length,
                nummern: processedArtworks.map((a: any) => a.number || a.id),
                hatNeue: hasNewArtworks
              })
              setArtworks(processedArtworks)
            }
          }
        }
      } catch (error) {
        console.error('❌ Fehler beim Laden aus localStorage:', error)
      }
    }
    
    // Prüfe sofort beim Mount
    checkForUpdates()
    
    // Prüfe auch bei Storage-Events (wenn localStorage von anderer Komponente geändert wird)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'k2-artworks') {
        checkForUpdates()
      }
    }
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [artworks]) // WICHTIG: artworks als Dependency für Vergleich
  */
  
  // Werke vom Server laden (nur wenn wirklich keine vorhanden sind)
  useEffect(() => {
    const loadData = async (forceLocalStorage = false) => {
      setIsLoading(true)
      setLoadStatus({ message: '🔄 Lade Werke...', success: false })
      
      let stored: any[] = []
      
      try {
        // WICHTIG: Wenn forceLocalStorage=true (z.B. nach Admin-Speicherung), 
        // lade direkt aus localStorage ohne Server-Check
        if (forceLocalStorage) {
          const stored = loadArtworks()
          console.log('💾 Force-Load aus localStorage:', stored.length, 'Werke')
          
          if (Array.isArray(stored) && stored.length > 0) {
            const exhibitionArtworks = stored.map((a: any) => {
              if (!a.imageUrl && a.previewUrl) {
                a.imageUrl = a.previewUrl
              }
              if (!a.imageUrl && !a.previewUrl) {
                a.imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5LZWluIEJpbGQ8L3RleHQ+PC9zdmc+'
              }
              return a
            })
            console.log('✅ Werke aus localStorage geladen (nach Admin-Update):', exhibitionArtworks.length)
            setArtworks(exhibitionArtworks)
            setLoadStatus({ message: `✅ ${exhibitionArtworks.length} Werke geladen`, success: true })
            setTimeout(() => setLoadStatus(null), 2000)
            setIsLoading(false)
            
            // Mobile-Sync
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768
            if (isMobile && exhibitionArtworks.length > 0) {
              await saveArtworksToSupabase(exhibitionArtworks)
              syncMobileToSupabase().catch(err => {
                console.warn('⚠️ Mobile-Sync fehlgeschlagen:', err)
              })
            }
            return
          }
        }
        
        // Nur wenn wirklich keine Werke vorhanden sind, lade vom Server
        console.log('🔄 Keine Werke vorhanden - lade vom Server...')
        setLoadStatus({ message: '🔄 Synchronisiere mit Vercel...', success: false })
        
        try {
            const timestamp = Date.now()
            
            // WICHTIG: Prüfe ob wir auf Vercel sind oder localhost
            const isVercel = window.location.hostname.includes('vercel.app') || window.location.hostname.includes('k2-galerie')
            const baseUrl = isVercel 
              ? window.location.origin 
              : 'https://k2-galerie.vercel.app'
            
            const url = `${baseUrl}/gallery-data.json?v=${timestamp}&t=${timestamp}&_=${Math.random()}`
            console.log('📡 Lade von:', url)
            console.log('📡 Hostname:', window.location.hostname)
            console.log('📡 Ist Vercel:', isVercel)
            console.log('📡 Base URL:', baseUrl)
            
            // WICHTIG: Teste zuerst ob die Datei überhaupt existiert
            try {
              const testResponse = await fetch(`${baseUrl}/gallery-data.json?test=true&t=${Date.now()}`, {
                method: 'HEAD',
                cache: 'no-store'
              })
              console.log('🔍 Test-Request Status:', testResponse.status, testResponse.statusText)
              if (!testResponse.ok && testResponse.status === 404) {
                console.error('❌ Datei existiert NICHT auf Vercel!')
                setLoadStatus({ 
                  message: '❌ Datei nicht auf Vercel gefunden - bitte Git Push ausführen', 
                  success: false 
                })
                setTimeout(() => setLoadStatus(null), 10000)
                return
              }
            } catch (testError) {
              console.warn('⚠️ Test-Request fehlgeschlagen:', testError)
            }
            
            // Timeout für große Dateien: 30 Sekunden
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 30000)
            
            const response = await fetch(url, {
              cache: 'no-store',
              signal: controller.signal,
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
              }
            })
            
            clearTimeout(timeoutId)
            
            if (response.ok) {
              console.log('✅ Response OK:', response.status, response.statusText)
              console.log('📦 Content-Type:', response.headers.get('content-type'))
              console.log('📦 Content-Length:', response.headers.get('content-length'))
              
              const data = await response.json()
              console.log('📦 Server-Antwort:', {
                hasArtworks: !!data.artworks,
                artworksCount: data.artworks ? data.artworks.length : 0,
                version: data.version,
                buildId: data.buildId,
                dataKeys: Object.keys(data),
                firstArtwork: data.artworks && data.artworks.length > 0 ? {
                  id: data.artworks[0].id,
                  number: data.artworks[0].number,
                  title: data.artworks[0].title
                } : null
              })
              
              // WICHTIG: Prüfe ob Werke wirklich vorhanden sind
              if (!data.artworks || !Array.isArray(data.artworks) || data.artworks.length === 0) {
                console.error('❌ KEINE WERKE in Server-Antwort gefunden!')
                console.error('❌ Daten-Struktur:', {
                  keys: Object.keys(data),
                  artworksType: typeof data.artworks,
                  artworksIsArray: Array.isArray(data.artworks),
                  artworksLength: data.artworks ? data.artworks.length : 'null'
                })
              }
            
              if (data.artworks && Array.isArray(data.artworks) && data.artworks.length > 0) {
                // Speichere Version-Info und Zeitstempel
                if (data.version) localStorage.setItem('k2-last-loaded-version', String(data.version))
                if (data.buildId) localStorage.setItem('k2-last-build-id', data.buildId)
                localStorage.setItem('k2-last-load-time', String(Date.now()))
                
                // WICHTIG: Merge-Logik - Lokale Werke IMMER behalten!
                // Lade ZUERST lokale Werke BEVOR wir Server-Daten verwenden
                const existingArtworks = loadArtworks()
                const serverArtworks = data.artworks
                
                console.log('🔄 Merge startet:', {
                  lokaleWerke: existingArtworks.length,
                  serverWerke: serverArtworks.length,
                  lokaleNummern: existingArtworks.map((a: any) => a.number || a.id)
                })
                
                // Erstelle Map für schnelle Suche nach Nummern (unterstützt verschiedene Formate)
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
                
                // Starte mit Server-Werken
                const mergedArtworks = [...serverArtworks]
                
                // KRITISCH: Füge ALLE lokalen Werke hinzu die nicht auf Server sind ODER Mobile-Marker haben
                existingArtworks.forEach((localArtwork: any) => {
                  const key = localArtwork.number || localArtwork.id
                  if (!key) return
                  
                  const serverArtwork = serverMap.get(key)
                  
                  // WICHTIG: Mobile-Werke IMMER behalten (createdOnMobile oder updatedOnMobile)
                  const isMobileWork = localArtwork.createdOnMobile || localArtwork.updatedOnMobile
                  
                  if (!serverArtwork) {
                    // Lokales Werk existiert nicht auf Server → IMMER hinzufügen
                    console.log('💾 Behalte lokales Werk (nicht auf Server):', key, isMobileWork ? '(Mobile)' : '')
                    mergedArtworks.push(localArtwork)
                  } else {
                    // Werk existiert auf beiden → prüfe Mobile-Marker ZUERST
                    if (isMobileWork) {
                      // Mobile-Werk → IMMER lokale Version behalten
                      console.log('💾 Behalte Mobile-Werk (immer lokale Version):', key)
                      const index = mergedArtworks.findIndex((a: any) => (a.number || a.id) === key)
                      if (index >= 0) {
                        mergedArtworks[index] = localArtwork
                      } else {
                        mergedArtworks.push(localArtwork)
                      }
                    } else {
                      // Prüfe Timestamps
                      const localCreated = localArtwork.createdAt ? new Date(localArtwork.createdAt).getTime() : 0
                      const serverCreated = serverArtwork.createdAt ? new Date(serverArtwork.createdAt).getTime() : 0
                      const localUpdated = localArtwork.updatedAt ? new Date(localArtwork.updatedAt).getTime() : 0
                      const serverUpdated = serverArtwork.updatedAt ? new Date(serverArtwork.updatedAt).getTime() : 0
                      
                      // Wenn lokales Werk neuer ist ODER kein Timestamp hat → behalte lokale Version
                      const isLocalNewer = localUpdated > serverUpdated || (localUpdated === 0 && localCreated > serverCreated)
                      const hasNoTimestamps = localCreated === 0 && serverCreated === 0
                      
                      if (isLocalNewer || hasNoTimestamps) {
                        console.log('💾 Behalte lokales Werk (neuer oder ohne Timestamp):', key)
                        const index = mergedArtworks.findIndex((a: any) => (a.number || a.id) === key)
                        if (index >= 0) {
                          mergedArtworks[index] = localArtwork
                        } else {
                          mergedArtworks.push(localArtwork)
                        }
                      } else {
                        // Prüfe ob lokales Werk sehr neu ist (< 1 Stunde alt) → behalte es trotzdem
                        const oneHourAgo = Date.now() - 3600000
                        if (localCreated > oneHourAgo) {
                          console.log('💾 Behalte lokales Werk (sehr neu, < 1 Stunde):', key)
                          const index = mergedArtworks.findIndex((a: any) => (a.number || a.id) === key)
                          if (index >= 0) {
                            mergedArtworks[index] = localArtwork
                          } else {
                            mergedArtworks.push(localArtwork)
                          }
                        }
                      }
                    }
                  }
                })
                
                console.log(`🔄 Merge abgeschlossen: ${serverArtworks.length} Server + ${existingArtworks.length} Lokal = ${mergedArtworks.length} Gesamt`)
                console.log('📊 Finale Nummern:', mergedArtworks.map((a: any) => a.number || a.id))
                
                // WICHTIG: Speichere gemergte Liste UND synchronisiere zu Supabase (falls Mobile)
                try {
                  localStorage.setItem('k2-artworks', JSON.stringify(mergedArtworks))
                  console.log('✅ Gemergte Werke gespeichert:', mergedArtworks.length)
                  
                  // Mobile: Synchronisiere gemergte Liste zu Supabase
                  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768
                  if (isMobile && mergedArtworks.length > 0) {
                    try {
                      await saveArtworksToSupabase(mergedArtworks)
                      console.log('✅ Gemergte Werke zu Supabase synchronisiert')
                    } catch (syncError) {
                      console.warn('⚠️ Supabase-Sync fehlgeschlagen:', syncError)
                    }
                  }
                  
                  stored = mergedArtworks
                  
                  // KRITISCH: Setze artworks SOFORT nach Merge
                  // Stelle sicher dass ALLE Werke angezeigt werden
                  const exhibitionArtworks = mergedArtworks.map((a: any) => {
                    if (!a.imageUrl && a.previewUrl) {
                      a.imageUrl = a.previewUrl
                    }
                    if (!a.imageUrl && !a.previewUrl) {
                      a.imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5LZWluIEJpbGQ8L3RleHQ+PC9zdmc+'
                    }
                    return a
                  })
                  
                  console.log('🎨 Setze artworks State:', exhibitionArtworks.length, 'Werke')
                  console.log('🎨 Nummern:', exhibitionArtworks.map((a: any) => a.number || a.id))
                  setArtworks(exhibitionArtworks)
                  
                  setLoadStatus({ 
                    message: `✅ ${mergedArtworks.length} Werke synchronisiert (${serverArtworks.length} Server + ${mergedArtworks.length - serverArtworks.length} Mobile)`, 
                    success: true 
                  })
                  setTimeout(() => setLoadStatus(null), 3000)
                  setIsLoading(false)
                } catch (e) {
                  console.warn('⚠️ Werke zu groß für localStorage, verwende direkt')
                  stored = mergedArtworks
                  
                  // WICHTIG: Setze artworks auch wenn localStorage zu groß
                  const exhibitionArtworks = mergedArtworks.map((a: any) => {
                    if (!a.imageUrl && a.previewUrl) {
                      a.imageUrl = a.previewUrl
                    }
                    if (!a.imageUrl && !a.previewUrl) {
                      a.imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5LZWluIEJpbGQ8L3RleHQ+PC9zdmc+'
                    }
                    return a
                  })
                  setArtworks(exhibitionArtworks)
                  
                  setLoadStatus({ message: `✅ ${mergedArtworks.length} Werke geladen`, success: true })
                  setTimeout(() => setLoadStatus(null), 3000)
                  setIsLoading(false)
                }
              } else {
                console.error('❌ Keine Werke in Server-Antwort gefunden!')
                console.error('❌ Daten-Struktur:', {
                  hasArtworks: !!data.artworks,
                  isArray: Array.isArray(data.artworks),
                  length: data.artworks ? data.artworks.length : 'null',
                  dataKeys: Object.keys(data)
                })
                
                // Fallback: Verwende localStorage wenn vorhanden
                if (stored && stored.length > 0) {
                  console.log('📦 Verwende localStorage-Daten (Server hat keine Werke):', stored.length)
                  const exhibitionArtworks = stored.map((a: any) => {
                    if (!a.imageUrl && a.previewUrl) {
                      a.imageUrl = a.previewUrl
                    }
                    if (!a.imageUrl && !a.previewUrl) {
                      a.imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5LZWluIEJpbGQ8L3RleHQ+PC9zdmc+'
                    }
                    return a
                  })
                  setArtworks(exhibitionArtworks)
                  setLoadStatus({ message: `⚠️ Server hat keine Werke - verwende Cache (${stored.length})`, success: false })
                  setTimeout(() => setLoadStatus(null), 5000)
                } else {
                  // KRITISCH: Prüfe Backup bevor wir leeren!
                  const backup = loadBackup()
                  if (backup && backup.length > 0) {
                    console.log('💾 Backup gefunden - verwende Backup statt leeren:', backup.length, 'Werke')
                    setArtworks(backup)
                    localStorage.setItem('k2-artworks', JSON.stringify(backup))
                    setLoadStatus({ message: `💾 Backup wiederhergestellt: ${backup.length} Werke`, success: true })
                  } else {
                    setArtworks([])
                    setLoadStatus({ message: '❌ Keine Werke gefunden - weder Server noch Cache', success: false })
                  }
                  setTimeout(() => setLoadStatus(null), 10000)
                }
                setIsLoading(false)
              }
            } else if (response.status === 404) {
              console.error('❌ Datei nicht gefunden (404) - gallery-data.json existiert nicht auf Vercel!')
              setLoadStatus({ 
                message: '❌ Datei nicht auf Vercel gefunden - bitte "Veröffentlichen" und "Git Push" ausführen', 
                success: false 
              })
              setTimeout(() => setLoadStatus(null), 10000)
              
              // Fallback: Verwende localStorage wenn vorhanden
              if (stored && stored.length > 0) {
                console.log('📦 Verwende localStorage-Daten (404-Fehler):', stored.length)
                setArtworks(stored)
                setIsLoading(false)
              } else {
                setIsLoading(false)
              }
            } else {
              console.error('❌ Server-Fehler:', response.status, response.statusText)
              console.error('❌ Response URL:', response.url)
              console.error('❌ Response Headers:', Object.fromEntries(response.headers.entries()))
              
              // Versuche Response-Text zu lesen für mehr Details
              response.text().then(text => {
                console.error('❌ Response Body (erste 500 Zeichen):', text.substring(0, 500))
              }).catch(e => {
                console.error('❌ Konnte Response-Text nicht lesen:', e)
              })
              
              // Fallback: Verwende localStorage wenn vorhanden
              if (stored && stored.length > 0) {
                console.log('📦 Verwende localStorage-Daten (Server-Fehler):', stored.length)
                setArtworks(stored)
                setLoadStatus({ message: `✅ ${stored.length} Werke aus Cache (Server-Fehler ${response.status})`, success: true })
                setTimeout(() => setLoadStatus(null), 3000)
              } else {
                setLoadStatus({ message: `⚠️ Server-Fehler ${response.status}: ${response.statusText} - bitte "Aktualisieren" klicken`, success: false })
                setTimeout(() => setLoadStatus(null), 10000)
              }
              setIsLoading(false)
            }
        } catch (error: any) {
          console.error('❌ gallery-data.json konnte nicht geladen werden:', error)
          console.error('❌ Fehler-Details:', {
            name: error?.name,
            message: error?.message,
            stack: error?.stack
          })
          
          // WICHTIG: Bei Fehler IMMER Supabase prüfen (falls Mobile)
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768
          if (isMobile) {
            try {
              console.log('📱 Versuche Supabase als Fallback...')
              const { loadArtworksFromSupabase } = await import('../utils/supabaseClient')
              const supabaseArtworks = await loadArtworksFromSupabase()
              if (supabaseArtworks && Array.isArray(supabaseArtworks) && supabaseArtworks.length > 0) {
                console.log('✅ Supabase-Daten geladen:', supabaseArtworks.length)
                localStorage.setItem('k2-artworks', JSON.stringify(supabaseArtworks))
                stored = supabaseArtworks
                setArtworks(supabaseArtworks)
                setLoadStatus({ message: `✅ ${supabaseArtworks.length} Werke von Supabase geladen`, success: true })
                setTimeout(() => setLoadStatus(null), 3000)
                setIsLoading(false)
                return
              }
            } catch (supabaseError) {
              console.warn('⚠️ Supabase-Fallback fehlgeschlagen:', supabaseError)
            }
          }
          
          // Fallback: Verwende localStorage wenn vorhanden
          if (stored && stored.length > 0) {
            console.log('📦 Verwende localStorage-Daten (Fehler):', stored.length)
            setArtworks(stored)
            setLoadStatus({ message: `✅ ${stored.length} Werke aus Cache`, success: true })
            setTimeout(() => setLoadStatus(null), 3000)
          } else {
            const errorMsg = error?.name === 'AbortError' 
              ? '⚠️ Zeitüberschreitung beim Laden - bitte "Aktualisieren" klicken' 
              : error?.message 
              ? `⚠️ Fehler: ${error.message}` 
              : '⚠️ Fehler beim Laden - bitte "Aktualisieren" klicken'
            setLoadStatus({ message: errorMsg, success: false })
            setTimeout(() => setLoadStatus(null), 10000)
          }
          setIsLoading(false)
        }
        
        if (Array.isArray(stored) && stored.length > 0) {
          // WICHTIG: Zeige ALLE Werke - auch ohne Bild (für Debugging)
          const exhibitionArtworks = stored
            .map((a: any) => {
              // Stelle sicher, dass imageUrl korrekt gesetzt ist
              if (!a.imageUrl && a.previewUrl) {
                a.imageUrl = a.previewUrl
              }
              // Fallback: Leeres Bild wenn keines vorhanden
              if (!a.imageUrl && !a.previewUrl) {
                a.imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5LZWluIEJpbGQ8L3RleHQ+PC9zdmc+'
              }
              return a
            })
          console.log('✅ Geladene Werke:', exhibitionArtworks.length, 'von', stored.length)
          console.log('📊 Werke Details:', {
            total: stored.length,
            withImage: exhibitionArtworks.filter((a: any) => a.imageUrl && !a.imageUrl.includes('data:image/svg')).length,
            withoutImage: exhibitionArtworks.filter((a: any) => !a.imageUrl || a.imageUrl.includes('data:image/svg')).length
          })
          setArtworks(exhibitionArtworks)
          
          // WICHTIG: Synchronisiere Mobile-Daten zu Supabase (für Mac-Sync)
          // Nur auf Mobile-Geräten (nicht auf Mac)
          // Wird auch nach Server-Laden gemacht, um sicherzustellen dass alle Daten synchronisiert sind
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768
          if (isMobile && exhibitionArtworks.length > 0) {
            syncMobileToSupabase().catch(err => {
              console.warn('⚠️ Mobile-Sync fehlgeschlagen:', err)
            })
          }
        } else {
          console.warn('⚠️ Keine Werke gefunden')
          // KRITISCH: Prüfe Backup bevor wir leeren!
          const backup = loadBackup()
          if (backup && backup.length > 0) {
            console.log('💾 Backup gefunden - verwende Backup statt leeren:', backup.length, 'Werke')
            setArtworks(backup)
            localStorage.setItem('k2-artworks', JSON.stringify(backup))
            setLoadStatus({ message: `💾 Backup wiederhergestellt: ${backup.length} Werke`, success: true })
          } else {
            setArtworks([])
            setLoadStatus({ message: '⚠️ Keine Werke gefunden', success: false })
          }
          setTimeout(() => setLoadStatus(null), 3000)
        }
      } catch (error) {
        console.error('❌ Fehler beim Laden:', error)
        // KRITISCH: Bei Fehler Backup wiederherstellen!
        const backup = loadBackup()
        if (backup && backup.length > 0) {
          console.log('💾 Backup wiederhergestellt nach Fehler:', backup.length, 'Werke')
          setArtworks(backup)
          localStorage.setItem('k2-artworks', JSON.stringify(backup))
          setLoadStatus({ message: `💾 Backup wiederhergestellt: ${backup.length} Werke`, success: true })
        } else {
          setArtworks([])
          setLoadStatus({ message: '❌ Fehler beim Laden', success: false })
        }
        setTimeout(() => setLoadStatus(null), 3000)
      } finally {
        setIsLoading(false)
      }
    }
    
    // Nur wenn wirklich keine Werke vorhanden sind, lade vom Server
    if ((!initialArtworks || initialArtworks.length === 0) && (!artworks || artworks.length === 0)) {
      loadData()
    }
  }, [artworks, initialArtworks])
  
  // Manuelle Refresh-Funktion - lädt IMMER neu vom Server
  // KRITISCH: Mobile-Werke haben ABSOLUTE PRIORITÄT - sie dürfen NIEMALS gelöscht werden!
  const handleRefresh = async () => {
    setIsLoading(true)
    setLoadStatus({ message: '🔄 Synchronisiere mit Server...', success: false })
    
    // KRITISCH: Lade ZUERST lokale Werke um Mobile-Werke zu schützen! (außerhalb try-catch für Scope)
    const localArtworks = loadArtworks()
    
    try {
      const mobileWorks = localArtworks.filter((a: any) => a.createdOnMobile || a.updatedOnMobile)
      
      if (mobileWorks.length > 0) {
        console.log(`🔒 ${mobileWorks.length} Mobile-Werke geschützt vor Synchronisierung:`, mobileWorks.map((a: any) => a.number || a.id).join(', '))
      }
      
      // WICHTIG: Synchronisiere Mobile-Daten zu Supabase BEVOR wir neue Daten laden
      // Das stellt sicher, dass neu hinzugefügte Bilder auch am Mac ankommen
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768
      if (isMobile) {
        try {
          if (localArtworks && localArtworks.length > 0) {
            console.log('📱 Synchronisiere Mobile-Daten zu Supabase...', localArtworks.length, 'Werke')
            await saveArtworksToSupabase(localArtworks)
            await syncMobileToSupabase()
            setLoadStatus({ message: '✅ Mobile-Daten synchronisiert', success: true })
            setTimeout(() => setLoadStatus({ message: '🔄 Lade vom Server...', success: false }), 1000)
          }
        } catch (syncError) {
          console.warn('⚠️ Mobile-Sync fehlgeschlagen:', syncError)
          // Weiter mit Server-Laden auch wenn Sync fehlschlägt
        }
      }
      
      // WICHTIG: Lösche NICHT localStorage - Mobile-Werke müssen erhalten bleiben!
      // Nur Cache-Marker löschen, nicht die Werke selbst!
      localStorage.removeItem('k2-last-loaded-timestamp')
      localStorage.removeItem('k2-last-loaded-version')
      localStorage.removeItem('k2-last-build-id')
      localStorage.removeItem('k2-last-load-time') // WICHTIG: Auch Load-Time entfernen
      
      // Maximale Cache-Busting URL
      const timestamp = Date.now()
      const random = Math.random()
      
      // WICHTIG: Prüfe ob wir auf Vercel sind oder localhost
      const isVercel = window.location.hostname.includes('vercel.app') || window.location.hostname.includes('k2-galerie')
      const baseUrl = isVercel 
        ? window.location.origin 
        : 'https://k2-galerie.vercel.app'
      
      const url = `${baseUrl}/gallery-data.json?v=${timestamp}&t=${timestamp}&r=${random}&_=${Date.now()}&nocache=${Math.random()}&force=${Date.now()}&refresh=${Math.random()}`
      
      console.log('🔄 Lade neue Daten vom Server...', url)
      console.log('🔄 Hostname:', window.location.hostname)
      console.log('🔄 Ist Vercel:', isVercel)
      
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
          // Speichere Version-Info und Zeitstempel
          if (data.version) localStorage.setItem('k2-last-loaded-version', String(data.version))
          if (data.buildId) localStorage.setItem('k2-last-build-id', data.buildId)
          if (data.exportedAt) localStorage.setItem('k2-last-loaded-timestamp', data.exportedAt)
          localStorage.setItem('k2-last-load-time', String(Date.now())) // WICHTIG: Load-Time speichern
          
          // KRITISCH: Merge-Logik - Mobile-Werke haben ABSOLUTE PRIORITÄT!
          // WICHTIG: Lokale Werke wurden oben bereits geladen und gesichert!
          const serverArtworks = data.artworks
          
          // Erstelle Map für schnelle Suche
          const serverMap = new Map<string, any>()
          serverArtworks.forEach((a: any) => {
            const key = a.number || a.id
            if (key) serverMap.set(key, a)
          })
          
          // KRITISCH: Starte mit ALLEN lokalen Werken (haben ABSOLUTE Priorität!)
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
          
          // Starte mit ALLEN lokalen Werken (haben Priorität!)
          const mergedArtworks: any[] = [...localArtworks]
          
          // Füge Server-Werke hinzu die NICHT lokal sind
          serverArtworks.forEach((serverArtwork: any) => {
            const key = serverArtwork.number || serverArtwork.id
            if (key && !localMap.has(key)) {
              mergedArtworks.push(serverArtwork)
            }
          })
          
          // KRITISCH: Prüfe ob ALLE lokalen Werke erhalten bleiben!
          const localKeys = new Set(localArtworks.map((a: any) => a.number || a.id))
          const mergedKeys = new Set(mergedArtworks.map((a: any) => a.number || a.id))
          const allLocalPreserved = [...localKeys].every(key => mergedKeys.has(key))
          
          if (!allLocalPreserved) {
            console.error('❌ KRITISCH: Lokale Werke wurden verloren beim Merge!')
            console.error('Lokale Nummern:', [...localKeys])
            console.error('Gemergte Nummern:', [...mergedKeys])
            // Stelle lokale Werke wieder her - Mobile-Werke haben Priorität!
            mergedArtworks.length = 0
            mergedArtworks.push(...localArtworks)
            serverArtworks.forEach((serverArtwork: any) => {
              const key = serverArtwork.number || serverArtwork.id
              if (key && !localMap.has(key)) {
                mergedArtworks.push(serverArtwork)
              }
            })
            console.log('✅ Lokale Werke wiederhergestellt - Mobile-Werke geschützt!')
          }
          
          console.log(`🔒 Lokale Werke geschützt: ${localArtworks.length} Werke bleiben erhalten`)
          
          // Speichere gemergte Liste
          try {
            localStorage.setItem('k2-artworks', JSON.stringify(mergedArtworks))
            console.log('✅ Gemergte Werke geladen:', mergedArtworks.length, 'Version:', data.version, `(${serverArtworks.length} Server + ${mergedArtworks.length - serverArtworks.length} Mobile)`)
            
            // WICHTIG: Zeige ALLE Werke - auch ohne Bild (für Debugging)
            const exhibitionArtworks = mergedArtworks
              .map((a: any) => {
                if (!a) return null
                // Stelle sicher, dass imageUrl korrekt gesetzt ist
                if (!a.imageUrl && a.previewUrl) {
                  a.imageUrl = a.previewUrl
                }
                // Fallback: Leeres Bild wenn keines vorhanden
                if (!a.imageUrl && !a.previewUrl) {
                  a.imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5LZWluIEJpbGQ8L3RleHQ+PC9zdmc+'
                }
                return a
              })
              .filter((a: any) => a !== null) // Entferne null-Werte
            
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
          // KEINE Server-Daten - behalte ALLE lokalen Werke!
          console.warn('⚠️ Keine Werke in gallery-data.json gefunden - behalte lokale Werke:', localArtworks.length)
          if (localArtworks.length > 0) {
            console.log('🔒 Lokale Werke bleiben erhalten:', localArtworks.map((a: any) => a.number || a.id).join(', '))
            // Stelle sicher dass lokale Werke gespeichert bleiben
            localStorage.setItem('k2-artworks', JSON.stringify(localArtworks))
            const exhibitionArtworks = localArtworks.map((a: any) => {
              if (!a.imageUrl && a.previewUrl) a.imageUrl = a.previewUrl
              if (!a.imageUrl && !a.previewUrl) {
                a.imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5LZWluIEJpbGQ8L3RleHQ+PC9zdmc+'
              }
              return a
            })
            setArtworks(exhibitionArtworks)
            setLoadStatus({ message: `✅ ${localArtworks.length} lokale Werke erhalten`, success: true })
            setTimeout(() => setLoadStatus(null), 3000)
          } else {
            setLoadStatus({ message: '⚠️ Keine Werke in Datei', success: false })
            setTimeout(() => setLoadStatus(null), 3000)
          }
        }
      } else {
        // Server nicht erreichbar - behalte lokale Werke!
        console.warn('⚠️ Server nicht erreichbar - behalte lokale Werke:', localArtworks.length)
        if (localArtworks.length > 0) {
          console.log('🔒 Lokale Werke bleiben erhalten:', localArtworks.map((a: any) => a.number || a.id).join(', '))
          localStorage.setItem('k2-artworks', JSON.stringify(localArtworks))
          const exhibitionArtworks = localArtworks.map((a: any) => {
            if (!a.imageUrl && a.previewUrl) a.imageUrl = a.previewUrl
            if (!a.imageUrl && !a.previewUrl) {
              a.imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5LZWluIEJpbGQ8L3RleHQ+PC9zdmc+'
            }
            return a
          })
          setArtworks(exhibitionArtworks)
          setLoadStatus({ message: `✅ ${localArtworks.length} lokale Werke erhalten`, success: true })
        } else {
          setLoadStatus({ message: '⚠️ Server nicht erreichbar', success: false })
        }
        setTimeout(() => setLoadStatus(null), 3000)
      }
    } catch (error) {
      console.error('❌ Fehler beim Aktualisieren:', error)
      // Bei Fehler: Behalte lokale Werke!
      if (localArtworks.length > 0) {
        console.log('🔒 Fehler beim Laden - behalte lokale Werke:', localArtworks.length)
        localStorage.setItem('k2-artworks', JSON.stringify(localArtworks))
        const exhibitionArtworks = localArtworks.map((a: any) => {
          if (!a.imageUrl && a.previewUrl) a.imageUrl = a.previewUrl
          if (!a.imageUrl && !a.previewUrl) {
            a.imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5LZWluIEJpbGQ8L3RleHQ+PC9zdmc+'
          }
          return a
        })
        setArtworks(exhibitionArtworks)
        setLoadStatus({ message: `✅ ${localArtworks.length} lokale Werke erhalten`, success: true })
      } else {
        setLoadStatus({ message: '❌ Fehler beim Laden', success: false })
      }
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

  // KRITISCH: useEffect der prüft ob Werke geladen werden müssen
  // Das stellt sicher, dass gespeicherte Werke angezeigt werden
  useEffect(() => {
    if ((!artworks || artworks.length === 0) && !isLoading) {
      // Versuche aus localStorage zu laden
      const stored = loadArtworks()
      if (stored && stored.length > 0) {
        console.log('⚠️ artworks State ist leer, aber localStorage hat Werke! Lade...', stored.length)
        const exhibitionArtworks = stored.map((a: any) => {
          if (!a.imageUrl && a.previewUrl) {
            a.imageUrl = a.previewUrl
          }
          if (!a.imageUrl && !a.previewUrl) {
            a.imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5LZWluIEJpbGQ8L3RleHQ+PC9zdmc+'
          }
          return a
        })
        setArtworks(exhibitionArtworks)
      }
    }
  }, [artworks, isLoading])
  
  // ENTFERNT: Prüfung die "Keine Werke gefunden" zeigt
  // Die Werke werden jetzt synchron beim ersten Render geladen (initialArtworks)
  // und der useEffect lädt sie falls nötig
  // Diese Prüfung verhinderte die Anzeige der Werke

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
      background: musterOnly
        ? 'linear-gradient(135deg, var(--k2-bg-1) 0%, var(--k2-bg-2) 50%, var(--k2-bg-3) 100%)'
        : 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1419 100%)',
      color: musterOnly ? 'var(--k2-text)' : '#ffffff',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Animated Background Elements (ök2: dezent) */}
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
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Mobile-First Admin: Neues Objekt Button (ök2: ausblenden) */}
        {!musterOnly && showMobileAdmin && (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768) && (
          <button
            onClick={openNewModal}
            style={{
              position: 'fixed',
              top: '1rem',
              left: '1rem',
              zIndex: 10001,
              background: 'linear-gradient(120deg, #10b981, #059669)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
              fontSize: '0.9rem',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(16, 185, 129, 0.5)',
              transition: 'all 0.2s ease',
              touchAction: 'manipulation',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              minWidth: '120px',
              minHeight: '44px'
            }}
            title="Neues Objekt hinzufügen"
          >
            <span style={{ fontSize: '1.2em' }}>📸</span>
            <span>Neu</span>
          </button>
        )}
        
        {/* Arbeitsplattform-Link entfernt - nicht benötigt auf iPad/Mobile */}
        
        {/* Aktualisieren Button entfernt - nicht benötigt auf iPad/Mobile */}
        
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
            <div style={{ flex: 1 }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem', 
                marginBottom: '0.5rem',
                flexWrap: 'wrap'
              }}>
                {/* Arbeitsplattform-Link entfernt - nicht benötigt auf iPad/Mobile */}
                <Link 
                  to={PROJECT_ROUTES['k2-galerie'].home}
                  style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                    e.currentTarget.style.color = '#ffffff'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'
                  }}
                >
                  <span>←</span>
                  <span>Projekt-Start</span>
                </Link>
              </div>
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
              fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
              alignItems: 'center'
            }}>
              <Link 
                to={musterOnly ? PROJECT_ROUTES['k2-galerie'].galerieOeffentlich : PROJECT_ROUTES['k2-galerie'].galerie} 
                style={{ 
                  padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)', 
                  background: musterOnly ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: musterOnly ? '1px solid rgba(45, 45, 42, 0.15)' : '1px solid rgba(255, 255, 255, 0.2)',
                  color: musterOnly ? 'var(--k2-text)' : '#ffffff', 
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
                  e.currentTarget.style.background = musterOnly ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.2)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = musterOnly ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                ← Zur Galerie
              </Link>
              <Link 
                to={PROJECT_ROUTES['k2-galerie'].shop}
                style={{ 
                  padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)', 
                  background: musterOnly ? 'linear-gradient(135deg, var(--k2-accent) 0%, #6b9080 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: musterOnly ? 'var(--k2-text)' : '#ffffff', 
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
              {!musterOnly && (
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
              )}
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
          // WICHTIG: Verwende artworks State - useEffect sorgt für Korrektur wenn nötig
          // Keine setState-Aufrufe während Render (verursacht Render-Loops)
          let currentArtworks = artworks && artworks.length > 0 ? artworks : (initialArtworks && initialArtworks.length > 0 ? initialArtworks : [])
          
          // KRITISCH: Fallback - wenn beide leer sind, lade direkt aus localStorage
          if (!currentArtworks || currentArtworks.length === 0) {
            try {
              const stored = localStorage.getItem('k2-artworks')
              if (stored) {
                const parsed = JSON.parse(stored)
                if (Array.isArray(parsed) && parsed.length > 0) {
                  console.log('🔄 Render-Fallback: Lade direkt aus localStorage:', parsed.length)
                  currentArtworks = parsed.map((a: any) => {
                    if (!a.imageUrl && a.previewUrl) {
                      a.imageUrl = a.previewUrl
                    }
                    if (!a.imageUrl && !a.previewUrl) {
                      a.imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5LZWluIEJpbGQ8L3RleHQ+PC9zdmc+'
                    }
                    return a
                  })
                }
              }
            } catch (error) {
              console.error('❌ Fehler beim Render-Fallback-Laden:', error)
            }
          }
          
          // KRITISCH: Debug-Log um zu sehen was passiert
          console.log('🎨 Render - artworks State:', {
            artworksAnzahl: artworks?.length || 0,
            initialArtworksAnzahl: initialArtworks?.length || 0,
            currentArtworksAnzahl: currentArtworks.length,
            nummern: currentArtworks.map((a: any) => a.number || a.id),
            filter: filter
          })
          
          const filteredArtworks = currentArtworks.filter((artwork) => {
            if (!artwork) return false
            if (filter === 'alle') return true
            // WICHTIG: Prüfe ob artwork.category existiert und mit filter übereinstimmt
            // Wenn category fehlt, zeige Werk bei Filter "alle" (bereits oben geprüft)
            if (!artwork.category) {
              console.warn('⚠️ Werk ohne category:', artwork.number || artwork.id)
              return false // Verstecke Werke ohne category bei spezifischem Filter
            }
            return artwork.category === filter
          })
          
          console.log('🎨 Render - filteredArtworks:', {
            anzahl: filteredArtworks.length,
            nummern: filteredArtworks.map((a: any) => a.number || a.id),
            filter: filter
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
                    {/* Bearbeiten-Button (ök2: ausblenden) */}
                    {!musterOnly && showMobileAdmin && (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditModal(artwork)
                        }}
                        style={{
                          position: 'absolute',
                          top: '0.75rem',
                          left: '0.75rem',
                          background: 'linear-gradient(120deg, #5ffbf1, #33a1ff)',
                          color: '#0a0e27',
                          border: 'none',
                          borderRadius: '8px',
                          padding: 'clamp(0.4rem, 1.5vw, 0.5rem) clamp(0.75rem, 2vw, 1rem)',
                          fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
                          fontWeight: '700',
                          zIndex: 2,
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(95, 251, 241, 0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                        title="Objekt bearbeiten"
                      >
                        ✏️ Bearbeiten
                      </button>
                    )}
                    
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
                        <>
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
                          onLoad={(e) => {
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
                          {/* Nummer als Overlay auf dem Bild */}
                          {artwork.number && (
                            <div style={{
                              position: 'absolute',
                              bottom: '0.5rem',
                              right: '0.5rem',
                              background: 'rgba(0, 0, 0, 0.7)',
                              backdropFilter: 'blur(4px)',
                              color: '#ffffff',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '6px',
                              fontSize: 'clamp(0.7rem, 2vw, 0.85rem)',
                              fontWeight: '600',
                              fontFamily: 'monospace',
                              pointerEvents: 'none',
                              zIndex: 2,
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                            }}>
                              {artwork.number}
                            </div>
                          )}
                        </>
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
                    {artwork.location && (
                      <p style={{ 
                        margin: '0.25rem 0', 
                        fontSize: 'clamp(0.75rem, 2vw, 0.85rem)', 
                        color: 'rgba(95, 251, 241, 0.8)',
                        fontWeight: '500'
                      }}>
                        📍 {artwork.location}
                      </p>
                    )}
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

      {/* Bildschirmfüllende Lightbox für Bilder - auf Mobile ganzer Bildschirm (100dvh) */}
      {lightboxImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768) ? '100vw' : undefined,
            height: (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768) ? '100dvh' : undefined,
            minHeight: (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768) ? '100vh' : undefined,
            background: 'rgba(0, 0, 0, 0.95)',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768)
              ? 'max(env(safe-area-inset-top), 0.5rem) max(env(safe-area-inset-left), 0.5rem) max(env(safe-area-inset-bottom), 0.5rem) max(env(safe-area-inset-right), 0.5rem)'
              : '1rem'
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
            <div style={{ flex: 1 }}>
              <h3 style={{
                color: '#ffffff',
                margin: 0,
                fontSize: 'clamp(1rem, 3vw, 1.5rem)',
                fontWeight: '600'
              }}>
                {lightboxImage.title}
              </h3>
              {lightboxImage.artwork?.number && (
                <div style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
                  fontFamily: 'monospace',
                  marginTop: '0.25rem'
                }}>
                  {lightboxImage.artwork.number}
                </div>
              )}
            </div>
            
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

            {/* Bild bearbeiten Button (ök2: ausblenden) */}
            {!musterOnly && showMobileAdmin && lightboxImage.artwork && (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768) && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  openEditModal(lightboxImage.artwork)
                  setLightboxImage(null)
                  setImageZoom(1)
                  setImagePosition({ x: 0, y: 0 })
                }}
                style={{
                  background: 'linear-gradient(120deg, #5ffbf1, #33a1ff)',
                  border: 'none',
                  color: '#0a0e27',
                  fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                  padding: 'clamp(0.5rem, 1.5vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: '700',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 10px 30px rgba(95, 251, 241, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(95, 251, 241, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(95, 251, 241, 0.3)'
                }}
              >
                ✏️ Bild bearbeiten
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

          {/* Bild Container - auf Mobile ganzer Bildschirm (flex: 1) */}
          <div
            style={{
              width: '100%',
              height: '100%',
              flex: (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768) ? 1 : undefined,
              minHeight: (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768) ? 0 : undefined,
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
            {/* Nummer als Overlay auf dem Bild in der Lightbox */}
            {lightboxImage.artwork?.number && (
              <div style={{
                position: 'absolute',
                bottom: '1rem',
                right: '1rem',
                background: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(6px)',
                color: '#ffffff',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
                fontWeight: '600',
                fontFamily: 'monospace',
                pointerEvents: 'none',
                zIndex: 2,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
              }}>
                {lightboxImage.artwork.number}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Mobile-First Admin Modal */}
      {showMobileAdmin && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          zIndex: 20000,
          display: 'flex',
          flexDirection: 'column',
          padding: '1rem',
          overflowY: 'auto'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1f3a 0%, #0f1419 100%)',
            borderRadius: '16px',
            padding: '1.5rem',
            maxWidth: '500px',
            width: '100%',
            margin: 'auto',
            border: '2px solid rgba(95, 251, 241, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#5ffbf1' }}>
                {isEditingMode && editingArtwork && (editingArtwork.number || editingArtwork.id)
                  ? `✏️ Objekt bearbeiten (${editingArtwork.number || editingArtwork.id})`
                  : '📸 Neues Objekt'}
              </h2>
              <button
                onClick={() => {
                  setShowMobileAdmin(false)
                  setEditingArtwork(null)
                  setIsEditingMode(false)
                  setMobilePhoto(null)
                  setMobileTitle('')
                  setMobileCategory('malerei')
                  setMobilePrice('')
                  setMobileDescription('')
                  setMobileLocationType('')
                  setMobileLocationNumber('')
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '1.5rem',
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>
            
            {/* Foto: nur im Admin (Neues Werk hinzufügen) – hier nur Hinweis bzw. Anzeige beim Bearbeiten */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff', fontWeight: '600' }}>
                Foto
              </label>
              {editingArtwork && (mobilePhoto || editingArtwork.imageUrl) ? (
                <div style={{ position: 'relative' }}>
                  <img
                    src={mobilePhoto || editingArtwork.imageUrl || ''}
                    alt="Vorschau"
                    style={{
                      width: '100%',
                      borderRadius: '12px',
                      maxHeight: '300px',
                      objectFit: 'contain',
                      background: '#000',
                      display: 'block'
                    }}
                  />
                  <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#8fa0c9' }}>
                    Bild nur im Admin unter „Werk bearbeiten“ oder „Neues Werk hinzufügen“ ändern (dort Option: Foto freistellen oder Original).
                  </p>
                </div>
              ) : (
                <div style={{
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  border: '1px dashed rgba(95, 251, 241, 0.3)',
                  color: '#8fa0c9',
                  fontSize: '0.9rem'
                }}>
                  📸 Fotos für neue Werke nur im <strong>Admin</strong> unter „Neues Werk hinzufügen“ (dort Option: <strong>Foto freistellen</strong> oder <strong>Original benutzen</strong>). Hier nur Titel, Kategorie, Preis anlegen – Bild später im Admin ergänzen.
                </div>
              )}
            </div>
            
            {/* Titel */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff', fontWeight: '600' }}>
                Titel *
              </label>
              <input
                type="text"
                value={mobileTitle}
                onChange={(e) => setMobileTitle(e.target.value)}
                placeholder="z.B. Sonnenuntergang"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  fontSize: '1rem'
                }}
              />
            </div>
            
            {/* Kategorie */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff', fontWeight: '600' }}>
                Kategorie *
              </label>
              <select
                value={mobileCategory}
                onChange={(e) => setMobileCategory(e.target.value as 'malerei' | 'keramik')}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  fontSize: '1rem'
                }}
              >
                <option value="malerei">🖼️ Malerei</option>
                <option value="keramik">🏺 Keramik</option>
              </select>
            </div>
            
            {/* Preis */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff', fontWeight: '600' }}>
                Preis (€)
              </label>
              <input
                type="number"
                value={mobilePrice}
                onChange={(e) => setMobilePrice(e.target.value)}
                placeholder="z.B. 250"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  fontSize: '1rem'
                }}
              />
            </div>
            
            {/* Beschreibung */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff', fontWeight: '600' }}>
                Beschreibung
              </label>
              <textarea
                value={mobileDescription}
                onChange={(e) => setMobileDescription(e.target.value)}
                placeholder="Optionale Beschreibung..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
              />
            </div>
            
            {/* Zuweisungsplatz in der Galerie */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff', fontWeight: '600' }}>
                Zuweisungsplatz (optional)
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <select
                  value={mobileLocationType}
                  onChange={(e) => {
                    setMobileLocationType(e.target.value as 'regal' | 'bildflaeche' | 'sonstig' | '')
                    if (!e.target.value) {
                      setMobileLocationNumber('')
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    fontSize: '1rem'
                  }}
                >
                  <option value="">Keine Zuordnung</option>
                  <option value="regal">📚 Regal</option>
                  <option value="bildflaeche">🖼️ Bildfläche</option>
                  <option value="sonstig">📍 Sonstig</option>
                </select>
                {mobileLocationType && (
                  <input
                    type="text"
                    value={mobileLocationNumber}
                    onChange={(e) => setMobileLocationNumber(e.target.value)}
                    placeholder={mobileLocationType === 'regal' ? 'z.B. 1-50' : mobileLocationType === 'bildflaeche' ? 'z.B. 1-50' : 'z.B. Vitrine 3'}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                      fontSize: '1rem'
                    }}
                  />
                )}
              </div>
              {mobileLocationType && mobileLocationNumber && (
                <div style={{
                  padding: '0.5rem',
                  background: 'rgba(95, 251, 241, 0.1)',
                  border: '1px solid rgba(95, 251, 241, 0.3)',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  color: '#5ffbf1',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>
                    {mobileLocationType === 'regal' && `📚 Regal ${mobileLocationNumber}`}
                    {mobileLocationType === 'bildflaeche' && `🖼️ Bildfläche ${mobileLocationNumber}`}
                    {mobileLocationType === 'sonstig' && `📍 ${mobileLocationNumber}`}
                  </span>
                  <button
                    onClick={() => setShowLocationQR(true)}
                    style={{
                      background: 'rgba(95, 251, 241, 0.2)',
                      border: '1px solid rgba(95, 251, 241, 0.4)',
                      color: '#5ffbf1',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    📱 QR-Code
                  </button>
                </div>
              )}
              
              {/* QR-Code scannen Button */}
              <button
                onClick={() => setShowQRScanner(true)}
                style={{
                  width: '100%',
                  background: 'rgba(95, 251, 241, 0.1)',
                  border: '2px solid rgba(95, 251, 241, 0.3)',
                  color: '#5ffbf1',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginTop: '0.5rem'
                }}
              >
                📷 QR-Code scannen
              </button>
            </div>
            
            {/* Speichern Button */}
            <button
              onClick={async () => {
                if (!mobilePhoto || !mobileTitle) {
                  alert('Bitte Foto und Titel eingeben!')
                  return
                }
                
                setIsSaving(true)
                
                try {
                  const artworks = loadArtworks()
                  
                  // TEMPORÄR: Alert-Logs für iPad-Debugging
                  console.log('💾 Speichere... editingArtwork:', editingArtwork)
                  
                  if (editingArtwork && (editingArtwork.number || editingArtwork.id)) {
                    // BEARBEITEN: Aktualisiere bestehendes Objekt - GLEICHE LOGIK WIE MAC
                    console.log('✏️ Bearbeite Objekt:', editingArtwork.number || editingArtwork.id)
                    console.log('✏️ editingArtwork komplett:', JSON.stringify(editingArtwork, null, 2))
                    console.log('✏️ Alle artworks:', artworks.map((a: any) => ({ number: a.number, id: a.id })))
                    
                    // GLEICHE SUCH-LOGIK WIE MAC
                    const index = artworks.findIndex((a: any) => 
                      (a.id === editingArtwork.id || a.number === editingArtwork.number) ||
                      (a.id === editingArtwork.id && a.number === editingArtwork.number)
                    )
                    
                    console.log('✏️ Gefundener Index:', index, 'von', artworks.length, 'Objekten')
                    
                    if (index >= 0) {
                      // Erstelle Location-String
                      let locationString = undefined
                      if (mobileLocationType && mobileLocationNumber) {
                        if (mobileLocationType === 'regal') {
                          locationString = `Regal ${mobileLocationNumber}`
                        } else if (mobileLocationType === 'bildflaeche') {
                          locationString = `Bildfläche ${mobileLocationNumber}`
                        } else {
                          locationString = mobileLocationNumber
                        }
                      }
                      
                      // GLEICHE UPDATE-STRATEGIE WIE MAC: Behalte createdAt, setze updatedAt
                      const existingArtwork = artworks[index]
                      const updatedArtwork = {
                        ...existingArtwork, // Behalte alle bestehenden Felder
                        title: mobileTitle,
                        category: mobileCategory,
                        imageUrl: mobilePhoto, // Kann auch das alte Bild sein wenn kein neues ausgewählt
                        price: mobilePrice ? parseFloat(mobilePrice) : undefined,
                        description: mobileDescription || undefined,
                        location: locationString,
                        inShop: !!mobilePrice && parseFloat(mobilePrice) > 0,
                        createdAt: existingArtwork.createdAt || new Date().toISOString(), // Behalte createdAt
                        updatedAt: new Date().toISOString(), // Setze updatedAt
                        updatedOnMobile: true // Marker dass es auf Mobile aktualisiert wurde
                      }
                      
                      // KRITISCH: Erstelle neue Array-Kopie (React State darf nicht direkt mutiert werden!)
                      const updatedArtworks = [...artworks]
                      updatedArtworks[index] = updatedArtwork
                      
                      // PROFESSIONELL: Speichere zuerst in Supabase (wenn konfiguriert), sonst localStorage
                      let saved = false
                      if (isSupabaseConfigured()) {
                        try {
                          saved = await saveArtworksToSupabase(updatedArtworks)
                          if (saved) {
                            console.log('✅ Objekt in Supabase aktualisiert:', updatedArtwork.number || updatedArtwork.id)
                          } else {
                            console.warn('⚠️ Supabase-Speichern fehlgeschlagen, verwende localStorage')
                            saved = saveArtworks(updatedArtworks)
                          }
                        } catch (supabaseError) {
                          console.warn('⚠️ Supabase-Fehler, verwende localStorage:', supabaseError)
                          saved = saveArtworks(updatedArtworks)
                        }
                      } else {
                        saved = saveArtworks(updatedArtworks)
                      }
                      
                      if (!saved) {
                        console.error('❌ Speichern fehlgeschlagen!')
                        alert('❌ Fehler beim Speichern! Bitte versuche es erneut.')
                        setIsSaving(false)
                        return
                      }
                      
                      // Bereite Werke für Anzeige vor (mit aktualisiertem Werk)
                      const exhibitionArtworks = updatedArtworks.map((a: any) => {
                        if (!a.imageUrl && a.previewUrl) {
                          a.imageUrl = a.previewUrl
                        }
                        if (!a.imageUrl && !a.previewUrl) {
                          a.imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5LZWluIEJpbGQ8L3RleHQ+PC9zdmc+'
                        }
                        return a
                      })
                      
                      // KRITISCH: State SOFORT aktualisieren mit neuer Liste (inkl. aktualisiertem Werk)
                      setArtworks(exhibitionArtworks)
                      console.log('✅ Werke-Liste nach Update aktualisiert:', exhibitionArtworks.length, 'Werke')
                      
                      // PROFESSIONELL: Automatische Mobile-Sync nach jedem Speichern
                      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768
                      if (isMobile && isSupabaseConfigured()) {
                        try {
                          await syncMobileToSupabase()
                          console.log('✅ Mobile-Sync nach Update erfolgreich')
                        } catch (syncError) {
                          console.warn('⚠️ Mobile-Sync fehlgeschlagen (nicht kritisch):', syncError)
                        }
                      }
                      
                      // KRITISCH: Automatisch für Mobile veröffentlichen
                      // WICHTIG: Rufe publishMobile direkt auf damit Mobile-Geräte die Änderungen sehen!
                      setTimeout(async () => {
                        try {
                          // Lade alle Werke aus localStorage
                          const allArtworks = loadArtworks()
                          if (allArtworks && allArtworks.length > 0) {
                            const data = {
                              martina: JSON.parse(localStorage.getItem('k2-stammdaten-martina') || '{}'),
                              georg: JSON.parse(localStorage.getItem('k2-stammdaten-georg') || '{}'),
                              gallery: JSON.parse(localStorage.getItem('k2-stammdaten-galerie') || '{}'),
                              artworks: allArtworks,
                              events: JSON.parse(localStorage.getItem('k2-events') || '[]'),
                              documents: JSON.parse(localStorage.getItem('k2-documents') || '[]'),
                              designSettings: JSON.parse(localStorage.getItem('k2-design-settings') || '{}'),
                              version: Date.now(),
                              buildId: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
                              exportedAt: new Date().toISOString()
                            }
                            
                            const json = JSON.stringify(data)
                            
                            // Schreibe direkt über API (nur wenn Dev-Server läuft)
                            // WICHTIG: Auf Vercel existiert dieser Endpoint nicht!
                            const isVercel = window.location.hostname.includes('vercel.app')
                            
                            if (isVercel) {
                              console.warn('⚠️ Auf Vercel: Automatische Veröffentlichung nicht möglich')
                              console.warn('💡 Mobile-Werke müssen über Dev-Server erstellt werden')
                            } else {
                              const response = await fetch('/api/write-gallery-data', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: json
                              })
                              
                              if (response.ok) {
                                const result = await response.json()
                                console.log('✅ Automatisch für Mobile veröffentlicht:', result)
                              } else {
                                console.warn('⚠️ Automatische Veröffentlichung fehlgeschlagen:', response.status)
                              }
                            }
                          }
                        } catch (error) {
                          console.warn('⚠️ Automatische Veröffentlichung fehlgeschlagen (nicht kritisch):', error)
                        }
                      }, 1500) // Warte 1.5 Sekunden damit localStorage sicher gespeichert ist
                      
                      // Event dispatchen - mit Verzögerung
                      setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('artworks-updated', { 
                          detail: { count: updatedArtworks.length, justSaved: true } 
                        }))
                        window.dispatchEvent(new CustomEvent('artwork-saved-needs-publish', { 
                          detail: { artworkCount: updatedArtworks.length } 
                        }))
                      }, 500)
                      
                      console.log('✅ Objekt aktualisiert:', updatedArtwork)
                    } else {
                      console.error('❌ Objekt nicht gefunden!')
                      console.error('❌ Gesucht nach:', { 
                        id: editingArtwork.id, 
                        number: editingArtwork.number 
                      })
                      console.error('❌ Verfügbare IDs/Numbers:', artworks.map((a: any) => ({ 
                        id: a.id, 
                        number: a.number 
                      })))
                      
                      const availableIds = artworks.map((a: any) => a.number || a.id).join(', ')
                      alert(`❌ Objekt nicht gefunden!\n\nGesucht: ${editingArtwork.number || editingArtwork.id}\n\nVerfügbare: ${availableIds || 'Keine'}\n\nGesamt: ${artworks.length} Objekte`)
                    }
                  } else {
                    // NEU: Erstelle neues Objekt
                    // WICHTIG: Finde maximale Nummer aus ALLEN artworks der GLEICHEN Kategorie (auch Supabase)
                    // Kategorie-basiert: K für Keramik, M für Malerei
                    // WICHTIG: Unterstützt auch alte Nummern ohne K/M Präfix
                    const prefix = mobileCategory === 'keramik' ? 'K' : 'M'
                    const categoryPrefix = `K2-${prefix}-`
                    
                    let maxNumber = 0
                    artworks.forEach((a: any) => {
                      if (!a.number) return
                      
                      // Prüfe ob neue Nummer mit K/M Präfix
                      if (a.number.startsWith(categoryPrefix)) {
                        const numStr = a.number.replace(categoryPrefix, '').replace(/[^0-9]/g, '')
                        const num = parseInt(numStr || '0')
                        if (num > maxNumber) {
                          maxNumber = num
                        }
                      }
                      // Prüfe ob alte Nummer ohne Präfix (z.B. "K2-0001")
                      else if (a.number.startsWith('K2-') && !a.number.includes('-K-') && !a.number.includes('-M-')) {
                        const numStr = a.number.replace('K2-', '').replace(/[^0-9]/g, '')
                        const num = parseInt(numStr || '0')
                        if (num > maxNumber) {
                          maxNumber = num
                        }
                      }
                    })
                    
                    // Versuche auch Supabase zu prüfen (nur wenn konfiguriert)
                    if (isSupabaseConfigured()) {
                      try {
                        const { loadArtworksFromSupabase } = await import('../utils/supabaseClient')
                        const supabaseArtworks = await loadArtworksFromSupabase()
                        if (supabaseArtworks && Array.isArray(supabaseArtworks)) {
                          supabaseArtworks.forEach((a: any) => {
                            if (!a.number) return
                            
                            if (a.number.startsWith(categoryPrefix)) {
                              const numStr = a.number.replace(categoryPrefix, '').replace(/[^0-9]/g, '')
                              const num = parseInt(numStr || '0')
                              if (num > maxNumber) {
                                maxNumber = num
                              }
                            } else if (a.number.startsWith('K2-') && !a.number.includes('-K-') && !a.number.includes('-M-')) {
                              const numStr = a.number.replace('K2-', '').replace(/[^0-9]/g, '')
                              const num = parseInt(numStr || '0')
                              if (num > maxNumber) {
                                maxNumber = num
                              }
                            }
                          })
                        }
                      } catch (e) {
                        // Ignoriere Fehler - verwende nur localStorage
                        console.warn('⚠️ Supabase-Nummer-Prüfung fehlgeschlagen, verwende nur localStorage:', e)
                      }
                    }
                    
                    const newNumber = `${categoryPrefix}${String(maxNumber + 1).padStart(4, '0')}`
                    
                    // Speichere auch in localStorage für Konsistenz (kategorie-spezifisch)
                    localStorage.setItem(`k2-last-artwork-number-${prefix}`, String(maxNumber + 1))
                    
                    console.log('🔢 Neue Nummer generiert (Mobile):', newNumber, '(Kategorie:', mobileCategory, ', max gefunden:', maxNumber, ')')
                    
                    
                    // Erstelle Location-String
                    let locationString = undefined
                    if (mobileLocationType && mobileLocationNumber) {
                      if (mobileLocationType === 'regal') {
                        locationString = `Regal ${mobileLocationNumber}`
                      } else if (mobileLocationType === 'bildflaeche') {
                        locationString = `Bildfläche ${mobileLocationNumber}`
                      } else {
                        locationString = mobileLocationNumber
                      }
                    }
                    
                    const PLACEHOLDER_KEIN_BILD = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5LZWluIEJpbGQ8L3RleHQ+PC9zdmc+'
                    const newArtwork = {
                      id: `artwork-${Date.now()}`,
                      number: newNumber,
                      title: mobileTitle,
                      category: mobileCategory,
                      imageUrl: mobilePhoto || PLACEHOLDER_KEIN_BILD,
                      price: mobilePrice ? parseFloat(mobilePrice) : undefined,
                      description: mobileDescription || undefined,
                      location: locationString,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(), // WICHTIG: updatedAt für Merge-Logik
                      inShop: !!mobilePrice && parseFloat(mobilePrice) > 0,
                      createdOnMobile: true // Marker dass es auf Mobile erstellt wurde
                    }
                    
                    // KRITISCH: Erstelle neue Array-Kopie (React State darf nicht direkt mutiert werden!)
                    const updatedArtworks = [...artworks, newArtwork]
                    
                    // PROFESSIONELL: Speichere zuerst in Supabase (wenn konfiguriert), sonst localStorage
                    console.log('💾 Speichere Werk:', {
                      nummer: newNumber,
                      titel: mobileTitle,
                      gesamtAnzahl: updatedArtworks.length,
                      supabase: isSupabaseConfigured()
                    })
                    
                    let saved = false
                    if (isSupabaseConfigured()) {
                      try {
                        saved = await saveArtworksToSupabase(updatedArtworks)
                        if (saved) {
                          console.log('✅ Werk in Supabase gespeichert:', newNumber)
                        } else {
                          console.warn('⚠️ Supabase-Speichern fehlgeschlagen, verwende localStorage')
                          saved = saveArtworks(updatedArtworks)
                        }
                      } catch (supabaseError) {
                        console.warn('⚠️ Supabase-Fehler, verwende localStorage:', supabaseError)
                        saved = saveArtworks(updatedArtworks)
                      }
                    } else {
                      saved = saveArtworks(updatedArtworks)
                    }
                    
                    if (!saved) {
                      console.error('❌ Speichern fehlgeschlagen!')
                      alert('❌ Fehler beim Speichern! Bitte versuche es erneut.')
                      setIsSaving(false)
                      return
                    }
                    
                    // PROFESSIONELL: Automatische Mobile-Sync nach jedem Speichern
                    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768
                    if (isMobile && isSupabaseConfigured()) {
                      try {
                        await syncMobileToSupabase()
                        console.log('✅ Mobile-Sync nach Speichern erfolgreich')
                      } catch (syncError) {
                        console.warn('⚠️ Mobile-Sync fehlgeschlagen (nicht kritisch):', syncError)
                      }
                    }
                    
                    // Bereite Werke für Anzeige vor (mit neuem Werk)
                    const exhibitionArtworks = updatedArtworks.map((a: any) => {
                      if (!a.imageUrl && a.previewUrl) {
                        a.imageUrl = a.previewUrl
                      }
                      if (!a.imageUrl && !a.previewUrl) {
                        a.imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5LZWluIEJpbGQ8L3RleHQ+PC9zdmc+'
                      }
                      return a
                    })
                    
                    // KRITISCH: State SOFORT aktualisieren mit neuer Liste (inkl. neuem Werk)
                    console.log('💾 Vor setArtworks - Anzahl Werke:', exhibitionArtworks.length, 'Nummern:', exhibitionArtworks.map((a: any) => a.number || a.id).join(', '))
                    setArtworks(exhibitionArtworks)
                    console.log('✅ Werke-Liste aktualisiert:', exhibitionArtworks.length, 'Werke (inkl. neuem Werk:', newNumber, ')')
                    
                    // WICHTIG: Verifiziere dass das Werk wirklich in localStorage ist
                    setTimeout(() => {
                      const verify = loadArtworks()
                      const hasNewWork = verify.some((a: any) => (a.number || a.id) === newNumber)
                      console.log('🔍 Verifikation nach Speichern:', {
                        inLocalStorage: verify.length,
                        hatNeuesWerk: hasNewWork,
                        neueNummer: newNumber,
                        alleNummern: verify.map((a: any) => a.number || a.id).join(', ')
                      })
                      if (!hasNewWork) {
                        console.error('❌ KRITISCH: Neues Werk nicht in localStorage gefunden!')
                      }
                    }, 100)
                    
                    // KRITISCH: Automatisch für Mobile veröffentlichen UND Git Push
                    // WICHTIG: Rufe publishMobile direkt auf damit Mobile-Geräte die neuen Werke sehen!
                    setTimeout(async () => {
                      try {
                        // Lade alle Werke aus localStorage
                        const allArtworks = loadArtworks()
                        if (allArtworks && allArtworks.length > 0) {
                          const data = {
                            martina: JSON.parse(localStorage.getItem('k2-stammdaten-martina') || '{}'),
                            georg: JSON.parse(localStorage.getItem('k2-stammdaten-georg') || '{}'),
                            gallery: JSON.parse(localStorage.getItem('k2-stammdaten-galerie') || '{}'),
                            artworks: allArtworks,
                            events: JSON.parse(localStorage.getItem('k2-events') || '[]'),
                            documents: JSON.parse(localStorage.getItem('k2-documents') || '[]'),
                            designSettings: JSON.parse(localStorage.getItem('k2-design-settings') || '{}'),
                            version: Date.now(),
                            buildId: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
                            exportedAt: new Date().toISOString()
                          }
                          
                          const json = JSON.stringify(data)
                          
                          // Schreibe direkt über API (nur wenn Dev-Server läuft)
                          // WICHTIG: Auf Vercel existiert dieser Endpoint nicht!
                          const isVercel = window.location.hostname.includes('vercel.app')
                          
                          if (isVercel) {
                            console.warn('⚠️ Auf Vercel: Automatische Veröffentlichung nicht möglich')
                            console.warn('💡 Mobile-Werke müssen über Dev-Server erstellt werden')
                            alert('⚠️ Auf Vercel: Werk wurde gespeichert, aber automatische Veröffentlichung nicht möglich.\n\n💡 Für Mobile → Mac/iPad Sync:\n1. Handy auf lokalem Dev-Server verwenden\n2. Oder: Mac muss Git Push ausführen')
                          } else {
                            const response = await fetch('/api/write-gallery-data', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: json
                            })
                            
                            if (response.ok) {
                              const result = await response.json()
                              console.log('✅ Automatisch für Mobile veröffentlicht:', result)
                              
                              // WICHTIG: Dispatche Event für automatischen Git Push
                              window.dispatchEvent(new CustomEvent('gallery-data-published', { 
                                detail: { 
                                  success: true,
                                  artworksCount: allArtworks.length,
                                  size: result.size
                                } 
                              }))
                            } else {
                              console.warn('⚠️ Automatische Veröffentlichung fehlgeschlagen:', response.status)
                            }
                          }
                        }
                      } catch (error) {
                        console.warn('⚠️ Automatische Veröffentlichung fehlgeschlagen (nicht kritisch):', error)
                      }
                    }, 1500) // Warte 1.5 Sekunden damit localStorage sicher gespeichert ist
                    
                    // Event dispatchen - mit Flag dass wir gerade gespeichert haben
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('artworks-updated', { 
                        detail: { count: updatedArtworks.length, newArtwork: newNumber, justSaved: true } 
                      }))
                    }, 500)
                    window.dispatchEvent(new CustomEvent('artwork-saved-needs-publish', { 
                      detail: { artworkCount: updatedArtworks.length } 
                    }))
                    
                    console.log('✅ Neues Objekt gespeichert und angezeigt:', newNumber)
                    alert(`✅ Werk gespeichert!\n\nNummer: ${newNumber}\nTitel: ${mobileTitle}\n\nAnzahl Werke: ${exhibitionArtworks.length}\n\n📱 Wird automatisch für Mobile-Geräte veröffentlicht...`)
                  }
                  
                  // Zurücksetzen
                  setShowMobileAdmin(false)
                  setEditingArtwork(null)
                  setIsEditingMode(false)
                  setMobilePhoto(null)
                  setMobileTitle('')
                  setMobileCategory('malerei')
                  setMobilePrice('')
                  setMobileDescription('')
                  setMobileLocationType('')
                  setMobileLocationNumber('')
                  
                  // NICHT nochmal setArtworks aufrufen - wurde bereits oben gemacht!
                } catch (error) {
                  console.error('Fehler beim Speichern:', error)
                  alert('❌ Fehler beim Speichern. Bitte versuche es erneut.')
                } finally {
                  setIsSaving(false)
                }
              }}
              disabled={isSaving || !mobileTitle}
              style={{
                width: '100%',
                background: isSaving || !mobileTitle
                  ? 'rgba(16, 185, 129, 0.5)'
                  : 'linear-gradient(120deg, #10b981, #059669)',
                border: 'none',
                color: '#fff',
                padding: '1rem',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: isSaving || !mobileTitle ? 'not-allowed' : 'pointer',
                opacity: isSaving || !mobileTitle ? 0.7 : 1
              }}
            >
              {isSaving 
                ? '⏳ Speichere...' 
                : (editingArtwork && (editingArtwork.number || editingArtwork.id))
                  ? `✅ Aktualisieren (${editingArtwork.number || editingArtwork.id})`
                  : '✅ Speichern'}
            </button>
          </div>
        </div>
      )}
      
      {/* QR-Code Scanner Modal */}
      {showQRScanner && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.95)',
          zIndex: 30000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1f3a 0%, #0f1419 100%)',
            borderRadius: '16px',
            padding: '1.5rem',
            maxWidth: '500px',
            width: '100%',
            border: '2px solid rgba(95, 251, 241, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#5ffbf1' }}>📷 QR-Code scannen</h3>
              <button
                onClick={() => {
                  setShowQRScanner(false)
                  if (qrScannerVideoRef.current) {
                    const stream = qrScannerVideoRef.current.srcObject as MediaStream
                    if (stream) {
                      stream.getTracks().forEach(track => track.stop())
                    }
                  }
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '1.5rem',
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{
              width: '100%',
              maxWidth: '400px',
              margin: '0 auto',
              background: '#000',
              borderRadius: '12px',
              overflow: 'hidden',
              position: 'relative',
              aspectRatio: '1'
            }}>
              <video
                ref={qrScannerVideoRef}
                autoPlay
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              <canvas
                ref={qrScannerCanvasRef}
                style={{
                  display: 'none'
                }}
              />
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '80%',
                height: '80%',
                border: '3px solid #5ffbf1',
                borderRadius: '12px',
                pointerEvents: 'none',
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
              }} />
            </div>
            
            <p style={{
              marginTop: '1rem',
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.9rem'
            }}>
              Richte die Kamera auf den QR-Code des Zuweisungsplatzes
            </p>
          </div>
        </div>
      )}
      
      {/* QR-Code Anzeige Modal */}
      {showLocationQR && mobileLocationType && mobileLocationNumber && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          zIndex: 30000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1f3a 0%, #0f1419 100%)',
            borderRadius: '16px',
            padding: '1.5rem',
            maxWidth: '400px',
            width: '100%',
            border: '2px solid rgba(95, 251, 241, 0.3)',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#5ffbf1' }}>
                {mobileLocationType === 'regal' && `📚 Regal ${mobileLocationNumber}`}
                {mobileLocationType === 'bildflaeche' && `🖼️ Bildfläche ${mobileLocationNumber}`}
                {mobileLocationType === 'sonstig' && `📍 ${mobileLocationNumber}`}
              </h3>
              <button
                onClick={() => setShowLocationQR(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '1.5rem',
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{
              background: '#fff',
              padding: '1rem',
              borderRadius: '12px',
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`K2-LOCATION:${mobileLocationType === 'regal' ? 'Regal' : mobileLocationType === 'bildflaeche' ? 'Bildfläche' : ''} ${mobileLocationNumber}`)}`}
                alt="QR-Code"
                style={{
                  width: '100%',
                  maxWidth: '300px',
                  height: 'auto'
                }}
              />
            </div>
            
            <button
              onClick={() => {
                const qrData = `K2-LOCATION:${mobileLocationType === 'regal' ? 'Regal' : mobileLocationType === 'bildflaeche' ? 'Bildfläche' : ''} ${mobileLocationNumber}`
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`
                const link = document.createElement('a')
                link.href = qrUrl
                link.download = `QR-${mobileLocationType === 'regal' ? 'Regal' : mobileLocationType === 'bildflaeche' ? 'Bildfläche' : 'Location'}-${mobileLocationNumber}.png`
                link.click()
              }}
              style={{
                width: '100%',
                background: 'linear-gradient(120deg, #5ffbf1, #33a1ff)',
                border: 'none',
                color: '#0a0e27',
                padding: '0.75rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '700',
                cursor: 'pointer',
                marginBottom: '0.5rem'
              }}
            >
              💾 QR-Code herunterladen
            </button>
            
            <button
              onClick={() => {
                window.print()
              }}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                color: '#fff',
                padding: '0.75rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              🖨️ QR-Code drucken
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  )
}

export default GalerieVorschauPage
