/**
 * Supabase Client für K2 Galerie
 * Speichert Daten in Supabase KV Store für Echtzeit-Synchronisation
 */

// Sicherer Zugriff auf import.meta.env mit Fallback
let SUPABASE_URL = ''
let SUPABASE_ANON_KEY = ''

try {
  // @ts-ignore - import.meta.env ist in Vite verfügbar
  const env = import.meta.env || {}
  SUPABASE_URL = String(env.VITE_SUPABASE_URL || '')
  SUPABASE_ANON_KEY = String(env.VITE_SUPABASE_ANON_KEY || '')
} catch (error) {
  // Ignoriere Fehler, verwende localStorage
}

// Fallback: Wenn Supabase nicht konfiguriert ist, verwende localStorage
const USE_SUPABASE = !!SUPABASE_URL && !!SUPABASE_ANON_KEY && SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0

/**
 * Speichert Werke in Supabase KV Store
 */
export async function saveArtworksToSupabase(artworks: any[]): Promise<boolean> {
  if (!USE_SUPABASE) {
    // Fallback zu localStorage
    localStorage.setItem('k2-artworks', JSON.stringify(artworks))
    return true
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/kv_store`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        key: 'k2-artworks',
        value: artworks,
      }),
    })

    if (!response.ok) {
      console.error('Supabase Save Error:', await response.text())
      // Fallback zu localStorage
      localStorage.setItem('k2-artworks', JSON.stringify(artworks))
      return false
    }

    // Auch in localStorage als Backup speichern
    localStorage.setItem('k2-artworks', JSON.stringify(artworks))
    return true
  } catch (error) {
    console.error('Supabase Save Error:', error)
    // Fallback zu localStorage
    localStorage.setItem('k2-artworks', JSON.stringify(artworks))
    return false
  }
}

/**
 * Lädt Werke aus Supabase KV Store
 */
export async function loadArtworksFromSupabase(): Promise<any[]> {
  // Wenn Supabase nicht konfiguriert ist, nur localStorage verwenden
  if (!USE_SUPABASE) {
    try {
      const stored = localStorage.getItem('k2-artworks')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          return parsed
        }
      }
    } catch (error) {
      console.warn('localStorage parse error:', error)
    }
    return []
  }

  // Versuche Supabase, mit localStorage Fallback
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/kv_store?key=k2-artworks`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      const artworks = data.value || []
      
      if (Array.isArray(artworks)) {
        // Auch in localStorage als Backup speichern
        localStorage.setItem('k2-artworks', JSON.stringify(artworks))
        return artworks
      }
    }
  } catch (error) {
    console.warn('Supabase Load Error, verwende localStorage:', error)
  }
  
  // Fallback zu localStorage
  try {
    const stored = localStorage.getItem('k2-artworks')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    // Ignoriere Parse-Fehler
  }
  
  return []
}

/**
 * Prüft ob Supabase konfiguriert ist
 */
export function isSupabaseConfigured(): boolean {
  return USE_SUPABASE
}
