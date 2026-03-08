/**
 * Vercel Serverless: Lizenz anhand Stripe Session-ID laden (für Erfolgsseite nach Checkout).
 * GET /api/get-licence-by-session?session_id=cs_...
 * Antwort: { galerie_url, tenant_id, name, email } oder { error }.
 * Umgebungsvariablen: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Nur GET erlaubt' })

  const sessionId = (req.query?.session_id || '').trim()
  if (!sessionId) {
    return res.status(400).json({ error: 'session_id fehlt' })
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(200).json({ error: 'Supabase nicht konfiguriert' })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    const { data: licence, error } = await supabase
      .from('licences')
      .select('galerie_url, tenant_id, name, email')
      .eq('stripe_session_id', sessionId)
      .maybeSingle()

    if (error) {
      console.error('get-licence-by-session:', error)
      return res.status(500).json({ error: 'Fehler beim Laden' })
    }

    if (!licence) {
      return res.status(200).json({ error: 'Lizenz noch nicht gefunden', hint: 'Bitte kurz warten – die Zahlung wird verarbeitet.' })
    }

    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : (process.env.VITE_APP_URL || 'https://k2-galerie.vercel.app')
    const adminUrl = licence.tenant_id
      ? `${baseUrl}/admin?tenantId=${encodeURIComponent(licence.tenant_id)}`
      : `${baseUrl}/projects/k2-galerie`

    return res.status(200).json({
      galerie_url: licence.galerie_url || null,
      tenant_id: licence.tenant_id || null,
      admin_url: adminUrl,
      name: licence.name || '',
      email: licence.email || '',
    })
  } catch (err) {
    console.error('get-licence-by-session:', err)
    return res.status(500).json({ error: err?.message || 'Fehler beim Laden' })
  }
}
