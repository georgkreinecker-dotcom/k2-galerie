import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { PROJECT_ROUTES, WILLKOMMEN_NAME_KEY, WILLKOMMEN_ENTWURF_KEY } from '../config/navigation'
import { MUSTER_ARTWORKS, ARTWORK_CATEGORIES, getCategoryLabel, getCategoryPrefixLetter, getOek2DefaultArtworkImage, OEK2_PLACEHOLDER_IMAGE, SEED_VK2_ARTISTS, type ArtworkCategoryId } from '../config/tenantConfig'
import { 
  syncMobileToSupabase, 
  checkMobileUpdates, 
  saveArtworksToSupabase,
  loadArtworksFromSupabase,
  isSupabaseConfigured
} from '../utils/supabaseClient'
import { sortArtworksNewestFirst } from '../utils/artworkSort'
import { appendToHistory } from '../utils/artworkHistory'
import { tryFreeLocalStorageSpace, SPEICHER_VOLL_MELDUNG } from '../../components/SafeMode'
// Fotos für neue Werke nur im Admin (Neues Werk hinzufügen) – dort Option Freistellen/Original
import '../App.css'

// Einfache localStorage-Funktion (K2 = k2-artworks)
function loadArtworks(): any[] {
  try {
    const stored = localStorage.getItem('k2-artworks')
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Fehler beim Laden:', error)
    return []
  }
}

/** Nummern der Seed-Musterwerke (ök2) – dürfen nie in K2-Galerie oder Backup landen. */
const MUSTER_NUMMERN = new Set(['M1', 'M2', 'M3', 'M4', 'M5', 'G1', 'S1', 'O1'])

/** Musterwerke (id muster-*, Muster-Nummern) und VK2 – gehören nicht in K2.
 *  AUSNAHME: _isMuster=true = bewusst geladene K2-Test-Muster → behalten. */
function isMusterOrVk2Artwork(a: any): boolean {
  if (!a) return false
  // Bewusst geladene K2-Test-Muster immer behalten
  if ((a as any)._isMuster === true) return false
  const num = (a.number != null ? String(a.number).trim() : '').toUpperCase()
  const id = a.id != null ? String(a.id) : ''
  if (id.startsWith('muster-')) return true
  if (num.startsWith('VK2-') || id.startsWith('vk2-seed-')) return true
  if (MUSTER_NUMMERN.has(num)) return true
  return false
}

/** Für K2: Nur echte Werke anzeigen/speichern – Muster und VK2 entfernen. */
function filterK2ArtworksOnly(artworks: any[]): any[] {
  if (!Array.isArray(artworks)) return []
  return artworks.filter((a: any) => !isMusterOrVk2Artwork(a))
}

/** Prüft, ob eine URL ein inline SVG-Platzhalter ist (ök2: dann Kategorie-Standardbild nutzen). */
function isPlaceholderImageUrl(url: string | undefined): boolean {
  return !url || (typeof url === 'string' && url.startsWith('data:image/svg+xml'))
}

/** ök2: Werke aus k2-oeffentlich-artworks (Admin-Demo). Ohne Bild/Platzhalter → kategoriepassendes Standardbild. Leer = Fallback auf MUSTER_ARTWORKS. */
function loadOeffentlichArtworks(): any[] {
  try {
    const raw = localStorage.getItem('k2-oeffentlich-artworks')
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return []
    return parsed.map((a: any) => {
      const out = { ...a }
      if (out.imageUrl && out.previewUrl) {
        if (isPlaceholderImageUrl(out.imageUrl)) out.imageUrl = out.previewUrl
      } else if (out.previewUrl) {
        out.imageUrl = out.previewUrl
      }
      if (!out.imageUrl || isPlaceholderImageUrl(out.imageUrl)) out.imageUrl = getOek2DefaultArtworkImage(out.category)
      return out
    })
  } catch {
    return []
  }
}

/** VK2: Werke aus k2-vk2-artworks (Vereinsplattform). Leer = leere Liste. */
function loadVk2Artworks(): any[] {
  try {
    const raw = localStorage.getItem('k2-vk2-artworks')
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return []
    return parsed.map((a: any) => {
      const out = { ...a }
      if (isPlaceholderImageUrl(out.imageUrl) && out.previewUrl) out.imageUrl = out.previewUrl
      if (isPlaceholderImageUrl(out.imageUrl)) out.imageUrl = getOek2DefaultArtworkImage(out.category)
      return out
    })
  } catch {
    return []
  }
}

// KRITISCH: Backup-System für Mobile-Werke. K2: Nur echte Werke ins Backup (keine Muster/VK2).
function createBackup(artworks: any[]): void {
  try {
    const toSave = filterK2ArtworksOnly(artworks)
    const backup = {
      timestamp: new Date().toISOString(),
      artworks: toSave,
      count: toSave.length,
      mobileWorks: toSave.filter((a: any) => a.createdOnMobile || a.updatedOnMobile).length
    }
    localStorage.setItem('k2-artworks-backup', JSON.stringify(backup))
    console.log('💾 Backup erstellt:', backup.count, 'Werke,', backup.mobileWorks, 'Mobile-Werke')
  } catch (error) {
    console.warn('⚠️ Backup konnte nicht erstellt werden:', error)
  }
}

// KRITISCH: Lade Backup – K2: immer gefiltert (Muster/VK2 + Muster-Nummern raus). Wenn nur Muster drin waren: Backup leeren.
function loadBackup(): any[] | null {
  try {
    const backupData = localStorage.getItem('k2-artworks-backup')
    if (backupData) {
      const backup = JSON.parse(backupData)
      const list = Array.isArray(backup.artworks) ? backup.artworks : []
      const filtered = filterK2ArtworksOnly(list)
      if (filtered.length > 0) {
        console.log('💾 Backup gefunden:', filtered.length, 'Werke (nach Filter Muster/VK2)')
        return filtered
      }
      if (list.length > 0) {
        try {
          localStorage.setItem('k2-artworks-backup', JSON.stringify({ timestamp: new Date().toISOString(), artworks: [], count: 0, mobileWorks: 0 }))
          console.log('🔒 Backup enthielt nur Musterwerke – Backup geleert')
        } catch (_) {}
      }
      return null
    }
  } catch (error) {
    console.warn('⚠️ Backup konnte nicht geladen werden:', error)
  }
  return null
}

