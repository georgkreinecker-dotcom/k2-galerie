/**
 * Supabase Storage für Werkbilder.
 * Bilder werden in den Bucket "artwork-images" hochgeladen, öffentliche URL wird in imageUrl gespeichert.
 * Free Tier: 1 GB Speicher – reicht für viele hundert komprimierte Bilder.
 */

import { getSupabaseAuthClient } from './supabaseAuth'

const BUCKET = 'artwork-images'

/** Extrahiert die Werknummer (30–39) aus einem Supabase-Dateinamen: 0030-1234567890.jpg → 30; K2_K_0030-123.jpg → 30. */
function parseNumberFromStorageFileName(fileName: string): number | null {
  const base = fileName.replace(/\.(jpg|jpeg|png|webp)$/i, '').trim()
  const beforeTimestamp = base.includes('-') ? base.split('-').slice(0, -1).join('-') : base
  const digits = (beforeTimestamp || base).replace(/\D/g, '')
  if (!digits) return null
  const n = parseInt(digits.slice(-2), 10) // 0030→30, 31→31, K2_K_0030→30
  return !Number.isNaN(n) && n >= 30 && n <= 39 ? n : null
}

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

/**
 * Löscht alle Werkbilder in Supabase Storage, deren Nummer im Bereich fromNum–toNum liegt (z. B. 30–39).
 * Listet alle Dateien unter k2/ und entfernt Treffer. Für Bereinigung 0030–0039.
 */
export async function deleteArtworkImagesInStorageForNumberRange(
  fromNum: number,
  toNum: number
): Promise<{ deleted: string[]; error?: string }> {
  const client = getSupabaseAuthClient()
  if (!client) return { deleted: [], error: 'Supabase nicht konfiguriert' }
  const deleted: string[] = []
  try {
    const { data: fileList, error: listError } = await client.storage.from(BUCKET).list('k2', { limit: 2000 })
    if (listError) return { deleted: [], error: listError.message }
    const files = (fileList ?? []) as { name: string }[]
    const toRemove: string[] = []
    for (const f of files) {
      const n = parseNumberFromStorageFileName(f.name)
      if (n != null && n >= fromNum && n <= toNum) toRemove.push(`k2/${f.name}`)
    }
    if (toRemove.length === 0) return { deleted: [] }
    const { error: removeError } = await client.storage.from(BUCKET).remove(toRemove)
    if (removeError) return { deleted: [], error: removeError.message }
    deleted.push(...toRemove)
  } catch (e) {
    return { deleted, error: e instanceof Error ? e.message : String(e) }
  }
  return { deleted }
}
