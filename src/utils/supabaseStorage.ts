/**
 * Supabase Storage für Werkbilder.
 * Bilder werden in den Bucket "artwork-images" hochgeladen, öffentliche URL wird in imageUrl gespeichert.
 * Free Tier: 1 GB Speicher – reicht für viele hundert komprimierte Bilder.
 */

import { getSupabaseAuthClient } from './supabaseAuth'

const BUCKET = 'artwork-images'

/** Data-URL oder Blob in Blob umwandeln (für Upload). */
function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',')
  const mime = (header?.match(/data:([^;]+)/)?.[1] || 'image/jpeg').trim()
  const binary = atob(base64 || '')
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

/**
 * Lädt ein Werkbild in Supabase Storage hoch und gibt die öffentliche URL zurück.
 * Pfad: k2/{number}-{timestamp}.jpg (eindeutig, Überschreiben bei gleichem Werk möglich).
 * @param imageDataUrl Data-URL (z. B. nach Komprimierung/Freistellung)
 * @param artworkNumber Werknummer (z. B. M-001) für den Dateinamen
 * @returns Öffentliche URL oder null bei Fehler/Nicht konfiguriert
 */
export async function uploadArtworkImageToStorage(
  imageDataUrl: string,
  artworkNumber: string
): Promise<string | null> {
  const client = getSupabaseAuthClient()
  if (!client) return null

  try {
    const blob = dataUrlToBlob(imageDataUrl)
    const safeNumber = (artworkNumber || 'werk').replace(/[^a-zA-Z0-9-_]/g, '_')
    const path = `k2/${safeNumber}-${Date.now()}.jpg`
    const { error } = await client.storage.from(BUCKET).upload(path, blob, {
      contentType: 'image/jpeg',
      upsert: true
    })
    if (error) {
      console.warn('Supabase Storage Upload fehlgeschlagen:', error)
      return null
    }
    const { data } = client.storage.from(BUCKET).getPublicUrl(path)
    return data?.publicUrl || null
  } catch (e) {
    console.warn('Supabase Storage Upload Fehler:', e)
    return null
  }
}