function saveArtworks(artworks: any[]): boolean {
  // K2: Nur echte Werke speichern – Muster/VK2 nie in k2-artworks schreiben
  const toSave = filterK2ArtworksOnly(artworks)
  const json = JSON.stringify(toSave)
  try {
    // KRITISCH: Erstelle Backup VOR dem Speichern (besonders wichtig für Mobile-Werke!)
    const currentArtworks = loadArtworks()
    if (currentArtworks && currentArtworks.length > 0) {
      createBackup(currentArtworks)
    }
    
    // KRITISCH: Prüfe ob Mobile-Werke vorhanden sind
    const mobileWorks = toSave.filter((a: any) => a.createdOnMobile || a.updatedOnMobile)
    if (mobileWorks.length > 0) {
      console.log(`🔒 ${mobileWorks.length} Mobile-Werke werden geschützt beim Speichern`)
    }
    
    // Prüfe Größe
    if (json.length > 5000000) {
      console.error('❌ Daten zu groß für localStorage:', json.length, 'Bytes')
      alert('⚠️ Zu viele Werke! Bitte einige löschen.')
      return false
    }
    
    // KRITISCH: Prüfe ob wir versehentlich alle Werke löschen wollen
    if (toSave.length === 0 && currentArtworks && currentArtworks.length > 0) {
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
    console.log('✅ Gespeichert:', toSave.length, 'Werke, Größe:', json.length, 'Bytes', toSave.length < artworks.length ? '(Muster/VK2 entfernt)' : '')
    
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
    
    if (error.name === 'QuotaExceededError') {
      const freed = tryFreeLocalStorageSpace()
      if (freed > 0) {
        try {
          localStorage.setItem('k2-artworks', json)
          const verify = localStorage.getItem('k2-artworks')
          if (verify && verify === json) {
            console.log('✅ Nach Speicher-Freigabe gespeichert')
            return true
          }
        } catch (retryErr: any) {
          // Fall through to backup restore and alert
        }
      }
      // Stelle Backup wieder her bei Fehler
      const backup = loadBackup()
      if (backup && backup.length > 0) {
        console.log('💾 Backup wiederhergestellt nach Fehler')
        try { localStorage.setItem('k2-artworks', JSON.stringify(backup)) } catch (_) {}
      }
      alert('⚠️ ' + SPEICHER_VOLL_MELDUNG)
    } else {
      // Stelle Backup wieder her bei Fehler
      const backup = loadBackup()
      if (backup && backup.length > 0) {
        console.log('💾 Backup wiederhergestellt nach Fehler')
        localStorage.setItem('k2-artworks', JSON.stringify(backup))
      }
      alert('⚠️ Fehler beim Speichern: ' + (error.message || error))
    }
    
    return false
  }
}

type Filter = 'alle' | ArtworkCategoryId

const GalerieVorschauPage = ({ initialFilter, musterOnly = false, vk2 = false }: { initialFilter?: Filter; musterOnly?: boolean; vk2?: boolean }) => {
  const navigate = useNavigate()
  
  // ök2 (musterOnly): k2-oeffentlich-artworks; VK2 (vk2): k2-vk2-artworks; K2: k2-artworks
  const initialArtworks = (() => {
    if (vk2) {
      const v = loadVk2Artworks()
      return v
    }
    if (musterOnly) {
      const oef = loadOeffentlichArtworks()
      if (oef.length > 0) return oef
      return [...MUSTER_ARTWORKS]
    }
    try {
      const stored = localStorage.getItem('k2-artworks')
      if (!stored) return []
      const parsed = JSON.parse(stored)
      if (!Array.isArray(parsed)) return []
      const filtered = filterK2ArtworksOnly(parsed)
      // Nur zurückschreiben wenn echte ök2-Muster (ohne _isMuster) entfernt wurden
      const realMusterRemoved = parsed.some((a: any) => !a._isMuster && String(a.id || '').startsWith('muster-'))
      if (realMusterRemoved) {
        try {
          localStorage.setItem('k2-artworks', JSON.stringify(filtered))
          window.dispatchEvent(new CustomEvent('artworks-updated', { detail: { count: filtered.length, musterRemoved: true } }))
        } catch (_) {}
      }
      const list = filtered.length > 0 ? filtered : []
      if (list.length > 0) {
        console.log('✅ Initiale Werke aus localStorage geladen:', list.length, 'Nummern:', list.map((a: any) => a.number || a.id))
        return list.map((a: any) => {
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

  /** Nur Kategorien anzeigen, die in den aktuellen Werken vorkommen */
  const categoriesWithArtworks = useMemo(() => {
    const list = artworks?.length ? artworks : (initialArtworks?.length ? initialArtworks : [])
    const ids = new Set(
      list.map((a: any) => a.category).filter(
        (cat): cat is ArtworkCategoryId => Boolean(cat) && ARTWORK_CATEGORIES.some((c) => c.id === cat)
      )
    )
    return ARTWORK_CATEGORIES.filter((c) => ids.has(c.id))
  }, [artworks, initialArtworks])

  // Filter auf "alle" zurücksetzen, wenn gewählte Kategorie keine Werke mehr hat
  useEffect(() => {
    if (filter !== 'alle' && !categoriesWithArtworks.some((c) => c.id === filter)) {
      setFilter('alle')
    }
  }, [filter, categoriesWithArtworks])

  // Willkommens-Banner (Erster Entwurf): von WillkommenPage mit Namen → einmalig anzeigen
  const [willkommenName, setWillkommenName] = useState<string | null>(null)
  const [willkommenBannerDismissed, setWillkommenBannerDismissed] = useState(false)
  useEffect(() => {
    if (!musterOnly) return
    try {
      const n = sessionStorage.getItem(WILLKOMMEN_NAME_KEY)
      const e = sessionStorage.getItem(WILLKOMMEN_ENTWURF_KEY)
      if (n && n.trim() && e === '1') setWillkommenName(n.trim())
    } catch (_) {}
  }, [musterOnly])
  const dismissWillkommenBanner = () => {
    setWillkommenBannerDismissed(true)
    try {
      sessionStorage.removeItem(WILLKOMMEN_ENTWURF_KEY)
    } catch (_) {}
  }

  // ök2 / VK2: Werke aus dem jeweiligen Speicher anzeigen
  useEffect(() => {
    if (vk2) {
      const v = loadVk2Artworks()
      setArtworks(v.length > 0 ? v : [...SEED_VK2_ARTISTS])
      return
    }
    if (musterOnly) {
      const oef = loadOeffentlichArtworks()
      setArtworks(oef.length > 0 ? oef : [...MUSTER_ARTWORKS])
    }
  }, [musterOnly, vk2])

  // K2 / ök2 / VK2: Nach Speichern im Admin (artworks-updated) Galerie-Liste aus dem jeweiligen Speicher aktualisieren
  useEffect(() => {
    const onUpdated = () => {
      if (vk2) {
        const v = loadVk2Artworks()
        setArtworks(v.length > 0 ? v : [...SEED_VK2_ARTISTS])
        return
      }
      if (musterOnly) {
        const oef = loadOeffentlichArtworks()
        setArtworks(oef.length > 0 ? oef : [...MUSTER_ARTWORKS])
        return
      }
      {
        const stored = loadArtworks()
        if (stored && stored.length > 0) {
          const placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5LZWluIEJpbGQ8L3RleHQ+PC9zdmc+'
          const withImages = stored.map((a: any) => {
            const out = { ...a }
            if (!out.imageUrl && out.previewUrl) out.imageUrl = out.previewUrl
            if (!out.imageUrl && !out.previewUrl) out.imageUrl = placeholder
            return out
          })
          setArtworks(withImages)
        }
      }
    }
    window.addEventListener('artworks-updated', onUpdated)
    return () => window.removeEventListener('artworks-updated', onUpdated)
  }, [musterOnly])

  // K2-Orange statt altes Blau (wie GaleriePage – gleicher Stand auf allen Geräten)
  const K2_ORANGE = React.useMemo(() => ({
    backgroundColor1: '#1a0f0a',
    backgroundColor2: '#2d1a14',
    backgroundColor3: '#3d2419',
    textColor: '#fff5f0',
    mutedColor: '#d4a574',
    accentColor: '#ff8c42',
    cardBg1: 'rgba(45, 26, 20, 0.95)',
    cardBg2: 'rgba(26, 15, 10, 0.92)'
  }), [])
  const isOldBlueTheme = React.useCallback((design: Record<string, string>): boolean => {
    if (!design || typeof design !== 'object') return true
    const norm = (s: string) => (s || '').toLowerCase().trim().replace(/\s/g, '')
    const bg1 = norm(design.backgroundColor1)
    const bg2 = norm(design.backgroundColor2)
    const accent = norm(design.accentColor)
    const BLUE_BG = ['0a0e', '1a1f', '0d14', '111c', '0304', '0f14', '1426', '0e27', '1f3a']
    const BLUE_ACCENT = ['5ff', '33a', '667', '764', 'b8b', '8fa', 'a1f', 'eea', '667eea', '5ffbf1', '33a1ff']
    if (BLUE_BG.some(p => bg1.includes(p) || bg2.includes(p))) return true
    if (BLUE_ACCENT.some(p => accent.includes(p))) return true
    return false
  }, [])
  const applyDesignToDocument = React.useCallback((design: Record<string, string> | null | undefined) => {
    if (!design || typeof design !== 'object') return
    try {
      const root = document.documentElement
      const use = isOldBlueTheme(design) ? K2_ORANGE : design
      if (use.accentColor) root.style.setProperty('--k2-accent', use.accentColor)
      if (use.backgroundColor1) root.style.setProperty('--k2-bg-1', use.backgroundColor1)
      if (use.backgroundColor2) root.style.setProperty('--k2-bg-2', use.backgroundColor2)
      if (use.backgroundColor3) root.style.setProperty('--k2-bg-3', use.backgroundColor3)
      if (use.textColor) root.style.setProperty('--k2-text', use.textColor)
      if (use.mutedColor) root.style.setProperty('--k2-muted', use.mutedColor)
      if (use.cardBg1) root.style.setProperty('--k2-card-bg-1', use.cardBg1)
      if (use.cardBg2) root.style.setProperty('--k2-card-bg-2', use.cardBg2)
    } catch (_) {}
  }, [K2_ORANGE, isOldBlueTheme])
  const applyDesignFromStorage = React.useCallback(() => {
    try {
      const stored = localStorage.getItem('k2-design-settings')
      if (!stored || stored.length > 50000) return
      const design = JSON.parse(stored) as Record<string, string>
      const use = isOldBlueTheme(design) ? K2_ORANGE : design
      if (isOldBlueTheme(design)) localStorage.setItem('k2-design-settings', JSON.stringify(K2_ORANGE))
      applyDesignToDocument(use)
    } catch (_) {}
  }, [applyDesignToDocument, K2_ORANGE, isOldBlueTheme])
  useEffect(() => {
    applyDesignFromStorage()
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'k2-design-settings') applyDesignFromStorage()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [applyDesignFromStorage])

  // Admin-Kontext nur beenden, wenn Nutzer bewusst aus dem Admin „Zur Galerie“ geklickt hat (nicht bei direktem Aufruf/Mobil → Kassa bleibt nutzbar)
  const location = useLocation()
  useEffect(() => {
    try {
      const fromAdmin = (location.state as { fromAdmin?: boolean } | null)?.fromAdmin === true
      if (fromAdmin) {
        sessionStorage.removeItem('k2-admin-context')
        sessionStorage.removeItem('k2-from-galerie-view')
      } else {
        // Shop soll Kundenansicht zeigen, wenn von hier aus gewechselt wird (auch bei SPA-Navigation ohne Referrer)
        sessionStorage.setItem('k2-from-galerie-view', '1')
      }
    } catch (_) {}
  }, [location.state])

  const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string; artwork: any; allArtworks?: any[]; currentIndex?: number } | null>(null)
  const [imageZoom, setImageZoom] = useState(1)
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [likedArtworks, setLikedArtworks] = useState<Set<string>>(new Set())
  const [shareLinkCopied, setShareLinkCopied] = useState(false)
  const hasOpenedFromHash = useRef(false)

  // Beim Laden: Wenn URL-Hash #werk=XXX vorhanden, Lightbox auf dieses Werk öffnen (einmalig)
  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : ''
    const m = hash.match(/^#werk=(.+)$/)
    if (!m || !artworks.length || hasOpenedFromHash.current) return
    hasOpenedFromHash.current = true
    const idOrNum = decodeURIComponent(m[1].trim())
    const idx = artworks.findIndex((a: any) =>
      (a.number != null && String(a.number) === idOrNum) || (a.id != null && String(a.id) === idOrNum)
    )
    if (idx < 0) return
    const a = artworks[idx]
    const src = a.imageUrl || a.previewUrl || ''
    if (!src) return
    setLightboxImage({
      src,
      title: a.title || a.number || '',
      artwork: a,
      allArtworks: artworks,
      currentIndex: idx
    })
  }, [artworks])

  // Lightbox: Vor/Zurück mit Pfeiltasten
  useEffect(() => {
    if (!lightboxImage) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxImage(null)
        setImageZoom(1)
        setImagePosition({ x: 0, y: 0 })
        return
      }
      const list = lightboxImage.allArtworks
      const i = lightboxImage.currentIndex
      if (list == null || i == null) return
      if (e.key === 'ArrowLeft' && i > 0) {
        const prev = list[i - 1]
        const src = prev?.imageUrl || prev?.previewUrl || ''
        if (src) {
          setLightboxImage({ src, title: prev?.title || prev?.number || '', artwork: prev, allArtworks: list, currentIndex: i - 1 })
          setImageZoom(1)
          setImagePosition({ x: 0, y: 0 })
        }
      } else if (e.key === 'ArrowRight' && i < list.length - 1) {
        const next = list[i + 1]
        const src = next?.imageUrl || next?.previewUrl || ''
        if (src) {
          setLightboxImage({ src, title: next?.title || next?.number || '', artwork: next, allArtworks: list, currentIndex: i + 1 })
          setImageZoom(1)
          setImagePosition({ x: 0, y: 0 })
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxImage])
  const [isLoading, setIsLoading] = useState(false)
  const [loadStatus, setLoadStatus] = useState<{ message: string; success: boolean } | null>(null)
  
  // Mobile-First Admin: Neues Objekt hinzufügen / Bearbeiten
  const [showMobileAdmin, setShowMobileAdmin] = useState(false)
  const [editingArtwork, setEditingArtwork] = useState<any | null>(null) // null = neues Objekt, sonst = zu bearbeitendes Objekt
  const [isEditingMode, setIsEditingMode] = useState(false) // Expliziter Flag für Bearbeitungs-Modus
  const [mobilePhoto, setMobilePhoto] = useState<string | null>(null)
  const [mobileTitle, setMobileTitle] = useState('')
  const [mobileCategory, setMobileCategory] = useState<ArtworkCategoryId>('malerei')
  const [mobilePrice, setMobilePrice] = useState('')
  const [mobileDescription, setMobileDescription] = useState('')
  const [mobileLocationType, setMobileLocationType] = useState<'regal' | 'bildflaeche' | 'sonstig' | ''>('')
  const [mobileLocationNumber, setMobileLocationNumber] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [showLocationQR, setShowLocationQR] = useState(false)
  const [showEtikettModal, setShowEtikettModal] = useState(false)
  const [etikettArtwork, setEtikettArtwork] = useState<any>(null)
  const [etikettQrUrl, setEtikettQrUrl] = useState<string | null>(null)
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
    setMobileCategory(ARTWORK_CATEGORIES.some((x) => x.id === artwork.category) ? (artwork.category as ArtworkCategoryId) : 'malerei')
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

  // Mobile: Viewport beim Öffnen/Schließen des Werk-Modals vergrößern für optimale Eingabestruktur
  const VIEWPORT_DEFAULT = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover'
  const VIEWPORT_ZOOMED = 'width=device-width, initial-scale=1.35, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover'
  useEffect(() => {
    if (typeof document === 'undefined') return
    const meta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null
    if (!meta) return
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768
    if (showMobileAdmin && isMobile) {
      meta.setAttribute('content', VIEWPORT_ZOOMED)
    } else {
      meta.setAttribute('content', VIEWPORT_DEFAULT)
    }
    return () => {
      meta.setAttribute('content', VIEWPORT_DEFAULT)
    }
  }, [showMobileAdmin])
  
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
    
    // KRITISCH: Backup nur aus gefilterter Liste – sonst kommen die 5 Musterwerke immer wieder
    const rawOnMount = loadArtworks()
    const filteredOnMount = rawOnMount && rawOnMount.length > 0 ? filterK2ArtworksOnly(rawOnMount) : []
    if (filteredOnMount.length > 0) {
      createBackup(filteredOnMount)
      console.log('💾 Initiales Backup erstellt:', filteredOnMount.length, 'Werke (gefiltert)')
    }
    if (filteredOnMount.length < (rawOnMount?.length ?? 0)) {
      try {
        localStorage.setItem('k2-artworks', JSON.stringify(filteredOnMount))
        localStorage.setItem('k2-artworks-backup', JSON.stringify({ timestamp: new Date().toISOString(), artworks: filteredOnMount, count: filteredOnMount.length, mobileWorks: filteredOnMount.filter((a: any) => a.createdOnMobile || a.updatedOnMobile).length }))
        console.log('🔒 Musterwerke beim Start entfernt, Backup überschrieben:', filteredOnMount.length, 'Werke')
      } catch (_) {}
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
        // PRIORITÄT 1: Supabase (wenn konfiguriert) – auf Mobile mit Timeout, damit Offline/anderes LAN nicht blockiert
        if (isSupabaseConfigured()) {
          console.log('🗄️ Supabase konfiguriert - lade aus Datenbank...')
          const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768
          const supabaseTimeoutMs = isMobileDevice ? 8000 : 15000
          
          try {
            const supabaseArtworks = await Promise.race([
              loadArtworksFromSupabase(),
              new Promise<undefined>((_, reject) => setTimeout(() => reject(new Error('Supabase-Timeout')), supabaseTimeoutMs))
            ])
            
            if (isMounted && supabaseArtworks && supabaseArtworks.length > 0) {
              const filteredSupabase = filterK2ArtworksOnly(supabaseArtworks)
              if (filteredSupabase.length < supabaseArtworks.length) {
                console.log(`🔒 Muster/VK2 aus Supabase entfernt: ${filteredSupabase.length} Werke`)
              }
              console.log(`✅ ${filteredSupabase.length} Werke aus Supabase geladen`)
              setArtworks(filteredSupabase)
              try { localStorage.setItem('k2-artworks', JSON.stringify(filteredSupabase)) } catch (_) {}
              setLoadStatus({ message: `✅ ${filteredSupabase.length} Werke geladen`, success: true })
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
                  const filteredMigrated = filterK2ArtworksOnly(migratedArtworks)
                  setArtworks(filteredMigrated)
                  setLoadStatus({ message: `✅ ${filteredMigrated.length} Werke migriert und geladen`, success: true })
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
          // Lade IMMER direkt aus localStorage; K2: nur echte Werke (Muster/VK2 raus), sonst kommen sie immer wieder
          const raw = loadArtworks()
          const stored = raw && raw.length > 0 ? filterK2ArtworksOnly(raw) : []
          if (stored.length > 0) {
            if (stored.length < (raw?.length ?? 0)) {
              try {
                localStorage.setItem('k2-artworks', JSON.stringify(stored))
                createBackup(stored)
                console.log('🔒 Muster/VK2 aus localStorage entfernt, Backup überschrieben,', stored.length, 'Werke verbleiben')
              } catch (_) {}
            }
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
          // KRITISCH: Prüfe Backup bevor wir leeren! (loadBackup liefert bereits gefilterte Liste)
          const backup = loadBackup()
          if (backup && backup.length > 0) {
            console.log('💾 Backup gefunden - verwende Backup statt leeren:', backup.length, 'Werke (gefiltert)')
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
    
    // PROFESSIONELL: Automatisches Polling für Mobile-Updates (nur auf Mac, nicht im iframe/Cursor Preview – Crash-Schutz)
    const isMac = !/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) && window.innerWidth > 768
    const notInIframe = typeof window !== 'undefined' && window.self === window.top
    let pollingInterval: ReturnType<typeof setInterval> | null = null
    let initialCheckTimeoutId: ReturnType<typeof setTimeout> | null = null
    
    if (isMac && isSupabaseConfigured() && notInIframe) {
      const checkForMobileUpdates = async () => {
        try {
          const { hasUpdates, artworks } = await checkMobileUpdates()
          if (hasUpdates && artworks && isMounted) {
            const filtered = filterK2ArtworksOnly(artworks)
            if (filtered.length < artworks.length) {
              console.log(`🔒 Muster/VK2 bei Mobile-Sync entfernt: ${filtered.length} Werke`)
            }
            console.log(`🔄 Automatisch ${filtered.length} neue Mobile-Daten gefunden und synchronisiert`)
            setArtworks(filtered)
            try { localStorage.setItem('k2-artworks', JSON.stringify(filtered)) } catch (_) {}
            // Update Hash für nächsten Check
            const hash = filtered.map((a: any) => a.number || a.id).sort().join(',')
            localStorage.setItem('k2-artworks-hash', hash)
            localStorage.setItem('k2-last-load-time', Date.now().toString())
            // Event für andere Komponenten
            window.dispatchEvent(new CustomEvent('artworks-updated', { 
              detail: { count: filtered.length, autoSync: true } 
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
    // (nur wenn nicht auf Vercel und auf Mobile-Gerät, nicht im iframe/Cursor Preview – Crash-Schutz)
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768
    const isVercel = window.location.hostname.includes('vercel.app')
    let mobilePollingInterval: ReturnType<typeof setInterval> | null = null
    
    if (isMobile && !isVercel && isMounted && notInIframe) {
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
              
              // Füge Server-Werke hinzu die NICHT lokal sind (keine Muster/VK2 in K2)
              data.artworks.forEach((server: any) => {
                if (isMusterOrVk2Artwork(server)) return
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
                const toSave = filterK2ArtworksOnly(merged)
                console.log(`🔄 Admin-Bereich: ${toSave.length} Werke synchronisiert (${localArtworks.length} lokal + ${toSave.length - localArtworks.length} Server, Muster/VK2 entfernt)`)
                console.log(`🔒 Lokale Werke geschützt: ${localArtworks.length} Werke bleiben erhalten`)
                localStorage.setItem('k2-artworks', JSON.stringify(toSave))
                setArtworks(toSave)
                window.dispatchEvent(new CustomEvent('artworks-updated', { 
                  detail: { count: toSave.length, autoSync: true, fromAdmin: true } 
                }))
              }
            } else {
              // Keine Server-Werke - behalte lokale Werke (gefiltert)
              if (localArtworks.length > 0 && isMounted) {
                const toKeep = filterK2ArtworksOnly(localArtworks)
                console.log(`🔒 Keine Server-Daten - behalte ${toKeep.length} lokale Werke`)
                localStorage.setItem('k2-artworks', JSON.stringify(toKeep))
                if (artworks.length !== localArtworks.length) {
                  setArtworks(localArtworks)
                }
              }
            }
          } else {
            // Server nicht erreichbar - behalte lokale Werke (gefiltert)
            if (localArtworks.length > 0 && isMounted) {
              const toKeep = filterK2ArtworksOnly(localArtworks)
              console.log(`🔒 Server nicht erreichbar - behalte ${toKeep.length} lokale Werke`)
              localStorage.setItem('k2-artworks', JSON.stringify(toKeep))
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
      // Sicherheit: Status nach 12 s immer ausblenden, falls Fetch hängt
      const fallbackClear = setTimeout(() => {
        setLoadStatus((prev) => (prev?.message.includes('Lade') ? null : prev))
      }, 12000)
      
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
        setLoadStatus({ message: 'Lade Werke...', success: false })
        
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
            
            // Auf Mobile/anderem LAN: kürzeres Timeout, damit „Werk hinzufügen“ bald nutzbar ist
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768
            const fetchTimeoutMs = isMobile ? 12000 : 30000
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), fetchTimeoutMs)
            
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
                // K2: Muster/VK2 vom Server nicht übernehmen
                const existingArtworks = loadArtworks()
                const serverArtworks = filterK2ArtworksOnly(Array.isArray(data.artworks) ? data.artworks : [])
                
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
                
                // SERVER = QUELLE DER WAHRHEIT nach Veröffentlichung
                // Lokale Werke die nicht auf Server sind = wurden woanders gelöscht → History, nicht Galerie
                const mergedArtworks = [...serverArtworks]
                const toHistory: any[] = []
                
                existingArtworks.forEach((localArtwork: any) => {
                  const key = localArtwork.number || localArtwork.id
                  if (!key) return
                  
                  const serverArtwork = serverMap.get(key)
                  
                  // WICHTIG: Mobile-Werke die < 10 Min alt sind → evtl. noch nicht veröffentlicht, behalten
                  const isMobileWork = localArtwork.createdOnMobile || localArtwork.updatedOnMobile
                  const createdAt = localArtwork.createdAt ? new Date(localArtwork.createdAt).getTime() : 0
                  const isVeryNew = createdAt > Date.now() - 600000 // 10 Min
                  
                  if (!serverArtwork) {
                    if (isMobileWork && isVeryNew) {
                      // Sehr neues Mobile-Werk, noch nicht veröffentlicht
                      console.log('💾 Behalte sehr neues Mobile-Werk (noch nicht auf Server):', key)
                      mergedArtworks.push(localArtwork)
                    } else {
                      // Wurde woanders gelöscht und veröffentlicht → nur in History
                      console.log('📜 Werk nicht auf Server → History:', key)
                      toHistory.push(localArtwork)
                    }
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
                
                if (toHistory.length > 0) appendToHistory(toHistory)
                
                console.log(`🔄 Merge abgeschlossen: ${serverArtworks.length} Server (Quelle) → ${mergedArtworks.length} Gesamt, ${toHistory.length} in History`)
                console.log('📊 Finale Nummern:', mergedArtworks.map((a: any) => a.number || a.id))
                
                // K2: Muster/VK2-Werke nicht in k2-artworks speichern
                const toSaveMerge = filterK2ArtworksOnly(mergedArtworks)
                try {
                  localStorage.setItem('k2-artworks', JSON.stringify(toSaveMerge))
                  console.log('✅ Gemergte Werke gespeichert:', toSaveMerge.length, toSaveMerge.length < mergedArtworks.length ? '(Muster/VK2 entfernt)' : '')
                  
                  // Mobile: Synchronisiere gemergte Liste zu Supabase
                  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768
                  if (isMobile && toSaveMerge.length > 0) {
                    try {
                      await saveArtworksToSupabase(toSaveMerge)
                      console.log('✅ Gemergte Werke zu Supabase synchronisiert')
                    } catch (syncError) {
                      console.warn('⚠️ Supabase-Sync fehlgeschlagen:', syncError)
                    }
                  }
                  
                  stored = toSaveMerge
                  
                  // KRITISCH: Setze artworks SOFORT nach Merge (ohne Muster/VK2)
                  const exhibitionArtworks = toSaveMerge.map((a: any) => {
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
              ? '⚠️ Offline/anderes Netzwerk – Werke hinzufügen geht trotzdem: Admin → Neues Werk' 
              : error?.message 
              ? `⚠️ ${error.message} – Werke hinzufügen: Admin → Neues Werk` 
              : '⚠️ Offline/anderes Netzwerk – Werke hinzufügen: Admin → Neues Werk'
            setLoadStatus({ message: errorMsg, success: false })
            setTimeout(() => setLoadStatus(null), 12000)
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
        clearTimeout(fallbackClear)
        setIsLoading(false)
      }
    }
    
    const isVorschauModus = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('vorschau') === '1'
    // Vorschau aus Einstellungen „Seiten prüfen“: nur localStorage (gerade gespeicherte Daten), kein Server-Fetch
    if (isVorschauModus) {
      loadData(true)
      return
    }
    // Erst nach kurzer Verzögerung prüfen: sucht neue Werke, die ein Mobilgerät möglicherweise eingespielt hat (Server/gallery-data).
    // Haupt-Load (erster useEffect) soll zuerst aus localStorage/Supabase laden; sonst bleibt der rote „Lade Werke…“-Balken hängen.
    const timer = setTimeout(() => {
      const current = loadArtworks()
      const filtered = filterK2ArtworksOnly(current)
      if (filtered.length === 0) {
        loadData()
      }
    }, 2800)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- nur einmal beim Mount ausführen
  }, [])
  
  // Manuelle Refresh-Funktion - lädt IMMER neu vom Server
  // KRITISCH: Mobile-Werke haben ABSOLUTE PRIORITÄT - sie dürfen NIEMALS gelöscht werden!
  const handleRefresh = async () => {
    setIsLoading(true)
    setLoadStatus({ message: 'Lade Werke...', success: false })
    
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
        if (data.designSettings != null && typeof data.designSettings === 'object') {
          try {
            const designToUse = isOldBlueTheme(data.designSettings) ? K2_ORANGE : data.designSettings
            localStorage.setItem('k2-design-settings', JSON.stringify(designToUse))
            applyDesignToDocument(designToUse)
          } catch (_) {}
        }
        if (data.artworks && Array.isArray(data.artworks)) {
          // Speichere Version-Info und Zeitstempel
          if (data.version) localStorage.setItem('k2-last-loaded-version', String(data.version))
          if (data.buildId) localStorage.setItem('k2-last-build-id', data.buildId)
          if (data.exportedAt) localStorage.setItem('k2-last-loaded-timestamp', data.exportedAt)
          localStorage.setItem('k2-last-load-time', String(Date.now())) // WICHTIG: Load-Time speichern
          
          // KRITISCH: Merge-Logik - Mobile-Werke haben ABSOLUTE PRIORITÄT!
          // K2: Muster/VK2 vom Server nicht in K2 übernehmen
          const serverArtworks = filterK2ArtworksOnly(data.artworks)
          
          const serverMap = new Map<string, any>()
          serverArtworks.forEach((a: any) => {
            const key = a.number || a.id
            if (key) serverMap.set(key, a)
          })
          
          const mergedArtworks: any[] = [...serverArtworks]
          const toHistory: any[] = []
          
          localArtworks.forEach((localArtwork: any) => {
            const key = localArtwork.number || localArtwork.id
            if (!key) return
            const serverArtwork = serverMap.get(key)
            const isMobileWork = localArtwork.createdOnMobile || localArtwork.updatedOnMobile
            const createdAt = localArtwork.createdAt ? new Date(localArtwork.createdAt).getTime() : 0
            const isVeryNew = createdAt > Date.now() - 600000
            
            if (!serverArtwork) {
              if (isMobileWork && isVeryNew) mergedArtworks.push(localArtwork)
              else toHistory.push(localArtwork)
            } else {
              if (isMobileWork) {
                const idx = mergedArtworks.findIndex((a: any) => (a.number || a.id) === key)
                if (idx >= 0) mergedArtworks[idx] = localArtwork
                else mergedArtworks.push(localArtwork)
              } else {
                const localUpdated = localArtwork.updatedAt ? new Date(localArtwork.updatedAt).getTime() : 0
                const serverUpdated = serverArtwork.updatedAt ? new Date(serverArtwork.updatedAt).getTime() : 0
                if (localUpdated > serverUpdated) {
                  const idx = mergedArtworks.findIndex((a: any) => (a.number || a.id) === key)
                  if (idx >= 0) mergedArtworks[idx] = localArtwork
                  else mergedArtworks.push(localArtwork)
                }
              }
            }
          })
          
          if (toHistory.length > 0) appendToHistory(toHistory)
          const toSaveServer = filterK2ArtworksOnly(mergedArtworks)
          console.log(`🔒 Server = Quelle: ${toSaveServer.length} Werke, ${toHistory.length} in History`, toSaveServer.length < mergedArtworks.length ? '(Muster/VK2 entfernt)' : '')
          
          try {
            localStorage.setItem('k2-artworks', JSON.stringify(toSaveServer))
            console.log('✅ Gemergte Werke geladen:', toSaveServer.length, 'Version:', data.version, `(${serverArtworks.length} Server + ${toSaveServer.length - serverArtworks.length} Mobile)`)
            
            const exhibitionArtworks = toSaveServer
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

  // Zur Auswahl hinzufügen – gibt true zurück wenn erfolgreich (dann Navigation in den Shop)
  const addToCart = (artwork: any): boolean => {
    if (artwork.inShop === false) {
      alert('Dieses Werk ist nur für die Ausstellung.')
      return false
    }
    const price = Number(artwork.price) || 0
    if (price <= 0) {
      alert('Dieses Werk hat keinen Preis.')
      return false
    }

    try {
      const soldData = localStorage.getItem('k2-sold-artworks')
      if (soldData) {
        const soldArtworks = JSON.parse(soldData)
        if (Array.isArray(soldArtworks)) {
          const isSold = soldArtworks.some((a: any) => a && a.number === artwork.number)
          if (isSold) {
            alert('Dieses Werk ist bereits verkauft.')
            return false
          }
        }
      }
    } catch (_) {}

    const cartItem = {
      number: artwork.number,
      title: artwork.title || artwork.number,
      price: price,
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
      if (cart.some((item: any) => item.number === artwork.number)) {
        alert('Dieses Werk ist bereits in deiner Auswahl.')
        return false
      }
      cart.push(cartItem)
      localStorage.setItem('k2-cart', JSON.stringify(cart))
      setCartCount(cart.length)
      window.dispatchEvent(new CustomEvent('cart-updated'))
      return true
    } catch (error) {
      console.error('Fehler beim Hinzufügen zur Auswahl:', error)
      alert('Fehler beim Hinzufügen zur Auswahl.')
      return false
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

  const isVorschauModus = typeof window !== 'undefined' && new URLSearchParams(location.search).get('vorschau') === '1'

  /** ök2 (musterOnly): Text/Border/Buttons an Theme anpassen; K2-Vorschau: weiß/lila */
  const galerieTheme = musterOnly
    ? { text: 'var(--k2-text)', muted: 'var(--k2-muted)', accent: 'var(--k2-accent)', border: 'rgba(0,0,0,0.12)', filterActive: 'linear-gradient(135deg, var(--k2-accent) 0%, #6b9080 100%)', filterInactive: 'rgba(0,0,0,0.06)', priceBg: 'var(--k2-accent)', btnBorder: 'rgba(0,0,0,0.15)' }
    : { text: '#ffffff', muted: 'rgba(255,255,255,0.7)', accent: '#b8b8ff', border: 'rgba(255,255,255,0.2)', filterActive: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', filterInactive: 'rgba(255,255,255,0.05)', priceBg: 'linear-gradient(135deg, #b8b8ff 0%, #ff77c6 100%)', btnBorder: 'rgba(102,126,234,0.3)' }

  return (
    <>
      {/* Vorschau aus Einstellungen „Seiten prüfen“ – Zurück-Link */}
      {isVorschauModus && (
        <div style={{
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          padding: '0.6rem 1rem',
          background: 'rgba(245, 158, 11, 0.95)',
          color: '#1a1a1a',
          fontSize: '0.95rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}>
          <button
            type="button"
            onClick={() => navigate(musterOnly ? '/admin?context=oeffentlich' : '/admin')}
            style={{ background: 'rgba(0,0,0,0.2)', border: 'none', color: 'inherit', padding: '0.4rem 0.8rem', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
          >
            ← Zurück zu Einstellungen
          </button>
          <span style={{ opacity: 0.9 }}>Vorschau (Werke) – deine gespeicherten Änderungen</span>
        </div>
      )}
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
        : 'linear-gradient(135deg, var(--k2-bg-1) 0%, var(--k2-bg-2) 50%, var(--k2-bg-3) 100%)',
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
        {/* Erster Entwurf – Willkommens-Banner (nur ök2, wenn von WillkommenPage mit Namen) */}
        {musterOnly && willkommenName && !willkommenBannerDismissed && (
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(181, 74, 30, 0.95) 0%, rgba(212, 98, 40, 0.95) 100%)',
              color: '#fff',
              padding: '0.75rem 1.25rem',
              textAlign: 'center',
              fontSize: '0.95rem',
              position: 'relative',
              boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            }}
          >
            <span><strong>Dein erster Entwurf</strong> – Willkommen, {willkommenName}! Das ist die Vorschau deiner Galerie.</span>
            <button
              type="button"
              onClick={dismissWillkommenBanner}
              aria-label="Banner schließen"
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.25)',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                padding: '0.35rem 0.6rem',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              OK
            </button>
          </div>
        )}
        {/* Mobile-First Admin: Neues Objekt Button (ök2: ausblenden) */}
        {!musterOnly && showMobileAdmin && (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768) && (
          <button
            onClick={openNewModal}
            style={{
              position: 'fixed',
              top: 'max(1rem, calc(env(safe-area-inset-top, 0px) + 0.5rem))',
              left: 'max(1rem, env(safe-area-inset-left, 0px))',
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
                    color: galerieTheme.muted,
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    background: galerieTheme.filterInactive,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = musterOnly ? 'rgba(0,0,0,0.12)' : 'rgba(255, 255, 255, 0.2)'
                    e.currentTarget.style.color = galerieTheme.text
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = galerieTheme.filterInactive
                    e.currentTarget.style.color = galerieTheme.muted
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
                color: galerieTheme.text,
                letterSpacing: '-0.02em',
                lineHeight: '1.1'
              }}>
                Galerie-Vorschau
              </h1>
              <p style={{ 
                margin: '0.75rem 0 0', 
                color: galerieTheme.muted, 
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
                state={{ fromGalerieView: true, fromOeffentlich: musterOnly }}
                onClick={() => { if (musterOnly) try { sessionStorage.setItem('k2-shop-from-oeffentlich', '1') } catch (_) {} }}
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
                🛒 Meine Auswahl
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
            border: `1px solid ${galerieTheme.border}`,
            borderRadius: '16px',
            padding: 'clamp(1rem, 3vw, 1.5rem)',
            marginBottom: 'clamp(2rem, 5vw, 3rem)',
            fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
            color: galerieTheme.text,
            textAlign: 'center',
            lineHeight: '1.6'
          }}>
            <strong style={{ color: galerieTheme.text }}>Alle Werke</strong> sind Teil unserer Ausstellung und in der Online-Galerie sichtbar. 
            Wenn dir ein Werk gefällt und du es erwerben möchtest: <strong style={{ color: galerieTheme.accent }}>"Gefällt mir – möchte ich erwerben"</strong> wählen – du wirst in den Shop weitergeleitet.
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
                border: filter === 'alle' ? 'none' : `1px solid ${galerieTheme.border}`,
                background: filter === 'alle' ? galerieTheme.filterActive : galerieTheme.filterInactive,
                backdropFilter: 'blur(10px)',
                color: galerieTheme.text,
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
                  e.currentTarget.style.background = musterOnly ? 'rgba(0,0,0,0.1)' : 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }
              }}
              onMouseLeave={(e) => {
                if (filter !== 'alle') {
                  e.currentTarget.style.background = galerieTheme.filterInactive
                  e.currentTarget.style.transform = 'translateY(0)'
                }
              }}
            >
              Alle Werke
            </button>
            {categoriesWithArtworks.map((c) => (
              <button
                key={c.id}
                onClick={() => setFilter(c.id)}
                style={{
                  padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                  border: filter === c.id ? 'none' : `1px solid ${galerieTheme.border}`,
                  background: filter === c.id ? galerieTheme.filterActive : galerieTheme.filterInactive,
                  backdropFilter: 'blur(10px)',
                  color: galerieTheme.text,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
                  fontWeight: filter === c.id ? '600' : '500',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.3s ease',
                  boxShadow: filter === c.id ? '0 10px 30px rgba(102, 126, 234, 0.3)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (filter !== c.id) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (filter !== c.id) {
                    e.currentTarget.style.background = galerieTheme.filterInactive
                    e.currentTarget.style.transform = 'translateY(0)'
                  }
                }}
              >
                {c.label}
              </button>
            ))}
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
          
          // K2: Verkaufte Werke nach soldArtworksDisplayDays ausblenden (0 = sofort in History)
          let soldDisplayDays = 30
          let soldMap: Map<string, string> = new Map()
          if (!musterOnly) {
            try {
              const gal = localStorage.getItem('k2-stammdaten-galerie')
              if (gal) {
                const g = JSON.parse(gal)
                if (typeof g.soldArtworksDisplayDays === 'number') soldDisplayDays = g.soldArtworksDisplayDays
              }
              const soldRaw = localStorage.getItem('k2-sold-artworks')
              if (soldRaw) {
                const arr = JSON.parse(soldRaw)
                if (Array.isArray(arr)) arr.forEach((a: any) => { if (a?.number != null) soldMap.set(String(a.number), a.soldAt || '') })
              }
            } catch (_) {}
          }
          const filteredArtworks = sortArtworksNewestFirst(
            currentArtworks.filter((artwork) => {
              if (!artwork) return false
              if (filter === 'alle') {
                // K2: verkaufte Werke nach Ablauf aus Galerie-Ansicht ausblenden
                if (!musterOnly && soldMap.size > 0) {
                  const num = artwork.number != null ? String(artwork.number) : (artwork.id != null ? String(artwork.id) : '')
                  const soldAt = num ? soldMap.get(num) : null
                  if (soldAt) {
                    if (soldDisplayDays === 0) return false
                    const cutoff = Date.now() - soldDisplayDays * 24 * 60 * 60 * 1000
                    if (new Date(soldAt).getTime() < cutoff) return false
                  }
                }
                return true
              }
              // WICHTIG: Prüfe ob artwork.category existiert und mit filter übereinstimmt
              if (!artwork.category) {
                console.warn('⚠️ Werk ohne category:', artwork.number || artwork.id)
                return false
              }
              let include = artwork.category === filter
              if (include && !musterOnly && soldMap.size > 0) {
                const num = artwork.number != null ? String(artwork.number) : (artwork.id != null ? String(artwork.id) : '')
                const soldAt = num ? soldMap.get(num) : null
                if (soldAt) {
                  if (soldDisplayDays === 0) include = false
                  else {
                    const cutoff = Date.now() - soldDisplayDays * 24 * 60 * 60 * 1000
                    if (new Date(soldAt).getTime() < cutoff) include = false
                  }
                }
              }
              return include
            })
          )
          
          console.log('🎨 Render - filteredArtworks:', {
            anzahl: filteredArtworks.length,
            nummern: filteredArtworks.map((a: any) => a.number || a.id),
            filter: filter
          })

          return filteredArtworks.length === 0 ? (
            <div style={{ 
              padding: 'clamp(3rem, 8vw, 5rem)', 
              textAlign: 'center',
              background: galerieTheme.filterInactive,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${galerieTheme.border}`,
              borderRadius: '20px'
            }}>
              <p style={{ fontSize: 'clamp(1.1rem, 3vw, 1.3rem)', color: galerieTheme.text }}>
                Noch keine Werke in der Galerie
              </p>
              <p style={{ 
                fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)', 
                marginTop: '1rem',
                color: galerieTheme.muted
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
              {filteredArtworks.map((artwork, index) => {
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
                    background: galerieTheme.filterInactive,
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${galerieTheme.border}`,
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
                      e.currentTarget.style.background = musterOnly ? 'rgba(0,0,0,0.08)' : 'rgba(255, 255, 255, 0.08)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.background = galerieTheme.filterInactive
                  }}
                  >
                    {/* Warn-Badge: Foto oder Preis fehlt (nur im Admin-Modus sichtbar) */}
                    {!musterOnly && showMobileAdmin && (() => {
                      const fehltFoto = !artwork.imageUrl && !artwork.previewUrl
                      const fehltPreis = !artwork.price || Number(artwork.price) === 0
                      if (!fehltFoto && !fehltPreis) return null
                      return (
                        <div style={{
                          position: 'absolute',
                          top: '0.5rem',
                          right: '0.5rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.2rem',
                          zIndex: 3
                        }}>
                          {fehltFoto && (
                            <div style={{
                              background: 'rgba(220,38,38,0.9)',
                              color: '#fff',
                              fontSize: '0.7rem',
                              fontWeight: '700',
                              padding: '0.2rem 0.45rem',
                              borderRadius: '5px',
                              lineHeight: 1.2,
                              backdropFilter: 'blur(4px)'
                            }}>📷 Foto fehlt</div>
                          )}
                          {fehltPreis && (
                            <div style={{
                              background: 'rgba(245,158,11,0.9)',
                              color: '#fff',
                              fontSize: '0.7rem',
                              fontWeight: '700',
                              padding: '0.2rem 0.45rem',
                              borderRadius: '5px',
                              lineHeight: 1.2,
                              backdropFilter: 'blur(4px)'
                            }}>€ Preis fehlt</div>
                          )}
                        </div>
                      )
                    })()}

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
                      background: galerieTheme.filterInactive,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {(() => {
                        const rawSrc = artwork.imageUrl || artwork.previewUrl || ''
                        const displaySrc = musterOnly && (!rawSrc || isPlaceholderImageUrl(rawSrc))
                          ? getOek2DefaultArtworkImage(artwork.category)
                          : rawSrc
                        return displaySrc ? (
                        <>
                          <img 
                            src={displaySrc} 
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
                              const lbSrc = artwork.imageUrl || artwork.previewUrl || (musterOnly ? getOek2DefaultArtworkImage(artwork.category) : '')
                              setLightboxImage({
                                src: lbSrc,
                                title: artwork.title || artwork.number || '',
                                artwork,
                                allArtworks: filteredArtworks,
                                currentIndex: index
                              })
                              setImageZoom(1)
                              setImagePosition({ x: 0, y: 0 })
                            }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            if (musterOnly && target.src !== OEK2_PLACEHOLDER_IMAGE) {
                              target.src = OEK2_PLACEHOLDER_IMAGE
                              return
                            }
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
                          color: galerieTheme.muted,
                          fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)',
                          textAlign: 'center',
                          padding: '1rem'
                        }}>
                          {artwork.number || 'Kein Bild'}
                        </div>
                      )
                    })()}
                    </div>
                    <h4 style={{ 
                      margin: '1rem 0 0.5rem', 
                      fontSize: 'clamp(1rem, 3vw, 1.2rem)',
                      lineHeight: '1.3',
                      color: galerieTheme.text,
                      fontWeight: '600'
                    }}>
                      {artwork.title || artwork.number}
                    </h4>
                    <p style={{ 
                      margin: '0.25rem 0', 
                      fontSize: 'clamp(0.75rem, 2vw, 0.85rem)', 
                      color: galerieTheme.muted,
                      lineHeight: '1.3'
                    }}>
                      {artwork.number}
                    </p>
                    <p style={{ 
                      margin: '0.5rem 0', 
                      fontSize: 'clamp(0.9rem, 2.5vw, 1rem)', 
                      color: galerieTheme.muted,
                      lineHeight: '1.4'
                    }}>
                      {getCategoryLabel(artwork.category)}
                      {artwork.artist && ` • ${artwork.artist}`}
                    </p>
                    {artwork.location && (
                      <p style={{ 
                        margin: '0.25rem 0', 
                        fontSize: 'clamp(0.75rem, 2vw, 0.85rem)', 
                        color: galerieTheme.accent,
                        fontWeight: '500'
                      }}>
                        📍 {artwork.location}
                      </p>
                    )}
                    {/* Erweiterte Beschreibung mit allen Details */}
                    <div style={{ 
                      margin: '0.75rem 0', 
                      fontSize: 'clamp(0.8rem, 2.2vw, 0.9rem)', 
                      color: galerieTheme.muted,
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
                              {artwork.ceramicSubcategory === 'vase' ? 'Gefäße - Vasen' : 
                               artwork.ceramicSubcategory === 'teller' ? 'Schalen - Teller' : 
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
                    {artwork.price != null && (Number(artwork.price) || 0) > 0 && (
                      <p style={musterOnly ? { 
                        margin: '0.75rem 0 0', 
                        fontWeight: '700', 
                        color: galerieTheme.accent,
                        fontSize: 'clamp(1.1rem, 3vw, 1.3rem)'
                      } : { 
                        margin: '0.75rem 0 0', 
                        fontWeight: '700', 
                        background: galerieTheme.priceBg,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontSize: 'clamp(1.1rem, 3vw, 1.3rem)'
                      }}>
                        € {(Number(artwork.price) || 0).toFixed(2)}
                      </p>
                    )}
                    {/* Auswahl: anzeigen wenn im Shop (nur bei explizit false ausblenden) */}
                    {!isSold && artwork.inShop !== false && (
                      <button
                        onClick={() => {
                          if (addToCart(artwork)) {
                            if (musterOnly) try { sessionStorage.setItem('k2-shop-from-oeffentlich', '1') } catch (_) {}
                            navigate(PROJECT_ROUTES['k2-galerie'].shop, { state: { fromGalerieView: true, fromOeffentlich: musterOnly } })
                          }
                        }}
                        style={{
                          width: '100%',
                          marginTop: '0.75rem',
                          padding: 'clamp(0.5rem, 1.5vw, 0.65rem) clamp(0.75rem, 2vw, 1rem)',
                          background: musterOnly ? 'rgba(0,0,0,0.08)' : 'rgba(102, 126, 234, 0.2)',
                          color: galerieTheme.accent,
                          border: `1px solid ${galerieTheme.btnBorder}`,
                          borderRadius: '8px',
                          fontSize: 'clamp(0.8rem, 2.2vw, 0.9rem)',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = musterOnly ? 'rgba(0,0,0,0.12)' : 'rgba(102, 126, 234, 0.3)'
                          e.currentTarget.style.borderColor = musterOnly ? 'rgba(0,0,0,0.25)' : 'rgba(102, 126, 234, 0.5)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = musterOnly ? 'rgba(0,0,0,0.08)' : 'rgba(102, 126, 234, 0.2)'
                          e.currentTarget.style.borderColor = galerieTheme.btnBorder
                        }}
                      >
                        Gefällt mir – möchte ich erwerben
                      </button>
                    )}
                    {/* Info wenn Werk explizit nur für Ausstellung markiert */}
                    {!isSold && artwork.inShop === false && (
                      <p style={{
                        width: '100%',
                        marginTop: '1rem',
                        padding: 'clamp(0.75rem, 2vw, 1rem)',
                        background: galerieTheme.filterInactive,
                        color: galerieTheme.muted,
                        border: `1px solid ${galerieTheme.border}`,
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

            {/* Teilen: Link kopieren – direkter Link zu diesem Werk */}
            {lightboxImage.artwork && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  const idOrNum = lightboxImage.artwork.number ?? lightboxImage.artwork.id ?? ''
                  const url = `${window.location.origin}${window.location.pathname}#werk=${encodeURIComponent(String(idOrNum))}`
                  navigator.clipboard.writeText(url).then(() => {
                    setShareLinkCopied(true)
                    setTimeout(() => setShareLinkCopied(false), 2500)
                  }).catch(() => {
                    try {
                      const ta = document.createElement('textarea')
                      ta.value = url
                      document.body.appendChild(ta)
                      ta.select()
                      document.execCommand('copy')
                      document.body.removeChild(ta)
                      setShareLinkCopied(true)
                      setTimeout(() => setShareLinkCopied(false), 2500)
                    } catch (_) {}
                  })
                }}
                title="Link zu diesem Werk kopieren (zum Teilen per Mail, Social, Flyer)"
                style={{
                  background: shareLinkCopied ? 'rgba(34, 197, 94, 0.4)' : 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#ffffff',
                  fontSize: 'clamp(0.8rem, 2vw, 0.95rem)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease'
                }}
              >
                {shareLinkCopied ? '✓ Link kopiert!' : '🔗 Link kopieren'}
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
            {lightboxImage.artwork && lightboxImage.artwork.inShop !== false && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  addToCart(lightboxImage.artwork)
                  if (musterOnly) try { sessionStorage.setItem('k2-shop-from-oeffentlich', '1') } catch (_) {}
                  navigate(PROJECT_ROUTES['k2-galerie'].shop, { state: { fromGalerieView: true, fromOeffentlich: musterOnly } })
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

          {/* Vor/Zurück – Seitenpfeile */}
          {lightboxImage.allArtworks != null && lightboxImage.currentIndex != null && (
            <>
              {lightboxImage.currentIndex > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    const list = lightboxImage.allArtworks!
                    const prev = list[lightboxImage.currentIndex! - 1]
                    const src = prev?.imageUrl || prev?.previewUrl || ''
                    if (src) {
                      setLightboxImage({ src, title: prev?.title || prev?.number || '', artwork: prev, allArtworks: list, currentIndex: lightboxImage.currentIndex! - 1 })
                      setImageZoom(1)
                      setImagePosition({ x: 0, y: 0 })
                    }
                  }}
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    color: '#fff',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  aria-label="Vorheriges Werk"
                >
                  ‹
                </button>
              )}
              {lightboxImage.currentIndex < lightboxImage.allArtworks!.length - 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    const list = lightboxImage.allArtworks!
                    const next = list[lightboxImage.currentIndex! + 1]
                    const src = next?.imageUrl || next?.previewUrl || ''
                    if (src) {
                      setLightboxImage({ src, title: next?.title || next?.number || '', artwork: next, allArtworks: list, currentIndex: lightboxImage.currentIndex! + 1 })
                      setImageZoom(1)
                      setImagePosition({ x: 0, y: 0 })
                    }
                  }}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    color: '#fff',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  aria-label="Nächstes Werk"
                >
                  ›
                </button>
              )}
            </>
          )}

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
            background: 'linear-gradient(135deg, var(--k2-bg-2) 0%, var(--k2-bg-1) 100%)',
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
                onChange={(e) => setMobileCategory(e.target.value as ArtworkCategoryId)}
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
                {ARTWORK_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
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
                    // Kategorie-basiert: M/K/G/S/O (max 5 Kategorien)
                    const prefix = getCategoryPrefixLetter(mobileCategory)
                    const categoryPrefix = `K2-${prefix}-`
                    
                    let maxNumber = 0
                    artworks.forEach((a: any) => {
                      if (!a.number) return
                      
                      if (a.number.startsWith(categoryPrefix)) {
                        const numStr = a.number.replace(categoryPrefix, '').replace(/[^0-9]/g, '')
                        const num = parseInt(numStr || '0')
                        if (num > maxNumber) {
                          maxNumber = num
                        }
                      }
                      else if (a.number.startsWith('K2-') && !a.number.includes('-K-') && !a.number.includes('-M-') && !a.number.includes('-G-') && !a.number.includes('-S-') && !a.number.includes('-O-')) {
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
                    const now = new Date().toISOString()
                    const newArtwork = {
                      id: `artwork-${Date.now()}`,
                      number: newNumber,
                      title: mobileTitle,
                      category: mobileCategory,
                      imageUrl: mobilePhoto || PLACEHOLDER_KEIN_BILD,
                      price: mobilePrice ? parseFloat(mobilePrice) : undefined,
                      description: mobileDescription || undefined,
                      location: locationString,
                      createdAt: now,
                      addedToGalleryAt: now, // Zeitstempel: wann in Galerie aufgenommen
                      updatedAt: now, // WICHTIG: updatedAt für Merge-Logik
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
                            // Supabase übernimmt die Sync – kein Alert nötig
                            console.log('ℹ️ Auf Vercel: Supabase-Sync läuft, gallery-data.json nicht nötig')
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
                    // Etikett-Modal öffnen statt Alert
                    const savedNewArtwork = { number: newNumber, title: mobileTitle, category: mobileCategory, price: mobilePrice ? parseFloat(mobilePrice) : undefined }
                    setEtikettArtwork(savedNewArtwork)
                    setShowEtikettModal(true)
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
            background: 'linear-gradient(135deg, var(--k2-bg-2) 0%, var(--k2-bg-1) 100%)',
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

      {/* Etikett-Modal nach Speichern eines neuen Werks am iPad */}
      {showEtikettModal && etikettArtwork && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', zIndex: 30000,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '1.5rem'
        }}>
          <div style={{
            background: '#1a1a2e', borderRadius: '20px', padding: '2rem',
            maxWidth: '360px', width: '100%', textAlign: 'center',
            border: '2px solid rgba(95,251,241,0.4)', boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
            <h2 style={{ color: '#5ffbf1', margin: '0 0 0.25rem', fontSize: '1.3rem' }}>Werk gespeichert!</h2>
            <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0' }}>
              {etikettArtwork.number}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', marginBottom: '0.25rem' }}>
              {etikettArtwork.title}
            </div>
            {etikettArtwork.price && (
              <div style={{ color: '#10b981', fontWeight: 700, marginBottom: '0.5rem' }}>
                € {etikettArtwork.price}
              </div>
            )}

            {/* QR-Code für Kassa-Scan */}
            <div style={{ margin: '1.25rem 0', background: '#fff', borderRadius: '12px', padding: '0.75rem', display: 'inline-block' }}>
              <EtikettQrCode nummer={etikettArtwork.number} />
            </div>

            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', margin: '0 0 1.25rem' }}>
              QR-Code für Kassa-Scan – Screenshot oder am Mac Etikett drucken
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Screenshot-Hinweis */}
              <button
                onClick={async () => {
                  // Teilen via Web Share API (iPad/iPhone)
                  if (navigator.share) {
                    try {
                      await navigator.share({
                        title: `Etikett ${etikettArtwork.number}`,
                        text: `Werk: ${etikettArtwork.title}\nNummer: ${etikettArtwork.number}${etikettArtwork.price ? `\nPreis: € ${etikettArtwork.price}` : ''}`
                      })
                    } catch (_) {}
                  } else {
                    alert(`Werksnummer: ${etikettArtwork.number}\nTitel: ${etikettArtwork.title}${etikettArtwork.price ? `\nPreis: € ${etikettArtwork.price}` : ''}`)
                  }
                }}
                style={{
                  background: 'rgba(95,251,241,0.15)', border: '1.5px solid #5ffbf1',
                  color: '#5ffbf1', borderRadius: '10px', padding: '0.75rem',
                  fontSize: '1rem', fontWeight: 700, cursor: 'pointer'
                }}
              >
                📤 Teilen / Notieren
              </button>
              <button
                onClick={() => { setShowEtikettModal(false); setEtikettArtwork(null) }}
                style={{
                  background: 'linear-gradient(120deg, #10b981, #059669)', border: 'none',
                  color: '#fff', borderRadius: '10px', padding: '0.75rem',
                  fontSize: '1rem', fontWeight: 700, cursor: 'pointer'
                }}
              >
                ✓ OK – weiter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}

// Kleiner QR-Code-Generator für das Etikett-Modal (inline, kein Import nötig)
function EtikettQrCode({ nummer }: { nummer: string }) {
  const [qrSrc, setQrSrc] = React.useState<string | null>(null)
  React.useEffect(() => {
    let cancelled = false
    import('qrcode').then(QRCode => {
      const url = `https://k2-galerie.vercel.app/projects/k2-galerie/galerie-vorschau?q=${encodeURIComponent(nummer)}`
      QRCode.default.toDataURL(url, { width: 180, margin: 1, color: { dark: '#000000', light: '#ffffff' } })
        .then(dataUrl => { if (!cancelled) setQrSrc(dataUrl) })
        .catch(() => {})
    })
    return () => { cancelled = true }
  }, [nummer])
  if (!qrSrc) return <div style={{ width: 180, height: 180, background: '#eee', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '0.8rem' }}>Lädt…</div>
  return <img src={qrSrc} alt={`QR ${nummer}`} style={{ width: 180, height: 180, display: 'block' }} />
}

export default GalerieVorschauPage
