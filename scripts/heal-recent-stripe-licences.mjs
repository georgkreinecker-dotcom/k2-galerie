#!/usr/bin/env node
/**
 * Fehlende Lizenzen nachziehen: letzte abgeschlossene Stripe-Checkouts → Supabase.
 * Nutzen wenn Webhook nicht ankam; gleiche Logik wie webhook-stripe (persistLicenceFromCheckoutSession).
 *
 * Env (lokal .env oder Vercel): STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Optional: HEAL_DAYS=14 (Standard), DRY_RUN=1
 */
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { persistLicenceFromCheckoutSession } from '../api/persistLicenceFromCheckoutSession.js'

const days = Math.max(1, Number(process.env.HEAL_DAYS || 14) || 14)
const dryRun = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true'
const baseUrl = (process.env.VITE_APP_URL || 'https://k2-galerie.vercel.app').replace(/\/$/, '')

function requireEnv(name) {
  const v = process.env[name]
  if (!v) throw new Error(`${name} fehlt`)
  return v
}

async function main() {
  const stripe = new Stripe(requireEnv('STRIPE_SECRET_KEY'))
  const supabase = createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'))

  const since = Math.floor((Date.now() - days * 24 * 60 * 60 * 1000) / 1000)
  console.log(`── Heal Stripe → Supabase (letzte ${days} Tage) ──`)
  console.log('Basis-URL:', baseUrl)
  if (dryRun) console.log('DRY_RUN: nur anzeigen, nicht schreiben')

  let startingAfter
  let scanned = 0
  let healed = 0
  let skipped = 0
  let failed = 0

  for (;;) {
    const page = await stripe.checkout.sessions.list({
      limit: 100,
      created: { gte: since },
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    })

    for (const session of page.data) {
      scanned++
      if (session.status !== 'complete') {
        skipped++
        continue
      }
      const ps = session.payment_status
      if (ps !== 'paid' && ps !== 'no_payment_required') {
        skipped++
        continue
      }

      const { data: existing } = await supabase
        .from('licences')
        .select('id')
        .eq('stripe_session_id', session.id)
        .maybeSingle()

      if (existing?.id) {
        skipped++
        continue
      }

      console.log(`Heal: ${session.id} | ${session.customer_email || '–'} | ${session.amount_total ?? 0} ct`)

      if (dryRun) {
        healed++
        continue
      }

      let full = session
      try {
        full = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ['subscription', 'line_items', 'payment_intent'],
        })
      } catch (e) {
        console.warn('  expand fehlgeschlagen, nutze Listen-Payload', e?.message || e)
      }

      const result = await persistLicenceFromCheckoutSession(supabase, full, baseUrl)
      if (result.ok) {
        healed++
        console.log(`  ✅ licenceId=${result.licenceId}${result.duplicate ? ' (duplicate)' : ''}`)
      } else {
        failed++
        console.error(`  ❌ ${result.error}`)
      }
    }

    if (!page.has_more || page.data.length === 0) break
    startingAfter = page.data[page.data.length - 1].id
  }

  console.log(`\nGescannt: ${scanned} | nachgezogen: ${healed} | übersprungen: ${skipped} | Fehler: ${failed}`)
  process.exit(failed > 0 ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(2)
})
