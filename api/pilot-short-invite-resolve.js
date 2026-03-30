/**
 * GET ?c=32hex – liefert den vollen Pilot-Token für Kurzlink /p/i/:code (SPA holt JSON, dann Redirect).
 * Kein öffentliches Listing; Code = 128 Bit Zufall.
 */
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Nur GET' })

  const raw = String(req.query?.c || req.query?.code || '').trim().toLowerCase()
  if (!/^[a-f0-9]{32}$/.test(raw)) {
    return res.status(400).json({ ok: false, error: 'Ungültiger Code' })
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(503).json({ ok: false, error: 'Kurzlink nicht verfügbar' })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const { data, error } = await supabase.from('pilot_short_invites').select('token').eq('code', raw).maybeSingle()

  if (error || !data?.token) {
    return res.status(404).json({ ok: false, error: 'Einladung unbekannt oder abgelaufen' })
  }

  return res.status(200).json({ ok: true, token: String(data.token) })
}
