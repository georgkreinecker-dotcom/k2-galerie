/**
 * FIX (31.03.26): Auf Produktion kam auf /api/gallery-data wiederholt falscher Body zurück.
 * Deshalb: eigener, eindeutiger Endpoint und vercel.json Rewrite:
 *   /api/gallery-data  ->  /api/gallery-data-get
 *
 * Zweck: deterministisch immer Blob gallery-data laden.
 */
import { get } from '@vercel/blob'

const LEGACY_TENANTS = ['k2', 'oeffentlich', 'vk2']

function isSafeTenantId(id) {
  if (!id || typeof id !== 'string') return false
  return /^[a-z0-9-]{1,64}$/.test(id)
}

function getBlobPath(tenantId) {
  if (tenantId === 'k2') return 'gallery-data.json'
  if (tenantId === 'oeffentlich') return 'gallery-data-oeffentlich.json'
  if (tenantId === 'vk2') return 'gallery-data-vk2.json'
  if (isSafeTenantId(tenantId)) return `gallery-data-${tenantId}.json`
  return 'gallery-data.json'
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Cache-Control, Pragma, Expires, If-None-Match, If-Modified-Since, X-Requested-With, X-Data-Version, X-Build-ID, X-Timestamp'
    )
    res.setHeader('Access-Control-Max-Age', '86400')
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Nur GET erlaubt' })
  }

  const tenantId = String(req.query?.tenantId || req.query?.tenant || 'k2')
    .toLowerCase()
    .trim()
  const pathname = LEGACY_TENANTS.includes(tenantId) || isSafeTenantId(tenantId) ? getBlobPath(tenantId) : getBlobPath('k2')

  try {
    const result = await get(pathname, { access: 'public' })
    if (!result || result.statusCode !== 200 || !result.stream) {
      return res.status(404).json({ error: 'Noch keine Daten', hint: 'Zuerst am Mac „An Server senden“ tippen.' })
    }
    const chunks = []
    for await (const chunk of result.stream) chunks.push(chunk)
    const buffer = Buffer.concat(chunks)
    res.setHeader('Content-Type', 'application/json')
    return res.end(buffer)
  } catch (err) {
    console.error('gallery-data-get GET:', err)
    const msg = (err?.message || String(err)).trim()
    const isToken = /token|BLOB_READ_WRITE|authorization/i.test(msg)
    const isSuspended = /BlobStoreSuspendedError|suspended|store has been suspended/i.test(msg)
    let hint = msg.substring(0, 300)
    if (isToken) hint = 'In Vercel: Storage → Blob Store anlegen. Danach ist BLOB_READ_WRITE_TOKEN automatisch gesetzt.'
    else if (isSuspended) hint = 'Vercel Blob Store pausiert. Vercel Dashboard → Storage → Blob prüfen; ggf. vercel.com/help.'
    return res.status(500).json({
      error: isToken ? 'Blob-Speicher nicht eingerichtet' : isSuspended ? 'Blob-Speicher pausiert' : 'Laden fehlgeschlagen',
      hint
    })
  }
}

