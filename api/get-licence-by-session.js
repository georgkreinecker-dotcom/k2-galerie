/**
 * Vercel Serverless: Lizenz anhand Stripe Session-ID laden (für Erfolgsseite nach Checkout).
 * GET /api/get-licence-by-session?session_id=cs_...
 * 1) Supabase `licences` (nach Webhook)
 * 2) Fallback: Checkout-Session direkt bei Stripe (wenn Zahlung complete/paid) – gleiche URLs wie Webhook
 *
 * Umgebungsvariablen: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY (Fallback)
 */
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { rowsFromCheckoutSession } from './stripeWebhookLicenceShared.js'

function resolveBaseUrl() {
  return process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.VITE_APP_URL || 'https://k2-galerie.vercel.app'
}

function buildAdminUrl(baseUrl, tenantId) {
  const b = String(baseUrl || '').replace(/\/$/, '')
  if (!b) return 'https://k2-galerie.vercel.app/projects/k2-galerie'
  return tenantId
    ? `${b}/admin?tenantId=${encodeURIComponent(tenantId)}`
    : `${b}/projects/k2-galerie`
}

function jsonFromDbLicence(licence, baseUrl) {
  return {
    galerie_url: licence.galerie_url || null,
    tenant_id: licence.tenant_id || null,
    admin_url: buildAdminUrl(baseUrl, licence.tenant_id),
    name: licence.name || '',
    email: licence.email || '',
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Nur GET erlaubt' })

  const sessionId = (req.query?.session_id || '').trim()
  if (!sessionId) {
    return res.status(400).json({ error: 'session_id fehlt' })
  }

  const baseUrl = resolveBaseUrl()
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

    if (licence) {
      return res.status(200).json(jsonFromDbLicence(licence, baseUrl))
    }

    /** DB leer: Webhook verzögert oder fehlgeschlagen – Session bei Stripe lesen (nur bei erfolgreicher Zahlung) */
    const stripeSecret = process.env.STRIPE_SECRET_KEY
    if (stripeSecret) {
      try {
        const stripe = new Stripe(stripeSecret)
        const session = await stripe.checkout.sessions.retrieve(sessionId)

        if (session.status === 'open') {
          return res.status(200).json({
            error: 'Checkout noch offen',
            hint: 'Die Zahlung ist noch nicht abgeschlossen. Bitte das Stripe-Fenster schließen oder die Zahlung zu Ende führen.',
          })
        }

        if (session.status !== 'complete') {
          return res.status(200).json({
            error: 'Sitzung nicht abgeschlossen',
            hint: 'Bitte kurz warten oder die Seite neu laden.',
          })
        }

        const ps = session.payment_status
        if (ps !== 'paid' && ps !== 'no_payment_required') {
          return res.status(200).json({
            error: 'Zahlung noch ausstehend',
            hint: 'Stripe meldet noch keinen erfolgreichen Zahlungseingang. Bitte in wenigen Sekunden erneut laden.',
          })
        }

        const rowPack = rowsFromCheckoutSession(session, baseUrl)
        const ins = rowPack.licenceInsert
        const tenantId = ins.tenant_id || null

        return res.status(200).json({
          galerie_url: ins.galerie_url || null,
          tenant_id: tenantId,
          admin_url: buildAdminUrl(baseUrl, tenantId),
          name: ins.name || '',
          email: ins.email || '',
          from_stripe: true,
        })
      } catch (stripeErr) {
        if (stripeErr?.code === 'resource_missing') {
          return res.status(200).json({
            error: 'Sitzung unbekannt',
            hint:
              'Stripe findet diese Session nicht (Test/Live-Key verwechselt oder Session abgelaufen). Prüfe STRIPE_SECRET_KEY in Vercel und den Modus im Stripe-Dashboard.',
          })
        }
        console.error('get-licence-by-session Stripe-Fallback:', stripeErr?.message || stripeErr)
      }
    }

    return res.status(200).json({
      error: 'Lizenz noch nicht gefunden',
      hint:
        'In der Datenbank gibt es noch keinen Eintrag zu dieser Zahlung. Wenn das länger dauert: Im Stripe-Dashboard unter Webhooks prüfen, ob checkout.session.completed bei Vercel ankommt (2xx). STRIPE_SECRET_KEY in Vercel ermöglicht hier einen Notfall-Auslesen der Links direkt aus Stripe.',
    })
  } catch (err) {
    console.error('get-licence-by-session:', err)
    return res.status(500).json({ error: err?.message || 'Fehler beim Laden' })
  }
}
