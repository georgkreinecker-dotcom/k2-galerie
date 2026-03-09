import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { PROJECT_ROUTES, WILLKOMMEN_NAME_KEY, WILLKOMMEN_ENTWURF_KEY, MEIN_BEREICH_ROUTE } from '../config/navigation'
import { MUSTER_ARTWORKS, ARTWORK_CATEGORIES, getCategoryLabel, getCategoryPrefixLetter, getOek2DefaultArtworkImage, OEK2_PLACEHOLDER_IMAGE, type ArtworkCategoryId, initVk2DemoStammdatenIfEmpty } from '../config/tenantConfig'
import { 
  syncMobileToSupabase, 
  checkMobileUpdates, 
  saveArtworksToSupabase,
  loadArtworksFromSupabase,
  isSupabaseConfigured
} from '../utils/supabaseClient'
import { sortArtworksFavoritesFirstThenNewest, interleaveArtworksByCategory } from '../utils/artworkSort'
import { appendToHistory } from '../utils/artworkHistory'
import { tryFreeLocalStorageSpace, SPEICHER_VOLL_MELDUNG } from '../../components/SafeMode'
import { readArtworksRawForContext, readArtworksRawForContextOrNull, readArtworksForContextWithResolvedImages, resolveArtworkImages, saveArtworksForContext, loadForDisplay, filterK2Only as filterK2OnlyStorage, saveArtworksOnly as saveArtworksStorage, mayWriteServerList, mergeAndMaybeWrite, mergeWithPending, getPendingArtworks, addPendingArtwork, clearPendingIfInList } from '../utils/artworksStorage'
import { loadEvents } from '../utils/eventsStorage'
import { loadDocuments } from '../utils/documentsStorage'
import { mergeServerWithLocal, preserveLocalImageData, updateKnownServerMaxNumbers, getKnownServerMaxForPrefix, renumberCollidingLocalArtworks } from '../utils/syncMerge'
import { artworksForExport } from '../utils/artworkExport'
// Fotos für neue Werke nur im Admin (Neues Werk hinzufügen) – dort Option Freistellen/Original
import '../App.css'

// Phase 5.2: Lesen nur über Artworks-Schicht (K2)
function loadArtworks(): any[] {
  return readArtworksRawForContext(false, false)
}

/** K2: Werke mit aufgelösten Bildern (IndexedDB imageRef → imageUrl) + Platzhalter. Nur „In Online-Galerie anzeigen“ (inExhibition === true). */
async function loadArtworksResolvedForDisplay(): Promise<any[]> {
  const resolved = await readArtworksForContextWithResolvedImages(false, false)
  const withPending = mergeWithPending(resolved || [])
  const forExhibition = filterInExhibitionOnly(withPending)
  const placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5LZWluIEJpbGQ8L3RleHQ+PC9zdmc+'
  return forExhibition.map((a: any) => {
    const out = { ...a }
    if (!out.imageUrl && out.previewUrl) out.imageUrl = out.previewUrl
    if (!out.imageUrl && !out.previewUrl) out.imageUrl = placeholder
    return out
  })
}

/** localStorage: Hinweis „Icon zum Startbildschirm hinzufügen“ geschlossen – gleicher Key wie GaleriePage (einmal OK reicht) */
const KEY_PWA_ICON_HINT_CLOSED = 'k2-pwa-icon-hint-closed'

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

/** Nur Werke die „In Online-Galerie anzeigen“ haben (Checkbox im Admin). inExhibition === true. */
function filterInExhibitionOnly(artworks: any[]): any[] {
  if (!Array.isArray(artworks)) return []
  return artworks.filter((a: any) => a && a.inExhibition === true)
}

/** Prüft, ob eine URL ein inline SVG-Platzhalter ist (ök2: dann Kategorie-Standardbild nutzen). */
function isPlaceholderImageUrl(url: string | undefined): boolean {
  return !url || (typeof url === 'string' && url.startsWith('data:image/svg+xml'))
}

