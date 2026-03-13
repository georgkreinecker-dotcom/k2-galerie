/**
 * Eine Serverless Function für Build-Info + Besucherzähler (Vercel Hobby max. 12 Functions).
 * Aufruf über Rewrites: /api/build-info → ?k2route=build-info, /api/visit → ?k2route=visit
 * GET /api/build-info → { label, timestamp }
 * GET/POST /api/visit?tenant=k2|oeffentlich|... → { count: N }
 */
const { createClient } = require('@supabase/supabase-js')

const ALLOWED = ['k2', 'oeffentlich', 'vk2', 'vk2-members', 'vk2-external']

function getTenant(req) {
  if (req.method === 'POST' && req.body) {
    const body = typeof req.body === 'string' ? (() => { try { return JSON.parse(req.body) } catch { return {} } })() : req.body
    if (body && ALLOWED.includes(body.tenant)) return body.tenant
  }
  const q = req.query && req.query.tenant
  if (q && ALLOWED.includes(q)) return q
  return null
}

async function handleVisit(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Nur GET oder POST' })

  const tenant = getTenant(req)
  if (!tenant) return res.status(400).json({ error: 'tenant fehlt oder ungültig (k2, oeffentlich, vk2, vk2-members, vk2-external)' })

  const supabaseUrl = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !key) {
    return res.status(200).json({ count: 0, error: 'Supabase nicht konfiguriert' })
  }

  const supabase = createClient(supabaseUrl, key)
  try {
    if (req.method === 'POST') {
      const { data: row } = await supabase.from('visits').select('count').eq('tenant_id', tenant).single()
      const next = (row && row.count != null ? row.count : 0) + 1
      await supabase.from('visits').upsert(
        { tenant_id: tenant, count: next, updated_at: new Date().toISOString() },
        { onConflict: 'tenant_id' }
      )
      return res.status(200).json({ count: next })
    }
    const { data: row } = await supabase.from('visits').select('count').eq('tenant_id', tenant).single()
    return res.status(200).json({ count: (row && row.count != null) ? row.count : 0 })
  } catch (e) {
    console.error('visit-and-build visit', e)
    return res.status(500).json({ count: 0, error: String(e && e.message || 'Fehler') })
  }
}

function handleBuildInfo(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Access-Control-Allow-Origin', '*')
  let payload = { label: '0', timestamp: 0 }
  try {
    payload = require('./build-info-payload.json')
  } catch (_) {}
  return res.status(200).json(payload)
}

module.exports = async function handler(req, res) {
  const route = (req.query && req.query.k2route) || ''
  if (route === 'visit') return handleVisit(req, res)
  return handleBuildInfo(req, res)
}
