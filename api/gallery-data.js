/**
 * Vercel Serverless: gallery-data aus Vercel Blob lesen und ausliefern.
 * Wird von „Bilder vom Server laden“ genutzt. Kein Build nötig – Daten sind sofort verfügbar.
 */
import { get } from '@vercel/blob'

const BLOB_PATHNAME = 'gallery-data.json'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
  // CORS Preflight (von localhost/anderen Origins): Browser braucht diese Header, sonst blockiert er den GET
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cache-Control, Pragma, Expires, If-None-Match, If-Modified-Since, X-Requested-With, X-Data-Version, X-Build-ID, X-Timestamp')
    res.setHeader('Access-Control-Max-Age', '86400')
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Nur GET erlaubt' })
  }

  try {
    const result = await get(BLOB_PATHNAME, { access: 'public' })
    if (!result || result.statusCode !== 200 || !result.stream) {
      return res.status(404).json({ error: 'Noch keine Daten', hint: 'Zuerst am iPad/Mac „Daten an Server senden“ tippen.' })
    }
    const chunks = []
    for await (const chunk of result.stream) chunks.push(chunk)
    const buffer = Buffer.concat(chunks)
    res.setHeader('Content-Type', 'application/json')
    return res.end(buffer)
  } catch (err) {
    console.error('gallery-data GET:', err)
    return res.status(500).json({
      error: 'Laden fehlgeschlagen',
      hint: err?.message?.substring(0, 150) || ''
    })
  }
}