/** ök2: Werke über Schicht (Phase 5.2). null = Key fehlt (erste Nutzung → Muster anzeigen), [] = User hat alle gelöscht. */
function loadOeffentlichArtworks(): any[] | null {
  try {
    const parsed = readArtworksRawForContextOrNull(true)
    if (parsed === null) return null
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

/** VK2 hat KEINE Werke – nur Mitglieder. Diese Funktion lädt Mitglieder aus k2-vk2-stammdaten
 *  und wandelt sie in Karten-Objekte für die Galerie-Vorschau um (Porträt + Kunstbereich). */
function loadVk2Mitglieder(): any[] {
  try {
    // Sicherstellen dass Demo-Daten vorhanden sind (falls direkt auf Vorschau navigiert)
    initVk2DemoStammdatenIfEmpty()
    const raw = localStorage.getItem('k2-vk2-stammdaten')
    if (!raw) return []
    const parsed = JSON.parse(raw)
    const mitglieder: any[] = Array.isArray(parsed?.mitglieder) ? parsed.mitglieder : []
    if (mitglieder.length === 0) return []
    return mitglieder
      .filter((m: any) => m?.name && m?.oeffentlichSichtbar !== false)
      .map((m: any, i: number) => ({
        id: `vk2-mitglied-${i}`,
        number: `VK2-${String(i + 1).padStart(2, '0')}`,
        title: m.name,
        category: m.typ?.toLowerCase() || 'sonstiges',
        description: m.typ ? `${m.typ}${m.ort ? ' · ' + m.ort : ''}` : '',
        bio: m.bio || '',
        // Link: eigene K2-Galerie (galerieLinkUrl) hat Vorrang, sonst externe website
        linkUrl: m.galerieLinkUrl || m.website || '',
        isK2Lizenz: !!(m.lizenz && m.lizenz.trim()),
        imageUrl: m.mitgliedFotoUrl || m.imageUrl || '',
        price: 0,
        inShop: false,
        inExhibition: true,
      }))
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

// Phase 1.2: Schreiben nur über Schicht (k2-artworks).
function saveArtworks(artworks: any[]): boolean {
  const toSave = filterK2ArtworksOnly(artworks)
  const currentArtworks = loadArtworks()
  if (currentArtworks && currentArtworks.length > 0) createBackup(currentArtworks)
  if (toSave.length === 0 && currentArtworks && currentArtworks.length > 0) {
    const backup = loadBackup()
    if (backup && backup.length > 0) {
      saveArtworksForContext(false, false, backup, { allowReduce: true })
      alert('⚠️ KRITISCH: Alle Werke würden gelöscht werden!\n\n💾 Backup wurde wiederhergestellt.')
      return false
    }
    alert('⚠️ KRITISCH: Alle Werke würden gelöscht werden!\n\n❌ Kein Backup verfügbar!')
    return false
  }
  let ok = saveArtworksForContext(false, false, toSave, { allowReduce: true })
  if (!ok && toSave.length > 0) {
    const freed = tryFreeLocalStorageSpace()
    if (freed > 0) ok = saveArtworksForContext(false, false, toSave, { allowReduce: true })
    if (!ok) {
      const backup = loadBackup()
      if (backup?.length) saveArtworksForContext(false, false, backup, { allowReduce: true })
      alert('⚠️ ' + SPEICHER_VOLL_MELDUNG)
    }
  }
  if (ok) console.log('✅ Gespeichert:', toSave.length, 'Werke', toSave.length < artworks.length ? '(Muster/VK2 entfernt)' : '')
  return ok
}

type Filter = 'alle' | ArtworkCategoryId

const GalerieVorschauPage = ({ initialFilter, musterOnly = false, vk2 = false }: { initialFilter?: Filter; musterOnly?: boolean; vk2?: boolean }) => {
  const navigate = useNavigate()
  const location = useLocation()

  // EINE QUELLE je Kontext (von Mac oder Mobil gespeist): K2 = k2-artworks + Pending, ök2 = k2-oeffentlich-artworks / MUSTER_ARTWORKS, VK2 = k2-vk2-stammdaten. Nur lesen, nie still überschreiben.
  const initialArtworks = (() => {
    if (vk2) {
      return loadVk2Mitglieder()
    }
    if (musterOnly) {
      const oef = loadOeffentlichArtworks()
      if (oef === null) return [...MUSTER_ARTWORKS]
      return oef
    }
    const list = loadForDisplay()
    const withPending = list.length > 0 || getPendingArtworks().length > 0 ? mergeWithPending(list) : []
    if (withPending.length > 0) {
      return withPending.map((a: any) => {
        const out = { ...a }
        if (!out.imageUrl && out.previewUrl) out.imageUrl = out.previewUrl
        if (!out.imageUrl && !out.previewUrl) {
          out.imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5LZWluIEJpbGQ8L3RleHQ+PC9zdmc+'
        }
        return out
      })
    }
    return []
  })()
  
  const [artworks, setArtworks] = useState<any[]>(initialArtworks)
  const [filter, setFilter] = useState<Filter>(initialFilter || 'alle')
  const [cartCount, setCartCount] = useState(0)

  /** K2: Anzeige-Liste = Hauptliste + Pending (neu gespeicherte Werke bleiben sichtbar, auch wenn etwas überschreibt). */
  const setArtworksDisplay = useCallback((list: any[]) => {
    if (musterOnly || vk2) {
      setArtworks(list)
      return
    }
    clearPendingIfInList(list)
    setArtworks(mergeWithPending(list))
  }, [musterOnly, vk2])

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

  // Willkommens-Banner (Erster Entwurf): von WillkommenPage oder EntdeckenPage mit Namen → einmalig anzeigen
  const [willkommenName, setWillkommenName] = useState<string | null>(null)
  const [willkommenBannerDismissed, setWillkommenBannerDismissed] = useState(false)
  // Guide (Otto) erst nach kurzer Verzögerung – zuerst die Galerie sehen, nicht sofort überfordern
  const [showGuideAfterDelay, setShowGuideAfterDelay] = useState(false)
  // PWA-Icon-Hinweis: nur Mobile, nicht Standalone, gleicher Key wie GaleriePage
  const [showPwaIconHint, setShowPwaIconHint] = useState(false)
  /** ök2 „User reinziehen“: Erste Aktion nach „Galerie ausprobieren“ – einmalig anzeigen, dann ausblendbar */
  const [ersteAktionDismissed, setErsteAktionDismissed] = useState(() => {
    try { return sessionStorage.getItem('k2-oek2-erste-aktion-dismissed') === '1' } catch { return false }
  })
  /** Immer anzeigen für ök2-Besucher (Fremde), bis sie schließen – „So könnte deine Galerie aussehen“ */
  const showErsteAktionBanner = musterOnly && !ersteAktionDismissed

  /** Fremde: Direktaufruf der ök2-Vorschau → zuerst ök2-Willkommensseite. Ausnahme: Klick „Galerie betreten“ von galerie-oeffentlich (State oder Referrer). */
  useEffect(() => {
    if (!musterOnly || typeof window === 'undefined') return
    try {
      if (new URLSearchParams(window.location.search).get('embedded') === '1') return
      if ((location.state as { fromOeffentlichGalerie?: boolean } | null)?.fromOeffentlichGalerie === true) return
      const ref = typeof document !== 'undefined' ? document.referrer : ''
      if (ref && (ref.includes('/galerie-oeffentlich') || ref.includes('/entdecken'))) return
      navigate(PROJECT_ROUTES['k2-galerie'].galerieOeffentlich, { replace: true })
    } catch (_) {}
  }, [musterOnly, navigate, location.state])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768
    const standalone = (window.navigator as any).standalone === true || window.matchMedia('(display-mode: standalone)').matches
    try {
      const closed = localStorage.getItem(KEY_PWA_ICON_HINT_CLOSED) === '1'
      setShowPwaIconHint(mobile && !standalone && !closed)
    } catch (_) { setShowPwaIconHint(false) }
  }, [])
  useEffect(() => {
    if (!musterOnly || !willkommenName || willkommenBannerDismissed) return
    const t = setTimeout(() => setShowGuideAfterDelay(true), 3000)
    return () => clearTimeout(t)
  }, [musterOnly, willkommenName, willkommenBannerDismissed])
  useEffect(() => {
    if (!musterOnly) return
    try {
      // 1. URL-Parameter (zuverlässig auch nach sessionStorage.clear)
      const params = new URLSearchParams(window.location.search)
      const urlName = params.get('vorname')
      const urlEntwurf = params.get('entwurf')
      if (urlName && urlName.trim() && urlEntwurf === '1') {
        setWillkommenName(urlName.trim())
        try {
          sessionStorage.setItem(WILLKOMMEN_NAME_KEY, urlName.trim())
          sessionStorage.setItem(WILLKOMMEN_ENTWURF_KEY, '1')
        } catch (_) {}
        return
      }
      // 2. sessionStorage (von WillkommenPage / EntdeckenPage)
      const n = sessionStorage.getItem(WILLKOMMEN_NAME_KEY) || localStorage.getItem(WILLKOMMEN_NAME_KEY)
      const e = sessionStorage.getItem(WILLKOMMEN_ENTWURF_KEY) || localStorage.getItem(WILLKOMMEN_ENTWURF_KEY)
      if (n && n.trim() && e === '1') setWillkommenName(n.trim())
    } catch (_) {}
  }, [musterOnly])
  const dismissWillkommenBanner = () => {
    setWillkommenBannerDismissed(true)
    try {
      sessionStorage.removeItem(WILLKOMMEN_ENTWURF_KEY)
    } catch (_) {}
  }
  const dismissErsteAktionBanner = () => {
    setErsteAktionDismissed(true)
    try { sessionStorage.setItem('k2-oek2-erste-aktion-dismissed', '1') } catch (_) {}
  }

  // ök2 / VK2: Einträge aus dem jeweiligen Speicher anzeigen
  useEffect(() => {
    if (vk2) {
      setArtworks(loadVk2Mitglieder())
      return
    }
    if (musterOnly) {
      const oef = loadOeffentlichArtworks()
      setArtworks(oef === null ? [...MUSTER_ARTWORKS] : oef)
    }
  }, [musterOnly, vk2])

  // K2: Direkt nach Mount einmal aus localStorage + IndexedDB (aufgelöste Bilder) + Pending nachziehen
  useEffect(() => {
    if (musterOnly || vk2) return
    const placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5LZWluIEJpbGQ8L3RleHQ+PC9zdmc+'
    let cancelled = false
    const t = setTimeout(() => {
      readArtworksForContextWithResolvedImages(false, false).then((resolved) => {
        if (cancelled) return
        const withPending = mergeWithPending(resolved || [])
        const forExhibition = filterInExhibitionOnly(withPending)
        if (forExhibition.length > 0) {
          const withImages = forExhibition.map((a: any) => {
            const out = { ...a }
            if (!out.imageUrl && out.previewUrl) out.imageUrl = out.previewUrl
            if (!out.imageUrl && !out.previewUrl) out.imageUrl = placeholder
            return out
          })
          setArtworksDisplay(withImages)
        }
      })
    }, 150)
    return () => { cancelled = true; clearTimeout(t) }
  }, [musterOnly, vk2])

  // K2 / ök2 / VK2: Nach Speichern im Admin aktualisieren (K2: mit aufgelösten Bildern aus IndexedDB)
  useEffect(() => {
    const onUpdated = () => {
      if (vk2) {
        setArtworks(loadVk2Mitglieder())
        return
      }
      if (musterOnly) {
        const oef = loadOeffentlichArtworks()
        setArtworks(oef === null ? [...MUSTER_ARTWORKS] : oef)
        return
      }
      readArtworksForContextWithResolvedImages(false, false).then((stored) => {
        if (stored && stored.length > 0) {
          const forExhibition = filterInExhibitionOnly(mergeWithPending(stored))
          if (forExhibition.length > 0) {
            const placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5LZWluIEJpbGQ8L3RleHQ+PC9zdmc+'
            const withImages = forExhibition.map((a: any) => {
              const out = { ...a }
              if (!out.imageUrl && out.previewUrl) out.imageUrl = out.previewUrl
              if (!out.imageUrl && !out.previewUrl) out.imageUrl = placeholder
              return out
            })
            setArtworksDisplay(withImages)
          }
        }
      })
    }
    window.addEventListener('artworks-updated', onUpdated)
    return () => window.removeEventListener('artworks-updated', onUpdated)
  }, [musterOnly])

  // K2-Standard = Terracotta statt altes Blau (wie GaleriePage)
  const K2_ORANGE = React.useMemo(() => ({
    backgroundColor1: '#1c1210',
    backgroundColor2: '#2a1e1a',
    backgroundColor3: '#3d2c26',
    textColor: '#fdf6f2',
    mutedColor: '#c49a88',
    accentColor: '#d97a50',
    cardBg1: 'rgba(45, 34, 30, 0.95)',
    cardBg2: 'rgba(28, 20, 18, 0.92)'
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
  const designStorageKey = musterOnly ? 'k2-oeffentlich-design-settings' : vk2 ? 'k2-vk2-design-settings' : 'k2-design-settings'
  const applyDesignFromStorage = React.useCallback(() => {
    try {
      const stored = localStorage.getItem(designStorageKey)
      if (!stored || stored.length > 50000) return
      const design = JSON.parse(stored) as Record<string, string>
      const use = isOldBlueTheme(design) ? K2_ORANGE : design
      if (isOldBlueTheme(design)) localStorage.setItem(designStorageKey, JSON.stringify(K2_ORANGE))
      applyDesignToDocument(use)
    } catch (_) {}
  }, [applyDesignToDocument, K2_ORANGE, isOldBlueTheme, designStorageKey])
  useEffect(() => {
    const fromState = (location.state as { designSettings?: Record<string, string> } | null)?.designSettings
    if (fromState && typeof fromState === 'object' && (fromState.accentColor || fromState.backgroundColor1)) {
      try {
        if (isOldBlueTheme(fromState)) localStorage.setItem(designStorageKey, JSON.stringify(K2_ORANGE))
        else localStorage.setItem(designStorageKey, JSON.stringify(fromState))
      } catch (_) {}
    }
    applyDesignFromStorage()
    const onStorage = (e: StorageEvent) => {
      if (e.key === designStorageKey) applyDesignFromStorage()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [applyDesignFromStorage, designStorageKey, location.state])

  // Admin-Kontext nur beenden, wenn Nutzer bewusst aus dem Admin „Zur Galerie“ geklickt hat (nicht bei direktem Aufruf/Mobil → Kassa bleibt nutzbar)
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
  const [anfrageArtwork, setAnfrageArtwork] = useState<any>(null) // Werk für das eine Anfrage gestellt wird
  const [anfrageName, setAnfrageName] = useState('')
  const [anfrageEmail, setAnfrageEmail] = useState('')
  const [anfrageNachricht, setAnfrageNachricht] = useState('')
  const [anfrageSent, setAnfrageSent] = useState(false)
  const [mobileDescription, setMobileDescription] = useState('')
  const [mobileLocationType, setMobileLocationType] = useState<'regal' | 'bildflaeche' | 'sonstig' | ''>('')
  const [mobileLocationNumber, setMobileLocationNumber] = useState('')
  const [mobileInExhibition, setMobileInExhibition] = useState(true) // „In Online-Galerie anzeigen“ – auf Handy oft gewünscht
  const [isSaving, setIsSaving] = useState(false)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [showLocationQR, setShowLocationQR] = useState(false)
  const [showEtikettModal, setShowEtikettModal] = useState(false)
  const [etikettArtwork, setEtikettArtwork] = useState<any>(null)
  const [etikettQrUrl, setEtikettQrUrl] = useState<string | null>(null)
  const qrScannerVideoRef = useRef<HTMLVideoElement>(null)
  const qrScannerCanvasRef = useRef<HTMLCanvasElement>(null)
  const adminLoadMountedRef = useRef(true)
  
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
    setMobileInExhibition(artwork.inExhibition === true)
    
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
    setMobileInExhibition(true) // Standard: in Galerie anzeigen (Handy-Wunsch)
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

  // EINE QUELLE für K2 und ök2 – kann von Mac oder Mobil gespeist werden, kein Überschreiben durch Server beim Laden
  // K2: k2-artworks + Pending (Admin/Neues Werk auf Mac oder Mobil schreibt in k2-artworks)
  // ök2: k2-oeffentlich-artworks bzw. MUSTER_ARTWORKS (Admin context=oeffentlich auf Mac oder Mobil)
  // musterOnly (ök2) und vk2: eigener useEffect setzt Liste; hier nur K2-Daten laden
  useEffect(() => {
    if (musterOnly) return () => {}
    if (vk2) return () => {}
    adminLoadMountedRef.current = true
    let isMounted = true
    let delayedReadTimeoutId: ReturnType<typeof setTimeout> | null = null
    
    // Backup beim Start erstellen – NUR LESEN, nie still filtern/zurückschreiben
    // 🔒 REGEL: Kein automatisches Löschen von Kundendaten – nur warnen wenn Muster-Nummern gefunden
    const rawOnMount = loadArtworks()
    if (rawOnMount && rawOnMount.length > 0) {
      createBackup(rawOnMount)
      console.log('💾 Initiales Backup erstellt:', rawOnMount.length, 'Werke')
      const verdaechtig = rawOnMount.filter((a: any) => isMusterOrVk2Artwork(a))
      if (verdaechtig.length > 0) {
        console.warn('⚠️ Verdächtige Einträge in k2-artworks gefunden (Muster-Nummern?):', verdaechtig.map((a: any) => a.number || a.id))
        // NICHT automatisch löschen – nur warnen. User entscheidet.
      }
    }
    
    const loadArtworksData = async () => {
      // K2: Eine Quelle – localStorage + IndexedDB (aufgelöste Bilder) + Pending
      const resolved = await readArtworksForContextWithResolvedImages(false, false)
      const withPending = mergeWithPending(resolved || [])
      if (withPending.length > 0) {
        const placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5LZWluIEJpbGQ8L3RleHQ+PC9zdmc+'
        const withImages = withPending.map((a: any) => {
          const out = { ...a }
          if (!out.imageUrl && out.previewUrl) out.imageUrl = out.previewUrl
          if (!out.imageUrl && !out.previewUrl) out.imageUrl = placeholder
          return out
        })
        setArtworksDisplay(withImages)
        setLoadStatus({ message: `✅ ${withImages.length} Werke`, success: true })
        setTimeout(() => setLoadStatus(null), 2000)
        setIsLoading(false)
        console.log('✅ K2 Galerie: eine Quelle (localStorage + IndexedDB + Pending) –', withImages.length, 'Werke')
        // Kurz verzögert nochmal lesen: falls Admin-Save gerade fertig wurde (Navigation direkt nach Speichern)
        delayedReadTimeoutId = setTimeout(() => {
          if (!isMounted) return
          readArtworksForContextWithResolvedImages(false, false).then((again) => {
            if (!isMounted) return
            const againPending = mergeWithPending(again || [])
            if (againPending.length > withImages.length) {
              const againWithImages = againPending.map((a: any) => {
                const out = { ...a }
                if (!out.imageUrl && out.previewUrl) out.imageUrl = out.previewUrl
                if (!out.imageUrl && !out.previewUrl) out.imageUrl = placeholder
                return out
              })
              setArtworksDisplay(againWithImages)
              console.log('✅ K2 Galerie: Nachzug –', againWithImages.length, 'Werke (nach Admin-Save)')
            }
          })
        }, 200)
      }
      
      // Keine lokalen Daten: dann erst Supabase/gallery-data (z. B. anderes Gerät)
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
              // KRITISCH: Nie localStorage mit weniger Werken überschreiben (lokale Neu-Anlagen gehen sonst verloren)
              const currentLocal = loadArtworks()
              const lokalAnzahl = currentLocal?.length ?? 0
              if (filteredSupabase.length < lokalAnzahl) {
                console.warn(`⚠️ Supabase hat ${filteredSupabase.length} Werke, lokal ${lokalAnzahl} – behalte lokale Daten, überschreibe NICHT`)
                loadArtworksResolvedForDisplay().then((resolved) => {
                  if (isMounted && resolved.length > 0) setArtworksDisplay(filterK2ArtworksOnly(resolved))
                })
                setLoadStatus({ message: `✅ ${lokalAnzahl} Werke (lokal)`, success: true })
              } else {
                console.log(`✅ ${filteredSupabase.length} Werke aus Supabase geladen`)
                if (mayWriteServerList(filteredSupabase, lokalAnzahl)) {
                  const toSave = preserveLocalImageData(filteredSupabase, loadArtworks())
                  saveArtworksStorage(toSave, { allowReduce: false })
                }
                // Supabase-Daten haben oft nur imageRef – Bilder aus IndexedDB auflösen, sonst fehlen sie in der Galerie
                const resolved = await resolveArtworkImages(filteredSupabase)
                const forExhibition = filterInExhibitionOnly(resolved)
                const withPlaceholder = forExhibition.map((a: any) => {
                  const out = { ...a }
                  if (!out.imageUrl && out.previewUrl) out.imageUrl = out.previewUrl
                  if (!out.imageUrl && !out.previewUrl) out.imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5LZWluIEJpbGQ8L3RleHQ+PC9zdmc+'
                  return out
                })
                setArtworksDisplay(withPlaceholder)
                setLoadStatus({ message: `✅ ${withPlaceholder.length} Werke geladen`, success: true })
              }
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
                  const resolvedMigrated = await resolveArtworkImages(filteredMigrated)
                  const forExhibitionMigrated = filterInExhibitionOnly(resolvedMigrated)
                  const withPlaceholderMigrated = forExhibitionMigrated.map((a: any) => {
                    const out = { ...a }
                    if (!out.imageUrl && out.previewUrl) out.imageUrl = out.previewUrl
                    if (!out.imageUrl && !out.previewUrl) out.imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5LZWluIEJpbGQ8L3RleHQ+PC9zdmc+'
                    return out
                  })
                  setArtworksDisplay(withPlaceholderMigrated)
                  setLoadStatus({ message: `✅ ${withPlaceholderMigrated.length} Werke migriert und geladen`, success: true })
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
        // WICHTIG: Mit aufgelösten Bildern (imageRef → imageUrl aus IndexedDB), sonst nur Platzhalter in Galerie
        if (isMounted) {
          const raw = loadArtworks()
          const rawFiltered = raw && raw.length > 0 ? filterK2ArtworksOnly(raw) : []
          if (rawFiltered.length > 0) {
            if (rawFiltered.length < (raw?.length ?? 0)) {
              console.warn('⚠️ Muster/VK2-Einträge in k2-artworks – nur Anzeige gefiltert, localStorage wird NICHT überschrieben')
            }
            const exhibitionArtworks = await loadArtworksResolvedForDisplay()
            const stored = filterK2ArtworksOnly(exhibitionArtworks)
            if (stored.length > 0 && isMounted) {
              const nummern = stored.map((a: any) => a.number || a.id).join(', ')
              const mobileWorks = stored.filter((a: any) => a.createdOnMobile || a.updatedOnMobile)
              console.log('💾 Gefunden in localStorage (mit aufgelösten Bildern):', stored.length, 'Werke, Nummern:', nummern)
              if (mobileWorks.length > 0) {
                console.log(`🔒 ${mobileWorks.length} lokale Mobile-Werke geschützt:`, mobileWorks.map((a: any) => a.number || a.id).join(', '))
              }
              setArtworksDisplay(stored)
              setLoadStatus({ message: `✅ ${stored.length} Werke geladen`, success: true })
              setTimeout(() => setLoadStatus(null), 2000)
              setIsLoading(false)
              return
            }
          } else {
            console.log('⚠️ Keine Werke in localStorage gefunden')
          }
        }
        
        // Keine Daten gefunden – vor Backup: nochmal lesen (Admin-Save könnte gerade fertig geworden sein)
        if (isMounted) {
          const currentNow = loadArtworks()
          if (currentNow.length > 0) {
            loadArtworksResolvedForDisplay().then((list) => {
              if (!isMounted) return
              const withImages = filterK2ArtworksOnly(list)
              setArtworksDisplay(withImages)
              setLoadStatus({ message: `✅ ${withImages.length} Werke`, success: true })
              setTimeout(() => setLoadStatus(null), 2000)
              setIsLoading(false)
            })
            return
          }
          console.log('ℹ️ Keine Werke gefunden')
          // KRITISCH: Backup nur für Anzeige; NIE mit weniger Werken in localStorage überschreiben
          const backup = loadBackup()
          if (backup && backup.length > 0) {
            console.log('💾 Backup gefunden - verwende Backup für Anzeige (resolved):', backup.length, 'Werke')
            const currentCount = loadArtworks().length
            if (backup.length >= currentCount) {
              saveArtworksForContext(false, false, backup, { allowReduce: true })
            } else {
              console.warn('⚠️ Backup hat weniger Werke als aktuell – localStorage wird NICHT überschrieben')
            }
            loadArtworksResolvedForDisplay().then((list) => {
              if (!isMounted) return
              setArtworksDisplay(filterK2ArtworksOnly(list))
            })
          } else {
            setArtworksDisplay([])
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
            // 🔒 SICHERHEIT: Nie mit leerer/kleinerer Liste überschreiben
            const lokalAnzahl = loadArtworks()?.length ?? 0
            if (artworks.length === 0) {
              console.warn('⚠️ Mobile-Sync: Server lieferte leere Liste – lokale Daten bleiben erhalten')
              return
            }
            if (artworks.length < lokalAnzahl * 0.5) {
              console.warn(`⚠️ Mobile-Sync: Server lieferte nur ${artworks.length} Werke, lokal sind ${lokalAnzahl} – Sync übersprungen (zu großer Unterschied)`)
              return
            }
            // 🔒 Nur schreiben wenn mindestens so viele wie lokal – nie mit weniger überschreiben (Datenverlust)
            if (artworks.length < lokalAnzahl) {
              console.warn(`⚠️ Mobile-Sync: Server hat ${artworks.length} < lokal ${lokalAnzahl} – localStorage bleibt unverändert`)
              return
            }
            console.log(`🔄 Automatisch ${artworks.length} neue Mobile-Daten synchronisiert`)
            saveArtworksForContext(false, false, artworks, { allowReduce: false })
            loadArtworksResolvedForDisplay().then((list) => { if (isMounted) setArtworksDisplay(filterK2ArtworksOnly(list)) })
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
    // (nur wenn nicht auf Vercel und auf Mobile-Gerät, nicht im iframe/Cursor Preview – Crash-Schutz)
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768
    const isVercel = window.location.hostname.includes('vercel.app')
    let mobilePollingInterval: ReturnType<typeof setInterval> | null = null
    let initialSyncTimeoutId: ReturnType<typeof setTimeout> | null = null
    
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
                // KRITISCH: Re-Lesen VOR dem Schreiben – zwischen Start des Syncs und jetzt könnte ein neues Werk gespeichert worden sein
                const nowCount = loadArtworks().length
                if (toSave.length < nowCount) {
                  console.warn(`⚠️ Sync würde ${nowCount} → ${toSave.length} reduzieren (neue Werke seit Sync-Start?) – überschreibe NICHT`)
                  loadArtworksResolvedForDisplay().then((list) => { if (isMounted) setArtworksDisplay(filterK2ArtworksOnly(list)) })
                  return
                }
                if (toSave.length < localCount) {
                  console.warn(`⚠️ Sync würde ${localCount} → ${toSave.length} reduzieren – überschreibe NICHT (lokale Werke schützen)`)
                  return
                }
                const ok = saveArtworksStorage(toSave, { allowReduce: false })
                if (ok) {
                  console.log(`🔄 Admin-Bereich: ${toSave.length} Werke synchronisiert`)
                  loadArtworksResolvedForDisplay().then((list) => { if (isMounted) setArtworksDisplay(filterK2ArtworksOnly(list)) })
                  window.dispatchEvent(new CustomEvent('artworks-updated', {
                    detail: { count: toSave.length, autoSync: true, fromAdmin: true }
                  }))
                } else {
                  loadArtworksResolvedForDisplay().then((list) => { if (isMounted) setArtworksDisplay(filterK2ArtworksOnly(list)) })
                }
              }
            } else {
              // Keine Server-Werke – nur Anzeige aktualisieren; vor Schreiben aktuellen Stand prüfen (kein Stale-Overwrite)
              if (localArtworks.length > 0 && isMounted) {
                const toKeep = filterK2ArtworksOnly(localArtworks)
                const nowCount = loadArtworks().length
                console.log(`🔒 Keine Server-Daten - ${toKeep.length} lokale Werke (Anzeige), aktuell ${nowCount} im Storage`)
                if (toKeep.length >= nowCount && toKeep.length >= localArtworks.length) {
                  saveArtworksStorage(toKeep, { allowReduce: false })
                } else if (toKeep.length < nowCount) {
                  console.warn(`⚠️ Sync: würde ${nowCount} → ${toKeep.length} reduzieren – localStorage NICHT überschrieben`)
                }
                loadArtworksResolvedForDisplay().then((list) => { if (isMounted) setArtworksDisplay(filterK2ArtworksOnly(list)) })
              }
            }
          } else {
            // Server nicht erreichbar – vor Schreiben aktuellen Stand prüfen
            if (localArtworks.length > 0 && isMounted) {
              const toKeep = filterK2ArtworksOnly(localArtworks)
              const nowCount = loadArtworks().length
              if (toKeep.length >= nowCount && toKeep.length >= localArtworks.length) {
                saveArtworksStorage(toKeep, { allowReduce: false })
              } else if (toKeep.length < nowCount) {
                console.warn(`⚠️ Sync: würde ${nowCount} → ${toKeep.length} reduzieren – localStorage NICHT überschrieben`)
              }
              loadArtworksResolvedForDisplay().then((list) => { if (isMounted) setArtworksDisplay(filterK2ArtworksOnly(list)) })
            }
          }
        } catch (error) {
          console.warn('⚠️ Admin-Bereich Auto-Polling fehlgeschlagen:', error)
          if (loadArtworks().length > 0 && isMounted) {
            console.log(`🔒 Fehler beim Polling - behalte lokale Werke (kein setItem, kein Datenverlust)`)
            loadArtworksResolvedForDisplay().then((list) => { if (isMounted) setArtworksDisplay(filterK2ArtworksOnly(list)) })
            // NICHT setItem – lokale Daten unverändert lassen
          }
        }
      }
      
      // Automatisches Polling alle 10 Sekunden
      mobilePollingInterval = setInterval(syncFromGalleryData, 10000)
      
      // Erste Prüfung nach 5 Sekunden (Cleanup nötig – kein setState nach Unmount)
      initialSyncTimeoutId = setTimeout(syncFromGalleryData, 5000)
    }
    
    // Event Listener für Updates von Admin oder GaleriePage
    const handleArtworksUpdate = async (event?: any) => {
      // WICHTIG: Ignoriere Events die von dieser Komponente selbst kommen (justSaved Flag)
      if (event?.detail?.justSaved || event?.detail?.autoSync) {
        console.log('⏭️ Ignoriere artworks-updated Event (gerade gespeichert/synchronisiert)')
        return
      }
      
      // WICHTIG: Ignoriere Events von GaleriePage - die merged bereits korrekt und speichert in localStorage
      // Lade mit aufgelösten Bildern (imageRef → imageUrl), sonst nur Platzhalter in Galerie
      if (event?.detail?.fromGaleriePage) {
        console.log('⏭️ artworks-updated von GaleriePage – lade mit aufgelösten Bildern')
        loadArtworksResolvedForDisplay().then((resolved) => {
          if (!isMounted || !resolved.length) return
          const stored = filterK2ArtworksOnly(resolved)
          if (stored.length > 0) {
            if (artworks.length !== stored.length) {
              console.log('🔄 Aktualisiere artworks State nach GaleriePage-Merge:', stored.length, 'Werke')
            }
            setArtworksDisplay(stored)
          }
        })
        return
      }
      
      console.log('🔄 Werke wurden aktualisiert (Admin/Galerie), lade neu...', event?.detail)
      
      // Lade aus Supabase wenn konfiguriert, sonst localStorage. Niemals mit weniger Werken anzeigen als lokal vorhanden.
      setTimeout(async () => {
        if (!isMounted) return
        const localCount = loadArtworks().length
        if (isSupabaseConfigured()) {
          try {
            const updatedArtworks = await loadArtworksFromSupabase()
            if (updatedArtworks && updatedArtworks.length > 0 && isMounted) {
              if (updatedArtworks.length >= localCount) {
                // Supabase-Daten können imageRef haben – Anzeige immer aus aufgelösten Bildern
                loadArtworksResolvedForDisplay().then((list) => { if (isMounted) setArtworksDisplay(filterK2ArtworksOnly(list)) })
              } else {
                console.warn(`⚠️ Supabase hat ${updatedArtworks.length} Werke, lokal ${localCount} – Anzeige aus localStorage (resolved)`)
                loadArtworksResolvedForDisplay().then((list) => { if (isMounted) setArtworksDisplay(filterK2ArtworksOnly(list)) })
              }
            } else if (localCount > 0 && isMounted) {
              loadArtworksResolvedForDisplay().then((list) => { if (isMounted) setArtworksDisplay(filterK2ArtworksOnly(list)) })
            }
          } catch (error) {
            console.warn('⚠️ Supabase-Update fehlgeschlagen:', error)
            loadArtworksResolvedForDisplay().then((list) => { if (list.length > 0 && isMounted) setArtworksDisplay(filterK2ArtworksOnly(list)) })
          }
        } else {
          loadArtworksResolvedForDisplay().then((list) => {
            if (list.length > 0 && isMounted) setArtworksDisplay(filterK2ArtworksOnly(list))
          })
        }
      }, 200)
    }
    
    // WICHTIG: Nur EINMAL registrieren (kein doppelter Listener)
    window.addEventListener('artworks-updated', handleArtworksUpdate)
    
    return () => {
      isMounted = false
      adminLoadMountedRef.current = false
      if (delayedReadTimeoutId) clearTimeout(delayedReadTimeoutId)
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
      if (initialSyncTimeoutId) clearTimeout(initialSyncTimeoutId)
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
  // VK2 und musterOnly: keine K2-Daten laden
  useEffect(() => {
    if (musterOnly || vk2) return
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
            loadArtworksResolvedForDisplay().then((list) => {
              const exhibitionArtworks = filterK2ArtworksOnly(list)
              if (exhibitionArtworks.length === 0) return
              console.log('✅ Werke aus localStorage geladen (nach Admin-Update, resolved):', exhibitionArtworks.length)
              setArtworksDisplay(exhibitionArtworks)
              setLoadStatus({ message: `✅ ${exhibitionArtworks.length} Werke geladen`, success: true })
              setTimeout(() => setLoadStatus(null), 2000)
              setIsLoading(false)
              const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768
              if (isMobile && exhibitionArtworks.length > 0) {
                saveArtworksToSupabase(exhibitionArtworks).then(() => {
                  syncMobileToSupabase().catch(err => console.warn('⚠️ Mobile-Sync fehlgeschlagen:', err))
                })
              }
            })
            return
          }
        }
        
        // Wenn lokal keine Werke: zuerst Supabase versuchen (Mac hat oft dorthin synchronisiert)
        const localArtworks = loadArtworks()
        if (localArtworks.length === 0 && isSupabaseConfigured()) {
          try {
            const supabaseArtworks = await loadArtworksFromSupabase()
            if (supabaseArtworks && Array.isArray(supabaseArtworks) && supabaseArtworks.length > 0) {
              const toSave = preserveLocalImageData(filterK2OnlyStorage(supabaseArtworks), loadArtworks())
              saveArtworksStorage(toSave, { allowReduce: false })
              const list = await loadArtworksResolvedForDisplay()
              setArtworksDisplay(filterK2ArtworksOnly(list))
              setLoadStatus({ message: `✅ ${supabaseArtworks.length} Werke von Supabase geladen`, success: true })
              setTimeout(() => setLoadStatus(null), 3000)
              setIsLoading(false)
              clearTimeout(fallbackClear)
              return
            }
          } catch (e) {
            console.warn('⚠️ Supabase-Vorab-Load fehlgeschlagen:', e)
          }
        }
        
        // Nur wenn wirklich keine Werke vorhanden sind, lade vom Server (gallery-data.json)
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
                
                // MERGE-REGEL: Neuester Timestamp gewinnt – egal von welchem Gerät
                // Kein "Server ist Quelle der Wahrheit", kein "Mobile hat Priorität"
                // Mac, iPad, iPhone: letzte Änderung ist immer richtig
                const existingArtworks = loadArtworks()
                const serverArtworks = filterK2ArtworksOnly(Array.isArray(data.artworks) ? data.artworks : [])
                updateKnownServerMaxNumbers(serverArtworks)
                // Fortlaufende Nummern: Kollisionen vermeiden (gleiche Nummer, anderes Werk → lokal umnummerieren)
                const existingForMerge = renumberCollidingLocalArtworks(serverArtworks, existingArtworks)
                
                console.log('🔄 Merge (neuester Timestamp gewinnt):', {
                  lokal: existingArtworks.length,
                  server: serverArtworks.length,
                })

                // Hilfsfunktion: Effektiven Timestamp eines Werks ermitteln
                const getTs = (a: any): number => {
                  const upd = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
                  const cre = a.createdAt ? new Date(a.createdAt).getTime() : 0
                  return Math.max(upd, cre)
                }

                // Alle Werke in eine Map – Schlüssel ist Werk-Nummer/ID
                const mergeMap = new Map<string, any>()

                // 1. Zuerst Server-Werke eintragen
                serverArtworks.forEach((a: any) => {
                  const key = a.number || a.id
                  if (key) mergeMap.set(key, a)
                })

                // 2. Lokale Werke: gewinnen wenn ihr Timestamp >= Server-Timestamp
                //    Neue lokale Werke (nicht auf Server) werden IMMER übernommen
                existingForMerge.forEach((localArtwork: any) => {
                  const key = localArtwork.number || localArtwork.id
                  if (!key) return
                  const existing = mergeMap.get(key)
                  if (!existing) {
                    // Nur lokal vorhanden → immer behalten (noch nicht veröffentlicht)
                    console.log('💾 Nur lokal (neu):', key)
                    mergeMap.set(key, localArtwork)
                  } else {
                    // Auf beiden → neuester Timestamp gewinnt
                    const localTs = getTs(localArtwork)
                    const serverTs = getTs(existing)
                    if (localTs >= serverTs) {
                      console.log('💾 Lokal neuer → lokal gewinnt:', key, new Date(localTs).toISOString(), '>', new Date(serverTs).toISOString())
                      mergeMap.set(key, localArtwork)
                    } else {
                      console.log('🌐 Server neuer → server gewinnt:', key)
                    }
                  }
                })

                const mergedArtworks = Array.from(mergeMap.values())
                console.log(`✅ Merge fertig: ${mergedArtworks.length} Werke gesamt`)
                console.log('📊 Nummern:', mergedArtworks.map((a: any) => a.number || a.id))
                
                // K2: Muster/VK2-Werke nicht in k2-artworks speichern
                const toSaveMerge = filterK2ArtworksOnly(mergedArtworks)
                const localCountBeforeMerge = existingArtworks.length
                const mayWrite = toSaveMerge.length >= localCountBeforeMerge
                try {
                  if (!mayWrite) {
                    console.warn(`⚠️ Merge würde ${localCountBeforeMerge} → ${toSaveMerge.length} reduzieren – localStorage unverändert`)
                    stored = existingArtworks
                    loadArtworksResolvedForDisplay().then((list) => {
                      const exhibitionArtworks = filterK2ArtworksOnly(list)
                      if (exhibitionArtworks.length > 0) setArtworksDisplay(exhibitionArtworks)
                      setLoadStatus({ message: `✅ ${existingArtworks.length} Werke (lokal beibehalten)`, success: true })
                      setTimeout(() => setLoadStatus(null), 3000)
                      setIsLoading(false)
                    })
                  } else {
                    const toSave = preserveLocalImageData(toSaveMerge, loadArtworks())
                    const ok = saveArtworksStorage(toSave, { allowReduce: false })
                    if (ok) console.log('✅ Gemergte Werke gespeichert:', toSave.length)
                  
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
                  
                  // KRITISCH: Anzeige immer aus aufgelösten Bildern (IndexedDB)
                  loadArtworksResolvedForDisplay().then((list) => {
                    const exhibitionArtworks = filterK2ArtworksOnly(list)
                    console.log('🎨 Setze artworks State (resolved):', exhibitionArtworks.length, 'Werke')
                    setArtworksDisplay(exhibitionArtworks)
                  })
                  
                  setLoadStatus({ 
                    message: `✅ ${mergedArtworks.length} Werke synchronisiert (${serverArtworks.length} Server + ${mergedArtworks.length - serverArtworks.length} Mobile)`, 
                    success: true 
                  })
                  setTimeout(() => setLoadStatus(null), 3000)
                  setIsLoading(false)
                  }
                } catch (e) {
                  console.warn('⚠️ Werke zu groß für localStorage, verwende direkt')
                  stored = mergedArtworks
                  loadArtworksResolvedForDisplay().then((list) => {
                    setArtworksDisplay(filterK2ArtworksOnly(list))
                  })
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
                  console.log('📦 Verwende localStorage-Daten (Server hat keine Werke, resolved):', stored.length)
                  loadArtworksResolvedForDisplay().then((list) => {
                    setArtworksDisplay(filterK2ArtworksOnly(list))
                  })
                  setLoadStatus({ message: `⚠️ Server hat keine Werke - verwende Cache (${stored.length})`, success: false })
                  setTimeout(() => setLoadStatus(null), 5000)
                } else {
                  // gallery-data.json leer → Supabase versuchen (z. B. Mac hat dorthin synchronisiert)
                  if (isSupabaseConfigured()) {
                    try {
                      const supabaseArtworks = await loadArtworksFromSupabase()
                      if (supabaseArtworks && Array.isArray(supabaseArtworks) && supabaseArtworks.length > 0) {
                        const toSave = preserveLocalImageData(filterK2OnlyStorage(supabaseArtworks), loadArtworks())
                        saveArtworksStorage(toSave, { allowReduce: false })
                        const list = await loadArtworksResolvedForDisplay()
                        setArtworksDisplay(filterK2ArtworksOnly(list))
                        setLoadStatus({ message: `✅ ${supabaseArtworks.length} Werke von Supabase geladen`, success: true })
                        setTimeout(() => setLoadStatus(null), 3000)
                        setIsLoading(false)
                        return
                      }
                    } catch (supabaseErr) {
                      console.warn('⚠️ Supabase-Fallback (leere Server-Antwort) fehlgeschlagen:', supabaseErr)
                    }
                  }
                  // Weder Cache noch Supabase: Backup prüfen
                  const backup = loadBackup()
                  if (backup && backup.length > 0) {
                    console.log('💾 Backup gefunden - verwende Backup statt leeren:', backup.length, 'Werke')
                    saveArtworksForContext(false, false, backup, { allowReduce: true })
                    loadArtworksResolvedForDisplay().then((list) => setArtworksDisplay(filterK2ArtworksOnly(list)))
                    setLoadStatus({ message: `💾 Backup wiederhergestellt: ${backup.length} Werke`, success: true })
                  } else {
                    setArtworksDisplay([])
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
                setArtworksDisplay(stored)
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
                setArtworksDisplay(stored)
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
          
          // WICHTIG: Bei Fehler Supabase prüfen (Mobile) – NIEMALS mit weniger Werken überschreiben
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768
          if (isMobile) {
            try {
              console.log('📱 Versuche Supabase als Fallback...')
              const { loadArtworksFromSupabase } = await import('../utils/supabaseClient')
              const supabaseArtworks = await loadArtworksFromSupabase()
              const localCount = loadArtworks().length
              if (supabaseArtworks && Array.isArray(supabaseArtworks) && supabaseArtworks.length > 0) {
                if (!mayWriteServerList(supabaseArtworks, localCount)) {
                  console.warn(`⚠️ Supabase-Fallback: ${supabaseArtworks.length} Werke, lokal ${localCount} – behalte lokale Daten`)
                  stored = loadArtworks()
                  if (stored && stored.length > 0 && adminLoadMountedRef.current) {
                    loadArtworksResolvedForDisplay().then((list) => {
                      if (adminLoadMountedRef.current) setArtworksDisplay(filterK2ArtworksOnly(list))
                    })
                    setLoadStatus({ message: `✅ ${stored.length} Werke (lokal)`, success: true })
                  }
                } else {
                  console.log('✅ Supabase-Daten übernommen:', supabaseArtworks.length)
                  const toSave = preserveLocalImageData(filterK2OnlyStorage(supabaseArtworks), loadArtworks())
                  saveArtworksStorage(toSave, { allowReduce: false })
                  stored = supabaseArtworks
                  loadArtworksResolvedForDisplay().then((list) => setArtworksDisplay(filterK2ArtworksOnly(list)))
                  setLoadStatus({ message: `✅ ${supabaseArtworks.length} Werke von Supabase geladen`, success: true })
                }
                setTimeout(() => setLoadStatus(null), 3000)
                setIsLoading(false)
                return
              }
            } catch (supabaseError) {
              console.warn('⚠️ Supabase-Fallback fehlgeschlagen:', supabaseError)
            }
          }
          
          // Fallback: Verwende localStorage mit aufgelösten Bildern
          if (stored && stored.length > 0) {
            console.log('📦 Verwende localStorage-Daten (mit aufgelösten Bildern):', stored.length)
            loadArtworksResolvedForDisplay().then((resolved) => {
              if (resolved.length > 0) setArtworksDisplay(filterK2ArtworksOnly(resolved))
            })
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
          // Mit aufgelösten Bildern (imageRef → imageUrl aus IndexedDB) anzeigen
          loadArtworksResolvedForDisplay().then((exhibitionArtworks) => {
            if (!exhibitionArtworks.length) return
            const toShow = filterK2ArtworksOnly(exhibitionArtworks)
            console.log('✅ Geladene Werke:', toShow.length, 'von', stored.length)
            console.log('📊 Werke Details:', {
              total: toShow.length,
              withImage: toShow.filter((a: any) => a.imageUrl && !a.imageUrl.includes('data:image/svg')).length,
              withoutImage: toShow.filter((a: any) => !a.imageUrl || a.imageUrl.includes('data:image/svg')).length
            })
            setArtworksDisplay(toShow)
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768
            if (isMobile && toShow.length > 0) {
              syncMobileToSupabase().catch(err => {
                console.warn('⚠️ Mobile-Sync fehlgeschlagen:', err)
              })
            }
          })
          setLoadStatus({ message: `✅ ${stored.length} Werke geladen`, success: true })
          setTimeout(() => setLoadStatus(null), 3000)
        } else {
          console.warn('⚠️ Keine Werke gefunden')
          // KRITISCH: Prüfe Backup bevor wir leeren!
          const backup = loadBackup()
          if (backup && backup.length > 0) {
            console.log('💾 Backup gefunden - verwende Backup statt leeren:', backup.length, 'Werke')
            saveArtworksForContext(false, false, backup, { allowReduce: true })
            loadArtworksResolvedForDisplay().then((list) => setArtworksDisplay(filterK2ArtworksOnly(list)))
            setLoadStatus({ message: `💾 Backup wiederhergestellt: ${backup.length} Werke`, success: true })
          } else {
            setArtworksDisplay([])
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
          saveArtworksForContext(false, false, backup, { allowReduce: true })
          loadArtworksResolvedForDisplay().then((list) => setArtworksDisplay(filterK2ArtworksOnly(list)))
          setLoadStatus({ message: `💾 Backup wiederhergestellt: ${backup.length} Werke`, success: true })
        } else {
          setArtworksDisplay([])
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
    // Erst nach kurzer Verzögerung prüfen: sucht neue Werke vom Server (gallery-data.json).
    // Wenn lokal leer (z. B. iPad nach Neuöffnen): schnell vom Server laden (500 ms), nicht 2,8 s warten.
    const delayMs = (() => {
      const current = loadArtworks()
      const filtered = filterK2ArtworksOnly(current)
      const isVercel = typeof window !== 'undefined' && (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('k2-galerie'))
      if (filtered.length === 0 && isVercel) return 500
      if (filtered.length === 0) return 800
      return 2800
    })()
    const timer = setTimeout(() => {
      const current = loadArtworks()
      const filtered = filterK2ArtworksOnly(current)
      if (filtered.length === 0) {
        loadData()
      }
    }, delayMs)
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
      
      // iPad/Safari: starker Cache-Bust, damit nicht alte gallery-data (z. B. 10 Werke) geliefert wird
      const bust = `${timestamp}-${random}-${Math.random().toString(36).slice(2)}`
      const url = `${baseUrl}/gallery-data.json?bust=${bust}&v=${timestamp}&_=${Date.now()}`
      
      const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768
      console.log('🔄 Lade neue Daten vom Server...', isMobileDevice ? '(Mobile – Cache-Bust aktiv)' : '', url.slice(0, 80) + '...')
      console.log('🔄 Hostname:', window.location.hostname)
      
      const response = await fetch(url, {
        // Mobile: 'reload' erzwingt echte Netzwerkanfrage (Safari ignoriert no-store manchmal)
        cache: isMobileDevice ? 'reload' : 'no-store',
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Request-Id': bust,
          'If-None-Match': `"${bust}"`,
          'If-Modified-Since': 'Thu, 01 Jan 1970 00:00:00 GMT'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const serverCount = data.artworks && Array.isArray(data.artworks) ? data.artworks.length : 0
        console.log('📥 Server antwortete mit', serverCount, 'Werken (Rohantwort)')
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
          updateKnownServerMaxNumbers(serverArtworks)
          // Fortlaufende Nummern: Kollisionen vermeiden (gleiche Nummer, anderes Werk → lokal umnummerieren)
          const localForMerge = renumberCollidingLocalArtworks(serverArtworks, localArtworks)
          const { merged: mergedArtworks, toHistory } = mergeServerWithLocal(serverArtworks, localForMerge)
          if (toHistory.length > 0) appendToHistory(toHistory)
          const toSaveServer = filterK2ArtworksOnly(mergedArtworks)
          const localCountHere = localArtworks.length
          const mayWriteServer = toSaveServer.length >= localCountHere
          console.log(`🔒 Server = Quelle: ${toSaveServer.length} Werke, ${toHistory.length} in History`, toSaveServer.length < mergedArtworks.length ? '(Muster/VK2 entfernt)' : '')
          
          try {
            if (mayWriteServer) {
              const toSave = preserveLocalImageData(toSaveServer, loadArtworks())
              const ok = saveArtworksStorage(toSave, { allowReduce: false })
              if (ok) {
                console.log('✅ Gemergte Werke geladen:', toSave.length, 'Version:', data.version)
                loadArtworksResolvedForDisplay().then((list) => {
                  const exhibitionArtworks = filterK2ArtworksOnly(list)
                  setArtworksDisplay(exhibitionArtworks)
                  setLoadStatus({ message: `✅ ${exhibitionArtworks.length} Werke synchronisiert`, success: true })
                  setTimeout(() => setLoadStatus(null), 3000)
                })
              } else {
                // iPad/geringem Speicher: Speichern schlägt fehl – trotzdem alle geladenen Werke anzeigen (nur diese Sitzung)
                console.warn('⚠️ Speichern fehlgeschlagen (z. B. Speicher voll) – zeige', toSaveServer.length, 'Werke trotzdem')
                resolveArtworkImages(toSaveServer).then((resolved) => {
                  setArtworksDisplay(filterK2ArtworksOnly(resolved))
                  setLoadStatus({
                    message: `${toSaveServer.length} Werke geladen. Speichern fehlgeschlagen (Speicher voll?) – nur in dieser Sitzung sichtbar.`,
                    success: false
                  })
                  setTimeout(() => setLoadStatus(null), 8000)
                })
              }
            } else {
              console.warn(`⚠️ Merge würde ${localCountHere} → ${toSaveServer.length} – localStorage unverändert`)
              loadArtworksResolvedForDisplay().then((list) => {
                setArtworksDisplay(filterK2ArtworksOnly(list))
                setLoadStatus({ message: `✅ ${list.length} lokale Werke beibehalten`, success: true })
                setTimeout(() => setLoadStatus(null), 3000)
              })
            }
            console.log('📊 Werke Details (resolved)')
          } catch (e) {
            console.warn('⚠️ Werke zu groß für localStorage', e)
            setLoadStatus({ message: '⚠️ Zu viele Werke für Cache – Speicher freigeben (Safari: Einstellungen → Website-Daten)', success: false })
            setTimeout(() => setLoadStatus(null), 8000)
          }
        } else {
          // KEINE Server-Daten - behalte ALLE lokalen Werke!
          console.warn('⚠️ Keine Werke in gallery-data.json gefunden - behalte lokale Werke:', localArtworks.length)
          if (localArtworks.length > 0) {
            console.log('🔒 Lokale Werke bleiben erhalten:', localArtworks.map((a: any) => a.number || a.id).join(', '))
            saveArtworksForContext(false, false, localArtworks)
            loadArtworksResolvedForDisplay().then((list) => {
              setArtworksDisplay(filterK2ArtworksOnly(list))
            })
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
          saveArtworksForContext(false, false, localArtworks)
          loadArtworksResolvedForDisplay().then((list) => {
            setArtworksDisplay(filterK2ArtworksOnly(list))
          })
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
        saveArtworksForContext(false, false, localArtworks)
        loadArtworksResolvedForDisplay().then((list) => {
          setArtworksDisplay(filterK2ArtworksOnly(list))
        })
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
      const stored = loadArtworks()
      if (stored && stored.length > 0) {
        console.log('⚠️ artworks State ist leer, aber localStorage hat Werke! Lade resolved...', stored.length)
        loadArtworksResolvedForDisplay().then((list) => {
          setArtworksDisplay(filterK2ArtworksOnly(list))
        })
      }
    }
  }, [artworks, isLoading])
  
  // ENTFERNT: Prüfung die "Keine Werke gefunden" zeigt
  // Die Werke werden jetzt synchron beim ersten Render geladen (initialArtworks)
  // und der useEffect lädt sie falls nötig
  // Diese Prüfung verhinderte die Anzeige der Werke

  const isVorschauModus = typeof window !== 'undefined' && new URLSearchParams(location.search).get('vorschau') === '1'

  // ═══════════════════════════════════════════════════════════════
  // VK2: Eigenes Mitglieder-Layout – KEINE Werke, KEIN Warenkorb
  // ═══════════════════════════════════════════════════════════════
  if (vk2) {
    const vk2Accent = '#2563eb'
    const vk2AccentLight = '#60a5fa'
    const vk2Bg = '#0f1c2e'
    const vk2BgCard = '#162032'
    const vk2Text = '#f0f6ff'
    const vk2Muted = 'rgba(160,200,255,0.7)'
    let vereinsName = 'VK2 Vereinsplattform'
    try {
      const sd = JSON.parse(localStorage.getItem('k2-vk2-stammdaten') || '{}')
      if (sd?.verein?.name) vereinsName = sd.verein.name
    } catch (_) {}
    const mitglieder = artworks
    return (
      <div style={{ minHeight: '100vh', background: vk2Bg, color: vk2Text, fontFamily: 'system-ui, sans-serif' }}>
        {/* Header */}
        <div style={{ padding: '1.5rem 2rem 1rem', borderBottom: `1px solid ${vk2Accent}33`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', color: vk2AccentLight, textTransform: 'uppercase', marginBottom: '0.25rem' }}>VK2 Vereinsplattform</div>
            <h1 style={{ margin: 0, fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 800, color: vk2Text }}>{vereinsName}</h1>
            <p style={{ margin: '0.25rem 0 0', color: vk2Muted, fontSize: '0.9rem' }}>
              {mitglieder.length > 0 ? `${mitglieder.length} Mitglieder` : 'Mitglieder-Galerie'}
            </p>
          </div>
          <button type="button" onClick={() => navigate(-1)}
            style={{ padding: '0.5rem 1.2rem', background: 'transparent', border: `1px solid ${vk2Accent}66`, color: vk2AccentLight, borderRadius: '8px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 }}>
            ← Zurück
          </button>
        </div>
        {/* Mitglieder-Raster */}
        <div style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)', maxWidth: 1100, margin: '0 auto' }}>
          {mitglieder.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: vk2Muted }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
              <p style={{ fontSize: '1.1rem' }}>Noch keine Mitglieder eingetragen.</p>
              <p style={{ fontSize: '0.9rem' }}>Im Admin unter „Einstellungen → Stammdaten" Mitglieder hinzufügen.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'clamp(1rem, 2.5vw, 1.5rem)' }}>
              {mitglieder.map((m: any, idx: number) => {
                const hasLink = !!(m.linkUrl && m.linkUrl.trim())
                const handleClick = () => {
                  if (!hasLink) return
                  const url = m.linkUrl.startsWith('http') ? m.linkUrl : `https://${m.linkUrl}`
                  window.open(url, '_blank', 'noopener,noreferrer')
                }
                return (
                  <div key={m.id || idx}
                    onClick={hasLink ? handleClick : undefined}
                    style={{
                      background: vk2BgCard,
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: `1px solid ${hasLink ? vk2Accent + '55' : vk2Accent + '28'}`,
                      boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
                      cursor: hasLink ? 'pointer' : 'default',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.15s, box-shadow 0.15s',
                    }}
                    onMouseEnter={(e) => { if (hasLink) { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 24px rgba(37,99,235,0.3)` } }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.3)' }}
                  >
                    {/* Foto */}
                    <div style={{ width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', background: `${vk2Accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {m.imageUrl ? (
                        <img src={m.imageUrl} alt={m.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                      ) : (
                        <div style={{ fontSize: '3.5rem', opacity: 0.4 }}>👤</div>
                      )}
                    </div>
                    {/* Text + Vita */}
                    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: vk2Text, marginBottom: '0.2rem' }}>{m.title}</div>
                      {m.description && <div style={{ fontSize: '0.82rem', color: vk2AccentLight, fontWeight: 500, marginBottom: '0.5rem' }}>{m.description}</div>}
                      {m.bio && <p style={{ margin: '0 0 0.75rem', fontSize: '0.83rem', color: vk2Muted, lineHeight: 1.5, flex: 1 }}>{m.bio}</p>}
                      {/* Link-Button */}
                      {hasLink && (
                        <div style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: `1px solid ${vk2Accent}22` }}>
                          <span style={{ fontSize: '0.8rem', color: vk2AccentLight, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            {m.isK2Lizenz ? '🎨 Zur K2-Galerie' : '🌐 Zur Website'} →
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }
  // ═══════════════════════════════════════════════════════════════

  /** ök2 (musterOnly): Text/Border/Buttons an Theme anpassen; K2-Vorschau: weiß/lila */
  const galerieTheme = musterOnly
    ? { text: 'var(--k2-text)', muted: 'var(--k2-muted)', accent: 'var(--k2-accent)', border: 'rgba(0,0,0,0.12)', filterActive: 'linear-gradient(135deg, var(--k2-accent) 0%, #6b9080 100%)', filterInactive: 'rgba(0,0,0,0.06)', priceBg: 'var(--k2-accent)', btnBorder: 'rgba(0,0,0,0.15)' }
    : { text: '#ffffff', muted: 'rgba(255,255,255,0.7)', accent: '#b8b8ff', border: 'rgba(255,255,255,0.2)', filterActive: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', filterInactive: 'rgba(255,255,255,0.05)', priceBg: 'linear-gradient(135deg, #b8b8ff 0%, #ff77c6 100%)', btnBorder: 'rgba(102,126,234,0.3)' }

  return (
    <>
      {/* Gelbe Leiste: auf jeder Seite oben – gespeicherte Änderungen sichtbar, Veröffentlichen-Hinweis */}
      {isVorschauModus && (
        <div style={{
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          padding: '0.5rem 1rem',
          background: 'rgba(245, 158, 11, 0.95)',
          color: '#1a1a1a',
          fontSize: '0.9rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}>
          <button
            type="button"
            onClick={() => {
              const s = location.state as { fromAdminTab?: string; fromAdminContext?: string | null } | null
              const ctx = s?.fromAdminContext ?? (musterOnly ? 'oeffentlich' : null)
              const tab = s?.fromAdminTab
              const backUrl = '/admin' + (ctx ? '?context=' + ctx : '') + (tab ? (ctx ? '&' : '?') + 'tab=' + tab : '')
              navigate(backUrl)
            }}
            style={{ background: 'rgba(0,0,0,0.2)', border: 'none', color: 'inherit', padding: '0.4rem 0.8rem', borderRadius: 8, cursor: 'pointer', fontWeight: 600, flexShrink: 0 }}
          >
            ← Zurück zu Einstellungen
          </button>
          <span style={{ opacity: 0.95 }}>
            Hier siehst du deine gespeicherten Änderungen – du brauchst nicht mehr extra „Auf diesem Gerät speichern“. Nach „Veröffentlichen“ sehen alle deine Änderungen – nicht vergessen!
          </span>
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
        ? 'linear-gradient(135deg, var(--k2-bg-1) 0%, var(--k2-bg-2) 65%, var(--k2-bg-3) 100%)'
        : 'linear-gradient(135deg, var(--k2-bg-1) 0%, var(--k2-bg-2) 65%, var(--k2-bg-3) 100%)',
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
        {/* PWA-Icon-Hinweis: Symbol aktiv zum Startbildschirm hinzufügen (nur Mobile, nicht Standalone) */}
        {showPwaIconHint && (
          <div style={{
            margin: 'clamp(0.75rem, 2vw, 1rem)',
            padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1rem, 2.5vw, 1.25rem)',
            background: musterOnly ? 'rgba(107, 144, 128, 0.15)' : vk2 ? 'rgba(255, 140, 66, 0.12)' : 'rgba(255, 255, 255, 0.08)',
            border: musterOnly ? '1px solid rgba(107, 144, 128, 0.35)' : vk2 ? '1px solid rgba(255, 140, 66, 0.3)' : '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            fontSize: 'clamp(0.82rem, 2vw, 0.9rem)',
            lineHeight: 1.45,
            color: musterOnly ? 'var(--k2-text)' : 'rgba(255, 255, 255, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
              <div>
                <strong style={{ display: 'block', marginBottom: '0.25rem', color: musterOnly ? '#6b9080' : vk2 ? 'var(--k2-accent)' : 'rgba(255,255,255,0.95)' }}>
                  📱 Symbol auf den Startbildschirm
                </strong>
                <p style={{ margin: 0, opacity: 0.92 }}>
                  Das Icon legt sich nicht von selbst auf deinen Bildschirm – du musst es einmal aktiv hinzufügen. Dann findest du uns schnell wieder.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  try { localStorage.setItem(KEY_PWA_ICON_HINT_CLOSED, '1') } catch (_) {}
                  setShowPwaIconHint(false)
                }}
                style={{
                  flexShrink: 0,
                  padding: '0.35rem 0.6rem',
                  background: 'transparent',
                  border: musterOnly ? '1px solid rgba(107,144,128,0.5)' : '1px solid rgba(255,255,255,0.35)',
                  borderRadius: '8px',
                  color: 'inherit',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
                aria-label="Hinweis schließen"
              >
                OK
              </button>
            </div>
            <div style={{ fontSize: '0.8em', opacity: 0.85 }}>
              <strong>So geht's:</strong>{' '}
              {/iPhone|iPad|iPod/.test(navigator.userAgent)
                ? 'Teilen (□↑) → „Zum Home-Bildschirm“ → Hinzufügen.'
                : 'Menü (⋮) → „Zum Startbildschirm hinzufügen“ oder „App installieren“.'
              }
            </div>
          </div>
        )}
        {/* ök2 Willkommensseite: So könnte deine Galerie aussehen – ein Banner, kein Doppel */}
        {showErsteAktionBanner && (
          <div style={{
            margin: 'clamp(0.75rem, 2vw, 1rem)',
            padding: 'clamp(0.6rem, 1.5vw, 0.85rem) clamp(1rem, 2.5vw, 1.25rem)',
            background: 'rgba(107, 144, 128, 0.18)',
            border: '1px solid rgba(107, 144, 128, 0.45)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            flexWrap: 'wrap'
          }}>
            <span style={{ color: 'var(--k2-text)', fontSize: 'clamp(0.88rem, 2vw, 0.95rem)', flex: '1 1 200px' }}>
              So könnte deine Galerie aussehen.
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => {
                  dismissErsteAktionBanner()
                  navigate(`${MEIN_BEREICH_ROUTE}?context=oeffentlich&tab=einstellungen`)
                }}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'linear-gradient(135deg, var(--k2-accent) 0%, #6b9080 100%)',
                  color: 'var(--k2-text)',
                  border: '1px solid rgba(0,0,0,0.15)',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                Zum Admin →
              </button>
              <button
                type="button"
                onClick={dismissErsteAktionBanner}
                aria-label="Hinweis schließen"
                style={{
                  padding: '0.35rem 0.6rem',
                  background: 'transparent',
                  border: '1px solid rgba(107,144,128,0.5)',
                  borderRadius: '8px',
                  color: 'var(--k2-text)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                Schließen
              </button>
            </div>
          </div>
        )}
        {/* Guide-Avatar – geführter Rundgang (nur ök2, wenn mit Namen angekommen) */}
        {musterOnly && willkommenName && !willkommenBannerDismissed && showGuideAfterDelay && (
          <GalerieGuide name={willkommenName} onDismiss={dismissWillkommenBanner} />
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
                {/* Projekt-Start-Link nur bei K2 – bei ök2 entfernt, führt sonst fälschlich zu K2-Galerie-Projekt */}
                {!musterOnly && (
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
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
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
                )}
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
          const filtered = currentArtworks.filter((artwork) => {
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
          const sorted = sortArtworksFavoritesFirstThenNewest(filtered)
          // Bei „alle Werke“: Kategorien abwechselnd anzeigen (nicht alle Malerei, dann alle Keramik)
          const filteredArtworks = filter === 'alle' ? interleaveArtworksByCategory(sorted) : sorted
          
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
                let isReserved = false
                let reservedFor = ''
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
                try {
                  const resData = localStorage.getItem('k2-reserved-artworks')
                  if (resData) {
                    const resArtworks = JSON.parse(resData)
                    if (Array.isArray(resArtworks)) {
                      const resEntry = resArtworks.find((a: any) => a && a.number === artwork.number)
                      if (resEntry) { isReserved = true; reservedFor = resEntry.reservedFor || '' }
                    }
                  }
                } catch (_) {}

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
                    {!isSold && isReserved && (
                      <div style={{
                        position: 'absolute',
                        top: '0.75rem',
                        right: '0.75rem',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                        color: '#fff',
                        padding: 'clamp(0.4rem, 1.5vw, 0.5rem) clamp(0.75rem, 2vw, 1rem)',
                        borderRadius: '8px',
                        fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
                        fontWeight: '600',
                        zIndex: 1,
                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)'
                      }}>
                        🔶 Reserviert{reservedFor ? ` – ${reservedFor}` : ''}
                      </div>
                    )}
                    {/* Bild immer anzeigen - robuster Fallback. Bei Freistellen/contain: gleicher Hintergrund wie Pro-Hintergrund („links gespeichert = rechts gleiches Format“). */}
                    <div style={{ 
                      width: '100%', 
                      height: 'clamp(150px, 40vw, 200px)', 
                      borderRadius: '8px', 
                      marginBottom: '0.5rem',
                      position: 'relative',
                      overflow: 'hidden',
                      background: artwork.imageDisplayMode === 'vollkachel' ? galerieTheme.filterInactive : '#e8e6e2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {(() => {
                        let rawSrc = artwork.imageUrl || artwork.previewUrl || ''
                        // blob:-URLs (z. B. nach iPad-Foto) sind in Vorschau oft ungültig → Platzhalter, sonst "?" als kaputtes Bild
                        if (typeof rawSrc === 'string' && rawSrc.startsWith('blob:')) rawSrc = ''
                        const displaySrc = musterOnly && (!rawSrc || isPlaceholderImageUrl(rawSrc))
                          ? getOek2DefaultArtworkImage(artwork.category)
                          : rawSrc
                        return displaySrc ? (
                        <>
                          <img 
                            src={displaySrc} 
                            alt={artwork.title || artwork.number}
                            style={{ 
                              position: 'absolute',
                              inset: 0,
                              width: '100%', 
                              height: '100%',
                              minWidth: '100%',
                              minHeight: '100%',
                              /* Vollkachel: Bild füllt Kachel (cover); sonst enthalten mit Rand. imageDisplayMode muss am Werk gespeichert sein (Admin: Bildverarbeitung → Vollkachelform). */
                              objectFit: artwork.imageDisplayMode === 'vollkachel' ? 'cover' : 'contain',
                              objectPosition: artwork.imageDisplayMode === 'vollkachel' ? 'center' : 'center',
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
                          {/* Favorit der Künstler:in (jede:r hat bis zu 5) */}
                          {artwork.imVereinskatalog && (
                            <div style={{
                              position: 'absolute',
                              top: '0.5rem',
                              left: '0.5rem',
                              background: 'rgba(0, 0, 0, 0.75)',
                              backdropFilter: 'blur(4px)',
                              color: galerieTheme.accent || '#5ffbf1',
                              padding: '0.2rem 0.45rem',
                              borderRadius: '6px',
                              fontSize: 'clamp(0.65rem, 1.8vw, 0.8rem)',
                              fontWeight: '600',
                              pointerEvents: 'none',
                              zIndex: 2,
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.2rem'
                            }}>
                              <span aria-hidden>★</span> Favorit
                            </div>
                          )}
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
                    {/* Anfrage stellen – immer möglich (auch bei reserviert/nur Ausstellung) */}
                    {!isSold && !musterOnly && (
                      <button
                        type="button"
                        onClick={() => { setAnfrageArtwork(artwork); setAnfrageSent(false); setAnfrageName(''); setAnfrageEmail(''); setAnfrageNachricht('') }}
                        style={{
                          width: '100%',
                          marginTop: '0.5rem',
                          padding: 'clamp(0.4rem, 1.5vw, 0.55rem) clamp(0.75rem, 2vw, 1rem)',
                          background: 'transparent',
                          color: galerieTheme.muted,
                          border: `1px solid ${galerieTheme.border}`,
                          borderRadius: '8px',
                          fontSize: 'clamp(0.78rem, 2vw, 0.85rem)',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = galerieTheme.accent; e.currentTarget.style.color = galerieTheme.accent }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = galerieTheme.border; e.currentTarget.style.color = galerieTheme.muted }}
                      >
                        ✉️ Anfrage stellen
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
          {/* Header mit Zurück, Titel, Like, Erwerben und Schließen */}
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
            gap: '0.75rem'
          }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setLightboxImage(null)
                setImageZoom(1)
                setImagePosition({ x: 0, y: 0 })
              }}
              aria-label="Zurück zur Galerie"
              style={{
                flexShrink: 0,
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                color: '#ffffff',
                fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontWeight: 600
              }}
            >
              ← Zurück
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
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

            {/* Bild bearbeiten: nur auf Desktop (auf Mobil ausblenden – Bild nur im Admin ändern) */}
            {!musterOnly && showMobileAdmin && lightboxImage.artwork && !(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768) && (
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

            {/* Möchte ich erwerben Button */}
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
                🛒 Möchte ich erwerben
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
            
            {/* In Online-Galerie anzeigen (nur K2) */}
            {!musterOnly && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontWeight: '500', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={mobileInExhibition}
                    onChange={(e) => setMobileInExhibition(e.target.checked)}
                    style={{ width: 20, height: 20, accentColor: '#ff8c42' }}
                  />
                  In Galerie anzeigen
                </label>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Wenn aktiviert, erscheint das Werk in der öffentlichen Galerie.</p>
              </div>
            )}
            
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
                        inExhibition: mobileInExhibition,
                        inShop: !!mobilePrice && parseFloat(mobilePrice) > 0,
                        createdAt: existingArtwork.createdAt || new Date().toISOString(), // Behalte createdAt
                        updatedAt: new Date().toISOString(), // Setze updatedAt
                        updatedOnMobile: true // Marker dass es auf Mobile aktualisiert wurde
                      }
                      
                      // KRITISCH: Basis = immer VOLLSTÄNDIGE Liste aus localStorage (auf Handy kann State nur Anzeige-Ausschnitt sein → sonst gehen andere Werke verloren)
                      const currentFromStorage = loadArtworks()
                      const key = updatedArtwork.number || updatedArtwork.id
                      const idxInStorage = currentFromStorage.findIndex((a: any) => (a.number || a.id) === key)
                      const updatedArtworks = idxInStorage >= 0
                        ? [...currentFromStorage.slice(0, idxInStorage), updatedArtwork, ...currentFromStorage.slice(idxInStorage + 1)]
                        : [...currentFromStorage, updatedArtwork]
                      const toSave = preserveLocalImageData(updatedArtworks, loadArtworks())
                      
                      // PROFESSIONELL: Speichere zuerst in Supabase (wenn konfiguriert), sonst localStorage
                      let saved = false
                      if (isSupabaseConfigured()) {
                        try {
                          saved = await saveArtworksToSupabase(toSave)
                          if (saved) {
                            console.log('✅ Objekt in Supabase aktualisiert:', updatedArtwork.number || updatedArtwork.id)
                          } else {
                            console.warn('⚠️ Supabase-Speichern fehlgeschlagen, verwende localStorage')
                            saved = saveArtworks(toSave)
                          }
                        } catch (supabaseError) {
                          console.warn('⚠️ Supabase-Fehler, verwende localStorage:', supabaseError)
                          saved = saveArtworks(toSave)
                        }
                      } else {
                        saved = saveArtworks(toSave)
                      }
                      
                      if (!saved) {
                        console.error('❌ Speichern fehlgeschlagen!')
                        alert('❌ Fehler beim Speichern! Bitte versuche es erneut.')
                        setIsSaving(false)
                        return
                      }
                      
                      // KRITISCH: Anzeige immer aus aufgelösten Bildern (IndexedDB) – verhindert Platzhalter nach Bearbeiten
                      loadArtworksResolvedForDisplay().then((list) => {
                        setArtworksDisplay(filterK2ArtworksOnly(list))
                        console.log('✅ Werke-Liste nach Update aktualisiert (resolved):', list.length, 'Werke')
                      })
                      
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
                              artworks: artworksForExport(allArtworks),
                              events: loadEvents('k2'),
                              documents: loadDocuments('k2'),
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
                    // NEU: Erstelle neues Objekt – Basis immer aus localStorage (State kann auf Handy nur Teilmenge sein)
                    const currentFromStorageForNew = loadArtworks()
                    // WICHTIG: Finde maximale Nummer aus ALLEN Werken der GLEICHEN Kategorie (localStorage + ggf. Supabase)
                    const prefix = getCategoryPrefixLetter(mobileCategory)
                    const categoryPrefix = `K2-${prefix}-`
                    
                    let maxNumber = 0
                    currentFromStorageForNew.forEach((a: any) => {
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
                    
                    // Fortlaufende Nummern: auch bekannten Server-Max einbeziehen (verhindert Doppelnummern nach Sync)
                    const knownServerMax = getKnownServerMaxForPrefix(prefix)
                    if (knownServerMax > maxNumber) maxNumber = knownServerMax
                    
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
                      inExhibition: mobileInExhibition, // Checkbox „In Galerie anzeigen“ im Formular
                      inShop: !!mobilePrice && parseFloat(mobilePrice) > 0,
                      createdOnMobile: true // Marker dass es auf Mobile erstellt wurde
                    }
                    
                    // KRITISCH: Basis = immer VOLLSTÄNDIGE Liste aus localStorage (currentFromStorageForNew bereits oben geladen)
                    const updatedArtworks = [...currentFromStorageForNew, newArtwork]
                    const toSave = preserveLocalImageData(updatedArtworks, loadArtworks())
                    
                    // PROFESSIONELL: Speichere zuerst in Supabase (wenn konfiguriert), sonst localStorage
                    console.log('💾 Speichere Werk:', {
                      nummer: newNumber,
                      titel: mobileTitle,
                      gesamtAnzahl: toSave.length,
                      supabase: isSupabaseConfigured()
                    })
                    
                    let saved = false
                    if (isSupabaseConfigured()) {
                      try {
                        saved = await saveArtworksToSupabase(toSave)
                        if (saved) {
                          console.log('✅ Werk in Supabase gespeichert:', newNumber)
                        } else {
                          console.warn('⚠️ Supabase-Speichern fehlgeschlagen, verwende localStorage')
                          saved = saveArtworks(toSave)
                        }
                      } catch (supabaseError) {
                        console.warn('⚠️ Supabase-Fehler, verwende localStorage:', supabaseError)
                        saved = saveArtworks(toSave)
                      }
                    } else {
                      saved = saveArtworks(toSave)
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
                    
// KRITISCH: Anzeige aus aufgelösten Bildern (IndexedDB) – verhindert Platzhalter
                    loadArtworksResolvedForDisplay().then((list) => {
                      const exhibitionArtworks = filterK2ArtworksOnly(list)
                      setArtworksDisplay(exhibitionArtworks)
                      console.log('💾 Werke-Liste aktualisiert (resolved):', exhibitionArtworks.length, 'Werke')
                      const newEntry = exhibitionArtworks.find((a: any) => (a.number || a.id) === newNumber)
                      if (newEntry) addPendingArtwork(newEntry)
                      console.log('✅ Inkl. neuem Werk:', newNumber)
                    })
                    
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
                            artworks: artworksForExport(allArtworks),
                            events: loadEvents('k2'),
                            documents: loadDocuments('k2'),
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
      {/* Anfrage-Modal */}
      {anfrageArtwork && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 40000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={(e) => { if (e.target === e.currentTarget) setAnfrageArtwork(null) }}>
          <div style={{ background: '#1a1a2e', border: '1px solid rgba(95,251,241,0.3)', borderRadius: 20, padding: '2rem', width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto' }}>
            {!anfrageSent ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h2 style={{ margin: 0, color: '#5ffbf1', fontSize: '1.1rem' }}>✉️ Anfrage zu diesem Werk</h2>
                  <button type="button" onClick={() => setAnfrageArtwork(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '0.75rem', marginBottom: '1.25rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)' }}>
                  <strong style={{ color: '#fff' }}>{anfrageArtwork.title}</strong>
                  {anfrageArtwork.price ? <span style={{ marginLeft: 8, color: '#5ffbf1' }}>€ {Number(anfrageArtwork.price).toFixed(0)}</span> : null}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>Ihr Name *</label>
                    <input type="text" value={anfrageName} onChange={e => setAnfrageName(e.target.value)}
                      placeholder="Vorname Nachname"
                      style={{ width: '100%', padding: '0.6rem', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(95,251,241,0.3)', borderRadius: 8, color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>E-Mail *</label>
                    <input type="email" value={anfrageEmail} onChange={e => setAnfrageEmail(e.target.value)}
                      placeholder="ihre@email.at"
                      style={{ width: '100%', padding: '0.6rem', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(95,251,241,0.3)', borderRadius: 8, color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>Nachricht (optional)</label>
                    <textarea value={anfrageNachricht} onChange={e => setAnfrageNachricht(e.target.value)}
                      placeholder="Ihre Frage oder Interesse an diesem Werk …"
                      rows={3}
                      style={{ width: '100%', padding: '0.6rem', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(95,251,241,0.3)', borderRadius: 8, color: '#fff', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                  </div>
                  <button type="button"
                    disabled={!anfrageName.trim() || !anfrageEmail.trim()}
                    onClick={() => {
                      if (!anfrageName.trim() || !anfrageEmail.trim()) return
                      try {
                        const anfragen = JSON.parse(localStorage.getItem('k2-anfragen') || '[]')
                        anfragen.unshift({
                          id: `anf-${Date.now()}`,
                          artworkNumber: anfrageArtwork.number || anfrageArtwork.id,
                          artworkTitle: anfrageArtwork.title,
                          artworkPrice: anfrageArtwork.price,
                          name: anfrageName.trim(),
                          email: anfrageEmail.trim(),
                          nachricht: anfrageNachricht.trim(),
                          createdAt: new Date().toISOString(),
                          status: 'neu'
                        })
                        localStorage.setItem('k2-anfragen', JSON.stringify(anfragen))
                        window.dispatchEvent(new CustomEvent('anfrage-eingegangen'))
                      } catch (_) {}
                      setAnfrageSent(true)
                    }}
                    style={{ padding: '0.75rem', background: anfrageName.trim() && anfrageEmail.trim() ? 'linear-gradient(135deg, #5ffbf1, #0ea5e9)' : 'rgba(255,255,255,0.1)', color: anfrageName.trim() && anfrageEmail.trim() ? '#0a0a1a' : 'rgba(255,255,255,0.4)', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '1rem', cursor: anfrageName.trim() && anfrageEmail.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>
                    ✉️ Anfrage senden
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💚</div>
                <h2 style={{ color: '#5ffbf1', marginBottom: '0.5rem' }}>Danke für Ihr Interesse!</h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem' }}>Ihre Anfrage zu „{anfrageArtwork.title}" wurde gespeichert. Wir melden uns bald bei Ihnen.</p>
                <button type="button" onClick={() => setAnfrageArtwork(null)}
                  style={{ padding: '0.6rem 1.5rem', background: 'rgba(95,251,241,0.15)', border: '1px solid rgba(95,251,241,0.4)', borderRadius: 10, color: '#5ffbf1', fontWeight: 600, cursor: 'pointer' }}>
                  OK
                </button>
              </div>
            )}
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

// ─── Guide-Avatar ─────────────────────────────────────────────────────────────
// Geführter Rundgang durch die Demo-Galerie – Option B (Text + Animation)
// Option A (ElevenLabs echter Avatar) kommt nach ersten Rückmeldungen
// ─────────────────────────────────────────────────────────────────────────────
const GUIDE_SCHRITTE = (name: string) => [
  {
    text: `Willkommen, ${name}! 👋\nIch bin dein Galerie-Guide.\nIch zeige dir kurz was hier alles möglich ist.`,
    dauer: 4000,
  },
  {
    text: `Das hier ist deine persönliche Galerie – online, auf jedem Gerät.\nDeine Werke, dein Name, dein Auftritt.`,
    dauer: 4500,
  },
  {
    text: `Jedes Werk bekommt ein eigenes Bild, einen Titel und einen Preis.\nAlles in Minuten – ohne IT-Kenntnisse.`,
    dauer: 4500,
  },
  {
    text: `Interessenten können direkt Kontakt aufnehmen.\nKein Umweg über Social Media.`,
    dauer: 4000,
  },
  {
    text: `Wenn du magst – schau dich einfach um. 🎨\nUnd wenn du Fragen hast, bin ich da.`,
    dauer: 4000,
  },
]

function GalerieGuide({ name, onDismiss }: { name: string; onDismiss: () => void }) {
  const [schritt, setSchritt] = useState(0)
  const [sichtbar, setSichtbar] = useState(true)
  const [textIndex, setTextIndex] = useState(0)
  const schritte = GUIDE_SCHRITTE(name)
  const aktuellerSchritt = schritte[schritt]
  const volltext = aktuellerSchritt?.text ?? ''

  // Schreibmaschinen-Effekt
  useEffect(() => {
    setTextIndex(0)
  }, [schritt])

  useEffect(() => {
    if (textIndex >= volltext.length) return
    const t = setTimeout(() => setTextIndex(i => i + 1), 22)
    return () => clearTimeout(t)
  }, [textIndex, volltext])

  // Auto-weiter nach Dauer
  useEffect(() => {
    if (textIndex < volltext.length) return
    if (schritt >= schritte.length - 1) return
    const t = setTimeout(() => setSchritt(s => s + 1), aktuellerSchritt.dauer)
    return () => clearTimeout(t)
  }, [textIndex, schritt, volltext.length, aktuellerSchritt?.dauer, schritte.length])

  const weiter = () => {
    if (schritt < schritte.length - 1) setSchritt(s => s + 1)
    else { setSichtbar(false); setTimeout(onDismiss, 400) }
  }

  if (!sichtbar) return null

  const angezeigterText = volltext.slice(0, textIndex)
  const istLetzer = schritt === schritte.length - 1
  const istFertig = textIndex >= volltext.length

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 10000,
      width: 'min(420px, calc(100vw - 2rem))',
      animation: 'guideEinblenden 0.4s ease',
    }}>
      <style>{`
        @keyframes guideEinblenden { from { opacity: 0; transform: translateX(-50%) translateY(16px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        @keyframes guidePuls { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>

      <div style={{
        background: 'rgba(18, 10, 6, 0.96)',
        border: '1px solid rgba(255, 140, 66, 0.4)',
        borderRadius: '20px',
        padding: '1.25rem 1.25rem 1rem',
        boxShadow: '0 12px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,140,66,0.1)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        gap: '1rem',
        alignItems: 'flex-start',
      }}>

        {/* Avatar */}
        <div style={{
          width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #b54a1e, #ff8c42)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.6rem', boxShadow: '0 4px 16px rgba(255,140,66,0.35)',
          border: '2px solid rgba(255,140,66,0.4)',
        }}>
          👨‍🎨
        </div>

        {/* Sprechblase */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,140,66,0.6)', marginBottom: '0.4rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Dein Galerie-Guide
          </div>
          <div style={{
            fontSize: '0.95rem', color: '#fff8f0', lineHeight: 1.65,
            minHeight: '3.5rem', whiteSpace: 'pre-line',
          }}>
            {angezeigterText}
            {!istFertig && <span style={{ animation: 'guidePuls 0.8s infinite', display: 'inline-block', marginLeft: 2 }}>▌</span>}
          </div>

          {/* Fortschritts-Punkte + Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.85rem' }}>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {schritte.map((_, i) => (
                <div key={i} style={{ width: i === schritt ? 20 : 7, height: 7, borderRadius: 4, background: i === schritt ? '#ff8c42' : i < schritt ? 'rgba(255,140,66,0.4)' : 'rgba(255,255,255,0.15)', transition: 'all 0.3s' }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" onClick={() => { setSichtbar(false); setTimeout(onDismiss, 300) }} style={{ padding: '0.4rem 0.85rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: '0.78rem' }}>
                Überspringen
              </button>
              <button type="button" onClick={weiter} style={{ padding: '0.4rem 1.1rem', background: istFertig ? 'linear-gradient(135deg, #ff8c42, #b54a1e)' : 'rgba(255,140,66,0.2)', border: `1px solid ${istFertig ? 'transparent' : 'rgba(255,140,66,0.3)'}`, borderRadius: '8px', color: istFertig ? '#fff' : 'rgba(255,140,66,0.6)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700, transition: 'all 0.2s' }}>
                {istLetzer ? '✨ Los geht\'s' : 'Weiter →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
