/**
 * Supabase Client für K2 Galerie
 * Professionelle Datenbank-Integration mit PostgreSQL
 * Verwendet Edge Functions für API-Zugriff.
 * Schreibzugriffe (POST/PUT/DELETE) nutzen bei eingeloggtem Admin das Auth-JWT (RLS).
 */

import { getAuthToken } from './supabaseAuth'
import { filterK2ArtworksOnly } from './autoSave'
import { readArtworksRawByKey, saveArtworksByKey } from './artworksStorage'
import { mergeServerWithLocal } from './syncMerge'
import { getArtworkImage } from './artworkImageStore'
import { uploadArtworkImageToStorage } from './supabaseStorage'

// Sicherer Zugriff auf import.meta.env
let SUPABASE_URL = ''
let SUPABASE_ANON_KEY = ''

try {
  const env = import.meta.env || {}
  SUPABASE_URL = String(env.VITE_SUPABASE_URL || '')
  SUPABASE_ANON_KEY = String(env.VITE_SUPABASE_ANON_KEY || '')
} catch (error) {
  console.warn('⚠️ Supabase Environment-Variablen nicht gefunden')
}

// Prüfe ob Supabase konfiguriert ist
const USE_SUPABASE = !!SUPABASE_URL && !!SUPABASE_ANON_KEY && SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0

// Edge Function URL
const ARTWORKS_API_URL = USE_SUPABASE ? `${SUPABASE_URL}/functions/v1/artworks` : null

/**
 * Prüft ob Supabase konfiguriert ist
 */
export function isSupabaseConfigured(): boolean {
  return USE_SUPABASE && ARTWORKS_API_URL !== null
}

/**
 * Lädt alle Werke aus der Datenbank über Edge Function
 */
export async function loadArtworksFromSupabase(): Promise<any[]> {
  if (!isSupabaseConfigured() || !ARTWORKS_API_URL) {
    console.warn('⚠️ Supabase nicht konfiguriert - verwende localStorage')
    return loadFromLocalStorage()
  }

  try {
    const response = await fetch(ARTWORKS_API_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Supabase Load Error:', response.status, errorText)
      return loadFromLocalStorage()
    }

    const data = await response.json()
    const dbArtworks = data.artworks || []

    // Konvertiere Datenbank-Format zu App-Format (inExhibition = „In Online-Galerie anzeigen“)
    const artworks = dbArtworks.map((artwork: any) => ({
      id: artwork.id,
      number: artwork.number,
      title: artwork.title,
      category: artwork.category,
      imageUrl: artwork.image_url || artwork.preview_url,
      previewUrl: artwork.preview_url,
      price: artwork.price,
      description: artwork.description,
      location: artwork.location,
      inShop: artwork.in_shop !== false,
      inExhibition: artwork.in_exhibition !== false,
      createdAt: artwork.created_at,
      updatedAt: artwork.updated_at,
      createdOnMobile: artwork.created_on_mobile,
      updatedOnMobile: artwork.updated_on_mobile,
    }))

    console.log(`✅ ${artworks.length} Werke aus Supabase geladen`)
    const localList = loadFromLocalStorage()
    const { merged } = mergeServerWithLocal(artworks, localList, { onlyAddLocalIfMobileAndVeryNew: true })
    try {
      // 🔒 Nur schreiben wenn mindestens so viele wie lokal – nie mit weniger überschreiben (Datenverlust)
      if (merged.length >= localList.length) {
        const toStore = filterK2ArtworksOnly(merged)
        saveArtworksByKey('k2-artworks', toStore, { filterK2Only: false, allowReduce: false })
      } else {
        console.warn(`⚠️ Supabase-Load: merged ${merged.length} < lokal ${localList.length} – localStorage unverändert`)
      }
    } catch (e) {
      console.warn('⚠️ localStorage Backup fehlgeschlagen:', e)
    }
    return merged
  } catch (error) {
    console.error('❌ Fehler beim Laden aus Supabase:', error)
    return loadFromLocalStorage()
  }
}

