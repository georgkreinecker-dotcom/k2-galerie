/**
 * Marketing-Attribution (Werbeaktion ↔ pseudonyme Sitzung) für ök2, VK2, K2 Familie.
 * POST /api/marketing-attribution – ein Event (z. B. landing)
 * GET  /api/marketing-attribution?mode=summary&days=90 – Aggregation (Mission Control)
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from '@supabase/supabase-js'

const VISIT_TENANT_RE = /^[a-z0-9-]{1,64}$/
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const SURFACES = new Set(['oeffentlich', 'vk2', 'k2_familie'])
const EVENT_KINDS = new Set(['landing', 'conversion_licence'])
const CAMPAIGN_RE = /^[a-zA-Z0-9_-]{1,128}$/

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function parseBody(req) {
  if (!req.body) return {}
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body)
    } catch {
      return {}
    }
  }
  return req.body
}

function normalizeCampaign(raw) {
  if (raw == null || raw === '') return null
  const s = String(raw).trim().slice(0, 128)
  if (!CAMPAIGN_RE.test(s)) return null
  return s
}

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const supabaseUrl = (process.env.SUPABASE_URL || '').trim()
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  if (!supabaseUrl || !key) {
    if (req.method === 'GET') {
      return res.status(200).json({
        configured: false,
        summary: [],
        error: 'Supabase nicht konfiguriert (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).',
      })
    }
    return res.status(200).json({ ok: false, skipped: true, error: 'Supabase nicht konfiguriert' })
  }

  const supabase = createClient(supabaseUrl, key)

  if (req.method === 'POST') {
    const body = parseBody(req)
    const visitor_anon_id = typeof body.visitor_anon_id === 'string' ? body.visitor_anon_id.trim() : ''
    if (!UUID_RE.test(visitor_anon_id)) {
      return res.status(400).json({ ok: false, error: 'visitor_anon_id ungültig (UUID)' })
    }
    const surface = typeof body.surface === 'string' ? body.surface.trim() : ''
    if (!SURFACES.has(surface)) {
      return res.status(400).json({ ok: false, error: 'surface ungültig' })
    }
    const tenant_visit_key = typeof body.tenant_visit_key === 'string' ? body.tenant_visit_key.trim() : ''
    if (!VISIT_TENANT_RE.test(tenant_visit_key)) {
      return res.status(400).json({ ok: false, error: 'tenant_visit_key ungültig' })
    }
    const event_kind = typeof body.event_kind === 'string' ? body.event_kind.trim() : ''
    if (!EVENT_KINDS.has(event_kind)) {
      return res.status(400).json({ ok: false, error: 'event_kind ungültig' })
    }
    const campaign_key = normalizeCampaign(body.campaign_key)
    let referrer_host =
      typeof body.referrer_host === 'string' ? body.referrer_host.trim().slice(0, 200) : null
    if (referrer_host === '') referrer_host = null
    let path = typeof body.path === 'string' ? body.path.trim().slice(0, 512) : null
    if (path === '') path = null

    const row = {
      visitor_anon_id,
      surface,
      tenant_visit_key,
      event_kind,
      campaign_key,
      referrer_host,
      path,
    }

    const { error } = await supabase.from('marketing_attribution_events').insert(row)
    if (error) {
      return res.status(500).json({ ok: false, error: error.message })
    }
    return res.status(200).json({ ok: true })
  }

  if (req.method === 'GET') {
    const mode = typeof req.query?.mode === 'string' ? req.query.mode : ''
    if (mode !== 'summary') {
      return res.status(400).json({ error: 'mode=summary erforderlich' })
    }
    let days = 90
    const d = req.query?.days
    if (typeof d === 'string' && /^\d+$/.test(d)) {
      const n = parseInt(d, 10)
      if (n >= 1 && n <= 365) days = n
    }
    const since = new Date(Date.now() - days * 86400000).toISOString()

    const { data, error } = await supabase
      .from('marketing_attribution_events')
      .select('campaign_key, surface, event_kind')
      .gte('created_at', since)
      .limit(20000)

    if (error) {
      return res.status(500).json({ configured: true, summary: [], error: error.message })
    }

    const map = new Map()
    for (const r of data || []) {
      const ck = r.campaign_key ?? '__none__'
      const sk = `${ck}\t${r.surface}\t${r.event_kind}`
      map.set(sk, (map.get(sk) || 0) + 1)
    }
    const summary = []
    for (const [sk, count] of map.entries()) {
      const [campaign_key, surface, event_kind] = sk.split('\t')
      summary.push({
        campaign_key: campaign_key === '__none__' ? null : campaign_key,
        surface,
        event_kind,
        count,
      })
    }
    summary.sort((a, b) => b.count - a.count)

    return res.status(200).json({ configured: true, summary, days })
  }

  return res.status(405).json({ error: 'Methode nicht erlaubt' })
}
