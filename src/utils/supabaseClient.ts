/**
 * Supabase Client für K2 Galerie
 * Professionelle Datenbank-Integration mit PostgreSQL
 * 
 * Verwendet Edge Functions für API-Zugriff (funktioniert ohne npm install)
 */

// Optional: Supabase JS Client (wenn installiert)
// import { createClient } from '@supabase/supabase-js'

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

    // Konvertiere Datenbank-Format zu App-Format
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
      createdAt: artwork.created_at,
      updatedAt: artwork.updated_at,
      createdOnMobile: artwork.created_on_mobile,
      updatedOnMobile: artwork.updated_on_mobile,
    }))

    console.log(`✅ ${artworks.length} Werke aus Supabase geladen`)
    
    // Backup in localStorage
    try {
      localStorage.setItem('k2-artworks', JSON.stringify(artworks))
    } catch (e) {
      console.warn('⚠️ localStorage Backup fehlgeschlagen:', e)
    }

    return artworks
  } catch (error) {
    console.error('❌ Fehler beim Laden aus Supabase:', error)
    return loadFromLocalStorage()
  }
}

/**
 * Speichert Werke in die Datenbank über Edge Function (Bulk Upsert)
 */
export async function saveArtworksToSupabase(artworks: any[]): Promise<boolean> {
  if (!isSupabaseConfigured() || !ARTWORKS_API_URL) {
    console.warn('⚠️ Supabase nicht konfiguriert - speichere nur in localStorage')
    return saveToLocalStorage(artworks)
  }

  if (!artworks || artworks.length === 0) {
    console.warn('⚠️ Keine Werke zum Speichern')
    return false
  }

  try {
    // Konvertiere App-Format zu Datenbank-Format
    const dbArtworks = artworks.map((artwork: any) => ({
      number: artwork.number || artwork.id,
      title: artwork.title || '',
      category: artwork.category || 'malerei',
      image_url: artwork.imageUrl || artwork.previewUrl,
      preview_url: artwork.previewUrl || artwork.imageUrl,
      price: artwork.price ? parseFloat(String(artwork.price)) : null,
      description: artwork.description || null,
      location: artwork.location || null,
      in_shop: artwork.inShop || false,
      created_at: artwork.createdAt || new Date().toISOString(),
      updated_at: artwork.updatedAt || new Date().toISOString(),
      created_on_mobile: artwork.createdOnMobile || false,
      updated_on_mobile: artwork.updatedOnMobile || false,
    }))

    const response = await fetch(ARTWORKS_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ artworks: dbArtworks }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Supabase Save Error:', response.status, errorText)
      // Fallback zu localStorage
      saveToLocalStorage(artworks)
      return false
    }

    const data = await response.json()
    console.log(`✅ ${data.count || artworks.length} Werke in Supabase gespeichert`)
    
    // Backup in localStorage
    try {
      localStorage.setItem('k2-artworks', JSON.stringify(artworks))
    } catch (e) {
      console.warn('⚠️ localStorage Backup fehlgeschlagen:', e)
    }

    return true
  } catch (error) {
    console.error('❌ Fehler beim Speichern in Supabase:', error)
    // Fallback zu localStorage
    saveToLocalStorage(artworks)
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
    const response = await fetch(ARTWORKS_API_URL, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
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

// Helper: localStorage Fallback
function loadFromLocalStorage(): any[] {
  try {
    const stored = localStorage.getItem('k2-artworks')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        return parsed
      }
    }
  } catch (error) {
    console.warn('⚠️ localStorage parse error:', error)
  }
  return []
}

function saveToLocalStorage(artworks: any[]): boolean {
  try {
    localStorage.setItem('k2-artworks', JSON.stringify(artworks))
    return true
  } catch (error) {
    console.error('❌ localStorage save error:', error)
    return false
  }
}
