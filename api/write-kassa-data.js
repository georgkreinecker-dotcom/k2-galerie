/**
 * Kassa-Snapshot: Bestellungen, Verkaufsliste, Kassabuch, Kunden – ein Blob pro Mandant
 * (k2, ök2, VK2; VK2 optional mit Pilot-Scope inkl. kassa-data-vk2-pilot-*.json).
 * Gleiche API-Key-Prüfung wie write-gallery-data.
 */
import { put } from '@vercel/blob'

const API_KEY_HEADER = 'x-api-key'
const AUTH_HEADER = 'authorization'

function isSafeTenantId(id) {
  if (!id || typeof id !== 'string') return false
  return /^[a-z0-9-]{1,64}$/.test(id)
}

function isSafePilotId(id) {
  if (!id || typeof id !== 'string') return false
  return /^\d{1,8}$/.test(id)
}

function getBlobPath(tenantId, vk2PilotId) {
  if (tenantId === 'k2') return 'kassa-data-k2.json'
  if (tenantId === 'oeffentlich') return 'kassa-data-oeffentlich.json'
  if (tenantId === 'vk2' && vk2PilotId && isSafePilotId(vk2PilotId)) {
    return `kassa-data-vk2-pilot-${vk2PilotId}.json`
  }
  if (tenantId === 'vk2') return 'kassa-data-vk2.json'
  if (isSafeTenantId(tenantId)) return `kassa-data-${tenantId}.json`
  return 'kassa-data-k2.json'
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Nur POST erlaubt' })
  }

  const expectedKey = process.env.WRITE_GALLERY_API_KEY
  if (expectedKey && typeof expectedKey === 'string' && expectedKey.length > 0) {
    const apiKey = req.headers[API_KEY_HEADER] || (req.headers[AUTH_HEADER] || '').replace(/^Bearer\s+/i, '').trim()
    if (apiKey !== expectedKey) {
      return res.status(401).json({ error: 'Nicht autorisiert', hint: 'API-Key fehlt oder ist ungültig.' })
    }
  }

  let body = ''
  for await (const chunk of req) body += chunk
  const maxBodyBytes = 2 * 1024 * 1024
  if (!body || body.length > maxBodyBytes) {
    return res.status(400).json({
      error: 'Daten zu groß',
      hint: 'Kassa-Payload max. 2 MB. Bei Bedarf Support.',
    })
  }

  let parsed
  try {
    parsed = JSON.parse(body)
  } catch {
    return res.status(400).json({ error: 'Ungültiges JSON' })
  }

  const tRaw = String(parsed.tenantId || 'k2').toLowerCase().trim()
  const tenantId = tRaw === 'oeffentlich' || tRaw === 'vk2' || tRaw === 'k2' ? tRaw : 'k2'
  const vk2Pilot = parsed.vk2PilotId != null ? String(parsed.vk2PilotId).replace(/\D/g, '').slice(0, 8) : ''
  const pathname = getBlobPath(tenantId, vk2Pilot && tenantId === 'vk2' ? vk2Pilot : null)

  const out = {
    tenantId,
    vk2PilotId: vk2Pilot && tenantId === 'vk2' ? vk2Pilot : undefined,
    version: 1,
    exportedAt: typeof parsed.exportedAt === 'string' ? parsed.exportedAt : new Date().toISOString(),
    orders: Array.isArray(parsed.orders) ? parsed.orders : [],
    soldArtworks: Array.isArray(parsed.soldArtworks) ? parsed.soldArtworks : [],
    kassabuch: Array.isArray(parsed.kassabuch) ? parsed.kassabuch : [],
    customers: Array.isArray(parsed.customers) ? parsed.customers : [],
  }

  const json = JSON.stringify(out)
  try {
    await put(pathname, json, {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    })
    return res.status(200).json({
      success: true,
      path: pathname,
      ordersCount: out.orders.length,
      soldCount: out.soldArtworks.length,
      kassabuchCount: out.kassabuch.length,
      customersCount: out.customers.length,
    })
  } catch (err) {
    console.error('write-kassa-data:', err)
    const msg = (err?.message || String(err)).trim()
    return res.status(500).json({ error: 'Speichern fehlgeschlagen', hint: msg.substring(0, 300) })
  }
}
