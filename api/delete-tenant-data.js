/**
 * Vercel Serverless: Mandanten-Daten löschen (Blob gallery-data-{tenantId}.json).
 * Nur per Geheimnis aufrufbar (TENANT_DELETE_SECRET). K2 wird nie gelöscht.
 *
 * POST Body: { tenantId: string, secret: string }
 * Oder: Header Authorization: Bearer <TENANT_DELETE_SECRET>, Body: { tenantId: string }
 *
 * Erlaubt: oeffentlich, vk2, sowie beliebige sichere tenantIds (a-z0-9-, max 64 Zeichen).
 * Verboten: tenantId === 'k2' (echte Galerie).
 */
import { del } from '@vercel/blob'

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
  return null
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Nur POST erlaubt' })

  const expectedSecret = process.env.TENANT_DELETE_SECRET
  if (!expectedSecret) {
    console.error('delete-tenant-data: TENANT_DELETE_SECRET fehlt')
    return res.status(500).json({ error: 'Lösch-Funktion nicht konfiguriert' })
  }

  let body
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
  } catch {
    return res.status(400).json({ error: 'Ungültiger JSON-Body' })
  }

  const secret = body.secret || (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim()
  if (secret !== expectedSecret) {
    return res.status(401).json({ error: 'Nicht autorisiert' })
  }

  const tenantIdRaw = (body.tenantId || '').toLowerCase().trim()
  const tenantId = LEGACY_TENANTS.includes(tenantIdRaw) ? tenantIdRaw : (isSafeTenantId(tenantIdRaw) ? tenantIdRaw : null)

  if (!tenantId) {
    return res.status(400).json({ error: 'tenantId fehlt oder ungültig (erlaubt: oeffentlich, vk2, oder a-z0-9- max 64 Zeichen)' })
  }

  if (tenantId === 'k2') {
    return res.status(400).json({ error: 'K2-Daten dürfen nicht gelöscht werden' })
  }

  const pathname = getBlobPath(tenantId)
  if (!pathname) {
    return res.status(400).json({ error: 'Ungültiger tenantId' })
  }

  try {
    await del(pathname)
    console.log('[delete-tenant-data] Blob gelöscht:', pathname, 'tenantId:', tenantId)
    return res.status(200).json({ ok: true, deleted: pathname, tenantId })
  } catch (err) {
    console.error('[delete-tenant-data] Fehler:', err?.message || err)
    return res.status(500).json({
      error: 'Löschen fehlgeschlagen',
      hint: err?.message?.substring(0, 150) || '',
    })
  }
}
