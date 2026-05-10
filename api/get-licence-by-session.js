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
import {
  rowsFromCheckoutSession,
  checkoutSessionEffectiveMetadata,
  normalizeFocusDirection,
  normalizeWebhookTenantId,
  appendFocusDirection,
  appendFamilieFnQueryParam,
  buildAdminUrlForLicence,
  parseFamilieTenantIdFromGalerieUrl,
  parseK2GalerieTenantIdFromGalerieUrl,
} from './stripeWebhookLicenceShared.js'
import { productLineFromLicenceType, productLineFromStripeSession } from './lizenzProductLineShared.js'

function resolveBaseUrl() {
  return process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.VITE_APP_URL || 'https://k2-galerie.vercel.app'
}

function focusDirectionFromUrl(url) {
  try {
    const u = new URL(String(url || ''))
    return normalizeFocusDirection(u.searchParams.get('focusDirection'))
  } catch {
    const match = String(url || '').match(/[?&]focusDirection=([^&]+)/)
    return normalizeFocusDirection(match ? decodeURIComponent(match[1]) : '')
  }
}

/** Alte Webhook-Zeilen: /g/familie-… oder meine-familie ohne ?t= → Besucher-Link reparieren. */
function normalizeFamilieGalerieResponseUrl(galerieUrl, tenantId, baseUrl) {
  const b = String(baseUrl || '').replace(/\/$/, '')
  const tid = String(tenantId || '').trim().toLowerCase()
  if (!tid.startsWith('familie-')) return galerieUrl || null
  const canonical = b
    ? `${b}/projects/k2-familie/meine-familie?t=${encodeURIComponent(tid)}`
    : null
  const gu = String(galerieUrl || '').trim()
  if (!gu) return canonical
  const gl = gu.toLowerCase()
  if (gl.includes('/g/familie-') || (gl.includes('/g/') && gl.includes(tid))) {
    return canonical || gu
  }
  if (gl.includes('meine-familie') && !/[?&]t=/.test(gu)) {
    const sep = gu.includes('?') ? '&' : '?'
    return `${gu}${sep}t=${encodeURIComponent(tid)}`
  }
  return gu
}