/**
 * Liefert eine für Supabase/Handy nutzbare Bild-URL: entweder bestehende https-URL
 * oder Auflösung aus imageRef/IndexedDB + Upload nach Supabase Storage.
 * So sieht das Handy nach Sync die Bilder (keine Platzhalter).
 */
export async function resolveImageUrlForSupabase(artwork: any): Promise<string | undefined> {
  const url = artwork?.imageUrl
  const ref = artwork?.imageRef
  const number = artwork?.number || artwork?.id || 'werk'
  // Bereits öffentliche URL (z. B. von früherem Storage-Upload) → unverändert nutzen
  if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
    return url
  }
  let dataUrl: string | null = null
  if (typeof url === 'string' && url.startsWith('data:image')) {
    dataUrl = url
  } else if (ref && typeof ref === 'string') {
    dataUrl = await getArtworkImage(ref)
  }
  if (!dataUrl) return undefined
  const storageUrl = await uploadArtworkImageToStorage(dataUrl, String(number))
  return storageUrl ?? undefined
}

/**
 * Bereitet Werke für den Export (gallery-data.json) vor: imageRef/Base64 → Supabase-URL.
 * So enthält die veröffentlichte Datei echte Bild-URLs und das Handy zeigt keine Platzhalter.
 * Bei nicht konfiguriertem Supabase bleiben imageUrl leer (wie bisher).
 */
export async function resolveArtworkImageUrlsForExport(artworks: any[]): Promise<any[]> {
  if (!Array.isArray(artworks) || artworks.length === 0) return artworks
  const out = await Promise.all(
    artworks.map(async (a: any) => {
      try {
        const imageUrl = await resolveImageUrlForSupabase(a)
        const previewUrl = a.previewUrl && (a.previewUrl.startsWith('http') ? a.previewUrl : null)
        return { ...a, imageUrl: imageUrl ?? a.imageUrl ?? '', previewUrl: previewUrl ?? imageUrl ?? a.previewUrl ?? '' }
      } catch (e) {
        console.warn('Bild-URL für Export nicht auflösbar:', a?.number ?? a?.id, e)
        return a
      }
    })
  )
  return out
}

/**
 * Speichert Werke in die Datenbank über Edge Function (Bulk Upsert).
 * Vor dem Speichern werden Bild-URLs aufgelöst (imageRef → IndexedDB → Supabase Storage),
 * damit das Handy nach Sync echte Bilder statt Platzhalter sieht.
 */
export async function saveArtworksToSupabase(artworks: any[]): Promise<boolean> {
  if (!isSupabaseConfigured() || !ARTWORKS_API_URL) {
    console.warn('⚠️ Supabase nicht konfiguriert - speichere nur in localStorage')
    return saveToLocalStorage(artworks)
  }

  if (!artworks || !Array.isArray(artworks) || artworks.length === 0) {
    console.warn('⚠️ Keine Werke zum Speichern')
    return false
  }

  // Nur Werke mit number oder id – verhindert ungültige Einträge
  const validArtworks = artworks.filter((a: any) => (a?.number ?? a?.id) != null && String(a?.number ?? a?.id).trim() !== '')
  if (validArtworks.length === 0) {
    console.warn('⚠️ Keine gültigen Werke (number/id fehlt)')
    return false
  }
  if (validArtworks.length < artworks.length) {
    console.warn(`⚠️ ${artworks.length - validArtworks.length} Werke ohne number/id übersprungen`)
  }

  try {
    // Bild-URLs für Supabase auflösen (imageRef → Storage-URL). Einzelfehler brechen den Batch nicht ab.
    const withResolvedUrls = await Promise.all(
      validArtworks.map(async (artwork: any) => {
        let resolvedUrl: string | undefined
        try {
          resolvedUrl = await resolveImageUrlForSupabase(artwork)
        } catch (e) {
          console.warn('⚠️ Bild-URL für Werk', artwork?.number ?? artwork?.id, 'nicht auflösbar:', e)
        }
        const imageUrl = resolvedUrl ?? artwork.imageUrl ?? artwork.previewUrl
        const previewUrl = artwork.previewUrl ?? imageUrl
        return { ...artwork, imageUrl, previewUrl }
      })
    )

    // Konvertiere App-Format zu Datenbank-Format
    const dbArtworks = withResolvedUrls.map((artwork: any) => ({
      number: artwork.number || artwork.id,
      title: artwork.title || '',
      category: artwork.category || 'malerei',
      image_url: artwork.imageUrl || artwork.previewUrl,
      preview_url: artwork.previewUrl || artwork.imageUrl,
      price: artwork.price ? parseFloat(String(artwork.price)) : null,
      description: artwork.description || null,
      location: artwork.location || null,
      in_shop: artwork.inShop || false,
      in_exhibition: artwork.inExhibition !== false,
      created_at: artwork.createdAt || new Date().toISOString(),
      updated_at: artwork.updatedAt || new Date().toISOString(),
      created_on_mobile: artwork.createdOnMobile || false,
      updated_on_mobile: artwork.updatedOnMobile || false,
    }))

    const token = await getAuthToken()
    const response = await fetch(ARTWORKS_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token || SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ artworks: dbArtworks }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Supabase Save Error:', response.status, errorText)
      saveToLocalStorage(validArtworks)
      return false
    }

    const data = await response.json()
    console.log(`✅ ${data.count || artworks.length} Werke in Supabase gespeichert`)
    
    try {
      const toStore = filterK2ArtworksOnly(validArtworks)
      saveArtworksByKey('k2-artworks', toStore, { filterK2Only: false, allowReduce: true })
    } catch (e) {
      console.warn('⚠️ localStorage Backup nach Supabase-Success fehlgeschlagen:', e)
    }

    return true
  } catch (error) {
    console.error('❌ Fehler beim Speichern in Supabase:', error)
    saveToLocalStorage(validArtworks)
    return false
  }
}

