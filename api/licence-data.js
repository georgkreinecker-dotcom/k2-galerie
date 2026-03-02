/**
 * Vercel Serverless: Lizenzen, Zahlungen und Gutschriften aus Supabase lesen (Admin).
 * GET /api/licence-data – für LicencesPage (Export CSV/PDF).
 * Umgebungsvariablen: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Nur GET erlaubt' })

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(200).json({
      licences: [],
      payments: [],
      gutschriften: [],
      error: 'Supabase nicht konfiguriert (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).',
    })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    const [licencesRes, paymentsRes, gutschriftenRes] = await Promise.all([
      supabase.from('licences').select('*').order('created_at', { ascending: false }),
      supabase.from('payments').select('*').order('paid_at', { ascending: false }),
      supabase.from('empfehler_gutschriften').select('*').order('created_at', { ascending: false }),
    ])

    const licences = licencesRes.data ?? []
    const payments = paymentsRes.data ?? []
    const gutschriften = gutschriftenRes.data ?? []

    return res.status(200).json({
      licences,
      payments,
      gutschriften,
    })
  } catch (err) {
    console.error('licence-data:', err)
    return res.status(500).json({
      licences: [],
      payments: [],
      gutschriften: [],
      error: err?.message || 'Fehler beim Laden',
    })
  }
}
