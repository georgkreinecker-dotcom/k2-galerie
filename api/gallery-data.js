/**
 * Vercel Serverless: gallery-data aus Vercel Blob lesen und ausliefern.
 * Wird von „Bilder vom Server laden“ genutzt. Tenantfähig: ?tenantId=k2|oeffentlich|vk2.
 * k2 oder fehlend = gallery-data.json (Abwärtskompatibilität).
 */
import { get } from '@vercel/blob'

const ALLOWED_TENANTS = ['k2', 'oeffentlich', 'vk2']

function getBlobPath(tenantId) {
  if (tenantId === 'oeffentlich') return 'gallery-data-oeffentlich.json'
  if (tenantId === 'vk2') return 'gallery-data-vk2.json'
  return 'gallery-data.json'
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cache-Control, Pragma, Expires, If-None-Match, If-Modified-Since, X-Requested-With, X-Data-Version, X-Build-ID, X-Timestamp')
    res.setHeader('Access-Control-Max-Age', '86400')
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Nur GET erlaubt' })
  }

  const tenantId = (req.query?.tenantId || req.query?.tenant || 'k2').toLowerCase()
  const pathname = ALLOWED_TENANTS.includes(tenantId) ? getBlobPath(tenantId) : getBlobPath('k2')

  try {
    const result = await get(pathname, { access: 'public' })
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
