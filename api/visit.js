/**
 * Besucherzähler: Besuch erfassen (POST) und Zähler abrufen (GET).
 * GET /api/visit?tenant=k2|oeffentlich|vk2 → { count: N }
 * POST /api/visit mit Body { tenant: 'k2' } oder Query ?tenant=k2 → increment, dann { count: N }
 * Umgebungsvariablen: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'

const ALLOWED = ['k2', 'oeffentlich', 'vk2']

function getTenant(req) {
  if (req.method === 'POST' && req.body) {
    const body = typeof req.body === 'string' ? (() => { try { return JSON.parse(req.body) } catch { return {} } })() : req.body
    if (body && ALLOWED.includes(body.tenant)) return body.tenant
  }
  const q = req.query?.tenant
  if (q && ALLOWED.includes(q)) return q
  return null
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Nur GET oder POST' })

  const tenant = getTenant(req)
  if (!tenant) return res.status(400).json({ error: 'tenant fehlt oder ungültig (k2, oeffentlich, vk2)' })

  const supabaseUrl = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !key) {
    return res.status(200).json({ count: 0, error: 'Supabase nicht konfiguriert' })
  }

  const supabase = createClient(supabaseUrl, key)

  try {
    if (req.method === 'POST') {
      const { data: row } = await supabase.from('visits').select('count').eq('tenant_id', tenant).single()
      const next = (row?.count ?? 0) + 1
      await supabase.from('visits').upsert(
        { tenant_id: tenant, count: next, updated_at: new Date().toISOString() },
        { onConflict: 'tenant_id' }
      )
      return res.status(200).json({ count: next })
    }
    const { data: row } = await supabase.from('visits').select('count').eq('tenant_id', tenant).single()
    return res.status(200).json({ count: row?.count ?? 0 })
  } catch (e) {
    console.error('visit.js', e)
    return res.status(500).json({ count: 0, error: String(e?.message || 'Fehler') })
  }
}
