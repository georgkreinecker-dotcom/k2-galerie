/**
 * Kassa-Snapshot vom Blob lesen (GET). Query: tenantId, optional vk2PilotId
 */
import { get } from '@vercel/blob'

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
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    return res.status(200).end()
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Nur GET erlaubt' })
  }

  const q = req.query || {}
  const tRaw = String(q.tenantId || q.tenant || 'k2').toLowerCase().trim()
  const tenantId = tRaw === 'oeffentlich' || tRaw === 'vk2' || tRaw === 'k2' ? tRaw : 'k2'
  const pilotRaw = q.vk2PilotId != null ? String(q.vk2PilotId).replace(/\D/g, '').slice(0, 8) : ''
  const pathname = getBlobPath(tenantId, pilotRaw && tenantId === 'vk2' ? pilotRaw : null)

  try {
    const result = await get(pathname, { access: 'public' })
    if (!result || result.statusCode !== 200 || !result.stream) {
      return res.status(404).json({ error: 'Noch kein Kassa-Stand', hint: 'Zuerst „Kassa schließen & an Server senden“ auf dem Gerät mit dem Verkauf.' })
    }
    const chunks = []
    for await (const chunk of result.stream) chunks.push(chunk)
    const buffer = Buffer.concat(chunks)
    res.setHeader('Content-Type', 'application/json')
    return res.end(buffer)
  } catch (err) {
    const msg = (err?.message || String(err)).trim()
    if (/not found|404|No blob/i.test(msg)) {
      return res.status(404).json({ error: 'Noch kein Kassa-Stand' })
    }
    console.error('kassa-data-get GET:', err)
    return res.status(500).json({ error: 'Laden fehlgeschlagen', hint: msg.substring(0, 200) })
  }
}
