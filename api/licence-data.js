/**
 * Vercel Serverless: Lizenzen, Zahlungen und Gutschriften aus Supabase lesen (Admin).
 * GET /api/licence-data – für LicencesPage (Export CSV/PDF).
 * Umgebungsvariablen: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * Feld `stripe_chain`: verbindliche Kette Stripe→Webhook→Supabase (siehe STRIPE-LIZENZEN-GO-LIVE.md).
 */
import { createClient } from '@supabase/supabase-js'
import {
  STRIPE_API_PATHS,
  STRIPE_LICENCE_DOC_BINDING,
  STRIPE_LICENCE_DOC_GO_LIVE,
  STRIPE_LICENCE_DOC_TEST_LOCAL,
  getStripeWebhookUrlProduction,
} from './stripeLicenceChainConstants.js'

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
      stripe_chain: {
        version: 1,
        supabase_configured: false,
        webhook_url_production: getStripeWebhookUrlProduction(),
        api_paths: STRIPE_API_PATHS,
        docs: {
          go_live: STRIPE_LICENCE_DOC_GO_LIVE,
          binding: STRIPE_LICENCE_DOC_BINDING,
          test_local: STRIPE_LICENCE_DOC_TEST_LOCAL,
        },
        empty_online_hint:
          'Zuerst Supabase-Variablen in Vercel setzen und SQL ausführen (siehe docs/STRIPE-LIZENZEN-GO-LIVE.md).',
      },
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

    const onlineEmpty = licences.length === 0 && payments.length === 0 && gutschriften.length === 0

    return res.status(200).json({
      licences,
      payments,
      gutschriften,
      stripe_chain: {
        version: 1,
        supabase_configured: true,
        webhook_url_production: getStripeWebhookUrlProduction(),
        api_paths: STRIPE_API_PATHS,
        docs: {
          go_live: STRIPE_LICENCE_DOC_GO_LIVE,
          binding: STRIPE_LICENCE_DOC_BINDING,
          test_local: STRIPE_LICENCE_DOC_TEST_LOCAL,
        },
        /** Kurz-Hinweis nur wenn Tabellen leer: Kette prüfen (Webhook, Secret, SQL). */
        empty_online_hint: onlineEmpty
          ? 'Keine Online-Lizenzen in Supabase. Nach einem Testkauf: Stripe → Webhooks → Zustellungen (2xx?). Sonst STRIPE_WEBHOOK_SECRET + Redeploy und SQL (siehe docs/STRIPE-LIZENZEN-GO-LIVE.md).'
          : undefined,
      },
    })
  } catch (err) {
    console.error('licence-data:', err)
    return res.status(500).json({
      licences: [],
      payments: [],
      gutschriften: [],
      error: err?.message || 'Fehler beim Laden',
      stripe_chain: {
        version: 1,
        supabase_configured: true,
        webhook_url_production: getStripeWebhookUrlProduction(),
        api_paths: STRIPE_API_PATHS,
        docs: {
          go_live: STRIPE_LICENCE_DOC_GO_LIVE,
          binding: STRIPE_LICENCE_DOC_BINDING,
          test_local: STRIPE_LICENCE_DOC_TEST_LOCAL,
        },
        empty_online_hint:
          'Supabase-Abfrage fehlgeschlagen (Tabellen fehlen oder RLS?). SQL siehe docs/STRIPE-ANBINDUNG-SCHRITT-FUER-SCHRITT.md.',
      },
    })
  }
}
