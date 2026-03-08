/**
 * Vercel Serverless: Kündigungswunsch erfassen (Lizenz beenden) + Mandanten-Daten löschen.
 * POST Body: { tenantId?: string, grund?: string, verbesserung?: string }
 * - tenantId: welcher Mandant (z. B. 'oeffentlich' für ök2). Wenn gesetzt und erlaubt → Blob wird gelöscht.
 * - grund, verbesserung: optionales Feedback.
 */
import { del } from '@vercel/blob'

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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Nur POST erlaubt' })

  let body
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
  } catch {
    return res.status(400).json({ error: 'Ungültiger JSON-Body' })
  }

  const { tenantId, grund, verbesserung } = body
  if (grund || verbesserung) {
    console.log('[cancel-subscription] Feedback:', { grund: grund || '(nicht angegeben)', verbesserung: verbesserung || '(nicht angegeben)' })
  }

  let deleteResult = null
  const tenantIdNorm = (tenantId || '').toLowerCase().trim()
  const allowed =
    tenantIdNorm &&
    tenantIdNorm !== 'k2' &&
    (['oeffentlich', 'vk2'].includes(tenantIdNorm) || isSafeTenantId(tenantIdNorm))
  const pathname = allowed ? getBlobPath(tenantIdNorm) : null
  if (pathname) {
    try {
      await del(pathname)
      deleteResult = { deleted: true, tenantId: tenantIdNorm }
      console.log('[cancel-subscription] Mandanten-Daten gelöscht:', tenantIdNorm, pathname)
    } catch (err) {
      console.error('[cancel-subscription] Blob del Fehler:', err?.message || err)
      deleteResult = { deleted: false, error: err?.message || 'Löschung fehlgeschlagen' }
    }
  }

  return res.status(200).json({
    ok: true,
    message: 'Kündigung erfasst',
    ...(deleteResult ? { deleteResult } : {}),
  })
}