/**
 * Erstellt oder aktualisiert ein einzelnes Werk
 */
export async function saveArtworkToSupabase(artwork: any): Promise<boolean> {
  return saveArtworksToSupabase([artwork])
}

/**
 * Löscht ein Werk aus der Datenbank über Edge Function
 */
export async function deleteArtworkFromSupabase(number: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !ARTWORKS_API_URL) {
    console.warn('⚠️ Supabase nicht konfiguriert')
    return false
  }

  try {
    const token = await getAuthToken()
    const response = await fetch(ARTWORKS_API_URL, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token || SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ number }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Supabase Delete Error:', response.status, errorText)
      return false
    }

    console.log(`✅ Werk ${number} aus Supabase gelöscht`)
    return true
  } catch (error) {
    console.error('❌ Fehler beim Löschen aus Supabase:', error)
    return false
  }
}

/**
 * Synchronisiert Mobile-Daten zu Supabase
 * Wird automatisch auf Mobile aufgerufen nach jedem Speichern
 */
export async function syncMobileToSupabase(): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.log('ℹ️ Supabase nicht konfiguriert - Mobile-Sync deaktiviert')
    return false
  }

  try {
    const artworks = loadFromLocalStorage()
    if (artworks.length === 0) {
      console.log('ℹ️ Keine Werke in localStorage gefunden')
      return false
    }

    // Markiere alle Mobile-Werke für bessere Erkennung
    const artworksWithMobileMarker = artworks.map((a: any) => ({
      ...a,
      updated_on_mobile: true, // Marker für Mobile-Updates
    }))

    const success = await saveArtworksToSupabase(artworksWithMobileMarker)
    if (success) {
      const timestamp = Date.now().toString()
      console.log(`✅ Mobile-Daten zu Supabase synchronisiert: ${artworks.length} Werke`)
      localStorage.setItem('k2-mobile-sync-timestamp', timestamp)
      localStorage.setItem('k2-last-sync-time', timestamp)
      
      // Speichere auch Hash für bessere Update-Erkennung
      const hash = artworks.map((a: any) => a.number || a.id).sort().join(',')
      localStorage.setItem('k2-artworks-hash', hash)
    }
    return success
  } catch (error) {
    console.error('❌ Fehler bei Mobile-Sync:', error)
    return false
  }
}

/**
 * Prüft ob es neue Daten von Mobile gibt (für Mac)
 * Vergleicht Anzahl, Timestamps und Hash für robuste Erkennung
 */
