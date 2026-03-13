/**
 * Vercel Serverless: Einzelbild-Upload für Werke 30+ (Fallback wenn Supabase fehlt oder fehlschlägt).
 * POST Body: JSON { artworkNumber: string, dataUrl: string } (data:image/...;base64,...)
 * Speichert in Vercel Blob unter artwork-images/k2/{number}-{timestamp}.jpg, gibt öffentliche URL zurück.
 * Damit „An Server senden“ vom Handy/iPad auch ohne Supabase funktioniert.
 */
import { put } from '@vercel/blob'

const MAX_BODY_BYTES = 2 * 1024 * 1024 // 2 MB pro Bild

function base64ToBuffer(dataUrl) {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image')) return null
  const comma = dataUrl.indexOf(',')
  if (comma === -1) return null
  const base64 = dataUrl.slice(comma + 1)
  try {
    return Buffer.from(base64, 'base64')
  } catch {
    return null
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Nur POST erlaubt' })
  }

  let body = ''
  for await (const chunk of req) body += chunk
  if (!body || body.length > MAX_BODY_BYTES) {
    return res.status(400).json({ error: 'Body leer oder zu groß (max 2 MB)' })
  }

  let parsed
  try {
    parsed = JSON.parse(body)
  } catch {
    return res.status(400).json({ error: 'Ungültiges JSON' })
  }

  const artworkNumber = parsed?.artworkNumber != null ? String(parsed.artworkNumber).trim() : ''
  const dataUrl = parsed?.dataUrl
  if (!artworkNumber || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image')) {
    return res.status(400).json({ error: 'artworkNumber und dataUrl (data:image/...) erforderlich' })
  }

  const buffer = base64ToBuffer(dataUrl)
  if (!buffer || buffer.length === 0) {
    return res.status(400).json({ error: 'Bilddaten konnten nicht gelesen werden' })
  }

  const safeNumber = artworkNumber.replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 64)
  const pathname = `artwork-images/k2/${safeNumber}-${Date.now()}.jpg`

  try {
    const blob = await put(pathname, buffer, {
      access: 'public',
      contentType: 'image/jpeg',
      addRandomSuffix: false,
      allowOverwrite: true
    })
    const url = blob?.url || null
    if (!url) {
      return res.status(500).json({ error: 'Upload fehlgeschlagen (keine URL)' })
    }
    return res.status(200).json({ success: true, url })
  } catch (err) {
    console.error('upload-artwork-image Fehler:', err)
    const msg = (err?.message || String(err)).trim()
    const isToken = /token|BLOB_READ_WRITE|authorization/i.test(msg)
    const isSuspended = /BlobStoreSuspendedError|suspended|store has been suspended/i.test(msg)
    let hint = msg.substring(0, 300)
    if (isToken) hint = 'In Vercel: Storage → Blob Store anlegen. Danach ist BLOB_READ_WRITE_TOKEN automatisch gesetzt.'
    else if (isSuspended) hint = 'Vercel Blob Store pausiert. Vercel Dashboard → Storage → Blob prüfen; ggf. vercel.com/help.'
    return res.status(500).json({
      error: isToken ? 'Blob-Speicher nicht eingerichtet' : isSuspended ? 'Blob-Speicher pausiert' : 'Upload fehlgeschlagen',
      hint
    })
  }
}