function jsonFromDbLicence(licence, baseUrl) {
  const licenceType = licence.licence_type || 'basic'
  let productLine = productLineFromLicenceType(licenceType)
  let tid = String(licence.tenant_id || '').trim().toLowerCase()
  const gu = String(licence.galerie_url || '')
  if (
    tid === 'vk2' ||
    tid.startsWith('vk2-') ||
    gu.includes('/projects/vk2') ||
    gu.includes('context=vk2')
  ) {
    productLine = 'vk2'
  }
  if (
    productLine === 'k2_galerie' &&
    (tid.startsWith('familie-') || gu.includes('k2-familie') || gu.includes('/meine-familie'))
  ) {
    productLine = 'k2_familie'
  }
  if (
    !tid &&
    (licenceType === 'familie_monat' || licenceType === 'familie_jahr' || productLine === 'k2_familie')
  ) {
    const fromGu = parseFamilieTenantIdFromGalerieUrl(gu, baseUrl)
    if (fromGu) tid = fromGu
  }
  if (!tid && productLine === 'k2_galerie') {
    const fromGal = parseK2GalerieTenantIdFromGalerieUrl(gu, baseUrl)
    if (fromGal) tid = fromGal
  }
  const focusDirection = focusDirectionFromUrl(licence.galerie_url)
  const galerieOutRaw = normalizeFamilieGalerieResponseUrl(licence.galerie_url, tid || licence.tenant_id, baseUrl)
  let galerieOut = productLine === 'k2_galerie' ? appendFocusDirection(galerieOutRaw, focusDirection) : galerieOutRaw
  let adminOut = buildAdminUrlForLicence(baseUrl, tid || licence.tenant_id, licenceType, productLine, focusDirection)
  const stripeDisplayName = String(licence.name || '').trim()
  if (productLine === 'k2_familie' && stripeDisplayName) {
    galerieOut = appendFamilieFnQueryParam(galerieOut, stripeDisplayName)
    adminOut = appendFamilieFnQueryParam(adminOut, stripeDisplayName)
  }
  return {
    galerie_url: galerieOut,
    tenant_id: tid || licence.tenant_id || null,
    admin_url: adminOut,
    name: licence.name || '',
    email: licence.email || '',
    licence_type: licenceType,
    product_line: productLine,
    focus_direction: focusDirection,
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
      .select('galerie_url, tenant_id, name, email, licence_type')
      .eq('stripe_session_id', sessionId)
      .maybeSingle()

    if (error) {
      console.error('get-licence-by-session:', error)
      return res.status(500).json({ error: 'Fehler beim Laden' })
    }

    const stripeSecret = process.env.STRIPE_SECRET_KEY

    if (licence) {
      const fromDb = jsonFromDbLicence(licence, baseUrl)
      const tidOk = Boolean(String(fromDb.tenant_id || '').trim())
      const needsGalleryHeal =
        stripeSecret &&
        fromDb.product_line === 'k2_galerie' &&
        !tidOk

      if (needsGalleryHeal) {
        try {
          const stripe = new Stripe(stripeSecret)
          const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['subscription', 'line_items', 'payment_intent'],
          })
          const ps = session.payment_status
          const paidOk = ps === 'paid' || ps === 'no_payment_required'
          if (session.status === 'complete' && paidOk) {
            const rowPack = rowsFromCheckoutSession(session, baseUrl)
            const ins = rowPack.licenceInsert
            let healTid = normalizeWebhookTenantId(ins.tenant_id)
            if (!healTid && ins.galerie_url) {
              healTid = normalizeWebhookTenantId(parseK2GalerieTenantIdFromGalerieUrl(ins.galerie_url, baseUrl))
            }
            if (healTid) {
              const healGu = ins.galerie_url || licence.galerie_url || null
              const merged = {
                ...licence,
                tenant_id: healTid,
                ...(healGu ? { galerie_url: healGu } : {}),
              }
              const { error: upErr } = await supabase
                .from('licences')
                .update({
                  tenant_id: healTid,
                  ...(healGu ? { galerie_url: healGu } : {}),
                })
                .eq('stripe_session_id', sessionId)
              if (upErr) {
                console.warn('get-licence-by-session: Heil-Update licences fehlgeschlagen', upErr?.message || upErr)
              }
              return res.status(200).json(jsonFromDbLicence(merged, baseUrl))
            }
          }
        } catch (healErr) {
          console.warn('get-licence-by-session: Galerie-Heal aus Stripe', healErr?.message || healErr)
        }
      }

      return res.status(200).json(fromDb)
    }

    /** DB leer: Webhook verzögert oder fehlgeschlagen – Session bei Stripe lesen (nur bei erfolgreicher Zahlung) */
    if (stripeSecret) {
      try {
        const stripe = new Stripe(stripeSecret)
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
          expand: ['subscription', 'line_items', 'payment_intent'],
        })

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
        let tenantId = ins.tenant_id || null
        if (!tenantId && ins.galerie_url) {
          const parsed = parseK2GalerieTenantIdFromGalerieUrl(ins.galerie_url, baseUrl)
          if (parsed) tenantId = parsed
        }
        const licenceType = ins.licence_type || 'basic'
        const productLine = rowPack.productLine || productLineFromStripeSession(session, licenceType, tenantId)
        const focusDirection = rowPack.focusDirection || normalizeFocusDirection(checkoutSessionEffectiveMetadata(session).focusDirection)

        let galerieStripeOut =
          productLine === 'k2_galerie' ? appendFocusDirection(ins.galerie_url || null, focusDirection) : ins.galerie_url || null
        let adminStripeOut = buildAdminUrlForLicence(baseUrl, tenantId, licenceType, productLine, focusDirection)
        const nm = String(ins.name || '').trim()
        if (productLine === 'k2_familie' && nm) {
          galerieStripeOut = appendFamilieFnQueryParam(galerieStripeOut, nm)
          adminStripeOut = appendFamilieFnQueryParam(adminStripeOut, nm)
        }

        return res.status(200).json({
          galerie_url: galerieStripeOut,
          tenant_id: tenantId,
          admin_url: adminStripeOut,
          name: ins.name || '',
          email: ins.email || '',
          licence_type: licenceType,
          product_line: productLine,
          focus_direction: focusDirection,
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