export async function checkMobileUpdates(): Promise<{ hasUpdates: boolean; artworks?: any[] }> {
  if (!isSupabaseConfigured()) {
    return { hasUpdates: false }
  }

  try {
    const remoteArtworks = await loadArtworksFromSupabase()
    const localArtworks = loadFromLocalStorage()
    
    // Methode 1: Anzahl-Vergleich
    if (remoteArtworks.length > localArtworks.length) {
      console.log(`🔄 Neue Mobile-Daten gefunden (Anzahl): ${remoteArtworks.length - localArtworks.length} neue Werke`)
      return { hasUpdates: true, artworks: remoteArtworks }
    }

    // Methode 2: Hash-Vergleich (robuster)
    const remoteHash = remoteArtworks.map((a: any) => a.number || a.id).sort().join(',')
    const localHash = localStorage.getItem('k2-artworks-hash') || localArtworks.map((a: any) => a.number || a.id).sort().join(',')
    
    if (remoteHash !== localHash && remoteArtworks.length > 0) {
      console.log('🔄 Neue Mobile-Daten gefunden (Hash-Unterschied)')
      return { hasUpdates: true, artworks: remoteArtworks }
    }

    // Methode 3: Timestamp-Vergleich (für Updates)
    const lastSync = localStorage.getItem('k2-mobile-sync-timestamp')
    if (lastSync && remoteArtworks.length > 0) {
      const remoteLatest = remoteArtworks.reduce((latest, a) => {
        const updated = new Date(a.updatedAt || a.createdAt || 0).getTime()
        return updated > latest ? updated : latest
      }, 0)
      
      const localLatest = localArtworks.reduce((latest, a) => {
        const updated = new Date(a.updatedAt || a.createdAt || 0).getTime()
        return updated > latest ? updated : latest
      }, 0)

      if (remoteLatest > localLatest + 1000) { // 1 Sekunde Toleranz
        console.log('🔄 Mobile-Daten sind neuer (Timestamp)')
        return { hasUpdates: true, artworks: remoteArtworks }
      }
    }

    // Methode 4: Prüfe Mobile-Marker (updated_on_mobile)
    const hasMobileUpdates = remoteArtworks.some((a: any) => 
      a.updated_on_mobile || a.updatedOnMobile
    )
    const localHasMobileUpdates = localArtworks.some((a: any) => 
      a.updated_on_mobile || a.updatedOnMobile
    )
    
    if (hasMobileUpdates && !localHasMobileUpdates && remoteArtworks.length > 0) {
      console.log('🔄 Mobile-Updates gefunden (Mobile-Marker)')
      return { hasUpdates: true, artworks: remoteArtworks }
    }

    return { hasUpdates: false }
  } catch (error) {
    console.error('❌ Fehler bei Update-Check:', error)
    return { hasUpdates: false }
  }
}

/**
 * Synchronisiert automatisch Mobile-Daten zu Supabase (wird auf Mobile aufgerufen)
 * Wird nach jedem Speichern automatisch getriggert
 */
export async function autoSyncMobileToSupabase(): Promise<void> {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768
  
  if (!isMobile) {
    return // Nur auf Mobile
  }

  if (!isSupabaseConfigured()) {
    console.log('ℹ️ Supabase nicht konfiguriert - Auto-Sync deaktiviert')
    return
  }

  try {
    await syncMobileToSupabase()
    console.log('✅ Auto-Sync erfolgreich')
  } catch (error) {
    console.warn('⚠️ Auto-Sync fehlgeschlagen (nicht kritisch):', error)
  }
}

function loadFromLocalStorage(): any[] {
  try {
    const list = readArtworksRawByKey('k2-artworks')
    return Array.isArray(list) ? list : []
  } catch (error) {
    console.warn('⚠️ localStorage parse error:', error)
  }
  return []
}

function saveToLocalStorage(artworks: any[]): boolean {
  try {
    const toSave = filterK2ArtworksOnly(artworks)
    return saveArtworksByKey('k2-artworks', toSave, { filterK2Only: false, allowReduce: true })
  } catch (error) {
    console.error('❌ localStorage save error:', error)
    return false
  }
}
