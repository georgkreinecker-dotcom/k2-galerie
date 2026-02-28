import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'
import { readArtworksRawByKey, saveArtworksByKey } from '../utils/artworksStorage'
import '../App.css'

function loadArtworks(): any[] {
  try {
    return readArtworksRawByKey('k2-artworks')
  } catch (error) {
    console.error('Fehler beim Laden:', error)
    return []
  }
}

function saveArtworks(artworks: any[]): void {
  try {
    saveArtworksByKey('k2-artworks', artworks, { filterK2Only: true, allowReduce: true })
  } catch (error) {
    console.error('Fehler beim Speichern:', error)
  }
}

type LocationType = 'regal' | 'bildflaeche' | 'sonstig'

interface Location {
  id: string
  type: LocationType
  number: string
  label: string
  artworkId?: string
}

const PlatzanordnungPage = () => {
  const [artworks, setArtworks] = useState<any[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedArtwork, setSelectedArtwork] = useState<any | null>(null)
  const [showAddLocation, setShowAddLocation] = useState(false)
  const [newLocationType, setNewLocationType] = useState<LocationType>('regal')
  const [newLocationNumber, setNewLocationNumber] = useState('')
  const [newLocationLabel, setNewLocationLabel] = useState('')
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [printLocation, setPrintLocation] = useState<Location | null>(null)
  const qrScannerVideoRef = useRef<HTMLVideoElement>(null)
  const qrScannerCanvasRef = useRef<HTMLCanvasElement>(null)

  // Lade Werke und Plätze
  useEffect(() => {
    const loadedArtworks = loadArtworks()
    setArtworks(loadedArtworks)
    
    // Lade gespeicherte Plätze
    try {
      const savedLocations = localStorage.getItem('k2-locations')
      if (savedLocations) {
        setLocations(JSON.parse(savedLocations))
      } else {
        // Standard-Plätze erstellen
        const defaultLocations: Location[] = []
        for (let i = 1; i <= 10; i++) {
          defaultLocations.push({
            id: `regal-${i}`,
            type: 'regal',
            number: String(i),
            label: `Regal ${i}`
          })
        }
        for (let i = 1; i <= 20; i++) {
          defaultLocations.push({
            id: `bildflaeche-${i}`,
            type: 'bildflaeche',
            number: String(i),
            label: `Bildfläche ${i}`
          })
        }
        setLocations(defaultLocations)
        localStorage.setItem('k2-locations', JSON.stringify(defaultLocations))
      }
    } catch (error) {
      console.error('Fehler beim Laden der Plätze:', error)
    }
  }, [])

  // Speichere Plätze bei Änderung
  useEffect(() => {
    if (locations.length > 0) {
      localStorage.setItem('k2-locations', JSON.stringify(locations))
    }
  }, [locations])

  // QR-Code Scanner für Plätze
  useEffect(() => {
    if (!showQRScanner) return
    
    let stream: MediaStream | null = null
    let scanningInterval: ReturnType<typeof setInterval> | null = null
    
    const startScanning = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        })
        
        if (qrScannerVideoRef.current) {
          qrScannerVideoRef.current.srcObject = stream
        }
        
        scanningInterval = setInterval(() => {
          if (qrScannerVideoRef.current && qrScannerCanvasRef.current) {
            const video = qrScannerVideoRef.current
            const canvas = qrScannerCanvasRef.current
            const ctx = canvas.getContext('2d')
            
            if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
              canvas.width = video.videoWidth
              canvas.height = video.videoHeight
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
              
              if ('BarcodeDetector' in window) {
                const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] })
                detector.detect(canvas)
                  .then((detectedCodes: any[]) => {
                    if (detectedCodes && detectedCodes.length > 0) {
                      const code = detectedCodes[0].rawValue
                      handleScannedQRCode(code)
                    }
                  })
                  .catch(() => {})
              }
            }
          }
        }, 500)
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

  const handleScannedQRCode = (code: string) => {
    if (code.startsWith('K2-LOCATION:')) {
      const locationData = code.replace('K2-LOCATION:', '').trim()
      let locationType: LocationType = 'regal'
      let number = ''
      
      if (locationData.startsWith('Regal')) {
        locationType = 'regal'
        number = locationData.replace('Regal', '').trim()
      } else if (locationData.startsWith('Bildfläche')) {
        locationType = 'bildflaeche'
        number = locationData.replace('Bildfläche', '').trim()
      } else {
        locationType = 'sonstig'
        number = locationData
      }
      
      // Finde oder erstelle Platz
      const existingLocation = locations.find(l => 
        l.type === locationType && l.number === number
      )
      
      if (existingLocation && selectedArtwork) {
        // Ordne Objekt zu
        const updatedLocations = locations.map(loc => 
          loc.id === existingLocation.id 
            ? { ...loc, artworkId: selectedArtwork.id || selectedArtwork.number }
            : loc
        )
        setLocations(updatedLocations)
        
        // Aktualisiere Objekt
        const updatedArtworks = artworks.map(art => {
          if (art.id === selectedArtwork.id || art.number === selectedArtwork.number) {
            return {
              ...art,
              location: existingLocation.label
            }
          }
          return art
        })
        setArtworks(updatedArtworks)
        saveArtworks(updatedArtworks)
        
        setShowQRScanner(false)
        setSelectedArtwork(null)
        alert(`✅ Objekt "${selectedArtwork.title || selectedArtwork.number}" zugeordnet: ${existingLocation.label}`)
      } else if (!existingLocation) {
        // Erstelle neuen Platz
        const newLocation: Location = {
          id: `${locationType}-${number}-${Date.now()}`,
          type: locationType,
          number,
          label: locationType === 'regal' ? `Regal ${number}` : locationType === 'bildflaeche' ? `Bildfläche ${number}` : number
        }
        setLocations([...locations, newLocation])
        setShowQRScanner(false)
        alert(`✅ Neuer Platz erstellt: ${newLocation.label}`)
      }
    }
  }

  const addLocation = () => {
    if (!newLocationNumber) {
      alert('Bitte Nummer eingeben!')
      return
    }
    
    const label = newLocationType === 'regal' 
      ? `Regal ${newLocationNumber}`
      : newLocationType === 'bildflaeche'
      ? `Bildfläche ${newLocationNumber}`
      : newLocationLabel || newLocationNumber
    
    const newLocation: Location = {
      id: `${newLocationType}-${newLocationNumber}-${Date.now()}`,
      type: newLocationType,
      number: newLocationNumber,
      label
    }
    
    setLocations([...locations, newLocation])
    setShowAddLocation(false)
    setNewLocationType('regal')
    setNewLocationNumber('')
    setNewLocationLabel('')
  }

  const assignArtworkToLocation = (location: Location) => {
    if (selectedArtwork) {
      const updatedLocations = locations.map(loc => 
        loc.id === location.id 
          ? { ...loc, artworkId: selectedArtwork.id || selectedArtwork.number }
          : loc.id === location.id && loc.artworkId === (selectedArtwork.id || selectedArtwork.number)
          ? { ...loc, artworkId: undefined }
          : loc
      )
      setLocations(updatedLocations)
      
      // Aktualisiere Objekt
      const updatedArtworks = artworks.map(art => {
        if (art.id === selectedArtwork.id || art.number === selectedArtwork.number) {
          return {
            ...art,
            location: location.label
          }
        }
        return art
      })
      setArtworks(updatedArtworks)
      saveArtworks(updatedArtworks)
      
      setSelectedArtwork(null)
      alert(`✅ Objekt "${selectedArtwork.title || selectedArtwork.number}" zugeordnet: ${location.label}`)
    } else {
      // Entferne Zuordnung
      const updatedLocations = locations.map(loc => 
        loc.id === location.id ? { ...loc, artworkId: undefined } : loc
      )
      setLocations(updatedLocations)
      
      // Entferne Location vom Objekt
      const artwork = artworks.find(a => a.location === location.label)
      if (artwork) {
        const updatedArtworks = artworks.map(art => 
          art.id === artwork.id || art.number === artwork.number
            ? { ...art, location: undefined }
            : art
        )
        setArtworks(updatedArtworks)
        saveArtworks(updatedArtworks)
      }
    }
  }

  const [labelFormat, setLabelFormat] = useState<'12mm' | '18mm' | '24mm' | '36mm'>('24mm')
  const [showPrintDialog, setShowPrintDialog] = useState(false)
  const [printLocationState, setPrintLocationState] = useState<Location | null>(null)

  const printLabel = (location: Location) => {
    setPrintLocationState(location)
    setShowPrintDialog(true)
  }

  const executePrint = (location: Location, format: '12mm' | '18mm' | '24mm' | '36mm') => {
    const qrData = `K2-LOCATION:${location.type === 'regal' ? 'Regal' : location.type === 'bildflaeche' ? 'Bildfläche' : ''} ${location.number}`
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`
    
    const artwork = location.artworkId ? artworks.find(a => (a.id || a.number) === location.artworkId) : null
    
    // Brother-Etikettenformate (Breite x Länge)
    const formats: Record<string, { width: string; height: string; qrSize: string; fontSize: string }> = {
      '12mm': { width: '12mm', height: '62mm', qrSize: '10mm', fontSize: '7pt' },
      '18mm': { width: '18mm', height: '62mm', qrSize: '14mm', fontSize: '8pt' },
      '24mm': { width: '24mm', height: '62mm', qrSize: '18mm', fontSize: '9pt' },
      '36mm': { width: '36mm', height: '62mm', qrSize: '22mm', fontSize: '10pt' }
    }
    
    const formatSpec = formats[format]
    
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Brother Etikett: ${location.label}</title>
          <style>
            @media print {
              @page {
                size: ${formatSpec.width} ${formatSpec.height};
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
                width: ${formatSpec.width};
                height: ${formatSpec.height};
              }
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 1mm;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              width: ${formatSpec.width};
              height: ${formatSpec.height};
              background: white;
            }
            .label-content {
              text-align: center;
              width: 100%;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 1mm;
            }
            .qr-code {
              width: ${formatSpec.qrSize};
              height: ${formatSpec.qrSize};
              image-rendering: crisp-edges;
              image-rendering: -webkit-optimize-contrast;
            }
            .label-text {
              font-size: ${formatSpec.fontSize};
              font-weight: bold;
              margin: 0;
              line-height: 1.2;
              word-wrap: break-word;
              max-width: 100%;
            }
            .artwork-info {
              font-size: ${parseInt(formatSpec.fontSize) - 1}pt;
              color: #333;
              margin: 0;
              line-height: 1.1;
              word-wrap: break-word;
              max-width: 100%;
            }
            .location-number {
              font-size: ${parseInt(formatSpec.fontSize) - 2}pt;
              color: #666;
              margin-top: 0.5mm;
            }
          </style>
        </head>
        <body>
          <div class="label-content">
            <img src="${qrUrl}" alt="QR-Code" class="qr-code" />
            <p class="label-text">${location.label}</p>
            ${artwork ? `<p class="artwork-info">${(artwork.title || artwork.number).substring(0, 20)}</p>` : ''}
          </div>
        </body>
      </html>
    `)
    
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
      setShowPrintDialog(false)
      setPrintLocationState(null)
    }, 500)
  }

  const getLocationArtwork = (location: Location) => {
    return artworks.find(a => (a.id || a.number) === location.artworkId)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--k2-bg-1) 0%, var(--k2-bg-2) 50%, var(--k2-bg-3) 100%)',
      color: '#ffffff',
      padding: '1rem'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', color: '#5ffbf1' }}>📍 Platzanordnung</h1>
            <p style={{ margin: '0.5rem 0 0', color: 'rgba(255, 255, 255, 0.7)' }}>
              Objekte zu Plätzen zuordnen und Etiketten drucken
            </p>
          </div>
          <Link
            to={PROJECT_ROUTES['k2-galerie'].galerieVorschau}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: '600'
            }}
          >
            ← Zurück
          </Link>
        </div>

        {/* Zwei-Spalten-Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Verfügbare Objekte */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h2 style={{ margin: '0 0 1rem', fontSize: '1.3rem', color: '#5ffbf1' }}>
              Verfügbare Objekte ({artworks.length})
            </h2>
            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              {artworks.map(artwork => {
                const isSelected = selectedArtwork && (selectedArtwork.id === artwork.id || selectedArtwork.number === artwork.number)
                return (
                  <div
                    key={artwork.id || artwork.number}
                    onClick={() => setSelectedArtwork(isSelected ? null : artwork)}
                    style={{
                      padding: '0.75rem',
                      background: isSelected 
                        ? 'rgba(95, 251, 241, 0.2)' 
                        : 'rgba(255, 255, 255, 0.05)',
                      border: isSelected 
                        ? '2px solid #5ffbf1' 
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                      {artwork.title || artwork.number}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                      {artwork.number} • {artwork.category === 'malerei' ? 'Bilder' : 'Keramik'}
                      {artwork.location && ` • 📍 ${artwork.location}`}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Plätze */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#5ffbf1' }}>
                Plätze ({locations.length})
              </h2>
              <button
                onClick={() => setShowAddLocation(true)}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'linear-gradient(120deg, #10b981, #059669)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                + Platz hinzufügen
              </button>
            </div>
            
            {/* Filter */}
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '1rem',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => {
                  const filtered = locations.filter(l => l.type === 'regal')
                  setLocations([...filtered, ...locations.filter(l => l.type !== 'regal')])
                }}
                style={{
                  padding: '0.4rem 0.8rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                📚 Regale
              </button>
              <button
                onClick={() => {
                  const filtered = locations.filter(l => l.type === 'bildflaeche')
                  setLocations([...filtered, ...locations.filter(l => l.type !== 'bildflaeche')])
                }}
                style={{
                  padding: '0.4rem 0.8rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                🖼️ Bildflächen
              </button>
            </div>
            
            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              {locations.map(location => {
                const assignedArtwork = getLocationArtwork(location)
                return (
                  <div
                    key={location.id}
                    onClick={() => {
                      if (selectedArtwork) {
                        assignArtworkToLocation(location)
                      } else {
                        setPrintLocation(location)
                      }
                    }}
                    style={{
                      padding: '0.75rem',
                      background: assignedArtwork 
                        ? 'rgba(16, 185, 129, 0.1)' 
                        : 'rgba(255, 255, 255, 0.05)',
                      border: assignedArtwork 
                        ? '2px solid #10b981' 
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                        {location.label}
                      </div>
                      {assignedArtwork && (
                        <div style={{ fontSize: '0.85rem', color: 'rgba(16, 185, 129, 0.8)' }}>
                          ✓ {assignedArtwork.title || assignedArtwork.number}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        printLabel(location)
                      }}
                      style={{
                        padding: '0.4rem 0.8rem',
                        background: 'rgba(95, 251, 241, 0.2)',
                        border: '1px solid rgba(95, 251, 241, 0.4)',
                        borderRadius: '6px',
                        color: '#5ffbf1',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      🖨️ Drucken
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

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
              background: 'linear-gradient(135deg, var(--k2-bg-2) 0%, var(--k2-bg-1) 100%)',
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
                {selectedArtwork 
                  ? `Richte die Kamera auf den QR-Code des Platzes für "${selectedArtwork.title || selectedArtwork.number}"`
                  : 'Richte die Kamera auf den QR-Code des Zuweisungsplatzes'}
              </p>
            </div>
          </div>
        )}

        {/* Platz hinzufügen Modal */}
        {showAddLocation && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            zIndex: 30000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--k2-bg-2) 0%, var(--k2-bg-1) 100%)',
              borderRadius: '16px',
              padding: '1.5rem',
              maxWidth: '400px',
              width: '100%',
              border: '2px solid rgba(95, 251, 241, 0.3)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#5ffbf1' }}>📍 Platz hinzufügen</h3>
                <button
                  onClick={() => {
                    setShowAddLocation(false)
                    setNewLocationType('regal')
                    setNewLocationNumber('')
                    setNewLocationLabel('')
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
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff', fontWeight: '600' }}>
                  Typ
                </label>
                <select
                  value={newLocationType}
                  onChange={(e) => setNewLocationType(e.target.value as LocationType)}
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
                  <option value="regal">📚 Regal</option>
                  <option value="bildflaeche">🖼️ Bildfläche</option>
                  <option value="sonstig">📍 Sonstig</option>
                </select>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff', fontWeight: '600' }}>
                  Nummer/Bezeichnung *
                </label>
                <input
                  type="text"
                  value={newLocationNumber}
                  onChange={(e) => setNewLocationNumber(e.target.value)}
                  placeholder={newLocationType === 'regal' ? 'z.B. 1-50' : newLocationType === 'bildflaeche' ? 'z.B. 1-50' : 'z.B. Vitrine 3'}
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
              
              {newLocationType === 'sonstig' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff', fontWeight: '600' }}>
                    Label (optional)
                  </label>
                  <input
                    type="text"
                    value={newLocationLabel}
                    onChange={(e) => setNewLocationLabel(e.target.value)}
                    placeholder="z.B. Vitrine 3"
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
              )}
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={addLocation}
                  disabled={!newLocationNumber}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: newLocationNumber
                      ? 'linear-gradient(120deg, #10b981, #059669)'
                      : 'rgba(16, 185, 129, 0.5)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '1rem',
                    fontWeight: '700',
                    cursor: newLocationNumber ? 'pointer' : 'not-allowed',
                    opacity: newLocationNumber ? 1 : 0.7
                  }}
                >
                  ✅ Hinzufügen
                </button>
                <button
                  onClick={() => {
                    setShowAddLocation(false)
                    setShowQRScanner(true)
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'rgba(95, 251, 241, 0.2)',
                    border: '2px solid rgba(95, 251, 241, 0.4)',
                    borderRadius: '8px',
                    color: '#5ffbf1',
                    fontSize: '1rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  📷 QR scannen
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Aktions-Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginTop: '2rem'
        }}>
          <button
            onClick={() => {
              if (!selectedArtwork) {
                alert('Bitte zuerst ein Objekt auswählen!')
                return
              }
              setShowQRScanner(true)
            }}
            style={{
              padding: '1rem 2rem',
              background: 'linear-gradient(120deg, #5ffbf1, #33a1ff)',
              border: 'none',
              borderRadius: '12px',
              color: '#0a0e27',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            📷 QR-Code scannen
          </button>
        </div>
      </div>
      
      {/* Brother Druck-Dialog */}
      {showPrintDialog && printLocationState && (() => {
        // Berechne QR-Code und Format-Daten
        const qrData = `K2-LOCATION:${printLocationState.type === 'regal' ? 'Regal' : printLocationState.type === 'bildflaeche' ? 'Bildfläche' : ''} ${printLocationState.number}`
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`
        const artwork = printLocationState.artworkId ? artworks.find(a => (a.id || a.number) === printLocationState.artworkId) : null
        
        // Brother-Etikettenformate für Vorschau
        const formats: Record<string, { width: string; height: string; qrSize: string; fontSize: string }> = {
          '12mm': { width: '12mm', height: '62mm', qrSize: '10mm', fontSize: '7pt' },
          '18mm': { width: '18mm', height: '62mm', qrSize: '14mm', fontSize: '8pt' },
          '24mm': { width: '24mm', height: '62mm', qrSize: '18mm', fontSize: '9pt' },
          '36mm': { width: '36mm', height: '62mm', qrSize: '22mm', fontSize: '10pt' }
        }
        const formatSpec = formats[labelFormat]
        
        return (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            zIndex: 30000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            overflowY: 'auto'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--k2-bg-2) 0%, var(--k2-bg-1) 100%)',
              borderRadius: '16px',
              padding: '1.5rem',
              maxWidth: '500px',
              width: '100%',
              border: '2px solid rgba(95, 251, 241, 0.3)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#5ffbf1' }}>🖨️ Brother Etikett drucken</h3>
                <button
                  onClick={() => {
                    setShowPrintDialog(false)
                    setPrintLocationState(null)
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

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff', fontWeight: '600' }}>
                  Etikettenformat (Brother)
                </label>
                <select
                  value={labelFormat}
                  onChange={(e) => setLabelFormat(e.target.value as '12mm' | '18mm' | '24mm' | '36mm')}
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
                  <option value="12mm">12mm Breite (Standard)</option>
                  <option value="18mm">18mm Breite</option>
                  <option value="24mm">24mm Breite (Empfohlen)</option>
                  <option value="36mm">36mm Breite</option>
                </select>
              </div>

              {/* VORSCHAU DES ETIKETTS */}
              <div style={{
                marginBottom: '1.5rem',
                padding: '1rem',
                background: 'white',
                borderRadius: '8px',
                border: '2px dashed rgba(95, 251, 241, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '200px',
                position: 'relative'
              }}>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#666',
                  marginBottom: '0.75rem',
                  textAlign: 'center',
                  fontWeight: '600'
                }}>
                  📋 Vorschau ({labelFormat})
                </div>
                <div style={{
                  width: formatSpec.width,
                  height: formatSpec.height,
                  background: 'white',
                  border: '2px solid #333',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1mm',
                  gap: '1mm',
                  transform: 'scale(2.5)',
                  transformOrigin: 'top center',
                  marginBottom: '3rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}>
                  <img 
                    src={qrUrl} 
                    alt="QR-Code" 
                    onError={(e) => {
                      console.error('❌ QR-Code konnte nicht geladen werden:', qrUrl)
                      e.currentTarget.style.display = 'none'
                    }}
                    style={{
                      width: formatSpec.qrSize,
                      height: formatSpec.qrSize,
                      imageRendering: 'crisp-edges',
                      display: 'block',
                      border: '1px solid #ccc'
                    }}
                  />
                  <p style={{
                    fontSize: formatSpec.fontSize,
                    fontWeight: 'bold',
                    margin: 0,
                    lineHeight: 1.2,
                    textAlign: 'center',
                    wordWrap: 'break-word',
                    maxWidth: '100%',
                    color: '#000'
                  }}>
                    {printLocationState.label}
                  </p>
                  {artwork && (
                    <p style={{
                      fontSize: `${parseInt(formatSpec.fontSize) - 1}pt`,
                      color: '#333',
                      margin: 0,
                      lineHeight: 1.1,
                      textAlign: 'center',
                      wordWrap: 'break-word',
                      maxWidth: '100%'
                    }}>
                      {(artwork.title || artwork.number || '').substring(0, 20)}
                    </p>
                  )}
                </div>
              </div>

              <div style={{
                padding: '1rem',
                background: 'rgba(95, 251, 241, 0.1)',
                border: '1px solid rgba(95, 251, 241, 0.3)',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                <div style={{ color: '#5ffbf1', fontWeight: '600', marginBottom: '0.5rem' }}>
                  {printLocationState.label}
                </div>
                {printLocationState.artworkId && (
                  <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                    Objekt: {artworks.find(a => (a.id || a.number) === printLocationState.artworkId)?.title || printLocationState.artworkId}
                  </div>
                )}
              </div>
            
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    if (printLocationState) {
                      executePrint(printLocationState, labelFormat)
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'linear-gradient(120deg, #10b981, #059669)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '1rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  🖨️ Drucken ({labelFormat})
                </button>
                <button
                  onClick={() => {
                    setShowPrintDialog(false)
                    setPrintLocationState(null)
                  }}
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Abbrechen
                </button>
              </div>

              <p style={{
                marginTop: '1rem',
                fontSize: '0.85rem',
                color: 'rgba(255, 255, 255, 0.6)',
                textAlign: 'center'
              }}>
                💡 Wähle das Format entsprechend deinem Brother-Etikettendrucker
              </p>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

export default PlatzanordnungPage
