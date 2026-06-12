#!/usr/bin/env node
/**
 * Fehlende Käufe nachziehen ohne lokale Supabase-Keys:
 * 1) Stripe-Checkouts (lokal STRIPE_SECRET_KEY) auflisten
 * 2) Pro Session Production-API aufrufen → schreibt in Supabase (Vercel-Env)
 *
 * Nutzung: node scripts/heal-stripe-licences-via-production.mjs
 * Optional: HEAL_DAYS=14, PRODUCTION_ORIGIN=https://k2-galerie.vercel.app
 */
import Stripe from 'stripe'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { STRIPE_API_PATHS } from '../api/stripeLicenceChainConstants.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

function loadEnvFile(name) {
  const p = path.join(root, name)
  if (!fs.existsSync(p)) return
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq < 1) continue
    const key = t.slice(0, eq).trim()
    let val = t.slice(eq + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = val
  }
}

loadEnvFile('.env')
loadEnvFile('.env.vercel.production')

const days = Math.max(1, Number(process.env.HEAL_DAYS || 14) || 14)
const origin = (process.env.PRODUCTION_ORIGIN || 'https://k2-galerie.vercel.app').replace(/\/$/, '')
const stripeKey = process.env.STRIPE_SECRET_KEY
if (!stripeKey) {
  console.error('STRIPE_SECRET_KEY fehlt (.env)')
  process.exit(2)
}

const stripe = new Stripe(stripeKey)
const since = Math.floor((Date.now() - days * 24 * 60 * 60 * 1000) / 1000)

async function healSession(sessionId) {
  const url = `${origin}${STRIPE_API_PATHS.getLicenceBySession}?session_id=${encodeURIComponent(sessionId)}`
  const res = await fetch(url, { cache: 'no-store' })
  const data = await res.json().catch(() => ({}))
  return data
}

async function main() {
  console.log('── Heal via Production ──')
  console.log('Origin:', origin)
  console.log('Stripe:', stripeKey.startsWith('sk_live') ? 'live' : 'test')

  let startingAfter
  let healed = 0
  let skipped = 0
  let failed = 0

  for (;;) {
    const page = await stripe.checkout.sessions.list({
      limit: 100,
      created: { gte: since },
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    })

    for (const s of page.data) {
      if (s.status !== 'complete') {
        skipped++
        continue
      }
      const ps = s.payment_status
      if (ps !== 'paid' && ps !== 'no_payment_required') {
        skipped++
        continue
      }

      const tid = s.metadata?.tenantId || '–'
      const data = await healSession(s.id)
      if (data.healed_from_stripe || (!data.heal_failed && !data.error && data.tenant_id)) {
        healed++
        console.log(`✅ ${s.id.slice(0, 28)}… | ${tid} | ${data.licence_type || '?'}`)
      } else if (data.error) {
        failed++
        console.log(`⚠️ ${s.id.slice(0, 28)}… | ${data.error}`)
      } else if (data.heal_failed) {
        failed++
        console.log(`❌ ${s.id.slice(0, 28)}… | Heal fehlgeschlagen (${tid})`)
      } else {
        skipped++
      }
    }

    if (!page.has_more || page.data.length === 0) break
    startingAfter = page.data[page.data.length - 1].id
  }

  const check = await fetch(`${origin}${STRIPE_API_PATHS.licenceData}`, { cache: 'no-store' })
  const lic = await check.json().catch(() => ({}))
  const n = Array.isArray(lic?.licences) ? lic.licences.length : 0
  console.log(`\nNachgezogen/ok: ${healed} | übersprungen: ${skipped} | Fehler: ${failed}`)
  console.log(`Supabase jetzt: ${n} Lizenzen in licence-data`)
  process.exit(failed > 0 ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(2)
})
