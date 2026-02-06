import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import '../src/App.css'

// Einfache localStorage-Funktionen für Werke-Verwaltung
function saveArtworks(artworks: any[]): void {
  try {
    localStorage.setItem('k2-artworks', JSON.stringify(artworks))
  } catch (error) {
    console.error('Fehler beim Speichern:', error)
  }
}

function loadArtworks(): any[] {
  try {
    const stored = localStorage.getItem('k2-artworks')
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Fehler beim Laden:', error)
    return []
  }
}

// localStorage-Funktionen für Events
function saveEvents(events: any[]): void {
  try {
    localStorage.setItem('k2-events', JSON.stringify(events))
  } catch (error) {
    console.error('Fehler beim Speichern der Events:', error)
  }
}

function loadEvents(): any[] {
  try {
    const stored = localStorage.getItem('k2-events')
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Fehler beim Laden der Events:', error)
    return []
  }
}

/**
 * Admin-Seite für K2 Galerie Verwaltung
 * Wird angezeigt bei: ?screenshot=admin oder /admin
 */
function ScreenshotExportAdmin() {
  const [activeTab, setActiveTab] = useState<'werke' | 'dokumente' | 'stammdaten' | 'einstellungen' | 'statistiken' | 'eventplan' | 'öffentlichkeitsarbeit'>('werke')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [artworkTitle, setArtworkTitle] = useState('')
  const [artworkCategory, setArtworkCategory] = useState<'malerei' | 'keramik'>('malerei')
  const [artworkArtist, setArtworkArtist] = useState<string>('')
  const [artworkDescription, setArtworkDescription] = useState('')
  const [artworkPrice, setArtworkPrice] = useState<string>('')
  // Alle Werke sind automatisch Teil der Ausstellung
  const [isInExhibition] = useState(true)
  const [isInShop, setIsInShop] = useState(false)
  const [artworkNumber, setArtworkNumber] = useState<string>('')
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [savedArtwork, setSavedArtwork] = useState<any>(null)
  const [showSaleModal, setShowSaleModal] = useState(false)
  const [saleInput, setSaleInput] = useState('')
  const [saleMethod, setSaleMethod] = useState<'scan' | 'manual'>('scan')
  const [allArtworks, setAllArtworks] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('alle')
  const [showCameraView, setShowCameraView] = useState(false)
  const [documents, setDocuments] = useState<any[]>([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // Eventplan
  const [events, setEvents] = useState<any[]>([])
  const [showEventModal, setShowEventModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [eventTitle, setEventTitle] = useState('')
  const [eventType, setEventType] = useState<'galerieeröffnung' | 'vernissage' | 'finissage' | 'öffentlichkeitsarbeit' | 'sonstiges'>('galerieeröffnung')
  const [eventDate, setEventDate] = useState('')
  const [eventEndDate, setEventEndDate] = useState('')
  const [eventStartTime, setEventStartTime] = useState('')
  const [eventEndTime, setEventEndTime] = useState('')
  const [eventDailyTimes, setEventDailyTimes] = useState<Record<string, string>>({})
  const [eventDescription, setEventDescription] = useState('')
  const [eventLocation, setEventLocation] = useState('')
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [selectedEventForDocument, setSelectedEventForDocument] = useState<string | null>(null)
  const [eventDocumentFile, setEventDocumentFile] = useState<File | null>(null)
  const [eventDocumentName, setEventDocumentName] = useState('')
  const [eventDocumentType, setEventDocumentType] = useState<'flyer' | 'plakat' | 'presseaussendung' | 'sonstiges'>('flyer')
  
  // Stammdaten
  const [martinaData, setMartinaData] = useState({
    name: 'Martina Kreinecker',
    category: 'malerei',
    bio: 'Martina bringt mit ihren Gemälden eine lebendige Vielfalt an Farben und Ausdruckskraft auf die Leinwand. Ihre Werke spiegeln Jahre des Lernens, Experimentierens und der Leidenschaft für die Malerei wider.',
    email: '',
    phone: '',
    website: ''
  })
  const [georgData, setGeorgData] = useState({
    name: 'Georg Kreinecker',
    category: 'keramik',
    bio: 'Georg verbindet in seiner Keramikarbeit technisches Können mit kreativer Gestaltung. Seine Arbeiten sind geprägt von Präzision und einer Liebe zum Detail, das Ergebnis von jahrzehntelanger Erfahrung.',
    email: '',
    phone: '',
    website: ''
  })
  const [galleryData, setGalleryData] = useState<any>({
    name: 'K2 Galerie',
    subtitle: 'Kunst & Keramik',
    description: 'Gemeinsam eröffnen Martina und Georg nach über 20 Jahren kreativer Tätigkeit die K2 Galerie – ein Raum, wo Malerei und Keramik verschmelzen und Kunst zum Leben erwacht.',
    address: '',
    phone: '',
    email: '',
    website: '',
    openingHours: '',
    bankverbindung: '',
    adminPassword: 'k2Galerie2026'
  })

  // Stammdaten aus localStorage laden
  useEffect(() => {
    try {
      const storedMartina = localStorage.getItem('k2-stammdaten-martina')
      if (storedMartina) {
        setMartinaData(JSON.parse(storedMartina))
      }
      const storedGeorg = localStorage.getItem('k2-stammdaten-georg')
      if (storedGeorg) {
        setGeorgData(JSON.parse(storedGeorg))
      }
      const storedGallery = localStorage.getItem('k2-stammdaten-galerie')
      if (storedGallery) {
        const data = JSON.parse(storedGallery)
        setGalleryData({
          ...data,
          adminPassword: data.adminPassword || 'k2Galerie2026'
        })
      } else {
        // Setze Standard-Passwort wenn noch keine Daten vorhanden
        setGalleryData({
          adminPassword: 'k2Galerie2026'
        })
      }
    } catch (error) {
      console.error('Fehler beim Laden der Stammdaten:', error)
    }
  }, [])

  // Stammdaten speichern
  const saveStammdaten = () => {
    localStorage.setItem('k2-stammdaten-martina', JSON.stringify(martinaData))
    localStorage.setItem('k2-stammdaten-georg', JSON.stringify(georgData))
    localStorage.setItem('k2-stammdaten-galerie', JSON.stringify(galleryData))
    // Event dispatchen, damit andere Seiten die Daten sofort aktualisieren
    window.dispatchEvent(new CustomEvent('stammdaten-updated'))
    alert('✅ Stammdaten gespeichert!')
  }

  // Automatisch Künstler basierend auf Kategorie setzen
  useEffect(() => {
    if (artworkCategory === 'malerei') {
      setArtworkArtist(martinaData.name)
    } else if (artworkCategory === 'keramik') {
      setArtworkArtist(georgData.name)
    }
  }, [artworkCategory, martinaData.name, georgData.name])


  // Alle Werke aus localStorage laden
  useEffect(() => {
    const loadData = () => {
      try {
        const artworks = loadArtworks()
        if (Array.isArray(artworks)) {
          setAllArtworks(artworks)
        }
      } catch (error) {
        console.error('Fehler beim Laden:', error)
        setAllArtworks([])
      }
    }
    
    // Initial load
    loadData()
    
    // Auto-Refresh alle 3 Sekunden
    const interval = setInterval(loadData, 3000)
    
    // Event Listener für Updates
    const handleUpdate = () => loadData()
    window.addEventListener('artworks-updated', handleUpdate)
    window.addEventListener('storage', handleUpdate)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('artworks-updated', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  // Dokumente aus localStorage laden
  const loadDocuments = () => {
    try {
      const stored = localStorage.getItem('k2-documents')
      if (stored) {
        return JSON.parse(stored)
      }
      return []
    } catch (error) {
      console.error('Fehler beim Laden der Dokumente:', error)
      return []
    }
  }

  useEffect(() => {
    const docs = loadDocuments()
    setDocuments(docs)
  }, [])

  // Events aus localStorage laden
  useEffect(() => {
    const loadedEvents = loadEvents()
    setEvents(loadedEvents)
  }, [])

  // Event hinzufügen/bearbeiten
  const handleSaveEvent = () => {
    if (!eventTitle || !eventDate) {
      alert('Bitte Titel und Datum eingeben')
      return
    }

    const eventData = {
      id: editingEvent?.id || `event-${Date.now()}`,
      title: eventTitle,
      type: eventType,
      date: eventDate,
      endDate: eventEndDate || eventDate, // Falls kein Enddatum, dann Startdatum verwenden
      startTime: eventStartTime || '',
      endTime: eventEndTime || '',
      dailyTimes: eventDailyTimes || {}, // Tägliche Zeiten für jeden Tag
      description: eventDescription,
      location: eventLocation,
      documents: editingEvent?.documents || [],
      createdAt: editingEvent?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    let updatedEvents
    if (editingEvent) {
      updatedEvents = events.map(e => e.id === editingEvent.id ? eventData : e)
    } else {
      updatedEvents = [...events, eventData]
    }

    // Nach Startdatum sortieren
    updatedEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    setEvents(updatedEvents)
    saveEvents(updatedEvents)
    
    // Automatisch Vorschläge für Öffentlichkeitsarbeit generieren
    if (!editingEvent) {
      generateAutomaticSuggestions(eventData)
    }
    
    // Zurücksetzen
    setShowEventModal(false)
    setEditingEvent(null)
    setEventTitle('')
    setEventType('galerieeröffnung')
    setEventDate('')
    setEventEndDate('')
    setEventStartTime('')
    setEventEndTime('')
    setEventDailyTimes({})
    setEventDescription('')
    setEventLocation('')
    
    alert(editingEvent ? '✅ Event aktualisiert!' : '✅ Event hinzugefügt!')
  }

  // Event bearbeiten
  const handleEditEvent = (event: any) => {
    setEditingEvent(event)
    setEventTitle(event.title)
    setEventType(event.type)
    setEventDate(event.date)
    setEventEndDate(event.endDate || event.date)
    setEventStartTime(event.startTime || event.time || '')
    setEventEndTime(event.endTime || '')
    setEventDailyTimes(event.dailyTimes || {})
    setEventDescription(event.description || '')
    setEventLocation(event.location || '')
    setShowEventModal(true)
  }

  // Alle Tage zwischen Start- und Enddatum generieren
  const getEventDays = (startDate: string, endDate: string): string[] => {
    if (!startDate) return []
    const end = endDate || startDate
    const days: string[] = []
    const start = new Date(startDate)
    const endDateObj = new Date(end)
    
    for (let d = new Date(start); d <= endDateObj; d.setDate(d.getDate() + 1)) {
      days.push(d.toISOString().split('T')[0])
    }
    
    return days
  }

  // Automatische Vorschläge für neues Event generieren
  const generateAutomaticSuggestions = (event: any) => {
    // Speichere Vorschläge in localStorage
    const suggestions = {
      eventId: event.id,
      eventTitle: event.title,
      generatedAt: new Date().toISOString(),
      presseaussendung: generatePresseaussendungContent(event),
      socialMedia: generateSocialMediaContent(event),
      flyer: generateFlyerContent(event),
      newsletter: generateNewsletterContent(event),
      plakat: generatePlakatContent(event)
    }
    
    const existingSuggestions = JSON.parse(localStorage.getItem('k2-pr-suggestions') || '[]')
    existingSuggestions.push(suggestions)
    localStorage.setItem('k2-pr-suggestions', JSON.stringify(existingSuggestions))
  }

  // Content-Generatoren im App-Design-Stil
  const generatePresseaussendungContent = (event: any) => {
    return {
      title: `PRESSEAUSSENDUNG: ${event.title}`,
      content: `
${event.title.toUpperCase()}

${galleryData.name || 'K2 Galerie'}
${galleryData.address || ''}
${galleryData.phone ? `Tel: ${galleryData.phone}` : ''}
${galleryData.email ? `E-Mail: ${galleryData.email}` : ''}

${new Date(event.date).toLocaleDateString('de-DE', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})}${event.endDate && event.endDate !== event.date ? ` - ${new Date(event.endDate).toLocaleDateString('de-DE', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
})}` : ''}

${event.location || galleryData.address || ''}

${event.description || 'Wir laden Sie herzlich zu unserer Veranstaltung ein.'}

KÜNSTLER:
${martinaData.name}: ${martinaData.bio}
${georgData.name}: ${georgData.bio}

Für weitere Informationen kontaktieren Sie bitte:
${galleryData.email || ''}
${galleryData.phone || ''}
      `.trim()
    }
  }

  const generateSocialMediaContent = (event: any) => {
    const eventTypeLabels: Record<string, string> = {
      galerieeröffnung: '#Galerieeröffnung #Kunst',
      vernissage: '#Vernissage #Kunstausstellung',
      finissage: '#Finissage #Kunst',
      öffentlichkeitsarbeit: '#Kunst #Galerie',
      sonstiges: '#Kunst #Event'
    }
    
    return {
      instagram: `
🎨 ${event.title}

📅 ${new Date(event.date).toLocaleDateString('de-DE', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
})}${event.startTime ? ` um ${event.startTime} Uhr` : ''}

📍 ${event.location || galleryData.address || ''}

${event.description || 'Wir freuen uns auf Ihren Besuch!'}

${eventTypeLabels[event.type] || '#Kunst #Galerie'} #K2Galerie #KunstUndKeramik
      `.trim(),
      facebook: `
${event.title}

Wir laden Sie herzlich ein zu unserer ${event.type === 'galerieeröffnung' ? 'Galerieeröffnung' : event.type === 'vernissage' ? 'Vernissage' : event.type === 'finissage' ? 'Finissage' : 'Veranstaltung'}!

📅 Datum: ${new Date(event.date).toLocaleDateString('de-DE', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric'
})}${event.startTime ? `\n🕐 Uhrzeit: ${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''} Uhr` : ''}

📍 Ort: ${event.location || galleryData.address || ''}

${event.description || 'Besuchen Sie uns auch online!'}

Wir freuen uns auf Ihren Besuch!
      `.trim()
    }
  }

  const generateFlyerContent = (event: any) => {
    return {
      headline: event.title,
      date: new Date(event.date).toLocaleDateString('de-DE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      time: event.startTime ? `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''} Uhr` : '',
      location: event.location || galleryData.address || '',
      description: event.description || '',
      qrCode: galleryData.website || window.location.origin
    }
  }

  const generateNewsletterContent = (event: any) => {
    return {
      subject: `Einladung: ${event.title}`,
      greeting: 'Liebe Kunstfreunde,',
      body: `
wir laden Sie herzlich ein zu unserer ${event.type === 'galerieeröffnung' ? 'Galerieeröffnung' : event.type === 'vernissage' ? 'Vernissage' : event.type === 'finissage' ? 'Finissage' : 'Veranstaltung'}!

📅 ${new Date(event.date).toLocaleDateString('de-DE', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric'
})}${event.startTime ? `\n🕐 ${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''} Uhr` : ''}

📍 ${event.location || galleryData.address || ''}

${event.description || 'Wir freuen uns auf Ihren Besuch!'}
      `.trim()
    }
  }

  const generatePlakatContent = (event: any) => {
    return {
      title: event.title,
      date: new Date(event.date).toLocaleDateString('de-DE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      time: event.startTime ? `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''} Uhr` : '',
      location: event.location || galleryData.address || '',
      qrCode: galleryData.website || window.location.origin
    }
  }

  // Presseaussendung generieren (mit App-Design)
  const generatePresseaussendung = () => {
    const selectedEvent = events.find(e => e.type === 'öffentlichkeitsarbeit' || events.length > 0 ? events[0] : null)
    if (!selectedEvent && events.length === 0) {
      alert('Bitte zuerst ein Event erstellen')
      return
    }
    const event = selectedEvent || events[0]
    
    // Prüfe ob Vorschläge vorhanden sind
    const suggestions = JSON.parse(localStorage.getItem('k2-pr-suggestions') || '[]')
    const eventSuggestion = suggestions.find((s: any) => s.eventId === event.id)
    
    const content = eventSuggestion?.presseaussendung?.content || generatePresseaussendungContent(event).content
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Presseaussendung - ${event.title}</title>
  <style>
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Space Grotesk', 'Segoe UI', system-ui, sans-serif;
      background: linear-gradient(135deg, #03040a 0%, #0d1426 55%, #111c33 100%);
      color: #f4f7ff;
      padding: 2rem;
      min-height: 100vh;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: linear-gradient(145deg, rgba(18, 22, 35, 0.95), rgba(12, 16, 28, 0.92));
      border-radius: 24px;
      padding: 3rem;
      box-shadow: 0 40px 120px rgba(0, 0, 0, 0.55);
      border: 1px solid rgba(95, 251, 241, 0.12);
    }
    h1 {
      font-size: 2.5rem;
      color: #5ffbf1;
      margin-bottom: 1rem;
      letter-spacing: 0.05em;
    }
    .header {
      border-bottom: 2px solid rgba(95, 251, 241, 0.2);
      padding-bottom: 1.5rem;
      margin-bottom: 2rem;
    }
    .content {
      line-height: 1.8;
      font-size: 1.1rem;
      white-space: pre-wrap;
      color: #b8c5e0;
    }
    .highlight {
      color: #5ffbf1;
      font-weight: 600;
    }
    button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      margin: 1rem 0;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
    }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: center; margin-bottom: 2rem;">
    <button onclick="window.print()">🖨️ Als PDF speichern</button>
    <button onclick="navigator.clipboard.writeText(document.querySelector('.content').textContent)">📋 Text kopieren</button>
  </div>
  
  <div class="container">
    <div class="header">
      <h1>PRESSEAUSSENDUNG</h1>
    </div>
    <div class="content">${content.replace(/\n/g, '<br>')}</div>
  </div>
</body>
</html>
    `

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    alert('✅ Presseaussendung generiert!')
  }

  // Social Media Posts generieren (mit App-Design)
  const generateSocialMediaPosts = () => {
    const selectedEvent = events.find(e => e.type === 'öffentlichkeitsarbeit' || events.length > 0 ? events[0] : null)
    if (!selectedEvent && events.length === 0) {
      alert('Bitte zuerst ein Event erstellen')
      return
    }
    const event = selectedEvent || events[0]
    
    // Prüfe ob Vorschläge vorhanden sind
    const suggestions = JSON.parse(localStorage.getItem('k2-pr-suggestions') || '[]')
    const eventSuggestion = suggestions.find((s: any) => s.eventId === event.id)
    
    const socialContent = eventSuggestion?.socialMedia || generateSocialMediaContent(event)
    const instagramPost = socialContent.instagram
    const facebookPost = socialContent.facebook

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Social Media Posts - ${event.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Space Grotesk', 'Segoe UI', system-ui, sans-serif;
      background: linear-gradient(135deg, #03040a 0%, #0d1426 55%, #111c33 100%);
      color: #f4f7ff;
      padding: 2rem;
      min-height: 100vh;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
    }
    h1 {
      font-size: 2rem;
      color: #5ffbf1;
      margin-bottom: 2rem;
      text-align: center;
    }
    .post {
      background: linear-gradient(145deg, rgba(18, 22, 35, 0.95), rgba(12, 16, 28, 0.92));
      border: 1px solid rgba(95, 251, 241, 0.12);
      border-radius: 20px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.45);
    }
    .platform {
      font-size: 1.5rem;
      font-weight: 600;
      color: #5ffbf1;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .post-content {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 1.5rem;
      margin: 1rem 0;
      white-space: pre-wrap;
      font-size: 1.1rem;
      line-height: 1.8;
      color: #b8c5e0;
      font-family: inherit;
    }
    button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      margin-top: 1rem;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
      transition: all 0.3s ease;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Social Media Posts</h1>
    
    <div class="post">
      <div class="platform">📱 Instagram</div>
      <div class="post-content">${instagramPost.replace(/\n/g, '<br>')}</div>
      <button onclick="navigator.clipboard.writeText(\`${instagramPost.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`)">📋 Kopieren</button>
    </div>
    
    <div class="post">
      <div class="platform">📘 Facebook</div>
      <div class="post-content">${facebookPost.replace(/\n/g, '<br>')}</div>
      <button onclick="navigator.clipboard.writeText(\`${facebookPost.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`)">📋 Kopieren</button>
    </div>
  </div>
</body>
</html>
    `

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    alert('✅ Social Media Posts generiert!')
  }

  // Event-Flyer generieren (mit App-Design)
  const generateEventFlyer = () => {
    const selectedEvent = events.find(e => e.type === 'öffentlichkeitsarbeit' || events.length > 0 ? events[0] : null)
    if (!selectedEvent && events.length === 0) {
      alert('Bitte zuerst ein Event erstellen')
      return
    }
    const event = selectedEvent || events[0]
    
    // Prüfe ob Vorschläge vorhanden sind
    const suggestions = JSON.parse(localStorage.getItem('k2-pr-suggestions') || '[]')
    const eventSuggestion = suggestions.find((s: any) => s.eventId === event.id)
    
    const flyerContent = eventSuggestion?.flyer || generateFlyerContent(event)
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(flyerContent.qrCode)}`
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Flyer - ${flyerContent.headline}</title>
  <style>
    @media print {
      body { margin: 0; background: white; }
      .no-print { display: none; }
      .flyer { background: white !important; color: #1a1f3a !important; }
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Space Grotesk', 'Segoe UI', system-ui, sans-serif;
      background: linear-gradient(135deg, #03040a 0%, #0d1426 55%, #111c33 100%);
      color: #f4f7ff;
      padding: 2rem;
      min-height: 100vh;
    }
    .flyer {
      background: linear-gradient(145deg, rgba(18, 22, 35, 0.98), rgba(12, 16, 28, 0.98));
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 3rem;
      box-shadow: 0 40px 120px rgba(0, 0, 0, 0.55);
      border: 1px solid rgba(95, 251, 241, 0.12);
      border-radius: 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    h1 {
      font-size: 3rem;
      margin: 0 0 2rem 0;
      color: #5ffbf1;
      letter-spacing: 0.02em;
      background: linear-gradient(135deg, #5ffbf1 0%, #33a1ff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .event-info {
      font-size: 1.3rem;
      margin: 2rem 0;
      line-height: 2;
      color: #b8c5e0;
    }
    .event-info strong {
      color: #5ffbf1;
    }
    .description {
      margin: 2rem 0;
      line-height: 1.8;
      font-size: 1.1rem;
      color: #b8c5e0;
    }
    .qr-code {
      text-align: center;
      margin: 2rem 0;
      padding: 1.5rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 16px;
    }
    .qr-code img {
      width: 150px;
      height: 150px;
      border-radius: 8px;
    }
    .contact {
      margin-top: auto;
      font-size: 1rem;
      color: #8fa0c9;
      border-top: 1px solid rgba(95, 251, 241, 0.2);
      padding-top: 1.5rem;
    }
    .contact strong {
      color: #5ffbf1;
      font-size: 1.2rem;
    }
    button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      margin: 1rem;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: center; margin-bottom: 2rem;">
    <button onclick="window.print()">🖨️ Drucken (A4)</button>
  </div>
  
  <div class="flyer">
    <div>
      <h1>${flyerContent.headline}</h1>
      
      <div class="event-info">
        <p><strong>📅 Datum:</strong> ${flyerContent.date}${event.endDate && event.endDate !== event.date ? ` - ${new Date(event.endDate).toLocaleDateString('de-DE', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })}` : ''}</p>
        
        ${flyerContent.time ? `<p><strong>🕐 Uhrzeit:</strong> ${flyerContent.time}</p>` : ''}
        
        ${flyerContent.location ? `<p><strong>📍 Ort:</strong> ${flyerContent.location}</p>` : ''}
      </div>
      
      ${flyerContent.description ? `<div class="description">${flyerContent.description.replace(/\n/g, '<br>')}</div>` : ''}
    </div>
    
    <div class="qr-code">
      <p style="color: #5ffbf1; font-weight: 600; margin-bottom: 1rem;">Besuchen Sie uns online:</p>
      <img src="${qrCodeUrl}" alt="QR Code" />
      <p style="font-size: 0.9rem; margin-top: 0.5rem; color: #8fa0c9;">${flyerContent.qrCode}</p>
    </div>
    
    <div class="contact">
      <p><strong>${galleryData.name || 'K2 Galerie'}</strong></p>
      ${galleryData.address ? `<p>${galleryData.address}</p>` : ''}
      ${galleryData.phone ? `<p>Tel: ${galleryData.phone}</p>` : ''}
      ${galleryData.email ? `<p>E-Mail: ${galleryData.email}</p>` : ''}
    </div>
  </div>
</body>
</html>
    `

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    alert('✅ Flyer generiert! Bitte im Browser drucken.')
  }

  // E-Mail-Newsletter generieren (mit App-Design)
  const generateEmailNewsletter = () => {
    const selectedEvent = events.find(e => e.type === 'öffentlichkeitsarbeit' || events.length > 0 ? events[0] : null)
    if (!selectedEvent && events.length === 0) {
      alert('Bitte zuerst ein Event erstellen')
      return
    }
    const event = selectedEvent || events[0]
    
    // Prüfe ob Vorschläge vorhanden sind
    const suggestions = JSON.parse(localStorage.getItem('k2-pr-suggestions') || '[]')
    const eventSuggestion = suggestions.find((s: any) => s.eventId === event.id)
    
    const newsletterContent = eventSuggestion?.newsletter || generateNewsletterContent(event)
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Newsletter - ${event.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Space Grotesk', 'Segoe UI', system-ui, sans-serif;
      background: linear-gradient(135deg, #03040a 0%, #0d1426 55%, #111c33 100%);
      color: #f4f7ff;
      padding: 2rem;
      min-height: 100vh;
    }
    .container {
      max-width: 700px;
      margin: 0 auto;
    }
    .email {
      background: linear-gradient(145deg, rgba(18, 22, 35, 0.95), rgba(12, 16, 28, 0.92));
      border: 1px solid rgba(95, 251, 241, 0.12);
      border-radius: 24px;
      padding: 3rem;
      box-shadow: 0 40px 120px rgba(0, 0, 0, 0.55);
    }
    h1 {
      font-size: 2.5rem;
      color: #5ffbf1;
      margin-bottom: 1.5rem;
      letter-spacing: 0.02em;
    }
    .greeting {
      font-size: 1.2rem;
      color: #b8c5e0;
      margin-bottom: 1.5rem;
    }
    .event-box {
      background: rgba(95, 251, 241, 0.1);
      border: 1px solid rgba(95, 251, 241, 0.2);
      border-radius: 16px;
      padding: 1.5rem;
      margin: 1.5rem 0;
    }
    .event-box p {
      margin: 0.75rem 0;
      color: #b8c5e0;
      font-size: 1.1rem;
    }
    .event-box strong {
      color: #5ffbf1;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1rem 2rem;
      text-decoration: none;
      border-radius: 12px;
      margin: 1.5rem 0;
      font-weight: 600;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
      transition: all 0.3s ease;
    }
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
    }
    .footer {
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(95, 251, 241, 0.2);
      font-size: 0.95rem;
      color: #8fa0c9;
    }
    .footer strong {
      color: #5ffbf1;
      font-size: 1.1rem;
    }
    button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      margin: 1rem 0.5rem;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    }
  </style>
</head>
<body>
  <div style="text-align: center; margin-bottom: 2rem;">
    <button onclick="navigator.clipboard.writeText(document.querySelector('.email').outerHTML)">📋 HTML kopieren</button>
  </div>
  
  <div class="container">
    <div class="email">
      <h1>${event.title}</h1>
      
      <p class="greeting">${newsletterContent.greeting}</p>
      
      <p style="color: #b8c5e0; font-size: 1.1rem; line-height: 1.8; margin-bottom: 1.5rem;">
        wir laden Sie herzlich ein zu unserer ${event.type === 'galerieeröffnung' ? 'Galerieeröffnung' : event.type === 'vernissage' ? 'Vernissage' : event.type === 'finissage' ? 'Finissage' : 'Veranstaltung'}!
      </p>
      
      <div class="event-box">
        ${newsletterContent.body.split('\n').map(line => `<p>${line}</p>`).join('')}
      </div>
      
      ${event.description ? `<p style="color: #b8c5e0; font-size: 1.1rem; line-height: 1.8; margin: 1.5rem 0;">${event.description.replace(/\n/g, '<br>')}</p>` : ''}
      
      <a href="${galleryData.website || window.location.origin}" class="button">Mehr erfahren →</a>
      
      <div class="footer">
        <p><strong>${galleryData.name || 'K2 Galerie'}</strong></p>
        ${galleryData.address ? `<p>${galleryData.address}</p>` : ''}
        ${galleryData.phone ? `<p>Tel: ${galleryData.phone}</p>` : ''}
        ${galleryData.email ? `<p>E-Mail: ${galleryData.email}</p>` : ''}
      </div>
    </div>
  </div>
</body>
</html>
    `

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    alert('✅ Newsletter generiert! HTML-Code kann kopiert werden.')
  }

  // Plakat generieren (mit App-Design)
  const generatePlakat = () => {
    const selectedEvent = events.find(e => e.type === 'öffentlichkeitsarbeit' || events.length > 0 ? events[0] : null)
    if (!selectedEvent && events.length === 0) {
      alert('Bitte zuerst ein Event erstellen')
      return
    }
    const event = selectedEvent || events[0]
    
    // Prüfe ob Vorschläge vorhanden sind
    const suggestions = JSON.parse(localStorage.getItem('k2-pr-suggestions') || '[]')
    const eventSuggestion = suggestions.find((s: any) => s.eventId === event.id)
    
    const plakatContent = eventSuggestion?.plakat || generatePlakatContent(event)
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(plakatContent.qrCode)}`
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Plakat - ${plakatContent.title}</title>
  <style>
    @media print {
      body { margin: 0; background: white !important; }
      .no-print { display: none; }
      .plakat { width: 297mm; height: 420mm; background: white !important; color: #1a1f3a !important; }
      .plakat h1 { color: #1a1f3a !important; }
      .plakat .event-info { color: #333 !important; }
      .plakat .contact { color: #666 !important; }
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Space Grotesk', 'Segoe UI', system-ui, sans-serif;
      background: linear-gradient(135deg, #03040a 0%, #0d1426 55%, #111c33 100%);
      color: #f4f7ff;
      padding: 2rem;
      min-height: 100vh;
    }
    .plakat {
      background: linear-gradient(145deg, rgba(18, 22, 35, 0.98), rgba(12, 16, 28, 0.98));
      width: 297mm;
      min-height: 420mm;
      margin: 0 auto;
      padding: 4rem;
      box-shadow: 0 40px 120px rgba(0, 0, 0, 0.55);
      border: 1px solid rgba(95, 251, 241, 0.12);
      border-radius: 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
    }
    h1 {
      font-size: 5rem;
      margin: 0 0 3rem 0;
      color: #5ffbf1;
      text-align: center;
      letter-spacing: 0.02em;
      background: linear-gradient(135deg, #5ffbf1 0%, #33a1ff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 700;
    }
    .event-info {
      font-size: 2rem;
      text-align: center;
      margin: 2rem 0;
      line-height: 2.5;
      color: #b8c5e0;
    }
    .event-info strong {
      color: #5ffbf1;
      font-size: 2.2rem;
    }
    .qr-code {
      text-align: center;
      margin: 3rem 0;
      padding: 2rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 20px;
    }
    .qr-code img {
      width: 250px;
      height: 250px;
      border-radius: 12px;
    }
    .qr-code p {
      font-size: 1.2rem;
      margin-top: 1rem;
      color: #8fa0c9;
    }
    .contact {
      text-align: center;
      font-size: 1.5rem;
      color: #8fa0c9;
      margin-top: auto;
      width: 100%;
      padding-top: 2rem;
      border-top: 2px solid rgba(95, 251, 241, 0.2);
    }
    .contact strong {
      color: #5ffbf1;
      font-size: 1.8rem;
      display: block;
      margin-bottom: 0.5rem;
    }
    button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      margin: 1rem;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: center; margin-bottom: 2rem;">
    <button onclick="window.print()">🖨️ Drucken (A3)</button>
  </div>
  
  <div class="plakat">
    <h1>${plakatContent.title}</h1>
    
    <div class="event-info">
      <p><strong>${plakatContent.date}${event.endDate && event.endDate !== event.date ? ` - ${new Date(event.endDate).toLocaleDateString('de-DE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })}` : ''}</strong></p>
      
      ${plakatContent.time ? `<p>${plakatContent.time}</p>` : ''}
      
      ${plakatContent.location ? `<p>${plakatContent.location}</p>` : ''}
    </div>
    
    <div class="qr-code">
      <img src="${qrCodeUrl}" alt="QR Code" />
      <p>${plakatContent.qrCode}</p>
    </div>
    
    <div class="contact">
      <p><strong>${galleryData.name || 'K2 Galerie'}</strong></p>
      ${galleryData.address ? `<p>${galleryData.address}</p>` : ''}
      ${galleryData.phone ? `<p>${galleryData.phone}</p>` : ''}
    </div>
  </div>
</body>
</html>
    `

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    alert('✅ Plakat generiert! Bitte im Browser drucken (A3 Format).')
  }

  // Pressemappe generieren
  const generatePressemappe = () => {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Pressemappe - ${galleryData.name || 'K2 Galerie'}</title>
  <style>
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
    body { font-family: Arial, sans-serif; padding: 2rem; max-width: 800px; margin: 0 auto; }
    h1 { color: #1a1f3a; }
    h2 { color: #667eea; margin-top: 2rem; }
    .section { margin: 2rem 0; }
    button { background: #667eea; color: white; border: none; padding: 1rem 2rem; border-radius: 8px; cursor: pointer; }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: center; margin-bottom: 2rem;">
    <button onclick="window.print()">🖨️ Als PDF speichern</button>
  </div>
  
  <h1>PRESSEMAPPE</h1>
  <h2>${galleryData.name || 'K2 Galerie'}</h2>
  
  <div class="section">
    <h2>Galerie-Informationen</h2>
    <p><strong>Name:</strong> ${galleryData.name || 'K2 Galerie'}</p>
    ${galleryData.address ? `<p><strong>Adresse:</strong> ${galleryData.address}</p>` : ''}
    ${galleryData.phone ? `<p><strong>Telefon:</strong> ${galleryData.phone}</p>` : ''}
    ${galleryData.email ? `<p><strong>E-Mail:</strong> ${galleryData.email}</p>` : ''}
    ${galleryData.website ? `<p><strong>Website:</strong> ${galleryData.website}</p>` : ''}
    ${galleryData.openingHours ? `<p><strong>Öffnungszeiten:</strong> ${galleryData.openingHours}</p>` : ''}
  </div>
  
  <div class="section">
    <h2>Künstler</h2>
    <h3>${martinaData.name}</h3>
    <p>${martinaData.bio}</p>
    ${martinaData.email ? `<p>E-Mail: ${martinaData.email}</p>` : ''}
    ${martinaData.phone ? `<p>Telefon: ${martinaData.phone}</p>` : ''}
    
    <h3>${georgData.name}</h3>
    <p>${georgData.bio}</p>
    ${georgData.email ? `<p>E-Mail: ${georgData.email}</p>` : ''}
    ${georgData.phone ? `<p>Telefon: ${georgData.phone}</p>` : ''}
  </div>
  
  <div class="section">
    <h2>Aktuelle Events</h2>
    ${events.slice(0, 5).map(event => `
      <div style="margin: 1.5rem 0; padding: 1rem; background: #f5f5f5; border-radius: 8px;">
        <h3>${event.title}</h3>
        <p><strong>Datum:</strong> ${new Date(event.date).toLocaleDateString('de-DE', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })}${event.endDate && event.endDate !== event.date ? ` - ${new Date(event.endDate).toLocaleDateString('de-DE', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })}` : ''}</p>
        ${event.location ? `<p><strong>Ort:</strong> ${event.location}</p>` : ''}
        ${event.description ? `<p>${event.description}</p>` : ''}
      </div>
    `).join('')}
  </div>
  
  <div class="section">
    <h2>Kontakt für Presseanfragen</h2>
    <p>${galleryData.email || ''}</p>
    <p>${galleryData.phone || ''}</p>
  </div>
</body>
</html>
    `

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    alert('✅ Pressemappe generiert!')
  }

  // Website-Content generieren
  const generateWebsiteContent = () => {
    const selectedEvent = events.find(e => e.type === 'öffentlichkeitsarbeit' || events.length > 0 ? events[0] : null)
    if (!selectedEvent && events.length === 0) {
      alert('Bitte zuerst ein Event erstellen')
      return
    }
    const event = selectedEvent || events[0]
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Website Content - ${event.title}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 2rem; max-width: 800px; margin: 0 auto; }
    .content { background: #f5f5f5; padding: 2rem; border-radius: 8px; margin: 1rem 0; }
    pre { background: white; padding: 1rem; border-radius: 4px; overflow-x: auto; }
    button { background: #667eea; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; margin: 0.5rem 0.5rem 0.5rem 0; }
  </style>
</head>
<body>
  <h1>Website Content für: ${event.title}</h1>
  
  <div class="content">
    <h2>HTML Content</h2>
    <pre id="htmlContent"><section class="event-detail">
  <h2>${event.title}</h2>
  <div class="event-meta">
    <p><strong>Datum:</strong> ${new Date(event.date).toLocaleDateString('de-DE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })}${event.endDate && event.endDate !== event.date ? ` - ${new Date(event.endDate).toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })}` : ''}</p>
    ${event.startTime ? `<p><strong>Uhrzeit:</strong> ${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''} Uhr</p>` : ''}
    ${event.location ? `<p><strong>Ort:</strong> ${event.location}</p>` : ''}
  </div>
  ${event.description ? `<div class="event-description">${event.description.replace(/\n/g, '<br>')}</div>` : ''}
</section></pre>
    <button onclick="navigator.clipboard.writeText(document.getElementById('htmlContent').textContent)">HTML kopieren</button>
  </div>
  
  <div class="content">
    <h2>Meta Description (SEO)</h2>
    <pre id="metaContent">${event.title} - ${new Date(event.date).toLocaleDateString('de-DE')} bei ${galleryData.name || 'K2 Galerie'}. ${event.description ? event.description.substring(0, 120) : ''}...</pre>
    <button onclick="navigator.clipboard.writeText(document.getElementById('metaContent').textContent)">Meta kopieren</button>
  </div>
</body>
</html>
    `

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    alert('✅ Website-Content generiert!')
  }

  // Katalog generieren
  const generateKatalog = () => {
    const artworks = loadArtworks()
    if (artworks.length === 0) {
      alert('Bitte zuerst Werke hinzufügen')
      return
    }
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Katalog - ${galleryData.name || 'K2 Galerie'}</title>
  <style>
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
      .artwork { page-break-inside: avoid; }
    }
    body { font-family: Arial, sans-serif; padding: 2rem; }
    h1 { color: #1a1f3a; text-align: center; }
    .artwork { margin: 2rem 0; padding: 1.5rem; border: 1px solid #ddd; border-radius: 8px; display: flex; gap: 2rem; }
    .artwork-image { width: 200px; height: 200px; object-fit: cover; border-radius: 4px; }
    .artwork-info { flex: 1; }
    .artwork-title { font-size: 1.5rem; font-weight: bold; margin: 0 0 0.5rem 0; }
    button { background: #667eea; color: white; border: none; padding: 1rem 2rem; border-radius: 8px; cursor: pointer; }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: center; margin-bottom: 2rem;">
    <button onclick="window.print()">🖨️ Als PDF speichern</button>
  </div>
  
  <h1>KATALOG</h1>
  <h2 style="text-align: center; color: #667eea;">${galleryData.name || 'K2 Galerie'}</h2>
  
  ${artworks.map((artwork: any) => `
    <div class="artwork">
      ${artwork.imageUrl ? `<img src="${artwork.imageUrl}" alt="${artwork.title}" class="artwork-image" />` : ''}
      <div class="artwork-info">
        <div class="artwork-title">${artwork.title}</div>
        <p><strong>Künstler:</strong> ${artwork.artist}</p>
        <p><strong>Kategorie:</strong> ${artwork.category === 'malerei' ? 'Malerei' : 'Keramik'}</p>
        ${artwork.description ? `<p>${artwork.description}</p>` : ''}
        <p><strong>Preis:</strong> €${artwork.price?.toFixed(2) || '0.00'}</p>
        <p><strong>Nummer:</strong> ${artwork.number || artwork.id}</p>
      </div>
    </div>
  `).join('')}
  
  <div style="margin-top: 3rem; text-align: center; color: #666;">
    <p>${galleryData.name || 'K2 Galerie'}</p>
    ${galleryData.address ? `<p>${galleryData.address}</p>` : ''}
    ${galleryData.email ? `<p>${galleryData.email}</p>` : ''}
    ${galleryData.phone ? `<p>${galleryData.phone}</p>` : ''}
  </div>
</body>
</html>
    `

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    alert('✅ Katalog generiert!')
  }

  // Dokument zu Event hinzufügen
  const handleAddEventDocument = async () => {
    if (!eventDocumentFile || !eventDocumentName || !selectedEventForDocument) {
      alert('Bitte Datei und Name auswählen')
      return
    }

    try {
      // Datei zu Data URL konvertieren
      const reader = new FileReader()
      reader.onloadend = () => {
        const documentData = {
          id: `doc-${Date.now()}`,
          name: eventDocumentName,
          type: eventDocumentType,
          fileData: reader.result as string,
          fileName: eventDocumentFile.name,
          fileType: eventDocumentFile.type,
          addedAt: new Date().toISOString()
        }

        const updatedEvents = events.map(event => {
          if (event.id === selectedEventForDocument) {
            return {
              ...event,
              documents: [...(event.documents || []), documentData]
            }
          }
          return event
        })

        setEvents(updatedEvents)
        saveEvents(updatedEvents)
        
        // Zurücksetzen
        setShowDocumentModal(false)
        setSelectedEventForDocument(null)
        setEventDocumentFile(null)
        setEventDocumentName('')
        setEventDocumentType('flyer')
        
        alert('✅ Dokument hinzugefügt!')
      }
      reader.readAsDataURL(eventDocumentFile)
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Dokuments:', error)
      alert('Fehler beim Hinzufügen des Dokuments')
    }
  }

  // Dokument von Event löschen
  const handleDeleteEventDocument = (eventId: string, documentId: string) => {
    if (confirm('Möchtest du dieses Dokument wirklich löschen?')) {
      const updatedEvents = events.map(event => {
        if (event.id === eventId) {
          return {
            ...event,
            documents: (event.documents || []).filter((doc: any) => doc.id !== documentId)
          }
        }
        return event
      })

      setEvents(updatedEvents)
      saveEvents(updatedEvents)
      alert('✅ Dokument gelöscht!')
    }
  }

  // Dokument öffnen/anschauen
  const handleViewEventDocument = (document: any) => {
    const newWindow = window.open()
    if (newWindow && document.fileData) {
      newWindow.document.write(`
        <html>
          <head><title>${document.name}</title></head>
          <body style="margin:0; padding:20px; background:#f5f5f5;">
            ${document.fileType?.includes('pdf') 
              ? `<iframe src="${document.fileData}" style="width:100%; height:100vh; border:none;"></iframe>`
              : document.fileType?.includes('image')
              ? `<img src="${document.fileData}" style="max-width:100%; height:auto;" />`
              : `<a href="${document.fileData}" download="${document.fileName}">Download: ${document.name}</a>`
            }
          </body>
        </html>
      `)
    }
  }

  // Event löschen
  const handleDeleteEvent = (eventId: string) => {
    if (confirm('Möchtest du dieses Event wirklich löschen?')) {
      const updatedEvents = events.filter(e => e.id !== eventId)
      setEvents(updatedEvents)
      saveEvents(updatedEvents)
      alert('✅ Event gelöscht!')
    }
  }

  // Event-Modal öffnen
  const openEventModal = () => {
    setEditingEvent(null)
    setEventTitle('')
    setEventType('galerieeröffnung')
    setEventDate('')
    setEventEndDate('')
    setEventStartTime('')
    setEventEndTime('')
    setEventDailyTimes({})
    setEventDescription('')
    // Automatisch Ort aus Stammdaten übernehmen
    setEventLocation(galleryData.address || '')
    setShowEventModal(true)
  }

  // Stammdaten in Event-Felder übernehmen
  const applyStammdatenToEvent = () => {
    // Ort aus Stammdaten übernehmen
    setEventLocation(galleryData.address || '')
    
    // Kontaktdaten in Beschreibung einfügen (wenn noch keine Beschreibung vorhanden)
    if (!eventDescription) {
      const kontaktInfo: string[] = []
      if (galleryData.phone) kontaktInfo.push(`Tel: ${galleryData.phone}`)
      if (galleryData.email) kontaktInfo.push(`E-Mail: ${galleryData.email}`)
      if (galleryData.address) kontaktInfo.push(`Adresse: ${galleryData.address}`)
      if (galleryData.openingHours) kontaktInfo.push(`Öffnungszeiten: ${galleryData.openingHours}`)
      
      if (kontaktInfo.length > 0) {
        setEventDescription(kontaktInfo.join('\n'))
      }
    }
    
    alert('✅ Stammdaten übernommen!')
  }

  // Dokumente speichern
  const saveDocuments = (docs: any[]) => {
    try {
      localStorage.setItem('k2-documents', JSON.stringify(docs))
      setDocuments(docs)
    } catch (error) {
      console.error('Fehler beim Speichern:', error)
      alert('Fehler beim Speichern. Möglicherweise ist der Speicher voll.')
    }
  }

  // Dokument hochladen
  const handleDocumentUpload = async (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const base64 = e.target?.result as string
          const newDoc = {
            id: Date.now().toString(),
            name: file.name,
            type: file.type,
            size: file.size,
            data: base64,
            uploadedAt: new Date().toISOString(),
            isPDF: file.type === 'application/pdf'
          }
          const updated = [...documents, newDoc]
          saveDocuments(updated)
          resolve()
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Dokument zu PDF konvertieren
  const convertToPDF = async (doc: any) => {
    if (doc.isPDF) {
      // Bereits PDF - direkt öffnen
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        alert('Pop-up-Blocker verhindert PDF-Öffnung.')
        return
      }
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${doc.name}</title>
            <style>
              body { margin: 0; padding: 0; }
              iframe { width: 100%; height: 100vh; border: none; }
            </style>
          </head>
          <body>
            <iframe src="${doc.data}"></iframe>
            <script>
              window.onload = () => {
                setTimeout(() => window.print(), 500);
              }
            </script>
          </body>
        </html>
      `)
      printWindow.document.close()
      return
    }

    // Bild zu PDF konvertieren
    if (doc.type.startsWith('image/')) {
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        alert('Pop-up-Blocker verhindert PDF-Erstellung.')
        return
      }

      const date = new Date(doc.uploadedAt).toLocaleDateString('de-DE', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric'
      })

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${doc.name} - PDF</title>
            <style>
              @media print {
                @page {
                  size: A4;
                  margin: 10mm;
                }
              }
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
                text-align: center;
              }
              .header {
                margin-bottom: 20px;
                border-bottom: 2px solid #8b6914;
                padding-bottom: 10px;
              }
              .header h1 {
                margin: 0;
                font-size: 18px;
                color: #8b6914;
              }
              .header p {
                margin: 5px 0 0;
                font-size: 12px;
                color: #666;
              }
              img {
                max-width: 100%;
                max-height: 80vh;
                object-fit: contain;
                margin: 20px 0;
              }
              .footer {
                margin-top: 20px;
                font-size: 10px;
                color: #999;
                border-top: 1px solid #ddd;
                padding-top: 10px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>K2 GALERIE</h1>
              <p>${doc.name}</p>
              <p>Erstellt am: ${date}</p>
            </div>
            <img src="${doc.data}" alt="${doc.name}" />
            <div class="footer">
              <div>K2 Galerie - Kunst & Keramik</div>
            </div>
            <script>
              window.onload = () => {
                setTimeout(() => {
                  window.print();
                  setTimeout(() => window.close(), 500);
                }, 500);
              }
            </script>
          </body>
        </html>
      `)
      printWindow.document.close()
      return
    }

    // Andere Formate - versuche als HTML zu rendern
    alert(`Dateiformat "${doc.type}" kann nicht direkt zu PDF konvertiert werden. Bitte konvertiere die Datei manuell zu PDF oder verwende ein Bildformat.`)
  }

  // Dokument löschen
  const deleteDocument = (id: string) => {
    if (confirm('Möchtest du dieses Dokument wirklich löschen?')) {
      const updated = documents.filter(d => d.id !== id)
      saveDocuments(updated)
    }
  }

  // Laufende Nummer generieren
  const generateArtworkNumber = () => {
    const lastNumber = localStorage.getItem('k2-last-artwork-number') || '0'
    const nextNumber = parseInt(lastNumber, 10) + 1
    const formattedNumber = `K2-${String(nextNumber).padStart(4, '0')}`
    localStorage.setItem('k2-last-artwork-number', String(nextNumber))
    return formattedNumber
  }

  // QR-Code URL generieren
  const getQRCodeUrl = (artworkId: string) => {
    const artworkUrl = `${window.location.origin}/galerie?werk=${artworkId}`
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(artworkUrl)}`
  }

  // QR-Code aus Bild lesen (vereinfacht - würde normalerweise eine Library verwenden)
  const readQRCodeFromImage = async (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          // Hier würde normalerweise eine QR-Code-Library verwendet werden
          // Für jetzt: URL aus Bild-URL extrahieren (falls QR-Code eine URL enthält)
          // Oder manuelle Eingabe verwenden
          resolve(null) // Würde QR-Code-Text zurückgeben
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    })
  }

  // Werk als verkauft markieren
  const handleMarkAsSold = (artworkNumber: string) => {
    // Hier würde normalerweise die Datenbank aktualisiert werden
    const soldArtworks = JSON.parse(localStorage.getItem('k2-sold-artworks') || '[]')
    if (!soldArtworks.find((a: any) => a.number === artworkNumber)) {
      soldArtworks.push({
        number: artworkNumber,
        soldAt: new Date().toISOString()
      })
      localStorage.setItem('k2-sold-artworks', JSON.stringify(soldArtworks))
      alert(`✅ Werk ${artworkNumber} wurde als verkauft markiert!`)
    } else {
      alert(`⚠️ Werk ${artworkNumber} ist bereits als verkauft markiert.`)
    }
    
    // Modal schließen
    setShowSaleModal(false)
    setSaleInput('')
    setSaleMethod('scan')
  }


  // Datei auswählen (funktioniert für Datei-Upload und Kamera)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      // Sofort als Data URL konvertieren für Preview (nicht Blob URL!)
      const reader = new FileReader()
      reader.onloadend = () => {
        const dataUrl = reader.result as string
        setPreviewUrl(dataUrl) // Data URL statt Blob URL
      }
      reader.readAsDataURL(file)
    }
    // Reset für erneute Nutzung
    e.target.value = ''
  }

  // Kamera öffnen - auf Desktop mit MediaDevices API, auf Mobile mit capture
  const handleCameraClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Prüfe ob wir auf einem mobilen Gerät sind
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    
    if (isMobile) {
      // Auf Mobile: Verwende capture Attribut
      const input = document.getElementById('camera-input-direct') as HTMLInputElement
      if (input) {
        input.value = ''
        input.click()
      }
      return
    }

    // Auf Desktop: Verwende MediaDevices API
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Kamera wird auf diesem Browser nicht unterstützt. Bitte verwende "Datei auswählen".')
      return
    }

    try {
      // Öffne Kamera
      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false
        })
      } catch (envError) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        })
      }
      
      setCameraStream(stream)
      setShowCameraView(true)
      
      // Video-Element verbinden
      setTimeout(() => {
        if (videoRef.current && stream) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(err => {
            console.error('Video play error:', err)
          })
        }
      }, 300)
    } catch (error: any) {
      console.error('Kamera-Fehler:', error)
      let errorMessage = 'Kamera konnte nicht geöffnet werden.'
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = 'Kamera-Zugriff wurde verweigert. Bitte erlaube den Zugriff in den Browser-Einstellungen.'
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'Keine Kamera gefunden.'
      }
      alert(errorMessage)
    }
  }

  // Kamera schließen
  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
    setShowCameraView(false)
  }

  // Foto aufnehmen
  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      if (context && video.videoWidth > 0) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0)
        
        // Canvas zu Blob konvertieren
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `kamera-${Date.now()}.jpg`, { type: 'image/jpeg' })
            setSelectedFile(file)
            
            // Preview erstellen
            const reader = new FileReader()
            reader.onloadend = () => {
              setPreviewUrl(reader.result as string)
            }
            reader.readAsDataURL(file)
            
            // Kamera schließen
            closeCamera()
          }
        }, 'image/jpeg', 0.9)
      }
    }
  }

  // Cleanup beim Unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [cameraStream])



  // Bild komprimieren - optimiert für mobile Geräte (wenig Speicher)
  const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.65): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height
          
          // Für mobile: kleinere Größe (800px statt 1200px)
          // Größe reduzieren falls zu groß
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
          
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Canvas context nicht verfügbar'))
            return
          }
          
          // Bild zeichnen
          ctx.drawImage(img, 0, 0, width, height)
          
          // Für mobile: niedrigere Qualität (0.65 statt 0.8) = weniger Speicher
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
          resolve(compressedDataUrl)
        }
        img.onerror = reject
        img.src = e.target?.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Werk speichern
  const handleSaveArtwork = async () => {
    if (!selectedFile || !artworkTitle) {
      alert('Bitte Titel und Bild auswählen')
      return
    }
    
    if (!artworkPrice || parseFloat(artworkPrice) <= 0) {
      alert('Bitte einen gültigen Preis eingeben')
      return
    }
    
    // Laufende Nummer generieren
    const newArtworkNumber = generateArtworkNumber()
    setArtworkNumber(newArtworkNumber)
    
    // Bild komprimieren bevor es gespeichert wird - optimiert für mobile (wenig Speicher)
    try {
      // Für mobile: kleinere Größe (800px) und niedrigere Qualität (0.65)
      const compressedDataUrl = await compressImage(selectedFile, 800, 0.65)
      
      // Prüfe ob Data URL zu groß ist (localStorage Limit ~5-10MB)
      // Für mobile: strengeres Limit (1.5MB statt 2MB)
      if (compressedDataUrl.length > 1500000) {
        // Versuche noch stärkere Kompression
        const moreCompressed = await compressImage(selectedFile, 600, 0.5)
        if (moreCompressed.length > 1500000) {
          alert('Bild ist auch nach Kompression zu groß. Bitte verwende ein kleineres Bild (max. ~1.5MB nach Kompression).')
          return
        }
        await saveArtworkData(moreCompressed, newArtworkNumber)
      } else {
        await saveArtworkData(compressedDataUrl, newArtworkNumber)
      }
    } catch (error) {
      console.error('Fehler beim Komprimieren:', error)
      alert('Fehler beim Verarbeiten des Bildes. Bitte versuche es erneut.')
    }
  }

  // Werk-Daten speichern
  const saveArtworkData = async (imageDataUrl: string, newArtworkNumber: string) => {
      
    // Werk-Daten speichern
    const artworkData = {
      id: newArtworkNumber,
      number: newArtworkNumber,
      title: artworkTitle,
      category: artworkCategory,
      artist: artworkArtist,
      description: artworkDescription,
      price: parseFloat(artworkPrice),
      inExhibition: isInExhibition,
      inShop: isInShop,
      imageUrl: imageDataUrl, // Komprimierte Data URL
      createdAt: new Date().toISOString()
    }
    
    // Werk in localStorage speichern
    const artworks = loadArtworks()
    artworks.push(artworkData)
    
    try {
      const dataToStore = JSON.stringify(artworks)
      
      // Prüfe localStorage-Größe
      // Für mobile: kleineres Limit (3MB statt 5MB)
      const currentSize = new Blob([dataToStore]).size
      const maxSize = 3 * 1024 * 1024 // 3MB für mobile Optimierung
      
      if (currentSize > maxSize) {
        // Versuche alte Werke zu löschen
        const sortedArtworks = artworks.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        
        // Behalte nur die 15 neuesten Werke (für mobile: weniger Werke = weniger Speicher)
        const keptArtworks = sortedArtworks.slice(0, 15)
        const keptData = JSON.stringify(keptArtworks)
        
        if (new Blob([keptData]).size > maxSize) {
          alert('localStorage ist voll. Bitte lösche einige alte Werke manuell oder verwende kleinere Bilder.')
          return
        }
        
        saveArtworks(keptArtworks)
        alert(`Hinweis: Die ältesten Werke wurden automatisch gelöscht, um Platz zu schaffen.`)
      } else {
        saveArtworks(artworks)
      }
      
      console.log('Werk gespeichert:', {
        number: artworkData.number,
        title: artworkData.title,
        imageUrlLength: artworkData.imageUrl?.length || 0,
        compressed: true
      })
      
      // Event dispatchen, damit Galerie-Seite sich aktualisiert
      window.dispatchEvent(new CustomEvent('artworks-updated'))
      
      // Aktualisiere lokale Liste
      setAllArtworks(loadArtworks())
      
      // Gespeichertes Werk für Druck-Modal
      setSavedArtwork({
        ...artworkData,
        file: selectedFile // Für QR-Code-Generierung behalten
      })
      
      // Modal schließen und zurücksetzen
      setShowAddModal(false)
      setSelectedFile(null)
      setPreviewUrl(null)
      setArtworkTitle('')
      setArtworkCategory('malerei')
      setArtworkArtist('')
      setArtworkDescription('')
      setArtworkPrice('')
      setIsInShop(false)
      
      // Aktualisiere die Liste
      setAllArtworks(JSON.parse(localStorage.getItem('k2-artworks') || '[]'))
      
      // Druck-Modal öffnen
      setShowPrintModal(true)
    } catch (error) {
      console.error('Fehler beim Speichern:', error)
      if (error instanceof Error && error.message.includes('QuotaExceededError')) {
        alert('localStorage ist voll! Bitte lösche einige alte Werke oder verwende kleinere Bilder.')
      } else {
        alert('Fehler beim Speichern. Bitte versuche es erneut.')
      }
    }
  }

  // Drucken
  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const qrCodeUrl = getQRCodeUrl(savedArtwork.number)
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>K2 Galerie - Etikett ${savedArtwork.number}</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 10mm;
              }
            }
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 100mm;
              margin: 0 auto;
            }
            .label {
              border: 2px solid #8b6914;
              border-radius: 8px;
              padding: 15px;
              text-align: center;
            }
            .label-header {
              font-size: 18px;
              font-weight: bold;
              color: #8b6914;
              margin-bottom: 10px;
            }
            .label-number {
              font-size: 24px;
              font-weight: bold;
              margin: 10px 0;
              color: #333;
            }
            .label-title {
              font-size: 14px;
              margin: 10px 0;
              color: #666;
            }
            .label-qr {
              margin: 15px 0;
            }
            .label-qr img {
              width: 150px;
              height: 150px;
            }
            .label-footer {
              font-size: 12px;
              color: #999;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="label-header">K2 Galerie</div>
            <div class="label-number" style="font-size: 28px; font-weight: bold; margin: 12px 0; color: #8b6914; border: 2px solid #8b6914; padding: 8px; border-radius: 6px;">
              Seriennummer:<br/>${savedArtwork.number}
            </div>
            <div class="label-title">${savedArtwork.title}</div>
            <div class="label-qr">
              <img src="${qrCodeUrl}" alt="QR Code" />
            </div>
            <div class="label-footer">${savedArtwork.category === 'malerei' ? 'Malerei' : 'Keramik'} • ${savedArtwork.artist}</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  // PDF für QR-Code Plakat erstellen
  const printQRCodePlakat = async () => {
    const homepageUrl = `${window.location.origin}/projects/k2-galerie/galerie`
    const rundgangUrl = `${window.location.origin}/projects/k2-galerie/virtueller-rundgang`
    const homepageQRUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(homepageUrl)}`
    const rundgangQRUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(rundgangUrl)}`

    const date = new Date().toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    })

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR-Codes - K2 Galerie</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 0;
              }
              * {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
            * {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            body {
              font-family: 'Arial', 'Helvetica', sans-serif;
              margin: 0;
              padding: 0;
              background: #ffffff !important;
              color: #1f1f1f !important;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            @media screen {
              body {
                padding: 20px;
                background: #f5f5f5 !important;
              }
            }
            .plakat {
              width: 210mm;
              min-height: 297mm;
              background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1419 100%) !important;
              padding: 20mm;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
              position: relative;
              color: #ffffff !important;
            }
            .content {
              position: relative;
              z-index: 1;
              width: 100%;
            }
            .icon {
              font-size: 60px;
              margin-bottom: 20px;
              opacity: 0.8;
            }
            h1 {
              font-size: 48px;
              font-weight: 700;
              margin: 0 0 15px;
              background: linear-gradient(135deg, #ffffff 0%, #b8b8ff 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              letter-spacing: -0.02em;
              line-height: 1.2;
            }
            h2 {
              font-size: 28px;
              font-weight: 600;
              margin: 0 0 10px;
              color: #ffffff;
              letter-spacing: -0.01em;
            }
            .subtitle {
              font-size: 18px;
              color: rgba(255, 255, 255, 0.7);
              margin-bottom: 35px;
              font-weight: 300;
              line-height: 1.5;
            }
            .text-block {
              font-size: 15px;
              color: rgba(255, 255, 255, 0.9);
              line-height: 1.7;
              margin-bottom: 30px;
              max-width: 550px;
              margin-left: auto;
              margin-right: auto;
              text-align: center;
            }
            .text-block strong {
              color: #ffffff;
              font-weight: 600;
            }
            .highlight-box {
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(20px);
              border: 1px solid rgba(255, 255, 255, 0.2);
              border-radius: 16px;
              padding: 25px;
              margin: 35px 0;
              max-width: 500px;
              margin-left: auto;
              margin-right: auto;
            }
            .highlight-box p {
              margin: 0;
              font-size: 16px;
              color: #ffffff;
              font-weight: 500;
              line-height: 1.8;
            }
            .qr-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 25px;
              margin: 40px 0;
              max-width: 550px;
              margin-left: auto;
              margin-right: auto;
            }
            .qr-container {
              background: rgba(255, 255, 255, 0.95);
              padding: 20px;
              border-radius: 16px;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            }
            .qr-code {
              width: 100%;
              max-width: 200px;
              height: auto;
              display: block;
              margin: 0 auto;
            }
            .qr-label {
              margin-top: 15px;
              font-size: 16px;
              color: #1f1f1f;
              font-weight: 700;
            }
            .qr-description {
              margin-top: 8px;
              font-size: 13px;
              color: #666;
              line-height: 1.5;
            }
            .footer {
              margin-top: 50px;
              font-size: 13px;
              color: rgba(255, 255, 255, 0.7);
              line-height: 1.6;
            }
            .footer strong {
              color: #ffffff;
            }
          </style>
        </head>
        <body>
          <div class="plakat">
            <div class="content">
              <div class="icon">🏛️</div>
              <h1>K2 GALERIE</h1>
              <h2>Besuchen Sie uns online</h2>
              <p class="subtitle">Kunst & Keramik • Jederzeit verfügbar</p>
              
              <div class="text-block">
                <p><strong>Entdecken Sie die K2 Galerie – auch wenn wir geschlossen haben!</strong></p>
                <p>Die K2 Galerie öffnet ihre Türen für Sie – jederzeit und überall. Erleben Sie die aktuellen Werke von Martina und Georg Kreinecker bequem von zu Hause oder unterwegs. Entdecken Sie die Verbindung von Malerei und Keramik in einem Raum, wo Kunst zum Leben erwacht.</p>
              </div>

              <div class="highlight-box">
                <p>🎨 Malerei & Keramik<br>
                📱 Einfach QR-Code scannen<br>
                🌐 Sofort verfügbar, jederzeit</p>
              </div>

              <div class="qr-grid">
                <div class="qr-container">
                  <img src="${homepageQRUrl}" alt="QR-Code für Homepage" class="qr-code" />
                  <div class="qr-label">Homepage</div>
                  <div class="qr-description">Besuchen Sie unsere Galerie-Website</div>
                </div>
                <div class="qr-container">
                  <img src="${rundgangQRUrl}" alt="QR-Code für virtuellen Rundgang" class="qr-code" />
                  <div class="qr-label">Virtueller Rundgang</div>
                  <div class="qr-description">Erkunden Sie die Ausstellung</div>
                </div>
              </div>

              <div class="text-block">
                <p><strong>So funktioniert's:</strong></p>
                <p>1. Öffnen Sie die Kamera-App auf Ihrem Smartphone<br>
                2. Scannen Sie einen der QR-Codes<br>
                3. Erkunden Sie unsere Galerie in Ruhe</p>
                <p style="margin-top: 15px;">Lassen Sie sich von der Vielfalt unserer Kunstwerke inspirieren und entdecken Sie die einzigartige Verbindung von Malerei und Keramik.</p>
              </div>

              <div class="footer">
                <p><strong>K2 Galerie</strong><br>
                Martina & Georg Kreinecker<br>
                Kunst & Keramik</p>
                <p style="margin-top: 12px;">Erstellt am: ${date}</p>
              </div>
            </div>
          </div>
          
          <script>
            window.onload = function() {
              // Zeige PDF an - Nutzer kann dann selbst drucken/speichern
              // Kein automatischer Druck-Dialog mehr
            }
          </script>
        </body>
      </html>
    `

    // Speichere das PDF automatisch im Dokumentenordner
    try {
      // Erstelle ein Blob aus dem HTML
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const reader = new FileReader()
      
      reader.onload = () => {
        try {
          const base64 = reader.result as string
          
          // Prüfe, ob bereits eine "Virtuelle Einladung" existiert
          const existingDocs = loadDocuments()
          const existingInvitation = existingDocs.find((d: any) => 
            d.name && d.name.includes('Virtuelle Einladung')
          )
          
          // Erstelle Dokument-Objekt
          const doc = {
            id: existingInvitation ? existingInvitation.id : `qr-plakat-${Date.now()}`,
            name: `Virtuelle Einladung - QR-Code Plakat (${date}).html`,
            type: 'text/html',
            size: blob.size,
            data: base64,
            uploadedAt: new Date().toISOString(),
            isPDF: false,
            isPlaceholder: false
          }
          
          // Ersetze vorhandenes oder füge neues hinzu
          const updated = existingInvitation
            ? existingDocs.map((d: any) => d.id === existingInvitation.id ? doc : d)
            : [...existingDocs, doc]
          
          saveDocuments(updated)
          setDocuments(updated)
          
          // Zeige Erfolgsmeldung
          alert(`✅ Virtuelle Einladung wurde im Dokumentenordner gespeichert!\n\nDateiname: ${doc.name}`)
        } catch (error) {
          console.error('Fehler beim Speichern:', error)
          alert('❌ Fehler beim Speichern der virtuellen Einladung')
        }
      }
      
      reader.onerror = () => {
        alert('❌ Fehler beim Lesen der Datei')
      }
      
      reader.readAsDataURL(blob)
    } catch (error) {
      console.error('Fehler beim Erstellen des Blobs:', error)
      alert('❌ Fehler beim Speichern der virtuellen Einladung')
    }

    // Öffne auch das PDF-Fenster zur Ansicht
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Pop-up-Blocker verhindert PDF-Ansicht. Bitte erlaube Pop-ups.')
      return
    }
    
    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }

  // PDF für Werke drucken
  const printPDF = (type: 'galerie' | 'verkauft') => {
    let filteredArtworks = allArtworks
    
    if (type === 'galerie') {
      // Nur Werke die in der Galerie sind
      filteredArtworks = allArtworks.filter((a: any) => a.inExhibition === true)
    } else if (type === 'verkauft') {
      // Nur verkaufte Werke
      try {
        const soldData = localStorage.getItem('k2-sold-artworks')
        if (soldData) {
          const soldArtworks = JSON.parse(soldData)
          const soldNumbers = new Set(soldArtworks.map((a: any) => a.number))
          filteredArtworks = allArtworks.filter((a: any) => soldNumbers.has(a.number))
        } else {
          filteredArtworks = []
        }
      } catch (error) {
        filteredArtworks = []
      }
    }

    if (filteredArtworks.length === 0) {
      alert(`Keine Werke gefunden für "${type === 'galerie' ? 'Galerie' : 'Verkaufte Werke'}"`)
      return
    }

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Pop-up-Blocker verhindert PDF-Erstellung. Bitte erlaube Pop-ups.')
      return
    }

    const title = type === 'galerie' ? 'Werke in der Galerie' : 'Verkaufte Werke'
    const date = new Date().toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    })

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - K2 Galerie</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 15mm;
              }
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 11px;
              line-height: 1.5;
              color: #000;
              padding: 20px;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #8b6914;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              color: #8b6914;
            }
            .header p {
              margin: 5px 0 0;
              font-size: 12px;
              color: #666;
            }
            .artwork-item {
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 1px solid #ddd;
              page-break-inside: avoid;
            }
            .artwork-item:last-child {
              border-bottom: none;
            }
            .artwork-header {
              display: flex;
              justify-content: space-between;
              align-items: start;
              margin-bottom: 10px;
            }
            .artwork-title {
              font-size: 14px;
              font-weight: bold;
              color: #1f1f1f;
            }
            .artwork-number {
              font-size: 12px;
              font-weight: bold;
              color: #8b6914;
            }
            .artwork-details {
              font-size: 10px;
              color: #666;
              margin-bottom: 8px;
            }
            .artwork-image {
              max-width: 200px;
              max-height: 200px;
              margin: 10px 0;
              border: 1px solid #ddd;
            }
            .artwork-price {
              font-size: 12px;
              font-weight: bold;
              color: #8b6914;
              margin-top: 5px;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 9px;
              color: #999;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>K2 GALERIE</h1>
            <p>${title}</p>
            <p>Erstellt am: ${date} • ${filteredArtworks.length} ${filteredArtworks.length === 1 ? 'Werk' : 'Werke'}</p>
          </div>
          
          ${filteredArtworks.map((artwork: any) => `
            <div class="artwork-item">
              <div class="artwork-header">
                <div class="artwork-title">${artwork.title || artwork.number}</div>
                <div class="artwork-number">Seriennummer: ${artwork.number || artwork.id}</div>
              </div>
              <div class="artwork-details">
                ${artwork.category === 'malerei' ? 'Malerei' : artwork.category === 'keramik' ? 'Keramik' : artwork.category}
                ${artwork.artist ? ' • ' + artwork.artist : ''}
                ${artwork.description ? '<br/>' + artwork.description : ''}
              </div>
              ${artwork.imageUrl ? `<img src="${artwork.imageUrl}" alt="${artwork.title}" class="artwork-image" />` : ''}
              <div class="artwork-price">Preis: € ${artwork.price ? artwork.price.toFixed(2) : '0.00'}</div>
              ${type === 'verkauft' ? '<div style="color: #2d6a2d; font-weight: bold; margin-top: 5px;">✓ Verkauft</div>' : ''}
            </div>
          `).join('')}
          
          <div class="footer">
            <div>K2 Galerie - Kunst & Keramik</div>
            <div>www.k2-galerie.at</div>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
                setTimeout(() => window.close(), 500);
              }, 500);
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  // Cleanup nicht mehr nötig, da wir Data URLs verwenden (keine Blob URLs)

  return (
    <div style={{
      minHeight: '100vh',
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
          padding: 'clamp(1.5rem, 4vw, 2.5rem) clamp(1.5rem, 4vw, 3rem)',
          paddingTop: 'clamp(2rem, 5vw, 3rem)',
          maxWidth: '1600px',
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
                K2 Galerie
              </h1>
              <span style={{
                marginTop: '0.5rem',
                display: 'block',
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
                fontWeight: '300'
              }}>
                Admin-Verwaltung
              </span>
            </div>
            <nav style={{
              display: 'flex',
              gap: 'clamp(0.75rem, 2vw, 1rem)',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              <Link 
                to="/galerie" 
                style={{
                  padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
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
                Zur Galerie
              </Link>
              <Link 
                to="/galerie?kasse=1" 
                style={{
                  padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#ffffff',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                  fontWeight: '600',
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
                💰 Kasse
              </Link>
              <span style={{
                padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                background: 'rgba(45, 106, 45, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(45, 106, 45, 0.3)',
                borderRadius: '12px',
                fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                color: '#4ade80',
                fontWeight: '500',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>✓</span> Admin-Modus
              </span>
            </nav>
          </div>
        </header>

        <main style={{
          padding: '0 clamp(1.5rem, 4vw, 3rem)',
          paddingBottom: 'clamp(4rem, 10vw, 6rem)',
          maxWidth: '1600px',
          margin: '0 auto'
        }}>
          {/* Prominenter Kassa-Button */}
          <div style={{ 
            marginBottom: 'clamp(2rem, 5vw, 3rem)', 
            textAlign: 'center',
            padding: 'clamp(2rem, 5vw, 3rem)',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <Link 
              to="/galerie?kasse=1" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#ffffff',
                padding: 'clamp(1rem, 2.5vw, 1.25rem) clamp(2rem, 5vw, 2.5rem)',
                borderRadius: '16px',
                fontWeight: '700',
                fontSize: 'clamp(1.1rem, 3vw, 1.4rem)',
                textDecoration: 'none',
                boxShadow: '0 15px 40px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 20px 50px rgba(102, 126, 234, 0.5)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.4)'
              }}
            >
              💰 Kasse öffnen
            </Link>
            <p style={{ 
              marginTop: 'clamp(1rem, 3vw, 1.5rem)', 
              color: 'rgba(255, 255, 255, 0.8)', 
              fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
              fontWeight: '300'
            }}>
              Für Verkäufe in der Ausstellung
            </p>
          </div>

          {/* Admin Tabs */}
          <div style={{
            display: 'flex',
            gap: 'clamp(0.5rem, 2vw, 1rem)',
            flexWrap: 'wrap',
            marginBottom: 'clamp(2rem, 5vw, 3rem)',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: 'clamp(0.75rem, 2vw, 1rem)'
          }}>
            <button 
              onClick={() => setActiveTab('werke')}
              style={{
                padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                border: 'none',
                borderRadius: '12px',
                fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                fontWeight: activeTab === 'werke' ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: activeTab === 'werke' 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                boxShadow: activeTab === 'werke' ? '0 10px 30px rgba(102, 126, 234, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'werke') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'werke') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                }
              }}
            >
              🎨 Werke verwalten
            </button>
            <button 
              onClick={() => setActiveTab('dokumente')}
              style={{
                padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                border: 'none',
                borderRadius: '12px',
                fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                fontWeight: activeTab === 'dokumente' ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: activeTab === 'dokumente' 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                boxShadow: activeTab === 'dokumente' ? '0 10px 30px rgba(102, 126, 234, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'dokumente') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'dokumente') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                }
              }}
            >
              📄 Dokumente
            </button>
            <button 
              onClick={() => setActiveTab('stammdaten')}
              style={{
                padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                border: 'none',
                borderRadius: '12px',
                fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                fontWeight: activeTab === 'stammdaten' ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: activeTab === 'stammdaten' 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                boxShadow: activeTab === 'stammdaten' ? '0 10px 30px rgba(102, 126, 234, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'stammdaten') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'stammdaten') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                }
              }}
            >
              👥 Stammdaten
            </button>
            <button 
              onClick={() => setActiveTab('einstellungen')}
              style={{
                padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                border: 'none',
                borderRadius: '12px',
                fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                fontWeight: activeTab === 'einstellungen' ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: activeTab === 'einstellungen' 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                boxShadow: activeTab === 'einstellungen' ? '0 10px 30px rgba(102, 126, 234, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'einstellungen') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'einstellungen') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                }
              }}
            >
              ⚙️ Einstellungen
            </button>
            <button 
              onClick={() => setActiveTab('statistiken')}
              style={{
                padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                border: 'none',
                borderRadius: '12px',
                fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                fontWeight: activeTab === 'statistiken' ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: activeTab === 'statistiken' 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                boxShadow: activeTab === 'statistiken' ? '0 10px 30px rgba(102, 126, 234, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'statistiken') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'statistiken') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                }
              }}
            >
              📊 Statistiken
            </button>
            <button 
              onClick={() => setActiveTab('eventplan')}
              style={{
                padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                border: 'none',
                borderRadius: '12px',
                fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                fontWeight: activeTab === 'eventplan' ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: activeTab === 'eventplan' 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                boxShadow: activeTab === 'eventplan' ? '0 10px 30px rgba(102, 126, 234, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'eventplan') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'eventplan') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                }
              }}
            >
              📅 Eventplanung
            </button>
            <button 
              onClick={() => setActiveTab('öffentlichkeitsarbeit')}
              style={{
                padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                border: 'none',
                borderRadius: '12px',
                fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                fontWeight: activeTab === 'öffentlichkeitsarbeit' ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: activeTab === 'öffentlichkeitsarbeit' 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                boxShadow: activeTab === 'öffentlichkeitsarbeit' ? '0 10px 30px rgba(102, 126, 234, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'öffentlichkeitsarbeit') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'öffentlichkeitsarbeit') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                }
              }}
            >
              📢 Öffentlichkeitsarbeit
            </button>
          </div>

          {/* Werke verwalten */}
          {activeTab === 'werke' && (
            <section style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              padding: 'clamp(2rem, 5vw, 3rem)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              marginBottom: 'clamp(2rem, 5vw, 3rem)'
            }}>
              <h2 style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: 'clamp(1.5rem, 4vw, 2rem)',
                letterSpacing: '-0.01em'
              }}>
                Werke verwalten
              </h2>
              <div style={{
                display: 'flex',
                gap: 'clamp(0.75rem, 2vw, 1rem)',
                flexWrap: 'wrap',
                marginBottom: 'clamp(2rem, 5vw, 3rem)'
              }}>
                <button 
                  onClick={() => setShowAddModal(true)}
                  style={{
                    padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#ffffff',
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
                  + Neues Werk hinzufügen
                </button>
                <button 
                  onClick={() => setShowSaleModal(true)}
                  style={{
                    padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                    background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 10px 30px rgba(245, 87, 108, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 15px 40px rgba(245, 87, 108, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(245, 87, 108, 0.3)'
                  }}
                >
                  💰 Werk als verkauft markieren
                </button>
                <button 
                  onClick={() => printPDF('galerie')}
                  style={{
                    padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    borderRadius: '12px',
                    fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
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
                  📄 PDF: Werke in Galerie
                </button>
                <button 
                  onClick={() => printPDF('verkauft')}
                  style={{
                    padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    borderRadius: '12px',
                    fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
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
                  📄 PDF: Verkaufte Werke
                </button>
                <button 
                  onClick={() => printQRCodePlakat()}
                  style={{
                    padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#ffffff',
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
                  🏛️ QR-Code Plakat drucken
                </button>
              <button 
                className="btn-secondary" 
                onClick={() => {
                  try {
                    const artworks = JSON.parse(localStorage.getItem('k2-artworks') || '[]')
                    const exportData = {
                      artworks,
                      exportedAt: new Date().toISOString(),
                      version: '1.0'
                    }
                    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `k2-artworks-export-${new Date().toISOString().split('T')[0]}.json`
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    URL.revokeObjectURL(url)
                    alert(`✅ ${artworks.length} Werke wurden exportiert!`)
                  } catch (error) {
                    console.error('Export-Fehler:', error)
                    alert('Fehler beim Exportieren der Daten.')
                  }
                }}
                style={{ background: '#2d6a2d' }}
              >
                📤 Daten exportieren
              </button>
              <button 
                className="btn-secondary" 
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = 'application/json'
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (!file) return
                    
                    const reader = new FileReader()
                    reader.onload = (event) => {
                      try {
                        const importData = JSON.parse(event.target?.result as string)
                        if (importData.artworks && Array.isArray(importData.artworks)) {
                          // Merge mit bestehenden Werken (keine Duplikate)
                          const existing = loadArtworks()
                          const existingIds = new Set(existing.map((a: any) => a.id || a.number))
                          const newArtworks = importData.artworks.filter((a: any) => !existingIds.has(a.id || a.number))
                          
                          if (newArtworks.length === 0) {
                            alert('Keine neuen Werke zum Importieren gefunden.')
                            return
                          }
                          
                          const merged = [...existing, ...newArtworks]
                          saveArtworks(merged)
                          setAllArtworks(merged)
                          window.dispatchEvent(new CustomEvent('artworks-updated'))
                          alert(`✅ ${newArtworks.length} neue Werke wurden importiert!`)
                        } else {
                          alert('Ungültiges Export-Format.')
                        }
                      } catch (error) {
                        console.error('Import-Fehler:', error)
                        alert('Fehler beim Importieren der Daten.')
                      }
                    }
                    reader.readAsText(file)
                  }
                  input.click()
                }}
                style={{ background: '#2d6a2d' }}
              >
                📥 Daten importieren
              </button>
              <button 
                className="btn-secondary" 
                onClick={() => {
                  try {
                    // Berechne localStorage-Größe
                    let totalSize = 0
                    for (let key in localStorage) {
                      if (localStorage.hasOwnProperty(key)) {
                        totalSize += localStorage[key].length + key.length
                      }
                    }
                    const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2)
                    alert(`localStorage-Größe: ${sizeInMB} MB\n\nMaximal: ~5-10 MB`)
                  } catch (error) {
                    alert('Fehler beim Berechnen der Größe')
                  }
                }}
              >
                📊 Speicher prüfen
              </button>
            </div>
              <div style={{
                display: 'flex',
                gap: 'clamp(0.75rem, 2vw, 1rem)',
                flexWrap: 'wrap',
                marginBottom: 'clamp(2rem, 5vw, 3rem)'
              }}>
                <input 
                  type="text" 
                  placeholder="Werke durchsuchen..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: '200px',
                    padding: 'clamp(0.75rem, 2vw, 1rem)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                    color: '#ffffff',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                  }}
                />
                <select 
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{
                    padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                    color: '#ffffff',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="alle" style={{ background: '#1a1f3a', color: '#ffffff' }}>Alle Kategorien</option>
                  <option value="malerei" style={{ background: '#1a1f3a', color: '#ffffff' }}>Malerei</option>
                  <option value="keramik" style={{ background: '#1a1f3a', color: '#ffffff' }}>Keramik</option>
                </select>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(200px, 30vw, 280px), 1fr))',
                gap: 'clamp(1rem, 3vw, 1.5rem)'
              }}>
              {(() => {
                const filtered = allArtworks.filter((artwork) => {
                  if (!artwork) return false
                  if (categoryFilter !== 'alle' && artwork.category !== categoryFilter) return false
                  if (searchQuery && !artwork.title?.toLowerCase().includes(searchQuery.toLowerCase()) && 
                      !artwork.number?.toLowerCase().includes(searchQuery.toLowerCase())) return false
                  return true
                })

                if (filtered.length === 0) {
                  return (
                    <div style={{ 
                      gridColumn: '1 / -1', 
                      textAlign: 'center', 
                      padding: 'clamp(3rem, 8vw, 5rem)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '20px'
                    }}>
                      <p style={{ fontSize: 'clamp(1.1rem, 3vw, 1.3rem)', color: 'rgba(255, 255, 255, 0.9)' }}>
                        Noch keine Werke vorhanden
                      </p>
                      <p style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)', marginTop: '1rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                        Klicke auf "+ Neues Werk hinzufügen" um ein Werk anzulegen.
                      </p>
                    </div>
                  )
                }

                return filtered.map((artwork) => {
                  const imageSrc = artwork.imageUrl || artwork.previewUrl
                  
                  return (
                  <div 
                    key={artwork.number || artwork.id} 
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '20px',
                      padding: 'clamp(1rem, 3vw, 1.5rem)',
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
                    {imageSrc ? (
                      <img 
                        src={imageSrc} 
                        alt={artwork.title || artwork.number}
                        style={{ width: '100%', height: 'clamp(180px, 30vw, 220px)', objectFit: 'cover', borderRadius: '12px', marginBottom: 'clamp(0.75rem, 2vw, 1rem)' }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const placeholder = document.createElement('div')
                          placeholder.textContent = '🖼️'
                          placeholder.style.cssText = 'width: 100%; height: clamp(180px, 30vw, 220px); display: flex; align-items: center; justify-content: center; background: rgba(255, 255, 255, 0.05); border-radius: 12px; margin-bottom: clamp(0.75rem, 2vw, 1rem); color: rgba(255, 255, 255, 0.3); font-size: clamp(2rem, 5vw, 3rem)'
                          target.parentElement?.insertBefore(placeholder, target)
                        }}
                      />
                    ) : (
                      <div style={{ 
                        width: '100%', 
                        height: 'clamp(180px, 30vw, 220px)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        background: 'rgba(255, 255, 255, 0.05)', 
                        borderRadius: '12px', 
                        marginBottom: 'clamp(0.75rem, 2vw, 1rem)', 
                        color: 'rgba(255, 255, 255, 0.3)',
                        fontSize: 'clamp(2rem, 5vw, 3rem)'
                      }}>
                        🖼️
                      </div>
                    )}
                    <h3 style={{
                      margin: '0 0 0.5rem',
                      fontSize: 'clamp(1rem, 3vw, 1.2rem)',
                      color: '#ffffff',
                      fontWeight: '600'
                    }}>
                      {artwork.title || artwork.number}
                    </h3>
                    <p style={{
                      margin: '0.25rem 0',
                      fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                      color: 'rgba(255, 255, 255, 0.6)'
                    }}>
                      {artwork.category === 'malerei' ? 'Malerei' : artwork.category === 'keramik' ? 'Keramik' : artwork.category}
                    </p>
                    {artwork.artist && (
                      <p style={{ 
                        fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)', 
                        color: 'rgba(255, 255, 255, 0.5)',
                        margin: '0.25rem 0'
                      }}>
                        {artwork.artist}
                      </p>
                    )}
                    {artwork.price && (
                      <p style={{ 
                        fontWeight: '700', 
                        background: 'linear-gradient(135deg, #b8b8ff 0%, #ff77c6 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontSize: 'clamp(1rem, 3vw, 1.2rem)',
                        margin: '0.5rem 0'
                      }}>
                        € {artwork.price.toFixed(2)}
                      </p>
                    )}
                    <div style={{ 
                      marginTop: '0.75rem', 
                      fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', 
                      color: 'rgba(255, 255, 255, 0.6)' 
                    }}>
                      {artwork.inExhibition && <span style={{ display: 'block' }}>✓ Ausstellung</span>}
                      {artwork.inShop && <span style={{ display: 'block' }}>✓ Shop</span>}
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: 'clamp(0.5rem, 2vw, 0.75rem)',
                      marginTop: 'clamp(1rem, 3vw, 1.5rem)'
                    }}>
                      <button 
                        onClick={() => {
                          setArtworkTitle(artwork.title || '')
                          setArtworkCategory(artwork.category || 'malerei')
                          setArtworkArtist(artwork.artist || '')
                          setArtworkDescription(artwork.description || '')
                          setArtworkPrice(String(artwork.price || ''))
                          setIsInShop(artwork.inShop || false)
                          setArtworkNumber(artwork.number || '')
                          setShowAddModal(true)
                        }}
                        style={{
                          flex: 1,
                          padding: 'clamp(0.5rem, 1.5vw, 0.75rem)',
                          background: 'rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                        }}
                      >
                        Bearbeiten
                      </button>
                      <button 
                        onClick={async () => {
                          if (confirm(`Möchtest du "${artwork.title || artwork.number}" wirklich löschen?`)) {
                            const artworks = loadArtworks()
                            const filtered = artworks.filter((a: any) => a.number !== artwork.number && a.id !== artwork.id)
                            saveArtworks(filtered)
                            window.dispatchEvent(new CustomEvent('artworks-updated'))
                            setAllArtworks(filtered)
                          }
                        }}
                        style={{
                          flex: 1,
                          padding: 'clamp(0.5rem, 1.5vw, 0.75rem)',
                          background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 10px 30px rgba(245, 87, 108, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)'
                          e.currentTarget.style.boxShadow = '0 15px 40px rgba(245, 87, 108, 0.4)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = '0 10px 30px rgba(245, 87, 108, 0.3)'
                        }}
                      >
                        Löschen
                      </button>
                    </div>
                  </div>
                  )
                })
              })()}
              </div>
            </section>
          )}

          {/* Dokumente */}
          {activeTab === 'dokumente' && (
            <section style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              padding: 'clamp(2rem, 5vw, 3rem)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              marginBottom: 'clamp(2rem, 5vw, 3rem)'
            }}>
              <h2 style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: 'clamp(1.5rem, 4vw, 2rem)',
                letterSpacing: '-0.01em'
              }}>
                Dokumente verwalten
              </h2>
              <div style={{
                display: 'flex',
                gap: 'clamp(0.75rem, 2vw, 1rem)',
                flexWrap: 'wrap',
                marginBottom: 'clamp(2rem, 5vw, 3rem)'
              }}>
                <button 
                  onClick={() => setShowUploadModal(true)}
                  style={{
                    padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#ffffff',
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
                  + Dokument hochladen
                </button>
                <button 
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.multiple = true
                    input.accept = '.pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,image/*,application/pdf'
                    input.onchange = async (e) => {
                      const files = Array.from((e.target as HTMLInputElement).files || [])
                      if (files.length === 0) return
                      
                      let successCount = 0
                      let errorCount = 0
                      
                      for (const file of files) {
                        try {
                          await handleDocumentUpload(file)
                          successCount++
                        } catch (error) {
                          console.error('Fehler beim Hochladen:', file.name, error)
                          errorCount++
                        }
                      }
                      
                      if (successCount > 0) {
                        alert(`✅ ${successCount} Dokument${successCount > 1 ? 'e' : ''} erfolgreich hochgeladen${errorCount > 0 ? `\n❌ ${errorCount} Fehler` : ''}`)
                      } else {
                        alert(`❌ Fehler beim Hochladen der Dokumente`)
                      }
                    }
                    input.click()
                  }}
                  style={{
                    padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    borderRadius: '12px',
                    fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
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
                  📁 Mehrere Dokumente hochladen
                </button>
                {documents.length === 0 && (
                  <button 
                  onClick={() => {
                    if (confirm('Möchtest du die Beispiel-Dokumente wiederherstellen? Diese sind Platzhalter ohne echte Dateien.')) {
                      const exampleDocs = [
                        {
                          id: 'example-1',
                          name: 'Einladungsfolder',
                          type: 'application/pdf',
                          size: 2400000,
                          data: '',
                          uploadedAt: new Date('2026-02-01').toISOString(),
                          isPDF: true,
                          isPlaceholder: true
                        },
                        {
                          id: 'example-2',
                          name: 'Plakat A4',
                          type: 'application/pdf',
                          size: 1800000,
                          data: '',
                          uploadedAt: new Date('2026-02-02').toISOString(),
                          isPDF: true,
                          isPlaceholder: true
                        },
                        {
                          id: 'example-3',
                          name: 'Presse',
                          type: 'application/pdf',
                          size: 3100000,
                          data: '',
                          uploadedAt: new Date('2026-02-03').toISOString(),
                          isPDF: true,
                          isPlaceholder: true
                        },
                        {
                          id: 'example-4',
                          name: 'Katalog',
                          type: 'application/pdf',
                          size: 5200000,
                          data: '',
                          uploadedAt: new Date('2026-02-04').toISOString(),
                          isPDF: true,
                          isPlaceholder: true
                        }
                      ]
                      saveDocuments(exampleDocs)
                      alert('✅ Beispiel-Dokumente wiederhergestellt!\n\nHinweis: Diese sind Platzhalter. Bitte lade die echten Dokumente hoch, indem du auf die Dokumente klickst und sie durch echte Dateien ersetzt.')
                    }
                  }}
                  style={{ background: '#666' }}
                >
                  📋 Beispiel-Dokumente wiederherstellen
                </button>
              )}
            </div>
            
              {documents.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: 'clamp(3rem, 8vw, 5rem)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '20px'
                }}>
                  <p style={{ fontSize: 'clamp(1.1rem, 3vw, 1.3rem)', color: 'rgba(255, 255, 255, 0.9)' }}>
                    Noch keine Dokumente vorhanden
                  </p>
                  <p style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)', marginTop: '1rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                    Klicke auf "+ Dokument hochladen" um ein Dokument hinzuzufügen.
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'clamp(0.75rem, 2vw, 1rem)'
                }}>
                {documents.map((doc) => {
                  const fileSizeMB = (doc.size / (1024 * 1024)).toFixed(2)
                  const uploadDate = new Date(doc.uploadedAt).toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })
                  
                  let icon = '📄'
                  if (doc.type.startsWith('image/')) icon = '🖼️'
                  else if (doc.type === 'application/pdf') icon = '📋'
                  else if (doc.type.includes('word') || doc.type.includes('document')) icon = '📝'
                  
                  return (
                    <div key={doc.id} className="document-admin-item" style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '1rem',
                      background: '#fff',
                      borderRadius: '8px',
                      marginBottom: '0.5rem',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      <span style={{ fontSize: '2rem', marginRight: '1rem' }}>{icon}</span>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1f1f1f' }}>{doc.name}</h3>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: '#666' }}>
                          {doc.isPlaceholder ? '⚠️ Platzhalter - Bitte Datei hochladen' : `${doc.isPDF ? 'PDF' : doc.type.split('/')[1]?.toUpperCase() || 'DATEI'} • ${fileSizeMB} MB`} • {doc.isPlaceholder ? 'Erstellt' : 'Hochgeladen'}: {uploadDate}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {doc.isPlaceholder ? (
                          <>
                            <button 
                              className="btn-secondary"
                              onClick={() => {
                                const input = document.createElement('input')
                                input.type = 'file'
                                input.accept = '.pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,image/*,application/pdf'
                                input.onchange = async (e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0]
                                  if (file) {
                                    try {
                                      const reader = new FileReader()
                                      reader.onload = (e) => {
                                        const base64 = e.target?.result as string
                                        const updated = documents.map(d => 
                                          d.id === doc.id 
                                            ? { ...d, name: file.name, type: file.type, size: file.size, data: base64, isPDF: file.type === 'application/pdf', isPlaceholder: false }
                                            : d
                                        )
                                        saveDocuments(updated)
                                        alert('✅ Dokument erfolgreich ersetzt!')
                                      }
                                      reader.onerror = () => alert('❌ Fehler beim Laden der Datei')
                                      reader.readAsDataURL(file)
                                    } catch (error) {
                                      alert('❌ Fehler beim Ersetzen')
                                    }
                                  }
                                }
                                input.click()
                              }}
                              style={{ background: '#8b6914', color: '#fff', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              📤 Datei hochladen
                            </button>
                            <button 
                              className="btn-secondary"
                              onClick={() => deleteDocument(doc.id)}
                              style={{ background: '#c33', color: '#fff', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              🗑️ Löschen
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              className="btn-secondary"
                              onClick={() => convertToPDF(doc)}
                              style={{ background: '#8b6914', color: '#fff', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              📄 Zu PDF
                            </button>
                            <button 
                              className="btn-secondary"
                              onClick={() => {
                                const link = document.createElement('a')
                                link.href = doc.data
                                link.download = doc.name
                                link.click()
                              }}
                              style={{ background: '#2d6a2d', color: '#fff', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              ⬇️ Download
                            </button>
                            <button 
                              className="btn-secondary"
                              onClick={() => deleteDocument(doc.id)}
                              style={{ background: '#c33', color: '#fff', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              🗑️ Löschen
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div 
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowUploadModal(false)
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
          >
            <div style={{
              background: '#fff',
              padding: '2rem',
              borderRadius: '12px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <h2 style={{ marginTop: 0 }}>Dokument hochladen</h2>
              <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                Unterstützte Formate: PDF, Bilder (JPG, PNG, etc.), Word-Dokumente
              </p>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,image/*,application/pdf"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    try {
                      await handleDocumentUpload(file)
                      alert('✅ Dokument erfolgreich hochgeladen!')
                      setShowUploadModal(false)
                    } catch (error) {
                      console.error('Upload-Fehler:', error)
                      alert('❌ Fehler beim Hochladen. Bitte versuche es erneut.')
                    }
                  }
                }}
                style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
              />
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => setShowUploadModal(false)}
                  style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', background: '#fff', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        )}

          {/* Stammdaten */}
          {activeTab === 'stammdaten' && (
            <section style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: 'clamp(1.5rem, 3vw, 2rem)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              marginBottom: 'clamp(1.5rem, 3vw, 2rem)'
            }}>
              <h2 style={{
                fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: 'clamp(1rem, 2.5vw, 1.5rem)',
                letterSpacing: '-0.01em'
              }}>
                Stammdaten
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 'clamp(1rem, 2.5vw, 1.5rem)',
                marginBottom: 'clamp(1rem, 2.5vw, 1.5rem)'
              }}>
                {/* Martina */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: 'clamp(1rem, 2.5vw, 1.25rem)',
                  borderRadius: '16px'
                }}>
                  <h3 style={{
                    marginTop: 0,
                    marginBottom: 'clamp(0.75rem, 2vw, 1rem)',
                    fontSize: 'clamp(1rem, 2.5vw, 1.15rem)',
                    fontWeight: '600',
                    color: '#ffffff',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    paddingBottom: '0.5rem'
                  }}>
                    👩‍🎨 Martina
                  </h3>
                  <div className="admin-form" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div className="field">
                      <label style={{ fontSize: '0.85rem' }}>E-Mail</label>
                      <input
                        type="email"
                        value={martinaData.email || ''}
                        onChange={(e) => setMartinaData({ ...martinaData, email: e.target.value })}
                        placeholder="martina@k2-galerie.at"
                        style={{ padding: '0.6rem', fontSize: '0.9rem' }}
                      />
                    </div>
                    <div className="field">
                      <label style={{ fontSize: '0.85rem' }}>Telefon</label>
                      <input
                        type="tel"
                        value={martinaData.phone || ''}
                        onChange={(e) => setMartinaData({ ...martinaData, phone: e.target.value })}
                        placeholder="+43 ..."
                        style={{ padding: '0.6rem', fontSize: '0.9rem' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Georg */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: 'clamp(1rem, 2.5vw, 1.25rem)',
                  borderRadius: '16px'
                }}>
                  <h3 style={{
                    marginTop: 0,
                    marginBottom: 'clamp(0.75rem, 2vw, 1rem)',
                    fontSize: 'clamp(1rem, 2.5vw, 1.15rem)',
                    fontWeight: '600',
                    color: '#ffffff',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    paddingBottom: '0.5rem'
                  }}>
                    👨‍🎨 Georg
                  </h3>
                  <div className="admin-form" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div className="field">
                      <label style={{ fontSize: '0.85rem' }}>E-Mail</label>
                      <input
                        type="email"
                        value={georgData.email || ''}
                        onChange={(e) => setGeorgData({ ...georgData, email: e.target.value })}
                        placeholder="georg@k2-galerie.at"
                        style={{ padding: '0.6rem', fontSize: '0.9rem' }}
                      />
                    </div>
                    <div className="field">
                      <label style={{ fontSize: '0.85rem' }}>Telefon</label>
                      <input
                        type="tel"
                        value={georgData.phone || ''}
                        onChange={(e) => setGeorgData({ ...georgData, phone: e.target.value })}
                        placeholder="+43 ..."
                        style={{ padding: '0.6rem', fontSize: '0.9rem' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Galerie */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: 'clamp(1rem, 2.5vw, 1.25rem)',
                  borderRadius: '16px'
                }}>
                  <h3 style={{
                    marginTop: 0,
                    marginBottom: 'clamp(0.75rem, 2vw, 1rem)',
                    fontSize: 'clamp(1rem, 2.5vw, 1.15rem)',
                    fontWeight: '600',
                    color: '#ffffff',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    paddingBottom: '0.5rem'
                  }}>
                    🏛️ Galerie
                  </h3>
                  <div className="admin-form" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div className="field">
                      <label style={{ fontSize: '0.85rem' }}>Adresse</label>
                      <input
                        type="text"
                        value={galleryData.address || ''}
                        onChange={(e) => setGalleryData({ ...galleryData, address: e.target.value })}
                        placeholder="Straße, PLZ Ort"
                        style={{ padding: '0.6rem', fontSize: '0.9rem' }}
                      />
                    </div>
                    <div className="field">
                      <label style={{ fontSize: '0.85rem' }}>Telefon</label>
                      <input
                        type="tel"
                        value={galleryData.phone || ''}
                        onChange={(e) => setGalleryData({ ...galleryData, phone: e.target.value })}
                        placeholder="+43 ..."
                        style={{ padding: '0.6rem', fontSize: '0.9rem' }}
                      />
                    </div>
                    <div className="field">
                      <label style={{ fontSize: '0.85rem' }}>E-Mail</label>
                      <input
                        type="email"
                        value={galleryData.email || ''}
                        onChange={(e) => setGalleryData({ ...galleryData, email: e.target.value })}
                        placeholder="info@k2-galerie.at"
                        style={{ padding: '0.6rem', fontSize: '0.9rem' }}
                      />
                    </div>
                    <div className="field">
                      <label style={{ fontSize: '0.85rem' }}>Bankverbindung</label>
                      <textarea
                        value={galleryData.bankverbindung || ''}
                        onChange={(e) => setGalleryData({ ...galleryData, bankverbindung: e.target.value })}
                        placeholder="IBAN: AT...&#10;BIC: ...&#10;Bank: ..."
                        rows={4}
                        style={{ 
                          padding: '0.6rem', 
                          fontSize: '0.9rem',
                          fontFamily: 'inherit',
                          resize: 'vertical',
                          minHeight: '80px'
                        }}
                      />
                    </div>
                    <div className="field">
                      <label style={{ fontSize: '0.85rem' }}>Admin-Passwort</label>
                      <input
                        type="password"
                        value={galleryData.adminPassword || 'k2Galerie2026'}
                        onChange={(e) => setGalleryData({ ...galleryData, adminPassword: e.target.value })}
                        placeholder="Admin-Zugangscode"
                        style={{ padding: '0.6rem', fontSize: '0.9rem' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button 
                className="btn-primary" 
                onClick={saveStammdaten}
                style={{
                  padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 3vw, 2rem)',
                  fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                  width: '100%'
                }}
              >
                💾 Speichern
              </button>
            </section>
          )}

        {/* Einstellungen */}
        {activeTab === 'einstellungen' && (
          <section className="admin-section">
            <h2>Einstellungen</h2>
            <div className="settings-grid">
              <div className="settings-card">
                <h3>Galerie-Informationen</h3>
                <div className="field">
                  <label>Galerie-Name</label>
                  <input type="text" defaultValue="K2 Galerie" />
                </div>
                <div className="field">
                  <label>Adresse</label>
                  <input type="text" defaultValue="Schlossergasse 4, 4070 Eferding" />
                </div>
                <div className="field">
                  <label>E-Mail</label>
                  <input type="email" placeholder="kontakt@k2galerie.at" />
                </div>
                <button className="btn-primary">Speichern</button>
              </div>
              <div className="settings-card">
                <h3>Eröffnung</h3>
                <div className="field">
                  <label>Eröffnungswochenende</label>
                  <input type="text" defaultValue="25. - 27. April 2026" />
                </div>
                <div className="field">
                  <label>Öffnungszeiten</label>
                  <textarea defaultValue="Fr ab 14:00 Uhr&#10;Sa & So 10:00-18:00 Uhr" rows={3} />
                </div>
                <button className="btn-primary">Speichern</button>
              </div>
              <div className="settings-card">
                <h3>Verkaufte Werke</h3>
                <div className="field">
                  <label>Anzeige verkaufter Werke</label>
                  <select 
                    defaultValue={localStorage.getItem('k2-sold-display-mode') || 'weeks'}
                    onChange={(e) => {
                      localStorage.setItem('k2-sold-display-mode', e.target.value)
                      alert('Einstellung gespeichert!')
                    }}
                  >
                    <option value="immediate">Sofort in History verschieben</option>
                    <option value="weeks">Noch einige Wochen als "verkauft" markiert anzeigen</option>
                  </select>
                </div>
                <div className="field">
                  <label>Wochen anzeigen (wenn aktiviert)</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="52" 
                    defaultValue={localStorage.getItem('k2-sold-display-weeks') || '4'}
                    onChange={(e) => {
                      localStorage.setItem('k2-sold-display-weeks', e.target.value)
                    }}
                  />
                  <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                    Anzahl Wochen, die verkaufte Werke noch sichtbar bleiben
                  </small>
                </div>
                <button className="btn-primary">Speichern</button>
              </div>
              <div className="settings-card">
                <h3>Design & Branding</h3>
                <div className="field">
                  <label>Primärfarbe</label>
                  <input type="color" defaultValue="#8b6914" />
                </div>
                <div className="field">
                  <label>Logo hochladen</label>
                  <input type="file" accept="image/*" />
                </div>
                <button className="btn-primary">Speichern</button>
              </div>
            </div>
          </section>
        )}

        {/* Statistiken */}
        {activeTab === 'statistiken' && (() => {
          // Echte Statistiken berechnen
          const totalArtworks = allArtworks.length
          const inGalerie = allArtworks.filter((a: any) => a.inExhibition === true).length
          const inShop = allArtworks.filter((a: any) => a.inShop === true).length
          
          // Verkaufte Werke
          let soldCount = 0
          let soldTotal = 0
          try {
            const soldData = localStorage.getItem('k2-sold-artworks')
            if (soldData) {
              const soldArtworks = JSON.parse(soldData)
              soldCount = soldArtworks.length
              // Berechne Gesamtwert der verkauften Werke
              const soldNumbers = new Set(soldArtworks.map((a: any) => a.number))
              const soldItems = allArtworks.filter((a: any) => soldNumbers.has(a.number))
              soldTotal = soldItems.reduce((sum: number, a: any) => sum + (a.price || 0), 0)
            }
          } catch (error) {
            // Ignoriere Fehler
          }

          // Verkäufe aus Orders
          let ordersCount = 0
          let ordersTotal = 0
          try {
            const ordersData = localStorage.getItem('k2-orders')
            if (ordersData) {
              const orders = JSON.parse(ordersData)
              ordersCount = orders.length
              ordersTotal = orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0)
            }
          } catch (error) {
            // Ignoriere Fehler
          }

          // Kategorien
          const malereiCount = allArtworks.filter((a: any) => a.category === 'malerei').length
          const keramikCount = allArtworks.filter((a: any) => a.category === 'keramik').length

          return (
            <section className="admin-section">
              <h2>Statistiken</h2>
              
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">🎨</div>
                  <div className="stat-value">{totalArtworks}</div>
                  <div className="stat-label">Werke insgesamt</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🏛️</div>
                  <div className="stat-value">{inGalerie}</div>
                  <div className="stat-label">In Galerie</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🛒</div>
                  <div className="stat-value">{inShop}</div>
                  <div className="stat-label">Im Shop</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-value">{soldCount}</div>
                  <div className="stat-label">Verkaufte Werke</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">💵</div>
                  <div className="stat-value">€{ordersTotal.toFixed(2)}</div>
                  <div className="stat-label">Umsatz gesamt</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📦</div>
                  <div className="stat-value">{ordersCount}</div>
                  <div className="stat-label">Bestellungen</div>
                </div>
              </div>

              <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {/* Kategorien */}
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ marginTop: 0, color: '#8b6914' }}>Kategorien</h3>
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>Malerei:</span>
                      <strong>{malereiCount}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Keramik:</span>
                      <strong>{keramikCount}</strong>
                    </div>
                  </div>
                </div>

                {/* Verkäufe */}
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ marginTop: 0, color: '#8b6914' }}>Verkäufe</h3>
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>Verkaufte Werke:</span>
                      <strong>{soldCount}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>Gesamtwert:</span>
                      <strong style={{ color: '#2d6a2d' }}>€{soldTotal.toFixed(2)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Bestellungen:</span>
                      <strong>{ordersCount}</strong>
                    </div>
                  </div>
                </div>
              </div>
              {/* Verkaufshistorie */}
              <div style={{ marginTop: '2rem', background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginTop: 0, color: '#8b6914' }}>Letzte Verkäufe</h3>
                <div style={{ marginTop: '1rem' }}>
                  {(() => {
                    try {
                      const ordersData = localStorage.getItem('k2-orders')
                      if (ordersData) {
                        const orders = JSON.parse(ordersData)
                        const recentOrders = orders.slice().reverse().slice(0, 10)
                        
                        if (recentOrders.length === 0) {
                          return <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>Noch keine Verkäufe</p>
                        }
                        
                        return (
                          <div>
                            {recentOrders.map((order: any, index: number) => (
                              <div key={index} style={{ 
                                padding: '1rem', 
                                background: '#f5f5f5', 
                                borderRadius: '8px', 
                                marginBottom: '0.5rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}>
                                <div>
                                  <strong>{order.orderNumber}</strong>
                                  <br />
                                  <small style={{ color: '#666' }}>
                                    {new Date(order.date).toLocaleDateString('de-DE', { 
                                      day: '2-digit', 
                                      month: '2-digit', 
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })} • {order.items.length} {order.items.length === 1 ? 'Werk' : 'Werke'}
                                  </small>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <strong style={{ color: '#2d6a2d' }}>€{order.total.toFixed(2)}</strong>
                                  <br />
                                  <small style={{ color: '#666' }}>
                                    {order.paymentMethod === 'cash' ? '💵 Bar' : order.paymentMethod === 'card' ? '💳 Karte' : '🏦 Überweisung'}
                                  </small>
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      }
                    } catch (error) {
                      // Ignoriere Fehler
                    }
                    return <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>Noch keine Verkäufe</p>
                  })()}
                </div>
              </div>
            </section>
          )
        })()}

        {/* Eventplan */}
        {activeTab === 'eventplan' && (
          <section style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: 'clamp(2rem, 5vw, 3rem)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            marginBottom: 'clamp(2rem, 5vw, 3rem)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'clamp(1.5rem, 4vw, 2rem)',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <h2 style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
                fontWeight: '700',
                color: '#ffffff',
                margin: 0,
                letterSpacing: '-0.01em'
              }}>
                📅 Eventplanung
              </h2>
              <button
                onClick={openEventModal}
                style={{
                  padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
                }}
              >
                + Event hinzufügen
              </button>
            </div>

            {/* Events Liste */}
            {events.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: 'clamp(3rem, 8vw, 5rem)',
                color: '#8fa0c9'
              }}>
                <div style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', marginBottom: '1rem' }}>📅</div>
                <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', margin: 0 }}>
                  Noch keine Events vorhanden
                </p>
                <p style={{ fontSize: 'clamp(0.85rem, 2vw, 1rem)', marginTop: '0.5rem', opacity: 0.7 }}>
                  Klicke auf "Event hinzufügen" um zu beginnen
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gap: 'clamp(1rem, 3vw, 1.5rem)',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
              }}>
                {events.map((event) => {
                  const eventIcons: Record<string, string> = {
                    galerieeröffnung: '🎉',
                    vernissage: '🍷',
                    finissage: '👋',
                    öffentlichkeitsarbeit: '📢',
                    sonstiges: '📌'
                  }
                  const eventLabels: Record<string, string> = {
                    galerieeröffnung: 'Galerieeröffnung',
                    vernissage: 'Vernissage',
                    finissage: 'Finissage',
                    öffentlichkeitsarbeit: 'Öffentlichkeitsarbeit',
                    sonstiges: 'Sonstiges'
                  }
                  
                  return (
                    <div
                      key={event.id}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '16px',
                        padding: 'clamp(1rem, 3vw, 1.5rem)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '1rem'
                      }}>
                        <div>
                          <div style={{
                            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                            marginBottom: '0.5rem'
                          }}>
                            {eventIcons[event.type] || '📌'}
                          </div>
                          <h3 style={{
                            fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
                            fontWeight: '600',
                            color: '#ffffff',
                            margin: '0 0 0.5rem 0'
                          }}>
                            {event.title}
                          </h3>
                          <div style={{
                            fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                            color: '#8fa0c9',
                            background: 'rgba(102, 126, 234, 0.2)',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '6px',
                            display: 'inline-block',
                            marginBottom: '0.5rem'
                          }}>
                            {eventLabels[event.type] || event.type}
                          </div>
                        </div>
                      </div>
                      
                      <div style={{
                        fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                        color: '#b8c5e0',
                        marginBottom: '0.75rem'
                      }}>
                        <div style={{ marginBottom: '0.25rem' }}>
                          <strong>📅 Datum:</strong> {
                            event.endDate && event.endDate !== event.date
                              ? `${new Date(event.date).toLocaleDateString('de-DE', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })} - ${new Date(event.endDate).toLocaleDateString('de-DE', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}`
                              : new Date(event.date).toLocaleDateString('de-DE', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })
                          }
                        </div>
                        {(event.startTime || event.endTime || event.time || (event.dailyTimes && Object.keys(event.dailyTimes).length > 0)) && (
                          <div style={{ marginBottom: '0.25rem' }}>
                            <strong>🕐 Uhrzeit:</strong> {
                              (() => {
                                const startTime = event.startTime || event.time || ''
                                const endTime = event.endTime || ''
                                const isMultiDay = event.endDate && event.endDate !== event.date
                                const hasDailyTimes = event.dailyTimes && Object.keys(event.dailyTimes).length > 0
                                
                                if (hasDailyTimes && isMultiDay) {
                                  // Zeige tägliche Zeiten
                                  const days = getEventDays(event.date, event.endDate)
                                  return (
                                    <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                      {days.map((day) => {
                                        const dayTime = event.dailyTimes[day]
                                        if (!dayTime) return null
                                        const dayLabel = new Date(day).toLocaleDateString('de-DE', {
                                          weekday: 'short',
                                          day: 'numeric',
                                          month: 'short'
                                        })
                                        return (
                                          <div key={day} style={{ fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>
                                            {dayLabel}: {dayTime} Uhr
                                          </div>
                                        )
                                      })}
                                    </div>
                                  )
                                } else if (isMultiDay) {
                                  // Mehrere Tage ohne tägliche Zeiten: Zeige Startzeit für ersten Tag und Endzeit für letzten Tag
                                  return startTime && endTime 
                                    ? `${startTime} Uhr (${new Date(event.date).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}) - ${endTime} Uhr (${new Date(event.endDate).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })})`
                                    : startTime 
                                    ? `${startTime} Uhr (${new Date(event.date).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })})`
                                    : ''
                                } else {
                                  // Ein Tag: Zeige Start- und Endzeit
                                  return startTime && endTime 
                                    ? `${startTime} - ${endTime} Uhr`
                                    : startTime 
                                    ? `${startTime} Uhr`
                                    : ''
                                }
                              })()
                            }
                          </div>
                        )}
                        {event.location && (
                          <div style={{ marginBottom: '0.25rem' }}>
                            <strong>📍 Ort:</strong> {event.location}
                          </div>
                        )}
                        {event.description && (
                          <div style={{ marginTop: '0.75rem', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>
                            {event.description}
                          </div>
                        )}
                      </div>

                      {/* Dokumente */}
                      {(event.documents && event.documents.length > 0) && (
                        <div style={{
                          marginTop: '1rem',
                          padding: '0.75rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '8px',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                          <div style={{
                            fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                            fontWeight: '600',
                            color: '#ffffff',
                            marginBottom: '0.5rem'
                          }}>
                            📎 Dokumente ({event.documents.length})
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {event.documents.map((doc: any) => {
                              const docIcons: Record<string, string> = {
                                flyer: '📄',
                                plakat: '🖼️',
                                presseaussendung: '📰',
                                sonstiges: '📎'
                              }
                              return (
                                <div
                                  key={doc.id}
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '0.5rem',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    borderRadius: '6px'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                    <span>{docIcons[doc.type] || '📎'}</span>
                                    <span
                                      onClick={() => handleViewEventDocument(doc)}
                                      style={{
                                        fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                                        color: '#5ffbf1',
                                        cursor: 'pointer',
                                        textDecoration: 'underline'
                                      }}
                                    >
                                      {doc.name}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => handleDeleteEventDocument(event.id, doc.id)}
                                    style={{
                                      padding: '0.25rem 0.5rem',
                                      background: 'rgba(255, 100, 100, 0.2)',
                                      border: '1px solid rgba(255, 100, 100, 0.3)',
                                      borderRadius: '4px',
                                      color: '#ff6464',
                                      cursor: 'pointer',
                                      fontSize: 'clamp(0.75rem, 2vw, 0.85rem)'
                                    }}
                                  >
                                    ×
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        marginTop: '1rem',
                        flexWrap: 'wrap'
                      }}>
                        <button
                          onClick={() => handleEditEvent(event)}
                          style={{
                            flex: 1,
                            minWidth: '120px',
                            padding: '0.75rem',
                            background: 'rgba(102, 126, 234, 0.2)',
                            border: '1px solid rgba(102, 126, 234, 0.3)',
                            borderRadius: '8px',
                            color: '#ffffff',
                            cursor: 'pointer',
                            fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                            fontWeight: '500'
                          }}
                        >
                          ✏️ Bearbeiten
                        </button>
                        <button
                          onClick={() => {
                            setSelectedEventForDocument(event.id)
                            setShowDocumentModal(true)
                          }}
                          style={{
                            flex: 1,
                            minWidth: '120px',
                            padding: '0.75rem',
                            background: 'rgba(95, 251, 241, 0.2)',
                            border: '1px solid rgba(95, 251, 241, 0.3)',
                            borderRadius: '8px',
                            color: '#5ffbf1',
                            cursor: 'pointer',
                            fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                            fontWeight: '500'
                          }}
                        >
                          📎 Dokument
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          style={{
                            flex: 1,
                            minWidth: '120px',
                            padding: '0.75rem',
                            background: 'rgba(255, 100, 100, 0.2)',
                            border: '1px solid rgba(255, 100, 100, 0.3)',
                            borderRadius: '8px',
                            color: '#ff6464',
                            cursor: 'pointer',
                            fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                            fontWeight: '500'
                          }}
                        >
                          🗑️ Löschen
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )}

        {/* Event Modal */}
        {showEventModal && (
          <div
            onClick={() => setShowEventModal(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(10px)',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                borderRadius: '24px',
                padding: 'clamp(2rem, 5vw, 3rem)',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
              }}
            >
              <h2 style={{
                fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                fontWeight: '700',
                color: '#ffffff',
                marginTop: 0,
                marginBottom: 'clamp(1.5rem, 4vw, 2rem)'
              }}>
                {editingEvent ? 'Event bearbeiten' : 'Neues Event hinzufügen'}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#8fa0c9',
                    fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                    fontWeight: '500'
                  }}>
                    Titel *
                  </label>
                  <input
                    type="text"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="z.B. Eröffnung der K2 Galerie"
                    style={{
                      width: '100%',
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#8fa0c9',
                    fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                    fontWeight: '500'
                  }}>
                    Event-Typ
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)'
                    }}
                  >
                    <option value="galerieeröffnung">🎉 Galerieeröffnung</option>
                    <option value="vernissage">🍷 Vernissage</option>
                    <option value="finissage">👋 Finissage</option>
                    <option value="öffentlichkeitsarbeit">📢 Öffentlichkeitsarbeit</option>
                    <option value="sonstiges">📌 Sonstiges</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#8fa0c9',
                      fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                      fontWeight: '500'
                    }}>
                      Startdatum *
                    </label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: 'clamp(0.75rem, 2vw, 1rem)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#8fa0c9',
                      fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                      fontWeight: '500'
                    }}>
                      Enddatum
                    </label>
                    <input
                      type="date"
                      value={eventEndDate}
                      onChange={(e) => setEventEndDate(e.target.value)}
                      min={eventDate}
                      style={{
                        width: '100%',
                        padding: 'clamp(0.75rem, 2vw, 1rem)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#8fa0c9',
                      fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                      fontWeight: '500'
                    }}>
                      Startzeit
                    </label>
                    <input
                      type="time"
                      value={eventStartTime}
                      onChange={(e) => setEventStartTime(e.target.value)}
                      style={{
                        width: '100%',
                        padding: 'clamp(0.75rem, 2vw, 1rem)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#8fa0c9',
                      fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                      fontWeight: '500'
                    }}>
                      Endzeit
                    </label>
                    <input
                      type="time"
                      value={eventEndTime}
                      onChange={(e) => setEventEndTime(e.target.value)}
                      style={{
                        width: '100%',
                        padding: 'clamp(0.75rem, 2vw, 1rem)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)'
                      }}
                    />
                  </div>
                </div>

                {/* Tägliche Zeiten für mehrtägige Events */}
                {eventDate && eventEndDate && eventEndDate !== eventDate && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    background: 'rgba(95, 251, 241, 0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(95, 251, 241, 0.2)'
                  }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.75rem',
                      color: '#5ffbf1',
                      fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                      fontWeight: '600'
                    }}>
                      🕐 Startzeiten für jeden Tag (optional)
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {getEventDays(eventDate, eventEndDate).map((day) => {
                        const dayLabel = new Date(day).toLocaleDateString('de-DE', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                        })
                        return (
                          <div key={day} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{
                              minWidth: '100px',
                              fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                              color: '#b8c5e0'
                            }}>
                              {dayLabel}:
                            </span>
                            <input
                              type="time"
                              value={eventDailyTimes[day] || ''}
                              onChange={(e) => setEventDailyTimes({
                                ...eventDailyTimes,
                                [day]: e.target.value
                              })}
                              placeholder="Optional"
                              style={{
                                flex: 1,
                                padding: 'clamp(0.6rem, 1.5vw, 0.75rem)',
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '8px',
                                color: '#ffffff',
                                fontSize: 'clamp(0.9rem, 2.5vw, 1rem)'
                              }}
                            />
                            {eventDailyTimes[day] && (
                              <button
                                onClick={() => {
                                  const newDailyTimes = { ...eventDailyTimes }
                                  delete newDailyTimes[day]
                                  setEventDailyTimes(newDailyTimes)
                                }}
                                style={{
                                  padding: '0.4rem 0.6rem',
                                  background: 'rgba(255, 100, 100, 0.2)',
                                  border: '1px solid rgba(255, 100, 100, 0.3)',
                                  borderRadius: '6px',
                                  color: '#ff6464',
                                  cursor: 'pointer',
                                  fontSize: 'clamp(0.75rem, 2vw, 0.85rem)'
                                }}
                              >
                                ×
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    <label style={{
                      color: '#8fa0c9',
                      fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                      fontWeight: '500'
                    }}>
                      Ort
                    </label>
                    <button
                      type="button"
                      onClick={applyStammdatenToEvent}
                      style={{
                        padding: '0.4rem 0.75rem',
                        background: 'rgba(95, 251, 241, 0.2)',
                        border: '1px solid rgba(95, 251, 241, 0.3)',
                        borderRadius: '6px',
                        color: '#5ffbf1',
                        cursor: 'pointer',
                        fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
                        fontWeight: '500'
                      }}
                    >
                      📋 Aus Stammdaten übernehmen
                    </button>
                  </div>
                  <input
                    type="text"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder={galleryData.address || "z.B. K2 Galerie, Hauptstraße 1"}
                    style={{
                      width: '100%',
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)'
                    }}
                  />
                  {galleryData.address && (
                    <div style={{
                      marginTop: '0.25rem',
                      fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
                      color: '#8fa0c9',
                      fontStyle: 'italic'
                    }}>
                      Stammdaten: {galleryData.address}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#8fa0c9',
                    fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                    fontWeight: '500'
                  }}>
                    Beschreibung
                  </label>
                  <textarea
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    placeholder="Weitere Details zum Event..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  marginTop: '1rem'
                }}>
                  <button
                    onClick={handleSaveEvent}
                    style={{
                      flex: 1,
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
                    }}
                  >
                    {editingEvent ? '✅ Aktualisieren' : '✅ Hinzufügen'}
                  </button>
                  <button
                    onClick={() => {
                      setShowEventModal(false)
                      setEditingEvent(null)
                      setEventTitle('')
                      setEventType('galerieeröffnung')
                      setEventDate('')
                      setEventEndDate('')
                      setEventTime('')
                      setEventDescription('')
                      setEventLocation('')
                    }}
                    style={{
                      flex: 1,
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dokumente Modal */}
        {showDocumentModal && selectedEventForDocument && (
          <div
            onClick={() => {
              setShowDocumentModal(false)
              setSelectedEventForDocument(null)
              setEventDocumentFile(null)
              setEventDocumentName('')
              setEventDocumentType('flyer')
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(10px)',
              zIndex: 10001,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                borderRadius: '24px',
                padding: 'clamp(2rem, 5vw, 3rem)',
                maxWidth: '500px',
                width: '100%',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
              }}
            >
              <h2 style={{
                fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                fontWeight: '700',
                color: '#ffffff',
                marginTop: 0,
                marginBottom: 'clamp(1.5rem, 4vw, 2rem)'
              }}>
                📎 Dokument hinzufügen
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#8fa0c9',
                    fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                    fontWeight: '500'
                  }}>
                    Dokument-Name *
                  </label>
                  <input
                    type="text"
                    value={eventDocumentName}
                    onChange={(e) => setEventDocumentName(e.target.value)}
                    placeholder="z.B. Flyer Eröffnung"
                    style={{
                      width: '100%',
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#8fa0c9',
                    fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                    fontWeight: '500'
                  }}>
                    Dokument-Typ
                  </label>
                  <select
                    value={eventDocumentType}
                    onChange={(e) => setEventDocumentType(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)'
                    }}
                  >
                    <option value="flyer">📄 Flyer</option>
                    <option value="plakat">🖼️ Plakat</option>
                    <option value="presseaussendung">📰 Presseaussendung</option>
                    <option value="sonstiges">📎 Sonstiges</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#8fa0c9',
                    fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                    fontWeight: '500'
                  }}>
                    Datei auswählen *
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setEventDocumentFile(file)
                        if (!eventDocumentName) {
                          setEventDocumentName(file.name.replace(/\.[^/.]+$/, ''))
                        }
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)'
                    }}
                  />
                  {eventDocumentFile && (
                    <div style={{
                      marginTop: '0.5rem',
                      fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                      color: '#5ffbf1'
                    }}>
                      ✓ {eventDocumentFile.name} ({(eventDocumentFile.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  )}
                </div>

                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  marginTop: '1rem'
                }}>
                  <button
                    onClick={handleAddEventDocument}
                    style={{
                      flex: 1,
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
                    }}
                  >
                    ✅ Hinzufügen
                  </button>
                  <button
                    onClick={() => {
                      setShowDocumentModal(false)
                      setSelectedEventForDocument(null)
                      setEventDocumentFile(null)
                      setEventDocumentName('')
                      setEventDocumentType('flyer')
                    }}
                    style={{
                      flex: 1,
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Öffentlichkeitsarbeit */}
        {activeTab === 'öffentlichkeitsarbeit' && (
          <section style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: 'clamp(2rem, 5vw, 3rem)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            marginBottom: 'clamp(2rem, 5vw, 3rem)'
          }}>
            <h2 style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
              fontWeight: '700',
              color: '#ffffff',
              marginTop: 0,
              marginBottom: 'clamp(1.5rem, 4vw, 2rem)',
              letterSpacing: '-0.01em'
            }}>
              📢 Öffentlichkeitsarbeit
            </h2>

            {/* Automatische Vorschläge für Events */}
            {(() => {
              const suggestions = JSON.parse(localStorage.getItem('k2-pr-suggestions') || '[]')
              const latestSuggestions = suggestions.slice(-3).reverse() // Letzte 3 Events
              
              if (latestSuggestions.length > 0) {
                return (
                  <div style={{
                    marginBottom: 'clamp(2rem, 5vw, 3rem)',
                    padding: 'clamp(1.5rem, 4vw, 2rem)',
                    background: 'linear-gradient(135deg, rgba(95, 251, 241, 0.1) 0%, rgba(102, 126, 234, 0.1) 100%)',
                    border: '1px solid rgba(95, 251, 241, 0.2)',
                    borderRadius: '16px'
                  }}>
                    <h3 style={{
                      fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
                      fontWeight: '600',
                      color: '#5ffbf1',
                      margin: '0 0 1rem 0'
                    }}>
                      ✨ Automatische Vorschläge für neue Events
                    </h3>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem'
                    }}>
                      {latestSuggestions.map((suggestion: any, idx: number) => (
                        <div
                          key={idx}
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            padding: '1rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                            e.currentTarget.style.transform = 'translateX(4px)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                            e.currentTarget.style.transform = 'translateX(0)'
                          }}
                          onClick={() => {
                            // Event auswählen und Vorschläge anzeigen
                            const event = events.find(e => e.id === suggestion.eventId)
                            if (event) {
                              handleEditEvent(event)
                              setActiveTab('öffentlichkeitsarbeit')
                            }
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '0.5rem'
                          }}>
                            <strong style={{ color: '#ffffff', fontSize: 'clamp(1rem, 2.5vw, 1.1rem)' }}>
                              {suggestion.eventTitle}
                            </strong>
                            <span style={{
                              fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
                              color: '#8fa0c9'
                            }}>
                              {new Date(suggestion.generatedAt).toLocaleDateString('de-DE')}
                            </span>
                          </div>
                          <div style={{
                            display: 'flex',
                            gap: '0.5rem',
                            flexWrap: 'wrap',
                            fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                            color: '#b8c5e0'
                          }}>
                            <span>📰 Presse</span>
                            <span>📱 Social</span>
                            <span>📄 Flyer</span>
                            <span>📧 Newsletter</span>
                            <span>🖼️ Plakat</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }
              return null
            })()}

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 'clamp(1rem, 3vw, 1.5rem)',
              marginBottom: 'clamp(2rem, 5vw, 3rem)'
            }}>
              {/* Presseaussendung */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: 'clamp(1.5rem, 4vw, 2rem)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={() => generatePresseaussendung()}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                e.currentTarget.style.transform = 'translateY(-4px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
              >
                <div style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', marginBottom: '1rem' }}>📰</div>
                <h3 style={{
                  fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
                  fontWeight: '600',
                  color: '#ffffff',
                  margin: '0 0 0.5rem 0'
                }}>
                  Presseaussendung
                </h3>
                <p style={{
                  fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                  color: '#8fa0c9',
                  margin: 0,
                  lineHeight: '1.6'
                }}>
                  Professionelle Presseaussendung aus Event-Daten generieren
                </p>
              </div>

              {/* Social Media Posts */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: 'clamp(1.5rem, 4vw, 2rem)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={() => generateSocialMediaPosts()}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                e.currentTarget.style.transform = 'translateY(-4px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
              >
                <div style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', marginBottom: '1rem' }}>📱</div>
                <h3 style={{
                  fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
                  fontWeight: '600',
                  color: '#ffffff',
                  margin: '0 0 0.5rem 0'
                }}>
                  Social Media Posts
                </h3>
                <p style={{
                  fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                  color: '#8fa0c9',
                  margin: 0,
                  lineHeight: '1.6'
                }}>
                  Instagram & Facebook Posts mit Bildern generieren
                </p>
              </div>

              {/* Event-Flyer */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: 'clamp(1.5rem, 4vw, 2rem)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={() => generateEventFlyer()}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                e.currentTarget.style.transform = 'translateY(-4px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
              >
                <div style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', marginBottom: '1rem' }}>📄</div>
                <h3 style={{
                  fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
                  fontWeight: '600',
                  color: '#ffffff',
                  margin: '0 0 0.5rem 0'
                }}>
                  Event-Flyer
                </h3>
                <p style={{
                  fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                  color: '#8fa0c9',
                  margin: 0,
                  lineHeight: '1.6'
                }}>
                  Flyer mit QR-Code für Events erstellen
                </p>
              </div>

              {/* E-Mail-Newsletter */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: 'clamp(1.5rem, 4vw, 2rem)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={() => generateEmailNewsletter()}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                e.currentTarget.style.transform = 'translateY(-4px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
              >
                <div style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', marginBottom: '1rem' }}>📧</div>
                <h3 style={{
                  fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
                  fontWeight: '600',
                  color: '#ffffff',
                  margin: '0 0 0.5rem 0'
                }}>
                  E-Mail-Newsletter
                </h3>
                <p style={{
                  fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                  color: '#8fa0c9',
                  margin: 0,
                  lineHeight: '1.6'
                }}>
                  Event-Einladungen als HTML-Newsletter
                </p>
              </div>

              {/* Plakate */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: 'clamp(1.5rem, 4vw, 2rem)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={() => generatePlakat()}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                e.currentTarget.style.transform = 'translateY(-4px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
              >
                <div style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', marginBottom: '1rem' }}>🖼️</div>
                <h3 style={{
                  fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
                  fontWeight: '600',
                  color: '#ffffff',
                  margin: '0 0 0.5rem 0'
                }}>
                  Plakate
                </h3>
                <p style={{
                  fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                  color: '#8fa0c9',
                  margin: 0,
                  lineHeight: '1.6'
                }}>
                  Druckfertige Plakate für Events (A3/A4)
                </p>
              </div>

              {/* Pressemappe */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: 'clamp(1.5rem, 4vw, 2rem)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={() => generatePressemappe()}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                e.currentTarget.style.transform = 'translateY(-4px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
              >
                <div style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', marginBottom: '1rem' }}>📋</div>
                <h3 style={{
                  fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
                  fontWeight: '600',
                  color: '#ffffff',
                  margin: '0 0 0.5rem 0'
                }}>
                  Pressemappe
                </h3>
                <p style={{
                  fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                  color: '#8fa0c9',
                  margin: 0,
                  lineHeight: '1.6'
                }}>
                  Komplette Pressemappe als PDF
                </p>
              </div>

              {/* Website-Content */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: 'clamp(1.5rem, 4vw, 2rem)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={() => generateWebsiteContent()}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                e.currentTarget.style.transform = 'translateY(-4px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
              >
                <div style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', marginBottom: '1rem' }}>🌐</div>
                <h3 style={{
                  fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
                  fontWeight: '600',
                  color: '#ffffff',
                  margin: '0 0 0.5rem 0'
                }}>
                  Website-Content
                </h3>
                <p style={{
                  fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                  color: '#8fa0c9',
                  margin: 0,
                  lineHeight: '1.6'
                }}>
                  Event-Seiten & News-Content generieren
                </p>
              </div>

              {/* Katalog */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: 'clamp(1.5rem, 4vw, 2rem)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={() => generateKatalog()}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                e.currentTarget.style.transform = 'translateY(-4px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
              >
                <div style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', marginBottom: '1rem' }}>📚</div>
                <h3 style={{
                  fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
                  fontWeight: '600',
                  color: '#ffffff',
                  margin: '0 0 0.5rem 0'
                }}>
                  Katalog
                </h3>
                <p style={{
                  fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                  color: '#8fa0c9',
                  margin: 0,
                  lineHeight: '1.6'
                }}>
                  Werke-Katalog als PDF erstellen
                </p>
              </div>
            </div>
          </section>
        )}
        </main>
      </div>

      {/* Kamera-Vollbild-Ansicht */}
      {showCameraView && (
        <div 
          onClick={closeCamera}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: '#000',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              bottom: '2rem',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              zIndex: 10001
            }}
          >
            <button
              onClick={closeCamera}
              style={{
                padding: '1rem 2rem',
                background: '#dc2626',
                color: '#fff',
                border: 'none',
                borderRadius: '50px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                zIndex: 10002
              }}
            >
              Abbrechen
            </button>
            <button
              onClick={takePicture}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: '#fff',
                border: '4px solid #333',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                zIndex: 10002
              }}
            >
              📸
            </button>
          </div>
          
          {/* X-Button oben rechts */}
          <button
            onClick={closeCamera}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              zIndex: 10002,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>
      )}


      {/* Modal: Neues Werk hinzufügen */}
      {showAddModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Neues Werk hinzufügen</h2>
              <button className="admin-modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <div className="admin-modal-content">
              {/* Bild-Upload Bereich */}
              <div className="upload-area">
                {previewUrl ? (
                  <div className="upload-preview">
                    <img src={previewUrl} alt="Vorschau" />
                    <button 
                      className="btn-secondary" 
                      onClick={() => {
                        setSelectedFile(null)
                        setPreviewUrl(null)
                      }}
                    >
                      Bild ändern
                    </button>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <div className="upload-icon">📷</div>
                    <p>Foto aufnehmen oder Datei hochladen</p>
                    <div className="upload-buttons">
                      <label htmlFor="file-input-upload" className="btn-primary" style={{ cursor: 'pointer' }}>
                        📁 Datei auswählen
                      </label>
                      <input
                        id="file-input-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                      />
                      <input
                        id="camera-input-direct"
                        type="file"
                        accept="image/*"
                        capture
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={handleCameraClick}
                        style={{ cursor: 'pointer', margin: 0 }}
                      >
                        📸 Kamera öffnen
                      </button>
                    </div>
                    <p className="upload-hint">
                      Auf iPhone/iPad: Kamera-Button öffnet die Kamera direkt
                    </p>
                  </div>
                )}
              </div>

              {/* Formular */}
              <div className="admin-form">
                <div className="field">
                  <label>Titel des Werks *</label>
                  <input
                    type="text"
                    value={artworkTitle}
                    onChange={(e) => setArtworkTitle(e.target.value)}
                    placeholder="z.B. Frühlingslandschaft"
                  />
                </div>
                <div className="field">
                  <label>Kategorie *</label>
                  <select
                    value={artworkCategory}
                    onChange={(e) => setArtworkCategory(e.target.value as 'malerei' | 'keramik')}
                  >
                    <option value="malerei">Malerei</option>
                    <option value="keramik">Keramik</option>
                  </select>
                </div>
                <div className="field">
                  <label>Künstler (optional)</label>
                  <input
                    type="text"
                    value={artworkArtist}
                    onChange={(e) => setArtworkArtist(e.target.value)}
                    placeholder={artworkCategory === 'malerei' ? 'Martina Kreinecker' : 'Georg Kreinecker'}
                  />
                  <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                    {artworkCategory === 'malerei' 
                      ? 'Vorgeschlagen: Martina Kreinecker' 
                      : 'Vorgeschlagen: Georg Kreinecker'}
                  </small>
                </div>
                <div className="field">
                  <label>Preis (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={artworkPrice}
                    onChange={(e) => setArtworkPrice(e.target.value)}
                    placeholder="0.00"
                    style={{ fontSize: '1.1rem' }}
                  />
                  <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                    Preis in Euro (z.B. 250.00)
                  </small>
                </div>
                <div className="field">
                  <label>Beschreibung</label>
                  <textarea
                    value={artworkDescription}
                    onChange={(e) => setArtworkDescription(e.target.value)}
                    placeholder="Optionale Beschreibung des Werks..."
                    rows={4}
                  />
                </div>
                
                {/* Verfügbarkeit */}
                <div className="field">
                  <label>Verfügbarkeit</label>
                  <div className="checkbox-group">
                    <label className="checkbox-label" style={{ opacity: 0.6, cursor: 'default' }}>
                      <input
                        type="checkbox"
                        checked={true}
                        disabled
                      />
                      <span>Teil der Ausstellung (immer aktiv)</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={isInShop}
                        onChange={(e) => setIsInShop(e.target.checked)}
                      />
                      <span>Im Online-Shop verfügbar</span>
                    </label>
                  </div>
                  <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.5rem', display: 'block' }}>
                    Alle Werke sind automatisch Teil der Ausstellung. Optional können sie auch im Online-Shop verkauft werden.
                  </small>
                </div>
              </div>

              {/* Aktionen */}
              <div className="admin-modal-actions">
                <button className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Abbrechen
                </button>
                <button className="btn-primary" onClick={handleSaveArtwork}>
                  Werk speichern
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Druck-Modal */}
      {showPrintModal && savedArtwork && (
        <div className="admin-modal-overlay" onClick={() => setShowPrintModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="admin-modal-header">
              <h2>Etikett drucken</h2>
              <button className="admin-modal-close" onClick={() => setShowPrintModal(false)}>×</button>
            </div>
            <div className="admin-modal-content">
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#8b6914', marginBottom: '1rem' }}>
                  Werk erfolgreich angelegt!
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                  {savedArtwork.number}
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <strong>{savedArtwork.title}</strong>
                </div>
                <div style={{ marginBottom: '2rem' }}>
                  <img 
                    src={getQRCodeUrl(savedArtwork.number)} 
                    alt="QR Code" 
                    style={{ width: '200px', height: '200px', border: '1px solid #ddd', borderRadius: '8px' }}
                  />
                </div>
                <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
                  <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>
                    <strong>Kategorie:</strong> {savedArtwork.category === 'malerei' ? 'Malerei' : 'Keramik'}
                  </p>
                  <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>
                    <strong>Künstler:</strong> {savedArtwork.artist}
                  </p>
                  {savedArtwork.inExhibition && (
                    <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: '#8b6914' }}>
                      ✓ Teil der Ausstellung
                    </p>
                  )}
                  {savedArtwork.inShop && (
                    <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: '#8b6914' }}>
                      ✓ Im Online-Shop verfügbar
                    </p>
                  )}
                </div>
                <div className="admin-modal-actions">
                  <button className="btn-secondary" onClick={() => setShowPrintModal(false)}>
                    Später drucken
                  </button>
                  <button className="btn-primary" onClick={handlePrint}>
                    🖨️ Jetzt drucken
                  </button>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '1rem' }}>
                  Wähle einen Drucker: Etikettendrucker oder Standarddrucker
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verkaufs-Modal */}
      {showSaleModal && (
        <div className="admin-modal-overlay" onClick={() => setShowSaleModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="admin-modal-header">
              <h2>Werk als verkauft markieren</h2>
              <button className="admin-modal-close" onClick={() => setShowSaleModal(false)}>×</button>
            </div>
            <div className="admin-modal-content">
              {/* Methode wählen */}
              <div className="field" style={{ marginBottom: '1.5rem' }}>
                <label>Methode</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    className={saleMethod === 'scan' ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setSaleMethod('scan')}
                    style={{ flex: 1 }}
                  >
                    📷 QR-Code scannen
                  </button>
                  <button
                    className={saleMethod === 'manual' ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setSaleMethod('manual')}
                    style={{ flex: 1 }}
                  >
                    ⌨️ Seriennummer eingeben
                  </button>
                </div>
              </div>

              {/* QR-Code Scanner */}
              {saleMethod === 'scan' && (
                <div className="scan-area">
                  <div className="upload-placeholder" style={{ padding: '2rem' }}>
                    <div className="upload-icon">📷</div>
                    <p>QR-Code mit Kamera scannen</p>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          // QR-Code aus Bild lesen
                          const qrText = await readQRCodeFromImage(file)
                          if (qrText) {
                            // QR-Code enthält Werk-Nummer oder URL
                            const match = qrText.match(/K2-\d{4}/) || qrText.match(/werk=([^&]+)/)
                            if (match) {
                              const artworkNum = match[1] || match[0]
                              handleMarkAsSold(artworkNum)
                            } else {
                              alert('QR-Code konnte nicht gelesen werden. Bitte Seriennummer manuell eingeben.')
                              setSaleMethod('manual')
                            }
                          } else {
                            // Fallback: Manuelle Eingabe
                            alert('QR-Code-Scan: Bitte Seriennummer manuell eingeben.\n\nFormat: K2-0001')
                            setSaleMethod('manual')
                          }
                        }
                      }}
                      style={{ display: 'none' }}
                      id="qr-scanner-input"
                    />
                    <label htmlFor="qr-scanner-input" className="btn-primary" style={{ marginTop: '1rem', cursor: 'pointer' }}>
                      📷 Kamera öffnen
                    </label>
                    <p className="upload-hint" style={{ marginTop: '1rem' }}>
                      Auf iPhone/iPad: Kamera öffnet sich automatisch
                    </p>
                  </div>
                </div>
              )}

              {/* Seriennummer Eingabe */}
              {saleMethod === 'manual' && (
                <div className="field">
                  <label>Seriennummer eingeben</label>
                  <input
                    type="text"
                    value={saleInput}
                    onChange={(e) => setSaleInput(e.target.value.toUpperCase())}
                    placeholder="z.B. K2-0001"
                    style={{ fontSize: '1.2rem', textAlign: 'center', letterSpacing: '0.1em' }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && saleInput.trim()) {
                        handleMarkAsSold(saleInput.trim())
                      }
                    }}
                  />
                  <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.5rem', display: 'block' }}>
                    Format: K2-0001, K2-0002, etc.
                  </small>
                </div>
              )}

              {/* Aktionen */}
              <div className="admin-modal-actions">
                <button className="btn-secondary" onClick={() => {
                  setShowSaleModal(false)
                  setSaleInput('')
                  setSaleMethod('scan')
                }}>
                  Abbrechen
                </button>
                {saleMethod === 'manual' && saleInput.trim() && (
                  <button className="btn-primary" onClick={() => handleMarkAsSold(saleInput.trim())}>
                    Als verkauft markieren
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ScreenshotExportAdmin
export { ScreenshotExportAdmin }
