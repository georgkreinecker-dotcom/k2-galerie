/**
 * Eine Serverless Function für Build-Info + Besucherzähler (Vercel Hobby max. 12 Functions).
 * Aufruf über Rewrites: /api/build-info → ?k2route=build-info, /api/visit → ?k2route=visit
 * GET /api/build-info → { label, timestamp }
 * GET/POST /api/visit?tenant=k2|oeffentlich|... → { count: N }
 */
const { createClient } = require('@supabase/supabase-js')

/** Synchron zu src/utils/reportPublicGalleryVisit.ts (VISIT_TENANT_ID_RE) */
const VISIT_TENANT_RE = /^[a-z0-9-]{1,64}$/

/** Synchron zu src/utils/visitTenantAggregate.ts */
const VISIT_AGGREGATE_PREFIXES = new Set(['oeffentlich-pilot', 'vk2-pilot'])

function isValidVisitTenant(t) {
  return typeof t === 'string' && VISIT_TENANT_RE.test(t)
}

function isValidVisitAggregatePrefix(p) {
  return typeof p === 'string' && VISIT_AGGREGATE_PREFIXES.has(p)
}

function getTenant(req) {
  if (req.method === 'POST' && req.body) {
    const body = typeof req.body === 'string' ? (() => { try { return JSON.parse(req.body) } catch { return {} } })() : req.body
    if (body && isValidVisitTenant(body.tenant)) return body.tenant
  }
  const q = req.query && req.query.tenant
  if (q && isValidVisitTenant(q)) return q
  return null
}

async function handleVisit(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Nur GET oder POST' })

  const qAgg = req.query && req.query.aggregatePrefix
  const aggregatePrefix = typeof qAgg === 'string' ? qAgg.trim() : null

  const supabaseUrlRaw = process.env.SUPABASE_URL
  const supabaseUrl = (supabaseUrlRaw || '').trim()
  const keyRaw =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE
  const key = (keyRaw || '').trim()
  if (!supabaseUrl || !key) {
    // Diagnose ohne Secrets (nur "fehlt/da"), damit Vercel-Env-Probleme schnell sichtbar sind.
    const missing = []
    if (!supabaseUrl) missing.push('SUPABASE_URL')
    if (!key) missing.push('SUPABASE_SERVICE_ROLE_KEY')
    return res.status(200).json({
      count: 0,
      error: 'Supabase nicht konfiguriert',
      configured: false,
      missing,
    })
  }

  const supabase = createClient(supabaseUrl, key)
  try {
    if (aggregatePrefix) {
      if (req.method !== 'GET') {
        return res.status(405).json({ error: 'aggregatePrefix nur mit GET' })
      }
      if (!isValidVisitAggregatePrefix(aggregatePrefix)) {
        return res.status(400).json({ error: 'aggregatePrefix ungültig (oeffentlich-pilot oder vk2-pilot)' })
      }
      const { data: rows, error: aggErr } = await supabase
        .from('visits')
        .select('tenant_id, count')
        .like('tenant_id', `${aggregatePrefix}%`)
      if (aggErr) {
        return res.status(500).json({
          count: 0,
          error: `Supabase aggregate fehlgeschlagen: ${aggErr.message}`,
          configured: true,
        })
      }
      const sum = (rows || []).reduce((acc, row) => acc + (row && row.count != null ? row.count : 0), 0)
      return res.status(200).json({
        count: sum,
        configured: true,
        aggregatePrefix,
        parts: (rows || []).length,
      })
    }

    const tenant = getTenant(req)
    if (!tenant) {
      return res.status(400).json({
        error: 'tenant fehlt oder ungültig (1–64 Zeichen: a–z, 0–9, Bindestrich) – oder aggregatePrefix=oeffentlich-pilot|vk2-pilot',
      })
    }

    if (req.method === 'POST') {
      const { data: row, error: selErr } = await supabase
        .from('visits')
        .select('count')
        .eq('tenant_id', tenant)
        .maybeSingle()
      if (selErr) {
        return res.status(500).json({ count: 0, error: `Supabase select fehlgeschlagen: ${selErr.message}`, configured: true })
      }
      const next = (row && row.count != null ? row.count : 0) + 1
      const { error: upErr } = await supabase.from('visits').upsert(
        { tenant_id: tenant, count: next, updated_at: new Date().toISOString() },
        { onConflict: 'tenant_id' }
      )
      if (upErr) {
        return res.status(500).json({ count: 0, error: `Supabase upsert fehlgeschlagen: ${upErr.message}`, configured: true })
      }
      return res.status(200).json({ count: next })
    }
    const { data: row, error: getErr } = await supabase
      .from('visits')
      .select('count')
      .eq('tenant_id', tenant)
      .maybeSingle()
    if (getErr) {
      return res.status(500).json({ count: 0, error: `Supabase select fehlgeschlagen: ${getErr.message}`, configured: true })
    }
    return res.status(200).json({ count: row && row.count != null ? row.count : 0, configured: true })
  } catch (e) {
    console.error('visit-and-build visit', e)
    return res.status(500).json({ count: 0, error: String(e && e.message || 'Fehler'), configured: true })
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
